'use client';

import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle, BedDouble, ChevronRight, Filter, LayoutGrid, List, MoreHorizontal,
  Plus, Search, SlidersHorizontal, UserCheck, Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { api, type Resident } from '@/lib/api';
import { Badge, Button, Skeleton } from './ui';
import { canManageResidents, currentAccount } from '@/lib/access';

const demoResidents: Resident[] = [
  { id: '1', firstName: 'Eleanor', lastName: 'Bennett', preferredName: 'Ellie', room: 'A-104', dateOfBirth: '1941-03-12', status: 'ACTIVE', priority: 'HIGH', allergies: ['Penicillin'], dietaryNeeds: ['Low sodium'], medications: [{ id: 'm1', name: 'Amlodipine', dosage: '5 mg' }] },
  { id: '2', firstName: 'Arthur', lastName: 'Reed', room: 'B-208', dateOfBirth: '1937-08-24', status: 'ACTIVE', priority: 'MEDIUM', allergies: [], dietaryNeeds: ['Diabetic'], medications: [{ id: 'm2', name: 'Metformin', dosage: '500 mg' }, { id: 'm3', name: 'Atorvastatin', dosage: '20 mg' }] },
  { id: '3', firstName: 'Mabel', lastName: 'Foster', room: 'A-109', dateOfBirth: '1944-11-02', status: 'ACTIVE', priority: 'LOW', allergies: ['Latex'], dietaryNeeds: [], medications: [] },
  { id: '4', firstName: 'Harold', lastName: 'Wilson', preferredName: 'Harry', room: 'C-302', dateOfBirth: '1939-05-17', status: 'HOSPITALIZED', priority: 'CRITICAL', allergies: ['Sulfa'], dietaryNeeds: ['Soft foods'], medications: [{ id: 'm4', name: 'Warfarin', dosage: '2 mg' }] },
  { id: '5', firstName: 'Dorothy', lastName: 'Clarke', room: 'B-214', dateOfBirth: '1943-01-29', status: 'ACTIVE', priority: 'MEDIUM', allergies: [], dietaryNeeds: ['Vegetarian'], medications: [{ id: 'm5', name: 'Levothyroxine', dosage: '50 mcg' }] },
];

type FilterValue = 'ALL' | Resident['priority'];

export function ResidentsPage() {
  const canAdmit=canManageResidents(currentAccount()?.role);
  const query = useQuery({ queryKey: ['residents'], queryFn: api.residents });
  const [search, setSearch] = useState('');
  const [careLevel, setCareLevel] = useState<FilterValue>('ALL');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const source = query.data?.length ? query.data : demoResidents;
  const residents = useMemo(() => source.filter((resident) => {
    const term = search.toLowerCase().trim();
    const matchesSearch = !term || `${resident.firstName} ${resident.lastName} ${resident.preferredName ?? ''} ${resident.room}`.toLowerCase().includes(term);
    return matchesSearch && (careLevel === 'ALL' || resident.priority === careLevel);
  }), [source, search, careLevel]);

  return <main className="min-h-screen lg:ml-64">
    <header className="border-b bg-white px-5 py-5 md:px-9">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
        <div><p className="eyebrow">People & care</p><h1 className="mt-1 text-2xl font-bold">Residents</h1><p className="mt-1 text-sm text-sage">Manage resident profiles, care needs and admission details.</p></div>
        {canAdmit&&<Link href="/residents/new" className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-forest px-4 text-sm font-semibold text-white hover:bg-ink"><Plus size={17}/>Admit resident</Link>}
      </div>
    </header>

    <div className="mx-auto max-w-[1500px] p-5 md:p-9">
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={Users} label="Total residents" value="48" detail="46 currently onsite" tone="bg-mint text-forest"/>
        <Summary icon={BedDouble} label="Available rooms" value="7" detail="87% occupancy" tone="bg-[#e9f2ff] text-[#356da8]"/>
        <Summary icon={UserCheck} label="New admissions" value="3" detail="This month" tone="bg-[#fff3dc] text-[#946c1f]"/>
        <Summary icon={AlertCircle} label="High-care residents" value="8" detail="2 reviews due" tone="bg-[#fff0ec] text-coral"/>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 border-b p-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <label className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 text-sage" size={18}/>
              <input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search residents" placeholder="Search by name or room..." className="focus-ring h-11 w-full rounded-xl border bg-white pl-10 pr-4 text-sm"/>
            </label>
            <label className="relative">
              <Filter className="pointer-events-none absolute left-3 top-3 text-sage" size={17}/>
              <select value={careLevel} onChange={(event) => setCareLevel(event.target.value as FilterValue)} aria-label="Filter by care level" className="focus-ring h-11 min-w-44 appearance-none rounded-xl border bg-white pl-10 pr-9 text-sm font-medium">
                <option value="ALL">All care levels</option><option value="LOW">Low care</option><option value="MEDIUM">Medium care</option><option value="HIGH">High care</option><option value="CRITICAL">Critical care</option>
              </select>
            </label>
            <button className="focus-ring flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold hover:bg-mint"><SlidersHorizontal size={17}/>More filters</button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-sage"><strong className="text-ink">{residents.length}</strong> residents shown</p>
            <div className="flex rounded-xl border p-1"><ViewButton active={view === 'list'} label="List view" onClick={() => setView('list')}><List size={17}/></ViewButton><ViewButton active={view === 'grid'} label="Grid view" onClick={() => setView('grid')}><LayoutGrid size={17}/></ViewButton></div>
          </div>
        </div>

        {query.isLoading ? <div className="p-5"><Skeleton className="h-72"/></div> :
          residents.length === 0 ? <EmptyState clear={() => { setSearch(''); setCareLevel('ALL'); }}/> :
          view === 'list' ? <ResidentTable residents={residents}/> : <ResidentGrid residents={residents}/>}
      </section>
    </div>
  </main>;
}

function Summary({ icon: Icon, label, value, detail, tone }: { icon: typeof Users; label: string; value: string; detail: string; tone: string }) {
  return <div className="card flex items-center gap-4 p-5"><div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}><Icon size={22}/></div><div><p className="text-sm text-sage">{label}</p><p className="text-2xl font-bold">{value}</p><p className="text-xs text-sage">{detail}</p></div></div>;
}

