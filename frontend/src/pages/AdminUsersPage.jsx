import AdminLayout from "../components/AdminLayout";

const stats = [
  {
    label: "Total Users",
    value: "2,842",
    icon: "group",
    iconClass: "bg-[#dbe1ff] text-[#004ac6]",
    meta: "12%",
    metaIcon: "trending_up",
    metaClass: "text-green-600",
  },
  {
    label: "Active Now",
    value: "412",
    icon: "bolt",
    iconClass: "bg-green-50 text-green-600",
    meta: "Live",
    metaClass: "text-green-600",
  },
  {
    label: "New This Week",
    value: "156",
    icon: "person_add",
    iconClass: "bg-[#ffdbcd] text-[#943700]",
    meta: "+84",
    metaClass: "text-[#004ac6]",
  },
  {
    label: "Admin Accounts",
    value: "12",
    icon: "admin_panel_settings",
    iconClass: "bg-[#e7e7f3] text-[#131b2e]",
    meta: "Security",
    metaClass: "text-[#737686]",
  },
];

const users = [
  {
    name: "Jordan Smith",
    id: "PM-29102",
    email: "jordan.smith@parkmaster.com",
    role: "Admin",
    roleClass: "bg-[#dbe1ff] text-[#004ac6]",
    status: "Active",
    lastLogin: "2 mins ago",
    avatarClass: "from-slate-950 to-cyan-800",
    avatarIcon: "badge",
  },
  {
    name: "Sarah Chen",
    id: "PM-88210",
    email: "s.chen@residence-a.com",
    role: "Resident",
    roleClass: "bg-[#dae2fd] text-[#5c647a]",
    status: "Active",
    lastLogin: "Yesterday, 4:12 PM",
    avatarClass: "from-blue-50 to-slate-200",
    avatarIcon: "apartment",
  },
  {
    name: "Marcus Thorne",
    id: "PM-44301",
    email: "m.thorne@parkmaster.com",
    role: "Manager",
    roleClass: "bg-[#e7e7f3] text-[#131b2e]",
    status: "Suspended",
    lastLogin: "Oct 12, 2023",
    avatarClass: "from-cyan-100 to-slate-300",
    avatarIcon: "engineering",
  },
  {
    name: "Elena Rodriguez",
    id: "PM-11029",
    email: "e.rodriguez@parkmaster.com",
    role: "Staff",
    roleClass: "bg-[#ffdbcd] text-[#7d2d00]",
    status: "Active",
    lastLogin: "3 hours ago",
    avatarClass: "from-slate-800 to-slate-400",
    avatarIcon: "desktop_windows",
  },
];

const activities = [
  {
    icon: "person_add",
    iconClass: "bg-[#dbe1ff] text-[#004ac6]",
    title: "New user registered:",
    detail: "David Maxwell (Resident)",
    time: "Today, 10:24 AM",
  },
  {
    icon: "security",
    iconClass: "bg-[#e7e7f3] text-[#131b2e]",
    title: "Role updated:",
    detail: "Sarah Chen promoted to Property Manager",
    time: "Today, 09:15 AM",
  },
  {
    icon: "lock_reset",
    iconClass: "bg-red-50 text-[#ba1a1a]",
    title: "System Alert:",
    detail: "Password reset initiated for Admin 'Alex Rivera'",
    time: "Yesterday, 11:45 PM",
  },
];

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
          User Management
        </h2>
        <p className="font-['Inter'] text-sm text-[#434655]">
          Manage system users, roles, and access permissions.
        </p>
      </div>
      <button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[#004ac6] px-5 font-['Geist'] text-[13px] font-semibold text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#2563eb] active:scale-95">
        <span className="material-symbols-outlined text-xl">person_add</span>
        Add User
      </button>
    </div>
  );
}

