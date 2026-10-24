import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { FRONTEND_DIST, FRONTEND_SSR } from "../config/paths.js";
import { leerContenido } from "../services/contenidoService.js";
import { listarFotos, listarAlbumes } from "../services/galeriaService.js";
import { listarDescargas } from "../services/descargasService.js";
import { listarEventos } from "../services/eventosService.js";
import { SITE_URL, headHtml } from "../services/seoService.js";

// Se cargan una sola vez: el bundle de React para servidor y el index.html del build
let ssr = null;
let template = null;

async function cargarSsr() {
  if (!ssr) {
    [ssr, template] = await Promise.all([
      import(pathToFileURL(FRONTEND_SSR).href),
      fs.readFile(path.join(FRONTEND_DIST, "index.html"), "utf8"),
    ]);
  }
  return ssr;
}

const serializar = (datos) => JSON.stringify(datos).replace(/</g, "\\u003c");

// Si MySQL no responde, la página igual se renderiza (sin fotos, descargas ni eventos)
async function sinFallar(consulta, siFalla) {
  try {
    return await consulta();
  } catch (err) {
    console.error("SSR: no se pudo leer de la base", err.message);
    return siFalla;
  }
}

// Solo lo público: el HTML del servidor es igual para todos los visitantes
const datosPublicos = async () => {
  const [galeria, albumes, descargas, calendario] = await Promise.all([
    sinFallar(() => listarFotos(), []),
    sinFallar(() => listarAlbumes(), []),
    sinFallar(() => listarDescargas({ soloPublicas: true }), []),
    sinFallar(() => listarEventos({ soloPublicos: true }), null),
  ]);
  return { galeria, albumes, descargas, calendario };
};

// Las replace usan función: con un string, "$&" o "$'" dentro del HTML se interpretarían como patrones
function armarHtml({ head, html, datos }) {
  return template
    .replace("<!--app-head-->", () => head)
    .replace("<!--app-html-->", () => html)
    .replace("<!--app-datos-->", () => `<script>window.__DATOS__=${serializar(datos)}</script>`);
}

export async function pagina(req, res, next) {
  try {
    const { render, metaDeRuta, RUTAS_PUBLICAS } = await cargarSsr();

    // Una sola URL por página: /historia/ redirige a /historia
    if (req.path.length > 1 && req.path.endsWith("/")) {
      return res.redirect(301, req.path.replace(/\/+$/, "") || "/");
    }

    const pathname = req.path;
    const escuela = await leerContenido("escuela");
    const meta = metaDeRuta(pathname, escuela);

    // Login y paneles dependen de la sesión: se arman en el navegador y no se indexan
    const renderizar = RUTAS_PUBLICAS.includes(pathname) || meta.noEncontrada;
    const datos = renderizar
      ? { escuela, profesor: await leerContenido("profesor"), ...(await datosPublicos()) }
      : { escuela };

    let html = "";
    if (renderizar) {
      try {
        html = render(pathname, datos);
      } catch (err) {
        // Si falla el render en el servidor, el navegador arma la página igual
        console.error("SSR: error al renderizar", pathname, err);
      }
    }

    res
      .status(meta.noEncontrada ? 404 : 200)
      .type("html")
      .send(armarHtml({ head: headHtml({ meta, pathname, escuela }), html, datos }));
  } catch (err) {
    next(err);
  }
}

export function robots(req, res) {
  res.type("text/plain").send(
    [
      "User-agent: *",
      "Disallow: /admin",
      "Disallow: /alumno",
      "Disallow: /login",
      "Disallow: /api/",
      "Allow: /api/galeria/",
      "",
      `Sitemap: ${SITE_URL}/sitemap.xml`,
      "",
    ].join("\n")
  );
}

export async function sitemap(req, res, next) {
  try {
    const { RUTAS_PUBLICAS } = await cargarSsr();
    const urls = RUTAS_PUBLICAS.map(
      (ruta) =>
        `  <url><loc>${SITE_URL}${ruta}</loc><priority>${ruta === "/" ? "1.0" : "0.8"}</priority></url>`
    );
    res
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
      );
  } catch (err) {
    next(err);
  }
}
