import { useNavigate, Link } from "react-router-dom";
import { Zap } from "lucide-react";
import EmailForm from "../molecules/EmailForm";
import { warna } from "../styles/theme";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: warna.bg }}>
      <div className="w-full max-w-sm rounded-3xl p-7" style={{ background: warna.kartu, border: `1px solid ${warna.garis}` }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: warna.biru }}>
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: warna.teksUtama }}>PrintFlow</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: warna.teksUtama }}>Daftar admin</h1>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mt-1 mb-6">
          Masukkan email, kami kirimkan kode OTP untuk verifikasi
        </p>

        <EmailForm onTerkirim={(email) => navigate("/verifikasi-otp", { state: { email } })} />

        <p style={{ fontSize: 12, color: warna.teksSekunder }} className="mt-5 text-center">
          Sudah punya akun?{" "}
          <Link to="/login" style={{ color: warna.biru, fontWeight: 600 }}>
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
