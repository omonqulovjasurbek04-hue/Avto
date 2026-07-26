import React, { useState } from 'react';
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
  Edit,
  Play,
  Settings,
  Shield,
  Layers,
  FileText
} from 'lucide-react';
import { Category, Question, VideoItem, AdminStats } from '../types';
import { CATEGORIES, ADMIN_STATS, PRACTICE_QUESTIONS } from '../data/mockData';
import { VideoPlayer } from '../components/VideoPlayer';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'categories' | 'questions' | 'videos'>('stats');
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [questions, setQuestions] = useState<Question[]>(PRACTICE_QUESTIONS);
  
  // Category Form State
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Video Upload Simulation State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoType, setVideoType] = useState<'CORRECT' | 'WRONG'>('CORRECT');
  const [uploadedVideos, setUploadedVideos] = useState<VideoItem[]>([
    {
      id: 'v-1',
      type: 'CORRECT',
      title: 'Chorraha to\'g\'ri burilish - Loop',
      streamUid: 'cf-stream-01-drive-loop',
      playbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-highway-at-dusk-41558-large.mp4',
      durationSec: 15,
      status: 'ready',
      createdAt: 'Bugun 10:15'
    },
    {
      id: 'v-2',
      type: 'WRONG',
      title: 'Svetofor qiziliga o\'tib ketish - Avariya 10s',
      streamUid: 'cf-stream-02-crash-10s',
      playbackUrl: 'https://assets.mixkit.co/videos/preview/mixkit-[#1283]-car-driving-through-a-dark-tunnel-41557-large.mp4',
      durationSec: 11,
      status: 'ready',
      createdAt: 'Bugun 11:30'
    }
  ]);

  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(uploadedVideos[0]);

  // Handle Video Upload to Cloudflare Stream (Simulation)
  const handleSimulatedUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          const newVid: VideoItem = {
            id: `v-${Date.now()}`,
            type: videoType,
            title: videoTitle,
            streamUid: `cf-stream-${Math.random().toString(36).substring(2, 9)}`,
            playbackUrl: videoType === 'CORRECT'
              ? 'https://assets.mixkit.co/videos/preview/mixkit-car-driving-on-a-highway-at-dusk-41558-large.mp4'
              : 'https://assets.mixkit.co/videos/preview/mixkit-[#1283]-car-driving-through-a-dark-tunnel-41557-large.mp4',
            durationSec: videoType === 'CORRECT' ? 15 : 12,
            status: 'ready',
            createdAt: 'Hozir'
          };
          setUploadedVideos([newVid, ...uploadedVideos]);
          setPreviewVideo(newVid);
          setVideoTitle('');
          return 0;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCategoryName,
      slug: newCategoryName.toLowerCase().replace(/\s+/g, '-'),
      order: categories.length + 1,
      questionCount: 0
    };
    setCategories([...categories, newCat]);
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-[#4cd7f6]/30 hud-corner flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#4cd7f6]" />
            <span className="font-mono text-xs text-[#4cd7f6] uppercase tracking-widest font-semibold">
              ADMINISTRATION PANEL
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
            Boshqaruv va Kontent Bazasini Boshqarish
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Kategoriyalar, savollar, javoblar hamda Cloudflare Stream videolarini bir joyda boshqaring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            CLOUDFLARE STREAM ACTIVE
          </div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'stats'
              ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6] font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Tizim Statistikasi
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6] font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-4 h-4" />
          Kategoriyalar ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'questions'
              ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6] font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <FileText className="w-4 h-4" />
          Savollar va Javoblar ({questions.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
            activeTab === 'videos'
              ? 'bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 text-[#4cd7f6] font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Video className="w-4 h-4" />
          Cloudflare Video Vault ({uploadedVideos.length})
        </button>
      </div>

      {/* TAB 1: SYSTEM STATS */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">FOYDALANUVCHILAR</p>
                <p className="text-2xl font-display font-bold text-white">{ADMIN_STATS.totalUsers.toLocaleString()}</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">SAVOLLAR BAZASI</p>
                <p className="text-2xl font-display font-bold text-white">{ADMIN_STATS.totalQuestions}</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">TO'LIQ IMTIHONLAR</p>
                <p className="text-2xl font-display font-bold text-white">{ADMIN_STATS.totalSessions.toLocaleString()}</p>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono">O'RTACHA NATIJA</p>
                <p className="text-2xl font-display font-bold text-white">{ADMIN_STATS.avgScore}%</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#4cd7f6]" />
              Cloudflare Stream API Direct Upload Integration
            </h3>
            <p className="text-sm text-slate-300">
              Ushbu tizim video fayllarni to'g'ridan-to'g'ri Cloudflare Stream infratuzilmasiga yuklaydi. Barcha to'g'ri javoblarga continuous loop video, xato javoblarga esa 10s avariya videosi biriktiriladi.
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">API Endpoint:</span>
                <span className="text-[#4cd7f6]">POST https://api.cloudflare.com/client/v4/accounts/&#123;account_id&#125;/stream/direct_upload</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-400">Auth Header:</span>
                <span className="text-emerald-400">Bearer clfr_stream_live_token_****************</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Video Storage Policy:</span>
                <span className="text-amber-400">No Local Video Files stored on Server — 100% Stream CDN</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES CRUD */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 glass-panel p-6 rounded-2xl border border-white/10 space-y-4 h-fit">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-[#4cd7f6]" />
              Yangi Kategoriya Qo'shish
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Kategoriya Nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Quvib o'tish qoidalari"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#4cd7f6] hover:bg-[#38bde0] text-black font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Kategoriyani Saqlash
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white">Mavjud Kategoriyalar Ro'yxati</h3>
            <div className="space-y-3">
              {categories.map((cat, idx) => (
                <div key={cat.id} className="p-4 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 flex items-center justify-center font-mono text-xs font-bold text-[#4cd7f6]">
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white">{cat.name}</h4>
                      <p className="text-xs text-slate-400 font-mono">Slug: {cat.slug} • {cat.questionCount || 10} ta savol</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCategories(categories.filter((c) => c.id !== cat.id))}
                      className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUESTIONS & VIDEO ANSWERS */}
      {activeTab === 'questions' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">Savollar va Video-Javoblar Boshqaruvi</h3>
            <button className="px-4 py-2.5 rounded-xl bg-[#4cd7f6] text-black font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yangi Savol Qo'shish
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-1 rounded-md bg-[#4cd7f6]/10 border border-[#4cd7f6]/30 text-[#4cd7f6] text-xs font-mono uppercase">
                      {q.topic}
                    </span>
                    <h4 className="text-lg font-bold text-white mt-2">{q.id}. {q.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg bg-white/5 text-slate-300 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Option list with attached video status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {q.options.map((opt) => {
                    const isCorrect = opt.id === q.correctOptionId;
                    return (
                      <div
                        key={opt.id}
                        className={`p-3 rounded-xl border flex items-center justify-between text-sm ${
                          isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                            : 'bg-slate-900/50 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-md font-bold flex items-center justify-center text-xs ${
                            isCorrect ? 'bg-emerald-500 text-black' : 'bg-white/10 text-slate-300'
                          }`}>
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          {isCorrect ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              LOOP VIDEO (✅)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-mono flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              CRASH 10S (❌)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CLOUDFLARE VIDEO VAULT & UPLOADER */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: Video Upload Simulation */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#4cd7f6]" />
              Cloudflare Stream Direct Upload
            </h3>

            <form onSubmit={handleSimulatedUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Video Sarlavhasi</label>
                <input
                  type="text"
                  placeholder="Masalan: Chorrahada avariya holati 10s"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">Video Turi (Natija)</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setVideoType('CORRECT')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      videoType === 'CORRECT'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    TO'G'RI (LOOP ✅)
                  </button>

                  <button
                    type="button"
                    onClick={() => setVideoType('WRONG')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      videoType === 'WRONG'
                        ? 'bg-red-500/20 border-red-500 text-red-400'
                        : 'bg-black/40 border-white/10 text-slate-400'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    XATO (AVARIYA 10S ❌)
                  </button>
                </div>
              </div>

              {isUploading ? (
                <div className="space-y-2 py-2">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Cloudflare CDN'ga yuklanmoqda...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#4cd7f6] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#4cd7f6] hover:bg-[#38bde0] text-black font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Cloudflare Stream'ga Yuklash
                </button>
              )}
            </form>
          </div>

          {/* Right Preview Player and Vault */}
          <div className="lg:col-span-7 space-y-6">
            {previewVideo && (
              <div className="space-y-2">
                <h4 className="text-sm font-mono text-[#4cd7f6] uppercase tracking-wider">LIVE CLOUDFLARE PLAYER PREVIEW</h4>
                <VideoPlayer
                  playbackUrl={previewVideo.playbackUrl}
                  videoType={previewVideo.type}
                  title={previewVideo.title}
                  durationSec={previewVideo.durationSec}
                />
              </div>
            )}

            <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
              <h4 className="text-md font-bold text-white">Yuklangan Videolar Vault</h4>
              <div className="space-y-2">
                {uploadedVideos.map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => setPreviewVideo(vid)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                      previewVideo?.id === vid.id
                        ? 'bg-[#4cd7f6]/10 border-[#4cd7f6]'
                        : 'bg-black/30 border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${vid.type === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        <Play className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">{vid.title}</h5>
                        <p className="text-xs text-slate-400 font-mono">UID: {vid.streamUid} • {vid.durationSec}s</p>
                      </div>
                    </div>

                    <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                      vid.type === 'CORRECT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {vid.type === 'CORRECT' ? 'LOOP ✅' : 'CRASH 10S ❌'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
