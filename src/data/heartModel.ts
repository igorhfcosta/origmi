import { importFoldModel } from '../engine/foldImporter'
import source from './models/heart.fold?raw'

export const heartModel = importFoldModel(source, {
  "id": "coracao",
  "name": "Coração de origami",
  "faceColors": [
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa",
    "#ec8caa"
  ],
  "creases": [
    {
      "id": "heart-top",
      "label": "Dobre a ponta superior",
      "edgeIndices": [
        2
      ],
      "affectedFaces": [
        12
      ],
      "referenceFace": 12,
      "direction": "mountain"
    },
    {
      "id": "heart-bottom",
      "label": "Leve a ponta inferior para cima",
      "edgeIndices": [
        10
      ],
      "affectedFaces": [
        9,
        10,
        11
      ],
      "referenceFace": 10,
      "direction": "valley"
    },
    {
      "id": "heart-right",
      "label": "Forme a metade direita",
      "edgeIndices": [
        0
      ],
      "affectedFaces": [
        6,
        7,
        8,
        11
      ],
      "referenceFace": 6,
      "direction": "mountain"
    },
    {
      "id": "heart-left",
      "label": "Forme a metade esquerda",
      "edgeIndices": [
        4
      ],
      "affectedFaces": [
        3,
        4,
        5,
        10
      ],
      "referenceFace": 3,
      "direction": "valley"
    },
    {
      "id": "heart-top-right",
      "label": "Arredonde o topo direito",
      "edgeIndices": [
        19
      ],
      "affectedFaces": [
        8
      ],
      "referenceFace": 8,
      "direction": "valley"
    },
    {
      "id": "heart-top-left",
      "label": "Arredonde o topo esquerdo",
      "edgeIndices": [
        13
      ],
      "affectedFaces": [
        5
      ],
      "referenceFace": 5,
      "direction": "mountain"
    },
    {
      "id": "heart-side-right",
      "label": "Arredonde a lateral direita",
      "edgeIndices": [
        1
      ],
      "affectedFaces": [
        2,
        7
      ],
      "referenceFace": 2,
      "direction": "mountain"
    },
    {
      "id": "heart-side-left",
      "label": "Arredonde a lateral esquerda",
      "edgeIndices": [
        3
      ],
      "affectedFaces": [
        1,
        4
      ],
      "referenceFace": 1,
      "direction": "mountain"
    }
  ],
  "foldOrder": [
    "heart-top",
    "heart-bottom",
    "heart-right",
    "heart-left",
    "heart-top-right",
    "heart-top-left",
    "heart-side-right",
    "heart-side-left"
  ]
})
