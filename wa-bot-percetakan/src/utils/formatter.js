// Format angka menjadi format Rupiah, contoh: 15000 -> "Rp15.000"
function formatRupiah(angka) {
  return `Rp${angka.toLocaleString('id-ID')}`;
}

module.exports = { formatRupiah };
