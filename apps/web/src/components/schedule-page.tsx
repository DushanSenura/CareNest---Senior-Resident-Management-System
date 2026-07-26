"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createId } from "@/lib/id";
import { Badge, Button } from "./ui";
import { canManageCareContent, currentAccount } from "@/lib/access";

type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  type: string;
  resident: string;
  staff: string;
  location: string;
  status: string;
  notes: string;
};
const seed: ScheduleEvent[] = [
  {
    id: "1",
    title: "Dr. Fernando review",
    date: "",
    start: "09:00",
    end: "09:45",
    type: "Appointment",
    resident: "Eleanor Bennett",
    staff: "Maya Perera",
    location: "Consultation room",
    status: "Scheduled",
    notes: "Routine clinical review",
  },
  {
    id: "2",
    title: "Morning mobility group",
    date: "",
    start: "10:00",
    end: "11:00",
    type: "Activity",
    resident: "All residents",
    staff: "Nimal Silva",
    location: "Garden hall",
    status: "Scheduled",
    notes: "",
  },
  {
    id: "3",
    title: "Family visit",
    date: "",
    start: "14:00",
    end: "15:00",
    type: "Visit",
    resident: "Mabel Foster",
    staff: "Front desk",
    location: "Family lounge",
    status: "Confirmed",
    notes: "",
  },
];
const blank = {
  title: "",
  date: "",
  start: "09:00",
  end: "10:00",
  type: "Appointment",
  resident: "",
  staff: "",
  location: "",
  status: "Scheduled",
  notes: "",
};
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (d: Date, n: number) => {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
};
const startOfWeek = (d: Date) => {
  const monday = addDays(d, -((d.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export function SchedulePage() {
  const canManage = canManageCareContent(currentAccount()?.role);
  const [mounted, setMounted] = useState(false),
    [selected, setSelected] = useState<Date | null>(null),
    [events, setEvents] = useState<ScheduleEvent[]>([]),
    [query, setQuery] = useState(""),
    [type, setType] = useState("All"),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<string | null>(null),
    [form, setForm] = useState(blank);
  useEffect(() => {
    const today = new Date();
    setSelected(today);
    const saved = localStorage.getItem("carenest_schedule");
    setEvents(
      saved
        ? JSON.parse(saved)
        : seed.map((e, i) => ({
            ...e,
            date: iso(addDays(today, i === 2 ? 1 : 0)),
          })),
    );
    setMounted(true);
  }, []);
  const persist = (next: ScheduleEvent[]) => {
    setEvents(next);
    localStorage.setItem("carenest_schedule", JSON.stringify(next));
  };
  const week = useMemo(
    () =>
      selected
        ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(selected), i))
        : [],
    [selected],
  );
  const visible = events.filter(
    (e) =>
      (type === "All" || e.type === type) &&
      `${e.title} ${e.resident} ${e.staff}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const launch = (date?: Date, event?: ScheduleEvent) => {
    if (event) {
      setEditing(event.id);
      setForm({ ...event });
    } else {
      setEditing(null);
      setForm({ ...blank, date: iso(date ?? selected ?? new Date()) });
    }
    setOpen(true);
  };
  const save = () => {
    if (!form.title || !form.date || !form.start) return;
    if (editing)
      persist(
        events.map((e) => (e.id === editing ? { ...form, id: editing } : e)),
      );
    else persist([...events, { ...form, id: createId("schedule") }]);
    setOpen(false);
  };
  const status = (id: string, value: string) =>
    persist(events.map((e) => (e.id === id ? { ...e, status: value } : e)));
  if (!mounted || !selected)
    return (
      <main className="min-h-screen bg-cream lg:ml-64">
        <div className="p-9">
          <div className="h-[650px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  const month = selected.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Care operations</p>
            <h1 className="mt-1 text-2xl font-bold">Schedule</h1>
            <p className="mt-1 text-sm text-sage">
              Coordinate appointments, activities, visits and care events.
            </p>
          </div>
          {canManage && (
            <Button onClick={() => launch()}>
              <Plus size={17} />
              Add schedule
            </Button>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-5 md:p-9">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelected(new Date())}
              className="h-10 rounded-xl border bg-white px-4 text-sm font-semibold"
            >
              Today
            </button>
            <button
              aria-label="Previous week"
              onClick={() => setSelected(addDays(selected, -7))}
              className="grid h-10 w-10 place-items-center rounded-xl border bg-white"
            >
              <ChevronLeft size={19} />
            </button>
            <button
              aria-label="Next week"
              onClick={() => setSelected(addDays(selected, 7))}
              className="grid h-10 w-10 place-items-center rounded-xl border bg-white"
            >
              <ChevronRight size={19} />
            </button>
            <WeekPicker selected={selected} setSelected={setSelected} />
            <h2 className="ml-2 text-lg font-bold">{month}</h2>
          </div>
          <div className="flex gap-2">
            <label className="relative">
              <Search className="absolute left-3 top-2.5 text-sage" size={18} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search schedule..."
                className="h-10 w-56 rounded-xl border bg-white pl-10 pr-3 text-sm"
              />
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 rounded-xl border bg-white px-3 text-sm"
            >
              <option>All</option>
              <option>Appointment</option>
              <option>Activity</option>
              <option>Visit</option>
              <option>Care task</option>
              <option>Meeting</option>
            </select>
          </div>
        </div>
        <section className="grid overflow-hidden rounded-2xl border bg-white shadow-card md:grid-cols-7">
          {week.map((day) => {
            const dayEvents = visible.filter((e) => e.date === iso(day));
            const today = iso(day) === iso(new Date());
            return (
              <div
                key={iso(day)}
                className="min-h-[520px] border-b md:border-b-0 md:border-r last:border-r-0"
              >
                <button
                  onClick={() => setSelected(day)}
                  className={`w-full border-b p-3 text-center ${today ? "bg-mint" : ""}`}
                >
                  <p className="text-xs font-semibold uppercase text-sage">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </p>
                  <p
                    className={`mx-auto mt-1 grid h-8 w-8 place-items-center rounded-full text-lg font-bold ${today ? "bg-forest text-white" : ""}`}
                  >
                    {day.getDate()}
                  </p>
                </button>
                <div className="space-y-2 p-2">
                  {dayEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => canManage && launch(day, event)}
                      className={`w-full rounded-xl border-l-4 p-3 text-left hover:shadow-sm ${event.type === "Appointment" ? "border-l-blue-500 bg-blue-50" : event.type === "Activity" ? "border-l-emerald-500 bg-emerald-50" : event.type === "Visit" ? "border-l-orange-500 bg-orange-50" : "border-l-purple-500 bg-purple-50"}`}
                    >
                      <p className="text-xs font-bold">{event.start}</p>
                      <p className="mt-1 text-sm font-semibold leading-tight">
                        {event.title}
                      </p>
                      <p className="mt-1 truncate text-[11px] text-sage">
                        {event.resident}
                      </p>
                    </button>
                  ))}
                  {canManage && (
                    <button
                      onClick={() => launch(day)}
                      className="w-full rounded-lg border border-dashed p-2 text-xs font-semibold text-sage hover:bg-cream"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>
        <section className="card mt-6 overflow-hidden">
          <div className="border-b p-5">
            <p className="eyebrow">Upcoming agenda</p>
            <h2 className="mt-1 text-lg font-bold">Scheduled events</h2>
          </div>
          <div className="divide-y">
            {visible
              .sort((a, b) =>
                `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`),
              )
              .map((event) => (
                <div
                  key={event.id}
                  className="flex flex-wrap items-center gap-4 p-5"
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-forest">
                    <CalendarDays size={21} />
                  </div>
                  <div className="min-w-48 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{event.title}</h3>
                      <Badge>{event.type}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-sage">
                      <Clock3 size={13} className="mr-1 inline" />
                      {event.date} · {event.start}–{event.end}{" "}
                      <MapPin size={13} className="ml-2 mr-1 inline" />
                      {event.location || "Not assigned"}
                    </p>
                    <p className="mt-1 text-xs text-sage">
                      <Users size={13} className="mr-1 inline" />
                      {event.resident || "No resident"} ·{" "}
                      {event.staff || "Unassigned"}
                    </p>
                  </div>
                  <select
                    value={event.status}
                    disabled={!canManage}
                    onChange={(e) => status(event.id, e.target.value)}
                    className="h-10 rounded-xl border bg-white px-3 text-sm font-semibold"
                  >
                    <option>Scheduled</option>
                    <option>Confirmed</option>
                    <option>In progress</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                  {canManage && (
                    <button
                      onClick={() =>
                        launch(new Date(`${event.date}T12:00:00`), event)
                      }
                      className="h-10 rounded-xl border px-4 text-sm font-semibold"
                    >
                      Edit
                    </button>
                  )}
                </div>
              ))}
          </div>
        </section>
      </div>
      {canManage && (
        <ScheduleDialog
          open={open}
          setOpen={setOpen}
          form={form}
          setForm={setForm}
          save={save}
          editing={!!editing}
          remove={
            editing
              ? () => {
                  persist(events.filter((e) => e.id !== editing));
                  setOpen(false);
                }
              : undefined
          }
        />
      )}
    </main>
  );
}
function WeekPicker({
  selected,
  setSelected,
}: {
  selected: Date;
  setSelected: (date: Date) => void;
}) {
  const [open, setOpen] = useState(false),
    [month, setMonth] = useState(
      () => new Date(selected.getFullYear(), selected.getMonth(), 1),
    );
  const gridStart = startOfWeek(
    new Date(month.getFullYear(), month.getMonth(), 1),
  );
  const days = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  const selectedStart = startOfWeek(selected),
    selectedEnd = addDays(selectedStart, 6);
  const choose = (day: Date) => {
    setSelected(startOfWeek(day));
    setOpen(false);
  };
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
          setOpen(!open);
        }}
        aria-expanded={open}
        className="focus-ring flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-sm font-semibold shadow-sm hover:border-sage"
      >
        <CalendarDays size={17} className="text-forest" />
        <span>
          Week of{" "}
          {selectedStart.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })}
        </span>
        <ChevronRight
          size={15}
          className={`text-sage transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-12 z-30 w-[330px] rounded-2xl border bg-white p-4 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
              }
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-mint"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="font-bold">
                {month.toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="text-[11px] text-sage">
                Select any day to open its week
              </p>
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() =>
                setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
              }
              className="grid h-9 w-9 place-items-center rounded-xl hover:bg-mint"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-bold uppercase text-sage">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day} className="py-2">
                {day}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const inMonth = day.getMonth() === month.getMonth(),
                inWeek = day >= selectedStart && day <= selectedEnd,
                isToday = iso(day) === iso(new Date());
              return (
                <button
                  type="button"
                  key={iso(day)}
                  onClick={() => choose(day)}
                  className={`relative grid h-9 place-items-center text-sm transition-colors ${inWeek ? "bg-mint font-bold text-forest first:rounded-l-lg last:rounded-r-lg" : "hover:rounded-lg hover:bg-cream"} ${!inMonth ? "text-slate-300" : "text-current"}`}
                >
                  {day.getDate()}
                  {isToday && (
                    <span className="absolute bottom-1 h-1 w-1 rounded-full bg-coral" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <p className="text-xs text-sage">Weeks begin on Monday</p>
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setMonth(new Date(today.getFullYear(), today.getMonth(), 1));
                choose(today);
              }}
              className="text-xs font-bold text-forest"
            >
              Current week
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
function ScheduleDialog({
  open,
  setOpen,
  form,
  setForm,
  save,
  editing,
  remove,
}: {
  open: boolean;
  setOpen: (v: boolean) => void;
  form: typeof blank;
  setForm: (v: typeof blank) => void;
  save: () => void;
  editing: boolean;
  remove?: () => void;
}) {
  const field = (key: keyof typeof blank) => (value: string) =>
    setForm({ ...form, [key]: value });
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-6">
          <Dialog.Title className="text-xl font-bold">
            {editing ? "Edit schedule" : "Add schedule"}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-sage">
            Enter the event details and assigned people.
          </Dialog.Description>
          <button
            onClick={() => setOpen(false)}
            className="absolute right-5 top-5"
          >
            <X />
          </button>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input label="Title" value={form.title} set={field("title")} />
            <Select
              label="Type"
              value={form.type}
              set={field("type")}
              options={[
                "Appointment",
                "Activity",
                "Visit",
                "Care task",
                "Meeting",
              ]}
            />
            <Input
              label="Date"
              type="date"
              value={form.date}
              set={field("date")}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Start"
                type="time"
                value={form.start}
                set={field("start")}
              />
              <Input
                label="End"
                type="time"
                value={form.end}
                set={field("end")}
              />
            </div>
            <Input
              label="Resident / group"
              value={form.resident}
              set={field("resident")}
            />
            <Input
              label="Assigned staff"
              value={form.staff}
              set={field("staff")}
            />
            <Input
              label="Location"
              value={form.location}
              set={field("location")}
            />
            <Select
              label="Status"
              value={form.status}
              set={field("status")}
              options={[
                "Scheduled",
                "Confirmed",
                "In progress",
                "Completed",
                "Cancelled",
              ]}
            />
            <label className="text-sm font-semibold sm:col-span-2">
              Notes
              <textarea
                value={form.notes}
                onChange={(e) => field("notes")(e.target.value)}
                rows={3}
                className="mt-1.5 w-full rounded-xl border p-3 font-normal"
              />
            </label>
          </div>
          <div className="mt-6 flex items-center justify-between">
            {remove ? (
              <button
                onClick={remove}
                className="text-sm font-semibold text-coral"
              >
                Delete event
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setOpen(false)}
                className="h-10 rounded-xl border px-4"
              >
                Cancel
              </button>
              <Button onClick={save}>Save schedule</Button>
            </div>
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
        value={value}
        type={type}
        onChange={(e) => set(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border px-3 font-normal"
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
  options: string[];
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3 font-normal"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
