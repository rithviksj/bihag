"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [filter, setFilter] = useState("all"); // all, authenticated, anonymous

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user-activity?limit=${limit}`);
      const data = await response.json();
      setLogs(data.logs || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "authenticated") return log.email !== "anonymous";
    if (filter === "anonymous") return log.email === "anonymous";
    return true;
  });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  const getActionBadge = (action) => {
    const colors = {
      page_visit: "bg-blue-100 text-blue-800",
      oauth_login: "bg-green-100 text-green-800",
      playlist_created: "bg-purple-100 text-purple-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-gray-600">Loading analytics...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <a
            href="/"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Home
          </a>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Total Logs</div>
                <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Unique Users</div>
                <div className="text-3xl font-bold text-gray-800">{stats.uniqueUsers}</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Unique IPs</div>
                <div className="text-3xl font-bold text-gray-800">{stats.uniqueIPs}</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="text-sm text-gray-600 mb-1">Showing</div>
                <div className="text-3xl font-bold text-gray-800">{filteredLogs.length}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter:</label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="authenticated">Authenticated Only</option>
                  <option value="anonymous">Anonymous Only</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Limit:</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                >
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                  <option value={500}>500</option>
                </select>
              </div>
              <button
                onClick={fetchLogs}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Activity Log Table */}
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">User Activity Log</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">IP</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-600 font-mono text-xs">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-3 px-4">
                        {log.email === "anonymous" ? (
                          <span className="text-gray-500 italic">Anonymous</span>
                        ) : (
                          <span className="text-gray-800 font-medium">{log.email}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {log.location?.city && log.location?.country
                          ? `${log.location.city}, ${log.location.country}`
                          : log.location?.country || "Unknown"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-xs">{log.ip}</td>
                      <td className="py-3 px-4">
                        {log.action === "playlist_created" && log.metadata?.playlistName && (
                          <div className="text-xs text-gray-600">
                            <div className="font-semibold">{log.metadata.playlistName}</div>
                            <div className="text-gray-500">
                              {log.metadata.songsAdded}/{log.metadata.totalSongs} songs
                            </div>
                          </div>
                        )}
                        {log.action === "page_visit" && log.metadata?.page && (
                          <span className="text-xs text-gray-500">Page: {log.metadata.page}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredLogs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No activity logs found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
