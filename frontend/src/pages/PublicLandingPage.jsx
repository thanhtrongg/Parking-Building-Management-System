import { Link } from "react-router-dom";

const navItems = [
  ["Home", "#home"],
  ["Features", "#features"],
  ["How It Works", "#how-it-works"],
  ["Pricing", "#pricing"],
  ["Contact", "#contact"],
];

const features = [
  {
    icon: "analytics",
    title: "Real-time availability",
    description:
      "Live tracking of every slot with instant updates across the cloud-based ecosystem.",
  },
  {
    icon: "directions_car",
    title: "Vehicle entry/exit",
    description:
      "Automated plate recognition and gate control for seamless high-speed processing.",
  },
  {
    icon: "calendar_month",
    title: "Online reservation",
    description:
      "Allow users to book slots in advance via mobile or web interfaces for guaranteed access.",
  },
  {
    icon: "payments",
    title: "Payment tracking",
    description:
      "Integrated financial core managing diverse payment methods and subscription billing.",
  },
  {
    icon: "warning",
    title: "Incident reporting",
    description:
      "Direct channel for reporting damages, security issues, or technical malfunctions.",
  },
  {
    icon: "dashboard",
    title: "Revenue dashboard",
    description:
      "Real-time financial analytics with breakdown by time, zone, and vehicle type.",
  },
];

const steps = [
  {
    title: "Check availability",
    description:
      "View real-time map of open spots via the mobile app or entrance displays before you even arrive.",
  },
  {
    title: "Reserve/Enter",
    description:
      "Secure your spot with one tap or drive in using automated plate recognition for zero-touch entry.",
  },
  {
    title: "Pay & Exit",
    description:
      "Payments are processed automatically based on duration. Exit gates open as soon as the transaction clears.",
  },
];

const roles = [
  {
    icon: "person_pin",
    title: "Driver",
    description:
      "Fast slot finding, digital wallet, and easy reservation history on a sleek mobile-first interface.",
    bullets: ["Slot Navigation", "One-Tap Payment"],
  },
  {
    icon: "support_agent",
    title: "Parking Staff",
    description:
      "Real-time floor monitoring, manual override controls, and instant incident notification system.",
    bullets: ["Floor Status Live", "Gate Control"],
  },
  {
    icon: "admin_panel_settings",
    title: "Facility Manager",
    description:
      "High-level revenue tracking, occupancy trends, staff management, and system configuration.",
    bullets: ["Financial Reporting", "User Management"],
  },
];

const stats = [
  ["500+", "Active Slots"],
  ["24/7", "Monitoring"],
  ["<2s", "Check-in Time"],
  ["100%", "Secure Payments"],
];

