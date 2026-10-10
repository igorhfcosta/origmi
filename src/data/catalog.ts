import type { OrigamiModelDefinition, TutorialStep } from '../engine/types'
import { dogModel, squarePracticeModel } from './origamiModel'
import { heartModel } from './heartModel'
import { heartSteps } from './heartTutorial'
import { vertexLabModel, vertexLabSteps } from './vertexLab'
import { squarePracticeSteps, tutorialSteps } from './tutorial'

export interface OrigamiCatalogItem {
  id: string
  title: string
  subtitle: string
  category: string
  difficulty: 'Iniciante' | 'Fácil' | 'Médio' | 'Avançado'
  estimatedMinutes: number
  foldCount: number
  model: OrigamiModelDefinition
  steps: readonly TutorialStep[]
  accent: 'violet' | 'amber' | 'rose'
}

export const origamiCatalog: readonly OrigamiCatalogItem[] = [
  {
    id: 'cachorro-simples',
    title: 'Cachorro de origami',
    subtitle: 'Um primeiro modelo completo para aprender diagonais, simetria e dobras espelhadas.',
    category: 'Animais',
    difficulty: 'Fácil',
    estimatedMinutes: 5,
    foldCount: 3,
    model: dogModel,
    steps: tutorialSteps,
    accent: 'violet',
  },
  {
    id: 'quadrado-duas-dobras',
    title: 'Duas dobras fundamentais',
    subtitle: 'Treine eixos, camadas e composição de dobras antes de partir para modelos maiores.',
    category: 'Fundamentos',
    difficulty: 'Iniciante',
    estimatedMinutes: 3,
    foldCount: 2,
    model: squarePracticeModel,
    steps: squarePracticeSteps,
    accent: 'amber',
  },
  {
    id: 'coracao', title: 'Coração de origami',
    subtitle: 'Crie um coração e investigue simetria, mediatriz e a diferença entre área de papel e silhueta.',
    category: 'Figuras', difficulty: 'Fácil', estimatedMinutes: 8, foldCount: 8,
    model: heartModel, steps: heartSteps, accent: 'rose',
  },
  {
    id: 'laboratorio-dobras', title: 'Dobras coordenadas',
    subtitle: 'Abra um bolso, experimente squash folds e compare inversões para dentro e para fora.',
    category: 'Técnicas', difficulty: 'Médio', estimatedMinutes: 7, foldCount: 6,
    model: vertexLabModel, steps: vertexLabSteps, accent: 'amber',
  },

]

export function findCatalogItem(id: string): OrigamiCatalogItem | undefined {
  return origamiCatalog.find((item) => item.id === id)
}

