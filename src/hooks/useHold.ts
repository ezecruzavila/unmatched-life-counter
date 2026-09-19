import { useCallback, useEffect, useRef } from 'react'

/**
 * Timing table ported from Android's HoldableButton: as the button is held, the
 * interval between repeated fires ramps from 600ms down to 10ms. Each entry is
 * [incrementCount, intervalMs]; the interval is linearly interpolated between
 * entries and clamped to the last one.
 */
const HOLD_INTERVALS: Array<[number, number]> = [
  [0, 600],
  [6, 400],
  [15, 200],
  [30, 150],
  [100, 30],
  [500, 10],
]
const MAX_HOLD_INTERVAL = 600
/** Movement (px) beyond which a press is treated as a scroll/cancel, not a tap. */
const MAX_MOVE_DISTANCE = 24

function intervalForIncrement(increments: number): number {
  for (let i = 0; i < HOLD_INTERVALS.length; i++) {
    if (i === HOLD_INTERVALS.length - 1) return HOLD_INTERVALS[i][1]
    const [tick, ms] = HOLD_INTERVALS[i]
    const [nextTick, nextMs] = HOLD_INTERVALS[i + 1]
    if (increments >= tick && increments < nextTick) {
      const t = (increments - tick) / (nextTick - tick)
      return Math.round(ms + t * (nextMs - ms))
    }
  }
  return MAX_HOLD_INTERVAL
}

export interface HoldHandlers {
  onPointerDown: (e: React.PointerEvent) => void
  onPointerUp: (e: React.PointerEvent) => void
  onPointerMove: (e: React.PointerEvent) => void
  onPointerCancel: (e: React.PointerEvent) => void
}

/**
 * Press-and-hold gesture. Fires `onStep` once on a quick tap, then repeatedly
 * (with accelerating cadence) while the pointer stays down and roughly still.
 */
export function useHold(onStep: () => void): HoldHandlers {
  const onStepRef = useRef(onStep)
  onStepRef.current = onStep

  const timer = useRef<number | null>(null)
  const increments = useRef(0)
  const holdFired = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const startTime = useRef(0)

  const clear = useCallback(() => {
    if (timer.current !== null) {
      window.clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => clear, [clear])

  const scheduleNext = useCallback(() => {
    const ms = intervalForIncrement(increments.current)
    timer.current = window.setTimeout(() => {
      increments.current += 1
      holdFired.current = true
      onStepRef.current()
      scheduleNext()
    }, ms)
  }, [])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
      startPos.current = { x: e.clientX, y: e.clientY }
      startTime.current = e.timeStamp
      increments.current = 0
      holdFired.current = false
      clear()
      scheduleNext()
    },
    [clear, scheduleNext],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      if (Math.hypot(dx, dy) > MAX_MOVE_DISTANCE) clear()
    },
    [clear],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      clear()
      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      const moved = Math.hypot(dx, dy) > MAX_MOVE_DISTANCE
      const quick = e.timeStamp - startTime.current < MAX_HOLD_INTERVAL
      // Treat as a single tap only if the hold repeater never fired and the
      // pointer stayed put — matches HoldableButton's click detection.
      if (!holdFired.current && !moved && quick) {
        onStepRef.current()
      }
    },
    [clear],
  )

  const onPointerCancel = useCallback(() => clear(), [clear])

  return { onPointerDown, onPointerUp, onPointerMove, onPointerCancel }
}
