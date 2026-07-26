import React, { useState } from 'react';
import { ViewType, UserStats } from '../types';
import { MOCK_USER_STATS } from '../data/mockData';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { BarChart3, Gauge, Clock, ShieldCheck, CheckCircle2, XCircle, TrendingUp, Calendar } from 'lucide-react';

interface AnalyticsViewProps {
  onNavigate: (view: ViewType) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<UserStats>(MOCK_USER_STATS);
  const [timeRange, setTimeRange] = useState<string>('Last 30 Days');
  const [showAllHistory, setShowAllHistory] = useState<boolean>(false);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-10 pt-24 pb-16 space-y-8">
      {/* HEADER SECTION */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
          Performance Analytics
        </h1>
        <p className="text-sm text-slate-300">
          Review your training progress and exam readiness.
        </p>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: TOTAL ATTEMPTS */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>TOTAL ATTEMPTS</span>
            <BarChart3 className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white">
            {stats.totalAttempts}
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{stats.attemptsThisWeek} this week</span>
          </div>
        </div>

        {/* Card 2: AVERAGE SCORE */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>AVERAGE SCORE</span>
            <Gauge className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white">
            {stats.averageScore}%
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Passing threshold: {stats.passingThreshold}%
          </div>
        </div>

        {/* Card 3: TIME SPENT */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>TIME SPENT</span>
            <Clock className="w-4 h-4 text-[#a078ff]" />
          </div>
          <div className="font-display text-4xl font-extrabold text-white">
            {stats.timeSpentHours}h
          </div>
          <div className="text-xs text-[#a078ff] font-medium flex items-center gap-1">
            <span>↑ High engagement</span>
          </div>
        </div>

        {/* Card 4: EXAM READINESS */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-slate-400">
            <span>EXAM READINESS</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-display text-4xl font-extrabold text-[#4cd7f6]">
            Ready
          </div>
          <div className="w-full h-2 rounded-full bg-[#111c2d] overflow-hidden border border-white/10">
            <div 
              className="h-full bg-gradient-to-r from-[#3b82f6] to-[#4cd7f6] rounded-full" 
              style={{ width: `${stats.examReadinessPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* CHARTS & RECENT ATTEMPTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* SCORE PROGRESSION CHART */}
        <div className="lg:col-span-7 glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-xl font-bold text-white">
              Score Progression
            </h2>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#111c2d] border border-white/10 text-xs font-mono text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span>{timeRange}</span>
            </div>
          </div>

          {/* Recharts Area */}
          <div className="h-[280px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart data={stats.scoreProgression}>
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
                    fontWeight: 'bold'
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
        </div>

        {/* RECENT ATTEMPTS TABLE */}
        <div className="lg:col-span-5 glass-panel p-6 md:p-8 rounded-2xl border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="font-display text-xl font-bold text-white">
              Recent Attempts
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium">
                <thead>
                  <tr className="text-slate-400 font-mono border-b border-white/10 uppercase tracking-wider">
                    <th className="pb-3">TOPIC</th>
                    <th className="pb-3 text-center">SCORE</th>
                    <th className="pb-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(showAllHistory ? stats.recentAttempts : stats.recentAttempts.slice(0, 5)).map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 font-semibold text-white">
                        {attempt.topic}
                      </td>
                      <td className="py-3.5 text-center font-mono font-bold text-slate-200">
                        {attempt.score}%
                      </td>
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
          </div>

          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="w-full py-3 rounded-xl bg-[#111c2d] border border-white/10 hover:border-[#4cd7f6]/50 text-slate-300 hover:text-white font-mono text-xs tracking-wider uppercase font-bold transition-all text-center mt-2"
          >
            {showAllHistory ? 'HIDE HISTORY' : 'VIEW ALL HISTORY'}
          </button>
        </div>
      </div>
    </div>
  );
};
