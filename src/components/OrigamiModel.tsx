import { Edges, Line } from '@react-three/drei'
import gsap from 'gsap'
import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { DoubleSide, Group, Shape, Vector3 } from 'three'
import { durationForSpeed } from '../engine/foldMath'
import {
  creasesForFace,
  resolveFoldAngles,
  resolveReplayAngles,
  signedFoldAngle,
} from '../engine/origamiEngine'
import type {
  CreaseDefinition,
  FoldGuide,
  OrigamiModelDefinition,
  PaperFace,
  PlaybackSpeed,
  TutorialStep,
} from '../engine/types'
import { useReducedMotion } from './useReducedMotion'

interface OrigamiModelProps {
  model: OrigamiModelDefinition
  steps: readonly TutorialStep[]
  stepIndex: number
  replayToken: number
  speed: PlaybackSpeed
  guide?: FoldGuide
  showGuide: boolean
}

interface FoldPivotProps {
  crease: CreaseDefinition
  targetDegrees: number
  replayDegrees: number
  replayToken: number
  speed: PlaybackSpeed
  duration?: number
  children: ReactNode
}

function FoldPivot({
  crease,
  targetDegrees,
  replayDegrees,
  replayToken,
  speed,
  duration = 1.35,
  children,
}: FoldPivotProps) {
  const rotationRef = useRef<Group>(null)
  const tweenState = useRef({ angle: 0 })
  const previousReplayToken = useRef(replayToken)
  const reducedMotion = useReducedMotion()
  const pivot = useMemo(() => new Vector3(crease.start[0], crease.start[1], 0), [crease.start])
  const axis = useMemo(() => new Vector3(
    crease.end[0] - crease.start[0],
    crease.end[1] - crease.start[1],
    0,
  ).normalize(), [crease.end, crease.start])

  useEffect(() => {
    const rotation = rotationRef.current
    if (!rotation) return

    const isReplay = previousReplayToken.current !== replayToken
    previousReplayToken.current = replayToken
    const targetAngle = signedFoldAngle(targetDegrees, crease.direction)

    gsap.killTweensOf(tweenState.current)

    if (isReplay) {
      tweenState.current.angle = signedFoldAngle(replayDegrees, crease.direction)
      rotation.quaternion.setFromAxisAngle(axis, tweenState.current.angle)
    }

    gsap.to(tweenState.current, {
      angle: targetAngle,
      duration: durationForSpeed(reducedMotion ? 0.01 : duration, speed),
      ease: 'power2.inOut',
      onUpdate: () => rotation.quaternion.setFromAxisAngle(axis, tweenState.current.angle),
    })

    return () => gsap.killTweensOf(tweenState.current)
  }, [axis, crease.direction, duration, reducedMotion, replayDegrees, replayToken, speed, targetDegrees])

  return (
    <group position={pivot}>
      <group ref={rotationRef}>
        <group position={[-pivot.x, -pivot.y, -pivot.z]}>{children}</group>
      </group>
    </group>
  )
}

function PaperFaceMesh({ face, layer }: { face: PaperFace; layer: number }) {
  const shape = useMemo(() => {
    const paperShape = new Shape()
    face.vertices.forEach(([x, y], index) => {
      if (index === 0) paperShape.moveTo(x, y)
      else paperShape.lineTo(x, y)
    })
    paperShape.closePath()
    return paperShape
  }, [face.vertices])

  return (
    <mesh position={[0, 0, layer * 0.006]} receiveShadow castShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        color={face.color ?? '#f7efe1'}
        roughness={0.82}
        side={DoubleSide}
        polygonOffset
        polygonOffsetFactor={-layer}
      />
      <Edges color="#6e6678" threshold={15} />
    </mesh>
  )
}

function FoldGuideOverlay({ model, guide }: { model: OrigamiModelDefinition; guide: FoldGuide }) {
  const crease = model.creases.find((candidate) => candidate.id === guide.creaseId)
  const arrow = useMemo(() => {
    const [fromX, fromY] = guide.arrowFrom
    const [toX, toY] = guide.arrowTo
    const dx = toX - fromX
    const dy = toY - fromY
    const length = Math.hypot(dx, dy) || 1
    const ux = dx / length
    const uy = dy / length
    const nx = -uy
    const ny = ux
    const bend = 0.16
    const headLength = 0.2
    const headWidth = 0.11

    return {
      body: [
        [fromX, fromY, 0.06],
        [(fromX + toX) / 2 + nx * bend, (fromY + toY) / 2 + ny * bend, 0.09],
        [toX, toY, 0.06],
      ] as [number, number, number][],
      head: [
        [toX - ux * headLength + nx * headWidth, toY - uy * headLength + ny * headWidth, 0.06],
        [toX, toY, 0.06],
        [toX - ux * headLength - nx * headWidth, toY - uy * headLength - ny * headWidth, 0.06],
      ] as [number, number, number][],
    }
  }, [guide.arrowFrom, guide.arrowTo])

  if (!crease) return null

  return (
    <group>
      <Line
        points={[[...crease.start, 0.04], [...crease.end, 0.04]]}
        color="#9b78ff"
        lineWidth={2}
        dashed
        dashSize={0.16}
        gapSize={0.1}
      />
      <Line points={arrow.body} color="#a98cff" lineWidth={3} />
      <Line points={arrow.head} color="#a98cff" lineWidth={3} />
    </group>
  )
}

export function OrigamiModel({
  model,
  steps,
  stepIndex,
  replayToken,
  speed,
  guide,
  showGuide,
}: OrigamiModelProps) {
  const targetAngles = useMemo(
    () => resolveFoldAngles(model, steps, stepIndex),
    [model, stepIndex, steps],
  )
  const replayAngles = useMemo(
    () => resolveReplayAngles(model, steps, stepIndex),
    [model, stepIndex, steps],
  )
  const activeDuration = steps[stepIndex]?.fold?.duration

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {model.faces.map((face, layer) => {
        let foldedFace: ReactNode = <PaperFaceMesh face={face} layer={layer} />

        creasesForFace(model, face.id).forEach((crease) => {
          foldedFace = (
            <FoldPivot
              key={`${face.id}-${crease.id}`}
              crease={crease}
              targetDegrees={targetAngles[crease.id] ?? 0}
              replayDegrees={replayAngles[crease.id] ?? 0}
              replayToken={replayToken}
              speed={speed}
              duration={steps[stepIndex]?.fold?.creaseId === crease.id ? activeDuration : undefined}
            >
              {foldedFace}
            </FoldPivot>
          )
        })

        return <group key={face.id}>{foldedFace}</group>
      })}

      {showGuide && guide && <FoldGuideOverlay model={model} guide={guide} />}
    </group>
  )
}
