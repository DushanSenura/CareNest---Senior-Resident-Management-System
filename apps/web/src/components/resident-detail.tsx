"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileText,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  Pill,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { api, authHeaders, type ResidentDetail } from "@/lib/api";
import { canManageResidents, currentAccount } from "@/lib/access";
import { Badge, Skeleton } from "./ui";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
const statuses = [
  "ACTIVE",
  "HOSPITALIZED",
  "RESPITE",
  "DISCHARGED",
  "DECEASED",
] as const;
const tabs = [
  "Overview",
  "Admission",
  "Care & clinical",
  "Safety & incidents",
] as const;

export function ResidentDetailPage({ id }: { id: string }) {
  const canManage = canManageResidents(currentAccount()?.role);
  const [tab, setTab] = useState<(typeof tabs)[number]>("Overview");
  const queryClient = useQueryClient();
  const resident = useQuery({
    queryKey: ["resident", id],
    queryFn: () => api.resident(id),
  });
  const statusMutation = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`${API}/residents/${id}/status`, {
        method: "PATCH",
        headers: authHeaders(true),
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Status could not be updated");
      return response.json();
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["resident", id] }),
        queryClient.invalidateQueries({ queryKey: ["residents"] }),
        queryClient.invalidateQueries({ queryKey: ["summary"] }),
      ]);
    },
  });

  if (resident.isLoading)
    return (
      <main className="min-h-screen p-5 lg:ml-64 md:p-9">
        <Skeleton className="h-52" />
        <Skeleton className="mt-6 h-96" />
      </main>
    );
  if (resident.isError || !resident.data)
    return (
      <main className="grid min-h-screen place-items-center p-6 lg:ml-64">
        <div className="card max-w-md p-8 text-center">
          <AlertTriangle className="mx-auto text-coral" />
          <h1 className="mt-4 text-xl font-bold">
            Resident record unavailable
          </h1>
          <p className="mt-2 text-sm text-sage">
            The record may have been removed or the API is unavailable.
          </p>
          <Link
            href="/residents"
            className="mt-5 inline-flex text-sm font-semibold text-forest"
          >
            Return to residents
          </Link>
        </div>
      </main>
    );
  const data = resident.data;

  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto max-w-[1500px]">
          <Link
            href="/residents"
            className="mb-4 flex items-center gap-1 text-sm font-semibold text-forest"
          >
            <ArrowLeft size={16} />
            Back to residents
          </Link>
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint text-xl font-bold text-forest">
                {data.firstName[0]}
                {data.lastName[0]}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {data.preferredName || data.firstName} {data.lastName}
                  </h1>
                  <Priority priority={data.priority} />
                </div>
                <p className="mt-1 text-sm text-sage">
                  {data.firstName} {data.lastName} · Room {data.room} ·{" "}
                  {age(data.dateOfBirth)} years old
                </p>
                <p className="mt-1 text-xs font-semibold text-forest">
                  {(profile(data).admissionId as string) || "Admission record"}
                </p>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-sage">
                Resident status
              </label>
              <div className="mt-1 flex items-center gap-2">
                <select
                  value={data.status}
                  disabled={!canManage || statusMutation.isPending}
                  onChange={(event) =>
                    statusMutation.mutate(event.target.value)
                  }
                  className="focus-ring h-11 min-w-48 rounded-xl border bg-white px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
                {statusMutation.isPending && (
                  <span className="text-xs text-sage">Saving…</span>
                )}
                {statusMutation.isSuccess && (
                  <CheckCircle2 size={18} className="text-forest" />
                )}
              </div>
              {statusMutation.isError && (
                <p className="mt-1 text-xs text-coral">
                  {statusMutation.error.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] p-5 md:p-9">
        <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border bg-white p-1.5">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold ${tab === item ? "bg-forest text-white" : "text-sage hover:bg-mint hover:text-forest"}`}
            >
              {item}
            </button>
          ))}
        </div>
        {tab === "Overview" && <Overview resident={data} />}
        {tab === "Admission" && <Admission resident={data} />}
        {tab === "Care & clinical" && <Clinical resident={data} />}
        {tab === "Safety & incidents" && <Safety resident={data} />}
      </div>
    </main>
  );
}

