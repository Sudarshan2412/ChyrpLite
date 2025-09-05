"use client";
import React, { useState } from 'react';
import Feed from './components/Feed';

export default function HomePage() {
  const [sort, setSort] = useState('date_desc');
  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">All Posts</h1>
      <div className="mb-4 flex gap-2 items-center">
        <label htmlFor="sort" className="text-sm">Sort by:</label>
        <select
          id="sort"
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="border px-2 py-1 rounded bg-white text-black dark:bg-neutral-900 dark:text-white"
        >
          <option value="date_desc">Newest</option>
          <option value="date_asc">Oldest</option>
          <option value="views_desc">Most Views</option>
          <option value="views_asc">Fewest Views</option>
          <option value="likes_desc">Most Likes</option>
          <option value="likes_asc">Fewest Likes</option>
        </select>
      </div>
      <Feed sort={sort} />
    </div>
  );
}
