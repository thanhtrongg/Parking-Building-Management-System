import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../../services/api";

const navItems = [
  ["Studio", "home"],
  ["Building", "building"],
  ["Rules", "rules"],
  ["Pricing", "pricing"],
  ["Available Slots", "available-slots"],
];

const images = {
  hero:
    "https://images.unsplash.com/photo-1566636137426-500b3b61dcaa?auto=format&fit=crop&q=82&w=1800",
  ramp:
    "https://images.unsplash.com/photo-1649307035604-ab3c5e5c9e7a?auto=format&fit=crop&q=82&w=1200",
  gate:
    "https://images.unsplash.com/photo-1571779940810-92aaada97f4d?auto=format&fit=crop&q=82&w=1200",
  entry:
    "https://images.unsplash.com/photo-1761207299530-0181af74a44b?auto=format&fit=crop&q=82&w=1200",
};

const buildingFacts = [
  {
    title: "Public visibility",
    text: "Guests can review capacity, zones, vehicle types, rules, and pricing before login.",
  },
  {
    title: "Operating flow",
    text: "The building supports reservation, vehicle entry, assigned slot, active session, payment, and exit.",
  },
  {
    title: "Slot clarity",
    text: "Available slots and zone capacity are shown from the public parking data endpoint.",
  },
];

const parkingRules = [
  "Reserve a slot before arrival when possible so the system can hold availability.",
  "Use the registered license plate at check-in for faster ticket matching.",
  "Follow the assigned zone and slot shown by staff or by your booking detail.",
  "Night rate may apply based on the active pricing policy for your vehicle type.",
  "Contact staff before leaving a vehicle in maintenance or restricted zones.",
];

const fallbackInfo = {
  summary: {
    totalSlots: 0,
    availableSlots: 0,
    occupiedSlots: 0,
    reservedSlots: 0,
    maintenanceSlots: 0,
    totalZones: 0,
    vehicleTypes: 0,
  },
  zones: [],
  pricingPolicies: [],
  availableSlots: [],
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d7b46a]";

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined) return "Not set";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function ArrowGlyph() {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center transition duration-300 group-hover:translate-x-0.5">
      <span className="h-2 w-2 rotate-45 border-r-2 border-t-2 border-current" />
    </span>
  );
}

function PrimaryButton({ children, to, onClick }) {
  const className = `group inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#d7b46a] px-5 text-sm font-semibold text-[#11100d] transition duration-300 hover:bg-[#e7c77f] active:scale-[0.98] ${focusRing}`;

  if (to) {
    return (
      <Link to={to} className={className}>
        {children}
        <ArrowGlyph />
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
      <ArrowGlyph />
    </button>
  );
}

function GhostButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-11 items-center justify-center whitespace-nowrap rounded-lg bg-white/[0.055] px-5 text-sm font-medium text-[#f7efe0] ring-1 ring-white/12 transition duration-300 hover:bg-white/[0.09] active:scale-[0.98] ${focusRing}`}
    >
      {children}
    </button>
  );
}

