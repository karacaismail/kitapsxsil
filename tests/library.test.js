import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { prepareBooks, filterBooks, emptyFilters, toggleState, migrateStates, decodeRoute, encodeRoute } from '../src/library.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../src/catalog.json',import.meta.url)));
const books=prepareBooks(catalog.books);
const filter=(f,states)=>filterBooks(books,{...emptyFilters(),...f},states);
test('all three inputs and every record survive the merge',()=>{
 const atlas=JSON.parse(fs.readFileSync(new URL('../data/sources/atlas-v1.json',import.meta.url)));
 const kitaps=JSON.parse(fs.readFileSync(new URL('../data/sources/kitaps.json',import.meta.url)));
 const local=JSON.parse(fs.readFileSync(new URL('../data/sources/okuma-kumeleri.json',import.meta.url)));
 assert.equal(books.length,new Set(books.map(b=>b.id)).size);
 for(const c of atlas.collections)for(const g of c.groups)for(const b of g.books){
  const merged=books.find(x=>x.id===catalog.mapping['atlas:'+b.key]);
  assert.ok(merged?.collectionIds.includes(c.id),b.title);
 }
 for(const b of kitaps.books)assert.ok(books.some(x=>x.editions.some(e=>e.key===b.key)),b.key);
 for(const b of local.books)assert.ok(books.some(x=>[x.title,...x.aliases].includes(b.title)),b.title);
 for(const b of books){assert.ok(b.title);assert.ok(b.memberships.length);assert.ok(b.categories.length);}
});
test('non-Latin titles and missing original titles remain distinct',()=>{
 assert.equal(filter({query:'Dostoyevski'}).length,4);
 assert.ok(filter({query:'Abartma Tozu'}).length===1);
 assert.ok(filter({query:'Yılankale'}).length===1);
});
test('translated titles merge and memberships include secondary collections',()=>{
 const book=filter({query:'Şamatalı Köyün Çocukları'})[0];
 assert.equal(filter({query:'Şamatalı Köyün Çocukları'}).length,1);
 assert.ok(book.collectionIds.includes('kitaps-E'));assert.ok(book.collectionIds.includes('kitaps-P'));
 assert.ok(filter({collections:['kitaps-M'],query:'rumelt'}).length===1);
});
test('category OR, category AND and collection/category intersection',()=>{
 const a=filter({categories:['strategy']});const b=filter({categories:['psychology']});
 const either=filter({categories:['strategy','psychology']});
 assert.equal(either.length,new Set([...a,...b].map(b=>b.id)).size);
 const both=filter({categories:['strategy','psychology'],categoryMode:'all'});
 assert.ok(both.length>0&&both.length<either.length);
 assert.ok(both.every(b=>b.categories.includes('strategy')&&b.categories.includes('psychology')));
 assert.ok(filter({collections:['time','core'],collectionMode:'all'}).length===4);
 const mixed=filter({categories:['strategy'],collections:['kitaps-A'],hasEdition:true});
 assert.ok(mixed.length>0);assert.ok(mixed.every(b=>b.collectionIds.includes('kitaps-A')&&b.categories.includes('strategy')&&b.editions.length));
});
test('FT award filters pair year and award on the same record',()=>{
 assert.equal(filter({awards:['Kazanan']}).length,21);
 assert.equal(filter({awards:['Kazanan'],awardYears:['2026']}).length,0);
 assert.equal(filter({awards:['Kazanan'],awardYears:['2025']}).length,1);
 const synthetic=prepareBooks([{...books[0],memberships:[{collectionId:'ft',award:'Kazanan',awardYear:2020},{collectionId:'ft',award:'Kısa liste',awardYear:2021}]}]);
 assert.equal(filterBooks(synthetic,{...emptyFilters(),awards:['Kazanan'],awardYears:['2021']}).length,0);
});
test('Turkish search, multi-token search and unknown publication years',()=>{
 assert.equal(filter({query:'SISTEMLERLE DUSUNMEK'}).length,1);
 assert.ok(filter({query:'Rumelt Cengiz'}).length===1);
 assert.ok(filter({yearMin:2000}).every(b=>b.years.some(y=>y>=2000)));
 assert.equal(filter({yearMin:2025,yearMax:1990}).length,0);
});
test('reading states migrate across all edition keys; explicit cleared states stay cleared',()=>{
 const b=books.find(b=>b.editions.length>1&&b.legacyKeys.length>1);
 const migrated=migrateStates(books,{},Object.fromEntries(b.legacyKeys.map((k,i)=>[k,[i%2?'okundu':'onemli']])));
 assert.ok(migrated[b.id].includes('onemli'));assert.ok(migrated[b.id].includes('okundu'));
 assert.deepEqual(migrateStates(books,{[b.id]:[]},{[b.legacyKeys[0]]:['onemli']})[b.id],[]);
 assert.deepEqual(toggleState(['onemli','alinacak'],'alindi'),['onemli','alindi']);
 assert.deepEqual(toggleState(['okunuyor'],'okundu'),['okundu']);
 assert.equal(filter({states:['onemli']},{[b.id]:['onemli']}).length,1);
});
test('filters survive shareable URL and malformed routes recover',()=>{
 const route={view:'books',sort:'title',book:books[0].id,filters:{...emptyFilters(),categories:['strategy','psychology'],categoryMode:'all',yearMin:1980,query:'İyi Strateji'}};
 assert.deepEqual(decodeRoute('#'+encodeRoute(route),catalog),route);
 assert.equal(decodeRoute('#f=broken',catalog).filters.query,'');
});
