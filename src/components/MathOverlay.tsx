import { Html, Line } from '@react-three/drei'
import type { MathAnnotation, PaperFace, Point2D } from '../engine/types'

const lift = (point: Point2D): [number, number, number] => [point[0], point[1], 0.036]

export function MathOverlay({ annotation, face }: { annotation: MathAnnotation; face: PaperFace }) {
  const color = annotation.color ?? '#f6ce78'
  let anchor: Point2D
  let graphic
  if (annotation.kind === 'segment') {
    anchor = [(annotation.start[0] + annotation.end[0]) / 2, (annotation.start[1] + annotation.end[1]) / 2]
    graphic = <Line points={[lift(annotation.start), lift(annotation.end)]} color={color} lineWidth={2.5}
      dashed={annotation.dashed} dashSize={0.12} gapSize={0.07} depthTest={false} depthWrite={false} />
  } else if (annotation.kind === 'angle') {
    anchor = annotation.vertex
    const first = Math.atan2(annotation.from[1] - anchor[1], annotation.from[0] - anchor[0])
    let sweep = Math.atan2(annotation.to[1] - anchor[1], annotation.to[0] - anchor[0]) - first
    while (sweep > Math.PI) sweep -= 2 * Math.PI
    while (sweep < -Math.PI) sweep += 2 * Math.PI
    const radius = Math.min(0.32, Math.hypot(annotation.from[0] - anchor[0], annotation.from[1] - anchor[1]) * 0.4,
      Math.hypot(annotation.to[0] - anchor[0], annotation.to[1] - anchor[1]) * 0.4)
    const arc = Array.from({ length: 25 }, (_, index): [number, number, number] => [
      anchor[0] + radius * Math.cos(first + sweep * index / 24),
      anchor[1] + radius * Math.sin(first + sweep * index / 24), 0.045,
    ])
    graphic = <>
      <Line points={[lift(annotation.from), lift(anchor), lift(annotation.to)]} color={color} lineWidth={1.6} depthTest={false} depthWrite={false} />
      <Line points={arc} color={color} lineWidth={3} depthTest={false} depthWrite={false} />
    </>
    anchor = [anchor[0] + radius * 1.5 * Math.cos(first + sweep / 2), anchor[1] + radius * 1.5 * Math.sin(first + sweep / 2)]
  } else if (annotation.kind === 'point') {
    anchor = annotation.at
    graphic = <mesh position={lift(anchor)} renderOrder={30}>
      <sphereGeometry args={[0.045, 12, 8]} /><meshBasicMaterial color={color} depthTest={false} depthWrite={false} />
    </mesh>
  } else {
    anchor = face.vertices.reduce<[number, number]>((sum, point) => [sum[0] + point[0] / face.vertices.length, sum[1] + point[1] / face.vertices.length], [0, 0])
    graphic = <Line points={[...face.vertices, face.vertices[0]].map(lift)} color={color} lineWidth={3} depthTest={false} depthWrite={false} />
  }
  return <group>
    {graphic}
    <Html position={[anchor[0], anchor[1], 0.055]} center zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
      <span className="math-label" style={{ borderColor: color, color }}>{annotation.label}</span>
    </Html>
  </group>
}
