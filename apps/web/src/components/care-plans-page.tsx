'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle, CalendarClock, CheckCircle2, ChevronRight, ClipboardCheck,
  Filter, HeartHandshake, Plus, Search, Stethoscope, X,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api, type CarePlan } from '@/lib/api';
import { Badge, Button, Skeleton } from './ui';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const demoPlans: CarePlan[] = [
  { id: 'demo-1', title: 'Mobility and fall prevention', goals: 'Maintain safe independent movement and reduce fall risk.', guidance: 'Supervise morning walks, ensure walker is within reach, and record balance concerns.', priority: 'HIGH', reviewDate: new Date(Date.now() + 4 * 86400000).toISOString(), updatedAt: new Date().toISOString(), resident: { id: '1', firstName: 'Eleanor', lastName: 'Bennett', preferredName: 'Ellie', room: 'A-104', status: 'ACTIVE' } },
  { id: 'demo-2', title: 'Diabetes management', goals: 'Maintain stable blood glucose through medication and nutrition.', guidance: 'Monitor meals, document glucose readings, and escalate readings outside the agreed range.', priority: 'MEDIUM', reviewDate: new Date(Date.now() + 18 * 86400000).toISOString(), updatedAt: new Date().toISOString(), resident: { id: '2', firstName: 'Arthur', lastName: 'Reed', room: 'B-208', status: 'ACTIVE' } },
  { id: 'demo-3', title: 'Social connection and wellbeing', goals: 'Increase meaningful social engagement and family contact.', guidance: 'Offer garden group twice weekly and facilitate the scheduled family video call.', priority: 'LOW', reviewDate: new Date(Date.now() - 2 * 86400000).toISOString(), updatedAt: new Date().toISOString(), resident: { id: '3', firstName: 'Mabel', lastName: 'Foster', room: 'A-109', status: 'ACTIVE' } },
];

export function CarePlansPage() {
  const plansQuery = useQuery({ queryKey: ['care-plans'], queryFn: api.carePlans });
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('ALL');
  const source = plansQuery.data?.length ? plansQuery.data : demoPlans;
  const plans = useMemo(() => source.filter((plan) => {
    const term = search.trim().toLowerCase();
    const residentName = `${plan.resident.firstName} ${plan.resident.lastName} ${plan.resident.preferredName ?? ''}`;
    return (!term || `${plan.title} ${residentName} ${plan.resident.room}`.toLowerCase().includes(term)) &&
      (priority === 'ALL' || plan.priority === priority);
  }), [source, search, priority]);
  const now = Date.now();
  const overdue = source.filter((plan) => new Date(plan.reviewDate).getTime() < now).length;
  const dueSoon = source.filter((plan) => { const days = (new Date(plan.reviewDate).getTime() - now) / 86400000; return days >= 0 && days <= 7; }).length;

  return <main className="min-h-screen lg:ml-64">
    <header className="border-b bg-white px-5 py-5 md:px-9"><div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Person-centred care</p><h1 className="mt-1 text-2xl font-bold">Care plans</h1><p className="mt-1 text-sm text-sage">Set goals, document guidance and keep every resident’s care under review.</p></div><CreatePlanDialog/></div></header>
    <div className="mx-auto max-w-[1500px] p-5 md:p-9">
      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary icon={HeartHandshake} label="Active care plans" value={source.length} detail="Across current residents" tone="bg-mint text-forest"/>
        <Summary icon={CalendarClock} label="Reviews due soon" value={dueSoon} detail="Within the next 7 days" tone="bg-[#fff3dc] text-[#946c1f]"/>
        <Summary icon={AlertCircle} label="Overdue reviews" value={overdue} detail="Require attention" tone="bg-[#fff0ec] text-coral"/>
        <Summary icon={CheckCircle2} label="Reviewed this month" value={Math.max(0, source.length - overdue)} detail="Plans kept current" tone="bg-[#e9f2ff] text-[#356da8]"/>
      </section>

      <section className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
          <div><p className="eyebrow">Care plan register</p><h2 className="mt-1 text-lg font-bold">Resident plans</h2></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative"><Search className="absolute left-3 top-3 text-sage" size={17}/><input suppressHydrationWarning value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search plans or residents..." className="focus-ring h-11 w-full rounded-xl border pl-10 pr-3 text-sm sm:w-72"/></label>
            <label className="relative"><Filter className="absolute left-3 top-3 text-sage" size={17}/><select suppressHydrationWarning value={priority} onChange={(event) => setPriority(event.target.value)} className="focus-ring h-11 min-w-40 appearance-none rounded-xl border bg-white pl-10 pr-8 text-sm font-medium"><option value="ALL">All priorities</option><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></label>
          </div>
        </div>
        {plansQuery.isLoading ? <div className="p-5"><Skeleton className="h-80"/></div> : plans.length ? <div className="grid gap-4 p-5 xl:grid-cols-2">{plans.map((plan) => <PlanCard key={plan.id} plan={plan}/>)}</div> : <div className="grid min-h-72 place-items-center p-8 text-center"><div><HeartHandshake className="mx-auto text-sage"/><h3 className="mt-3 font-bold">No care plans found</h3><p className="text-sm text-sage">Change the filters or create a resident care plan.</p></div></div>}
      </section>
    </div>
  </main>;
}

