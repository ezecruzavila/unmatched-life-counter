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

/** Which screen is showing. */
export type Screen = 'setup' | 'game'

export interface AppState {
  screen: Screen
  /** Always MAX_PLAYER_COUNT slots so toggling 4 -> 2 -> 4 keeps selections. */
  setupPlayers: PlayerSetup[]
  /** Active seats for the game (2 or 4). */
  playerCount: number
  /** Live players once a game has started; empty on the setup screen. */
  gamePlayers: PlayerModel[]
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
    screen: 'setup',
    setupPlayers: buildDefaultSetup(),
    playerCount: MAX_PLAYER_COUNT,
    gamePlayers: [],
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    const base = defaultState()
    return {
      screen: parsed.screen === 'game' ? 'game' : 'setup',
      setupPlayers:
        Array.isArray(parsed.setupPlayers) && parsed.setupPlayers.length === MAX_PLAYER_COUNT
          ? parsed.setupPlayers
          : base.setupPlayers,
      playerCount: SUPPORTED_PLAYER_COUNTS.includes(parsed.playerCount as 2 | 4)
        ? (parsed.playerCount as number)
        : base.playerCount,
      gamePlayers: Array.isArray(parsed.gamePlayers) ? parsed.gamePlayers : [],
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

export function startGame() {
  const active = state.setupPlayers.slice(0, state.playerCount)
  const gamePlayers = active.map(freshPlayerModel)
  setState({ ...state, screen: 'game', gamePlayers })
}

export function resetGame() {
  const active = state.setupPlayers.slice(0, state.playerCount)
  const gamePlayers = active.map(freshPlayerModel)
  setState({ ...state, gamePlayers })
}

export function backToSetup() {
  setState({ ...state, screen: 'setup', gamePlayers: [] })
}

export function incrementLife(playerId: number, delta: number, segmentIndex = 0) {
  const gamePlayers = state.gamePlayers.map((p) => {
    if (p.id !== playerId) return p
    if (segmentIndex < 0 || segmentIndex >= p.lifeSegments.length) return p
    const max = p.lifeSegmentMaximums[segmentIndex]
    const segs = [...p.lifeSegments]
    segs[segmentIndex] = Math.max(0, Math.min(max, segs[segmentIndex] + delta))
    return { ...p, lifeSegments: segs }
  })
  setState({ ...state, gamePlayers })
}

export function tapExtraButton(playerId: number) {
  const gamePlayers = state.gamePlayers.map((p) => {
    if (p.id !== playerId || p.extraButtonValue === null) return p
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
  setState({ ...state, gamePlayers })
}
