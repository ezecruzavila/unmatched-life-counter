import type { Character } from './types'

/**
 * The 23 playable Unmatched fighters, ported 1:1 from the Android
 * `UnmatchedCharacters.Fighter` enum (display name, life pools, labels, art,
 * setup accent color, and optional floating extra button).
 *
 * Art filenames refer to PNGs under /art (copied from res/drawable-nodpi).
 * Order here matches the Android enum order, which also drives the default
 * per-seat character on the setup screen.
 */
export const CHARACTERS: Character[] = [
  {
    displayName: 'Geralt & Dendelion',
    segmentLabels: ['GERALT', 'DENDELION'],
    background: 'bg_geralt.png',
    avatar: 'avatar_geralt.png',
    startingLifeSegments: [16, 5],
    setupAccentColor: '#309894',
  },
  {
    displayName: 'Bigfoot & Jackalope',
    segmentLabels: ['BIGFOOT', 'JACKALOPE'],
    background: 'bg_bigfoot.png',
    avatar: 'avatar_bigfoot.png',
    startingLifeSegments: [16, 6],
    setupAccentColor: '#F0B586',
  },
  {
    displayName: 'Bruce Lee',
    segmentLabels: ['BRUCE LEE'],
    background: 'bg_brucelee.png',
    avatar: 'avatar_brucelee.png',
    startingLifeSegments: [14],
    setupAccentColor: '#ECBD49',
  },
  {
    displayName: 'Syndra',
    segmentLabels: ['SYNDRA'],
    background: 'bg_syndra.png',
    avatar: 'avatar_syndra.png',
    startingLifeSegments: [14],
    setupAccentColor: '#3D25A8',
    disabled: true,
  },
  {
    displayName: 'Taskmaster',
    segmentLabels: ['TASKMASTER'],
    background: 'bg_taskmaster.png',
    avatar: 'avatar_taskmaster.png',
    startingLifeSegments: [16],
    setupAccentColor: '#FF8B33',
  },
  {
    displayName: 'Muldoon & Workers',
    segmentLabels: ['MULDOON'],
    background: 'bg_muldoon.png',
    avatar: 'avatar_muldoon.png',
    startingLifeSegments: [14],
    setupAccentColor: '#E39139',
    extraButton: { kind: 'counter', image: 'extra_muldoon_trap.png', start: 8 },
  },
  {
    displayName: 'Chupacabras',
    segmentLabels: ['CHUPACABRAS'],
    background: 'bg_chupacabras.png',
    avatar: 'avatar_chupacabras.png',
    startingLifeSegments: [14],
    setupAccentColor: '#C0C565',
  },
  {
    displayName: 'Raptors',
    segmentLabels: ['BLUE', 'ECHO', 'CHARLIE'],
    background: 'bg_raptors.png',
    avatar: 'avatar_raptors.png',
    startingLifeSegments: [7, 7, 7],
    setupAccentColor: '#AF9E49',
    poolOverlays: ['raptors_blue.png', 'raptors_echo.png', 'raptors_charlie.png'],
  },
  {
    displayName: 'Eredin & Red Riders',
    segmentLabels: ['EREDIN'],
    background: 'bg_eredin.png',
    avatar: 'avatar_eredin.png',
    startingLifeSegments: [14],
    setupAccentColor: '#2E302D',
  },
  {
    displayName: 'Bullseye',
    segmentLabels: ['BULLSEYE'],
    background: 'bg_bullseye.png',
    avatar: 'avatar_bullseye.png',
    startingLifeSegments: [14],
    setupAccentColor: '#5876A1',
  },
  {
    displayName: 'Houdini & Bess',
    segmentLabels: ['HOUDINI', 'BESS'],
    background: 'bg_houdini.png',
    avatar: 'avatar_houdini.png',
    startingLifeSegments: [14, 5],
    setupAccentColor: '#C6AD5A',
  },
  {
    displayName: 'Daredevil',
    segmentLabels: ['DAREDEVIL'],
    background: 'bg_daredevil.png',
    avatar: 'avatar_daredevil.png',
    startingLifeSegments: [17],
    setupAccentColor: '#770A08',
  },
  {
    displayName: 'Leshen & Wolves',
    segmentLabels: ['LESHEN'],
    background: 'bg_leshen.png',
    avatar: 'avatar_leshen.png',
    startingLifeSegments: [13],
    setupAccentColor: '#436e37',
  },
  {
    displayName: 'Loki',
    segmentLabels: ['LOKI'],
    background: 'bg_loki.png',
    avatar: 'avatar_loki.png',
    startingLifeSegments: [16],
    setupAccentColor: '#354932',
  },
  {
    displayName: "Schrödinger's Cat",
    segmentLabels: ["SCHRÖDINGER'S CAT"],
    background: 'bg_schrodinger.png',
    avatar: 'avatar_schrodinger.png',
    startingLifeSegments: [15],
    setupAccentColor: '#6c2919',
    extraButton: {
      kind: 'toggle',
      states: [
        { text: 'UNCERTAIN', textColor: '#FFFFFF', backgroundColor: '#00A7C0' },
        { text: 'OBSERVED', textColor: '#FFFFFF', backgroundColor: '#C5330D' },
      ],
    },
  },
  {
    displayName: 'Sherlock & Dr.Watson',
    segmentLabels: ['SHERLOCK', 'DR. WATSON'],
    background: 'bg_sherlock.png',
    avatar: 'avatar_sherlock.png',
    startingLifeSegments: [16, 8],
    setupAccentColor: '#FFC03F',
  },
  {
    displayName: 'Elektra',
    segmentLabels: ['ELEKTRA'],
    background: 'bg_elektra.png',
    avatar: 'avatar_elektra.png',
    startingLifeSegments: [8],
    setupAccentColor: '#770A08',
    disabled: true,
  },
  {
    displayName: 'Zed',
    segmentLabels: ['ZED'],
    background: 'bg_zed.png',
    avatar: 'avatar_zed.png',
    startingLifeSegments: [15],
    setupAccentColor: '#770A08',
  },
  {
    displayName: 'Arthur & Merlin',
    segmentLabels: ['KING ARTHUR', 'MERLIN'],
    background: 'bg_kingarthur.png',
    avatar: 'avatar_arthur.png',
    startingLifeSegments: [18, 7],
    setupAccentColor: '#2E302D',
  },
  {
    displayName: 'Medusa & Arpies',
    segmentLabels: ['MEDUSA'],
    background: 'bg_medusa.png',
    avatar: 'avatar_medusa.png',
    startingLifeSegments: [16],
    setupAccentColor: '#354932',
  },
  {
    displayName: 'Alice & Jabberwock',
    segmentLabels: ['ALICE', 'JABBERWOCK'],
    background: 'bg_alicia.png',
    avatar: 'avatar_alice.png',
    startingLifeSegments: [13, 8],
    setupAccentColor: '#5876A1',
    extraButton: {
      kind: 'toggle',
      states: [
        { text: 'BIG', textColor: '#FFFFFF', backgroundColor: '#5876A1' },
        { text: 'SMALL', textColor: '#FFFFFF', backgroundColor: '#C5330D' },
      ],
    },
  },
  {
    displayName: 'Sinbad & The Porter',
    segmentLabels: ['SINBAD', 'PORTER'],
    background: 'bg_simbad.png',
    avatar: 'avatar_simbad.png',
    startingLifeSegments: [15, 6],
    setupAccentColor: '#F0B586',
  },
]

const BY_NAME = new Map(CHARACTERS.map((c) => [c.displayName, c]))

/** Selectable fighters — everything except those flagged `disabled`. */
export const SELECTABLE_CHARACTERS: Character[] = CHARACTERS.filter((c) => !c.disabled)

/**
 * Selectable fighter names sorted alphabetically (case-insensitive) for the
 * selection dropdown. Disabled fighters are omitted.
 */
export const CHARACTER_NAMES_SORTED: string[] = SELECTABLE_CHARACTERS.map((c) => c.displayName).sort(
  (a, b) => a.toLowerCase().localeCompare(b.toLowerCase()),
)

export function getCharacter(name: string): Character {
  const c = BY_NAME.get(name)
  if (!c) throw new Error(`Unknown character: ${name}`)
  return c
}

/**
 * Default character for seat `index`, walking the selectable roster (skipping
 * disabled fighters) and falling back to the first selectable one.
 */
export function defaultCharacterName(index: number): string {
  return SELECTABLE_CHARACTERS[index]?.displayName ?? SELECTABLE_CHARACTERS[0].displayName
}
