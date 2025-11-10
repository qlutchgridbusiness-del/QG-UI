"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import BusinessCard from "./components/BusinessCard";

export interface Services {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  available: boolean;
  business: any;
  bookings: any[];
  createdAt: Date;
  updatedAt: Date;
}

export default function UserHome() {
  const [services, setServices] = useState<Services[]>([]);
  const [filteredServices, setFilteredServices] = useState<Services[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get<Services[]>(
          `http://localhost:5001/services?search=${search}`
        );
        setServices(res.data);
        setFilteredServices(res.data); // initially show all
      } catch (err) {
        console.error("Error fetching businesses:", err);
        setError("❌ Failed to load businesses. Please try again later.");
      }
    };

    fetchServices();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setFilteredServices(services);
    } else {
      const filtered = services.filter((svc) =>
        `${svc.name} ${svc.business?.name}`
          .toLowerCase()
          .includes(value.toLowerCase())
      );
      setFilteredServices(filtered);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Explore all and book your services 🚗
      </h1>
      <div className="mb-10 flex justify-center">
        <input
          type="text"
          placeholder="Search for services or businesses..."
          value={search}
          onChange={handleSearch}
          className="w-full max-w-2xl p-3 rounded-xl border border-gray-300 shadow-sm 
                       focus:ring-2 focus:ring-blue-400 outline-none text-gray-700 placeholder-gray-400"
        />
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {filteredServices?.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices?.map((svc) => (
            <BusinessCard key={svc.id} service={svc} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          No businesses available at the moment.
        </p>
      )}
    </div>
  );
}
