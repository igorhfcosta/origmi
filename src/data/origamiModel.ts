import { importFoldModel } from '../engine/foldImporter'
import dogFoldSource from './models/dog.fold?raw'
import squarePracticeFoldSource from './models/square-practice.fold?raw'

export { dogFoldSource, squarePracticeFoldSource }

export const squarePracticeModel = importFoldModel(squarePracticeFoldSource, {
  id: 'quadrado-duas-dobras',
  name: 'Quadrado — duas dobras',
  faceColors: ['#efe5d3', '#faf3e5', '#f3ead9', '#fff9ed'],
  creases: [
    {
      id: 'vertical-center',
      label: 'Vinco vertical central',
      edgeIndices: [8, 9],
      affectedFaces: [1, 3],
    },
    {
      id: 'horizontal-left',
      label: 'Vinco horizontal da folha dobrada',
      edgeIndices: [2],
      affectedFaces: [2, 3],
    },
  ],
  foldOrder: ['vertical-center', 'horizontal-left'],
})

export const dogModel = importFoldModel(dogFoldSource, {
  id: 'cachorro-simples',
  name: 'Cachorro de origami',
  faceColors: ['#d6a66c', '#8b5a3c', '#e9be82', '#8b5a3c'],
  faceRenderOrder: [0, 2, 1, 2],
  creases: [
    {
      id: 'base-diagonal',
      label: 'Dobra diagonal da base',
      edgeIndices: [0, 1, 2],
      affectedFaces: [1, 2, 3],
      referenceFace: 2,
    },
    {
      id: 'left-ear',
      label: 'Dobra da orelha esquerda',
      edgeIndices: [9],
      affectedFaces: [1],
      referenceFace: 1,
    },
    {
      id: 'right-ear',
      label: 'Dobra da orelha direita',
      edgeIndices: [10],
      affectedFaces: [3],
      referenceFace: 3,
    },
  ],
  foldOrder: ['base-diagonal', 'left-ear', 'right-ear'],
  decorations: [
    { id: 'left-eye', face: 2, kind: 'circle', position: [-0.48, 0.72], size: 0.105, color: '#211713', surface: 'back', showFromStep: 1 },
    { id: 'right-eye', face: 2, kind: 'circle', position: [0.48, 0.72], size: 0.105, color: '#211713', surface: 'back', showFromStep: 1 },
    { id: 'nose', face: 2, kind: 'circle', position: [0, 1.55], size: 0.17, color: '#211713', surface: 'back', showFromStep: 1 },
  ],
})

export const activeOrigamiModel = dogModel
