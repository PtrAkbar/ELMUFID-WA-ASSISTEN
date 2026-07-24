const { createClient } = require('@supabase/supabase-js');
const env = require('../config/env');

// Client Supabase dibagi (shared) ke seluruh model -- dipakai backend bot
// buat baca/tulis data order, config pembayaran, dan kontak. Pakai service
// role key -- bypass RLS "to authenticated" karena bot bukan user yang
// login, tapi proses backend tepercaya.
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

module.exports = { client, tersedia, jidKeNomor };
