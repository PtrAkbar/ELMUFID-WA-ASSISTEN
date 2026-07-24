const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
  normalizeMessageContent,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const QRCode = require('qrcode');
const fs = require('fs/promises');
const { handleIncomingMessage } = require('../controllers/messageController');
const env = require('../config/env');
const waState = require('./waState');
const orderModel = require('../models/orderModel');
const { simulasikanBalasanNatural } = require('./naturalDelay');
const { antrikanPengiriman } = require('./messageQueue');
const firstContactGuard = require('./firstContactGuard');
const adminMode = require('./adminMode');

const logger = pino({ level: 'silent' });

// Mengunduh file yang dikirim customer (dokumen/gambar) lalu, khusus buat
// PDF, hitung jumlah halamannya -- dipakai buat fitur order lewat file
// (lihat filePrintFlow.js). Kalau bukan PDF (gambar biasa atau dokumen non-
// PDF), dianggap 1 halaman. WhatsApp sendiri sudah menyertakan pageCount di
// metadata documentMessage buat PDF -- dipakai duluan kalau ada (lebih
// cepat, gak perlu download+parse), fallback ke pdf-parse manual kalau
// metadata itu kosong/gak ada.
async function ekstrakInfoFile(sock, message, konten, adaDokumen) {
  if (adaDokumen) {
    const namaFile = konten.documentMessage?.fileName || 'dokumen';
    const mimetype = konten.documentMessage?.mimetype || '';
    const isPdf = mimetype.includes('pdf') || namaFile.toLowerCase().endsWith('.pdf');

    if (isPdf && konten.documentMessage?.pageCount) {
      return { jenisFile: 'pdf', jumlahHalaman: konten.documentMessage.pageCount, namaFile };
    }

    const buffer = await downloadMediaMessage(message, 'buffer', {}, { logger, reuploadRequest: sock.updateMediaMessage });
    if (isPdf) {
      const { PDFParse } = require('pdf-parse');
      const parser = new PDFParse({ data: buffer });
      const info = await parser.getInfo();
      await parser.destroy();
      return { jenisFile: 'pdf', jumlahHalaman: info.total || 1, namaFile };
    }
    return { jenisFile: 'dokumen', jumlahHalaman: 1, namaFile };
  }

  return { jenisFile: 'gambar', jumlahHalaman: 1, namaFile: 'gambar' };
}

// Cache gambar (misal QRIS) yang dikirim lewat URL, di-keyed by URL itu
// sendiri -- supaya Baileys gak perlu download ulang dari Supabase Storage
// tiap kali ada customer yang pilih QRIS (lumayan bikin lambat kalau
// diulang tiap kirim, apalagi ditambah proses generate thumbnail Baileys).
// URL QRIS baru otomatis dapat nama file baru tiap admin upload ulang (lihat
// useKustomisasi.js), jadi cache ini gak akan pernah nyangkut ke gambar lama.
const gambarBufferCache = new Map();

async function ambilGambarBuffer(url) {
  if (gambarBufferCache.has(url)) return gambarBufferCache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Gagal unduh gambar: HTTP ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  gambarBufferCache.set(url, buffer);
  return buffer;
}

// Dimuat sekali saat modul ini pertama kali di-require (saat bot start),
// bukan tiap kali startWhatsAppBot() dipanggil ulang (bisa berkali-kali
// akibat reconnect) -- ini murni baca database, tidak terikat koneksi WA.
firstContactGuard.muatSemuaKontak().catch((error) => console.error('[WA] Gagal muat daftar kontak:', error.message));

// Mengirim lewat antrian rate-limit (messageQueue) supaya bot gak pernah
// kirim lebih dari 1 pesan tiap 2 detik, dan mencatat ID pesan yang
// dikirimnya sendiri (adminMode) supaya nanti bisa dibedakan dari pesan yang
// diketik manual oleh admin langsung dari WhatsApp.
async function kirimDanCatat(sockAktif, jid, content) {
  const idTerkirim = await antrikanPengiriman(async () => {
    const hasil = await sockAktif.sendMessage(jid, content);
    return hasil?.key?.id;
  });
  adminMode.catatPesanDariBot(idTerkirim);
}

