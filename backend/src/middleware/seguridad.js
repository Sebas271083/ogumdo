import { randomBytes } from "node:crypto";

const produccion = process.env.NODE_ENV === "production";

// Política de contenido: el navegador solo ejecuta scripts del propio sitio (y el bloque de datos
// del render en el servidor, identificado con un nonce por pedido). Si alguien lograra inyectar un
// <script> o un iframe malicioso, el navegador no lo corre.
function politicaContenido(nonce) {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    // 'unsafe-inline' solo para estilos: React usa atributos style (cinturones, colores)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://i.ytimg.com",
    "frame-src https://www.youtube-nocookie.com https://www.google.com https://maps.google.com",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(produccion ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function cabecerasSeguridad(req, res, next) {
  const nonce = randomBytes(16).toString("base64");
  res.locals.nonce = nonce;

  res.setHeader("Content-Security-Policy", politicaContenido(nonce));
  // Que no se pueda meter el sitio dentro de un iframe de otra web (clickjacking)
  res.setHeader("X-Frame-Options", "DENY");
  // Que el navegador no "adivine" el tipo de un archivo subido y lo ejecute como HTML
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  // Una vez que entraste por HTTPS, el navegador no vuelve a usar HTTP por un año
  if (produccion) res.setHeader("Strict-Transport-Security", "max-age=31536000");
  next();
}
