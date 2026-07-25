'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsError, setStatsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('stats');

  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      setLoading(false);
      return;
    }
    setStatsError('');
    api.getAdminStats().then(setStats).catch((err) => {
      setStatsError(err?.message || 'Statistikani yuklashda xatolik');
    }).finally(() => setLoading(false));

    setVideosLoading(true);
    setVideosError('');
    api.listVideos().then(setVideos).catch((err) => {
      setVideosError(err?.message || 'Videolar ro\'yxatini yuklashda xatolik');
    }).finally(() => setVideosLoading(false));
  }, [isAuthenticated, user, authLoading]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadStatus('');
    const form = e.target;
    const formData = new FormData();
    formData.append('video', form.video.files[0]);
    formData.append('type', form.type.value);
    formData.append('duration', form.duration.value || '0');
    formData.append('questionId', form.questionId.value || '');

    try {
      await api.uploadVideo(formData);
      setUploadStatus("\u2705 Video yuklandi");
      form.reset();
      api.listVideos().then(setVideos).catch(() => {});
    } catch (err) {
      setUploadStatus(`\u274C Xato: ${err?.message || 'Yuklashda xatolik'}`);
    }
    setUploading(false);
  };

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-16 max-w-md mx-auto space-y-4 glass-panel p-8 rounded-3xl border border-slate-800">
        <div className="text-4xl">{'\u2699\uFE0F'}</div>
        <h1 className="text-xl font-bold font-heading text-slate-100">Admin Ruxsati Talab Qilinadi</h1>
        <p className="text-sm text-slate-400">Admin huquqlariga ega akkaunt bilan tizimga kiring.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-brand-amber border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'stats', label: 'Statistika' },
    { id: 'videos', label: 'Videolar' },
  ];

  const statItems = [
    { label: 'Kategoriyalar', value: stats?.categories || 0, color: 'text-blue-400' },
    { label: 'Savollar', value: stats?.questions || 0, color: 'text-purple-400' },
    { label: 'Javob variantlari', value: stats?.answers || 0, color: 'text-emerald-400' },
    { label: 'Videolar', value: stats?.videos || 0, color: 'text-cyan-400' },
    { label: 'Test sessiyalari', value: stats?.testSessions || 0, color: 'text-amber-400' },
    { label: 'Foydalanuvchilar', value: stats?.users || 0, color: 'text-rose-400' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gradient">{'\u2699\uFE0F'} Admin Panel</h1>
          <p className="text-sm text-slate-400 mt-1">Tizim boshqaruvi</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t.id
                  ? 'bg-brand-blue text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'stats' && (
        <>
          {statsError && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{statsError}</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {statItems.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl glass-card text-center">
                <div className="text-xs text-slate-400 mb-1">{item.label}</div>
                <div className={`text-3xl font-bold font-heading ${item.color}`}>{item.value}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'videos' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl glass-card">
            <h2 className="text-lg font-bold text-slate-100 mb-4">Video Yuklash</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Video fayl</label>
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  required
                  className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-brand-blue file:text-white file:font-medium hover:file:bg-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Turi</label>
                  <select
                    name="type"
                    required
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm"
                  >
                    <option value="correct">To'g'ri</option>
                    <option value="wrong">Noto'g'ri</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Davomiyligi (sekund)</label>
                  <input
                    type="number"
                    name="duration"
                    min="0"
                    className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Savol ID (ixtiyoriy)</label>
                <input
                  type="text"
                  name="questionId"
                  className="w-full p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-sm"
                  placeholder="Savol ID sini kiriting..."
                />
              </div>
              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-semibold disabled:opacity-50"
              >
                {uploading ? 'Yuklanmoqda...' : "\u2191 Yuklash"}
              </button>
              {uploadStatus && (
                <p className={`text-sm mt-2 ${uploadStatus.startsWith('\u274C') ? 'text-red-400' : 'text-emerald-400'}`}>{uploadStatus}</p>
              )}
            </form>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-100">Yuklangan Videolar</h2>
            {videosLoading && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-4 border-brand-blue border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {videosError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{videosError}</div>
            )}
            {!videosLoading && !videosError && videos.length === 0 && (
              <p className="text-slate-400 text-sm">Hozircha videolar yo'q</p>
            )}
            {!videosLoading && videos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {videos.map((v) => (
                  <div key={v.id} className="p-4 rounded-xl glass-card flex items-center gap-4">
                    <video src={v.url} className="w-24 h-16 rounded-lg object-cover bg-black" controls />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{v.url.split('/').pop()}</p>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                        v.type === 'correct' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {v.type === 'correct' ? 'To\'g\'ri' : 'Noto\'g\'ri'}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{v.duration}s</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
