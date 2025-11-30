'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface SpecialsData {
  soup_name: string;
  soup_price: number;
  lunch_name: string;
  lunch_price: number;
  dinner_name: string;
  dinner_price: number;
  vegetable_name: string;
  vegetable_price: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [formData, setFormData] = useState<SpecialsData>({
    soup_name: '',
    soup_price: 0,
    lunch_name: '',
    lunch_price: 0,
    dinner_name: '',
    dinner_price: 0,
    vegetable_name: '',
    vegetable_price: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSpecials = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/specials', {
        headers: {
          Authorization: 'Bearer authenticated',
        },
      });

      if (res.status === 401) {
        sessionStorage.removeItem('admin_auth');
        router.push('/admin/login');
        return;
      }

      const data = await res.json();
      if (data) {
        setFormData({
          soup_name: data.soup_name || '',
          soup_price: data.soup_price || 0,
          lunch_name: data.lunch_name || '',
          lunch_price: data.lunch_price || 0,
          dinner_name: data.dinner_name || '',
          dinner_price: data.dinner_price || 0,
          vegetable_name: data.vegetable_name || '',
          vegetable_price: data.vegetable_price || 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch specials', error);
      setMessage({ type: 'error', text: 'Failed to load daily specials' });
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Check authentication
    const auth = sessionStorage.getItem('admin_auth');
    if (auth !== 'authenticated') {
      router.push('/admin/login');
      return;
    }

    fetchSpecials();
  }, [router, fetchSpecials]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/specials', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer authenticated',
        },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Daily specials saved successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save' });
      }
    } catch (error) {
      console.error('Failed to save specials', error);
      setMessage({ type: 'error', text: 'An error occurred while saving' });
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth');
    router.push('/admin/login');
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Daily Specials Admin</h1>
            <p className="mt-1 text-sm text-gray-600">{today}</p>
          </div>
          <button
            onClick={handleLogout}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            Logout
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div
              className={`rounded-md border px-4 py-3 text-sm ${
                message.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-red-200 bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Soup of the Day */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Soup of the Day</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="soup_name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="soup_name"
                  type="text"
                  value={formData.soup_name}
                  onChange={(e) =>
                    setFormData({ ...formData, soup_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
              <div>
                <label htmlFor="soup_price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  id="soup_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.soup_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soup_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Lunch Special */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Lunch Special</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="lunch_name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="lunch_name"
                  type="text"
                  value={formData.lunch_name}
                  onChange={(e) =>
                    setFormData({ ...formData, lunch_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
              <div>
                <label htmlFor="lunch_price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  id="lunch_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.lunch_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lunch_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Dinner Special */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Dinner Special</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dinner_name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="dinner_name"
                  type="text"
                  value={formData.dinner_name}
                  onChange={(e) =>
                    setFormData({ ...formData, dinner_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
              <div>
                <label htmlFor="dinner_price" className="block text-sm font-medium text-gray-700">
                  Price ($)
                </label>
                <input
                  id="dinner_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.dinner_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dinner_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Vegetable of the Day */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Vegetable of the Day</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="vegetable_name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  id="vegetable_name"
                  type="text"
                  value={formData.vegetable_name}
                  onChange={(e) =>
                    setFormData({ ...formData, vegetable_name: e.target.value })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="vegetable_price"
                  className="block text-sm font-medium text-gray-700"
                >
                  Price ($)
                </label>
                <input
                  id="vegetable_price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.vegetable_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vegetable_price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-gray-900 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

