import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { apiRequest } from "../../services/api";

const statusConfig = {
  SUCCESS: {
    label: "Success",
    className: "bg-green-100 text-green-700 border-green-200",
    dot: "bg-green-500",
    icon: "check_circle",
  },
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: "pending_actions",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: "error",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    icon: "restart_alt",
  },
};

const paymentMethodConfig = {
  CASH: {
    label: "Cash",
    icon: "payments",
    className: "text-green-600",
  },
  BANKING: {
    label: "Banking",
    icon: "account_balance",
    className: "text-blue-600",
  },
  VNPAY: {
    label: "VNPay",
    icon: "qr_code_2",
    className: "text-purple-600",
  },
};

function getStatusMeta(status) {
  return (
    statusConfig[status] || {
      label: status || "Unknown",
      className: "bg-slate-100 text-slate-700 border-slate-200",
      dot: "bg-slate-400",
      icon: "help",
    }
  );
}

function getPaymentMethodMeta(method) {
  return (
    paymentMethodConfig[method] || {
      label: method || "Unknown",
      icon: "credit_card",
      className: "text-slate-600",
    }
  );
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value) {
  if (!value) return "N/A";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizePayment(payment) {
  const session = payment.parkingSession;

  return {
    id: payment.id,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentTime: payment.paymentTime,
    status: payment.status,

    ticketCode: session?.ticketCode || payment.ticketCode || "No ticket",
    licensePlate: session?.licensePlate || payment.licensePlate || "N/A",

    userFullName: session?.user?.fullName || payment.fullName || "Guest User",
    userEmail: session?.user?.email || payment.email || "No email",

    vehicleTypeName:
      session?.vehicleType?.typeName || payment.vehicleTypeName || "N/A",

    slotName: session?.parkingSlot?.slotName || payment.slotName || "No slot",
    zoneName: session?.parkingSlot?.zoneName || payment.zoneName || "No zone",
  };
}

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h2 className="font-['Geist'] text-3xl font-semibold text-[#191b23]">
          Payment Management
        </h2>
        <p className="mt-2 max-w-3xl font-['Inter'] text-sm text-[#6b7280]">
          Monitor parking payments, transaction status, payment methods, and
          related parking sessions.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="flex h-11 items-center gap-2 rounded-xl border border-[#d7d9e4] bg-white px-4 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]">
          <span className="material-symbols-outlined text-xl">
            calendar_today
          </span>
          This Month
        </button>
        <button className="flex h-11 items-center gap-2 rounded-xl bg-[#2563eb] px-5 font-['Inter'] text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95">
          <span className="material-symbols-outlined text-xl">download</span>
          Export Data
        </button>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, iconWrapClass, iconClass, helper }) {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            {title}
          </p>
          <h3 className="mt-2 font-['Geist'] text-2xl font-bold text-[#191b23]">
            {value}
          </h3>
          {helper && (
            <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
              {helper}
            </p>
          )}
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconWrapClass}`}
        >
          <span className={`material-symbols-outlined ${iconClass}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

