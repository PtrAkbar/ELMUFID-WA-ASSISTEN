# Percetakan UI

Dashboard admin untuk usaha percetakan, dibangun dengan React + Vite. Menampilkan ringkasan order, daftar order, stock barang, dan riwayat order selesai.

## Cara menjalankan

```
npm install
npm run dev
```

Buka `http://localhost:5173` di browser. Untuk build produksi jalankan `npm run build`, hasilnya ada di folder `dist`.

## Struktur folder

```
src/
  components/   komponen kecil yang dipakai ulang di beberapa halaman
  pages/        satu file per halaman utama
  data/         data sementara (dummy), tinggal diganti kalau sudah tersambung ke API
  styles/       definisi warna dan tema
  utils/        fungsi bantu kecil
  App.jsx       layout utama dan state yang dipakai bersama antar halaman
  main.jsx      entry point React
```

### components

- `StatCard.jsx` — kartu angka ringkasan di dashboard (total order, belum diproses, dst)
- `PillDropdown.jsx` — dropdown bulat untuk mengubah status order/stock
- `StatusPill.jsx` — badge kecil untuk menampilkan label status
- `SideNav.jsx` — satu item menu di sidebar
- `Sidebar.jsx` — susunan menu sidebar lengkap
- `Topbar.jsx` — bagian atas halaman (judul, search, notifikasi, profil admin)
- `LegendRow.jsx` — baris legenda warna di bawah grafik donut
- `ChartTooltip.jsx` — tooltip kustom untuk grafik order harian

### pages

- `Dashboard.jsx` — ringkasan order, grafik order masuk, dan order terbaru
- `Order.jsx` — daftar semua order dan ubah statusnya
- `Stock.jsx` — daftar stock barang, cari barang, tambah barang baru
- `Riwayat.jsx` — daftar order yang sudah selesai

### data

- `orders.js` — data dummy daftar order
- `stock.js` — data dummy daftar stock barang
- `chart.js` — data dummy order harian untuk grafik
- `recentOrders.js` — data dummy order terbaru yang tampil di dashboard dan riwayat

Ganti isi file-file ini dengan hasil fetch dari API kalau backend sudah siap, tanpa perlu mengubah komponen atau halaman.

### styles

- `theme.js` — semua warna, warna per status, dan style input dikumpulkan di sini supaya gampang diganti

## Teknologi

- React 19 + Vite
- Tailwind CSS 4 (lewat plugin `@tailwindcss/vite`)
- lucide-react untuk ikon
- recharts untuk grafik
