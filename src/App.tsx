import { useState, useEffect, useCallback } from 'react';
import { analyzeImage } from './utils/imageAnalyzer';
import { detectLang, messages } from './utils/i18n';
import type { Lang } from './utils/i18n';
import type { ColorData } from './types';
import UploadZone from './components/UploadZone';
import ColorResult from './components/ColorResult';
import AdSlot from './components/AdSlot';
import FAQ from './components/FAQ';

type Tab = 'analyze' | 'howto' | 'faq';

export default function App() {
  const [lang] = useState<Lang>(detectLang);
  const [colors, setColors] = useState<ColorData[] | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [colorCount, setColorCount] = useState(5);
  const [currentBlob, setCurrentBlob] = useState<Blob | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('analyze');

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
    setActiveTab('analyze');
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

  function handleTitleClick() {
    handleReset();
    setActiveTab('analyze');
  }

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
          setActiveTab('analyze');
          await runAnalysis(blob, colorCount);
          return;
        }
      }
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [colorCount, runAnalysis]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'analyze', label: t.tabAnalyze },
    { key: 'howto', label: t.howToUseTitle },
    { key: 'faq', label: t.faqTitle },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f2ec' }}>
      {/* 다크 헤더 영역 */}
      <div style={{ backgroundColor: '#0f0f0f' }}>
        {/* 상단 광고 */}
        <div className="flex justify-center pt-3">
          <AdSlot variant="top" />
        </div>

        {/* 헤더 */}
        <header className="flex flex-col items-center pt-7 pb-5 px-4">
          <button onClick={handleTitleClick} className="group focus:outline-none">
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight group-hover:opacity-60 transition-opacity"
              style={{ fontFamily: 'Playfair Display, serif', letterSpacing: '-0.02em', color: '#f0ede8' }}
            >
              ColorScouter
            </h1>
          </button>
          <p className="text-xs tracking-widest uppercase mt-2" style={{ color: '#4a4a4a' }}>
            {t.subtitle}
          </p>
        </header>

        {/* 탭 바 */}
        <div className="flex justify-center px-4 pb-5">
          <nav className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: '#1c1c1c' }}>
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="px-5 py-2 text-xs rounded-md transition-all duration-150 tracking-widest uppercase"
                style={{
                  backgroundColor: activeTab === key ? '#f5f2ec' : 'transparent',
                  color: activeTab === key ? '#0f0f0f' : '#555',
                  fontWeight: activeTab === key ? 700 : 400,
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* 본문 */}
      <main className="flex-1 flex justify-center px-4 py-10">
        <div className="w-full max-w-3xl">

          {/* 분석 탭 */}
          {activeTab === 'analyze' && (
            <div className="flex flex-col gap-6">
              {!colors && !analyzing && (
                <UploadZone onFile={handleFile} lang={lang} />
              )}

              {analyzing && (
                <div className="flex flex-col items-center gap-4 py-20">
                  <div
                    className="w-8 h-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: '#d0ccc6', borderTopColor: '#555' }}
                  />
                  <p className="text-xs tracking-widest uppercase" style={{ color: '#999' }}>{t.analyzing}</p>
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
            </div>
          )}

          {/* 사용법 탭 */}
          {activeTab === 'howto' && (
            <div className="py-2">
              <FAQ lang={lang} section="howto" />
            </div>
          )}

          {/* FAQ 탭 */}
          {activeTab === 'faq' && (
            <div className="py-2">
              <FAQ lang={lang} section="faq" />
            </div>
          )}

        </div>
      </main>

      {/* 다크 푸터 */}
      <footer
        className="text-center py-5 text-xs border-t"
        style={{ backgroundColor: '#0f0f0f', color: '#333', borderColor: '#1c1c1c' }}
      >
        ColorScouter — client-side only · no upload
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