function ResidentTable({ residents }: { residents: Resident[] }) {
  return <div className="overflow-x-auto"><table className="w-full text-left">
    <thead><tr className="bg-cream/60 text-[11px] uppercase tracking-[.12em] text-sage"><th className="px-5 py-3.5">Resident</th><th className="px-4 py-3.5">Room</th><th className="px-4 py-3.5">Status</th><th className="px-4 py-3.5">Care level</th><th className="px-4 py-3.5">Care notes</th><th className="px-4 py-3.5">Medication</th><th className="w-20 px-4 py-3.5"></th></tr></thead>
    <tbody>{residents.map((resident) => <ResidentRow key={resident.id} resident={resident}/>)}</tbody>
  </table></div>;
}

function ResidentRow({ resident }: { resident: Resident }) {
  const age = new Date().getFullYear() - new Date(resident.dateOfBirth).getFullYear();
  return <tr className="group border-t hover:bg-mint/25">
    <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar resident={resident}/><div><p className="font-semibold">{resident.preferredName || resident.firstName} {resident.lastName}</p><p className="text-xs text-sage">{resident.firstName} {resident.lastName} · {age} years</p></div></div></td>
    <td className="px-4 text-sm font-semibold">{resident.room}</td>
    <td className="px-4"><StatusBadge status={resident.status}/></td>
    <td className="px-4"><PriorityBadge priority={resident.priority}/></td>
    <td className="px-4 text-sm">{resident.allergies.length ? <span className="font-medium text-coral">Allergy: {resident.allergies.join(', ')}</span> : <span className="text-sage">No known allergies</span>}</td>
    <td className="px-4 text-sm"><strong>{resident.medications.length}</strong> active</td>
    <td className="px-4"><div className="flex items-center"><button aria-label={`More actions for ${resident.firstName}`} className="focus-ring grid h-9 w-9 place-items-center rounded-lg hover:bg-white"><MoreHorizontal size={18}/></button><Link href={`/residents/${resident.id}`} aria-label={`Open ${resident.firstName}'s record`} className="focus-ring grid h-9 w-9 place-items-center rounded-lg text-forest hover:bg-white"><ChevronRight size={18}/></Link></div></td>
  </tr>;
}

function ResidentGrid({ residents }: { residents: Resident[] }) {
  return <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">{residents.map((resident) => <article key={resident.id} className="rounded-2xl border p-5 hover:border-sage hover:shadow-card"><div className="flex items-start justify-between"><Avatar resident={resident}/><PriorityBadge priority={resident.priority}/></div><h3 className="mt-4 font-bold">{resident.preferredName || resident.firstName} {resident.lastName}</h3><p className="text-sm text-sage">Room {resident.room}</p><div className="mt-4 flex items-center justify-between border-t pt-4"><StatusBadge status={resident.status}/><Link href={`/residents/${resident.id}`} className="flex items-center gap-1 text-sm font-semibold text-forest">View record <ChevronRight size={16}/></Link></div></article>)}</div>;
}

function Avatar({ resident }: { resident: Resident }) { return <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-mint font-bold text-forest">{resident.firstName[0]}{resident.lastName[0]}</div>; }
function StatusBadge({ status }: { status: string }) { const active = status === 'ACTIVE'; return <Badge className={active ? '' : 'bg-[#fff3dc] text-[#946c1f]'}><span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${active ? 'bg-forest' : 'bg-gold'}`}/>{status.toLowerCase().replace('_', ' ')}</Badge>; }
function PriorityBadge({ priority }: { priority: Resident['priority'] }) { const styles = { LOW: 'bg-mint text-forest', MEDIUM: 'bg-[#fff3dc] text-[#946c1f]', HIGH: 'bg-[#fff0ec] text-coral', CRITICAL: 'bg-coral text-white' }; return <Badge className={styles[priority]}>{priority.toLowerCase()}</Badge>; }
function ViewButton({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: React.ReactNode }) { return <button aria-label={label} onClick={onClick} className={`focus-ring grid h-8 w-8 place-items-center rounded-lg ${active ? 'bg-forest text-white' : 'text-sage hover:bg-mint'}`}>{children}</button>; }
function EmptyState({ clear }: { clear: () => void }) { return <div className="grid min-h-72 place-items-center p-8 text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-mint text-forest"><Search size={24}/></div><h3 className="mt-4 font-bold">No residents found</h3><p className="mt-1 text-sm text-sage">Try changing the search or care-level filter.</p><button onClick={clear} className="mt-4 text-sm font-semibold text-forest">Clear filters</button></div></div>; }
