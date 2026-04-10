import { rgbToHex, rgbToHsl, refineColor } from './colorUtils';
import type { ColorData } from '../types';

const MAX_SIZE = 200;
const SAT_THRESHOLD = 0.20;  // 낮춰서 탁한 초록/노랑도 포함
const HUE_BINS = 72;          // 5° 단위 → 노랑(55°)과 갈색(30°)을 분리 가능
const NMS_RADIUS = 2;           // 선택된 피크 주변 ±2빈(±10°) 억제 — 4이면 피부톤이 노랑(60°)까지 억제
const CENTROID_RADIUS = 3;      // 피크 centroid 계산 범위 ±3빈(±15°)
const MIN_PEAK_RATIO = 0.015;   // 전체 vivid 픽셀의 최소 1.5% 이상이어야 피크로 인정

function getSaturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  return max === 0 ? 0 : (max - Math.min(r, g, b)) / max;
}

function getHueBin(r: number, g: number, b: number): number {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max === min) return -1; // 무채색 → 색조 없음
  const d = max - min;
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0)
        : max === g ? (b - r) / d + 2
        : (r - g) / d + 4;
  return Math.floor((h / 6) * HUE_BINS) % HUE_BINS;
}

function centroidOf(pixels: [number, number, number][]): [number, number, number] {
  const n = pixels.length;
  return [
    Math.round(pixels.reduce((s, p) => s + p[0], 0) / n),
    Math.round(pixels.reduce((s, p) => s + p[1], 0) / n),
    Math.round(pixels.reduce((s, p) => s + p[2], 0) / n),
  ];
}

// 채도² 가중 centroid: 선명한 픽셀이 대표색을 결정
// → 같은 노랑 계열이라도 드레스처럼 채도 높은 픽셀이 결과를 이끌어냄
function satWeightedCentroid(pixels: [number, number, number][]): [number, number, number] {
  let rSum = 0, gSum = 0, bSum = 0, totalW = 0;
  for (const p of pixels) {
    const sat = getSaturation(p[0], p[1], p[2]);
    const w = sat * sat; // 채도 낮은 픽셀 영향 최소화
    rSum += p[0] * w;
    gSum += p[1] * w;
    bSum += p[2] * w;
    totalW += w;
  }
  if (totalW < 0.001) return centroidOf(pixels); // 전부 무채색이면 단순 평균
  return [Math.round(rSum / totalW), Math.round(gSum / totalW), Math.round(bSum / totalW)];
}

function closestIdx(pixel: [number, number, number], centers: [number, number, number][]): number {
  let min = Infinity, idx = 0;
  for (let i = 0; i < centers.length; i++) {
    const d = (pixel[0] - centers[i][0]) ** 2 + (pixel[1] - centers[i][1]) ** 2 + (pixel[2] - centers[i][2]) ** 2;
    if (d < min) { min = d; idx = i; }
  }
  return idx;
}

// ── Phase 1: 색조 히스토그램 NMS 피크 감지 ────────────────────

