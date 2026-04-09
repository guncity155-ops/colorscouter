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
      {/* 이미지 + 색상 블록: 모바일에서도 나란히 */}
      <div className="flex gap-4 items-start">
        {/* 원본 이미지 */}
        <div className="flex-shrink-0 w-28 sm:w-48 md:w-64">
          <img
            src={imageUrl}
            alt="uploaded"
            className="w-full rounded-lg object-contain"
            style={{ maxHeight: '320px' }}
          />
        </div>

        {/* 색상 블록: 항상 2열, 넓은 화면에서 3열 */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-2">
          {colors.map((color, i) => (
            <ColorBlock key={color.hex + i} color={color} index={i} lang={lang} />
          ))}
        </div>
      </div>

      {/* 색상 수 조절 + 리셋 */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-xs uppercase tracking-widest" style={{ color: '#aaa8a2' }}>{t.colorCount}</span>
          <div className="flex gap-2">
            {COLOR_OPTIONS.map(n => (
              <button
                key={n}
                onClick={() => onColorCountChange(n)}
                className="w-9 h-9 rounded text-sm font-bold transition-colors duration-150"
                style={{
                  backgroundColor: colorCount === n ? '#1a1a1a' : 'transparent',
                  color: colorCount === n ? '#f5f2ec' : '#999',
                  border: `1px solid ${colorCount === n ? '#1a1a1a' : '#c8c4bc'}`,
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onReset}
          className="text-xs uppercase tracking-widest px-4 py-2 rounded transition-colors duration-150"
          style={{ color: '#aaa8a2', border: '1px solid #c8c4bc' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = '#888'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#aaa8a2'; e.currentTarget.style.borderColor = '#c8c4bc'; }}
        >
          {t.reset}
        </button>
      </div>
    </div>
  );
}
