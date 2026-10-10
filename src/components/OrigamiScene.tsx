import { OrbitControls } from '@react-three/drei'
import { Canvas, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import { AlertTriangle, Camera, Scan } from 'lucide-react'
import type { MutableRefObject } from 'react'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { CameraPose, OrigamiModelDefinition, PlaybackSpeed, Point2D, TutorialStep } from '../engine/types'
import { supportsWebGL } from '../engine/webglSupport'
import { useTutorialStore } from '../store/useTutorialStore'
import { OrigamiModel, type AnimationPhase } from './OrigamiModel'
import { useReducedMotion } from './useReducedMotion'

interface OrigamiSceneProps {
  model: OrigamiModelDefinition
  steps: readonly TutorialStep[]
  step: TutorialStep
  stepIndex: number
  animate?: boolean
  speed?: PlaybackSpeed
  replayToken?: number
  mathMode?: boolean
  selectedFaceId?: string
  onPickFace?: (faceId: string, at: Point2D) => void
  onCameraCapture?: (pose: CameraPose) => void
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
  const { camera, invalidate } = useThree()
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
      invalidate()
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

    const stopGuidedCamera = () => {
      gsap.killTweensOf(camera.position)
      gsap.killTweensOf(targetState)
      gsap.killTweensOf(perspectiveCamera)
    }
    controls?.addEventListener('start', stopGuidedCamera)
    return () => {
      controls?.removeEventListener('start', stopGuidedCamera)
      gsap.killTweensOf(camera.position)
      gsap.killTweensOf(targetState)
      gsap.killTweensOf(perspectiveCamera)
    }
  }, [camera, controlsRef, invalidate, pose, reducedMotion, speed])

  return null
}

export function OrigamiScene({ model, steps, step, stepIndex, animate = true, speed: suppliedSpeed, replayToken: suppliedReplay,
  mathMode: suppliedMath, selectedFaceId, onPickFace, onCameraCapture }: OrigamiSceneProps) {
  const storeSpeed = useTutorialStore((state) => state.speed)
  const storeReplay = useTutorialStore((state) => state.replayToken)
  const storeMath = useTutorialStore((state) => state.mathMode)
  const speed = suppliedSpeed ?? storeSpeed
  const replayToken = suppliedReplay ?? storeReplay
  const mathMode = suppliedMath ?? storeMath
  const [phase, setPhase] = useState<AnimationPhase>('ready')
  const [ready, setReady] = useState(false)
  const economical = useMemo(() => window.matchMedia('(max-width: 760px)').matches || (navigator.hardwareConcurrency ?? 8) <= 4, [])
  const webglAvailable = useMemo(supportsWebGL, [])
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const pose = step.camera ?? defaultCameraPose

  function captureCamera() {
    const controls = controlsRef.current
    if (!controls || !onCameraCapture) return
    const camera = controls.object as PerspectiveCamera
    onCameraCapture({ position: camera.position.toArray() as [number, number, number],
      target: controls.target.toArray() as [number, number, number], fov: camera.fov, duration: pose.duration ?? 0.8 })
  }

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
        <Canvas frameloop="demand" shadows={!economical} dpr={[1, economical ? 1.25 : 1.75]} onCreated={() => setReady(true)} gl={{ antialias: !economical, powerPreference: 'low-power' }} camera={{ position: defaultCameraPose.position, fov: 39, near: 0.1, far: 100 }}>
          <color attach="background" args={['#1b1725']} />
          <fog attach="fog" args={['#1b1725', 8, 15]} />
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#e5daff', '#6b5967', 0.9]} />
          <directionalLight castShadow={!economical} position={[3.5, 6, 4]} intensity={2.3}
            shadow-mapSize-width={1024} shadow-mapSize-height={1024} shadow-bias={-0.0002} shadow-normalBias={0.015} />
          <Suspense fallback={null}>
            <group position={[0, 0.12, 0]}>
              <OrigamiModel
                model={model}
                displayStep={step}
                steps={steps}
                stepIndex={stepIndex}
                replayToken={replayToken}
                speed={speed}
                mathMode={mathMode}
                animate={animate}
                selectedFaceId={selectedFaceId}
                onPickFace={onPickFace}
                onPhaseChange={setPhase}
              />
            </group>
            {!economical && <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
              <circleGeometry args={[5, 32]} /><shadowMaterial transparent opacity={0.15} />
            </mesh>}
          </Suspense>
          <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={Boolean(onCameraCapture)}
            minDistance={4.2}
            maxDistance={10}
            minPolarAngle={0.12}
            maxPolarAngle={Math.PI - 0.12}
            target={[0, 0, 0]}
          />
          <CameraDirector pose={pose} controlsRef={controlsRef} speed={speed} />
        </Canvas>
      ) : (
        <div className="webgl-fallback" role="status">
          <span className="webgl-fallback-icon"><AlertTriangle size={22} /></span>
          <strong>Visualização 3D indisponível</strong>
          <p>Ative a aceleração de hardware do navegador ou abra o OrigamiLab em um aparelho com suporte a WebGL 2.</p>
        </div>
      )}
      <div className="scene-status" role="status" aria-live="polite">
        <span className={webglAvailable ? undefined : 'warning'} />
        {webglAvailable ? !ready ? 'Preparando visualização…' : phase === 'preparing' ? 'Em amarelo: faces que vão se mover' : phase === 'folding' ? 'Acompanhe a dobra' : 'Explore o resultado' : 'WebGL não detectado'}
      </div>
      {webglAvailable && (
        <button className="scene-view-button" type="button" onClick={resetCamera}>
          <Scan size={15} />
          Vista da etapa
        </button>
      )}
      {webglAvailable && onCameraCapture && <button className="scene-capture-button" type="button" onClick={captureCamera} disabled={!ready}>
        <Camera size={16} /> Usar esta vista
      </button>}
      {webglAvailable && (
        <div className="scene-hint" aria-hidden="true">
          <span>Câmera guiada</span><span>•</span><span>Arraste para explorar</span><span>•</span><span>Pinça ou scroll para zoom</span>
        </div>
      )}
    </div>
  )
}

