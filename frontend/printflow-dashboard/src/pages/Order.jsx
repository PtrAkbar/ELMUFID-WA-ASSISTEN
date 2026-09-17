import { useState } from "react";
import { MessageCircle, Search, Trash2, Plus } from "lucide-react";
import { statusWarna } from "../styles/theme";
import { inisial } from "../utils/format";
import PillDropdown from "../molecules/PillDropdown";
import EmptyState from "../atoms/EmptyState";
import OrderFormModal from "../organisms/OrderFormModal";
import ConfirmModal from "../organisms/ConfirmModal";

function bukaWA(nomor, detail) {
  const pesan = encodeURIComponent(`Halo kak, mengenai order ${detail}`);
  window.open(`https://wa.me/${nomor}?text=${pesan}`, "_blank");
}

export default function Order({ orders, onUbahStatus, onTambahOrder, onHapusSemuaOrder }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [cariOrder, setCariOrder] = useState("");
  const [konfirmasiHapusSemua, setKonfirmasiHapusSemua] = useState(false);

  const orderAktif = orders.filter((o) => o.status !== "selesai");
  const orderTersaring = orderAktif.filter(
    (o) => o.nama.toLowerCase().includes(cariOrder.toLowerCase()) || (o.nomor || "").includes(cariOrder)
  );

  return (
    <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-2 border-b border-slate-100">
        <div>
          <p className="text-lg font-bold text-slate-900 tracking-tight">Daftar Order Aktif</p>
          <p className="text-sm text-slate-500 mt-0.5 font-medium">{orderAktif.length} order sedang berjalan atau belum diproses</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={16} strokeWidth={2} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              value={cariOrder}
              onChange={(e) => setCariOrder(e.target.value)}
              placeholder="Cari nama / nomor WA..."
              className="rounded-xl outline-none w-64 text-sm text-slate-800 placeholder-slate-400 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-slate-200 pl-10 pr-3.5 py-2.5 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} /> Order Baru
          </button>
          {orderAktif.length > 0 && (
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

      {orderTersaring.length === 0 ? (
        <EmptyState pesan={cariOrder ? "Order tidak ditemukan" : "Belum ada order aktif"} tinggi={220} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 font-bold">Customer</th>
                <th className="py-3.5 font-bold">Detail Order</th>
                <th className="py-3.5 font-bold">Tanggal Masuk</th>
                <th className="py-3.5 font-bold">Total</th>
                <th className="py-3.5 font-bold">Status</th>
                <th className="py-3.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orderTersaring.map((o) => (
                <tr
                  key={o.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-sm shrink-0">
                        {inisial(o.nama)}
                      </div>
                      <div>
                        <p className="text-sm md:text-[15px] font-bold text-slate-900">{o.nama}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{o.nomor || "-"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-slate-700 font-medium max-w-[280px]">{o.detail}</td>
                  <td className="py-4 text-sm text-slate-500 font-medium">{o.tanggal}</td>
                  <td className="py-4 text-sm md:text-[15px] font-bold text-blue-600">{o.totalFormatted}</td>
                  <td className="py-4">
                    <PillDropdown
                      value={o.status}
                      options={[
                        { value: "menunggu_bayar", label: "Menunggu pembayaran" },
                        { value: "belum", label: "Belum diproses" },
                        { value: "proses", label: "Sedang diproses" },
                        { value: "selesai", label: "Selesai" },
                      ]}
                      colorFor={(v) => statusWarna[v]}
                      onChange={(v) => onUbahStatus(o.id, v)}
                    />
                  </td>
                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => bukaWA(o.nomor, o.detail)}
                      className="inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs md:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 shadow-sm border border-slate-200 transition-all cursor-pointer"
                    >
                      <MessageCircle size={15} strokeWidth={2.2} className="text-emerald-600" />
                      <span>Chat WA</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <OrderFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={onTambahOrder} />

      <ConfirmModal
        open={konfirmasiHapusSemua}
        onClose={() => setKonfirmasiHapusSemua(false)}
        onConfirm={onHapusSemuaOrder}
        judul="Hapus semua order aktif?"
        pesan={`${orderAktif.length} order aktif akan dihapus permanen.`}
        labelKonfirmasi="Ya, hapus semua"
      />
    </div>
  );
}

