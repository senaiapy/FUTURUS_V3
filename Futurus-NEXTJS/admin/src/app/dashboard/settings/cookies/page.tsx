'use client';

import { useState, useEffect } from 'react';
import { Download, RefreshCw, TrendingUp, TrendingDown, Users } from 'lucide-react';

interface CookieConsent {
  id: number;
  userId: number | null;
  ipAddress: string | null;
  sessionId: string | null;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  acceptedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
  } | null;
}

interface Stats {
  total: number;
  analyticsAccepted: number;
  marketingAccepted: number;
  analyticsRate: number;
  marketingRate: number;
}

export default function CookieConsentsPage() {
  const [consents, setConsents] = useState<CookieConsent[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [consentsRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/cookie-consents?limit=100`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/cookie-consents/stats`),
      ]);

      if (consentsRes.ok) {
        const data = await consentsRes.json();
        setConsents(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch cookie consent data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToCSV = () => {
    const headers = ['ID', 'User ID', 'Username', 'Email', 'IP Address', 'Session ID', 'Analytics', 'Marketing', 'Functional', 'Accepted At'];
    const rows = consents.map(c => [
      c.id,
      c.userId || 'Guest',
      c.user?.username || 'N/A',
      c.user?.email || 'N/A',
      c.ipAddress || 'N/A',
      c.sessionId || 'N/A',
      c.analytics ? 'Yes' : 'No',
      c.marketing ? 'Yes' : 'No',
      c.functional ? 'Yes' : 'No',
      new Date(c.acceptedAt).toLocaleString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cookie-consents-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cookie Consents</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            GDPR compliance and user consent tracking
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Consents</p>
                <p className="text-3xl font-bold mt-2">{stats.total.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analytics Acceptance</p>
                <p className="text-3xl font-bold mt-2">{stats.analyticsRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stats.analyticsAccepted} of {stats.total}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Marketing Acceptance</p>
                <p className="text-3xl font-bold mt-2">{stats.marketingRate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {stats.marketingAccepted} of {stats.total}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingDown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Consents Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Analytics
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Marketing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Accepted At
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {consents.map((consent) => (
                <tr key={consent.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    #{consent.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {consent.user ? (
                      <div>
                        <div className="text-sm font-medium">{consent.user.username}</div>
                        <div className="text-sm text-gray-500">{consent.user.email}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Guest</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {consent.ipAddress || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      consent.analytics
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {consent.analytics ? 'Accepted' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      consent.marketing
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {consent.marketing ? 'Accepted' : 'Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(consent.acceptedAt).toLocaleDateString()} {new Date(consent.acceptedAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {consents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No cookie consents recorded yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
