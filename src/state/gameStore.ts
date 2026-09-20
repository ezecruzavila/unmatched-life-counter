import { useSyncExternalStore } from 'react'
import {
  getCharacter,
  defaultCharacterName,
} from '../domain/characters'
import {
  MAX_PLAYER_COUNT,
  PLAYER_COLORS,
  SUPPORTED_PLAYER_COUNTS,
} from '../domain/gameRules'
import {
  initialExtraValue,
  nextExtraValue,
  type PlayerModel,
  type PlayerSetup,
} from '../domain/types'

/**
 * Which screen is showing. Character selection and the life counter are now a
 * SINGLE screen ('table'): each seat starts in "selecting" mode and, once the
 * player taps CONFIRM, that same seat flips in place to its life counter.
 */
export type Screen = 'home' | 'table'

export interface AppState {
  screen: Screen
  /** Always MAX_PLAYER_COUNT slots so toggling 4 -> 2 -> 4 keeps selections. */
  setupPlayers: PlayerSetup[]
  /** Active seats for the game (2 or 4). */
  playerCount: number
  /**
   * Per-seat life-counter model, indexed by player id (MAX_PLAYER_COUNT slots).
   * `null` means that seat is still selecting a character; a PlayerModel means
   * the player has confirmed and the seat now shows the life counter.
   */
  models: (PlayerModel | null)[]
  /**
   * Player id (seat index) whose turn it currently is, or null when no turn is
   * active yet (not every active seat has confirmed). The turn always starts at
   * P1 and advances 1 → 2 → 3 → 4, skipping defeated players.
   */
  currentTurn: number | null
}

/**
 * Turn order by seat id (0-based): plain 1 → 2 → 3 → 4. With 2 players only
 * seats 0 and 1 are active, so the same array (filtered by playerCount) yields
 * 1 → 2.
 */
const TURN_ORDER = [0, 1, 2, 3]

const STORAGE_KEY = 'unmatched-counter-state-v1'

function buildDefaultSetup(): PlayerSetup[] {
  const players: PlayerSetup[] = []
  for (let i = 0; i < MAX_PLAYER_COUNT; i++) {
    const name = defaultCharacterName(i)
    // First unused color, else NONE.
    const usedColors = new Set(players.map((p) => p.colorId))
    const color = PLAYER_COLORS.find((c) => !usedColors.has(c.id))
    players.push({
      id: i,
      characterName: name,
      colorId: color?.id ?? 'NONE',
      startingLifeSegments: getCharacter(name).startingLifeSegments,
    })
  }
  return players
}

function defaultState(): AppState {
  return {
    screen: 'home',
    setupPlayers: buildDefaultSetup(),
    playerCount: MAX_PLAYER_COUNT,
    models: Array(MAX_PLAYER_COUNT).fill(null),
    currentTurn: null,
  }
}

/**
 * Active turn sequence: seats within the current playerCount, in the fixed
 * 1 → 3 → 2 → 4 order.
 */
function turnSequence(playerCount: number): number[] {
  return TURN_ORDER.filter((id) => id < playerCount)
}

/**
 * The turn to start/resume at: the first player in sequence that has confirmed
 * and isn't defeated, or null if none qualifies (all seats still selecting or
 * everyone defeated).
 */
function firstLivingTurn(
  models: (PlayerModel | null)[],
  playerCount: number,
): number | null {
  for (const id of turnSequence(playerCount)) {
    const m = models[id]
    if (m && !m.defeated) return id
  }
  return null
}

/**
 * Advance from `from` to the next confirmed, non-defeated player in the
 * rotation, wrapping around. Returns null if nobody qualifies. When `from` is
 * null (or absent), starts scanning from the top of the sequence.
 */
