import { warna } from "../styles/theme";

export default function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="rounded-full" style={{ width: 10, height: 10, background: color }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: warna.teksSekunder }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
