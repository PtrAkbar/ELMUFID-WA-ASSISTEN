
function tidur(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jedaAcak(minMs, maxMs) {
  const durasi = minMs + Math.random() * (maxMs - minMs);
  return tidur(durasi);
}
async function simulasikanBalasanNatural(sock, jid, pesanMasuk) {
  await jedaAcak(1000, 3000);

  try {
    await sock.readMessages([pesanMasuk.key]);
  } catch (error) {
    console.error('[NaturalDelay] Gagal tandai pesan sudah dibaca:', error.message);
  }

  try {
    await sock.sendPresenceUpdate('composing', jid);
  } catch (error) {
    console.error('[NaturalDelay] Gagal kirim status mengetik:', error.message);
  }

  await jedaAcak(2000, 5000);
}

module.exports = { jedaAcak, simulasikanBalasanNatural };
