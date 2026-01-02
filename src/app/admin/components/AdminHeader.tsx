"use client";

import { Menu } from "lucide-react";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b md:hidden">
        <button onClick={() => setOpen(true)}>
          <Menu />
        </button>
        <div className="font-semibold text-indigo-600">QlutchGrid Admin</div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/30">
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white">
            <div className="p-4 border-b flex justify-between items-center">
              <span className="font-bold text-indigo-600">Admin</span>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <AdminSidebar />
          </div>
        </div>
      )}
    </>
  );
}
