import { Phone, LogOut, CheckCircle2, X } from "lucide-react";
import Modal from "../molecules/Modal";

export default function WaProfileModal({ open, onClose, nomor, onLogout }) {
  return (
    <Modal open={open} onClose={onClose} width={400}>
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
          <Phone size={24} />
        </div>
        <p className="text-lg font-bold text-slate-900 tracking-tight">WhatsApp Terhubung</p>
        <p className="text-sm text-slate-500 font-mono mt-1 font-semibold">{nomor}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full mt-3 px-3.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100">
          <CheckCircle2 size={14} /> Aktif &amp; Siap Menerima Order
        </span>
      </div>
      <button
        type="button"
        onClick={onLogout}
        className="w-full rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
      >
        <LogOut size={16} /> Putuskan koneksi WhatsApp
      </button>
    </Modal>
  );
}

