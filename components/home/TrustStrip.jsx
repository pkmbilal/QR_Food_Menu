export default function TrustStrip({ data, restaurantCount }) {
  return (
    <section className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            {data.eyebrow}
          </p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{data.title}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {data.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-slate-50 px-5 py-4 text-center"
            >
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}

          <div className="rounded-2xl bg-slate-50 px-5 py-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{restaurantCount}+</div>
            <div className="text-sm text-slate-500">Active Listings</div>
          </div>
        </div>
      </div>
    </section>
  );
}