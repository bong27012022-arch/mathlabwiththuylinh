import React, { useState, useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { UserProfile, QuizResult } from '../../types';
import {
    TrendingUp, TrendingDown, Minus, CheckCircle, Clock, Target, Calendar,
    ChevronDown, ChevronUp, Award, Zap, BookOpen, BarChart3
} from 'lucide-react';

interface Props {
    user: UserProfile;
}

// --- HELPERS ---
const isSameDay = (d1: Date, d2: Date) =>
    d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getStartOfWeek = (d: Date) => {
    const day = d.getDay(); // 0=Sun
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon start
    return new Date(d.getFullYear(), d.getMonth(), diff);
};

const formatDateVN = (d: Date) =>
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

const formatFullDateVN = (d: Date) =>
    d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

const scorePercent = (r: QuizResult) => (r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 100 : 0);
const score10 = (r: QuizResult) => (r.totalQuestions > 0 ? (r.score / r.totalQuestions) * 10 : 0);

export const HistoryScreen: React.FC<Props> = ({ user }) => {
    const history = user.history || [];
    const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
    const [expandedDay, setExpandedDay] = useState<string | null>(null);

    // ============================================================
    // 1. FILTERED DATA — last 7 days or last 4 weeks
    // ============================================================
    const { currentData, previousData } = useMemo(() => {
        const now = new Date();
        let currentStart: Date, previousStart: Date, previousEnd: Date;

        if (viewMode === 'day') {
            // Current: last 7 days, Previous: 7 days before that
            currentStart = new Date(now);
            currentStart.setDate(now.getDate() - 6);
            currentStart = getStartOfDay(currentStart);

            previousEnd = new Date(currentStart);
            previousEnd.setMilliseconds(-1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousEnd.getDate() - 6);
            previousStart = getStartOfDay(previousStart);
        } else {
            // Current: last 4 weeks, Previous: 4 weeks before that
            currentStart = getStartOfWeek(now);
            currentStart.setDate(currentStart.getDate() - 21); // 3 more weeks back

            previousEnd = new Date(currentStart);
            previousEnd.setMilliseconds(-1);
            previousStart = new Date(previousEnd);
            previousStart.setDate(previousEnd.getDate() - 27);
            previousStart = getStartOfDay(previousStart);
        }

        const cur = history.filter(h => {
            const t = new Date(h.timestamp || 0);
            return t >= currentStart && t <= now;
        });
        const prev = history.filter(h => {
            const t = new Date(h.timestamp || 0);
            return t >= previousStart && t < currentStart;
        });

        return { currentData: cur, previousData: prev };
    }, [history, viewMode]);

    // ============================================================
    // 2. STATISTICS
    // ============================================================
    const stats = useMemo(() => {
        const calcAvg = (data: QuizResult[]) => {
            if (data.length === 0) return 0;
            return data.reduce((acc, r) => acc + score10(r), 0) / data.length;
        };

        const totalQuizzes = currentData.length;
        const avgScore = calcAvg(currentData);
        const prevAvg = calcAvg(previousData);
        const totalSeconds = currentData.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0);

        // Progress delta
        let progressDelta = 0;
        let progressDirection: 'up' | 'down' | 'same' = 'same';
        if (previousData.length > 0 && currentData.length > 0) {
            progressDelta = avgScore - prevAvg;
            progressDirection = progressDelta > 0.2 ? 'up' : progressDelta < -0.2 ? 'down' : 'same';
        }

        // Streak (consecutive days with activity)
        let streak = 0;
        const today = getStartOfDay(new Date());
        for (let i = 0; i < 365; i++) {
            const checkDay = new Date(today);
            checkDay.setDate(today.getDate() - i);
            const hasActivity = history.some(h => isSameDay(new Date(h.timestamp || 0), checkDay));
            if (hasActivity) streak++;
            else break;
        }

        return { totalQuizzes, avgScore, prevAvg, totalSeconds, progressDelta, progressDirection, streak };
    }, [currentData, previousData, history]);

    // ============================================================
    // 3. CHART DATA
    // ============================================================
    const chartData = useMemo(() => {
        const now = new Date();
        const points: { name: string; score: number; count: number; fullDate: string }[] = [];

        if (viewMode === 'day') {
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dayStr = d.toDateString();
                const dayQuizzes = history.filter(h => new Date(h.timestamp || 0).toDateString() === dayStr);
                const avg = dayQuizzes.length > 0
                    ? dayQuizzes.reduce((acc, q) => acc + score10(q), 0) / dayQuizzes.length
                    : 0;
                points.push({
                    name: formatDateVN(d),
                    score: parseFloat(avg.toFixed(1)),
                    count: dayQuizzes.length,
                    fullDate: dayStr
                });
            }
        } else {
            for (let w = 3; w >= 0; w--) {
                const weekStart = getStartOfWeek(now);
                weekStart.setDate(weekStart.getDate() - w * 7);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekStart.getDate() + 7);

                const weekQuizzes = history.filter(h => {
                    const t = new Date(h.timestamp || 0);
                    return t >= weekStart && t < weekEnd;
                });
                const avg = weekQuizzes.length > 0
                    ? weekQuizzes.reduce((acc, q) => acc + score10(q), 0) / weekQuizzes.length
                    : 0;
                points.push({
                    name: `${formatDateVN(weekStart)}`,
                    score: parseFloat(avg.toFixed(1)),
                    count: weekQuizzes.length,
                    fullDate: `Tuần ${formatDateVN(weekStart)} - ${formatDateVN(weekEnd)}`
                });
            }
        }
        return points;
    }, [history, viewMode]);

    // ============================================================
    // 4. GROUPED HISTORY LIST
    // ============================================================
    const groupedHistory = useMemo(() => {
        const groups: Record<string, QuizResult[]> = {};
        const sorted = [...currentData].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        sorted.forEach(item => {
            const key = new Date(item.timestamp || 0).toDateString();
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.entries(groups).map(([dateStr, items]) => ({
            dateStr,
            date: new Date(dateStr),
            items,
            avgScore: items.reduce((acc, r) => acc + score10(r), 0) / items.length,
            totalTime: items.reduce((acc, r) => acc + (r.timeSpentSeconds || 0), 0)
        }));
    }, [currentData]);

    // ============================================================
    // 5. PROGRESS LEVEL
    // ============================================================
    const progressLevel = useMemo(() => {
        if (stats.avgScore >= 9) return { label: 'Xuất sắc', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', emoji: '🌟' };
        if (stats.avgScore >= 7) return { label: 'Giỏi', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', emoji: '🎯' };
        if (stats.avgScore >= 5) return { label: 'Khá', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', emoji: '📚' };
        if (stats.avgScore >= 3) return { label: 'Trung bình', color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', emoji: '💪' };
        return { label: 'Cần cố gắng', color: 'text-red-600', bg: 'bg-red-50 border-red-200', emoji: '🔥' };
    }, [stats.avgScore]);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m} phút`;
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="bg-primary-surface dark:bg-dark-bg min-h-screen text-gray-900 dark:text-white pb-24 font-display transition-colors">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-teal-100 dark:border-teal-900/30">
                <div className="flex items-center justify-between p-4 max-w-5xl mx-auto w-full">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-br from-primary to-teal-600 p-2.5 rounded-xl text-white shadow-lg shadow-teal-500/20">
                            <BarChart3 size={24} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-tight">Lịch sử học tập</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.name || 'Học sinh'} • Lớp {user.grade}</p>
                        </div>
                    </div>
                    {/* Streak Badge */}
                    {stats.streak > 0 && (
                        <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/20 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-800">
                            <Zap size={16} className="text-orange-500" fill="currentColor" />
                            <span className="text-xs font-bold text-orange-700 dark:text-orange-400">{stats.streak} ngày liên tiếp</span>
                        </div>
                    )}
                </div>
            </header>

            <main className="p-4 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto">

                {/* Toggle Day / Week */}
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Thống kê</h2>
                    <div className="flex h-10 bg-teal-50 dark:bg-teal-900/20 p-1 rounded-xl border border-teal-100 dark:border-teal-800/30">
                        <button
                            onClick={() => setViewMode('day')}
                            className={`px-4 rounded-lg text-xs font-bold transition-all ${viewMode === 'day' ? 'bg-white dark:bg-dark-surface text-teal-900 dark:text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            7 ngày
                        </button>
                        <button
                            onClick={() => setViewMode('week')}
                            className={`px-4 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white dark:bg-dark-surface text-teal-900 dark:text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                        >
                            4 tuần
                        </button>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Total Quizzes */}
                    <div className="flex flex-col gap-2 rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="size-9 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                            <CheckCircle size={20} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Bài đã làm</p>
                        <p className="text-2xl font-bold">{stats.totalQuizzes} <span className="text-xs font-normal text-slate-400">bài</span></p>
                    </div>

                    {/* Average Score */}
                    <div className="flex flex-col gap-2 rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="size-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Target size={20} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Điểm TB</p>
                        <p className="text-2xl font-bold">{stats.avgScore.toFixed(1)} <span className="text-xs font-normal text-slate-400">/10</span></p>
                    </div>

                    {/* Total Time */}
                    <div className="flex flex-col gap-2 rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="size-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Clock size={20} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Thời gian học</p>
                        <p className="text-2xl font-bold whitespace-nowrap">{formatTime(stats.totalSeconds)}</p>
                    </div>

                    {/* Progress */}
                    <div className={`flex flex-col gap-2 rounded-2xl p-4 shadow-sm border ${progressLevel.bg}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl">{progressLevel.emoji}</span>
                            {stats.progressDirection === 'up' && (
                                <div className="flex items-center gap-1 text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <TrendingUp size={14} />
                                    <span className="text-[11px] font-bold">+{stats.progressDelta.toFixed(1)}</span>
                                </div>
                            )}
                            {stats.progressDirection === 'down' && (
                                <div className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                                    <TrendingDown size={14} />
                                    <span className="text-[11px] font-bold">{stats.progressDelta.toFixed(1)}</span>
                                </div>
                            )}
                            {stats.progressDirection === 'same' && previousData.length > 0 && (
                                <div className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <Minus size={14} />
                                    <span className="text-[11px] font-bold">Ổn định</span>
                                </div>
                            )}
                        </div>
                        <p className={`text-xs font-medium ${progressLevel.color}`}>Mức độ</p>
                        <p className={`text-lg font-bold ${progressLevel.color}`}>{progressLevel.label}</p>
                    </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 min-h-[280px] flex flex-col">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-lg font-bold leading-tight">Biểu đồ tiến bộ</p>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                {viewMode === 'day' ? '7 ngày gần đây' : '4 tuần gần đây'}
                            </p>
                        </div>
                        {stats.progressDirection === 'up' && (
                            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                <TrendingUp size={16} /> Đang tiến bộ
                            </div>
                        )}
                    </div>
                    <div className="w-full flex-1 min-h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="historyColorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                    formatter={(value: number, _name: string, props: any) => [`${value}/10 (${props.payload.count} bài)`, 'Điểm TB']}
                                    labelStyle={{ color: '#0d9488', fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#historyColorScore)" dot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed History List */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <BookOpen className="text-primary w-5 h-5" />
                            Chi tiết bài làm
                        </h2>
                        <span className="text-xs font-bold text-primary bg-primary-surface dark:bg-teal-900/30 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800">
                            {currentData.length} bài
                        </span>
                    </div>

                    {groupedHistory.length === 0 ? (
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-10 shadow-sm border border-slate-100 dark:border-slate-700 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3 mx-auto">
                                <Calendar className="text-gray-400 w-8 h-8" />
                            </div>
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Chưa có bài làm nào</p>
                            <p className="text-xs text-gray-400 mt-1">Hãy hoàn thành bài học để xem lịch sử tại đây!</p>
                        </div>
                    ) : (
                        groupedHistory.map(group => {
                            const dayKey = group.dateStr;
                            const isExpanded = expandedDay === dayKey || groupedHistory.length <= 2;
                            const isToday = isSameDay(group.date, new Date());

                            return (
                                <div key={dayKey} className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                    {/* Day Header */}
                                    <button
                                        onClick={() => setExpandedDay(expandedDay === dayKey ? null : dayKey)}
                                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${isToday ? 'bg-primary text-white' : 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'}`}>
                                                {group.date.getDate()}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {isToday ? 'Hôm nay' : formatFullDateVN(group.date)}
                                                </p>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <span className="text-xs text-gray-500">{group.items.length} bài</span>
                                                    <span className="text-xs text-gray-500">•</span>
                                                    <span className="text-xs text-gray-500">TB: {group.avgScore.toFixed(1)}/10</span>
                                                    <span className="text-xs text-gray-500">•</span>
                                                    <span className="text-xs text-gray-500">{formatTime(group.totalTime)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${group.avgScore >= 8 ? 'bg-emerald-100 text-emerald-700' :
                                                    group.avgScore >= 5 ? 'bg-amber-100 text-amber-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {group.avgScore.toFixed(1)}
                                            </div>
                                            {isExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                                        </div>
                                    </button>

                                    {/* Expanded Quiz Items */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 dark:border-gray-800">
                                            {group.items.map((item, idx) => {
                                                const pct = scorePercent(item);
                                                const isPass = pct >= 50;
                                                return (
                                                    <div key={idx} className="flex items-center gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-b-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${pct >= 80 ? 'bg-emerald-100 text-emerald-700' :
                                                                pct >= 50 ? 'bg-amber-100 text-amber-700' :
                                                                    'bg-red-100 text-red-700'
                                                            }`}>
                                                            {score10(item).toFixed(0)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.unitTitle || 'Bài tập'}</p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {new Date(item.timestamp || 0).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                <span className="text-[11px] text-gray-400">•</span>
                                                                <span className="text-[11px] text-gray-400">{Math.round((item.timeSpentSeconds || 0) / 60)} phút</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                                            <div className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                                {item.score}/{item.totalQuestions}
                                                            </div>
                                                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Summary Footer */}
                {history.length > 0 && (
                    <div className="bg-gradient-to-r from-teal-50 to-white dark:from-surface-dark dark:to-dark-bg border border-teal-200 dark:border-teal-900 rounded-2xl p-5 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500" />
                        <div className="flex gap-4 items-start relative z-10">
                            <div className="bg-white dark:bg-slate-700 p-2.5 rounded-xl shadow-sm shrink-0">
                                <Award className="text-primary w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">Tổng kết chung</p>
                                <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                                    {user.name || 'Bạn'} đã hoàn thành tổng cộng <span className="font-bold text-teal-700 dark:text-primary">{history.length} bài tập</span>.
                                    Điểm trung bình toàn bộ: <span className="font-bold text-teal-700 dark:text-primary">
                                        {(history.reduce((acc, r) => acc + score10(r), 0) / history.length).toFixed(1)}/10
                                    </span>.
                                    {stats.progressDirection === 'up' && ' Bạn đang tiến bộ rất tốt! Hãy tiếp tục phát huy! 🚀'}
                                    {stats.progressDirection === 'down' && ' Đừng nản lòng, hãy ôn lại kiến thức và thử lại nhé! 💪'}
                                    {stats.progressDirection === 'same' && ' Phong độ ổn định, hãy cố gắng thêm để đạt kết quả cao hơn! ✨'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
