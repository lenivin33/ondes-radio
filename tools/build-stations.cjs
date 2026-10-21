// Pré-calcule stations.json à partir de l'annuaire Radio Browser (lancé chaque semaine par GitHub Actions).
// Usage : node tools/build-stations.cjs
const fs = require('fs');
const path = require('path');
const core = require('../stations-core.js');

const OUT = path.join(__dirname, '..', 'stations.json');
const MIN_STATIONS = 500; // en dessous, l'annuaire a sans doute mal répondu : on garde l'ancienne liste
const UA = 'Ondes/1.0 (+https://github.com/lenivin33/ondes-radio)';

async function fetchWithTimeout(url, ms = 60000){
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`HTTP ${r.status} pour ${url}`);
    return { json: async () => r.json().finally(() => clearTimeout(t)) };
  } catch (e) { clearTimeout(t); throw e; }
}

async function main(){
  const hosts = await core.discoverHosts(fetchWithTimeout);
  console.log('Serveurs :', hosts.join(', '));
  const getJson = async p => {
    let last;
    for (const h of hosts){
      for (let attempt = 0; attempt < 2; attempt++){
        try { return await (await fetchWithTimeout('https://' + h + p)).json(); }
        catch (e) { last = e; }
      }
    }
    throw last || new Error('Annuaire injoignable');
  };
  const raw = await core.fetchRaw(getJson);
  const list = core.processRaw(raw);
  console.log(`${raw.length} entrées, ${list.length} radios`);
  if (list.length < MIN_STATIONS) throw new Error(`Seulement ${list.length} radios : liste non mise à jour`);
  const data = { v: 1, t: Date.now(), list };
  fs.writeFileSync(OUT, JSON.stringify(data));
  console.log(`stations.json : ${fs.statSync(OUT).size} octets`);
}

main().catch(e => { console.error(e.message || e); process.exit(1); });