// Mengambil isi pesan yang sebenarnya dari berbagai kemungkinan pembungkus
// WhatsApp (ephemeral, "kirim file + caption sekaligus", dst) -- WAJIB
// dipakai sebelum baca message.message.xxx langsung, soalnya kalau customer
// kirim PDF/gambar SEKALIAN dengan caption teks (co. "mau print ini kak"),
// WhatsApp membungkusnya jadi documentWithCaptionMessage, bukan
// documentMessage biasa -- kalau ini kelewat, bot gak akan mendeteksi
// filenya sama sekali dan malah AI bakal ngarang jawaban tanpa data (bahaya,
// pernah kejadian).
function isiPesan(message) {
  return normalizeMessageContent(message.message) || {};
}

// Mengambil teks dari berbagai kemungkinan bentuk pesan WhatsApp
function extractMessageText(konten) {
  return (
    konten.conversation ||
    konten.extendedTextMessage?.text ||
    konten.imageMessage?.caption ||
    konten.documentMessage?.caption ||
    null
  );
}

// Menunggu WebSocket Baileys benar-benar terbuka (sock.ws.isOpen). Diperlukan
// sebelum request pairing code, karena request yang dikirim sebelum koneksi
// terbuka akan gagal dengan error "Connection Closed".
function waitForSocketOpen(sock, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    if (sock.ws.isOpen) {
      resolve();
      return;
    }
    const interval = setInterval(() => {
      if (sock.ws.isOpen) {
        clearInterval(interval);
        clearTimeout(timeout);
        resolve();
      }
    }, 200);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      reject(new Error('Koneksi WhatsApp timeout, coba jalankan ulang program.'));
    }, timeoutMs);
  });
}

// Menandai apakah kode pairing sudah pernah diminta pada proses ini. Setelah
// requestPairingCode() dipanggil, koneksi akan terputus-sambung beberapa kali
// sebagai bagian normal dari proses pairing (menunggu kode dimasukkan di HP) —
// kode yang sama masih berlaku, jadi jangan minta kode baru di setiap reconnect.
let pairingCodeRequested = false;

// Referensi socket aktif, dipakai supaya endpoint logout dari dashboard bisa
// memutuskan sesi WhatsApp yang sedang berjalan.
let currentSock = null;

// Baileys memicu reconnect otomatis secara rekursif saat koneksi putus, dan
// logout dari dashboard juga memulai koneksi baru secara eksplisit. Nomor
// generasi ini dipakai supaya event dari socket lama (yang masih menutup di
// belakang layar) tidak menimpa state socket baru yang sudah mulai jalan.
let generation = 0;

