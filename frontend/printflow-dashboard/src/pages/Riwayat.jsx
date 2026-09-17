import { useMemo, useState } from "react";
import { Search, RotateCcw, Trash2, Download, MessageCircle } from "lucide-react";
import { bulanTahunKey, formatBulanTahun, formatJam, toISO } from "../utils/date";
import { formatRupiah, formatTanggal } from "../lib/orders";
import { unduhRekapExcel } from "../utils/exportExcel";
import EmptyState from "../atoms/EmptyState";
import ConfirmModal from "../organisms/ConfirmModal";

function bukaWA(nomor, detail) {
  const pesan = encodeURIComponent(`Halo kak, mengenai order ${detail}`);
  window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");
}

export default function Riwayat({ orders, onRestore, onHapusSemuaRiwayat }) {
  const [cariRiwayat, setCariRiwayat] = useState("");
  const [konfirmasiHapusSemua, setKonfirmasiHapusSemua] = useState(false);

  const selesai = orders.filter((o) => o.status === "selesai");
  const selesaiTersaring = selesai.filter((o) => o.nama.toLowerCase().includes(cariRiwayat.toLowerCase()));

  const kelompokBulan = useMemo(() => {
    const map = new Map();
    selesaiTersaring.forEach((o) => {
      const waktuSelesai = new Date(o.updatedAt);
      const key = bulanTahunKey(waktuSelesai);
      if (!map.has(key)) map.set(key, { key, label: formatBulanTahun(waktuSelesai), items: [] });
      map.get(key).items.push({
        ...o,
        waktuSelesai,
        tanggalSelesai: formatTanggal(o.updatedAt),
        jamSelesai: formatJam(waktuSelesai),
      });
    });
    return Array.from(map.values())
      .sort((a, b) => (a.key < b.key ? 1 : -1))
      .map((grup) => ({
        ...grup,
        items: grup.items.sort((a, b) => b.waktuSelesai - a.waktuSelesai),
        totalOmzet: grup.items.reduce((s, o) => s + o.total, 0),
      }));
  }, [selesaiTersaring]);

  function handleExport() {
    unduhRekapExcel(`riwayat-order-${toISO(new Date())}.xls`, kelompokBulan);
  }

  return (
    <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
        <div>
          <p className="text-lg font-bold text-slate-900 tracking-tight">Riwayat Order Selesai</p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">{selesai.length} pesanan telah tuntas</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} strokeWidth={2} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={cariRiwayat}
              onChange={(e) => setCariRiwayat(e.target.value)}
              placeholder="Cari nama customer..."
              className="rounded-xl outline-none w-64 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-slate-200 pl-10 pr-3.5 py-2.5 transition-all"
            />
          </div>
          {selesai.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleExport}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 transition-all cursor-pointer"
              >
                <Download size={15} strokeWidth={2} />
                <span>Export Excel</span>
              </button>
              <button
                type="button"
                onClick={() => setKonfirmasiHapusSemua(true)}
                className="flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <Trash2 size={15} strokeWidth={2} />
                <span>Hapus Semua</span>
              </button>
            </>
          )}
        </div>
      </div>

      {kelompokBulan.length === 0 ? (
        <EmptyState pesan={cariRiwayat ? "Riwayat tidak ditemukan" : "Belum ada order yang selesai"} tinggi={220} />
      ) : (
        kelompokBulan.map((grup) => (
          <div key={grup.key} className="mb-8">
            <div className="flex items-center justify-between mb-4 pt-4 border-t border-slate-100">
              <p className="text-base font-bold text-slate-900">{grup.label}</p>
              <span className="text-xs md:text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {grup.items.length} order &middot; {formatRupiah(grup.totalOmzet)}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 font-bold">Aktivitas</th>
                    <th className="py-3.5 font-bold">Order ID</th>
                    <th className="py-3.5 font-bold">Tanggal Selesai</th>
                    <th className="py-3.5 font-bold">Jam</th>
                    <th className="py-3.5 font-bold">Harga</th>
                    <th className="py-3.5 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grup.items.map((o) => (
                    <tr
                      key={o.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 text-sm font-bold text-slate-900">{o.detail}</td>
                      <td className="py-4 text-sm text-slate-500 font-mono font-medium">{o.kode}</td>
                      <td className="py-4 text-sm text-slate-600 font-medium">{o.tanggalSelesai}</td>
                      <td className="py-4 text-sm text-slate-500">{o.jamSelesai}</td>
                      <td className="py-4 text-sm md:text-[15px] font-bold text-emerald-600">{o.totalFormatted}</td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => bukaWA(o.nomor, o.detail)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 transition-all cursor-pointer"
                            title="Chat WA customer"
                          >
                            <MessageCircle size={14} strokeWidth={2.2} className="text-emerald-600" />
                            <span>WA</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onRestore(o.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs md:text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 shadow-sm transition-all cursor-pointer"
                            title="Kembalikan ke order aktif"
                          >
                            <RotateCcw size={14} strokeWidth={2.2} />
                            <span>Restore</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      <ConfirmModal
        open={konfirmasiHapusSemua}
        onClose={() => setKonfirmasiHapusSemua(false)}
        onConfirm={onHapusSemuaRiwayat}
        judul="Hapus semua riwayat?"
        pesan={`${selesai.length} order selesai akan dihapus permanen dari riwayat.`}
        labelKonfirmasi="Ya, hapus semua"
      />
    </div>
  );
}

