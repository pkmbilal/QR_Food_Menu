export default function HowItWorksSection({ data }) {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
            {data.eyebrow}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            {data.title}
          </h2>
          <p className="mt-4 text-lg text-slate-600">{data.description}</p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {data.steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-8 text-center"
              >
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-50">
                  <Icon size={44} className="text-[#00c951]" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-slate-600">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}