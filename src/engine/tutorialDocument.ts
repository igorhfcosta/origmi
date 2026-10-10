import type { OrigamiCatalogItem } from '../data/catalog'
import { phasesForStep, resolveFoldAngles, resolvePhaseAngles, resolveCreaseAxes, transformPointWithAxes, validateOrigamiModel } from './origamiEngine'
import type { CameraPose, FoldAction, FoldPhase, MathAnnotation, OrigamiModelDefinition, TutorialStep } from './types'

export interface TutorialDocument {
  version: 1
  catalogId: string
  title: string
  steps: TutorialStep[]
}
const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 10000
const optionalText = (v: unknown) => v === undefined || text(v)
const number = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const point = (v: unknown, size: number) => Array.isArray(v) && v.length === size && v.every((x) => number(x) && Math.abs(x) <= 100)
const duration = (v: unknown) => v === undefined || (number(v) && v >= 0 && v <= 30)
const direction = (v: unknown) => v === undefined || v === 'valley' || v === 'mountain'
const vertexModes = ['book', 'squash', 'inside-reverse', 'outside-reverse']

function cameraShape(v: unknown): v is CameraPose {
  return record(v) && point(v.position, 3) && point(v.target, 3) && duration(v.duration)
    && (v.fov === undefined || (number(v.fov) && v.fov >= 25 && v.fov <= 70))
}
function foldShape(v: unknown): v is FoldAction {
  return record(v) && text(v.creaseId) && number(v.angle) && Math.abs(v.angle) <= 180 && duration(v.duration) && direction(v.direction)
}
function phaseShape(v: unknown): v is FoldPhase {
  if (!record(v) || !text(v.label) || !duration(v.duration)) return false
  const folds = Array.isArray(v.folds) && v.folds.length > 0 && v.folds.length <= 16 && v.folds.every(foldShape)
  const vertex = record(v.vertex) && text(v.vertex.mechanismId) && vertexModes.includes(String(v.vertex.mode))
    && number(v.vertex.angle) && v.vertex.angle >= 0 && v.vertex.angle <= 180
  return Boolean(folds !== vertex && (v.folds === undefined || folds) && (v.vertex === undefined || vertex))
}
function annotationShape(v: unknown): v is MathAnnotation {
  if (!record(v) || !text(v.id) || !text(v.faceId) || !text(v.label)
    || (v.color !== undefined && (typeof v.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(v.color)))) return false
  if (v.kind === 'area') return true
  if (v.kind === 'point') return point(v.at, 2)
  if (v.kind === 'segment') return point(v.start, 2) && point(v.end, 2) && (v.dashed === undefined || typeof v.dashed === 'boolean')
  return v.kind === 'angle' && point(v.vertex, 2) && point(v.from, 2) && point(v.to, 2)
}
function stepShape(v: unknown): v is TutorialStep {
  if (!record(v) || ![v.id, v.eyebrow, v.title, v.instruction].every(text) || typeof v.showGuide !== 'boolean') return false
  if (![v.mathNote, v.mathQuestion, v.mathAnswer].every(optionalText) || (v.finish !== undefined && typeof v.finish !== 'boolean')) return false
  if ((v.fold !== undefined && !foldShape(v.fold)) || (v.phases !== undefined && (!Array.isArray(v.phases)
    || v.phases.length > 16 || !v.phases.every(phaseShape)))) return false
  if (v.fold && v.phases) return false
  if (v.camera !== undefined && !cameraShape(v.camera)) return false
  if (v.annotations !== undefined && (!Array.isArray(v.annotations) || v.annotations.length > 40 || !v.annotations.every(annotationShape))) return false
  return v.guide === undefined || (record(v.guide) && text(v.guide.creaseId) && point(v.guide.arrowFrom, 2)
    && point(v.guide.arrowTo, 2) && (v.guide.faceId === undefined || text(v.guide.faceId)))
}

export function sharedVertexError(model: OrigamiModelDefinition, angles: Record<string, number>): number {
  const positions = new Map<string, readonly number[]>()
  const axes = resolveCreaseAxes(model, angles)
  let error = 0
  for (const face of model.faces) for (const [x, y] of face.vertices) {
    const key = `${x.toFixed(6)},${y.toFixed(6)}`
    const point = transformPointWithAxes(model, face.id, [x, y, 0], angles, axes)
    const previous = positions.get(key)
    if (previous) error = Math.max(error, Math.hypot(...point.map((v, i) => v - previous[i])))
    else positions.set(key, point)
  }
  return error
}

