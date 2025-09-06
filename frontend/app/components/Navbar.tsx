'use client'
import Link from 'next/link'
import { useTheme } from '../theme-provider'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      setLoggedIn(!!localStorage.getItem('token'));
    }
  }, []);
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800 backdrop-blur sticky top-0 z-50">
      <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-14">
        <div className="flex items-center space-x-4">
          <span className="text-xl font-bold">ChyrpLite</span>
          <nav className="hidden md:flex space-x-4 text-sm">
            <Link href="/">Home</Link>
            <Link href="/create">Create</Link>
            <Link href="/explore">Explore</Link>
            {/* About link removed */}
          </nav>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded border border-neutral-300 bg-neutral-50 text-black
              dark:border-neutral-400 dark:bg-neutral-800 dark:text-white
              transition-colors
              hover:bg-neutral-200 hover:text-black
              dark:hover:bg-neutral-600 dark:hover:text-white"
          >
            {mounted ? (
              theme === 'light' ? (
                <Image src="/icons/moon.svg" alt="Dark" width={20} height={20} />
              ) : (
                <Image src="/icons/sun.svg" alt="Light" width={20} height={20} />
              )
            ) : (
              <span className="block w-5 h-5" aria-hidden="true" />
            )}
          </button>
          {loggedIn ? (
            <button
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user_id');
                window.location.reload();
              }}
              className="ml-2 px-3 py-1 rounded border border-neutral-300 bg-neutral-50 text-black dark:border-neutral-400 dark:bg-neutral-800 dark:text-white transition-colors hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900 dark:hover:text-red-300"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth"
              className="ml-2 px-3 py-1 rounded border border-neutral-300 bg-neutral-50 text-black dark:border-neutral-400 dark:bg-neutral-800 dark:text-white transition-colors hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
