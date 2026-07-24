// Mode admin: begitu admin membalas customer secara manual langsung dari
// aplikasi WhatsApp (bukan lewat bot), bot berhenti ikut campur buat kontak
// itu. Bot aktif otomatis lagi kalau sudah 5 detik gak ada aktivitas chat
// sama sekali (dari admin maupun customer), lalu ditambah jeda 10 detik lagi
// sebagai buffer -- semua diam-diam, gak ada pesan apapun yang dikirim ke
// customer soal ini.

const JEDA_SUNYI_MS = 5000;
const JEDA_BUFFER_MS = 10000;

const statePerNomor = new Map();

// ID pesan yang dikirim BOT SENDIRI -- dipakai buat membedakan pesan fromMe
// yang berasal dari bot (harus diabaikan) vs yang diketik manual oleh admin
// langsung dari WhatsApp (harus memicu mode admin). LRU sederhana pakai Set
// dengan batas ukuran supaya tidak membesar tanpa henti.
const idPesanDariBot = new Set();
const MAKS_ID_DISIMPAN = 500;

function catatPesanDariBot(messageId) {
  if (!messageId) return;
  idPesanDariBot.add(messageId);
  if (idPesanDariBot.size > MAKS_ID_DISIMPAN) {
    const idPertama = idPesanDariBot.values().next().value;
    idPesanDariBot.delete(idPertama);
  }
}

function pesanIniDariBot(messageId) {
  return idPesanDariBot.has(messageId);
}

function ambilState(nomor) {
  let state = statePerNomor.get(nomor);
  if (!state) {
    state = { modeAdmin: false, timerSunyi: null, timerBuffer: null };
    statePerNomor.set(nomor, state);
  }
  return state;
}

function bersihkanTimer(state) {
  clearTimeout(state.timerSunyi);
  clearTimeout(state.timerBuffer);
  state.timerSunyi = null;
  state.timerBuffer = null;
}

// Dipanggil ketika terdeteksi admin balas manual (fromMe tapi bukan dari bot).
function aktifkanModeAdmin(nomor) {
  const state = ambilState(nomor);
  state.modeAdmin = true;
  catatAktivitas(nomor);
}

// Dipanggil tiap ada aktivitas chat apapun (dari admin ATAUPUN customer) di
// kontak yang sedang mode admin -- menunda jam mundur reaktivasi bot.
function catatAktivitas(nomor) {
  const state = statePerNomor.get(nomor);
  if (!state || !state.modeAdmin) return;

  bersihkanTimer(state);
  state.timerSunyi = setTimeout(() => {
    state.timerBuffer = setTimeout(() => {
      state.modeAdmin = false;
    }, JEDA_BUFFER_MS);
  }, JEDA_SUNYI_MS);
}

function sedangModeAdmin(nomor) {
  return statePerNomor.get(nomor)?.modeAdmin === true;
}

module.exports = {
  catatPesanDariBot,
  pesanIniDariBot,
  aktifkanModeAdmin,
  catatAktivitas,
  sedangModeAdmin,
};
