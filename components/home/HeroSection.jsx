import Link from "next/link";
import { BadgeCheck, QrCode } from "lucide-react";

export default function HeroSection({ data }) {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-white via-emerald-50/40 to-orange-50/60">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-emerald-200/30 blur-3xl" />
        <div className="absolute top-10 right-0 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-green-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
            {data.badge}
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl">
            {data.title}
            <span className="block bg-gradient-to-r from-emerald-600 to-green-500 bg-clip-text text-transparent">
              {data.highlight}
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            {data.description}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href={data.primaryCta.href}
              className="inline-flex items-center justify-center rounded-xl bg-[#00c951] px-7 py-4 text-base font-semibold text-white shadow-lg shadow-green-200 transition hover:bg-green-600"
            >
              {data.primaryCta.label}
            </Link>

            <Link
              href={data.secondaryCta.href}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-7 py-4 text-base font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              {data.secondaryCta.label}
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-slate-600">
            {data.points.map((point) => (
              <div key={point} className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-[#00c951]" />
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-200/60">
            <div className="rounded-2xl bg-slate-900 p-4 text-white">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Restaurant Dashboard</p>
                  <h3 className="text-xl font-semibold">ScanEat Control Panel</h3>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <QrCode className="h-6 w-6 text-emerald-400" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Tables Active</p>
                  <p className="mt-2 text-3xl font-bold">24</p>
                  <p className="mt-1 text-sm text-emerald-400">+8 today</p>
                </div>

                <div className="rounded-2xl bg-white/5 p-4">
                  <p className="text-sm text-slate-300">Orders Received</p>
                  <p className="mt-2 text-3xl font-bold">126</p>
                  <p className="mt-1 text-sm text-emerald-400">Live via WhatsApp</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white p-4 text-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-semibold">Sample Menu Preview</h4>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                    Mobile Friendly
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <p className="font-medium">Chicken Burger</p>
                      <p className="text-sm text-slate-500">Popular item with cheese</p>
                    </div>
                    <span className="font-semibold">SAR 18</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <p className="font-medium">Pasta Alfredo</p>
                      <p className="text-sm text-slate-500">Creamy white sauce pasta</p>
                    </div>
                    <span className="font-semibold">SAR 24</span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                    <div>
                      <p className="font-medium">Fresh Mojito</p>
                      <p className="text-sm text-slate-500">Mint, lemon, sparkling</p>
                    </div>
                    <span className="font-semibold">SAR 12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-6 -left-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <p className="text-sm font-semibold text-slate-900">No printed menus needed</p>
            <p className="text-xs text-slate-500">Clean, fast, contactless ordering</p>
          </div>
        </div>
      </div>
    </section>
  );
}