import { OrigamiScene } from './components/OrigamiScene'
import { TopBar } from './components/TopBar'
import { TutorialPanel } from './components/TutorialPanel'
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
              <span className="kicker">Fundamentos</span>
              <h2>Primeira dobra</h2>
            </div>
            <span className="difficulty">● Fácil · ~1 min</span>
          </div>
          <OrigamiScene step={step} />
        </section>
        <TutorialPanel step={step} />
      </main>
    </div>
  )
}
