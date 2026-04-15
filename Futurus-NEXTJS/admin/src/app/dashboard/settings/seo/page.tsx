'use client';

import { useState } from 'react';
import { Search, Save, Globe, Tag } from 'lucide-react';

const t = (s: string) => s;

export default function SEOPage() {
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'Futurus - Investment Platform',
    metaDescription: 'Invest, trade, and grow your wealth with Futurus',
    metaKeywords: 'investment, trading, futurus, cryptocurrency, stocks',
    metaAuthor: 'Futurus',
    ogTitle: 'Futurus - Investment Platform',
    ogDescription: 'Invest, trade, and grow your wealth with Futurus',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterSite: '@futurus',
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (field: string, value: string) => {
    setSeoSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to backend
    setTimeout(() => {
      setSaving(false);
      alert('SEO settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('SEO Settings')}</h1>
          <p className="text-slate-400 mt-1">
            {t('Configure search engine optimization and social media metadata')}
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-600/50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? t('Saving...') : t('Save Settings')}
        </button>
      </div>

      {/* Basic Meta Tags */}
      <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">{t('Basic Meta Tags')}</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('Meta Title')}
          </label>
          <input
            type="text"
            value={seoSettings.metaTitle}
            onChange={(e) => handleChange('metaTitle', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            placeholder="Your site title"
          />
          <p className="text-xs text-slate-500 mt-1">{seoSettings.metaTitle.length} / 60 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('Meta Description')}
          </label>
          <textarea
            value={seoSettings.metaDescription}
            onChange={(e) => handleChange('metaDescription', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Describe your site"
          />
          <p className="text-xs text-slate-500 mt-1">{seoSettings.metaDescription.length} / 160 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('Meta Keywords')}
          </label>
          <input
            type="text"
            value={seoSettings.metaKeywords}
            onChange={(e) => handleChange('metaKeywords', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            placeholder="keyword1, keyword2, keyword3"
          />
          <p className="text-xs text-slate-500 mt-1">{t('Separate keywords with commas')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('Meta Author')}
          </label>
          <input
            type="text"
            value={seoSettings.metaAuthor}
            onChange={(e) => handleChange('metaAuthor', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            placeholder="Author name"
          />
        </div>
      </div>

      {/* Open Graph Meta Tags */}
      <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">{t('Open Graph (Facebook)')}</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('OG Title')}
          </label>
          <input
            type="text"
            value={seoSettings.ogTitle}
            onChange={(e) => handleChange('ogTitle', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            placeholder="Title for social media"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('OG Description')}
          </label>
          <textarea
            value={seoSettings.ogDescription}
            onChange={(e) => handleChange('ogDescription', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
            placeholder="Description for social media"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('OG Image URL')}
          </label>
          <input
            type="text"
            value={seoSettings.ogImage}
            onChange={(e) => handleChange('ogImage', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            placeholder="https://example.com/image.jpg"
          />
          <p className="text-xs text-slate-500 mt-1">{t('Recommended: 1200x630px')}</p>
        </div>
      </div>

      {/* Twitter Card Meta Tags */}
      <div className="bg-slate-800/50 rounded-2xl border border-white/5 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">{t('Twitter Card')}</h2>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('Twitter Card Type')}
          </label>
          <select
            value={seoSettings.twitterCard}
            onChange={(e) => handleChange('twitterCard', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="summary">Summary</option>
            <option value="summary_large_image">Summary Large Image</option>
            <option value="app">App</option>
            <option value="player">Player</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {t('Twitter Site')}
          </label>
          <input
            type="text"
            value={seoSettings.twitterSite}
            onChange={(e) => handleChange('twitterSite', e.target.value)}
            className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
            placeholder="@yourhandle"
          />
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">{t('SEO Best Practices')}</h3>
        <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
          <li>{t('Keep meta titles under 60 characters')}</li>
          <li>{t('Keep meta descriptions between 120-160 characters')}</li>
          <li>{t('Use relevant keywords naturally in your content')}</li>
          <li>{t('OG images should be at least 1200x630px')}</li>
          <li>{t('Ensure all meta tags are unique for each page')}</li>
        </ul>
      </div>
    </div>
  );
}
