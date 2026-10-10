import { degreesToRadians } from './foldMath'
import type {
  CreaseDefinition,
  FoldDirection,
  FoldPhase,
  SymmetricVertexMechanism,
  VertexAction,
  OrigamiModelDefinition,
  Point3D,
  TutorialStep,
} from './types'

export type FoldAngles = Record<string, number>

export function resolveFinishState(steps: readonly TutorialStep[], stepIndex: number): boolean | undefined {
  return steps.some((step) => step.finish) ? Boolean(steps[stepIndex]?.finish) : undefined
}
export interface ResolvedCreaseAxis {
  start: Point3D
  end: Point3D
}

export function createInitialFoldAngles(model: OrigamiModelDefinition): FoldAngles {
  return Object.fromEntries(model.creases.map((crease) => [crease.id, 0]))
}

export function phasesForStep(step?: TutorialStep): readonly FoldPhase[] {
  if (!step) return []
  if (step.phases) return step.phases
  return step.fold ? [{ label: step.title, folds: [step.fold], duration: step.fold.duration }] : []
}

/** The constrained paths keep all four shared rays joined, including the closing seam. */
export function resolveVertexAngles(
  mechanism: SymmetricVertexMechanism,
  action: Pick<VertexAction, 'mode' | 'angle'>,
): [number, number, number] {
  const angle = Math.min(180, Math.max(0, action.angle))
  if (action.mode === 'book') return [angle, 0, angle]
  if (action.mode === 'squash') return [180, angle, 180]
  const follower = angle >= 180 ? 180 : 2 * Math.atan(
    Math.tan(degreesToRadians(angle) / 2) / Math.cos(degreesToRadians(mechanism.sectorAngle)),
  ) * 180 / Math.PI
  const sign = action.mode === 'inside-reverse' ? 1 : -1
  return [sign * angle, -sign * follower, -sign * angle]
}

export function resolvePhaseAngles(
  model: OrigamiModelDefinition,
  phase: FoldPhase,
  from: FoldAngles,
  progress = 1,
): FoldAngles {
  const t = Math.max(0, Math.min(1, progress))
  const result = { ...from }
  for (const fold of phase.folds ?? []) {
    const crease = model.creases.find((candidate) => candidate.id === fold.creaseId)
    if (!crease) continue
    const target = fold.angle * (fold.direction && fold.direction !== crease.direction ? -1 : 1)
    result[crease.id] = (from[crease.id] ?? 0) + (target - (from[crease.id] ?? 0)) * t
  }
  if (phase.vertex) {
    const mechanism = model.mechanisms?.find((candidate) => candidate.id === phase.vertex?.mechanismId)
    if (mechanism) {
      const [driver, pocket] = mechanism.creases
      const pocketDirection = model.creases.find((c) => c.id === pocket)?.direction === 'mountain' ? -1 : 1
      const start = phase.vertex.mode === 'squash' ? (from[pocket] ?? 0) * pocketDirection : Math.abs(from[driver] ?? 0)
      const angle = start + (phase.vertex.angle - start) * t
      resolveVertexAngles(mechanism, { ...phase.vertex, angle }).forEach((value, index) => {
        const crease = model.creases.find((candidate) => candidate.id === mechanism.creases[index])!
        result[crease.id] = value * (crease.direction === 'valley' ? 1 : -1)
      })
    }
  }
  return result
}

export function resolveFoldAngles(
  model: OrigamiModelDefinition,
  steps: readonly TutorialStep[],
  stepIndex: number,
): FoldAngles {
  let angles = createInitialFoldAngles(model)
  const finalIndex = Math.min(Math.max(stepIndex, -1), steps.length - 1)
  for (let index = 0; index <= finalIndex; index += 1) {
    for (const phase of phasesForStep(steps[index])) angles = resolvePhaseAngles(model, phase, angles)
  }
  return angles
}

export function replayActionIndex(steps: readonly TutorialStep[], stepIndex: number): number {
  if (steps[stepIndex]?.finish) return -1
  for (let index = Math.min(stepIndex, steps.length - 1); index >= 0; index -= 1) {
    if (phasesForStep(steps[index]).length) return index
  }
  return -1
}

export function resolveReplayAngles(model: OrigamiModelDefinition, steps: readonly TutorialStep[], stepIndex: number): FoldAngles {
  const index = replayActionIndex(steps, stepIndex)
  return resolveFoldAngles(model, steps, index < 0 ? stepIndex : index - 1)
}

export function canReplayFold(steps: readonly TutorialStep[], stepIndex: number): boolean {
  return Boolean(steps[stepIndex]?.finish) || replayActionIndex(steps, stepIndex) >= 0
}

export function resolveMovingFaceIds(model: OrigamiModelDefinition, steps: readonly TutorialStep[], stepIndex: number): readonly string[] {
  const moving = new Set<string>()
  let angles = resolveFoldAngles(model, steps, stepIndex - 1)
  for (const phase of phasesForStep(steps[stepIndex])) {
    if (!phase.vertex) {
      for (const fold of phase.folds ?? []) {
        const crease = model.creases.find((candidate) => candidate.id === fold.creaseId)
        const target = resolvePhaseAngles(model, phase, angles)[fold.creaseId]
        if (Math.abs(target - (angles[fold.creaseId] ?? 0)) > 1e-7) crease?.affectedFaces.forEach((id) => moving.add(id))
      }
    } else {
      for (const progress of [0.5, 1]) {
        const sampled = resolvePhaseAngles(model, phase, angles, progress)
        for (const face of model.faces) {
          if (face.vertices.some(([x, y]) => {
            const before = transformPointForFace(model, face.id, [x, y, 0], angles)
            const after = transformPointForFace(model, face.id, [x, y, 0], sampled)
            return Math.hypot(...after.map((v, i) => v - before[i])) > 1e-6
          })) moving.add(face.id)
        }
      }
    }
    angles = resolvePhaseAngles(model, phase, angles)
  }
  return [...moving]
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
  return transformPointWithAxes(model, faceId, point, angles, axes)
}

export function transformPointWithAxes(
  model: OrigamiModelDefinition, faceId: string, point: Point3D, angles: FoldAngles,
  axes: Record<string, ResolvedCreaseAxis>,
): Point3D {
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

