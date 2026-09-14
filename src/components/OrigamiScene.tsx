import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AlertTriangle } from 'lucide-react'
import { Suspense, useMemo } from 'react'
import { activeOrigamiModel } from '../data/origamiModel'
import { tutorialSteps } from '../data/tutorial'
import type { TutorialStep } from '../engine/types'
import { supportsWebGL } from '../engine/webglSupport'
import { useTutorialStore } from '../store/useTutorialStore'
import { OrigamiModel } from './OrigamiModel'

interface OrigamiSceneProps {
  step: TutorialStep
}

export function OrigamiScene({ step }: OrigamiSceneProps) {
  const speed = useTutorialStore((state) => state.speed)
  const replayToken = useTutorialStore((state) => state.replayToken)
  const currentStep = useTutorialStore((state) => state.currentStep)
  const webglAvailable = useMemo(supportsWebGL, [])

  return (
    <div
      className="scene-shell"
      aria-label={webglAvailable ? 'Visualização 3D interativa da dobra' : 'Aviso de indisponibilidade da visualização 3D'}
    >
      {webglAvailable ? (
        <Canvas shadows dpr={[1, 1.75]} camera={{ position: [5.2, 4.4, 5.8], fov: 39, near: 0.1, far: 100 }}>
          <color attach="background" args={['#1b1725']} />
          <fog attach="fog" args={['#1b1725', 8, 15]} />
          <ambientLight intensity={0.55} />
          <directionalLight castShadow position={[3.5, 6, 4]} intensity={2.3} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <Suspense fallback={null}>
            <group position={[0, 0.12, 0]}>
              <OrigamiModel
                model={activeOrigamiModel}
                steps={tutorialSteps}
                stepIndex={currentStep}
                replayToken={replayToken}
                speed={speed}
                guide={step.guide}
                showGuide={step.showGuide}
              />
            </group>
            <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={8} blur={2.6} far={4} />
            <Environment preset="studio" environmentIntensity={0.3} />
          </Suspense>
          <OrbitControls makeDefault enablePan={false} minDistance={4.8} maxDistance={10} minPolarAngle={0.35} maxPolarAngle={1.45} target={[0, 0, 0]} />
        </Canvas>
      ) : (
        <div className="webgl-fallback" role="status">
          <span className="webgl-fallback-icon"><AlertTriangle size={22} /></span>
          <strong>Visualização 3D indisponível</strong>
          <p>Ative a aceleração de hardware do navegador ou abra o OrigamiLab em um aparelho com suporte a WebGL.</p>
        </div>
      )}
      <div className="scene-status" aria-label="Modelo FOLD carregado">
        <span className={webglAvailable ? undefined : 'warning'} />
        {webglAvailable ? 'dog.fold carregado' : 'WebGL não detectado'}
      </div>
      {webglAvailable && (
        <div className="scene-hint" aria-hidden="true">
          <span>Arraste para girar</span><span>•</span><span>Scroll para zoom</span>
        </div>
      )}
    </div>
  )
}
