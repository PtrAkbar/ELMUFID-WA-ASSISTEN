// Mengelola alur pembayaran: nanya metode pembayaran, deteksi jawaban
// customer, dan reminder kirim bukti. Status order yang sudah final (sudah
// bayar/belum) disimpan di database lewat models/orderModel.js -- state di
// sini cuma buat obrolan yang MASIH berjalan (belum final), jadi wajar kalau
// hilang kalau bot restart di tengah obrolan.

const paymentConfigModel = require('../models/paymentConfigModel');

const JEDA_REMINDER_MS = 3 * 60 * 1000; // 3 menit

const menungguMetode = new Map(); // nomor -> { barangValid, jasaTambahanList, orderAktifId, namaPengirim }
const timerReminder = new Map(); // nomor -> Timeout

const KATA_CASH = /\b(cash|tunai)\b/i;
const KATA_QRIS = /\bqris\b/i;
const KATA_TRANSFER = /\b(transfer|rekening|rek|tf)\b/i;
const KATA_BATAL = /\b(gajadi|ga\s*jadi|gak\s*jadi|tidak\s*jadi|batal)\b/i;

const FRASA_KLAIM_SUDAH_BAYAR = [
  'sudah', 'sdh', 'sudh', 'done', 'cek', 'masuk ya kak', 'udah dikirim kak', 'udah kirim', 'udah di kirim',
];

async function konfigPembayaran() {
  const [qris, rekening] = await Promise.all([
    paymentConfigModel.ambilQrisConfig(),
    paymentConfigModel.ambilDaftarRekening(),
  ]);
  return { qris, daftarRekening: rekening, adaQris: Boolean(qris), adaRekening: rekening.length > 0 };
}

function deteksiMetodeDariTeks(teks, config) {
  const t = String(teks || '');
  if (KATA_CASH.test(t)) return 'cash';
  if (config.adaQris && KATA_QRIS.test(t)) return 'qris';
  if (config.adaRekening && KATA_TRANSFER.test(t)) return 'transfer';
  return null;
}

function deteksiPembatalan(teks) {
  return KATA_BATAL.test(String(teks || ''));
}

function deteksiKlaimSudahBayar(teks) {
  const t = String(teks || '').toLowerCase();
  return FRASA_KLAIM_SUDAH_BAYAR.some((frasa) => t.includes(frasa));
}

function mulaiTungguMetode(nomor, data) {
  menungguMetode.set(nomor, data);
}

function ambilTungguMetode(nomor) {
  return menungguMetode.get(nomor) || null;
}

function hapusTungguMetode(nomor) {
  menungguMetode.delete(nomor);
}

// Timer reminder minta bukti pembayaran -- nembak SEKALI aja abis 3 menit
// kalau belum ada gambar yang masuk, lalu berhenti (tidak diulang-ulang).
// kirimReminder: async function tanpa argumen yang benar-benar kirim WA.
function mulaiTimerReminder(nomor, kirimReminder) {
  batalkanTimerReminder(nomor);
  const timer = setTimeout(() => {
    timerReminder.delete(nomor);
    kirimReminder().catch((error) => console.error('[PaymentFlow] Gagal kirim reminder bukti bayar:', error.message));
  }, JEDA_REMINDER_MS);
  timerReminder.set(nomor, timer);
}

function batalkanTimerReminder(nomor) {
  const timer = timerReminder.get(nomor);
  if (timer) {
    clearTimeout(timer);
    timerReminder.delete(nomor);
  }
}

module.exports = {
  konfigPembayaran,
  deteksiMetodeDariTeks,
  deteksiPembatalan,
  deteksiKlaimSudahBayar,
  mulaiTungguMetode,
  ambilTungguMetode,
  hapusTungguMetode,
  mulaiTimerReminder,
  batalkanTimerReminder,
};
