---
title: "The weak self that wasn't: Swift 6.4's ImplicitStrongCapture warning"
date: 2026-09-18 09:30:00 +0200
tags: [swift, ios]
description: >-
  Xcode 27 ships a new Swift warning about nested closures where an inner
  [weak self] is quietly undone by the outer closure capturing self strongly.
  What it means and how to fix it properly.
---

Every September the same ritual: new OS versions, new Xcode, and a fresh crop of warnings in a codebase that compiled clean the day before. This year one of them deserves more than a quick silencing, because in a lot of projects it's pointing at a bug that has been sitting there for years.

[Xcode 27](https://developer.apple.com/xcode/whats-new/) ships [Swift 6.4](https://developer.apple.com/swift/whats-new/), which introduces the [`ImplicitStrongCapture`](https://docs.swift.org/latest/documentation/diagnostics/implicit-strong-capture/) diagnostic:

```
warning: 'weak' ownership of capture 'self' differs from
         implicitly-captured strong reference in outer scope
```

If you nest a `[weak self]` closure inside another escaping closure anywhere, you're probably about to meet it.

## The code that looks fine

Say we're building a music app, and we have a service that downloads a playlist for offline listening:

```swift
final class PlaylistService {
    private let downloader: TrackDownloader
    private let listeners: ListenerRegistry

    func makeOfflineCopy(of playlist: Playlist, into store: OfflineStore) {
        downloader.download(playlist.tracks) { files in
            store.save(files, as: playlist.id) { [weak self] in
                self?.markAvailableOffline(playlist)
            }
        }
    }

    private func markAvailableOffline(_ playlist: Playlist) {
        listeners.notify(.availableOffline(playlist))
    }
}
```

Two escaping closures, one nested in the other. The inner one is the only place that touches `self`, and it's careful about it: `[weak self]`, optional chaining, no cycle. The outer one doesn't mention `self` at all; it only deals with `files`, `store` and `playlist`, all of which arrive as parameters or from the function's arguments.

You'd reasonably conclude that `PlaylistService` isn't retained while the download is in flight. That conclusion is wrong, and Swift 6.4 now says so:

```swift
downloader.download(playlist.tracks) { files in
    // note: 'self' implicitly strongly captured here
    // note: add 'self' as a capture list item to silence
    store.save(files, as: playlist.id) { [weak self] in
        // warning: 'weak' ownership of capture 'self' differs from
        //          implicitly-captured strong reference in outer scope
        // note: explicitly assign the capture list item to silence
        self?.markAvailableOffline(playlist)
    }
}
```

## Why the compiler is right

The trick is in *when* a capture list is evaluated.

A capture list isn't a promise about the future, it's an expression that runs at the moment the closure value is created. `[weak self]` means "take `self` right now, and store a weak reference to it in this closure's context". So in order to build that weak reference, `self` has to be in hand at that point.

And that point is *inside the body of the outer closure*, which runs later, potentially much later, on whatever queue `TrackDownloader` finishes on. For `self` to still be available there, the outer closure has to have captured it too. It has no capture list, so it does what Swift always does with an implicitly captured reference type: it captures it strongly.

The inner `[weak self]` is doing exactly what it says. It's just too late to matter: by the time it runs, `self` has already been held strongly for the entire duration of the download.

The lifetime looks like this:

```swift
downloader.download { … }               // self retained strongly from here
                                        // …network, disk, retries…
store.save(files) { [weak self] in … }  // weak reference created only here
```

Two things follow from this, and they're different problems.

The first is the obvious one: if anything in that chain keeps the closure alive and is itself reachable from `self` (a retry queue on the downloader, an operation the service owns, a `@MainActor` task stored in a property), you have a genuine retain cycle. The `[weak self]` you wrote to prevent it never had a chance.

The second is subtler and far more common: even with no cycle at all, the object's lifetime is extended for the whole operation. If the user navigates away mid-download, `PlaylistService` and everything it owns stay alive until the download completes. Whether `markAvailableOffline` fires afterwards depends on timing you never intended to depend on, and `deinit` runs somewhere you didn't expect. That's the kind of bug that shows up as a flaky test or a "sometimes the UI updates twice" report.

## Fixing it

There are three real fixes and one escape hatch. Picking between them is a question about two things: whether the outer closure actually needs `self`, and how long each hop of the chain can take. A strong capture across something instant is free; a strong capture across something that retries for a minute is the whole problem.

### The outer closure doesn't need self

This is our case, and it's the most common one. Move the capture list outwards:

```swift
downloader.download(playlist.tracks) { [weak self] files in
    store.save(files, as: playlist.id) {
        self?.markAvailableOffline(playlist)
    }
}
```

The inner closure no longer needs a capture list of its own. It captures the `self` introduced by the outer one, which is already a weak optional, so weakness is preserved all the way down. Now the reference really is weak for the entire operation, which is what the original code was trying to say.

### The outer closure does need self, and the hop is instant

Sometimes the outer closure has work of its own, and the operation it's wrapped in is a cheap one. Say we want to share a mix: load its cover art, render a share card from it, upload the card, then present a share sheet for the resulting link.

```swift
func shareMix(_ mix: Mix) {
    artwork.loadCover(for: mix) { [self] cover in
        let card = renderShareCard(for: mix, cover: cover)
        uploader.upload(card) { [weak self] url in
            self?.presentShareSheet(for: url)
        }
    }
}
```

Adding an explicit `[self]` to the outer closure silences the warning, because there's nothing implicit left: you've stated that you want a strong capture there. The warning was never "strong captures are bad", it was "you appear to believe this is weak and it isn't". Once it's written down, the compiler takes you at your word.

And here the split ownership matches how long each call really takes. `loadCover` reads from an in-memory or on-disk cache and comes back in milliseconds; holding the service alive for that long is not a lifetime problem, and `renderShareCard` needs `self` to do its job. The upload is the part that goes to the network and may retry for a while, and `presentShareSheet` is optional work. If the user has closed the screen by the time the link comes back, the right thing is to do nothing, not to present a sheet over whatever they're looking at now.

That's the test: the strong hop is short and must finish, the weak hop is long and may be abandoned without consequence. When that's true, write both captures down and move on.

### The outer closure needs self, and the hop is slow

Flip those durations around and the answer flips too. Here's a library sync: fetch the remote state, merge it into what we have locally, write the result, then tell anyone who's listening.

```swift
func syncLibrary() {
    api.fetchLibrary { [weak self] remote in
        guard let self else { return }
        let merged = merge(remote, into: localLibrary)
        store.write(merged) { [weak self] in
            self?.listeners.notify(.librarySynced)
        }
    }
}
```

The outer closure needs `self` (both `merge` and `localLibrary` are ours). But `fetchLibrary` is the slow, unbounded hop: a request that can sit in a retry loop on a bad connection for as long as it likes. Capturing `self` strongly there would pin the service, its listeners, and its local library for the whole of it, which is exactly the lifetime extension we were trying to avoid in the first place.

So both captures are weak, and that isn't the redundancy it looks like. The `guard let self` promotes the reference to a strong one *for the body of the outer closure only*, which is correct: you can't merge into a library that's been deallocated mid-statement. The second `[weak self]` then drops back to weak for the write, so the disk operation doesn't hold the service either. No warning here: the outer capture is explicit, so there's nothing implicit to mismatch.

Two weak captures in one chain look like belt-and-braces until you notice they're weak over *different intervals*. Each one only covers its own hop.

### The escape hatch

The diagnostic also mentions that you can silence it by explicitly assigning the inner capture list item. For `self` that reads:

```swift
store.save(files, as: playlist.id) { [weak self = self] in
```

This says "yes, I know, take the strong one from the outer scope and weakify it here". It changes nothing about the behaviour (the strong capture is still there), so treat it as a last resort for code you can't restructure, not a fix.

None of this is specific to `self`. The same warning fires for any `weak` or `unowned` capture of something that the outer closure grabbed implicitly, and for those the `[weak x = x]` form is the documented way to say it's intentional.

## Turning the dial

`ImplicitStrongCapture` is a diagnostic group, which means Swift's warning control flags apply. If you'd rather not let these accumulate, promote the whole group to an error:

```
-Werror ImplicitStrongCapture
```

Swift 6.4 also brings [SE-0522](https://github.com/swiftlang/swift-evolution/blob/main/proposals/0522-source-warning-control.md), which lets you do the same thing in source, scoped to a single declaration:

```swift
@diagnose(ImplicitStrongCapture, as: ignored,
          reason: "Legacy callback chain, tracked in #4312")
func makeOfflineCopy(of playlist: Playlist, into store: OfflineStore) {
    // ...
}
```

`as:` takes `error`, `warning` or `ignored`, and it overrides the module-wide flags for that scope. This is a much better way to handle a migration than blanket-suppressing the warning: you get to silence the handful of call sites you've triaged, with a written reason, while the rest of the codebase keeps warning you.

If you're hunting for the group name of some other warning, `-print-diagnostic-groups` will print it alongside the diagnostic text.

## Worth the noise

Most new compiler warnings are about tightening up code that already works. This one is different: the pattern it flags is one where the code *reads* as correct and behaves as if you'd never written the `[weak self]` at all. That's the worst kind of bug, the one that survives code review precisely because the fix is already visible on screen.

So when Xcode 27 lights these up across your project, go through them one at a time rather than reaching for the suppression flag. Somewhere in that list there's almost certainly an object that's been outliving its welcome.
