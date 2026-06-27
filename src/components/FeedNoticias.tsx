'use client'
// src/components/FeedNoticias.tsx
// Feed en tiempo real con Supabase Realtime + filtros por tag

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Noticia = {
  id: string
  titulo: string
  descripcion: string | null
  url: string
  fuente: string
  fuente_tipo: 'rss' | 'x_twitter' | 'oficial'
  tag: string
  publicado_at: string
  factcheck_confianza: number
  factcheck_status: string
  isNew?: boolean
}

const TAG_LABELS: Record<string, { label: string; color: string }> = {
  todos:             { label: 'Todos',               color: '' },
  sismo:             { label: 'Sismo',               color: 'bg-red-100 text-red-800' },
  rescate:           { label: 'Rescate',             color: 'bg-orange-100 text-orange-800' },
  desaparecidos:     { label: 'Desaparecidos',       color: 'bg-purple-100 text-purple-800' },
  puntos_acopio:     { label: 'Puntos de acopio',    color: 'bg-green-100 text-green-800' },
  ayuda_humanitaria: { label: 'Ayuda humanitaria',   color: 'bg-blue-100 text-blue-800' },
  replicas:          { label: 'Réplicas',            color: 'bg-yellow-100 text-yellow-800' },
  donaciones:        { label: 'Donaciones',          color: 'bg-teal-100 text-teal-800' },
  internacional:     { label: 'Internacional',       color: 'bg-slate-100 text-slate-800' },
}

