import { describe, expect, it } from 'vitest'
import { dogModel, squarePracticeFoldSource, squarePracticeModel } from '../data/origamiModel'
import { FoldImportError, importFoldModel, parseFoldText } from './foldImporter'

describe('foldImporter', () => {
  it('parses a valid FOLD JSON document', () => {
    const document = parseFoldText(squarePracticeFoldSource)
    expect(document.file_spec).toBe(1.2)
    expect(document.file_title).toBe('Quadrado — duas dobras')
  })

  it('builds faces from zero-indexed FOLD vertex references', () => {
    expect(squarePracticeModel.faces).toHaveLength(4)
    expect(squarePracticeModel.faces[0]).toMatchObject({
      id: 'face-0',
      vertices: [[-2, -2], [0, -2], [0, 0], [-2, 0]],
    })
  })

  it('merges connected collinear edge segments into one crease', () => {
    expect(squarePracticeModel.creases[0]).toMatchObject({
      id: 'vertical-center',
      start: [0, -2],
      end: [0, 2],
      affectedFaces: ['face-1', 'face-3'],
      direction: 'valley',
    })
  })

  it('keeps FOLD source metadata on the internal model', () => {
    expect(squarePracticeModel.source).toEqual({ format: 'FOLD', spec: 1.2, title: 'Quadrado — duas dobras' })
  })

  it('imports the complete dog model with three animated creases', () => {
    expect(dogModel).toMatchObject({
      id: 'cachorro-simples',
      source: { format: 'FOLD', spec: 1.2, title: 'Cachorro de origami' },
    })
    expect(dogModel.faces).toHaveLength(4)
    expect(dogModel.creases.map((crease) => crease.id)).toEqual([
      'base-diagonal',
      'left-ear',
      'right-ear',
    ])
    expect(dogModel.decorations).toHaveLength(3)
  })

  it('rejects invalid JSON with a readable domain error', () => {
    expect(() => parseFoldText('{not-json}')).toThrow(FoldImportError)
    expect(() => parseFoldText('{not-json}')).toThrow('O conteúdo não é um JSON válido.')
  })

  it('rejects references to vertices that do not exist', () => {
    const invalid = {
      vertices_coords: [[0, 0], [1, 0], [0, 1]],
      edges_vertices: [[0, 8]],
      edges_assignment: ['V'],
      faces_vertices: [[0, 1, 2]],
    }
    expect(() => importFoldModel(invalid, {
      id: 'invalid',
      name: 'Invalid',
      creases: [{ id: 'crease', label: 'Crease', edgeIndices: [0], affectedFaces: [0] }],
    })).toThrow('índice inválido 8')
  })

  it('rejects a crease assembled from disconnected segments', () => {
    const invalid = {
      vertices_coords: [[0, 0], [1, 0], [3, 0], [4, 0]],
      edges_vertices: [[0, 1], [2, 3]],
      edges_assignment: ['V', 'V'],
      faces_vertices: [[0, 1, 2]],
    }
    expect(() => importFoldModel(invalid, {
      id: 'invalid',
      name: 'Invalid',
      creases: [{ id: 'crease', label: 'Crease', edgeIndices: [0, 1], affectedFaces: [0] }],
    })).toThrow('precisam estar conectados')
  })

  it('rejects non-flat 3D coordinates in this milestone', () => {
    const invalid = {
      vertices_coords: [[0, 0, 1], [1, 0, 0], [0, 1, 0]],
      edges_vertices: [[0, 1]],
      edges_assignment: ['V'],
      faces_vertices: [[0, 1, 2]],
    }
    expect(() => importFoldModel(invalid, {
      id: '3d',
      name: '3D',
      creases: [{ id: 'crease', label: 'Crease', edgeIndices: [0], affectedFaces: [0] }],
    })).toThrow('coordenadas z não nulas')
  })
})
