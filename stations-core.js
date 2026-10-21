/* Traitement de l'annuaire Radio Browser, partagé entre l'app (navigateur)
   et le script qui pré-calcule stations.json chaque semaine (Node). */
(function (root) {
'use strict';

const OUTRE = {RE:'La Réunion',GP:'Guadeloupe',MQ:'Martinique',GF:'Guyane',YT:'Mayotte',NC:'Nouvelle-Calédonie',PF:'Polynésie française',PM:'Saint-Pierre-et-Miquelon',BL:'Saint-Barthélemy',MF:'Saint-Martin',WF:'Wallis-et-Futuna'};
const COUNTRIES = ['FR', ...Object.keys(OUTRE)];
/* Serveurs connus, utilisés si la liste officielle (all.api.radio-browser.info) est injoignable */
const FALLBACK_HOSTS = ['de1.api.radio-browser.info','de2.api.radio-browser.info','fi1.api.radio-browser.info','nl1.api.radio-browser.info','at1.api.radio-browser.info'];
const stationsPath = cc => `/json/stations/search?countrycode=${cc}&hidebroken=true&order=clickcount&reverse=true&limit=20000`;

const deacc = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '');
const QUAL_RE = /\b(hd|hq|hi-?fi|high quality|haute qualite|aac\+?|he-aac|mp3|ogg|opus|flac|\d{2,3} ?k(bps|b|bit)?)\b/gi;
function cleanName(n){
  let s = (n || '').replace(/[\(\[][^\)\]]*[\)\]]\s*$/g, m => /kbps|aac|mp3|hd|hq|hifi|\d+ ?k\b|flac|ogg/i.test(m) ? '' : m);
  s = s.replace(QUAL_RE, '').replace(/[\s\-–|_:.\/]+$/, '').replace(/^[\s\-–|_:.]+/, '').replace(/\s{2,}/g, ' ').trim();
  return s || (n || '').trim();
}
const keyOf = n => deacc(cleanName(n)).toLowerCase().replace(/[^a-z0-9]/g, '');
const regionKey = r => deacc(r).toLowerCase().replace(/[^a-z]/g, '');
const regionOf = r => r.countrycode && r.countrycode !== 'FR' ? (OUTRE[r.countrycode] || '') : (r.state || '').trim();
const urlOf = r => (r.url_resolved || r.url || '').trim();
const hostOf = u => { try { return new URL(u).hostname.replace(/^www\./, '').toLowerCase(); } catch { return ''; } };
const popOf = r => (+r.clickcount || 0) + (+r.votes || 0) * 2;

/* Les entrées d'un même nom sont la même radio si elles partagent un serveur de flux, un site
   ou une région. Deux radios locales homonymes (régions différentes, rien en commun) restent
   séparées ; les entrées sans région ni lien rejoignent la radio la plus écoutée. */
function clusters(items){
  const p = items.map((_, i) => i);
  const find = i => p[i] === i ? i : (p[i] = find(p[i]));
  const seen = new Map();
  const link = (key, i) => { if (!seen.has(key)) seen.set(key, i); else p[find(i)] = find(seen.get(key)); };
  items.forEach((r, i) => {
    const sh = hostOf(urlOf(r)); if (sh) link('s:' + sh, i);
    const hh = hostOf(r.homepage || ''); if (hh) link('h:' + hh, i);
    const rk = regionKey(regionOf(r)); if (rk) link('r:' + rk, i);
  });
  const groups = new Map();
  items.forEach((r, i) => { const k = find(i); (groups.get(k) || groups.set(k, []).get(k)).push(r); });
  const list = [...groups.values()].sort((a, b) => b.reduce((n, r) => n + popOf(r), 0) - a.reduce((n, r) => n + popOf(r), 0));
  const located = list.filter(g => g.some(r => regionKey(regionOf(r))));
  const unlocated = list.filter(g => !located.includes(g));
  if (!located.length) return [unlocated.flat()];
  located[0].push(...unlocated.flat());
  return located;
}

