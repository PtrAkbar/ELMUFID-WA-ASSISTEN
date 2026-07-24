const { google } = require('googleapis');
const env = require('../config/env');

const RANGE = 'Sheet1!A:F';
const SHEET_ID = 0;

// Google Sheets API tidak menjamin urutan/atomicity kalau dua permintaan
// append/update datang bersamaan (pernah terbukti menghasilkan kode barang
// kembar). Semua operasi tulis di-antrekan di sini supaya cuma satu yang
// jalan ke Sheets dalam satu waktu, walau permintaan dari server datang
// bersamaan.
let antrianTulis = Promise.resolve();
function tulisBerurutan(tugas) {
  const hasil = antrianTulis.then(tugas, tugas);
  antrianTulis = hasil.then(
    () => {},
    () => {}
  );
  return hasil;
}

let sheetsClient = null;

function getSheetsClient() {
  if (sheetsClient) return sheetsClient;
  const auth = new google.auth.GoogleAuth({
    keyFile: env.googleCredentialsPath,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheetsClient = google.sheets({ version: 'v4', auth });
  return sheetsClient;
}

function waktuSekarang() {
  const d = new Date();
  const tgl = String(d.getDate()).padStart(2, '0');
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const jam = String(d.getHours()).padStart(2, '0');
  const menit = String(d.getMinutes()).padStart(2, '0');
  return `${tgl}/${bulan}/${d.getFullYear()} ${jam}:${menit}`;
}

async function getAllRows() {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: env.stockSheetId, range: RANGE });
  return res.data.values || [];
}

function rowToItem(row) {
  return {
    kode: row[0] || '',
    nama: row[1] || '',
    harga: row[2] || '0',
    status: row[3] || 'masih',
    stockIn: row[4] || '',
    stockOut: row[5] || '',
  };
}

async function getAllStock() {
  const rows = await getAllRows();
  return rows.slice(1).map(rowToItem);
}

// Baris baru kadang ikut mewarisi format header (latar ungu + teks putih) dari
// Google Sheets. Dipaksa latar putih dan teks hitam di sini supaya baris data
// selalu tampil bersih dan kebaca, bukan teks putih di atas putih (tak terlihat).
async function putihkanBaris(rowIndex) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: env.stockSheetId,
    requestBody: {
      requests: [
        {
          repeatCell: {
            range: { sheetId: SHEET_ID, startRowIndex: rowIndex, endRowIndex: rowIndex + 1, startColumnIndex: 0, endColumnIndex: 6 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 1, green: 1, blue: 1 },
                textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 } },
              },
            },
            fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat.foregroundColor',
          },
        },
      ],
    },
  });
}

// Kode dibuat dari nomor baris hasil append itu sendiri (bukan dari pembacaan
// jumlah baris sebelumnya) supaya dua permintaan tambah barang yang datang
// hampir bersamaan (mis. klik dobel) tidak pernah menghasilkan kode kembar,
// karena Sheets API menjamin tiap panggilan append() jatuh di baris berbeda.
async function tambahStock({ nama, harga }) {
  return tulisBerurutan(async () => {
    const rows = await getAllRows();
    const jumlahBarang = Math.max(rows.length - 1, 0);
    const kode = 'BRG-' + String(jumlahBarang + 1).padStart(3, '0');
    const stockIn = waktuSekarang();

    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.stockSheetId,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[kode, nama, harga || '0', 'masih', stockIn, '']] },
    });

    await putihkanBaris(jumlahBarang + 1);

    return { kode, nama, harga: harga || '0', status: 'masih', stockIn, stockOut: '' };
  });
}

// Untuk import massal dari file Excel: satu kali baca + satu kali append
// berisi banyak baris sekaligus, jauh lebih cepat daripada memanggil
// tambahStock() berulang kali (yang masing-masing baca+tulis terpisah).
async function tambahStockBanyak(daftarBarang) {
  return tulisBerurutan(async () => {
    const rows = await getAllRows();
    let jumlahBarang = Math.max(rows.length - 1, 0);
    const stockIn = waktuSekarang();
    const baruDitambahkan = [];
    const values = daftarBarang.map(({ nama, harga }) => {
      jumlahBarang += 1;
      const kode = 'BRG-' + String(jumlahBarang).padStart(3, '0');
      baruDitambahkan.push({ kode, nama, harga: harga || '0', status: 'masih', stockIn, stockOut: '' });
      return [kode, nama, harga || '0', 'masih', stockIn, ''];
    });

    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: env.stockSheetId,
      range: RANGE,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values },
    });

    const barisAwal = jumlahBarang - daftarBarang.length + 1;
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.stockSheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: { sheetId: SHEET_ID, startRowIndex: barisAwal, endRowIndex: jumlahBarang + 1, startColumnIndex: 0, endColumnIndex: 6 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 1, green: 1, blue: 1 },
                  textFormat: { foregroundColor: { red: 0, green: 0, blue: 0 } },
                },
              },
              fields: 'userEnteredFormat.backgroundColor,userEnteredFormat.textFormat.foregroundColor',
            },
          },
        ],
      },
    });

    return baruDitambahkan;
  });
}

// Mencari posisi baris barang di Sheet berdasarkan kode (0-based, termasuk baris header)
async function cariBarisIndex(kode) {
  const rows = await getAllRows();
  return { rows, index: rows.findIndex((row, i) => i > 0 && row[0] === kode) };
}

// StockOut dicatat saat status berubah jadi "habis", StockIn diperbarui saat
// barang di-restock (status balik dari "habis" ke "masih") supaya StockIn
// selalu mencerminkan pengisian ulang stok yang paling baru.
async function ubahStock(kode, perubahan) {
  return tulisBerurutan(async () => {
    const { rows, index } = await cariBarisIndex(kode);
    if (index === -1) throw new Error('Barang tidak ditemukan di Sheet');

    const rowLama = rows[index];
    const statusLama = rowLama[3] || 'masih';
    const statusBaru = perubahan.status !== undefined ? perubahan.status : statusLama;

    let stockIn = rowLama[4] || '';
    let stockOut = rowLama[5] || '';
    if (statusBaru === 'habis' && statusLama !== 'habis') {
      stockOut = waktuSekarang();
    } else if (statusBaru === 'masih' && statusLama === 'habis') {
      stockIn = waktuSekarang();
      stockOut = '';
    }

    const rowBaru = [
      rowLama[0],
      rowLama[1],
      perubahan.harga !== undefined ? perubahan.harga : rowLama[2],
      statusBaru,
      stockIn,
      stockOut,
    ];
    const rowNumber = index + 1;
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: env.stockSheetId,
      range: `Sheet1!A${rowNumber}:F${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [rowBaru] },
    });

    await putihkanBaris(index);
  });
}

async function hapusStock(kode) {
  return tulisBerurutan(async () => {
    const { index } = await cariBarisIndex(kode);
    if (index === -1) throw new Error('Barang tidak ditemukan di Sheet');

    const sheets = getSheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.stockSheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId: SHEET_ID, dimension: 'ROWS', startIndex: index, endIndex: index + 1 },
            },
          },
        ],
      },
    });
  });
}

async function hapusSemuaStock() {
  return tulisBerurutan(async () => {
    const rows = await getAllRows();
    if (rows.length <= 1) return;

    const sheets = getSheetsClient();
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: env.stockSheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: { sheetId: SHEET_ID, dimension: 'ROWS', startIndex: 1, endIndex: rows.length },
            },
          },
        ],
      },
    });
  });
}

module.exports = { getAllStock, tambahStock, tambahStockBanyak, ubahStock, hapusStock, hapusSemuaStock };
