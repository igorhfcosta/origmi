import { degreesToRadians } from './foldMath'
import type {
  CreaseDefinition,
  FoldDirection,
  OrigamiModelDefinition,
  TutorialStep,
} from './types'

export type FoldAngles = Record<string, number>

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
  })

  model.foldOrder.forEach((creaseId) => {
    if (!creaseIds.has(creaseId)) errors.push(`A ordem de dobras referencia o vinco inexistente ${creaseId}.`)
  })

  return errors
}
