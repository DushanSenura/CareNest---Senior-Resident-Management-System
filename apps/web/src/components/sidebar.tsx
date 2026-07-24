'use client';
import { Activity, Building2, CalendarDays, ClipboardCheck, CreditCard, FileBarChart, HeartHandshake, KeyRound, LayoutDashboard, LogOut, Megaphone, MessageCircle, Settings, ShieldCheck, Stethoscope, UserCog, Users } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import careNestLogo from '@/assets/CareNest.png';
const nav = [
  ['Overview', '/dashboard', LayoutDashboard], ['Residents', '/residents', Users], ['Care plans', '/care-plans', HeartHandshake], ['Medication', '/medication', Stethoscope],
  ['Tasks & shifts', '/tasks-shifts', ClipboardCheck], ['Staff', '/staff', UserCog], ['Daily health', '/daily-health', Activity], ['Schedule', '/schedule', CalendarDays], ['Reports', '/reports', FileBarChart],
  ['Branches', '/branches', Building2],
  ['Announcements', '/announcements', Megaphone],
  ['Audit logs', '/audit-logs', ShieldCheck],
  ['Billing', '/billing', CreditCard],
  ['Accounts', '/accounts', KeyRound],
];
export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const[guestResidentId,setGuestResidentId]=useState<string>();
  const[account,setAccount]=useState<{firstName?:string;lastName?:string;role?:string;linkedResidentId?:string;profilePhotoUrl?:string}>({});
  useEffect(()=>{const load=(event?:Event)=>{try{const updated=(event as CustomEvent)?.detail;const raw=localStorage.getItem('carenest_staff')||sessionStorage.getItem('carenest_staff');const value=updated||(raw?JSON.parse(raw):undefined)||{};setAccount(value);if(value.role==='Guest')setGuestResidentId(value.linkedResidentId);else setGuestResidentId(undefined)}catch{}};load();window.addEventListener('carenest-profile-updated',load);return()=>window.removeEventListener('carenest-profile-updated',load)},[]);
  useEffect(()=>{if(pathname!=='/'&&pathname!=='/login')localStorage.setItem('carenest_last_page',pathname)},[pathname]);
  const logout = () => {
    const keys = ['carenest_access_token', 'carenest_staff', 'carenest_permissions', 'carenest_must_change_password'];
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    router.replace('/');
    router.refresh();
  };
  return <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-ink px-5 py-6 text-white lg:flex">
    <div className="mb-9 flex items-center gap-3 px-2">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full"><Image src={careNestLogo} alt="CareNest system logo" priority className="h-full w-full rounded-full object-cover" style={{transform:'scale(1.75) translateY(11%)'}}/></div>
      <div className="sidebar-label"><div className="text-xl font-bold tracking-tight">CareNest</div><div className="text-xs text-white/55">Resident care</div></div>
    </div>
    <SidebarDateTime/>
    <nav className="sidebar-scroll min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">{(guestResidentId?[['My resident',`/residents/${guestResidentId}`,Users]]:nav).map(([label, href, Icon]) =>
      <Link key={label as string} href={href as string}
        className={cnNav(pathname === href)}><Icon size={18}/><span className="sidebar-label">{label as string}</span></Link>)}</nav>
    <div className="mt-auto space-y-1 border-t border-white/10 pt-4">
      {!guestResidentId&&<Link className={cnNav(false)} href="/messages"><MessageCircle size={18}/><span className="sidebar-label">Messages</span></Link>}
      <Link className={cnNav(false)} href="/settings"><Settings size={18}/><span className="sidebar-label">Settings</span></Link>
      <button suppressHydrationWarning type="button" onClick={logout} className={`${cnNav(false)} w-full`}>
        <LogOut size={18}/><span className="sidebar-label">Logout</span>
      </button>
      <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/5 p-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-coral font-bold">{account.profilePhotoUrl?<img src={account.profilePhotoUrl} alt={`${account.firstName||'User'} profile`} className="h-full w-full object-cover"/>:<>{account.firstName?.[0]||'U'}{account.lastName?.[0]||''}</>}</div>
        <div className="sidebar-label min-w-0"><div className="truncate text-sm font-semibold">{account.firstName||'User'} {account.lastName||''}</div><div className="truncate text-xs text-white/50">{account.role||'CareNest account'}</div></div>
      </div>
    </div>
  </aside>;
}
function SidebarDateTime(){
  const[now,setNow]=useState<Date|null>(null);
  useEffect(()=>{setNow(new Date());const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer)},[]);
  if(!now)return <div className="mb-5 h-[58px] rounded-xl bg-white/5" aria-hidden="true"/>;
  let preferences:{dateFormat?:string;timeFormat?:string;timeZone?:string}={};
  try{preferences=JSON.parse(localStorage.getItem('carenest_preferences')??'{}')}catch{}
  const timeZone=preferences.timeZone||'Asia/Colombo';
  const dateParts=new Intl.DateTimeFormat('en-GB',{timeZone,day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(now);
  const part=(type:'day'|'month'|'year')=>dateParts.find(item=>item.type===type)?.value||'';
  const day=part('day'),month=part('month'),year=part('year');
  const date=preferences.dateFormat==='MM/DD/YYYY'?`${month}/${day}/${year}`:preferences.dateFormat==='YYYY-MM-DD'?`${year}-${month}-${day}`:`${day}/${month}/${year}`;
  const time=now.toLocaleTimeString('en-GB',{timeZone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:preferences.timeFormat==='12-hour'});
  return <div className="mb-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5" aria-label={`Current date ${date}, current time ${time}`}>
    <CalendarDays size={18} className="shrink-0 text-white/70"/>
    <div className="sidebar-label min-w-0 leading-tight"><time className="block text-sm font-semibold tabular-nums" dateTime={now.toISOString()}>{time}</time><p className="mt-0.5 text-xs text-white/50">{date}</p></div>
  </div>
}
function cnNav(active: boolean) { return `focus-ring flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${active ? 'bg-white text-ink' : 'text-white/65 hover:bg-white/10 hover:text-white'}`; }
