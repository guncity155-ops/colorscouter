import { useState, useEffect, useCallback } from 'react';
import { analyzeImage } from './utils/imageAnalyzer';
import { detectLang, messages } from './utils/i18n';
import type { Lang } from './utils/i18n';
import type { ColorData } from './types';
import UploadZone from './components/UploadZone';
import ColorResult from './components/ColorResult';
import AdSlot from './components/AdSlot';
import FAQ from './components/FAQ';

export default function App() {
  const [lang] = useState<Lang>(detectLang);
  const [colors, setColors] = useState<ColorData[] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [colorCount, setColorCount] = useState(5);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);

  const t = messages[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const runAnalysis = useCallback(async (blob: Blob, count: number) => {
    const url = URL.createObjectURL(blob);
    setImageUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });
    setColors(null);
    setAnalyzing(true);
    try {
      const result = await analyzeImage(blob, count);
      setColors(result);
    } catch (err) {
      console.error('analyzeImage error:', err);
      setColors(null);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  async function handleFile(file: File) {
    setCurrentBlob(file);
    await runAnalysis(file, colorCount);
  }

  async function handleColorCountChange(n: number) {
    setColorCount(n);
    if (!currentBlob) return;
    await runAnalysis(currentBlob, n);
  }

  function handleReset() {
    setColors(null);
    setCurrentBlob(null);
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    setImageUrl(null);
  }

  // 붙여넣기 (Ctrl+V / ⌘+V)
  useEffect(() => {
    async function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (!blob) continue;
          e.preventDefault();
          setCurrentBlob(blob);
          await runAnalysis(blob, colorCount);
          return;
        }
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [colorCount, runAnalysis]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a', color: '#f5f5f5' }}>
      {/* 상단 광고 */}
      <div className="flex justify-center pt-4">
        <AdSlot variant="top" />
      </div>

      {/* 메인 레이아웃: 좌 광고 + 콘텐츠 + 우 광고 */}
      <div className="flex justify-center gap-6 flex-1 px-4 py-8">
        {/* 좌 광고 */}
        <div className="hidden xl:flex items-start pt-8">
          <AdSlot variant="left" />
        </div>

        {/* 콘텐츠 */}
        <main className="flex flex-col items-center w-full max-w-3xl gap-8">
          {/* 헤더 */}
          <header className="text-center">
            <h1
              className="text-5xl font-black tracking-tight mb-2"
              style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em' }}
            >
              ColorScouter
            </h1>
            <p className="text-sm text-gray-500 tracking-widest uppercase">
              {t.subtitle}
            </p>
          </header>

          {/* 업로드 or 결과 */}
          {!colors && !analyzing && (
            <div className="w-full">
              <UploadZone onFile={handleFile} lang={lang} />
            </div>
          )}

          {analyzing && (
            <div className="flex flex-col items-center gap-4 py-16">
              <div
                className="w-10 h-10 rounded-full border-2 animate-spin"
                style={{ borderColor: '#333', borderTopColor: '#aaa' }}
              />
              <p className="text-sm text-gray-500 tracking-widest uppercase">{t.analyzing}</p>
            </div>
          )}

          {colors && imageUrl && !analyzing && (
            <ColorResult
              colors={colors}
              imageUrl={imageUrl}
              colorCount={colorCount}
              onColorCountChange={handleColorCountChange}
              onReset={handleReset}
              lang={lang}
            />
          )}

          {/* FAQ / 사용설명 */}
          <FAQ lang={lang} />
        </main>

        {/* 우 광고 */}
        <div className="hidden xl:flex items-start pt-8">
          <AdSlot variant="right" />
        </div>
      </div>

      {/* 푸터 */}
      <footer className="text-center py-6 text-xs text-gray-700 border-t border-gray-900">
        ColorScouter — client-side only · no upload
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
