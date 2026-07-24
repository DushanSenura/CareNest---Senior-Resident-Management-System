'use client';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, ArrowRight, Bell, CheckCircle2, ChevronRight, Clock3, Plus, Search, Users } from 'lucide-react';
import Link from 'next/link';
import { api, type Resident } from '@/lib/api';
import { Badge, Button, Skeleton } from './ui';

const fallback: Resident[] = [
  { id: '1', firstName: 'Eleanor', lastName: 'Bennett', preferredName: 'Ellie', room: 'A-104', dateOfBirth: '1941-03-12', status: 'ACTIVE', priority: 'HIGH', allergies: ['Penicillin'], dietaryNeeds: ['Low sodium'], medications: [{ id:'m1', name:'Amlodipine', dosage:'5 mg' }] },
  { id: '2', firstName: 'Arthur', lastName: 'Reed', room: 'B-208', dateOfBirth: '1937-08-24', status: 'ACTIVE', priority: 'MEDIUM', allergies: [], dietaryNeeds: ['Diabetic'], medications: [{ id:'m2', name:'Metformin', dosage:'500 mg' }] },
  { id: '3', firstName: 'Mabel', lastName: 'Foster', room: 'A-109', dateOfBirth: '1944-11-02', status: 'ACTIVE', priority: 'LOW', allergies: ['Latex'], dietaryNeeds: [], medications: [] },
];

