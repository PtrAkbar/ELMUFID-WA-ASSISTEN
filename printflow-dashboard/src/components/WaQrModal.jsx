import { AnimatePresence, motion } from "framer-motion";
import { Loader2, WifiOff, CheckCircle2, X } from "lucide-react";
import { warna } from "../styles/theme";
import Modal from "./Modal";

const pesanStatus = {
  "connecting-server": "Menghubungkan ke server bot...",
  offline: "Server bot WhatsApp tidak aktif",
  connecting: "Menyiapkan koneksi WhatsApp...",
  disconnected: "Koneksi terputus, mencoba lagi...",
  connected: "Berhasil terhubung!",
};

export default function WaQrModal({ open, onClose, status, qr }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-start justify-between mb-1">
        <p style={{ fontSize: 16, fontWeight: 700, color: warna.teksUtama }}>Hubungkan WhatsApp</p>
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
      <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mb-4">
        Buka WhatsApp di HP toko, pilih Perangkat Tertaut, lalu scan kode di bawah ini.
      </p>
      <div className="flex items-center justify-center rounded-2xl mb-4" style={{ background: warna.bgSekunder, border: `1px solid ${warna.garis}`, height: 260 }}>
        <AnimatePresence mode="wait">
          {status === "qr" && qr ? (
            <motion.div
              key="qr"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="rounded-2xl overflow-hidden" style={{ width: 200, height: 200, background: warna.kartu, border: `1px solid ${warna.garis}` }}>
                <img src={qr} alt="QR WhatsApp" className="w-full h-full object-contain" />
              </div>
              <span style={{ fontSize: 12, fontWeight: 500, color: warna.teksSekunder }}>Kode QR menunggu untuk discan</span>
            </motion.div>
          ) : status === "offline" ? (
            <motion.div
              key="offline"
              className="flex flex-col items-center gap-2 px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <WifiOff size={28} style={{ color: warna.teksSekunder }} />
              <span style={{ fontSize: 12, color: warna.teksSekunder }}>
                Server bot belum jalan. Jalankan <b>npm start</b> di folder wa-bot-percetakan.
              </span>
            </motion.div>
          ) : status === "connected" ? (
            <motion.div
              key="connected"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <CheckCircle2 size={28} style={{ color: warna.sukses }} />
              <span style={{ fontSize: 12, color: warna.teksSekunder }}>Berhasil terhubung!</span>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              className="flex flex-col items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Loader2 size={28} className="animate-spin" style={{ color: warna.biru }} />
              <span style={{ fontSize: 12, color: warna.teksSekunder }}>{pesanStatus[status] || "Memuat..."}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
