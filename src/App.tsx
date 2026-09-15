import { useState } from 'react'
import { Library } from './components/Library'
import { OrigamiScene } from './components/OrigamiScene'
import { TopBar } from './components/TopBar'
import { TutorialPanel } from './components/TutorialPanel'
import { findCatalogItem, origamiCatalog } from './data/catalog'
import { useTutorialStore } from './store/useTutorialStore'

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const currentStep = useTutorialStore((state) => state.currentStep)
  const reset = useTutorialStore((state) => state.reset)
  const selected = selectedId ? findCatalogItem(selectedId) : undefined

  function openTutorial(id: string) {
    reset()
    setSelectedId(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function openLibrary() {
    reset()
    setSelectedId(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const safeStepIndex = selected ? Math.min(currentStep, selected.steps.length - 1) : 0
  const step = selected?.steps[safeStepIndex]

  return (
    <div className="app" id="top">
      <TopBar inTutorial={Boolean(selected)} onHome={openLibrary} />
      {!selected || !step ? (
        <Library items={origamiCatalog} onOpen={openTutorial} />
      ) : (
        <main className="workspace">
          <section className="viewer-column">
            <div className="viewer-heading">
              <div>
                <span className="kicker">{selected.category}</span>
                <h2>{selected.title}</h2>
              </div>
              <span className="difficulty">● {selected.difficulty} · {selected.foldCount} {selected.foldCount === 1 ? 'dobra' : 'dobras'} · ~{selected.estimatedMinutes} min</span>
            </div>
            <OrigamiScene
              model={selected.model}
              steps={selected.steps}
              step={step}
              stepIndex={safeStepIndex}
            />
          </section>
          <TutorialPanel step={step} steps={selected.steps} />
        </main>
      )}
    </div>
  )
}
