'use client'

import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'framer-motion'
import type { Sismo } from './LeafletMap'

// Leaflet touches `window` at import time, so the whole map tree must be client-only.
// Loading it as a single dynamic chunk (rather than each react-leaflet piece separately)
// keeps the mount atomic — see LeafletMap.tsx for why that matters under StrictMode.
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

// Magnitude buckets mirror magColor() in LeafletMap — keep both in sync.
const MAG_LEGEND = [
  { label: 'M ≥ 6', color: '#DC2626' },
  { label: 'M 5–6', color: '#EA580C' },
  { label: 'M 4–5', color: '#CA8A04' },
  { label: 'M < 4', color: '#16A34A' },
] as const

type Props = {
  sismos: Sismo[]
  outline: GeoJSON.GeoJsonObject | null
  dark: boolean
}

// Presentational 2D view. The container (MapaSwitcher) owns data fetching and dark mode;
// this component only renders what it is handed.
export function MapaSismosView({ sismos, outline, dark }: Props) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4">
        <span className="inline-flex items-center gap-2 text-eyebrow uppercase text-crisis-red">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-crisis-red opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-crisis-red" />
          </span>
          En vivo
        </span>
        <span className="text-small text-ink-muted dark:text-ink-muted-dark">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={sismos.length}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2 }}
              className="inline-block font-semibold text-ink dark:text-ink-dark tnum"
            >
              {sismos.length}
            </motion.span>
          </AnimatePresence>{' '}
          registros oficiales
        </span>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:ml-auto">
          {MAG_LEGEND.map((m) => (
            <li
              key={m.label}
              className="inline-flex items-center gap-1.5 text-caption text-ink-muted dark:text-ink-muted-dark"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: m.color }} aria-hidden />
              {m.label}
            </li>
          ))}
        </ul>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ height: '70vh' }}
        className="overflow-hidden border border-rule-strong/30 dark:border-rule-dark"
      >
        <LeafletMap sismos={sismos} outline={outline} dark={dark} />
      </motion.div>
    </div>
  )
}
