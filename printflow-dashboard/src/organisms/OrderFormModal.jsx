import { useState } from "react";
import { warna, gradien, bayangan } from "../styles/theme";
import Modal from "../molecules/Modal";

export default function OrderFormModal({ open, onClose, onSubmit }) {
  const [nama, setNama] = useState("");
  const [nomor, setNomor] = useState("");
  const [detail, setDetail] = useState("");
  const [total, setTotal] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);
  const [pesan, setPesan] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMenyimpan(true);
    setPesan("");

    const { error } = await onSubmit({ nama, nomor, detail, total: Number(total) || 0 });

    setMenyimpan(false);
    if (error) {
      setPesan(error.message);
      return;
    }
    setNama("");
    setNomor("");
    setDetail("");
    setTotal("");
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <p style={{ fontSize: 16, fontWeight: 700, color: warna.teksUtama }} className="mb-4">Order baru</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Nama customer</label>
          <input
            required
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Rina Kartika"
            className="w-full rounded-2xl outline-none mt-1"
            style={{ border: `1px solid ${warna.garis}`, background: warna.bgSekunder, color: warna.teksUtama, fontSize: 14, padding: "10px 14px" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Nomor WA</label>
          <input
            required
            value={nomor}
            onChange={(e) => setNomor(e.target.value)}
            placeholder="62812xxxxxxx"
            className="w-full rounded-2xl outline-none mt-1"
            style={{ border: `1px solid ${warna.garis}`, background: warna.bgSekunder, color: warna.teksUtama, fontSize: 14, padding: "10px 14px" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Detail order</label>
          <input
            required
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Print A4 200 lembar, jilid spiral"
            className="w-full rounded-2xl outline-none mt-1"
            style={{ border: `1px solid ${warna.garis}`, background: warna.bgSekunder, color: warna.teksUtama, fontSize: 14, padding: "10px 14px" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Total (Rp)</label>
          <input
            required
            type="number"
            min="0"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="75000"
            className="w-full rounded-2xl outline-none mt-1"
            style={{ border: `1px solid ${warna.garis}`, background: warna.bgSekunder, color: warna.teksUtama, fontSize: 14, padding: "10px 14px" }}
          />
        </div>

        {pesan && <p style={{ fontSize: 12, color: warna.bahaya }}>{pesan}</p>}

        <button
          type="submit"
          disabled={menyimpan}
          className="w-full text-white rounded-full py-2.5 mt-1"
          style={{ background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, fontSize: 14, fontWeight: 600, opacity: menyimpan ? 0.6 : 1, transition: "filter 0.2s ease" }}
          onMouseEnter={(e) => !menyimpan && (e.currentTarget.style.filter = "brightness(1.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          {menyimpan ? "Menyimpan..." : "Simpan order"}
        </button>
      </form>
    </Modal>
  );
}