function PlanCard({ plan }: { plan: CarePlan }) {
  const review = reviewState(plan.reviewDate);
  return <article className="rounded-2xl border bg-white p-5 hover:border-sage hover:shadow-card">
    <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-full bg-mint font-bold text-forest">{plan.resident.firstName[0]}{plan.resident.lastName[0]}</div><div><Link href={`/residents/${plan.resident.id}`} className="font-semibold hover:text-forest">{plan.resident.preferredName || plan.resident.firstName} {plan.resident.lastName}</Link><p className="text-xs text-sage">Room {plan.resident.room}</p></div></div><PriorityBadge priority={plan.priority}/></div>
    <h3 className="mt-5 text-lg font-bold">{plan.title}</h3>
    <div className="mt-4 grid gap-4 sm:grid-cols-2"><div><p className="eyebrow">Goal</p><p className="mt-1 line-clamp-3 text-sm">{plan.goals}</p></div><div><p className="eyebrow">Care guidance</p><p className="mt-1 line-clamp-3 text-sm">{plan.guidance}</p></div></div>
    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><div className={`flex items-center gap-2 text-sm font-semibold ${review.tone}`}><CalendarClock size={16}/>{review.label}</div><Link href={`/residents/${plan.resident.id}`} className="flex items-center gap-1 text-sm font-semibold text-forest">Open resident <ChevronRight size={16}/></Link></div>
  </article>;
}

const planSchema = z.object({
  residentId: z.string().min(1, 'Select a resident'), title: z.string().min(3),
  goals: z.string().min(5), guidance: z.string().min(5),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']), reviewDate: z.string().min(1),
});
type PlanForm = z.infer<typeof planSchema>;

