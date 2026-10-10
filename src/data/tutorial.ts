import type { TutorialStep } from '../engine/types'

export const squarePracticeSteps: TutorialStep[] = [
  {
    id: 'observe',
    eyebrow: 'Preparação',
    title: 'Conheça a folha',
    instruction: 'Observe os dois vincos principais antes de começar. Gire a câmera livremente se quiser explorar a folha.',
    showGuide: true,
    guide: { creaseId: 'vertical-center', arrowFrom: [1.35, 1], arrowTo: [0.18, 1] },
    mathNote: 'O vinco central divide o quadrado em dois retângulos congruentes.',
    camera: { position: [0, 6.6, 2.7], target: [0, 0, 0], fov: 39, duration: 0.9 },
  },
  {
    id: 'center-fold',
    eyebrow: 'Primeira dobra',
    title: 'Dobre da direita para a esquerda',
    instruction: 'Leve a metade direita sobre a metade esquerda. A câmera aproxima o vinco para deixar o eixo da dobra mais evidente.',
    showGuide: true,
    fold: { creaseId: 'vertical-center', angle: 180, duration: 1.45 },
    guide: { creaseId: 'vertical-center', arrowFrom: [1.35, 1], arrowTo: [0.18, 1] },
    mathNote: 'A dobra representa uma rotação de 180° em torno da linha de vinco.',
    camera: { position: [1.35, 6.1, 2.25], target: [0.2, 0, 0], fov: 36, duration: 0.8 },
  },
  {
    id: 'inspect',
    eyebrow: 'Conferência',
    title: 'Confira o alinhamento',
    instruction: 'As duas metades agora coincidem. A vista retorna ao centro para conferir o resultado antes de seguir.',
    showGuide: false,
    mathNote: 'Pontos simétricos ficam à mesma distância do eixo de dobra.',
    camera: { position: [0, 6.2, 2], target: [-0.8, 0, 0], fov: 38, duration: 0.75 },
  },
  {
    id: 'horizontal-fold',
    eyebrow: 'Segunda dobra',
    title: 'Dobre a parte superior para baixo',
    instruction: 'Agora duas camadas se movem juntas. O enquadramento acompanha a região superior para destacar a segunda dobra.',
    showGuide: true,
    fold: { creaseId: 'horizontal-left', angle: 180, duration: 1.35 },
    guide: { creaseId: 'horizontal-left', arrowFrom: [-1, 1.35], arrowTo: [-1, 0.18] },
    mathNote: 'A composição de duas reflexões por dobra reduz o quadrado a um quarto da área inicial.',
    camera: { position: [-1.15, 5.9, 2.7], target: [-1, 0, -0.35], fov: 35, duration: 0.8 },
  },
  {
    id: 'compact-result',
    eyebrow: 'Resultado',
    title: 'Observe as quatro camadas',
    instruction: 'A folha terminou como um quadrado menor. A câmera abre novamente para mostrar o resultado completo.',
    showGuide: false,
    mathNote: 'O lado foi reduzido à metade e a área visível passou de 16 para 4 unidades quadradas.',
    camera: { position: [0, 6.6, 2.5], target: [-1, 0, -1], fov: 38, duration: 0.9 },
  },
]

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'dog-prepare',
    eyebrow: 'Preparação',
    title: 'Comece pelo quadrado',
    instruction: 'Separe uma folha quadrada sem desenhos. Posicione uma ponta para cima; vamos dobrar primeiro e decorar somente no final.',
    showGuide: true,
    guide: { creaseId: 'base-diagonal', arrowFrom: [0, 1.45], arrowTo: [0, 0.18] },
    mathNote: 'A diagonal divide o quadrado em dois triângulos retângulos isósceles congruentes.',
    camera: { position: [0, 6.8, 2.5], target: [0, 0, 0], fov: 39, duration: 0.9 },
  },
  {
    id: 'dog-base-fold',
    eyebrow: 'Dobra 1',
    title: 'Forme um triângulo',
    instruction: 'Leve a ponta superior até a ponta inferior. O enquadramento central destaca a diagonal que funciona como eixo da dobra.',
    showGuide: true,
    fold: { creaseId: 'base-diagonal', angle: 180, duration: 1.55 },
    guide: { creaseId: 'base-diagonal', arrowFrom: [0, 1.45], arrowTo: [0, 0.18] },
    mathNote: 'A dobra funciona como uma rotação espacial de 180° e, no plano final, como uma reflexão pela diagonal.',
    camera: { position: [0, 6.25, 2.05], target: [0, 0, -0.15], fov: 36, duration: 0.8 },
  },
  {
    id: 'dog-left-ear',
    eyebrow: 'Dobra 2',
    title: 'Abaixe a orelha esquerda',
    instruction: 'Dobre a ponta esquerda para baixo pelo vinco inclinado. A câmera se desloca para a esquerda para evidenciar a região que vai se mover.',
    showGuide: true,
    fold: { creaseId: 'left-ear', angle: 180, duration: 1.25 },
    guide: { creaseId: 'left-ear', arrowFrom: [-1.72, -0.08], arrowTo: [-1.2, -1.2] },
    mathNote: 'A nova posição da orelha é a reflexão da ponta em relação ao vinco inclinado.',
    camera: { position: [-1.35, 5.8, 1.85], target: [-0.75, 0, -0.35], fov: 34, duration: 0.72 },
  },
  {
    id: 'dog-right-ear',
    eyebrow: 'Dobra 3',
    title: 'Abaixe a orelha direita',
    instruction: 'Faça a orelha simétrica à do outro lado. A câmera acompanha para a direita mantendo o mesmo tipo de enquadramento.',
    showGuide: true,
    fold: { creaseId: 'right-ear', angle: 180, duration: 1.25 },
    guide: { creaseId: 'right-ear', arrowFrom: [1.72, -0.08], arrowTo: [1.2, -1.2] },
    mathNote: 'Os dois vincos das orelhas são imagens espelhadas; por isso, produzem figuras congruentes.',
    camera: { position: [1.35, 5.8, 1.85], target: [0.75, 0, -0.35], fov: 34, duration: 0.72 },
  },
  {
    id: 'dog-finished',
    eyebrow: 'Acabamento',
    title: 'Pinte e desenhe o rosto',
    instruction: 'Com todas as dobras prontas, pinte as orelhas e desenhe os dois olhos e o nariz. O enquadramento final aproxima o rosto sem perder o modelo inteiro.',
    finish: true,
    showGuide: false,
    mathNote: 'O modelo combina simetria axial, congruência, reflexão e composição de rotações.',
    camera: { position: [0, 5.7, 1.35], target: [0, 0, -0.55], fov: 33, duration: 0.9 },
  },
]


