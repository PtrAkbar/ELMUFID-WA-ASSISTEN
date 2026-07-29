// Mengelola alur order dari FILE yang dikirim customer (PDF/gambar mau
// diprint), terpisah dari alur order lewat teks biasa. Customer sering kirim
// BANYAK file BERTURUT-TURUT dalam hitungan detik -- WhatsApp cuma ngirim
// tiap file sebagai pesan terpisah (bukan satu event), jadi kalau langsung
// diproses begitu file PERTAMA nyampe, hitungannya keburu salah (cuma
// ngitung 1 file padahal ada beberapa nyusul) dan pertanyaan ukuran kertas
// bisa ke-ulang berkali-kali. Makanya dipakai jeda "diam" (JEDA_BATCH_MS) --
// tiap ada file/teks baru dari nomor yang sama, timer di-reset; begitu nomor
// itu diam selama jeda itu (gak ada file/teks baru lagi), BARU batch
// dianggap selesai terkumpul dan diproses sekaligus (lihat
// mulaiTimerBatch/selesaikanBatchFile di messageController.js). Ephemeral di
// memory -- wajar hilang kalau bot restart di tengah obrolan, customer
// tinggal kirim ulang filenya.
const JEDA_BATCH_MS = 3000;

const statePerNomor = new Map(); // nomor -> { files, teksTerkumpul, tahap: 'mengumpulkan'|'ukuran'|'konfirmasi', barangValid }
const timerBatch = new Map(); // nomor -> Timeout

// File/teks baru selalu bikin batch balik ke tahap "mengumpulkan" (bukan
// langsung tanya/proses) -- files-nya TETAP digabung ke array yang sama
// walau sebelumnya udah sempat ditanya ukuran atau bahkan udah dikasih quote
// (quote lama otomatis batal, itungannya berubah karena ada tambahan).
// teksTerkumpul cuma direset kalau ini beneran ronde baru (bukan lagi
// nyambung dari jeda batch yang masih berjalan).
function ambilAtauBuatState(nomor) {
  let state = statePerNomor.get(nomor);
  if (!state) {
    state = { files: [], teksTerkumpul: [], tahap: 'mengumpulkan', barangValid: null };
    statePerNomor.set(nomor, state);
    return state;
  }
  if (state.tahap !== 'mengumpulkan') {
    state.tahap = 'mengumpulkan';
    state.barangValid = null;
    state.teksTerkumpul = [];
  }
  return state;
}

function tambahFile(nomor, info) {
  const state = ambilAtauBuatState(nomor);
  state.files.push(info);
  return state;
}

// Teks (caption atau pesan terpisah) yang nyusul SELAGI batch masih
// "mengumpulkan" -- ditampung buat dipakai sekali pas batch selesai (lihat
// ambilTeksTerkumpul), bukan diproses satu-satu per pesan.
function tambahTeks(nomor, teks) {
  const state = statePerNomor.get(nomor);
  if (!state || state.tahap !== 'mengumpulkan' || !teks || !teks.trim()) return;
  state.teksTerkumpul.push(teks.trim());
}

function sedangMengumpulkan(nomor) {
  const state = statePerNomor.get(nomor);
  return state && state.tahap === 'mengumpulkan' ? state : null;
}

function ambilTeksTerkumpul(nomor) {
  const state = statePerNomor.get(nomor);
  return state ? state.teksTerkumpul.join(' ') : '';
}

function pindahKeTahapUkuran(nomor) {
  const state = statePerNomor.get(nomor);
  if (state) state.tahap = 'ukuran';
}

function ambilMenungguUkuran(nomor) {
  const state = statePerNomor.get(nomor);
  return state && state.tahap === 'ukuran' && state.files.length > 0 ? state : null;
}

// ukuranKertas: { nama, harga }. Jumlah halaman SEMUA file di batch
// digabung dulu, dikali salinanPerFile (default 1, kalau customer minta
// tiap file dicetak berapa lembar/kali), baru dikali harga kertas.
function tetapkanUkuran(nomor, ukuranKertas, salinanPerFile = 1) {
  const state = statePerNomor.get(nomor);
  if (!state || state.files.length === 0) return null;

  const totalHalamanAsli = state.files.reduce((sum, f) => sum + f.jumlahHalaman, 0);
  const totalHalaman = totalHalamanAsli * salinanPerFile;
  const catatanSalinan = salinanPerFile > 1 ? `, ${salinanPerFile}x tiap file` : '';
  const barangValid = [
    {
      nama: `Print dokumen (${state.files.length} file${catatanSalinan}, ${ukuranKertas.nama})`,
      harga: ukuranKertas.harga,
      jumlahLembar: totalHalaman,
    },
  ];

  state.tahap = 'konfirmasi';
  state.barangValid = barangValid;
  return { totalHalaman, jumlahFile: state.files.length, salinanPerFile, ukuranKertas, barangValid };
}

function ambilMenungguKonfirmasi(nomor) {
  const state = statePerNomor.get(nomor);
  return state && state.tahap === 'konfirmasi' ? state : null;
}

function hapusSemua(nomor) {
  statePerNomor.delete(nomor);
  batalkanTimerBatch(nomor);
}

// callback: async function tanpa argumen, dipanggil begitu nomor ini diam
// (gak ada file/teks baru) selama JEDA_BATCH_MS. Dipanggil ulang (reset
// timer-nya) tiap ada file/teks baru buat nomor yang sama.
function mulaiTimerBatch(nomor, callback) {
  batalkanTimerBatch(nomor);
  const timer = setTimeout(() => {
    timerBatch.delete(nomor);
    callback().catch((error) => console.error('[FilePrintFlow] Gagal proses batch:', error.message));
  }, JEDA_BATCH_MS);
  timerBatch.set(nomor, timer);
}

function batalkanTimerBatch(nomor) {
  const timer = timerBatch.get(nomor);
  if (timer) {
    clearTimeout(timer);
    timerBatch.delete(nomor);
  }
}

module.exports = {
  tambahFile,
  tambahTeks,
  sedangMengumpulkan,
  ambilTeksTerkumpul,
  pindahKeTahapUkuran,
  ambilMenungguUkuran,
  tetapkanUkuran,
  ambilMenungguKonfirmasi,
  hapusSemua,
  mulaiTimerBatch,
  batalkanTimerBatch,
};
