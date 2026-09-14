import type { OrigamiModelDefinition } from '../engine/types'

export const squarePracticeModel: OrigamiModelDefinition = {
  id: 'quadrado-duas-dobras',
  name: 'Quadrado — duas dobras',
  faces: [
    { id: 'top-left', vertices: [[-2, 0], [0, 0], [0, 2], [-2, 2]], color: '#f3ead9' },
    { id: 'top-right', vertices: [[0, 0], [2, 0], [2, 2], [0, 2]], color: '#fff9ed' },
    { id: 'bottom-left', vertices: [[-2, -2], [0, -2], [0, 0], [-2, 0]], color: '#efe5d3' },
    { id: 'bottom-right', vertices: [[0, -2], [2, -2], [2, 0], [0, 0]], color: '#faf3e5' },
  ],
  creases: [
    {
      id: 'vertical-center',
      label: 'Vinco vertical central',
      start: [0, -2],
      end: [0, 2],
      affectedFaces: ['top-right', 'bottom-right'],
      direction: 'valley',
    },
    {
      id: 'horizontal-left',
      label: 'Vinco horizontal da folha dobrada',
      start: [-2, 0],
      end: [0, 0],
      affectedFaces: ['top-left', 'top-right'],
      direction: 'valley',
    },
  ],
  foldOrder: ['vertical-center', 'horizontal-left'],
}
