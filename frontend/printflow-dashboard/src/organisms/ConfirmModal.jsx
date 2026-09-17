import { AlertTriangle } from "lucide-react";
import Modal from "../molecules/Modal";

export default function ConfirmModal({ open, onClose, onConfirm, judul, pesan, labelKonfirmasi = "Ya, hapus" }) {
  return (
    <Modal open={open} onClose={onClose} width={400}>
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-rose-50 text-rose-600 shadow-sm border border-rose-100">
          <AlertTriangle size={26} strokeWidth={2.2} />
        </div>
        <p className="text-lg font-bold text-slate-900 tracking-tight">{judul}</p>
        <p className="text-sm text-slate-500 mt-1.5 mb-6 leading-relaxed">{pesan}</p>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer shadow-md shadow-rose-500/20"
          >
            {labelKonfirmasi}
          </button>
        </div>
      </div>
    </Modal>
  );
}