export function Dashboard() {
  const residents = useQuery({ queryKey: ['residents'], queryFn: api.residents });
  const summary = useQuery({ queryKey: ['summary'], queryFn: api.summary });
  const people = residents.data ?? fallback;
  const totals = summary.data ?? { residents: 48, tasksDue: 12, tasksCompleted: 36, incidents: 2 };
  return <main className="min-h-screen lg:ml-64">
    <header className="flex h-20 items-center justify-between border-b bg-cream/90 px-5 backdrop-blur md:px-9">
      <div><p className="eyebrow">Willow Grove Residence</p><h1 className="text-xl font-bold">Good morning, Maya</h1></div>
      <div className="flex items-center gap-2">
        <label className="relative hidden md:block"><Search className="absolute left-3 top-2.5 text-sage" size={18}/><input aria-label="Search residents" placeholder="Search residents..." className="focus-ring h-10 w-64 rounded-xl border bg-white pl-10 pr-4 text-sm"/></label>
        <button aria-label="Notifications" className="focus-ring relative grid h-10 w-10 place-items-center rounded-xl border bg-white"><Bell size={18}/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-coral"/></button>
        <Link href="/residents/new" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-ink"><Plus size={17}/>Admit resident</Link>
      </div>
    </header>
    <div className="mx-auto max-w-[1500px] p-5 md:p-9">
      <section data-widget="summary" className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat icon={Users} label="Active residents" value={totals.residents} detail="+2 this month" color="bg-mint text-forest"/>
        <Stat icon={Clock3} label="Tasks due today" value={totals.tasksDue} detail="4 due within 2 hours" color="bg-[#fff3dc] text-[#946c1f]"/>
        <Stat icon={CheckCircle2} label="Care tasks complete" value={totals.tasksCompleted} detail="75% of today's plan" color="bg-[#e9f2ff] text-[#356da8]"/>
        <Stat icon={AlertTriangle} label="Open incidents" value={totals.incidents} detail="1 awaiting review" color="bg-[#fff0ec] text-coral"/>
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.55fr_.8fr]">
        <div className="space-y-6">
          <div data-widget="residents" className="card overflow-hidden">
            <div className="flex items-center justify-between p-5"><div><p className="eyebrow">Resident overview</p><h2 className="mt-1 text-lg font-bold">People needing attention</h2></div><button className="flex items-center gap-1 text-sm font-semibold text-forest">View all <ArrowRight size={16}/></button></div>
            <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-y bg-cream/60 text-xs uppercase tracking-wider text-sage"><th className="px-5 py-3">Resident</th><th className="px-4 py-3">Room</th><th className="px-4 py-3">Care level</th><th className="px-4 py-3">Medication</th><th></th></tr></thead>
              <tbody>{residents.isLoading ? <tr><td className="p-5" colSpan={5}><Skeleton className="h-28"/></td></tr> : people.map((r) => <ResidentRow key={r.id} resident={r}/>)}</tbody></table></div>
          </div>
          <div data-widget="tasks" className="card p-5"><div className="mb-5 flex items-center justify-between"><div><p className="eyebrow">Today’s care</p><h2 className="mt-1 text-lg font-bold">Upcoming tasks</h2></div><Badge>12 remaining</Badge></div>
            <div className="space-y-3"><Task time="09:30" name="Blood pressure check" resident="Eleanor Bennett · A-104" type="Clinical"/><Task time="10:00" name="Morning mobility session" resident="Arthur Reed · B-208" type="Wellbeing"/><Task time="10:30" name="Family video call" resident="Mabel Foster · A-109" type="Family"/></div>
          </div>
        </div>
        <aside className="space-y-6">
          <div data-widget="shift-pulse" className="card p-5"><p className="eyebrow">Shift pulse</p><h2 className="mt-1 text-lg font-bold">Today at a glance</h2>
            <div className="my-6 flex justify-center"><div className="grid h-40 w-40 place-items-center rounded-full" style={{background:'conic-gradient(#24594a 0 75%, #e8f2ed 75%)'}}><div className="grid h-28 w-28 place-items-center rounded-full bg-white text-center"><div><strong className="text-3xl">75%</strong><p className="text-xs text-sage">complete</p></div></div></div></div>
            <div className="grid grid-cols-3 divide-x text-center"><Small value="36" label="Done"/><Small value="12" label="Due"/><Small value="4" label="Staff on"/></div>
          </div>
          <div data-widget="alerts" className="card p-5"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Alerts</p><h2 className="mt-1 text-lg font-bold">Needs attention</h2></div><span className="grid h-7 w-7 place-items-center rounded-full bg-coral text-xs font-bold text-white">3</span></div>
            <Alert color="bg-coral" title="Medication overdue" text="Arthur Reed · Metformin" time="12 min ago"/><Alert color="bg-gold" title="Care plan review due" text="Eleanor Bennett" time="Today"/><Alert color="bg-sage" title="Family message" text="For Mabel Foster" time="28 min ago"/>
          </div>
        </aside>
      </section>
    </div>
  </main>;
}
function Stat({icon:Icon,label,value,detail,color}: any){return <div className="card p-5"><div className={`mb-4 grid h-10 w-10 place-items-center rounded-xl ${color}`}><Icon size={20}/></div><p className="text-sm text-sage">{label}</p><div className="mt-1 flex items-end justify-between"><strong className="text-3xl">{value}</strong><span className="text-xs text-sage">{detail}</span></div></div>}
function ResidentRow({resident:r}:{resident:Resident}){const initials=`${r.firstName[0]}${r.lastName[0]}`; return <tr className="border-b last:border-0 hover:bg-mint/30"><td className="px-5 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-mint font-bold text-forest">{initials}</div><div><p className="font-semibold">{r.preferredName || r.firstName} {r.lastName}</p><p className="text-xs text-sage">{r.allergies.length ? `Allergy: ${r.allergies.join(', ')}` : 'No known allergies'}</p></div></div></td><td className="px-4 text-sm">{r.room}</td><td className="px-4"><Badge className={r.priority==='HIGH'?'bg-[#fff0ec] text-coral':''}>{r.priority.toLowerCase()}</Badge></td><td className="px-4 text-sm">{r.medications.length} active</td><td className="px-4"><button aria-label={`Open ${r.firstName}`}><ChevronRight size={18}/></button></td></tr>}
function Task({time,name,resident,type}:any){return <div className="flex items-center gap-4 rounded-xl border p-3.5 hover:border-sage"><div className="w-12 text-sm font-bold">{time}</div><div className="h-9 w-1 rounded-full bg-sage"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{name}</p><p className="text-xs text-sage">{resident}</p></div><Badge>{type}</Badge><button><ChevronRight size={18}/></button></div>}
function Small({value,label}:any){return <div><p className="font-bold">{value}</p><p className="text-xs text-sage">{label}</p></div>}
function Alert({color,title,text,time}:any){return <div className="flex gap-3 border-b py-4 last:border-0"><div className={`mt-1.5 h-2.5 w-2.5 rounded-full ${color}`}/><div className="flex-1"><p className="text-sm font-semibold">{title}</p><p className="text-xs text-sage">{text}</p></div><span className="text-[11px] text-sage">{time}</span></div>}
