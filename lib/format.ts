const nf = (casas: number) =>
  new Intl.NumberFormat("pt-PT", { minimumFractionDigits: casas, maximumFractionDigits: casas });
const cache = new Map<number, Intl.NumberFormat>();

export function num(x: number, casas = 1): string {
  let f = cache.get(casas);
  if (!f) cache.set(casas, (f = nf(casas)));
  return f.format(x);
}

export function energia(wh: number): string {
  return wh >= 1000 ? `${num(wh / 1000, 2)} kWh` : `${num(wh, 1)} Wh`;
}

export function hora(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-PT", { hour12: false });
}
