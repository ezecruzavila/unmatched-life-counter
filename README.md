# UnmatchedCounter

Life counter for the **Unmatched** board game. Available on **Android** and
**iOS**, with the same characters, art and rules on both platforms.

## Overview

Each player picks a fighter from the roster and the app tracks their life
total during the game. Characters that come as a duo or trio (Geralt &
Dendelion, Bigfoot & Jackalope, the Raptors, Sherlock & Dr. Watson, Sinbad &
The Porter…) get one independent life pool per side, all on the same panel.

The UI is portrait-only and orientation-aware: each seat is rotated so the
number always reads upright for the player sitting at that side of the table.

## Players

- **2 or 4 players** per game (toggle on the setup screen).
- **1 to 3 life pools per player**, decided automatically by the chosen
  character — a solo fighter shows one big number, a duo splits the panel in
  two, the Raptors split it in three.
- Starting life is per-character (most fighters start at 16, the Raptors at
  7 each, etc.).
- Pools are clamped at **0** (a dead pool greys out, hides its number, and
  disables the `−` button) and at the character's starting value (the `+`
  button is disabled at max).

## Screens

### Setup screen

The launch screen, used to pick how many seats are in play and which fighter
sits at each one.

<p>
<img width="800" height="1340" alt="Screenshot_20260502_155922_Unmatched" src="https://github.com/user-attachments/assets/ac829ae3-a96a-4745-84d3-52f104d79868" />
<img width="800" height="1340" alt="Screenshot_20260502_155846_Unmatched" src="https://github.com/user-attachments/assets/ccfab8d2-24fd-45e0-8ee6-151b7f07495f" />

</p>

- **Title bar** with the app name and a thin two-tone divider with a small
  diamond marker in the middle.
- **Player count toggle** ("2 Players" / "4 Players") right under the title.
  The selected option gets a coloured stroke; the unselected one stays muted.
- **2 × 2 grid of player cards**, one per seat. In 2-player mode the bottom
  two cards dim and stop accepting taps.
- Each card is a rounded rectangle with a **circular "bite"** carved out of
  the inner corner facing the centre. The four bites converge around a
  central **Unmatched logo** that peeks through the gap.
- Inside each card:
  - A circular **avatar** of the selected character (top, centred).
  - **"Player N"** label.
  - A **character dropdown** with the current character name and a `▾`
    chevron on the right. Tapping it opens a picker showing the full roster
    sorted A → Z.
- Cards (and their inner avatar / dropdown borders) take the **accent
  colour** of the chosen character — gold for Bruce Lee, teal for the
  Witcher, purple for Syndra, etc.
- A wide **"⚔︎ START GAME"** button pinned to the bottom opens the game
  screen with the chosen line-up.

### Game screen

The actual life counter, shown once the game starts.

<p>
  <img src="screenshots/ios-game.png" width="240"/>
  <img src="screenshots/android-game.png" width="240"/>
</p>

- One **panel per seat** (2 or 4), arranged as a horizontal split for two
  players or a 2 × 2 grid for four. Each panel is **rotated** so the numbers
  always read upright for the player sitting on that side of the table.
- Each panel is filled with the chosen character's **full-bleed background
  art** (e.g. the Medusa mosaic, Bruce Lee's dragon, Syndra's nebula).
- On top of the art, the panel stacks **1 to 3 life pool rows** — one per
  pool. A solo character has a single big number; duos like Geralt +
  Dendelion split the panel in two; the Raptors split it in three.
- Every life pool contains:
  - A small "chip" with the **pool name** at the top, with a translucent
    black background.
  - A huge **amount label** in the centre with a soft drop shadow so it
    reads against any background.
  - **`−` and `+` hold-to-repeat buttons** on the sides. A tap changes the
    value by 1; pressing and holding ramps the cadence up so big swings are
    fast.
- A pool **clamps at 0**: the number fades out, a translucent black overlay
  greys the whole pool area, and `−` is disabled. Pressing `+` brings it
  back. Pools also clamp at the character's starting maximum.
- The centre of the screen has a small **hub** with a restart (`↻`) and
  exit (`✕`) button, both guarded by confirmation alerts. **Long-pressing**
  the hub toggles whether the system bars are hidden.

## Generating an .ipa (iOS)

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
