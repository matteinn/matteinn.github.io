---
title: "Building MyPorter"
date: 2026-07-23 10:00:00 +0200
tags: [startup, ai]
description: >-
  Why we decided to build an AI assistant for short-term rental hosts as a
  WhatsApp bot instead of yet another app, and some notes on how it's put
  together under the hood.
---

A few old friends and I have been hosts ourselves for a while, so we know the drill firsthand: guests write to you at 11pm asking for the WiFi password, at 7am because they can't figure out the induction hob, and at check-in time from the wrong address because Google Maps sent them somewhere else entirely. None of it is hard to answer, there's just a lot of it, and it never happens at a convenient time.

What really made the idea click was someone we know who manages 13 apartments in the same building. Multiply those same questions by 13 units and guests speaking half a dozen different languages, and you get a daily flood of near-identical messages that no single person can keep up with without it becoming a full-time job.

Being engineers, our first instinct wasn't "let's hire someone to answer messages", it was "let's automate the boring 90% of it". That's how [MyPorter](https://myporter.ai?utm_source=matteinn) started.

## Why WhatsApp

The obvious answer here is "build an app". We didn't.

Guests already have WhatsApp open, hosts already use it to send check-in instructions, and neither side wants to install yet another thing for a stay that lasts a few days. So instead of building a product people have to adopt, we built one that lives inside a chat they already have open. No app, no login, no dashboard to learn.

That constraint shaped everything else. If the whole product is a chat, then onboarding has to be a chat too: hosts set up a property by messaging the assistant itself, describing house rules, appliances, parking, Wi-Fi, local tips, in plain language, the same way they'd brief a co-host. No forms, no admin panel.

## Under the hood

The rough shape of it:

- **WhatsApp as the only interface**, both for hosts configuring a property and guests asking questions, through the WhatsApp Business Platform.
- **A knowledge base built around each property**, not a generic hospitality chatbot. The AI core is grounded in what the host actually told it about that specific listing, and replies in whatever language the guest is writing in.
- **Reservations ingestion**, currently from Airbnb, via email confirmations, or entered manually by the host. Knowing who's expected and when ahead of time means guests never have to identify themselves, they just write to a WhatsApp number and the assistant already knows which property, which reservation, and which dates it's talking about.
- **Smart escalation system**: if the assistant isn't confident it knows the right answer, it doesn't make one up. It asks the host instead, the guest is told automatically once the host replies, and that answer is remembered for next time, so the same question never has to be escalated twice.

We tested it on our own properties first, mostly because it was the fastest way to find out where the assistant would confidently say the wrong thing. It's a good forcing function: you notice very quickly when an AI answer is subtly off if it's your own guests reading it.

## Where it's at

It's live, other hosts started asking for access once they saw it running on our listings, and we're still very much in the stage of tightening the escalation logic and expanding what the assistant can be trusted to answer on its own. If you're renting out a property and drowning in the same repetitive messages we were, have a look at [myporter.ai](https://myporter.ai?utm_source=matteinn).
