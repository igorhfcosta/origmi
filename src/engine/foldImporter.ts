import type {
  CreaseDefinition,
  FoldDirection,
  OrigamiModelDefinition,
  Point2D,
} from './types'

type UnknownRecord = Record<string, unknown>

export interface FoldCreaseMapping {
  id: string
  label: string
  edgeIndices: readonly number[]
  affectedFaces: readonly number[]
  direction?: FoldDirection
  referenceFace?: number
}

export interface FoldDecorationMapping {
  id: string
  face: number
  kind: 'circle'
  position: Point2D
  size: number
  color: string
  surface?: 'front' | 'back'
  showFromStep?: number
}

export interface FoldImportMetadata {
  id: string
  name: string
  creases: readonly FoldCreaseMapping[]
  foldOrder?: readonly string[]
  faceColors?: readonly string[]
  faceRenderOrder?: readonly number[]
  decorations?: readonly FoldDecorationMapping[]
}

export class FoldImportError extends Error {
  readonly issues: readonly string[]

  constructor(issues: readonly string[]) {
    super(`Não foi possível importar o arquivo FOLD: ${issues.join(' ')}`)
    this.name = 'FoldImportError'
    this.issues = issues
  }
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readRequiredArray(document: UnknownRecord, key: string): unknown[] {
  const value = document[key]
  if (!Array.isArray(value)) throw new FoldImportError([`O campo obrigatório ${key} está ausente ou é inválido.`])
  return value
}

function readVertices(document: UnknownRecord): Point2D[] {
  return readRequiredArray(document, 'vertices_coords').map((coordinate, index) => {
    if (!Array.isArray(coordinate) || coordinate.length < 2) {
      throw new FoldImportError([`O vértice ${index} precisa ter coordenadas x e y.`])
    }

    const [x, y, z = 0] = coordinate
    if (![x, y, z].every((value) => typeof value === 'number' && Number.isFinite(value))) {
      throw new FoldImportError([`O vértice ${index} contém uma coordenada inválida.`])
    }
    if (Math.abs(z as number) > 1e-8) {
      throw new FoldImportError(['O MVP 03 aceita padrões de vinco 2D; coordenadas z não nulas ainda não são suportadas.'])
    }

    return [x as number, y as number] as const
  })
}

function readIndexList(value: unknown, label: string, length: number): number[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new FoldImportError([`${label} precisa ser uma lista não vazia.`])
  }

  return value.map((item) => {
    if (!Number.isInteger(item) || (item as number) < 0 || (item as number) >= length) {
      throw new FoldImportError([`${label} referencia o índice inválido ${String(item)}.`])
    }
    return item as number
  })
}

function readEdges(document: UnknownRecord, vertexCount: number): [number, number][] {
  return readRequiredArray(document, 'edges_vertices').map((edge, index) => {
    const vertices = readIndexList(edge, `A aresta ${index}`, vertexCount)
    if (vertices.length !== 2 || vertices[0] === vertices[1]) {
      throw new FoldImportError([`A aresta ${index} precisa ligar dois vértices diferentes.`])
    }
    return [vertices[0], vertices[1]]
  })
}

function readFaces(document: UnknownRecord, vertices: readonly Point2D[]) {
  return readRequiredArray(document, 'faces_vertices').map((face, index) => ({
    id: `face-${index}`,
    vertices: readIndexList(face, `A face ${index}`, vertices.length).map((vertexIndex) => vertices[vertexIndex]),
  }))
}

function ensureConnected(edgeIndices: readonly number[], edges: readonly [number, number][]): void {
  const pending = new Set(edgeIndices)
  const visitedVertices = new Set<number>()
  const firstEdge = edges[edgeIndices[0]]
  visitedVertices.add(firstEdge[0])
  visitedVertices.add(firstEdge[1])
  pending.delete(edgeIndices[0])

  let changed = true
  while (pending.size > 0 && changed) {
    changed = false
    pending.forEach((edgeIndex) => {
      const [start, end] = edges[edgeIndex]
      if (visitedVertices.has(start) || visitedVertices.has(end)) {
        visitedVertices.add(start)
        visitedVertices.add(end)
        pending.delete(edgeIndex)
        changed = true
      }
    })
  }

  if (pending.size > 0) throw new FoldImportError(['Os segmentos de um mesmo vinco precisam estar conectados.'])
}

