
import React from 'react';
import { ArrowLeft, Calculator, Lightbulb, Check, AlertTriangle, ArrowRight, Sparkles, BrainCircuit, BookOpen, Target, Flame, Puzzle, Zap, CloudSun, Award } from 'lucide-react';
import { UserProfile } from '../../types';

interface Props {
  user: UserProfile;
  onNext: () => void;
  onBack: () => void;
}

export const AnalysisResultScreen: React.FC<Props> = ({ user, onNext, onBack }) => {
  // Fallback data if profile is missing (should be calculated in StudentInfoScreen)
  const profile = user.numerologyProfile || {
    lifePathNumber: 7,
    title: "Nhà Tư Duy Phân Tích",
    overview: "Sâu sắc, thích phân tích và tìm tòi chân lý. Con có xu hướng đặt câu hỏi 'Tại sao' và muốn hiểu bản chất vấn đề.",
    learningStyle: "Tự học, nghiên cứu sâu",
    competencies: "Cao khi được học một mình",
    motivation: "Tìm kiếm chân lý",
    mathApproach: "Logic và phân tích",
    strengths: "Tư duy logic, trực giác tốt",
    challenges: "Khép kín, hoài nghi",
    learningMethods: "Nghiên cứu sâu, đọc sách",
    environment: "Yên tĩnh, riêng tư",
    conclusion: "Hãy tận dụng trí tuệ sâu sắc của mình."
  };

  const AnalysisItem = ({ icon: Icon, title, content, colorClass = "text-teal-700", bgClass = "bg-teal-50" }: any) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide leading-tight">{title}</h3>
      </div>
      <p className="text-gray-600 text-sm leading-relaxed flex-1">
        {content}
      </p>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-[#2dd4bf] to-[#0d9488] min-h-screen font-display antialiased text-slate-800 flex flex-col relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-white/20 rounded-full blur-3xl pointer-events-none z-0"></div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-8 pb-2">
        <button onClick={onBack} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 text-white">
          <Calculator className="w-8 h-8 drop-shadow-sm" />
          <div className="flex flex-col items-end">
            <span className="font-black text-lg tracking-tight drop-shadow-sm leading-tight uppercase">Linh's Mathlab</span>
            <span className="text-[10px] text-white/80 leading-tight">Học toán cùng cô Thùy Linh</span>
          </div>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="relative z-10 flex-1 w-full px-4 pb-32 overflow-y-auto no-scrollbar">
        {/* Title Section */}
        <div className="text-center mb-6 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/30 mb-3">
            <span className="text-3xl font-extrabold text-white">{profile.lifePathNumber}</span>
          </div>
          <h1 className="text-white text-2xl font-bold mb-1 leading-tight drop-shadow-sm">{profile.title}</h1>
          <p className="text-teal-50 text-xs font-medium opacity-90 uppercase tracking-widest">Hồ sơ thần số học học tập</p>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1 */}
          <div className="flex flex-col gap-4">
            <AnalysisItem
              icon={Sparkles}
              title="Tổng quan tính cách"
              content={profile.overview}
              colorClass="text-purple-600"
              bgClass="bg-purple-50"
            />
            <AnalysisItem
              icon={Target}
              title="Khiếu năng lực tập trung"
              content={profile.competencies}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            />
            <AnalysisItem
              icon={Puzzle}
              title="Cách tiếp cận bài toán"
              content={profile.mathApproach}
              colorClass="text-indigo-600"
              bgClass="bg-indigo-50"
            />
            <AnalysisItem
              icon={AlertTriangle}
              title="Thách thức cần khắc phục"
              content={profile.challenges}
              colorClass="text-red-500"
              bgClass="bg-red-50"
            />
            <AnalysisItem
              icon={CloudSun}
              title="Môi trường lý tưởng"
              content={profile.environment}
              colorClass="text-sky-600"
              bgClass="bg-sky-50"
            />
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-4">
            <AnalysisItem
              icon={BookOpen}
              title="Phong cách học tập"
              content={profile.learningStyle}
              colorClass="text-teal-600"
              bgClass="bg-teal-50"
            />
            <AnalysisItem
              icon={Flame}
              title="Động lực học tập"
              content={profile.motivation}
              colorClass="text-orange-500"
              bgClass="bg-orange-50"
            />
            <AnalysisItem
              icon={Zap}
              title="Điểm mạnh nổi bật"
              content={profile.strengths}
              colorClass="text-green-600"
              bgClass="bg-green-50"
            />
            <AnalysisItem
              icon={Lightbulb}
              title="Phương pháp hiệu quả"
              content={profile.learningMethods}
              colorClass="text-yellow-600"
              bgClass="bg-yellow-50"
            />
            <AnalysisItem
              icon={Award}
              title="Kết luận & Khuyến nghị"
              content={profile.conclusion}
              colorClass="text-pink-600"
              bgClass="bg-pink-50"
            />
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 right-0 w-full z-20 px-6 pt-4 pb-8 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-[2rem] max-w-md mx-auto">
        <button
          onClick={onNext}
          className="w-full flex cursor-pointer items-center justify-center rounded-2xl h-14 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] transition-all duration-200 text-white text-lg font-bold shadow-xl shadow-slate-900/20 group"
        >
          <span>Xem lộ trình học</span>
          <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