function Overview({ resident }: { resident: ResidentDetail }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_.7fr]">
      <div className="space-y-6">
        <Card title="Personal details" icon={UserRound}>
          <InfoGrid
            items={[
              ["Legal name", `${resident.firstName} ${resident.lastName}`],
              ["Preferred name", resident.preferredName || "—"],
              ["Date of birth", formatDate(resident.dateOfBirth)],
              ["Age", `${age(resident.dateOfBirth)} years`],
              ["Room", resident.room],
              ["Admission date", formatDate(resident.admissionDate)],
            ]}
          />
        </Card>
        <Card title="Care snapshot" icon={HeartPulse}>
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric
              value={resident.medications.length}
              label="Active medications"
            />
            <Metric value={resident.carePlans.length} label="Care plans" />
            <Metric
              value={
                resident.tasks.filter((task) => task.status !== "COMPLETED")
                  .length
              }
              label="Open tasks"
            />
          </div>
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Emergency contact" icon={Phone}>
          <p className="font-semibold">{resident.emergencyName}</p>
          <a
            href={`tel:${resident.emergencyPhone}`}
            className="mt-2 flex items-center gap-2 text-sm text-forest"
          >
            <Phone size={15} />
            {resident.emergencyPhone}
          </a>
        </Card>
        <Card title="Alerts & care notes" icon={AlertTriangle}>
          <div>
            <p className="eyebrow">Allergies</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {resident.allergies.length ? (
                resident.allergies.map((item) => (
                  <Badge key={item} className="bg-[#fff0ec] text-coral">
                    {item}
                  </Badge>
                ))
              ) : (
                <span className="text-sm text-sage">No known allergies</span>
              )}
            </div>
          </div>
          <div className="mt-5">
            <p className="eyebrow">Dietary needs</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {resident.dietaryNeeds.length ? (
                resident.dietaryNeeds.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))
              ) : (
                <span className="text-sm text-sage">
                  No dietary requirements recorded
                </span>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Admission({ resident }: { resident: ResidentDetail }) {
  const admission = profile(resident);
  const excluded = new Set([
    "id",
    "residentId",
    "createdAt",
    "updatedAt",
    "personalInformation",
    "contacts",
    "guardianLegal",
    "medicalInformation",
    "allergies",
    "medicationInformation",
    "mobilityAssistance",
    "dailyLiving",
    "cognitiveMentalHealth",
    "communicationSensory",
    "nutritionDietary",
    "continenceToileting",
    "personalCare",
    "socialLifestyle",
    "behaviourSafety",
    "accommodation",
    "financialBilling",
    "admissionAssessment",
    "requiredServices",
    "documentsUploads",
  ]);
  const details = Object.entries(admission).filter(
    ([key, value]) => !excluded.has(key) && value != null,
  );
  const contacts = Array.isArray(admission.contacts)
    ? (admission.contacts as Record<string, string>[])
    : [];
  return (
    <div className="space-y-6">
      <Card title="Admission details" icon={ClipboardList}>
        <InfoGrid
          items={details.map(([key, value]) => [humanize(key), display(value)])}
        />
      </Card>
      <Card title="Family & emergency contacts" icon={Phone}>
        {contacts.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact, index) => (
              <div key={index} className="rounded-xl border p-4">
                <p className="font-semibold">
                  {contact.fullName || `Contact ${index + 1}`}
                </p>
                <p className="text-sm text-sage">
                  {contact.relationshipToResident}
                </p>
                <p className="mt-2 text-sm">{contact.phoneNumber}</p>
                <p className="text-sm">{contact.emailAddress}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No additional contacts recorded." />
        )}
      </Card>
    </div>
  );
}

