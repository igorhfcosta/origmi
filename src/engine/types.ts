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
  mechanisms?: readonly SymmetricVertexMechanism[]
  source?: {
    format: 'FOLD'
    spec?: number
    title?: string
  }
}

/** Four panels with sector angles α, α, 180°−α, 180°−α. */
export interface SymmetricVertexMechanism {
  id: string
  label: string
  creases: readonly [string, string, string]
  sectorAngle: number
}

export type VertexMode = 'book' | 'squash' | 'inside-reverse' | 'outside-reverse'

export interface VertexAction {
  mechanismId: string
  mode: VertexMode
  angle: number
}

export interface FoldPhase {
  label: string
  duration?: number
  folds?: readonly FoldAction[]
  vertex?: VertexAction
}

interface AnnotationBase {
  id: string
  faceId: string
  label: string
  color?: string
}

export type MathAnnotation =
  | (AnnotationBase & { kind: 'point'; at: Point2D })
  | (AnnotationBase & { kind: 'segment'; start: Point2D; end: Point2D; dashed?: boolean })
  | (AnnotationBase & { kind: 'angle'; vertex: Point2D; from: Point2D; to: Point2D })
  | (AnnotationBase & { kind: 'area' })

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
  faceId?: string
}

export interface CameraPose {
  position: Point3D
  target: Point3D
  fov?: number
  duration?: number
}

export interface TutorialStep {
  finish?: boolean
  id: string
  eyebrow: string
  title: string
  instruction: string
  showGuide: boolean
  fold?: FoldAction
  phases?: readonly FoldPhase[]
  guide?: FoldGuide
  mathNote?: string
  mathQuestion?: string
  mathAnswer?: string
  annotations?: readonly MathAnnotation[]
  camera?: CameraPose
}

