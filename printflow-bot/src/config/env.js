require('dotenv').config();

// Kumpulan konfigurasi yang diambil dari .env, dipakai di seluruh aplikasi
const env = {
  groqApiKey: process.env.GROQ_API_KEY,
  groqModel: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  storeName: process.env.STORE_NAME || 'Percetakan',
  adminNumber: process.env.ADMIN_NUMBER || '',
  sessionFolder: process.env.SESSION_FOLDER || './session',
  phoneNumber: process.env.WA_PHONE_NUMBER || '',
  apiPort: Number(process.env.API_PORT) || 3001,
  supabaseUrl: process.env.SUPABASE_URL || '',
  // Service role key (BUKAN anon key) -- dipakai backend untuk menulis order
  // baru dan mendengarkan perubahan status order, tanpa terikat RLS
  // "to authenticated" yang cuma berlaku untuk user yang login di dashboard.
  // Kunci ini rahasia, jangan pernah dipakai di kode frontend.
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

if (!env.groqApiKey) {
  console.error('[ENV] GROQ_API_KEY belum diisi di file .env. Daftar gratis di console.groq.com lalu isi API key.');
  process.exit(1);
}

if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
  console.warn(
    '[ENV] SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY belum diisi -- fitur simpan order otomatis & notifikasi status akan nonaktif.'
  );
}

module.exports = env;
