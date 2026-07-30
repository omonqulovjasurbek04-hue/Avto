import React, { useEffect, useMemo, useState } from 'react';
import { ViewType } from '../types';
import { useAuth } from '../context/AuthContext';
import { testsApi, TestHistoryItem, ApiError } from '../api/client';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, Gauge, ListChecks, ShieldCheck, CheckCircle2, XCircle, TrendingUp, Lock, Loader2 } from 'lucide-react';

interface AnalyticsViewProps {
  onNavigate: (view: ViewType) => void;
}

const PASS_THRESHOLD = 80;

export const AnalyticsView: React.FC<AnalyticsViewProps> = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<TestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    if (!user) return;
    testsApi
      .history()
      .then(setHistory)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Tarixni yuklab bo'lmadi"))
      .finally(() => setLoading(false));
  }, [user]);

  const finished = useMemo(
    () => history.filter((h) => h.finishedAt && h.totalCount !== null && h.totalCount > 0),
    [history],
  );

  const stats = useMemo(() => {
    const totalAttempts = history.length;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const attemptsThisWeek = history.filter((h) => new Date(h.startedAt).getTime() >= weekAgo).length;
    const percentages = finished.map((h) => Math.round(((h.totalScore || 0) / (h.totalCount || 1)) * 100));
    const averageScore = percentages.length > 0 ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length) : 0;
    const totalAnswers = history.reduce((sum, h) => sum + h._count.answers, 0);
    const recentAvg =
      percentages.length > 0
        ? Math.round(percentages.slice(-5).reduce((a, b) => a + b, 0) / Math.min(5, percentages.length))
        : 0;
    return { totalAttempts, attemptsThisWeek, averageScore, totalAnswers, examReadinessPercent: recentAvg };
  }, [history, finished]);

  const scoreProgression = useMemo(
    () =>
      finished.map((h, idx) => ({
        day: new Date(h.startedAt).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit' }),
        score: Math.round(((h.totalScore || 0) / (h.totalCount || 1)) * 100),
        idx,
      })),
    [finished],
  );

  const recentAttempts = useMemo(
    () =>
      finished.map((h) => ({
        id: h.id,
        topic: h.category.name,
        score: Math.round(((h.totalScore || 0) / (h.totalCount || 1)) * 100),
        passed: Math.round(((h.totalScore || 0) / (h.totalCount || 1)) * 100) >= PASS_THRESHOLD,
        date: new Date(h.startedAt).toLocaleString('uz-UZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      })),
    [finished],
  );

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-16 text-center space-y-6">
        <Lock className="w-12 h-12 text-[#4cd7f6] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-white">Tahlilni ko'rish uchun tizimga kiring</h1>
        <p className="text-slate-300 text-sm">Shaxsiy statistikangiz faqat ro'yxatdan o'tgan foydalanuvchilar uchun mavjud.</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      <div className="space-y-1">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">Natijalar tahlili</h1>
        <p className="text-sm text-slate-300">O'quv jarayoningiz va imtihonga tayyorligingizni kuzatib boring.</p>
      </div>

      {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>JAMI URINISHLAR</span>
            <BarChart3 className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white">{stats.totalAttempts}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{stats.attemptsThisWeek} shu hafta</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>O'RTACHA NATIJA</span>
            <Gauge className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white">{stats.averageScore}%</div>
          <div className="text-xs text-slate-400 font-medium">O'tish bali: {PASS_THRESHOLD}%</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>JAVOB BERILGAN SAVOLLAR</span>
            <ListChecks className="w-4 h-4 text-[#a078ff]" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white">{stats.totalAnswers}</div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>IMTIHONGA TAYYORLIK</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-4xl font-extrabold text-[#4cd7f6]">{stats.examReadinessPercent}%</div>
          <div className="w-full h-2 rounded-full bg-[#111c2d] overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#4cd7f6] rounded-full" style={{ width: `${stats.examReadinessPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
          <h2 className="font-display text-xl font-bold text-white">Natijalar dinamikasi</h2>

          {scoreProgression.length === 0 ? (
            <p className="text-sm text-slate-400 py-16 text-center">Hali yakunlangan urinishlar yo'q.</p>
          ) : (
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={scoreProgression}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2a3c" />
                  <XAxis dataKey="day" stroke="#8c909f" fontSize={11} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#8c909f" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#081425',
                      borderColor: '#4cd7f6',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#4cd7f6"
                    strokeWidth={3}
                    dot={{ fill: '#4cd7f6', r: 5 }}
                    activeDot={{ r: 8, fill: '#adc6ff', stroke: '#4cd7f6', strokeWidth: 2 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">So'nggi urinishlar</h2>

            {recentAttempts.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Hali tarix mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-medium">
                  <thead>
                    <tr className="text-slate-400 font-mono border-b border-white/10 uppercase tracking-wider">
                      <th className="pb-3">MAVZU</th>
                      <th className="pb-3 text-center">NATIJA</th>
                      <th className="pb-3 text-right">HOLAT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(showAllHistory ? recentAttempts : recentAttempts.slice(0, 5)).map((attempt) => (
                      <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 font-semibold text-white">{attempt.topic}</td>
                        <td className="py-3.5 text-center font-mono font-bold text-slate-200">{attempt.score}%</td>
                        <td className="py-3.5 text-right">
                          {attempt.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 inline-block" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400 inline-block" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {recentAttempts.length > 5 && (
            <button
              onClick={() => setShowAllHistory(!showAllHistory)}
              className="w-full py-3 rounded-xl bg-[#111c2d] border border-white/10 hover:border-[#4cd7f6]/50 text-slate-300 hover:text-white font-mono text-xs tracking-wider uppercase font-bold transition-all text-center mt-2"
            >
              {showAllHistory ? 'Yopish' : "Barcha tarixni ko'rish"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
