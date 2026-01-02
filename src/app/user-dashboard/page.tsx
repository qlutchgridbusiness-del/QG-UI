"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { services } from "../data/mockData";

export default function UserDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [query, setQuery] = useState(initialSearch);
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filteredServices = services.filter((s) => {
    const matchesQuery =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.business.name.toLowerCase().includes(query.toLowerCase());

    const matchesCategory = !category || s.category === category;

    const matchesMin = !minPrice || s.price >= Number(minPrice);
    const matchesMax = !maxPrice || s.price <= Number(maxPrice);

    return matchesQuery && matchesCategory && matchesMin && matchesMax;
  });

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">
        Find Services Near You
      </h1>

      {/* FILTER BAR */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* SEARCH */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services like water wash, car service..."
            className="border rounded-lg px-4 py-2 text-gray-800"
          />

          {/* CATEGORY */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 text-gray-800"
          >
            <option value="">All Categories</option>
            <option value="Car Care">Car Care</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Body Work">Body Work</option>
          </select>

          {/* MIN PRICE */}
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="border rounded-lg px-4 py-2 text-gray-800"
          />

          {/* MAX PRICE */}
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="border rounded-lg px-4 py-2 text-gray-800"
          />
        </div>
      </div>

      {/* RESULTS */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            onClick={() =>
              router.push(`/user-dashboard/service/${service.id}`)
            }
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          >
            <h3 className="text-xl font-semibold">{service.name}</h3>
            <p className="text-gray-500">{service.business.name}</p>

            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                {service.category}
              </span>
              <span className="font-bold text-blue-600">
                ₹ {service.price}
              </span>
            </div>

            <p className="text-sm text-gray-400 mt-1">
              {service.durationMinutes} mins
            </p>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <p className="text-gray-500 col-span-full text-center">
            No services found. Try adjusting filters.
          </p>
        )}
      </div>
    </div>
  );
}
