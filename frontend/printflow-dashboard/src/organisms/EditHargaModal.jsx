import { useEffect, useState } from "react";
import Modal from "../molecules/Modal";

export default function EditHargaModal({ open, onClose, barang, onSubmit }) {
  const [harga, setHarga] = useState("");

  useEffect(() => {
    if (barang) setHarga(barang.harga);
  }, [barang]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(barang.kode, harga);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width={400}>
      <p className="text-lg font-bold text-slate-900 tracking-tight mb-1">Ubah Harga</p>
      <p className="text-sm text-slate-500 mb-5 font-medium">{barang?.nama}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Harga Baru (Rp)</label>
          <input
            required
            type="number"
            min="0"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-xl py-3 mt-2 text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/20"
        >
          Simpan Perubahan
        </button>
      </form>
    </Modal>
  );
}

