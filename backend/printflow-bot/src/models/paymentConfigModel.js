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

// Upload gambar QRIS ke Supabase Storage (bucket "qris"), lalu simpan URL
// publiknya di qris_config. Nama file dikasih timestamp biar gak bentrok
// antar upload dan browser gak nyimpen cache gambar lama.
async function simpanQris(buffer, namaAsli, mimeType) {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const ekstensi = (namaAsli || '').split('.').pop() || 'png';
  const namaFile = `qris-${Date.now()}.${ekstensi}`;

  const { error: errUpload } = await client.storage
    .from('qris')
    .upload(namaFile, buffer, { upsert: true, contentType: mimeType });
  if (errUpload) throw errUpload;

  const { data: publicUrlData } = client.storage.from('qris').getPublicUrl(namaFile);

  const { error: errSimpan } = await client
    .from('qris_config')
    .upsert({ id: 1, gambar_url: publicUrlData.publicUrl, updated_at: new Date().toISOString() });
  if (errSimpan) throw errSimpan;

  return publicUrlData.publicUrl;
}

async function hapusQrisConfig() {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { error } = await client.from('qris_config').upsert({ id: 1, gambar_url: null });
  if (error) throw error;
}

async function tambahRekening({ namaBank, nomorRekening, atasNama }) {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { data, error } = await client
    .from('rekening_config')
    .insert({ nama_bank: namaBank, nomor_rekening: nomorRekening, atas_nama: atasNama || null })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function hapusRekening(id) {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { error } = await client.from('rekening_config').delete().eq('id', id);
  if (error) throw error;
}

module.exports = {
  ambilQrisConfig,
  ambilDaftarRekening,
  simpanQris,
  hapusQrisConfig,
  tambahRekening,
  hapusRekening,
};
