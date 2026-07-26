"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Download,
  Eye,
  FileClock,
  Search,
  ShieldCheck,
  Terminal,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, Button } from "./ui";
import { currentAccount } from "@/lib/access";

type AuditLog = {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  category: string;
  resource: string;
  resourceId: string;
  description: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
  ipAddress: string;
  device: string;
  branch: string;
  changes?: Record<string, { from: string; to: string }>;
};
const seed: AuditLog[] = [
  {
    id: "AUD-10042",
    timestamp: "2026-07-24T16:58:24",
    actor: "Maya Perera",
    role: "Nurse",
    action: "UPDATE",
    category: "Resident",
    resource: "Resident profile",
    resourceId: "RES-001",
    description: "Updated resident allergy and clinical notes.",
    status: "SUCCESS",
    ipAddress: "192.168.1.42",
    device: "Chrome · Windows 11",
    branch: "Willow Grove Residence",
    changes: { allergies: { from: "Penicillin", to: "Penicillin, Latex" } },
  },
  {
    id: "AUD-10041",
    timestamp: "2026-07-24T16:42:10",
    actor: "System Administrator",
    role: "Super Admin",
    action: "CREATE",
    category: "Staff",
    resource: "Staff account",
    resourceId: "STF-024",
    description: "Created a new caregiver account.",
    status: "SUCCESS",
    ipAddress: "192.168.1.10",
    device: "Edge · Windows 11",
    branch: "All branches",
  },
  {
    id: "AUD-10040",
    timestamp: "2026-07-24T16:21:33",
    actor: "Unknown user",
    role: "—",
    action: "LOGIN",
    category: "Security",
    resource: "Authentication",
    resourceId: "—",
    description: "Login attempt rejected due to an incorrect password.",
    status: "FAILED",
    ipAddress: "103.21.44.18",
    device: "Chrome · Android",
    branch: "Willow Grove Residence",
  },
  {
    id: "AUD-10039",
    timestamp: "2026-07-24T15:54:08",
    actor: "Nimal Silva",
    role: "Care Manager",
    action: "PUBLISH",
    category: "Care plan",
    resource: "Care plan",
    resourceId: "CP-011",
    description: "Published the revised mobility care plan.",
    status: "SUCCESS",
    ipAddress: "192.168.1.63",
    device: "Chrome · macOS",
    branch: "Sunrise Senior Living",
  },
  {
    id: "AUD-10038",
    timestamp: "2026-07-24T15:31:47",
    actor: "Maya Perera",
    role: "Nurse",
    action: "ADMINISTER",
    category: "Medication",
    resource: "Medication administration",
    resourceId: "MED-184",
    description: "Recorded Metformin administration for Arthur Reed.",
    status: "SUCCESS",
    ipAddress: "192.168.1.42",
    device: "CareNest Mobile · Android",
    branch: "Willow Grove Residence",
  },
  {
    id: "AUD-10037",
    timestamp: "2026-07-24T14:48:02",
    actor: "System",
    role: "System",
    action: "STOCK_ALERT",
    category: "Medication",
    resource: "Medicine inventory",
    resourceId: "MED-091",
    description: "Stock quantity reached the configured reorder level.",
    status: "WARNING",
    ipAddress: "Internal",
    device: "CareNest scheduler",
    branch: "Willow Grove Residence",
  },
];
const csv = (value: unknown) =>
  `"${String(value ?? "").replaceAll('"', '""')}"`;

