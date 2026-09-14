export type FoldDirection = 'mountain' | 'valley'
export type PlaybackSpeed = 0.5 | 1 | 1.5 | 2

export type Point2D = readonly [number, number]
export type Point3D = readonly [number, number, number]

export interface PaperFace {
  id: string
  vertices: readonly Point2D[]
  color?: string
  renderOrder?: number
}

export interface CreaseDefinition {
  id: string
  label: string
  start: Point2D
  end: Point2D
  affectedFaces: readonly string[]
  direction: FoldDirection
  referenceFace?: string
}

export interface FaceDecoration {
  id: string
  faceId: string
  kind: 'circle'
  position: Point2D
  size: number
  color: string
  surface?: 'front' | 'back'
  showFromStep?: number
}

export interface OrigamiModelDefinition {
  id: string
  name: string
  faces: readonly PaperFace[]
  creases: readonly CreaseDefinition[]
  foldOrder: readonly string[]
  decorations?: readonly FaceDecoration[]
  source?: {
    format: 'FOLD'
    spec?: number
    title?: string
  }
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
