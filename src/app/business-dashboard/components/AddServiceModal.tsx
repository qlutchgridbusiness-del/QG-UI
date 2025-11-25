"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function AddServiceModal({ open, onClose, setServices }: any) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    // 🔹 Step 1: Get current user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.id) {
      // 🔹 Step 2: Fetch business linked to this user
      axios
        .get(`http://3.230.169.3:5001/business/owner/${user.id}`)
        .then((res) => {
          if (res.data?.id) setBusinessId(res.data.id);
        })
        .catch((err) => console.error("Error fetching business:", err));
    }
  }, []);

  if (!open) return null;

  const handleAdd = async () => {
    if (!name || !price) return alert("Please enter service name and price.");
    if (!businessId) return alert("No business found for this user.");
    console.log("inadd");
    setLoading(true);
    try {
      const newService = {
        name,
        price: parseFloat(price),
        available: true,
      };

      const res = await axios.post(
        `http://3.230.169.3:5001/business/${businessId}/services`,
        { services: [newService] }
      );

      console.log("Service added:", res.data);

      // Update local state for immediate UI update
      setServices((prev: any) => [
        ...prev,
        { id: Date.now(), name, price: parseFloat(price) },
      ]);

      onClose();
      setName("");
      setPrice("");
    } catch (err) {
      console.error("Error adding service:", err);
      alert("Failed to add service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl w-96 shadow-xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 text-center">
          Add New Service
        </h2>

        <input
          placeholder="Service Name"
          className="border p-3 w-full mb-3 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Price (₹)"
          type="number"
          className="border p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={handleAdd}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Adding..." : "Add Service"}
        </button>

        <button
          onClick={onClose}
          className="w-full mt-3 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
