export function formatRupiah(angka) {
  return "Rp" + Number(angka).toLocaleString("id-ID");
}

export function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function toOrderCode(id) {
  return "ORD_" + String(id).padStart(6, "0");
}

export function mapOrderRow(row) {
  return {
    id: row.id,
    kode: toOrderCode(row.id),
    nama: row.nama_customer,
    nomor: row.nomor_wa,
    detail: row.detail,
    total: Number(row.total),
    totalFormatted: formatRupiah(row.total),
    status: row.status,
    tanggal: formatTanggal(row.created_at),
    tanggalObj: new Date(row.created_at),
    updatedAt: row.updated_at,
  };
}
