import Link from "next/link";

export default function BusinessCard({ service }) {
  const isQuotation = !service.price && !service.minPrice && !service.maxPrice;

  return (
    <Link href={`/user-dashboard/service/${service.id}`}>
      <div className="p-5 bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{service.name}</h3>
        <p className="text-gray-500 text-sm mb-2">
          {service.business?.name ?? "Unknown Business"}
        </p>

        {isQuotation ? (
          <span className="text-yellow-600 font-medium">💬 Price on Request</span>
        ) : service.price ? (
          <span className="text-green-600 font-semibold">₹ {service.price}</span>
        ) : (
          <span className="text-blue-600 font-medium">
            ₹ {service.minPrice} – ₹ {service.maxPrice}
          </span>
        )}
      </div>  
    </Link>
  );
}
