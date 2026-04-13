export function tarihiIsoOlarakDondur(tarih: Date | null) {
  return tarih ? tarih.toISOString() : null;
}
