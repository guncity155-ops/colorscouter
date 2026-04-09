import { useState } from 'react';
import { getTextColor } from '../utils/colorUtils';
import type { ColorData } from '../types';
import type { Lang } from '../utils/i18n';
import { messages } from '../utils/i18n';

interface ColorBlockProps {
  color: ColorData;
  index: number;
  lang: Lang;
}

export default function ColorBlock({ color, index, lang }: ColorBlockProps) {
  const t = messages[lang];
  const [copied, setCopied] = useState(false);
  const textColor = getTextColor(color.rgb.r, color.rgb.g, color.rgb.b);

  function handleClick() {
    navigator.clipboard.writeText(color.hex).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div
      onClick={handleClick}
      className="relative flex flex-col justify-end cursor-pointer rounded-lg overflow-hidden transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
      style={{
        backgroundColor: color.hex,
        minHeight: '160px',
        animation: `fadeSlideIn 0.4s ease forwards`,
        animationDelay: `${index * 80}ms`,
        opacity: 0,
      }}
    >
      <div className="p-4" style={{ color: textColor }}>
        <div
          className="text-5xl font-black leading-none mb-2"
          style={{ fontFamily: 'Playfair Display, serif', opacity: 0.9 }}
        >
          {color.ratio}%
        </div>
        <div className="text-sm font-bold tracking-widest uppercase mb-0.5">
          {color.hex}
        </div>
        <div className="text-xs opacity-60">
          {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
        </div>
      </div>

      {copied && (
        <div
          className="absolute inset-0 flex items-center justify-center text-sm font-bold rounded-lg"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}
        >
          {t.copied}
        </div>
      )}

      {!copied && (
        <div
          className="absolute top-2 right-2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: 'rgba(0,0,0,0.3)', color: '#fff' }}
        >
          {t.clickToCopy}
        </div>
      )}
    </div>
  );
}
