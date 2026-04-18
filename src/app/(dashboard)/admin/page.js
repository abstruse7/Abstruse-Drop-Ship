"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (session?.user?.role !== "ADMIN" && session?.user?.role !== "OWNER") {
      router.push("/");
    } else {
      fetchData();
    }
  }, [session, status]);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/admin/stats");
    const data = await res.json();
    setStats(data.stats);
    setDistributors(data.distributors || []);
    setLoading(false);
  }

  async function toggleApproval(distributorId, isApproved) {
    await fetch(`/api/admin/distributors/${distributorId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: !isApproved }),
    });
    fetchData();
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.users || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Distributors</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.distributors || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Products</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.products || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{stats?.orders || 0}</p>
        </div>
      </div>

      {/* Distributors */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Distributors</h2>
      {distributors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-500">
          No distributors have signed up yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Company</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Products</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((dist) => (
                <tr key={dist.id} className="border-b border-gray-100">
                  <td className="px-6 py-4 font-medium text-gray-900">{dist.companyName}</td>
                  <td className="px-6 py-4 text-gray-500">{dist.contactEmail}</td>
                  <td className="px-6 py-4 text-gray-500">{dist._count?.products || 0}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${dist.isApproved ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {dist.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleApproval(dist.id, dist.isApproved)}
                      className={`text-sm px-3 py-1 rounded transition ${
                        dist.isApproved
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-green-50 text-green-600 hover:bg-green-100"
                      }`}
                    >
                      {dist.isApproved ? "Revoke" : "Approve"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
