import ColorBlock from './ColorBlock';
import type { ColorData } from '../types';
import type { Lang } from '../utils/i18n';
import { messages } from '../utils/i18n';

interface ColorResultProps {
  colors: ColorData[];
  imageUrl: string;
  colorCount: number;
  onColorCountChange: (n: number) => void;
  onReset: () => void;
  lang: Lang;
}

const COLOR_OPTIONS = [3, 5, 8];

export default function ColorResult({
  colors,
  imageUrl,
  colorCount,
  onColorCountChange,
  onReset,
  lang,
}: ColorResultProps) {
  const t = messages[lang];

  return (
    <div className="w-full flex flex-col gap-8">
      {/* 이미지 + 결과 */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* 원본 이미지 */}
        <div className="lg:w-80 flex-shrink-0">
          <img
            src={imageUrl}
            alt="uploaded"
            className="w-full rounded-lg object-cover"
            style={{ maxHeight: '400px', objectFit: 'contain' }}
          />
        </div>

        {/* 색상 블록 그리드 */}
        <div className="flex-1 grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
          {colors.map((color, i) => (
            <ColorBlock key={color.hex + i} color={color} index={i} lang={lang} />
          ))}
        </div>
      </div>

      {/* 색상 수 조절 + 리셋 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 uppercase tracking-widest">{t.colorCount}</span>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => onColorCountChange(n)}
                className="w-10 h-10 rounded text-sm font-bold transition-colors duration-150"
                style={{
                  backgroundColor: colorCount === n ? '#f5f5f5' : '#1a1a1a',
                  color: colorCount === n ? '#0a0a0a' : '#888',
                  border: `1px solid ${colorCount === n ? 'transparent' : '#333'}`,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors uppercase tracking-widest px-4 py-2 border border-gray-800 rounded hover:border-gray-600"
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}
