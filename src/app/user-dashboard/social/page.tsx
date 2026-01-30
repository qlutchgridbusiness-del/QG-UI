"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { apiGet } from "@/app/lib/api";
import { useRouter } from "next/navigation";

type SocialPost = {
  id: string;
  url: string;
  caption?: string;
  likesCount: number;
  comments: any[];
  business: { id: string, name: string };
};

export default function GlobalSocialsPage() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
const router = useRouter();

  const loadingRef = useRef(false); // 🔒 request lock

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function loadPosts() {
    if (loadingRef.current || !hasMore) return;

    loadingRef.current = true;

    const res = await apiGet(`/social/feed?page=${page}&limit=10`);

    if (!res || res.length === 0) {
      setHasMore(false);
      loadingRef.current = false;
      return;
    }

    setPosts((prev) => {
      const map = new Map<string, SocialPost>();

      // de-duplicate by id
      [...prev, ...res].forEach((p) => {
        map.set(p.id, p);
      });

      return Array.from(map.values());
    });

    loadingRef.current = false;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-3xl font-bold text-white">Trending Businesses</h1>

      {posts.map((p) => (
        <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden">
          <p
            onClick={() => router.push(`/business/${p.business.id}`)}
            className="font-semibold cursor-pointer hover:underline"
          >
            {p.business.name}
          </p>

          <Image
            src={p.url}
            alt="post"
            width={1200}
            height={600}
            className="w-full h-72 object-cover"
          />

          <div className="p-4 space-y-2">
            {p.caption && <p className="text-gray-700">{p.caption}</p>}

            <div className="flex gap-6 text-sm text-gray-600">
              <span>❤️ {p.likesCount}</span>
              <span>💬 {p.comments?.length ?? 0}</span>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => setPage((p) => p + 1)}
          className="w-full py-3 border rounded-lg hover:bg-gray-50"
        >
          Load more
        </button>
      )}
    </div>
  );
}
