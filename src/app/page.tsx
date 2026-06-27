'use client';
import { useState, useEffect } from 'react';

export default function FeedNoticias() {
  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const categorias = [
    'Todos', 'Sismo', 'Rescate', 'Desaparecidos', 
    'Puntos de acopio', 'Ayuda humanitaria', 'Réplicas', 
    'Donaciones', 'Internacional'
  ];

  // Función para obtener noticias del endpoint que creamos
  const fetchNoticias = async (categoria: string) => {
    setLoading(true);
    try {
      const url = categoria === 'Todos' ? '/api/feed' : `/api/feed?tag=${categoria.toLowerCase()}`;
      const res = await fetch(url);
      const data = await res.json();
      
      // LA MAGIA ESTÁ AQUÍ: Extraemos el array 'noticias' del objeto 'data'
      setNoticias(data.noticias || []); 
      
    } catch (error) {
      console.error("Error al cargar noticias:", error);
      setNoticias([]); // Evitamos que se quede en null o undefined
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNoticias(categoriaActiva);
  }, [categoriaActiva]);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-6 md:p-12 selection:bg-yellow-400 selection:text-black">
      {/* HEADER (Mantén tu diseño original aquí) */}
      <header className="mb-12 flex flex-col items-center justify-center text-center border-b border-gray-800 pb-8 mt-10">
        <div className="flex gap-2 mb-6 text-3xl">
          <span className="text-yellow-400">★</span>
          <span className="text-blue-500">★</span>
          <span className="text-red-500">★</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.2em] mb-4 uppercase text-white">Venezuela</h1>
        <p className="text-gray-400 text-lg md:text-xl mb-6">Feed de noticias verificadas <span className="text-yellow-400">por Venezuela.</span></p>
      </header>

      {/* FILTROS */}
      <div className="max-w-5xl mx-auto mb-10">
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-1 text-sm border transition-all ${categoriaActiva === cat ? 'border-yellow-400 text-yellow-400' : 'border-gray-800 text-gray-400 hover:border-gray-600'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA DE NOTICIAS CON LÓGICA DE DATOS */}
      <main className="max-w-5xl mx-auto border border-gray-900 p-8 min-h-[400px]">
        {loading ? (
          <div className="text-gray-500 flex items-center gap-3">
            <span className="animate-pulse">_</span> <span>Conectando con Supabase...</span>
          </div>
        ) : noticias.length === 0 ? (
          <p className="text-gray-600 italic">No se encontraron registros verificados en esta categoría.</p>
        ) : (
          <div className="space-y-6">
            {noticias.map((n: any) => (
              <div key={n.id} className="border-b border-gray-900 pb-4">
                <h3 className="text-xl text-white font-bold">{n.titulo}</h3>
                <p className="text-gray-400 text-sm mt-1">{n.contenido}</p>
                <span className="text-[10px] text-gray-600 uppercase mt-2 block">{n.fuente} // {new Date(n.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}