function nextLivingTurn(
  models: (PlayerModel | null)[],
  playerCount: number,
  from: number | null,
): number | null {
  const seq = turnSequence(playerCount)
  if (seq.length === 0) return null
  const start = from === null ? -1 : seq.indexOf(from)
  for (let step = 1; step <= seq.length; step++) {
    const id = seq[(start + step + seq.length) % seq.length]
    const m = models[id]
    if (m && !m.defeated) return id
  }
  return null
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = defaultState()
    const screen: Screen = parsed.screen === 'table' ? 'table' : 'home'
    const models: (PlayerModel | null)[] =
      Array.isArray(parsed.models) && parsed.models.length === MAX_PLAYER_COUNT
        ? (parsed.models as (PlayerModel | null)[])
        : base.models
    return {
      screen,
      setupPlayers:
        Array.isArray(parsed.setupPlayers) && parsed.setupPlayers.length === MAX_PLAYER_COUNT
          ? parsed.setupPlayers
          : base.setupPlayers,
      playerCount: SUPPORTED_PLAYER_COUNTS.includes(parsed.playerCount as 2 | 4)
        ? (parsed.playerCount as number)
        : base.playerCount,
      models,
      currentTurn:
        typeof parsed.currentTurn === 'number' &&
        parsed.currentTurn >= 0 &&
        parsed.currentTurn < MAX_PLAYER_COUNT
          ? parsed.currentTurn
          : null,
    }
  } catch {
    return defaultState()
  }
}

let state: AppState = loadState()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage full / disabled — ignore, game still works in-memory */
  }
}

