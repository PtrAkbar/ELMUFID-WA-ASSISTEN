export default function ButtonLoading({ size = 16 }) {
  return (
    <span
      className="inline-block rounded-full animate-spin"
      style={{
        width: size,
        height: size,
        border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "white",
      }}
    />
  );
}
