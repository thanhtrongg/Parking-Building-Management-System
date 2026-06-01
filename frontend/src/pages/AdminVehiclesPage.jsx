import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { apiRequest } from "../services/api";

const vehicleThemeMap = {
  "Ô tô": {
    gradient: "from-blue-600 via-indigo-600 to-sky-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-100",
  },
  "Xe máy": {
    gradient: "from-orange-500 via-amber-500 to-yellow-400",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-100",
  },
  "Xe đạp": {
    gradient: "from-emerald-500 via-green-500 to-lime-400",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
  },
  "Xe điện": {
    gradient: "from-cyan-500 via-blue-500 to-violet-500",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-100",
  },
  "Xe tải nhỏ": {
    gradient: "from-slate-700 via-gray-700 to-zinc-500",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

function getVehicleTheme(typeName = "") {
  return (
    vehicleThemeMap[typeName] || {
      gradient: "from-slate-700 via-blue-800 to-cyan-500",
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-200",
    }
  );
}

function CarSvg() {
  return (
    <svg viewBox="0 0 96 96" className="h-16 w-16 text-white" fill="none">
      <path
        d="M20 51L27 33C29 28 33 25 39 25H57C63 25 67 28 69 33L76 51"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M20 51H76C80 51 84 55 84 59V68C84 71 81 74 78 74H73C70 74 68 72 68 69V67H28V69C28 72 26 74 23 74H18C15 74 12 71 12 68V59C12 55 16 51 20 51Z"
        fill="currentColor"
        opacity="0.95"
      />
      <circle cx="28" cy="64" r="5" fill="#0f172a" opacity="0.45" />
      <circle cx="68" cy="64" r="5" fill="#0f172a" opacity="0.45" />
      <path
        d="M31 37H65"
        stroke="#ffffff"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

function MotorbikeSvg() {
  return (
    <svg viewBox="0 0 96 96" className="h-16 w-16 text-white" fill="none">
      <circle cx="25" cy="66" r="12" stroke="currentColor" strokeWidth="6" />
      <circle cx="70" cy="66" r="12" stroke="currentColor" strokeWidth="6" />
      <path
        d="M25 66L39 45H53L70 66M39 45L48 66M53 45L62 36H73"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M43 37H55"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M35 34H48"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
}

function BicycleSvg() {
  return (
    <svg viewBox="0 0 96 96" className="h-16 w-16 text-white" fill="none">
      <circle cx="25" cy="67" r="13" stroke="currentColor" strokeWidth="6" />
      <circle cx="71" cy="67" r="13" stroke="currentColor" strokeWidth="6" />
      <path
        d="M25 67L42 45L52 67H25ZM42 45H59L71 67M42 45L38 34M35 34H47"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M59 45L64 35H73"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ElectricSvg() {
  return (
    <svg viewBox="0 0 96 96" className="h-16 w-16 text-white" fill="none">
      <rect
        x="20"
        y="20"
        width="44"
        height="56"
        rx="10"
        stroke="currentColor"
        strokeWidth="6"
      />
      <path
        d="M50 10H67C72 10 76 14 76 19V53C76 58 80 62 85 62"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M44 33L34 51H45L39 65L55 43H44L50 33Z" fill="currentColor" />
      <path
        d="M76 23H84"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TruckSvg() {
  return (
    <svg viewBox="0 0 96 96" className="h-16 w-16 text-white" fill="none">
      <path
        d="M12 34C12 30 15 27 19 27H56V68H12V34Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M56 42H71L84 55V68H56V42Z" fill="currentColor" opacity="0.8" />
      <path d="M65 48H71L78 55H65V48Z" fill="#ffffff" opacity="0.65" />
      <circle cx="30" cy="70" r="7" fill="#0f172a" opacity="0.45" />
      <circle cx="70" cy="70" r="7" fill="#0f172a" opacity="0.45" />
    </svg>
  );
}

function VehicleSvg({ typeName }) {
  if (typeName === "Ô tô") return <CarSvg />;
  if (typeName === "Xe máy") return <MotorbikeSvg />;
  if (typeName === "Xe đạp") return <BicycleSvg />;
  if (typeName === "Xe điện") return <ElectricSvg />;
  if (typeName === "Xe tải nhỏ") return <TruckSvg />;
  return <CarSvg />;
}

function PageHeader() {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <h2 className="font-['Geist'] text-3xl font-semibold text-[#191b23]">
          Vehicle Type Management
        </h2>
        <p className="mt-2 max-w-2xl font-['Inter'] text-sm text-[#6b7280]">
          Manage supported vehicle types for parking zones, pricing policies,
          reservations, and parking sessions.
        </p>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, icon, iconWrapClass, iconClass }) {
  return (
    <div className="rounded-2xl border border-[#d7d9e4] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
            {title}
          </p>
          <h3 className="mt-2 font-['Geist'] text-3xl font-bold text-[#191b23]">
            {value}
          </h3>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconWrapClass}`}
        >
          <span className={`material-symbols-outlined ${iconClass}`}>
            {icon}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ totalVehicleTypes }) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      <SummaryCard
        title="Vehicle Types"
        value={totalVehicleTypes}
        icon="category"
        iconWrapClass="bg-blue-50"
        iconClass="text-blue-600"
      />
      <SummaryCard
        title="Active Types"
        value={totalVehicleTypes}
        icon="verified"
        iconWrapClass="bg-green-50"
        iconClass="text-green-600"
      />
      <SummaryCard
        title="Need Review"
        value="0"
        icon="rule"
        iconWrapClass="bg-amber-50"
        iconClass="text-amber-600"
      />
    </div>
  );
}

function Toolbar({ keyword, setKeyword, total }) {
  return (
    <div className="mb-6 rounded-2xl border border-[#d7d9e4] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
            search
          </span>
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search vehicle type or description..."
            className="h-11 w-full rounded-xl border border-[#d7d9e4] bg-[#f8f9fc] pl-11 pr-4 font-['Inter'] text-sm outline-none transition focus:border-[#2563eb] focus:bg-white"
          />
        </div>

        <div className="flex items-center justify-between gap-3 lg:justify-end">
          <span className="font-['Inter'] text-sm text-[#6b7280]">
            Showing{" "}
            <span className="font-semibold text-[#191b23]">{total}</span> types
          </span>

          <button className="rounded-xl border border-[#d7d9e4] bg-white px-4 py-2.5 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]">
            Export
          </button>
        </div>
      </div>
    </div>
  );
}

function VehicleTypeCard({ vehicleType }) {
  const theme = getVehicleTheme(vehicleType.typeName);

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#d7d9e4] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`relative h-36 bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_35%)]" />
        <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-black/10" />

        <div className="relative flex h-full items-center justify-center">
          <VehicleSvg typeName={vehicleType.typeName} />
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-['Geist'] text-lg font-semibold text-[#191b23]">
              {vehicleType.typeName}
            </h3>
            <p className="mt-1 font-['Inter'] text-sm text-[#6b7280]">
              {vehicleType.description || "No description"}
            </p>
          </div>

          <span
            className={`rounded-full border px-3 py-1 font-['Geist'] text-[11px] font-semibold ${theme.bg} ${theme.text} ${theme.border}`}
          >
            Active
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-[#f8f9fc] p-3">
            <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
              Category
            </p>
            <p className="mt-1 font-['Inter'] text-sm font-medium text-[#191b23]">
              Vehicle Type
            </p>
          </div>

          <div className="rounded-xl bg-[#f8f9fc] p-3">
            <p className="font-['Geist'] text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">
              Status
            </p>
            <p className="mt-1 font-['Inter'] text-sm font-medium text-green-700">
              Enabled
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#eceef5] pt-4">
          <button className="inline-flex items-center gap-2 rounded-xl border border-[#d7d9e4] px-3 py-2 font-['Inter'] text-sm font-medium text-[#374151] transition hover:bg-[#f8f9fc]">
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
            View
          </button>

          <div className="flex items-center gap-1">
            <button className="rounded-lg p-2 text-[#6b7280] transition hover:bg-[#f3f4f8]">
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button className="rounded-lg p-2 text-red-500 transition hover:bg-red-50">
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function VehicleTypeGrid({ vehicleTypes, loading, error }) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center font-['Inter'] text-sm text-[#6b7280] shadow-sm">
        Loading vehicle types...
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

  if (vehicleTypes.length === 0) {
    return (
      <div className="rounded-2xl border border-[#d7d9e4] bg-white p-10 text-center font-['Inter'] text-sm text-[#6b7280] shadow-sm">
        No vehicle types found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {vehicleTypes.map((vehicleType) => (
        <VehicleTypeCard key={vehicleType.id} vehicleType={vehicleType} />
      ))}
    </div>
  );
}

export default function AdminVehiclesPage() {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest("/api/vehicle-types");
        setVehicleTypes(result.data || []);
      } catch (error) {
        setError(error.message || "Cannot load vehicle types");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicleTypes();
  }, []);

  const filteredVehicleTypes = useMemo(() => {
    return vehicleTypes.filter((type) => {
      const searchText =
        `${type.typeName || ""} ${type.description || ""}`.toLowerCase();
      return searchText.includes(keyword.toLowerCase());
    });
  }, [vehicleTypes, keyword]);

  const headerAction = (
    <button className="flex items-center gap-2 rounded-xl bg-[#2563eb] px-5 py-2.5 font-['Inter'] text-sm font-medium text-white shadow-md shadow-blue-900/20 transition hover:brightness-110 active:scale-95">
      <span className="material-symbols-outlined text-xl">add</span>
      Add Vehicle Type
    </button>
  );

  return (
    <AdminLayout
      activeLabel="Vehicles"
      headerAction={headerAction}
      searchPlaceholder="Search vehicle types..."
    >
      <PageHeader />
      <StatsGrid totalVehicleTypes={vehicleTypes.length} />

      <Toolbar
        keyword={keyword}
        setKeyword={setKeyword}
        total={filteredVehicleTypes.length}
      />

      <VehicleTypeGrid
        vehicleTypes={filteredVehicleTypes}
        loading={loading}
        error={error}
      />
    </AdminLayout>
  );
}
