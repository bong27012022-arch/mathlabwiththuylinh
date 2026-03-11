import React from 'react';
import { ChevronLeft, Calendar, User, Sparkles } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StudentInfoScreen: React.FC<Props> = ({ user, setUser, onNext, onBack }) => {

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 8) value = value.slice(0, 8);

    // Auto-format as dd/mm/yyyy
    let formatted = value;
    if (value.length >= 5) {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
    } else if (value.length >= 3) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    }

    setUser({ ...user, dob: formatted });
  };

  return (
    <div className="bg-primary-surface dark:bg-dark-bg min-h-screen flex flex-col transition-colors duration-200">
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 pb-2 bg-primary-surface/90 backdrop-blur-md">
        <button onClick={onBack} className="text-gray-900 dark:text-white flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-teal-200/50 transition-colors">
          <ChevronLeft />
        </button>
        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10">
          Thông tin học sinh
        </h2>
      </div>

      <div className="w-full px-6 py-2">
        <div className="flex items-center justify-between text-xs font-medium text-teal-800 dark:text-teal-300 mb-1">
          <span>Bước 1/3</span>
          <span>Thông tin cá nhân</span>
        </div>
        <div className="h-1.5 w-full bg-teal-200 dark:bg-teal-900 rounded-full overflow-hidden">
          <div className="h-full bg-primary w-1/3 rounded-full"></div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="relative w-full h-48 sm:h-56 overflow-hidden mt-4 mb-6">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-primary/20"></div>
          <div className="flex items-center justify-center w-full h-full p-6">
            <img
              alt="3D abstract geometric shapes"
              className="h-full w-auto object-contain drop-shadow-[0_0_15px_rgba(13,148,136,0.5)]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUxXGeddVvZfIAXg3FPHFn4foLsZ1UuaCq8LryvgxdRcXV4liNWcoVuJ6TMHMYn5aCHNIlShZkG97na0XyQsYlMHbkJsuovWuGmYLG9f1-CeNoNTpozKMueTcEEVTwU8QP8ZSOezjFeQK4fBrJ72ysQ0_kJ6Z0ihHf5Rv2EX-lIsJYkKpC112i00JLePSCPCzoe0Jw-xBMK5AukmafkzndfZCqroUlpHZa5CX0D-Kv4HdZIx-f3DChomnDglzElS_LQdX2mFGqeZk"
            />
          </div>
        </div>

        <div className="px-6">
          <h1 className="text-gray-900 dark:text-white tracking-tight text-[28px] sm:text-[32px] font-bold leading-tight mb-3">
            Làm quen nhé!
          </h1>
          <p className="text-gray-700 dark:text-teal-100 text-base font-normal leading-relaxed">
            AI sẽ phân tích tính cách và <span className="text-primary font-bold">thần số học</span> dựa trên tên và ngày sinh để thiết kế lộ trình học toán riêng biệt cho bạn.
          </p>
        </div>

        <div className="flex flex-col gap-6 px-6 py-8">
          <div className="flex flex-col gap-2">
            <label className="text-gray-800 dark:text-teal-50 text-sm font-semibold leading-normal ml-1">
              Họ và tên
            </label>
            <div className="group relative flex items-center">
              <input
                className="peer flex w-full flex-1 rounded-xl border border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-teal-950/50 h-14 px-4 pl-12 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm"
                placeholder="Hồ Thị Thùy Linh"
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
              <User className="absolute left-4 text-gray-400 peer-focus:text-primary transition-colors w-5 h-5" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-gray-800 dark:text-teal-50 text-sm font-semibold leading-normal ml-1">
              Ngày sinh
            </label>
            <div className="group relative flex items-center">
              <input
                className="peer flex w-full flex-1 rounded-xl border border-teal-200 dark:border-teal-800 bg-white/80 dark:bg-teal-950/50 h-14 px-4 pl-12 text-base font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm min-h-[56px]"
                type="text"
                inputMode="numeric"
                placeholder="dd/mm/yyyy"
                value={user.dob}
                onChange={handleDateChange}
                maxLength={10}
              />
              <Calendar className="absolute left-4 text-gray-400 peer-focus:text-primary transition-colors w-5 h-5 pointer-events-none" />
            </div>
            <p className="text-xs text-gray-500 dark:text-teal-400 ml-1 mt-1">
              Nhập theo định dạng ngày/tháng/năm (VD: 20/10/2005)
            </p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-primary-surface dark:bg-dark-bg p-6 pt-2 pb-8 backdrop-blur-xl bg-opacity-95 border-t border-teal-200 dark:border-teal-800/50">
        <button
          onClick={onNext}
          disabled={!user.name || user.dob.length < 10}
          className={`flex items-center justify-center w-full h-14 text-white text-lg font-bold rounded-2xl shadow-lg shadow-teal-500/25 transition-all active:scale-[0.98] 
            ${(!user.name || user.dob.length < 10) ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-70' : 'bg-primary hover:bg-primary-dark'}`}
        >
          Phân tích ngay
          <Sparkles className="ml-2 w-5 h-5" />
        </button>
        <p className="text-center text-[10px] sm:text-xs text-gray-500 dark:text-teal-400 mt-4 px-4">
          Thông tin của bạn được bảo mật tuyệt đối và chỉ dùng cho mục đích học tập.
        </p>
      </div>
    </div>
  );
};