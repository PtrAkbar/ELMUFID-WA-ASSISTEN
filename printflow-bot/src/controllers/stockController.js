const stockModel = require('../models/stockModel');

async function ambilSemua(req, res) {
  try {
    const stock = await stockModel.getAllStock();
    res.json(stock);
  } catch (error) {
    console.error('[Stock] Gagal ambil data:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function tambah(req, res) {
  try {
    const { nama, harga } = req.body;
    if (!nama || !nama.trim()) {
      res.status(400).json({ error: 'Nama barang wajib diisi' });
      return;
    }
    const barang = await stockModel.tambahStock({ nama, harga });
    res.json(barang);
  } catch (error) {
    console.error('[Stock] Gagal tambah barang:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function tambahBanyak(req, res) {
  try {
    const { barang } = req.body;
    if (!Array.isArray(barang) || barang.length === 0) {
      res.status(400).json({ error: 'Daftar barang kosong' });
      return;
    }
    if (barang.length > 500) {
      res.status(400).json({ error: 'Maksimal 500 barang per import' });
      return;
    }
    const bersih = barang
      .filter((b) => b && typeof b.nama === 'string' && b.nama.trim())
      .map((b) => ({ nama: b.nama.trim(), harga: b.harga ?? '0' }));
    if (bersih.length === 0) {
      res.status(400).json({ error: 'Tidak ada baris valid untuk diimpor' });
      return;
    }
    const hasil = await stockModel.tambahStockBanyak(bersih);
    res.json({ ok: true, jumlah: hasil.length, barang: hasil });
  } catch (error) {
    console.error('[Stock] Gagal import barang:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function ubah(req, res) {
  try {
    const { status, harga } = req.body;
    await stockModel.ubahStock(req.params.kode, { status, harga });
    res.json({ ok: true });
  } catch (error) {
    console.error('[Stock] Gagal ubah barang:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function hapusSemua(req, res) {
  try {
    await stockModel.hapusSemuaStock();
    res.json({ ok: true });
  } catch (error) {
    console.error('[Stock] Gagal hapus semua barang:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function hapus(req, res) {
  try {
    await stockModel.hapusStock(req.params.kode);
    res.json({ ok: true });
  } catch (error) {
    console.error('[Stock] Gagal hapus barang:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { ambilSemua, tambah, tambahBanyak, ubah, hapusSemua, hapus };
