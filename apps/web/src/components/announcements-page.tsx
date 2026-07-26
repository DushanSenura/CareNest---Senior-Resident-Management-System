"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Archive,
  CalendarClock,
  Edit3,
  Eye,
  Megaphone,
  Plus,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createId } from "@/lib/id";
import { Badge, Button } from "./ui";
import { canManageCareContent, currentAccount } from "@/lib/access";

type Announcement = {
  id: string;
  title: string;
  message: string;
  audience: string;
  branch: string;
  priority: "Normal" | "Important" | "Urgent";
  status: "Draft" | "Published" | "Scheduled" | "Archived";
  publishAt: string;
  expiresAt: string;
  author: string;
  createdAt: string;
};
const nowInput = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const seed: Announcement[] = [
  {
    id: "1",
    title: "Updated medication round procedure",
    message:
      "All nursing staff must review the updated medication administration checklist before the evening round.",
    audience: "Nurses & caregivers",
    branch: "All branches",
    priority: "Important",
    status: "Published",
    publishAt: "2026-07-24T08:00",
    expiresAt: "2026-08-01T18:00",
    author: "Maya Perera",
    createdAt: "2026-07-24T07:45",
  },
  {
    id: "2",
    title: "Family visiting hours this weekend",
    message:
      "Weekend visiting hours are 9:00 AM to 6:00 PM. Please register all visitors at reception.",
    audience: "Residents & families",
    branch: "Willow Grove Residence",
    priority: "Normal",
    status: "Published",
    publishAt: "2026-07-24T09:00",
    expiresAt: "2026-07-27T18:00",
    author: "Administration",
    createdAt: "2026-07-23T15:30",
  },
  {
    id: "3",
    title: "Emergency drill",
    message:
      "A scheduled fire and evacuation drill will take place next Tuesday at 10:30 AM.",
    audience: "All staff",
    branch: "All branches",
    priority: "Urgent",
    status: "Scheduled",
    publishAt: "2026-07-27T08:00",
    expiresAt: "2026-07-29T18:00",
    author: "Safety Officer",
    createdAt: "2026-07-24T10:00",
  },
];
const blank: Omit<Announcement, "id" | "createdAt"> = {
  title: "",
  message: "",
  audience: "All staff",
  branch: "All branches",
  priority: "Normal",
  status: "Draft",
  publishAt: "",
  expiresAt: "",
  author: "Current user",
};

