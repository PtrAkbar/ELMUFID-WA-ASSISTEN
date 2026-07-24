// Daftar harga jasa tambahan (jilid, laminasi, dll). Harga barang/kertas itu
// sendiri TIDAK ada di sini -- itu diambil langsung dari data stock asli
// (lihat pricingService.calculateOrder), supaya harga print selalu konsisten
// dengan harga yang admin atur di dashboard/Sheet.

const jasaTambahan = [
  { id: 'jilid_spiral', nama: 'Jilid Spiral', hargaSatuan: 5000, satuan: 'per dokumen' },
  { id: 'jilid_lakban', nama: 'Jilid Lakban', hargaSatuan: 3000, satuan: 'per dokumen' },
  { id: 'jilid_hardcover', nama: 'Jilid Hardcover', hargaSatuan: 15000, satuan: 'per dokumen' },
  { id: 'laminasi', nama: 'Laminasi', hargaSatuan: 4000, satuan: 'per lembar' },
  { id: 'potong', nama: 'Potong Sesuai Ukuran', hargaSatuan: 1000, satuan: 'per dokumen' },
];

function getJasaTambahan() {
  return jasaTambahan;
}

// Pencarian fleksibel berdasarkan nama jasa tambahan
function findJasaTambahan(namaJasa) {
  const keyword = namaJasa.toLowerCase();
  return jasaTambahan.find(
    (item) => item.nama.toLowerCase().includes(keyword) || item.id.includes(keyword.replace(/\s+/g, '_'))
  );
}

module.exports = { getJasaTambahan, findJasaTambahan };
