'use client';

import { useState } from 'react';
import { Code, Save, Eye, RotateCcw } from 'lucide-react';

const t = (s: string) => s;

export default function CustomCSSPage() {
  const [css, setCss] = useState(`/* Custom CSS for FUTURUS */

.custom-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 12px 24px;
}

.custom-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
`);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // TODO: Save to backend
    setTimeout(() => {
      setSaving(false);
      alert('Custom CSS saved successfully!');
    }, 1000);
  };

  const handleReset = () => {
    if (confirm('Reset to default CSS?')) {
      setCss('/* Custom CSS for FUTURUS */\n\n');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{t('Custom CSS Editor')}</h1>
          <p className="text-slate-400 mt-1">
            {t('Add custom styles to your platform')}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            {t('Reset')}
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors">
            <Eye className="w-4 h-4" />
            {t('Preview')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-indigo-600/50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? t('Saving...') : t('Save CSS')}
          </button>
        </div>
      </div>

      {/* CSS Editor */}
      <div className="bg-slate-800/50 rounded-2xl border border-white/5 overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 border-b border-white/5">
          <Code className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-300">custom.css</span>
        </div>
        <textarea
          value={css}
          onChange={(e) => setCss(e.target.value)}
          className="w-full h-[600px] p-6 bg-slate-900 text-white font-mono text-sm focus:outline-none resize-none"
          placeholder="/* Write your custom CSS here */"
          spellCheck={false}
        />
        <div className="px-6 py-3 bg-slate-900 border-t border-white/5 flex justify-between text-xs text-slate-400">
          <span>{css.split('\n').length} lines</span>
          <span>{css.length} characters</span>
        </div>
      </div>

      {/* Documentation */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-lg font-bold text-blue-400 mb-3">{t('CSS Tips')}</h3>
        <ul className="text-sm text-slate-300 space-y-2 list-disc list-inside">
          <li>{t('Use CSS variables for consistent theming: var(--primary-color)')}</li>
          <li>{t('Custom CSS is loaded after default styles')}</li>
          <li>{t('Use !important sparingly to override default styles')}</li>
          <li>{t('Test changes in preview mode before saving')}</li>
          <li>{t('Backup your CSS before making major changes')}</li>
        </ul>
      </div>
    </div>
  );
}
