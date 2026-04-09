export const messages = {
  ko: {
    tabAnalyze: '분석',
    subtitle: '이미지 속 색의 비중을 분석합니다',
    uploadPrompt: '이미지를 드래그하거나 클릭해서 업로드',
    uploadHint: 'JPG, PNG, WebP, GIF · 최대 10MB · Ctrl+V 붙여넣기 가능',
    analyzing: '분석 중...',
    colorCount: '추출할 색상 수',
    copied: '복사됨!',
    clickToCopy: '클릭하여 HEX 복사',
    reset: '다시 분석',
    howToUseTitle: '사용 방법',
    howToUse: [
      '이미지를 드래그 앤 드롭하거나 클릭해서 업로드하세요.',
      '스크린샷이나 이미지를 복사한 뒤 Ctrl+V(Mac: ⌘+V)로 붙여넣을 수 있습니다.',
      '분석이 완료되면 색상 블록이 비중 순으로 표시됩니다.',
      '색상 블록을 클릭하면 HEX 코드가 클립보드에 복사됩니다.',
      '하단 버튼으로 추출할 색상 수(3·5·8개)를 조절할 수 있습니다.',
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: '이미지가 서버에 업로드되나요?',
        a: '아니요. 모든 분석은 브라우저 안에서만 처리됩니다. 이미지가 외부로 전송되지 않습니다.',
      },
      {
        q: '색상 분석은 어떻게 작동하나요?',
        a: 'Canvas API로 픽셀 데이터를 추출한 뒤, K-means++ 클러스터링으로 대표 색상을 찾습니다. 채도가 높은 색상은 비중이 적어도 더 잘 감지되도록 가중치가 적용됩니다.',
      },
      {
        q: '색상 수는 어떻게 조절하나요?',
        a: '결과 화면 하단의 3·5·8 버튼을 클릭하면 즉시 재분석됩니다.',
      },
      {
        q: '지원하는 이미지 포맷은 무엇인가요?',
        a: 'JPG, PNG, WebP, GIF를 지원합니다. 최대 파일 크기는 10MB입니다.',
      },
    ],
  },
  en: {
    tabAnalyze: 'Analyze',
    subtitle: 'Analyze the color composition of any image',
    uploadPrompt: 'Drag & drop or click to upload',
    uploadHint: 'JPG, PNG, WebP, GIF · Max 10MB · Paste with Ctrl+V',
    analyzing: 'Analyzing...',
    colorCount: 'Number of colors',
    copied: 'Copied!',
    clickToCopy: 'Click to copy HEX',
    reset: 'Analyze another',
    howToUseTitle: 'How to use',
    howToUse: [
      'Drag & drop an image onto the upload zone, or click to browse.',
      'Copy any image and paste it with Ctrl+V (Mac: ⌘+V).',
      'After analysis, color blocks appear sorted by coverage percentage.',
      'Click any color block to copy its HEX code to the clipboard.',
      'Use the 3·5·8 buttons to change how many colors are extracted.',
    ],
    faqTitle: 'FAQ',
    faq: [
      {
        q: 'Is my image uploaded to a server?',
        a: 'No. All processing happens entirely in your browser. Your image never leaves your device.',
      },
      {
        q: 'How does the color analysis work?',
        a: 'Pixel data is extracted via the Canvas API, then K-means++ clustering finds the dominant colors. Highly saturated (vivid) colors are weighted so they\'re detected even when covering a small area.',
      },
      {
        q: 'How do I change the number of colors?',
        a: 'Click the 3, 5, or 8 buttons below the results to re-analyze instantly.',
      },
      {
        q: 'Which image formats are supported?',
        a: 'JPG, PNG, WebP, and GIF are supported. Maximum file size is 10MB.',
      },
    ],
  },
} as const;

export type Lang = keyof typeof messages;

export function detectLang(): Lang {
  return navigator.language.startsWith('ko') ? 'ko' : 'en';
}
