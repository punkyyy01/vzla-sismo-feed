'use client'

import { useState } from 'react'
import { FeedNoticias } from '@/components/FeedNoticias'
import { SismosUSGS } from '@/components/SismosUSGS'

export default function Page() {
  const [activeTab, setActiveTab] = useState<'noticias' | 'sismos'>('noticias')

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Barra de pestañas fijada arriba */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('noticias')}
            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'noticias'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Noticias Verificadas
          </button>
          <button
            onClick={() => setActiveTab('sismos')}
            className={`flex-1 py-4 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'sismos'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Sismos (USGS)
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div>
        {activeTab === 'noticias' && <FeedNoticias />}
        {activeTab === 'sismos' && <SismosUSGS />}
      </div>
    </main>
  )
}
