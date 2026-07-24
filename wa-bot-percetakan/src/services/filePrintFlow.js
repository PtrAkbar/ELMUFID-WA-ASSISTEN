// Mengelola alur order dari FILE yang dikirim customer (PDF/gambar mau
// diprint), terpisah dari alur order lewat teks biasa. Customer boleh kirim
// BANYAK file sekaligus/berturut-turut -- semuanya ditampung jadi satu batch
// per nomor, cuma ditanya ukuran kertas SEKALI (bukan sekali per file), dan
// pas kalkulasi harga jumlah halaman SEMUA file di batch itu digabung dulu
// baru dikali harga kertas. Ephemeral di memory -- wajar hilang kalau bot
// restart di tengah obrolan, customer tinggal kirim ulang filenya.

const statePerNomor = new Map(); // nomor -> { files: [{jumlahHalaman, namaFile, jenisFile}], tahap: 'ukuran'|'konfirmasi', barangValid }

// Menambahkan satu file ke batch yang sedang berjalan buat nomor ini (bikin
// batch baru kalau belum ada). Mengembalikan sudahAdaSebelumnya=true HANYA
// kalau batch ini lagi aktif menunggu jawaban ukuran kertas yang BELUM
// terjawab (tahap "ukuran") -- di situ pertanyaan "mau kertas apa" cukup
// dikirim sekali, file berikutnya numpuk diam-diam. Tapi kalau batch
// sebelumnya sudah sempat dikasih quote (tahap "konfirmasi"), file baru
// yang nyusul otomatis BATALIN quote lama itu (itungannya berubah) dan
// balik ke tahap "ukuran" -- kali ini WAJIB nanya ulang (bukan diam),
// karena dari sudut pandang customer ini pertanyaan baru soal file baru.
function tambahFile(nomor, info) {
  let state = statePerNomor.get(nomor);
  const sudahMenungguJawabanUkuran = Boolean(state && state.tahap === 'ukuran' && state.files.length > 0);
  if (!state) {
    state = { files: [], tahap: 'ukuran', barangValid: null };
    statePerNomor.set(nomor, state);
  }
  state.files.push(info);
  state.tahap = 'ukuran';
  state.barangValid = null;
  return { sudahAdaSebelumnya: sudahMenungguJawabanUkuran };
}

function ambilMenungguUkuran(nomor) {
  const state = statePerNomor.get(nomor);
  return state && state.tahap === 'ukuran' && state.files.length > 0 ? state : null;
}

// ukuranKertas: { nama, harga }. Jumlah halaman SEMUA file di batch
// digabung dulu sebelum dikali harga kertas.
function tetapkanUkuran(nomor, ukuranKertas) {
  const state = statePerNomor.get(nomor);
  if (!state || state.files.length === 0) return null;

  const totalHalaman = state.files.reduce((sum, f) => sum + f.jumlahHalaman, 0);
  const barangValid = [
    {
      nama: `Print dokumen (${totalHalaman} hal, ${ukuranKertas.nama})`,
      harga: ukuranKertas.harga,
      jumlahLembar: totalHalaman,
    },
  ];

  state.tahap = 'konfirmasi';
  state.barangValid = barangValid;
  return { totalHalaman, jumlahFile: state.files.length, ukuranKertas, barangValid };
}

function ambilMenungguKonfirmasi(nomor) {
  const state = statePerNomor.get(nomor);
  return state && state.tahap === 'konfirmasi' ? state : null;
}

function hapusSemua(nomor) {
  statePerNomor.delete(nomor);
}

module.exports = { tambahFile, ambilMenungguUkuran, tetapkanUkuran, ambilMenungguKonfirmasi, hapusSemua };
