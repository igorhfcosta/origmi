interface CanvasLike {
  getContext: (contextId: string) => unknown
}

export function supportsWebGL(
  createCanvas: (() => CanvasLike) | undefined = typeof document === 'undefined'
    ? undefined
    : () => document.createElement('canvas'),
): boolean {
  if (!createCanvas) return false

  try {
    const canvas = createCanvas()
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}
