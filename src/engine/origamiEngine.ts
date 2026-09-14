import { degreesToRadians } from './foldMath'
import type {
  CreaseDefinition,
  FoldDirection,
  OrigamiModelDefinition,
  Point3D,
  TutorialStep,
} from './types'

export type FoldAngles = Record<string, number>
export interface ResolvedCreaseAxis {
  start: Point3D
  end: Point3D
}

export function createInitialFoldAngles(model: OrigamiModelDefinition): FoldAngles {
  return Object.fromEntries(model.creases.map((crease) => [crease.id, 0]))
}

export function resolveFoldAngles(
  model: OrigamiModelDefinition,
  steps: readonly TutorialStep[],
  stepIndex: number,
): FoldAngles {
  const angles = createInitialFoldAngles(model)
  const finalIndex = Math.min(Math.max(stepIndex, -1), steps.length - 1)

  for (let index = 0; index <= finalIndex; index += 1) {
    const fold = steps[index].fold
    if (fold && fold.creaseId in angles) angles[fold.creaseId] = fold.angle
  }

  return angles
}

export function resolveReplayAngles(
  model: OrigamiModelDefinition,
  steps: readonly TutorialStep[],
  stepIndex: number,
): FoldAngles {
  for (let index = Math.min(stepIndex, steps.length - 1); index >= 0; index -= 1) {
    if (steps[index].fold) return resolveFoldAngles(model, steps, index - 1)
  }

  return createInitialFoldAngles(model)
}

export function canReplayFold(steps: readonly TutorialStep[], stepIndex: number): boolean {
  return steps.slice(0, stepIndex + 1).some((step) => Boolean(step.fold))
}

export function creasesForFace(model: OrigamiModelDefinition, faceId: string): CreaseDefinition[] {
  return model.foldOrder
    .map((creaseId) => model.creases.find((crease) => crease.id === creaseId))
    .filter((crease): crease is CreaseDefinition => Boolean(crease?.affectedFaces.includes(faceId)))
}

export function signedFoldAngle(
  degrees: number,
  direction: FoldDirection,
): number {
  const sign = direction === 'valley' ? 1 : -1
  return degreesToRadians(degrees) * sign
}

export function rotatePointAroundAxis(
  point: Point3D,
  axis: ResolvedCreaseAxis,
  angle: number,
): Point3D {
  const [px, py, pz] = point
  const [sx, sy, sz] = axis.start
  const [ex, ey, ez] = axis.end
  const axisLength = Math.hypot(ex - sx, ey - sy, ez - sz)
  if (axisLength < 1e-8) return point

  const kx = (ex - sx) / axisLength
  const ky = (ey - sy) / axisLength
  const kz = (ez - sz) / axisLength
  const vx = px - sx
  const vy = py - sy
  const vz = pz - sz
  const cosine = Math.cos(angle)
  const sine = Math.sin(angle)
  const dot = kx * vx + ky * vy + kz * vz

  return [
    sx + vx * cosine + (ky * vz - kz * vy) * sine + kx * dot * (1 - cosine),
    sy + vy * cosine + (kz * vx - kx * vz) * sine + ky * dot * (1 - cosine),
    sz + vz * cosine + (kx * vy - ky * vx) * sine + kz * dot * (1 - cosine),
  ]
}

export function resolveCreaseAxes(
  model: OrigamiModelDefinition,
  angles: FoldAngles,
): Record<string, ResolvedCreaseAxis> {
  const resolved: Record<string, ResolvedCreaseAxis> = {}

  model.foldOrder.forEach((creaseId, creaseIndex) => {
    const crease = model.creases.find((candidate) => candidate.id === creaseId)
    if (!crease) return

    let start: Point3D = [crease.start[0], crease.start[1], 0]
    let end: Point3D = [crease.end[0], crease.end[1], 0]
    const referenceFace = crease.referenceFace ?? crease.affectedFaces[0]

    model.foldOrder.slice(0, creaseIndex).forEach((previousId) => {
      const previousCrease = model.creases.find((candidate) => candidate.id === previousId)
      const previousAxis = resolved[previousId]
      if (!previousCrease || !previousAxis || !previousCrease.affectedFaces.includes(referenceFace)) return

      const angle = signedFoldAngle(angles[previousId] ?? 0, previousCrease.direction)
      start = rotatePointAroundAxis(start, previousAxis, angle)
      end = rotatePointAroundAxis(end, previousAxis, angle)
    })

    resolved[creaseId] = { start, end }
  })

  return resolved
}

export function transformPointForFace(
  model: OrigamiModelDefinition,
  faceId: string,
  point: Point3D,
  angles: FoldAngles,
): Point3D {
  const axes = resolveCreaseAxes(model, angles)

  return creasesForFace(model, faceId).reduce((transformedPoint, crease) => {
    const angle = signedFoldAngle(angles[crease.id] ?? 0, crease.direction)
    return rotatePointAroundAxis(transformedPoint, axes[crease.id], angle)
  }, point)
}

export function validateOrigamiModel(model: OrigamiModelDefinition): string[] {
  const errors: string[] = []
  const faceIds = new Set(model.faces.map((face) => face.id))
  const creaseIds = new Set(model.creases.map((crease) => crease.id))

  if (faceIds.size !== model.faces.length) errors.push('Os IDs das faces devem ser únicos.')
  if (creaseIds.size !== model.creases.length) errors.push('Os IDs dos vincos devem ser únicos.')

  model.faces.forEach((face) => {
    if (face.vertices.length < 3) errors.push(`A face ${face.id} precisa de ao menos três vértices.`)
  })

  model.creases.forEach((crease) => {
    if (crease.start[0] === crease.end[0] && crease.start[1] === crease.end[1]) {
      errors.push(`O vinco ${crease.id} precisa ter comprimento maior que zero.`)
    }
    crease.affectedFaces.forEach((faceId) => {
      if (!faceIds.has(faceId)) errors.push(`O vinco ${crease.id} referencia a face inexistente ${faceId}.`)
    })
    if (crease.referenceFace && !faceIds.has(crease.referenceFace)) {
      errors.push(`O vinco ${crease.id} possui uma face de referência inexistente.`)
    }
  })

  model.foldOrder.forEach((creaseId) => {
    if (!creaseIds.has(creaseId)) errors.push(`A ordem de dobras referencia o vinco inexistente ${creaseId}.`)
  })

  return errors
}
