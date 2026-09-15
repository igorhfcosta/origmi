import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { AlertTriangle, Scan } from 'lucide-react'
import type { MutableRefObject } from 'react'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { CameraPose, OrigamiModelDefinition, TutorialStep } from '../engine/types'
import { supportsWebGL } from '../engine/webglSupport'
import { useTutorialStore } from '../store/useTutorialStore'
import { OrigamiModel } from './OrigamiModel'
import { useReducedMotion } from './useReducedMotion'

interface OrigamiSceneProps {
  model: OrigamiModelDefinition
  steps: readonly TutorialStep[]
  step: TutorialStep
  stepIndex: number
}

const defaultCameraPose: CameraPose = {
  position: [0, 6.8, 2.5],
  target: [0, 0, 0],
  fov: 39,
  duration: 0.8,
}

function CameraDirector({
  pose,
  controlsRef,
  speed,
}: {
  pose: CameraPose
  controlsRef: MutableRefObject<OrbitControlsImpl | null>
  speed: number
}) {
  const { camera } = useThree()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const perspectiveCamera = camera as PerspectiveCamera
    const controls = controlsRef.current
    const targetState = {
      x: controls?.target.x ?? pose.target[0],
      y: controls?.target.y ?? pose.target[1],
      z: controls?.target.z ?? pose.target[2],
    }
    const duration = reducedMotion ? 0.01 : (pose.duration ?? 0.8) / speed

    gsap.killTweensOf(camera.position)
    gsap.killTweensOf(targetState)
    gsap.killTweensOf(perspectiveCamera)

    const update = () => {
      if (controls) {
        controls.target.set(targetState.x, targetState.y, targetState.z)
        controls.update()
      }
      perspectiveCamera.updateProjectionMatrix()
    }

    gsap.to(camera.position, {
      x: pose.position[0],
      y: pose.position[1],
      z: pose.position[2],
      duration,
      ease: 'power2.inOut',
      onUpdate: update,
    })
    gsap.to(targetState, {
      x: pose.target[0],
      y: pose.target[1],
      z: pose.target[2],
      duration,
      ease: 'power2.inOut',
      onUpdate: update,
    })
    gsap.to(perspectiveCamera, {
      fov: pose.fov ?? 39,
      duration,
      ease: 'power2.inOut',
      onUpdate: update,
    })

    return () => {
      gsap.killTweensOf(camera.position)
      gsap.killTweensOf(targetState)
      gsap.killTweensOf(perspectiveCamera)
    }
  }, [camera, controlsRef, pose, reducedMotion, speed])

  return null
}

export function OrigamiScene({ model, steps, step, stepIndex }: OrigamiSceneProps) {
  const speed = useTutorialStore((state) => state.speed)
  const replayToken = useTutorialStore((state) => state.replayToken)
  const webglAvailable = useMemo(supportsWebGL, [])
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const pose = step.camera ?? defaultCameraPose

  function resetCamera() {
    const controls = controlsRef.current
    if (!controls) return

    const camera = controls.object as PerspectiveCamera
    camera.position.set(...pose.position)
    camera.fov = pose.fov ?? 39
    camera.updateProjectionMatrix()
    controls.target.set(...pose.target)
    controls.update()
  }

  return (
    <div
      className="scene-shell"
      aria-label={webglAvailable ? 'Visualização 3D interativa da dobra' : 'Aviso de indisponibilidade da visualização 3D'}
    >
      {webglAvailable ? (
        <Canvas shadows dpr={[1, 1.75]} camera={{ position: defaultCameraPose.position, fov: 39, near: 0.1, far: 100 }}>
          <color attach="background" args={['#1b1725']} />
          <fog attach="fog" args={['#1b1725', 8, 15]} />
          <ambientLight intensity={0.55} />
          <directionalLight castShadow position={[3.5, 6, 4]} intensity={2.3} shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <Suspense fallback={null}>
            <group position={[0, 0.12, 0]}>
              <OrigamiModel
                model={model}
                steps={steps}
                stepIndex={stepIndex}
                replayToken={replayToken}
                speed={speed}
                guide={step.guide}
                showGuide={step.showGuide}
              />
            </group>
            <ContactShadows position={[0, 0, 0]} opacity={0.42} scale={8} blur={2.6} far={4} />
            <Environment preset="studio" environmentIntensity={0.3} />
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            minDistance={4.2}
            maxDistance={10}
            minPolarAngle={0.12}
            maxPolarAngle={1.45}
            target={[0, 0, 0]}
          />
          <CameraDirector pose={pose} controlsRef={controlsRef} speed={speed} />
        </Canvas>
      ) : (
        <div className="webgl-fallback" role="status">
          <span className="webgl-fallback-icon"><AlertTriangle size={22} /></span>
          <strong>Visualização 3D indisponível</strong>
          <p>Ative a aceleração de hardware do navegador ou abra o OrigamiLab em um aparelho com suporte a WebGL.</p>
        </div>
      )}
      <div className="scene-status" aria-label="Modelo carregado">
        <span className={webglAvailable ? undefined : 'warning'} />
        {webglAvailable ? `${model.name} carregado` : 'WebGL não detectado'}
      </div>
      {webglAvailable && (
        <button className="scene-view-button" type="button" onClick={resetCamera}>
          <Scan size={15} />
          Vista da etapa
        </button>
      )}
      {webglAvailable && (
        <div className="scene-hint" aria-hidden="true">
          <span>Câmera guiada</span><span>•</span><span>Arraste para explorar</span><span>•</span><span>Scroll para zoom</span>
        </div>
      )}
    </div>
  )
}
