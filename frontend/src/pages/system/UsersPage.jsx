import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

const roleOptions = ["ADMIN", "MANAGER", "STAFF", "USER"];
const statusOptions = ["ACTIVE", "INACTIVE", "SUSPENDED"];

const roleStyles = {
  ADMIN: "bg-blue-50 text-blue-700 ring-blue-100",
  MANAGER: "bg-violet-50 text-violet-700 ring-violet-100",
  STAFF: "bg-amber-50 text-amber-700 ring-amber-100",
  USER: "bg-slate-100 text-slate-700 ring-slate-200",
};

const statusStyles = {
  ACTIVE: "text-emerald-700 bg-emerald-500",
  INACTIVE: "text-slate-600 bg-slate-400",
  SUSPENDED: "text-rose-700 bg-rose-500",
};

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getInitials(name = "") {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

function formatDate(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function PageHeader({ onCreate }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-['Geist'] text-2xl font-semibold leading-8 text-slate-950">
          User Management
        </h2>
        <p className="font-['Inter'] text-sm text-slate-500">
          Manage system users, roles, and account access.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-['Geist'] text-[13px] font-semibold text-white shadow-lg shadow-blue-950/10 transition hover:bg-blue-700 active:scale-95"
      >
        <span className="material-symbols-outlined text-xl">person_add</span>
        Add User
      </button>
    </div>
  );
}

function StatCard({ label, value, icon, color, meta }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}
        >
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <span className="font-['Geist'] text-[13px] font-semibold text-slate-500">
          {meta}
        </span>
      </div>
      <p className="font-['Geist'] text-[13px] font-semibold text-slate-500">
        {label}
      </p>
      <h3 className="mt-1 font-['Geist'] text-3xl font-bold leading-9 text-slate-950">
        {value}
      </h3>
    </div>
  );
}

function StatsGrid({ users }) {
  const activeUsers = users.filter((user) => user.status === "ACTIVE").length;
  const adminUsers = users.filter((user) => user.role === "ADMIN").length;
  const staffUsers = users.filter((user) =>
    ["ADMIN", "MANAGER", "STAFF"].includes(user.role),
  ).length;

  return (
    <div className="mb-7 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Total Users"
        value={users.length}
        icon="group"
        color="bg-blue-50 text-blue-700"
        meta="All accounts"
      />
      <StatCard
        label="Active Users"
        value={activeUsers}
        icon="bolt"
        color="bg-emerald-50 text-emerald-700"
        meta="Can sign in"
      />
      <StatCard
        label="Staff Accounts"
        value={staffUsers}
        icon="badge"
        color="bg-amber-50 text-amber-700"
        meta="Operations"
      />
      <StatCard
        label="Admin Accounts"
        value={adminUsers}
        icon="admin_panel_settings"
        color="bg-slate-100 text-slate-800"
        meta="Full access"
      />
    </div>
  );
}

function TableToolbar({
  keyword,
  roleFilter,
  statusFilter,
  onKeywordChange,
  onRoleFilterChange,
  onStatusFilterChange,
  total,
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="relative flex-1 xl:max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          search
        </span>
        <input
          value={keyword}
          onChange={(event) => onKeywordChange(event.target.value)}
          placeholder="Search name, username, email, or phone..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 font-['Inter'] text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={roleFilter}
          onChange={(event) => onRoleFilterChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="ALL">All Roles</option>
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        >
          <option value="ALL">All Statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <div className="inline-flex h-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-4 font-['Inter'] text-sm text-blue-700">
          <span className="font-black">{total}</span>
          <span className="ml-1 font-semibold">results</span>
        </div>
      </div>
    </div>
  );
}

function UserAvatar({ user }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 to-blue-700 text-xs font-black text-white shadow-sm">
      {getInitials(user.fullName || user.username || user.email)}
    </div>
  );
}

function RoleBadge({ role }) {
  return (
    <span
      className={`rounded-full px-3 py-1 font-['Geist'] text-[11px] font-bold uppercase ring-1 ${
        roleStyles[role] || roleStyles.USER
      }`}
    >
      {role}
    </span>
  );
}

