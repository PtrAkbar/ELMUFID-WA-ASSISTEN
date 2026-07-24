// Spesifikasi OpenAPI buat Swagger UI (/api-docs) -- ditulis manual (bukan
// digenerate dari komentar JSDoc) supaya gampang dicek kebenarannya, dan gak
// nambah dependency parsing lagi. Update file ini kalau ada endpoint baru.

const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'PrintFlow Bot API',
    version: '1.0.0',
    description: 'API status koneksi WhatsApp & data stock, dipakai oleh printflow-dashboard.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local dev' }],
  tags: [
    { name: 'WhatsApp', description: 'Status koneksi & kontrol sesi WhatsApp' },
    { name: 'Stock', description: 'Kelola data stock barang' },
  ],
  paths: {
    '/api/wa/status': {
      get: {
        tags: ['WhatsApp'],
        summary: 'Ambil status koneksi WhatsApp saat ini',
        responses: {
          200: {
            description: 'Status koneksi',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['connecting', 'qr', 'connected', 'disconnected'] },
                    qr: { type: 'string', nullable: true, description: 'Data URL gambar QR (kalau status=qr)' },
                    number: { type: 'string', nullable: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/wa/events': {
      get: {
        tags: ['WhatsApp'],
        summary: 'Stream status koneksi WhatsApp secara realtime (Server-Sent Events)',
        description: 'Bukan buat dicoba lewat Swagger UI (butuh koneksi persisten) -- dokumentasi aja.',
        responses: { 200: { description: 'text/event-stream berisi objek status yang sama seperti /api/wa/status' } },
      },
    },
    '/api/wa/logout': {
      post: {
        tags: ['WhatsApp'],
        summary: 'Putuskan sesi WhatsApp yang aktif & minta QR baru',
        responses: {
          200: { description: 'Berhasil logout' },
          500: { description: 'Gagal logout' },
        },
      },
    },
    '/api/wa/debug-send-self': {
      post: {
        tags: ['WhatsApp'],
        summary: '[Debug] Kirim pesan tes ke nomor bot sendiri (chat "Message Yourself")',
        description: 'Buat memastikan pengiriman pesan berhasil sampai level protokol WhatsApp.',
        responses: {
          200: { description: 'Berhasil terkirim' },
          500: { description: 'Gagal terkirim (mis. WA belum terhubung)' },
        },
      },
    },
    '/api/stock': {
      get: {
        tags: ['Stock'],
        summary: 'Ambil semua data stock barang',
        responses: {
          200: {
            description: 'Daftar barang',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Barang' } } } },
          },
        },
      },
      post: {
        tags: ['Stock'],
        summary: 'Tambah satu barang baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama'],
                properties: {
                  nama: { type: 'string', example: 'Kertas A3' },
                  harga: { type: 'string', example: '700' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Barang berhasil ditambah', content: { 'application/json': { schema: { $ref: '#/components/schemas/Barang' } } } },
          400: { description: 'Nama barang kosong' },
        },
      },
      delete: {
        tags: ['Stock'],
        summary: 'Hapus SEMUA barang (hati-hati, gak bisa di-undo)',
        responses: { 200: { description: 'Semua barang terhapus' } },
      },
    },
    '/api/stock/bulk': {
      post: {
        tags: ['Stock'],
        summary: 'Import banyak barang sekaligus (maks 500 baris)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['barang'],
                properties: {
                  barang: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: { nama: { type: 'string' }, harga: { type: 'string' } },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil diimpor' },
          400: { description: 'Daftar barang kosong/tidak valid' },
        },
      },
    },
    '/api/stock/{kode}': {
      patch: {
        tags: ['Stock'],
        summary: 'Ubah status dan/atau harga satu barang',
        parameters: [{ name: 'kode', in: 'path', required: true, schema: { type: 'string' }, example: 'BRG-001' }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', enum: ['masih', 'habis'] },
                  harga: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil diubah' },
          500: { description: 'Barang tidak ditemukan / gagal ubah' },
        },
      },
      delete: {
        tags: ['Stock'],
        summary: 'Hapus satu barang berdasarkan kode',
        parameters: [{ name: 'kode', in: 'path', required: true, schema: { type: 'string' }, example: 'BRG-001' }],
        responses: {
          200: { description: 'Berhasil dihapus' },
          500: { description: 'Barang tidak ditemukan / gagal hapus' },
        },
      },
    },
  },
  components: {
    schemas: {
      Barang: {
        type: 'object',
        properties: {
          kode: { type: 'string', example: 'BRG-001' },
          nama: { type: 'string', example: 'Kertas a4' },
          harga: { type: 'string', example: '500' },
          status: { type: 'string', enum: ['masih', 'habis'] },
          stockIn: { type: 'string', example: '' },
          stockOut: { type: 'string', example: '' },
        },
      },
    },
  },
};

module.exports = openapiSpec;
