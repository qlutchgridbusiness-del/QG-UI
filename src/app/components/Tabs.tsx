"use client";
import { useState } from "react";

export default function Tabs({ tabs }: any) {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div className="flex border-b mb-4">
        {tabs.map((tab: any, i: number) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 ${
              active === i ? "border-b-2 border-blue-600 font-semibold" : "text-gray-600"
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
