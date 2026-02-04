export default function ServiceList({ services }: { services: any[] }) {
  console.log("checkmyservices", services);

  if (!services?.length) {
    return (
      <div className="text-center text-gray-500 mt-10 text-lg">
        No services added yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services?.map((s) => (
        <div
          key={s.id}
          className="group border border-gray-200/70 dark:border-slate-800 rounded-2xl p-5 bg-white/95 dark:bg-slate-900/90 
                     shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {s.name}
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-slate-200">
              Active
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm leading-relaxed">
            High-quality service provided by trusted professionals.
          </p>

          <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400 mt-4">
            ₹{s.price}
          </p>
        </div>
      ))}
    </div>
  );
}
