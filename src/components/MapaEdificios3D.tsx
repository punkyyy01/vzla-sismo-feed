'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// ArcGIS webscene hosted on arcgis.com. We embed the public viewer via iframe
// rather than pulling in @arcgis/core — the SDK is hundreds of KB and we only
// need to display the scene, not drive it programmatically.
const WEBSCENE_ID = 'c01ef4b6b74b4d25a39f7a1e4865be58'
const VIEWER_URL = `https://www.arcgis.com/home/webscene/viewer.html?webscene=${WEBSCENE_ID}`

// Approximate height of the ArcGIS Scene Viewer top bar, in px. The iframe is shifted
// up by this amount so that bar is clipped off the top of the container.
const HEADER_OFFSET = 56

// Presentational 3D view. Embeds the cross-origin ArcGIS scene; the parent decides
// when to mount it.
export function MapaEdificios3DView() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-4">
        <span className="text-eyebrow uppercase text-crisis-red">Modelo 3D</span>
        <span className="text-small text-ink-muted dark:text-ink-muted-dark">
          Franja costera de La Guaira · foco en{' '}
          <span className="font-semibold text-ink dark:text-ink-dark">Catia La Mar</span>
        </span>
        <span className="text-caption text-ink-muted dark:text-ink-muted-dark sm:ml-auto">
          Arrastrá para rotar · scroll para acercar
        </span>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ height: '70vh' }}
        className="relative overflow-hidden border border-rule-strong/30 dark:border-rule-dark"
      >
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-ink-muted dark:text-ink-muted-dark">
            <span className="text-sm">Cargando mapa 3D…</span>
          </div>
        )}
        {/* The iframe is grown by HEADER_OFFSET and pulled up so the ArcGIS Scene Viewer
            top bar is clipped outside the overflow-hidden container. The viewer chrome is
            cross-origin, so this visual crop is the only way to hide it without the SDK. */}
        <iframe
          src={VIEWER_URL}
          title="Edificios afectados en Catia La Mar"
          className="absolute left-0 w-full border-0"
          style={{ top: `-${HEADER_OFFSET}px`, height: `calc(100% + ${HEADER_OFFSET}px)` }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={() => setLoaded(true)}
        />
      </motion.div>
    </div>
  )
}
