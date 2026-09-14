import type { TutorialStep } from '../engine/types'

export const tutorialSteps: TutorialStep[] = [
  {
    id: 'observe',
    eyebrow: 'Preparação',
    title: 'Conheça a folha',
    instruction: 'A folha agora é formada por quatro faces e dois vincos cadastrados em dados. Gire a câmera para observá-la.',
    showGuide: true,
    guide: { creaseId: 'vertical-center', arrowFrom: [1.35, 1], arrowTo: [0.18, 1] },
    mathNote: 'O vinco central divide o quadrado em dois retângulos congruentes.',
  },
  {
    id: 'center-fold',
    eyebrow: 'Primeira dobra',
    title: 'Dobre da direita para a esquerda',
    instruction: 'Leve a metade direita sobre a metade esquerda. A linha tracejada funciona como eixo da dobra.',
    showGuide: true,
    fold: { creaseId: 'vertical-center', angle: 180, duration: 1.45 },
    guide: { creaseId: 'vertical-center', arrowFrom: [1.35, 1], arrowTo: [0.18, 1] },
    mathNote: 'A dobra representa uma rotação de 180° em torno da linha de vinco.',
  },
  {
    id: 'inspect',
    eyebrow: 'Conferência',
    title: 'Confira o alinhamento',
    instruction: 'As duas metades agora coincidem. Gire a câmera para conferir o resultado antes de seguir.',
    showGuide: false,
    mathNote: 'Pontos simétricos ficam à mesma distância do eixo de dobra.',
  },
  {
    id: 'horizontal-fold',
    eyebrow: 'Segunda dobra',
    title: 'Dobre a parte superior para baixo',
    instruction: 'Agora duas camadas se movem juntas. Leve a parte superior até coincidir com a parte inferior.',
    showGuide: true,
    fold: { creaseId: 'horizontal-left', angle: 180, duration: 1.35 },
    guide: { creaseId: 'horizontal-left', arrowFrom: [-1, 1.35], arrowTo: [-1, 0.18] },
    mathNote: 'A composição de duas reflexões por dobra reduz o quadrado a um quarto da área inicial.',
  },
  {
    id: 'compact-result',
    eyebrow: 'Resultado',
    title: 'Observe as quatro camadas',
    instruction: 'A folha terminou como um quadrado menor. Volte ou repita para conferir como cada conjunto de faces se move.',
    showGuide: false,
    mathNote: 'O lado foi reduzido à metade e a área visível passou de 16 para 4 unidades quadradas.',
  },
]
