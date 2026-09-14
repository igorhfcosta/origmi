import { describe, expect, it } from 'vitest'
import { dogModel, squarePracticeModel } from '../data/origamiModel'
import { squarePracticeSteps, tutorialSteps } from '../data/tutorial'
import {
  canReplayFold,
  creasesForFace,
  resolveCreaseAxes,
  resolveFoldAngles,
  resolveFinishState,
  resolveReplayAngles,
  signedFoldAngle,
  transformPointForFace,
  validateOrigamiModel,
} from './origamiEngine'

describe('origamiEngine', () => {
  it('gives every dog step after preparation an action', () => {
    expect(tutorialSteps).toHaveLength(5)
    expect(tutorialSteps.slice(1).every((step) => Boolean(step.fold || step.finish))).toBe(true)
    expect(tutorialSteps.slice(1, 4).every((step) => Boolean(step.fold))).toBe(true)
  })

  it('keeps the dog unpainted until finishing, including when going back', () => {
    expect([0, 1, 2, 3, 4, 3, 0].map((index) => resolveFinishState(tutorialSteps, index)))
      .toEqual([false, false, false, false, true, false, false])
  })

  it('replays only the finish without unfolding the ears', () => {
    const finalIndex = tutorialSteps.length - 1
    expect(resolveReplayAngles(dogModel, tutorialSteps, finalIndex))
      .toEqual(resolveFoldAngles(dogModel, tutorialSteps, finalIndex))
    expect(resolveReplayAngles(dogModel, tutorialSteps, finalIndex)['right-ear']).toBe(180)
  })

  it('preserves the appearance of tutorials without a finishing stage', () => {
    expect(resolveFinishState(squarePracticeSteps, 0)).toBeUndefined()
  })
  const samples = [0, 30, 60, 90, 120, 150, 180]
  for (const creaseId of ['base-diagonal', 'left-ear', 'right-ear']) {
    it.each(samples)(`keeps every shared dog vertex joined during ${creaseId} at %s degrees`, (angle) => {
      const angles = {
        'base-diagonal': creaseId === 'base-diagonal' ? angle : 180,
        'left-ear': creaseId === 'left-ear' ? angle : creaseId === 'right-ear' ? 180 : 0,
        'right-ear': creaseId === 'right-ear' ? angle : 0,
      }
      const positions = new Map<string, readonly number[]>()
      for (const face of dogModel.faces) {
        for (const [x, y] of face.vertices) {
          const key = `${x},${y}`
          const point = transformPointForFace(dogModel, face.id, [x, y, 0], angles)
          const previous = positions.get(key)
          if (previous) point.forEach((value, index) => expect(value).toBeCloseTo(previous[index], 8))
          else positions.set(key, point)
        }
      }
    })
  }

  it('partitions one complete square without changing its area', () => {
    const area = dogModel.faces.reduce((sum, face) => sum + Math.abs(face.vertices.reduce((cross, [x, y], i) => {
      const next = face.vertices[(i + 1) % face.vertices.length]
      return cross + x * next[1] - y * next[0]
    }, 0)) / 2, 0)
    expect(area).toBeCloseTo(8, 8)
  })

  it('starts with every crease open', () => {
    expect(resolveFoldAngles(squarePracticeModel, squarePracticeSteps, 0)).toEqual({
      'vertical-center': 0,
      'horizontal-left': 0,
    })
  })

  it('keeps previous folds while applying the next one', () => {
    expect(resolveFoldAngles(squarePracticeModel, squarePracticeSteps, 3)).toEqual({
      'vertical-center': 180,
      'horizontal-left': 180,
    })
  })

  it('replays the most recent fold from its previous accumulated state', () => {
    expect(resolveReplayAngles(squarePracticeModel, squarePracticeSteps, 4)).toEqual({
      'vertical-center': 180,
      'horizontal-left': 0,
    })
    expect(resolveReplayAngles(squarePracticeModel, squarePracticeSteps, 2)).toEqual({
      'vertical-center': 0,
      'horizontal-left': 0,
    })
  })

  it('finds the ordered hinges that affect each face', () => {
    expect(creasesForFace(squarePracticeModel, 'face-3').map((crease) => crease.id)).toEqual([
      'vertical-center',
      'horizontal-left',
    ])
    expect(creasesForFace(squarePracticeModel, 'face-0')).toEqual([])
  })

  it('converts valley and mountain angles with opposite signs', () => {
    expect(signedFoldAngle(90, 'valley')).toBeCloseTo(Math.PI / 2)
    expect(signedFoldAngle(90, 'mountain')).toBeCloseTo(-Math.PI / 2)
  })

  it('only enables replay after a fold exists in the timeline', () => {
    expect(canReplayFold(tutorialSteps, 0)).toBe(false)
    expect(canReplayFold(tutorialSteps, 1)).toBe(true)
    expect(canReplayFold(tutorialSteps, 4)).toBe(true)
  })

  it('validates the model references', () => {
    expect(validateOrigamiModel(squarePracticeModel)).toEqual([])
    expect(validateOrigamiModel(dogModel)).toEqual([])
  })

  it('moves later dog crease axes with the already folded reference face', () => {
    const angles = resolveFoldAngles(dogModel, tutorialSteps, 2)
    const axes = resolveCreaseAxes(dogModel, angles)

    expect(axes['left-ear'].start[0]).toBeCloseTo(-0.194)
    expect(axes['left-ear'].start[1]).toBeCloseTo(0)
    expect(axes['left-ear'].start[2]).toBeCloseTo(0)
    expect(axes['left-ear'].end[0]).toBeCloseTo(-1.372)
    expect(axes['left-ear'].end[1]).toBeCloseTo(-0.628)
    expect(axes['left-ear'].end[2]).toBeCloseTo(0)
  })

  it('keeps the two dog ear axes symmetric after the base fold', () => {
    const angles = resolveFoldAngles(dogModel, tutorialSteps, 2)
    const axes = resolveCreaseAxes(dogModel, angles)

    expect(axes['left-ear'].end[0]).toBeCloseTo(-axes['right-ear'].end[0])
    expect(axes['left-ear'].end[1]).toBeCloseTo(axes['right-ear'].end[1])
  })

  it('lands both dog ears in symmetric downward positions', () => {
    const finalAngles = resolveFoldAngles(dogModel, tutorialSteps, 5)
    const leftTip = transformPointForFace(dogModel, 'face-1', [-2, 0, 0], finalAngles)
    const rightTip = transformPointForFace(dogModel, 'face-3', [2, 0, 0], finalAngles)

    expect(leftTip[0]).toBeCloseTo(-rightTip[0])
    expect(leftTip[1]).toBeCloseTo(rightTip[1])
    expect(leftTip[1]).toBeLessThan(-1.4)
    expect(leftTip[2]).toBeCloseTo(0)
    expect(rightTip[2]).toBeCloseTo(0)
  })

  it('maps the top corner onto the bottom corner in the first dog fold', () => {
    const baseFoldAngles = resolveFoldAngles(dogModel, tutorialSteps, 1)
    const foldedTop = transformPointForFace(dogModel, 'face-2', [0, 2, 0], baseFoldAngles)

    expect(foldedTop[0]).toBeCloseTo(0)
    expect(foldedTop[1]).toBeCloseTo(-2)
    expect(foldedTop[2]).toBeCloseTo(0)
  })
})
