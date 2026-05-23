import type { FontInfo } from '@gt-quranreader/core';

export const AVAILABLE_FONTS: FontInfo[] = [
  {
    id: 'UthmanicHafs1',
    name: 'الخط العثماني (مصحف المدينة)',
    family: 'UthmanicHafs1',
    file: '/fonts/UthmanicHafs1 Ver13.otf',
    riwayaPreference: ['hafs'],
  },
  {
    id: 'AmiriQuran',
    name: 'خط أميري قرآن',
    family: 'AmiriQuran',
    file: '/fonts/amiri-quran.ttf',
  },
  {
    id: 'AmiriQuranColored',
    name: 'خط أميري ملوَّن (تشكيل ملون)',
    family: 'AmiriQuranColored',
    file: '/fonts/amiri-quran-colored.ttf',
  },
  {
    id: 'ArbFONTSAmiri',
    name: 'خط أميري ArbFONTS',
    family: 'ArbFONTSAmiri',
    file: '/fonts/ArbFONTS-Amiri Quran.ttf',
  },
  {
    id: 'system-naskh',
    name: 'خط النظام (Naskh)',
    family: 'system-ui, "Noto Naskh Arabic", "Scheherazade New", serif',
  },
  {
    id: 'serif',
    name: 'خط مسطر بسيط',
    family: 'serif',
  },
];

export function getFont(id: string): FontInfo {
  return AVAILABLE_FONTS.find((f) => f.id === id) ?? AVAILABLE_FONTS[0];
}
