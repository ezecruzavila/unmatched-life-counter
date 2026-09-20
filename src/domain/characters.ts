import type { Character } from './types'

/**
 * The 23 playable Unmatched fighters, ported 1:1 from the Android
 * `UnmatchedCharacters.Fighter` enum (display name, life pools, labels, art,
 * setup accent color, and optional floating extra button).
 *
 * Each fighter's art lives under art/characters/<slug>/ (avatar.webp,
 * background.webp, plus any extras like tricks/shield/trap/raptor silhouettes),
 * resolved from `slug` via characterArt() — see art.ts.
 * Order here matches the Android enum order, which also drives the default
 * per-seat character on the setup screen.
 */
export const CHARACTERS: Character[] = [
  {
    displayName: 'Geralt & Dendelion',
    slug: 'geralt',
    segmentLabels: ['GERALT', 'DENDELION'],
    startingLifeSegments: [16, 5],
    setupAccentColor: '#309894',
  },
  {
    displayName: 'Bigfoot & Jackalope',
    slug: 'bigfoot',
    segmentLabels: ['BIGFOOT', 'JACKALOPE'],
    startingLifeSegments: [16, 6],
    setupAccentColor: '#F0B586',
  },
  {
    displayName: 'Bruce Lee',
    slug: 'brucelee',
    segmentLabels: ['BRUCE LEE'],
    startingLifeSegments: [14],
    setupAccentColor: '#ECBD49',
  },
  {
    displayName: 'Syndra',
    slug: 'syndra',
    segmentLabels: ['SYNDRA'],
    startingLifeSegments: [14],
    setupAccentColor: '#3D25A8',
    disabled: true,
  },
  {
    displayName: 'Taskmaster',
    slug: 'taskmaster',
    segmentLabels: ['TASKMASTER'],
    startingLifeSegments: [16],
    setupAccentColor: '#FF8B33',
    // Shield counter: 0 → 1 → 2 → 0 (counts UP, unlike Muldoon's trap). White
    // number for legibility over the dark shield art.
    extraButton: {
      kind: 'counter',
      image: 'shield',
      start: 0,
      min: 0,
      max: 2,
      step: 1,
      countColor: '#fff',
      countStroke: '#000',
      countOffsetY: '0',
    },
  },
  {
    displayName: 'Muldoon & Workers',
    slug: 'muldoon',
    segmentLabels: ['MULDOON'],
    startingLifeSegments: [14],
    setupAccentColor: '#E39139',
    extraButton: { kind: 'counter', image: 'trap', start: 8 },
  },
  {
    displayName: 'Chupacabras',
    slug: 'chupacabras',
    segmentLabels: ['CHUPACABRAS'],
    startingLifeSegments: [14],
    setupAccentColor: '#C0C565',
  },
  {
    displayName: 'Raptors',
    slug: 'raptors',
    segmentLabels: ['BLUE', 'ECHO', 'CHARLIE'],
    startingLifeSegments: [7, 7, 7],
    setupAccentColor: '#AF9E49',
    poolOverlays: ['blue', 'echo', 'charlie'],
  },
  {
    displayName: 'Eredin & Red Riders',
    slug: 'eredin',
    segmentLabels: ['EREDIN'],
    startingLifeSegments: [14],
    setupAccentColor: '#2E302D',
  },
  {
    displayName: 'Bullseye',
    slug: 'bullseye',
    segmentLabels: ['BULLSEYE'],
    startingLifeSegments: [14],
    setupAccentColor: '#5876A1',
  },
  {
    displayName: 'Houdini & Bess',
    slug: 'houdini',
    segmentLabels: ['HOUDINI', 'BESS'],
    startingLifeSegments: [14, 5],
    setupAccentColor: '#C6AD5A',
  },
  {
    displayName: 'Daredevil',
    slug: 'daredevil',
    segmentLabels: ['DAREDEVIL'],
    startingLifeSegments: [17],
    setupAccentColor: '#770A08',
  },
  {
    displayName: 'Leshen & Wolves',
    slug: 'leshen',
    segmentLabels: ['LESHEN'],
    startingLifeSegments: [13],
    setupAccentColor: '#436e37',
  },
  {
    displayName: 'Loki',
    slug: 'loki',
    segmentLabels: ['LOKI'],
    startingLifeSegments: [16],
    setupAccentColor: '#354932',
    // Tricks counter: counts UP 0 → … → 9 → 0 (like Taskmaster, higher cap).
    extraButton: {
      kind: 'counter',
      image: 'tricks',
      start: 0,
      min: 0,
      max: 9,
      step: 1,
      countColor: '#fff',
      countStroke: '#000',
      countOffsetY: '0',
      scale: 0.9, // tricks icon 10% smaller than the default counter
    },
  },
  {
    displayName: "Schrödinger's Cat",
    slug: 'schrodinger',
    segmentLabels: ["SCHRÖDINGER'S CAT"],
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
    slug: 'sherlock',
    segmentLabels: ['SHERLOCK', 'DR. WATSON'],
    startingLifeSegments: [16, 8],
    setupAccentColor: '#FFC03F',
  },
  {
    displayName: 'Elektra',
    slug: 'elektra',
    segmentLabels: ['ELEKTRA'],
    startingLifeSegments: [8],
    setupAccentColor: '#770A08',
    disabled: true,
  },
  {
    displayName: 'Zed',
    slug: 'zed',
    segmentLabels: ['ZED'],
    startingLifeSegments: [15],
    setupAccentColor: '#770A08',
  },
  {
    displayName: 'Arthur & Merlin',
    slug: 'arthur',
    segmentLabels: ['KING ARTHUR', 'MERLIN'],
    startingLifeSegments: [18, 7],
    setupAccentColor: '#2E302D',
  },
  {
    displayName: 'Medusa & Arpies',
    slug: 'medusa',
    segmentLabels: ['MEDUSA'],
    startingLifeSegments: [16],
    setupAccentColor: '#354932',
  },
  {
    displayName: 'Alice & Jabberwock',
    slug: 'alice',
    segmentLabels: ['ALICE', 'JABBERWOCK'],
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
    slug: 'sinbad',
    segmentLabels: ['SINBAD', 'PORTER'],
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
