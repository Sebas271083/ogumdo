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
