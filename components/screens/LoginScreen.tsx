
import React, { useState } from 'react';
import { ArrowLeft, User, Calendar, LogIn, AlertCircle } from 'lucide-react';

interface Props {
  onLogin: (name: string, dob: string) => void;
  onBack: () => void;
  error?: string;
}

export const LoginScreen: React.FC<Props> = ({ onLogin, onBack, error }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');

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
    
    setDob(formatted);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(name, dob);
  };

  return (
    <div className="min-h-screen bg-primary-surface dark:bg-dark-bg flex flex-col justify-center px-6 py-12 relative overflow-hidden transition-colors">
      {/* Background Decor */}
      <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-teal-200/30 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20px] left-[-20px] w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        <button 
            onClick={onBack} 
            className="absolute -top-16 left-0 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors"
        >
            <ArrowLeft size={20} />
            <span className="font-medium">Quay lại</span>
        </button>

        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-teal-600 text-white shadow-lg shadow-primary/30 mb-4">
                <LogIn size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Đăng nhập</h1>
            <p className="text-gray-500 dark:text-gray-400">
                Nhập thông tin học sinh để truy cập hệ thống
            </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Tài khoản (Họ và tên)</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="text-gray-400 group-focus-within:text-primary w-5 h-5 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="Nhập họ và tên..."
                        required
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Mật khẩu (Ngày sinh)</label>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Calendar className="text-gray-400 group-focus-within:text-primary w-5 h-5 transition-colors" />
                    </div>
                    <input 
                        type="text" 
                        inputMode="numeric"
                        value={dob}
                        onChange={handleDateChange}
                        className="block w-full pl-12 pr-4 py-4 bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                        placeholder="dd/mm/yyyy"
                        maxLength={10}
                        required
                    />
                </div>
                <p className="text-xs text-gray-400 ml-1">Định dạng: Ngày/Tháng/Năm (VD: 01/01/2007)</p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium animate-pulse">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            <button 
                type="submit"
                className="mt-4 w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-teal-500/25 active:scale-[0.98] transition-all"
            >
                Đăng nhập ngay
            </button>
        </form>
      </div>
    </div>
  );
};
