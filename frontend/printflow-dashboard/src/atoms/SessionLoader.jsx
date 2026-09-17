export default function SessionLoader({ label = "Memeriksa sesi login..." }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-white text-[#1C1C1C]">
      <div className="w-8 h-8 rounded-full border-2 border-black/[0.08] border-t-[#1C1C1C] animate-spin" />
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  );
}

