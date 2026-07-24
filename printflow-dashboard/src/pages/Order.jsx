import { useState } from "react";
import { MessageCircle, Search, Trash2 } from "lucide-react";
import { warna, gradien, bayangan, statusWarna, inputStyle } from "../styles/theme";
import { inisial } from "../utils/format";
import PillDropdown from "../molecules/PillDropdown";
import EmptyState from "../atoms/EmptyState";
import OrderFormModal from "../organisms/OrderFormModal";
import ConfirmModal from "../organisms/ConfirmModal";

function bukaWA(nomor, detail) {
  const pesan = encodeURIComponent(`Halo kak, mengenai order ${detail}`);
  window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");
}

export default function Order({ orders, onUbahStatus, onTambahOrder, onHapusSemuaOrder }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [cariOrder, setCariOrder] = useState("");
  const [konfirmasiHapusSemua, setKonfirmasiHapusSemua] = useState(false);

  const orderAktif = orders.filter((o) => o.status !== "selesai");
  const orderTersaring = orderAktif.filter(
    (o) => o.nama.toLowerCase().includes(cariOrder.toLowerCase()) || (o.nomor || "").includes(cariOrder)
  );

  return (
    <div className="rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
      <div className="flex items-center justify-between mb-4">
        <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }}>Daftar order</p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} strokeWidth={2.3} className="absolute left-3 top-2.5" style={{ color: warna.teksSekunder }} />
            <input
              value={cariOrder}
              onChange={(e) => setCariOrder(e.target.value)}
              placeholder="Cari nama atau nomor WA"
              className="rounded-full outline-none w-56"
              style={{ ...inputStyle, fontSize: 14, padding: "8px 12px 8px 34px" }}
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="text-white rounded-full px-4 py-2"
            style={{ background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, fontSize: 12, fontWeight: 600, transition: "filter 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            + Order baru
          </button>
          {orderAktif.length > 0 && (
            <button
              onClick={() => setKonfirmasiHapusSemua(true)}
              className="flex items-center gap-1 rounded-full px-3 py-2"
              style={{ fontSize: 12, fontWeight: 600, color: warna.bahaya, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = warna.bahayaBg)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 size={13} strokeWidth={2.3} /> Hapus semua
            </button>
          )}
        </div>
      </div>
      {orderTersaring.length === 0 ? (
        <EmptyState pesan={cariOrder ? "Order tidak ditemukan" : "Belum ada order masuk"} />
      ) : (
        <table className="w-full">
          <thead>
            <tr style={{ textAlign: "left", color: warna.teksSekunder, borderBottom: `1px solid ${warna.garis}` }}>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Customer</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Detail order</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Tanggal masuk</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Total</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Status</th>
              <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orderTersaring.map((o) => (
              <tr
                key={o.id}
                style={{ borderBottom: `1px solid ${warna.divider}`, transition: "background 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "12px 0" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ background: gradien.aksen, fontSize: 12, fontWeight: 700 }}>
                      {inisial(o.nama)}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: warna.teksUtama }}>{o.nama}</span>
                  </div>
                </td>
                <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.detail}</td>
                <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.tanggal}</td>
                <td style={{ fontSize: 14, fontWeight: 600, padding: "12px 0", color: warna.teksUtama }}>{o.totalFormatted}</td>
                <td style={{ padding: "12px 0" }}>
                  <PillDropdown
                    value={o.status}
                    options={[
                      { value: "menunggu_bayar", label: "Menunggu pembayaran" },
                      { value: "belum", label: "Belum diproses" },
                      { value: "proses", label: "Sedang diproses" },
                      { value: "selesai", label: "Selesai" },
                    ]}
                    colorFor={(v) => statusWarna[v]}
                    onChange={(v) => onUbahStatus(o.id, v)}
                  />
                </td>
                <td style={{ padding: "12px 0" }}>
                  <button
                    onClick={() => bukaWA(o.nomor, o.detail)}
                    className="flex items-center gap-1 rounded-full px-3 py-1.5"
                    style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder, border: `1px solid ${warna.garis}`, transition: "background 0.2s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <MessageCircle size={13} strokeWidth={2.3} /> Chat WA
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <OrderFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onTambahOrder} />

      <ConfirmModal
        open={konfirmasiHapusSemua}
        onClose={() => setKonfirmasiHapusSemua(false)}
        onConfirm={onHapusSemuaOrder}
        judul="Hapus semua order?"
        pesan={`${orderAktif.length} order aktif akan dihapus permanen.`}
        labelKonfirmasi="Ya, hapus semua"
      />
    </div>
  );
}
