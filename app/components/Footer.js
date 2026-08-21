import Link from "next/link";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="relative w-full border-t border-neutral-800 bg-neutral-950 overflow-hidden">
      {/* Fon effekti */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[600px] rounded-full bg-red-600/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-1 mb-4 group">
              <span className="text-2xl font-black text-white tracking-tight">
                Husma
              </span>
              <span className="text-red-500 text-2xl font-black group-hover:translate-x-0.5 transition-transform">
                .
              </span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs mb-6">
              Har bir tunni coinga aylantiring. Sovg&apos;alar, imtiyozlar va
              qulay dam olish bir joyda.
            </p>

            {/* Ijtimoiy tarmoqlar */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition"
              >
                <InstagramIcon size={16} className="h-4 w-4" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="flex items-center justify-center h-9 w-9 rounded-xl border border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-red-500/40 hover:bg-red-500/10 transition"
              >
                <Send size={16} />
              </a>
            </div>
          </div>

          {/* Navigatsiya */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Sahifalar
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/", label: "Bosh sahifa" },
                { href: "/xonalar", label: "Xonalar" },
                { href: "/sovgalar", label: "Sovg'alar" },
                { href: "/karta", label: "Mening kartam" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-400"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hisob */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Hisob
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/login", label: "Kirish" },
                { href: "/register", label: "Ro'yxatdan o'tish" },
                { href: "/admin", label: "Admin panel" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-white transition"
                  >
                    {item.label}
                    <ArrowUpRight
                      size={12}
                      className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-red-400"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Aloqa
            </h3>
            <ul className="space-y-3 text-sm text-neutral-500">
              <li>
                <a
                  href="tel:+998901234567"
                  className="flex items-center gap-2.5 hover:text-white transition"
                >
                  <Phone size={14} className="text-red-400 shrink-0" />
                  +998 90 123 45 67
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@husma.uz"
                  className="flex items-center gap-2.5 hover:text-white transition"
                >
                  <Mail size={14} className="text-red-400 shrink-0" />
                  info@husma.uz
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin size={14} className="text-red-400 shrink-0" />
                Toshkent, O&apos;zbekiston
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Husma. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-neutral-600">
              Coin tizimi • Mehmonlar kartasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}