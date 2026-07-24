const express = require('express');
const cors = require('cors');
const stockRoutes = require('./routes/stockRoutes');
const waRoutes = require('./routes/waRoutes');

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

  app.use('/api/wa', waRoutes);
  app.use('/api/stock', stockRoutes);

  return app;
}

module.exports = { createServer };
