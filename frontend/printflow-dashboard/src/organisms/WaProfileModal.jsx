import { Phone, LogOut, CheckCircle2, X } from "lucide-react";
import { warna, gradien, bayangan } from "../styles/theme";
import Modal from "../molecules/Modal";

export default function WaProfileModal({ open, onClose, nomor, onLogout }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex justify-end mb-1">
        <button
          onClick={onClose}
          className="rounded-full flex items-center justify-center"
          style={{ width: 28, height: 28, transition: "background 0.15s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <X size={16} style={{ color: warna.teksSekunder }} />
        </button>
      </div>
      <div className="flex flex-col items-center text-center mb-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: gradien.aksenIkon, boxShadow: bayangan.glow }}>
          <Phone size={22} className="text-white" />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: warna.teksUtama }}>WhatsApp Terhubung</p>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mt-1">{nomor}</p>
        <span className="flex items-center gap-1 rounded-full mt-2 px-3 py-1" style={{ fontSize: 12, fontWeight: 600, color: warna.sukses, background: warna.sukses + "1f" }}>
          <CheckCircle2 size={12} /> Aktif
        </span>
      </div>
      <button
        onClick={onLogout}
        className="w-full rounded-full py-2.5 flex items-center justify-center gap-2"
        style={{ border: `1px solid ${warna.garis}`, color: warna.bahaya, fontSize: 13, fontWeight: 600, transition: "background 0.2s ease" }}
        onMouseEnter={(e) => (e.currentTarget.style.background = warna.bahayaBg)}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <LogOut size={14} /> Putuskan &amp; ganti nomor
      </button>
    </Modal>
  );
}
