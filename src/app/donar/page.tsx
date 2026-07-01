const INSUMOS = [
  'Leche en polvo',
  'Proteínas enlatadas',
  'Granos secos',
  'Harina de maíz precocida',
  'Pasta',
  'Avena en hojuelas',
  'Galletas saladas',
  'Puré de papa deshidratado',
  'Mantequilla de maní',
  'Huevos en polvo deshidratados',
  'Aceite vegetal',
  'Cubos de caldo',
  'Sal y azúcar',
  'Barras de supervivencia',
]

type Organizacion = {
  nombre: string
  descripcion: string
  url?: string
  urlLabel?: string
}

const ORGANIZACIONES: Organizacion[] = [
  {
    nombre: 'World Central Kitchen (Chef José Andrés)',
    descripcion: 'Ya desplegada en Venezuela distribuyendo comidas calientes a familias afectadas y rescatistas. El chef José Andrés comprometió un millón de dólares de su fundación para esta emergencia.',
    url: 'https://donate.wck.org/team/835442',
    urlLabel: 'donate.wck.org/team/835442',
  },
  {
    nombre: 'Cáritas Venezuela',
    descripcion: 'Con décadas de presencia en el país, activó un despliegue de emergencia inmediato a través de su red diocesana, con centros de acopio en varias zonas afectadas. Cáritas España movilizó 300.000 euros específicamente para esta respuesta.',
    url: 'https://caritas.org.ve',
    urlLabel: 'caritas.org.ve',
  },
  {
    nombre: 'Global Empowerment Mission (GEM)',
    descripcion: 'Movilizada en respuesta al terremoto en alianza con I Love Venezuela, su socio local de largo plazo en el país.',
    url: 'https://globalempowermentmission.org/mission/venezuela-earthquakes',
    urlLabel: 'globalempowermentmission.org',
  },
  {
    nombre: 'Hogar Bambi Venezuela',
    descripcion: 'Organización que trabaja con niñas, niños y adolescentes en Venezuela. Acepta donaciones en dólares.',
    url: 'https://hogarbambi.org/donar-ahora',
    urlLabel: 'hogarbambi.org/donar-ahora',
  },
  {
    nombre: 'Fundación AmCham (Cámara Venezolano-Americana)',
    descripcion: 'Fondo específico para el terremoto con cobro vía Stripe, pensado para donar desde fuera de Venezuela.',
  },
  {
    nombre: 'We Love Foundation / I Love Venezuela',
    descripcion: 'Organización en Miami que recopila fondos y los distribuye a grupos verificados en Venezuela. Canaliza kits médicos, agua y comida.',
  },
  {
    nombre: 'GoFundMe — Emergency Relief for Venezuela',
    descripcion: 'Campaña de recaudación abierta para asistencia de emergencia.',
    url: 'https://gofundme.com',
    urlLabel: 'gofundme.com',
  },
  {
    nombre: 'JustGiving — Healing Venezuela',
    descripcion: 'Campaña para apoyar hospitales, médicos y servicios de rescate en Venezuela.',
    url: 'https://justgiving.com/campaign/venezuelaearthquake2026',
    urlLabel: 'justgiving.com/campaign/venezuelaearthquake2026',
  },
  {
    nombre: 'People in Need — SOS Venezuela',
    descripcion: 'ONG internacional con apelación dedicada al terremoto.',
    url: 'https://peopleinneed.net',
    urlLabel: 'peopleinneed.net',
  },
  {
    nombre: 'ACNUR / USA for UNHCR',
    descripcion: 'La Agencia de la ONU para Refugiados está activa en Venezuela. En algunos períodos ha ofrecido triplicar donaciones mensuales.',
    url: 'https://unhcr.org',
    urlLabel: 'unhcr.org',
  },
  {
    nombre: 'Somos AlumnUSB',
    descripcion: 'Comunidad de egresados de la USB canalizando apoyo de forma ágil y directa hacia familias afectadas.',
    url: 'https://alumnusb.org/ayuda-tras-terremoto/',
    urlLabel: 'alumnusb.org/ayuda-tras-terremoto',
  },
]

export default function DonarPage() {
  return (
    <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
      <header className="border-b-2 border-ink dark:border-ink-dark pb-6 mb-10">
        <p className="text-eyebrow uppercase text-crisis-red mb-3">Cómo ayudar</p>
        <h1 className="font-serif text-display text-ink dark:text-ink-dark">Guía para donar</h1>
        <p className="text-lead text-ink-muted dark:text-ink-muted-dark mt-3 max-w-prose">
          Insumos más necesitados y organizaciones verificadas que están canalizando ayuda a Venezuela tras el sismo del 24 de junio de 2026.
        </p>
      </header>

      {/* Insumos */}
      <section className="mb-14">
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Insumos más necesitados</h2>
        <div className="border-t border-ink dark:border-ink-dark">
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
            {INSUMOS.map(item => (
              <li
                key={item}
                className="flex items-center gap-2.5 py-3 border-b border-rule dark:border-rule-dark text-small text-ink dark:text-ink-dark"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-crisis-red shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Donaciones monetarias */}
      <section className="mb-14">
        <h2 className="text-eyebrow uppercase text-ink-muted dark:text-ink-muted-dark mb-4">Dónde donar dinero</h2>
        <div className="border-t border-ink dark:border-ink-dark">
          {ORGANIZACIONES.map(org => (
            <div key={org.nombre} className="py-5 border-b border-rule dark:border-rule-dark">
              <h3 className="font-serif font-semibold text-ink dark:text-ink-dark text-lg mb-1.5">{org.nombre}</h3>
              <p className="text-small text-ink-muted dark:text-ink-muted-dark max-w-prose mb-2">{org.descripcion}</p>
              {org.url && (
                <a
                  href={org.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] uppercase tracking-widest text-crisis-red hover:underline"
                >
                  {org.urlLabel ?? org.url} →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Fuentes */}
      <section className="bg-panel dark:bg-panel-dark border border-rule dark:border-rule-dark p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-muted dark:text-ink-muted-dark mb-2">Verificar más organizaciones</p>
        <p className="text-small text-ink-muted dark:text-ink-muted-dark max-w-prose mb-3">
          Antes de donar a una campaña que no reconozcas, revisá su trayectoria en{' '}
          <a href="https://donarseguro.com" target="_blank" rel="noopener noreferrer" className="text-crisis-red hover:underline">
            donarseguro.com
          </a>
          , un directorio de campañas legítimas para el terremoto de Venezuela.
        </p>
        <p className="font-mono text-[10px] text-ink-muted dark:text-ink-muted-dark">
          Fuentes:{' '}
          <a
            href="https://lga.lagranaldea.com/2026/06/28/guia-completa-para-ayudar-a-venezuela-tras-el-terremoto-donde-buscar-personas-como-donar-y-que-hacer/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink dark:hover:text-ink-dark"
          >
            La Gran Aldea
          </a>
          {' · '}
          <a
            href="https://alumnusb.org/ayuda-tras-terremoto/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-ink dark:hover:text-ink-dark"
          >
            AlumnUSB
          </a>
        </p>
      </section>
    </main>
  )
}
