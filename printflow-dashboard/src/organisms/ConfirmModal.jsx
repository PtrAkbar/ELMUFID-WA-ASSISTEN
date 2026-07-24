import { AlertTriangle } from "lucide-react";
import { warna } from "../styles/theme";
import Modal from "../molecules/Modal";

export default function ConfirmModal({ open, onClose, onConfirm, judul, pesan, labelKonfirmasi = "Ya, hapus" }) {
  return (
    <Modal open={open} onClose={onClose} width={340}>
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: warna.bahayaBg }}>
          <AlertTriangle size={20} strokeWidth={2.4} style={{ color: warna.bahaya }} />
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: warna.teksUtama }}>{judul}</p>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mt-1 mb-5">{pesan}</p>
        <div className="flex gap-2 w-full">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-2.5"
            style={{ border: `1px solid ${warna.garis}`, color: warna.teksUtama, fontSize: 13, fontWeight: 600, transition: "background 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-full py-2.5 text-white"
            style={{ background: warna.bahaya, fontSize: 13, fontWeight: 600, transition: "filter 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(0.88)")}
            onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
          >
            {labelKonfirmasi}
          </button>
        </div>
      </div>
    </Modal>
  );
}
