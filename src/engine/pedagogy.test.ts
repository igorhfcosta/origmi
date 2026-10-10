import { describe, expect, it } from 'vitest'
import { origamiCatalog } from '../data/catalog'
import { heartModel } from '../data/heartModel'
import { heartSteps } from '../data/heartTutorial'
import { dogModel, squarePracticeModel } from '../data/origamiModel'
import { squarePracticeSteps, tutorialSteps } from '../data/tutorial'
import { vertexLabModel } from '../data/vertexLab'
import { phasesForStep, resolveFoldAngles, resolveMovingFaceIds, resolvePhaseAngles, resolveReplayAngles, resolveVertexAngles, transformPointForFace } from './origamiEngine'
import { parseTutorial, serializeTutorial, sharedVertexError, validateTutorialSteps } from './tutorialDocument'

describe('pedagogical content and coordinated motion', () => {
  it('highlights the existing moving faces without copying ids into steps', () => {
    expect(resolveMovingFaceIds(squarePracticeModel, squarePracticeSteps, 1)).toEqual(['face-1', 'face-3'])
    expect(resolveMovingFaceIds(squarePracticeModel, squarePracticeSteps, 3)).toEqual(['face-2', 'face-3'])
    expect(resolveMovingFaceIds(dogModel, tutorialSteps, 0)).toEqual([])
    expect(resolveMovingFaceIds(dogModel, tutorialSteps, 4)).toEqual([])
  })
  it.each(origamiCatalog.map((item) => [item.id, item] as const))('%s has a valid, continuous tutorial', (_id, item) => {
    expect(validateTutorialSteps(item.model, item.steps)).toEqual([])
    let from = resolveFoldAngles(item.model, item.steps, -1)
    for (const step of item.steps) for (const phase of phasesForStep(step)) {
      for (const t of [0, .01, .1, .25, .5, .75, .9, .99, 1]) expect(sharedVertexError(item.model, resolvePhaseAngles(item.model, phase, from, t))).toBeLessThan(1e-6)
      from = resolvePhaseAngles(item.model, phase, from)
    }
  })
  it('preserves the material area of the heart and produces a symmetric final outline', () => {
    const area = heartModel.faces.reduce((sum, face) => sum + Math.abs(face.vertices.reduce((v, [x, y], i) => {
      const next = face.vertices[(i + 1) % face.vertices.length]
      return v + x * next[1] - y * next[0]
    }, 0)) / 2, 0)
    expect(area).toBeCloseTo(8)
    const angles = resolveFoldAngles(heartModel, heartSteps, heartSteps.length - 1)
    const points = heartModel.faces.flatMap((face) => face.vertices.map(([x, y]) => transformPointForFace(heartModel, face.id, [x, y, 0], angles)))
    expect(Math.min(...points.map((p) => p[0]))).toBeCloseTo(-Math.max(...points.map((p) => p[0])))
    expect(points.every((p) => Math.abs(p[2]) < 1e-6)).toBe(true)
  })
  it('does not highlight the stationary support panel in a coordinated book fold', () => {
    const item = origamiCatalog.find((item) => item.id === 'laboratorio-dobras')!
    expect(resolveMovingFaceIds(item.model, item.steps, 1)).not.toContain('face-3')
    expect(resolveMovingFaceIds(item.model, item.steps, 1)).toEqual(['face-1', 'face-2'])
  })
  it('uses nonlinear followers and opposite routes for inside/outside reversals', () => {
    const mechanism = vertexLabModel.mechanisms[0]
    const inside = resolveVertexAngles(mechanism, { mode: 'inside-reverse', angle: 90 })
    const outside = resolveVertexAngles(mechanism, { mode: 'outside-reverse', angle: 90 })
    expect(inside[1]).toBeCloseTo(-109.4712206)
    expect(outside).toEqual(inside.map((angle) => -angle))
  })
  it('replays the entire compound step from its preparation', () => {
    const item = origamiCatalog.find((item) => item.id === 'laboratorio-dobras')!
    expect(resolveReplayAngles(item.model, item.steps, 6)).toEqual(resolveFoldAngles(item.model, item.steps, 5))
  })
})

describe('tutorial document', () => {
  const item = origamiCatalog[0]
  const document = { version: 1 as const, catalogId: item.id, title: item.title, steps: structuredClone([...item.steps]) }
  it('round-trips exported steps, math marks, cameras and actions', () => {
    expect(parseTutorial(serializeTutorial(document), origamiCatalog)).toEqual(document)
  })
  it.each(['{', '{}', '{"version":2}', '{"version":1,"catalogId":"unknown","title":"A","steps":[]}'])('rejects malformed or unsupported documents: %s', (source) => {
    expect(() => parseTutorial(source, origamiCatalog)).toThrow()
  })
  it('rejects bad model references, non-finite cameras and duplicate step ids', () => {
    const bad = structuredClone(document)
    bad.steps[1].fold!.creaseId = 'missing'
    expect(() => parseTutorial(serializeTutorial(bad), origamiCatalog)).toThrow(/vinco inexistente/)
    const badCamera = structuredClone(document)
    badCamera.steps[0].camera!.fov = 180
    expect(() => parseTutorial(serializeTutorial(badCamera), origamiCatalog)).toThrow(/Formato inválido/)
    const duplicate = structuredClone(document)
    duplicate.steps[1].id = duplicate.steps[0].id
    expect(() => parseTutorial(serializeTutorial(duplicate), origamiCatalog)).toThrow(/repetido/)
  })
  it('rejects switching to squash without preparing a pocket', () => {
    const bad = [{ ...item.steps[0] }, { ...item.steps[1], fold: undefined,
      phases: [{ label: 'Squash', vertex: { mechanismId: 'pocket', mode: 'squash' as const, angle: 180 } }] }]
    expect(validateTutorialSteps(vertexLabModel, bad).join(' ')).toMatch(/prepare o bolso/)
  })
  it('applies explicit mountain/valley directions from authored actions', () => {
    const reversed = structuredClone([...squarePracticeSteps])
    reversed[1].fold!.direction = squarePracticeModel.creases[0].direction === 'valley' ? 'mountain' : 'valley'
    expect(resolveFoldAngles(squarePracticeModel, reversed, 1)['vertical-center']).toBe(-180)
  })
})