function StatCard({ stat }) {
  return (
    <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-5 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.iconClass}`}>
          <span className="material-symbols-outlined">{stat.icon}</span>
        </div>
        <span
          className={`flex items-center gap-1 font-['Geist'] text-[13px] font-semibold ${stat.metaClass}`}
        >
          {stat.metaIcon && (
            <span className="material-symbols-outlined text-base">{stat.metaIcon}</span>
          )}
          {stat.meta}
        </span>
      </div>
      <p className="font-['Geist'] text-[13px] font-semibold text-[#737686]">{stat.label}</p>
      <h3 className="mt-1 font-['Geist'] text-3xl font-bold leading-9 text-[#191b23]">
        {stat.value}
      </h3>
    </div>
  );
}

function StatsGrid() {
  return (
    <div className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} stat={stat} />
      ))}
    </div>
  );
}

function TableToolbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-[#c3c6d7] p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex rounded-lg bg-[#f3f3fe] p-1 font-['Geist'] text-[13px] font-medium">
        {["All Users", "Staff", "Residents"].map((tab, index) => (
          <button
            key={tab}
            className={`rounded-md px-4 py-2 transition ${
              index === 0
                ? "bg-white text-[#004ac6] shadow-sm"
                : "text-[#737686] hover:text-[#191b23]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {[
          ["filter_list", "Filter"],
          ["download", "Export"],
        ].map(([icon, label]) => (
          <button
            key={label}
            className="flex h-11 items-center gap-2 rounded-lg border border-[#c3c6d7] bg-white px-4 font-['Geist'] text-[13px] font-medium text-[#434655] transition hover:bg-[#f3f3fe]"
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function UserAvatar({ user }) {
  return (
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full border border-[#c3c6d7] bg-gradient-to-br ${user.avatarClass}`}
    >
      <span className="material-symbols-outlined text-lg text-white/90">{user.avatarIcon}</span>
    </div>
  );
}

function StatusLabel({ status }) {
  const active = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-2 font-['Geist'] text-[13px] font-semibold ${
        active ? "text-green-600" : "text-[#ba1a1a]"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-[#ba1a1a]"}`} />
      {status}
    </span>
  );
}

function UserRow({ user }) {
  return (
    <tr className="transition hover:bg-[#faf8ff]">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div>
            <p className="font-['Geist'] text-[13px] font-bold text-[#191b23]">{user.name}</p>
            <p className="font-['Inter'] text-xs text-[#737686]">ID: {user.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 font-['Inter'] text-sm text-[#434655]">{user.email}</td>
      <td className="px-6 py-5">
        <span
          className={`rounded-full px-3 py-1 font-['Geist'] text-[11px] font-bold uppercase ${user.roleClass}`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-6 py-5">
        <StatusLabel status={user.status} />
      </td>
      <td className="px-6 py-5 font-['Inter'] text-sm font-medium text-[#737686]">
        {user.lastLogin}
      </td>
      <td className="px-6 py-5 text-right">
        <button className="rounded-lg p-2 text-[#737686] transition hover:bg-[#dbe1ff] hover:text-[#004ac6]">
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
        <button className="ml-1 rounded-lg p-2 text-[#737686] transition hover:bg-red-50 hover:text-[#ba1a1a]">
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </td>
    </tr>
  );
}

function UsersTable() {
  return (
    <div className="mb-7 overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <TableToolbar />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="border-b border-[#c3c6d7] bg-[#f3f3fe]">
            <tr>
              {["User Name", "Email Address", "Role", "Status", "Last Login", "Actions"].map(
                (heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#737686] ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#c3c6d7]">
            {users.map((user) => (
              <UserRow key={user.id} user={user} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#c3c6d7] bg-[#f3f3fe] px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="font-['Geist'] text-[13px] font-medium text-[#737686]">
          Showing <span className="font-bold text-[#191b23]">1-10</span> of{" "}
          <span className="font-bold text-[#191b23]">2,842</span> users
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c3c6d7] text-[#737686] opacity-50"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          {["1", "2", "3"].map((page) => (
            <button
              key={page}
              className={`flex h-9 w-9 items-center justify-center rounded-lg font-['Geist'] text-[13px] font-medium ${
                page === "1"
                  ? "bg-[#004ac6] text-white shadow-sm"
                  : "text-[#434655] transition hover:bg-white"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-[#737686]">...</span>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg font-['Geist'] text-[13px] font-medium text-[#434655] transition hover:bg-white">
            284
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c3c6d7] text-[#191b23] transition hover:bg-white">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm lg:col-span-2">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Recent Activity</h3>
        <button className="font-['Geist'] text-[13px] font-semibold text-[#004ac6] hover:underline">
          View All
        </button>
      </div>
      <div className="space-y-5">
        {activities.map((activity) => (
          <div key={activity.time} className="flex gap-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${activity.iconClass}`}
            >
              <span className="material-symbols-outlined text-lg">{activity.icon}</span>
            </div>
            <div>
              <p className="font-['Inter'] text-sm text-[#191b23]">
                <span className="font-bold">{activity.title}</span> {activity.detail}
              </p>
              <p className="mt-0.5 font-['Geist'] text-[11px] font-semibold text-[#737686]">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ToggleRow({ label, enabled }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[#f3f3fe] p-3">
      <span className="font-['Geist'] text-[13px] font-semibold text-[#191b23]">{label}</span>
      <button
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-[#004ac6]" : "bg-[#c3c6d7]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "right-1" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

function AccessControl() {
  return (
    <section className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-['Geist'] text-xl font-semibold text-[#191b23]">Access Control</h3>
      <p className="mb-6 font-['Inter'] text-sm leading-6 text-[#434655]">
        Review system-wide security policies and role-based access configurations.
      </p>
      <div className="space-y-3">
        <ToggleRow label="2FA Required" enabled />
        <ToggleRow label="Auto-suspend (90 days)" enabled />
        <ToggleRow label="New Login Alerts" />
      </div>
      <button className="mt-6 w-full rounded-lg border border-[#004ac6] py-2.5 font-['Geist'] text-[13px] font-semibold text-[#004ac6] transition hover:bg-[#dbe1ff]">
        Security Settings
      </button>
    </section>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminLayout activeLabel="Users" searchPlaceholder="Search for users, roles, or status...">
      <PageHeader />
      <StatsGrid />
      <UsersTable />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivity />
        <AccessControl />
      </div>
    </AdminLayout>
  );
}
