"use client";

import { useRouter } from "next/navigation";

const colorMap = {
  indigo: "text-indigo-600",
  green: "text-green-600",
  red: "text-red-600",
  yellow: "text-yellow-600",
};

type StatCardProps = {
  title: string;
  value: number | string;
  color?: keyof typeof colorMap;
  href: string;
};

export function StatCard({
  title,
  value,
  color = "indigo",
  href,
}: StatCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className="
        bg-white rounded-xl shadow p-4
        cursor-pointer
        hover:shadow-md hover:bg-gray-50
        transition
      "
    >
      <div className="text-sm text-gray-500">{title}</div>
      <div className={`text-3xl font-bold ${colorMap[color]}`}>
        {value}
      </div>
    </div>
  );
}