function ImageShell({ src, alt, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white/[0.035] p-1 ring-1 ring-white/10 ${className}`}
    >
      <div className="relative h-full overflow-hidden rounded-[calc(1rem-0.25rem)] bg-[#15130f]">
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover opacity-88 saturate-[0.82] transition duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,5,0.06),rgba(6,6,5,0.78))]" />
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, description }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d7b46a]">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-bold leading-[1.05] tracking-[-0.025em] text-[#fbf4e7] text-balance md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 max-w-[42rem] text-base leading-7 text-[#c7beae]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function PublicHeader({ menuOpen, setMenuOpen, theme, onToggleTheme }) {
  const isLight = theme === "light";

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#070705]/86 px-4 py-3 backdrop-blur-xl md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <button
          type="button"
          onClick={() => scrollToSection("home")}
          className={`group flex items-center gap-3 rounded-lg py-1 ${focusRing}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d7b46a] text-sm font-black text-[#11100d] transition duration-300 group-hover:bg-[#e7c77f]">
            P
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold tracking-[0.12em] text-[#fbf4e7]">
              PARKMASTER
            </span>
            <span className="block text-[10px] tracking-[0.22em] text-[#d7b46a]/80">
              BUILDING SYSTEM
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, id]) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToSection(id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium text-[#bbb4a6] transition duration-300 hover:bg-white/[0.07] hover:text-[#f7efe0] ${focusRing}`}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
            className={`landing-theme-toggle inline-flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.055] text-[#f7efe0] ring-1 ring-white/10 transition duration-300 hover:bg-white/[0.09] ${focusRing}`}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              {isLight ? "dark_mode" : "light_mode"}
            </span>
          </button>
          <Link
            to="/login"
            className={`rounded-lg px-4 py-2.5 text-xs font-medium text-[#ddd4c4] transition duration-300 hover:bg-white/[0.07] hover:text-white ${focusRing}`}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={`rounded-lg bg-[#f7efe0] px-4 py-2.5 text-xs font-semibold text-[#11100d] transition duration-300 hover:bg-[#d7b46a] active:scale-[0.98] ${focusRing}`}
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className={`relative flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10 transition duration-300 md:hidden ${focusRing}`}
          aria-label="Open navigation"
          aria-expanded={menuOpen}
        >
          <span
            className={`absolute h-px w-5 bg-[#f7efe0] transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              menuOpen ? "translate-y-0 rotate-45" : "-translate-y-1.5"
            }`}
          />
          <span
            className={`absolute h-px w-5 bg-[#f7efe0] transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              menuOpen ? "translate-y-0 -rotate-45" : "translate-y-1.5"
            }`}
          />
        </button>
      </div>

      <div
        className={`fixed inset-0 -z-10 bg-[#070705]/92 px-6 pt-28 backdrop-blur-3xl transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          menuOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-6 opacity-0"
        }`}
      >
        <nav className="mx-auto flex max-w-sm flex-col gap-3">
          {navItems.map(([label, id], index) => (
            <button
              key={label}
              type="button"
              onClick={() => {
                setMenuOpen(false);
                scrollToSection(id);
              }}
              className={`rounded-xl bg-white/[0.055] px-5 py-4 text-left text-xl font-semibold text-[#f7efe0] ring-1 ring-white/10 transition duration-300 ${
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              } ${index === 1 ? "delay-100" : ""} ${
                index === 2 ? "delay-150" : ""
              } ${index === 3 ? "delay-200" : ""}`}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={onToggleTheme}
            className={`landing-theme-toggle mt-3 flex items-center justify-center gap-2 rounded-xl bg-white/[0.055] px-5 py-4 text-sm font-semibold text-[#f7efe0] ring-1 ring-white/10 transition duration-300 ${
              menuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
            }`}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              {isLight ? "dark_mode" : "light_mode"}
            </span>
            {isLight ? "Dark mode" : "Light mode"}
          </button>
          <Link
            to="/signup"
            className="mt-3 rounded-lg bg-[#d7b46a] px-5 py-3 text-center text-sm font-semibold text-[#11100d]"
          >
            Explore System
          </Link>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-4 pb-16 pt-28 md:px-8 md:pb-24 md:pt-32"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative z-10">
          <p className="max-w-max rounded-md bg-white/[0.055] px-3 py-2 text-[10px] font-semibold tracking-[0.18em] text-[#d7b46a] ring-1 ring-white/10">
            PARKING BUILDING MANAGEMENT
          </p>
          <h1 className="mt-7 max-w-3xl text-[clamp(3rem,7vw,5.8rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#fbf4e7] text-balance">
            Smart parking for real building operations.
          </h1>
          <p className="mt-6 max-w-[40rem] text-base leading-7 text-[#c7beae] md:text-lg">
            Guests can check building capacity, rules, slot context, and pricing
            before signing in to reserve.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <PrimaryButton to="/signup">Explore System</PrimaryButton>
            <GhostButton onClick={() => scrollToSection("building")}>
              View Guest Info
            </GhostButton>
          </div>
        </div>

        <div className="relative min-h-[28rem] md:min-h-[34rem]">
          <ImageShell
            src={images.hero}
            alt="Cinematic underground parking garage with linear lighting"
            className="group absolute right-0 top-3 h-[24rem] w-[86%] md:h-[32rem] lg:w-[78%]"
          />
          <ImageShell
            src={images.ramp}
            alt="Urban parking building ramp at night"
            className="group absolute bottom-0 left-0 h-48 w-[50%] md:h-60"
          />
          <div className="absolute bottom-10 right-3 w-56 rounded-2xl bg-[#090907]/90 p-5 ring-1 ring-white/12 md:right-10 md:w-64">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-[#d7b46a]">
                PUBLIC BUILDING LOGIC
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-3xl font-semibold text-[#fbf4e7] tabular-nums">
                    24/7
                  </p>
                  <p className="mt-1 text-xs text-[#958b7b]">access flow</p>
                </div>
                <div>
                  <p className="font-mono text-3xl font-semibold text-[#fbf4e7] tabular-nums">
                    03
                  </p>
                  <p className="mt-1 text-xs text-[#958b7b]">guest checks</p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicInfoState({ status }) {
  if (status === "ready") return null;

  const message =
    status === "loading"
      ? "Loading public building information."
      : "Public building data is temporarily unavailable. Static guidance remains available.";

  return (
    <section className="px-4 pt-8 md:px-8" aria-live="polite">
      <div className="mx-auto max-w-7xl rounded-[1.5rem] bg-white/[0.045] p-1.5 ring-1 ring-white/10">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-[#11100c] px-5 py-4 text-sm font-medium text-[#d7b46a] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          {message}
        </div>
      </div>
    </section>
  );
}

function BuildingInfoSection({ info }) {
  const summary = info.summary || fallbackInfo.summary;
  const stats = [
    ["Total slots", summary.totalSlots],
    ["Available now", summary.availableSlots],
    ["Parking zones", summary.totalZones],
    ["Vehicle types", summary.vehicleTypes],
  ];

  return (
    <section id="building" className="scroll-mt-28 px-4 py-20 md:px-8 md:py-32">
      <div className="landing-building-shell mx-auto max-w-7xl rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10">
        <div className="landing-building-panel relative overflow-hidden rounded-[calc(1rem-0.25rem)] bg-[#100f0b]">
          <img
            src={images.ramp}
            alt="Parking building ramp with architectural night lighting"
            className="landing-building-image absolute inset-0 h-full w-full object-cover opacity-32 saturate-[0.78]"
          />
          <div className="landing-building-overlay absolute inset-0 bg-[radial-gradient(circle_at_76%_14%,rgba(215,180,106,0.22),transparent_30%),linear-gradient(90deg,rgba(7,7,5,0.96),rgba(7,7,5,0.76)_46%,rgba(7,7,5,0.42))]" />

          <div className="relative grid gap-10 p-6 md:p-10 lg:grid-cols-[0.85fr_1.15fr] lg:p-12">
            <div className="flex min-h-[32rem] flex-col justify-between">
              <SectionIntro
                eyebrow="Guest building check"
                title="Know the building before you arrive."
                description="Public capacity and zone details help guests decide when to reserve and which vehicle flow to expect."
              />

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {stats.map(([label, value]) => (
                  <article
                    key={label}
                    className="landing-building-stat rounded-[1.4rem] bg-[#080806]/68 p-5 ring-1 ring-white/10 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-[#14110c]/78 hover:ring-[#d7b46a]/35"
                  >
                    <p className="font-mono text-4xl font-semibold tracking-[-0.04em] text-[#fbf4e7] tabular-nums">
                      {value}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-[#d7b46a]/80">
                      {label.toUpperCase()}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="grid content-end gap-4 lg:pl-12">
              {buildingFacts.map((fact, index) => (
                <article
                  key={fact.title}
                  className="landing-building-fact group grid gap-5 rounded-[1.75rem] bg-white/[0.055] p-1.5 ring-1 ring-white/10 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:translate-x-1 hover:ring-[#d7b46a]/35 sm:grid-cols-[4rem_1fr]"
                >
                  <div className="flex items-center justify-center rounded-[calc(1.75rem-0.375rem)] bg-[#d7b46a] font-mono text-sm font-semibold text-[#11100d]">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div className="landing-building-fact-body rounded-[calc(1.75rem-0.375rem)] bg-[#0c0b08]/78 p-5">
                    <h3 className="text-xl font-semibold tracking-[-0.02em] text-[#fbf4e7]">
                      {fact.title}
                    </h3>
                    <p className="mt-2 max-w-[34rem] text-sm leading-7 text-[#b9af9d]">
                      {fact.text}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RulesSection() {
  return (
    <section id="rules" className="scroll-mt-28 px-4 py-20 md:px-8 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div className="lg:sticky lg:top-32">
          <SectionIntro
            eyebrow="Parking rules"
            title="Clear rules for a quiet arrival."
            description="A short guest checklist for booking, check-in, assigned parking, overnight pricing, and restricted zones."
          />
          <ImageShell
            src={images.gate}
            alt="Parking gate with illuminated barrier and controlled entry"
            className="group mt-10 hidden h-[24rem] md:block"
          />
        </div>

        <div className="rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10">
          <div className="relative overflow-hidden rounded-[calc(1rem-0.25rem)] bg-[#11100c] p-5 md:p-8">
            <div className="relative">
              {parkingRules.map((rule, index) => (
                <article
                  key={rule}
                  className="group relative grid gap-5 border-b border-white/10 py-7 last:border-b-0 md:grid-cols-[7rem_1fr]"
                >
                  <div className="flex items-start gap-4">
                    <span className="font-mono text-sm font-semibold tracking-[0.16em] text-[#d7b46a]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="mt-1 hidden h-px w-10 bg-[#d7b46a]/50 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:w-16 md:block" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold tracking-[-0.025em] text-[#fbf4e7]">
                      {
                        [
                          "Reserve before arrival",
                          "Use the registered plate",
                          "Follow the assigned zone",
                          "Check night rate rules",
                          "Ask before restricted parking",
                        ][index]
                      }
                    </h3>
                    <p className="mt-3 max-w-[42rem] text-base leading-8 text-[#b9af9d]">
                      {rule}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:hidden">
          <ImageShell
            src={images.gate}
            alt="Parking gate with illuminated barrier and controlled entry"
            className="group h-[22rem]"
          />
        </div>
      </div>
    </section>
  );
}

function PricingSection({ policies }) {
  return (
    <section id="pricing" className="scroll-mt-28 px-4 py-24 md:px-8 md:py-36">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Public pricing"
          title="Fees guests can check before booking."
        />

        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {policies.length ? (
            policies.slice(0, 6).map((policy) => (
              <article
                key={policy.id}
                className="group rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10 transition duration-300 hover:-translate-y-0.5 hover:ring-[#d7b46a]/30"
              >
                <div className="flex min-h-72 flex-col rounded-[calc(1rem-0.25rem)] bg-[#11100c] p-6">
                  <p className="text-xs font-medium tracking-[0.22em] text-[#d7b46a]">
                    {(policy.vehicleTypeName || "All vehicles").toUpperCase()}
                  </p>
                  <h3 className="mt-6 font-mono text-4xl font-semibold tracking-[-0.04em] text-[#fbf4e7] tabular-nums">
                    {formatCurrency(policy.basePrice)}
                  </h3>

                  <div className="mt-auto space-y-4 pt-10 text-sm text-[#b9af9d]">
                    <p className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                      <span>Hourly rate</span>
                      <strong className="font-mono font-semibold text-[#fbf4e7]">
                        {formatCurrency(policy.hourlyRate)}
                      </strong>
                    </p>
                    <p className="flex items-center justify-between gap-4 border-t border-white/10 pt-4">
                      <span>Night rate</span>
                      <strong className="font-mono font-semibold text-[#fbf4e7]">
                        {formatCurrency(policy.nightRate)}
                      </strong>
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <article className="rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10 lg:col-span-3">
              <div className="rounded-[calc(1rem-0.25rem)] bg-[#11100c] p-8 text-[#c7beae]">
                Pricing data is not available from the public API yet.
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

function AvailableSlotsSection({ info, selectedVehicleType, setSelectedVehicleType }) {
  const zones = info.zones || [];
  const availableSlots = info.availableSlots || [];
  const vehicleTypes = Array.from(
    new Set(
      [...zones, ...availableSlots]
        .map((item) => item.vehicleTypeName)
        .filter(Boolean),
    ),
  );
  const filteredZones =
    selectedVehicleType === "all"
      ? zones
      : zones.filter((zone) => zone.vehicleTypeName === selectedVehicleType);
  const filteredSlots =
    selectedVehicleType === "all"
      ? availableSlots
      : availableSlots.filter(
          (slot) => slot.vehicleTypeName === selectedVehicleType,
        );
  const totalCapacity = filteredZones.reduce(
    (total, zone) => total + Number(zone.totalCapacity || 0),
    0,
  );
  const totalAvailable = filteredZones.reduce(
    (total, zone) => total + Number(zone.availableSlots || 0),
    0,
  );

  return (
    <section
      id="available-slots"
      className="scroll-mt-28 px-4 py-24 md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10">
          <div className="landing-slots-panel relative overflow-hidden rounded-[calc(1rem-0.25rem)] bg-[#100f0b] p-6 md:p-10 lg:p-12">
            <img
              src={images.entry}
              alt="Car entering a parking garage at night"
              className="landing-slots-image absolute inset-0 h-full w-full object-cover opacity-18 saturate-[0.72]"
            />
            <div className="landing-slots-overlay absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,rgba(215,180,106,0.2),transparent_30%),linear-gradient(90deg,rgba(7,7,5,0.96),rgba(7,7,5,0.82)_48%,rgba(7,7,5,0.62))]" />

            <div className="relative grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
              <div>
                <SectionIntro
                  eyebrow="Available slots"
                  title="Choose vehicle type, then check openings."
                  description="Guests can filter by vehicle type and preview live zone capacity before creating a reservation."
                />

                <div className="mt-8 rounded-[1.75rem] bg-[#070705]/70 p-1.5 ring-1 ring-white/10">
                  <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleType("all")}
                      className={`rounded-lg px-4 py-3 text-xs font-semibold transition duration-300 ${
                        selectedVehicleType === "all"
                          ? "bg-[#d7b46a] text-[#11100d]"
                          : "bg-white/[0.055] text-[#c7beae] hover:bg-white/[0.09] hover:text-[#fbf4e7]"
                      } ${focusRing}`}
                    >
                      All vehicles
                    </button>
                    {vehicleTypes.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setSelectedVehicleType(type)}
                        className={`rounded-lg px-4 py-3 text-xs font-semibold transition duration-300 ${
                          selectedVehicleType === type
                            ? "bg-[#d7b46a] text-[#11100d]"
                            : "bg-white/[0.055] text-[#c7beae] hover:bg-white/[0.09] hover:text-[#fbf4e7]"
                        } ${focusRing}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  <article className="rounded-[1.35rem] bg-[#070705]/72 p-5 ring-1 ring-white/10">
                    <p className="font-mono text-4xl font-semibold tracking-[-0.04em] text-[#fbf4e7] tabular-nums">
                      {totalAvailable}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-[#d7b46a]/80">
                      AVAILABLE NOW
                    </p>
                  </article>
                  <article className="rounded-[1.35rem] bg-[#070705]/72 p-5 ring-1 ring-white/10">
                    <p className="font-mono text-4xl font-semibold tracking-[-0.04em] text-[#fbf4e7] tabular-nums">
                      {totalCapacity}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold tracking-[0.2em] text-[#d7b46a]/80">
                      FILTERED CAPACITY
                    </p>
                  </article>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredZones.length ? (
                  filteredZones.slice(0, 6).map((zone) => (
                    <article
                      key={zone.id}
                      className="rounded-[1.5rem] bg-white/[0.055] p-1.5 ring-1 ring-white/10 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:ring-[#d7b46a]/30"
                    >
                      <div className="flex min-h-52 flex-col rounded-[calc(1.5rem-0.375rem)] bg-[#0b0a07]/82 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                        <div className="flex items-start justify-between gap-4">
                          <p className="max-w-[10rem] text-[10px] font-semibold tracking-[0.22em] text-[#d7b46a]/80">
                            {(zone.vehicleTypeName || "GENERAL").toUpperCase()}
                          </p>
                          <p className="font-mono text-2xl font-semibold text-[#fbf4e7] tabular-nums">
                            {zone.availableSlots}/{zone.totalCapacity}
                          </p>
                        </div>
                        <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-[-0.025em] text-[#fbf4e7]">
                          {zone.zoneName}
                        </h3>
                        <p className="mt-auto pt-6 text-sm leading-7 text-[#b9af9d]">
                          {zone.availableSlots} available from {zone.slotCount}{" "}
                          configured slots.
                        </p>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="rounded-[1.5rem] bg-white/[0.055] p-1.5 ring-1 ring-white/10 sm:col-span-2 xl:col-span-3">
                    <div className="rounded-[calc(1.5rem-0.375rem)] bg-[#0b0a07]/82 p-6 text-[#c7beae]">
                      No zone is available for this vehicle type right now.
                    </div>
                  </article>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10">
          <div className="relative overflow-hidden rounded-[calc(1rem-0.25rem)] bg-[#11100c] p-5 md:p-8">
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-serif text-xl italic leading-[1.2] text-[#d7b46a]">
                  Open slot preview
                </p>
                <h3 className="mt-2 text-3xl font-semibold leading-tight tracking-[-0.03em] text-[#fbf4e7]">
                  {selectedVehicleType === "all"
                    ? "All visible openings."
                    : `${selectedVehicleType} openings.`}
                </h3>
              </div>
              <PrimaryButton to="/signup">Reserve after signup</PrimaryButton>
            </div>

            <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
              {filteredSlots.length ? (
                filteredSlots.slice(0, 18).map((slot) => (
                  <article
                    key={slot.id}
                    className="rounded-[1.2rem] bg-[#070705]/72 p-4 ring-1 ring-white/10 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:ring-[#d7b46a]/35"
                  >
                    <p className="font-mono text-lg font-semibold text-[#fbf4e7]">
                      {slot.slotName}
                    </p>
                    <p className="mt-2 text-[10px] font-semibold tracking-[0.18em] text-[#d7b46a]/80">
                      {(slot.zoneName || "NO ZONE").toUpperCase()}
                    </p>
                    <p className="mt-2 text-sm text-[#9b917f]">
                      {slot.vehicleTypeName || "General"}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-[#c7beae] sm:col-span-2 lg:col-span-4 xl:col-span-6">
                  No available slot preview for this vehicle type at the moment.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCtaSection() {
  return (
    <section className="px-4 py-24 md:px-8 md:pb-36 md:pt-28">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white/[0.04] p-1 ring-1 ring-white/10">
        <div className="landing-cta-panel relative overflow-hidden rounded-[calc(1rem-0.25rem)] bg-[#100f0b] px-6 py-16 md:px-10 md:py-20">
          <img
            src={images.hero}
            alt="Parking building interior with cinematic directional lighting"
            className="landing-cta-image absolute inset-0 h-full w-full object-cover opacity-22 saturate-[0.75]"
          />
          <div className="landing-cta-overlay absolute inset-0 bg-[radial-gradient(circle_at_24%_8%,rgba(215,180,106,0.22),transparent_34%),linear-gradient(90deg,rgba(6,6,5,0.92),rgba(6,6,5,0.55))]" />
          <div className="relative max-w-4xl">
            <SectionIntro
              eyebrow="Entry to payment"
              title="Manage every parking interaction from arrival to exit."
              description="A refined control layer for buildings where reservations, sessions, slots, and payments need to move as one."
            />
            <div className="mt-9">
              <PrimaryButton to="/signup">Enter the System</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="px-4 pb-10 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 border-t border-white/10 pt-8 text-sm text-[#8f8678] md:flex-row md:items-center md:justify-between">
        <p>ParkMaster Building System</p>
        <nav className="flex flex-wrap gap-5">
          {navItems.slice(1).map(([label, id]) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToSection(id)}
              className={`transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#d7b46a] ${focusRing}`}
            >
              {label}
            </button>
          ))}
          <Link
            to="/login"
            className={`transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-[#d7b46a] ${focusRing}`}
          >
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default function PublicLandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("publicTheme") || "dark";
    } catch {
      return "dark";
    }
  });
  const [publicInfo, setPublicInfo] = useState(fallbackInfo);
  const [status, setStatus] = useState("loading");
  const [selectedVehicleType, setSelectedVehicleType] = useState("all");
  const isLight = theme === "light";

  const handleToggleTheme = () => {
    setTheme((current) => {
      const nextTheme = current === "light" ? "dark" : "light";
      localStorage.setItem("publicTheme", nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("landing-light", isLight);
    document.documentElement.classList.toggle("landing-dark", !isLight);

    return () => {
      document.documentElement.classList.remove("landing-light", "landing-dark");
    };
  }, [isLight]);

  useEffect(() => {
    let isMounted = true;

    apiRequest("/api/public/landing-info")
      .then((result) => {
        if (!isMounted) return;
        setPublicInfo(result.data || fallbackInfo);
        setStatus("ready");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("error");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const normalizedInfo = useMemo(
    () => ({
      ...fallbackInfo,
      ...publicInfo,
      summary: {
        ...fallbackInfo.summary,
        ...(publicInfo.summary || {}),
      },
    }),
    [publicInfo],
  );

  return (
    <div
      className={[
        "min-h-[100dvh] scroll-smooth bg-[#070705] font-['Satoshi','Plus_Jakarta_Sans',system-ui,sans-serif] text-[#fbf4e7] [font-variant-numeric:tabular-nums]",
        isLight ? "landing-light" : "landing-dark",
      ].join(" ")}
    >
      <style>
        {`
          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(3rem);
              filter: blur(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }
        `}
      </style>

      <a
        href="#building"
        className="fixed left-4 top-4 z-50 -translate-y-20 rounded-full bg-[#d7b46a] px-5 py-3 text-sm font-semibold text-[#11100d] transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] focus:translate-y-0"
      >
        Skip to content
      </a>

      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.035] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:24px_24px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.055),transparent_24%,transparent_72%,rgba(215,180,106,0.045))]" />

      <PublicHeader
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="relative z-10">
        <HeroSection />
        <PublicInfoState status={status} />
        <BuildingInfoSection info={normalizedInfo} />
        <RulesSection />
        <PricingSection policies={normalizedInfo.pricingPolicies || []} />
        <AvailableSlotsSection
          info={normalizedInfo}
          selectedVehicleType={selectedVehicleType}
          setSelectedVehicleType={setSelectedVehicleType}
        />
        <FinalCtaSection />
      </main>

      <PublicFooter />
    </div>
  );
}
