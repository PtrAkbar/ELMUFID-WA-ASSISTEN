const express = require('express');
const cors = require('cors');
const waState = require('./services/waState');
const { logoutWhatsApp, kirimTesKeDiriSendiri } = require('./services/whatsappService');
const stockSheet = require('./services/stockSheetService');

// Vite otomatis pindah ke port lain (5174, 5175, dst) kalau port defaultnya
// sudah dipakai, jadi origin dashboard tidak selalu sama persis tiap kali
// dijalankan. Izinkan semua origin localhost/127.0.0.1 di port berapa pun
// supaya dashboard tetap bisa konek walau portnya berubah.
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;

function createServer() {
  const app = express();
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || localhostOriginPattern.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Origin tidak diizinkan'));
        }
      },
    })
  );
  app.use(express.json());

  app.get('/api/wa/status', (req, res) => {
    res.json(waState.getState());
  });

  app.get('/api/wa/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const send = (state) => res.write(`data: ${JSON.stringify(state)}\n\n`);
    send(waState.getState());

    const unsubscribe = waState.onUpdate(send);
    req.on('close', unsubscribe);
  });

  app.post('/api/wa/logout', async (req, res) => {
    try {
      await logoutWhatsApp();
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  app.post('/api/wa/debug-send-self', async (req, res) => {
    try {
      const hasil = await kirimTesKeDiriSendiri();
      res.json({ ok: true, hasil });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  });

  app.get('/api/stock', async (req, res) => {
    try {
      const stock = await stockSheet.getAllStock();
      res.json(stock);
    } catch (error) {
      console.error('[Stock] Gagal ambil data:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/stock', async (req, res) => {
    try {
      const { nama, harga } = req.body;
      if (!nama || !nama.trim()) {
        res.status(400).json({ error: 'Nama barang wajib diisi' });
        return;
      }
      const barang = await stockSheet.tambahStock({ nama, harga });
      res.json(barang);
    } catch (error) {
      console.error('[Stock] Gagal tambah barang:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/stock/bulk', async (req, res) => {
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
      const hasil = await stockSheet.tambahStockBanyak(bersih);
      res.json({ ok: true, jumlah: hasil.length, barang: hasil });
    } catch (error) {
      console.error('[Stock] Gagal import barang:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/stock/:kode', async (req, res) => {
    try {
      const { status, harga } = req.body;
      await stockSheet.ubahStock(req.params.kode, { status, harga });
      res.json({ ok: true });
    } catch (error) {
      console.error('[Stock] Gagal ubah barang:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/stock', async (req, res) => {
    try {
      await stockSheet.hapusSemuaStock();
      res.json({ ok: true });
    } catch (error) {
      console.error('[Stock] Gagal hapus semua barang:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/stock/:kode', async (req, res) => {
    try {
      await stockSheet.hapusStock(req.params.kode);
      res.json({ ok: true });
    } catch (error) {
      console.error('[Stock] Gagal hapus barang:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  return app;
}

module.exports = { createServer };
