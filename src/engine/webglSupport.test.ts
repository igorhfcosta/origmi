import { describe, expect, it } from 'vitest'
import { supportsWebGL } from './webglSupport'

describe('supportsWebGL', () => {
  it('accepts a browser with a WebGL 2 context', () => {
    expect(supportsWebGL(() => ({ getContext: (id) => id === 'webgl2' ? {} : null }))).toBe(true)
  })

  it('falls back to WebGL 1', () => {
    expect(supportsWebGL(() => ({ getContext: (id) => id === 'webgl' ? {} : null }))).toBe(true)
  })

  it('rejects unsupported and failing contexts safely', () => {
    expect(supportsWebGL(() => ({ getContext: () => null }))).toBe(false)
    expect(supportsWebGL(() => ({ getContext: () => { throw new Error('blocked') } }))).toBe(false)
  })
})
