const { client } = require('../models/supabaseClient');

// Semua endpoint stock & kontrol WA cuma buat admin yang sudah login di
// dashboard -- sebelumnya endpoint ini bisa dieksekusi siapa saja yang bisa
// menjangkau server (cuma dibatasi origin CORS, bukan identitas). Sekarang
// wajib kirim token sesi Supabase Auth yang sama dengan yang dipakai
// printflow-dashboard/printflow-auth.
//
// Header Authorization dipakai untuk request biasa. Query string ?token=
// jadi fallback khusus buat /api/wa/events, karena EventSource bawaan
// browser tidak bisa mengirim custom header.
async function requireAuth(req, res, next) {
  if (!client) {
    return res.status(500).json({ error: 'Supabase belum dikonfigurasi di server' });
  }

  const headerToken = (req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
  const token = headerToken || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'Token login tidak ditemukan' });
  }

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Token login tidak valid atau sudah kedaluwarsa' });
  }

  req.user = data.user;
  next();
}

module.exports = { requireAuth };
