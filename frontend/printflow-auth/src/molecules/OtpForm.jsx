import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { warna } from "../styles/theme";
import ButtonLoading from "../atoms/ButtonLoading";

export default function OtpForm({ email }) {
  const [kode, setKode] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [pesan, setPesan] = useState("");
  const navigate = useNavigate();

  async function verifikasi(e) {
    e.preventDefault();
    setMemproses(true);
    setPesan("");

    const { error } = await supabase.auth.verifyOtp({ email, token: kode, type: "email" });

    setMemproses(false);
    if (error) {
      setPesan("Kode salah atau sudah kedaluwarsa");
      return;
    }
    navigate("/dashboard");
  }

  return (
    <form onSubmit={verifikasi} className="flex flex-col gap-3">
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>
          Kode OTP dikirim ke {email}
        </label>
        <input
          type="text"
          required
          maxLength={6}
          value={kode}
          onChange={(e) => setKode(e.target.value)}
          placeholder="123456"
          className="w-full rounded-2xl outline-none mt-1 text-center tracking-[0.5em]"
          style={{ border: `1px solid ${warna.garis}`, background: warna.bg, color: warna.teksUtama, fontSize: 18, fontWeight: 700, padding: "10px 14px" }}
        />
      </div>

      {pesan && <p style={{ fontSize: 12, color: "#C0392B" }}>{pesan}</p>}

      <button
        type="submit"
        disabled={memproses}
        className="w-full text-white rounded-full py-2.5 flex items-center justify-center gap-2"
        style={{ background: warna.biru, fontSize: 14, fontWeight: 600 }}
      >
        {memproses ? <ButtonLoading /> : "Verifikasi & masuk"}
      </button>
    </form>
  );
}