function findKeyColorCenters(
  pixels: [number, number, number][],
  maxColors: number,
): [number, number, number][] {
  // 1) vivid 픽셀 → 72개 색조 버킷에 분류
  const bins: { pixels: [number, number, number][]; satSum: number }[] =
    Array.from({ length: HUE_BINS }, () => ({ pixels: [], satSum: 0 }));

  for (const p of pixels) {
    const sat = getSaturation(p[0], p[1], p[2]);
    if (sat < SAT_THRESHOLD) continue;
    const bin = getHueBin(p[0], p[1], p[2]);
    if (bin < 0) continue;
    bins[bin].pixels.push(p);
    bins[bin].satSum += sat;
  }

  // 2) 각 버킷 점수: 픽셀 수 × 평균 채도
  const scores = bins.map((b, i) => ({
    bin: i,
    score: b.pixels.length === 0 ? 0 : b.pixels.length * (b.satSum / b.pixels.length),
    pixelCount: b.pixels.length,
  }));

  // 3) NMS: 점수 내림차순으로 순회하며 이미 선택된 피크 ±NMS_RADIUS 안이면 skip
  const totalVivid = scores.reduce((sum, b) => sum + b.pixelCount, 0);
  const minPeakPixels = Math.max(10, totalVivid * MIN_PEAK_RATIO);

  const sortedBins = [...scores].sort((a, b) => b.score - a.score);
  const suppressed = new Set<number>();
  const selectedBins: number[] = [];

  for (const s of sortedBins) {
    if (selectedBins.length >= maxColors) break;
    if (suppressed.has(s.bin)) continue;
    if (s.pixelCount < minPeakPixels) continue;

    selectedBins.push(s.bin);

    // 주변 빈 억제
    for (let d = -NMS_RADIUS; d <= NMS_RADIUS; d++) {
      suppressed.add((s.bin + d + HUE_BINS) % HUE_BINS);
    }
  }

  // 4) 각 피크의 대표색: ±CENTROID_RADIUS 범위 픽셀의 centroid
  return selectedBins.map(bin => {
    const pool: [number, number, number][] = [];
    for (let d = -CENTROID_RADIUS; d <= CENTROID_RADIUS; d++) {
      pool.push(...bins[(bin + d + HUE_BINS) % HUE_BINS].pixels);
    }
    return pool.length > 0 ? satWeightedCentroid(pool) : bins[bin].pixels[0];
  });
}

// ── Phase 2: 전체 픽셀 분류 → 비중 계산 ─────────────────────

export async function analyzeImage(source: File | Blob, colorCount: number): Promise<ColorData[]> {
  const bitmap = await createImageBitmap(source);

  const scale = Math.min(MAX_SIZE / bitmap.width, MAX_SIZE / bitmap.height, 1);
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = new OffscreenCanvas(w, h);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const { data } = ctx.getImageData(0, 0, w, h);
  const pixels: [number, number, number][] = [];
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length === 0) return [];

  // vivid 키 컬러 추출 (최대 colorCount-1개)
  const vividCenters = findKeyColorCenters(pixels, colorCount - 1);

  // 중립 색 대표 1개: 채도 낮은 픽셀의 centroid
  const neutralPixels = pixels.filter(p => getSaturation(p[0], p[1], p[2]) < SAT_THRESHOLD);
  const centers: [number, number, number][] = [...vividCenters];
  if (neutralPixels.length > pixels.length * 0.03) {
    centers.push(centroidOf(neutralPixels));
  }

  // 그래도 부족하면 나머지 neutral에서 추가 분할
  while (centers.length < colorCount && neutralPixels.length > centers.length * 2) {
    const step = Math.floor(neutralPixels.length / (centers.length + 1));
    centers.push(neutralPixels[step * centers.length]);
  }

  if (centers.length === 0) return [];

  // 모든 픽셀을 가장 가까운 센터에 배분
  const k = Math.min(centers.length, colorCount);
  const usedCenters = centers.slice(0, k);
  const counts = new Array<number>(k).fill(0);
  for (const p of pixels) counts[closestIdx(p, usedCenters)]++;
  const total = pixels.length;

  return usedCenters
    .map((c, i) => {
      const [r, g, b] = refineColor(c[0], c[1], c[2]);
      return {
        hex: rgbToHex(r, g, b),
        rgb: { r, g, b },
        ratio: Math.round((counts[i] / total) * 100),
      };
    })
    .filter(c => c.ratio > 0)
    .sort((a, b) => {
      const { s: sa } = rgbToHsl(a.rgb.r, a.rgb.g, a.rgb.b);
      const { s: sb } = rgbToHsl(b.rgb.r, b.rgb.g, b.rgb.b);
      // 채도 × 2 + 비중으로 정렬 (채도 우선)
      return (sb * 2 + b.ratio / 100) - (sa * 2 + a.ratio / 100);
    });
}
