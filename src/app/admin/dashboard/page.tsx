"use client";

import { useEffect, useState } from "react";
import { StatCard } from "../components/StatCard";
import { API_BASE } from "@/app/lib/api";

type DashboardStats = {
  pendingKyc: number;
  pendingContracts: number;
  liveBusinesses: number;
  totalUsers: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const user = process.env.NEXT_PUBLIC_ADMIN_USERNAME || "";
    const pass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";
    const auth = user && pass ? `Basic ${btoa(`${user}:${pass}`)}` : "";
    fetch(`${API_BASE}/admin/dashboard`, {
      headers: auth ? { Authorization: auth } : {},
    })
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-gray-100 h-24 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Pending KYC"
        value={stats.pendingKyc}
        color="yellow"
        href="/admin/kyc"
      />

      <StatCard
        title="Pending Contracts"
        value={stats.pendingContracts}
        color="indigo"
        href="/admin/contracts"
      />

      <StatCard
        title="Live Businesses"
        value={stats.liveBusinesses}
        color="green"
        href="/admin/businesses"
      />

      <StatCard
        title="Users"
        value={stats.totalUsers}
        color="red"
        href="/admin/users"
      />
    </div>
  );
}
