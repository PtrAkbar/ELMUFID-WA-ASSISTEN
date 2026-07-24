import { useLocation, Navigate } from "react-router-dom";
import { Zap } from "lucide-react";
import OtpForm from "../components/OtpForm";
import { warna } from "../styles/theme";

export default function VerifikasiOtp() {
  const location = useLocation();
  const email = location.state?.email;

  if (!email) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: warna.bg }}>
      <div className="w-full max-w-sm rounded-3xl p-7" style={{ background: warna.kartu, border: `1px solid ${warna.garis}` }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: warna.biru }}>
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: warna.teksUtama }}>Percetakan</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: warna.teksUtama }}>Verifikasi email</h1>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mt-1 mb-6">
          Masukkan 6 digit kode yang kami kirimkan
        </p>

        <OtpForm email={email} />
      </div>
    </div>
  );
}
