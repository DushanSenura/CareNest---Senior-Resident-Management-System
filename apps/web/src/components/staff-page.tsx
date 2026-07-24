"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Check,
  ChevronDown,
  Edit3,
  Mail,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { api, type StaffRecord } from "@/lib/api";
import { Badge, Button, Skeleton } from "./ui";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function StaffPage() {
  const query = useQuery({ queryKey: ["staff"], queryFn: api.staff });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [editing, setEditing] = useState<StaffRecord>();
  const staff = useMemo(
    () =>
      (query.data ?? []).filter(
        (item) =>
          `${item.firstName} ${item.lastName} ${item.email} ${item.role} ${item.department ?? ""}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (filter === "ALL" || item.status === filter),
      ),
    [query.data, search, filter],
  );
  const all = query.data ?? [];
  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Workforce management</p>
            <h1 className="mt-1 text-2xl font-bold">Staff</h1>
            <p className="mt-1 text-sm text-sage">
              Manage team profiles, roles, shifts and employment status.
            </p>
          </div>
          <StaffForm
            trigger={
              <Button>
                <Plus size={17} />
                Add staff member
              </Button>
            }
          />
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-5 md:p-9">
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Summary
            icon={Users}
            label="Total staff"
            value={all.length}
            tone="bg-mint text-forest"
          />
          <Summary
            icon={UserCheck}
            label="Active staff"
            value={all.filter((x) => x.status === "ACTIVE").length}
            tone="bg-[#e9f2ff] text-[#356da8]"
          />
          <Summary
            icon={Briefcase}
            label="On leave"
            value={all.filter((x) => x.status === "ON_LEAVE").length}
            tone="bg-[#fff3dc] text-[#946c1f]"
          />
          <Summary
            icon={ShieldCheck}
            label="Clinical team"
            value={
              all.filter((x) => /nurse|doctor|clinical/i.test(x.role)).length
            }
            tone="bg-[#fff0ec] text-coral"
          />
        </section>
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Team directory</p>
              <h2 className="mt-1 text-lg font-bold">Staff members</h2>
            </div>
            <div className="flex gap-3">
              <label className="relative">
                <Search className="absolute left-3 top-3 text-sage" size={17} />
                <input
                  suppressHydrationWarning
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search staff..."
                  className="focus-ring h-11 w-64 rounded-xl border pl-10 pr-3 text-sm"
                />
              </label>
              <select
                suppressHydrationWarning
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="focus-ring h-11 rounded-xl border bg-white px-3 text-sm font-semibold"
              >
                <option value="ALL">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          {query.isLoading ? (
            <div className="p-5">
              <Skeleton className="h-72" />
            </div>
          ) : (
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              {staff.map((item) => (
                <StaffCard
                  key={item.id}
                  staff={item}
                  edit={() => setEditing(item)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      {editing && (
        <StaffForm
          trigger={null}
          staff={editing}
          open
          close={() => setEditing(undefined)}
        />
      )}
    </main>
  );
}
function StaffCard({ staff, edit }: { staff: StaffRecord; edit: () => void }) {
  return (
    <article className="rounded-2xl border p-5 hover:border-sage hover:shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-mint font-bold text-forest">
            {staff.profilePhotoUrl?<img src={staff.profilePhotoUrl} alt={`${staff.firstName} ${staff.lastName}`} className="h-full w-full object-cover"/>:<>{staff.firstName[0]}{staff.lastName[0]}</>}
          </div>
          <div>
            <h3 className="font-bold">
              {staff.firstName} {staff.lastName}
            </h3>
            <p className="text-sm text-sage">{staff.role}</p>
            <p className="text-xs text-sage">
              {staff.employeeId || "No employee ID"}
            </p>
          </div>
        </div>
        <button
          onClick={edit}
          className="grid h-9 w-9 place-items-center rounded-lg hover:bg-mint"
        >
          <Edit3 size={17} />
        </button>
      </div>
      <div className="mt-5 space-y-2 border-t pt-4 text-sm">
        <p className="flex items-center gap-2">
          <Mail size={15} className="text-sage" />
          {staff.email}
        </p>
        <p className="flex items-center gap-2">
          <Phone size={15} className="text-sage" />
          {staff.phone || "No phone"}
        </p>
        <p className="flex items-center gap-2">
          <Briefcase size={15} className="text-sage" />
          {staff.department || "General"} · {staff.shift || "Flexible shift"}
        </p>
        <p className="flex items-center gap-2">
          <Briefcase size={15} className="text-sage" />
          {staff.branch || "No branch assigned"}
        </p>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Status status={staff.status} />
        <StatusSelect staff={staff} />
      </div>
    </article>
  );
}
function StatusSelect({ staff }: { staff: StaffRecord }) {
  const client = useQueryClient();
  const [open,setOpen]=useState(false);
  const mutation = useMutation({
    mutationFn: async (status: string) => {
      const r = await fetch(`${API}/staff/${staff.id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Status update failed");
    },
    onSuccess: async () => { await client.invalidateQueries({ queryKey: ["staff"] }); setOpen(false); },
  });
  const options=[
    {value:"ACTIVE",label:"Active",description:"Working normally",dot:"bg-emerald-500"},
    {value:"ON_LEAVE",label:"On leave",description:"Temporarily away",dot:"bg-amber-500"},
    {value:"SUSPENDED",label:"Suspended",description:"Access restricted",dot:"bg-red-500"},
    {value:"INACTIVE",label:"Inactive",description:"Not currently employed",dot:"bg-slate-400"},
  ] as const;
  const current=options.find(option=>option.value===staff.status)!;
  return (
    <div className="relative">
      <button type="button" disabled={mutation.isPending} onClick={()=>setOpen(!open)} aria-haspopup="listbox" aria-expanded={open} className="focus-ring flex h-9 min-w-32 items-center justify-between gap-2 rounded-xl border bg-white px-3 text-xs font-semibold shadow-sm hover:border-sage disabled:opacity-60">
        <span className={`h-2 w-2 rounded-full ${current.dot}`}/><span className="flex-1 text-left">{mutation.isPending?"Updating…":current.label}</span><ChevronDown size={14} className={`text-sage transition-transform ${open?"rotate-180":""}`}/>
      </button>
      {open&&<div role="listbox" className="absolute bottom-11 right-0 z-30 w-64 overflow-hidden rounded-2xl border bg-white p-2 shadow-xl">
        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-sage">Change employment status</p>
        {options.map(option=><button type="button" role="option" aria-selected={staff.status===option.value} key={option.value} onClick={()=>staff.status===option.value?setOpen(false):mutation.mutate(option.value)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${staff.status===option.value?"bg-mint":"hover:bg-cream"}`}>
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.dot}`}/><span className="min-w-0 flex-1"><strong className="block text-sm">{option.label}</strong><span className="block text-[11px] text-sage">{option.description}</span></span>{staff.status===option.value&&<Check size={16} className="text-forest"/>}
        </button>)}
      </div>}
    </div>
  );
}
const baseSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string(),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  role: z.string().min(2),
  employeeId: z.string().optional(),
  branch: z.string().min(2, "Select a branch"),
  department: z.string().optional(),
  shift: z.string().optional(),
  hireDate: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "SUSPENDED", "INACTIVE"]),
});
type Form = z.infer<typeof baseSchema>;
const staffSchema = (editing: boolean) =>
  baseSchema.superRefine((data, ctx) => {
    if (!editing && data.password.length < 8)
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must contain at least 8 characters",
      });
    if (editing && data.password && data.password.length < 8)
      ctx.addIssue({
        code: "custom",
        path: ["password"],
        message: "Password must contain at least 8 characters",
      });
    if (data.password !== data.confirmPassword)
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
  });
