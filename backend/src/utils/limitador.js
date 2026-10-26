// Límite de pedidos por clave (IP) en una ventana de tiempo, en memoria.
// Sirve para una sola instancia del servidor, que es como corre en Coolify.
export function crearLimitador({ max, ventanaMs }) {
  const registros = new Map();

  // Limpieza periódica: si no, un atacante con muchas IPs llenaría la memoria
  setInterval(() => {
    const ahora = Date.now();
    for (const [clave, r] of registros) if (r.reset < ahora) registros.delete(clave);
  }, ventanaMs).unref();

  return {
    bloqueado(clave) {
      const r = registros.get(clave);
      return Boolean(r && r.reset > Date.now() && r.count >= max);
    },
    sumar(clave) {
      const r = registros.get(clave);
      if (!r || r.reset < Date.now()) registros.set(clave, { count: 1, reset: Date.now() + ventanaMs });
      else r.count++;
    },
    limpiar(clave) {
      registros.delete(clave);
    },
  };
}
