import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { warna } from "../styles/theme";
import ButtonLoading from "../loading/ButtonLoading";

export default function EmailForm({ onTerkirim }) {
  const [email, setEmail] = useState("");
  const [memproses, setMemproses] = useState(false);
  const [pesan, setPesan] = useState("");

  async function kirimOtp(e) {
    e.preventDefault();
    setMemproses(true);
    setPesan("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    setMemproses(false);
    if (error) {
      setPesan(error.message);
      return;
    }
    onTerkirim(email);
  }

  return (
    <form onSubmit={kirimOtp} className="flex flex-col gap-3">
      <div>
        <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          className="w-full rounded-2xl outline-none mt-1"
          style={{ border: `1px solid ${warna.garis}`, background: warna.bg, color: warna.teksUtama, fontSize: 14, padding: "10px 14px" }}
        />
      </div>

      {pesan && <p style={{ fontSize: 12, color: "#C0392B" }}>{pesan}</p>}

      <button
        type="submit"
        disabled={memproses}
        className="w-full text-white rounded-full py-2.5 flex items-center justify-center gap-2"
        style={{ background: warna.biru, fontSize: 14, fontWeight: 600 }}
      >
        {memproses ? <ButtonLoading /> : "Kirim kode OTP"}
      </button>
    </form>
  );
}
