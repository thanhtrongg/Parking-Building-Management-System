import AppShell from "./layout/AppShell";

const navItems = [
  {
    icon: "space_dashboard",
    label: "Dashboard",
    path: "/user-dashboard",
  },
  {
    icon: "event_available",
    label: "Book Slot",
    path: "/user-bookings",
  },
  {
    icon: "history",
    label: "History",
    path: "/user-booking-history",
  },
  {
    icon: "confirmation_number",
    label: "Sessions",
    path: "/user-parking-sessions",
  },
  {
    icon: "forum",
    label: "Feedback",
    path: "/user-feedback",
  },
  {
    icon: "settings",
    label: "Settings",
    path: "/user-settings",
  },
];

function getUserDisplay(user) {
  const name =
    user?.fullName ||
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "Parking User";

  return {
    name,
    email: user?.email || "user@parkmaster.local",
    roleLabel: "User",
    initialsFallback: "PU",
  };
}

export default function UserLayout({ children }) {
  return (
    <AppShell
      brand={{ title: "ParkMaster", subtitle: "User Portal" }}
      contentClassName="app-page-stage mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"
      feedbackAudience="user"
      header={{
        title: "Parking User Portal",
        subtitle: "Manage reservations and account details",
        desktopInfo: true,
        textVisibilityClassName: "hidden min-w-0 sm:block",
      }}
      menuLabel="Parking"
      navItems={navItems}
      resolveUserDisplay={getUserDisplay}
      resolveVisibleNavItems={(items) => items}
    >
      {children}
    </AppShell>
  );
}
