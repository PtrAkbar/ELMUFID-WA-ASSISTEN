import { useEffect, useState } from "react";
import { warna, gradien, bayangan } from "../styles/theme";
import Modal from "../molecules/Modal";

export default function EditHargaModal({ open, onClose, barang, onSubmit }) {
  const [harga, setHarga] = useState("");

  useEffect(() => {
    if (barang) setHarga(barang.harga);
  }, [barang]);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(barang.kode, harga);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <p style={{ fontSize: 16, fontWeight: 700, color: warna.teksUtama }} className="mb-1">Ubah harga</p>
      <p style={{ fontSize: 13, color: warna.teksSekunder }} className="mb-4">{barang?.nama}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label style={{ fontSize: 12, fontWeight: 600, color: warna.teksSekunder }}>Harga baru (Rp)</label>
          <input
            required
            type="number"
            min="0"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            className="w-full rounded-2xl outline-none mt-1"
            style={{ border: `1px solid ${warna.garis}`, background: warna.bgSekunder, color: warna.teksUtama, fontSize: 14, padding: "10px 14px" }}
          />
        </div>
        <button
          type="submit"
          className="w-full text-white rounded-full py-2.5 mt-1"
          style={{ background: gradien.aksenTombol, boxShadow: bayangan.glowKecil, fontSize: 14, fontWeight: 600, transition: "filter 0.2s ease" }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.12)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          Simpan
        </button>
      </form>
    </Modal>
  );
}
