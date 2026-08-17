import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-800 bg-neutral-950">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-xl font-bold text-white tracking-tight">
                Husma
              </span>
              <span className="text-red-500 font-bold">.</span>
            </Link>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              Har bir tunni coinga aylantiring. Sovg&apos;alar, imtiyozlar va
              qulay dam olish bir joyda.
            </p>
          </div>

          {/* Navigatsiya */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Sahifalar
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Bosh sahifa
                </Link>
              </li>
              <li>
                <Link
                  href="/xonalar"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Xonalar
                </Link>
              </li>
              <li>
                <Link
                  href="/sovgalar"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Sovg&apos;alar
                </Link>
              </li>
              <li>
                <Link
                  href="/karta"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Mening kartam
                </Link>
              </li>
            </ul>
          </div>

          {/* Hisob */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Hisob
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/login"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Kirish
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Ro&apos;yxatdan o&apos;tish
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-neutral-500 hover:text-white transition"
                >
                  Admin panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Aloqa */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
              Aloqa
            </h3>
            <ul className="space-y-2.5 text-sm text-neutral-500">
              <li>+998 90 123 45 67</li>
              <li>info@husma.uz</li>
              <li>Toshkent, O&apos;zbekiston</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-neutral-600">
            © {new Date().getFullYear()} Husma. Barcha huquqlar himoyalangan.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-600">
              Coin tizimi • Mehmonlar kartasi
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}