function mergeCreaseEdges(
  edgeIndices: readonly number[],
  edges: readonly [number, number][],
  vertices: readonly Point2D[],
): [Point2D, Point2D] {
  ensureConnected(edgeIndices, edges)
  const vertexIndices = [...new Set(edgeIndices.flatMap((edgeIndex) => edges[edgeIndex]))]
  let farthest: [number, number] = [vertexIndices[0], vertexIndices[1]]
  let maxDistanceSquared = -1

  for (let first = 0; first < vertexIndices.length; first += 1) {
    for (let second = first + 1; second < vertexIndices.length; second += 1) {
      const a = vertices[vertexIndices[first]]
      const b = vertices[vertexIndices[second]]
      const distanceSquared = (b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2
      if (distanceSquared > maxDistanceSquared) {
        maxDistanceSquared = distanceSquared
        farthest = [vertexIndices[first], vertexIndices[second]]
      }
    }
  }

  const start = vertices[farthest[0]]
  const end = vertices[farthest[1]]
  const dx = end[0] - start[0]
  const dy = end[1] - start[1]
  const length = Math.hypot(dx, dy)
  if (length < 1e-8) throw new FoldImportError(['Um vinco precisa ter comprimento maior que zero.'])
  const isCollinear = vertexIndices.every((vertexIndex) => {
    const point = vertices[vertexIndex]
    return Math.abs(dx * (point[1] - start[1]) - dy * (point[0] - start[0])) / length < 1e-7
  })

  if (!isCollinear) throw new FoldImportError(['Os segmentos agrupados em um vinco precisam ser colineares.'])
  return [start, end]
}

function directionFromAssignments(
  mapping: FoldCreaseMapping,
  assignments: readonly unknown[],
): FoldDirection {
  if (mapping.direction) return mapping.direction
  const foldAssignments = new Set(mapping.edgeIndices.map((edgeIndex) => assignments[edgeIndex]))

  if (foldAssignments.has('M') && foldAssignments.has('V')) {
    throw new FoldImportError([`O vinco ${mapping.id} mistura segmentos montanha e vale.`])
  }
  if (foldAssignments.has('M')) return 'mountain'
  if (foldAssignments.has('V')) return 'valley'
  throw new FoldImportError([`O vinco ${mapping.id} precisa de atribuição M/V ou direção explícita.`])
}

export function parseFoldText(source: string): UnknownRecord {
  try {
    const document: unknown = JSON.parse(source)
    if (!isRecord(document)) throw new FoldImportError(['A raiz do arquivo precisa ser um objeto JSON.'])
    return document
  } catch (error) {
    if (error instanceof FoldImportError) throw error
    throw new FoldImportError(['O conteúdo não é um JSON válido.'])
  }
}

export function importFoldModel(source: string | UnknownRecord, metadata: FoldImportMetadata): OrigamiModelDefinition {
  const document = typeof source === 'string' ? parseFoldText(source) : source
  const vertices = readVertices(document)
  const edges = readEdges(document, vertices.length)
  const faces = readFaces(document, vertices).map((face, index) => ({
    ...face,
    color: metadata.faceColors?.[index],
    renderOrder: metadata.faceRenderOrder?.[index],
  }))
  const assignments = Array.isArray(document.edges_assignment) ? document.edges_assignment : []

  const creases: CreaseDefinition[] = metadata.creases.map((mapping) => {
    const edgeIndices = readIndexList(mapping.edgeIndices, `O vinco ${mapping.id}`, edges.length)
    const affectedFaces = readIndexList(mapping.affectedFaces, `As faces do vinco ${mapping.id}`, faces.length)
    const [start, end] = mergeCreaseEdges(edgeIndices, edges, vertices)

    return {
      id: mapping.id,
      label: mapping.label,
      start,
      end,
      affectedFaces: affectedFaces.map((faceIndex) => faces[faceIndex].id),
      direction: directionFromAssignments({ ...mapping, edgeIndices }, assignments),
      referenceFace: mapping.referenceFace === undefined
        ? undefined
        : faces[readIndexList([mapping.referenceFace], `A face de referência do vinco ${mapping.id}`, faces.length)[0]].id,
    }
  })

  const spec = typeof document.file_spec === 'number' ? document.file_spec : undefined
  const title = typeof document.file_title === 'string' ? document.file_title : undefined

  return {
    id: metadata.id,
    name: metadata.name,
    faces,
    creases,
    foldOrder: metadata.foldOrder ?? creases.map((crease) => crease.id),
    decorations: metadata.decorations?.map((decoration) => ({
      id: decoration.id,
      faceId: faces[readIndexList([decoration.face], `A decoração ${decoration.id}`, faces.length)[0]].id,
      kind: decoration.kind,
      position: decoration.position,
      size: decoration.size,
      color: decoration.color,
      surface: decoration.surface,
      showFromStep: decoration.showFromStep,
    })),
    source: { format: 'FOLD', spec, title },
  }
}
