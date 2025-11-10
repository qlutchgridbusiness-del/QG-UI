"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    role: "user",
    pancard: "",
    aadhaarCard: "",
    gst: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Auto-detect location
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            latitude: pos.coords.latitude.toString(),
            longitude: pos.coords.longitude.toString(),
          }));
        },
        (err) => console.warn("Location not accessible", err)
      );
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/auth/register", form);
      alert("Registered successfully! Redirecting to login...");
      router.push("/auth/login"); // 👈 Redirect to login page
    } catch (err) {
      console.error(err);
      alert("Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-blue-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md border border-gray-200"
      >
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create Your Account
        </h1>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">I am a</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border-gray-300 border rounded-lg p-2 text-gray-800 focus:ring-2 focus:ring-blue-400"
          >
            <option value="user">User</option>
            <option value="business">Business</option>
          </select>
        </div>

        {/* Common fields */}
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Name *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="Enter your name"
            className="w-full border-gray-300 border rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Phone *
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            placeholder="Enter your phone number"
            className="w-full border-gray-300 border rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Conditional fields for Business */}
        {form.role === "business" && (
          <>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Email *
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                type="email"
                placeholder="Enter your business email"
                className="w-full border-gray-300 border rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                PAN Card
              </label>
              <input
                name="pancard"
                value={form.pancard}
                onChange={handleChange}
                placeholder="Enter PAN number"
                className="w-full border-gray-300 border rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Aadhaar
              </label>
              <input
                name="aadhaarCard"
                value={form.aadhaarCard}
                onChange={handleChange}
                placeholder="Enter Aadhaar number"
                className="w-full border-gray-300 border rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                GST ID
              </label>
              <input
                name="gst"
                value={form.gst}
                onChange={handleChange}
                placeholder="Enter GST ID"
                className="w-full border-gray-300 border rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </>
        )}

        {/* Location section */}
        <div className="flex gap-2 mb-4">
          <input
            name="latitude"
            value={form.latitude}
            readOnly
            placeholder="Latitude"
            className="w-1/2 border-gray-300 border rounded-lg p-2 text-gray-900 bg-gray-50"
          />
          <input
            name="longitude"
            value={form.longitude}
            readOnly
            placeholder="Longitude"
            className="w-1/2 border-gray-300 border rounded-lg p-2 text-gray-900 bg-gray-50"
          />
        </div>

        <button
          type="button"
          onClick={getLocation}
          className="text-sm text-blue-600 underline mb-4"
        >
          Detect My Location
        </button>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
}
