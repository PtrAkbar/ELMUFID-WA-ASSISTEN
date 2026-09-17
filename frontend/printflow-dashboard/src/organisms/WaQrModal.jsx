import { AnimatePresence, motion } from "framer-motion";
import { Loader2, WifiOff, CheckCircle2, X } from "lucide-react";
import Modal from "../molecules/Modal";

const pesanStatus = {
  "connecting-server": "Menghubungkan ke server bot...",
  offline: "Server bot WhatsApp tidak aktif",
  connecting: "Menyiapkan koneksi WhatsApp...",
  disconnected: "Koneksi terputus, mencoba lagi...",
  connected: "Berhasil terhubung!",
};

export default function WaQrModal({ open, onClose, status, qr }) {
  return (
    <Modal open={open} onClose={onClose} width={440}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-lg font-bold text-slate-900 tracking-tight">Hubungkan WhatsApp</p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">
            Scan QR code dengan WhatsApp di HP toko Anda
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex items-center justify-center rounded-2xl my-5 bg-slate-50 border border-slate-100" style={{ height: 270 }}>
        <AnimatePresence mode="wait">
          {status === "qr" && qr ? (
            <motion.div
              key="qr"
              className="flex flex-col items-center gap-3.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <div className="rounded-2xl overflow-hidden p-2.5 bg-white shadow-sm border border-slate-200" style={{ width: 200, height: 200 }}>
                <img src={qr} alt="QR WhatsApp" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-semibold text-slate-600">Kode QR siap discan</span>
            </motion.div>
          ) : status === "offline" ? (
            <motion.div
              key="offline"
              className="flex flex-col items-center gap-2.5 px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <WifiOff size={32} className="text-slate-400" />
              <span className="text-sm text-slate-500 leading-relaxed font-medium">
                Server bot belum berjalan. Pastikan <b>npm run dev</b> aktif.
              </span>
            </motion.div>
          ) : status === "connected" ? (
            <motion.div
              key="connected"
              className="flex flex-col items-center gap-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <CheckCircle2 size={36} className="text-emerald-500" />
              <span className="text-sm font-bold text-emerald-600">Berhasil terhubung!</span>
            </motion.div>
          ) : (
            <motion.div
              key="loading"
              className="flex flex-col items-center gap-2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <Loader2 size={28} className="animate-spin text-blue-600" />
              <span className="text-sm text-slate-500 font-medium">{pesanStatus[status] || "Memuat..."}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-400 text-center leading-relaxed font-medium">
        Buka WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat
      </p>
    </Modal>
  );
}

