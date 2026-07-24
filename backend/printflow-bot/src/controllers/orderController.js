const orderModel = require('../models/orderModel');
const orderEvents = require('../services/orderEvents');

async function ambilSemua(req, res) {
  try {
    const orders = await orderModel.ambilSemuaOrder();
    res.json(orders);
  } catch (error) {
    console.error('[Order] Gagal ambil data:', error.message);
    res.status(500).json({ error: error.message });
  }
}

function events(req, res) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const unsubscribe = orderEvents.onChange((payload) => {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  });
  req.on('close', unsubscribe);
}

async function tambah(req, res) {
  try {
    const { nama, nomor, detail, total } = req.body;
    if (!nama || !nomor || !detail) {
      res.status(400).json({ error: 'Nama, nomor, dan detail order wajib diisi' });
      return;
    }
    const order = await orderModel.buatOrderManual({ nama, nomor, detail, total: Number(total) || 0 });
    res.json(order);
  } catch (error) {
    console.error('[Order] Gagal tambah order:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function ubahStatus(req, res) {
  try {
    await orderModel.updateStatusOrder(req.params.id, req.body.status);
    res.json({ ok: true });
  } catch (error) {
    console.error('[Order] Gagal ubah status:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function hapusSemuaAktif(req, res) {
  try {
    await orderModel.hapusSemuaOrderAktif();
    res.json({ ok: true });
  } catch (error) {
    console.error('[Order] Gagal hapus semua order aktif:', error.message);
    res.status(500).json({ error: error.message });
  }
}

async function hapusSemuaRiwayat(req, res) {
  try {
    await orderModel.hapusSemuaRiwayat();
    res.json({ ok: true });
  } catch (error) {
    console.error('[Order] Gagal hapus riwayat:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { ambilSemua, events, tambah, ubahStatus, hapusSemuaAktif, hapusSemuaRiwayat };
