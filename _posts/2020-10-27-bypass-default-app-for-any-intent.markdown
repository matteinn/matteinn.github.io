---
layout: post
title: "Bypass default app for any Intent"
date: "2020-10-27 22:57:04 +0100"
tag: android
---

Have you ever wondered how to launch an Intent on another app when yours is capable of handling it? Go ahead for the solution.

## Background

One of the first topics you'll meet as an Android developer are `Intents`

> An Intent is a messaging object you can use to request an action from another app component

and `Intent Filters`

> Each intent filter specifies the type of intents it accepts based on the intent's action, data, and category. The system delivers an implicit intent to your app component only if the intent can pass through one of your intent filters.

So you have the ability to specify `IntentFilters` for any `Activity` you may have in your app. That allows those Activities to be started when the rules specified by the Intent Filters are met.

The most common use is to make an app responsive to some kind of deeplinks.

Let's say we have an app that is meant to be the companion of `example.com` website and that any links from that domain should be opened in the app.

You wouldn't be surprised to see this in the AndroidManifest.xml file:

```xml
<activity android:name=".MainActivity">
  <intent-filter>
    <data android:scheme="https"
      android:host="example.com"
      android:pathPattern="/.*" />
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.BROWSABLE" />
    <category android:name="android.intent.category.DEFAULT" />
  </intent-filter>
</activity>
```

When clicking a `example.com` link users will be prompted with an app chooser listing all apps that can handle such link, most likely all the browser apps installed and the app we are talking about.

![Chooser](/assets/img/posts/intent-default-app/chooser.jpg)

Android gives you the ability to choose the default app and you may choose to "always" use that. That's awesome as you don't really want to annoy your users whenever they click on any of those supported links.

![Chooser](/assets/img/posts/intent-default-app/open-links.jpg)

Now let's say that we don't want to handle some of the `example.com` links in the app and redirect users to their preferred browser. There are at least a couple of reasons to do that:
- you aren't able to specify a sort of blacklist of links that the app can't handle because of the `IntentFilter` path syntax [limitations](https://developer.android.com/guide/topics/manifest/data-element). In this case even though the app has been launched you want to bounce users back to their browser;
- when processing some deeplinks in the app you may encounter any errors and decide to use the browser as a fallback.

To do that you have to launch the same `Intent` you got when the app was opened from the link but since the app itself is eligible to handle that you have to make sure that it won't be shown in the app chooser and, most importantly, in case you marked that app as the default one for that link you really don't want to reopen the same app over and over in an infinite loop.

The most common [solution](https://gist.github.com/Kevinrob/fef4359f68228ae0bcb803402e7715fa) seems to be using `PackageManager.queryIntentActivities` to list all available Activities that can handle a specific `Intent` and filter out the one that matches the current package name, which is your own app.

This only works when the app itself is not the "default" one for that kind of links. So, how do we fix that?

There's a simpler workaround which consists in specifying the category in order to filter all apps that don't match that. For this specific case we are going to use [CATEGORY_APP_BROWSER](https://developer.android.com/reference/android/content/Intent#CATEGORY_APP_BROWSER) but there are a lot more out there, depending on your use case.

So here's the working code snippet:

```kotlin
fun Context.openUrlExcludingCurrentApp(urlString: String) {
  startActivity(
    Intent.makeMainSelectorActivity(
      Intent.ACTION_MAIN,
      Intent.CATEGORY_APP_BROWSER
    ).apply {
      data = Uri.parse(urlString)
    }
  )
}
```

🍻 Cheers!
