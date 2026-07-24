const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./docs/openapiSpec');
const stockRoutes = require('./routes/stockRoutes');
const waRoutes = require('./routes/waRoutes');
const orderRoutes = require('./routes/orderRoutes');
const kustomisasiRoutes = require('./routes/kustomisasiRoutes');

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

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));
  app.use('/api/wa', waRoutes);
  app.use('/api/stock', stockRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/kustomisasi', kustomisasiRoutes);

  return app;
}

module.exports = { createServer };
