import { describe, expect, it } from 'vitest'
import { clamp01, degreesToRadians, durationForSpeed, foldProgressToAngle } from './foldMath'

describe('foldMath', () => {
  it('limits fold progress to the valid interval', () => {
    expect(clamp01(-0.2)).toBe(0)
    expect(clamp01(0.4)).toBe(0.4)
    expect(clamp01(1.4)).toBe(1)
  })

  it('converts degrees to radians', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI)
    expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2)
  })

  it('maps a valley fold from progress to a positive hinge angle', () => {
    expect(foldProgressToAngle(0.5)).toBeCloseTo(Math.PI / 2)
    expect(foldProgressToAngle(1)).toBeCloseTo(Math.PI)
  })

  it('uses a negative hinge angle for mountain folds', () => {
    expect(foldProgressToAngle(1, 180, 'mountain')).toBeCloseTo(-Math.PI)
  })

  it('shortens animation duration as playback speed increases', () => {
    expect(durationForSpeed(1.6, 0.5)).toBeCloseTo(3.2)
    expect(durationForSpeed(1.6, 2)).toBeCloseTo(0.8)
  })
})
