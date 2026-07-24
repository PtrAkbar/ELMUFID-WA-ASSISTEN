const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

// Dipakai backend bot untuk menulis order baru (hasil konfirmasi chat WA) dan
// mendengarkan perubahan status order (diubah admin lewat dashboard) supaya
// bisa kirim notifikasi balik ke customer. Pakai service role key -- bypass
// RLS "to authenticated" karena bot bukan user yang login, tapi proses
// backend tepercaya.
const client =
  env.supabaseUrl && env.supabaseServiceRoleKey
    ? createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
        auth: { persistSession: false },
      })
    : null;

function tersedia() {
  return Boolean(client);
}

function jidKeNomor(jid) {
  // JID bisa berbentuk "628xxx@s.whatsapp.net" atau "628xxx:0@s.whatsapp.net"
  // (angka setelah ":" itu device id, bukan bagian nomor telepon) -- keduanya
  // harus dibuang supaya nomor_wa yang tersimpan valid dipakai link wa.me.
  return String(jid || '').split('@')[0].split(':')[0];
}

// Menyimpan order baru ke tabel orders. status default "menunggu_bayar" kalau
// order ini masih perlu konfirmasi metode pembayaran dulu -- kalau toko gak
// setting metode pembayaran apapun (cash-only), pemanggil boleh langsung
// pakai status "belum" (belum diproses, langsung masuk antrian admin).
// Melempar error kalau Supabase belum dikonfigurasi atau insert gagal --
// pemanggil (messageHandler) yang urus balasan ke customer kalau ini gagal.
async function buatOrder({ namaCustomer, nomorWaJid, detail, total, status = 'menunggu_bayar' }) {
  if (!client) {
    throw new Error('Supabase belum dikonfigurasi di backend bot');
  }
  const { data, error } = await client
    .from('orders')
    .insert({
      nama_customer: namaCustomer,
      nomor_wa: jidKeNomor(nomorWaJid),
      detail,
      total,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Order aktif terbaru milik satu nomor (status apapun SELAIN "selesai") --
// dipakai buat mutusin apakah permintaan print baru dari nomor yang sama itu
// nambah ke order yang masih berjalan, atau harus jadi order baru (kalau
// order terakhirnya sudah "selesai"). null kalau tidak ada order aktif.
async function ambilOrderAktifTerbaru(nomorWaJid) {
  if (!client) return null;
  const { data, error } = await client
    .from('orders')
    .select('*')
    .eq('nomor_wa', jidKeNomor(nomorWaJid))
    .neq('status', 'selesai')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Menambahkan barang baru ke order yang masih aktif (bukan bikin baris baru)
// -- detail digabung, total ditambah, status di-set ulang sesuai parameter
// (misal balik ke "menunggu_bayar" karena ada tambahan yang belum dibayar).
async function tambahKeOrderAktif(orderId, { detailTambahan, totalTambahan, status }) {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { data: order, error: errAmbil } = await client.from('orders').select('detail, total').eq('id', orderId).single();
  if (errAmbil) throw errAmbil;

  const { data, error } = await client
    .from('orders')
    .update({
      detail: `${order.detail}, ${detailTambahan}`,
      total: Number(order.total) + totalTambahan,
      status,
    })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update status order tunggal -- dipakai bot buat pindah status otomatis
// (misal begitu bukti pembayaran diterima, langsung ke "belum").
async function updateStatusOrder(orderId, status) {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { error } = await client.from('orders').update({ status }).eq('id', orderId);
  if (error) throw error;
}

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

// Mendengarkan perubahan status order (diubah admin lewat dashboard) secara
// realtime, lalu panggil kirimNotifikasi(nomorWaJid, statusBaru, order) kalau
// statusnya benar-benar berubah (bukan update lain seperti ganti harga).
function dengarkanPerubahanStatus(kirimNotifikasi) {
  if (!client) {
    console.warn('[Supabase] Belum dikonfigurasi, notifikasi status order dinonaktifkan.');
    return;
  }

  client
    .channel('bot-orders-status')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'orders' },
      (payload) => {
        const statusLama = payload.old?.status;
        const statusBaru = payload.new?.status;
        if (!statusBaru || statusLama === statusBaru) return;
        if (!payload.new?.nomor_wa) return;

        const jid = `${payload.new.nomor_wa}@s.whatsapp.net`;
        kirimNotifikasi(jid, statusBaru, payload.new).catch((error) => {
          console.error('[Supabase] Gagal kirim notifikasi status order:', error.message);
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[Supabase] Mendengarkan perubahan status order untuk notifikasi WA.');
      }
    });
}

module.exports = {
  tersedia,
  buatOrder,
  ambilOrderAktifTerbaru,
  tambahKeOrderAktif,
  updateStatusOrder,
  ambilQrisConfig,
  ambilDaftarRekening,
  ambilSemuaKontakPernahChat,
  catatKontakPernahChat,
  dengarkanPerubahanStatus,
};
