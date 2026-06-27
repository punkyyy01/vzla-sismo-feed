# Venezuela Sismo — Feed de noticias verificadas

Feed en tiempo real de noticias verificadas sobre el doblete sísmico del 24 de junio de 2026 en Venezuela.  
Stack: **Next.js 14 · Supabase · Tailwind · Claude API (fact-checking)**

---

## El evento

Dos sismos ocurrieron con apenas 40 segundos de diferencia:
- **M7.2** y **M7.5** con epicentro cerca de Morón / San Felipe (Yaracuy/Carabobo)
- Zonas más afectadas: La Guaira, Caracas, Carabobo, Miranda, Trujillo
- ~920 muertos · ~3,360 heridos · +50,000 desaparecidos
- Estado de emergencia declarado por el gobierno venezolano

---

## Cómo funciona

```
RSS / USGS GeoJSON / Nitter
           │
           ▼
  [Pre-filtro keywords]   ← gratis, instantáneo
           │ pasa
           ▼
  [Claude fact-checker]   ← verifica relevancia + asigna tag + score 0-100
           │ aprobado
           ▼
  [Supabase (noticias)]   ← RLS: solo aprobadas son públicas
           │
           ▼
  [Supabase Realtime]     ← WebSocket push al cliente
           │
           ▼
  [Feed en el browser]    ← se actualiza solo
```

Cada noticia pasa por dos filtros:
1. **Pre-filtro de keywords** — descarta lo obvio gratis (sin gastar tokens)
2. **Claude API (claude-sonnet-4-6)** — verifica relevancia al sismo de Venezuela, asigna tag y da score de confianza 0-100

Cada noticia tiene tres estados posibles: `aprobado`, `rechazado`, o `dudoso`. Solo las `aprobado` aparecen en el feed público (RLS de Supabase lo garantiza). Las rechazadas y dudosas se guardan igual para auditoría.

USGS se maneja aparte: consume GeoJSON en lugar de RSS y sus entradas son auto-aprobadas (fuente oficial, confianza 99).

El cron corre en Vercel cada 5 minutos. La respuesta del endpoint `/api/ingest` incluye:
```json
{ "ok": true, "procesadas": N, "aprobadas": N, "rechazadas": N, "duplicadas": N, "timestamp": "..." }
```

---

## Deploy en Vercel

```bash
npm i -g vercel
vercel --prod
```

Agregar en Vercel → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `CRON_SECRET`

El `vercel.json` ya configura el cron para correr `/api/ingest` cada 5 minutos.

---

## Tags del feed

| Tag | Qué cubre |
|-----|-----------|
| `sismo` | Datos técnicos, magnitud, epicentro |
| `rescate` | Equipos de búsqueda y rescate, supervivientes |
| `desaparecidos` | Personas buscadas, plataformas de localización |
| `puntos_acopio` | Centros de donación en especie |
| `ayuda_humanitaria` | ONG, refugios, distribución de ayuda |
| `replicas` | Aftershocks, sismos posteriores |
| `donaciones` | Cómo donar dinero, canales de donación |
| `internacional` | Respuesta de otros países, diplomacia |

---

## Fuentes

**Alta confiabilidad (procesadas con mayor tolerancia):**
- Reuters América Latina
- AP News
- BBC Mundo
- CNN en Español
- Univisión Noticias
- El Tiempo (Colombia)
- USGS (datos sísmicos oficiales — auto-aprobadas, sin fact-check)

**Confiabilidad media (mayor scrutiny de Claude):**
- X #TerremotoVenezuela (via Nitter RSS)
- X #SismoVenezuela (via Nitter RSS)

---

## Costos estimados (Claude API)

~9 fuentes × hasta 20 items × cada 5 min = ~2,000 llamadas/hora máximo.  
El pre-filtro de keywords elimina ~70-80% antes de llegar a Claude.  
Costo estimado: **< $2 USD/día** con `claude-sonnet-4-6` a precios actuales.
