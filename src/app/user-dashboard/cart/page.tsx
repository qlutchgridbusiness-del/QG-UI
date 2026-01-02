"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem("cart") || "[]"));
  }, []);

  const removeItem = (index: number) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const checkout = () => {
    const bookings =
      JSON.parse(localStorage.getItem("bookings") || "[]");

    cart.forEach((item) => {
      bookings.push({
        id: Date.now() + Math.random(),
        serviceName: item.serviceName,
        businessName: item.businessName,
        price: item.price,
        status: "PENDING",
        user: "Demo User",
        createdAt: new Date().toISOString(),
      });
    });

    localStorage.setItem("bookings", JSON.stringify(bookings));
    localStorage.removeItem("cart");

    router.push("/user-dashboard/booking-success");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {cart.length === 0 && (
        <p className="text-gray-500">Cart is empty</p>
      )}

      <div className="space-y-4">
        {cart.map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow flex justify-between"
          >
            <div>
              <h3 className="font-semibold">{item.serviceName}</h3>
              <p className="text-gray-500">{item.businessName}</p>
            </div>

            <div className="text-right">
              <p className="font-semibold">₹ {item.price}</p>
              <button
                onClick={() => removeItem(i)}
                className="text-red-500 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <button
          onClick={checkout}
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl text-lg"
        >
          Checkout
        </button>
      )}
    </div>
  );
}