export function AnnouncementsPage() {
  const canManage = canManageCareContent(currentAccount()?.role);
  const [mounted, setMounted] = useState(false),
    [items, setItems] = useState<Announcement[]>([]),
    [search, setSearch] = useState(""),
    [status, setStatus] = useState("All"),
    [open, setOpen] = useState(false),
    [editing, setEditing] = useState<Announcement | null>(null),
    [view, setView] = useState<Announcement | null>(null);
  useEffect(() => {
    const saved = localStorage.getItem("carenest_announcements");
    setItems(saved ? JSON.parse(saved) : seed);
    setMounted(true);
  }, []);
  const persist = (next: Announcement[]) => {
    setItems(next);
    localStorage.setItem("carenest_announcements", JSON.stringify(next));
  };
  const visible = useMemo(
    () =>
      items.filter(
        (item) =>
          `${item.title} ${item.message} ${item.audience} ${item.branch}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          (status === "All" || item.status === status),
      ),
    [items, search, status],
  );
  const updateStatus = (id: string, next: Announcement["status"]) =>
    persist(
      items.map((item) => (item.id === id ? { ...item, status: next } : item)),
    );
  if (!mounted)
    return (
      <main className="min-h-screen bg-cream lg:ml-64">
        <div className="p-9">
          <div className="h-[600px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Organization communication</p>
            <h1 className="mt-1 text-2xl font-bold">Announcements</h1>
            <p className="mt-1 text-sm text-sage">
              Share important updates with staff, residents and families.
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
            >
              <Plus size={17} />
              New announcement
            </Button>
          )}
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-5 md:p-9">
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Summary
            icon={Megaphone}
            label="Published"
            value={items.filter((i) => i.status === "Published").length}
          />
          <Summary
            icon={CalendarClock}
            label="Scheduled"
            value={items.filter((i) => i.status === "Scheduled").length}
          />
          <Summary
            icon={Edit3}
            label="Drafts"
            value={items.filter((i) => i.status === "Draft").length}
          />
          <Summary
            icon={Archive}
            label="Archived"
            value={items.filter((i) => i.status === "Archived").length}
          />
        </section>
        <section className="card overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="eyebrow">Communication center</p>
              <h2 className="mt-1 text-lg font-bold">All announcements</h2>
            </div>
            <div className="flex gap-2">
              <label className="relative">
                <Search className="absolute left-3 top-3 text-sage" size={17} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search announcements..."
                  className="h-11 w-64 rounded-xl border pl-10 pr-3 text-sm"
                />
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-11 rounded-xl border bg-white px-3 text-sm font-semibold"
              >
                {["All", "Draft", "Published", "Scheduled", "Archived"].map(
                  (value) => (
                    <option key={value}>{value}</option>
                  ),
                )}
              </select>
            </div>
          </div>
          <div className="divide-y">
            {visible.map((item) => (
              <article key={item.id} className="p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl ${item.priority === "Urgent" ? "bg-[#fff0ec] text-coral" : item.priority === "Important" ? "bg-[#fff3dc] text-[#946c1f]" : "bg-mint text-forest"}`}
                  >
                    <Megaphone size={21} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{item.title}</h3>
                      <Badge
                        className={
                          item.priority === "Urgent"
                            ? "bg-[#fff0ec] text-coral"
                            : item.priority === "Important"
                              ? "bg-[#fff3dc] text-[#946c1f]"
                              : ""
                        }
                      >
                        {item.priority}
                      </Badge>
                      <Badge
                        className={
                          item.status === "Archived"
                            ? "bg-slate-100 text-slate-500"
                            : ""
                        }
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-sage">
                      {item.message}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-sage">
                      <span>
                        <Users size={13} className="mr-1 inline" />
                        {item.audience}
                      </span>
                      <span>{item.branch}</span>
                      <span>By {item.author}</span>
                      <span>
                        {item.publishAt
                          ? new Date(item.publishAt).toLocaleString()
                          : "Not scheduled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => setView(item)}
                      className="grid h-9 w-9 place-items-center rounded-xl border"
                      aria-label="View announcement"
                    >
                      <Eye size={16} />
                    </button>
                    {canManage && (
                      <button
                        onClick={() => {
                          setEditing(item);
                          setOpen(true);
                        }}
                        className="grid h-9 w-9 place-items-center rounded-xl border"
                        aria-label="Edit announcement"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    {canManage && item.status === "Draft" && (
                      <button
                        onClick={() => updateStatus(item.id, "Published")}
                        className="flex h-9 items-center gap-1 rounded-xl bg-forest px-3 text-xs font-semibold text-white"
                      >
                        <Send size={14} />
                        Publish
                      </button>
                    )}
                    {canManage && item.status !== "Archived" && (
                      <button
                        onClick={() => updateStatus(item.id, "Archived")}
                        className="h-9 rounded-xl border px-3 text-xs font-semibold"
                      >
                        Archive
                      </button>
                    )}
                    {canManage && item.status === "Archived" && (
                      <button
                        onClick={() => updateStatus(item.id, "Draft")}
                        className="h-9 rounded-xl border px-3 text-xs font-semibold"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!visible.length && (
            <div className="grid min-h-64 place-items-center text-center">
              <div>
                <Megaphone className="mx-auto text-sage" />
                <h3 className="mt-3 font-bold">No announcements found</h3>
                <p className="text-sm text-sage">
                  Create a new announcement or adjust the filters.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
      {canManage && (
        <AnnouncementDialog
          open={open}
          close={() => setOpen(false)}
          item={editing}
          save={(data) => {
            if (editing)
              persist(
                items.map((item) =>
                  item.id === editing.id ? { ...item, ...data } : item,
                ),
              );
            else
              persist([
                {
                  ...data,
                  id: createId("announcement"),
                  createdAt: new Date().toISOString(),
                },
                ...items,
              ]);
            setOpen(false);
          }}
        />
      )}
      {view && <AnnouncementDetails item={view} close={() => setView(null)} />}
    </main>
  );
}
function AnnouncementDialog({
  open,
  close,
  item,
  save,
}: {
  open: boolean;
  close: () => void;
  item: Announcement | null;
  save: (data: Omit<Announcement, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (open)
      setForm(
        item
          ? {
              title: item.title,
              message: item.message,
              audience: item.audience,
              branch: item.branch,
              priority: item.priority,
              status: item.status,
              publishAt: item.publishAt,
              expiresAt: item.expiresAt,
              author: item.author,
            }
          : { ...blank, publishAt: nowInput() },
      );
  }, [open, item]);
  const field = (key: keyof typeof blank, value: string) =>
    setForm({ ...form, [key]: value });
  return (
    <Dialog.Root open={open} onOpenChange={(value) => !value && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-2xl bg-white p-6">
          <Dialog.Title className="text-xl font-bold">
            {item ? "Edit announcement" : "New announcement"}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-sage">
            Compose the message and choose who should receive it.
          </Dialog.Description>
          <button onClick={close} className="absolute right-5 top-5">
            <X />
          </button>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input
              label="Title"
              value={form.title}
              set={(v) => field("title", v)}
              wide
            />
            <label className="text-sm font-semibold sm:col-span-2">
              Message
              <textarea
                rows={6}
                value={form.message}
                onChange={(e) => field("message", e.target.value)}
                className="mt-1.5 w-full rounded-xl border p-3 font-normal"
              />
            </label>
            <Select
              label="Audience"
              value={form.audience}
              set={(v) => field("audience", v)}
              values={[
                "All staff",
                "Nurses & caregivers",
                "Care managers",
                "Residents & families",
                "Branch managers",
                "Everyone",
              ]}
            />
            <Select
              label="Branch"
              value={form.branch}
              set={(v) => field("branch", v)}
              values={[
                "All branches",
                "Willow Grove Residence",
                "Sunrise Senior Living",
                "Coastal Haven",
              ]}
            />
            <Select
              label="Priority"
              value={form.priority}
              set={(v) => field("priority", v)}
              values={["Normal", "Important", "Urgent"]}
            />
            <Select
              label="Status"
              value={form.status}
              set={(v) => field("status", v)}
              values={["Draft", "Published", "Scheduled", "Archived"]}
            />
            <Input
              label="Publish date & time"
              type="datetime-local"
              value={form.publishAt}
              set={(v) => field("publishAt", v)}
            />
            <Input
              label="Expiry date & time"
              type="datetime-local"
              value={form.expiresAt}
              set={(v) => field("expiresAt", v)}
            />
            <Input
              label="Author"
              value={form.author}
              set={(v) => field("author", v)}
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={close} className="h-10 rounded-xl border px-4">
              Cancel
            </button>
            <Button
              disabled={!form.title || !form.message}
              onClick={() => save(form)}
            >
              {form.status === "Published"
                ? "Publish announcement"
                : "Save announcement"}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function AnnouncementDetails({
  item,
  close,
}: {
  item: Announcement;
  close: () => void;
}) {
  return (
    <Dialog.Root open onOpenChange={(value) => !value && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-auto bg-white p-7">
          <Dialog.Title className="pr-10 text-2xl font-bold">
            {item.title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 flex gap-2">
            <Badge>{item.priority}</Badge>
            <Badge>{item.status}</Badge>
          </Dialog.Description>
          <button onClick={close} className="absolute right-6 top-6">
            <X />
          </button>
          <div className="mt-8 whitespace-pre-wrap rounded-2xl bg-cream p-5 text-sm leading-7">
            {item.message}
          </div>
          <dl className="mt-7 grid grid-cols-2 gap-5">
            {[
              ["Audience", item.audience],
              ["Branch", item.branch],
              ["Author", item.author],
              [
                "Published",
                item.publishAt
                  ? new Date(item.publishAt).toLocaleString()
                  : "—",
              ],
              [
                "Expires",
                item.expiresAt
                  ? new Date(item.expiresAt).toLocaleString()
                  : "No expiry",
              ],
              ["Created", new Date(item.createdAt).toLocaleString()],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
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
  wide,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  type?: string;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm font-semibold ${wide ? "sm:col-span-2" : ""}`}>
      {label}
      <input
        type={type}
        value={value}
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
  values,
}: {
  label: string;
  value: string;
  set: (value: string) => void;
  values: string[];
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-xl border bg-white px-3 font-normal"
      >
        {values.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}
function Summary({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: number;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint text-forest">
        <Icon size={21} />
      </div>
      <div>
        <p className="text-sm text-sage">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
}
