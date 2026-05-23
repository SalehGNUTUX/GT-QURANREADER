import type { RiwayaInfo } from '../types';

// ورش أولاً (الرواية المعتمدة في المغرب العربي).
export const RIWAYAT: RiwayaInfo[] = [
  {
    id: 'warsh',
    name: { ar: 'ورش', en: 'Warsh' },
    fullName: { ar: 'ورش عن نافع', en: 'Warsh an Nafi' },
    apiSlug: 'quran-warsh',
    defaultFont: 'AmiriQuran',
  },
  {
    id: 'hafs',
    name: { ar: 'حفص', en: 'Hafs' },
    fullName: { ar: 'حفص عن عاصم', en: 'Hafs an Asim' },
    apiSlug: 'quran-uthmani',
    defaultFont: 'UthmanicHafs1',
  },
  {
    id: 'qaloon',
    name: { ar: 'قالون', en: 'Qaloon' },
    fullName: { ar: 'قالون عن نافع', en: 'Qaloon an Nafi' },
    apiSlug: 'quran-qaloon',
    defaultFont: 'AmiriQuran',
  },
  {
    id: 'aldoori',
    name: { ar: 'الدوري', en: 'Al-Dūrī' },
    fullName: { ar: 'الدوري عن أبي عمرو', en: 'Al-Duri an Abi Amr' },
    apiSlug: 'quran-aldoori',
    defaultFont: 'AmiriQuran',
  },
];

export function getRiwaya(id: string): RiwayaInfo | undefined {
  return RIWAYAT.find((r) => r.id === id);
}

// الافتراضي ورش (الرواية المعتمدة في المغرب العربي).
export const DEFAULT_RIWAYA: RiwayaInfo = RIWAYAT.find((r) => r.id === 'warsh')!;
