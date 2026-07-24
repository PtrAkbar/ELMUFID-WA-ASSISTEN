const paymentConfigModel = require('../models/paymentConfigModel');

async function ambilSemua(req, res) {
  try {
    const [qrisConfig, rekeningList] = await Promise.all([
      paymentConfigModel.ambilQrisConfig(),
      paymentConfigModel.ambilDaftarRekening(),
    ]);
    res.json({ qris: qrisConfig?.gambar_url || null, rekeningList });
  } catch (error) {
    console.error('[Kustomisasi] Gagal ambil data:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function uploadQris(req, res) {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'File QRIS tidak ditemukan' });
      return;
    }
    const url = await paymentConfigModel.simpanQris(req.file.buffer, req.file.originalname, req.file.mimetype);
    res.json({ qris: url });
  } catch (error) {
    console.error('[Kustomisasi] Gagal upload QRIS:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function hapusQris(req, res) {
  try {
    await paymentConfigModel.hapusQrisConfig();
    res.json({ ok: true });
  } catch (error) {
    console.error('[Kustomisasi] Gagal hapus QRIS:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function tambahRekening(req, res) {
  try {
    const { namaBank, nomorRekening, atasNama } = req.body;
    if (!namaBank || !nomorRekening) {
      res.status(400).json({ error: 'Nama bank dan nomor rekening wajib diisi' });
      return;
    }
    const rekening = await paymentConfigModel.tambahRekening({ namaBank, nomorRekening, atasNama });
    res.json(rekening);
  } catch (error) {
    console.error('[Kustomisasi] Gagal tambah rekening:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function hapusRekening(req, res) {
  try {
    await paymentConfigModel.hapusRekening(req.params.id);
    res.json({ ok: true });
  } catch (error) {
    console.error('[Kustomisasi] Gagal hapus rekening:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { ambilSemua, uploadQris, hapusQris, tambahRekening, hapusRekening };
