"use client";
import {
  Accessibility,
  Bell,
  Check,
  ChevronRight,
  Download,
  Eye,
  Globe2,
  KeyRound,
  Laptop,
  LockKeyhole,
  Monitor,
  Palette,
  Save,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./ui";
import { applyAppearance } from "@/lib/appearance";
const apiBase = () => {
  const configured =
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
  if (typeof window === "undefined") return configured;
  const url = new URL(configured);
  if (["localhost", "127.0.0.1"].includes(url.hostname))
    url.hostname = window.location.hostname;
  return url.toString().replace(/\/$/, "");
};
const token = () =>
  localStorage.getItem("carenest_access_token") ||
  sessionStorage.getItem("carenest_access_token");
async function authFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token()}`,
      ...init.headers,
    },
  });
  if (response.status === 401) {
    window.location.href = "/";
    throw new Error("Session expired");
  }
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || "Request failed");
  }
  return response;
}

const sections = [
  ["profile", "Profile information", UserRound],
  ["account", "Account settings", KeyRound],
  ["security", "Security", ShieldCheck],
  ["notifications", "Notifications", Bell],
  ["appearance", "Appearance", Palette],
  ["accessibility", "Accessibility", Accessibility],
  ["region", "Time & region", Globe2],
] as const;
const defaults = {
  theme: "system",
  accent: "green",
  fontSize: "medium",
  density: "comfortable",
  sidebar: "expanded",
  landing: "/dashboard",
  rememberPage: true,
  highContrast: false,
  largeText: false,
  dyslexiaFont: false,
  keyboardNavigation: true,
  screenReader: false,
  reducedMotion: false,
  colorBlind: false,
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24-hour",
  timeZone: "Asia/Colombo",
  numberFormat: "1,234.56",
  currency: "LKR",
  units: "metric",
  inAppAssignments: true,
  inAppMedication: true,
  inAppShift: true,
  inAppIncidents: true,
  inAppAppointments: true,
  inAppVisitors: true,
  inAppTasks: true,
  inAppReports: true,
  inAppAnnouncements: true,
  emailDaily: true,
  emailWeekly: false,
  emailMonthly: false,
  emailEmergency: true,
  emailShift: true,
  emailResident: true,
  smsEmergency: true,
  smsShift: false,
  smsSecurity: true,
  pushMedication: true,
  pushTasks: true,
  pushMessages: true,
  pushIncidents: true,
  pushEmergency: true,
  pushShift: true,
};
const appearanceDefaults = {
  showSummary: true,
  showResidents: true,
  showTasks: true,
  showShiftPulse: true,
  showAlerts: true,
};
type Preferences = typeof defaults & typeof appearanceDefaults;
type Staff = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
  status?: string;
  profilePhotoUrl?: string;
};

export function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState("profile");
  const [prefs, setPrefs] = useState<Preferences>({
    ...defaults,
    ...appearanceDefaults,
  });
  const [staff, setStaff] = useState<Staff>({});
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    const storage =
      localStorage.getItem("carenest_staff") ||
      sessionStorage.getItem("carenest_staff");
    if (storage) setStaff(JSON.parse(storage));
    const p = localStorage.getItem("carenest_preferences");
    if (p) setPrefs({ ...defaults, ...appearanceDefaults, ...JSON.parse(p) });
    if (token())
      authFetch("/settings")
        .then((r) => r.json())
        .then((data) => {
          setStaff(data);
          if (data.preferences?.settings)
            setPrefs({
              ...defaults,
              ...appearanceDefaults,
              ...data.preferences.settings,
            });
        })
        .catch(() => {});
  }, []);
  useEffect(() => {
    applyAppearance(prefs);
  }, [prefs]);
  const save = async () => {
    try {
      await Promise.all([
        authFetch("/settings/profile", {
          method: "PATCH",
          body: JSON.stringify(staff),
        }),
        authFetch("/settings/preferences", {
          method: "PATCH",
          body: JSON.stringify({ settings: prefs }),
        }),
      ]);
      localStorage.setItem("carenest_preferences", JSON.stringify(prefs));
      window.dispatchEvent(new Event("carenest-preferences"));
      const store = localStorage.getItem("carenest_staff")
        ? localStorage
        : sessionStorage;
      store.setItem("carenest_staff", JSON.stringify(staff));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Save failed");
    }
  };
  if (!mounted)
    return (
      <main className="min-h-screen bg-cream lg:ml-64">
        <div className="mx-auto max-w-[1500px] space-y-6 p-5 md:p-9">
          <div className="h-24 animate-pulse rounded-2xl bg-white" />
          <div className="h-[520px] animate-pulse rounded-2xl bg-white" />
        </div>
      </main>
    );
  return (
    <main className="min-h-screen lg:ml-64">
      <header className="border-b bg-white px-5 py-5 md:px-9">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between">
          <div>
            <p className="eyebrow">Personal workspace</p>
            <h1 className="mt-1 text-2xl font-bold">Settings</h1>
            <p className="mt-1 text-sm text-sage">
              Manage your profile, security, notifications and experience.
            </p>
          </div>
          <Button onClick={save}>
            {saved ? <Check size={17} /> : <Save size={17} />}{" "}
            {saved ? "Saved" : "Save changes"}
          </Button>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] gap-6 p-5 md:p-9 xl:grid-cols-[270px_1fr]">
        <aside className="card h-fit p-3">
          {sections.map(([key, label, Icon]) => (
            <button
              key={key}
              onClick={() => setActive(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active === key ? "bg-forest text-white" : "text-sage hover:bg-mint hover:text-forest"}`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              <ChevronRight size={15} />
            </button>
          ))}
        </aside>
        <div>
          {active === "profile" && <Profile staff={staff} set={setStaff} />}{" "}
          {active === "account" && <Account staff={staff} />}{" "}
          {active === "security" && <Security staff={staff} />}{" "}
          {active === "notifications" && (
            <Notifications p={prefs} set={setPrefs} />
          )}{" "}
          {active === "appearance" && <Appearance p={prefs} set={setPrefs} />}{" "}
          {active === "accessibility" && <Access p={prefs} set={setPrefs} />}{" "}
          {active === "region" && <Region p={prefs} set={setPrefs} />}
        </div>
      </div>
    </main>
  );
}
function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card overflow-hidden">
      <div className="border-b p-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1 text-sm text-sage">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}
