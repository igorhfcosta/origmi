export type FoldDirection = 'mountain' | 'valley'
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2

export type Point2D = readonly [number, number]

export interface PaperFace {
  id: string
  vertices: readonly Point2D[]
  color?: string
}

export interface CreaseDefinition {
  id: string
  label: string
  start: Point2D
  end: Point2D
  affectedFaces: readonly string[]
  direction: FoldDirection
}

export interface OrigamiModelDefinition {
  id: string
  name: string
  faces: readonly PaperFace[]
  creases: readonly CreaseDefinition[]
  foldOrder: readonly string[]
}

export interface FoldAction {
  creaseId: string
  angle: number
  direction?: FoldDirection
  duration?: number
}

export interface FoldGuide {
  creaseId: string
  arrowFrom: Point2D
  arrowTo: Point2D
}

export interface TutorialStep {
  id: string
  eyebrow: string
  title: string
  instruction: string
  showGuide: boolean
  fold?: FoldAction
  guide?: FoldGuide
  mathNote?: string
}
