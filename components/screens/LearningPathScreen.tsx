import React, { useState } from 'react';
import { ArrowLeft, Bell, Sparkles, Check, Play, Gamepad2, HelpCircle, Puzzle, Lock, ArrowRight, BookOpen, Trophy, X, FileText, Star } from 'lucide-react';
import { UserProfile, LearningUnit } from '../../types';

interface Props {
  onStartQuiz: (unit: LearningUnit) => void;
  onUpgradeUnit: (unit: LearningUnit) => void;
  onStartComprehensiveTest: () => void;
  onBack: () => void;
  user: UserProfile;
}

export const LearningPathScreen: React.FC<Props> = ({ onStartQuiz, onUpgradeUnit, onStartComprehensiveTest, onBack, user }) => {
  const generatedPath = user.learningPath || [];
  const [selectedUpgradeUnit, setSelectedUpgradeUnit] = useState<LearningUnit | null>(null);

  // Calculate actual progress
  const completedCount = generatedPath.filter(u => u.status === 'completed').length;
  const totalCount = generatedPath.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Default fallback if path is empty (should not happen if flow is correct)
  const displayPath = generatedPath.length > 0 ? generatedPath : [
    {
      id: "demo",
      topicId: "demo",
      title: "Đang tải lộ trình...",
      description: "Vui lòng đợi trong giây lát hoặc thử lại.",
      status: "locked",
      questions: [],
      totalXp: 0,
      durationMinutes: 0
    } as LearningUnit
  ];

  return (
    <div className="bg-primary-surface dark:bg-dark-bg min-h-screen flex flex-col transition-colors pb-24 relative">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/70 dark:bg-dark-bg/60 backdrop-blur-md border-b border-teal-100 dark:border-teal-800 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center p-1 rounded-full hover:bg-teal-100 dark:hover:bg-teal-800 transition-colors"
          >
            <ArrowLeft className="text-teal-800 dark:text-teal-100 w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold tracking-tight text-teal-900 dark:text-teal-50">Lộ trình của tôi</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="text-teal-600 dark:text-teal-300 w-6 h-6" />
            <span className="absolute top-0 right-0 size-2 bg-red-500 rounded-full"></span>
          </div>
          <div className="size-8 rounded-full bg-cover bg-center border-2 border-primary" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuACq-SqPgi-OJ0FVjiPwbpW1_OA0T_tfcrsGcv_-afG_6rTaBleUel6XK2BgbSyNwSs4riU55cXRlPfecWMmGu4dZ_wuabagcueZofXRmYj-jdSRRHOFP1lZJaCo0_Tft4eY1GVDm5vJevlKJp17wOOpZT2bmu7lye0zwt3A9GSuvH-11wXkEPfFSvRuHDER21mx7as3xWwHbnkaBm6hcaW7WJVPJ_QQh75sU2onJcy_jO9yvnuLTHlJx_J2D8QZIhKRmPNJL_un4c")' }}></div>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-6 max-w-4xl mx-auto w-full">
        {/* Header Summary */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-primary bg-teal-100 dark:bg-teal-900/50 px-2 py-1 rounded-full border border-teal-200 dark:border-teal-700">Thần số học: Số {user.numerologyNumber}</span>
            </div>
            <h2 className="text-2xl font-bold leading-tight mt-1 text-teal-950 dark:text-white">{user.numerologyProfile?.title || "Học sinh tài năng"}</h2>
            <p className="text-teal-600 dark:text-teal-300 text-sm">Lớp {user.grade} • {generatedPath.length} Bài học</p>
          </div>
          <div className="relative size-16 flex items-center justify-center rounded-full bg-white dark:bg-surface-dark shadow-sm border-4 border-teal-100 dark:border-teal-800">
            <span className="text-xl font-bold text-primary dark:text-teal-200">Lv.{Math.max(1, ...generatedPath.filter(u => u.status === 'completed').map(u => u.level || 1))}</span>
            <svg className="absolute top-0 left-0 -m-[4px] size-[72px] rotate-[-90deg]" viewBox="0 0 36 36">
              <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="10, 100" strokeWidth="3"></path>
            </svg>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-teal-100 dark:border-teal-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-teal-800 dark:text-teal-100">Tiến độ tổng thể</span>
            <span className="text-sm font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2.5 w-full bg-teal-100 dark:bg-teal-900 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(0,150,136,0.4)] transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        {/* AI Suggestion */}
        <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-200 dark:border-teal-700 p-4 rounded-xl flex gap-3 items-start backdrop-blur-sm">
          <div className="bg-teal-100 dark:bg-teal-800 p-1.5 rounded-lg shrink-0 text-primary dark:text-teal-200">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-teal-900 dark:text-teal-50">Gợi ý từ AI</p>
            <p className="text-xs text-teal-700 dark:text-teal-200 mt-1 leading-relaxed">
              Lộ trình này đã được tối ưu hóa cho phong cách <strong>{user.numerologyProfile?.learningStyle ? "cá nhân của bạn" : "học tập của bạn"}</strong>. Hãy bắt đầu ngay!
            </p>
          </div>
        </div>

        <div className="h-px w-full bg-teal-200/50 dark:bg-teal-800/50 my-2"></div>

        {/* Timeline (Dynamic) */}
        <div className="px-1">
          <h3 className="text-lg font-bold mb-6 text-teal-900 dark:text-white">Chặng đường hiện tại</h3>
          <div className="grid grid-cols-[40px_1fr] gap-x-0 relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-4 bottom-10 w-[2px] bg-teal-200 dark:bg-teal-800"></div>

            {displayPath.map((unit: LearningUnit, index: number) => {
              const isActive = unit.status === 'active';
              const isLocked = unit.status === 'locked';
              const isCompleted = unit.status === 'completed';
              // Allow unlimited upgrades/practice for any completed unit
              const isUpgradeAvailable = isCompleted;

              return (
                <React.Fragment key={unit.id || index}>
                  {/* Status Icon */}
                  <div className="flex flex-col items-center z-10">
                    {isCompleted ? (
                      <div className="size-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-[0_0_10px_rgba(16,185,129,0.4)] ring-4 ring-primary-surface dark:ring-dark-bg">
                        <Check size={20} />
                      </div>
                    ) : isActive ? (
                      <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_15px_rgba(0,150,136,0.6)] ring-4 ring-teal-100 dark:ring-teal-800 animate-pulse">
                        <Play size={24} fill="currentColor" />
                      </div>
                    ) : (
                      <div className="size-10 rounded-full bg-teal-50 dark:bg-teal-900 flex items-center justify-center text-teal-400 dark:text-teal-600 border-2 border-teal-100 dark:border-teal-800 ring-4 ring-primary-surface dark:ring-dark-bg">
                        <Lock size={18} />
                      </div>
                    )}
                    {isActive && <div className="w-[2px] bg-gradient-to-b from-primary to-transparent absolute top-10 left-[19px] -z-10 h-[calc(100%-2.5rem)]"></div>}
                  </div>

                  {/* Content Card */}
                  <div className="pb-10 pl-4">
                    {isActive ? (
                      <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-xl shadow-teal-900/5 border border-primary/40 relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 size-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
                        <div className="flex justify-between items-start mb-3 relative z-10">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-primary mb-1 block">
                              {unit.level && unit.level > 1 ? `Cấp độ ${unit.level} - Đang học` : 'Đang học'}
                            </span>
                            <h4 className="text-lg font-bold text-teal-950 dark:text-white">{unit.title}</h4>
                          </div>
                          {/* Progress Ring Mini */}
                          <div className="relative size-8">
                            <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                              <path className="text-teal-100 dark:text-teal-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"></path>
                              <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="0, 100" strokeWidth="4"></path>
                            </svg>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 relative z-10">
                          <p className="text-sm text-teal-700 dark:text-teal-300 line-clamp-2">{unit.description}</p>
                          <div className="flex items-center gap-2 text-xs font-semibold text-teal-600">
                            <span className="bg-teal-50 px-2 py-1 rounded-md border border-teal-100">{unit.questions?.length || 0} câu hỏi</span>
                            <span className="bg-teal-50 px-2 py-1 rounded-md border border-teal-100">{unit.durationMinutes || 15} phút</span>
                          </div>
                          <button onClick={() => onStartQuiz(unit)} className="mt-2 w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-teal-500/30 transition-all active:scale-[0.98]">
                            <span>Tiếp tục học</span>
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex flex-col justify-center ${isCompleted ? 'opacity-100' : 'opacity-80'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className={`text-base font-bold ${isLocked ? 'text-gray-500 dark:text-gray-400' : 'text-teal-800 dark:text-teal-200'} flex items-center gap-2`}>
                              {unit.title}
                              {isCompleted && unit.level && unit.level > 1 && (
                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-200">Lv.{unit.level}</span>
                              )}
                            </h4>
                            {isCompleted && <p className="text-xs text-teal-500 mt-1">Đã hoàn thành xuất sắc!</p>}
                          </div>
                          {!isCompleted && <span className="bg-teal-100 dark:bg-teal-900 text-[10px] px-2 py-0.5 rounded text-teal-600 dark:text-teal-400 font-bold">Chưa học</span>}
                        </div>

                        {/* Action Buttons for Locked/Future Units */}
                        {!isCompleted && isLocked && (
                          <div className="mt-2 p-3 bg-white dark:bg-surface-dark border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                            <p className="text-xs text-gray-500 mb-2">Bạn có thể chọn học bài này ngay nếu muốn.</p>
                            <button
                              onClick={() => onStartQuiz(unit)}
                              className="w-full py-2 px-3 bg-white dark:bg-dark-bg border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-sm font-semibold rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors flex items-center justify-center gap-2"
                            >
                              <BookOpen size={16} />
                              Học bài này
                            </button>
                          </div>
                        )}

                        {/* Challenge Upgrade Button for Completed Units - Unlimited */}
                        {isCompleted && isUpgradeAvailable && (
                          <button
                            onClick={() => setSelectedUpgradeUnit(unit)}
                            className="mt-3 flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-3 group hover:shadow-md transition-all cursor-pointer w-full text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-orange-500 text-white p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform">
                                <Trophy size={18} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-orange-800">
                                  {unit.level && unit.level >= 3 ? 'Luyện tập Nâng cao' : `Thử thách Cấp độ ${unit.level ? unit.level + 1 : 2}`}
                                </p>
                                <p className="text-xs text-orange-600/80">
                                  {unit.level && unit.level >= 3 ? 'Giữ vững phong độ • Cực khó' : 'Nhiều câu hỏi hơn • Khó hơn'}
                                </p>
                              </div>
                            </div>
                            <ArrowRight size={16} className="text-orange-500 group-hover:translate-x-1 transition-transform" />
                          </button>
                        )}

                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {/* Future Indicator / Comprehensive Test */}
            <div className="flex flex-col items-center z-10">
              <div className="size-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 ring-4 ring-primary-surface dark:ring-dark-bg flex items-center justify-center text-white shadow-lg animate-pulse">
                <Star fill="currentColor" size={20} />
              </div>
            </div>
            <div className="pl-4 pb-10">
              <button
                onClick={onStartComprehensiveTest}
                className="w-full bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 rounded-xl p-4 border border-purple-200 dark:border-purple-800/50 hover:shadow-md transition-all text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                      Tổng kết chặng
                    </span>
                    <h4 className="text-lg font-bold text-purple-900 dark:text-purple-100 mt-1">Kiểm tra tổng hợp</h4>
                  </div>
                  <div className="bg-white dark:bg-purple-900/20 p-2 rounded-lg text-purple-500">
                    <FileText size={20} />
                  </div>
                </div>
                <p className="text-sm text-purple-800/70 dark:text-purple-300 mb-3">
                  Bài kiểm tra thích ứng gồm 20 câu hỏi (Dễ → Khó) để đánh giá toàn diện kiến thức của bạn.
                </p>
                <div className="flex items-center text-purple-600 dark:text-purple-400 text-sm font-bold gap-1 group-hover:gap-2 transition-all">
                  Bắt đầu ngay <ArrowRight size={16} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {selectedUpgradeUnit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-orange-100 to-transparent pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 mb-4 animate-bounce">
                <Trophy size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Chấp nhận thử thách?</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 leading-relaxed">
                Bạn sắp mở khóa <strong>Cấp độ {selectedUpgradeUnit.level ? selectedUpgradeUnit.level + 1 : 2}</strong> cho bài học này.
                <br /><br />
                <span className="block bg-orange-50 text-orange-800 py-2 px-3 rounded-lg border border-orange-100 text-xs font-semibold">
                  🔥 10-15 câu hỏi • Độ khó tăng dần
                </span>
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setSelectedUpgradeUnit(null)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    onUpgradeUnit(selectedUpgradeUnit);
                    setSelectedUpgradeUnit(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-colors active:scale-95"
                >
                  Chiến luôn!
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedUpgradeUnit(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};