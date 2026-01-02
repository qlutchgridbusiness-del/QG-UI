"use client";
import { useEffect, useState } from "react";

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function LocationSearch({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (data: {
    address: string;
    latitude: string;
    longitude: string;
  }) => void;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            query
          )}&format=json&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept": "application/json",
            },
            signal: controller.signal,
          }
        );
        const data = await res.json();
        setResults(data);
      } catch (e) {
        if (!(e instanceof DOMException)) console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
    return () => controller.abort();
  }, [query]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search area, street, landmark…"
        className="w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-indigo-500"
      />

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        📍
      </span>

      {loading && (
        <div className="absolute z-10 bg-white w-full mt-1 p-2 text-sm text-gray-500">
          Searching…
        </div>
      )}

      {results.length > 0 && (
        <ul className="absolute z-20 bg-white border rounded-lg mt-1 w-full shadow max-h-60 overflow-auto">
          {results.map((r, i) => (
            <li
              key={i}
              onClick={() => {
                onSelect({
                  address: r.display_name,
                  latitude: r.lat,
                  longitude: r.lon,
                });
                setQuery(r.display_name);
                setResults([]);
              }}
              className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
            >
              {r.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
