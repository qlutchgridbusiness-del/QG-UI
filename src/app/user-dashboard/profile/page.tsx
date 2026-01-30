"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut } from "@/app/lib/api";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    apiGet("/users/me", token)
      .then((data) => {
        setProfile(data);
        setName(data.name || "");
        setEmail(data.email || "");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  async function saveProfile() {
    if (!name || !email) {
      setError("Name and email are required");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const updated = await apiPut(
        "/users/me",
        { name, email },
        token
      );

      // 🔥 Keep localStorage in sync
      localStorage.setItem("user", JSON.stringify(updated));

      setProfile(updated);
      setSuccess("Profile updated successfully");
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 text-gray-500">
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20 text-red-500">
        {error || "Profile not found"}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {/* NAME */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Full Name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>

        {/* EMAIL */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-3 border rounded-lg"
          />
        </div>

        {/* PHONE (READ ONLY) */}
        <div>
          <label className="block text-sm font-medium text-gray-600">
            Phone Number
          </label>
          <input
            value={profile.phone}
            disabled
            className="w-full mt-1 p-3 border rounded-lg bg-gray-100"
          />
        </div>

        {/* ACTIONS */}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="
            w-full py-3 rounded-xl
            bg-indigo-600 text-white font-semibold
            hover:bg-indigo-700
            disabled:bg-gray-400
          "
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm text-center">{success}</p>
        )}
      </div>
    </div>
  );
}
