"use client";
import React, { useState } from "react";
import Feed from "../components/Feed";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  return (
    <div className="space-y-8 max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Explore Posts</h1>
      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search posts by title or content..."
        className="w-full border px-2 py-1 rounded mb-4"
      />
      <Feed search={search} />
    </div>
  );
}
