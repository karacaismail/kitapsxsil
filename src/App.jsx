import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Accordion, ActionIcon, Alert, Anchor, Badge, Box, Button, Card, Checkbox, Chip, Container, Divider, Drawer, FileButton, Group, MantineProvider, MultiSelect, NumberInput, Paper, Select, Stack, Switch, Text, TextInput, ThemeIcon, Title, createTheme } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconArrowUpRight, IconBook2, IconBooks, IconCheck, IconChevronRight, IconDownload, IconFilter, IconLayersIntersect, IconListNumbers, IconNotes, IconSearch, IconStar, IconUpload, IconX } from '@tabler/icons-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '@mantine/core/styles.css';
import '@fontsource-variable/josefin-sans/wght.css';
import '@fontsource-variable/josefin-sans/wght-italic.css';
import catalog from './catalog.json';
import readingNotes from '../data/sources/kitaplar.md?raw';
import originalAtlas from '../data/sources/atlas-v1.json';
import originalLocal from '../data/sources/okuma-kumeleri.json';
import originalKitaps from '../data/sources/kitaps.json';
import SpotlightCard from './components/SpotlightCard';
import NoteCards from './components/NoteCards';
import ReadingPanel, { QueueButton } from './components/ReadingPanel';
import ReadingQueue from './components/ReadingQueue';
import { PERSONAL_KEY, cleanPersonal, cleanReading, addToQueue, moveInQueue, restorePersonal, todayLocal } from './reading';
import { STATE_LABELS, QUALITY_LABELS, ORIGIN_LABELS, emptyFilters, prepareBooks, filterBooks, sortBooks, toggleState, migrateStates, filterCount, decodeRoute, encodeRoute, normalize, plainTextMarkers, booksForShelf } from './library';
import './styles.css';

