
import React from 'react';
import { ArrowLeft, Edit, Cake, ArrowRight, Brain, School, Star, Flame, Clock, Calendar, LogOut } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
    user: UserProfile;
    onLogout?: () => void;
}

export const ProfileScreen: React.FC<Props> = ({ user, onLogout }) => {
    const history = user.history || [];

    // Calculate Stats
    const totalLessons = history.length;
    const totalScore = history.reduce((acc, curr) => acc + (curr.score * 10), 0);

    // Proper Streak Logic — count consecutive days with activity going backwards
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();

    let streak = 0;
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
        const checkDay = new Date(todayDate);
        checkDay.setDate(todayDate.getDate() - i);
        const hasActivity = history.some(h => isSameDay(new Date(h.timestamp || 0), checkDay));
        if (hasActivity) streak++;
        else break;
    }

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "";
        return new Date(timestamp).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const displayDob = (dob: string) => {
        if (!dob) return "Chưa cập nhật";
        // If user typed dd/mm/yyyy manually, display it as is
        if (dob.includes('/')) return dob;

        // Fallback for yyyy-mm-dd
        const date = new Date(dob);
        if (!isNaN(date.getTime())) return date.toLocaleDateString('vi-VN');

        return dob;
    };

    return (
        <div className="bg-primary-surface dark:bg-dark-bg text-teal-900 dark:text-white font-display antialiased selection:bg-primary selection:text-white pb-28 min-h-screen">
            {/* Header */}
            <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 bg-primary-surface/90 dark:bg-dark-bg/90 backdrop-blur-md md:hidden">
                <button className="flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-primary hover:bg-primary-light transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-bold tracking-tight text-primary">Hồ sơ học sinh</h1>
                <button className="flex items-center justify-center w-10 h-10 -mr-2 rounded-full text-primary hover:bg-primary-light transition-colors">
                    <Edit className="w-5 h-5" />
                </button>
            </div>

            <div className="max-w-6xl mx-auto md:p-8">
                {/* Desktop Header Title */}
                <div className="hidden md:flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-900 dark:text-white">Hồ sơ cá nhân</h1>
                        <p className="text-slate-500 mt-1">Quản lý tiến độ và thông tin học tập của bạn</p>
                    </div>
                    <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-700 hover:bg-gray-50">
                        <Edit size={16} />
                        Chỉnh sửa
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column: Profile Info */}
                    <div className="md:col-span-1 flex flex-col gap-6">
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-teal-100 dark:border-gray-800 flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-[6px] border-white dark:border-dark-surface shadow-xl shadow-teal-200 dark:shadow-teal-900/20">
                                    <img
                                        alt="Portrait"
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMDmFOz0iXSHXNz-grXfWmILd1j-G4LZynAKufHgvqT5Y7pUUDKSf9l0Ht-zUR1iPDVE6Z81IWMqd3Y1HFqczV1Bo6ByuCEwSfJwSUxE-Js2mwd9PUC35lYCm0hNa3cXzX6poV4pVuA-UOKZwND8eprgnmz5NDTmvxYKAf8Yvng34OzKB3texUGviOuQoNB8lmXeFPm_buf6WcLw5-4lAiAdQwuEqewZl5nopohU1bhwKXj8zY5rRqW9q9H7EKxkxjjdUkqrDoiYo"
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-teal-400 to-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white dark:border-dark-surface shadow-lg z-10">
                                    <span className="font-bold text-lg">{user.numerologyNumber}</span>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                                <h2 className="text-2xl font-bold tracking-tight text-teal-900 dark:text-white">{user.name || "Học Sinh"}</h2>
                                <div className="flex items-center justify-center gap-2 mt-2 text-teal-600/80 dark:text-teal-300 text-sm font-medium">
                                    <Cake className="w-4 h-4" />
                                    <span>{displayDob(user.dob)}</span>
                                    <span className="w-1 h-1 rounded-full bg-teal-300"></span>
                                    <span>Số chủ đạo</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-sm border border-teal-100 dark:border-gray-800 relative overflow-hidden">
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-50 dark:bg-teal-900/20 rounded-full blur-3xl pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col gap-3">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-300 border border-teal-100 dark:border-teal-800 shrink-0 shadow-sm">
                                        <Brain className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base mb-1 text-teal-900 dark:text-white">Phong cách: {user.numerologyProfile?.mathApproach || "Đang phân tích..."}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                                            {user.numerologyProfile?.description || "Hãy hoàn thành đánh giá để nhận phân tích chi tiết."}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-teal-50 dark:bg-gray-700 my-2"></div>
                                <button className="flex items-center justify-between w-full text-sm font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors group">
                                    <span>Xem lại phân tích tính cách</span>
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Logout Button */}
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                className="w-full bg-white dark:bg-surface-dark text-rose-500 font-bold py-4 rounded-3xl shadow-sm border border-teal-100 dark:border-gray-800 active:bg-rose-50 dark:active:bg-rose-900/20 transition-all flex items-center justify-center gap-2 hover:shadow-md"
                            >
                                <LogOut className="w-5 h-5" />
                                Đăng xuất tài khoản
                            </button>
                        )}
                    </div>

                    {/* Right Column: Stats & History */}
                    <div className="md:col-span-2 flex flex-col gap-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-3 md:gap-6">
                            {[
                                { icon: School, val: totalLessons, label: 'Bài học', color: 'text-teal-500' },
                                { icon: Star, val: totalScore, label: 'XP', color: 'text-[#059669]' },
                                { icon: Flame, val: streak, label: 'Chuỗi ngày', color: 'text-orange-400' }
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl bg-white dark:bg-surface-dark border border-teal-50 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                                    <stat.icon className={`${stat.color} mb-2 w-6 h-6 md:w-8 md:h-8`} />
                                    <span className="text-xl md:text-3xl font-bold text-teal-900 dark:text-white">{stat.val}</span>
                                    <span className="text-xs md:text-sm text-slate-400 mt-1 font-medium">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* History List */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl border border-teal-100 dark:border-gray-800 shadow-sm p-6 flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-teal-900 dark:text-white">Lịch sử hoạt động</h3>
                                <span className="text-xs font-bold text-primary bg-primary-surface dark:bg-teal-900/30 px-3 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800">Mới nhất</span>
                            </div>

                            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {history.length === 0 ? (
                                    <div className="p-8 text-center bg-gray-50 dark:bg-dark-bg rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                        <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">Chưa có hoạt động nào gần đây.</p>
                                        <p className="text-xs text-gray-400 mt-1">Hãy bắt đầu bài học đầu tiên!</p>
                                    </div>
                                ) : (
                                    history.map((item, index) => {
                                        const isPass = (item.score / item.totalQuestions) >= 0.5;
                                        return (
                                            <div key={index} className="flex flex-col md:flex-row md:items-center p-4 bg-gray-50 dark:bg-dark-bg/50 rounded-xl border border-teal-50 dark:border-gray-700/50 hover:bg-teal-50/50 transition-colors">
                                                <div className="flex-1 mb-2 md:mb-0">
                                                    <h4 className="font-bold text-teal-900 dark:text-white text-sm line-clamp-1">{item.unitTitle || "Bài học không tên"}</h4>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {formatDate(item.timestamp)}
                                                        </span>
                                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                                            <Clock size={12} />
                                                            {Math.round(item.timeSpentSeconds / 60)} phút
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-full md:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`}
                                                            style={{ width: `${(item.score / item.totalQuestions) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className={`shrink-0 w-16 flex items-center justify-center px-2 py-1 rounded-lg text-xs font-bold ${isPass ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {item.score}/{item.totalQuestions}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quote Footer */}
                <div className="mt-8">
                    <div className="relative rounded-2xl overflow-hidden min-h-[140px] flex items-center justify-center bg-gradient-to-br from-[#0d9488] to-[#14b8a6] shadow-lg shadow-teal-500/20">
                        <div className="absolute inset-0 z-0 opacity-20 mix-blend-overlay">
                            <img alt="Texture" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIyDVHFSjCHPzl0Zukwoai13mk6n_VXDriPxdt2FU9QAR1w4_8BMQrwgE1OGOpJ3nFppfi_2zx_r5DSL6-QgZv5kT42sxAH-UBBoaSa4A7-L9ZGDqxMvV4fpheG_HkxdNZ7pWfdCAKzLzSAfTiKb-N_UJvNlJZGohe0Oier3aMLLet8g3tT94ScvOdPQJZPxcMWF4WkCh0zEFFJ0snq_UBM1zSnVpDocEL9whcOtE7_jPPe71JGqQTo64rxQu4jYifB0p7j2JmBFo" />
                        </div>
                        <div className="relative z-10 p-6 text-center max-w-sm">
                            <span className="material-symbols-outlined text-white/80 mb-2 text-3xl font-serif">"</span>
                            <p className="text-white text-base font-medium italic leading-relaxed">"Không có bài toán nào là không thể giải, chỉ cần tìm đúng phương pháp."</p>
                            <div className="h-1 w-8 bg-white/40 rounded-full mx-auto mt-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
