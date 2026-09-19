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
}

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
  }
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
  setState({ ...state, screen: 'table', models: Array(MAX_PLAYER_COUNT).fill(null) })
}

/** Table → back to home (also clears any in-progress life counters). */
export function backToHome() {
  setState({ ...state, screen: 'home', models: Array(MAX_PLAYER_COUNT).fill(null) })
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
  setState({ ...state, models })
}

/**
 * Restart a seat: drop its life counter back to character selection, keeping
 * the character that was previously chosen (that selection lives in
 * setupPlayers, so we just clear the model to re-enter "selecting" mode).
 */
export function backToSelection(playerId: number) {
  const models = state.models.slice()
  models[playerId] = null
  setState({ ...state, models })
}

/** Restart ALL active seats back to selection (menu "restart"). */
export function resetGame() {
  setState({ ...state, models: Array(MAX_PLAYER_COUNT).fill(null) })
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
    const next =
      spec.kind === 'counter'
        ? p.extraButtonValue <= 0
          ? spec.start
          : p.extraButtonValue - 1
        : (p.extraButtonValue + 1) % spec.states.length
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
