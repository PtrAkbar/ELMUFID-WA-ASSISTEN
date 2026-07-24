const { client } = require('./supabaseClient');

// Semua nomor yang pernah mengirim pesan ke bot -- dimuat sekali saat bot
// start buat mengisi cache firstContactGuard.
async function ambilSemuaKontakPernahChat() {
  if (!client) return [];
  const { data, error } = await client.from('kontak_pernah_chat').select('nomor');
  if (error) throw error;
  return (data || []).map((row) => row.nomor);
}

// Mencatat nomor baru yang pertama kali chat ke bot. upsert supaya aman
// dipanggil berkali-kali tanpa perlu cek "sudah ada belum" dulu.
async function catatKontakPernahChat(nomor) {
  if (!client) return;
  const { error } = await client.from('kontak_pernah_chat').upsert({ nomor }, { onConflict: 'nomor' });
  if (error) throw error;
}

module.exports = { ambilSemuaKontakPernahChat, catatKontakPernahChat };
