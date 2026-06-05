import { Link } from "react-router-dom";
import PremiumHero3D from "../../components/public/PremiumHero3D";

const navItems = [
  ["Home", "#home", 0],
  ["Features", "#features", 0.2],
  ["Workflow", "#workflow", 0.45],
  ["Roles", "#roles", 0.7],
  ["Contact", "#contact", 0.95],
];

function scrollToHeroProgress(href, progress) {
  const hero = document.getElementById("home");
  if (!hero) return;

  const scrollableDistance = hero.offsetHeight - window.innerHeight;
  const targetTop = hero.offsetTop + scrollableDistance * progress;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });

  window.history.replaceState(null, "", href);
}

function PublicHeader() {
  return (
    // ẨN HOÀN TOÀN NỀN: bg-transparent, không border, z-50 để luôn nằm trên Canvas
    <header className="fixed left-0 top-0 z-50 w-full bg-transparent px-5 py-4 transition-all duration-300 md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo Cyberpunk */}
        <button
          type="button"
          onClick={() => scrollToHeroProgress("#home", 0)}
          className="group flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-lg font-black text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-300 group-hover:bg-cyan-500/20 group-hover:shadow-[0_0_25px_rgba(6,182,212,0.8)]">
            P
          </div>

          <div className="text-left">
            <p className="text-lg font-black tracking-widest text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">
              PARKMASTER
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/80">
              Building System
            </p>
          </div>
        </button>

        {/* Navigation Links - HUD Style */}
        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map(([label, href, progress]) => (
            <button
              key={label}
              type="button"
              onClick={() => scrollToHeroProgress(href, progress)}
              className="relative px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-300 transition-all duration-300 hover:text-cyan-400 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
            >
              {label}
              {/* Thanh gạch chân phát sáng khi hover */}
              <span className="absolute bottom-0 left-1/2 h-[2px] w-0 -translate-x-1/2 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)] transition-all duration-300 group-hover:w-full" />
            </button>
          ))}
        </nav>

        {/* Action Buttons - Neon Style */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden rounded-lg border border-cyan-500/30 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-cyan-400 transition-all duration-300 hover:border-cyan-400 hover:bg-cyan-500/10 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] md:inline-flex"
          >
            Login
          </Link>

          <Link
            to="/login"
            className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-lg bg-cyan-500 px-6 text-xs font-black uppercase tracking-widest text-black shadow-[0_0_20px_rgba(6,182,212,0.6)] transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_35px_rgba(6,182,212,0.9)] active:scale-[0.98]"
          >
            <span className="relative z-10">Get Started</span>
            {/* Hiệu ứng quét sáng (scanline) nhẹ khi hover */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function PublicLandingPage() {
  return (
    // Nền tổng thể đồng nhất với 3D scene
    <div className="min-h-screen scroll-smooth bg-[#050510] font-['Inter'] text-slate-100">
      <PublicHeader />

      <main>
        <PremiumHero3D />
      </main>
    </div>
  );
}
