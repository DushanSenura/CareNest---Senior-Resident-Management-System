'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { applyAppearance, storedPreferences } from '@/lib/appearance';
import { recordAuditEvent } from '@/lib/audit';
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  const pathname=usePathname();
  const router=useRouter();
  useEffect(() => {
    const apply=()=>applyAppearance(storedPreferences()); apply();
    const media=window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change',apply);window.addEventListener('carenest-preferences',apply);
    return()=>{media.removeEventListener('change',apply);window.removeEventListener('carenest-preferences',apply)};
  },[]);
  useEffect(()=>{const refresh=()=>client.invalidateQueries({queryKey:['staff']});window.addEventListener('carenest-profile-updated',refresh);return()=>window.removeEventListener('carenest-profile-updated',refresh)},[client]);
  useEffect(()=>{
    const previous=sessionStorage.getItem('carenest_audit_path');
    if(previous!==pathname){
      recordAuditEvent({action:'NAVIGATE',category:'Navigation',resource:'Page view',resourceId:pathname,description:`Opened ${pathname}${previous?` from ${previous}`:''}.`});
      sessionStorage.setItem('carenest_audit_path',pathname);
    }
  },[pathname]);
  useEffect(()=>{
    try{
      const raw=localStorage.getItem('carenest_staff')||sessionStorage.getItem('carenest_staff');
      const account=raw?JSON.parse(raw):undefined;
      if(account?.role==='Guest'&&account.linkedResidentId){
        const residentPath=`/residents/${account.linkedResidentId}`;
        if(pathname!==residentPath&&pathname!=='/settings')router.replace(residentPath);
      }
    }catch{}
  },[pathname,router]);
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      const target=(event.target as HTMLElement)?.closest('button,a') as HTMLElement|null;
      if(!target)return;
      const label=(target.getAttribute('aria-label')||target.getAttribute('title')||target.textContent||'Unlabelled action').replace(/\s+/g,' ').trim().slice(0,120);
      const href=target instanceof HTMLAnchorElement?target.getAttribute('href'):undefined;
      recordAuditEvent({action:href?'NAVIGATE_REQUEST':'CLICK',category:href?'Navigation':'User action',resource:label||href||'Interface control',resourceId:href||window.location.pathname,description:href?`Selected ${label||href} to open ${href}.`:`Selected ${label} on ${window.location.pathname}.`});
    };
    const submit=(event:SubmitEvent)=>{
      const form=event.target as HTMLFormElement;
      const label=form.getAttribute('aria-label')||form.getAttribute('name')||form.querySelector('button[type="submit"]')?.textContent?.trim()||'Form';
      recordAuditEvent({action:'SUBMIT',category:'Data entry',resource:label,description:`Submitted ${label} on ${window.location.pathname}. Field values were not recorded.`});
    };
    document.addEventListener('click',click,true);document.addEventListener('submit',submit,true);
    return()=>{document.removeEventListener('click',click,true);document.removeEventListener('submit',submit,true)};
  },[]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
