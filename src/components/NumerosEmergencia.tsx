'use client'

import { useState } from 'react'

export function NumerosEmergencia() {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 transition-all z-50 flex items-center gap-2 font-medium"
      >
        <span className="text-xl">🚨</span>
        <span className="hidden sm:inline">Emergencias</span>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="bg-white w-full sm:w-full sm:max-w-md h-[85vh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              🚨 Directorio de Emergencia
            </h2>
            <p className="text-xs text-gray-500 mt-1">Presiona un número para llamar</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6">
          
          {/* Operadoras */}
          <section>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Líneas Generales</h3>
            <div className="grid grid-cols-2 gap-2">
              <a href="tel:911" className="flex flex-col bg-red-50 p-3 rounded-lg border border-red-100 hover:bg-red-100 transition">
                <span className="text-xs text-red-600 font-medium">Movistar</span>
                <span className="text-lg font-bold text-red-900">911</span>
              </a>
              <a href="tel:171" className="flex flex-col bg-red-50 p-3 rounded-lg border border-red-100 hover:bg-red-100 transition">
                <span className="text-xs text-red-600 font-medium">CANTV (fijos)</span>
                <span className="text-lg font-bold text-red-900">171</span>
              </a>
              <a href="tel:112" className="flex flex-col bg-red-50 p-3 rounded-lg border border-red-100 hover:bg-red-100 transition">
                <span className="text-xs text-red-600 font-medium">Digitel</span>
                <span className="text-lg font-bold text-red-900">112</span>
              </a>
              <a href="tel:*1" className="flex flex-col bg-red-50 p-3 rounded-lg border border-red-100 hover:bg-red-100 transition">
                <span className="text-xs text-red-600 font-medium">Movilnet</span>
                <span className="text-lg font-bold text-red-900">*1</span>
              </a>
            </div>
          </section>

          {/* Protección Civil */}
          <section>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Protección Civil</h3>
            <div className="space-y-2">
              <a href="tel:08005588427" className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 border border-gray-100">
                <span className="text-sm font-medium text-gray-700">Nacionales</span>
                <span className="text-sm font-bold text-gray-900">0800-5588427</span>
              </a>
              <a href="tel:04242075335" className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 border border-gray-100">
                <span className="text-sm font-medium text-gray-700">La Guaira</span>
                <span className="text-sm font-bold text-gray-900">0424-2075335</span>
              </a>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-sm font-medium text-gray-700 mb-1">Caracas (Central)</span>
                <div className="flex gap-2">
                  <a href="tel:02125751823" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 575-1823</a>
                  <a href="tel:02126318662" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 631-8662</a>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-sm font-medium text-gray-700 mb-1">Caracas (Libertador)</span>
                <div className="flex gap-2">
                  <a href="tel:08007253661" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">0800-725-3661</a>
                  <a href="tel:02125410830" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 541-0830</a>
                </div>
              </div>
            </div>
          </section>

          {/* Bomberos */}
          <section>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Bomberos</h3>
            <div className="space-y-2">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-sm font-medium text-gray-700 mb-1">Caracas Metropolitana</span>
                <div className="flex gap-2">
                  <a href="tel:02125454545" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 545-4545</a>
                  <a href="tel:02125420243" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 542-0243</a>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-sm font-medium text-gray-700 mb-1">La Guaira</span>
                <div className="flex gap-2">
                  <a href="tel:02123327620" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 332-7620</a>
                  <a href="tel:02123310445" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">(0212) 331-0445</a>
                </div>
              </div>
            </div>
          </section>

          {/* Seguridad y Especializados */}
          <section>
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Seguridad y Sismos</h3>
            <div className="space-y-2">
              <a href="tel:08007654242" className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 border border-gray-100">
                <span className="text-sm font-medium text-gray-700">Policía Nacional</span>
                <span className="text-sm font-bold text-gray-900">0800-765-4242</span>
              </a>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="block text-sm font-medium text-gray-700 mb-1">FUNVISIS (Reporte de Sismos)</span>
                <div className="flex gap-2">
                  <a href="tel:08008362567" className="flex-1 text-center py-1.5 bg-white border rounded text-sm font-bold text-gray-900 hover:bg-gray-50">0-800-TEMBLOR</a>
                </div>
              </div>
            </div>
          </section>

          {/* Apps y Desaparecidos */}
          <section className="pb-4">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Plataformas Oficiales</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100 hover:bg-blue-100 transition">
                <span className="text-2xl">📱</span>
                <div>
                  <span className="block text-sm font-bold text-blue-900">VENApp</span>
                  <span className="block text-xs text-blue-700">App oficial para reportar emergencias.</span>
                </div>
              </a>
              <a href="#" className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg border border-purple-100 hover:bg-purple-100 transition">
                <span className="text-2xl">🔍</span>
                <div>
                  <span className="block text-sm font-bold text-purple-900">Desaparecidos Terremoto VE</span>
                  <span className="block text-xs text-purple-700">Web de registro y búsqueda de personas.</span>
                </div>
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
