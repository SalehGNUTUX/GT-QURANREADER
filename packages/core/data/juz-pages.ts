import type { JuzInfo } from '../types';

// بدايات الأجزاء الـ 30 في مصحف المدينة (604 صفحة).
// الصفحة الأولى لكل جزء والسورة والآية التي يبدأ منها.
export const JUZ_DATA: JuzInfo[] = [
  { number: 1, startPage: 1, startSurah: 1, startVerse: 1 },
  { number: 2, startPage: 22, startSurah: 2, startVerse: 142 },
  { number: 3, startPage: 42, startSurah: 2, startVerse: 253 },
  { number: 4, startPage: 62, startSurah: 3, startVerse: 93 },
  { number: 5, startPage: 82, startSurah: 4, startVerse: 24 },
  { number: 6, startPage: 102, startSurah: 4, startVerse: 148 },
  { number: 7, startPage: 122, startSurah: 5, startVerse: 82 },
  { number: 8, startPage: 142, startSurah: 6, startVerse: 111 },
  { number: 9, startPage: 162, startSurah: 7, startVerse: 88 },
  { number: 10, startPage: 182, startSurah: 8, startVerse: 41 },
  { number: 11, startPage: 202, startSurah: 9, startVerse: 93 },
  { number: 12, startPage: 222, startSurah: 11, startVerse: 6 },
  { number: 13, startPage: 242, startSurah: 12, startVerse: 53 },
  { number: 14, startPage: 262, startSurah: 15, startVerse: 1 },
  { number: 15, startPage: 282, startSurah: 17, startVerse: 1 },
  { number: 16, startPage: 302, startSurah: 18, startVerse: 75 },
  { number: 17, startPage: 322, startSurah: 21, startVerse: 1 },
  { number: 18, startPage: 342, startSurah: 23, startVerse: 1 },
  { number: 19, startPage: 362, startSurah: 25, startVerse: 21 },
  { number: 20, startPage: 382, startSurah: 27, startVerse: 56 },
  { number: 21, startPage: 402, startSurah: 29, startVerse: 46 },
  { number: 22, startPage: 422, startSurah: 33, startVerse: 31 },
  { number: 23, startPage: 442, startSurah: 36, startVerse: 28 },
  { number: 24, startPage: 462, startSurah: 39, startVerse: 32 },
  { number: 25, startPage: 482, startSurah: 41, startVerse: 47 },
  { number: 26, startPage: 502, startSurah: 46, startVerse: 1 },
  { number: 27, startPage: 522, startSurah: 51, startVerse: 31 },
  { number: 28, startPage: 542, startSurah: 58, startVerse: 1 },
  { number: 29, startPage: 562, startSurah: 67, startVerse: 1 },
  { number: 30, startPage: 582, startSurah: 78, startVerse: 1 },
];

export function getJuzByNumber(num: number): JuzInfo | undefined {
  return JUZ_DATA.find((j) => j.number === num);
}

export function getJuzByPage(page: number): JuzInfo {
  for (let i = JUZ_DATA.length - 1; i >= 0; i--) {
    if (JUZ_DATA[i].startPage <= page) return JUZ_DATA[i];
  }
  return JUZ_DATA[0];
}

export const TOTAL_JUZ = 30;
