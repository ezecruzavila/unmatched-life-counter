# UnmatchedCounter — iOS

Life counter for the **Unmatched** board game (iOS).

This branch holds the **iOS** app only. The other platforms live on their own
branches:

- `main` — web app (PWA)
- `android` — Android app

## Overview

Each player picks a fighter from the roster and the app tracks their life
total during the game. Characters that come as a duo or trio (Geralt &
Dendelion, Bigfoot & Jackalope, the Raptors, Sherlock & Dr. Watson, Sinbad &
The Porter…) get one independent life pool per side, all on the same panel.

The UI is portrait-only and orientation-aware: each seat is rotated so the
number always reads upright for the player sitting at that side of the table.

## Screens

### Setup screen

Pick how many seats are in play (2 or 4) and which fighter sits at each one.
Each card shows the character's avatar, a "Player N" label, and a dropdown with
the full roster sorted A → Z. Cards take the accent colour of the chosen
character. A wide **"⚔︎ START GAME"** button opens the game screen.

### Game screen

- One **panel per seat** (2 or 4): a horizontal split for two players, a 2 × 2
  grid for four. Each panel is **rotated** so the numbers always read upright
  for the player sitting on that side of the table.
- Each panel shows the character's **full-bleed background art** with **1 to 3
  life pool rows** stacked on top (one per pool).
- Every pool has a name chip, a huge amount label, and **`−` / `+`
  hold-to-repeat buttons** — a tap changes by 1, holding ramps the cadence up.
- Pools **clamp at 0** (greyed out, `−` disabled) and at the character's
  starting maximum (`+` disabled).
- A central **hub** has restart (`↻`) and exit (`✕`), both confirmation-guarded.

## Generating an .ipa

The repo ships an end-to-end script that produces an **unsigned** `.ipa`
without opening Xcode, so you can re-sign and sideload it later (no Apple
Developer Program account needed).

```
bash ios/_gen_ipa.sh
```

What it does:

1. Runs `xcodebuild archive` in **Release** for `generic/platform=iOS` with
   `CODE_SIGNING_ALLOWED=NO` (skips the dev-team / provisioning profile
   requirement that otherwise blocks Archive).
2. Takes the resulting `.xcarchive` and wraps its `.app` bundle in the
   standard `Payload/<App>.app/` layout that Apple expects in an IPA.
3. Zips it as `ios/build/UnmatchedCounter.ipa` (~30 MB).

Outputs:

```
ios/build/
├── UnmatchedCounter.xcarchive    ← full archive (binary + dSYMs + SwiftSupport)
├── UnmatchedCounter.ipa          ← unsigned IPA, ready to re-sign
└── DerivedData/                  ← build cache, safe to delete
```

iOS will refuse to install an unsigned IPA directly. To put it on a real
device, use **ReProvision Reborn**: an on-device app that takes the `.ipa`,
signs it with your Apple ID (free account is enough), installs it, and
re-signs it automatically every 7 days so it doesn't expire.

Steps:

1. Install ReProvision Reborn on the device (typically via TrollStore or
   AltStore — see the project's GitHub for the current install path).
2. Transfer `ios/build/UnmatchedCounter.ipa` to the device (AirDrop, Files
   app, Finder sync, etc.).
3. Open ReProvision Reborn → pick the IPA → sign in with your Apple ID →
   *Install*.

## Contributing

Feel free to use this code however you'd like.
If you are interested in contributing, fork the code and open a pull request.
