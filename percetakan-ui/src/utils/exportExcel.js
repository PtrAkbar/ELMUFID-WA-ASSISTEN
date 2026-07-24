const WARNA_HEADER = "#6750A4";
const SEL_DASAR = "border:1px solid #999;padding:5px 10px;font-family:Calibri,Arial,sans-serif;font-size:12px;";

function escapeHtml(nilai) {
  return String(nilai ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function selData(nilai, rataKanan) {
  const align = rataKanan ? "text-align:right;" : "";
  return `<td style="${SEL_DASAR}${align}">${escapeHtml(nilai)}</td>`;
}

function barisData(sel) {
  return `<tr>${sel.map((v, i) => selData(v, i === 5)).join("")}</tr>`;
}

function barisHeaderKolom(judul, kolom = 6) {
  const isi = judul
    .map((j) => `<td style="${SEL_DASAR}background:${WARNA_HEADER};color:#fff;font-weight:bold;text-align:center;">${escapeHtml(j)}</td>`)
    .join("");
  return `<tr>${isi}</tr>`;
}

function barisJudulBulan(teks, kolom = 6) {
  return `<tr><td colspan="${kolom}" style="${SEL_DASAR}background:#EAE3F5;font-weight:bold;font-size:13px;color:#3A2E5C;">${escapeHtml(teks)}</td></tr>`;
}

function barisSubtotal(totalOmzet, kolom = 6) {
  return `<tr>
    <td colspan="${kolom - 2}" style="${SEL_DASAR}"></td>
    <td style="${SEL_DASAR}font-weight:bold;">Subtotal</td>
    <td style="${SEL_DASAR}font-weight:bold;text-align:right;">${totalOmzet}</td>
  </tr>`;
}

function barisKosong(kolom = 6) {
  return `<tr><td colspan="${kolom}" style="border:none;height:10px;"></td></tr>`;
}

// Diekspor sebagai tabel HTML berekstensi .xls, bukan CSV murni, karena CSV
// koma sering gagal ke-split jadi kolom di Excel/WPS dengan locale
// Indonesia/Eropa (pemisah daftar defaultnya titik koma, bukan koma) -
// semuanya numpuk jadi satu kolom. Format HTML .xls dibuka Excel sebagai
// tabel asli dengan kolom terpisah dan format warna, apa pun locale-nya.
export function unduhRekapExcel(namaFile, kelompokBulan) {
  const bagian = kelompokBulan
    .map((grup) => {
      const header = barisHeaderKolom(["Tanggal selesai", "Jam selesai", "Order ID", "Customer", "Detail", "Total"]);
      const dataRows = grup.items
        .map((o) => barisData([o.tanggalSelesai, o.jamSelesai, o.kode, o.nama, o.detail, o.total]))
        .join("");
      return barisJudulBulan(grup.label) + header + dataRows + barisSubtotal(grup.totalOmzet) + barisKosong();
    })
    .join("");

  const html = `<html><head><meta charset="utf-8"></head><body>
    <table style="border-collapse:collapse;">
      <tr><td colspan="6" style="border:none;font-family:Calibri,Arial,sans-serif;font-weight:bold;font-size:16px;color:${WARNA_HEADER};padding:6px 10px;">Rekap riwayat order selesai</td></tr>
      ${barisKosong()}
      ${bagian}
    </table>
  </body></html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = namaFile;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