function mergeStation(id, items){
  items.sort((a, b) => popOf(b) - popOf(a));
  const top = items[0];
  const streams = [], seen = new Set();
  const add = (u, c, b, h) => { if (seen.has(u)) return; seen.add(u); streams.push({ u, c, b, h }); };
  let rf = false, logo = '', home = '', pop = 0;
  const tags = new Set(), regions = {};
  for (const r of items){
    const u = urlOf(r);
    const m = u.match(/^https?:\/\/icecast\.radiofrance\.fr\/([a-z0-9_]+?)-(?:lofi|midfi|hifi)\.(?:mp3|aac)/i);
    if (m){ rf = true; add(`https://icecast.radiofrance.fr/${m[1]}-hifi.aac`, 'AAC', 192, 0); }
    add(u, (r.codec || '').toUpperCase().replace('UNKNOWN', ''), +r.bitrate || 0, r.hls ? 1 : 0);
    if (!logo && r.favicon && /^https?:\/\//i.test(r.favicon)) logo = r.favicon.trim().replace(/^http:/i, 'https:');
    if (!home && r.homepage && /^https?:\/\//i.test(r.homepage)) home = r.homepage.trim();
    if (/radiofrance\.(fr|com)/i.test(r.homepage || '')) rf = true;
    (r.tags || '').split(',').forEach(t => { t = t.trim().toLowerCase(); if (t && t.length < 30) tags.add(t); });
    const reg = regionOf(r);
    if (reg) regions[reg] = (regions[reg] || 0) + 1;
    pop += popOf(r);
  }
  const region = Object.entries(regions).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
  return { id, name: cleanName(top.name), logo, home, tags: [...tags].slice(0, 14).join(', '),
    region, rk: regionKey(region), pop, rf, uuid: top.stationuuid, streams };
}

function processRaw(raw){
  const groups = new Map();
  for (const r of raw){
    if (!r || !r.name || !/^https?:\/\//i.test(urlOf(r))) continue;
    const k = keyOf(r.name); if (!k) continue;
    (groups.get(k) || groups.set(k, []).get(k)).push(r);
  }
  const out = [], ids = new Set();
  for (const [k, items] of groups){
    const parts = clusters(items);
    parts.forEach((part, i) => {
      let id = k;
      if (i > 0){
        id = k + '-' + (regionKey(regionOf(part.find(r => regionOf(r)) || {})) || i);
        while (ids.has(id)) id += '-' + i;
      }
      ids.add(id);
      const s = mergeStation(id, part);
      if (i > 0 && s.region) s.name += ' · ' + s.region;
      out.push(s);
    });
  }
  out.sort((a, b) => b.pop - a.pop);
  return out;
}

/* Télécharge l'annuaire France + outre-mer. getJson(path) gère les serveurs et les erreurs. */
async function fetchRaw(getJson){
  const res = await Promise.allSettled(COUNTRIES.map(cc => getJson(stationsPath(cc))));
  if (res[0].status !== 'fulfilled' || !Array.isArray(res[0].value)) throw new Error('Annuaire injoignable');
  return res.flatMap(r => r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : []);
}

/* Serveurs de la liste officielle d'abord (mélangés), puis les serveurs connus en secours */
const shuffle = a => a.sort(() => Math.random() - .5);
async function discoverHosts(fetchFn){
  let names = [];
  try {
    const r = await fetchFn('https://all.api.radio-browser.info/json/servers');
    names = [...new Set((await r.json()).map(x => x && x.name).filter(n => typeof n === 'string' && /\.api\.radio-browser\.info$/.test(n)))];
  } catch {}
  return [...shuffle(names), ...shuffle(FALLBACK_HOSTS.filter(h => !names.includes(h)))];
}

const api = { OUTRE, COUNTRIES, FALLBACK_HOSTS, deacc, cleanName, keyOf, regionKey, processRaw, fetchRaw, discoverHosts };
if (typeof module === 'object' && module.exports) module.exports = api;
else root.OndesCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
