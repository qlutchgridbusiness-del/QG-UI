"use client";

import { useParams, useRouter } from "next/navigation";
import { services } from "@/app/data/mockData";

export default function ServiceDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const service = services.find((s) => s.id === id);

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    cart.push({
      serviceId: service.id,
      serviceName: service.name,
      businessName: service.business.name,
      price: service.price,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    router.push("/user-dashboard/cart");
  };

  if (!service) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-2xl font-bold">Service unavailable</h2>
        <button
          onClick={() => router.push("/user-dashboard")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go back
        </button>
      </div>
    );
  }

  const bookService = () => {
    const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");

    bookings.push({
      id: Date.now(),
      serviceName: service.name,
      businessName: service.business.name,
      price: service.price,
      status: "PENDING",
      user: "Demo User",
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("bookings", JSON.stringify(bookings));
    router.push("/user-dashboard/booking-success");
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow mt-10">
      <h2 className="text-2xl font-bold">{service.name}</h2>
      <p className="text-gray-500">{service.business.name}</p>

      <div className="my-4">
        <p>Duration: {service.durationMinutes} mins</p>
        <p className="text-lg font-semibold">₹ {service.price}</p>
      </div>

      <button
        onClick={addToCart}
        className="w-full bg-blue-600 text-white py-3 rounded-xl text-lg"
      >
        Add to Cart
      </button>
    </div>
  );
}
