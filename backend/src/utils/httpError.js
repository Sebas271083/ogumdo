export function httpError(status, mensaje) {
  const err = new Error(mensaje);
  err.status = status;
  return err;
}
