import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../services/api";
import UserLayout from "../../components/UserLayout";

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getInitialForm(user) {
  const emailVal = user?.email || "";
  const derivedUsername = emailVal ? emailVal.split("@")[0] : "";
  return {
    fullName: user?.fullName || user?.full_name || user?.name || "Parking User",
    email: emailVal || "user@parkmaster.local",
    phone: user?.phone || "",
    username: user?.username || derivedUsername,
  };
}

function Field({ label, name, value, onChange, type = "text", readOnly = false }) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        type={type}
        readOnly={readOnly}
        className={`mt-2 h-12 w-full rounded-xl border px-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 ${readOnly
          ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
          : "border-slate-200 bg-white text-slate-900"
          }`}
      />
    </label>
  );
}

function Alert({ type, message }) {
  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${isError
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
    >
      <span className="material-symbols-outlined text-[20px]">
        {isError ? "error" : "check_circle"}
      </span>
      {message}
    </div>
  );
}

function PageHeader() {
  return (
    <div className="mb-6">
      <h1 className="font-['Geist'] text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        Settings
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Keep profile, account preferences, and security options organized in one place.
      </p>
    </div>
  );
}

function ToggleRow({ icon, label, checked }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-[21px] text-slate-500">
          {icon}
        </span>
        <span className="text-sm font-black text-slate-700">{label}</span>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input className="peer sr-only" defaultChecked={checked} type="checkbox" />
        <span className="user-setting-switch h-6 w-11 rounded-full bg-slate-300 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-sm after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

export default function UserSettingsPage() {
  const user = useMemo(() => getStoredUser(), []);
  const [form, setForm] = useState(() => getInitialForm(user));
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [showPasswordForm, setShowPasswordForm] =
    useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));
  };
  const fetchProfile = async () => {
    try {
      const response = await apiRequest(
        "/api/users/profile"
      );

      const emailVal = response.data.email || "";
      const derivedUsername = emailVal ? emailVal.split("@")[0] : "";

      setForm({
        fullName: response.data.fullName || "",
        email: emailVal,
        phone: response.data.phone || "",
        username: response.data.username || derivedUsername,
      });
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message,
      });
    }
  };
  
  const handleSignOutAll = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  const handleChangePassword = async () => {
    try {
      setAlert({ type: "", message: "" });

      if (
        !passwordForm.currentPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setAlert({
          type: "error",
          message: "Please fill all password fields",
        });
        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setAlert({
          type: "error",
          message: "Confirm password does not match",
        });
        return;
      }

      setChangingPassword(true);

      const response = await apiRequest(
        "/api/users/profile/password",
        {
          method: "PATCH",
          body: JSON.stringify({
            currentPassword:
              passwordForm.currentPassword,
            newPassword:
              passwordForm.newPassword,
          }),
        }
      );

      setAlert({
        type: "success",
        message: response.message,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);

      const response = await apiRequest(
        "/api/users/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            fullName: form.fullName,
            phone: form.phone,
            email: form.email,
          }),
        }
      );
      localStorage.setItem(
        "user",
        JSON.stringify(response.data)
      );
      setAlert({
        type: "success",
        message: response.message,
      });

      await fetchProfile();
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setSaving(false);
    }
  };
  if (!form.email && !form.username) {
    return (
      <UserLayout>
        <div className="p-6">
          Loading profile...
        </div>
      </UserLayout>
    );
  }
  return (
    <UserLayout>
      <PageHeader />
      <Alert type={alert.type} message={alert.message} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </div>
            <div>
              <h2 className="font-['Geist'] text-lg font-black text-slate-950">
                Profile Information
              </h2>
              <p className="text-sm text-slate-500">
                Basic information used for parking reservations.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
              />
              <Field
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
              />
              <Field
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                type="tel"
              />
              <Field
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-['Geist'] text-lg font-black text-slate-950">
              Account Settings
            </h2>
            <div className="mt-4 space-y-3">
              <ToggleRow checked icon="mail" label="Email notifications" />
              <ToggleRow icon="sms" label="SMS reminders" />
              <ToggleRow checked icon="calendar_month" label="Booking reminders" />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-['Geist'] text-lg font-black text-slate-950">
              Security
            </h2>

            {!showPasswordForm ? (
              <div className="mt-4 space-y-3">

                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">
                      lock
                    </span>

                    <span className="font-black text-slate-700">
                      Change Password
                    </span>
                  </div>

                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleSignOutAll}
                  className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-red-600 transition hover:bg-red-100"
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined">
                      logout
                    </span>

                    <span className="font-black">
                      Sign Out All Devices
                    </span>
                  </div>

                  <span className="material-symbols-outlined">
                    chevron_right
                  </span>
                </button>

              </div>
            ) : (
              <div className="mt-4 space-y-4">

                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4"
                />

                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4"
                />

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    className="flex-1 rounded-xl bg-blue-600 py-3 font-black text-white"
                  >
                    {changingPassword
                      ? "Changing Password..."
                      : "Change Password"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);

                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="rounded-xl border border-slate-200 px-4"
                  >
                    Cancel
                  </button>

                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </UserLayout>
  );
}
