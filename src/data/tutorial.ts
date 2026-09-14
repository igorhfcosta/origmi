import type { TutorialStep } from '../engine/types'

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'observe',
    eyebrow: 'Preparação',
    title: 'Conheça a folha',
    instruction: 'Gire a câmera e observe a folha quadrada. O primeiro vinco passa exatamente pelo centro.',
    targetFold: 0,
    showGuide: true,
    mathNote: 'O vinco central divide o quadrado em dois retângulos congruentes.',
  },
  {
    id: 'center-fold',
    eyebrow: 'Primeira dobra',
    title: 'Dobre da direita para a esquerda',
    instruction: 'Leve a metade direita sobre a metade esquerda. A linha tracejada funciona como eixo da dobra.',
    targetFold: 1,
    showGuide: true,
    foldDirection: 'valley',
    mathNote: 'A dobra representa uma rotação de 180° em torno da linha de vinco.',
  },
  {
    id: 'inspect',
    eyebrow: 'Conferência',
    title: 'Confira o alinhamento',
    instruction: 'As duas metades agora coincidem. Gire a câmera para conferir o resultado antes de seguir.',
    targetFold: 1,
    showGuide: false,
    mathNote: 'Pontos simétricos ficam à mesma distância do eixo de dobra.',
  },
]
