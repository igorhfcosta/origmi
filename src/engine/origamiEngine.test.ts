import { describe, expect, it } from 'vitest'
import { squarePracticeModel } from '../data/origamiModel'
import { tutorialSteps } from '../data/tutorial'
import {
  canReplayFold,
  creasesForFace,
  resolveFoldAngles,
  resolveReplayAngles,
  signedFoldAngle,
  validateOrigamiModel,
} from './origamiEngine'

describe('origamiEngine', () => {
  it('starts with every crease open', () => {
    expect(resolveFoldAngles(squarePracticeModel, tutorialSteps, 0)).toEqual({
      'vertical-center': 0,
      'horizontal-left': 0,
    })
  })

  it('keeps previous folds while applying the next one', () => {
    expect(resolveFoldAngles(squarePracticeModel, tutorialSteps, 3)).toEqual({
      'vertical-center': 180,
      'horizontal-left': 180,
    })
  })

  it('replays the most recent fold from its previous accumulated state', () => {
    expect(resolveReplayAngles(squarePracticeModel, tutorialSteps, 4)).toEqual({
      'vertical-center': 180,
      'horizontal-left': 0,
    })
    expect(resolveReplayAngles(squarePracticeModel, tutorialSteps, 2)).toEqual({
      'vertical-center': 0,
      'horizontal-left': 0,
    })
  })

  it('finds the ordered hinges that affect each face', () => {
    expect(creasesForFace(squarePracticeModel, 'top-right').map((crease) => crease.id)).toEqual([
      'vertical-center',
      'horizontal-left',
    ])
    expect(creasesForFace(squarePracticeModel, 'bottom-left')).toEqual([])
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
  })
})
