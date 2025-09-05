'use client'
import { useState } from 'react'
import axios from 'axios'

export default function CommentForm({ postId, onPosted }: { postId: number; onPosted: ()=>void }) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string|null>(null)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please login first to post a comment.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/engagement/comments`, {
        post_id: postId,
        body
      }, { headers: { Authorization: `Bearer ${token}` } })
      setBody('');
      onPosted();
    } catch (err: any) {
      setError('Failed to post comment.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className='space-y-2'>
      <textarea value={body} onChange={e=>setBody(e.target.value)} required className='w-full border rounded p-2 bg-transparent' placeholder='Add a comment' />
      {error && <div className='text-red-600 text-xs'>{error}</div>}
      <button disabled={loading} className='bg-neutral-800 text-white dark:bg-white dark:text-black text-sm px-3 py-1 rounded'>{loading? 'Posting...' : 'Post Comment'}</button>
    </form>
  )
}
