import { useRef, useState } from "react";
import { Search, Trash2, Pencil, Upload, Plus } from "lucide-react";
import PillDropdown from "../molecules/PillDropdown";
import EmptyState from "../atoms/EmptyState";
import ConfirmModal from "../organisms/ConfirmModal";
import EditHargaModal from "../organisms/EditHargaModal";

export default function Stock({
  stockItems,
  loading,
  cariStock,
  setCariStock,
  namaBaru,
  setNamaBaru,
  hargaBaru,
  setHargaBaru,
  onTambahBarang,
  menyimpanBarang,
  onUbahStockStatus,
  onUbahHarga,
  onHapusBarang,
  onHapusSemuaBarang,
  onImportBarang,
}) {
  const [barangDihapus, setBarangDihapus] = useState(null);
  const [barangDiedit, setBarangDiedit] = useState(null);
  const [konfirmasiHapusSemua, setKonfirmasiHapusSemua] = useState(false);
  const [mengimpor, setMengimpor] = useState(false);
  const inputFileRef = useRef(null);

  async function handlePilihFile(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setMengimpor(true);
    await onImportBarang(file);
    setMengimpor(false);
  }

  const stockTersaring = stockItems.filter(
    (s) => s.nama.toLowerCase().includes(cariStock.toLowerCase()) || s.kode.toLowerCase().includes(cariStock.toLowerCase())
  );

  return (
    <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
        <div>
          <p className="text-lg font-bold text-slate-900 tracking-tight">Daftar Stock Bahan &amp; Barang</p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">{stockItems.length} jenis item terdaftar</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} strokeWidth={2} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={cariStock}
              onChange={(e) => setCariStock(e.target.value)}
              placeholder="Cari kode atau nama..."
              className="rounded-xl outline-none w-64 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-slate-200 pl-10 pr-3.5 py-2.5 transition-all"
            />
          </div>
          <input
            ref={inputFileRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={handlePilihFile}
          />
          <button
            type="button"
            onClick={() => inputFileRef.current?.click()}
            disabled={mengimpor}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload size={15} strokeWidth={2} />
            <span>{mengimpor ? "Mengimpor..." : "Import Excel"}</span>
          </button>
          {stockItems.length > 0 && (
            <button
              type="button"
              onClick={() => setKonfirmasiHapusSemua(true)}
              className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Trash2 size={15} strokeWidth={2} /> Hapus Semua
            </button>
          )}
        </div>
      </div>

      {/* Inline Form Add Item */}
      <div className="bg-slate-50/80 rounded-2xl p-5 mb-7 border border-slate-200/70 flex items-end gap-3.5 flex-wrap">
        <div className="flex-1 min-w-[220px]">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nama Barang</label>
          <input
            value={namaBaru}
            onChange={(e) => setNamaBaru(e.target.value)}
            placeholder="Contoh: Kertas HVS 70gsm"
            className="w-full rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <div className="w-44">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Harga (Rp)</label>
          <input
            value={hargaBaru}
            onChange={(e) => setHargaBaru(e.target.value)}
            placeholder="300"
            className="w-full rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder-slate-400 px-4 py-2.5 mt-1.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>
        <button
          type="button"
          onClick={onTambahBarang}
          disabled={menyimpanBarang}
          className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{menyimpanBarang ? "Menyimpan..." : "Tambah Barang"}</span>
        </button>
      </div>

      {loading ? (
        <EmptyState pesan="Memuat data stock..." tinggi={200} />
      ) : stockTersaring.length === 0 ? (
        <EmptyState pesan={cariStock ? "Barang tidak ditemukan" : "Belum ada barang di stock"} tinggi={200} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 font-bold">Kode</th>
                <th className="py-3.5 font-bold">Nama Barang</th>
                <th className="py-3.5 font-bold">Harga Satuan</th>
                <th className="py-3.5 font-bold">Status Stock</th>
                <th className="py-3.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stockTersaring.map((s) => (
                <tr
                  key={s.kode}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 text-sm text-slate-500 font-mono font-medium">{s.kode}</td>
                  <td className="py-4 text-sm md:text-[15px] font-bold text-slate-900">{s.nama}</td>
                  <td className="py-4 text-sm md:text-[15px] font-bold text-slate-800">Rp{Number(s.harga).toLocaleString("id-ID")}</td>
                  <td className="py-4">
                    <PillDropdown
                      value={s.status}
                      options={[
                        { value: "masih", label: "Masih" },
                        { value: "habis", label: "Habis" },
                      ]}
                      colorFor={(v) => (v === "masih" ? "#059669" : "#E11D48")}
                      onChange={(v) => onUbahStockStatus(s.kode, v)}
                    />
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setBarangDiedit(s)}
                        className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-slate-600 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 transition-colors cursor-pointer"
                        title="Ubah harga"
                      >
                        <Pencil size={14} strokeWidth={2} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setBarangDihapus(s)}
                        className="w-8 h-8 rounded-xl inline-flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Hapus barang"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EditHargaModal
        open={!!barangDiedit}
        onClose={() => setBarangDiedit(null)}
        barang={barangDiedit}
        onSubmit={onUbahHarga}
      />

      <ConfirmModal
        open={!!barangDihapus}
        onClose={() => setBarangDihapus(null)}
        onConfirm={() => onHapusBarang(barangDihapus.kode)}
        judul="Hapus barang ini?"
        pesan={`"${barangDihapus?.nama}" akan dihapus permanen dari stock.`}
      />

      <ConfirmModal
        open={konfirmasiHapusSemua}
        onClose={() => setKonfirmasiHapusSemua(false)}
        onConfirm={onHapusSemuaBarang}
        judul="Hapus semua barang?"
        pesan={`${stockItems.length} barang akan dihapus permanen dari Sheet.`}
        labelKonfirmasi="Ya, hapus semua"
      />
    </div>
  );
}

