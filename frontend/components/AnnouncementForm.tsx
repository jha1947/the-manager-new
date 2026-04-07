'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface AnnouncementFormProps {
  societyId: string;
  userId: string;
  onSuccess?: () => void;
}

type Category = 'maintenance' | 'event' | 'urgent' | 'general';

const categories: Array<{ value: Category; label: string; icon: string; color: string }> = [
  { value: 'maintenance', label: 'Maintenance', icon: '🔧', color: 'bg-blue-100 text-blue-700' },
  { value: 'event', label: 'Event', icon: '🎉', color: 'bg-purple-100 text-purple-700' },
  { value: 'urgent', label: 'Urgent', icon: '🚨', color: 'bg-red-100 text-red-700' },
  { value: 'general', label: 'General', icon: '📢', color: 'bg-green-100 text-green-700' },
];

export default function AnnouncementForm({ societyId, userId, onSuccess }: AnnouncementFormProps) {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'general' as Category,
    is_pinned: false,
    expires_at: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.title.trim()) {
        throw new Error('Please enter a title');
      }

      if (!formData.content.trim()) {
        throw new Error('Please enter the announcement content');
      }

      if (formData.content.length > 5000) {
        throw new Error('Content cannot exceed 5000 characters');
      }

      const { error: insertError } = await supabase
        .from('announcements')
        .insert({
          society_id: societyId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          created_by: userId,
          is_pinned: formData.is_pinned,
          expires_at: formData.expires_at || null,
        });

      if (insertError) throw insertError;

      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        category: 'general',
        is_pinned: false,
        expires_at: '',
      });

      setTimeout(() => {
        setSuccess(false);
        onSuccess?.();
        router.refresh();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.value === formData.category);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Announcement</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 text-sm">✓ Announcement created successfully!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter announcement title"
            maxLength={200}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Category *</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                type="button"
                className={`p-3 rounded-lg border-2 transition ${
                  formData.category === cat.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <p className="text-xs font-medium text-gray-900">{cat.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            placeholder="Write your announcement here"
            maxLength={5000}
            required
            rows={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{formData.content.length}/5000 characters</p>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pin Announcement */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_pinned"
              name="is_pinned"
              checked={formData.is_pinned}
              onChange={handleInputChange}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
            />
            <label htmlFor="is_pinned" className="text-sm font-medium text-gray-700 cursor-pointer">
              📌 Pin this announcement
            </label>
          </div>

          {/* Expiry Date */}
          <div>
            <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
              Expires (Optional)
            </label>
            <input
              type="datetime-local"
              id="expires_at"
              name="expires_at"
              value={formData.expires_at}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to keep indefinitely</p>
          </div>
        </div>

        {/* Info Box */}
        <div className={`p-4 rounded-lg ${selectedCategory?.color}`}>
          <p className="text-sm font-medium">
            {selectedCategory?.icon} This will be posted as a <strong>{selectedCategory?.label}</strong> announcement
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : '✓ Create Announcement'}
          </button>
          <button
            type="reset"
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
