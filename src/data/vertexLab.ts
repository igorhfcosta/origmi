import { importFoldModel } from '../engine/foldImporter'
import type { TutorialStep, VertexMode } from '../engine/types'
import source from './models/vertex-lab.fold?raw'

export const vertexLabModel = {
  ...importFoldModel(source, {
    id: 'laboratorio-dobras', name: 'Laboratório de dobras coordenadas',
    faceColors: ['#f7edcf', '#eabb8a', '#dba782', '#f4dcc3'],
    creases: [
      { id: 'pocket-side', label: 'Lado do bolso', edgeIndices: [1], affectedFaces: [1, 2, 3], direction: 'valley', referenceFace: 1 },
      { id: 'pocket-center', label: 'Centro do bolso', edgeIndices: [2], affectedFaces: [2, 3], direction: 'valley', referenceFace: 2 },
      { id: 'pocket-back', label: 'Verso do bolso', edgeIndices: [3], affectedFaces: [3], direction: 'valley', referenceFace: 3 },
    ],
    foldOrder: ['pocket-side', 'pocket-center', 'pocket-back'],
  }),
  mechanisms: [{ id: 'pocket', label: 'Bolso simétrico', creases: ['pocket-side', 'pocket-center', 'pocket-back'] as const, sectorAngle: 45 }],
}

const camera = { position: [2.3, 6.8, 3.6] as const, target: [0, 0, 0] as const, fov: 42, duration: 0.8 }
const vertex = (mode: VertexMode, angle: number, label: string, duration = 1.5) => ({ label, duration, vertex: { mechanismId: 'pocket', mode, angle } })
export const vertexLabSteps: TutorialStep[] = [
  {
    id: 'lab-prepare', eyebrow: 'Preparação', title: 'Um vértice, quatro setores',
    instruction: 'Observe as quatro regiões que se encontram no ponto central. Os vincos já estão preparados para abrir um bolso, achatá-lo e inverter uma ponta.',
    showGuide: false, mathNote: 'Os setores medem 45°, 45°, 135° e 135°. Cada par de setores opostos soma 180°.',
    mathQuestion: 'Por que precisamos mover mais de um vinco para manter a folha unida?',
    mathAnswer: 'As faces formam um circuito fechado em torno do vértice. O movimento de uma face limita as posições das outras.',
    annotations: [
      { id: 'center', kind: 'point', faceId: 'face-0', at: [0, 0], label: 'Vértice' },
      { id: 'sector', kind: 'angle', faceId: 'face-0', vertex: [0, 0], from: [2, 0], to: [2, 2], label: '45°' },
    ], camera,
  },
  { id: 'lab-book', eyebrow: 'Preparação do bolso', title: 'Feche a folha como um livro',
    instruction: 'As duas faces centrais giram juntas, enquanto a face de apoio fica no lugar. Observe o bolso formado entre as camadas.',
    phases: [vertex('book', 180, 'Preparar o bolso')], showGuide: false,
    mathNote: 'Os dois vincos alinhados funcionam como uma única linha de reflexão. As áreas das faces não mudam.', camera },
  { id: 'lab-open-pocket', eyebrow: 'Squash fold · abertura', title: 'Abra o bolso',
    instruction: 'Separe as camadas do bolso e observe a abertura em três dimensões. Gire a câmera para enxergar o espaço entre elas.',
    phases: [vertex('squash', 90, 'Abrir o bolso', 1.8)], showGuide: false,
    mathNote: 'A rotação do vinco central reposiciona também o eixo do verso. Todas as faces continuam ligadas nas mesmas arestas.', camera: { ...camera, position: [4, 5, 4] } },
  { id: 'lab-squash', eyebrow: 'Squash fold · fechamento', title: 'Achate o bolso',
    instruction: 'Pressione a abertura até as faces voltarem ao plano. Esta é a dobra de achatamento, chamada squash fold.',
    phases: [vertex('squash', 180, 'Achatar o bolso', 1.8)], showGuide: false,
    mathNote: 'O bolso termina plano, mas a distribuição das camadas mudou. Achatar não significa esticar o papel.',
    mathQuestion: 'A área total do papel ficou menor?', mathAnswer: 'Não. A área do papel é conservada; a área da silhueta diminui porque há sobreposição de camadas.', camera },
  { id: 'lab-reset', eyebrow: 'Preparar a inversão', title: 'Reabra pelos vincos',
    instruction: 'Desfaça o achatamento e reabra o livro. Os vincos permanecem como referência para a próxima técnica.',
    phases: [vertex('squash', 0, 'Desfazer o achatamento'), vertex('book', 0, 'Reabrir a folha')], showGuide: false,
    mathNote: 'Uma etapa pode combinar várias fases. A segunda fase começa exatamente no estado deixado pela primeira.', camera },
  { id: 'lab-inside', eyebrow: 'Inside reverse fold', title: 'Inverta a ponta para dentro',
    instruction: 'A ponta entra entre as camadas. Acompanhe a troca entre vincos vale e montanha em torno do mesmo vértice.',
    phases: [vertex('inside-reverse', 180, 'Inverter para dentro', 2.3)], showGuide: false,
    mathNote: 'Os ângulos dos vincos variam de forma coordenada e não linear. Essa relação mantém a aresta de fechamento unida.', camera: { ...camera, position: [3.3, 5.5, 4.4] } },
  { id: 'lab-outside', eyebrow: 'Outside reverse fold', title: 'Compare com a inversão para fora',
    instruction: 'Primeiro reabra a ponta; depois faça a inversão pelo lado oposto. A rota espacial muda, mesmo quando a silhueta final parece semelhante.',
    phases: [vertex('inside-reverse', 0, 'Reabrir a ponta', 1.3), vertex('outside-reverse', 180, 'Inverter para fora', 2.3)], showGuide: false,
    mathNote: 'Inverter o sentido das rotações troca vale e montanha. A sequência percorre o outro lado do plano do papel.', camera: { ...camera, position: [3.3, 5.5, 4.4] } },
]


vertexLabSteps.slice(1).forEach((step) => {
  step.annotations = [
    { id: 'side-axis', kind: 'segment', faceId: 'face-1', start: [0, 0], end: [2, 2], label: 'Vinco lateral', dashed: true },
    { id: 'pocket-axis', kind: 'segment', faceId: 'face-2', start: [0, 0], end: [0, 2], label: 'Vinco central', dashed: true },
  ]
})