export function FeedNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [tagActivo, setTagActivo] = useState<string>('todos')
  const [cargando, setCargando] = useState(true)
  const [nuevasCount, setNuevasCount] = useState(0)
  const [noticiasCintillo, setNoticiasCintillo] = useState<Noticia[]>([])
  const [view, setView] = useState<'feed' | 'medios'>('feed')

  // Carga inicial
  const cargarFeed = useCallback(async (tag: string) => {
    setCargando(true)
    const url = tag === 'todos' ? '/api/feed' : `/api/feed?tag=${tag}`
    const res = await fetch(url)
    const data = await res.json()
    setNoticias(data.noticias ?? [])
    setCargando(false)
    setNuevasCount(0)
  }, [])

  useEffect(() => {
    cargarFeed(tagActivo)
  }, [tagActivo, cargarFeed])

  // Carga inicial del cintillo global (sin importar el tag activo)
  useEffect(() => {
    fetch('/api/feed')
      .then(res => res.json())
      .then(data => {
        if (data.noticias) {
          setNoticiasCintillo(data.noticias.slice(0, 5))
        }
      })
      .catch(console.error)
  }, [])

  // Supabase Realtime — escucha nuevas noticias aprobadas
  useEffect(() => {
    const channel = supabase
      .channel('noticias-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'noticias',
          // Solo si la nueva noticia coincide con el tag activo
          filter: tagActivo !== 'todos' ? `tag=eq.${tagActivo}` : undefined,
        },
        (payload) => {
          const nueva = payload.new as Noticia
          // Filtramos por factcheck_status y no por factcheck_confianza porque una noticia
          // puede tener confianza alta (ej: 80) pero status 'rechazado' o 'dudoso'.
          // Además, los eventos INSERT de Realtime llegan antes de que RLS los filtre,
          // así que el cliente recibe todas las inserciones y debe discriminar él mismo.
          if (nueva.factcheck_status !== 'aprobado') return

          setNoticias(prev => {
            // Evitar duplicados
            if (prev.find(n => n.id === nueva.id)) return prev
            return [{ ...nueva, isNew: true }, ...prev].slice(0, 50)
          })
          setNuevasCount(c => c + 1)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [tagActivo])

  const tiempoRelativo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const min = Math.floor(diff / 60000)
    if (min < 1) return 'ahora mismo'
    if (min < 60) return `hace ${min} min`
    const h = Math.floor(min / 60)
    if (h < 24) return `hace ${h}h`
    return new Date(iso).toLocaleDateString('es-VE', { day: 'numeric', month: 'short' })
  }

  const iconoFuente = (tipo: string) => {
    if (tipo === 'x_twitter') return '𝕏'
    if (tipo === 'oficial') return '🏛️'
    return '📰'
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 font-sans">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <h1 className="text-lg font-medium text-gray-900">
            Venezuela — Sismo 24 jun
          </h1>
        </div>
        <span className="text-xs text-gray-400">
          Solo información verificada
        </span>
      </div>

      {/* Sub-Pestañas: Feed General / Medios Verificados */}
      <div className="flex bg-gray-100 p-1 rounded-lg mb-5">
        <button
          onClick={() => setView('feed')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            view === 'feed'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Feed General
        </button>
        <button
          onClick={() => setView('medios')}
          className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
            view === 'medios'
              ? 'bg-white shadow-sm text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Medios Oficiales
        </button>
      </div>

      {view === 'feed' ? (
        <>
          {/* Banner de nuevas noticias */}
          {nuevasCount > 0 && (
            <button
              onClick={() => { setNuevasCount(0); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              className="w-full mb-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              ↑ {nuevasCount} nueva{nuevasCount > 1 ? 's' : ''} noticia{nuevasCount > 1 ? 's' : ''}
            </button>
          )}

      {/* Filtros por tag */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {Object.entries(TAG_LABELS).map(([key, { label }]) => (
          <button
            key={key}
            onClick={() => setTagActivo(key)}
            className={`
              whitespace-nowrap text-xs px-3 py-1.5 rounded-full border transition-colors
              ${tagActivo === key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'}
            `}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cintillo de últimas noticias (Global) */}
      <div className="mb-5 bg-red-50 border border-red-200 rounded-lg overflow-hidden flex items-center shadow-sm">
        <div className="bg-red-600 text-white text-xs font-bold px-3 py-2 uppercase tracking-wider flex-shrink-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
          Última hora
        </div>
        <div className="flex-1 overflow-hidden relative h-full flex items-center">
          {noticiasCintillo.length > 0 ? (
            <div className="whitespace-nowrap animate-marquee flex items-center space-x-8 px-4">
              {noticiasCintillo.map((n) => (
                <a key={`cintillo-${n.id}`} href={n.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-red-900 hover:underline inline-flex items-center">
                  <span className="mr-2 text-red-500 text-[10px]">●</span> {n.titulo}
                </a>
              ))}
            </div>
          ) : (
            <div className="px-4 text-sm text-red-400 italic">
              Obteniendo información oficial...
            </div>
          )}
        </div>
      </div>

      {/* Feed */}
      {cargando ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : noticias.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📡</p>
          <p className="text-sm">Sin noticias verificadas en esta categoría</p>
        </div>
      ) : (
        <div className="space-y-3">
          {noticias.map((n) => {
            const tagInfo = TAG_LABELS[n.tag]
            return (
              <a
                key={n.id}
                href={n.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  block p-4 rounded-xl border border-gray-100 bg-white
                  hover:border-gray-300 hover:shadow-sm transition-all
                  ${n.isNew ? 'ring-2 ring-red-200 ring-offset-1' : ''}
                `}
              >
                {/* Meta row */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-500">
                    {iconoFuente(n.fuente_tipo)} {n.fuente}
                  </span>
                  {tagInfo && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${tagInfo.color}`}>
                      {tagInfo.label}
                    </span>
                  )}
                  {n.isNew && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white">
                      NUEVO
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {tiempoRelativo(n.publicado_at)}
                  </span>
                </div>

                {/* Título */}
                <p className="text-sm font-medium text-gray-900 leading-snug mb-1">
                  {n.titulo}
                </p>

                {/* Descripción corta */}
                {n.descripcion && (
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {n.descripcion}
                  </p>
                )}

                {/* Confianza */}
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="flex-1 h-0.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full"
                      style={{ width: `${n.factcheck_confianza}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {n.factcheck_confianza}% verificado
                  </span>
                </div>
              </a>
            )
          })}
        </div>
      )}
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl mb-4">
            <h3 className="text-sm font-bold text-blue-900 mb-1">Timeline de Medios Oficiales</h3>
            <p className="text-xs text-blue-700">Integración con perfiles verificados (ej. @Funvisis, @PCivil_Ve, etc.).</p>
          </div>

          {/* Timeline de Medios */}
          <div className="relative border-l border-gray-200 ml-3 space-y-6 pb-4">
            
            {noticias
              .filter(n => n.fuente.startsWith('@'))
              .map((n) => {
                // Seleccionar icono según cuenta (opcional)
                let icon = '📰'
                let colorClass = 'bg-blue-100'
                if (n.fuente.includes('PCivil_Ve') || n.fuente.includes('bomberos')) {
                  icon = '🚨'
                  colorClass = 'bg-orange-100'
                } else if (n.fuente.includes('CruzRoja')) {
                  icon = '🏥'
                  colorClass = 'bg-red-100'
                } else if (n.fuente.includes('Funvisis') || n.fuente.includes('usembassy') || n.fuente.includes('nayibbukele')) {
                  icon = '🏛️'
                  colorClass = 'bg-blue-100'
                } else {
                  icon = 'ℹ️'
                  colorClass = 'bg-gray-100'
                }

                return (
                  <div key={`timeline-${n.id}`} className="relative pl-6">
                    <span className={`absolute -left-3 top-0 w-6 h-6 rounded-full ${colorClass} border-4 border-white flex items-center justify-center text-[10px]`}>
                      {icon}
                    </span>
                    <a href={n.url} target="_blank" rel="noopener noreferrer" className="block bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-900">{n.fuente}</span>
                        <span className="text-xs text-gray-400">{tiempoRelativo(n.publicado_at)}</span>
                      </div>
                      <p className="text-sm text-gray-800">
                        {n.titulo}
                      </p>
                      {n.descripcion && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-3">
                          {n.descripcion}
                        </p>
                      )}
                      <div className="mt-2 text-[10px] text-blue-600 font-semibold bg-blue-50 inline-block px-2 py-0.5 rounded">
                        Verificado por cuenta oficial ({n.factcheck_confianza}%)
                      </div>
                    </a>
                  </div>
                )
            })}

            {noticias.filter(n => n.fuente.startsWith('@')).length === 0 && !cargando && (
              <div className="pl-6 text-sm text-gray-400 italic py-4">
                No hay actualizaciones recientes de las cuentas oficiales.
              </div>
            )}

            {cargando && (
              <div className="pl-6 space-y-3 py-4">
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-20 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
