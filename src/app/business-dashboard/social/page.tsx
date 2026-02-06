"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { apiGet, apiPost, apiDelete } from "@/app/lib/api";

/* ================= TYPES ================= */

type Comment = {
  id: string;
  comment: string;
  user?: { name: string };
  replies?: Comment[];
};

type SocialPost = {
  id: string;
  url: string;
  caption?: string;
  likesCount: number;
  comments: Comment[];
};

/* ================= PAGE ================= */

export default function BusinessSocialDashboard() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  /* ================= LOAD POSTS ================= */

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    const res = await apiGet("/social/me");
    setPosts(res || []);
  }

  /* ================= UPLOAD ================= */

  async function uploadPost() {
    if (!file) return alert("Select an image");

    const form = new FormData();
    form.append("file", file);
    if (caption) form.append("caption", caption);

    setUploading(true);
    await apiPost("/social/upload", form);
    setCaption("");
    setFile(null);
    setUploading(false);
    loadPosts();
  }

  /* ================= DELETE ================= */

  async function deletePost(postId: string) {
    if (!confirm("Delete this post?")) return;
    await apiDelete(`/social/${postId}`);
    setPosts((p) => p.filter((x) => x.id !== postId));
  }

  /* ================= REPLY ================= */

  async function reply(commentId: string) {
    if (!replyText[commentId]) return;

    await apiPost(`/social/comment/${commentId}/reply`, {
      comment: replyText[commentId],
    });

    setReplyText((r) => ({ ...r, [commentId]: "" }));
    loadPosts();
  }

  /* ================= UI ================= */

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
        📸 Business Social
      </h1>

      {/* ================= UPLOAD CARD ================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-5 space-y-4 border border-gray-200 dark:border-slate-800">
        <h2 className="font-semibold text-lg text-gray-900 dark:text-slate-100">
          Create Post
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write something..."
          className="w-full border border-gray-300 dark:border-slate-700 rounded-lg px-4 py-2 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
        />

        <button
          disabled={uploading}
          onClick={uploadPost}
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white"
        >
          {uploading ? "Uploading..." : "Post"}
        </button>
      </div>

      {/* ================= POSTS ================= */}
      {posts.map((p) => (
        <div
          key={p.id}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow overflow-hidden border border-gray-200 dark:border-slate-800"
        >
          <Image
            src={p.url}
            alt="post"
            width={1200}
            height={600}
            className="w-full h-80 object-cover"
          />

          <div className="p-4 space-y-3 text-gray-700 dark:text-slate-300">
            {p.caption && (
              <p className="text-gray-900 dark:text-slate-100">{p.caption}</p>
            )}

            <div className="text-sm text-gray-600 dark:text-slate-400">
              ❤️ {p.likesCount} · 💬 {p.comments.length}
            </div>

            <button
              onClick={() => deletePost(p.id)}
              className="text-sm text-red-600"
            >
              Delete Post
            </button>

            {/* COMMENTS */}
            <div className="space-y-3 mt-4">
              {p.comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <b>{c.user?.name}:</b> {c.comment}

                  {/* BUSINESS REPLY */}
                  {c.replies?.map((r) => (
                    <div
                      key={r.id}
                      className="ml-5 mt-1 p-2 bg-gray-100 dark:bg-slate-800 rounded-lg"
                    >
                      <b className="text-indigo-600">Business:</b> {r.comment}
                    </div>
                  ))}

                  {/* REPLY BOX */}
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyText[c.id] || ""}
                      onChange={(e) =>
                        setReplyText((t) => ({
                          ...t,
                          [c.id]: e.target.value,
                        }))
                      }
                      placeholder="Reply as business..."
                      className="flex-1 border border-gray-300 dark:border-slate-700 rounded px-2 py-1 bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100"
                    />
                    <button
                      onClick={() => reply(c.id)}
                      className="bg-indigo-600 text-white px-3 rounded"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {posts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-slate-400">
          No posts yet. Start posting 🚀
        </p>
      )}
    </div>
  );
}
