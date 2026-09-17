import { useState } from "react";
import Modal from "../molecules/Modal";

export default function OrderFormModal({ open, onClose, onSubmit }) {
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [detail, setDetail] = useState("");
  const [total, setTotal] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMenyimpan(true);
    setPesan("");

    const { error } = await onSubmit({ nama, nomor, detail, total: Number(total) || 0 });

    setMenyimpan(false);
    if (error) {
      setPesan(error.message);
      return;
    }
    setNama("");
    setNomor("");
    setDetail("");
    setTotal("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} width={460}>
      <p className="text-lg font-bold text-slate-900 tracking-tight mb-1">Order Baru</p>
      <p className="text-sm text-slate-500 mb-5">Masukkan informasi pesanan baru pelanggan</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Customer</label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Rina Kartika"
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor WA Customer</label>
          <input
            required
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder="62812xxxxxxx"
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Detail Order</label>
          <input
            required
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Print A4 200 lembar, jilid spiral"
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Harga (Rp)</label>
          <input
            required
            type="number"
            min="0"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="75000"
            className="w-full rounded-xl bg-slate-50/80 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>

        {pesan && <p className="text-xs text-rose-600 font-medium">{pesan}</p>}

        <button
          type="submit"
          disabled={menyimpan}
          className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-xl py-3 mt-2 text-sm font-semibold transition-all cursor-pointer shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {menyimpan ? "Menyimpan..." : "Simpan Order"}
        </button>
      </form>
    </Modal>
  );
}

