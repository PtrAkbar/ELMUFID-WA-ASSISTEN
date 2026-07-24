import { useMemo, useState } from "react";
import { Search, RotateCcw, Trash2, Download, MessageCircle } from "lucide-react";
import { warna, gradien, bayangan, inputStyle } from "../styles/theme";
import { bulanTahunKey, formatBulanTahun, formatJam, toISO } from "../utils/date";
import { formatRupiah, formatTanggal } from "../lib/orders";
import { unduhRekapExcel } from "../utils/exportExcel";
import EmptyState from "../components/EmptyState";
import ConfirmModal from "../components/ConfirmModal";

function bukaWA(nomor, detail) {
  const pesan = encodeURIComponent(`Halo kak, mengenai order ${detail}`);
  window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");
}

export default function Riwayat({ orders, onRestore, onHapusSemuaRiwayat }) {
  const [cariRiwayat, setCariRiwayat] = useState("");
  const [konfirmasiHapusSemua, setKonfirmasiHapusSemua] = useState(false);

  const selesai = orders.filter((o) => o.status === "selesai");
  const selesaiTersaring = selesai.filter((o) => o.nama.toLowerCase().includes(cariRiwayat.toLowerCase()));

  const kelompokBulan = useMemo(() => {
    const map = new Map();
    selesaiTersaring.forEach((o) => {
      const waktuSelesai = new Date(o.updatedAt);
      const key = bulanTahunKey(waktuSelesai);
      if (!map.has(key)) map.set(key, { key, label: formatBulanTahun(waktuSelesai), items: [] });
      map.get(key).items.push({
        ...o,
        waktuSelesai,
        tanggalSelesai: formatTanggal(o.updatedAt),
        jamSelesai: formatJam(waktuSelesai),
      });
    });
    return Array.from(map.values())
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .map((grup) => ({
        ...grup,
        items: grup.items.sort((a, b) => b.waktuSelesai - a.waktuSelesai),
        totalOmzet: grup.items.reduce((s, o) => s + o.total, 0),
      }));
  }, [selesaiTersaring]);

  function handleExport() {
    unduhRekapExcel(`riwayat-order-${toISO(new Date())}.xls`, kelompokBulan);
  }

  return (
    <div className="rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }}>Riwayat order selesai</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} strokeWidth={2.3} className="absolute left-3 top-2.5" style={{ color: warna.teksSekunder }} />
            <input
              value={cariRiwayat}
              onChange={(e) => setCariRiwayat(e.target.value)}
              placeholder="Cari nama customer"
              className="rounded-full outline-none w-56"
              style={{ ...inputStyle, fontSize: 14, padding: "8px 12px 8px 34px" }}
            />
          </div>
          {selesai.length > 0 && (
            <>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 rounded-full px-3 py-2"
                style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Download size={13} strokeWidth={2.3} /> Export Excel
              </button>
              <button
                onClick={() => setKonfirmasiHapusSemua(true)}
                className="flex items-center gap-1 rounded-full px-3 py-2"
                style={{ fontSize: 12, fontWeight: 600, color: warna.bahaya, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = warna.bahayaBg)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <Trash2 size={13} strokeWidth={2.3} /> Hapus semua
              </button>
            </>
          )}
        </div>
      </div>

      {kelompokBulan.length === 0 ? (
        <EmptyState pesan={cariRiwayat ? "Riwayat tidak ditemukan" : "Belum ada order yang selesai"} />
      ) : (
        kelompokBulan.map((grup) => (
          <div key={grup.key} className="mb-6">
            <div className="flex items-center justify-between mb-2" style={{ borderTop: `1px solid ${warna.garis}`, paddingTop: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: warna.teksUtama }}>{grup.label}</p>
              <p style={{ fontSize: 12, fontWeight: 500, color: warna.teksSekunder }}>
                {grup.items.length} order &middot; {formatRupiah(grup.totalOmzet)}
              </p>
            </div>
            <table className="w-full">
              <thead>
                <tr style={{ textAlign: "left", color: warna.teksSekunder, borderBottom: `1px solid ${warna.garis}` }}>
                  <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Aktivitas</th>
                  <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Order ID</th>
                  <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Tanggal selesai</th>
                  <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Jam selesai</th>
                  <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Harga</th>
                  <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0", textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {grup.items.map((o) => (
                  <tr
                    key={o.id}
                    style={{ borderBottom: `1px solid ${warna.divider}`, transition: "background 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ fontSize: 14, fontWeight: 700, padding: "12px 0", color: warna.teksUtama }}>{o.detail}</td>
                    <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.kode}</td>
                    <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.tanggalSelesai}</td>
                    <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.jamSelesai}</td>
                    <td style={{ fontSize: 14, fontWeight: 600, padding: "12px 0", color: warna.teksUtama }}>{o.totalFormatted}</td>
                    <td style={{ padding: "12px 0", textAlign: "right" }}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => bukaWA(o.nomor, o.detail)}
                          className="flex items-center gap-1 rounded-full px-3 py-1.5"
                          style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                          title="Chat WA customer"
                        >
                          <MessageCircle size={13} strokeWidth={2.3} /> Chat WA
                        </button>
                        <button
                          onClick={() => onRestore(o.id)}
                          className="inline-flex items-center gap-1 rounded-full px-3 py-1.5"
                          style={{ fontSize: 12, fontWeight: 600, color: "#FFFFFF", background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, transition: "filter 0.2s ease" }}
                          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
                          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                          title="Kembalikan ke order (sedang diproses)"
                        >
                          <RotateCcw size={13} strokeWidth={2.3} /> Restore
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}

      <ConfirmModal
        open={konfirmasiHapusSemua}
        onClose={() => setKonfirmasiHapusSemua(false)}
        onConfirm={onHapusSemuaRiwayat}
        judul="Hapus semua riwayat?"
        pesan={`${selesai.length} order selesai akan dihapus permanen dari riwayat.`}
        labelKonfirmasi="Ya, hapus semua"
      />
    </div>
  );
}
