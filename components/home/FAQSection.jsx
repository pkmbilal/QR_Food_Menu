export default function FAQSection({ data }) {
  const Icon = data.icon;

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            {data.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {data.title}
          </h2>
        </div>

        <div className="space-y-4">
          {data.items.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-[#00c951]" />
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{item.q}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{item.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}