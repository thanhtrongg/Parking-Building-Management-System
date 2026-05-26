import AdminLayout from "../components/AdminLayout";

const overviewCards = [
  {
    label: "Total Revenue (All Methods)",
    value: "142.500.000 ₫",
    icon: "payments",
    iconClass: "bg-[#dbe1ff] text-[#004ac6]",
    badge: "+12.5%",
    badgeClass: "text-green-600",
    badgeIcon: "trending_up",
  },
  {
    label: "Pending Payments",
    value: "12.430.500 ₫",
    icon: "pending_actions",
    iconClass: "bg-orange-50 text-[#943700]",
    badge: "84 Invoices",
    badgeClass: "text-[#943700]",
  },
  {
    label: "Successful Trans. (All Methods)",
    value: "2,842",
    icon: "check_circle",
    iconClass: "bg-green-100 text-green-700",
    badge: "Today: 124",
    badgeClass: "text-[#434655]",
  },
  {
    label: "Refunds",
    value: "840.000 ₫",
    icon: "restart_alt",
    iconClass: "bg-red-50 text-[#ba1a1a]",
    badge: "-2.4%",
    badgeClass: "text-[#ba1a1a]",
  },
];

const transactions = [
  {
    id: "#TRX-94821",
    initials: "JD",
    avatarClass: "bg-[#dbe1ff] text-[#00174b]",
    user: "Johnathan Doe",
    tenant: "Building A - Slot 22",
    date: "Oct 24, 2023, 14:32",
    amount: "3.125.000 ₫",
    method: "Visa •••• 4242",
    methodIcon: "credit_card",
    methodIconClass: "text-[#004ac6]",
    status: "Paid",
  },
  {
    id: "#TRX-94822",
    initials: "MS",
    avatarClass: "bg-[#ffdbcd] text-[#7d2d00]",
    user: "Maria Santos",
    tenant: "Building B - Slot 08",
    date: "Oct 24, 2023, 13:15",
    amount: "11.250.000 ₫",
    method: "Mastercard •••• 8812",
    methodIcon: "payment",
    methodIconClass: "text-red-600",
    status: "Pending",
  },
  {
    id: "#TRX-94823",
    initials: "BK",
    avatarClass: "bg-[#dae2fd] text-[#131b2e]",
    user: "Billie K.",
    tenant: "Visitor Pass - Daily",
    date: "Oct 24, 2023, 11:02",
    amount: "625.000 ₫",
    method: "Apple Pay",
    methodIcon: "account_balance_wallet",
    methodIconClass: "text-blue-400",
    status: "Failed",
  },
  {
    id: "#TRX-94824",
    initials: "RL",
    avatarClass: "bg-[#dbe1ff] text-[#00174b]",
    user: "Robert Long",
    tenant: "Building C - Slot 102",
    date: "Oct 23, 2023, 17:45",
    amount: "2.125.000 ₫",
    method: "Visa •••• 1109",
    methodIcon: "credit_card",
    methodIconClass: "text-[#004ac6]",
    status: "Paid",
  },
  {
    id: "#TRX-94825",
    initials: "SC",
    avatarClass: "bg-orange-100 text-orange-700",
    user: "Sarah Connor",
    tenant: "Building A - Slot 05",
    date: "Oct 23, 2023, 09:12",
    amount: "1.125.000 ₫",
    method: "Cash",
    methodIcon: "payments",
    methodIconClass: "text-green-600",
    status: "Paid",
  },
];

const chartBars = [
  ["Mon", "40%"],
  ["Tue", "65%"],
  ["Wed", "55%"],
  ["Thu", "85%"],
  ["Fri", "95%"],
  ["Sat", "45%"],
  ["Sun", "30%"],
];

function PageHeader() {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 className="mb-1 font-['Geist'] text-2xl font-semibold leading-8 text-[#191b23]">
          Payment Management
        </h2>
        <p className="font-['Inter'] text-sm text-[#434655]">
          Monitor transactions, revenue, and pending invoices across all buildings.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="flex h-11 items-center gap-2 rounded-xl border border-[#c3c6d7] bg-white px-4 font-['Geist'] text-[13px] font-medium text-[#191b23] transition hover:bg-[#ededf9]">
          <span className="material-symbols-outlined text-xl">calendar_today</span>
          This Month
        </button>
        <button className="flex h-11 items-center gap-2 rounded-xl bg-[#004ac6] px-5 font-['Geist'] text-[13px] font-semibold text-white shadow-lg shadow-blue-950/10 transition hover:bg-[#003ea8] active:scale-95">
          <span className="material-symbols-outlined text-xl">download</span>
          Export Data
        </button>
      </div>
    </div>
  );
}

function OverviewCard({ card }) {
  return (
    <div className="flex min-h-44 flex-col justify-between rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${card.iconClass}`}>
          <span className="material-symbols-outlined">{card.icon}</span>
        </div>
        <span
          className={`flex items-center gap-1 font-['Geist'] text-[11px] font-semibold ${card.badgeClass}`}
        >
          {card.badgeIcon && (
            <span className="material-symbols-outlined text-sm">{card.badgeIcon}</span>
          )}
          {card.badge}
        </span>
      </div>

      <div>
        <p className="mb-2 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655]">
          {card.label}
        </p>
        <h3 className="font-['Geist'] text-3xl font-bold leading-9 text-[#191b23]">
          {card.value}
        </h3>
      </div>
    </div>
  );
}

