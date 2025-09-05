import PostRenderer from "../../components/PostRenderer";
import PostComments from "../../components/PostComments";
import { notFound } from "next/navigation";

interface Post {
  id: number;
  type: string;
  title: string;
  body?: string | null;
  created_at: string;
  views: number;
  author_id: number;
  extra?: any;
}

async function fetchPost(id: string): Promise<Post | null> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${apiBase}/posts/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PostDetailPage({ params }: { params: { id: string } }) {
  const post = await fetchPost(params.id);
  if (!post) return notFound();
  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <div className="text-xs text-neutral-500 flex gap-4 mb-2">
        <span>{new Date(post.created_at).toLocaleString()}</span>
        <span>{post.views} views</span>
      </div>
  <PostRenderer post={{ ...post, content: post.body || '', extra: post.extra || {} }} />
  <PostComments postId={post.id} />
    </div>
  );
}
