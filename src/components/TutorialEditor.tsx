import { useEffect, useMemo, useRef, useState, lazy, Suspense } from 'react'
import { ArrowDown, ArrowUp, Copy, Download, Play, Plus, RotateCcw, Trash2, Upload } from 'lucide-react'
import { findCatalogItem, origamiCatalog } from '../data/catalog'
import { phasesForStep } from '../engine/origamiEngine'
import { parseTutorial, serializeTutorial, validateTutorialSteps, type TutorialDocument } from '../engine/tutorialDocument'
import type { FoldPhase, MathAnnotation, Point2D, Point3D, TutorialStep, VertexMode } from '../engine/types'
import { SceneBoundary } from './SceneBoundary'
import { SceneLoading } from './SceneLoading'

const OrigamiScene = lazy(() => import('./OrigamiScene').then((m) => ({ default: m.OrigamiScene })))
const draftKey = (id: string) => `origamilab.editor.v1.${id}`
const uniqueId = (prefix: string) => `${prefix}-${crypto.randomUUID()}`
const clone = <T,>(value: T): T => structuredClone(value)
function original(id: string): TutorialDocument {
  const item = findCatalogItem(id) ?? origamiCatalog[0]
  return { version: 1, catalogId: item.id, title: item.title, steps: clone([...item.steps]) }
}
function loadDraft(id: string): { document: TutorialDocument; message: string } {
  try {
    const source = localStorage.getItem(draftKey(id))
    if (source) return { document: parseTutorial(source, origamiCatalog), message: 'Rascunho recuperado deste navegador.' }
  } catch { return { document: original(id), message: 'O rascunho não pôde ser recuperado. O tutorial original foi aberto.' } }
  return { document: original(id), message: '' }
}
function Numeric({ label, value, onChange, min, max, step = 0.1 }: {
  label: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number;
}) {
  return <label className="editor-field"><span>{label}</span><input type="number" value={Number(value.toFixed(3))} step={step} min={min} max={max}
    onChange={(e) => { if (e.target.value !== '' && Number.isFinite(e.target.valueAsNumber)) onChange(Math.min(max ?? Infinity, Math.max(min ?? -Infinity, e.target.valueAsNumber))) }} /></label>
}
function VectorInput({ label, value, onChange }: { label: string; value: Point2D | Point3D; onChange: (v: number[]) => void }) {
  return <fieldset className="vector-input"><legend>{label}</legend><div>
    {value.map((n, i) => <Numeric key={i} label={`${label} ${'XYZ'[i]}`} value={n} min={-100} max={100}
      onChange={(next) => onChange(value.map((v, index) => index === i ? next : v))} />)}
  </div></fieldset>
}
const modes: { value: VertexMode; label: string }[] = [
  { value: 'book', label: 'Preparar / reabrir o livro' }, { value: 'squash', label: 'Squash fold' },
  { value: 'inside-reverse', label: 'Inversão para dentro' }, { value: 'outside-reverse', label: 'Inversão para fora' },
]