function Clinical({ resident }: { resident: ResidentDetail }) {
  const admission = profile(resident);
  return (
    <div className="space-y-6">
      <Card title="Active medication" icon={Pill}>
        {resident.medications.length ? (
          <div className="divide-y">
            {resident.medications.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="font-semibold">{medication.name}</p>
                  <p className="text-sm text-sage">{medication.dosage}</p>
                </div>
                <Badge>Active</Badge>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No active medication." />
        )}
      </Card>
      <JsonSection
        title="Medical information"
        icon={Activity}
        value={admission.medicalInformation}
      />
      <JsonSection
        title="Mobility & assistance"
        icon={UserRound}
        value={admission.mobilityAssistance}
      />
      <JsonSection
        title="Admission assessment"
        icon={ClipboardList}
        value={admission.admissionAssessment}
      />
    </div>
  );
}

function Safety({ resident }: { resident: ResidentDetail }) {
  const admission = profile(resident);
  return (
    <div className="space-y-6">
      <JsonSection
        title="Behaviour & safety risks"
        icon={ShieldAlert}
        value={admission.behaviourSafety}
      />
      <Card title="Incident history" icon={AlertTriangle}>
        {resident.incidents.length ? (
          <div className="divide-y">
            {resident.incidents.map((incident) => (
              <div key={incident.id} className="py-4">
                <div className="flex justify-between">
                  <p className="font-semibold">{incident.type}</p>
                  <Badge className="bg-[#fff0ec] text-coral">
                    {incident.severity.toLowerCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-sage">
                  {formatDate(incident.occurredAt)}
                </p>
                <p className="mt-2 text-sm">{incident.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No incidents have been reported." />
        )}
      </Card>
      <Card title="Recent observations" icon={Activity}>
        {resident.observations.length ? (
          resident.observations.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b py-3 last:border-0"
            >
              <div>
                <p className="font-semibold">{item.type}</p>
                <p className="text-xs text-sage">
                  {formatDate(item.recordedAt)}
                </p>
              </div>
              <p className="font-bold">
                {item.value} {item.unit}
              </p>
            </div>
          ))
        ) : (
          <Empty text="No observations recorded." />
        )}
      </Card>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-mint text-forest">
          <Icon size={18} />
        </div>
        <h2 className="text-lg font-bold">{title}</h2>
      </div>
      {children}
    </section>
  );
}
function JsonSection({
  title,
  icon,
  value,
}: {
  title: string;
  icon: typeof UserRound;
  value: unknown;
}) {
  const items =
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.entries(value as Record<string, unknown>).filter(
          ([, v]) => v !== "" && v != null,
        )
      : [];
  return (
    <Card title={title} icon={icon}>
      {items.length ? (
        <InfoGrid
          items={items.map(([key, val]) => [humanize(key), display(val)])}
        />
      ) : (
        <Empty text={`No ${title.toLowerCase()} recorded.`} />
      )}
    </Card>
  );
}
function InfoGrid({ items }: { items: [string, string][] }) {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-bold uppercase tracking-wider text-sage">
            {label}
          </dt>
          <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-cream p-4">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-sage">{label}</p>
    </div>
  );
}
function Priority({ priority }: { priority: ResidentDetail["priority"] }) {
  const style =
    priority === "HIGH" || priority === "CRITICAL"
      ? "bg-[#fff0ec] text-coral"
      : "";
  return <Badge className={style}>{priority.toLowerCase()} care</Badge>;
}
function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-cream p-4 text-sm text-sage">{text}</p>;
}
function profile(resident: ResidentDetail) {
  return resident.admissionProfile ?? {};
}
function age(date: string) {
  const birth = new Date(date);
  const now = new Date();
  let result = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()))
    result--;
  return result;
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
    new Date(value),
  );
}
function statusLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase().replaceAll("_", " ");
}
function humanize(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase());
}
function display(value: unknown): string {
  if (Array.isArray(value)) return value.map(display).join(", ");
  if (typeof value === "object" && value)
    return Object.values(value).map(display).filter(Boolean).join(", ");
  return String(value ?? "");
}
