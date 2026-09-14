import { OrigamiScene } from './components/OrigamiScene'
import { TopBar } from './components/TopBar'
import { TutorialPanel } from './components/TutorialPanel'
import { activeOrigamiModel } from './data/origamiModel'
import { tutorialSteps } from './data/tutorial'
import { useTutorialStore } from './store/useTutorialStore'

export default function App() {
  const currentStep = useTutorialStore((state) => state.currentStep)
  const step = tutorialSteps[currentStep]

  return (
    <div className="app" id="top">
      <TopBar />
      <main className="workspace">
        <section className="viewer-column">
          <div className="viewer-heading">
            <div>
              <span className="kicker">Primeiro origami completo</span>
              <h2>{activeOrigamiModel.name}</h2>
            </div>
            <span className="difficulty">● Fácil · FOLD {activeOrigamiModel.source?.spec} · 3 dobras</span>
          </div>
          <OrigamiScene step={step} />
        </section>
        <TutorialPanel step={step} />
      </main>
    </div>
  )
}
