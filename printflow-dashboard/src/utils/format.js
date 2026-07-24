export function inisial(nama) {
  return nama.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}
