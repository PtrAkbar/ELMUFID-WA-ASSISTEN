// Antrian pengiriman pesan global -- membatasi bot maksimal kirim 1 pesan
// tiap 2 detik, walau ada banyak pesan masuk bersamaan dari nomor berbeda.
// Ini pengaman tambahan di luar jeda natural per percakapan (naturalDelay.js),
// khusus buat menahan lonjakan pengiriman kalau banyak chat masuk sekaligus.

const JEDA_ANTAR_KIRIM_MS = 2000;

const antrian = [];
let sedangJalan = false;

async function prosesAntrian() {
  if (sedangJalan) return;
  sedangJalan = true;

  while (antrian.length > 0) {
    const tugas = antrian.shift();
    try {
      const hasil = await tugas.fungsiKirim();
      tugas.resolve(hasil);
    } catch (error) {
      tugas.reject(error);
    }
    if (antrian.length > 0) {
      await new Promise((resolve) => setTimeout(resolve, JEDA_ANTAR_KIRIM_MS));
    }
  }

  sedangJalan = false;
}

// fungsiKirim: async function tanpa argumen yang benar-benar melakukan
// pengiriman (misal () => sock.sendMessage(jid, { text })). Dikembalikan
// promise yang selesai begitu pesan ini gilirannya terkirim.
function antrikanPengiriman(fungsiKirim) {
  return new Promise((resolve, reject) => {
    antrian.push({ fungsiKirim, resolve, reject });
    prosesAntrian();
  });
}

module.exports = { antrikanPengiriman };
