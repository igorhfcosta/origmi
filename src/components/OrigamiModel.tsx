import { Edges, Line } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import gsap from 'gsap'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Color, DoubleSide, Group, Matrix4, Mesh, MeshStandardMaterial, Shape, Vector3 } from 'three'
import { createInitialFoldAngles, phasesForStep, replayActionIndex, resolveCreaseAxes, resolveFinishState,
  resolveFoldAngles, resolveMovingFaceIds, resolvePhaseAngles, transformPointWithAxes,
  type FoldAngles, type ResolvedCreaseAxis } from '../engine/origamiEngine'
import type { FaceDecoration, FoldGuide, OrigamiModelDefinition, PaperFace, PlaybackSpeed, TutorialStep, Point2D } from '../engine/types'
import { MathOverlay } from './MathOverlay'
import { useReducedMotion } from './useReducedMotion'

export type AnimationPhase = 'preparing' | 'folding' | 'ready'
interface OrigamiModelProps {
  model: OrigamiModelDefinition
  displayStep?: TutorialStep
  steps: readonly TutorialStep[]
  stepIndex: number
  replayToken: number
  speed: PlaybackSpeed
  mathMode: boolean
  animate?: boolean
  selectedFaceId?: string
  onPickFace?: (faceId: string, at: Point2D) => void
  onPhaseChange?: (phase: AnimationPhase) => void
}

function AnimatedDecoration({ decoration, order, speed }: { decoration: FaceDecoration; order: number; speed: PlaybackSpeed }) {
  const meshRef = useRef<Mesh>(null)
  const { invalidate } = useThree()
  const reducedMotion = useReducedMotion()
  useEffect(() => {
    if (!meshRef.current) return
    const tween = gsap.to(meshRef.current.scale, {
      x: 1, y: 1, z: 1, duration: reducedMotion ? 0 : 0.35 / speed,
      delay: reducedMotion ? 0 : (0.25 + order * 0.18) / speed, ease: 'power2.out', onUpdate: invalidate,
    })
    return () => { tween.kill() }
  }, [invalidate, order, reducedMotion, speed])
  return <mesh ref={meshRef} scale={0} renderOrder={20}
    position={[...decoration.position, decoration.surface === 'back' ? -0.025 : 0.025]}>
    <circleGeometry args={[decoration.size, 24]} />
    <meshBasicMaterial color={decoration.color} side={DoubleSide} depthTest={false} depthWrite={false} />
  </mesh>
}

function PaperFaceMesh({ face, layer, model, step, finish, highlighted, selected, speed, replayToken, onPick }: {
  face: PaperFace; layer: number; model: OrigamiModelDefinition; step: TutorialStep;
  finish?: boolean; highlighted: boolean; selected: boolean; speed: PlaybackSpeed; replayToken: number;
  onPick?: (faceId: string, at: Point2D) => void;
}) {
  const materialRef = useRef<MeshStandardMaterial>(null)
  const meshRef = useRef<Mesh>(null)
  const { invalidate } = useThree()
  const reducedMotion = useReducedMotion()
  const color = finish === false ? '#f7efe1' : face.color ?? '#f7efe1'
  useEffect(() => {
    const material = materialRef.current
    if (!material) return
    if (finish) material.color.set('#f7efe1')
    const target = new Color(color)
    const tween = gsap.to(material.color, {
      r: target.r, g: target.g, b: target.b, duration: reducedMotion || !finish ? 0 : 0.7 / speed, onUpdate: invalidate,
    })
    return () => { tween.kill() }
  }, [color, finish, invalidate, reducedMotion, replayToken, speed])
  const shape = useMemo(() => {
    const value = new Shape()
    face.vertices.forEach(([x, y], index) => index === 0 ? value.moveTo(x, y) : value.lineTo(x, y))
    value.closePath()
    return value
  }, [face.vertices])
  function pick(event: ThreeEvent<MouseEvent>) {
    if (!onPick || !meshRef.current) return
    event.stopPropagation()
    const local = meshRef.current.worldToLocal(event.point.clone())
    onPick(face.id, [Number(local.x.toFixed(3)), Number(local.y.toFixed(3))])
  }
  return <>
    <mesh ref={meshRef} onClick={onPick ? pick : undefined} castShadow receiveShadow renderOrder={face.renderOrder ?? layer}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial ref={materialRef} color={color} emissive={selected ? '#72e3d3' : '#eeb64b'}
        emissiveIntensity={selected ? 0.5 : highlighted ? 0.65 : 0} roughness={0.9} side={DoubleSide}
        polygonOffset polygonOffsetFactor={-layer} polygonOffsetUnits={-layer} />
      <Edges color={highlighted ? '#ffce71' : selected ? '#7ce9d9' : '#6e6678'} threshold={15} depthTest={false} />
    </mesh>
    {finish !== false && model.decorations?.filter((d) => d.faceId === face.id)
      .map((decoration, order) => <AnimatedDecoration key={`${decoration.id}-${replayToken}`} decoration={decoration} order={order} speed={speed} />)}
    {step.annotations?.filter((a) => a.faceId === face.id).map((annotation) => <MathOverlay key={annotation.id} annotation={annotation} face={face} />)}
  </>
}

