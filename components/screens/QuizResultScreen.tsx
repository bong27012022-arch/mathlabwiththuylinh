import React from 'react';
import { ArrowLeft, Star, Sparkles, CheckCircle, Timer, Bot, Brain, Lightbulb, Map, ArrowRight, Play, Eye } from 'lucide-react';
import { QuizResult } from '../../types';

interface Props {
  result: QuizResult | null;
  onContinue: () => void;
  onReview: () => void;
}

export const QuizResultScreen: React.FC<Props> = ({ result, onContinue, onReview }) => {
  if (!result) return null;

  const { score, totalQuestions, timeSpentSeconds } = result;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-primary-surface dark:bg-dark-bg font-display text-gray-900 dark:text-white overflow-x-hidden flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center bg-primary-surface/90 dark:bg-dark-bg/90 backdrop-blur-md p-4 pb-2 justify-between">
        <button onClick={onContinue} className="text-gray-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer hover:opacity-70 transition-opacity">
          <ArrowLeft />
        </button>
        <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Tổng kết</h2>
      </div>

      <div className="flex-1 flex flex-col pb-28 w-full max-w-md mx-auto">
        {/* Hero */}
        <div className="flex flex-col items-center pt-2 px-4 animate-fade-in-up">
          <div className="relative w-full max-w-[240px] aspect-square flex items-center justify-center mb-2">
            <div className={`absolute inset-4 rounded-full blur-2xl animate-pulse ${percentage >= 50 ? 'bg-primary/20' : 'bg-red-500/20'}`}></div>
            <div 
              className="w-40 h-40 bg-contain bg-center bg-no-repeat z-10 relative drop-shadow-xl transform hover:scale-105 transition-transform duration-500"
              style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA0bZA2zm4519Jbo5v2xH9UUbMHcPugt-OEy5xz_0tcyjqBEKNv-ZEDH3EPnQhWsuSz7pQnxmw5ochAzkDFq78aStTfMfOzcG0HJSK0d4fCNuqnsiF7fAwS9VdOXgMYgh0YUCMYXcFdBF6bjolKgHvBr-TFSSeXGjLVt0wUdNP1g7agAIYanx49ngXZyqgFmYRAZ5qKbZsP4LcAK847OYhIB6uJbj7uNqWNGe3pnoxOzKSWseGwXJqNA_cSRLlYzwVkg8942ZFRkA0")', maskImage: 'radial-gradient(circle, black 60%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle, black 60%, transparent 100%)' }}
            ></div>
            {percentage >= 80 && <Star className="text-yellow-400 absolute top-4 right-10 animate-bounce w-10 h-10 fill-current" style={{ animationDelay: '0.2s' }} />}
            {percentage >= 50 && <Sparkles className="text-primary absolute bottom-10 left-10 animate-bounce w-8 h-8 fill-current" style={{ animationDelay: '0.5s' }} />}
          </div>
          <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight text-center mb-1">
             {percentage === 100 ? "Xuất sắc!" : percentage >= 80 ? "Giỏi lắm!" : percentage >= 50 ? "Làm tốt lắm!" : "Cố gắng hơn nhé!"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium bg-white/50 dark:bg-white/5 px-3 py-1 rounded-full backdrop-blur-sm border border-white/20">
            +{score * 10} điểm kinh nghiệm
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 px-4 py-6">
          <div className="flex flex-col gap-1 rounded-2xl bg-white dark:bg-surface-dark border border-teal-100 dark:border-white/10 p-4 items-center text-center shadow-[0_2px_8px_rgba(0,184,148,0.1)]">
            <p className="text-primary text-3xl font-bold leading-tight">{score}/{totalQuestions}</p>
            <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded-md">
              <CheckCircle className="text-primary w-4 h-4" />
              <p className="text-teal-700 dark:text-teal-300 text-xs font-medium">Chính xác</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 rounded-2xl bg-white dark:bg-surface-dark border border-teal-100 dark:border-white/10 p-4 items-center text-center shadow-[0_2px_8px_rgba(0,184,148,0.1)]">
            <p className="text-gray-900 dark:text-white text-3xl font-bold leading-tight">{formatTime(timeSpentSeconds)}</p>
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-md">
              <Timer className="text-gray-500 dark:text-gray-400 w-4 h-4" />
              <p className="text-gray-600 dark:text-gray-400 text-xs font-medium">Thời gian</p>
            </div>
          </div>
        </div>

        {/* AI Feedback */}
        <div className="px-4 mb-6">
          <div className="bg-gradient-to-br from-white to-[#f8fffe] dark:from-surface-dark dark:to-surface-dark/50 rounded-2xl p-4 border border-teal-100/50 dark:border-white/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-accent-purple/10 rounded-full blur-2xl"></div>
            <div className="flex items-start gap-3 relative z-10">
              <div className="relative shrink-0">
                <div 
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full w-14 h-14 border-2 border-accent-purple shadow-lg shadow-accent-purple/20" 
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRYPVXgOt3pwVCHPaayrsG7JoO18duSas5F9iSO_3Kwxu7PNjQfkLx2UY3ucraarR_Qcu3xmSEY0rOT9YijK7CnGG7QpjRFj3h4bOvagxd0zM6_7x2uVAoj7O5Hs93X8ZkY_ffg1fqoctaxjqGqDYW9fOmUpq9kI1Q3OZ5syXZ_t9MaAN9GWJmY1ohCPOlgOj3rh2X2H0EAw1F53_hfWtXnOgKbG8-V0gMG6NrhGysj7m2QS2ODQothWgyhrhL9kJ3HOF7kvCdZ4g")' }}
                ></div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-[3px] border-white dark:border-dark-bg flex items-center justify-center">
                  <Bot className="text-white w-2.5 h-2.5" />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-1.5 items-start">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-gray-800 dark:text-gray-200 text-sm font-bold">AI Mentor</p>
                </div>
                <div className="w-full">
                  <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {percentage >= 80 
                       ? "Tuyệt vời! Bạn đã nắm vững kiến thức bài này. Hãy giữ vững phong độ nhé! 🌟"
                       : percentage >= 50
                       ? "Khá tốt! Bạn đã hiểu bài nhưng vẫn cần cẩn thận hơn ở một vài câu hỏi. Cố lên! 💪"
                       : "Đừng nản lòng! Hãy xem lại các câu sai để rút kinh nghiệm nhé. Mình tin bạn sẽ làm tốt hơn lần sau! 🚀"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Next Steps */}
        <div className="px-4 space-y-5">
          <div>
            <h3 className="text-gray-900 dark:text-white text-base font-bold px-1 mb-2 flex items-center gap-2">
              <Lightbulb className="text-primary w-5 h-5" />
              Chi tiết bài giải
            </h3>
            <div 
              onClick={onReview}
              className="group rounded-2xl overflow-hidden bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              <div className="bg-teal-50/50 dark:bg-white/5 px-5 py-4 flex justify-between items-center transition-colors">
                <span className="text-sm font-bold text-teal-800 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Xem lại toàn bộ bài làm
                </span>
                <ArrowRight className="text-primary w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-dark-bg/90 backdrop-blur-lg border-t border-teal-100 dark:border-white/10 p-5 pb-8 z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
        <div className="flex gap-4 max-w-md mx-auto">
          <button 
            onClick={onReview}
            className="flex-1 py-3.5 px-6 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-sm active:scale-95 duration-100"
          >
            Xem lại bài
          </button>
          <button 
            onClick={onContinue}
            className="flex-[1.5] py-3.5 px-6 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 text-sm flex items-center justify-center gap-2 group active:scale-95 duration-100"
          >
            Tiếp tục học
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};