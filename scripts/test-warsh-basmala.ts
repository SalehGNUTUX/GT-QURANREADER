import { RECITERS } from '../packages/core/audio/reciter-catalog';
import { getVerseAudioUrl } from '../packages/core/api/everyayah';

async function inspect(url: string, label: string) {
  const res = await fetch(url, { method: 'HEAD' });
  const len = res.headers.get('content-length');
  const kb = len ? Math.round(parseInt(len, 10) / 1024) : '?';
  console.log(`  ${res.ok ? '✓' : '✗'} ${label}: HTTP ${res.status} — ${kb}KB`);
  console.log(`    URL: ${url}`);
}

async function main() {
  const warshReciters = RECITERS.filter((r) => r.riwaya === 'warsh');
  for (const r of warshReciters) {
    const folder = r.sources.everyayah;
    if (!folder) continue;
    console.log(`\n=== ${r.name.ar} ===`);
    console.log('  folder:', folder);
    await inspect(getVerseAudioUrl(folder, 1, 1), 'الفاتحة آية 1 (= البسملة)');
    await inspect(getVerseAudioUrl(folder, 2, 1), 'البقرة آية 1');
    await inspect(getVerseAudioUrl(folder, 36, 1), 'يس آية 1');
  }
}
main();
