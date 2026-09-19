# UnmatchedCounter — Android

Life counter for the **Unmatched** board game (Android).

This branch holds the **Android** app only. The other platforms live on their
own branches:

- `main` — web app (PWA)
- `ios` — iOS app

## Overview

Each player picks a fighter from the roster and the app tracks their life
total during the game. Characters that come as a duo or trio (Geralt &
Dendelion, Bigfoot & Jackalope, the Raptors, Sherlock & Dr. Watson, Sinbad &
The Porter…) get one independent life pool per side, all on the same panel.

The UI is portrait-only and orientation-aware: each seat is rotated so the
number always reads upright for the player sitting at that side of the table.

## Features

* 100% free with no ads
* Supports 2 or 4 players on a shared-screen tabletop layout
* Per-character starting life, including multi-pool fighters (e.g. Geralt & Dendelion, Raptors)
* Character-specific floating tokens over the life counter (e.g. Muldoon's trap counter,
  Schrödinger's Cat UNCERTAIN/OBSERVED toggle)
* Hold-to-change life counters and quick game reset
* Dark theme

## Supported characters

Alice & Jabberwock, Arthur & Merlin, Bigfoot & Jackalope, Bruce Lee, Bullseye,
Chupacabras, Daredevil, Elektra, Eredin, Geralt & Dendelion, Houdini & Bess,
Leshen & Wolves, Loki, Medusa, Muldoon & Workers, Raptors, Schrödinger's Cat,
Sherlock & Dr. Watson, Sinbad & The Porter, Syndra, Taskmaster, Zed.

## Building

This is a standard Gradle Android project (Kotlin, MVVM, Hilt).

```
./gradlew :app:assembleDebug
```

The debug APK is written to `app/build/outputs/apk/debug/`.

## Contributing

Feel free to use this code however you'd like.
If you are interested in contributing, fork the code and open a pull request.

Adding a character is mostly a matter of adding an entry to the `UnmatchedCharacters`
fighter list (display name, life pools, labels, art) plus the matching avatar/background
drawables.
