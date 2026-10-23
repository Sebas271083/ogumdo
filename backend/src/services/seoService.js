export const SITE_URL = (process.env.SITE_URL || "http://localhost:4000").replace(/\/+$/, "");

const escapar = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

export const urlAbsoluta = (ruta) => `${SITE_URL}${ruta}`;

// "https://instagram.com/" (el valor de ejemplo) no es un perfil: solo se publican URLs con ruta
function esPerfil(url) {
  try {
    return new URL(url).pathname.length > 1;
  } catch {
    return false;
  }
}

const DIAS_SCHEMA = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Horarios de clase como horario de apertura: Google los muestra en la ficha del negocio
function horariosSchema(horarios = []) {
  const lista = horarios
    .filter((h) => Array.isArray(h.diasSemana) && h.inicio && h.fin)
    .map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.diasSemana.map((d) => `https://schema.org/${DIAS_SCHEMA[d]}`),
      opens: h.inicio,
      closes: h.fin,
    }));
  return lista.length ? lista : undefined;
}

// Datos estructurados (Schema.org): le dicen a Google qué es el negocio, dónde está y cómo contactarlo
function jsonLdEscuela(escuela) {
  const d = escuela.direccionPostal;
  const redes = Object.values(escuela.redes ?? {}).filter(esPerfil);
  const datos = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    "@id": `${SITE_URL}/#escuela`,
    name: escuela.nombre,
    description: escuela.descripcion,
    url: `${SITE_URL}/`,
    logo: urlAbsoluta("/img/logo.jpg"),
    image: urlAbsoluta("/img/logo.jpg"),
    telephone: escuela.telefono,
    email: escuela.email,
    address: d
      ? {
          "@type": "PostalAddress",
          streetAddress: d.calle,
          postalCode: d.codigoPostal,
          addressLocality: d.localidad,
          addressCountry: d.pais,
        }
      : escuela.direccion,
    sameAs: redes.length ? redes : undefined,
    openingHoursSpecification: horariosSchema(escuela.horarios),
  };
  return `<script type="application/ld+json">${JSON.stringify(datos).replace(/</g, "\\u003c")}</script>`;
}

export function headHtml({ meta, pathname, escuela }) {
  const lineas = [`<title>${escapar(meta.titulo)}</title>`];
  if (meta.descripcion) lineas.push(`<meta name="description" content="${escapar(meta.descripcion)}" />`);

  if (!meta.indexar) {
    lineas.push('<meta name="robots" content="noindex, nofollow" />');
    return lineas.join("\n    ");
  }

  const url = urlAbsoluta(pathname);
  lineas.push(
    `<link rel="canonical" href="${url}" />`,
    // Open Graph: vista previa al compartir el link por WhatsApp, Facebook, etc.
    '<meta property="og:type" content="website" />',
    '<meta property="og:locale" content="es_AR" />',
    `<meta property="og:site_name" content="${escapar(escuela.nombre)}" />`,
    `<meta property="og:title" content="${escapar(meta.titulo)}" />`,
    `<meta property="og:description" content="${escapar(meta.descripcion)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${urlAbsoluta("/img/logo.jpg")}" />`,
    '<meta name="twitter:card" content="summary" />',
    jsonLdEscuela(escuela)
  );
  return lineas.join("\n    ");
}
