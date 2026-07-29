// Memastikan pemrosesan pesan dari NOMOR YANG SAMA berjalan berurutan (FIFO),
// walau Baileys memicu event 'messages.upsert' terpisah tiap pesan masuk yang
// saling tumpang tindih kalau customer ngirim beberapa pesan cepat berturut-
// turut (misal kirim file, langsung susul "a5" sebelum bot sempat balas yang
// pertama). Tanpa ini, dua pesan dari nomor sama bisa diproses BARENGAN,
// saling balapan baca/tulis state yang sama (filePrintFlow, paymentFlow,
// conversationStore) dan urutannya bisa kebalik. Nomor yang BEDA tetap boleh
// jalan paralel -- gak perlu ikut antri nomor lain, biar gak jadi bottleneck
// pas banyak customer chat bersamaan.
const antrianTerakhir = new Map(); // nomor -> Promise pemrosesan terakhir nomor itu

function antrikanPerNomor(nomor, tugas) {
  const sebelumnya = antrianTerakhir.get(nomor) || Promise.resolve();
  const hasil = sebelumnya.then(tugas, tugas);
  // Penanda "terakhir" buat nomor ini diselesaikan tanpa peduli sukses/gagal,
  // supaya satu tugas yang gagal gak bikin antrian nomor itu macet permanen.
  antrianTerakhir.set(nomor, hasil.catch(() => {}));
  return hasil;
}

module.exports = { antrikanPerNomor };