function StatusLabel({ status }) {
  const style = statusStyles[status] || statusStyles.INACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-2 font-['Geist'] text-[13px] font-semibold ${style.split(" ")[0]}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.split(" ")[1]}`} />
      {status}
    </span>
  );
}

function UserRow({ user, isCurrentUser, onEdit, onDelete }) {
  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate font-['Geist'] text-[13px] font-bold text-slate-950">
              {user.fullName}
            </p>
            <p className="truncate font-['Inter'] text-xs text-slate-500">
              @{user.username || "no-username"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-5 font-['Inter'] text-sm text-slate-600">
        <div className="max-w-[260px]">
          <p className="truncate font-semibold text-slate-700">{user.email}</p>
          <p className="mt-0.5 truncate text-xs text-slate-400">
            {user.phone || "No phone"}
          </p>
        </div>
      </td>
      <td className="px-6 py-5">
        <RoleBadge role={user.role} />
      </td>
      <td className="px-6 py-5">
        <StatusLabel status={user.status} />
      </td>
      <td className="px-6 py-5 font-['Inter'] text-sm font-medium text-slate-500">
        {formatDate(user.createdAt)}
      </td>
      <td className="px-6 py-5 text-right">
        <button
          type="button"
          onClick={() => onEdit(user)}
          className="rounded-lg border border-transparent p-2 text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md active:translate-y-0"
          title="Edit user"
        >
          <span className="material-symbols-outlined text-xl">edit</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(user)}
          disabled={isCurrentUser}
          className="ml-1 rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          title={isCurrentUser ? "You cannot delete yourself" : "Delete user"}
        >
          <span className="material-symbols-outlined text-xl">delete</span>
        </button>
      </td>
    </tr>
  );
}

function LoadingRows() {
  return (
    <tbody className="divide-y divide-slate-200">
      {[1, 2, 3, 4].map((item) => (
        <tr key={item}>
          <td colSpan={6} className="px-6 py-5">
            <div className="h-12 animate-pulse rounded-xl bg-slate-100" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

function EmptyTable({ onCreate }) {
  return (
    <div className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
        <span className="material-symbols-outlined text-3xl">group_add</span>
      </div>
      <h3 className="mt-4 font-['Geist'] text-lg font-bold text-slate-950">
        No users found
      </h3>
      <p className="mx-auto mt-2 max-w-md font-['Inter'] text-sm text-slate-500">
        Adjust your filters or create a new account for the parking system.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-blue-600 px-5 font-['Geist'] text-[13px] font-semibold text-white transition hover:bg-blue-700"
      >
        <span className="material-symbols-outlined text-xl">person_add</span>
        Add User
      </button>
    </div>
  );
}

function UsersTable({
  users,
  loading,
  error,
  currentUserId,
  keyword,
  roleFilter,
  statusFilter,
  onKeywordChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onCreate,
  onEdit,
  onDelete,
}) {
  return (
    <div className="mb-7 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <TableToolbar
        keyword={keyword}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        total={users.length}
        onKeywordChange={onKeywordChange}
        onRoleFilterChange={onRoleFilterChange}
        onStatusFilterChange={onStatusFilterChange}
      />

      {error ? (
        <div className="px-6 py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-700">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h3 className="mt-4 font-['Geist'] text-lg font-bold text-rose-800">
            Cannot load users
          </h3>
          <p className="mt-2 font-['Inter'] text-sm text-rose-600">{error}</p>
        </div>
      ) : users.length === 0 && !loading ? (
        <EmptyTable onCreate={onCreate} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {[
                  "User",
                  "Contact",
                  "Role",
                  "Status",
                  "Created",
                  "Actions",
                ].map((heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-slate-500 ${
                      heading === "Actions" ? "text-right" : ""
                    }`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            {loading ? (
              <LoadingRows />
            ) : (
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isCurrentUser={user.id === currentUserId}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </tbody>
            )}
          </table>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <p className="font-['Geist'] text-[13px] font-medium text-slate-500">
          Showing{" "}
          <span className="font-bold text-slate-950">
            {loading ? 0 : users.length}
          </span>{" "}
          users
        </p>
        <p className="font-['Inter'] text-xs font-semibold text-slate-400">
          Changes are saved directly through the admin API.
        </p>
      </div>
    </div>
  );
}

