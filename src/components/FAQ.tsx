import { useState } from 'react';
import { messages } from '../utils/i18n';
import type { Lang } from '../utils/i18n';

interface FAQProps {
  lang: Lang;
  section: 'howto' | 'faq';
}

export default function FAQ({ lang, section }: FAQProps) {
  const t = messages[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (section === 'howto') {
    return (
      <div className="w-full flex flex-col gap-3">
        {t.howToUse.map((step, i) => (
          <div
            key={i}
            className="flex gap-4 items-start rounded-xl px-5 py-4"
            style={{ backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #e5e5e5' }}
          >
            <span
              className="text-2xl font-black leading-none flex-shrink-0 w-9 text-right"
              style={{ fontFamily: 'Playfair Display, serif', color: '#ddd' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-sm font-semibold leading-relaxed pt-0.5" style={{ color: '#222' }}>
              {step}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      {t.faq.map((item, i) => (
        <div
          key={i}
          className="rounded-xl overflow-hidden transition-all duration-200"
          style={{
            backgroundColor: openIdx === i ? '#fff' : 'rgba(255,255,255,0.7)',
            border: `1px solid ${openIdx === i ? '#aaa' : '#e5e5e5'}`,
          }}
        >
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex justify-between items-center gap-4 px-5 py-4 text-left cursor-pointer"
          >
            <span className="text-sm font-bold" style={{ color: '#222' }}>{item.q}</span>
            <span
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200"
              style={{
                backgroundColor: openIdx === i ? '#111' : '#eee',
                color: openIdx === i ? '#f5f5f5' : '#555',
              }}
            >
              {openIdx === i ? '−' : '+'}
            </span>
          </button>
          {openIdx === i && (
            <p className="px-5 pb-4 text-sm font-medium leading-relaxed" style={{ color: '#666' }}>
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
