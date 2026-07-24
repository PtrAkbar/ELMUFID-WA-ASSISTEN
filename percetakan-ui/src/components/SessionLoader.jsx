import { warna, gradien } from "../styles/theme";

export default function SessionLoader({ label = "Memeriksa sesi login" }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: gradien.latar }}>
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{ border: `3px solid ${warna.garis}`, borderTopColor: warna.biru }}
      />
      <p style={{ color: warna.teksSekunder, fontSize: 13, fontWeight: 500 }}>{label}</p>
    </div>
  );
}
