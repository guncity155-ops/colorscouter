import { useState } from 'react';
import { messages } from '../utils/i18n';
import type { Lang } from '../utils/i18n';

interface FAQProps {
  lang: Lang;
}

export default function FAQ({ lang }: FAQProps) {
  const t = messages[lang];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 flex flex-col gap-10">
      {/* 사용 방법 */}
      <section>
        <h2
          className="text-xs uppercase tracking-widest text-gray-500 mb-4"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {t.howToUseTitle}
        </h2>
        <ol className="flex flex-col gap-2">
          {t.howToUse.map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-400">
              <span className="text-gray-700 flex-shrink-0" style={{ fontFamily: 'Playfair Display, serif' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section>
        <h2
          className="text-xs uppercase tracking-widest text-gray-500 mb-4"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {t.faqTitle}
        </h2>
        <div className="flex flex-col divide-y divide-gray-900">
          {t.faq.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex justify-between items-start gap-4 py-4 text-left text-sm text-gray-300 hover:text-white transition-colors"
              >
                <span>{item.q}</span>
                <span className="text-gray-600 flex-shrink-0 mt-0.5">
                  {openIdx === i ? '−' : '+'}
                </span>
              </button>
              {openIdx === i && (
                <p className="pb-4 text-sm text-gray-500 leading-relaxed">
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
