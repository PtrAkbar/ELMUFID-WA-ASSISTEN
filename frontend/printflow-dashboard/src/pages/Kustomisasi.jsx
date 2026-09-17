import { useRef, useState } from "react";
import { Trash2, Upload, Image as ImageIcon, Plus } from "lucide-react";
import EmptyState from "../atoms/EmptyState";
import ConfirmModal from "../organisms/ConfirmModal";

export default function Kustomisasi({ qris, rekeningList, loading, onUploadQris, onHapusQris, onTambahRekening, onHapusRekening }) {
  const [namaBank, setNamaBank] = useState("");
  const [nomorRekening, setNomorRekening] = useState("");
  const [atasNama, setAtasNama] = useState("");
  const [menyimpanRekening, setMenyimpanRekening] = useState(false);
  const [mengupload, setMengupload] = useState(false);
  const [pesanError, setPesanError] = useState("");
  const [rekeningDihapus, setRekeningDihapus] = useState(null);
  const [konfirmasiHapusQris, setKonfirmasiHapusQris] = useState(false);
  const inputFileRef = useRef(null);

  async function handlePilihFileQris(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMengupload(true);
    setPesanError("");
    const { error } = await onUploadQris(file);
    setMengupload(false);
    if (error) setPesanError(error.message);
  }

  async function handleTambahRekening() {
    if (!namaBank.trim() || !nomorRekening.trim()) {
      setPesanError("Nama bank dan nomor rekening wajib diisi");
      return;
    }
    setMenyimpanRekening(true);
    setPesanError("");
    const { error } = await onTambahRekening({ namaBank, nomorRekening, atasNama });
    setMenyimpanRekening(false);
    if (error) {
      setPesanError(error.message);
      return;
    }
    setNamaBank("");
    setNomorRekening("");
    setAtasNama("");
  }

  return (
    <div className="flex flex-col gap-8">
      {/* QRIS Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
        <p className="text-lg font-bold text-slate-900 tracking-tight">QRIS Toko</p>
        <p className="text-sm text-slate-500 mt-0.5 mb-5 font-medium">
          Gambar ini otomatis dikirim bot ke customer yang memilih metode QRIS.
        </p>

        {loading ? (
          <EmptyState pesan="Memuat data..." tinggi={160} />
        ) : qris ? (
          <div className="flex items-start gap-5 flex-wrap">
            <img
              src={qris}
              alt="QRIS toko"
              className="rounded-2xl w-44 h-44 object-cover shadow-sm bg-white p-2 border border-slate-200/70"
            />
            <div className="flex flex-col gap-2.5">
              <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={handlePilihFileQris} />
              <button
                type="button"
                onClick={() => inputFileRef.current?.click()}
                disabled={mengupload}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
              >
                <Upload size={15} strokeWidth={2} />
                <span>{mengupload ? "Mengupload..." : "Ganti Gambar"}</span>
              </button>
              <button
                type="button"
                onClick={() => setKonfirmasiHapusQris(true)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 size={15} strokeWidth={2} />
                <span>Hapus QRIS</span>
              </button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={inputFileRef} type="file" accept="image/*" className="hidden" onChange={handlePilihFileQris} />
            <button
              type="button"
              onClick={() => inputFileRef.current?.click()}
              disabled={mengupload}
              className="flex flex-col items-center gap-3 rounded-2xl p-10 w-full justify-center bg-slate-50/60 border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <ImageIcon size={28} className="text-slate-400" />
              <span className="text-sm font-semibold text-slate-700">
                {mengupload ? "Mengupload..." : "Klik untuk upload gambar QRIS"}
              </span>
            </button>
          </div>
        )}

        {pesanError && <p className="text-sm text-rose-600 font-medium mt-3">{pesanError}</p>}
      </div>

      {/* Rekening Bank Card */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
        <p className="text-lg font-bold text-slate-900 tracking-tight">Rekening Bank Toko</p>
        <p className="text-sm text-slate-500 mt-0.5 mb-5 font-medium">
          Bot akan menawarkan rekening ini bila customer memilih transfer bank manual.
        </p>

        <div className="bg-slate-50/80 rounded-2xl p-5 mb-6 border border-slate-200/70 flex items-end gap-3.5 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Bank</label>
            <input
              value={namaBank}
              onChange={(e) => setNamaBank(e.target.value)}
              placeholder="BCA / Mandiri / BNI"
              className="w-full rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nomor Rekening</label>
            <input
              value={nomorRekening}
              onChange={(e) => setNomorRekening(e.target.value)}
              placeholder="1234567890"
              className="w-full rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Atas Nama (opsional)</label>
            <input
              value={atasNama}
              onChange={(e) => setAtasNama(e.target.value)}
              placeholder="EL-MUFID"
              className="w-full rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleTambahRekening}
            disabled={menyimpanRekening}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>{menyimpanRekening ? "Menyimpan..." : "Tambah Rekening"}</span>
          </button>
        </div>

        {loading ? (
          <EmptyState pesan="Memuat data..." tinggi={160} />
        ) : rekeningList.length === 0 ? (
          <EmptyState pesan="Belum ada rekening bank yang ditambahkan" tinggi={160} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 font-bold">Bank</th>
                  <th className="py-3.5 font-bold">Nomor Rekening</th>
                  <th className="py-3.5 font-bold">Atas Nama</th>
                  <th className="py-3.5 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rekeningList.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 text-sm font-bold text-slate-900">{r.nama_bank}</td>
                    <td className="py-4 text-sm font-mono text-blue-600 font-semibold">{r.nomor_rekening}</td>
                    <td className="py-4 text-sm text-slate-600 font-medium">{r.atas_nama || "-"}</td>
                    <td className="py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setRekeningDihapus(r)}
                        className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Hapus rekening"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={konfirmasiHapusQris}
        onClose={() => setKonfirmasiHapusQris(false)}
        onConfirm={onHapusQris}
        judul="Hapus gambar QRIS?"
        pesan="Bot tidak akan bisa menawarkan metode QRIS hingga gambar baru diunggah."
      />

      <ConfirmModal
        open={!!rekeningDihapus}
        onClose={() => setRekeningDihapus(null)}
        onConfirm={() => onHapusRekening(rekeningDihapus.id)}
        judul="Hapus rekening ini?"
        pesan={`Rekening ${rekeningDihapus?.nama_bank} (${rekeningDihapus?.nomor_rekening}) akan dihapus.`}
      />
    </div>
  );
}

