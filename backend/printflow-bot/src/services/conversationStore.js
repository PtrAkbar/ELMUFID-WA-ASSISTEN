// Menyimpan riwayat chat singkat per nomor WA (di memory saja, hilang kalau
// bot restart), supaya AI bisa mengerti obrolan lanjutan -- misalnya customer
// bilang "20 lembar berapa" tanpa nyebut ulang nama barangnya, karena barangnya
// sudah disebut di pesan sebelumnya. Otomatis direset kalau nomor itu diam
// lebih dari BATAS_DIAM_MS, supaya obrolan baru yang beda topik nanti tidak
// ketarik konteks lama.

const MAKS_PESAN = 12; // jumlah pesan (customer+bot) yang disimpan per nomor
const BATAS_DIAM_MS = 20 * 60 * 1000; // 20 menit

const riwayatPerNomor = new Map();

function ambilRiwayat(nomor) {
  const data = riwayatPerNomor.get(nomor);
  if (!data) return [];
  if (Date.now() - data.terakhir > BATAS_DIAM_MS) {
    riwayatPerNomor.delete(nomor);
    return [];
  }
  return data.pesan;
}

function tambahPesan(nomor, role, content) {
  const data = riwayatPerNomor.get(nomor) || { pesan: [], terakhir: Date.now() };
  data.pesan.push({ role, content });
  if (data.pesan.length > MAKS_PESAN) {
    data.pesan.splice(0, data.pesan.length - MAKS_PESAN);
  }
  data.terakhir = Date.now();
  riwayatPerNomor.set(nomor, data);
}

// Dipanggil begitu order sudah dikonfirmasi & tersimpan -- supaya obrolan
// berikutnya dari nomor yang sama dianggap order BARU, bukan nyambung ke
// daftar barang order yang barusan selesai dikonfirmasi.
function resetRiwayat(nomor) {
  riwayatPerNomor.delete(nomor);
}

module.exports = { ambilRiwayat, tambahPesan, resetRiwayat };