export function validateTutorialSteps(model: OrigamiModelDefinition, steps: readonly TutorialStep[]): string[] {
  const errors = validateOrigamiModel(model)
  if (steps.length < 2 || steps.length > 200) errors.push('O tutorial precisa ter entre 2 e 200 etapas.')
  const ids = new Set<string>()
  const creaseIds = new Set(model.creases.map((c) => c.id))
  const faceIds = new Set(model.faces.map((f) => f.id))
  steps.forEach((step, index) => {
    const prefix = `Etapa ${index + 1}`
    if (!stepShape(step)) { errors.push(`${prefix}: há campos vazios ou valores inválidos.`); return }
    if (ids.has(step.id)) errors.push(`${prefix}: o identificador da etapa está repetido.`)
    ids.add(step.id)
    if (step.camera && Math.hypot(...step.camera.position.map((v, i) => v - step.camera!.target[i])) < 1) errors.push(`${prefix}: afaste a câmera do alvo.`)
    if (step.guide && (!creaseIds.has(step.guide.creaseId) || (step.guide.faceId && !faceIds.has(step.guide.faceId)))) errors.push(`${prefix}: a guia referencia um vinco ou face inexistente.`)
    const annotationIds = new Set<string>()
    for (const mark of step.annotations ?? []) {
      if (!faceIds.has(mark.faceId)) errors.push(`${prefix}: a marcação referencia uma face inexistente.`)
      if (annotationIds.has(mark.id)) errors.push(`${prefix}: há marcações com identificador repetido.`)
      annotationIds.add(mark.id)
    }
    let from = resolveFoldAngles(model, steps, index - 1)
    for (const phase of phasesForStep(step)) {
      const actions = phase.folds ?? []
      if (new Set(actions.map((f) => f.creaseId)).size !== actions.length) errors.push(`${prefix}: a mesma fase repete um vinco.`)
      if (actions.some((f) => !creaseIds.has(f.creaseId))) { errors.push(`${prefix}: a dobra referencia um vinco inexistente.`); continue }
      if (phase.vertex && !model.mechanisms?.some((m) => m.id === phase.vertex?.mechanismId)) {
        errors.push(`${prefix}: este modelo não está preparado para a técnica escolhida.`); continue
      }
      const start = resolvePhaseAngles(model, phase, from, 0)
      if (Object.keys(from).some((id) => Math.abs(start[id] - from[id]) > 1e-5)) errors.push(`${prefix}: reabra ou prepare o bolso antes de trocar de técnica.`)
      if ([0, 0.25, 0.5, 0.75, 1].some((t) => sharedVertexError(model, resolvePhaseAngles(model, phase, from, t)) > 1e-5)) {
        errors.push(`${prefix}: esses movimentos separam faces do papel. Revise a ordem e os ângulos.`)
      }
      from = resolvePhaseAngles(model, phase, from)
    }
  })
  return [...new Set(errors)]
}

export function serializeTutorial(document: TutorialDocument): string { return `${JSON.stringify(document, null, 2)}\n` }

export function parseTutorial(source: string, catalog: readonly OrigamiCatalogItem[]): TutorialDocument {
  if (source.length > 2_000_000) throw new Error('O arquivo de tutorial é grande demais (máximo 2 MB).')
  let value: unknown
  try { value = JSON.parse(source) } catch { throw new Error('O arquivo não contém JSON válido.') }
  if (!record(value) || value.version !== 1 || !text(value.catalogId) || !text(value.title)
    || !Array.isArray(value.steps) || value.steps.length < 2 || value.steps.length > 200 || !value.steps.every(stepShape)) {
    throw new Error('Formato inválido. Use um tutorial exportado pelo editor do OrigamiLab.')
  }
  const item = catalog.find((item) => item.id === value.catalogId)
  if (!item) throw new Error('O modelo deste tutorial não está disponível na biblioteca.')
  const errors = validateTutorialSteps(item.model, value.steps)
  if (errors.length) throw new Error(errors.join(' '))
  return { version: 1, catalogId: value.catalogId, title: value.title, steps: value.steps }
}