export function TutorialEditor({ initialId, initialDocument, onExit, onTest }: { initialId?: string; initialDocument?: TutorialDocument; onExit: () => void; onTest: (document: TutorialDocument) => void }) {
  const [initial] = useState(() => initialDocument ? { document: clone(initialDocument), message: '' } : loadDraft(initialId ?? origamiCatalog[0].id))
  const [document, setDocument] = useState(initial.document)
  const [message, setMessage] = useState(initial.message)
  const [activeIndex, setActiveIndex] = useState(0)
  const [animate, setAnimate] = useState(false)
  const [replay, setReplay] = useState(0)
  const [selectedFace, setSelectedFace] = useState<string>()
  const [markMode, setMarkMode] = useState<MathAnnotation['kind'] | null>(null)
  const [picks, setPicks] = useState<Point2D[]>([])
  const [markFace, setMarkFace] = useState<string>()
  const fileInput = useRef<HTMLInputElement>(null)
  const item = findCatalogItem(document.catalogId)!
  const index = Math.min(activeIndex, document.steps.length - 1)
  const step = document.steps[index]
  const phases = phasesForStep(step)
  const errors = useMemo(() => validateTutorialSteps(item.model, document.steps), [document.steps, item.model])
  const valid = errors.length === 0 && document.title.trim().length > 0

  useEffect(() => {
    if (!valid) return
    const timer = window.setTimeout(() => {
      try { localStorage.setItem(draftKey(document.catalogId), serializeTutorial(document)) }
      catch { setMessage('Não foi possível salvar neste navegador. Exporte o tutorial para guardar suas alterações.') }
    }, 450)
    return () => window.clearTimeout(timer)
  }, [document, valid])
  useEffect(() => { setMarkMode(null); setPicks([]); setSelectedFace(undefined); setAnimate(false) }, [step.id, document.catalogId])

  function updateStep(patch: Partial<TutorialStep>) {
    setAnimate(false)
    setDocument((current) => ({ ...current, steps: current.steps.map((s, i) => i === index ? { ...s, ...patch } : s) }))
  }
  function updatePhases(next: readonly FoldPhase[]) { updateStep({ fold: undefined, phases: next.length ? next : undefined }) }
  function updatePhase(phaseIndex: number, patch: Partial<FoldPhase>) {
    updatePhases(phases.map((p, i) => i === phaseIndex ? { ...p, ...patch } : p))
  }
  function updateMark(markIndex: number, patch: Partial<MathAnnotation>) {
    updateStep({ annotations: step.annotations?.map((m, i) => i === markIndex ? { ...m, ...patch } as MathAnnotation : m) })
  }
  function addStep(duplicate = false) {
    const next: TutorialStep = duplicate ? { ...clone(step), id: uniqueId('etapa'), title: `${step.title} — cópia` } : {
      id: uniqueId('etapa'), eyebrow: 'Observação', title: 'Nova etapa', instruction: 'Observe o modelo antes de continuar.',
      showGuide: false, camera: clone(step.camera ?? { position: [0, 6.8, 2.5] as const, target: [0, 0, 0] as const, fov: 39, duration: 0.8 }),
    }
    setDocument((d) => ({ ...d, steps: [...d.steps.slice(0, index + 1), next, ...d.steps.slice(index + 1)] }))
    setActiveIndex(index + 1)
  }
  function moveStep(delta: number) {
    const target = index + delta
    if (target < 0 || target >= document.steps.length) return
    const steps = [...document.steps]
    const moving = steps[index]
    steps[index] = steps[target]
    steps[target] = moving
    setDocument({ ...document, steps }); setActiveIndex(target)
  }
  function removeStep() {
    if (document.steps.length <= 2) return
    setDocument({ ...document, steps: document.steps.filter((_, i) => i !== index) })
    setActiveIndex(Math.max(0, index - 1))
  }
  function chooseModel(id: string) {
    if (valid) { try { localStorage.setItem(draftKey(document.catalogId), serializeTutorial(document)) } catch { /* Export remains available. */ } }
    const next = loadDraft(id)
    setDocument(next.document); setActiveIndex(0); setMessage(next.message)
  }
  function exportDocument() {
    if (!valid) return
    const url = URL.createObjectURL(new Blob([serializeTutorial(document)], { type: 'application/json' }))
    const link = window.document.createElement('a')
    link.href = url; link.download = `${document.catalogId}-tutorial.json`; link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setMessage('Tutorial exportado com etapas, dobras, marcações e enquadramentos.')
  }
  async function importDocument(file?: File) {
    if (!file) return
    try {
      if (file.size > 2_000_000) throw new Error('O arquivo deve ter no máximo 2 MB.')
      const next = parseTutorial(await file.text(), origamiCatalog)
      setDocument(next); setActiveIndex(0); setMessage('Tutorial importado. Confira a prévia antes de exportar.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Não foi possível importar o tutorial.') }
  }
  function pickFace(faceId: string, point: Point2D) {
    setSelectedFace(faceId)
    if (!markMode) return
    if (picks.length && markFace !== faceId) { setMessage('Escolha os pontos na mesma face. Clique em Cancelar para começar outra marcação.'); return }
    const points = [...picks, point]
    const required = markMode === 'angle' ? 3 : markMode === 'segment' ? 2 : 1
    setMarkFace(faceId)
    if (points.length < required) { setPicks(points); return }
    const base = { id: uniqueId('marca'), faceId, label: 'Marcação', color: '#f6ce78' }
    let mark: MathAnnotation
    if (markMode === 'point') mark = { ...base, kind: 'point', at: point, label: 'Ponto' }
    else if (markMode === 'segment') mark = { ...base, kind: 'segment', start: points[0], end: points[1], label: 'Segmento' }
    else if (markMode === 'angle') {
      const a = Math.atan2(points[1][1] - points[0][1], points[1][0] - points[0][0])
      const b = Math.atan2(points[2][1] - points[0][1], points[2][0] - points[0][0])
      const angle = Math.acos(Math.cos(b - a)) * 180 / Math.PI
      mark = { ...base, kind: 'angle', vertex: points[0], from: points[1], to: points[2], label: `${Math.round(angle)}°` }
    } else mark = { ...base, kind: 'area', label: 'Região' }
    updateStep({ annotations: [...(step.annotations ?? []), mark] })
    setPicks([]); setMarkMode(null); setMessage('Marcação adicionada. Ajuste o texto abaixo.')
  }
  const camera = step.camera ?? { position: [0, 6.8, 2.5] as const, target: [0, 0, 0] as const, fov: 39, duration: 0.8 }
  const pending: MathAnnotation[] = picks.length && markFace ? [{ id: 'pending-point', faceId: markFace, kind: 'point', at: picks[0], label: 'Primeiro ponto', color: '#88e5d3' }] : []
  const previewStep = useMemo(() => pending.length ? { ...step, annotations: [...(step.annotations ?? []), ...pending] } : step, [step, picks, markFace])

  return <main className="editor-page">
    <div className="editor-heading"><div><span className="kicker">Crie sua sequência pedagógica</span><h1>Editor de tutoriais</h1>
      <p>Edite, explore o papel e capture a vista de cada etapa.</p></div><button type="button" className="library-button" onClick={onExit}>Voltar à biblioteca</button></div>
    <div className="editor-toolbar">
      <label className="editor-field"><span>Modelo</span><select value={document.catalogId} onChange={(e) => chooseModel(e.target.value)}>
        {origamiCatalog.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
      </select></label>
      <label className="editor-field editor-title-field"><span>Título do tutorial</span><input value={document.title} onChange={(e) => setDocument({ ...document, title: e.target.value })} /></label>
      <button type="button" onClick={() => fileInput.current?.click()}><Upload size={16} />Importar</button>
      <button type="button" disabled={!valid} onClick={() => onTest(clone(document))}><Play size={16} />Testar tutorial</button>
      <button type="button" className="primary" onClick={exportDocument} disabled={!valid}><Download size={16} />Exportar JSON</button>
      <input ref={fileInput} type="file" accept="application/json,.json" hidden onChange={(e) => { void importDocument(e.target.files?.[0]); e.target.value = '' }} />
    </div>
    <p className="editor-save-note">Os rascunhos válidos ficam salvos neste navegador. Use Exportar para guardar ou compartilhar seu tutorial.</p>
    {message && <p className="editor-message" role="status">{message}</p>}
    <div className="editor-layout">
      <section className="editor-preview" aria-label="Prévia do tutorial">
        <div className="editor-preview-heading"><strong>Etapa {index + 1} de {document.steps.length}</strong><button type="button" disabled={!valid}
          onClick={() => { setAnimate(true); setReplay((v) => v + 1) }}><Play size={15} />Reproduzir etapa</button>
          {animate && <button type="button" onClick={() => setAnimate(false)}>Parar</button>}</div>
        <SceneBoundary key={item.id}><Suspense fallback={<SceneLoading />}><OrigamiScene model={item.model} steps={document.steps}
          step={previewStep} stepIndex={index} animate={animate && valid} mathMode speed={1} replayToken={replay}
          selectedFaceId={selectedFace} onPickFace={pickFace} onCameraCapture={(pose) => { updateStep({ camera: { ...pose, duration: camera.duration } }); setMessage('Enquadramento capturado para esta etapa.') }} />
        </Suspense></SceneBoundary>
        <div className="editor-mark-tools"><span>Marcar no papel:</span>{(['point', 'segment', 'angle', 'area'] as const).map((kind, i) => <button
          type="button" key={kind} className={markMode === kind ? 'active' : ''} onClick={() => { setAnimate(false); setMarkMode(kind); setPicks([]); setMarkFace(undefined) }}>
          {['Ponto', 'Segmento', 'Ângulo', 'Região'][i]}</button>)}{markMode && <button type="button" onClick={() => { setMarkMode(null); setPicks([]) }}>Cancelar</button>}</div>
        <p className="editor-pick-hint">{markMode ? markMode === 'angle' ? `Clique no ${['vértice', 'primeiro lado', 'segundo lado'][picks.length]} do ângulo, na mesma face.`
          : markMode === 'segment' ? `Clique no ${picks.length ? 'fim' : 'início'} do segmento, na mesma face.` : 'Clique na face do papel para adicionar a marcação.'
          : 'Arraste para girar; use a pinça ou scroll para aproximar. “Usar esta vista” salva o enquadramento.'}</p>
        <div className="editor-step-list" aria-label="Etapas do tutorial">{document.steps.map((s, i) => <button type="button" key={s.id}
          aria-current={i === index ? 'step' : undefined} className={i === index ? 'active' : ''} onClick={() => setActiveIndex(i)}>
          <span>{i + 1}</span>{s.title || 'Etapa sem título'}</button>)}</div>
      </section>
      <aside className="editor-form" aria-label="Editar etapa">
        <div className="editor-step-actions">
          <button type="button" onClick={() => addStep()} disabled={document.steps.length >= 200}><Plus size={16} />Etapa</button>
          <button type="button" onClick={() => addStep(true)} disabled={document.steps.length >= 200} aria-label="Duplicar etapa"><Copy size={16} /></button>
          <button type="button" onClick={() => moveStep(-1)} disabled={index === 0} aria-label="Mover etapa para cima"><ArrowUp size={16} /></button>
          <button type="button" onClick={() => moveStep(1)} disabled={index === document.steps.length - 1} aria-label="Mover etapa para baixo"><ArrowDown size={16} /></button>
          <button type="button" onClick={removeStep} disabled={document.steps.length <= 2} aria-label="Excluir etapa"><Trash2 size={16} /></button>
        </div>
        <label className="editor-field"><span>Nome da etapa</span><input value={step.title} onChange={(e) => updateStep({ title: e.target.value })} /></label>
        <label className="editor-field"><span>Identificação curta</span><input value={step.eyebrow} onChange={(e) => updateStep({ eyebrow: e.target.value })} /></label>
        <label className="editor-field"><span>Instrução</span><textarea value={step.instruction} rows={3} onChange={(e) => updateStep({ instruction: e.target.value })} /></label>
        <label className="editor-check"><input type="checkbox" checked={Boolean(step.finish)} onChange={(e) => updateStep({ finish: e.target.checked || undefined })} />Etapa de acabamento / decoração</label>

        <details open><summary>Movimentos da etapa</summary>
          {phases.length === 0 && <p className="editor-help">Esta etapa permite observar o modelo sem fazer uma nova dobra.</p>}
          {phases.map((phase, phaseIndex) => <fieldset className="phase-fieldset" key={phaseIndex}><legend>Fase {phaseIndex + 1}</legend>
            <label className="editor-field"><span>Descrição da fase</span><input value={phase.label} onChange={(e) => updatePhase(phaseIndex, { label: e.target.value })} /></label>
            <label className="editor-field"><span>Técnica</span><select value={phase.vertex?.mode ?? 'simple'} onChange={(e) => {
              if (e.target.value === 'simple') updatePhase(phaseIndex, { vertex: undefined, folds: [{ creaseId: item.model.creases[0].id, angle: 180 }] })
              else updatePhase(phaseIndex, { folds: undefined, vertex: { mechanismId: item.model.mechanisms![0].id, mode: e.target.value as VertexMode, angle: 180 } })
            }}><option value="simple">Dobras simples coordenadas</option>{item.model.mechanisms?.length ? modes.map((m) => <option key={m.value} value={m.value}>{m.label}</option>) : null}</select></label>
            {phase.vertex ? <Numeric label="Abertura / fechamento (graus)" value={phase.vertex.angle} min={0} max={180} step={5}
              onChange={(angle) => updatePhase(phaseIndex, { vertex: { ...phase.vertex!, angle } })} />
              : <>{phase.folds?.map((fold, foldIndex) => <div className="fold-action-fields" key={foldIndex}>
                <label className="editor-field"><span>Vinco {foldIndex + 1}</span><select value={fold.creaseId} onChange={(e) => updatePhase(phaseIndex, { folds: phase.folds!.map((f, i) => i === foldIndex ? { ...f, creaseId: e.target.value } : f) })}>
                  {item.model.creases.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
                <Numeric label="Ângulo final" value={fold.angle} min={-180} max={180} step={5} onChange={(angle) => updatePhase(phaseIndex, { folds: phase.folds!.map((f, i) => i === foldIndex ? { ...f, angle } : f) })} />
                <label className="editor-field"><span>Sentido</span><select value={fold.direction ?? ''} onChange={(e) => updatePhase(phaseIndex, { folds: phase.folds!.map((f, i) => i === foldIndex ? { ...f, direction: e.target.value === '' ? undefined : e.target.value as 'valley' | 'mountain' } : f) })}>
                  <option value="">Do modelo</option><option value="valley">Vale</option><option value="mountain">Montanha</option></select></label>
                {phase.folds!.length > 1 && <button type="button" aria-label="Remover vinco da fase" onClick={() => updatePhase(phaseIndex, { folds: phase.folds!.filter((_, i) => i !== foldIndex) })}><Trash2 size={15} /></button>}
              </div>)}
              {(phase.folds?.length ?? 0) < Math.min(item.model.creases.length, 16) && <button type="button" onClick={() => {
                const crease = item.model.creases.find((c) => !phase.folds?.some((f) => f.creaseId === c.id))!
                updatePhase(phaseIndex, { folds: [...(phase.folds ?? []), { creaseId: crease.id, angle: 180 }] })
              }}><Plus size={14} />Vinco simultâneo</button>}</>}
            <Numeric label="Duração da fase (s)" value={phase.duration ?? 1.35} min={0.1} max={10} onChange={(duration) => updatePhase(phaseIndex, { duration })} />
            <button type="button" onClick={() => updatePhases(phases.filter((_, i) => i !== phaseIndex))}>Remover fase</button>
          </fieldset>)}
          <button type="button" disabled={phases.length >= 16} onClick={() => updatePhases([...phases, { label: 'Nova dobra', duration: 1.35, folds: [{ creaseId: item.model.creases[0].id, angle: 180 }] }])}><Plus size={15} />Adicionar fase</button>
        </details>
        <details><summary>Guia de dobra</summary>
          <label className="editor-check"><input type="checkbox" checked={step.showGuide} onChange={(e) => updateStep({ showGuide: e.target.checked, guide: step.guide ?? { creaseId: item.model.creases[0].id, arrowFrom: [1, 1], arrowTo: [0, 0] } })} />Mostrar vinco e seta</label>
          {step.guide && <>
            <label className="editor-field"><span>Vinco da guia</span><select value={step.guide.creaseId} onChange={(e) => updateStep({ guide: { ...step.guide!, creaseId: e.target.value } })}>{item.model.creases.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
            <label className="editor-field"><span>Face de referência da seta</span><select value={step.guide.faceId ?? ''} onChange={(e) => updateStep({ guide: { ...step.guide!, faceId: e.target.value || undefined } })}><option value="">Plano da folha</option>{item.model.faces.map((f) => <option key={f.id} value={f.id}>{f.id}</option>)}</select></label>
            <VectorInput label="Início da seta" value={step.guide.arrowFrom} onChange={(v) => updateStep({ guide: { ...step.guide!, arrowFrom: v as [number, number] } })} />
            <VectorInput label="Fim da seta" value={step.guide.arrowTo} onChange={(v) => updateStep({ guide: { ...step.guide!, arrowTo: v as [number, number] } })} />
          </>}
        </details>
        <details open><summary>Modo Matemática</summary>
          <label className="editor-field"><span>Observação geométrica</span><textarea rows={3} value={step.mathNote ?? ''} onChange={(e) => updateStep({ mathNote: e.target.value || undefined })} /></label>
          <label className="editor-field"><span>Pergunta para investigar</span><textarea rows={2} value={step.mathQuestion ?? ''} onChange={(e) => updateStep({ mathQuestion: e.target.value || undefined })} /></label>
          <label className="editor-field"><span>Explicação da pergunta</span><textarea rows={2} value={step.mathAnswer ?? ''} onChange={(e) => updateStep({ mathAnswer: e.target.value || undefined })} /></label>
          {step.annotations?.map((mark, markIndex) => <fieldset className="annotation-fieldset" key={mark.id}><legend>{mark.kind === 'angle' ? 'Ângulo' : mark.kind === 'segment' ? 'Segmento' : mark.kind === 'point' ? 'Ponto' : 'Região'}</legend>
            <label className="editor-field"><span>Texto da marcação</span><input value={mark.label} onChange={(e) => updateMark(markIndex, { label: e.target.value })} /></label>
            <label className="editor-field"><span>Face da marcação</span><select value={mark.faceId} onChange={(e) => updateMark(markIndex, { faceId: e.target.value })}>{item.model.faces.map((f) => <option key={f.id} value={f.id}>{f.id}</option>)}</select></label>
            <label className="editor-field"><span>Cor da marcação</span><input type="color" value={mark.color ?? '#f6ce78'} onChange={(e) => updateMark(markIndex, { color: e.target.value })} /></label>
            {mark.kind === 'point' && <VectorInput label="Ponto" value={mark.at} onChange={(v) => updateMark(markIndex, { at: v as [number, number] })} />}
            {mark.kind === 'segment' && <><VectorInput label="Início" value={mark.start} onChange={(v) => updateMark(markIndex, { start: v as [number, number] })} /><VectorInput label="Fim" value={mark.end} onChange={(v) => updateMark(markIndex, { end: v as [number, number] })} /></>}
            {mark.kind === 'angle' && <><VectorInput label="Vértice" value={mark.vertex} onChange={(v) => updateMark(markIndex, { vertex: v as [number, number] })} /><VectorInput label="Primeiro lado" value={mark.from} onChange={(v) => updateMark(markIndex, { from: v as [number, number] })} /><VectorInput label="Segundo lado" value={mark.to} onChange={(v) => updateMark(markIndex, { to: v as [number, number] })} /></>}
            <button type="button" onClick={() => updateStep({ annotations: step.annotations?.filter((_, i) => i !== markIndex) })}><Trash2 size={14} />Remover marcação</button>
          </fieldset>)}
        </details>
        <details><summary>Enquadramento da câmera</summary><p className="editor-help">Gire a prévia e clique em “Usar esta vista”, ou ajuste os valores.</p>
          <VectorInput label="Posição" value={camera.position} onChange={(v) => updateStep({ camera: { ...camera, position: v as [number, number, number] } })} />
          <VectorInput label="Alvo" value={camera.target} onChange={(v) => updateStep({ camera: { ...camera, target: v as [number, number, number] } })} />
          <Numeric label="Campo de visão (graus)" value={camera.fov ?? 39} min={25} max={70} step={1} onChange={(fov) => updateStep({ camera: { ...camera, fov } })} />
          <Numeric label="Duração do enquadramento (s)" value={camera.duration ?? 0.8} min={0} max={5} onChange={(duration) => updateStep({ camera: { ...camera, duration } })} />
        </details>
        {!valid && <div className="editor-errors" role="alert"><strong>Revise antes de reproduzir ou exportar:</strong><ul>{!document.title.trim() && <li>Informe o título do tutorial.</li>}{errors.map((error) => <li key={error}>{error}</li>)}</ul></div>}
        <button type="button" className="editor-restore" onClick={() => {
          if (window.confirm('Restaurar este tutorial original? As alterações deste rascunho serão substituídas.')) { setDocument(original(item.id)); setActiveIndex(0); setMessage('Tutorial original restaurado.') }
        }}><RotateCcw size={15} />Restaurar tutorial original</button>
      </aside>
    </div>
  </main>
}
