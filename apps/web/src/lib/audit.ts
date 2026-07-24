import { createId } from './id';

export type ClientAuditEvent = {
  id: string; timestamp: string; actor: string; role: string; action: string;
  category: string; resource: string; resourceId: string; description: string;
  status: 'SUCCESS'|'FAILED'|'WARNING'; ipAddress: string; device: string; branch: string;
};

const storageKey='carenest_audit_logs';

function identity(){
  if(typeof window==='undefined')return {actor:'Server',role:'System',branch:'System'};
  try{
    const raw=localStorage.getItem('carenest_staff')||sessionStorage.getItem('carenest_staff');
    const staff=raw?JSON.parse(raw):undefined;
    return {
      actor:staff?`${staff.firstName??''} ${staff.lastName??''}`.trim()||staff.email:'Unauthenticated user',
      role:staff?.role??'Guest',
      branch:staff?.branch??staff?.facilityName??'Current facility',
    };
  }catch{return {actor:'Unknown user',role:'Unknown',branch:'Current facility'}}
}

export function recordAuditEvent(event:Partial<ClientAuditEvent>&Pick<ClientAuditEvent,'action'|'category'|'resource'|'description'>){
  if(typeof window==='undefined')return;
  const user=identity();
  const entry:ClientAuditEvent={
    id:`AUD-${createId('event').slice(-12).toUpperCase()}`,timestamp:new Date().toISOString(),
    actor:user.actor,role:user.role,branch:user.branch,status:'SUCCESS',ipAddress:'Local browser session',
    device:`${navigator.platform||'Unknown platform'} · ${navigator.userAgent.includes('Mobile')?'Mobile':'Web browser'}`,
    resourceId:window.location.pathname,...event,
  };
  try{
    const current=JSON.parse(localStorage.getItem(storageKey)??'[]');
    const logs=Array.isArray(current)?current:[];
    localStorage.setItem(storageKey,JSON.stringify([entry,...logs].slice(0,2000)));
    window.dispatchEvent(new CustomEvent('carenest-audit-updated',{detail:entry}));
  }catch{}
}
