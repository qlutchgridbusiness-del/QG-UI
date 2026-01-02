import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

export function BusinessCard({ business }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">{business.name}</h3>
        <StatusBadge status={business.status} />
      </div>

      <div className="text-sm text-gray-500">
        📍 {business.address}
      </div>

      <div className="flex justify-end gap-3 mt-2">
        <Link href={`/admin/businesses/${business.id}`}>
          <button className="text-indigo-600 text-sm">View</button>
        </Link>
      </div>
    </div>
  );
}
