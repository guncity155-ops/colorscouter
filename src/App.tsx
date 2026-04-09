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

// 디자인 시스템 토큰
const DS = {
  headerBg: '#134E4A',
  headerText: '#F0FDFA',
  headerMuted: '#5EEAD4',
  tabActiveBg: '#F0FDFA',
  tabActiveText: '#134E4A',
  tabInactiveText: '#99F6E4',
  bodyBg: '#F0FDFA',
  bodyText: '#134E4A',
  primary: '#0D9488',
  footerBg: '#0F3A37',
  footerText: '#2DD4BF',
};

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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: DS.bodyBg, fontFamily: 'Nunito, sans-serif' }}>
      {/* 다크 teal 헤더 */}
      <div style={{ backgroundColor: DS.headerBg }}>
        <div className="flex justify-center pt-3">
          <AdSlot variant="top" />
        </div>

        <header className="flex flex-col items-center pt-6 pb-4 px-4">
          <button
            onClick={handleTitleClick}
            className="group focus:outline-none cursor-pointer"
          >
            <h1
              className="text-4xl sm:text-5xl font-black tracking-tight transition-opacity duration-150 group-hover:opacity-70"
              style={{
                fontFamily: 'Playfair Display, serif',
                letterSpacing: '-0.02em',
                color: DS.headerText,
              }}
            >
              ColorScouter
            </h1>
          </button>
          <p
            className="text-xs tracking-widest uppercase mt-2 font-semibold"
            style={{ color: DS.headerMuted }}
          >
            {t.subtitle}
          </p>
        </header>

        {/* 탭 바 */}
        <div className="flex justify-center px-4 pb-5">
          <nav
            className="flex gap-1 p-1 rounded-xl"
            style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
          >
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className="px-5 py-2 text-xs rounded-lg font-bold tracking-widest uppercase cursor-pointer transition-all duration-200"
                style={{
                  backgroundColor: activeTab === key ? DS.tabActiveBg : 'transparent',
                  color: activeTab === key ? DS.tabActiveText : DS.tabInactiveText,
                  transform: activeTab === key ? 'scale(1)' : 'scale(0.97)',
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

          {activeTab === 'analyze' && (
            <div className="flex flex-col gap-6">
              {!colors && !analyzing && (
                <UploadZone onFile={handleFile} lang={lang} />
              )}

              {analyzing && (
                <div className="flex flex-col items-center gap-4 py-20">
                  <div
                    className="w-9 h-9 rounded-full border-[3px] animate-spin"
                    style={{ borderColor: '#CCFBF1', borderTopColor: DS.primary }}
                  />
                  <p
                    className="text-xs font-bold tracking-widest uppercase"
                    style={{ color: DS.primary }}
                  >
                    {t.analyzing}
                  </p>
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

          {activeTab === 'howto' && (
            <FAQ lang={lang} section="howto" />
          )}

          {activeTab === 'faq' && (
            <FAQ lang={lang} section="faq" />
          )}

        </div>
      </main>

      <footer
        className="text-center py-5 text-xs font-semibold tracking-widest uppercase border-t"
        style={{ backgroundColor: DS.footerBg, color: DS.footerText, borderColor: '#0D3B38' }}
      >
        ColorScouter — client-side only · no upload
      </footer>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}
