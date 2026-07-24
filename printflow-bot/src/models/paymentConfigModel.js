const { client } = require('./supabaseClient');

// Konfigurasi QRIS toko (cuma 1 baris). null kalau belum diisi admin.
async function ambilQrisConfig() {
  if (!client) return null;
  const { data, error } = await client.from('qris_config').select('gambar_url').eq('id', 1).maybeSingle();
  if (error) throw error;
  return data?.gambar_url ? data : null;
}

// Daftar rekening bank toko, urut dari yang paling baru ditambahkan.
async function ambilDaftarRekening() {
  if (!client) return [];
  const { data, error } = await client.from('rekening_config').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

module.exports = { ambilQrisConfig, ambilDaftarRekening };
