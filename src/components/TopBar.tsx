import { Origami, Sparkles } from 'lucide-react'

export function TopBar() {
  return (
    <header className="topbar">
      <a className="brand" href="#top" aria-label="OrigamiLab — início">
        <span className="brand-mark"><Origami size={19} strokeWidth={1.8} /></span>
        <span>OrigamiLab</span>
      </a>
      <div className="prototype-badge"><Sparkles size={14} />Protótipo 01</div>
    </header>
  )
}
