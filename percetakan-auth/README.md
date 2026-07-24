# Percetakan Auth

Sistem login admin terpisah dari project dashboard dan bot WhatsApp, memakai Supabase Auth. Support login Google dan login/daftar pakai email dengan kode OTP.

## Struktur folder

```
src/
  lib/            koneksi ke Supabase
  context/        status login global (AuthContext)
  components/     tombol Google, form email, form OTP, pelindung halaman
  loading/        semua tampilan loading, terpisah dari komponen fungsional
  pages/          halaman Login, Register, VerifikasiOtp, Dashboard
  styles/         warna tema, sama dengan project dashboard
```

## Langkah 1: Buat project di Supabase

1. Buka https://supabase.com, buat akun kalau belum punya
2. Klik "New project", isi nama dan password database
3. Setelah project jadi, buka menu **Project Settings > API**
4. Salin **Project URL** dan **anon public key**, nanti dipakai di file `.env`

## Langkah 2: Aktifkan login Google

1. Di Supabase, buka **Authentication > Providers**, cari **Google**, aktifkan
2. Buka https://console.cloud.google.com, buat project baru (atau pakai yang sudah ada)
3. Masuk ke **APIs & Services > Credentials**, klik **Create Credentials > OAuth client ID**
4. Pilih tipe **Web application**
5. Di bagian **Authorized redirect URIs**, tempel URL callback yang muncul di halaman Google provider Supabase (biasanya formatnya `https://xxxxx.supabase.co/auth/v1/callback`)
6. Setelah dibuat, salin **Client ID** dan **Client Secret**, tempel ke pengaturan Google provider di Supabase, lalu simpan
7. Di Supabase, buka **Authentication > URL Configuration**, tambahkan alamat dev server project ini (misal `http://localhost:5173`) ke daftar **Redirect URLs**, supaya setelah login Google admin diarahkan balik ke aplikasi ini, bukan ke alamat default Supabase

## Langkah 3: Aktifkan email OTP

Secara default, template email Supabase hanya menampilkan tautan klik ("Log In"), bukan kode 6 digit. Supaya admin benar-benar menerima kode yang bisa diketik di halaman verifikasi, template emailnya wajib diedit dulu:

1. Di Supabase, buka **Authentication > Email Templates**
2. Pilih template **Magic Link**
3. Di isi HTML template, tambahkan variabel `{{ .Token }}` (misal: `Kode OTP kamu: {{ .Token }}`), jangan hanya mengandalkan `{{ .ConfirmationURL }}` yang sudah ada
4. Lakukan hal yang sama untuk template **Confirm signup**, karena admin baru (saat Register) menerima email lewat template ini
5. Simpan, lalu coba kirim OTP dari halaman Register untuk memastikan email yang masuk sudah menampilkan kode 6 digit

## Langkah 4: Isi file environment

1. Copy file `.env.example` jadi `.env`
2. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dengan yang disalin dari Langkah 1

## Langkah 5: Jalankan project

```
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`), akan otomatis diarahkan ke halaman Login.

## Alur pemakaian

- Admin bisa masuk lewat tombol Google, atau masukkan email untuk menerima kode OTP 6 digit
- Kode OTP dikirim otomatis oleh Supabase ke email admin
- Setelah kode benar, admin masuk ke halaman Dashboard
- Sesi login tersimpan otomatis, jadi tidak perlu login ulang tiap buka aplikasi kecuali sesi kedaluwarsa
- Tombol Keluar di halaman Dashboard akan menghapus sesi dan kembali ke halaman Login

## Menyambungkan ke dashboard percetakan

Halaman `src/pages/Dashboard.jsx` saat ini masih placeholder. Ganti isinya dengan komponen dashboard percetakan yang sudah dibuat di project terpisah, supaya setelah admin berhasil login langsung masuk ke tampilan dashboard sebenarnya.