// Marks use coordinates on a material face, so they move with the paper.
squarePracticeSteps[0].annotations = [
  { id: 'square-side', kind: 'segment', faceId: 'face-0', start: [-2, -2], end: [2, -2], label: 'Lado: 4 u' },
  { id: 'square-axis', kind: 'segment', faceId: 'face-0', start: [0, -2], end: [0, 2], label: 'Eixo de simetria', dashed: true },
]
squarePracticeSteps[0].mathQuestion = 'Que figuras aparecem ao dividir o quadrado pelo vinco central?'
squarePracticeSteps[0].mathAnswer = 'Dois retângulos congruentes, cada um com metade da área do quadrado.'
squarePracticeSteps[1].annotations = [
  { id: 'moving-point', kind: 'point', faceId: 'face-1', at: [2, -2], label: 'Ponto em movimento' },
  { id: 'matching-point', kind: 'point', faceId: 'face-0', at: [-2, -2], label: 'Ponto correspondente', color: '#88e5d3' },
]
squarePracticeSteps[1].mathQuestion = 'Por que os dois pontos coincidem no fim da dobra?'
squarePracticeSteps[1].mathAnswer = 'Eles são simétricos em relação ao vinco: estão à mesma distância dele, em lados opostos.'
squarePracticeSteps[2].annotations = [
  { id: 'rectangle-side', kind: 'segment', faceId: 'face-0', start: [-2, -2], end: [0, -2], label: '2 u' },
  { id: 'rectangle-height', kind: 'segment', faceId: 'face-0', start: [-2, -2], end: [-2, 0], label: '2 u' },
]
squarePracticeSteps[3].mathNote = 'As duas dobras reduzem a área da silhueta a um quarto da área inicial. A área total do papel permanece a mesma.'
squarePracticeSteps[3].annotations = [
  { id: 'horizontal-axis', kind: 'segment', faceId: 'face-2', start: [-2, 0], end: [0, 0], label: 'Segundo eixo', dashed: true },
]
squarePracticeSteps[4].annotations = [
  { id: 'quarter-area', kind: 'area', faceId: 'face-3', label: 'Silhueta: 4 u²' },
  { id: 'right-angle', kind: 'angle', faceId: 'face-3', vertex: [0, 0], from: [1, 0], to: [0, 1], label: '90°' },
]
squarePracticeSteps[4].mathQuestion = 'Se o lado foi dividido por 2, por quanto foi dividida a área da silhueta?'
squarePracticeSteps[4].mathAnswer = 'Por 4: a área depende do quadrado do lado. O papel ainda tem área 16 u², distribuída em quatro camadas.'

tutorialSteps[0].annotations = [
  { id: 'dog-diagonal', kind: 'segment', faceId: 'face-0', start: [-2, 0], end: [2, 0], label: 'Diagonal', dashed: true },
  { id: 'dog-corner-angle', kind: 'angle', faceId: 'face-2', vertex: [0, 2], from: [-1, 1], to: [1, 1], label: '90°' },
]
tutorialSteps[0].mathQuestion = 'Quais ângulos aparecem em cada triângulo formado pela diagonal?'
tutorialSteps[0].mathAnswer = '45°, 45° e 90°. São triângulos retângulos isósceles: dois lados e dois ângulos são iguais.'
tutorialSteps[1].annotations = [
  { id: 'dog-axis', kind: 'segment', faceId: 'face-0', start: [-2, 0], end: [2, 0], label: 'Eixo de reflexão', dashed: true },
]
tutorialSteps[2].annotations = [
  { id: 'left-ear-axis', kind: 'segment', faceId: 'face-1', start: [-0.194, 0], end: [-1.372, 0.628], label: 'Vinco da orelha', dashed: true },
]
tutorialSteps[3].annotations = [
  { id: 'right-ear-axis', kind: 'segment', faceId: 'face-3', start: [0.194, 0], end: [1.372, 0.628], label: 'Vinco espelhado', dashed: true },
]
tutorialSteps[4].annotations = [
  { id: 'dog-symmetry', kind: 'segment', faceId: 'face-2', start: [0, 0], end: [0, 2], label: 'Eixo de simetria', dashed: true },
]
tutorialSteps[4].mathQuestion = 'As orelhas são iguais apenas porque têm a mesma área?'
tutorialSteps[4].mathAnswer = 'Não. Elas são congruentes: uma pode coincidir com a outra por reflexão, preservando lados e ângulos.'
