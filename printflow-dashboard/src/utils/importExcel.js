import readXlsxFile from "read-excel-file/browser";

function cariIndexKolom(header, kandidat) {
  return header.findIndex((h) => kandidat.some((k) => String(h || "").toLowerCase().trim().includes(k)));
}

export async function parseFileStockExcel(file) {
  const rows = await readXlsxFile(file);
  if (!rows || rows.length < 2) {
    throw new Error("File kosong atau tidak ada data");
  }

  const header = rows[0];
  let namaIdx = cariIndexKolom(header, ["nama barang", "nama", "item", "name"]);
  let hargaIdx = cariIndexKolom(header, ["harga", "price"]);
  if (namaIdx === -1) namaIdx = 0;
  if (hargaIdx === -1) hargaIdx = 1;

  const daftar = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const nama = row[namaIdx];
    const harga = row[hargaIdx];
    if (!nama || !String(nama).trim()) continue;
    daftar.push({ nama: String(nama).trim(), harga: harga != null ? String(harga) : "0" });
  }

  if (daftar.length === 0) {
    throw new Error("Tidak ada baris barang yang valid di file (kolom 'Nama Barang' kosong semua)");
  }

  return daftar;
}
