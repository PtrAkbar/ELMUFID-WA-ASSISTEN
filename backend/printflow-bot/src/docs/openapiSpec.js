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
    { name: 'Order', description: 'Kelola order dashboard (dibuat manual atau dari chat WA)' },
    { name: 'Kustomisasi', description: 'Konfigurasi QRIS & rekening pembayaran toko' },
  ],
  // Semua endpoint wajib login -- klik tombol "Authorize" di kanan atas dan
  // tempel access token sesi Supabase Auth (bisa diambil dari dashboard yang
  // sedang login lewat DevTools > Application > Local Storage, key yang
  // isinya "access_token", atau dari `supabase.auth.getSession()` di console).
  security: [{ bearerAuth: [] }],
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
    '/api/orders': {
      get: {
        tags: ['Order'],
        summary: 'Ambil semua order, urut terbaru dulu',
        responses: {
          200: {
            description: 'Daftar order',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } },
          },
        },
      },
      post: {
        tags: ['Order'],
        summary: 'Tambah order manual (bukan dari chat WA), status langsung "belum"',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nama', 'nomor', 'detail'],
                properties: {
                  nama: { type: 'string', example: 'Rina Kartika' },
                  nomor: { type: 'string', example: '62812xxxxxxx' },
                  detail: { type: 'string', example: 'Print A4 200 lembar, jilid spiral' },
                  total: { type: 'number', example: 75000 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Order berhasil dibuat', content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } } },
          400: { description: 'Nama/nomor/detail kosong' },
        },
      },
    },
    '/api/orders/events': {
      get: {
        tags: ['Order'],
        summary: 'Stream perubahan order secara realtime (Server-Sent Events)',
        description: 'Bukan buat dicoba lewat Swagger UI (butuh koneksi persisten) -- dokumentasi aja.',
        responses: { 200: { description: 'text/event-stream berisi { type: INSERT|UPDATE|DELETE, row }' } },
      },
    },
    '/api/orders/{id}/status': {
      patch: {
        tags: ['Order'],
        summary: 'Ubah status satu order',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { status: { type: 'string', enum: ['menunggu_bayar', 'belum', 'proses', 'selesai'] } } },
            },
          },
        },
        responses: { 200: { description: 'Berhasil diubah' }, 500: { description: 'Gagal ubah status' } },
      },
    },
    '/api/orders/aktif': {
      delete: {
        tags: ['Order'],
        summary: 'Hapus semua order aktif (status selain "selesai")',
        responses: { 200: { description: 'Berhasil dihapus' } },
      },
    },
    '/api/orders/riwayat': {
      delete: {
        tags: ['Order'],
        summary: 'Hapus semua riwayat order (status "selesai")',
        responses: { 200: { description: 'Berhasil dihapus' } },
      },
    },
    '/api/kustomisasi': {
      get: {
        tags: ['Kustomisasi'],
        summary: 'Ambil URL QRIS aktif & daftar rekening',
        responses: {
          200: {
            description: 'Konfigurasi pembayaran',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    qris: { type: 'string', nullable: true },
                    rekeningList: { type: 'array', items: { $ref: '#/components/schemas/Rekening' } },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/kustomisasi/qris': {
      post: {
        tags: ['Kustomisasi'],
        summary: 'Upload/ganti gambar QRIS',
        description: 'Kirim sebagai multipart/form-data, field "file". Gak bisa dites lewat Swagger UI biasa -- pakai dashboard.',
        requestBody: {
          required: true,
          content: { 'multipart/form-data': { schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } } },
        },
        responses: { 200: { description: 'Berhasil diupload' }, 400: { description: 'File tidak ditemukan' } },
      },
      delete: {
        tags: ['Kustomisasi'],
        summary: 'Hapus QRIS aktif',
        responses: { 200: { description: 'Berhasil dihapus' } },
      },
    },
    '/api/kustomisasi/rekening': {
      post: {
        tags: ['Kustomisasi'],
        summary: 'Tambah rekening bank baru',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['namaBank', 'nomorRekening'],
                properties: {
                  namaBank: { type: 'string', example: 'BCA' },
                  nomorRekening: { type: 'string', example: '1234567890' },
                  atasNama: { type: 'string', example: 'Toko EL-MUFID' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Berhasil ditambah', content: { 'application/json': { schema: { $ref: '#/components/schemas/Rekening' } } } },
          400: { description: 'Nama bank/nomor rekening kosong' },
        },
      },
    },
    '/api/kustomisasi/rekening/{id}': {
      delete: {
        tags: ['Kustomisasi'],
        summary: 'Hapus satu rekening',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Berhasil dihapus' } },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token sesi Supabase Auth (dari printflow-auth/printflow-dashboard yang sedang login).',
      },
    },
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
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama_customer: { type: 'string', example: 'Rina Kartika' },
          nomor_wa: { type: 'string', example: '62812xxxxxxx' },
          detail: { type: 'string', example: 'Print A4 200 lembar, jilid spiral' },
          total: { type: 'number', example: 75000 },
          status: { type: 'string', enum: ['menunggu_bayar', 'belum', 'proses', 'selesai'] },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      Rekening: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          nama_bank: { type: 'string', example: 'BCA' },
          nomor_rekening: { type: 'string', example: '1234567890' },
          atas_nama: { type: 'string', nullable: true, example: 'Toko EL-MUFID' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
};

module.exports = openapiSpec;
