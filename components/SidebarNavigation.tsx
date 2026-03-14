import React, { useState, useEffect } from 'react';
import { ScreenName, UserProfile } from '../types';
import { fetchGlobalVisits } from '../utils/syncService';

const STUDENT_DB_KEY = 'math_genius_student_db_v1';
import { Home, Map, BarChart2, User, Gamepad2, LogOut, Calculator, Key, Settings, Clock, Crown, X, Check, CreditCard, History, TrendingUp } from 'lucide-react';

interface Props {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
  onLogout?: () => void;
  user: UserProfile;
  onOpenSettings?: () => void;
}

export const SidebarNavigation: React.FC<Props> = ({ currentScreen, onNavigate, onLogout, user, onOpenSettings }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [totalVisits, setTotalVisits] = useState<number>(0);

  useEffect(() => {
    const loadVisits = async () => {
      try {
        const count = await fetchGlobalVisits();
        setTotalVisits(count);
      } catch (e) {
        console.error("Failed to load global visits", e);
      }
    };
    
    loadVisits();
    const interval = setInterval(loadVisits, 300000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: ScreenName.LEARNING_PATH, icon: Home, label: 'Lộ trình học' },
    { id: ScreenName.HISTORY, icon: History, label: 'Lịch sử làm bài' },
    { id: ScreenName.GAMES, icon: Gamepad2, label: 'Vui chơi & Giải trí' },
    { id: ScreenName.CHAT, icon: Map, label: 'AI Tutor' },
    { id: ScreenName.PARENT_REPORT, icon: BarChart2, label: 'Báo cáo phụ huynh' },
    { id: ScreenName.PROFILE, icon: User, label: 'Hồ sơ cá nhân' },
  ];

  if (user.isAdmin) {
    tabs.splice(2, 0, { id: ScreenName.ADMIN_STATISTICS, icon: TrendingUp, label: 'Thống kê Admin' });
  }

  useEffect(() => {
    if (user.isVip || !user.expiryDate) {
      setTimeLeft('');
      return;
    }

    const calculateTime = () => {
      const diff = user.expiryDate! - Date.now();
      if (diff <= 0) {
        setTimeLeft('Đã hết hạn');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days} ngày ${hours} giờ`);
      } else {
        setTimeLeft(`${hours} giờ ${minutes} phút`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user.expiryDate, user.isVip]);

  return (
    <>
      <div className="hidden md:flex flex-col w-80 h-screen bg-white border-r border-gray-200 fixed left-0 top-0 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        {/* Logo Area */}
        <div className="p-6 flex flex-col items-start gap-4 border-b border-gray-50 relative">
          <div className="flex justify-between items-start w-full">
            <div className="bg-gradient-to-br from-primary to-teal-600 p-3 rounded-2xl text-white shadow-lg shadow-teal-500/20">
              <Calculator size={32} />
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Lượt truy cập</span>
              <div className="bg-teal-50 text-teal-700 px-2.5 py-1 rounded-lg text-xs font-black border border-teal-100 flex items-center gap-1.5 shadow-sm" title="Tổng lượt truy cập thực tế">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></div>
                {totalVisits}
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-teal-900 tracking-tight leading-tight uppercase font-display">
              Linh's Mathlab
            </h1>
            <p className="text-[11px] font-medium text-teal-600/80 mt-1 tracking-wide">Học toán cùng cô Thùy Linh</p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Menu chính</p>
          {tabs.map((tab) => {
            const isActive = currentScreen === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${isActive
                  ? 'bg-primary/10 text-primary font-bold shadow-sm'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`relative z-10 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}
                />
                <span className="relative z-10 text-sm">{tab.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"></div>
                )}
              </button>
            );
          })}

          {/* Nâng cấp VIP Button */}
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group text-left relative overflow-hidden text-blue-600 hover:bg-blue-50 mt-1"
          >
            <Crown size={22} strokeWidth={2.5} className="relative z-10 text-blue-600 group-hover:scale-110 transition-transform" />
            <span className="relative z-10 text-sm font-bold">Nâng cấp VIP</span>
          </button>

          {/* Trial Countdown Widget */}
          {!user.isVip && user.expiryDate && (
            <div className="mt-4 mx-2 px-4 py-3 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-2xl flex flex-col gap-2 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Dùng thử còn lại</span>
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              </div>
              <div className="flex items-center gap-2 text-orange-800 bg-white/50 p-2 rounded-xl border border-orange-100/50">
                <Clock size={18} className="text-orange-500" />
                <span className="text-sm font-bold font-mono tracking-tight">{timeLeft || "Đang tính..."}</span>
              </div>
            </div>
          )}
        </div>

        {/* API Key Settings Button (Prominent) */}
        {onOpenSettings && (
          <div className="px-4 pb-2">
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors border border-red-100 group"
            >
              <Key size={18} />
              <div className="flex flex-col items-start">
                <span className="text-xs font-bold">Settings (API Key)</span>
                <span className="text-[10px] text-red-500 font-medium leading-none mt-0.5">Lấy API key để sử dụng app</span>
              </div>
            </button>
          </div>
        )}

        {/* Footer / User */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-2 bg-gray-50/50">
          <button
            onClick={() => onNavigate(ScreenName.SETTINGS)}
            className={`flex-1 flex items-center gap-3 px-2 py-2 rounded-xl text-left transition-colors ${currentScreen === ScreenName.SETTINGS ? 'bg-white shadow-sm ring-1 ring-gray-200' : 'hover:bg-white/80'
              }`}
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAC_7zYYlnD7-370wtxea2JLC3eyaT9HiyvE8Fasm1QPb0CHRCjmRRv9vWny5FbQzSshnbzDlDsnm2tC3ZkCKnQP_W8WvfiZ4cUh0V7Wupw9yC8kfadRogNZOZ0q36zk1GQZcpyvf89iPySBHxHd3QQ-TfunYawNKuDCM8Utm9uWZ1YdnvMZTSyx08owUTbM3MJUCkZuqQPOvd681CnxqeKmKswzgk_Vx4B8GR36Jsncj4UftqrRvx9dlv640fMgICfmHDrTh57pnI" className="w-full h-full object-cover" alt="Avatar" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-gray-900">{user.name || "Học sinh"}</p>
              <p className="text-[10px] text-gray-500">Lớp {user.grade} • Số {user.numerologyNumber}</p>
            </div>
            <Settings size={16} className="text-gray-400" />
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          )}
        </div>
      </div>

      {/* VIP UPGRADE MODAL */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-scale-up">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white text-center relative">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-1.5 rounded-full transition-colors backdrop-blur-sm"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-md shadow-inner border border-white/30">
                <Crown size={36} className="text-yellow-300 drop-shadow-md" fill="currentColor" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Nâng cấp VIP</h2>
              <p className="text-blue-100 text-sm font-medium opacity-90">Ủng hộ tác giả & Mở khóa tính năng</p>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/50 dark:bg-black/5">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6 text-sm text-blue-900 dark:text-blue-100 leading-relaxed shadow-sm">
                <p>Để sử dụng các tính năng ưu việt <strong>KHÔNG GIỚI HẠN</strong> và được cập nhật miễn phí các tính năng khác trong tương lai, thầy cô vui lòng nâng cấp tài khoản VIP để ủng hộ tác giả.</p>
              </div>

              <div className="flex flex-col items-center gap-4 bg-white dark:bg-surface-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <div className="text-center w-full pb-4 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Giá trị trọn đời</p>
                  <p className="text-4xl font-black text-blue-600 dark:text-blue-400">99.000đ</p>
                </div>

                <div className="w-full space-y-3 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Ngân hàng</span>
                    <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs uppercase">
                      <CreditCard size={14} />
                      AGRIBANK
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm font-medium">Chủ tài khoản</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase text-sm">Hồ Thị Thùy Linh</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                    <span className="text-gray-500 text-xs font-bold uppercase">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-lg text-gray-900 dark:text-white tracking-wide">2302205102323</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-xl border border-yellow-100 dark:border-yellow-800/30">
                    <span className="text-yellow-700 dark:text-yellow-500 text-xs font-bold uppercase">Nội dung CK</span>
                    <span className="font-mono font-bold text-yellow-800 dark:text-yellow-400 text-sm">SĐT thầy cô + mathlab</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/10">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-500/30 active:scale-[0.98]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};