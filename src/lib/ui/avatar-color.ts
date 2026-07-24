const COLORS = ["#e8432e", "#2f9e5b", "#3d6fb4", "#b4573d", "#7a5cc9"];

/** Cor determinística derivada do nome, usada nos avatares de iniciais. */
export function initialColor(name: string) {
  let h = 0;
  for (const c of name) h += c.charCodeAt(0);
  return COLORS[h % COLORS.length];
}
