"use client";
import PostEditor from "../components/PostEditor";
import { useState } from "react";

export default function CreatePage() {
  const [refresh, setRefresh] = useState(0);
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a Post</h1>
      <PostEditor onCreated={() => setRefresh((r) => r + 1)} />
    </div>
  );
}