function Profile({ staff, set }: { staff: Staff; set: (s: Staff) => void }) {
  const file = useRef<HTMLInputElement>(null),
    [busy, setBusy] = useState(false),
    [photoError, setPhotoError] = useState("");
  const u = (k: keyof Staff, v: string) => set({ ...staff, [k]: v });
  const persistPhoto = async (profilePhotoUrl: string | null) => {
    setBusy(true);
    setPhotoError("");
    try {
      await authFetch("/settings/profile", {
        method: "PATCH",
        body: JSON.stringify({ profilePhotoUrl }),
      });
      const next = { ...staff, profilePhotoUrl: profilePhotoUrl || undefined };
      set(next);
      const store = localStorage.getItem("carenest_staff")
        ? localStorage
        : sessionStorage;
      store.setItem("carenest_staff", JSON.stringify(next));
      window.dispatchEvent(
        new CustomEvent("carenest-profile-updated", { detail: next }),
      );
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : "Photo could not be saved",
      );
    } finally {
      setBusy(false);
    }
  };
  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setPhotoError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type))
      return setPhotoError("Choose a PNG, JPG or WebP image.");
    if (selected.size > 5 * 1024 * 1024)
      return setPhotoError("Profile photo must be 5 MB or smaller.");
    try {
      await persistPhoto(await compressProfilePhoto(selected));
    } catch {
      setPhotoError("The selected image could not be processed.");
    }
  };
  return (
    <div className="space-y-6">
      <Panel
        title="Profile information"
        description="Your personal and workplace information."
      >
        <div className="mb-6 flex items-center gap-5">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-mint text-2xl font-bold text-forest">
            {staff.profilePhotoUrl ? (
              <img
                src={staff.profilePhotoUrl}
                alt={`${staff.firstName || "User"} profile`}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                {staff.firstName?.[0] || "U"}
                {staff.lastName?.[0] || ""}
              </>
            )}
          </div>
          <div>
            <input
              ref={file}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={upload}
              className="hidden"
            />
            <Button
              type="button"
              disabled={busy}
              onClick={() => file.current?.click()}
            >
              {busy
                ? "Uploading…"
                : staff.profilePhotoUrl
                  ? "Change profile photo"
                  : "Upload profile photo"}
            </Button>
            {staff.profilePhotoUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={() => persistPhoto(null)}
                className="ml-3 text-sm font-semibold text-coral"
              >
                Remove photo
              </button>
            )}
            <p className="mt-2 text-xs text-sage">
              PNG, JPG or WebP, maximum 5 MB.
            </p>
            {photoError && (
              <p className="mt-2 text-xs font-semibold text-coral">
                {photoError}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input
            label="First name"
            value={staff.firstName}
            set={(v) => u("firstName", v)}
          />
          <Input
            label="Last name"
            value={staff.lastName}
            set={(v) => u("lastName", v)}
          />
          <Input label="Preferred name" />
          <Input label="Employee ID" value={staff.employeeId} readOnly />
          <Input label="Resident ID (if applicable)" />
          <Input label="User role" value={staff.role} readOnly />
          <Input
            label="Department"
            value={staff.department}
            set={(v) => u("department", v)}
          />
          <Input label="Branch" />
          <Input label="Job title" value={staff.role} />
          <Input
            label="Email address"
            type="email"
            value={staff.email}
            set={(v) => u("email", v)}
          />
          <Input
            label="Mobile number"
            value={staff.phone}
            set={(v) => u("phone", v)}
          />
          <Input label="Work phone" />
          <Input label="Date of birth" type="date" />
          <Select
            label="Gender"
            options={[
              "Prefer not to say",
              "Female",
              "Male",
              "Non-binary",
              "Other",
            ]}
          />
          <Select
            label="Preferred language"
            options={["English", "Sinhala", "Tamil"]}
          />
          <Select
            label="Time zone"
            options={["Asia/Colombo", "UTC", "Asia/Kolkata"]}
          />
          <Input
            label="Home address"
            value={staff.address}
            set={(v) => u("address", v)}
            wide
          />
          <Input
            label="Emergency contact"
            value={staff.emergencyContact}
            set={(v) => u("emergencyContact", v)}
            wide
          />
          <Text label="Biography / About me" />
        </div>
        <div className="mt-5 flex gap-3">
          <button className="text-sm font-semibold text-forest">
            Verify email
          </button>
          <button className="text-sm font-semibold text-forest">
            Verify phone number
          </button>
        </div>
      </Panel>
    </div>
  );
}
function compressProfilePhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const image = new Image();
      image.onerror = reject;
      image.onload = () => {
        const size = Math.min(image.width, image.height),
          canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 320;
        const context = canvas.getContext("2d");
        if (!context) return reject(new Error("Canvas unavailable"));
        context.drawImage(
          image,
          (image.width - size) / 2,
          (image.height - size) / 2,
          size,
          size,
          0,
          0,
          320,
          320,
        );
        let result = canvas.toDataURL("image/jpeg", 0.82);
        if (result.length > 85000) {
          canvas.width = 256;
          canvas.height = 256;
          context.drawImage(
            image,
            (image.width - size) / 2,
            (image.height - size) / 2,
            size,
            size,
            0,
            0,
            256,
            256,
          );
          result = canvas.toDataURL("image/jpeg", 0.7);
        }
        resolve(result);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
function Account({ staff }: { staff: Staff }) {
  const download = async () => {
    const data = await (await authFetch("/settings/export")).json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "carenest-account-export.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  return (
    <div className="space-y-6">
      <Panel
        title="Account settings"
        description="Login identity and account ownership."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="Username" value={staff.email?.split("@")[0]} />
          <Input
            label="Display name"
            value={`${staff.firstName || ""} ${staff.lastName || ""}`}
          />
          <Input label="Preferred login email" value={staff.email} />
          <Input label="Account status" value="Verified" readOnly />
          <Input label="Last login" value="Current session" readOnly />
          <Input
            label="Last password change"
            value="Available in security"
            readOnly
          />
          <Input
            label="Account created date"
            value={
              staff.createdAt
                ? new Date(staff.createdAt).toLocaleDateString()
                : "—"
            }
            readOnly
          />
          <Input
            label="Employee status"
            value={staff.status || "ACTIVE"}
            readOnly
          />
          <Input
            label="Linked organizations"
            value="Willow Grove Residence"
            readOnly
          />
        </div>
      </Panel>
      <Panel
        title="Account data"
        description="Export or manage your personal account data."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Action
            onClick={download}
            icon={Download}
            title="Download personal data"
            text="Download a portable copy of your information."
          />
          <Action
            onClick={download}
            icon={Download}
            title="Export account information"
            text="Export profile and preference settings."
          />
          <Action
            onClick={() =>
              alert(
                "Your deletion request has been recorded for administrator review.",
              )
            }
            icon={Trash2}
            danger
            title="Request account deletion"
            text="Send a deletion request to an administrator."
          />
          <Action
            icon={KeyRound}
            title="Update username or email"
            text="Edit these values under Profile Information."
          />
        </div>
      </Panel>
    </div>
  );
}
function Security({ staff }: { staff: Staff }) {
  const [show, setShow] = useState(false);
  const [mfa, setMfa] = useState(false);
  const [current, setCurrent] = useState(""),
    [next, setNext] = useState(""),
    [confirm, setConfirm] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    authFetch("/settings/sessions")
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => {});
  }, []);
  const change = async () => {
    if (next !== confirm) return alert("New passwords do not match");
    try {
      await authFetch("/settings/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      setCurrent("");
      setNext("");
      setConfirm("");
      alert("Password changed successfully");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Password change failed");
    }
  };
  const revoke = async (id: string) => {
    await authFetch(`/settings/sessions/${id}`, { method: "DELETE" });
    setSessions((s) => s.filter((x) => x.id !== id));
  };
  const revokeAll = async () => {
    await authFetch("/settings/sessions", { method: "DELETE" });
    setSessions((s) => s.slice(0, 1));
  };
  return (
    <div className="space-y-6">
      <Panel title="Password" description="Keep your login credentials secure.">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Current password"
            value={current}
            set={setCurrent}
            type={show ? "text" : "password"}
          />
          <Input
            label="New password"
            value={next}
            set={setNext}
            type={show ? "text" : "password"}
          />
          <Input
            label="Confirm new password"
            value={confirm}
            set={setConfirm}
            type={show ? "text" : "password"}
          />
          <div className="rounded-xl bg-mint p-4">
            <p className="text-sm font-semibold">Password strength</p>
            <div className="mt-2 h-2 rounded-full bg-sage/20">
              <div
                className="h-2 rounded-full bg-forest"
                style={{ width: `${Math.min(100, next.length * 10)}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-sage">
              {next.length >= 12
                ? "Strong"
                : next.length >= 8
                  ? "Good"
                  : "Use at least 8 characters"}
            </p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={change}>
            <LockKeyhole size={17} />
            Change password
          </Button>
          <button
            onClick={() => setShow(!show)}
            className="text-sm font-semibold text-forest"
          >
            <Eye size={16} className="inline" /> Show passwords
          </button>
        </div>
      </Panel>
      <Panel
        title="Multi-factor authentication"
        description="Add another verification method to your account."
      >
        <Toggle
          label="Enable MFA"
          description="Require an authenticator code when signing in."
          value={mfa}
          set={setMfa}
        />
        {mfa && (
          <div className="mt-4 rounded-xl bg-[#fff3dc] p-4 text-sm text-[#946c1f]">
            MFA enrollment requires an authenticator provider configuration.
            Your preference is saved, but enforcement remains disabled until a
            provider is configured.
          </div>
        )}
      </Panel>
      <Panel
        title="Login sessions"
        description="Devices currently signed in to your account."
      >
        {sessions.map((s, i) => (
          <Session
            key={s.id}
            icon={i === 0 ? Laptop : Smartphone}
            name={`${s.deviceName}${i === 0 ? " · Current session" : ""}`}
            detail={`${s.operatingSystem || "Unknown OS"} · ${new Date(s.lastActivity).toLocaleString()}`}
            onRemove={() => revoke(s.id)}
          />
        ))}
        <div className="mt-4">
          <button
            onClick={revokeAll}
            className="text-sm font-semibold text-coral"
          >
            Sign out all other devices
          </button>
        </div>
      </Panel>
      <Panel
        title="Login history"
        description="Recent successful login activity."
      >
        {sessions.map((s) => (
          <Session
            key={s.id}
            icon={Check}
            name="Successful login"
            detail={`${s.deviceName} · ${new Date(s.loginAt).toLocaleString()}`}
          />
        ))}
      </Panel>
    </div>
  );
}
function Notifications({
  p,
  set,
}: {
  p: Preferences;
  set: (p: Preferences) => void;
}) {
  return (
    <div className="space-y-6">
      <TogglePanel
        title="In-app notifications"
        keys={[
          ["inAppAssignments", "New assignments"],
          ["inAppMedication", "Medication reminders"],
          ["inAppShift", "Shift reminders"],
          ["inAppIncidents", "Incident alerts"],
          ["inAppAppointments", "Appointment reminders"],
          ["inAppVisitors", "Visitor notifications"],
          ["inAppTasks", "Task reminders"],
          ["inAppReports", "Reports"],
          ["inAppAnnouncements", "System announcements"],
        ]}
        p={p}
        set={set}
      />
      <TogglePanel
        title="Email notifications"
        keys={[
          ["emailDaily", "Daily summary"],
          ["emailWeekly", "Weekly summary"],
          ["emailMonthly", "Monthly summary"],
          ["emailEmergency", "Emergency alerts"],
          ["emailShift", "Shift changes"],
          ["emailResident", "Resident updates"],
        ]}
        p={p}
        set={set}
      />
      <TogglePanel
        title="SMS notifications"
        keys={[
          ["smsEmergency", "Emergency alerts"],
          ["smsShift", "Shift reminders"],
          ["smsSecurity", "Security alerts"],
        ]}
        p={p}
        set={set}
      />
      <TogglePanel
        title="Push notifications"
        keys={[
          ["pushMedication", "Medication due"],
          ["pushTasks", "Care task due"],
          ["pushMessages", "New messages"],
          ["pushIncidents", "Incident alerts"],
          ["pushEmergency", "Emergency alerts"],
          ["pushShift", "Shift reminders"],
        ]}
        p={p}
        set={set}
      />
    </div>
  );
}
function Appearance({
  p,
  set,
}: {
  p: Preferences;
  set: (p: Preferences) => void;
}) {
  return (
    <div className="space-y-6">
      <Panel
        title="Appearance settings"
        description="Personalize how CareNest looks and feels."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Choice
            label="Theme"
            value={p.theme}
            options={["light", "dark", "system"]}
            set={(v) => set({ ...p, theme: v })}
          />
          <Choice
            label="Accent color"
            value={p.accent}
            options={["blue", "green", "purple", "orange"]}
            set={(v) => set({ ...p, accent: v })}
          />
          <Choice
            label="Font size"
            value={p.fontSize}
            options={["small", "medium", "large", "extra large"]}
            set={(v) => set({ ...p, fontSize: v })}
          />
          <Choice
            label="Density"
            value={p.density}
            options={["comfortable", "compact", "spacious"]}
            set={(v) => set({ ...p, density: v })}
          />
          <Choice
            label="Sidebar"
            value={p.sidebar}
            options={["expanded", "collapsed"]}
            set={(v) => set({ ...p, sidebar: v })}
          />
          <Choice
            label="Default landing page"
            value={p.landing}
            options={[
              "/dashboard",
              "/residents",
              "/tasks-shifts",
              "/daily-health",
            ]}
            set={(v) => set({ ...p, landing: v })}
          />
        </div>
        <div className="mt-6">
          <Toggle
            label="Remember last opened page"
            description="Return to your last workspace after login."
            value={p.rememberPage}
            set={(v) => set({ ...p, rememberPage: v })}
          />
        </div>
      </Panel>
      <Panel
        title="Dashboard widgets"
        description="Choose which information appears on your dashboard."
      >
        <Toggle
          label="Summary cards"
          value={p.showSummary}
          set={(v) => set({ ...p, showSummary: v })}
        />
        <Toggle
          label="Resident overview"
          value={p.showResidents}
          set={(v) => set({ ...p, showResidents: v })}
        />
        <Toggle
          label="Upcoming tasks"
          value={p.showTasks}
          set={(v) => set({ ...p, showTasks: v })}
        />
        <Toggle
          label="Shift progress"
          value={p.showShiftPulse}
          set={(v) => set({ ...p, showShiftPulse: v })}
        />
        <Toggle
          label="Alerts"
          value={p.showAlerts}
          set={(v) => set({ ...p, showAlerts: v })}
        />
      </Panel>
    </div>
  );
}
function Access({ p, set }: { p: Preferences; set: (p: Preferences) => void }) {
  const items: [keyof Preferences, string, string][] = [
    [
      "highContrast",
      "High contrast mode",
      "Increase contrast between interface elements.",
    ],
    ["largeText", "Large text", "Increase text size throughout CareNest."],
    [
      "dyslexiaFont",
      "Dyslexia-friendly font",
      "Use a font designed for easier reading.",
    ],
    [
      "keyboardNavigation",
      "Keyboard navigation",
      "Improve focus indicators and shortcuts.",
    ],
    [
      "screenReader",
      "Screen reader optimization",
      "Add enhanced descriptive labels.",
    ],
    ["reducedMotion", "Reduced animations", "Reduce non-essential movement."],
    [
      "colorBlind",
      "Color-blind friendly palette",
      "Avoid relying on color alone.",
    ],
  ];
  return (
    <Panel
      title="Accessibility settings"
      description="Adjust CareNest to support your individual needs."
    >
      <div className="divide-y">
        {items.map(([k, l, d]) => (
          <Toggle
            key={k}
            label={l}
            description={d}
            value={p[k] as boolean}
            set={(v) => set({ ...p, [k]: v })}
          />
        ))}
      </div>
      <div className="mt-5 rounded-xl bg-cream p-4 text-sm text-sage">
        Voice assistance is planned for a future release.
      </div>
    </Panel>
  );
}
function Region({ p, set }: { p: Preferences; set: (p: Preferences) => void }) {
  return (
    <Panel
      title="Time & region"
      description="Select your time region and preferred display formats."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <ControlledSelect
          label="Time region"
          value={p.timeZone}
          options={[
            "Asia/Colombo",
            "Asia/Kolkata",
            "Asia/Dubai",
            "Asia/Singapore",
            "Asia/Tokyo",
            "Europe/London",
            "Europe/Paris",
            "America/New_York",
            "America/Chicago",
            "America/Denver",
            "America/Los_Angeles",
            "Australia/Sydney",
            "Pacific/Auckland",
            "UTC",
          ]}
          set={(v) => set({ ...p, timeZone: v })}
        />
        <Choice
          label="Date format"
          value={p.dateFormat}
          options={["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]}
          set={(v) => set({ ...p, dateFormat: v })}
        />
        <Choice
          label="Time format"
          value={p.timeFormat}
          options={["12-hour", "24-hour"]}
          set={(v) => set({ ...p, timeFormat: v })}
        />
        <Choice
          label="Number format"
          value={p.numberFormat}
          options={["1,234.56", "1.234,56"]}
          set={(v) => set({ ...p, numberFormat: v })}
        />
        <Choice
          label="Currency display"
          value={p.currency}
          options={["LKR", "USD", "EUR", "GBP"]}
          set={(v) => set({ ...p, currency: v })}
        />
        <Choice
          label="Measurement units"
          value={p.units}
          options={["metric", "imperial"]}
          set={(v) => set({ ...p, units: v })}
        />
      </div>
    </Panel>
  );
}
function TogglePanel({
  title,
  keys,
  p,
  set,
}: {
  title: string;
  keys: string[][];
  p: Preferences;
  set: (p: Preferences) => void;
}) {
  return (
    <Panel
      title={title}
      description={`Choose which ${title.toLowerCase()} you receive.`}
    >
      <div className="divide-y">
        {keys.map(([k, l]) => (
          <Toggle
            key={k}
            label={l}
            value={p[k as keyof Preferences] as boolean}
            set={(v) => set({ ...p, [k]: v })}
          />
        ))}
      </div>
    </Panel>
  );
}
function Toggle({
  label,
  description,
  value,
  set,
}: {
  label: string;
  description?: string;
  value: boolean;
  set: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {description && <p className="text-xs text-sage">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => set(!value)}
        className={`relative h-6 w-11 rounded-full ${value ? "bg-forest" : "bg-slate-300"}`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${value ? "left-6" : "left-1"}`}
        />
      </button>
    </div>
  );
}
function Input({
  label,
  value,
  set,
  type = "text",
  readOnly,
  wide,
}: {
  label: string;
  value?: string;
  set?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
  wide?: boolean;
}) {
  return (
    <label className={`text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}>
      {label}
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => set?.(e.target.value)}
        readOnly={readOnly}
        className={`focus-ring mt-1.5 h-11 w-full rounded-xl border px-3 font-normal ${readOnly ? "bg-cream text-sage" : ""}`}
      />
    </label>
  );
}
function Select({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select className="focus-ring mt-1.5 h-11 w-full rounded-xl border bg-white px-3">
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </label>
  );
}
function ControlledSelect({
  label,
  value,
  options,
  set,
}: {
  label: string;
  value: string;
  options: string[];
  set: (value: string) => void;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <select
        value={value}
        onChange={(event) => set(event.target.value)}
        className="focus-ring mt-1.5 h-11 w-full rounded-xl border bg-white px-3 font-normal"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}
function Text({ label }: { label: string }) {
  return (
    <label className="text-sm font-semibold md:col-span-2 xl:col-span-3">
      {label}
      <textarea
        rows={4}
        className="focus-ring mt-1.5 w-full rounded-xl border p-3"
      />
    </label>
  );
}
function Choice({
  label,
  value,
  options,
  set,
}: {
  label: string;
  value: string;
  options: string[];
  set: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((x) => (
          <button
            key={x}
            onClick={() => set(x)}
            className={`rounded-xl border px-3 py-2 text-sm capitalize ${value === x ? "border-forest bg-forest text-white" : "bg-white text-ink hover:bg-mint"}`}
          >
            {x}
          </button>
        ))}
      </div>
    </div>
  );
}
function Action({
  icon: Icon,
  title,
  text,
  danger,
  onClick,
}: {
  icon: any;
  title: string;
  text: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-start gap-3 rounded-xl border p-4 text-left hover:bg-cream ${danger ? "text-coral" : ""}`}
    >
      <Icon size={19} />
      <span>
        <strong className="block text-sm">{title}</strong>
        <span className="text-xs text-sage">{text}</span>
      </span>
    </button>
  );
}
function Session({
  icon: Icon,
  name,
  detail,
  onRemove,
}: {
  icon: any;
  name: string;
  detail: string;
  onRemove?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 border-b py-4 last:border-0">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint text-forest">
        <Icon size={18} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-sage">{detail}</p>
      </div>
      {onRemove && (
        <button onClick={onRemove} className="text-xs font-semibold text-coral">
          Remove
        </button>
      )}
    </div>
  );
}