function CreatePlanDialog() {
  const [open, setOpen] = useState(false);
  const residents = useQuery({ queryKey: ['residents'], queryFn: api.residents });
  const client = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PlanForm>({ resolver: zodResolver(planSchema), defaultValues: { priority: 'MEDIUM' } });
  const mutation = useMutation({
    mutationFn: async (data: PlanForm) => { const response = await fetch(`${API}/care-plans`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) }); if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message || 'Care plan could not be created'); } return response.json(); },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ['care-plans'] }); reset(); setOpen(false); },
  });
  return <Dialog.Root open={open} onOpenChange={setOpen}><Dialog.Trigger asChild><Button><Plus size={17}/>Create care plan</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50 backdrop-blur-sm"/><Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6 shadow-2xl"><Dialog.Title className="text-xl font-bold">Create care plan</Dialog.Title><Dialog.Description className="mt-1 text-sm text-sage">Add a clear goal and practical guidance for the care team.</Dialog.Description><Dialog.Close className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-xl hover:bg-mint"><X size={18}/></Dialog.Close>
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="mt-6 grid gap-4 sm:grid-cols-2">
      <FormField label="Resident" error={errors.residentId?.message}><select {...register('residentId')}><option value="">Select resident…</option>{residents.data?.filter((item) => item.status === 'ACTIVE').map((resident) => <option key={resident.id} value={resident.id}>{resident.preferredName || resident.firstName} {resident.lastName} · {resident.room}</option>)}</select></FormField>
      <FormField label="Priority" error={errors.priority?.message}><select {...register('priority')}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option></select></FormField>
      <FormField label="Plan title" error={errors.title?.message} wide><input {...register('title')} placeholder="e.g. Mobility and fall prevention"/></FormField>
      <FormField label="Care goals" error={errors.goals?.message} wide><textarea {...register('goals')} rows={3} placeholder="What outcome are we working toward?"/></FormField>
      <FormField label="Guidance for staff" error={errors.guidance?.message} wide><textarea {...register('guidance')} rows={4} placeholder="Describe actions, preferences and escalation guidance."/></FormField>
      <FormField label="Review date" error={errors.reviewDate?.message}><input type="date" {...register('reviewDate')}/></FormField>
      {mutation.error && <div role="alert" className="rounded-xl bg-[#fff0ec] p-3 text-sm text-coral sm:col-span-2">{mutation.error.message}</div>}
      <div className="flex justify-end gap-3 sm:col-span-2"><Dialog.Close asChild><button type="button" className="h-10 rounded-xl border px-4 text-sm font-semibold">Cancel</button></Dialog.Close><Button disabled={mutation.isPending}>{mutation.isPending ? 'Creating…' : 'Create plan'}</Button></div>
    </form>
  </Dialog.Content></Dialog.Portal></Dialog.Root>;
}

function FormField({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactElement }) { return <label className={`text-sm font-semibold ${wide ? 'sm:col-span-2' : ''}`}>{label}<div className="[&_input]:focus-ring [&_select]:focus-ring [&_textarea]:focus-ring [&_input]:mt-1.5 [&_select]:mt-1.5 [&_textarea]:mt-1.5 [&_input]:h-11 [&_select]:h-11 [&_input]:w-full [&_select]:w-full [&_textarea]:w-full [&_input]:rounded-xl [&_select]:rounded-xl [&_textarea]:rounded-xl [&_input]:border [&_select]:border [&_textarea]:border [&_input]:px-3 [&_select]:px-3 [&_textarea]:p-3 [&_input]:font-normal [&_select]:font-normal [&_textarea]:font-normal">{children}</div>{error && <span className="mt-1 block text-xs text-coral">{error}</span>}</label>; }
function Summary({ icon: Icon, label, value, detail, tone }: { icon: typeof HeartHandshake; label: string; value: number; detail: string; tone: string }) { return <div className="card flex items-center gap-4 p-5"><div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}><Icon size={22}/></div><div><p className="text-sm text-sage">{label}</p><p className="text-2xl font-bold">{value}</p><p className="text-xs text-sage">{detail}</p></div></div>; }
function PriorityBadge({ priority }: { priority: CarePlan['priority'] }) { const style = { LOW: 'bg-mint text-forest', MEDIUM: 'bg-[#fff3dc] text-[#946c1f]', HIGH: 'bg-[#fff0ec] text-coral', CRITICAL: 'bg-coral text-white' }; return <Badge className={style[priority]}>{priority.toLowerCase()}</Badge>; }
function reviewState(date: string) { const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000); if (days < 0) return { label: `Review overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`, tone: 'text-coral' }; if (days === 0) return { label: 'Review due today', tone: 'text-[#946c1f]' }; return { label: `Review in ${days} day${days === 1 ? '' : 's'}`, tone: days <= 7 ? 'text-[#946c1f]' : 'text-sage' }; }