function OverviewGrid({ payments }) {
  const totalRevenue = payments
    .filter((payment) => payment.status === "SUCCESS")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "PENDING")
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const successCount = payments.filter(
    (payment) => payment.status === "SUCCESS",
  ).length;
  const failedCount = payments.filter(
    (payment) => payment.status === "FAILED",
  ).length;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        title="Total Revenue"
        value={formatCurrency(totalRevenue)}
        icon="payments"
        iconWrapClass="bg-blue-50"
        iconClass="text-blue-600"
        helper="Successful payments only"
      />
      <SummaryCard
        title="Pending Amount"
        value={formatCurrency(pendingAmount)}
        icon="pending_actions"
        iconWrapClass="bg-amber-50"
        iconClass="text-amber-600"
        helper="Waiting for confirmation"
      />
      <SummaryCard
        title="Successful Payments"
        value={successCount}
        icon="check_circle"
        iconWrapClass="bg-green-50"
        iconClass="text-green-600"
        helper={`${payments.length} total transaction(s)`}
      />
      <SummaryCard
        title="Failed Payments"
        value={failedCount}
        icon="error"
        iconWrapClass="bg-red-50"
        iconClass="text-red-600"
        helper="Need review"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = getStatusMeta(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-['Geist'] text-[11px] font-semibold ${meta.className}`}
    >
      <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

function FilterToolbar({
  keyword,
  setKeyword,
  selectedStatus,
  setSelectedStatus,
  selectedMethod,
  setSelectedMethod,
  filteredCount,
  onResetFilters,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
              search
            </span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Search ticket, plate, user, slot..."
              className="h-11 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] pl-11 pr-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb]"
          >
            <option value="ALL">All Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            value={selectedMethod}
            onChange={(event) => setSelectedMethod(event.target.value)}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] px-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb]"
          >
            <option value="ALL">All Methods</option>
            <option value="CASH">Cash</option>
            <option value="BANKING">Banking</option>
            <option value="VNPAY">VNPay</option>
          </select>

          <button
            onClick={onResetFilters}
            className="h-11 rounded-xl border border-[#d7d9e4] bg-white px-4 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]"
          >
            Reset Filters
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="font-['Inter'] text-sm text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#191b23]">
              {filteredCount}
            </span>{" "}
            payment(s)
          </span>

          <button className="rounded-xl border border-[#d7d9e4] bg-white px-4 py-2.5 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

function PaymentRow({ payment }) {
  const data = normalizePayment(payment);
  const methodMeta = getPaymentMethodMeta(data.paymentMethod);

  return (
    <tr className="transition hover:bg-[#fafbff]">
      <td className="px-6 py-5">
        <div>
          <p className="font-mono text-[13px] font-bold text-[#2563eb]">
            {data.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {formatDateTime(data.paymentTime)}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-semibold text-[#191b23]">
            {data.ticketCode}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            Plate: {data.licensePlate}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-medium text-[#191b23]">
            {data.userFullName}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {data.userEmail}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div>
          <p className="font-['Inter'] text-sm font-medium text-[#191b23]">
            {data.vehicleTypeName}
          </p>
          <p className="mt-1 font-['Inter'] text-xs text-[#6b7280]">
            {data.slotName} • {data.zoneName}
          </p>
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-2">
          <span
            className={`material-symbols-outlined text-xl ${methodMeta.className}`}
          >
            {methodMeta.icon}
          </span>
          <span className="font-['Inter'] text-sm font-medium text-[#191b23]">
            {methodMeta.label}
          </span>
        </div>
      </td>

      <td className="px-6 py-5 text-right font-['Geist'] text-sm font-bold text-[#191b23]">
        {formatCurrency(data.amount)}
      </td>

      <td className="px-6 py-5">
        <StatusBadge status={data.status} />
      </td>

      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
            <span className="material-symbols-outlined">receipt_long</span>
          </button>
          <button className="rounded-lg p-2 text-red-500 transition hover:bg-red-50">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function PaymentsTable({ payments, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center font-['Inter'] text-sm text-[#6b7280] shadow-sm">
        Loading payments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center font-['Inter'] text-sm text-red-600 shadow-sm">
        {error}
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center font-['Inter'] text-sm text-[#6b7280] shadow-sm">
        No payments found.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d7d9e4] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] border-collapse text-left">
          <thead className="bg-[#f7f8fc]">
            <tr>
              {[
                "Payment ID",
                "Ticket",
                "User",
                "Vehicle / Slot",
                "Method",
                "Amount",
                "Status",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280] ${
                    heading === "Amount" || heading === "Actions"
                      ? "text-right"
                      : ""
                  }`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#eceef5]">
            {payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-[#eceef5] bg-[#f8f9fc] px-6 py-4">
        <span className="font-['Inter'] text-sm text-[#6b7280]">
          Showing {payments.length} payment(s)
        </span>
      </div>
    </div>
  );
}

function MethodBreakdown({ payments }) {
  const methodData = ["CASH", "BANKING", "VNPAY"].map((method) => {
    const total = payments
      .filter((payment) => payment.paymentMethod === method)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    return {
      method,
      total,
      count: payments.filter((payment) => payment.paymentMethod === method)
        .length,
    };
  });

  const maxTotal = Math.max(...methodData.map((item) => item.total), 1);

  return (
    <div className="mt-6 rounded-2xl border border-[#d7d9e4] bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-['Geist'] text-lg font-semibold text-[#191b23]">
            Payment Method Breakdown
          </h3>
          <p className="mt-1 font-['Inter'] text-sm text-[#6b7280]">
            Revenue grouped by payment method.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {methodData.map((item) => {
          const meta = getPaymentMethodMeta(item.method);
          const width = `${Math.max((item.total / maxTotal) * 100, item.total > 0 ? 12 : 3)}%`;

          return (
            <div key={item.method}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`material-symbols-outlined ${meta.className}`}
                  >
                    {meta.icon}
                  </span>
                  <span className="font-['Inter'] text-sm font-medium text-[#191b23]">
                    {meta.label}
                  </span>
                  <span className="font-['Inter'] text-xs text-[#6b7280]">
                    {item.count} transaction(s)
                  </span>
                </div>
                <span className="font-['Geist'] text-sm font-semibold text-[#191b23]">
                  {formatCurrency(item.total)}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#edf0f7]">
                <div
                  className="h-full rounded-full bg-[#2563eb]"
                  style={{ width }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedMethod, setSelectedMethod] = useState("ALL");

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/payments");
        setPayments(result.data || []);
      } catch (error) {
        setError(error.message || "Cannot load payments");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const data = normalizePayment(payment);

      const searchText = `
        ${data.id || ""}
        ${data.paymentMethod || ""}
        ${data.status || ""}
        ${data.ticketCode || ""}
        ${data.licensePlate || ""}
        ${data.userFullName || ""}
        ${data.userEmail || ""}
        ${data.vehicleTypeName || ""}
        ${data.slotName || ""}
        ${data.zoneName || ""}
      `.toLowerCase();

      const matchesKeyword = searchText.includes(keyword.toLowerCase());
      const matchesStatus =
        selectedStatus === "ALL" || payment.status === selectedStatus;
      const matchesMethod =
        selectedMethod === "ALL" || payment.paymentMethod === selectedMethod;

      return matchesKeyword && matchesStatus && matchesMethod;
    });
  }, [payments, keyword, selectedStatus, selectedMethod]);

  const resetFilters = () => {
    setKeyword("");
    setSelectedStatus("ALL");
    setSelectedMethod("ALL");
  };

  return (
    <AdminLayout
      activeLabel="Payments"
      searchPlaceholder="Search transactions, tickets, plates..."
    >
      <PageHeader />
      <OverviewGrid payments={payments} />

      <FilterToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        selectedStatus={selectedStatus}
        setSelectedStatus={setSelectedStatus}
        selectedMethod={selectedMethod}
        setSelectedMethod={setSelectedMethod}
        filteredCount={filteredPayments.length}
        onResetFilters={resetFilters}
      />

      <PaymentsTable
        payments={filteredPayments}
        loading={loading}
        error={error}
      />
      <MethodBreakdown payments={payments} />
    </AdminLayout>
  );
}