function StaffForm({
  trigger,
  staff,
  open,
  close,
}: {
  trigger: React.ReactNode;
  staff?: StaffRecord;
  open?: boolean;
  close?: () => void;
}) {
  const [inner, setInner] = useState(false);
  const isOpen = open ?? inner;
  const setOpen = close
    ? (v: boolean) => {
        if (!v) close();
      }
    : setInner;
  const client = useQueryClient();
  const [branches,setBranches]=useState<string[]>(["Willow Grove Residence","Sunrise Senior Living","Coastal Haven"]);
  useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem("carenest_branches")??"[]");if(Array.isArray(saved)&&saved.length)setBranches(saved.filter((branch:{status?:string})=>branch.status==="ACTIVE").map((branch:{name:string})=>branch.name))}catch{}},[]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    resolver: zodResolver(staffSchema(!!staff)),
    defaultValues: staff
      ? {
          ...staff,
          password: "",
          confirmPassword: "",
          hireDate: staff.hireDate?.slice(0, 10),
        }
      : {
          status: "ACTIVE",
          password: "",
          confirmPassword: "",
          role: "Caregiver",
          branch: "Willow Grove Residence",
        },
  });
  const mutation = useMutation({
    mutationFn: async (data: Form) => {
      const { confirmPassword, ...fields } = data;
      const payload = fields.password
        ? fields
        : Object.fromEntries(
            Object.entries(fields).filter(([key]) => key !== "password"),
          );
      const r = await fetch(`${API}/staff${staff ? `/${staff.id}` : ""}`, {
        method: staff ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, facilityId: "demo-facility" }),
      });
      if (!r.ok) {
        const b = await r.json().catch(() => ({}));
        throw new Error(
          Array.isArray(b.message)
            ? b.message.join(", ")
            : b.message || "Staff record could not be saved",
        );
      }
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["staff"] });
      setOpen(false);
    },
  });
  return (
    <Dialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6">
          <Dialog.Title className="text-xl font-bold">
            {staff ? "Edit staff member" : "Add staff member"}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-sage">
            {staff
              ? "Update the profile or enter a new password to reset login access."
              : "Profile details and secure login account information."}
          </Dialog.Description>
          <Dialog.Close className="absolute right-5 top-5">
            <X />
          </Dialog.Close>
          <form
            onSubmit={handleSubmit((d) => mutation.mutate(d))}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >
            <Field label="First name" error={errors.firstName?.message}>
              <input {...register("firstName")} />
            </Field>
            <Field label="Last name" error={errors.lastName?.message}>
              <input {...register("lastName")} />
            </Field>
            <Field label="Login email" error={errors.email?.message}>
              <input type="email" autoComplete="email" {...register("email")} />
            </Field>
            <Field label="Phone">
              <input {...register("phone")} />
            </Field>
            <Field
              label={staff ? "New password (optional)" : "Login password"}
              error={errors.password?.message}
            >
              <input
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </Field>
            <Field
              label="Confirm password"
              error={errors.confirmPassword?.message}
            >
              <input
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </Field>
            <Field label="Access role" error={errors.role?.message}>
              <select {...register("role")}>
                <option>Super Admin</option>
                <option>Admin</option>
                <option>Care Manager</option>
                <option>Caregiver</option>
                <option>Nurse</option>
                <option>Doctor</option>
                <option>HR Manager</option>
              </select>
            </Field>
            <Field label="Branch" error={errors.branch?.message}>
              <select {...register("branch")}>
                <option value="">Select branch…</option>
                {branches.map(branch=><option key={branch}>{branch}</option>)}
              </select>
            </Field>
            <div className="rounded-xl bg-mint p-3 text-sm sm:col-span-2"><strong>Employee ID:</strong> {staff?.employeeId||"Generated automatically from the selected role when the account is created."}</div>
            <Field label="Department">
              <input {...register("department")} />
            </Field>
            <Field label="Shift">
              <select {...register("shift")}>
                <option value="">Select shift…</option>
                <option>Morning</option>
                <option>Evening</option>
                <option>Night</option>
                <option>Rotating</option>
              </select>
            </Field>
            <Field label="Hire date">
              <input type="date" {...register("hireDate")} />
            </Field>
            <Field label="Status">
              <select {...register("status")}>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </Field>
            <Field label="Address" wide>
              <textarea rows={2} {...register("address")} />
            </Field>
            <Field label="Emergency contact" wide>
              <input {...register("emergencyContact")} />
            </Field>
            {mutation.error && (
              <p className="rounded-xl bg-[#fff0ec] p-3 text-sm text-coral sm:col-span-2">
                {mutation.error.message}
              </p>
            )}
            <div className="flex justify-end gap-3 sm:col-span-2">
              <Dialog.Close asChild>
                <button type="button" className="h-10 rounded-xl border px-4">
                  Cancel
                </button>
              </Dialog.Close>
              <Button disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving…"
                  : staff
                    ? "Save changes"
                    : "Create staff account"}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function Field({
  label,
  error,
  wide,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  children: React.ReactElement;
}) {
  return (
    <label className={`text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <div className="[&>*]:focus-ring [&>*]:mt-1.5 [&>*]:w-full [&>*]:rounded-xl [&>*]:border [&>*]:p-3 [&_input]:h-11 [&_select]:h-11">
        {children}
      </div>
      {error && <span className="text-xs text-coral">{error}</span>}
    </label>
  );
}
function Status({ status }: { status: StaffRecord["status"] }) {
  const styles = {
    ACTIVE: "bg-mint text-forest",
    ON_LEAVE: "bg-[#fff3dc] text-[#946c1f]",
    SUSPENDED: "bg-[#fff0ec] text-coral",
    INACTIVE: "bg-slate-100 text-slate-500",
  };
  return (
    <Badge className={styles[status]}>
      {status.toLowerCase().replace("_", " ")}
    </Badge>
  );
}
function Summary({ icon: Icon, label, value, tone }: any) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-xl ${tone}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-sage">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