export function AuditLogsPage() {
  const [mounted, setMounted] = useState(false),
    [devMode, setDevMode] = useState(false),
    [logs, setLogs] = useState<AuditLog[]>([]),
    [search, setSearch] = useState(""),
    [category, setCategory] = useState("All"),
    [status, setStatus] = useState("All"),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [selected, setSelected] = useState<AuditLog | null>(null);
  useEffect(() => {
    const load = () => {
      const saved = localStorage.getItem("carenest_audit_logs");
      if (saved) setLogs(JSON.parse(saved));
      else {
        setLogs(seed);
        localStorage.setItem("carenest_audit_logs", JSON.stringify(seed));
      }
    };
    load();
    setMounted(true);
    window.addEventListener("carenest-audit-updated", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("carenest-audit-updated", load);
      window.removeEventListener("storage", load);
    };
  }, []);
  const categories = [
    "All",
    ...Array.from(new Set(logs.map((log) => log.category))),
  ];
  const visible = useMemo(
    () =>
      logs.filter((log) => {
        const text =
          `${log.id} ${log.actor} ${log.action} ${log.category} ${log.resource} ${log.description} ${log.ipAddress}`.toLowerCase();
        const day = log.timestamp.slice(0, 10);
        return (
          text.includes(search.toLowerCase()) &&
          (category === "All" || log.category === category) &&
          (status === "All" || log.status === status) &&
          (!from || day >= from) &&
          (!to || day <= to)
        );
      }),
    [logs, search, category, status, from, to],
  );
  const exportCsv = () => {
    const headers = [
      "Audit ID",
      "Timestamp",
      "Actor",
      "Role",
      "Action",
      "Category",
      "Resource",
      "Resource ID",
      "Description",
      "Status",
      "IP address",
      "Device",
      "Branch",
    ];
    const rows = visible.map((log) => [
      log.id,
      log.timestamp,
      log.actor,
      log.role,
      log.action,
      log.category,
      log.resource,
      log.resourceId,
      log.description,
      log.status,
      log.ipAddress,
      log.device,
      log.branch,
    ]);
    const blob = new Blob(
        [
          "\uFEFF",
          [headers, ...rows].map((row) => row.map(csv).join(",")).join("\r\n"),
        ],
        { type: "text/csv;charset=utf-8" },
      ),
      link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `carenest-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const superAdmin = currentAccount()?.role === "Super Admin";
  if (!mounted)
    return (
      <main className="min-h-screen bg-cream lg:ml-64">
        <div className="p-9">
          <div className="h-[620px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Security & compliance</p>
            <h1 className="mt-1 text-2xl font-bold">Audit logs</h1>
            <p className="mt-1 text-sm text-sage">
              Review system access, record changes and security events.
            </p>
          </div>
          <div className="flex gap-2">
            {superAdmin && (
              <button
                onClick={() => setDevMode(!devMode)}
                className={`focus-ring flex h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold ${devMode ? "border-emerald-500 bg-[#101512] text-emerald-400" : "bg-white"}`}
              >
                <Terminal size={17} />
                {devMode ? "Exit dev mode" : "Dev mode"}
              </button>
            )}
            <Button onClick={exportCsv}>
              <Download size={17} />
              Export logs
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1500px] p-5 md:p-9">
        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Summary icon={Activity} label="Events" value={visible.length} />
          <Summary
            icon={CheckCircle2}
            label="Successful"
            value={visible.filter((log) => log.status === "SUCCESS").length}
          />
          <Summary
            icon={AlertTriangle}
            label="Warnings"
            value={visible.filter((log) => log.status === "WARNING").length}
          />
          <Summary
            icon={ShieldCheck}
            label="Failed events"
            value={visible.filter((log) => log.status === "FAILED").length}
          />
        </section>
        {devMode ? (
          <TerminalLogs logs={logs} />
        ) : (
          <section className="card overflow-hidden">
            <div className="border-b p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <p className="eyebrow">System activity</p>
                  <h2 className="mt-1 text-lg font-bold">
                    Audit event register
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <label className="relative">
                    <Search
                      className="absolute left-3 top-3 text-sage"
                      size={17}
                    />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search actor, action or ID..."
                      className="h-11 w-64 rounded-xl border pl-10 pr-3 text-sm"
                    />
                  </label>
                  <Select
                    value={category}
                    set={setCategory}
                    values={categories}
                  />
                  <Select
                    value={status}
                    set={setStatus}
                    values={["All", "SUCCESS", "WARNING", "FAILED"]}
                  />
                  <input
                    aria-label="From date"
                    title="From date"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="h-11 rounded-xl border px-3 text-sm"
                  />
                  <input
                    aria-label="To date"
                    title="To date"
                    type="date"
                    value={to}
                    min={from}
                    onChange={(e) => setTo(e.target.value)}
                    className="h-11 rounded-xl border px-3 text-sm"
                  />
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-cream/60 text-[11px] uppercase tracking-wider text-sage">
                    <th className="px-5 py-3">Time</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">IP address</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((log) => (
                    <tr key={log.id} className="border-t hover:bg-mint/20">
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-sm font-semibold">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-sage">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-4">
                        <p className="text-sm font-semibold">{log.actor}</p>
                        <p className="text-xs text-sage">{log.role}</p>
                      </td>
                      <td className="px-4">
                        <Badge>{log.action}</Badge>
                        <p className="mt-1 text-xs text-sage">{log.category}</p>
                      </td>
                      <td className="max-w-xs px-4">
                        <p className="text-sm font-semibold">{log.resource}</p>
                        <p className="truncate text-xs text-sage">
                          {log.description}
                        </p>
                      </td>
                      <td className="px-4">
                        <Status value={log.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 text-sm">
                        {log.ipAddress}
                      </td>
                      <td className="px-4">
                        <button
                          onClick={() => setSelected(log)}
                          aria-label="View audit event"
                          className="grid h-9 w-9 place-items-center rounded-xl border"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!visible.length && (
              <div className="grid min-h-64 place-items-center text-center">
                <div>
                  <FileClock className="mx-auto text-sage" />
                  <h3 className="mt-3 font-bold">No audit events found</h3>
                  <p className="text-sm text-sage">
                    Adjust the search or filters to view more activity.
                  </p>
                </div>
              </div>
            )}
          </section>
        )}
        <p className="mt-4 flex items-center gap-2 text-xs text-sage">
          <ShieldCheck size={14} />
          Audit records are read-only and cannot be changed from this page.
        </p>
      </div>
      {selected && <Details log={selected} close={() => setSelected(null)} />}
    </main>
  );
}
function TerminalLogs({ logs }: { logs: AuditLog[] }) {
  const ordered = [...logs].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
  const [input, setInput] = useState(""),
    [filter, setFilter] = useState(""),
    [limit, setLimit] = useState<number | null>(null),
    [notice, setNotice] = useState("Type help to view available commands."),
    [cleared, setCleared] = useState(false),
    [history, setHistory] = useState<string[]>([]),
    [historyIndex, setHistoryIndex] = useState(-1);
  const searchable = (log: AuditLog) =>
    `${log.id} ${log.timestamp} ${log.actor} ${log.role} ${log.action} ${log.category} ${log.resource} ${log.resourceId} ${log.description} ${log.status} ${log.ipAddress} ${log.device} ${log.branch}`.toLowerCase();
  const liveTerm =
    input.trim() &&
    !/^(help|clear|list|all|reset|stats|export|tail|status|category|actor|ip|id)(\s|$)/i.test(
      input,
    )
      ? input.trim().toLowerCase()
      : "";
  let displayed = ordered.filter(
    (log) => !filter || searchable(log).includes(filter.toLowerCase()),
  );
  if (liveTerm)
    displayed = displayed.filter((log) => searchable(log).includes(liveTerm));
  if (limit !== null) displayed = displayed.slice(0, limit);
  const download = () => {
    const body = displayed
      .map(
        (log) =>
          `[${new Date(log.timestamp).toISOString()}] ${log.status} ${log.id} ${log.action} ${log.category}/${log.resourceId}\n  actor=${JSON.stringify(log.actor)} role=${JSON.stringify(log.role)} ip=${log.ipAddress} branch=${JSON.stringify(log.branch)}\n  message: ${log.description}${log.changes ? `\n  changes: ${JSON.stringify(log.changes)}` : ""}`,
      )
      .join("\n");
    const blob = new Blob([body], { type: "text/plain" }),
      link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "carenest-audit-terminal.log";
    link.click();
    URL.revokeObjectURL(link.href);
  };
  const run = (raw: string) => {
    const command = raw.trim();
    if (!command) return;
    setHistory((items) => [...items, command]);
    setHistoryIndex(-1);
    setCleared(false);
    const [name, ...args] = command.split(/\s+/),
      value = args.join(" ");
    switch (name.toLowerCase()) {
      case "help":
        setNotice(
          "COMMANDS: help | list | search <text> | status <success|warning|failed> | category <name> | actor <name> | ip <address> | id <audit-id> | tail <number> | stats | export | clear | reset",
        );
        break;
      case "clear":
        setCleared(true);
        setNotice("Terminal cleared.");
        break;
      case "list":
      case "all":
      case "reset":
        setFilter("");
        setLimit(null);
        setNotice(`Showing all ${logs.length} audit events.`);
        break;
      case "search":
        setFilter(value);
        setLimit(null);
        setNotice(
          value
            ? `Searching all fields for "${value}".`
            : "Usage: search <text>",
        );
        break;
      case "status":
        setFilter(value);
        setLimit(null);
        setNotice(
          value
            ? `Filtering by status "${value.toUpperCase()}".`
            : "Usage: status <success|warning|failed>",
        );
        break;
      case "category":
        setFilter(value);
        setLimit(null);
        setNotice(
          value ? `Filtering category "${value}".` : "Usage: category <name>",
        );
        break;
      case "actor":
        setFilter(value);
        setLimit(null);
        setNotice(
          value ? `Filtering actor "${value}".` : "Usage: actor <name>",
        );
        break;
      case "ip":
        setFilter(value);
        setLimit(null);
        setNotice(value ? `Filtering IP "${value}".` : "Usage: ip <address>");
        break;
      case "id":
        setFilter(value);
        setLimit(null);
        setNotice(
          value ? `Looking up audit ID "${value}".` : "Usage: id <audit-id>",
        );
        break;
      case "tail": {
        const amount = Number(args[0]);
        if (Number.isInteger(amount) && amount > 0) {
          setFilter("");
          setLimit(amount);
          setNotice(`Showing the ${amount} newest events.`);
        } else setNotice("Usage: tail <positive number>");
        break;
      }
      case "stats": {
        const success = logs.filter((log) => log.status === "SUCCESS").length,
          warning = logs.filter((log) => log.status === "WARNING").length,
          failed = logs.filter((log) => log.status === "FAILED").length;
        setNotice(
          `STATS total=${logs.length} success=${success} warning=${warning} failed=${failed}`,
        );
        break;
      }
      case "export":
        download();
        setNotice(
          `Exported ${displayed.length} visible events to carenest-audit-terminal.log.`,
        );
        break;
      default:
        setFilter(command);
        setLimit(null);
        setNotice(`Quick search for "${command}". Use help to see commands.`);
    }
    setInput("");
  };
  const recall = (direction: number) => {
    if (!history.length) return;
    const next = Math.max(
      -1,
      Math.min(history.length - 1, historyIndex + direction),
    );
    setHistoryIndex(next);
    setInput(next === -1 ? "" : history[history.length - 1 - next]);
  };
  return (
    <section className="overflow-hidden rounded-2xl border border-emerald-900/70 bg-[#090c0a] shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/10 bg-[#151a16] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex items-center gap-2 text-xs text-slate-400">
          <Terminal size={14} />
          carenest-audit — interactive console
        </div>
        <button
          onClick={() => run("help")}
          className="ml-auto rounded border border-emerald-900 px-2 py-1 font-mono text-[10px] text-emerald-400"
        >
          COMMANDS
        </button>
        <span className="font-mono text-[11px] text-emerald-500">
          {displayed.length}/{ordered.length} EVENTS
        </span>
      </div>
      <div className="h-[570px] overflow-auto p-5 font-mono text-xs leading-6">
        <p className="text-emerald-400">$ carenest audit --interactive</p>
        <p className="mb-3 text-slate-500">
          Connected to immutable audit store. Start typing to search instantly.
        </p>
        <p className="mb-4 border-l-2 border-cyan-700 pl-3 text-cyan-300">
          {notice}
        </p>
        {!cleared &&
          displayed.map((log) => (
            <div
              key={log.id}
              className="group border-l border-white/10 py-1 pl-3 hover:border-emerald-500 hover:bg-emerald-500/5"
            >
              <span className="text-slate-500">
                [{new Date(log.timestamp).toISOString()}]
              </span>{" "}
              <span
                className={
                  log.status === "SUCCESS"
                    ? "text-emerald-400"
                    : log.status === "FAILED"
                      ? "text-red-400"
                      : "text-amber-300"
                }
              >
                {log.status.padEnd(7)}
              </span>{" "}
              <span className="text-cyan-300">{log.id}</span>{" "}
              <span className="text-purple-300">{log.action}</span>{" "}
              <span className="text-slate-200">
                {log.category}/{log.resourceId}
              </span>
              <br />
              <span className="pl-3 text-slate-400">
                actor={JSON.stringify(log.actor)} role=
                {JSON.stringify(log.role)} ip={log.ipAddress} branch=
                {JSON.stringify(log.branch)}
              </span>
              <br />
              <span className="pl-3 text-slate-300">
                message: {log.description}
              </span>
              {log.changes && (
                <>
                  <br />
                  <span className="pl-3 text-amber-200">
                    changes: {JSON.stringify(log.changes)}
                  </span>
                </>
              )}
            </div>
          ))}
        {!cleared && !displayed.length && (
          <p className="py-8 text-amber-300">
            No audit events match the current search.
          </p>
        )}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          run(input);
        }}
        className="flex items-center border-t border-white/10 bg-[#101411] px-5 py-3 font-mono text-sm"
      >
        <span className="mr-2 text-emerald-400">carenest:audit$</span>
        <input
          autoFocus
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              recall(1);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              recall(-1);
            }
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label="Audit terminal command"
          placeholder="Type search text or a command..."
          className="min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-emerald-300 outline-none placeholder:text-slate-600"
        />
        <span className="ml-2 h-4 w-2 animate-pulse bg-emerald-400" />
      </form>
    </section>
  );
}
function Details({ log, close }: { log: AuditLog; close: () => void }) {
  return (
    <Dialog.Root open onOpenChange={(value) => !value && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/55" />
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-xl overflow-auto bg-white p-7">
          <Dialog.Title className="text-2xl font-bold">
            Audit event
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-sage">
            {log.id} · {new Date(log.timestamp).toLocaleString()}
          </Dialog.Description>
          <button onClick={close} className="absolute right-6 top-6">
            <X />
          </button>
          <div className="mt-7 flex items-center gap-3 rounded-2xl bg-cream p-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-forest">
              <UserRound size={20} />
            </div>
            <div>
              <p className="font-bold">{log.actor}</p>
              <p className="text-xs text-sage">
                {log.role} · {log.branch}
              </p>
            </div>
            <div className="ml-auto">
              <Status value={log.status} />
            </div>
          </div>
          <dl className="mt-7 grid grid-cols-2 gap-5">
            {[
              ["Action", log.action],
              ["Category", log.category],
              ["Resource", log.resource],
              ["Resource ID", log.resourceId],
              ["IP address", log.ipAddress],
              ["Device", log.device],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-1 text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 rounded-xl border p-4">
            <p className="eyebrow">Event description</p>
            <p className="mt-2 text-sm leading-6">{log.description}</p>
          </div>
          {log.changes && (
            <div className="mt-6">
              <p className="eyebrow">Recorded changes</p>
              <div className="mt-3 overflow-hidden rounded-xl border">
                {Object.entries(log.changes).map(([field, change]) => (
                  <div
                    key={field}
                    className="grid grid-cols-[100px_1fr_1fr] gap-3 border-b p-3 text-sm last:border-0"
                  >
                    <strong>{field}</strong>
                    <span className="text-coral">{change.from}</span>
                    <span className="text-forest">{change.to}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
function Select({
  value,
  set,
  values,
}: {
  value: string;
  set: (value: string) => void;
  values: string[];
}) {
  return (
    <select
      aria-label="Audit filter"
      value={value}
      onChange={(e) => set(e.target.value)}
      className="h-11 rounded-xl border bg-white px-3 text-sm font-semibold"
    >
      {values.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}
function Status({ value }: { value: AuditLog["status"] }) {
  return (
    <Badge
      className={
        value === "FAILED"
          ? "bg-[#fff0ec] text-coral"
          : value === "WARNING"
            ? "bg-[#fff3dc] text-[#946c1f]"
            : ""
      }
    >
      {value}
    </Badge>
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