function setState(next: AppState) {
  state = next
  persist()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot(): AppState {
  return state
}

/** Subscribe to the whole app state. */
export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

// ---- Navigation ----

/**
 * Home → the unified table. Every active seat starts in "selecting" mode
 * (models reset to null) so players pick a character before confirming.
 */
export function goToSetup() {
  setState({
    ...state,
    screen: 'table',
    models: Array(MAX_PLAYER_COUNT).fill(null),
    currentTurn: null,
  })
}

/** Table → back to home (also clears any in-progress life counters). */
export function backToHome() {
  setState({
    ...state,
    screen: 'home',
    models: Array(MAX_PLAYER_COUNT).fill(null),
    currentTurn: null,
  })
}

// ---- Setup actions (ported from SetupViewModel) ----

export function setPlayerCount(count: number) {
  if (!SUPPORTED_PLAYER_COUNTS.includes(count as 2 | 4)) return
  if (state.playerCount === count) return
  setState({ ...state, playerCount: count })
}

export function setPlayerCharacter(playerId: number, characterName: string) {
  const setupPlayers = state.setupPlayers.map((p) =>
    p.id === playerId
      ? {
          ...p,
          characterName,
          startingLifeSegments: getCharacter(characterName).startingLifeSegments,
        }
      : p,
  )
  setState({ ...state, setupPlayers })
}

/**
 * Set a seat's color. If another seat already holds that color, swap them so
 * colors stay unique (mirrors SetupViewModel.updatePlayer).
 */
export function setPlayerColor(playerId: number, colorId: string) {
  const current = state.setupPlayers.find((p) => p.id === playerId)
  if (!current) return
  const previousColor = current.colorId
  const setupPlayers = state.setupPlayers.map((p) => {
    if (p.id === playerId) return { ...p, colorId }
    if (colorId !== 'NONE' && p.colorId === colorId) return { ...p, colorId: previousColor }
    return p
  })
  setState({ ...state, setupPlayers })
}

// ---- Game lifecycle (ported from GameViewModel) ----

function freshPlayerModel(setup: PlayerSetup): PlayerModel {
  const character = getCharacter(setup.characterName)
  const life = character.startingLifeSegments
  return {
    id: setup.id,
    characterName: setup.characterName,
    lifeSegmentLabels: character.segmentLabels,
    lifeSegmentMaximums: [...life],
    lifeSegments: [...life],
    colorId: setup.colorId,
    extraButtonValue: character.extraButton ? initialExtraValue(character.extraButton) : null,
    defeated: false,
  }
}

/**
 * Confirm a single seat: freeze its current character selection into a live
 * life-counter model, flipping just that seat from "selecting" to "playing".
 * The other seats are untouched.
 */
export function confirmPlayer(playerId: number) {
  const setup = state.setupPlayers.find((p) => p.id === playerId)
  if (!setup) return
  const models = state.models.slice()
  models[playerId] = freshPlayerModel(setup)
  // Turns begin (always at P1) once every active seat has confirmed.
  const seq = turnSequence(state.playerCount)
  const allConfirmed = seq.every((id) => models[id])
  const currentTurn = allConfirmed ? firstLivingTurn(models, state.playerCount) : null
  setState({ ...state, models, currentTurn })
}

/**
 * Restart a seat: drop its life counter back to character selection, keeping
 * the character that was previously chosen (that selection lives in
 * setupPlayers, so we just clear the model to re-enter "selecting" mode).
 */
export function backToSelection(playerId: number) {
  const models = state.models.slice()
  models[playerId] = null
  // A seat left the game → no active turn until everyone confirms again.
  setState({ ...state, models, currentTurn: null })
}

/** Restart ALL active seats back to selection (menu "restart"). */
export function resetGame() {
  setState({ ...state, models: Array(MAX_PLAYER_COUNT).fill(null), currentTurn: null })
}

// ---- Turn rotation ----

/**
 * Advance the turn to the next living player (1 → 3 → 2 → 4, wrapping),
 * skipping defeated seats. Only fires when it's actually a turn in progress.
 */
export function advanceTurn() {
  if (state.currentTurn === null) return
  const currentTurn = nextLivingTurn(state.models, state.playerCount, state.currentTurn)
  setState({ ...state, currentTurn })
}

/**
 * Mark a player defeated (all their pools are out). They leave the turn
 * rotation; if it was their turn, hand it to the next living player.
 */
export function defeatPlayer(playerId: number) {
  const models = state.models.map((p) =>
    p && p.id === playerId ? { ...p, defeated: true } : p,
  )
  let currentTurn = state.currentTurn
  if (currentTurn === playerId) {
    currentTurn = nextLivingTurn(models, state.playerCount, playerId)
  }
  setState({ ...state, models, currentTurn })
}

/**
 * Revive a defeated player: every pool comes back at 1 life (the minimum) and
 * they rejoin the rotation. If turns had stalled (everyone was defeated), the
 * revived player takes the turn.
 */
export function revivePlayer(playerId: number) {
  const models = state.models.map((p) =>
    p && p.id === playerId
      ? { ...p, defeated: false, lifeSegments: p.lifeSegments.map(() => 1) }
      : p,
  )
  const currentTurn =
    state.currentTurn === null && turnSequence(state.playerCount).every((id) => models[id])
      ? playerId
      : state.currentTurn
  setState({ ...state, models, currentTurn })
}

export function incrementLife(playerId: number, delta: number, segmentIndex = 0) {
  const models = state.models.map((p) => {
    if (!p || p.id !== playerId) return p
    if (segmentIndex < 0 || segmentIndex >= p.lifeSegments.length) return p
    const max = p.lifeSegmentMaximums[segmentIndex]
    const segs = [...p.lifeSegments]
    segs[segmentIndex] = Math.max(0, Math.min(max, segs[segmentIndex] + delta))
    return { ...p, lifeSegments: segs }
  })
  setState({ ...state, models })
}

export function tapExtraButton(playerId: number) {
  const models = state.models.map((p) => {
    if (!p || p.id !== playerId || p.extraButtonValue === null) return p
    const spec = getCharacter(p.characterName).extraButton
    if (!spec) return p
    return { ...p, extraButtonValue: nextExtraValue(spec, p.extraButtonValue) }
  })
  setState({ ...state, models })
}

/**
 * Nudge a counter extra by `delta` (used by the stepper popover), clamped to the
 * counter's [min, max] — no wrap, unlike a plain tap. No-op for toggles.
 */
export function stepExtraValue(playerId: number, delta: number) {
  const models = state.models.map((p) => {
    if (!p || p.id !== playerId || p.extraButtonValue === null) return p
    const spec = getCharacter(p.characterName).extraButton
    if (!spec || spec.kind !== 'counter') return p
    const min = spec.min ?? 0
    const max = spec.max ?? spec.start
    const next = Math.max(min, Math.min(max, p.extraButtonValue + delta))
    return { ...p, extraButtonValue: next }
  })
  setState({ ...state, models })
}

// ---- Maintenance ----

/**
 * Wipe everything and reload so the device fetches the latest deployed version:
 * clears the saved state (localStorage), all Cache Storage entries, and any
 * registered service workers. This is the reliable "get the new version" path
 * on PWAs, where the browser would otherwise keep serving the cached app shell.
 */
export async function clearCacheAndReload() {
  try {
    localStorage.clear()
  } catch {
    /* ignore */
  }
  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((k) => caches.delete(k)))
    }
  } catch {
    /* ignore */
  }
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((r) => r.unregister()))
    }
  } catch {
    /* ignore */
  }
  // Full reload from the network.
  location.reload()
}
