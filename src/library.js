export const STATE_LABELS = { onemli: 'Önemli', alinacak: 'Alınacak', alindi: 'Satın alındı', okunuyor: 'Okunuyor', okundu: 'Okundu', araverildi: 'Ara verdim', birakildi: 'Bıraktım' };
export const QUALITY_LABELS = { ok: 'Kaynakta doğrulanmış', warn: 'Baskı / çeviri uyarısı', unverified: 'Künye eksik', avoid: 'Kaçınılacak baskı notu' };
export const ORIGIN_LABELS = { atlas: 'Kitap Atlası', local: 'Okuma Kümeleri', kitaps: 'Kitaps' };
export const emptyFilters = () => ({ query: '', categories: [], collections: [], groups: [], states: [], authors: [], origins: [], awards: [], awardYears: [], qualities: [], categoryMode: 'any', collectionMode: 'any', hasEdition: false, shared: false, yearMin: '', yearMax: '' });
export const normalize = value => String(value ?? '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'");
export function prepareBooks(books) {
 return books.map(book => ({ ...book, searchText: normalize([book.title, book.titleTr, book.cover?.title, book.cover?.publisher, book.cover?.isbn, book.author, ...book.aliases, ...(book.verifiedEdition?.translators||[]), book.verifiedEdition?.publisher, book.verifiedEdition?.isbn, ...book.editions.flatMap(e => [e.translator,e.publisher,e.turkish,e.original]), ...book.notes.map(n=>n.text)].join(' ')) }));
}
const matchesValues = (actual, selected, mode = 'any') => !selected.length || (mode === 'all' ? selected.every(x => actual.includes(x)) : selected.some(x => actual.includes(x)));
export function filterBooks(books, filters, states = {}) {
 const f = { ...emptyFilters(), ...filters };
 const tokens = normalize(f.query).trim().split(/\s+/).filter(Boolean);
 return books.filter(b => {
  if (!tokens.every(t => b.searchText.includes(t))) return false;
  if (!matchesValues(b.categories, f.categories, f.categoryMode)) return false;
  if (!matchesValues(b.collectionIds, f.collections, f.collectionMode)) return false;
  if (!matchesValues(b.groupIds, f.groups)) return false;
  if (!matchesValues(states[b.id] || [], f.states)) return false;
  if (!matchesValues([b.author], f.authors)) return false;
  if (!matchesValues(b.origins, f.origins)) return false;
  if (!matchesValues(b.editions.flatMap(e => e.status || []), f.qualities)) return false;
  if (f.hasEdition && !b.verifiedEdition && !b.editions.some(e => e.translator || e.publisher)) return false;
  if (f.shared && b.collectionIds.length < 2) return false;
  if ((f.yearMin !== '' || f.yearMax !== '') && !b.years.some(y => (f.yearMin === '' || y >= Number(f.yearMin)) && (f.yearMax === '' || y <= Number(f.yearMax)))) return false;
  // The award and its year must match the SAME membership, not two unrelated records.
  if ((f.awards.length || f.awardYears.length) && !b.memberships.some(m => m.collectionId === 'ft' && matchesValues([m.award],f.awards) && matchesValues([String(m.awardYear)],f.awardYears))) return false;
  return true;
 });
}
export function sortBooks(books, sort, states = {}) {
 const collator = new Intl.Collator('tr', { sensitivity: 'base', numeric: true });
 const title = b => b.titleTr || b.title;
 return [...books].sort((a,b) => {
  const tie = () => collator.compare(title(a),title(b));
  if (sort === 'shared') return b.collectionIds.length - a.collectionIds.length || tie();
  if (sort === 'author') return collator.compare(a.author,b.author) || tie();
  if (sort === 'newest') return Math.max(0,...b.years) - Math.max(0,...a.years) || tie();
  if (sort === 'saved') return Number((states[b.id]||[]).includes('onemli')) - Number((states[a.id]||[]).includes('onemli')) || tie();
  return tie();
 });
}
export function toggleState(current, key) {
 const result = new Set(current || []);
 if (result.has(key)) result.delete(key);
 else {
  result.add(key);
  const opposite = { alinacak: 'alindi', alindi: 'alinacak', okunuyor: 'okundu', okundu: 'okunuyor' }[key];
  if (opposite) result.delete(opposite);
  const readingStates=['okunuyor','okundu','araverildi','birakildi'];
  if(readingStates.includes(key))for(const state of readingStates)if(state!==key)result.delete(state);
 }
 return [...result];
}
export function migrateStates(books, own, legacy) {
 const result = Object.fromEntries(Object.entries(own || {}).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.filter(s=>s in STATE_LABELS)]));
 for (const b of books) {
  if (Object.hasOwn(result,b.id)) continue;
  const values = b.legacyKeys.flatMap(k => Array.isArray(legacy?.[k]) ? legacy[k] : []).filter(s => s in STATE_LABELS);
  if (values.length) result[b.id] = [...new Set(values)];
 }
 return result;
}
export function filterCount(f) {
 return Object.entries(f).reduce((n,[k,v])=>n + (k.endsWith('Mode') ? 0 : Array.isArray(v) ? v.length : v ? 1 : 0),0);
}
export function decodeRoute(hash, catalog) {
 const defaults = { filters: emptyFilters(), view:'books', sort:'shared', book:null };
 const raw = hash.replace(/^#/, '');
 if (catalog.collections.some(c=>c.id===raw)) return {...defaults,filters:{...emptyFilters(),collections:[raw]}};
 if (raw==='overview') return {...defaults,view:'collections'};
 if (raw==='sources') return {...defaults,view:'notes'};
 try {
  const p = new URLSearchParams(raw);
  const parsed = JSON.parse(p.get('f') || '{}');
  for (const [k,v] of Object.entries(parsed)) {
   if (!(k in defaults.filters)) continue;
   if (Array.isArray(defaults.filters[k]) && Array.isArray(v)) defaults.filters[k] = v.filter(x=>typeof x==='string');
   else if (typeof v===typeof defaults.filters[k] || ['yearMin','yearMax'].includes(k) && typeof v==='number') defaults.filters[k]=v;
  }
  return {...defaults,view:['books','owned','queue','collections','notes'].includes(p.get('view'))?p.get('view'):'books',sort:['title','author','shared','newest','saved'].includes(p.get('sort'))?p.get('sort'):'shared',book:catalog.books.some(b=>b.id===p.get('book'))?p.get('book'):null};
 } catch { return defaults; }
}
export function encodeRoute(route) {
 const p = new URLSearchParams();
 if (route.view!=='books')p.set('view',route.view);
 const f = Object.fromEntries(Object.entries(route.filters).filter(([k,v])=>Array.isArray(v)?v.length:v && (!k.endsWith('Mode') || v==='all')));
 if(Object.keys(f).length)p.set('f',JSON.stringify(f));
 if(route.sort!=='shared')p.set('sort',route.sort);
 if(route.book)p.set('book',route.book);
 return p.toString();
}

// Keep source meaning while rendering the user's library without emoji.
export function plainTextMarkers(text) {
 return text.replace(/\u2705\uFE0F?/gu,'[Doğrulandı]')
  .replace(/\u26A0\uFE0F?/gu,'[Dikkat]')
  .replace(/\u2753\uFE0F?/gu,'[Doğrulanmadı]')
  .replace(/\u{1F6AB}\uFE0F?/gu,'[Bu baskıdan kaçın]');
}

export function booksForShelf(books,states,shelf='catalog') {
 return books.filter(book=>shelf==='owned'?(states[book.id]||[]).includes('alindi'):!(states[book.id]||[]).includes('alindi'));
}
