export type FoldDirection = 'mountain' | 'valley'
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2

export interface TutorialStep {
  id: string
  eyebrow: string
  title: string
  instruction: string
  targetFold: number
  showGuide: boolean
  foldDirection?: FoldDirection
  mathNote?: string
}
