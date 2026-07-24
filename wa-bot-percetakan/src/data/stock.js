// Data stock barang diambil langsung dari Google Sheet yang sama dipakai
// dashboard (lewat stockSheetService), supaya bot WA selalu lihat data
// terbaru -- barang yang baru ditambahkan admin di dashboard langsung
// kebaca oleh bot tanpa restart.
//
// Di-cache singkat (bukan dipanggil ulang ke Google Sheets tiap kali) --
// dalam satu obrolan, getAllStock() bisa kepanggil 2-3 kali per pesan
// (analisis pesan, cocokin ukuran kertas file, dst), dan tiap panggilan ke
// Sheets API itu jauh lebih lambat daripada baca dari memory. 20 detik masih
// cukup cepat buat perubahan stock dari dashboard kerasa "langsung".
const stockSheetService = require('../services/stockSheetService');

const CACHE_MS = 20 * 1000;
let cache = null;
let cacheAt = 0;

async function getAllStock() {
  const sekarang = Date.now();
  if (cache && sekarang - cacheAt < CACHE_MS) return cache;
  cache = await stockSheetService.getAllStock();
  cacheAt = Date.now();
  return cache;
}

module.exports = { getAllStock };
