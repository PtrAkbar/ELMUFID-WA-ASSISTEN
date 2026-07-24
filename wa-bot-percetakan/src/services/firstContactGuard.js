// Pengaman supaya bot tidak pernah mengirim pesan duluan ke nomor yang belum
// pernah mengirim pesan ke bot. Daftar nomor yang pernah chat disimpan di
// Supabase (tabel kontak_pernah_chat), bukan cuma di memory -- kalau cuma di
// memory, daftarnya hilang tiap bot restart dan notifikasi status order ke
// customer lama bisa keblokir salah alih-alih dianggap "nomor asing".
// Cache di memory dipakai supaya pengecekan tiap pesan tidak perlu roundtrip
// ke database.

const supabaseService = require('./supabaseService');

const kontakDiketahui = new Set();
let sudahDimuat = false;

function nomorDariJid(jid) {
  return String(jid || '').split('@')[0].split(':')[0];
}

async function muatSemuaKontak() {
  const daftar = await supabaseService.ambilSemuaKontakPernahChat();
  for (const nomor of daftar) kontakDiketahui.add(nomor);
  sudahDimuat = true;
  console.log(`[FirstContact] ${kontakDiketahui.size} kontak dimuat dari database.`);
}

// Dipanggil setiap ada pesan MASUK dari customer -- menandai nomor itu sah
// buat dibalas/dihubungi ke depannya.
async function catatKontakMasuk(jid) {
  const nomor = nomorDariJid(jid);
  if (kontakDiketahui.has(nomor)) return;
  kontakDiketahui.add(nomor);
  try {
    await supabaseService.catatKontakPernahChat(nomor);
  } catch (error) {
    console.error('[FirstContact] Gagal simpan kontak baru:', error.message);
  }
}

// Dipanggil sebelum bot mengirim pesan yang BUKAN balasan langsung dari
// pesan yang baru masuk (misal notifikasi status order, reminder bukti
// bayar) -- balasan langsung dalam satu percakapan yang sedang berjalan
// tidak perlu dicek ulang di sini karena sudah pasti nomor itu baru saja
// mengirim pesan (lihat catatKontakMasuk yang dipanggil duluan).
function bolehKirimKe(jid) {
  if (!sudahDimuat) return true; // belum sempat dimuat (baru start) -- jangan blokir semua
  return kontakDiketahui.has(nomorDariJid(jid));
}

module.exports = { muatSemuaKontak, catatKontakMasuk, bolehKirimKe };
