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
      className="cursor-pointer border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 py-16 px-8 transition-colors duration-200"
      style={{
        borderColor: dragging ? '#888' : '#c8c4bc',
        backgroundColor: dragging ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.5)',
      }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#aaa8a2" strokeWidth="1.5">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
      <p className="text-base" style={{ fontFamily: 'Playfair Display, serif', color: '#3a3a3a' }}>
        {t.uploadPrompt}
      </p>
      <p className="text-xs" style={{ color: '#aaa8a2' }}>{t.uploadHint}</p>
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
