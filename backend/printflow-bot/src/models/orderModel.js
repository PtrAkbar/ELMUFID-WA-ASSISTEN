const { client, jidKeNomor } = require('./supabaseClient');

// Menyimpan order baru ke tabel orders. status default "menunggu_bayar" kalau
// order ini masih perlu konfirmasi metode pembayaran dulu -- kalau toko gak
// setting metode pembayaran apapun (cash-only), pemanggil boleh langsung
// pakai status "belum" (belum diproses, langsung masuk antrian admin).
// Melempar error kalau Supabase belum dikonfigurasi atau insert gagal --
// pemanggil (messageController) yang urus balasan ke customer kalau ini gagal.
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

// Semua order, urut terbaru dulu -- dipakai dashboard buat nampilin daftar
// order lengkap (bukan cuma satu nomor kayak ambilOrderAktifTerbaru).
async function ambilSemuaOrder() {
  if (!client) return [];
  const { data, error } = await client.from('orders').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// Order dibuat manual oleh admin lewat dashboard (bukan hasil chat WA) --
// beda dari buatOrder() di atas karena status selalu langsung "belum"
// (gak lewat alur menunggu_bayar) dan gak butuh flow konfirmasi pembayaran.
async function buatOrderManual({ nama, nomor, detail, total }) {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { data, error } = await client
    .from('orders')
    .insert({ nama_customer: nama, nomor_wa: jidKeNomor(nomor), detail, total, status: 'belum' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function hapusSemuaOrderAktif() {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { error } = await client.from('orders').delete().neq('status', 'selesai');
  if (error) throw error;
}

async function hapusSemuaRiwayat() {
  if (!client) throw new Error('Supabase belum dikonfigurasi di backend bot');
  const { error } = await client.from('orders').delete().eq('status', 'selesai');
  if (error) throw error;
}

// Mendengarkan perubahan status order (diubah admin lewat dashboard) secara
// realtime, lalu panggil kirimNotifikasi(nomorWaJid, statusBaru, order) kalau
// statusnya benar-benar berubah (bukan update lain seperti ganti harga).
function dengarkanPerubahanStatus(kirimNotifikasi) {
  if (!client) {
    console.warn('[OrderModel] Supabase belum dikonfigurasi, notifikasi status order dinonaktifkan.');
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
          console.error('[OrderModel] Gagal kirim notifikasi status order:', error.message);
        });
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('[OrderModel] Mendengarkan perubahan status order untuk notifikasi WA.');
      }
    });
}

module.exports = {
  buatOrder,
  ambilOrderAktifTerbaru,
  tambahKeOrderAktif,
  updateStatusOrder,
  dengarkanPerubahanStatus,
  ambilSemuaOrder,
  buatOrderManual,
  hapusSemuaOrderAktif,
  hapusSemuaRiwayat,
};
