# WA Bot Percetakan

Bot WhatsApp untuk melayani customer toko percetakan secara otomatis: cek stock kertas, tanya harga, dan order print/jilid. Pesan customer dianalisis oleh Google Gemini API (gratis) untuk memahami maksudnya, tetapi **semua perhitungan harga dilakukan dengan logika matematika biasa** (bukan oleh AI) supaya hasilnya selalu akurat.

## Fitur Utama

- Login WhatsApp via QR code di terminal, sesi tersimpan otomatis (tidak perlu scan ulang tiap kali dijalankan).
- Analisis pesan customer menggunakan Google Gemini API menjadi data terstruktur (produk, jumlah lembar, jasa tambahan, info yang kurang).
- Cek stock kertas otomatis.
- Hitung harga print + jasa tambahan (jilid, laminasi, dll) otomatis dengan rincian lengkap.
- Tanya balik ke customer jika informasi pesanan belum lengkap.
- Data stock & harga disimpan sederhana di kode, terstruktur agar mudah dipindah ke Google Sheets nantinya.

## Struktur Folder

```
wa-bot-percetakan/
├── src/
│   ├── config/
│   │   └── env.js              # Memuat & memvalidasi variabel dari file .env
│   ├── data/
│   │   ├── stock.js            # Data stock kertas + fungsi pencarian stock
│   │   └── pricelist.js        # Data harga print & jasa tambahan
│   ├── services/
│   │   ├── geminiService.js    # Mengirim pesan customer ke Google Gemini API, mengembalikan hasil analisis terstruktur
│   │   ├── pricingService.js   # Logika kalkulasi harga & cek stock (matematika biasa, bukan AI)
│   │   └── whatsappService.js  # Koneksi ke WhatsApp via Baileys (QR login, sesi, terima/kirim pesan)
│   ├── handlers/
│   │   └── messageHandler.js   # Menyusun balasan otomatis berdasarkan hasil analisis Gemini
│   ├── utils/
│   │   └── formatter.js        # Helper format angka ke Rupiah
│   └── index.js                # Entry point aplikasi
├── session/                    # Folder penyimpanan sesi login WhatsApp (dibuat otomatis, jangan dihapus)
├── .env.example                # Contoh isi file environment
├── .gitignore
├── package.json
└── README.md
```

## Cara Instalasi

