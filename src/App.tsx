import { lazy, Suspense, useState } from 'react'
import { Library } from './components/Library'
import { SceneBoundary } from './components/SceneBoundary'
import { SceneLoading } from './components/SceneLoading'

import { TopBar } from './components/TopBar'
import { TutorialPanel } from './components/TutorialPanel'
import { findCatalogItem, origamiCatalog } from './data/catalog'
import type { TutorialDocument } from './engine/tutorialDocument'
import { useTutorialStore } from './store/useTutorialStore'

const TutorialEditor = lazy(() => import('./components/TutorialEditor').then((m) => ({ default: m.TutorialEditor })))
const OrigamiScene = lazy(() => import('./components/OrigamiScene').then((module) => ({ default: module.OrigamiScene })))

export default function App() {
  const [customTutorial, setCustomTutorial] = useState<TutorialDocument | null>(null)
  const [editing, setEditing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const currentStep = useTutorialStore((state) => state.currentStep)
  const reset = useTutorialStore((state) => state.reset)
  const catalogItem = selectedId ? findCatalogItem(selectedId) : undefined
  const selected = catalogItem && customTutorial?.catalogId === catalogItem.id
    ? { ...catalogItem, title: customTutorial.title, steps: customTutorial.steps } : catalogItem

  function openTutorial(id: string) {
    reset()
    setCustomTutorial(null)
    setSelectedId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openLibrary() {
    reset()
    setEditing(false)
    setSelectedId(null)
    setCustomTutorial(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function testTutorial(document: TutorialDocument) {
    reset()
    setCustomTutorial(document)
    setSelectedId(document.catalogId)
    setEditing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const safeStepIndex = selected ? Math.min(currentStep, selected.steps.length - 1) : 0
  const step = selected?.steps[safeStepIndex]

  return (
    <div className="app" id="top">
      <TopBar inTutorial={Boolean(selected) || editing} onHome={openLibrary} onEditor={() => setEditing(true)} />
      {editing ? <Suspense fallback={<SceneLoading />}><TutorialEditor initialId={selectedId ?? undefined} initialDocument={customTutorial ?? undefined} onExit={openLibrary} onTest={testTutorial} /></Suspense> : !selected || !step ? (
        <Library items={origamiCatalog} onOpen={openTutorial} />
      ) : (
        <main className="workspace">
          <section className="viewer-column">
            <div className="viewer-heading">
              <div>
                <span className="kicker">{selected.category}</span>
                <h2>{selected.title}</h2>
              </div>
              <span className="difficulty">{customTutorial ? 'Prévia do seu tutorial · ' : '● '} {selected.difficulty} · {selected.foldCount} {selected.foldCount === 1 ? 'dobra' : 'dobras'} · ~{selected.estimatedMinutes} min</span>
            </div>
            <SceneBoundary key={selected.id}><Suspense fallback={<SceneLoading />}><OrigamiScene
              model={selected.model}
              steps={selected.steps}
              step={step}
              stepIndex={safeStepIndex}
            /></Suspense></SceneBoundary>
          </section>
          <TutorialPanel step={step} steps={selected.steps} />
        </main>
      )}
    </div>
  )
}

