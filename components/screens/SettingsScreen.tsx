import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Brain, UserCog, ChevronRight, Bell, Globe, Shield, Info, FileText, LogOut, X, School, CheckCircle, Trophy, Key, Clock, Crown } from 'lucide-react';
import { UserProfile } from '../../types';
import { ApiKeyModal } from '../ApiKeyModal';

interface Props {
    user: UserProfile;
    onLogout: () => void;
    onBack: () => void;
}

type ModalType = 'notifications' | 'about' | null;

export const SettingsScreen: React.FC<Props> = ({ user, onLogout, onBack }) => {
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    // Countdown Logic
    useEffect(() => {
        if (user.isVip || !user.expiryDate) return;

        const calculateTimeLeft = () => {
            const now = Date.now();
            const diff = user.expiryDate! - now;

            if (diff <= 0) {
                setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
                return false;
            } else {
                setTimeLeft({
                    d: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    h: Math.floor((diff / (1000 * 60 * 60)) % 24),
                    m: Math.floor((diff / (1000 * 60)) % 60),
                    s: Math.floor((diff / 1000) % 60)
                });
                return true;
            }
        };

        calculateTimeLeft();
        const timer = setInterval(() => {
            if (!calculateTimeLeft()) {
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [user.expiryDate, user.isVip]);

    const getNumerologyTitle = (num: number) => {
        const titles: Record<number, string> = {
            1: "Người Tiên Phong", 2: "Người Hòa Giải", 3: "Người Truyền Cảm Hứng", 4: "Người Kiến Tạo",
            5: "Người Tự Do", 6: "Người Chăm Sóc", 7: "Nhà Tư Duy", 8: "Người Điều Hành",
            9: "Người Cho Đi", 11: "Bậc Thầy Trực Giác", 22: "Kiến Trúc Sư Đại Tài", 33: "Người Chữa Lành"
        };
        return titles[num] || "Người Khám Phá";
    };

    const renderNotifications = () => {
        const history = user.history || [];
        const today = new Date().toDateString();
        const todayLessons = history.filter(h => new Date(h.timestamp || 0).toDateString() === today);
        const todayXP = todayLessons.reduce((acc, h) => acc + (h.score * 10), 0);

        return (
            <div className="flex flex-col gap-4">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-4 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
                            <Bell className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-lg">Cập nhật tiến độ</h3>
                    </div>
                    <p className="text-teal-50 text-sm">Đây là tóm tắt hoạt động học tập của bạn.</p>
                </div>
                <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm flex items-start gap-3">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 dark:text-white text-sm">Hoạt động hôm nay</h4>
                        {todayLessons.length > 0 ? (
                            <p className="text-gray-600 dark:text-gray-300 text-xs mt-1">
                                Bạn đã hoàn thành <strong>{todayLessons.length} bài học</strong> và đạt được <strong>{todayXP} XP</strong> hôm nay.
                            </p>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                Hôm nay bạn chưa làm bài tập nào. Hãy dành chút thời gian để học nhé!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const handleSaveLocal = (key: string, model: string) => {
        localStorage.setItem('GEMINI_API_KEY', key);
        localStorage.setItem('GEMINI_MODEL_PREF', model);
        window.location.reload();
    };

    return (
        <div className="bg-primary-surface dark:bg-dark-bg font-display text-gray-900 dark:text-white antialiased min-h-screen flex flex-col relative">
            <ApiKeyModal
                isOpen={showKeyModal}
                onSave={handleSaveLocal}
                initialKey={localStorage.getItem('GEMINI_API_KEY') || ''}
                onClose={() => setShowKeyModal(false)}
            />

            <header className="sticky top-0 z-40 flex items-center justify-between bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <button onClick={onBack} className="flex size-10 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800 transition-colors">
                    <ArrowLeft />
                </button>
                <h1 className="text-lg font-bold leading-tight flex-1 text-center pr-10">Cài đặt</h1>
            </header>

            <main className="flex-1 flex flex-col gap-6 p-4 w-full">
                {/* Profile Card */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <div className="relative shrink-0">
                            <div className="bg-center bg-no-repeat bg-cover rounded-full h-16 w-16 border-2 border-primary" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAC_7zYYlnD7-370wtxea2JLC3eyaT9HiyvE8Fasm1QPb0CHRCjmRRv9vWny5FbQzSshnbzDlDsnm2tC3ZkCKnQP_W8WvfiZ4cUh0V7Wupw9yC8kfadRogNZOZ0q36zk1GQZcpyvf89iPySBHxHd3QQ-TfunYawNKuDCM8Utm9uWZ1YdnvMZTSyx08owUTbM3MJUCkZuqQPOvd681CnxqeKmKswzgk_Vx4B8GR36Jsncj4UftqrRvx9dlv640fMgICfmHDrTh57pnI")' }}></div>
                            <div className="absolute -bottom-1 -right-1 bg-primary text-black text-xs font-bold size-6 flex items-center justify-center rounded-full border-2 border-white dark:border-dark-bg">
                                {user.numerologyNumber}
                            </div>
                        </div>
                        <div className="flex flex-col justify-center flex-1 min-w-0">
                            <h2 className="text-lg font-bold leading-tight truncate">{user.name || "Học Sinh"}</h2>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal">Học sinh lớp {user.grade}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Brain className="text-primary w-4 h-4" />
                                <span className="text-xs font-medium text-teal-700 dark:text-primary">{getNumerologyTitle(user.numerologyNumber)}</span>
                            </div>
                        </div>
                        <button className="shrink-0 text-gray-400 hover:text-primary transition-colors">
                            <Edit className="w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* EXPIRE SECTION */}
                <section>
                    <h3 className="px-2 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Tài khoản & Thời hạn</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                        {user.isVip ? (
                            <div className="flex items-center gap-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/50">
                                <div className="size-12 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg shrink-0">
                                    <Crown size={28} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-amber-800 dark:text-amber-400 font-black text-lg uppercase tracking-tight">Thành viên VIP</span>
                                    <span className="text-amber-600 dark:text-amber-500 text-xs font-bold italic">Thời hạn sử dụng: Vĩnh viễn</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold mb-1">
                                    <Clock size={18} />
                                    <span>Thời gian dùng thử còn lại:</span>
                                </div>
                                {timeLeft ? (
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { val: timeLeft.d, label: 'Ngày' },
                                            { val: timeLeft.h, label: 'Giờ' },
                                            { val: timeLeft.m, label: 'Phút' },
                                            { val: timeLeft.s, label: 'Giây' }
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex flex-col items-center p-2 bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800 rounded-xl">
                                                <span className="text-xl font-black text-primary">{item.val.toString().padStart(2, '0')}</span>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-red-500 italic font-bold">Tài khoản đã hết hạn.</p>
                                )}
                                <p className="text-[10px] text-gray-400 mt-1 italic text-center">* Đăng ký VIP để mở khóa không giới hạn thời gian.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* AI Configuration */}
                <section>
                    <h3 className="px-2 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Cấu hình hệ thống</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <button
                            onClick={() => setShowKeyModal(true)}
                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                        >
                            <div className="flex items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 shrink-0 size-10">
                                <Key className="w-5 h-5" />
                            </div>
                            <div className="flex-1 truncate">
                                <p className="text-[15px] font-medium">Cài đặt API Key & Model</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Quản lý kết nối AI</p>
                            </div>
                            <ChevronRight className="text-gray-400 w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* General Settings */}
                <section>
                    <h3 className="px-2 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Cài đặt chung</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <button
                            onClick={() => setActiveModal('notifications')}
                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                        >
                            <div className="flex items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 shrink-0 size-10">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div className="flex-1 truncate">
                                <p className="text-[15px] font-medium">Thông báo</p>
                                <p className="text-gray-500 dark:text-gray-400 text-xs">Cập nhật tiến độ học tập</p>
                            </div>
                            <ChevronRight className="text-gray-400 w-5 h-5" />
                        </button>
                    </div>
                </section>

                {/* App Info */}
                <section>
                    <h3 className="px-2 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin khác</h3>
                    <div className="bg-white dark:bg-surface-dark rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                        <button
                            onClick={() => setActiveModal('about')}
                            className="w-full flex items-center gap-4 px-4 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-left group"
                        >
                            <div className="flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 shrink-0 size-10">
                                <Info className="w-5 h-5" />
                            </div>
                            <p className="text-[15px] font-medium flex-1 truncate">Về ứng dụng</p>
                            <ChevronRight className="text-gray-400 w-5 h-5" />
                        </button>
                    </div>
                </section>

                <button onClick={onLogout} className="mt-2 w-full bg-white dark:bg-surface-dark text-rose-500 font-bold py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 active:bg-rose-50 dark:active:bg-rose-900/20 transition-all flex items-center justify-center gap-2">
                    <LogOut className="w-5 h-5" />
                    Đăng xuất
                </button>

                <div className="pb-6 pt-2 text-center">
                    <p className="text-xs text-gray-500 font-medium">MathAI Education</p>
                    <p className="text-[10px] text-gray-400 mt-1">Phiên bản 2.0.0 (Build 2026)</p>
                </div>
            </main>

            {/* MODAL OVERLAY */}
            {activeModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-slide-up relative">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                {activeModal === 'notifications' ? 'Thông báo' : 'Về ứng dụng'}
                            </h3>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto">
                            {activeModal === 'notifications' && renderNotifications()}
                            {activeModal === 'about' && (
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                                        <School size={40} />
                                    </div>
                                    <h4 className="text-2xl font-black text-teal-900 dark:text-white mb-2 text-center uppercase tracking-tight">Linh's Mathlab</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                                        Ứng dụng học toán thông minh kết hợp trí tuệ nhân tạo và thần số học.
                                    </p>
                                    <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800 w-full text-left mb-4">
                                        <p className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase mb-2">Đội ngũ phát triển</p>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-normal">
                                            Học toán cùng cô <span className="text-primary font-bold">Thùy Linh</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-white/5">
                            <button
                                onClick={() => setActiveModal(null)}
                                className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};