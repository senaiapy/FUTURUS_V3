'use client';

import { useState } from 'react';
import { Globe, Plus, Save, Trash2, Download, Upload } from 'lucide-react';

const t = (s: string) => s;

export default function LanguageManagementPage() {
  const [languages] = useState([
    { code: 'en', name: 'English', progress: 100 },
    { code: 'pt', name: 'Português', progress: 100 },
    { code: 'es', name: 'Español', progress: 85 },
  ]);

  const [selectedLang, setSelectedLang] = useState('en');
  const [translations, setTranslations] = useState<Record<string, string>>({
    'Welcome': 'Welcome',
    'Login': 'Login',
    'Register': 'Register',
    'Dashboard': 'Dashboard',
    'Markets': 'Markets',
    'Leaderboard': 'Leaderboard',
  });

  const handleSave = () => {
    alert('Translations saved successfully!');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(translations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedLang}.json`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('Language Management')}</h1>
          <p className="text-slate-400 mt-1">
            {t('Manage translations and add new languages')}
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          {t('Add Language')}
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Language List */}
        <div className="col-span-3 space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`w-full p-4 rounded-xl border transition-all text-left ${
                selectedLang === lang.code
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-slate-800/50 border-white/5 text-slate-300 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5" />
                <div className="flex-1">
                  <div className="font-semibold">{lang.name}</div>
                  <div className="text-xs opacity-70">{lang.code.toUpperCase()}</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>{t('Progress')}</span>
                  <span>{lang.progress}%</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-1.5">
                  <div
                    className="bg-white rounded-full h-1.5"
                    style={{ width: `${lang.progress}%` }}
                  />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Translation Editor */}
        <div className="col-span-9 bg-slate-800/50 rounded-2xl p-6 border border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {t('Translations')} - {languages.find(l => l.code === selectedLang)?.name}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('Export')}
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors">
                <Upload className="w-4 h-4" />
                {t('Import')}
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {t('Save')}
              </button>
            </div>
          </div>

          {/* Translation Keys */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {Object.entries(translations).map(([key, value]) => (
              <div key={key} className="grid grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    {t('Key')}
                  </label>
                  <input
                    type="text"
                    value={key}
                    disabled
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                    {t('Translation')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setTranslations({ ...translations, [key]: e.target.value })
                      }
                      className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-indigo-500 focus:outline-none"
                    />
                    <button className="p-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Key */}
          <button className="mt-4 w-full py-3 border-2 border-dashed border-slate-700 rounded-xl text-slate-400 hover:border-indigo-500 hover:text-indigo-400 transition-colors">
            <Plus className="w-5 h-5 inline mr-2" />
            {t('Add Translation Key')}
          </button>
        </div>
      </div>
    </div>
  );
}
