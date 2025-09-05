"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<'login'|'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (mode === 'register') {
        try {
          await axios.post(`${apiBase}/auth/register`, { username, email, password });
        } catch (regErr: any) {
          setError(regErr.response?.data?.detail || 'Registration failed');
          return; // Don't attempt login if registration failed
        }
      }
  const loginRes = await axios.post(`${apiBase}/auth/login`, { username, password });
      const token = loginRes.data.access_token;
      localStorage.setItem('token', token);
      try {
        const decoded: any = jwtDecode(token);
        if (decoded?.sub) localStorage.setItem('user_id', decoded.sub);
      } catch {
        // ignore decode errors
      }
  // Redirect to home page after login/register
  router.push("/");
    } catch (err: any) {
      // Show more specific message for debugging
      const detail = err.response?.data?.detail;
      if (detail) setError(detail);
      else if (err.code === 'ERR_NETWORK') setError('Network error: backend unreachable. Check NEXT_PUBLIC_API_URL');
      else setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 border p-4 rounded">
      <div className="flex gap-2 text-sm">
        <button type="button" className={mode==='login'? 'font-semibold':''} onClick={()=>setMode('login')}>Login</button>
        <button type="button" className={mode==='register'? 'font-semibold':''} onClick={()=>setMode('register')}>Register</button>
      </div>
      <input
        required
        value={username}
        onChange={e => setUsername(e.target.value)}
        placeholder="Username"
        className="w-full border px-2 py-1 rounded bg-transparent"
        autoComplete="username"
      />
      <div className="relative">
        <input
          required
          value={password}
          onChange={e=>setPassword(e.target.value)}
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          className="w-full border px-2 py-1 rounded bg-transparent pr-10"
          autoComplete="current-password"
        />
        <button
          type="button"
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
          onClick={e => { e.preventDefault(); setShowPassword(v => !v); }}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
      {mode === 'register' && (
        <input
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full border px-2 py-1 rounded bg-transparent"
          autoComplete="email"
        />
      )}
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button disabled={loading} className="bg-neutral-900 text-white dark:bg-white dark:text-black px-3 py-1 rounded text-sm">
        {loading? 'Please wait...' : (mode==='login' ? 'Login' : 'Create Account')}
      </button>
    </form>
  );
}
