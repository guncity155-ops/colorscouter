export interface Cluster {
  center: [number, number, number];
  pixelCount: number;
}

function distSq(a: [number, number, number], b: [number, number, number]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

function closestCenterIdx(pixel: [number, number, number], centers: [number, number, number][]): number {
  let min = Infinity, idx = 0;
  for (let i = 0; i < centers.length; i++) {
    const d = distSq(pixel, centers[i]);
    if (d < min) { min = d; idx = i; }
  }
  return idx;
}

function getHue(r: number, g: number, b: number): number {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0)
          : max === g ? (b - r) / d + 2
          : (r - g) / d + 4;
  return h / 6;
}

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

function bucketCentroid(pixels: [number, number, number][]): [number, number, number] {
  const n = pixels.length;
  if (n === 0) return [0, 0, 0];
  return [
    Math.round(pixels.reduce((s, p) => s + p[0], 0) / n),
    Math.round(pixels.reduce((s, p) => s + p[1], 0) / n),
    Math.round(pixels.reduce((s, p) => s + p[2], 0) / n),
  ];
}

// 색조 버킷 기반 초기화 + k-means++ 보충
function initCenters(pixels: [number, number, number][], k: number): [number, number, number][] {
  if (pixels.length === 0 || k <= 0) return [];
  if (pixels.length <= k) return pixels.map(p => [...p] as [number, number, number]);

  const HUE_BUCKETS = 36;
  const buckets: [number, number, number][][] = Array.from({ length: HUE_BUCKETS }, () => []);
  for (const p of pixels) {
    if (getSaturation(p[0], p[1], p[2]) < 0.25) continue;
    const bucket = Math.floor(getHue(p[0], p[1], p[2]) * HUE_BUCKETS) % HUE_BUCKETS;
    buckets[bucket].push(p);
  }

  const hueCenters = buckets
    .filter(b => b.length > 0)
    .sort((a, b) => b.length - a.length)
    .slice(0, k)
    .map(bucketCentroid);

  if (hueCenters.length >= k) return hueCenters;

  // 부족하면 k-means++로 채움
  const centers: [number, number, number][] = [...hueCenters];
  if (centers.length === 0) centers.push([...pixels[Math.floor(Math.random() * pixels.length)]] as [number, number, number]);

  while (centers.length < k) {
    const dists = pixels.map(p => distSq(p, centers[closestCenterIdx(p, centers)]));
    const total = dists.reduce((s, d) => s + d, 0);
    if (total === 0) {
      centers.push([...pixels[Math.floor(Math.random() * pixels.length)]] as [number, number, number]);
      continue;
    }
    let r = Math.random() * total;
    let chosen = pixels[pixels.length - 1];
    for (let i = 0; i < pixels.length; i++) {
      r -= dists[i];
      if (r <= 0) { chosen = pixels[i]; break; }
    }
    centers.push([...chosen] as [number, number, number]);
  }
  return centers;
}

export function kmeans(pixels: [number, number, number][], k: number): Cluster[] {
  if (pixels.length === 0 || k <= 0) return [];
  const effectiveK = Math.min(k, pixels.length);

  let centers = initCenters(pixels, effectiveK);
  const MAX_ITER = 20;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    const sums: [number, number, number][] = Array.from({ length: effectiveK }, () => [0, 0, 0]);
    const counts = new Array<number>(effectiveK).fill(0);

    for (const pixel of pixels) {
      const idx = closestCenterIdx(pixel, centers);
      sums[idx][0] += pixel[0];
      sums[idx][1] += pixel[1];
      sums[idx][2] += pixel[2];
      counts[idx]++;
    }

    let converged = true;
    const newCenters: [number, number, number][] = centers.map((c, i) => {
      if (counts[i] === 0) return c;
      const nc: [number, number, number] = [
        Math.round(sums[i][0] / counts[i]),
        Math.round(sums[i][1] / counts[i]),
        Math.round(sums[i][2] / counts[i]),
      ];
      if (distSq(c, nc) > 1) converged = false;
      return nc;
    });

    centers = newCenters;
    if (converged) break;
  }

  const counts = new Array<number>(effectiveK).fill(0);
  for (const pixel of pixels) counts[closestCenterIdx(pixel, centers)]++;

  return centers.map((center, i) => ({ center, pixelCount: counts[i] }));
}
