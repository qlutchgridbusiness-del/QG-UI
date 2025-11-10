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
          className="group border border-gray-100 rounded-2xl p-5 bg-gradient-to-br from-white to-gray-50 
                     shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
          <h3
            className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 
                       bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-blue-600 
                       transition-colors duration-300"
          >
            {s.name}
          </h3>

          <p className="text-gray-700 mt-2 text-sm leading-relaxed">
            High-quality service provided by trusted professionals.
          </p>

          <p
            className="text-2xl font-semibold text-green-600 mt-4 
                       group-hover:text-green-700 transition-colors duration-300"
          >
            ₹{s.price}
          </p>
        </div>
      ))}
    </div>
  );
}
