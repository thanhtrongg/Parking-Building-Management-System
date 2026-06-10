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
  CARD: {
    label: "Card",
    icon: "credit_card",
    className: "text-blue-600",
  },
  SEPAY: {
    label: "SePay",
    icon: "qr_code_2",
    className: "text-cyan-600",
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
  const status = payment.status === "PAID" ? "SUCCESS" : payment.status;

  return {
    id: payment.id,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod || payment.method,
    paymentTime: payment.paymentTime || payment.paidAt,
    status: status,
    sepayPaymentCode: payment.sepayPaymentCode,
    sepayTransactionId: payment.sepayTransactionId,
    sepayReferenceCode: payment.sepayReferenceCode,
    reservationId: payment.reservationId,
    parkingSessionId: payment.parkingSessionId,

    ticketCode:
      session?.ticketCode ||
      payment.ticketCode ||
      (payment.reservationId
        ? `RSV-${payment.reservationId.slice(0, 8)}`
        : "No ticket"),
    licensePlate: session?.licensePlate || payment.licensePlate || "N/A",

    userFullName: session?.user?.fullName || payment.fullName || "Guest User",
    userEmail: session?.user?.email || payment.email || "No email",

    vehicleTypeName:
      session?.vehicleType?.typeName || payment.vehicleTypeName || "N/A",

    slotName: session?.parkingSlot?.slotName || payment.slotName || "No slot",
    zoneName: session?.parkingSlot?.zoneName || payment.zoneName || "No zone",
    entryTime: session?.entryTime || payment.entryTime,
    exitTime: session?.exitTime || payment.exitTime,
    sessionStatus: session?.status || payment.sessionStatus,
  };
}

function PageHeader({ onRefresh, refreshing }) {
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
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="flex h-11 items-center gap-2 rounded-xl border border-[#d7d9e4] bg-white px-4 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-xl">
            refresh
          </span>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
        <button
          type="button"
          className="flex h-11 items-center gap-2 rounded-xl bg-[#2563eb] px-5 font-['Inter'] text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95"
        >
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
            <option value="CARD">Card</option>
            <option value="SEPAY">SePay</option>
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

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl border border-[#eceef5] bg-[#f8f9fc] p-4">
      <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
        {label}
      </p>
      <p className="mt-2 break-words font-['Inter'] text-sm font-semibold text-[#191b23]">
        {value || "N/A"}
      </p>
    </div>
  );
}

