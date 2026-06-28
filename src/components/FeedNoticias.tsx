'use client'
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

type Noticia = {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  fuente: string
  fuente_tipo: 'rss' | 'x_twitter' | 'oficial'
  tag: string
  idioma: 'es' | 'en'
  publicado_at: string
  factcheck_confianza: number
  factcheck_status: string
  isNew?: boolean
  insertedAt?: number
}

const TAG_META: Record<string, { label: string; border: string; pill: string; short: string }> = {
  todos:             { label: 'Todas las categorías', border: 'border-l-gray-300',   pill: '',                                                             short: 'Todas' },
  sismo:             { label: 'Sismo',             border: 'border-l-crisis-red',    pill: 'bg-crisis-red/10 text-crisis-red-dark dark:bg-crisis-red/20 dark:text-crisis-red-light',    short: 'Sismo' },
  rescate:           { label: 'Rescate',           border: 'border-l-orange-500', pill: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200', short: 'Rescate' },
  desaparecidos:     { label: 'Desaparecidos',     border: 'border-l-purple-500', pill: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200', short: 'Desap.' },
  puntos_acopio:     { label: 'Puntos de acopio',  border: 'border-l-green-500',  pill: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200', short: 'Acopio' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria', border: 'border-l-blue-500',   pill: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200', short: 'Ayuda' },
  replicas:          { label: 'Réplicas',          border: 'border-l-yellow-500', pill: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200', short: 'Réplicas' },
  donaciones:        { label: 'Donaciones',        border: 'border-l-teal-500',   pill: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200', short: 'Donar' },
  internacional:     { label: 'Internacional',     border: 'border-l-slate-500',  pill: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200', short: 'Int.' },
}

const LIMIT = 30

function tiempoRelativo(iso: string) {
  const date = new Date(iso)
  if (isNaN(date.getTime())) return '—'
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return date.toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
}

function fuenteLabel(tipo: string, fuente: string) {
  if (tipo === 'x_twitter') return `@${fuente.replace(/^@/, '')}`
  if (tipo === 'oficial') return fuente
  return fuente
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21 21-4.34-4.34" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}

function NewspaperIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 6h8v4h-8V6Z" />
    </svg>
  )
}

function AlertBanner() {
  return (
    <div className="bg-crisis-red text-white">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-2.5 flex items-center gap-2">
        <AlertIcon />
        <p className="text-xs sm:text-sm font-medium">
          Información verificada en tiempo real — Sismo Venezuela 24 jun
        </p>
      </div>
    </div>
  )
}

function EmptyState({ error, degraded }: { error?: boolean; degraded?: boolean }) {
  return (
    <div className="text-center py-16 px-6 bg-surface-elevated dark:bg-surface-elevated-dark rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 mb-4">
        <NewspaperIcon />
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
        {degraded ? 'Servicio de noticias no configurado' : error ? 'No se pudo cargar el feed' : 'Sin noticias verificadas'}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
        {degraded
          ? 'El feed está en modo local. Conecta Supabase para ver noticias verificadas en tiempo real.'
          : error
            ? 'El servicio de noticias no está disponible. Revisa tu conexión o intenta más tarde.'
            : 'Aún no hay noticias en esta categoría.'}
      </p>
    </div>
  )
}

export function FeedNoticias({ initialData }: { initialData?: Noticia[] }) {
  const supabase = useMemo(() => createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), [])

  const [noticias, setNoticias] = useState<Noticia[]>(initialData ?? [])
  const [tagActivo, setTagActivo] = useState('todos')
  const [idiomaActivo, setIdiomaActivo] = useState<'todos' | 'es' | 'en'>('todos')
  const [query, setQuery] = useState('')
  const [queryInput, setQueryInput] = useState('')
  const [cargando, setCargando] = useState(!initialData?.length)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [degraded, setDegraded] = useState(false)
  const [offset, setOffset] = useState(initialData?.length ?? 0)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState<number | null>(null)
  const [nuevasCount, setNuevasCount] = useState(0)
  const [statsLabel, setStatsLabel] = useState<string>('')
  const [view, setView] = useState<'feed' | 'medios'>('feed')

  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNewTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) return
        const d = await res.json()
        const ultima = d.ultima_at ? tiempoRelativo(d.ultima_at) : '—'
        setStatsLabel(`${d.total_aprobadas} noticias · última ${ultima}`)
      } catch { /* ignore */ }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  const buildUrl = useCallback((tag: string, q: string, off: number, idioma: 'todos' | 'es' | 'en') => {
    const p = new URLSearchParams({ limit: String(LIMIT), offset: String(off) })
    if (tag !== 'todos') p.set('tag', tag)
    if (q) p.set('q', q)
    if (idioma !== 'todos') p.set('lang', idioma)
    return `/api/feed?${p}`
  }, [])

  const cargar = useCallback(async (tag: string, q: string) => {
    setCargando(true)
    setError(null)
    setDegraded(false)
    try {
      const res = await fetch(buildUrl(tag, q, 0, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      const items: Noticia[] = data.noticias ?? []
      setNoticias(items)
      setTotal(data.total ?? null)
      setOffset(items.length)
      setHasMore(items.length >= LIMIT)
      if (data.degraded) setDegraded(true)
    } catch {
      setError('No se pudo cargar el feed.')
      setNoticias([])
      setHasMore(false)
    } finally {
      setCargando(false)
      setNuevasCount(0)
    }
  }, [buildUrl, idiomaActivo])

  const cargarMas = useCallback(async () => {
    if (cargandoMas || !hasMore) return
    setCargandoMas(true)
    try {
      const res = await fetch(buildUrl(tagActivo, query, offset, idiomaActivo), { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return
      const data = await res.json()
      const items: Noticia[] = data.noticias ?? []
      if (items.length < LIMIT) setHasMore(false)
      setNoticias(prev => {
        const ids = new Set(prev.map(n => n.id))
        return [...prev, ...items.filter(n => !ids.has(n.id))]
      })
      setOffset(prev => prev + items.length)
      if (data.degraded) setDegraded(true)
    } catch { /* ignore */ } finally {
      setCargandoMas(false)
    }
  }, [buildUrl, tagActivo, query, offset, idiomaActivo, cargandoMas, hasMore])

  useEffect(() => { cargar(tagActivo, query) }, [tagActivo, query, idiomaActivo, cargar])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setQuery(queryInput.trim()), 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [queryInput])

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!hasMore) return
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) cargarMas()
    }, { rootMargin: '200px' })
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)
    return () => observerRef.current?.disconnect()
  }, [cargarMas, hasMore])

  useEffect(() => {
    const channel = supabase
      .channel(`noticias-feed-${tagActivo}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'noticias',
        filter: tagActivo !== 'todos' ? `tag=eq.${tagActivo}` : undefined,
      }, (payload) => {
        const nueva = payload.new as Noticia
        if (nueva.factcheck_status !== 'aprobado') return
        if (query && !nueva.titulo.toLowerCase().includes(query.toLowerCase())) return
        setNoticias(prev => {
          if (prev.find(n => n.id === nueva.id)) return prev
          return [{ ...nueva, isNew: true, insertedAt: Date.now() }, ...prev]
        })
        setNuevasCount(c => c + 1)
        isNewTimers.current.push(setTimeout(() => {
          setNoticias(prev => prev.map(n => n.id === nueva.id ? { ...n, isNew: false } : n))
        }, 300_000))
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
      isNewTimers.current.forEach(clearTimeout)
      isNewTimers.current = []
    }
  }, [tagActivo, query, supabase])

  const isNuevo = (n: Noticia) => n.isNew && n.insertedAt && Date.now() - n.insertedAt < 300_000

  const tagList = Object.entries(TAG_META)

  return (
    <>
      <AlertBanner />

      {/* Hero */}
      <section className="border-b border-gray-200 dark:border-gray-800 bg-surface-elevated dark:bg-surface-elevated-dark">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crisis-red/10 text-crisis-red dark:bg-crisis-red/20 dark:text-crisis-red-light text-caption font-semibold mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis-red opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-crisis-red" />
                </span>
                En vivo
              </div>
              <h1 className="text-hero text-gray-900 dark:text-white mb-3">
                Venezuela — Sismo 24 jun
              </h1>
              <p className="text-lead text-gray-600 dark:text-gray-300">
                Feed de noticias verificadas sobre el terremoto del 24 de junio de 2026. Información oficial, reportes de emergencia y recursos para afectados.
              </p>
            </div>
            <div className="flex items-center gap-4 lg:pb-1">
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{total ?? '—'}</p>
                <p className="text-caption text-gray-500 dark:text-gray-400">noticias verificadas</p>
              </div>
              <div className="h-10 w-px bg-gray-200 dark:bg-gray-700" />
              <div className="text-right">
                <p className="text-3xl font-bold text-crisis-red">24</p>
                <p className="text-caption text-gray-500 dark:text-gray-400">jun 2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          {/* Sidebar */}
          <aside className="lg:w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-6">
              {/* Buscador */}
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={queryInput}
                  onChange={e => setQueryInput(e.target.value)}
                  placeholder="Buscar noticias..."
                  className="w-full pl-9 pr-4 py-2.5 text-small rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-crisis-blue focus:ring-1 focus:ring-crisis-blue transition-colors"
                />
              </div>

              {/* Idioma */}
              <div>
                <h3 className="text-caption font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Idioma</h3>
                <div className="flex flex-wrap gap-2">
                  {(['todos', 'es', 'en'] as const).map(lang => (
                    <button
                      key={lang}
                      onClick={() => setIdiomaActivo(lang)}
                      className={`text-caption px-3 py-1.5 rounded-full border transition-colors ${
                        idiomaActivo === lang
                          ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 border-gray-900 dark:border-gray-100 font-medium'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {lang === 'todos' ? 'Todos' : lang === 'es' ? 'Español' : 'English'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-caption font-semibold uppercase text-gray-400 dark:text-gray-500 tracking-wider mb-3">Categorías</h3>
                <div className="flex flex-col gap-1">
                  {tagList.map(([key, { label, pill, short }]) => (
                    <button
                      key={key}
                      onClick={() => setTagActivo(key)}
                      className={`
                        flex items-center justify-between text-left px-3 py-2 rounded-lg text-small transition-colors
                        ${tagActivo === key
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'}
                      `}
                    >
                      <span>{label}</span>
                      {pill && key !== 'todos' && (
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${pill}`}>
                          {short}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado */}
              <div className="p-4 rounded-xl bg-crisis-red/5 dark:bg-crisis-red/10 border border-crisis-red/10 dark:border-crisis-red/20">
                <h3 className="text-small font-semibold text-crisis-red-dark dark:text-crisis-red-light mb-1">Estado del servicio</h3>
                <p className="text-caption text-gray-600 dark:text-gray-300">
                  {statsLabel || 'Conectando con fuentes oficiales...'}
                </p>
              </div>
            </div>
          </aside>

          {/* Main feed */}
          <main className="flex-1 min-w-0">
            {/* Tabs + query label */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 w-full sm:w-auto">
                <button
                  onClick={() => setView('feed')}
                  className={`flex-1 sm:flex-initial px-5 py-1.5 text-small font-medium rounded-md transition-all ${
                    view === 'feed'
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Feed General
                </button>
                <button
                  onClick={() => setView('medios')}
                  className={`flex-1 sm:flex-initial px-5 py-1.5 text-small font-medium rounded-md transition-all ${
                    view === 'medios'
                      ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Medios Oficiales
                </button>
              </div>
              {query && total !== null && (
                <p className="text-caption text-gray-500 dark:text-gray-400">
                  {total} resultado{total !== 1 ? 's' : ''} para &ldquo;{query}&rdquo;
                </p>
              )}
            </div>

            {view === 'feed' ? (
              <>
                {/* Banner de nuevas noticias */}
                {nuevasCount > 0 && (
                  <button
                    onClick={() => { setNuevasCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="w-full mb-5 py-2.5 text-small font-semibold text-white bg-crisis-red rounded-lg hover:bg-crisis-red-dark transition-colors"
                  >
                    {nuevasCount} nueva{nuevasCount > 1 ? 's' : ''} noticia{nuevasCount > 1 ? 's' : ''} — ver arriba
                  </button>
                )}

                {/* Error */}
                {error && <EmptyState error />}

                {/* Feed */}
                {cargando ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-32 bg-white dark:bg-gray-900 rounded-xl animate-pulse border border-gray-100 dark:border-gray-800" />
                    ))}
                  </div>
                ) : noticias.length === 0 && !error ? (
                  <EmptyState degraded={degraded} />
                ) : (
                  <>
                    <div className="space-y-4">
                      {noticias.map(n => {
                        const meta = TAG_META[n.tag]
                        return (
                          <a
                            key={n.id}
                            href={n.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`
                              group block p-5 rounded-xl border bg-white dark:bg-gray-900
                              border-gray-200 dark:border-gray-800
                              border-l-[3px] ${meta?.border ?? 'border-l-gray-300'}
                              hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-soft transition-all
                              ${isNuevo(n) ? 'ring-1 ring-crisis-red/30' : ''}
                            `}
                          >
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-caption font-medium text-gray-500 dark:text-gray-400">
                                {fuenteLabel(n.fuente_tipo, n.fuente)}
                              </span>
                              {n.idioma === 'en' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                  EN
                                </span>
                              )}
                              {meta && meta.pill && (
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${meta.pill}`}>
                                  {meta.label}
                                </span>
                              )}
                              {isNuevo(n) && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-crisis-red text-white">
                                  NUEVO
                                </span>
                              )}
                              <span className="text-caption text-gray-400 dark:text-gray-500 ml-auto">
                                {tiempoRelativo(n.publicado_at)}
                              </span>
                            </div>
                            <p className="text-headline text-gray-900 dark:text-gray-100 leading-snug mb-2 group-hover:text-crisis-blue transition-colors">
                              {n.titulo}
                            </p>
                            {n.descripcion && (
                              <p className="text-small text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                                {n.descripcion}
                              </p>
                            )}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${n.factcheck_confianza}%` }}
                                />
                              </div>
                              <span className="text-[10px] text-gray-400 dark:text-gray-500 shrink-0">
                                {n.factcheck_confianza}% verificado
                              </span>
                            </div>
                          </a>
                        )
                      })}
                    </div>
                    {/* Sentinel + spinner */}
                    <div ref={sentinelRef} className="py-6 text-center">
                      {cargandoMas && (
                        <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      )}
                      {!hasMore && noticias.length > 0 && (
                        <p className="text-caption text-gray-400 dark:text-gray-500">No hay más noticias</p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-xl mb-4">
                  <h3 className="text-small font-bold text-blue-900 dark:text-blue-100 mb-1">Timeline de Medios Oficiales</h3>
                  <p className="text-caption text-blue-700 dark:text-blue-300">Actualizaciones de cuentas verificadas como @Funvisis, @PCivil_Ve y @CruzRojaVe.</p>
                </div>
                <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6 pb-4">
                  {noticias
                    .filter(n => n.fuente.startsWith('@'))
                    .map((n) => {
                      let colorClass = 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200'
                      if (n.fuente.includes('PCivil_Ve') || n.fuente.includes('bomberos')) {
                        colorClass = 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-200'
                      } else if (n.fuente.includes('CruzRoja')) {
                        colorClass = 'bg-crisis-red/10 dark:bg-crisis-red/30 text-crisis-red-dark dark:text-crisis-red-light'
                      }
                      return (
                        <div key={`timeline-${n.id}`} className="relative pl-6">
                          <span className={`absolute -left-[7px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-900 ${colorClass.replace('text-', 'bg-').split(' ')[0]}`} />
                          <a href={n.url} target="_blank" rel="noopener noreferrer" className="block bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 rounded-lg shadow-soft hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-caption font-bold text-gray-900 dark:text-white">{n.fuente}</span>
                              <span className="text-caption text-gray-400 dark:text-gray-500">{tiempoRelativo(n.publicado_at)}</span>
                            </div>
                            <p className="text-small text-gray-800 dark:text-gray-200">{n.titulo}</p>
                            {n.descripcion && (
                              <p className="text-caption text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">{n.descripcion}</p>
                            )}
                            <div className="mt-2 text-[10px] text-crisis-blue dark:text-crisis-blue-light font-semibold bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-0.5 rounded">
                              Verificado por cuenta oficial ({n.factcheck_confianza}%)
                            </div>
                          </a>
                        </div>
                      )
                    })}
                  {noticias.filter(n => n.fuente.startsWith('@')).length === 0 && !cargando && (
                    <div className="pl-6 text-small text-gray-400 dark:text-gray-500 italic py-4">
                      No hay actualizaciones recientes de las cuentas oficiales.
                    </div>
                  )}
                  {cargando && (
                    <div className="pl-6 space-y-3 py-4">
                      <div className="h-20 bg-white dark:bg-gray-900 rounded-lg animate-pulse border border-gray-100 dark:border-gray-800" />
                      <div className="h-20 bg-white dark:bg-gray-900 rounded-lg animate-pulse border border-gray-100 dark:border-gray-800" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  )
}
