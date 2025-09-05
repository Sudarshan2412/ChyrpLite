"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setStats(res.data);
      } catch (err: any) {
        setError("Not authorized or failed to load stats.");
      }
    };
    fetchStats();
  }, [token]);

  if (error) return <div className="text-red-600">{error}</div>;
  if (!stats) return <div>Loading admin stats...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="border rounded p-4 bg-white dark:bg-neutral-900">
        <div>Users: {stats.users}</div>
        {/* Add more stats as needed */}
      </div>
    </div>
  );
}
