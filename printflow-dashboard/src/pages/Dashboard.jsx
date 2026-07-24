import { useMemo, useState } from "react";
import {
  ListChecks,
  AlertCircle,
  Clock,
  Check,
  MoreVertical,
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
import { warna, gradien, bayangan } from "../styles/theme";
import { addDays, startOfDay, formatTgl, isSameDay } from "../utils/date";
import StatCard from "../components/StatCard";
import LegendRow from "../components/LegendRow";
import ChartTooltip from "../components/ChartTooltip";
import StatusPill from "../components/StatusPill";
import EmptyState from "../components/EmptyState";
import DateRangeDropdown from "../components/DateRangeDropdown";

const warnaGaris = "rgba(255,255,255,0.04)";
const warnaGarisChart = "#6D84FF";

export default function Dashboard({ orders, totalOrder, totalBelum, totalProses, totalSelesai, onLihatSemua }) {
  const [rangeAwal, setRangeAwal] = useState(startOfDay(addDays(new Date(), -29)));
  const [rangeAkhir, setRangeAkhir] = useState(startOfDay(new Date()));
  const [labelRange, setLabelRange] = useState("30 hari terakhir");

  const orderTerbaru = orders.slice(0, 5);
  const donutData = [
    { name: "Belum", value: totalBelum, color: warna.biru },
    { name: "Diproses", value: totalProses, color: warna.sedang },
    { name: "Selesai", value: totalSelesai, color: warna.sukses },
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
      <div className="grid grid-cols-4 gap-4 mb-5">
        <StatCard icon={<ListChecks size={18} strokeWidth={2.4} className="text-white" />} label="Total order" value={totalOrder} note={`${totalOrder} order bulan ini`} />
        <StatCard icon={<AlertCircle size={18} strokeWidth={2.4} className="text-white" />} label="Belum diproses" value={totalBelum} note="perlu segera dicek" />
        <StatCard icon={<Clock size={18} strokeWidth={2.4} className="text-white" />} label="Sedang diproses" value={totalProses} note="sedang dikerjakan" />
        <StatCard icon={<Check size={18} strokeWidth={2.4} className="text-white" />} label="Selesai" value={totalSelesai} note="siap diambil" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="col-span-2 kartu-hover rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }}>Order masuk, {labelRange}</p>
            <DateRangeDropdown awal={rangeAwal} akhir={rangeAkhir} label={labelRange} onTerapkan={terapkanRange} />
          </div>
          <div className="h-64">
            {!adaOrderDiRentang ? (
              <EmptyState pesan="Belum ada order masuk" tinggi={256} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dataChart}>
                  <defs>
                    <linearGradient id="gradGaris" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={warnaGarisChart} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={warnaGarisChart} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={warnaGaris} />
                  <XAxis dataKey="tgl" tick={{ fontSize: 12, fill: warna.teksTersier }} axisLine={false} tickLine={false} interval={intervalTick} />
                  <YAxis tick={{ fontSize: 12, fill: warna.teksTersier }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="order" stroke="none" fill="url(#gradGaris)" />
                  <Line type="monotone" dataKey="order" stroke={warnaGarisChart} strokeWidth={3} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="kartu-hover rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
          <div className="flex items-center justify-between mb-4">
            <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }}>Ringkasan status</p>
            <MoreVertical size={16} style={{ color: warna.teksSekunder }} />
          </div>
          {totalOrder === 0 ? (
            <EmptyState pesan="Belum ada order" tinggi={160} />
          ) : (
            <>
              <div className="relative h-40 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={3}>
                      {donutData.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p style={{ fontSize: 24, fontWeight: 700, color: warna.teksUtama }}>{persenSelesai}%</p>
                  <p style={{ fontSize: 12, fontWeight: 500, color: warna.teksSekunder }}>Selesai</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                <LegendRow color={warna.biru} label="Belum" value={totalBelum} />
                <LegendRow color={warna.sedang} label="Diproses" value={totalProses} />
                <LegendRow color={warna.sukses} label="Selesai" value={totalSelesai} />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="kartu-hover rounded-3xl p-5" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
        <div className="flex items-center justify-between mb-4">
          <p style={{ fontSize: 16, fontWeight: 600, color: "#E5E7EB" }}>Order terbaru</p>
          <button
            onClick={onLihatSemua}
            className="rounded-full px-3 py-1.5"
            style={{ fontSize: 12, fontWeight: 600, color: warna.muda, transition: "background 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = warna.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            Lihat semua
          </button>
        </div>
        {orderTerbaru.length === 0 ? (
          <EmptyState pesan="Belum ada order masuk" tinggi={160} />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ textAlign: "left", color: warna.teksSekunder, borderBottom: `1px solid ${warna.garis}` }}>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Aktivitas</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Order ID</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Tanggal</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Harga</th>
                <th style={{ fontSize: 12, fontWeight: 600, padding: "8px 0" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orderTerbaru.map((o) => (
                <tr
                  key={o.id}
                  style={{ borderBottom: `1px solid ${warna.divider}`, transition: "background 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ fontSize: 14, fontWeight: 700, padding: "12px 0", color: warna.teksUtama }}>{o.detail}</td>
                  <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.kode}</td>
                  <td style={{ fontSize: 14, fontWeight: 400, color: warna.teksSekunder, padding: "12px 0" }}>{o.tanggal}</td>
                  <td style={{ fontSize: 14, fontWeight: 600, padding: "12px 0", color: warna.teksUtama }}>{o.totalFormatted}</td>
                  <td style={{ padding: "12px 0" }}>
                    <StatusPill status={o.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
