const { findJasaTambahan } = require('../data/pricelist');

// Mengecek ketersediaan stock untuk satu produk. Pencocokan nama (typo/istilah
// beda) sudah dikerjakan AI lewat produkCocok; di sini murni pencarian persis
// dan pembacaan status/harga dari data stock asli -- tidak pernah dihitung
// atau ditebak oleh AI.
function checkStock(daftarStock, namaProduk, produkCocok) {
  const namaDicari = (produkCocok || namaProduk || '').toLowerCase();
  const item = daftarStock.find((s) => s.nama.toLowerCase() === namaDicari);
  if (!item) {
    return { ditemukan: false, produk: namaProduk };
  }
  return {
    ditemukan: true,
    nama: item.nama,
    harga: Number(item.harga),
    status: item.status,
    tersedia: item.status === 'masih',
    dikoreksi: Boolean(produkCocok) && produkCocok.toLowerCase() !== (namaProduk || '').toLowerCase(),
  };
}

// Menghitung total biaya order dari daftar barang yang SUDAH divalidasi lewat
// checkStock (nama, harga, jumlahLembar per item -- lihat cekKelengkapanOrder
// di messageHandler.js), ditambah jasa tambahan (jilid, laminasi, dll). Boleh
// lebih dari satu barang dalam satu order (misal kertas A4 dan A5 sekaligus).
// Setiap barang di stock cuma punya satu harga tetap per lembar -- tidak ada
// variasi warna/hitam-putih/finishing di sini.
function calculateOrder({ barangValid, jasaTambahanList = [] }) {
  const rincian = [];
  let total = 0;
  let totalLembar = 0;

  for (const b of barangValid) {
    const subtotal = b.harga * b.jumlahLembar;
    rincian.push({
      nama: `Print ${b.nama}`,
      jumlah: b.jumlahLembar,
      satuan: 'lembar',
      hargaSatuan: b.harga,
      subtotal,
    });
    total += subtotal;
    totalLembar += b.jumlahLembar;
  }

  for (const jasa of jasaTambahanList) {
    const namaJasa = typeof jasa === 'string' ? jasa : jasa.nama;
    const dataJasa = findJasaTambahan(namaJasa);
    if (!dataJasa) {
      rincian.push({ nama: namaJasa, error: 'Jasa tidak ditemukan di daftar harga' });
      continue;
    }

    // Jasa "per lembar" (contoh: laminasi) dikali total lembar semua barang, sisanya per dokumen
    const jumlahJasa =
      typeof jasa === 'object' && jasa.jumlah
        ? jasa.jumlah
        : dataJasa.satuan === 'per lembar'
        ? totalLembar
        : 1;

    const subtotalJasa = dataJasa.hargaSatuan * jumlahJasa;
    rincian.push({
      nama: dataJasa.nama,
      jumlah: jumlahJasa,
      satuan: dataJasa.satuan,
      hargaSatuan: dataJasa.hargaSatuan,
      subtotal: subtotalJasa,
    });
    total += subtotalJasa;
  }

  return { rincian, total };
}

module.exports = { checkStock, calculateOrder };
