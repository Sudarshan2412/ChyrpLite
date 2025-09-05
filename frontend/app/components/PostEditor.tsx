"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

export default function PostEditor({ onCreated }: { onCreated: () => void }) {
  const [type, setType] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  // Restore draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const draft = window.localStorage.getItem('postDraft');
      if (draft) {
        try {
          const { type, title, body } = JSON.parse(draft);
          if (type) setType(type);
          if (title) setTitle(title);
          if (body) setBody(body);
        } catch {}
      }
    }
  }, []);
  // Save draft on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('postDraft', JSON.stringify({ type, title, body }));
    }
  }, [type, title, body]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // MAPTCHA state
  const [captchaId, setCaptchaId] = useState<string|null>(null);
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  useEffect(() => {
    const loadCaptcha = async () => {
      try {
        const res = await axios.get(`${apiBase}/captcha/new`);
        setCaptchaId(res.data.id);
        setCaptchaQuestion(res.data.question);
        setCaptchaAnswer('');
      } catch {}
    };
    loadCaptcha();
  }, [apiBase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please login first to create a post.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      let extra = {};
      if (type === "photo" && file) {
        // Upload file first
        const form = new FormData();
        form.append("file", file);
        const res = await axios.post(`${apiBase}/uploads`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        extra = { url: res.data.url, filename: res.data.filename };
      }
      await axios.post(
        `${apiBase}/posts`,
        {
          type,
          title,
          body,
          extra: Object.keys(extra).length ? JSON.stringify(extra) : undefined,
          captcha_id: captchaId,
          captcha_answer: captchaAnswer ? Number(captchaAnswer) : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setBody("");
      setFile(null);
      setCaptchaAnswer('');
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('postDraft');
      }
      onCreated();
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 401) setError('Not authorized. Please log in again.');
        else if (err.response.status === 400 && err.response.data?.detail === 'Invalid captcha') {
          setError('Incorrect answer. Try again.');
          // reload captcha
          const res = await axios.get(`${apiBase}/captcha/new`);
          setCaptchaId(res.data.id);
          setCaptchaQuestion(res.data.question);
          setCaptchaAnswer('');
        } else setError(err.response.data?.detail || 'Failed to create post.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Backend unreachable at ' + apiBase);
      } else {
        setError('Failed to create post.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
      <div className="flex gap-2">
        <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-2 py-1 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
          <option value="text">Text</option>
          <option value="photo">Photo</option>
          <option value="quote">Quote</option>
          <option value="link">Link</option>
          <option value="video">Video</option>
          <option value="audio">Audio</option>
          <option value="uploader">Uploader</option>
        </select>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="border rounded px-2 py-1 flex-1 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
      </div>
      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Write your post (Markdown supported)"
        className="w-full border rounded p-2 bg-transparent dark:bg-neutral-800 text-neutral-800 dark:text-neutral-100 border-neutral-300 dark:border-neutral-600 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        rows={type === "text" ? 4 : 2}
        required={type === "text" || type === "quote"}
      />
      {type === "photo" && (
        <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-neutral-800 dark:text-neutral-100" />
      )}
      {captchaId && (
        <div className="flex items-center gap-2 text-sm">
          <span>{captchaQuestion} =</span>
          <input value={captchaAnswer} onChange={e=>setCaptchaAnswer(e.target.value)} required className="border px-2 py-1 rounded bg-transparent w-20" />
          <button type='button' onClick={async()=>{
            const res = await axios.get(`${apiBase}/captcha/new`);
            setCaptchaId(res.data.id);
            setCaptchaQuestion(res.data.question);
            setCaptchaAnswer('');
          }} className="text-xs underline">refresh</button>
        </div>
      )}
      {error && <div className="text-red-600 text-xs">{error}</div>}
      <button
        type="submit"
        disabled={loading}
        className="bg-neutral-800 text-white dark:bg-white dark:text-black text-sm px-3 py-1 rounded"
      >
        {loading ? "Posting..." : "Post"}
      </button>
    </form>
  );
}
