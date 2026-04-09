export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getTextColor(r: number, g: number, b: number): string {
  return getLuminance(r, g, b) > 0.35 ? '#000000' : '#ffffff';
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0)
          : max === g ? (b - r) / d + 2
          : (r - g) / d + 4;
  return { h: h / 6, s, l };
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hue2rgb = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  return [
    Math.round(hue2rgb(h + 1 / 3) * 255),
    Math.round(hue2rgb(h) * 255),
    Math.round(hue2rgb(h - 1 / 3) * 255),
  ];
}

// 명도만 보정 — 채도는 satWeightedCentroid가 이미 자연스럽게 결정했으므로 건드리지 않음
// 너무 어둡거나 밝은 색만 살짝 당겨 스와치에서 읽기 좋게
export function refineColor(r: number, g: number, b: number): [number, number, number] {
  const { h, s, l } = rgbToHsl(r, g, b);

  if (s < 0.10) return [r, g, b]; // 중립색은 그대로

  const targetL = l < 0.20 ? l + (0.30 - l) * 0.5   // 너무 어두우면 조금 밝게
                : l > 0.82 ? l - (l - 0.72) * 0.5   // 너무 밝으면 조금 어둡게
                : l;                                   // 그 외엔 유지

  if (Math.abs(targetL - l) < 0.01) return [r, g, b];
  return hslToRgb(h, s, targetL);
}
