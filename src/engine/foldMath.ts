import type { FoldDirection } from './types'

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

export function foldProgressToAngle(
  progress: number,
  maxDegrees = 180,
  direction: FoldDirection = 'valley',
): number {
  const sign = direction === 'valley' ? 1 : -1
  return degreesToRadians(maxDegrees) * clamp01(progress) * sign
}

export function durationForSpeed(baseDuration: number, speed: number): number {
  if (baseDuration <= 0) return 0
  if (speed <= 0) return baseDuration
  return baseDuration / speed
}
