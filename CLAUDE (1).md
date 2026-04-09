# ColorScouter

## 프로젝트 개요

이미지를 업로드하면 주요 색상과 각 색상의 면적 비중(%)을 시각적으로 보여주는 정적 웹 유틸리티 사이트.
영화 포스터, 썸네일, 브랜드 이미지 분석 등에 활용 가능.

**사이트 이름**: ColorScouter
**부제목 (한국어)**: 이미지 속 색의 비중을 분석합니다
**부제목 (영어)**: Analyze the color composition of any image

**타겟 키워드**: 이미지 색상 분석, 사진 색 비중, 영화 색감 분석, 이미지 팔레트 추출

---

## 기술 스택

- **React + TypeScript + Vite**
- **Tailwind CSS** (스타일링)
- 외부 라이브러리 없음 — 순수 Canvas API + 직접 구현한 K-means 클러스터링

---

## 핵심 기능 요구사항

### 1. 이미지 업로드
- 드래그 앤 드롭 + 클릭 업로드 모두 지원
- 지원 포맷: JPG, PNG, WebP, GIF
- 업로드 즉시 분석 시작 (별도 버튼 없음)
- 파일 크기 제한: 10MB

### 2. 색상 분석 엔진 (클라이언트사이드 전용)
- Canvas API로 픽셀 데이터 추출
- 성능을 위해 이미지를 최대 200x200px로 리사이즈 후 분석
- **K-means 클러스터링** 직접 구현:
  - 기본 클러스터 수: 5개 (추출할 주요 색상 수)
  - 반복 횟수: 최대 20회 또는 수렴 시 종료
  - 색상 거리 계산: RGB 유클리드 거리
- 각 클러스터의 픽셀 수 기반으로 비중(%) 계산
- 비중 내림차순 정렬

### 3. 결과 표시
- 분석된 색상을 **큰 색상 블록 + 비중 %** 형태로 표시 (첨부 이미지 레퍼런스 스타일)
- 각 색상 블록에 표시할 정보:
  - 색상 스와치 (배경색)
  - 비중 % (큰 숫자로 강조)
  - HEX 코드
  - RGB 값
- 색상 블록 클릭 시 HEX 코드 클립보드 복사 + 복사 완료 피드백
- 원본 이미지와 결과를 나란히 또는 위아래로 배치

### 4. 색상 수 조절
- 슬라이더 또는 버튼으로 추출 색상 수 조절: 3 / 5 / 8개
- 변경 시 즉시 재분석

### 5. 분석 중 로딩 상태
- 분석 중 로딩 인디케이터 표시
- 큰 이미지는 분석에 1-2초 소요될 수 있음

---

## 광고 슬롯 (빈 공간으로 유지)

아래 3곳에 광고 슬롯을 빈 div로 배치. 클래스명만 지정하고 내용은 비워둘 것.

```tsx
// 상단 배너 (728x90)
<div className="ad-slot ad-slot-top" style={{ width: '728px', height: '90px' }} />

// 좌측 사이드바 (160x600)
<div className="ad-slot ad-slot-left" style={{ width: '160px', height: '600px' }} />

// 우측 사이드바 (160x600)
<div className="ad-slot ad-slot-right" style={{ width: '160px', height: '600px' }} />
```

---

## 디자인 방향