function PaymentDetailModal({ payment, onClose, onPrint }) {
  if (!payment) return null;

  const data = normalizePayment(payment);
  const methodMeta = getPaymentMethodMeta(data.paymentMethod);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[#eceef5] px-6 py-5">
          <div>
            <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
              Payment Detail
            </p>
            <h3 className="mt-1 font-['Geist'] text-xl font-bold text-[#191b23]">
              {data.ticketCode}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-[#6b7280] transition hover:bg-[#f3f4f8] hover:text-[#191b23]"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6">
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#d7d9e4] bg-[#f8f9fc] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-['Inter'] text-xs font-semibold text-[#6b7280]">
                Amount
              </p>
              <p className="mt-1 font-['Geist'] text-3xl font-bold text-[#191b23]">
                {formatCurrency(data.amount)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={data.status} />
              <span className="inline-flex items-center gap-2 rounded-full border border-[#eceef5] bg-white px-3 py-1.5 font-['Inter'] text-sm font-semibold text-[#191b23]">
                <span
                  className={`material-symbols-outlined text-xl ${methodMeta.className}`}
                >
                  {methodMeta.icon}
                </span>
                {methodMeta.label}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailItem label="Payment ID" value={data.id} />
            <DetailItem label="Paid At" value={formatDateTime(data.paymentTime)} />
            <DetailItem label="Ticket" value={data.ticketCode} />
            <DetailItem label="License Plate" value={data.licensePlate} />
            <DetailItem label="Customer" value={data.userFullName} />
            <DetailItem label="Email" value={data.userEmail} />
            <DetailItem label="Vehicle Type" value={data.vehicleTypeName} />
            <DetailItem label="Slot" value={`${data.slotName} - ${data.zoneName}`} />
            <DetailItem label="Entry Time" value={formatDateTime(data.entryTime)} />
            <DetailItem label="Exit Time" value={formatDateTime(data.exitTime)} />
            <DetailItem label="Session Status" value={data.sessionStatus} />
            <DetailItem label="Parking Session ID" value={data.parkingSessionId} />
            {data.sepayPaymentCode ? (
              <DetailItem label="SePay Code" value={data.sepayPaymentCode} />
            ) : null}
            {data.sepayTransactionId ? (
              <DetailItem label="SePay Transaction" value={data.sepayTransactionId} />
            ) : null}
            {data.sepayReferenceCode ? (
              <DetailItem label="SePay Reference" value={data.sepayReferenceCode} />
            ) : null}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#d7d9e4] bg-white px-5 py-2.5 font-['Inter'] text-sm font-semibold text-[#374151] transition hover:bg-[#f8f9fc]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => onPrint(payment)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 font-['Inter'] text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:brightness-110"
            >
              <span className="material-symbols-outlined text-xl">
                receipt_long
              </span>
              Print receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentReceiptPrint({ payment }) {
  if (!payment) return null;

  const data = normalizePayment(payment);

  return (
    <div className="payment-receipt-print hidden bg-white p-8 text-[#111827]">
      <div className="mx-auto max-w-2xl">
        <div className="border-b border-slate-300 pb-5">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Parking Building Management System
          </p>
          <h1 className="mt-2 text-3xl font-black">Payment Receipt</h1>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <DetailItem label="Receipt No." value={data.id} />
          <DetailItem label="Payment Time" value={formatDateTime(data.paymentTime)} />
          <DetailItem label="Ticket" value={data.ticketCode} />
          <DetailItem label="License Plate" value={data.licensePlate} />
          <DetailItem label="Customer" value={data.userFullName} />
          <DetailItem label="Vehicle" value={data.vehicleTypeName} />
          <DetailItem label="Slot" value={`${data.slotName} - ${data.zoneName}`} />
          <DetailItem label="Method" value={getPaymentMethodMeta(data.paymentMethod).label} />
          <DetailItem label="Status" value={getStatusMeta(data.status).label} />
          <DetailItem label="Amount" value={formatCurrency(data.amount)} />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-300 p-5 text-right">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Paid
          </p>
          <p className="mt-1 text-3xl font-black">{formatCurrency(data.amount)}</p>
        </div>

        <div className="mt-10 flex justify-between text-sm text-slate-500">
          <span>Printed at {formatDateTime(new Date())}</span>
          <span>Thank you</span>
        </div>
      </div>
    </div>
  );
}

function PaymentPrintStyles() {
  return (
    <style>
      {`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .payment-receipt-print,
          .payment-receipt-print * {
            visibility: visible !important;
          }

          .payment-receipt-print {
            display: block !important;
            position: absolute !important;
            inset: 0 auto auto 0 !important;
            width: 100% !important;
          }
        }
      `}
    </style>
  );
}

function PaymentRow({
  payment,
  onSimulateSepay,
  simulatingCode,
  onView,
  onPrint,
}) {
  const data = normalizePayment(payment);
  const methodMeta = getPaymentMethodMeta(data.paymentMethod);
  const canSimulateSepay =
    data.paymentMethod === "SEPAY" &&
    data.status === "PENDING" &&
    data.sepayPaymentCode;

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
          {canSimulateSepay && (
            <button
              type="button"
              onClick={() => onSimulateSepay(data.sepayPaymentCode)}
              disabled={simulatingCode === data.sepayPaymentCode}
              title="Simulate SePay sandbox success"
              className="rounded-lg p-2 text-cyan-600 transition hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="material-symbols-outlined">
                {simulatingCode === data.sepayPaymentCode ? "hourglass_top" : "science"}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onView(payment)}
            title="View payment detail"
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]"
          >
            <span className="material-symbols-outlined">visibility</span>
          </button>
          <button
            type="button"
            onClick={() => onPrint(payment)}
            title="Print receipt"
            className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]"
          >
            <span className="material-symbols-outlined">receipt_long</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function PaymentsTable({
  payments,
  loading,
  error,
  onSimulateSepay,
  simulatingCode,
  onView,
  onPrint,
}) {
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
        <table className="w-full min-w-[1120px] border-collapse text-left">
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
              <PaymentRow
                key={payment.id}
                payment={payment}
                onSimulateSepay={onSimulateSepay}
                simulatingCode={simulatingCode}
                onView={onView}
                onPrint={onPrint}
              />
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
  const methodData = ["CASH", "CARD", "SEPAY"].map((method) => {
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
  const [simulatingCode, setSimulatingCode] = useState("");
  const [alert, setAlert] = useState("");
  const [detailPayment, setDetailPayment] = useState(null);
  const [printPayment, setPrintPayment] = useState(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await apiRequest("/api/payments");
      const normalized = (result.data || []).map(p => ({
        ...p,
        paymentMethod: p.paymentMethod || p.method,
        paymentTime: p.paymentTime || p.paidAt,
        status: p.status === "PAID" ? "SUCCESS" : p.status,
      }));
      setPayments(normalized);
    } catch (error) {
      setError(error.message || "Cannot load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const clearPrintPayment = () => setPrintPayment(null);
    window.addEventListener("afterprint", clearPrintPayment);

    return () => {
      window.removeEventListener("afterprint", clearPrintPayment);
    };
  }, []);

  const handleSimulateSepay = async (paymentCode) => {
    try {
      setSimulatingCode(paymentCode);
      setAlert("");
      await apiRequest("/api/payments/sepay/sandbox/simulate", {
        method: "POST",
        body: JSON.stringify({ paymentCode }),
      });
      setAlert("SePay sandbox payment simulated successfully.");
      await fetchPayments();
    } catch (error) {
      setAlert(error.message || "Cannot simulate SePay payment");
    } finally {
      setSimulatingCode("");
    }
  };

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

  const handlePrintReceipt = (payment) => {
    setPrintPayment(payment);
    window.setTimeout(() => {
      window.print();
    }, 0);
  };

  return (
    <AdminLayout
      activeLabel="Payments"
      searchPlaceholder="Search transactions, tickets, plates..."
    >
      <PaymentPrintStyles />
      <PaymentReceiptPrint payment={printPayment} />
      <PageHeader onRefresh={fetchPayments} refreshing={loading} />
      {alert && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 font-['Inter'] text-sm font-semibold text-blue-700">
          {alert}
        </div>
      )}
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
        onSimulateSepay={handleSimulateSepay}
        simulatingCode={simulatingCode}
        onView={setDetailPayment}
        onPrint={handlePrintReceipt}
      />
      <MethodBreakdown payments={payments} />
      <PaymentDetailModal
        payment={detailPayment}
        onClose={() => setDetailPayment(null)}
        onPrint={handlePrintReceipt}
      />
    </AdminLayout>
  );
}
