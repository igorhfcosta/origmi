import { ArrowLeft, ArrowRight, RotateCcw, Sigma } from 'lucide-react'
import { canReplayFold } from '../engine/origamiEngine'
import type { PlaybackSpeed, TutorialStep } from '../engine/types'
import { useTutorialStore } from '../store/useTutorialStore'

const speeds: PlaybackSpeed[] = [0.5, 1, 1.5, 2]

interface TutorialPanelProps {
  step: TutorialStep
  steps: readonly TutorialStep[]
}

export function TutorialPanel({ step, steps }: TutorialPanelProps) {
  const { currentStep, speed, mathMode, nextStep, previousStep, replayStep, setSpeed, toggleMathMode, reset } = useTutorialStore()
  const progress = ((currentStep + 1) / steps.length) * 100
  const isFinalStep = currentStep === steps.length - 1

  return (
    <aside className="tutorial-panel">
      <div>
        <div className="step-meta">
          <span>{step.eyebrow}</span>
          <span>Etapa {currentStep + 1} de {steps.length}</span>
        </div>
        <h1>{step.title}</h1>
        <p className="instruction">{step.instruction}</p>
      </div>

      <div className="progress-track" aria-label={`${Math.round(progress)}% concluído`}><span style={{ width: `${progress}%` }} /></div>

      <button className={`math-card ${mathMode ? 'active' : ''}`} type="button" onClick={toggleMathMode} aria-pressed={mathMode}>
        <span className="math-icon"><Sigma size={18} /></span>
        <span>
          <strong>Modo Matemática</strong>
          <small>{mathMode ? step.mathNote : 'Toque para enxergar a geometria desta dobra.'}</small>
        </span>
      </button>

      <div className="speed-row">
        <span>Velocidade</span>
        <div className="speed-control" aria-label="Velocidade da animação">
          {speeds.map((value) => (
            <button key={value} className={speed === value ? 'active' : ''} type="button" onClick={() => setSpeed(value)}>{value}×</button>
          ))}
        </div>
      </div>

      <div className="tutorial-actions">
        <button type="button" onClick={previousStep} disabled={currentStep === 0}><ArrowLeft size={18} />Voltar</button>
        <button className="replay" type="button" onClick={replayStep} disabled={!canReplayFold(steps, currentStep)}><RotateCcw size={17} />Repetir</button>
        <button className="primary" type="button" onClick={isFinalStep ? reset : () => nextStep(steps.length - 1)}>
          {isFinalStep ? 'Recomeçar' : 'Próximo'}<ArrowRight size={18} />
        </button>
      </div>
    </aside>
  )
}
