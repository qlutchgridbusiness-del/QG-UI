"use client";
import { useState } from "react";

export default function Tabs({ tabs }: any) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-slate-800 mb-4">
        {tabs.map((tab: any, i: number) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm transition ${
              active === i
                ? "border-b-2 border-blue-600 font-semibold text-gray-900 dark:text-slate-100"
                : "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active].content}</div>
    </div>
  );
}
