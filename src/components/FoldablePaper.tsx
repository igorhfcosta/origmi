import { Edges, Line } from '@react-three/drei'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { DoubleSide, Group } from 'three'
import { durationForSpeed, foldProgressToAngle } from '../engine/foldMath'
import type { FoldDirection, PlaybackSpeed } from '../engine/types'
import { useReducedMotion } from './useReducedMotion'

interface FoldablePaperProps {
  targetProgress: number
  direction: FoldDirection
  replayToken: number
  speed: PlaybackSpeed
  showGuide: boolean
}

const PAPER_WIDTH = 4
const PAPER_HEIGHT = 4
const HALF_WIDTH = PAPER_WIDTH / 2

export function FoldablePaper({ targetProgress, direction, replayToken, speed, showGuide }: FoldablePaperProps) {
  const flapRef = useRef<Group>(null)
  const previousReplayToken = useRef(replayToken)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const flap = flapRef.current
    if (!flap) return

    const targetAngle = foldProgressToAngle(targetProgress, 180, direction)
    const baseDuration = reducedMotion ? 0.01 : 1.45
    const duration = durationForSpeed(baseDuration, speed)
    const isReplay = replayToken !== previousReplayToken.current
    previousReplayToken.current = replayToken

    gsap.killTweensOf(flap.rotation)

    if (isReplay) {
      flap.rotation.y = targetProgress >= 1
        ? foldProgressToAngle(0, 180, direction)
        : foldProgressToAngle(1, 180, direction)
    }

    gsap.to(flap.rotation, {
      y: targetAngle,
      duration,
      ease: 'power2.inOut',
    })

    return () => {
      gsap.killTweensOf(flap.rotation)
    }
  }, [direction, reducedMotion, replayToken, speed, targetProgress])

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh position={[-HALF_WIDTH / 2, 0, 0]} receiveShadow castShadow>
        <planeGeometry args={[HALF_WIDTH, PAPER_HEIGHT]} />
        <meshStandardMaterial color="#f5efe2" roughness={0.84} side={DoubleSide} />
        <Edges color="#6e6678" threshold={15} />
      </mesh>

      <group ref={flapRef}>
        <mesh position={[HALF_WIDTH / 2, 0, 0.008]} receiveShadow castShadow>
          <planeGeometry args={[HALF_WIDTH, PAPER_HEIGHT]} />
          <meshStandardMaterial color="#fffaf0" roughness={0.8} side={DoubleSide} />
          <Edges color="#6e6678" threshold={15} />
        </mesh>
      </group>

      {showGuide && (
        <group position={[0, 0, 0.015]}>
          <Line points={[[0, -PAPER_HEIGHT / 2, 0], [0, PAPER_HEIGHT / 2, 0]]} color="#8c63ff" lineWidth={2} dashed dashSize={0.16} gapSize={0.1} />
          <Line points={[[1.35, 0.8, 0.08], [1.05, 1.08, 0.34], [0.6, 1.2, 0.5], [0.16, 1.08, 0.35]]} color="#8c63ff" lineWidth={3} />
        </group>
      )}
    </group>
  )
}
