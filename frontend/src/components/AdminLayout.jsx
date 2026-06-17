import AppShell from "./layout/AppShell";

const navItems = [
  {
    icon: "space_dashboard",
    label: "Dashboard",
    path: "/dashboard",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "grid_view",
    label: "Parking Zones",
    path: "/admin-zones",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: "local_parking",
    label: "Parking Slots",
    path: "/parking-slots",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "door_open",
    label: "Check-in",
    path: "/parking-sessions/create",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "confirmation_number",
    label: "Parking Sessions",
    path: "/parking-sessions",
    exact: true,
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "directions_car",
    label: "Vehicles",
    path: "/admin-vehicles",
    roles: ["ADMIN", "MANAGER"],
  },
  {
    icon: "event_available",
    label: "Reservations",
    path: "/reservations",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "qr_code_scanner",
    label: "QR Check-in",
    path: "/qr-check-in",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "payments",
    label: "Payments",
    path: "/payments",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "price_change",
    label: "Pricing Policies",
    path: "/pricing-policies",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "forum",
    label: "Feedbacks",
    path: "/feedbacks",
    roles: ["ADMIN", "MANAGER", "STAFF"],
  },
  {
    icon: "group",
    label: "Users",
    path: "/admin-users",
    roles: ["ADMIN"],
  },
];

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toUpperCase();
}

function getUserDisplay(user) {
  const name =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "System Admin";

  const email = user?.email || "admin@gmail.com";
  const role = normalizeRole(user?.role || "ADMIN");

  return {
    name,
    email,
    role,
    roleLabel: role,
    initialsFallback: "SA",
  };
}

function getVisibleNavItems(role) {
  const normalizedRole = normalizeRole(role);
  return navItems.filter((item) => item.roles.includes(normalizedRole));
}

export default function AdminLayout({ children }) {
  return (
    <AppShell
      brand={{ title: "ParkMaster", subtitle: "Management System" }}
      contentClassName="app-page-stage p-4 sm:p-6 lg:p-8"
      feedbackAudience="system"
      header={{
        title: "ParkMaster",
        subtitle: "Management",
        desktopInfo: false,
        textVisibilityClassName: "min-w-0",
      }}
      menuLabel="Main Menu"
      navItems={navItems}
      resolveUserDisplay={getUserDisplay}
      resolveVisibleNavItems={(items, profile) => getVisibleNavItems(profile.role)}
    >
      {children}
    </AppShell>
  );
}
