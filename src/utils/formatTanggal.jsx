// "2026-02-21" -> "21/02/2026"
export function formatTanggal(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}