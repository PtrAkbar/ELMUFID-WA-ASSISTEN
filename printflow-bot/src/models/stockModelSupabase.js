const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

// Data stock barang, disimpan di Supabase (tabel "stock"). Menggantikan
// stockSheetService.js (Google Sheets) -- kolom "kode" (BRG-001, dst)
// dihasilkan otomatis oleh Postgres dari id, jadi gak perlu lagi antrian
// tulis manual atau baca-ulang-semua-baris buat cari kode berikutnya
// seperti versi Sheets sebelumnya.
const client = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { auth: { persistSession: false } });

function rowToItem(row) {
  return {
    kode: row.kode,
    nama: row.nama,
    harga: String(row.harga),
    status: row.status,
    stockIn: row.stock_in || '',
    stockOut: row.stock_out || '',
  };
}

async function getAllStock() {
  const { data, error } = await client.from('stock').select('*').order('id', { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToItem);
}

async function tambahStock({ nama, harga }) {
  const { data, error } = await client
    .from('stock')
    .insert({ nama, harga: harga || 0, status: 'masih', stock_in: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return rowToItem(data);
}

// Buat import massal dari Excel: satu kali insert berisi banyak baris
// sekaligus, jauh lebih cepat daripada memanggil tambahStock() berulang.
async function tambahStockBanyak(daftarBarang) {
  const sekarang = new Date().toISOString();
  const rows = daftarBarang.map(({ nama, harga }) => ({ nama, harga: harga || 0, status: 'masih', stock_in: sekarang }));
  const { data, error } = await client.from('stock').insert(rows).select();
  if (error) throw error;
  return (data || []).map(rowToItem);
}

// stockOut dicatat saat status berubah jadi "habis", stockIn diperbarui saat
// barang di-restock (status balik dari "habis" ke "masih") supaya stockIn
// selalu mencerminkan pengisian ulang stok yang paling baru.
async function ubahStock(kode, perubahan) {
  const { data: existing, error: errAmbil } = await client.from('stock').select('status').eq('kode', kode).single();
  if (errAmbil) throw new Error('Barang tidak ditemukan di stock');

  const statusLama = existing.status;
  const statusBaru = perubahan.status !== undefined ? perubahan.status : statusLama;

  const update = {};
  if (perubahan.harga !== undefined) update.harga = perubahan.harga;
  if (perubahan.status !== undefined) update.status = perubahan.status;

  if (statusBaru === 'habis' && statusLama !== 'habis') {
    update.stock_out = new Date().toISOString();
  } else if (statusBaru === 'masih' && statusLama === 'habis') {
    update.stock_in = new Date().toISOString();
    update.stock_out = null;
  }

  const { error } = await client.from('stock').update(update).eq('kode', kode);
  if (error) throw error;
}

async function hapusStock(kode) {
  const { error } = await client.from('stock').delete().eq('kode', kode);
  if (error) throw error;
}

async function hapusSemuaStock() {
  const { error } = await client.from('stock').delete().gte('id', 0);
  if (error) throw error;
}

module.exports = { getAllStock, tambahStock, tambahStockBanyak, ubahStock, hapusStock, hapusSemuaStock };
