import { useNavigate, Link } from "react-router-dom";
import { Zap } from "lucide-react";
import GoogleButton from "../components/GoogleButton";
import EmailForm from "../components/EmailForm";
import { warna } from "../styles/theme";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: warna.bg }}>
      <div className="w-full max-w-sm rounded-3xl p-7" style={{ background: warna.kartu, border: `1px solid ${warna.garis}` }}>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: warna.biru }}>
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: warna.teksUtama }}>Percetakan</span>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: warna.teksUtama }}>Masuk admin</h1>
        <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mt-1 mb-6">
          Kelola order, stock, dan riwayat toko kamu
        </p>

        <GoogleButton />

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: warna.garis }} />
          <span style={{ fontSize: 11, color: warna.teksSekunder }}>atau</span>
          <div className="flex-1 h-px" style={{ background: warna.garis }} />
        </div>

        <EmailForm onTerkirim={(email) => navigate("/verifikasi-otp", { state: { email } })} />

        <p style={{ fontSize: 12, color: warna.teksSekunder }} className="mt-5 text-center">
          Belum punya akun?{" "}
          <Link to="/register" style={{ color: warna.biru, fontWeight: 600 }}>
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
}
