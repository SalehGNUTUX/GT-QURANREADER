import { RECITERS, getFirstReciterForRiwaya } from '../packages/core/audio/reciter-catalog';
import { getVerseAudioUrl } from '../packages/core/api/everyayah';

async function main() {
  const warshReciters = RECITERS.filter((r) => r.riwaya === 'warsh');
  console.log('قراء ورش:');
  for (const r of warshReciters) {
    const folder = r.sources.everyayah;
    if (!folder) continue;
    const url = getVerseAudioUrl(folder, 2, 1);
    const res = await fetch(url, { method: 'HEAD' });
    console.log(`  ${res.ok ? '✓' : '✗'} ${r.name.ar} → ${url}`);
  }
  console.log('\nأول قارئ ورش:', getFirstReciterForRiwaya('warsh')?.name.ar);
}

main();
