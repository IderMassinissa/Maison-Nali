export function telHref(numero) {
  if (!numero) return "";
  const nettoye = numero.replace(/[^0-9+]/g, "");
  return `tel:${nettoye.replace(/(?!^)\+/g, "")}`;
}
