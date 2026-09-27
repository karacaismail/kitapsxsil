import React,{useEffect,useState} from 'react';
import { Button, Group, NumberInput, Pagination, Paper, Select, Text } from '@mantine/core';
import { clampPage } from '../recommendations';
export default function CatalogPagination({page,total,count,pageSize,onChange,onPageSize}) {
 const [jump,setJump]=useState(page);
 useEffect(()=>setJump(page),[page]);
 const submit=e=>{e.preventDefault();onChange(clampPage(jump,total));};
 return <Paper component="nav" aria-label="Katalog sayfaları" withBorder p="md" radius="lg" className="catalog-pagination">
  <div className="pagination-summary"><Text>{count} kitaptan {(page-1)*pageSize+1}–{Math.min(page*pageSize,count)}</Text><Select label="Sayfa başına" value={String(pageSize)} data={['12','24','48']} allowDeselect={false} onChange={value=>onPageSize(Number(value))}/></div>
  <Pagination.Root total={total} value={page} onChange={onChange} siblings={1} boundaries={1} size="lg" getItemProps={p=>({'aria-label':`${p}. sayfaya git`,'aria-current':p===page?'page':undefined})}>
   <Group gap={6} justify="center" className="pagination-controls"><Pagination.First aria-label="İlk sayfa"/><Pagination.Previous aria-label="Önceki sayfa"/><Pagination.Label className="pagination-mobile" formatLabel={({page,totalPages})=>`${page} / ${totalPages}`}/><div className="pagination-desktop"><Pagination.Items/></div><Pagination.Next aria-label="Sonraki sayfa"/><Pagination.Last aria-label="Son sayfa"/></Group>
  </Pagination.Root>
  <form className="pagination-jump" onSubmit={submit}><NumberInput label="Sayfaya git" aria-label="Gidilecek sayfa" min={1} max={total} allowDecimal={false} hideControls value={jump} onChange={setJump}/><Button type="submit" variant="light">Git</Button></form>
 </Paper>;
}
