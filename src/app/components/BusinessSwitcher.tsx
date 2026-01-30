"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/app/lib/api";

export default function BusinessSwitcher() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    apiGet("/business/me").then((res) => {
      setBusinesses(res || []);
      const stored = localStorage.getItem("activeBusinessId");
      if (!stored && res?.length) {
        localStorage.setItem("activeBusinessId", res[0].id);
        setActive(res[0].id);
      } else {
        setActive(stored);
      }
    });
  }, []);

  function switchBusiness(id: string) {
    localStorage.setItem("activeBusinessId", id);
    setActive(id);
    window.location.reload(); // simple & safe
  }

  if (businesses.length <= 1) return null;

  return (
    <select
      value={active ?? ""}
      onChange={(e) => switchBusiness(e.target.value)}
      className="border rounded px-3 py-1 text-sm"
    >
      {businesses.map((b) => (
        <option key={b.id} value={b.id}>
          {b.name}
        </option>
      ))}
    </select>
  );
}
