"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BookingForm from "../../components/BookingForm";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const fetchService = async () => {
      try {
        console.log("------------------------>", id);

        const res = await fetch(`http://3.230.169.3:5001/services/${id}`);
        console.log("------------------------>", res);
        if (!res.ok) throw new Error("Service not found");
        const data = await res.json();
        setService(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [id]);

  if (loading) return <p className="text-center p-4">Loading service...</p>;
  if (!service)
    return <p className="text-center p-4 text-red-500">Service not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-xl shadow-md mt-6">
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">
        {service.name}
      </h2>
      <p className="text-gray-500 mb-3">{service.business?.name}</p>

      <div className="mb-4">
        <p className="text-gray-700">
          Duration:{" "}
          {service.durationMinutes ? `${service.durationMinutes} mins` : "N/A"}
        </p>
        <p className="text-gray-700">
          Price:{" "}
          {service.price
            ? `₹ ${service.price}`
            : `₹ ${service.minPrice} – ₹ ${service.maxPrice}`}
        </p>
      </div>

      <button
        onClick={() => setOpen(true)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Book Now
      </button>
      {open && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <BookingForm serviceId={service.id} />
          </div>
        </div>
      )}
    </div>
  );
}