function FormField({ label, children, required }) {
  return (
    <label className="block">
      <span className="mb-2 block font-['Inter'] text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}

function UserFormModal({ mode, user, saving, onClose, onSubmit }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState(() => ({
    username: user?.username || "",
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    password: "",
    role: user?.role || "USER",
    status: user?.status || "ACTIVE",
  }));

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      username: form.username.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      role: form.role,
      status: form.status,
    };

    if (form.password) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-950/30">
        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <span className="material-symbols-outlined text-2xl">
                {isEdit ? "manage_accounts" : "person_add"}
              </span>
            </div>
            <h3 className="mt-4 font-['Geist'] text-2xl font-bold text-slate-950">
              {isEdit ? "Edit User" : "Add User"}
            </h3>
            <p className="mt-1 font-['Inter'] text-sm text-slate-500">
              {isEdit
                ? "Update account details, role, status, or reset password."
                : "Create a new account for the parking management system."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormField label="Full name" required>
              <input
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
                required
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </FormField>

            <FormField label="Username">
              <input
                value={form.username}
                onChange={(event) =>
                  updateField("username", event.target.value)
                }
                placeholder="Auto-generated if empty"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </FormField>

            <FormField label="Email" required>
              <input
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
                type="email"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </FormField>

            <FormField label="Phone">
              <input
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </FormField>

            <FormField label="Role" required>
              <select
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Status" required>
              <select
                value={form.status}
                onChange={(event) => updateField("status", event.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <FormField
            label={isEdit ? "New password" : "Password"}
            required={!isEdit}
          >
            <input
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              required={!isEdit}
              minLength={6}
              type="password"
              placeholder={isEdit ? "Leave empty to keep current password" : ""}
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-['Inter'] text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
            />
          </FormField>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {saving ? "Saving..." : isEdit ? "Update User" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({ user, deleting, onClose, onConfirm }) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-slate-950/30">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-700">
          <span className="material-symbols-outlined text-3xl">delete</span>
        </div>
        <h3 className="mt-4 font-['Geist'] text-xl font-bold text-slate-950">
          Delete user?
        </h3>
        <p className="mt-2 font-['Inter'] text-sm leading-6 text-slate-500">
          This will permanently remove{" "}
          <span className="font-bold text-slate-800">{user.fullName}</span>.
          Backend will block the action if this user is referenced by other
          records.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-xl border border-slate-200 px-5 py-3 font-['Inter'] text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 font-['Inter'] text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccessControl() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-['Geist'] text-xl font-semibold text-slate-950">
        Access Control
      </h3>
      <p className="mb-6 font-['Inter'] text-sm leading-6 text-slate-500">
        User administration is restricted to ADMIN accounts. Account status
        controls whether a user can sign in.
      </p>
      <div className="space-y-3">
        {[
          ["Admin-only user APIs", true],
          ["Password hashing", true],
          ["Self-delete protection", true],
        ].map(([label, enabled]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
          >
            <span className="font-['Geist'] text-[13px] font-semibold text-slate-800">
              {label}
            </span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                enabled ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function RoleBreakdown({ users }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
      <h3 className="mb-6 font-['Geist'] text-xl font-semibold text-slate-950">
        Role Breakdown
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {roleOptions.map((role) => {
          const count = users.filter((user) => user.role === role).length;

          return (
            <div key={role} className="rounded-xl bg-slate-50 p-4">
              <RoleBadge role={role} />
              <p className="mt-4 font-['Geist'] text-3xl font-bold text-slate-950">
                {count}
              </p>
              <p className="font-['Inter'] text-xs font-semibold text-slate-500">
                accounts
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function AdminUsersPage() {
  const currentUser = useMemo(() => getStoredUser(), []);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalMode, setModalMode] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const result = await apiRequest("/api/users");
      setUsers(result.data || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return users.filter((user) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          user.fullName,
          user.username,
          user.email,
          user.phone,
          user.role,
          user.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(normalizedKeyword),
          );

      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "ALL" || user.status === statusFilter;

      return matchesKeyword && matchesRole && matchesStatus;
    });
  }, [users, keyword, roleFilter, statusFilter]);

  const openCreateModal = () => {
    setSelectedUser(null);
    setModalMode("create");
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setModalMode("edit");
  };

  const closeFormModal = () => {
    if (saving) return;
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleSubmitUser = async (payload) => {
    try {
      setSaving(true);

      if (modalMode === "edit") {
        const result = await apiRequest(`/api/users/${selectedUser.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });

        setUsers((currentUsers) =>
          currentUsers.map((user) =>
            user.id === selectedUser.id ? result.data : user,
          ),
        );
      } else {
        const result = await apiRequest("/api/users", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setUsers((currentUsers) => [result.data, ...currentUsers]);
      }

      setModalMode(null);
      setSelectedUser(null);
    } catch (submitError) {
      alert(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;

    try {
      setDeleting(true);
      await apiRequest(`/api/users/${deleteUser.id}`, {
        method: "DELETE",
      });

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== deleteUser.id),
      );
      setDeleteUser(null);
    } catch (deleteError) {
      alert(deleteError.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <PageHeader onCreate={openCreateModal} />
      <StatsGrid users={users} />
      <UsersTable
        users={filteredUsers}
        loading={loading}
        error={error}
        currentUserId={currentUser?.id}
        keyword={keyword}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onKeywordChange={setKeyword}
        onRoleFilterChange={setRoleFilter}
        onStatusFilterChange={setStatusFilter}
        onCreate={openCreateModal}
        onEdit={openEditModal}
        onDelete={setDeleteUser}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RoleBreakdown users={users} />
        <AccessControl />
      </div>

      {modalMode && (
        <UserFormModal
          mode={modalMode}
          user={selectedUser}
          saving={saving}
          onClose={closeFormModal}
          onSubmit={handleSubmitUser}
        />
      )}

      <DeleteModal
        user={deleteUser}
        deleting={deleting}
        onClose={() => {
          if (!deleting) setDeleteUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
