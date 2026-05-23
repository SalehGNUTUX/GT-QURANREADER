// كتالوج موحَّد للقراء — يربط معرّفاً مستقراً بمصادر everyayah و mp3quran.
import type { Reciter, RiwayaId } from '../types';

export const RECITERS: Reciter[] = [
  // ===== حفص عن عاصم =====
  {
    id: 'alafasy',
    name: { ar: 'مشاري بن راشد العفاسي', en: 'Mishary Rashid Alafasy' },
    style: 'مجود',
    riwaya: 'hafs',
    sources: { everyayah: 'Alafasy_128kbps', mp3quran: 'afs' },
  },
  {
    id: 'husary',
    name: { ar: 'محمود خليل الحصري', en: 'Mahmoud Khalil Al-Husary' },
    style: 'حدر',
    riwaya: 'hafs',
    sources: { everyayah: 'Husary_128kbps', mp3quran: 'husr' },
  },
  {
    id: 'husary-mujawwad',
    name: { ar: 'محمود خليل الحصري (مجوّد)', en: 'Mahmoud Al-Husary (Mujawwad)' },
    style: 'مجود',
    riwaya: 'hafs',
    sources: { everyayah: 'Husary_Mujawwad_128kbps' },
  },
  {
    id: 'minshawi-murattal',
    name: { ar: 'محمد صديق المنشاوي (مرتّل)', en: 'Mohamed Siddiq Al-Minshawi (Murattal)' },
    style: 'ترتيل',
    riwaya: 'hafs',
    sources: { everyayah: 'Minshawy_Murattal_128kbps', mp3quran: 'minsh' },
  },
  {
    id: 'minshawi-mujawwad',
    name: { ar: 'محمد صديق المنشاوي (مجوّد)', en: 'Al-Minshawi (Mujawwad)' },
    style: 'مجود',
    riwaya: 'hafs',
    sources: { everyayah: 'Minshawy_Mujawwad_64kbps' },
  },
  {
    id: 'abdulbasit-murattal',
    name: { ar: 'عبد الباسط عبد الصمد (مرتّل)', en: 'Abdul Basit (Murattal)' },
    style: 'ترتيل',
    riwaya: 'hafs',
    sources: { everyayah: 'Abdul_Basit_Murattal_128kbps', mp3quran: 'basit' },
  },
  {
    id: 'abdulbasit-mujawwad',
    name: { ar: 'عبد الباسط عبد الصمد (مجوّد)', en: 'Abdul Basit (Mujawwad)' },
    style: 'مجود',
    riwaya: 'hafs',
    sources: { everyayah: 'Abdul_Basit_Mujawwad_128kbps' },
  },
  {
    id: 'ghamdi',
    name: { ar: 'سعد الغامدي', en: 'Saad Al-Ghamdi' },
    style: 'حدر',
    riwaya: 'hafs',
    sources: { everyayah: 'Ghamadi_40kbps', mp3quran: 'ghamdi' },
  },
  {
    id: 'dussary',
    name: { ar: 'ياسر الدوسري', en: 'Yasser Al-Dussary' },
    style: 'ترتيل',
    riwaya: 'hafs',
    sources: { everyayah: 'Yasser_Ad-Dussary_128kbps' },
  },
  {
    id: 'shaatree',
    name: { ar: 'أبو بكر الشاطري', en: 'Abu Bakr Ash-Shaatree' },
    style: 'مجود',
    riwaya: 'hafs',
    sources: { everyayah: 'Abu_Bakr_Ash-Shaatree_128kbps', mp3quran: 'ajm' },
  },
  {
    id: 'ayyoub',
    name: { ar: 'محمد أيوب', en: 'Muhammad Ayyoub' },
    style: 'ترتيل',
    riwaya: 'hafs',
    sources: { everyayah: 'Muhammad_Ayyoub_128kbps' },
  },

  // ===== ورش عن نافع =====
  // المسارات تأتي تحت everyayah.com/data/warsh/<folder>/SSSAAA.mp3
  // ملاحظة: استُبعد عبد الباسط الورشي لأن ترقيمه في everyayah غير قياسي
  // (ملف 002001 يحوي 3 آيات: بسملة + الم + "ذلك الكتاب") — التظليل لا يمكن أن يتزامن.
  {
    id: 'ibrahim-aldosary-warsh',
    name: { ar: 'إبراهيم الدوسري (ورش)', en: 'Ibrahim Al-Dosary (Warsh)' },
    style: 'ترتيل',
    riwaya: 'warsh',
    sources: { everyayah: 'warsh/warsh_ibrahim_aldosary_128kbps' },
  },
  {
    id: 'yassin-aljazaery-warsh',
    name: { ar: 'ياسين الجزائري (ورش)', en: 'Yassin Al-Jazairi (Warsh)' },
    style: 'ترتيل',
    riwaya: 'warsh',
    sources: { everyayah: 'warsh/warsh_yassin_al_jazaery_64kbps' },
  },
];

export function getReciter(id: string): Reciter | undefined {
  return RECITERS.find((r) => r.id === id);
}

export function getRecitersByRiwaya(riwaya: RiwayaId): Reciter[] {
  return RECITERS.filter((r) => r.riwaya === riwaya);
}

export const DEFAULT_RECITER_ID = 'alafasy';

/** أول قارئ متاح في الرواية المُعطاة. */
export function getFirstReciterForRiwaya(riwaya: RiwayaId): Reciter | undefined {
  return RECITERS.find((r) => r.riwaya === riwaya && r.sources.everyayah);
}
