import { useMemo, useState } from "react";
import {
  ListChecks,
  AlertCircle,
  Clock,
  Check,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { statusWarna } from "../styles/theme";
import { addDays, startOfDay, formatTgl, isSameDay } from "../utils/date";
import StatCard from "../molecules/StatCard";
import LegendRow from "../molecules/LegendRow";
import ChartTooltip from "../atoms/ChartTooltip";
import StatusPill from "../atoms/StatusPill";
import EmptyState from "../atoms/EmptyState";
import DateRangeDropdown from "../molecules/DateRangeDropdown";

const warnaGaris = "rgba(0, 0, 0, 0.05)";
const warnaGarisChart = "#2563EB";

export default function Dashboard({ orders, totalOrder, totalBelum, totalProses, totalSelesai, onLihatSemua }) {
  const [rangeAwal, setRangeAwal] = useState(startOfDay(addDays(new Date(), -29)));
  const [rangeAkhir, setRangeAkhir] = useState(startOfDay(new Date()));
  const [labelRange, setLabelRange] = useState("30 hari terakhir");

  const orderTerbaru = orders.slice(0, 5);
  const donutData = [
    { name: "Belum", value: totalBelum, color: "#D97706" },
    { name: "Diproses", value: totalProses, color: "#2563EB" },
    { name: "Selesai", value: totalSelesai, color: "#059669" },
  ];
  const persenSelesai = totalOrder ? Math.round((totalSelesai / totalOrder) * 100) : 0;

  const dataChart = useMemo(() => {
    const hasil = [];
    let cursor = new Date(rangeAwal);
    while (cursor <= rangeAkhir) {
      const jumlah = orders.filter((o) => isSameDay(o.tanggalObj, cursor)).length;
      hasil.push({ tgl: formatTgl(cursor), order: jumlah });
      cursor = addDays(cursor, 1);
    }
    return hasil;
  }, [orders, rangeAwal, rangeAkhir]);
  const intervalTick = Math.max(0, Math.ceil(dataChart.length / 8) - 1);
  const adaOrderDiRentang = dataChart.some((d) => d.order > 0);

  function terapkanRange(awal, akhir, label) {
    setRangeAwal(awal);
    setRangeAkhir(akhir);
    setLabelRange(label);
  }

  return (
    <>
      {/* 4 StatCards with vibrant, friendly colors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          label="Total Semua Order"
          value={totalOrder}
          note={
            <span className="text-blue-700 flex items-center gap-1.5 font-bold">
              <TrendingUp size={15} strokeWidth={2.5} /> Total order terdata
            </span>
          }
          bg="#EFF6FF"
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          icon={<ListChecks size={20} strokeWidth={2.2} />}
        />
        <StatCard
          label="Belum Diproses"
          value={totalBelum}
          note={
            totalBelum > 0 ? (
              <span className="text-amber-700 flex items-center gap-1.5 font-bold">
                <AlertCircle size={15} strokeWidth={2.5} /> Perlu tindakan
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Semua tertangani</span>
            )
          }
          bg="#FFFBEB"
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          icon={<AlertCircle size={20} strokeWidth={2.2} />}
        />
        <StatCard
          label="Sedang Diproses"
          value={totalProses}
          note={
            totalProses > 0 ? (
              <span className="text-indigo-700 flex items-center gap-1.5 font-bold">
                <Clock size={15} strokeWidth={2.5} /> Dalam proses cetak
              </span>
            ) : (
              <span className="text-slate-500 font-medium">Tidak ada antrean</span>
            )
          }
          bg="#EEF2FF"
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
          icon={<Clock size={20} strokeWidth={2.2} />}
        />
        <StatCard
          label="Order Selesai"
          value={totalSelesai}
          note={
            <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
              <Sparkles size={15} strokeWidth={2.5} /> {persenSelesai}% selesai
            </span>
          }
          bg="#ECFDF5"
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          icon={<Check size={20} strokeWidth={2.5} />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Main Line Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <p className="text-lg font-bold text-slate-900 tracking-tight">Tren Order Masuk</p>
              <p className="text-sm text-slate-500 mt-0.5 font-medium">Visualisasi transaksi harian &middot; {labelRange}</p>
            </div>
            <DateRangeDropdown awal={rangeAwal} akhir={rangeAkhir} label={labelRange} onTerapkan={terapkanRange} />
          </div>
          <div className="h-72">
            {!adaOrderDiRentang ? (
              <EmptyState pesan="Belum ada transaksi order pada rentang tanggal ini" tinggi={288} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <defs>
                    <linearGradient id="gradGaris" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={warnaGarisChart} stopOpacity={0.18} />
                      <stop offset="100%" stopColor={warnaGarisChart} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={warnaGaris} strokeDasharray="3 3" />
                  <XAxis dataKey="tgl" tick={{ fontSize: 12, fill: "#64748B", fontWeight: 500 }} axisLine={false} tickLine={false} interval={intervalTick} />
                  <YAxis tick={{ fontSize: 12, fill: "#64748B", fontWeight: 500 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="order" stroke="none" fill="url(#gradGaris)" />
                  <Line
                    type="monotone"
                    dataKey="order"
                    stroke={warnaGarisChart}
                    strokeWidth={3}
                    dot={{ r: 3, fill: "#2563EB" }}
                    activeDot={{ r: 6, fill: "#2563EB", stroke: "#FFFFFF", strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Status Summary Donut */}
        <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-lg font-bold text-slate-900 tracking-tight">Status Pesanan</p>
              <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">Bulan Berjalan</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          {totalOrder === 0 ? (
            <EmptyState pesan="Belum ada order masuk" tinggi={200} />
          ) : (
            <>
              <div className="relative h-48 flex items-center justify-center my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={60} outerRadius={82} paddingAngle={4}>
                      {donutData.map((d, i) => (
                        <Cell key={i} fill={d.color} stroke="none" />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl font-extrabold text-slate-900 leading-none">{persenSelesai}%</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Selesai</p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                <LegendRow color="#D97706" label="Belum Diproses" value={totalBelum} />
                <LegendRow color="#2563EB" label="Sedang Diproses" value={totalProses} />
                <LegendRow color="#059669" label="Selesai Siap Ambil" value={totalSelesai} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl p-7 border border-slate-200/70 shadow-sm">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100">
          <div>
            <p className="text-lg font-bold text-slate-900 tracking-tight">Order Terbaru</p>
            <p className="text-sm text-slate-500 mt-0.5 font-medium">5 transaksi pesanan paling mutakhir</p>
          </div>
          <button
            onClick={onLihatSemua}
            className="rounded-xl px-4 py-2 text-xs md:text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all cursor-pointer shadow-sm"
          >
            Lihat Semua Order &rarr;
          </button>
        </div>

        {orderTerbaru.length === 0 ? (
          <EmptyState pesan="Belum ada order masuk" tinggi={180} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 font-bold">Detail Pesanan</th>
                  <th className="py-3.5 font-bold">Order ID</th>
                  <th className="py-3.5 font-bold">Tanggal</th>
                  <th className="py-3.5 font-bold">Total Harga</th>
                  <th className="py-3.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orderTerbaru.map((o) => (
                  <tr
                    key={o.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-4 text-sm font-bold text-slate-900">{o.detail}</td>
                    <td className="py-4 text-sm font-mono text-slate-500">{o.kode}</td>
                    <td className="py-4 text-sm text-slate-600 font-medium">{o.tanggal}</td>
                    <td className="py-4 text-sm font-bold text-blue-600">{o.totalFormatted}</td>
                    <td className="py-4">
                      <StatusPill status={o.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}


