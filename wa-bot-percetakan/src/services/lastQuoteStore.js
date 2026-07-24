// Menyimpan struktur barang dari quote harga TERAKHIR yang dikirim ke tiap
// nomor (bukan cuma teksnya, tapi data barangValid + jasaTambahanList yang
// dipakai buat hitung quote itu). Dipakai sebagai jaring pengaman: kalau
// customer bales pendek kayak "lanjut" / "boleh" / "oke" dan AI gagal
// nyambungin itu ke barang yang sudah dibahas (barang array balik kosong),
// kita nggak perlu nyerahin ke AI buat nebak ulang -- tinggal pakai data
// quote yang barusan beneran dihitung dan dikirim. Ini pure data, bukan
// tebakan, jadi hasilnya selalu match sama apa yang customer barusan lihat.

const quotePerNomor = new Map();

function simpanQuote(nomor, { barangValid, jasaTambahanList }) {
  quotePerNomor.set(nomor, { barangValid, jasaTambahanList: jasaTambahanList || [] });
}

function ambilQuote(nomor) {
  return quotePerNomor.get(nomor) || null;
}

function hapusQuote(nomor) {
  quotePerNomor.delete(nomor);
}

module.exports = { simpanQuote, ambilQuote, hapusQuote };