const theme = createTheme({
 fontFamily:'"Josefin Sans Variable", sans-serif', primaryColor:'forest', primaryShade:8, defaultRadius:'md', cursorType:'pointer',
 colors:{forest:['#eef4ef','#d8e6dc','#b3cdbb','#89b199','#67987c','#508768','#417456','#326245','#244e37','#183d2f']},
 fontSizes:{xs:'1rem',sm:'1rem',md:'1rem',lg:'1.125rem',xl:'1.25rem'},
 headings:{fontFamily:'"Josefin Sans Variable", sans-serif',fontWeight:'500',sizes:{h1:{fontSize:'3rem',lineHeight:'1.06'},h2:{fontSize:'2rem',lineHeight:'1.15'},h3:{fontSize:'1.5rem',lineHeight:'1.25'}}},
 components:{Button:{defaultProps:{size:'md'}},ActionIcon:{defaultProps:{size:44}},TextInput:{defaultProps:{size:'md'}},Select:{defaultProps:{size:'md'}},MultiSelect:{defaultProps:{size:'md'}},Badge:{defaultProps:{size:'lg',variant:'light',radius:'sm'}},Drawer:{defaultProps:{closeButtonProps:{'aria-label':'Kapat'},overlayProps:{backgroundOpacity:.35,blur:3}}}}
});
const books=prepareBooks(catalog.books);
const byId=Object.fromEntries(books.map(b=>[b.id,b]));
const collectionMap=Object.fromEntries(catalog.collections.map(c=>[c.id,c]));
const groupMap=Object.fromEntries(catalog.groups.map(g=>[g.id,g]));
const categoryMap=Object.fromEntries(catalog.categories.map(c=>[c.id,c]));
const STATE_KEY='kitapatlasi:states:v2';
const pageSize=24;
const sourceOptions=Object.entries(ORIGIN_LABELS).map(([value,label])=>({value,label}));
const categoryOptions=catalog.categories.map(c=>({value:c.id,label:c.label}));
const collectionOptions=catalog.collections.map(c=>({value:c.id,label:c.short}));
const authorOptions=[...new Set(books.map(b=>b.author).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'tr'));
const selectFilter=({options,search,limit})=>options.filter(o=>normalize(o.label).includes(normalize(search))).slice(0,limit||50);
const commonMulti={searchable:true,clearable:true,nothingFoundMessage:'Eşleşme bulunamadı',filter:selectFilter,limit:50,clearButtonProps:{'aria-label':'Seçimi temizle'}};
const safeRead=key=>{try{return JSON.parse(localStorage.getItem(key)||'{}')}catch{return {}}};
const loadStates=()=>migrateStates(books,safeRead(STATE_KEY),safeRead('kitaps:states:v1'));
function download(name,data,type='application/json') {
 const url=URL.createObjectURL(new Blob([typeof data==='string'?data:JSON.stringify(data,null,2)],{type}));
 const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function SourceBadge({id}) {return <Badge color={id==='kitaps'?'grape':id==='local'?'orange':'forest'}>{ORIGIN_LABELS[id]}</Badge>}
function FilterEditor({value:f,onChange}) {
 const set=(key,value)=>onChange({...f,[key]:value});
 const availableGroups=catalog.groups.filter(g=>!f.collections.length||f.collections.includes(g.collectionId));
 return <Stack gap="xl">
  <Text c="dimmed">Farklı alanlar birlikte uygulanır. Aynı alandaki seçimlerden biri yeterlidir; istersen tümünün eşleşmesini isteyebilirsin.</Text>
  <div className="filter-grid">
   <Stack gap="sm"><MultiSelect {...commonMulti} label="Kategoriler" placeholder={f.categories.length?undefined:"Birden fazla kategori seç"} data={categoryOptions} value={f.categories} onChange={v=>set('categories',v)}/><Switch label="Seçili kategorilerin tümü eşleşsin" checked={f.categoryMode==='all'} onChange={e=>set('categoryMode',e.currentTarget.checked?'all':'any')}/></Stack>
   <Stack gap="sm"><MultiSelect {...commonMulti} label="Kitap kümeleri" placeholder={f.collections.length?undefined:"Kaynak veya okuma rotası"} data={collectionOptions} value={f.collections} onChange={v=>onChange({...f,collections:v,groups:f.groups.filter(id=>!v.length||v.includes(groupMap[id]?.collectionId))})}/><Switch label="Seçili kümelerin tümünde bulunsun" checked={f.collectionMode==='all'} onChange={e=>set('collectionMode',e.currentTarget.checked?'all':'any')}/></Stack>
   <MultiSelect {...commonMulti} label="Alt kümeler" placeholder={f.groups.length?undefined:"Konu, ders veya yıl grubu"} data={availableGroups.map(g=>({value:g.id,label:`${collectionMap[g.collectionId].short} · ${g.title}`}))} value={f.groups} onChange={v=>set('groups',v)}/>
   <MultiSelect {...commonMulti} label="Okuma durumum" placeholder="Önemli, okunuyor, alınacak…" data={Object.entries(STATE_LABELS).filter(([value])=>value!=='alindi').map(([value,label])=>({value,label}))} value={f.states} onChange={v=>set('states',v)}/>
   <MultiSelect {...commonMulti} label="Yazar" placeholder="Yazar adına göre seç" data={authorOptions} value={f.authors} onChange={v=>set('authors',v)}/>
   <MultiSelect {...commonMulti} label="Verinin geldiği kaynak" placeholder="Üç kaynağın tamamı" data={sourceOptions} value={f.origins} onChange={v=>set('origins',v)}/>
  </div>
  <Divider label="Künye ve baskı bilgisi" labelPosition="left"/>
  <MultiSelect {...commonMulti} label="Kaynakta belirtilen künye durumu" placeholder="Uyarı veya doğrulama işareti" data={Object.entries(QUALITY_LABELS).map(([value,label])=>({value,label}))} value={f.qualities} onChange={v=>set('qualities',v)}/>
  <Checkbox label="Yalnızca çevirmen veya yayınevi bilgisi olanlar" checked={f.hasEdition} onChange={e=>set('hasEdition',e.currentTarget.checked)}/>
  <Checkbox label="Birden fazla kitap kümesinde bulunanlar" checked={f.shared} onChange={e=>set('shared',e.currentTarget.checked)}/>
  <Divider label="Yıllar ve FT ödülleri" labelPosition="left"/>
  <div className="filter-grid">
   <MultiSelect {...commonMulti} label="FT ödül durumu" placeholder="Bütün durumlar" data={['Kazanan','Kısa liste','Uzun liste']} value={f.awards} onChange={v=>set('awards',v)}/>
   <MultiSelect {...commonMulti} label="FT ödül yılı" placeholder="2005–2026" data={Array.from({length:22},(_,i)=>String(2026-i))} value={f.awardYears} onChange={v=>set('awardYears',v)}/>
   <NumberInput label="İlk yayın yılı · en erken" placeholder="Sınır yok" value={f.yearMin} onChange={v=>set('yearMin',v)} min={-3000} max={2100} allowDecimal={false} hideControls size="md"/>
   <NumberInput label="İlk yayın yılı · en geç" placeholder="Sınır yok" value={f.yearMax} onChange={v=>set('yearMax',v)} min={-3000} max={2100} allowDecimal={false} hideControls size="md"/>
  </div>
  <Text c="dimmed">İlk yayın yılı yalnızca kaynakta bu bilgi bulunan kitaplarda kayıtlıdır. Yıl sınırı seçildiğinde yılı bilinmeyen kitaplar sonuçlardan çıkar. FT ödül yılı ayrı bir ölçüttür.</Text>
  {f.yearMin!==''&&f.yearMax!==''&&Number(f.yearMin)>Number(f.yearMax)&&<Alert color="orange">En erken yıl, en geç yıldan büyük olamaz.</Alert>}
 </Stack>
}
function ActiveFilters({filters:f,onChange}) {
 const chips=[];
 const labels={categories:id=>categoryMap[id]?.label,collections:id=>collectionMap[id]?.short,groups:id=>groupMap[id]?.title,states:id=>STATE_LABELS[id],authors:id=>id,origins:id=>ORIGIN_LABELS[id],awards:id=>id,awardYears:id=>`FT ${id}`,qualities:id=>QUALITY_LABELS[id]};
 for(const [key,label] of Object.entries(labels))for(const value of f[key])chips.push({id:`${key}-${value}`,label:label(value)||value,remove:()=>onChange({...f,[key]:f[key].filter(v=>v!==value)})});
 if(f.hasEdition)chips.push({id:'edition',label:'Künye bilgisi var',remove:()=>onChange({...f,hasEdition:false})});
 if(f.shared)chips.push({id:'shared',label:'Birden fazla kümede',remove:()=>onChange({...f,shared:false})});
 if(f.yearMin!==''||f.yearMax!=='')chips.push({id:'years',label:`Yayın: ${f.yearMin||'…'}–${f.yearMax||'…'}`,remove:()=>onChange({...f,yearMin:'',yearMax:''})});
 return chips.length?<Group gap={8} className="active-filters" aria-label="Etkin filtreler">{chips.map(c=><Button key={c.id} variant="light" rightSection={<IconX size={17}/>} onClick={c.remove} aria-label={`${c.label} filtresini kaldır`}>{c.label}</Button>)}</Group>:null;
}
function BookCover({book:b,onOpen,detail=false}) {
 const [failed,setFailed]=useState(false);
 const cover=b.cover;
 const content=cover&&!failed?<img src={globalThis.__KITAP_COVERS__?.[cover.src]||`./${cover.src}`} alt={`${cover.title} — ${cover.publisher}, Türkçe baskı kapağı`} width="240" height="360" loading={detail?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>:<span className="cover-placeholder"><IconBook2 size={42} stroke={1.2} aria-hidden="true"/><span>Kapak henüz eklenmedi</span></span>;
 return detail?<div className="cover-stage cover-stage-detail">{content}</div>:<button className="cover-stage cover-open" onClick={()=>onOpen(b.id)} aria-label={`${b.titleTr||b.title} ayrıntılarını aç`}>{content}</button>;
}
function BookCard({book:b,states,onOpen,onToggle,queue,onAdd,onQueue}) {
 const saved=(states[b.id]||[]).includes('onemli');
 return <Card component="article" withBorder padding={0} radius="lg" className="book-card" data-book-id={b.id}>
  <div className="book-visual"><BookCover book={b} onOpen={onOpen}/><ActionIcon className="cover-save" variant="white" color={saved?'forest':'gray'} aria-label={`${b.title}: önemli ${saved?'işaretini kaldır':'olarak işaretle'}`} aria-pressed={saved} onClick={()=>onToggle(b.id,'onemli')}><IconStar size={22} fill={saved?'currentColor':'none'}/></ActionIcon></div>
  <div className="book-card-body">
   <Text className="book-kicker">{b.collectionIds.length} kümede{b.years.length?` · ${b.years[0]}`:''}</Text>
   <Title order={3}><button className="title-button" onClick={()=>onOpen(b.id)}>{b.titleTr||b.title}</button></Title>
   <Text className="book-author">{b.author||'Yazar bilgisi kaynakta belirtilmemiş'}</Text>
   {b.cover&&<Text className="book-publisher">{b.cover.publisher}</Text>}
   <Group gap={8} className="book-tags">{b.categories.slice(0,2).map(id=><Badge key={id} variant="outline" color="gray">{categoryMap[id].label}</Badge>)}{b.categories.length>2&&<Badge color="gray">+{b.categories.length-2}</Badge>}</Group>
   <div className="book-bottom"><Button fullWidth variant="light" rightSection={<IconArrowUpRight size={19}/>} onClick={()=>onOpen(b.id)} aria-label={`${b.title} kitabını incele`}>Kitabı incele</Button></div>
   <Button className="ownership-button" fullWidth variant={(states[b.id]||[]).includes('alindi')?'default':'subtle'} onClick={()=>onToggle(b.id,'alindi')} aria-label={`${b.title}: ${(states[b.id]||[]).includes('alindi')?'satın alındı işaretini kaldır':'satın alındı olarak işaretle'}`}>{(states[b.id]||[]).includes('alindi')?'Kitaplığımda · geri al':'Satın aldım'}</Button>
   <QueueButton id={b.id} queue={queue} onAdd={onAdd} onQueue={onQueue} fullWidth/>
   {(states[b.id]||[]).filter(s=>s!=='onemli').length>0&&<Group gap={8} mt="sm">{states[b.id].filter(s=>s!=='onemli').map(s=><Badge key={s} color="forest">{STATE_LABELS[s]}</Badge>)}</Group>}
  </div>
 </Card>
}
function BookDetail({book:b,onClose,states,onToggle,onCollection,onCategory,personal,onReading,onAdd,onQueue,storageError}) {
 return <Drawer opened={!!b} onClose={onClose} position="right" size="min(100%, 640px)" title="Kitap ayrıntısı" className="detail-drawer">
  {b&&<Stack gap="xl" pb="xl">
   <div className="detail-cover-block"><BookCover key={b.id} book={b} detail/>{b.cover&&<div className="cover-caption"><Text fw={500}>{b.cover.title}</Text><Text c="dimmed">{b.cover.publisher} · Türkçe baskı</Text><Text c="dimmed">ISBN {b.cover.isbn}</Text><Anchor href={b.cover.sourceUrl} target="_blank" rel="noreferrer" className="source-link">Baskının kaynak sayfası <IconArrowUpRight size={17}/></Anchor><Text c="dimmed">Kapak bu baskıya aittir; aşağıda diğer çeviri ve baskı notları da bulunabilir.</Text></div>}</div>
   <div><Group gap={8} mb="md">{b.origins.map(id=><SourceBadge id={id} key={id}/>)}</Group><Title order={2}>{b.titleTr||b.title}</Title>{b.titleTr&&<Text c="dimmed" mt="sm">{b.title}</Text>}<Text mt="md">{b.author||'Yazar bilgisi belirtilmemiş'}{b.years.length?` · ${b.years.join(' / ')}`:''}</Text></div>
   <Paper withBorder p="md" radius="lg"><Text fw={600} mb="sm">Benim kitaplığım</Text><Group gap={8}>{Object.entries(STATE_LABELS).filter(([key])=>['onemli','alinacak','alindi'].includes(key)).map(([key,label])=><Button variant={(states[b.id]||[]).includes(key)?'filled':'light'} key={key} aria-pressed={(states[b.id]||[]).includes(key)} onClick={()=>onToggle(b.id,key)} leftSection={(states[b.id]||[]).includes(key)?<IconCheck size={17}/>:null}>{label}</Button>)}</Group><Text c="dimmed" mt="sm">İşaretlerin bu tarayıcıda saklanır.</Text></Paper>
   <ReadingPanel book={b} record={personal.reading[b.id]} states={states[b.id]||[]} onToggle={onToggle} onChange={onReading} queue={personal.queue} onAdd={onAdd} onQueue={onQueue} storageError={storageError}/>
   <div><Title order={3} mb="sm">Kategoriler</Title><Group gap={8}>{b.categories.map(id=><Button variant="light" key={id} onClick={()=>onCategory(id)}>{categoryMap[id].label}</Button>)}</Group></div>
   {b.editions.length>0&&<div><Title order={3} mb="md">Çeviriler ve baskılar</Title><Stack gap="md">{b.editions.map((e,i)=><Paper withBorder p="md" radius="md" key={e.id+'-'+i}>
    <Text fw={600}>{e.translator||'Çevirmen belirtilmemiş'}</Text><Text mt={6}>{e.publisher||'Yayınevi kaynakta belirtilmemiş'}</Text>
    {e.original&&e.original!==b.title&&<Text c="dimmed" mt="sm">{e.original}</Text>}{e.note&&<Text mt="md" className="long-copy">{e.note}</Text>}
    {e.status?.length>0&&<Group mt="md" gap={8}>{e.status.map(s=><Badge key={s} color={s==='ok'?'forest':s==='unverified'?'gray':'orange'}>{QUALITY_LABELS[s]}</Badge>)}</Group>}
    {e.trust&&<Text c="dimmed" mt="md">Kaynağın künye puanı: {e.trust.score}/5 · {e.trust.why}</Text>}
    {e.alt&&<div className="alternative"><Text fw={500}>İkinci seçenek: {e.alt.name}</Text>{e.alt.publisher&&<Text>{e.alt.publisher}</Text>}<Text c="dimmed">Kaynağın puanı: {e.alt.score}/5</Text></div>}
   </Paper>)}</Stack><Text c="dimmed" mt="sm">Bu değerlendirmeler Kitaps kaynağından aktarılmıştır; künye puanı kitabın kalitesini ölçmez.</Text></div>}
   {b.notes.length>0&&<div><Title order={3} mb="md">Okuma notları</Title><Stack gap="md">{b.notes.map((n,i)=><Box className="note-block" key={i}><Text>{n.text}</Text><Text c="dimmed" mt={6}>{n.source}</Text></Box>)}</Stack></div>}
   <div><Title order={3} mb="md">Yer aldığı kümeler</Title><Stack gap="sm">{b.collectionIds.map(id=>{
    const memberships=b.memberships.filter(m=>m.collectionId===id);return <Paper key={id} withBorder p="md"><Button variant="subtle" className="membership-link" onClick={()=>onCollection(id)} rightSection={<IconArrowRight size={18}/>}>{collectionMap[id].title}</Button><Text c="dimmed" mt="sm">{[...new Set(memberships.map(m=>groupMap[m.groupId].title))].join(' · ')}</Text>{memberships.filter(m=>m.award).map(m=><Badge key={m.groupId} mt="sm">{m.awardYear} · {m.award}</Badge>)}{memberships.find(m=>m.source)&&<Anchor className="source-link" href={memberships.find(m=>m.source).source} target="_blank" rel="noreferrer">Özgün kaynağı aç <IconArrowUpRight size={17}/></Anchor>}</Paper>
   })}</Stack></div>
   {b.tags.length>0&&<Text c="dimmed">Okuma Kümeleri dosyasındaki etiketler: {b.tags.map(t=>catalog.sourceTags[t]).join(' · ')}. Bunlar kişisel işaretlerinden ayrıdır.</Text>}
  </Stack>}
 </Drawer>
}
function Collections({onCollection,onGroup,states}) {
 const [query,setQuery]=useState('');
 const available=booksForShelf(books,states);
 const collectionCount=id=>available.filter(b=>b.collectionIds.includes(id)).length;
 const groupCount=id=>available.filter(b=>b.groupIds.includes(id)).length;
 const shown=catalog.collections.filter(c=>normalize(c.title+' '+c.description).includes(normalize(query)));
 return <Stack gap="xl"><div><Title order={2}>Her seçkinin bir bağlamı var.</Title><Text c="dimmed" mt="sm">Kaynakların kendi kümeleri ve alt listeleri korunuyor. Satın aldıkların Kitaplığım’da; aşağıdaki sayılar keşfedilecek kitapları gösterir.</Text></div>
  <TextInput label="Kümeler arasında ara" placeholder="TIME, çocuk, strateji…" value={query} onChange={e=>setQuery(e.currentTarget.value)} leftSection={<IconSearch size={20}/>}/>
  <Accordion variant="separated" radius="lg" className="collections-accordion">{shown.map(c=><Accordion.Item key={c.id} value={c.id}>
   <Accordion.Control><Group gap="md" wrap="nowrap"><ThemeIcon variant="light" size={48} color={c.origin==='kitaps'?'grape':'forest'} radius="md"><Text fw={600}>{c.mark}</Text></ThemeIcon><div><Text fw={600}>{c.title}</Text><Text c="dimmed">{collectionCount(c.id)} keşfedilecek · {c.count} kaynak kaydı · {c.groupIds.length} alt küme</Text></div></Group></Accordion.Control>
   <Accordion.Panel><Stack gap="md"><Text>{c.description}</Text>{c.context?.purpose&&<Text><strong>Okuma amacı:</strong> {c.context.purpose}</Text>}{c.context?.criterion&&<Text><strong>Seçim ölçütü:</strong> {c.context.criterion}</Text>}{c.context?.verdict&&<Box className="note-block"><Text>{c.context.verdict}</Text></Box>}<Text c="dimmed">{c.note}</Text><Button onClick={()=>onCollection(c.id)} rightSection={<IconArrowRight size={18}/>}>Bu kümedeki kitaplar</Button><Stack gap={8}>{c.groupIds.map(id=><Button key={id} variant="default" onClick={()=>onGroup(c.id,id)} className="subset-button" justify="space-between" rightSection={<IconChevronRight size={19}/>}>{groupMap[id].title} · {groupCount(id)}</Button>)}</Stack>{c.source&&<Anchor href={c.source} target="_blank" rel="noreferrer">Özgün liste <IconArrowUpRight size={16}/></Anchor>}</Stack></Accordion.Panel>
  </Accordion.Item>)}</Accordion>{!shown.length&&<Text>Bu aramayla eşleşen küme yok.</Text>}
 </Stack>
}
function Notes({states,setStates,personal,setPersonal}) {
 const [message,setMessage]=useState('');
 const sections=useMemo(()=>plainTextMarkers(readingNotes).split(/(?=^## )/m),[]);
 const importStates=async file=>{
  if(!file)return;
  try {
   const input=JSON.parse(await file.text());
   if(!input||typeof input!=='object'||Array.isArray(input))throw Error();
   const supplied=input.states||(('queue' in input||'reading' in input)?{}:input);
   if(!supplied||typeof supplied!=='object'||Array.isArray(supplied))throw Error();
   const valid=Object.fromEntries(Object.entries(supplied).filter(([id,v])=>Object.hasOwn(byId,id)&&Array.isArray(v)).map(([id,v])=>[id,v.filter(s=>s in STATE_LABELS)]));
   setStates(prev=>({...prev,...valid}));
   setPersonal(prev=>restorePersonal(prev,input,books.map(b=>b.id)));
   const clean=cleanPersonal(input,books.map(b=>b.id));
   setMessage(`${Object.keys(valid).length} kitabın işaretleri ve ${Object.keys(clean.reading).length} okuma kaydı içe aktarıldı.${Array.isArray(input.queue)?` Okuma sırası ${clean.queue.length} kitapla geri yüklendi.`:''}`);
  }catch{setMessage('Dosya okunamadı. Bu siteden dışa aktarılmış bir JSON dosyası seç.');}
 };

 return <Stack gap="xl">
  <div><Title order={2}>Notlar kaybolmasın.</Title><Text mt="sm" c="dimmed">Üç kitaplığın kaynakları, ayrıntılı okuma rotaları ve çeviri notları bir arada.</Text></div>
  <Paper withBorder p="lg" radius="lg"><Title order={3}>Birleşimin kapsamı</Title><Text mt="md">Kitap Atlası’ndaki 619 liste kaydı ve iki rehber; Okuma Kümeleri dosyasındaki 52 kitap ve seçki açıklamaları; Kitaps’taki 170 künye kaydı ve tam kaynak notları birleştirildi.</Text><Text mt="sm">Aynı eserlerin küme üyelikleri, başlık karşılıkları ve farklı çevirileri tek kayıtta toplandı. Grafik uyarlamalar ve derlemeler ayrı eser olarak korundu.</Text><Group mt="md" gap={8}>{Object.keys(ORIGIN_LABELS).map(id=><SourceBadge id={id} key={id}/>)}</Group></Paper>
  <Paper withBorder p="lg" radius="lg"><Title order={3}>Kişisel kitaplığını yedekle</Title><Text mt="sm">Okuma sıran, durumların, tarihler, sayfa ilerlemen ve kişisel notların bu tarayıcıda saklanır. Hepsini yedekleyip başka bir cihaza taşıyabilirsin. Eski işaret dosyaları da desteklenir. Okuma sırası bulunan bir yedek, mevcut sıranın yerini alır; diğer kayıtlar birleştirilir.</Text><Group mt="md"><Button variant="light" leftSection={<IconDownload size={19}/>} onClick={()=>download('kitap-atlasi-kisisel-yedek.json',{version:3,exportedAt:new Date().toISOString(),states,...personal})}>Kişisel yedeğimi indir</Button><FileButton onChange={importStates} accept="application/json">{props=><Button {...props} variant="default" leftSection={<IconUpload size={19}/>}>Yedekten aktar</Button>}</FileButton></Group>{message&&<Text mt="md" role="status">{message}</Text>}</Paper>
  <div><Title order={3}>Tam veri ve kaynaklar</Title><Text c="dimmed" mt="sm">Kategoriler bu birleşik katalog için düzenlenmiş konu etiketleridir; kaynakların özgün sıralamalarından bağımsızdır. Bir kitap birden fazla kategoriye girebilir.</Text><Group mt="md"><Button variant="light" leftSection={<IconDownload size={19}/>} onClick={()=>download('kitap-atlasi-tum-veri.json',{catalog,sources:{atlas:originalAtlas,okumaKumeleri:originalLocal,kitaps:originalKitaps,kitapsNotes:readingNotes}})}>Tüm kataloğu indir</Button><Button variant="default" leftSection={<IconDownload size={19}/>} onClick={()=>download('kitaps-kaynak-notlari.md',plainTextMarkers(readingNotes),'text/markdown')}>Kaynak notlarını indir</Button></Group><Text mt="md">FT arşivi 26 Eylül 2026 görünümünü korur; 2026 kayıtları kaynakta uzun liste olarak işaretliydi. Birleştirme: {catalog.updated}.</Text><Group mt="md"><Anchor href="https://karacaismail.github.io/kitaps/" target="_blank" rel="noreferrer">Kitaps</Anchor><Anchor href="https://github.com/karacaismail/kitapsxsil" target="_blank" rel="noreferrer">Kaynak kod ve veri arşivi</Anchor></Group></div>
  <Divider/>
  <div><Title order={2}>Kaynak dosyanın tamamı</Title><Text c="dimmed" mt="sm">Kitaps’taki okuma sıraları, çeviri karşılaştırmaları, çocuk programı ve araştırma notları. Aşağıdaki değerlendirmeler özgün dosyanın içeriğidir.</Text></div>
  <Accordion variant="separated" radius="lg">{sections.map((s,i)=>{const title=i===0?'Dosyaya giriş':s.split('\n')[0].replace(/^## /,'').replace(/\*/g,'');return <Accordion.Item value={String(i)} key={i}><Accordion.Control>{title}</Accordion.Control><Accordion.Panel><div className="markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{table:NoteCards,a:({href,children})=><Anchor href={href} target="_blank" rel="noreferrer">{children}</Anchor>}}>{i===0?s:s.slice(s.indexOf('\n')+1)}</ReactMarkdown></div></Accordion.Panel></Accordion.Item>})}</Accordion>
 </Stack>
}
function AtlasApp() {
 const [route,setRoute]=useState(()=>decodeRoute(window.location.hash,catalog));
 const {filters,view,sort,book}=route;
 const [states,setStates]=useState(loadStates);
 const [storageError,setStorageError]=useState(false);
 const [personal,setPersonal]=useState(()=>cleanPersonal(safeRead(PERSONAL_KEY),books.map(b=>b.id)));
 const [personalStorageError,setPersonalStorageError]=useState(false);
 const [opened,setOpened]=useState(false);
 const [draft,setDraft]=useState(emptyFilters);
 const [page,setPage]=useState(1);
 const [copied,setCopied]=useState(false);
 const [transfer,setTransfer]=useState(null);
 const resultsRef=useRef(null);
 useEffect(()=>{try{localStorage.setItem(STATE_KEY,JSON.stringify(states));setStorageError(false)}catch{setStorageError(true)}},[states]);
 useEffect(()=>{try{localStorage.setItem(PERSONAL_KEY,JSON.stringify(personal));setPersonalStorageError(false)}catch{setPersonalStorageError(true)}},[personal]);
 useEffect(()=>{const encoded=encodeRoute(route);const url=window.location.pathname+window.location.search+(encoded?'#'+encoded:'');window.history.replaceState(null,'',url)},[route]);
 useEffect(()=>{const change=()=>{setRoute(decodeRoute(window.location.hash,catalog));setPage(1)};window.addEventListener('hashchange',change);window.addEventListener('popstate',change);return()=>{window.removeEventListener('hashchange',change);window.removeEventListener('popstate',change)}},[]);
 const changeFilters=next=>{setRoute(r=>({...r,filters:next}));setPage(1)};
 const shelfBooks=useMemo(()=>booksForShelf(books,states,view==='owned'?'owned':'catalog'),[states,view]);
 const ownedCount=useMemo(()=>booksForShelf(books,states,'owned').length,[states]);
 const filtered=useMemo(()=>sortBooks(filterBooks(shelfBooks,filters,states),sort,states),[shelfBooks,filters,sort,states]);
 const pages=Math.max(1,Math.ceil(filtered.length/pageSize));const currentPage=Math.min(page,pages);
 const displayed=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
 const draftCount=useMemo(()=>filterBooks(shelfBooks,draft,states).length,[shelfBooks,draft,states]);
 const activeCount=filterCount({...filters,query:''});
 const onToggle=(id,key)=>{
  const marking=!(states[id]||[]).includes(key);
  setStates(prev=>({...prev,[id]:toggleState(prev[id],key)}));
  if(key==='alindi')setTransfer({id,owned:marking});
  if(marking&&['okunuyor','okundu'].includes(key))setPersonal(prev=>{
   const field=key==='okunuyor'?'startedAt':'finishedAt';const record=cleanReading(prev.reading[id]);
   return {...prev,reading:{...prev.reading,[id]:{...record,[field]:record[field]||todayLocal()}}};
  });
 };
 const onReading=(id,patch)=>setPersonal(prev=>({...prev,reading:{...prev.reading,[id]:cleanReading({...prev.reading[id],...patch})}}));
 const onAdd=id=>setPersonal(prev=>({...prev,queue:addToQueue(prev.queue,id)}));
 const onQueue=()=>{setRoute(r=>({...r,view:'queue',book:null}));window.scrollTo({top:0,behavior:'instant'})};
 const onOpen=id=>setRoute(r=>({...r,book:id}));
 const onBrowse=()=>{setRoute(r=>({...r,view:'books',book:null}));window.scrollTo({top:0,behavior:'instant'})};
 const goCollection=(id,gid)=>{setRoute(r=>({...r,view:'books',book:null,filters:{...emptyFilters(),collections:[id],groups:gid?[gid]:[]}}));setPage(1);window.scrollTo({top:0,behavior:'instant'})};
 const goCategory=id=>{setRoute(r=>({...r,view:'books',book:null,filters:{...emptyFilters(),categories:[id]}}));setPage(1);window.scrollTo({top:0,behavior:'instant'})};
 const changePage=p=>{setPage(p);resultsRef.current?.scrollIntoView({behavior:'instant',block:'start'})};
 const copyLink=async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopied(true);setTimeout(()=>setCopied(false),2000)}catch{setCopied(false)}};
 return <><a className="skip-link" href="#main-content" onClick={e=>{e.preventDefault();document.getElementById('main-content').focus()}}>İçeriğe geç</a>
  <Container size={960} className="app-shell" px={{base:16,sm:32}}>
   <header className="site-header"><Group gap="sm" wrap="nowrap"><ThemeIcon size={46} radius="md" color="forest"><IconBooks size={26} stroke={1.6}/></ThemeIcon><div><Text className="brand">kitapatlası</Text><Text className="site-brand-subtitle" c="dimmed">Birleşik okuma kitaplığı</Text></div></Group><Button className="header-library" variant={view==='owned'?'filled':'light'} aria-current={view==='owned'?'page':undefined} onClick={()=>{setRoute(r=>({...r,view:'owned',book:null,filters:emptyFilters()}));setPage(1);window.scrollTo({top:0,behavior:'instant'})}}>KİTAPLIĞIM <span className="owned-count">{ownedCount}</span></Button></header>
   {view==='books'&&<section className="intro"><div><Text className="eyebrow">MERAKTAN OKUMAYA</Text><Title order={1}>Bir kitaplık.<br/><em>Pek çok yol.</em></Title><Text className="intro-text">Düşünce, strateji, edebiyat ve daha fazlası.<br className="desktop-break"/> Kümeleri keşfet, kategorileri birleştir, kendi sıranı kur.</Text></div><div className="stats"><div><strong>{books.length}</strong><span>eser</span></div><div><strong>{catalog.collections.length}</strong><span>küme</span></div><div><strong>{catalog.categories.length}</strong><span>kategori</span></div></div></section>}
   <nav className="main-tabs" aria-label="Kitaplık bölümleri">{[{id:'books',name:'Kitaplar',icon:IconBook2},{id:'queue',name:'Sıram',icon:IconListNumbers},{id:'collections',name:'Kümeler',icon:IconLayersIntersect},{id:'notes',name:'Notlar',icon:IconNotes}].map(item=><Button key={item.id} variant={view===item.id?'filled':'subtle'} leftSection={<item.icon size={19}/>} aria-current={view===item.id?'page':undefined} onClick={()=>setRoute(r=>({...r,view:item.id}))}>{item.name}</Button>)}</nav>
   <main id="main-content" tabIndex={-1}>
    {transfer&&<Alert mb="lg" color="forest" withCloseButton closeButtonLabel="Bildirimi kapat" onClose={()=>setTransfer(null)}><Text role="status">{byId[transfer.id].titleTr||byId[transfer.id].title} {transfer.owned?'Kitaplığım’a eklendi.':'yeniden keşif listelerine eklendi.'}</Text><Button variant="subtle" mt="xs" onClick={()=>{setStates(prev=>({...prev,[transfer.id]:toggleState(prev[transfer.id],'alindi')}));setTransfer(null)}}>Geri al</Button></Alert>}
    {(storageError||personalStorageError)&&<Alert color="orange" mb="lg">Bu tarayıcı kişisel kayıtlarını kalıcı olarak saklayamıyor. Notlar bölümünden yedeğini indirebilirsin.</Alert>}
    {['books','owned'].includes(view)&&<>
     {view==='owned'&&<div className="owned-heading"><Title order={2}>Kitaplığım</Title><Text c="dimmed">Satın aldığın {ownedCount} kitap burada. Okuma kaydını aç, ilerlemeni ve notlarını güncelle.</Text></div>}
     <Paper className="search-panel" withBorder radius="lg" p={{base:'md',sm:'lg'}}>
      <TextInput label={view==='owned'?'Kitaplığımda ara':'Katalogda ara'} placeholder="Kitap, yazar, çevirmen veya yayınevi" leftSection={<IconSearch size={21}/>} rightSection={filters.query?<ActionIcon variant="subtle" aria-label="Aramayı temizle" onClick={()=>changeFilters({...filters,query:''})}><IconX size={20}/></ActionIcon>:null} value={filters.query} onChange={e=>changeFilters({...filters,query:e.currentTarget.value})}/>
      <div className="search-tools"><Button variant="light" leftSection={<IconFilter size={20}/>} onClick={()=>{setDraft(filters);setOpened(true)}}>Filtreler{activeCount?` · ${activeCount}`:''}</Button><Select aria-label="Kitapları sırala" value={sort} onChange={v=>{setRoute(r=>({...r,sort:v||'shared'}));setPage(1)}} data={[{value:'shared',label:'En çok kesişen'},{value:'title',label:'Kitap adı · A–Z'},{value:'author',label:'Yazar · A–Z'},{value:'newest',label:'Yayın yılı · yeni'},{value:'saved',label:'Önemliler önce'}]} allowDeselect={false}/></div>
      <ActiveFilters filters={filters} onChange={changeFilters}/>
     </Paper>
     <div className="quick-filters"><Text c="dimmed">Bir yerden başla</Text><Group gap={8}>{[{id:'strategy',label:'Strateji'},{id:'psychology',label:'Psikoloji'},{id:'literature',label:'Edebiyat'},{id:'children',label:'Çocuk'}].map(c=><Chip key={c.id} checked={filters.categories.includes(c.id)} onChange={checked=>changeFilters({...filters,categories:checked?[...filters.categories,c.id]:filters.categories.filter(v=>v!==c.id)})}>{c.label}</Chip>)}</Group></div>
     {view==='books'&&!filterCount(filters)&&<SpotlightCard className="reading-route" spotlightColor="rgba(225,238,173,.13)"><div><Text fw={500}>Nereden başlamalı?</Text><Text>12 kitaplık çekirdek, düşünceden uygulamaya.</Text></div><Button variant="white" color="forest" rightSection={<IconArrowRight size={19}/>} onClick={()=>goCollection('core')}>Seçkiye git</Button></SpotlightCard>}
     <div className="results-heading" ref={resultsRef}><div><Title order={2}>{filterCount(filters)?'Seçtiğin kitaplar':view==='owned'?'Kitaplığımdakiler':'Keşfedilecek kitaplar'}</Title><Text c="dimmed" role="status" aria-live="polite">{filtered.length} eser{filtered.length?` · ${((currentPage-1)*pageSize)+1}–${Math.min(currentPage*pageSize,filtered.length)} gösteriliyor`:''}</Text></div><Group gap={4}>{filterCount(filters)>0&&<Button variant="subtle" onClick={()=>changeFilters(emptyFilters())}>Temizle</Button>}<Button variant="subtle" onClick={copyLink}>{copied?'Kopyalandı':'Bağlantıyı kopyala'}</Button></Group></div>
     {filtered.length?<><div className="books-grid">{displayed.map(b=><BookCard key={b.id} book={b} states={states} onToggle={onToggle} onOpen={onOpen} queue={personal.queue} onAdd={onAdd} onQueue={onQueue}/>)}</div>{pages>1&&<Group justify="space-between" className="pagination"><Button variant="default" aria-label="Önceki sayfa" disabled={currentPage===1} onClick={()=>changePage(currentPage-1)}><IconArrowLeft size={21}/></Button><Text>{currentPage} / {pages}</Text><Button variant="default" aria-label="Sonraki sayfa" disabled={currentPage===pages} onClick={()=>changePage(currentPage+1)}><IconArrowRight size={21}/></Button></Group>}</>:<Paper withBorder className="empty-state" p="xl" radius="lg"><IconSearch size={36}/><Title order={2}>{view==='owned'&&!ownedCount?'Kitaplığın ilk kitabını bekliyor.':'Bu seçimde kitap yok.'}</Title><Text c="dimmed" mt="sm">{view==='owned'&&!ownedCount?'Katalogda “Satın aldım” dediğin kitap buraya taşınır.':'Bir filtreyi kaldırabilir veya aramanı değiştirebilirsin.'}</Text><Button mt="lg" variant="light" onClick={()=>view==='owned'&&!ownedCount?onBrowse():changeFilters(emptyFilters())}>{view==='owned'&&!ownedCount?'Kataloğa git':'Filtreleri temizle'}</Button></Paper>}
    </>}
    {view==='queue'&&<ReadingQueue queue={personal.queue} books={byId} reading={personal.reading} states={states} onMove={(id,direction)=>setPersonal(prev=>({...prev,queue:moveInQueue(prev.queue,id,direction)}))} onRemove={id=>setPersonal(prev=>({...prev,queue:prev.queue.filter(value=>value!==id)}))} onOpen={onOpen} onBrowse={onBrowse} BookCover={BookCover}/>}
    {view==='collections'&&<Collections onCollection={goCollection} onGroup={goCollection} states={states}/>}
    {view==='notes'&&<Notes states={states} setStates={setStates} personal={personal} setPersonal={setPersonal}/>}
   </main>
   <footer className="site-footer"><Text>Kitap Atlası · {catalog.updated}</Text><Button variant="subtle" onClick={()=>{setRoute(r=>({...r,view:'notes'}));window.scrollTo({top:0,behavior:'instant'})}}>Kaynaklar ve notlar <IconArrowUpRight size={18}/></Button></footer>
  </Container>
  <Drawer position="bottom" size="90dvh" opened={opened} onClose={()=>setOpened(false)} title="Filtreler" className="filter-drawer" padding={0}><div className="filter-content"><FilterEditor value={draft} onChange={setDraft}/></div><div className="filter-actions"><Button variant="subtle" onClick={()=>setDraft({...emptyFilters(),query:filters.query})}>Sıfırla</Button><Button onClick={()=>{changeFilters(draft);setOpened(false)}}>{draftCount} kitabı göster <IconArrowRight size={19}/></Button></div></Drawer>
  <BookDetail book={byId[book]} onClose={()=>setRoute(r=>({...r,book:null}))} states={states} onToggle={onToggle} onCollection={goCollection} onCategory={goCategory} personal={personal} onReading={onReading} onAdd={onAdd} onQueue={onQueue} storageError={storageError||personalStorageError}/>
 </>;
}
export default function App(){return <MantineProvider theme={theme} forceColorScheme="light"><AtlasApp/></MantineProvider>}
