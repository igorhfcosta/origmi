import type { TutorialStep } from '../engine/types'
import { heartModel } from './heartModel'

const camera = { position: [0, 6.2, 2.4] as const, target: [0, 0, -0.2] as const, fov: 38, duration: 0.8 }
const content = [
  ['heart-top', 'Dobre a ponta superior', 'Leve a ponta de cima até o centro da folha. O vinco fica na metade da distância entre a ponta e o centro.', 'A dobra leva um ponto a outro por reflexão. O vinco é a mediatriz do segmento entre eles.'],
  ['heart-bottom', 'Leve a ponta inferior para cima', 'Leve a ponta de baixo até o meio da borda superior. Mantenha as duas pontas alinhadas no eixo vertical.', 'Pontos correspondentes ficam à mesma distância do vinco horizontal.'],
  ['heart-right', 'Forme a metade direita', 'Leve a borda inferior direita até a linha vertical central. A parte direita sobe e começa a formar um dos lados do coração.', 'O vinco inclinado bisseta o ângulo entre a borda horizontal e a linha vertical.'],
  ['heart-left', 'Forme a metade esquerda', 'Repita a dobra do outro lado, alinhando a borda inferior esquerda com o eixo central.', 'As duas metades resultam de dobras espelhadas e são congruentes.'],
  ['heart-top-right', 'Arredonde o topo direito', 'Dobre a pequena ponta superior direita para o verso, suavizando o contorno.', 'Dobrar uma ponta modifica a silhueta, mas preserva a área de papel dessa região.'],
  ['heart-top-left', 'Arredonde o topo esquerdo', 'Faça a mesma dobra na ponta superior esquerda para manter os dois lados simétricos.', 'A simetria axial associa as pontas superiores em pares.'],
  ['heart-side-right', 'Arredonde a lateral direita', 'Dobre a pequena ponta da lateral direita para o verso. Confira o contorno antes de continuar.', 'O ponto mais externo é refletido em relação ao novo vinco.'],
  ['heart-side-left', 'Arredonde a lateral esquerda', 'Repita o acabamento na lateral esquerda. Seu coração está pronto.', 'Os acabamentos preservam a simetria do modelo.'],
] as const

export const heartSteps: TutorialStep[] = [
  { id: 'heart-prepare', eyebrow: 'Preparação', title: 'Comece por um quadrado',
    instruction: 'Posicione o quadrado com uma ponta para cima. Vamos formar um coração com dobras simples e acabamentos simétricos.',
    showGuide: false, mathNote: 'A folha é um quadrado visto como losango. Girar a folha não muda seus lados nem sua área.',
    mathQuestion: 'A figura deixa de ser quadrado quando uma ponta está para cima?',
    mathAnswer: 'Não. Sua orientação mudou, mas os quatro lados continuam iguais e os quatro ângulos continuam retos.', camera: { ...camera, position: [0, 6.8, 2.4] } },
  ...content.map(([creaseId, title, instruction, mathNote], index): TutorialStep => {
    const crease = heartModel.creases.find((c) => c.id === creaseId)!
    return { id: `${creaseId}-step`, eyebrow: `Dobra ${index + 1}`, title, instruction, mathNote,
      showGuide: false, fold: { creaseId, angle: 180, duration: index < 4 ? 1.6 : 1.25 },
      annotations: [{ id: `${creaseId}-axis`, kind: 'segment', faceId: crease.referenceFace!, start: crease.start, end: crease.end,
        label: index < 4 ? 'Eixo de reflexão' : 'Vinco de acabamento', dashed: true }],
      camera: index < 2 ? camera : { ...camera, position: [0, 5.3, 1.8], target: [0, 0, -0.5], fov: 34 } }
  }),
  { id: 'heart-result', eyebrow: 'Resultado', title: 'Um coração simétrico',
    instruction: 'Gire o modelo para observar as camadas do verso e compare as duas metades do coração.',
    showGuide: false, mathNote: 'A silhueta tem um eixo de simetria vertical. A área da folha continua a mesma, embora parte dela esteja escondida.',
    mathQuestion: 'A área da silhueta é igual à área do papel?',
    mathAnswer: 'Não necessariamente. Na silhueta, regiões sobrepostas aparecem uma única vez; na área do papel, cada camada conta.',
    camera: { ...camera, position: [0, 4.6, 1.4], target: [0, 0, -0.45], fov: 35 } },
]
