import { beforeEach, describe, expect, it } from 'vitest'
import { useTutorialStore } from './useTutorialStore'

beforeEach(() => {
  useTutorialStore.getState().reset()
})

describe('useTutorialStore', () => {
  it('moves through the tutorial without passing the final step', () => {
    const store = useTutorialStore.getState()
    store.nextStep()
    store.nextStep()
    store.nextStep()
    store.nextStep()
    store.nextStep()
    store.nextStep()
    expect(useTutorialStore.getState().currentStep).toBe(4)
  })

  it('does not move before the first step', () => {
    useTutorialStore.getState().previousStep()
    expect(useTutorialStore.getState().currentStep).toBe(0)
  })

  it('increments replay token without changing the current step', () => {
    useTutorialStore.getState().nextStep()
    useTutorialStore.getState().replayStep()
    expect(useTutorialStore.getState().currentStep).toBe(1)
    expect(useTutorialStore.getState().replayToken).toBe(1)
  })

  it('stores playback speed and math mode', () => {
    useTutorialStore.getState().setSpeed(2)
    useTutorialStore.getState().toggleMathMode()
    expect(useTutorialStore.getState().speed).toBe(2)
    expect(useTutorialStore.getState().mathMode).toBe(true)
  })
})