function OverviewGrid() {
  return (
    <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {overviewCards.map((card) => (
        <OverviewCard key={card.label} card={card} />
      ))}
    </div>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-col gap-4 border-b border-[#c3c6d7] bg-[#f3f3fe] p-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex overflow-hidden rounded-lg border border-[#c3c6d7] bg-[#faf8ff] font-['Geist'] text-[13px] font-medium">
          <button className="border-r border-[#c3c6d7] bg-white px-4 py-2 font-semibold text-[#004ac6]">
            All Transactions
          </button>
          <button className="border-r border-[#c3c6d7] px-4 py-2 text-[#434655] transition hover:bg-white">
            Revenue
          </button>
          <button className="px-4 py-2 text-[#434655] transition hover:bg-white">Refunds</button>
        </div>

        <div className="hidden h-8 w-px bg-[#c3c6d7] md:block" />

        <label className="flex items-center gap-2 font-['Geist'] text-[13px] font-medium text-[#434655]">
          Status:
          <select className="rounded-lg border-0 bg-transparent px-2 py-1 font-semibold text-[#004ac6] outline-none focus:ring-0">
            <option>All Status</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-['Geist'] text-[13px] font-medium text-[#434655]">Date Range:</span>
        <button className="flex items-center gap-2 rounded-lg border border-[#c3c6d7] bg-white px-3 py-2 font-['Geist'] text-[13px] text-[#191b23] transition hover:bg-[#faf8ff]">
          Oct 01, 2023
          <span className="material-symbols-outlined text-base">arrow_forward</span>
          Oct 31, 2023
        </button>
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const statusClasses = {
    Paid: "bg-green-100 text-green-700",
    Pending: "bg-amber-100 text-amber-700",
    Failed: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 font-['Geist'] text-[11px] font-bold uppercase tracking-wide ${statusClasses[status]}`}
    >
      {status}
    </span>
  );
}

function TransactionRow({ transaction }) {
  return (
    <tr className="transition hover:bg-[#faf8ff]">
      <td className="px-6 py-4 font-['Geist'] text-[13px] font-bold text-[#004ac6]">
        {transaction.id}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-['Geist'] text-[11px] font-bold ${transaction.avatarClass}`}
          >
            {transaction.initials}
          </div>
          <div>
            <p className="font-['Geist'] text-[13px] font-medium text-[#191b23]">
              {transaction.user}
            </p>
            <p className="font-['Inter'] text-xs font-medium text-[#434655]">
              {transaction.tenant}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-['Inter'] text-sm text-[#434655]">{transaction.date}</td>
      <td className="px-6 py-4 text-right font-['Geist'] text-[13px] font-semibold text-[#191b23]">
        {transaction.amount}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-xl ${transaction.methodIconClass}`}>
            {transaction.methodIcon}
          </span>
          <span className="font-['Inter'] text-sm text-[#191b23]">{transaction.method}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <StatusPill status={transaction.status} />
      </td>
      <td className="px-6 py-4 text-center">
        <button className="rounded-lg p-2 text-[#434655] transition hover:bg-[#ededf9]">
          <span className="material-symbols-outlined text-xl">more_vert</span>
        </button>
      </td>
    </tr>
  );
}

function TransactionsPanel() {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-[#c3c6d7] bg-white shadow-sm">
      <FilterBar />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-left">
          <thead className="bg-white">
            <tr>
              {["Transaction ID", "User / Tenant", "Date", "Amount", "Method", "Status", "Action"].map(
                (heading) => (
                  <th
                    key={heading}
                    className={`px-6 py-4 font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#434655] ${
                      heading === "Amount"
                        ? "text-right"
                        : heading === "Action"
                          ? "text-center"
                          : ""
                    }`}
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e1e2ed]">
            {transactions.map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-[#c3c6d7] bg-white p-6 md:flex-row md:items-center md:justify-between">
        <p className="font-['Geist'] text-[13px] font-medium text-[#434655]">
          Showing 1-10 of 1,248 transactions
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
                  ? "bg-[#004ac6] text-white"
                  : "text-[#434655] transition hover:bg-[#ededf9]"
              }`}
            >
              {page}
            </button>
          ))}
          <span className="px-1 text-[#737686]">...</span>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg font-['Geist'] text-[13px] font-medium text-[#434655] transition hover:bg-[#ededf9]">
            125
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#c3c6d7] text-[#191b23] transition hover:bg-[#ededf9]">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RevenueFlow() {
  return (
    <div className="rounded-xl border border-[#c3c6d7] bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <h3 className="font-['Geist'] text-xl font-semibold text-[#191b23]">Weekly Revenue Flow</h3>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 font-['Geist'] text-[11px] font-medium text-[#434655]">
            <span className="h-3 w-3 rounded-full bg-[#004ac6]" />
            Successful
          </span>
          <span className="flex items-center gap-2 font-['Geist'] text-[11px] font-medium text-[#434655]">
            <span className="h-3 w-3 rounded-full bg-[#943700]" />
            Refunds
          </span>
        </div>
      </div>

      <div className="flex h-40 items-end gap-4 border-b border-[#c3c6d7] px-2">
        {chartBars.map(([day, height]) => (
          <div key={day} className="flex flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-[#b4c5ff]/70 transition hover:bg-[#b4c5ff]"
              style={{ height }}
              title={`${day}: ${height}`}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between px-2 font-['Geist'] text-[11px] font-medium text-[#737686]">
        {chartBars.map(([day]) => (
          <span key={day}>{day}</span>
        ))}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <AdminLayout activeLabel="Payments" searchPlaceholder="Search transactions, receipts...">
      <PageHeader />
      <OverviewGrid />
      <TransactionsPanel />
      <RevenueFlow />
    </AdminLayout>
  );
}
