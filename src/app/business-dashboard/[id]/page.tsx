"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiGet, apiPost } from "@/app/lib/api";

export default function BusinessDetails() {
  const { id } = useParams();
  const [services, setServices] = useState([]);

  useEffect(() => {
    apiGet(`/business/${id}/services`).then((res) => setServices(res));
  }, [id]);

  const handleBook = async (service: any) => {
    await apiPost("/bookings", { serviceId: service.id, userId: "currentUser" });
    alert(`Booked ${service.name}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Services</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((s: any) => (
          <div key={s.id} className="border rounded-lg p-4 bg-white shadow">
            <h3 className="font-semibold text-lg">{s.name}</h3>
            <p>₹{s.price}</p>
            <button
              onClick={() => handleBook(s)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md mt-3"
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