function GuideOverlay({ guide, axes, model, angles }: {
  guide: FoldGuide; axes: Record<string, ResolvedCreaseAxis>; model: OrigamiModelDefinition; angles: FoldAngles;
}) {
  const axis = axes[guide.creaseId]
  if (!axis) return null
  const project = (p: Point2D) => guide.faceId
    ? transformPointWithAxes(model, guide.faceId, [p[0], p[1], 0.05], angles, axes)
    : [p[0], p[1], 0.05] as const
  const from = new Vector3(...project(guide.arrowFrom)), to = new Vector3(...project(guide.arrowTo))
  const back = from.clone().sub(to).normalize().multiplyScalar(0.18)
  const normal = new Vector3(-back.y, back.x, back.z).normalize().multiplyScalar(0.09)
  const head = [to.clone().add(back).add(normal), to, to.clone().add(back).sub(normal)]
  return <group>
    <Line points={[axis.start, axis.end]} color="#b89bff" lineWidth={2} dashed dashSize={0.12} gapSize={0.08} depthTest={false} />
    <Line points={[from, to]} color="#b89bff" lineWidth={3} depthTest={false} />
    <Line points={head} color="#b89bff" lineWidth={3} depthTest={false} />
  </group>
}

export function OrigamiModel({ model, steps, stepIndex, replayToken, speed, mathMode, animate = true,
  selectedFaceId, onPickFace, onPhaseChange, displayStep }: OrigamiModelProps) {
  const { invalidate } = useThree()
  const reducedMotion = useReducedMotion()
  const faces = useRef(new Map<string, Group>())
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const previousReplay = useRef(replayToken)
  const onPhaseRef = useRef(onPhaseChange)
  onPhaseRef.current = onPhaseChange
  const [phase, setPhase] = useState<AnimationPhase>('ready')
  const [guideState, setGuideState] = useState(() => resolveFoldAngles(model, steps, stepIndex - 1))
  const currentStep = displayStep ?? steps[stepIndex]
  const replayIndex = replayActionIndex(steps, stepIndex)
  const [actionIndex, setActionIndex] = useState(stepIndex)
  const movingFaces = useMemo(() => new Set(resolveMovingFaceIds(model, steps, actionIndex)), [actionIndex, model, steps])

  useEffect(() => {
    const isReplay = previousReplay.current !== replayToken
    previousReplay.current = replayToken
    const index = isReplay && replayIndex >= 0 ? replayIndex : stepIndex
    setActionIndex(index)
    const phases = animate ? phasesForStep(steps[index]) : []
    const from = phases.length ? resolveFoldAngles(model, steps, index - 1) : resolveFoldAngles(model, steps, stepIndex)
    const matrix = new Matrix4()
    const apply = (angles: FoldAngles) => {
      const axes = resolveCreaseAxes(model, angles)
      for (const face of model.faces) {
        const group = faces.current.get(face.id)
        if (!group) continue
        const project = (p: [number, number, number]) => new Vector3(...transformPointWithAxes(model, face.id, p, angles, axes))
        const origin = project([0, 0, 0])
        const x = project([1, 0, 0]).sub(origin), y = project([0, 1, 0]).sub(origin), z = x.clone().cross(y)
        matrix.makeBasis(x, y, z).setPosition(origin)
        group.matrix.copy(matrix)
        group.matrixWorldNeedsUpdate = true
      }
      invalidate()
    }
    const report = (value: AnimationPhase) => { setPhase(value); onPhaseRef.current?.(value) }
    timeline.current?.kill()
    apply(from)
    setGuideState(from)
    if (!phases.length || reducedMotion) {
      apply(resolveFoldAngles(model, steps, stepIndex))
      report('ready')
      return
    }
    report('preparing')
    const sequence = gsap.timeline()
    timeline.current = sequence
    sequence.to({}, { duration: Math.max(0.7, currentStep?.camera?.duration ?? 0.8) })
    let start = from
    for (const foldPhase of phases) {
      const phaseStart = start
      const state = { progress: 0 }
      sequence.to(state, {
        progress: 1, duration: foldPhase.duration ?? foldPhase.folds?.[0]?.duration ?? 1.35, ease: 'power2.inOut',
        onStart: () => report('folding'),
        onUpdate: () => apply(resolvePhaseAngles(model, foldPhase, phaseStart, state.progress)),
      })
      start = resolvePhaseAngles(model, foldPhase, start)
    }
    sequence.call(() => report('ready'))
    return () => { sequence.kill() }
  }, [animate, currentStep?.camera?.duration, invalidate, model, reducedMotion, replayIndex, replayToken, stepIndex, steps])
  useEffect(() => { timeline.current?.timeScale(speed) }, [phase, speed])
  const guide = steps[actionIndex]?.guide
  const renderedStep = mathMode ? currentStep : { ...currentStep, annotations: undefined }
  const axes = resolveCreaseAxes(model, guideState ?? createInitialFoldAngles(model))
  return <group rotation={[-Math.PI / 2, 0, 0]}>
    {model.faces.map((face, layer) => <group key={face.id} matrixAutoUpdate={false} ref={(group) => {
      if (group) faces.current.set(face.id, group)
      else faces.current.delete(face.id)
    }}>
      <PaperFaceMesh face={face} layer={layer} model={{ ...model, decorations: model.decorations?.filter((d) => (d.showFromStep ?? 0) <= stepIndex) }}
        step={renderedStep} finish={resolveFinishState(steps, stepIndex)} speed={speed} replayToken={replayToken}
        highlighted={phase === 'preparing' && movingFaces.has(face.id)} selected={selectedFaceId === face.id} onPick={onPickFace} />
    </group>)}
    {guide && steps[actionIndex]?.showGuide && phase === 'preparing' && <GuideOverlay guide={guide} axes={axes} model={model} angles={guideState} />}
    {guide && currentStep?.showGuide && !phasesForStep(currentStep).length && phase === 'ready' && <GuideOverlay guide={guide}
      axes={resolveCreaseAxes(model, resolveFoldAngles(model, steps, stepIndex))} model={model} angles={resolveFoldAngles(model, steps, stepIndex)} />}
  </group>
}
