import { Component, type ErrorInfo, type ReactNode } from 'react'

export class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.error('Falha ao abrir a visualização 3D:', error) }
  render() {
    return this.state.failed ? <div className="scene-shell scene-loading" role="alert">
      <strong>Não foi possível abrir a visualização.</strong>
      <p>Verifique sua conexão e tente novamente.</p>
      <button type="button" onClick={() => window.location.reload()}>Recarregar</button>
    </div> : this.props.children
  }
}
