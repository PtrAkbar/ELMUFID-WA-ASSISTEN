import { warna, bayangan } from "../styles/theme";

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: warna.kartu, border: `1px solid ${warna.garis}`, borderRadius: 10, padding: "8px 12px", boxShadow: bayangan.dropdown }}>
      <p style={{ fontSize: 12, color: warna.teksSekunder, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 14, fontWeight: 700, color: warna.teksUtama, margin: 0 }}>{payload[0].value} order</p>
    </div>
  );
}