1. Pastikan [Node.js](https://nodejs.org) versi 18 ke atas sudah terpasang. Cek dengan:
   ```
   node -v
   ```
2. Masuk ke folder project:
   ```
   cd wa-bot-percetakan
   ```
3. Install semua dependency:
   ```
   npm install
   ```
4. Salin file `.env.example` menjadi `.env`:
   ```
   copy .env.example .env
   ```
   (di Linux/Mac gunakan `cp .env.example .env`)
5. Buka file `.env`, lalu isi `GEMINI_API_KEY` dengan API key gratis dari [Google AI Studio](https://aistudio.google.com/apikey) (login pakai akun Google, tanpa kartu kredit). Sesuaikan juga `STORE_NAME` dengan nama toko Anda.

## Cara Menjalankan

```
npm start
```

Saat pertama kali dijalankan, ada dua cara login:

### Opsi A — Scan QR code (default)
Kosongkan `WA_PHONE_NUMBER` di `.env`. Saat dijalankan:
1. QR code akan muncul di terminal.
2. Scan QR code tersebut menggunakan aplikasi WhatsApp di HP (Menu > Perangkat Tertaut > Tautkan Perangkat).
3. **Kalau kamera HP tidak bisa membaca QR dari terminal** (sering terjadi di Windows karena proporsi karakter terminal tidak persegi sempurna), bot juga otomatis menyimpan QR yang sama sebagai file gambar `qr.png` di folder project. Buka file itu (misal lewat File Explorer, double click) lalu scan dari gambar tersebut — hasilnya lebih pasti terbaca karena proporsinya benar.

### Opsi B — Kode Pairing pakai nomor HP (tanpa scan)
Isi `WA_PHONE_NUMBER` di `.env` dengan nomor WhatsApp bot (format: `62812xxxxxxx`, kode negara tanpa `+` atau `0` di depan). Saat dijalankan:
1. Terminal akan menampilkan kode pairing 8 digit, contoh: `[WA] Kode pairing Anda: ABCD1234`.
2. Di HP, buka WhatsApp > Menu > Perangkat Tertaut > Tautkan Perangkat > pilih **Tautkan dengan nomor telepon** (bukan scan QR).
3. Masukkan kode 8 digit dari terminal ke HP.

Setelah salah satu cara di atas berhasil:
- Bot akan menampilkan pesan "Bot berhasil terhubung ke WhatsApp."
- Sesi login tersimpan otomatis di folder `session/`, sehingga saat dijalankan ulang tidak perlu login lagi (kecuali sesi dihapus atau logout dari HP).

Untuk mode pengembangan (otomatis restart saat ada perubahan file), gunakan:

```
npm run dev
```

## Penjelasan Fungsi Tiap File

### `src/config/env.js`
Memuat variabel dari file `.env` menggunakan `dotenv`, lalu memvalidasi bahwa `GEMINI_API_KEY` sudah diisi. Semua bagian program mengambil konfigurasi dari sini, bukan langsung dari `process.env`.

### `src/data/stock.js`
Menyimpan data stock kertas dalam bentuk array sederhana di dalam kode. Menyediakan fungsi `findStock()` dan `hasStock()` untuk mencari dan mengecek ketersediaan stock. Karena akses datanya melalui fungsi (bukan diakses langsung sebagai array), nantinya cukup mengganti isi `getAllStock()` untuk mengambil data dari Google Sheets tanpa mengubah kode di file lain.

### `src/data/pricelist.js`
Menyimpan data harga print per lembar dan harga jasa tambahan (jilid spiral, jilid lakban, laminasi, dll), dengan pola yang sama seperti `stock.js` agar mudah dipindah ke Google Sheets.

### `src/services/geminiService.js`
Mengirim teks pesan customer ke Google Gemini API dengan skema JSON yang ketat (`responseSchema`), sehingga hasilnya selalu berupa data terstruktur: `intent` (maksud pesan), `produk`, `jumlah_lembar`, `jasa_tambahan`, dan `info_kurang`. Gemini di sini hanya bertugas memahami bahasa customer, bukan menghitung harga.

### `src/services/pricingService.js`
Berisi seluruh logika perhitungan: `checkStock()` untuk mengecek ketersediaan produk, dan `calculateOrder()` untuk menghitung total biaya berdasarkan jumlah lembar dan jasa tambahan. Semua perhitungan di sini murni matematika JavaScript biasa, sehingga hasilnya selalu konsisten dan bisa diaudit.

### `src/services/whatsappService.js`
Mengelola koneksi ke WhatsApp menggunakan Baileys: menampilkan QR code atau kode pairing di terminal (tergantung apakah `WA_PHONE_NUMBER` diisi), menyimpan sesi login ke folder `session/`, mendengarkan pesan masuk, lalu meneruskannya ke `messageHandler` dan mengirim balasannya. Saat mode QR dipakai, file gambar `qr.png` juga otomatis dibuat sebagai cadangan kalau QR di terminal susah discan kamera.

### `src/handlers/messageHandler.js`
Titik pertemuan seluruh logika bisnis. Menerima hasil analisis dari `geminiService`, lalu memutuskan balasan apa yang harus dikirim:
- Jika `intent` adalah cek stock → panggil `pricingService.checkStock()` dan balas info stock.
- Jika `intent` adalah tanya harga/order dan informasi sudah lengkap → panggil `pricingService.calculateOrder()` dan balas rincian harga.
- Jika informasi belum lengkap → balas dengan pertanyaan info yang masih kurang.
- Selain itu → balas sapaan umum.

### `src/utils/formatter.js`
Helper kecil untuk memformat angka menjadi format Rupiah (contoh: `15000` menjadi `Rp15.000`), dipakai di `messageHandler.js` supaya format harga konsisten di semua balasan.

### `src/index.js`
Entry point aplikasi. Hanya memanggil `startWhatsAppBot()` dari `whatsappService.js`.

## Mengubah Data Stock & Harga

Untuk saat ini, edit langsung array di `src/data/stock.js` dan `src/data/pricelist.js`. Setiap item mengikuti struktur yang sama, jadi cukup tambah/ubah/hapus entry di dalam array sesuai kebutuhan.

## Rencana Migrasi ke Google Sheets

Karena `stock.js` dan `pricelist.js` mengekspos data melalui fungsi (`getAllStock()`, `getPrintPrices()`, dst), migrasi ke Google Sheets nantinya cukup dilakukan dengan mengganti isi fungsi tersebut agar mengambil data dari Google Sheets API, tanpa perlu mengubah `pricingService.js` maupun file lain yang menggunakannya.

## Troubleshooting

- **QR code tidak muncul / error saat start**: pastikan `npm install` sudah selesai tanpa error dan `.env` sudah terisi `GEMINI_API_KEY`.
- **Perlu login ulang terus**: pastikan folder `session/` tidak terhapus dan tidak logout dari perangkat tertaut di HP.
- **Balasan bot error terus / kena limit**: Gemini API gratis punya limit jumlah request per hari/menit. Cek apakah `GEMINI_API_KEY` di `.env` masih valid, atau tunggu beberapa saat jika kena limit harian.
