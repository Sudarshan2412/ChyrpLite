"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Comment {
  id: number;
  post_id: number;
  user_id?: number;
  body: string;
  created_at: string;
}

export default function CommentList({ postId }: { postId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/engagement/comments/${postId}`);
        setComments(res.data || []);
      } catch (err: any) {
        setError('Failed to load comments.');
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [postId]);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const userId = typeof window !== 'undefined' ? Number(localStorage.getItem('user_id')) : null;
  const [replyingId, setReplyingId] = useState<number|null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [replyError, setReplyError] = useState<string|null>(null);
  const [deletingId, setDeletingId] = useState<number|null>(null);

  const handleReply = async (commentId: number) => {
    if (!token) {
      setReplyError('Please login first to reply to comments.');
      return;
    }
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/engagement/comments`, {
        post_id: postId,
        body: replyBody,
        parent_id: commentId
      }, { headers: { Authorization: `Bearer ${token}` } });
      setReplyBody('');
      setReplyingId(null);
      setReplyError(null);
      // reload comments
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/engagement/comments/${postId}`);
      setComments(res.data || []);
    } catch {
      setReplyError('Failed to reply to comment.');
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!token) {
      setError('Please login first to delete comments.');
      return;
    }
    setDeletingId(commentId);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/engagement/comments/${commentId}`, { headers: { Authorization: `Bearer ${token}` } });
      // reload comments
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/engagement/comments/${postId}`);
      setComments(res.data || []);
    } catch {
      setError('Failed to delete comment.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <div>Loading comments...</div>;
  if (error) return <div className="text-red-500 text-xs">{error}</div>;
  if (!comments.length) return <div className="text-neutral-400 text-xs">No comments yet.</div>;

  return (
    <div className="space-y-2 mt-2">
      {comments.map(c => (
        <div key={c.id} className="border rounded p-2 text-sm bg-neutral-50 dark:bg-neutral-900">
          <div>{c.body}</div>
          <div className="text-xs text-neutral-500 mt-1 flex justify-between items-center">
            <span>{new Date(c.created_at).toLocaleString()}</span>
            <span className="flex gap-2">
              <button className="text-blue-600 text-xs underline" onClick={()=>{setReplyingId(c.id); setReplyBody(''); setReplyError(null);}}>Reply</button>
              {userId && userId === c.user_id && (
                <button className="text-red-600 text-xs underline" onClick={()=>handleDelete(c.id)} disabled={deletingId===c.id}>{deletingId===c.id?"Deleting...":"Delete"}</button>
              )}
            </span>
          </div>
          {replyingId === c.id && (
            <form onSubmit={e=>{e.preventDefault();handleReply(c.id);}} className="mt-2 flex gap-2">
              <input value={replyBody} onChange={e=>setReplyBody(e.target.value)} required className="border rounded px-2 py-1 flex-1" placeholder="Reply..." />
              <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded text-xs">Send</button>
              <button type="button" className="text-xs underline" onClick={()=>{setReplyingId(null);setReplyError(null);}}>Cancel</button>
            </form>
          )}
          {replyingId === c.id && replyError && <div className="text-red-600 text-xs mt-1">{replyError}</div>}
        </div>
      ))}
    </div>
  );
}
