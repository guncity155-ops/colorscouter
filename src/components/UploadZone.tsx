import { useRef, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { messages } from '../utils/i18n';

interface UploadZoneProps {
  onFile: (file: File) => void;
  lang: Lang;
}

const MAX_MB = 10;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function UploadZone({ onFile, lang }: UploadZoneProps) {
  const t = messages[lang];
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type)) return;
    if (file.size > MAX_MB * 1024 * 1024) return;
    onFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className="cursor-pointer rounded-2xl flex flex-col items-center justify-center gap-4 py-16 px-8 transition-all duration-200"
      style={{
        border: `2px dashed ${dragging ? '#0D9488' : '#5EEAD4'}`,
        backgroundColor: dragging ? 'rgba(13,148,136,0.06)' : 'rgba(255,255,255,0.7)',
        transform: dragging ? 'scale(1.01)' : 'scale(1)',
        boxShadow: dragging
          ? '0 0 0 4px rgba(13,148,136,0.1)'
          : '0 1px 3px rgba(19,78,74,0.06)',
      }}
    >
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center transition-colors duration-200"
        style={{ backgroundColor: dragging ? 'rgba(13,148,136,0.12)' : 'rgba(94,234,212,0.2)' }}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </div>

      <div className="text-center">
        <p className="text-base font-bold" style={{ color: '#134E4A' }}>
          {t.uploadPrompt}
        </p>
        <p className="text-xs font-semibold mt-1" style={{ color: '#0D9488' }}>
          {t.uploadHint}
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  );
}
