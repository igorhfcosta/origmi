import { BookOpen, Origami, Sparkles } from 'lucide-react'

interface TopBarProps {
  inTutorial: boolean
  onHome: () => void
}

export function TopBar({ inTutorial, onHome }: TopBarProps) {
  return (
    <header className="topbar">
      <button className="brand brand-button" type="button" onClick={onHome} aria-label="OrigamiLab — biblioteca">
        <span className="brand-mark"><Origami size={19} strokeWidth={1.8} /></span>
        <span>OrigamiLab</span>
      </button>
      <div className="topbar-actions">
        {inTutorial && (
          <button className="library-button" type="button" onClick={onHome}>
            <BookOpen size={15} />Biblioteca
          </button>
        )}
        <div className="prototype-badge"><Sparkles size={14} />MVP 04</div>
      </div>
    </header>
  )
}
