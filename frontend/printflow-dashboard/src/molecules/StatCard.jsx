import { warna, gradien, bayangan } from "../styles/theme";

export default function StatCard({ icon, label, value, note }) {
  return (
    <div className="kartu-hover rounded-3xl p-4" style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, boxShadow: bayangan.kartu }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4" style={{ background: gradien.aksenIkon, boxShadow: bayangan.glow }}>
        {icon}
      </div>
      <p style={{ fontSize: 14, fontWeight: 400, color: "#94A3B8" }}>{label}</p>
      <p style={{ fontSize: 42, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.1 }} className="mt-1">{value}</p>
      <p style={{ fontSize: 13, fontWeight: 400, color: "#94A3B8" }} className="mt-1">{note}</p>
    </div>
  );
}
