// Títulos y descripciones de cada página. Lo usa el navegador (useSeo) y también el backend
// al renderizar en el servidor, así Google ve el mismo texto que el visitante.

export const RUTAS_PUBLICAS = ['/', '/historia', '/profesor', '/galeria', '/contacto']

export function metaDeRuta(pathname, escuela = {}) {
  const nombre = escuela.nombre || 'Ogum Do Taekwondo'
  // "barrio" en escuela.json: es la palabra clave que más pesa en las búsquedas locales
  const zona = escuela.barrio ? `${escuela.barrio}, CABA` : 'CABA'

  const metas = {
    '/': {
      titulo: `Clases de Taekwondo en ${zona} | ${nombre}`,
      descripcion: `Escuela de taekwondo en ${zona}. Clases para niños, adolescentes y adultos, exámenes de graduación y competencia. ¡Tu primera clase es gratis!`,
    },
    '/historia': {
      titulo: `Historia del Taekwondo: orígenes, filosofía y cinturones | ${nombre}`,
      descripcion:
        'De los guerreros Hwarang a los Juegos Olímpicos: los orígenes del taekwondo, sus cinco principios y el significado de cada color de cinturón.',
    },
    '/profesor': {
      titulo: `Nuestro Sabonim: trayectoria y graduaciones | ${nombre}`,
      descripcion: `Conocé al Sabonim de ${nombre}: su camino en el taekwondo, sus graduaciones Dan y sus certificaciones.`,
    },
    '/galeria': {
      titulo: `Fotos de clases, exámenes y torneos | ${nombre}`,
      descripcion: `Galería de ${nombre}: entrenamientos, exámenes de graduación y torneos de taekwondo en ${zona}.`,
    },
    '/contacto': {
      titulo: `Contacto y horarios – Taekwondo en ${zona} | ${nombre}`,
      descripcion: `Horarios, dirección y contacto de ${nombre}${escuela.direccion ? ` (${escuela.direccion})` : ''}. Reservá tu clase de prueba gratis por WhatsApp o desde la web.`,
    },
    '/login': { titulo: `Acceso alumnos | ${nombre}`, indexar: false },
    '/alumno': { titulo: `Mi panel | ${nombre}`, indexar: false },
    '/admin': { titulo: `Panel de administración | ${nombre}`, indexar: false },
  }

  const meta = metas[pathname] ?? { titulo: `Página no encontrada | ${nombre}`, indexar: false, noEncontrada: true }
  return { indexar: true, descripcion: escuela.descripcion, ...meta }
}
