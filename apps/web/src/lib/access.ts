const careRoutes = [
  "/dashboard",
  "/residents",
  "/care-plans",
  "/medication",
  "/daily-health",
  "/schedule",
  "/announcements",
  "/messages",
  "/settings",
];
const hrRoutes = [...new Set([...careRoutes, "/staff", "/accounts"])];

export function routesForRole(role?: string) {
  if (role === "Super Admin" || role === "Admin") return null;
  if (role === "HR Manager") return hrRoutes;
  if (["Caregiver", "Care Manager", "Nurse", "Doctor"].includes(role ?? ""))
    return careRoutes;
  return role === "Guest" ? ["/settings"] : [];
}

export function canAccessRoute(role: string | undefined, path: string) {
  if (path === "/residents/new" && !canManageResidents(role)) return false;
  if (role === "Super Admin" || role === "Admin") return true;
  if (role === "Guest")
    return path.startsWith("/residents/") || path === "/settings";
  return (routesForRole(role) ?? []).some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

export function canManageResidents(role?: string) {
  return ["HR Manager", "Admin", "Super Admin"].includes(role ?? "");
}

export function canManageCareContent(role?: string) {
  return ["Admin", "Super Admin"].includes(role ?? "");
}

export function roleHome(role?: string, linkedResidentId?: string) {
  if (role === "Guest" && linkedResidentId)
    return `/residents/${linkedResidentId}`;
  if (role === "Super Admin" || role === "Admin") return "/dashboard";
  return "/dashboard";
}

export function currentAccount() {
  if (typeof window === "undefined") return undefined;
  try {
    const raw =
      localStorage.getItem("carenest_staff") ||
      sessionStorage.getItem("carenest_staff");
    return raw
      ? (JSON.parse(raw) as { role?: string; linkedResidentId?: string })
      : undefined;
  } catch {
    return undefined;
  }
}

export function canManageMedication(role?: string) {
  return ["Nurse", "Doctor", "HR Manager", "Admin", "Super Admin"].includes(
    role ?? "",
  );
}
