const TAG_META: Record<string, { label: string; color: string }> = {
  sismo:             { label: 'Sismo',            color: 'bg-crisis-red' },
  rescate:           { label: 'Rescate',          color: 'bg-orange-500' },
  desaparecidos:     { label: 'Desaparecidos',    color: 'bg-purple-500' },
  puntos_acopio:     { label: 'Puntos de acopio', color: 'bg-green-500' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',color: 'bg-blue-500' },
  replicas:          { label: 'Réplicas',         color: 'bg-yellow-500' },
  donaciones:        { label: 'Donaciones',       color: 'bg-teal-500' },
  internacional:     { label: 'Internacional',    color: 'bg-slate-500' },
}

function tiempoRelativo(iso: string | null): string {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora mismo'
  if (min < 60) return `hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export const dynamic = 'force-dynamic'

export default async function StatsPage() {
  let stats = { total_aprobadas: 0, por_tag: {} as Record<string, number>, ultima_at: null as string | null }
  try {
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const res = await fetch(`${base}/api/stats`, { cache: 'no-store' })
    if (res.ok) stats = await res.json()
  } catch { /* fail silently */ }

  const maxTag = Math.max(...Object.values(stats.por_tag), 1)
  const tagEntries = Object.entries(TAG_META)

  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Header */}
      <header className="mb-8 lg:mb-10">
        <h1 className="text-display text-gray-900 dark:text-white">Estadísticas del feed</h1>
        <p className="text-lead text-gray-600 dark:text-gray-300 mt-2 max-w-3xl">
          Resumen de noticias verificadas por categoría. Última actualización: {tiempoRelativo(stats.ultima_at)}.
        </p>
      </header>

      {/* Total destacado */}
      <section className="mb-8 lg:mb-10 p-6 lg:p-8 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-8">
          <div>
            <p className="text-7xl sm:text-8xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stats.total_aprobadas}</p>
            <p className="text-lead text-gray-500 dark:text-gray-400 mt-1">noticias verificadas</p>
          </div>
          <div className="sm:ml-auto text-left sm:text-right">
            <p className="text-caption text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Última actualización</p>
            <p className="text-headline text-gray-900 dark:text-white">{tiempoRelativo(stats.ultima_at)}</p>
          </div>
        </div>
      </section>

      {/* Grid por tag */}
      <section>
        <h2 className="text-headline text-gray-900 dark:text-white mb-5">Distribución por categoría</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tagEntries.map(([tag, { label, color }]) => {
            const count = stats.por_tag[tag] ?? 0
            const pct = Math.round((count / maxTag) * 100)
            return (
              <div key={tag} className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 shadow-soft">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  <span className="text-small text-gray-600 dark:text-gray-300">{label}</span>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{count}</p>
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