function PublicHeader() {
  return (
    <header className="fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-[#c3c6d7] bg-[#faf8ff]/90 px-5 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-8">
        <a href="#home" className="font-['Geist'] text-xl font-bold text-[#004ac6]">
          ParkMaster Pro
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map(([label, href], index) => (
            <a
              key={label}
              className={`font-['Geist'] text-[13px] font-medium transition ${
                index === 0
                  ? "border-b-2 border-[#004ac6] text-[#004ac6]"
                  : "text-[#565e74] hover:text-[#004ac6]"
              }`}
              href={href}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/login"
          className="rounded-lg px-4 py-2 font-['Geist'] text-[13px] font-medium text-[#191b23] transition hover:text-[#004ac6]"
        >
          Login
        </Link>
        <Link
          to="/login"
          className="rounded-xl bg-[#004ac6] px-5 py-2.5 font-['Geist'] text-[13px] font-semibold text-white shadow-md shadow-blue-900/20 transition hover:bg-[#2563eb] active:scale-95"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="absolute -right-12 top-8 h-64 w-64 rounded-full bg-[#dbe1ff]/70 blur-3xl" />
      <div className="relative rounded-[2rem] border border-[#c3c6d7] bg-white/70 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur">
        <div className="overflow-hidden rounded-2xl border border-[#c3c6d7] bg-[#131b2e]">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbtcRMawiBCzKQfzW71i0agv9H5TyAXA1AmcmsZ8KvZQGdAe0ZVfeFHrtqjr0pNx0SoK0WIFIS2lch5qJSUxPU72ywY5JR5U4wqhz9FUvyNLyxGRGpuwkLFLr9nvei4SPjJeNm0lGOxWSI1QbIRnD6sSgxMKW3wu5T8SVbUwDpJ8Ua8RdkTaWeAzj9ebMplgfnxwFS0R4nq4mi1IeRHB92KtFfbiA3HzFwC4iyuq1FCfEzChN6_AnMtyba_D3r0ddNaxXKzA6KF8M"
            alt="Smart parking garage with illuminated parking lanes"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            ["Available", "128"],
            ["Reserved", "30"],
            ["Revenue", "8.5M"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-[#f3f3fe] p-3">
              <p className="font-['Geist'] text-[11px] font-semibold text-[#434655]">{label}</p>
              <p className="font-['Geist'] text-xl font-bold text-[#191b23]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative flex min-h-[86vh] items-center overflow-hidden px-5 pt-20 md:px-8"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="mb-4 inline-flex rounded-full bg-[#2563eb] px-3 py-1 font-['Geist'] text-[11px] font-semibold text-white">
            System v4.0 is now live
          </span>
          <h1 className="mb-6 max-w-2xl font-['Geist'] text-4xl font-bold leading-[1.1] text-[#080b13] md:text-6xl">
            Smart Parking <span className="text-[#004ac6]">Building Management</span> System
          </h1>
          <p className="mb-10 max-w-xl font-['Inter'] text-base leading-7 text-[#434655]">
            Manage parking slots, reservations, vehicles, payments, and real-time availability in
            one simple platform. Precise control for modern urban mobility.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[#004ac6] px-7 font-['Geist'] text-[13px] font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#2563eb] active:scale-95"
            >
              Login to Dashboard
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[#c3c6d7] bg-white px-7 font-['Geist'] text-[13px] font-medium text-[#434655] transition hover:bg-[#f3f3fe]"
            >
              View Available Slots
            </a>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}

function FeatureCard({ feature }) {
  return (
    <article className="group rounded-xl border border-[#c3c6d7] bg-[#faf8ff] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#004ac6] hover:shadow-md">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#dbe1ff] text-[#004ac6] transition group-hover:bg-[#004ac6] group-hover:text-white">
        <span className="material-symbols-outlined">{feature.icon}</span>
      </div>
      <h3 className="mb-2 font-['Geist'] text-xl font-semibold text-[#191b23]">{feature.title}</h3>
      <p className="font-['Inter'] text-sm leading-6 text-[#434655]">{feature.description}</p>
    </article>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="bg-white px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="mb-2 font-['Geist'] text-2xl font-semibold text-[#191b23]">
            Engineered for Efficiency
          </h2>
          <p className="font-['Inter'] text-sm text-[#434655]">
            Comprehensive tools for every aspect of parking logistics.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-5 py-24 md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          <h2 className="mb-8 font-['Geist'] text-2xl font-semibold text-[#191b23]">
            How It Works
          </h2>
          <div className="space-y-10">
            {steps.map((step, index) => (
              <div key={step.title} className="flex gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#004ac6] font-['Geist'] text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div>
                  <h3 className="mb-1 font-['Geist'] text-xl font-semibold text-[#191b23]">
                    {step.title}
                  </h3>
                  <p className="max-w-lg font-['Inter'] text-sm leading-6 text-[#434655]">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#c3c6d7] bg-[#f3f3fe] p-6">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#191b23]/20 shadow-2xl">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbtcRMawiBCzKQfzW71i0agv9H5TyAXA1AmcmsZ8KvZQGdAe0ZVfeFHrtqjr0pNx0SoK0WIFIS2lch5qJSUxPU72ywY5JR5U4wqhz9FUvyNLyxGRGpuwkLFLr9nvei4SPjJeNm0lGOxWSI1QbIRnD6sSgxMKW3wu5T8SVbUwDpJ8Ua8RdkTaWeAzj9ebMplgfnxwFS0R4nq4mi1IeRHB92KtFfbiA3HzFwC4iyuq1FCfEzChN6_AnMtyba_D3r0ddNaxXKzA6KF8M"
              alt="Operational flow inside a modern parking garage"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent p-6">
              <div className="text-white">
                <p className="font-['Geist'] text-[13px] font-semibold">Operational Flow</p>
                <p className="font-['Inter'] text-sm text-white/80">
                  Efficiency maximized through automation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RolesSection() {
  return (
    <section id="pricing" className="bg-[#e1e2ed] px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="mb-2 font-['Geist'] text-2xl font-semibold text-[#191b23]">
            Tailored Experiences
          </h2>
          <p className="font-['Inter'] text-sm text-[#434655]">
            Dashboards designed specifically for every stakeholder.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {roles.map((role) => (
            <article
              key={role.title}
              className="rounded-xl border border-[#c3c6d7] bg-[#faf8ff] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <span className="material-symbols-outlined mb-4 text-4xl text-[#004ac6]">
                {role.icon}
              </span>
              <h3 className="mb-4 font-['Geist'] text-xl font-semibold text-[#191b23]">
                {role.title}
              </h3>
              <p className="mb-6 font-['Inter'] text-sm leading-6 text-[#434655]">
                {role.description}
              </p>
              <ul className="space-y-2">
                {role.bullets.map((bullet) => (
                  <li
                    key={bullet}
                    className="flex items-center gap-2 font-['Geist'] text-[11px] font-semibold text-[#565e74]"
                  >
                    <span className="material-symbols-outlined text-sm text-[#004ac6]">
                      check_circle
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <section className="bg-[#131b2e] px-5 py-20 text-white md:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 text-center lg:grid-cols-4">
        {stats.map(([value, label]) => (
          <div key={label}>
            <p className="mb-2 font-['Geist'] text-4xl font-bold">{value}</p>
            <p className="font-['Geist'] text-[13px] font-medium text-white/70">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section id="contact" className="px-5 py-28 text-center md:px-8">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-[#c3c6d7] bg-white/75 p-10 shadow-xl shadow-slate-900/5 backdrop-blur md:p-12">
        <h2 className="mb-5 font-['Geist'] text-3xl font-bold text-[#191b23] md:text-4xl">
          Ready to optimize your parking?
        </h2>
        <p className="mb-8 font-['Inter'] text-base leading-7 text-[#434655]">
          Join hundreds of facilities already using ParkMaster Pro to drive operational excellence.
        </p>
        <Link
          to="/login"
          className="inline-flex h-14 items-center justify-center rounded-xl bg-[#004ac6] px-10 font-['Geist'] text-sm font-semibold text-white shadow-xl shadow-blue-900/20 transition hover:bg-[#2563eb] active:scale-95"
        >
          Login to System
        </Link>
        <p className="mt-6 font-['Geist'] text-[13px] font-medium text-[#565e74]">
          Don't have an account?{" "}
          <a className="text-[#004ac6] hover:underline" href="mailto:sales@parkmaster.example">
            Contact Sales
          </a>
        </p>
      </div>
    </section>
  );
}

function PublicFooter() {
  return (
    <footer className="flex w-full flex-col items-center justify-between gap-4 border-t border-[#c3c6d7] bg-[#e1e2ed] px-5 py-8 md:flex-row md:px-8">
      <div className="text-center md:text-left">
        <p className="font-['Geist'] text-xl font-bold text-[#004ac6]">ParkMaster Pro</p>
        <p className="font-['Inter'] text-sm text-[#434655]">
          © 2024 ParkMaster Pro. Precision Parking Management.
        </p>
      </div>
      <div className="flex gap-6">
        {["About", "Support", "Terms", "Contact"].map((item) => (
          <a
            key={item}
            className="font-['Inter'] text-sm text-[#5c647a] transition hover:text-[#004ac6] hover:underline"
            href="#contact"
          >
            {item}
          </a>
        ))}
      </div>
    </footer>
  );
}

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen scroll-smooth bg-[#faf8ff] font-['Inter'] text-[#191b23]">
      <PublicHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <RolesSection />
        <StatsSection />
        <CtaSection />
      </main>
      <PublicFooter />
    </div>
  );
}
