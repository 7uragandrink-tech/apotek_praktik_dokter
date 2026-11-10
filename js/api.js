// Lapisan komunikasi ke backend Google Apps Script (REST/JSON). Semua data lewat satu fungsi: gas().
// ⚠️ Header POST WAJIB text/plain — application/json memicu preflight CORS yang ditolak Apps Script.
const GAS_TIMEOUT_MS = 60000;
const GAS_URL_OK = /^https:\/\/script\.google\.com\/(a\/[^/]+\/)?macros\/s\/[^/]+\/exec$/.test(typeof GAS_URL === 'string' ? GAS_URL : '');

async function gas(payload, timeoutMs) {
  if (!GAS_URL_OK) throw new Error('Alamat backend belum diisi. Buka js/config.js lalu isi GAS_URL dengan URL /exec dari Apps Script (lihat PANDUAN-INSTALASI.md).');
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), timeoutMs || GAS_TIMEOUT_MS);
  try {
    const res = await fetch(GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload), signal: ctl.signal });
    const txt = await res.text();
    try { return JSON.parse(txt); }
    catch (e) { throw new Error('Backend tidak mengembalikan data yang valid. Pastikan deployment Apps Script diatur: Execute as "Me" dan Who has access "Anyone", lalu deploy ulang.'); }
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('Server terlalu lama merespons. Coba lagi sebentar.');
    if (e instanceof TypeError) throw new Error('Tidak dapat terhubung ke server. Periksa koneksi internet, atau pastikan URL di js/config.js benar dan deployment Apps Script berakses "Anyone".');
    throw e;
  } finally { clearTimeout(tm); }
}
