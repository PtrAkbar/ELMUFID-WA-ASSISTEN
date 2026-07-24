export const namaBulan = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export const namaBulanSingkat = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

export const namaHariSingkat = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function formatTgl(date) {
  return `${date.getDate()} ${namaBulanSingkat[date.getMonth()]}`;
}

export function formatTglPanjang(date) {
  return `${date.getDate()} ${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
}

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date, jumlah) {
  const d = new Date(date);
  d.setDate(d.getDate() + jumlah);
  return d;
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function bulanTahunKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatBulanTahun(date) {
  return `${namaBulan[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatJam(date) {
  const jam = String(date.getHours()).padStart(2, "0");
  const menit = String(date.getMinutes()).padStart(2, "0");
  return `${jam}:${menit}`;
}
