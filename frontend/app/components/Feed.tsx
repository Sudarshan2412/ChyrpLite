"use client";
import React, { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import PostRenderer from "./PostRenderer";
import Link from "next/link";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

function LikeDislike({ postId }: { postId: number }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likeCount, setLikeCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch like count and user like status
  const fetchLikeStatus = async () => {
    try {
      const res = await axios.get(`${apiBase}/engagement/likes/${postId}/count`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setLikeCount(res.data.like_count);
      setLiked(res.data.user_liked);
    } catch {
      setLikeCount(0);
      setLiked(null);
    }
  };

  useEffect(() => {
    fetchLikeStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, token]);

  const handleLike = async () => {
    if (!token) {
      setError("Please login first to like posts.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (liked) {
        await axios.delete(`${apiBase}/engagement/likes/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${apiBase}/engagement/likes/${postId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
      await fetchLikeStatus();
    } catch {
      setError("Failed to update like.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2 mt-2 items-center">
      <button onClick={handleLike} disabled={loading} className={liked ? "text-green-600 border border-green-600 rounded px-2 py-1 text-xs bg-green-50 dark:bg-green-900" : "text-green-600 border border-green-600 rounded px-2 py-1 text-xs"}>{liked ? "Liked" : "Like"}</button>
      <span className="text-xs text-neutral-500">{likeCount} {likeCount === 1 ? "like" : "likes"}</span>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}

interface Post {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  created_at: string;
  views: number;
  author_id: number;
}

interface PageResponse {
  items: Post[];
  next_page: number | null;
}

interface FeedProps {
  search?: string;
  sort?: string;
}

export default function Feed({ search = "", sort = "date_desc" }: FeedProps) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const [deleting, setDeleting] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const userId = typeof window !== "undefined" ? Number(localStorage.getItem("user_id")) : null;

  const fetchPage = async ({ pageParam = 1 }: { pageParam?: number }): Promise<PageResponse> => {
    try {
      const res = await axios.get(`${apiBase}/posts`, {
        params: { page: pageParam, page_size: 10, sort },
      });
      return res.data;
    } catch (err: any) {
      if (err.code === "ERR_NETWORK") {
        throw new Error("Network error: backend unreachable at " + apiBase);
      }
      throw err;
    }
  };
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ["posts", refreshKey, sort],
    queryFn: fetchPage,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.next_page
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    const first = entries[0];
    if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, { threshold: 1 });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [onIntersect]);

  if (status === "pending") return <p>Loading...</p>;
  if (status === "error") return <p className="text-red-500 text-sm">Failed to load posts.</p>;

  const handleDelete = async (postId: number) => {
    if (!token) {
      alert("Please login first to delete posts.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setDeleting(postId);
    try {
      await axios.delete(`${apiBase}/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRefreshKey(k => k + 1);
    } catch {
      alert("Failed to delete post.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {data?.pages
        .flatMap(p => p.items)
        .filter(Boolean)
        .filter(p => {
          const q = search.toLowerCase();
          return (
            p.title?.toLowerCase().includes(q) ||
            p.body?.toLowerCase().includes(q)
          );
        })
        .map(p => (
          <article key={p.id} className="border border-neutral-200 dark:border-neutral-800 rounded p-4">
            {userId && userId === p.author_id ? (
              <h2 className="font-semibold text-lg mb-2 flex items-center justify-between">
                <Link href={`/post/${p.id}`} className="hover:underline">
                  {p.title ?? "Untitled"}
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deleting === p.id}
                  className="ml-2 text-xs text-red-600 border border-red-600 rounded px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900"
                >
                  {deleting === p.id ? "Deleting..." : "Delete"}
                </button>
              </h2>
            ) : (
              <h2 className="font-semibold text-lg mb-2">
                <Link href={`/post/${p.id}`} className="hover:underline">
                  {p.title ?? "Untitled"}
                </Link>
              </h2>
            )}
            <PostRenderer post={{
              ...p,
              content: p.body || '',
              extra: (p as any).extra || {},
            }} />
            <div className="text-xs text-neutral-500 mt-2 flex justify-between">
              <span>{new Date(p.created_at).toLocaleString()}</span>
              <span>{p.views} views</span>
            </div>
            <LikeDislike postId={p.id} />
            <div className="mt-4">
              <CommentList postId={p.id} key={refreshKey + '-' + p.id} />
              <CommentForm postId={p.id} onPosted={() => setRefreshKey(k => k + 1)} />
            </div>
          </article>
        ))}
      <div ref={sentinelRef} />
      {isFetchingNextPage && <p>Loading more...</p>}
      {!hasNextPage && <p className="text-center text-sm text-neutral-500">No more posts.</p>}
    </div>
  );
}