async function startWhatsAppBot() {
  const myGeneration = ++generation;
  const { state, saveCreds } = await useMultiFileAuthState(env.sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  // Pakai kode pairing (bukan scan QR) jika WA_PHONE_NUMBER diisi dan belum pernah login
  const usePairingCode = Boolean(env.phoneNumber) && !state.creds.registered;

  waState.setState({ status: 'connecting', qr: null, number: null });

  const sock = makeWASocket({
    version,
    auth: state,
    logger,
    printQRInTerminal: false,
  });
  currentSock = sock;

  sock.ev.on('creds.update', saveCreds);

  if (usePairingCode && !pairingCodeRequested) {
    pairingCodeRequested = true;
    await waitForSocketOpen(sock);
    const phoneDigitsOnly = env.phoneNumber.replace(/\D/g, '');
    const pairingCode = await sock.requestPairingCode(phoneDigitsOnly);
    console.log(`\n[WA] Kode pairing Anda: ${pairingCode}`);
    console.log('[WA] Segera masukkan kode ini sebelum kadaluarsa: buka WhatsApp di HP > Perangkat Tertaut > Tautkan Perangkat > Tautkan dengan nomor telepon.\n');
  }

  sock.ev.on('connection.update', async (update) => {
    if (myGeneration !== generation) return;
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairingCode) {
      console.log('[WA] QR baru tersedia, buka dashboard untuk scan.');
      try {
        const qrDataUrl = await QRCode.toDataURL(qr, { width: 320, margin: 1 });
        waState.setState({ status: 'qr', qr: qrDataUrl, number: null });
      } catch (error) {
        console.error('[WA] Gagal membuat QR untuk dashboard:', error.message);
      }
    }

    if (connection === 'close') {
      const boom = new Boom(lastDisconnect?.error);
      const statusCode = boom?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WA] Koneksi terputus. Reconnect: ${shouldReconnect}`);
      waState.setState({ status: 'disconnected', qr: null, number: null });
      if (shouldReconnect) {
        startWhatsAppBot();
      } else {
        // Status loggedOut berarti sesi tersimpan sudah tidak valid lagi di sisi
        // WhatsApp (misalnya perangkat tertaut dilepas dari HP). Hapus sesi lama
        // supaya percobaan berikutnya langsung dapat QR baru, bukan macet diam.
        fs.rm(env.sessionFolder, { recursive: true, force: true })
          .catch(() => {})
          .finally(() => startWhatsAppBot());
      }
    } else if (connection === 'open') {
      const number = sock.user?.id?.split(':')?.[0] || sock.user?.id?.split('@')?.[0] || null;
      waState.setState({ status: 'connected', qr: null, number });
      console.log('[WA] Bot berhasil terhubung ke WhatsApp.');
    }
  });

  sock.ev.on('messages.update', (updates) => {
    for (const u of updates) {
      console.log('[DEBUG] status pesan berubah:', u.key?.id, '->', u.update?.status);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const message of messages) {
      if (message.key.remoteJid?.endsWith('@g.us')) continue;

      // WhatsApp kadang mengirim remoteJid dalam format privasi baru "@lid"
      // (nomor disamarkan). key.senderPn *seharusnya* nomor asli untuk kasus
      // itu, tapi terbukti kadang salah/tidak akurat (bisa mengarah ke nomor
      // lain) -- jadi cuma dipakai sebagai fallback saat remoteJid memang
      // "@lid", bukan menggantikan remoteJid yang sudah normal. `from` ini
      // yang dipakai buat membalas & jadi key riwayat obrolan -- HARUS tetap
      // identitas yang sama dipakai Baileys buat kontak ini, jangan diganti.
      const isLid = message.key.remoteJid?.endsWith('@lid');
      const from = isLid ? (message.key.senderPn || message.key.remoteJid) : message.key.remoteJid;

      if (message.key.fromMe) {
        // Pesan keluar dari akun bot sendiri. Kalau ID-nya BUKAN yang tadi
        // dikirim oleh bot (lihat kirimDanCatat), berarti ini diketik manual
        // oleh admin langsung dari aplikasi WhatsApp -- aktifkan mode admin
        // buat kontak ini, bot berhenti ikut campur sementara.
        if (!adminMode.pesanIniDariBot(message.key.id)) {
          adminMode.aktifkanModeAdmin(from);
          console.log(`[WA] Admin membalas manual ke ${from}, bot nonaktif sementara untuk kontak ini.`);
        } else {
          adminMode.catatAktivitas(from);
        }
        continue;
      }

      const konten = isiPesan(message);
      const text = extractMessageText(konten) || '';
      const adaGambar = Boolean(konten.imageMessage);
      const adaDokumen = Boolean(konten.documentMessage);
      if (!text && !adaGambar && !adaDokumen) continue;

      // nomorUntukOrder: nomor HP ASLI dipakai konsisten sebagai identitas
      // kontak buat order (tombol chat di dashboard, lihat Order.jsx) MAUPUN
      // firstContactGuard di bawah -- kalau cuma pakai `from` mentah, kontak
      // "@lid" bakal tercatat dengan identitas beda dari yang dipakai
      // kirimPesanKe() nanti (yang selalu pakai nomor asli dari database),
      // jadi notifikasi status order ke kontak itu bisa keblokir salah kira
      // "belum pernah chat". Baileys (v7+) punya pemetaan lid<->nomor asli
      // sendiri (signalRepository.lidMapping) yang lebih bisa diandalkan
      // daripada senderPn -- dipakai sebagai fallback kedua kalau kosong.
      let nomorUntukOrder = from;
      if (isLid) {
        try {
          const pnJid =
            message.key.senderPn || (await sock.signalRepository.lidMapping.getPNForLID(message.key.remoteJid));
          if (pnJid) nomorUntukOrder = pnJid;
        } catch (error) {
          console.error('[WA] Gagal resolve nomor asli dari LID:', error.message);
        }
      }

      await firstContactGuard.catatKontakMasuk(nomorUntukOrder);
      adminMode.catatAktivitas(from);

      if (adminMode.sedangModeAdmin(from)) {
        console.log(`[WA] Mode admin aktif untuk ${from}, bot diam.`);
        continue;
      }

      console.log(`[WA] Pesan masuk dari ${from}: ${text || (adaDokumen ? '(dokumen)' : '(gambar)')}`);

      // File (PDF/gambar) yang dikirim customer buat diprint -- diunduh &
      // (khusus PDF) dihitung halamannya di sini karena butuh Baileys
      // langsung. Gambar yang kemungkinan besar bukti pembayaran (ada order
      // "menunggu_bayar" aktif) SENGAJA gak diunduh di sini -- itu ditangani
      // messageHandler tanpa perlu isi filenya (lihat catatan sebelumnya:
      // admin cek bukti transfer manual langsung di WA, bukan lewat sistem).
      let infoFile = null;
      if (adaDokumen) {
        infoFile = await ekstrakInfoFile(sock, message, konten, true).catch((error) => {
          console.error('[WA] Gagal proses dokumen:', error.message);
          return null;
        });
      } else if (adaGambar) {
        const orderMenungguBayar = await orderModel
          .ambilOrderAktifTerbaru(nomorUntukOrder)
          .then((o) => o?.status === 'menunggu_bayar')
          .catch(() => false);
        if (!orderMenungguBayar) {
          infoFile = await ekstrakInfoFile(sock, message, konten, false).catch((error) => {
            console.error('[WA] Gagal proses gambar:', error.message);
            return null;
          });
        }
      }

      try {
        const balasan = await handleIncomingMessage(text, from, message.pushName, nomorUntukOrder, adaGambar, infoFile);

        if (!balasan.text && !balasan.gambarUrl) {
          // Sengaja gak ada balasan buat dikirim (misal file tambahan yang
          // nambah ke batch print yang sama, sudah ditanya sekali sebelumnya)
          // -- tandai pesan ini sudah dibaca aja, jangan nunjukin status
          // "mengetik" buat balasan yang emang gak akan pernah dikirim.
          await sock.readMessages([message.key]).catch((error) => {
            console.error('[WA] Gagal tandai pesan sudah dibaca:', error.message);
          });
          continue;
        }

        await simulasikanBalasanNatural(sock, from, message);
        // Cek ulang mode admin setelah jeda -- kalau admin sempat ambil alih
        // pas bot lagi "mengetik", batalkan kirim balasan otomatis ini.
        if (adminMode.sedangModeAdmin(from)) continue;

        if (balasan.text) {
          await kirimDanCatat(sock, from, { text: balasan.text });
        }
        if (balasan.gambarUrl) {
          try {
            const buffer = await ambilGambarBuffer(balasan.gambarUrl);
            await kirimDanCatat(sock, from, { image: buffer });
          } catch (error) {
            console.error('[WA] Gagal kirim gambar QRIS:', error.message);
            await kirimDanCatat(sock, from, {
              text: 'Maaf kak, gambar QRIS-nya gagal terkirim, coba minta admin kirim manual ya.',
            });
          }
        }
      } catch (error) {
        console.error('[WA] Gagal memproses pesan:', error);
        await kirimDanCatat(sock, from, {
          text: 'Mohon maaf, terjadi kendala teknis. Silakan coba beberapa saat lagi.',
        });
      }
    }
  });

  return sock;
}

// Mengirim pesan ke nomor tertentu memakai socket yang sedang aktif (dipakai
// untuk notifikasi otomatis saat admin mengubah status order di dashboard,
// dan reminder minta bukti pembayaran). Kalau socket belum terhubung, pesan
// cuma dilewatkan (dicatat di log) -- bukan dianggap error fatal, karena
// order tetap tersimpan di database.
async function kirimPesanKe(jid, teks) {
  // currentSock bisa saja ada tapi belum benar-benar terhubung (misal masih
  // nunggu scan QR ulang) -- sock.user cuma terisi setelah login berhasil,
  // jadi itu penanda paling akurat untuk "siap kirim pesan".
  if (!currentSock?.user) {
    console.warn(`[WA] Belum terhubung ke WhatsApp, gagal kirim notifikasi ke ${jid}.`);
    return;
  }
  // Ini pengiriman PROAKTIF (bukan balasan langsung dari pesan yang baru
  // masuk), jadi wajib dicek dulu lewat firstContactGuard -- bot gak boleh
  // kirim pesan duluan ke nomor yang belum pernah chat ke bot.
  if (!firstContactGuard.bolehKirimKe(jid)) {
    console.warn(`[WA] Menolak kirim pesan ke ${jid}: belum pernah chat ke bot sebelumnya.`);
    return;
  }
  await kirimDanCatat(currentSock, jid, { text: teks });
}

function pesanUntukStatus(status, order) {
  if (status === 'proses') {
    return `Halo kak, pesananmu (${order.detail}) sedang diproses ya. Mohon ditunggu 🙏`;
  }
  if (status === 'selesai') {
    return `Pesananmu (${order.detail}) sudah selesai kak, bisa langsung diambil ke ${env.storeName} ya 😊`;
  }
  return null;
}

async function tanganiNotifikasiStatus(jid, statusBaru, order) {
  const teks = pesanUntukStatus(statusBaru, order);
  if (!teks) return;
  await kirimPesanKe(jid, teks);
}

// Didengarkan sekali saat modul ini dimuat -- tidak terikat siklus
// reconnect WA, karena langganan realtime Supabase independen dari koneksi
// WhatsApp. kirimPesanKe() sendiri yang mengecek currentSock saat notifikasi
// benar-benar perlu dikirim.
orderModel.dengarkanPerubahanStatus(tanganiNotifikasiStatus);

// Memutuskan sesi WhatsApp yang aktif, menghapus sesi tersimpan, lalu memulai
// ulang agar dashboard menerima QR baru untuk menyambungkan nomor lain.
async function logoutWhatsApp() {
  pairingCodeRequested = false;

  if (currentSock) {
    try {
      await currentSock.logout();
    } catch (error) {
      console.log('[WA] Logout socket:', error.message);
    }
    currentSock = null;
  }

  await fs.rm(env.sessionFolder, { recursive: true, force: true }).catch(() => {});
  waState.setState({ status: 'disconnected', qr: null, number: null });

  await startWhatsAppBot();
}

// SEMENTARA (debug): kirim pesan tes ke nomor sendiri (chat "Message Yourself")
// untuk mengecek apakah pengiriman ke WhatsApp memang benar-benar berhasil
// sampai di level protokol, terlepas dari kontak customer tertentu.
async function kirimTesKeDiriSendiri() {
  if (!currentSock?.user) throw new Error('Socket belum terhubung');
  const jidSendiri = currentSock.user.id;
  console.log('[DEBUG] Kirim tes ke diri sendiri:', jidSendiri);
  const hasil = await currentSock.sendMessage(jidSendiri, { text: 'Tes kirim dari bot ' + new Date().toISOString() });
  console.log('[DEBUG] Hasil kirim tes:', JSON.stringify(hasil));
  return hasil;
}

module.exports = { startWhatsAppBot, logoutWhatsApp, kirimTesKeDiriSendiri, kirimPesanKe };
