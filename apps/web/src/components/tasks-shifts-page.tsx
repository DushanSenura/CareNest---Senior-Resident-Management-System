"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { api, type CareTaskRecord, type ShiftRecord } from "@/lib/api";
import { Badge, Button, Skeleton } from "./ui";
const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const today = () => new Date().toISOString().slice(0, 10);
export function TasksShiftsPage() {
  const [tab, setTab] = useState<"tasks" | "shifts">("tasks");
  const [date, setDate] = useState(today());
  const tasks = useQuery({ queryKey: ["tasks"], queryFn: api.tasks });
  const shifts = useQuery({
    queryKey: ["shifts", date],
    queryFn: () => api.shifts(date),
  });
  const pending = (tasks.data ?? []).filter(
    (t) => t.status === "PENDING" || t.status === "IN_PROGRESS",
  ).length;
  const overdue = (tasks.data ?? []).filter(
    (t) => t.status !== "COMPLETED" && new Date(t.dueAt) < new Date(),
  ).length;
  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Daily operations</p>
            <h1 className="mt-1 text-2xl font-bold">Tasks & shifts</h1>
            <p className="mt-1 text-sm text-sage">
              Coordinate resident care tasks and staff coverage.
            </p>
          </div>
          <div className="flex gap-2">
            {tab === "tasks" ? <TaskForm /> : <ShiftForm />}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-5 md:p-9">
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Summary icon={Clock3} label="Open tasks" value={pending} />
          <Summary
            icon={CheckCircle2}
            label="Completed"
            value={
              (tasks.data ?? []).filter((t) => t.status === "COMPLETED").length
            }
          />
          <Summary icon={Clock3} label="Overdue" value={overdue} />
          <Summary
            icon={Users}
            label="Staff on shift"
            value={shifts.data?.length ?? 0}
          />
        </section>
        <div className="mb-5 flex w-fit rounded-xl border bg-white p-1">
          <button
            onClick={() => setTab("tasks")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === "tasks" ? "bg-forest text-white" : ""}`}
          >
            Care tasks
          </button>
          <button
            onClick={() => setTab("shifts")}
            className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === "shifts" ? "bg-forest text-white" : ""}`}
          >
            Staff shifts
          </button>
        </div>
        {tab === "tasks" ? (
          <Tasks data={tasks.data ?? []} loading={tasks.isLoading} />
        ) : (
          <Shifts
            data={shifts.data ?? []}
            loading={shifts.isLoading}
            date={date}
            setDate={setDate}
          />
        )}
      </div>
    </main>
  );
}
function Tasks({
  data,
  loading,
}: {
  data: CareTaskRecord[];
  loading: boolean;
}) {
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const r = await fetch(`${API}/tasks/${id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!r.ok) throw new Error("Update failed");
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["tasks"] }),
  });
  return (
    <section className="card overflow-hidden">
      <div className="border-b p-5">
        <p className="eyebrow">Care task register</p>
        <h2 className="mt-1 text-lg font-bold">Resident tasks</h2>
      </div>
      {loading ? (
        <div className="p-5">
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="divide-y">
          {data.map((t) => (
            <div
              key={t.id}
              className="flex flex-col gap-3 p-5 md:flex-row md:items-center"
            >
              <div
                className={`h-10 w-1 rounded-full ${t.status === "COMPLETED" ? "bg-sage" : new Date(t.dueAt) < new Date() ? "bg-coral" : "bg-gold"}`}
              />
              <div className="flex-1">
                <div className="flex gap-2">
                  <h3 className="font-semibold">{t.title}</h3>
                  <Badge>{t.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-sage">
                  {t.resident.preferredName || t.resident.firstName}{" "}
                  {t.resident.lastName} · Room {t.resident.room} ·{" "}
                  {new Date(t.dueAt).toLocaleString()}
                </p>
                <p className="text-xs text-sage">
                  Assigned to:{" "}
                  {t.assignee
                    ? `${t.assignee.firstName} ${t.assignee.lastName}`
                    : "Unassigned"}
                </p>
              </div>
              <select
                value={t.status}
                onChange={(e) =>
                  update.mutate({ id: t.id, status: e.target.value })
                }
                className="focus-ring h-10 rounded-xl border bg-white px-3 text-sm font-semibold"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="MISSED">Missed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
function Shifts({
  data,
  loading,
  date,
  setDate,
}: {
  data: ShiftRecord[];
  loading: boolean;
  date: string;
  setDate: (v: string) => void;
}) {
  const client = useQueryClient();
  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      fetch(`${API}/shifts/${id}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["shifts"] }),
  });
  return (
    <section className="card overflow-hidden">
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <p className="eyebrow">Coverage schedule</p>
          <h2 className="mt-1 text-lg font-bold">Staff shifts</h2>
        </div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="focus-ring h-11 rounded-xl border px-3"
        />
      </div>
      {loading ? (
        <div className="p-5">
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
          {data.map((s) => (
            <article key={s.id} className="rounded-2xl border p-5">
              <div className="flex justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-mint font-bold text-forest">
                  {s.staff.firstName[0]}
                  {s.staff.lastName[0]}
                </div>
                <Badge>{s.shiftType}</Badge>
              </div>
              <h3 className="mt-4 font-bold">
                {s.staff.firstName} {s.staff.lastName}
              </h3>
              <p className="text-sm text-sage">
                {s.staff.role} · {s.unit || "General"}
              </p>
              <p className="mt-3 flex items-center gap-2 font-semibold">
                <Clock3 size={16} />
                {s.startTime} – {s.endTime}
              </p>
              <select
                value={s.status}
                onChange={(e) =>
                  update.mutate({ id: s.id, status: e.target.value })
                }
                className="mt-4 h-9 w-full rounded-lg border px-2 text-sm"
              >
                <option>SCHEDULED</option>
                <option>CHECKED_IN</option>
                <option>COMPLETED</option>
                <option>ABSENT</option>
              </select>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
function TaskForm() {
  const [open, setOpen] = useState(false),
    [form, setForm] = useState({
      residentId: "",
      assigneeId: "",
      title: "",
      category: "Personal care",
      dueAt: "",
      notes: "",
    });
  const residents = useQuery({
      queryKey: ["residents"],
      queryFn: api.residents,
    }),
    staff = useQuery({ queryKey: ["staff"], queryFn: api.staff }),
    client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      fetch(`${API}/tasks`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => {
        if (!r.ok) throw Error("Task could not be saved");
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
    },
  });
  return (
    <SimpleDialog
      open={open}
      setOpen={setOpen}
      title="Add care task"
      trigger="Add task"
      save={() => save.mutate()}
    >
      <Select
        label="Resident"
        value={form.residentId}
        set={(v) => setForm({ ...form, residentId: v })}
        options={(residents.data ?? []).map((r) => [
          r.id,
          `${r.firstName} ${r.lastName} · ${r.room}`,
        ])}
      />
      <Select
        label="Assign staff"
        value={form.assigneeId}
        set={(v) => setForm({ ...form, assigneeId: v })}
        options={(staff.data ?? []).map((s) => [
          s.id,
          `${s.firstName} ${s.lastName}`,
        ])}
      />
      <Input
        label="Task title"
        value={form.title}
        set={(v) => setForm({ ...form, title: v })}
      />
      <Input
        label="Category"
        value={form.category}
        set={(v) => setForm({ ...form, category: v })}
      />
      <Input
        label="Due date & time"
        type="datetime-local"
        value={form.dueAt}
        set={(v) => setForm({ ...form, dueAt: v })}
      />
      <Input
        label="Notes"
        value={form.notes}
        set={(v) => setForm({ ...form, notes: v })}
      />
    </SimpleDialog>
  );
}
function ShiftForm() {
  const [open, setOpen] = useState(false),
    [form, setForm] = useState({
      staffId: "",
      shiftDate: today(),
      startTime: "07:00",
      endTime: "15:00",
      shiftType: "Morning",
      unit: "",
      notes: "",
    });
  const staff = useQuery({ queryKey: ["staff"], queryFn: api.staff }),
    client = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      fetch(`${API}/shifts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      }).then((r) => {
        if (!r.ok) throw Error("Shift could not be saved");
      }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["shifts"] });
      setOpen(false);
    },
  });
  return (
    <SimpleDialog
      open={open}
      setOpen={setOpen}
      title="Schedule staff shift"
      trigger="Add shift"
      save={() => save.mutate()}
    >
      <Select
        label="Staff member"
        value={form.staffId}
        set={(v) => setForm({ ...form, staffId: v })}
        options={(staff.data ?? [])
          .filter((s) => s.status === "ACTIVE")
          .map((s) => [s.id, `${s.firstName} ${s.lastName} · ${s.role}`])}
      />
      <Input
        label="Shift date"
        type="date"
        value={form.shiftDate}
        set={(v) => setForm({ ...form, shiftDate: v })}
      />
      <Input
        label="Start time"
        type="time"
        value={form.startTime}
        set={(v) => setForm({ ...form, startTime: v })}
      />
      <Input
        label="End time"
        type="time"
        value={form.endTime}
        set={(v) => setForm({ ...form, endTime: v })}
      />
      <Input
        label="Shift type"
        value={form.shiftType}
        set={(v) => setForm({ ...form, shiftType: v })}
      />
      <Input
        label="Unit / wing"
        value={form.unit}
        set={(v) => setForm({ ...form, unit: v })}
      />
    </SimpleDialog>
  );
}
function SimpleDialog({
  open,
  setOpen,
  title,
  trigger,
  save,
  children,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  title: string;
  trigger: string;
  save: () => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>
          <Plus size={17} />
          {trigger}
        </Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6">
          <Dialog.Title className="text-xl font-bold">{title}</Dialog.Title>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5"
          >
            <X />
          </button>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">{children}</div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setOpen(false)}
              className="h-10 rounded-xl border px-4"
            >
              Cancel
            </button>
            <Button onClick={save}>Save</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function Input({
  label,
  value,
  set,
  type = "text",
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => set(e.target.value)}
        className="focus-ring mt-1.5 h-11 w-full rounded-xl border px-3"
      />
    </label>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: string[][];
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="focus-ring mt-1.5 h-11 w-full rounded-xl border px-3"
      >
        <option value="">Select…</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
function Summary({ icon: Icon, label, value }: any) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-forest">
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-sage">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