- **콘셉트**: 영화 시사회 프로그램 같은 감성 — 어둡고 시네마틱한 분위기
- **배경**: 짙은 다크 (#0a0a0a 계열)
- **폰트**: 디스플레이용 세리프 계열 + 본문 모노스페이스 (Google Fonts 사용)
- **색상 블록**: 결과 색상이 전면에 크게 부각되도록 — 숫자(%)가 크고 대담하게
- **레이아웃**: 중앙 집중형, 좌우 광고 슬롯 포함 시 3컬럼 구조
- **애니메이션**: 분석 완료 후 색상 블록이 위에서 아래로 순차적으로 나타나는 stagger 효과

---

## 파일 구조

```
src/
├── App.tsx
├── main.tsx
├── index.css
├── components/
│   ├── UploadZone.tsx       # 드래그 앤 드롭 업로드 영역
│   ├── ColorResult.tsx      # 색상 블록 결과 표시
│   ├── ColorBlock.tsx       # 개별 색상 블록 (색상 + % + HEX)
│   └── AdSlot.tsx           # 광고 슬롯 빈 컴포넌트
├── utils/
│   ├── kmeans.ts            # K-means 클러스터링 구현
│   ├── imageAnalyzer.ts     # Canvas API 픽셀 추출 + 분석 오케스트레이션
│   └── colorUtils.ts        # RGB→HEX 변환, 밝기 계산 등
└── types/
    └── index.ts             # ColorData 등 타입 정의
```

---

## 타입 정의

```ts
// types/index.ts
export interface ColorData {
  hex: string;
  rgb: { r: number; g: number; b: number };
  ratio: number; // 0-100 (%)
}
```

---

## 주요 구현 지침

### imageAnalyzer.ts
```ts
// 핵심 흐름
export async function analyzeImage(file: File, colorCount: number): Promise<ColorData[]> {
  // 1. File → ImageBitmap
  // 2. OffscreenCanvas에 200x200으로 리사이즈하여 drawImage
  // 3. getImageData()로 픽셀 배열 추출
  // 4. kmeans(pixels, colorCount) 호출
  // 5. 각 클러스터 픽셀 수 / 전체 픽셀 수로 ratio 계산
  // 6. ratio 내림차순 정렬 후 반환
}
```

### kmeans.ts
```ts
// K-means 구현
export function kmeans(pixels: [number, number, number][], k: number): Cluster[]

interface Cluster {
  center: [number, number, number]; // RGB
  pixelCount: number;
}
```

### ColorBlock.tsx
- 배경색 = 해당 색상
- 텍스트 색상 = 배경 밝기에 따라 자동으로 흰색 또는 검정색 선택 (colorUtils.ts의 getLuminance 활용)
- 클릭 시 HEX 복사 + "복사됨!" 토스트

---

## 다국어 지원 (i18n)

### 언어 감지 방식
```ts
// utils/i18n.ts
const isKorean = navigator.language.startsWith('ko');
```
`navigator.language`가 `'ko'`로 시작하면 한국어, 그 외 모든 언어는 영어.
별도 라이브러리 없이 직접 구현.

### 번역 텍스트

```ts
export const messages = {
  ko: {
    subtitle: '이미지 속 색의 비중을 분석합니다',
    uploadPrompt: '이미지를 드래그하거나 클릭해서 업로드',
    uploadHint: 'JPG, PNG, WebP, GIF · 최대 10MB',
    analyzing: '분석 중...',
    colorCount: '추출할 색상 수',
    copied: '복사됨!',
    clickToCopy: '클릭하여 HEX 복사',
    reset: '다시 분석',
  },
  en: {
    subtitle: 'Analyze the color composition of any image',
    uploadPrompt: 'Drag & drop or click to upload',
    uploadHint: 'JPG, PNG, WebP, GIF · Max 10MB',
    analyzing: 'Analyzing...',
    colorCount: 'Number of colors',
    copied: 'Copied!',
    clickToCopy: 'Click to copy HEX',
    reset: 'Analyze another',
  },
} as const;

export type Lang = keyof typeof messages;
```

### 적용 방식
- `App.tsx`에서 `isKorean` 판단 후 `lang` 상태로 관리
- 모든 UI 텍스트는 `messages[lang].xxx` 형태로 참조
- `<html lang>` 속성도 감지된 언어로 설정

---

## 금지 사항

- 외부 색상 분석 라이브러리 사용 금지 (chroma.js, color-thief 등)
- 서버 업로드 금지 — 모든 처리는 브라우저에서
- 광고 슬롯에 텍스트나 placeholder 내용 추가 금지
- submit 버튼 금지 — 업로드 즉시 자동 분석

---

## 배포 환경

- **Cloudflare Pages** 정적 호스팅
- `npm run build` → `dist/` 폴더 배포
- 환경변수 없음
