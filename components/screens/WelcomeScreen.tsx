
import React from 'react';
import { ArrowRight, Calculator, Sparkles, LogIn } from 'lucide-react';

interface Props {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<Props> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-b md:bg-gradient-to-r from-primary-light to-primary-dark overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-[-50px] left-[-50px] w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-[-20px] w-32 h-32 bg-accent-yellow/20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Left Column (Desktop): Image & Hero */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-8 md:px-12 lg:px-20">
        {/* Logo for Desktop */}
        <div className="absolute top-8 left-8 hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-3 rounded-2xl border border-white/20 shadow-sm">
          <Calculator className="text-accent-yellow w-10 h-10" />
          <div className="flex flex-col">
            <span className="text-white font-black text-xl lg:text-2xl tracking-tight leading-none">Linh's Mathlab</span>
            <span className="text-white/80 text-xs lg:text-sm tracking-wide mt-1">Học toán cùng cô Thùy Linh</span>
          </div>
        </div>

        {/* Mobile Header Logo */}
        <div className="md:hidden flex items-center justify-center pt-4 pb-4">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 shadow-sm max-w-[95%]">
            <Calculator className="text-accent-yellow w-6 h-6 shrink-0" />
            <div className="flex flex-col">
              <span className="text-white font-bold text-base sm:text-lg tracking-tight leading-none">Linh's Mathlab</span>
              <span className="text-white/80 text-[9px] sm:text-[10px] tracking-wide">Học toán cùng cô Thùy Linh</span>
            </div>
          </div>
        </div>

        {/* Hero Image Container */}
        <div className="relative w-full max-w-lg mx-auto md:mx-0 aspect-[4/3] md:aspect-video rounded-3xl shadow-2xl border-4 border-white/20 overflow-hidden group mb-8 md:mb-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAomLjse6M0kHucTLnwKEEyNDUDvoQOZ33Ic9gDiu_2kavKQQBS2YcqwtJ9BSKBpZ8Fo5KO6SjKD2NYff_mmUrBddEvxmieMxb-dfqcoxYKnBEQFdeULR75RFP621eHnp-QnLGuOD59-UQymKuijMu4T6Urj7N4JLesJJdguCyEuQucRvYxoGSm1wbBvaQy2ecCu_xJbgG7LVttxgRJQMv-eo4WMbTlriGm6x9TApndocrky60Se2AutuX48r3ABOuN09y6xrFjqO4")' }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/60 to-transparent md:bg-gradient-to-r"></div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
            <Sparkles className="text-primary w-3.5 h-3.5" />
            <span className="text-primary-dark text-xs font-bold">AI Powered</span>
          </div>
        </div>
      </div>

      {/* Right Column (Desktop): Content & CTA */}
      <div className="relative z-10 flex-1 flex flex-col items-center md:items-start justify-center px-6 pb-8 md:px-12 lg:px-20 text-center md:text-left bg-gradient-to-t from-primary-dark/90 via-transparent to-transparent md:bg-none">

        <h1 className="text-white text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 drop-shadow-sm">
          Học Toán Vui <br />
          <span className="text-accent-yellow">Cùng Linh's Mathlab</span>
        </h1>
        <p className="text-primary-surface text-base md:text-xl font-medium leading-relaxed max-w-[90%] md:max-w-lg mb-8">
          Mở khóa tiềm năng toán học với lộ trình AI và Thần số học dành riêng cho bạn!
        </p>

        {/* Feature Grid (Responsive) */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 w-full max-w-xl mb-10">
          {[
            { icon: 'psychology', title: 'Hiểu Tính Cách', desc: 'AI phân tích phong cách học.' },
            { icon: 'timeline', title: 'Lộ Trình Riêng', desc: 'Thiết kế bài học chuẩn hóa.' },
            { icon: 'sentiment_very_satisfied', title: 'Vui & Hiệu Quả', desc: 'Học mà chơi, không áp lực.' },
            { icon: 'school', title: 'Bám Sát SGK', desc: 'Đầy đủ kiến thức các cấp.' }
          ].map((item, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-xl flex items-center gap-3 text-left hover:bg-white/20 transition-colors cursor-default">
              <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-xl" style={{ fontFamily: 'Material Symbols Outlined' }}>{item.icon}</span>
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">{item.title}</h4>
                <p className="text-teal-100 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Snap List (Hidden on Desktop) */}
        <div className="md:hidden relative w-full mb-6">
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-4 snap-x snap-mandatory">
            {[
              { icon: 'psychology', title: 'Hiểu Tính Cách', desc: 'AI phân tích phong cách học tập độc đáo.' },
              { icon: 'timeline', title: 'Lộ Trình Riêng', desc: 'Thiết kế bài học dựa trên thần số học.' },
              { icon: 'sentiment_very_satisfied', title: 'Vui & Hiệu Quả', desc: 'Học mà chơi, không áp lực điểm số.' }
            ].map((item, index) => (
              <div key={index} className="snap-center shrink-0 w-64 bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-lg border-b-4 border-teal-200">
                <div className="w-12 h-12 rounded-full bg-primary-surface flex items-center justify-center text-primary mb-1">
                  <span className="material-symbols-outlined text-2xl" style={{ fontFamily: 'Material Symbols Outlined' }}>{item.icon}</span>
                </div>
                <div>
                  <h3 className="text-teal-900 font-bold text-lg text-left">{item.title}</h3>
                  <p className="text-teal-600/80 text-sm font-medium mt-1 text-left">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="w-full max-w-sm md:max-w-md">
          <button
            onClick={onStart}
            className="w-full flex cursor-pointer items-center justify-center rounded-2xl h-16 bg-accent-yellow hover:bg-yellow-400 active:scale-95 transition-all duration-200 text-teal-900 text-xl font-black shadow-lg shadow-yellow-400/30 mb-5 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              <LogIn className="w-5 h-5" />
              Đăng nhập ngay
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>

          <div className="flex justify-center md:justify-start items-center gap-2">
            <span className="text-teal-100 text-sm font-medium">Chưa có tài khoản?</span>
            <a
              href="https://zalo.me/0972968098"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white font-bold text-sm hover:text-accent-yellow transition-colors underline decoration-2 underline-offset-4 decoration-white/30 hover:decoration-accent-yellow"
            >
              Liên hệ cô giáo
            </a>
          </div>
        </div>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
    </div>
  );
};
