import { create } from 'zustand'
import type { PlaybackSpeed } from '../engine/types'
import { tutorialSteps } from '../data/tutorial'

interface TutorialState {
  currentStep: number
  speed: PlaybackSpeed
  replayToken: number
  mathMode: boolean
  nextStep: () => void
  previousStep: () => void
  replayStep: () => void
  setSpeed: (speed: PlaybackSpeed) => void
  toggleMathMode: () => void
  reset: () => void
}

const lastStep = tutorialSteps.length - 1

export const useTutorialStore = create<TutorialState>((set) => ({
  currentStep: 0,
  speed: 1,
  replayToken: 0,
  mathMode: false,
  nextStep: () => set((state) => ({ currentStep: Math.min(lastStep, state.currentStep + 1) })),
  previousStep: () => set((state) => ({ currentStep: Math.max(0, state.currentStep - 1) })),
  replayStep: () => set((state) => ({ replayToken: state.replayToken + 1 })),
  setSpeed: (speed) => set({ speed }),
  toggleMathMode: () => set((state) => ({ mathMode: !state.mathMode })),
  reset: () => set({ currentStep: 0, speed: 1, replayToken: 0, mathMode: false }),
}))
