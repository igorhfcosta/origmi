import { ArrowRight, Clock3, Origami, Shapes } from 'lucide-react'
import type { OrigamiCatalogItem } from '../data/catalog'

interface LibraryProps {
  items: readonly OrigamiCatalogItem[]
  onOpen: (id: string) => void
}

export function Library({ items, onOpen }: LibraryProps) {
  return (
    <main className="library-page">
      <section className="library-hero">
        <span className="kicker">Aprenda dobrando</span>
        <h1>Origamis em 3D, passo a passo.</h1>
        <p>Escolha um tutorial, acompanhe cada dobra com câmera guiada e use o Modo Matemática para enxergar a geometria por trás do papel.</p>
      </section>

      <section className="library-section" aria-labelledby="library-title">
        <div className="library-section-heading">
          <div>
            <span className="kicker">Biblioteca inicial</span>
            <h2 id="library-title">Escolha um tutorial</h2>
          </div>
          <span className="library-count">{items.length} conteúdos</span>
        </div>

        <div className="origami-grid">
          {items.map((item) => (
            <article className={`origami-card ${item.accent}`} key={item.id}>
              <div className="origami-card-preview" aria-hidden="true">
                {item.category === 'Animais' ? <Origami size={58} strokeWidth={1.25} /> : <Shapes size={58} strokeWidth={1.25} />}
                <span>{item.foldCount} {item.foldCount === 1 ? 'dobra' : 'dobras'}</span>
              </div>
              <div className="origami-card-body">
                <div className="origami-card-meta">
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{item.difficulty}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.subtitle}</p>
                <div className="origami-card-footer">
                  <span className="duration"><Clock3 size={14} />~{item.estimatedMinutes} min</span>
                  <button type="button" onClick={() => onOpen(item.id)}>
                    Abrir tutorial <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
