import React, { useEffect, useState } from 'react';
import {
  Video,
  Plus,
  FolderPlus,
  BarChart2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Zap,
  Trash2,
  Shield,
  Layers,
  FileText,
  Lock,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  adminApi,
  categoriesApi,
  questionsApi,
  ApiCategory,
  AdminQuestion,
  AdminStats,
  AdminVideo,
  ApiError,
} from '../api/client';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const AdminView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'stats' | 'categories' | 'questions' | 'videos'>('stats');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newAnswers, setNewAnswers] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
  ]);

  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([adminApi.stats(), categoriesApi.list(), adminApi.listVideos()])
      .then(([s, cats, vids]) => {
        setStats(s);
        setCategories(cats);
        setVideos(vids);
        if (cats.length > 0) setSelectedCategoryId(cats[0].id);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin || !selectedCategoryId) return;
    adminApi
      .categoryQuestions(selectedCategoryId)
      .then(setQuestions)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Savollarni yuklab bo'lmadi"));
  }, [isAdmin, selectedCategoryId]);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center space-y-6">
        <Lock className="w-12 h-12 text-[#4cd7f6] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-white">Ruxsat yo'q</h1>
        <p className="text-slate-300 text-sm">Boshqaruv paneli faqat ADMIN huquqiga ega foydalanuvchilar uchun mavjud.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-32 pb-16 flex justify-center">
        <Loader2 className="w-8 h-8 text-[#4cd7f6] animate-spin" />
      </div>
    );
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const created = await adminApi.createCategory(newCategoryName, slugify(newCategoryName), categories.length + 1);
      setCategories((prev) => [...prev, created]);
      setNewCategoryName('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategoriya qo'shib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setError(null);
    try {
      await adminApi.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Kategoriyani o'chirib bo'lmadi");
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    const validAnswers = newAnswers.filter((a) => a.text.trim());
    if (!selectedCategoryId || !newQuestionText.trim() || validAnswers.length < 2) return;
    setSaving(true);
    setError(null);
    try {
      const question = await questionsApi.create(selectedCategoryId, newQuestionText, questions.length + 1);
      for (const a of validAnswers) {
        await questionsApi.addAnswer(question.id, a.text, a.isCorrect);
      }
      const refreshed = await adminApi.categoryQuestions(selectedCategoryId);
      setQuestions(refreshed);
      setNewQuestionText('');
      setNewAnswers([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Savol qo'shib bo'lmadi");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    setError(null);
    try {
      await questionsApi.delete(id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Savolni o'chirib bo'lmadi");
    }
  };

  const handleRequestUploadUrl = async () => {
    setUploadStatus(null);
    try {
      const res = await adminApi.getVideoUploadUrl();
      setUploadStatus(`Yuklash havolasi tayyor: videoId=${res.videoId}`);
    } catch (err) {
      setUploadStatus(err instanceof ApiError ? err.message : "Yuklash havolasini olib bo'lmadi");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-4 md:px-10 pt-24">
      <div className="glass-panel p-6 rounded-2xl border border-[#4cd7f6]/30 hud-corner flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#4cd7f6]" />
            <span className="font-mono text-xs text-[#4cd7f6] uppercase tracking-widest font-semibold">ADMINISTRATION PANEL</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">Boshqaruv va kontent bazasini boshqarish</h1>
          <p className="text-slate-400 text-sm mt-1">Kategoriyalar, savollar, javoblar hamda Cloudflare Stream videolarini bir joyda boshqaring.</p>
        </div>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>}

      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {(
          [
            { id: 'stats', label: 'Tizim statistikasi', icon: BarChart2 },
            { id: 'categories', label: `Kategoriyalar (${categories.length})`, icon: Layers },
            { id: 'questions', label: `Savollar va javoblar`, icon: FileText },
            { id: 'videos', label: `Video Vault (${videos.length})`, icon: Video },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.id ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6] font-semibold' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'stats' && stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">FOYDALANUVCHILAR</p>
              <p className="text-2xl font-display font-bold text-white">{stats.users}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">SAVOLLAR BAZASI</p>
              <p className="text-2xl font-display font-bold text-white">{stats.questions}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">TEST SESSIYALARI</p>
              <p className="text-2xl font-display font-bold text-white">{stats.testSessions}</p>
            </div>
          </div>
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-mono">O'RTACHA NATIJA</p>
              <p className="text-2xl font-display font-bold text-white">{stats.avgScore}%</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/10 space-y-4 h-fit">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#4cd7f6]" />
              Yangi kategoriya qo'shish
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <input
                type="text"
                placeholder="Masalan: Quvib o'tish qoidalari"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#4cd7f6]"
              />
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-[#4cd7f6] hover:bg-[#38bde0] text-black font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Saqlash
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Mavjud kategoriyalar</h3>
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 flex items-center justify-center font-mono text-xs font-bold text-[#4cd7f6]">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{cat.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">Slug: {cat.slug} • {cat._count?.questions ?? 0} ta savol</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat.id)} className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategoryId === cat.id ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6]' : 'bg-[#111c2d]/60 text-slate-300 border border-white/5'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Yangi savol qo'shish</h3>
            <form onSubmit={handleAddQuestion} className="space-y-3">
              <input
                type="text"
                placeholder="Savol matni"
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#4cd7f6]"
              />
              {newAnswers.map((ans, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct-answer"
                    checked={ans.isCorrect}
                    onChange={() => setNewAnswers((prev) => prev.map((a, i) => ({ ...a, isCorrect: i === idx })))}
                    className="accent-emerald-500 w-4 h-4"
                  />
                  <input
                    type="text"
                    placeholder={`Javob ${idx + 1}`}
                    value={ans.text}
                    onChange={(e) => setNewAnswers((prev) => prev.map((a, i) => (i === idx ? { ...a, text: e.target.value } : a)))}
                    className="flex-1 px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNewAnswers((prev) => [...prev, { text: '', isCorrect: false }])}
                className="text-xs text-[#4cd7f6] font-semibold hover:underline"
              >
                + Yana bitta javob qo'shish
              </button>
              <button
                type="submit"
                disabled={saving || !selectedCategoryId}
                className="w-full py-3 rounded-xl bg-[#4cd7f6] text-black font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Savolni saqlash
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="text-lg font-bold text-white">{q.text}</h4>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {q.answers.map((opt) => (
                    <div
                      key={opt.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                        opt.isCorrect ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200' : 'bg-slate-900/50 border-white/10 text-slate-300'
                      }`}
                    >
                      <span>{opt.text}</span>
                      {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {questions.length === 0 && <p className="text-sm text-slate-400 text-center py-10">Bu kategoriyada savollar yo'q.</p>}
          </div>
        </div>
      )}

      {activeTab === 'videos' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#4cd7f6]" />
              Cloudflare Stream Direct Upload
            </h3>
            <p className="text-sm text-slate-300">
              Ushbu tizim video fayllarni to'g'ridan-to'g'ri Cloudflare Stream infratuzilmasiga yuklaydi. Ishlashi uchun backend'da{' '}
              <code className="text-[#4cd7f6]">CLOUDFLARE_ACCOUNT_ID</code> va <code className="text-[#4cd7f6]">CLOUDFLARE_API_TOKEN</code> sozlangan bo'lishi kerak.
            </p>
            <button
              onClick={handleRequestUploadUrl}
              className="px-6 py-2.5 rounded-xl bg-[#4cd7f6] hover:bg-[#38bde0] text-black font-semibold transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Yuklash havolasini so'rash
            </button>
            {uploadStatus && (
              <div className="p-3 rounded-xl bg-[#111c2d] border border-white/10 text-xs font-mono text-slate-300">{uploadStatus}</div>
            )}
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
            <h4 className="text-md font-bold text-white">Yuklangan videolar</h4>
            {videos.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">Hali video yuklanmagan. Bu loyihada javoblar SVG simulyatsiya bilan ko'rsatiladi.</p>
            ) : (
              <div className="space-y-2">
                {videos.map((vid) => (
                  <div key={vid.id} className="p-3 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vid.type === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {vid.type === 'CORRECT' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{vid.title || vid.streamUid}</h5>
                        <p className="text-xs text-slate-400 font-mono">{vid.status} • {vid.durationSec}s • {vid._count.answers} ta javobda ishlatilgan</p>
                      </div>
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
};
