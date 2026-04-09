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
    <div className="w-full flex flex-col gap-6">
      {/* 이미지 + 색상 블록: 항상 나란히 */}
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0 w-28 sm:w-44 md:w-60">
          <img
            src={imageUrl}
            alt="uploaded"
            className="w-full rounded-xl object-contain"
            style={{
              maxHeight: '320px',
              boxShadow: '0 4px 16px rgba(19,78,74,0.12)',
            }}
          />
        </div>

        {/* 컬러 블록: 모바일 2열, 데스크탑 3열 */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          {colors.map((color, i) => (
            <ColorBlock key={color.hex + i} color={color} index={i} lang={lang} />
          ))}
        </div>
      </div>

      {/* 색상 수 조절 + 리셋 */}
      <div
        className="flex items-center justify-between gap-4 flex-wrap rounded-xl px-4 py-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: '1px solid #CCFBF1' }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#0D9488' }}>
            {t.colorCount}
          </span>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => onColorCountChange(n)}
                className="w-9 h-9 rounded-lg text-sm font-bold cursor-pointer transition-all duration-150"
                style={{
                  backgroundColor: colorCount === n ? '#0D9488' : 'transparent',
                  color: colorCount === n ? '#F0FDFA' : '#0D9488',
                  border: `2px solid ${colorCount === n ? '#0D9488' : '#5EEAD4'}`,
                  transform: colorCount === n ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-lg cursor-pointer transition-all duration-150"
          style={{ color: '#0D9488', border: '2px solid #5EEAD4', backgroundColor: 'transparent' }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#0D9488';
            e.currentTarget.style.color = '#F0FDFA';
            e.currentTarget.style.borderColor = '#0D9488';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#0D9488';
            e.currentTarget.style.borderColor = '#5EEAD4';
          }}
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}
