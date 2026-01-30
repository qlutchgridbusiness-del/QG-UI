"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { apiGet, apiPost } from "@/app/lib/api";

/* ================= TYPES ================= */

type SocialPost = {
  id: string;
  url: string;
  caption?: string;
  likesCount?: number;
  comments?: {
    id: string;
    comment: string;
    user: { name: string };
  }[];
};

/* ================= PAGE ================= */

export default function BusinessSocialPage() {
  const { id: businessId } = useParams<{ id: string }>();
  console.log("check---------->", businessId);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});

  const loaderRef = useRef<HTMLDivElement | null>(null);

  /* ================= FETCH ================= */

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (!loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  if (!businessId) return null;

  async function loadPosts() {
    if (loading || !hasMore) return;

    setLoading(true);

    const res = await apiGet(
      `/social/business/${businessId}?page=${page}&limit=6`
    );

    if (!res || res.length === 0) {
      setHasMore(false);
    } else {
      setPosts((prev) => {
        const map = new Map<string, SocialPost>();

        [...prev, ...res].forEach((p) => {
          map.set(p.id, {
            ...p,
            likesCount: p.likesCount ?? 0,
            comments: p.comments ?? [],
          });
        });

        return Array.from(map.values());
      });
    }

    setLoading(false);
  }

  /* ================= ACTIONS ================= */

  async function likePost(postId: string) {
    const res = await apiPost(`/social/${postId}/like`, {});

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, likesCount: res.likesCount } : p
      )
    );
  }

  async function addComment(postId: string) {
    const text = commentText[postId];
    if (!text) return;

    const res = await apiPost(`/social/${postId}/comment`, {
      comment: text,
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...(p.comments || []), res] } : p
      )
    );

    setCommentText((t) => ({ ...t, [postId]: "" }));
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      <h1 className="text-3xl font-bold text-center text-white">Business Updates</h1>

      {posts.map((p) => (
        <div key={p.id} className="bg-white rounded-xl shadow overflow-hidden">
          <Image
            src={p.url}
            alt="post"
            width={1200}
            height={600}
            className="w-full h-80 object-cover"
          />

          <div className="p-4 space-y-3">
            {p.caption && <p className="text-gray-700">{p.caption}</p>}

            <div className="flex gap-6 text-sm text-gray-600">
              <button onClick={() => likePost(p.id)}>
                ❤️ {p.likesCount ?? 0}
              </button>
              <span>💬 {(p.comments || []).length}</span>
            </div>

            {/* COMMENTS */}
            <div className="space-y-1">
              {(p.comments || []).map((c) => (
                <p key={c.id} className="text-sm">
                  <b>{c.user?.name}:</b> {c.comment}
                </p>
              ))}
            </div>

            {/* ADD COMMENT */}
            <div className="flex gap-2">
              <input
                value={commentText[p.id] || ""}
                onChange={(e) =>
                  setCommentText((t) => ({
                    ...t,
                    [p.id]: e.target.value,
                  }))
                }
                placeholder="Write a comment…"
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                onClick={() => addComment(p.id)}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      ))}

      {hasMore && (
        <div ref={loaderRef} className="py-10 text-center text-gray-500">
          Loading more…
        </div>
      )}
    </div>
  );
}
