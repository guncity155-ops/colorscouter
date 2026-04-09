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
      <div className="w-full flex flex-col gap-6">
        {t.howToUse.map((step, i) => (
          <div key={i} className="flex gap-5 items-start">
            <span
              className="text-3xl font-black leading-none flex-shrink-0 w-10 text-right"
              style={{ fontFamily: 'Playfair Display, serif', color: '#d8d4cc' }}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="text-sm leading-relaxed pt-1" style={{ color: '#555' }}>{step}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col" style={{ borderTop: '1px solid #e0dbd4' }}>
      {t.faq.map((item, i) => (
        <div key={i} style={{ borderBottom: '1px solid #e0dbd4' }}>
          <button
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
            className="w-full flex justify-between items-start gap-4 py-4 text-left text-sm transition-colors"
            style={{ color: '#2a2a2a' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#000')}
            onMouseLeave={e => (e.currentTarget.style.color = '#2a2a2a')}
          >
            <span>{item.q}</span>
            <span className="flex-shrink-0 mt-0.5 text-base leading-none" style={{ color: '#aaa' }}>
              {openIdx === i ? '−' : '+'}
            </span>
          </button>
          {openIdx === i && (
            <p className="pb-4 text-sm leading-relaxed" style={{ color: '#777' }}>{item.a}</p>
          )}
        </div>
      ))}
    </div>
  );
}
