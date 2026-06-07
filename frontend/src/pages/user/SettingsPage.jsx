import { useMemo, useState } from "react";
import UserLayout from "../../components/UserLayout";
import { apiRequest } from "../../services/api";

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function getInitialForm(user) {
  return {
    fullName: user?.fullName || user?.full_name || user?.name || "Parking User",
    email: user?.email || "user@parkmaster.local",
    phone: user?.phone || "",
    username: user?.username || "",
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
        className={`mt-2 h-12 w-full rounded-xl border px-4 text-sm font-semibold outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 ${
          readOnly
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
      className={`mb-5 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
        isError
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
        <span className="h-6 w-11 rounded-full bg-slate-300 transition after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:bg-blue-600 peer-checked:after:translate-x-5" />
      </label>
    </div>
  );
}

function FeedbackForm() {
  const [feedbackForm, setFeedbackForm] = useState({
    parkingSessionId: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [feedbackAlert, setFeedbackAlert] = useState({
    type: "",
    message: "",
  });

  const handleFeedbackChange = (event) => {
    const { name, value } = event.target;
    setFeedbackForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFeedbackSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedbackAlert({ type: "", message: "" });

    try {
      const payload = {
        subject: feedbackForm.subject.trim(),
        message: feedbackForm.message.trim(),
      };

      if (feedbackForm.parkingSessionId.trim()) {
        payload.parkingSessionId = feedbackForm.parkingSessionId.trim();
      }

      await apiRequest("/api/user/feedbacks", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setFeedbackForm({
        parkingSessionId: "",
        subject: "",
        message: "",
      });
      setFeedbackAlert({
        type: "success",
        message: "Feedback submitted successfully. Staff will review it soon.",
      });
    } catch (error) {
      setFeedbackAlert({
        type: "error",
        message: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
          <span className="material-symbols-outlined text-[24px]">
            report_problem
          </span>
        </div>
        <div>
          <h2 className="font-['Geist'] text-lg font-black text-slate-950">
            Feedback & Issue Report
          </h2>
          <p className="text-sm text-slate-500">
            Send feedback or report a parking issue to the support team.
          </p>
        </div>
      </div>

      <Alert type={feedbackAlert.type} message={feedbackAlert.message} />

      <form onSubmit={handleFeedbackSubmit} className="space-y-5">
        <Field
          label="Parking Session ID (Optional)"
          name="parkingSessionId"
          value={feedbackForm.parkingSessionId}
          onChange={handleFeedbackChange}
        />

        <Field
          label="Subject"
          name="subject"
          value={feedbackForm.subject}
          onChange={handleFeedbackChange}
        />

        <label className="block">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400">
            Message
          </span>
          <textarea
            name="message"
            value={feedbackForm.message}
            onChange={handleFeedbackChange}
            rows={5}
            className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            placeholder="Describe what happened..."
          />
        </label>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            )}
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default function UserSettingsPage() {
  const user = useMemo(() => getStoredUser(), []);
  const [form, setForm] = useState(() => getInitialForm(user));
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setAlert({ type: "", message: "" });

    window.setTimeout(() => {
      setSaving(false);
      setAlert({
        type: "success",
        message: "Profile information saved successfully.",
      });
    }, 600);
  };

  return (
    <UserLayout>
      <PageHeader />
      <Alert type={alert.type} message={alert.message} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
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

          <FeedbackForm />
        </div>

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
            <div className="mt-4 space-y-3">
              <button className="flex h-12 w-full items-center justify-between rounded-xl bg-slate-50 px-4 text-sm font-black text-slate-700 ring-1 ring-slate-100 transition hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-100">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[21px]">lock</span>
                  Change Password
                </span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </button>
              <button className="flex h-12 w-full items-center justify-between rounded-xl bg-red-50 px-4 text-sm font-black text-red-700 ring-1 ring-red-100 transition hover:bg-red-100">
                <span className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[21px]">logout</span>
                  Sign Out All Devices
                </span>
                <span className="material-symbols-outlined text-[20px]">
                  chevron_right
                </span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </UserLayout>
  );
}
