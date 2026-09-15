import { describe, expect, it } from 'vitest'
import { validateOrigamiModel } from '../engine/origamiEngine'
import { origamiCatalog } from './catalog'

describe('origamiCatalog', () => {
  it('uses unique catalog and model ids', () => {
    expect(new Set(origamiCatalog.map((item) => item.id)).size).toBe(origamiCatalog.length)
    expect(new Set(origamiCatalog.map((item) => item.model.id)).size).toBe(origamiCatalog.length)
  })

  it('keeps every published model valid', () => {
    origamiCatalog.forEach((item) => {
      expect(validateOrigamiModel(item.model)).toEqual([])
    })
  })

  it('gives every published tutorial a smart camera pose for every step', () => {
    origamiCatalog.forEach((item) => {
      expect(item.steps.length).toBeGreaterThan(1)
      item.steps.forEach((step) => {
        expect(step.camera).toBeDefined()
        const camera = step.camera!
        const distance = Math.hypot(
          camera.position[0] - camera.target[0],
          camera.position[1] - camera.target[1],
          camera.position[2] - camera.target[2],
        )
        expect(distance).toBeGreaterThan(1)
        expect(camera.fov ?? 39).toBeGreaterThanOrEqual(25)
        expect(camera.fov ?? 39).toBeLessThanOrEqual(60)
      })
    })
  })
})
