
import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Search, Sparkles, Gamepad2, Timer, Bolt, Star, Heart, Play, RefreshCw, X, HelpCircle, Trophy, CheckCircle, AlertCircle } from 'lucide-react';
import { generateEntertainmentContent } from '../../utils/aiGenerator';
import { UserProfile, GameActivity, QuizResult } from '../../types';

interface Props {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
}

export const GameLibraryScreen: React.FC<Props> = ({ user, setUser }) => {
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'game' | 'puzzle' | 'challenge'>('all');
  
  // Modal State
  const [selectedActivity, setSelectedActivity] = useState<GameActivity | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');

  // Load games from user profile or generate if empty
  useEffect(() => {
    if (!user.currentGames || user.currentGames.length === 0) {
      handleSwapGames();
    }
  }, []);

  const handleSwapGames = async () => {
    setLoading(true);
    try {
      const generated = await generateEntertainmentContent(user);
      setUser({ ...user, currentGames: generated });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAnswer = () => {
    if (!selectedActivity || !selectedActivity.answer) return;

    const normalizedInput = inputValue.trim().toLowerCase();
    const normalizedAnswer = selectedActivity.answer.trim().toLowerCase();

    // Check if input contains the answer or is exact match (relaxed checking)
    const isCorrect = normalizedInput === normalizedAnswer || normalizedInput.includes(normalizedAnswer);

    if (isCorrect) {
      setFeedback('correct');
      handleCompleteGame();
    } else {
      setFeedback('incorrect');
    }
  };

  const handleCompleteGame = () => {
    if (!selectedActivity) return;

    // Check if already completed to avoid duplicate XP
    if (user.completedGameIds?.includes(selectedActivity.id)) {
        return;
    }

    // 1. Add to completed IDs
    const newCompletedIds = [...(user.completedGameIds || []), selectedActivity.id];

    // 2. Add to History as a QuizResult (to count towards XP)
    // We normalize the score so that score * 10 = xpReward. 
    // Example: XP Reward 50 -> Score 5. 
    const scoreVal = Math.round(selectedActivity.xpReward / 10);
    const result: QuizResult = {
        unitId: selectedActivity.id,
        unitTitle: selectedActivity.title,
        score: scoreVal,
        totalQuestions: scoreVal, // Makes it look like 100% score
        userAnswers: { "game_input": inputValue },
        timeSpentSeconds: 60, // Dummy time
        timestamp: Date.now()
    };

    const newHistory = [result, ...(user.history || [])];

    setUser({
        ...user,
        completedGameIds: newCompletedIds,
        history: newHistory
    });
  };

  const filteredActivities = (user.currentGames || []).filter(a => filter === 'all' || a.type === filter);

  const getIcon = (type: string) => {
    switch (type) {
        case 'puzzle': return <HelpCircle className="w-5 h-5" />;
        case 'challenge': return <Trophy className="w-5 h-5" />;
        default: return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
      switch (type) {
          case 'puzzle': return 'Câu đố';
          case 'challenge': return 'Thử thách';
          default: return 'Trò chơi';
      }
  };

  const getColorClass = (type: string) => {
    switch (type) {
        case 'puzzle': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        case 'challenge': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
        default: return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  const isCompleted = (id: string) => user.completedGameIds?.includes(id);

  return (
    <div className="bg-primary-surface dark:bg-dark-bg font-display min-h-screen pb-24 text-gray-900 dark:text-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-primary-surface/95 dark:bg-dark-bg/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between">
           <div className="w-12"></div>
           <h2 className="text-lg font-bold leading-tight flex-1 text-center">Thư viện vui chơi</h2>
           <div className="w-12"></div>
        </div>
        
        {/* Swap Games Button */}
        <div className="px-4 pb-4 flex justify-center">
            <button 
                onClick={handleSwapGames}
                disabled={loading}
                className="flex items-center gap-2 bg-white dark:bg-surface-dark border border-teal-200 dark:border-teal-800 px-4 py-2 rounded-full shadow-sm text-sm font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-white/5 transition-all active:scale-95 disabled:opacity-70"
            >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Đang tìm trò chơi...' : 'Hoán đổi trò chơi'}
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Tabs */}
        <div className="pt-2 px-4 sticky top-0 z-30 bg-primary-surface dark:bg-dark-bg pb-2">
           <div className="flex space-x-2 overflow-x-auto no-scrollbar pb-1">
              {['all', 'game', 'puzzle', 'challenge'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`flex-none px-4 py-2 rounded-full font-semibold text-sm transition-all
                        ${filter === f 
                            ? 'bg-primary text-black shadow-md' 
                            : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-300'
                        }`}
                  >
                    {f === 'all' ? 'Tất cả' : f === 'game' ? 'Trò chơi' : f === 'puzzle' ? 'Câu đố' : 'Thử thách'}
                  </button>
              ))}
           </div>
        </div>

        {/* Personalized Banner */}
        <div className="mt-4 px-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-indigo-100 uppercase tracking-wide">Dành riêng cho bạn</p>
                        <h3 className="text-lg font-bold">Góc giải trí {user.numerologyProfile?.title || "Sáng tạo"}</h3>
                    </div>
                </div>
                <p className="mt-2 text-sm text-indigo-100 leading-relaxed">
                    Những trò chơi này được AI thiết kế dựa trên sở thích <strong>{user.numerologyProfile?.mathApproach || "Logic"}</strong> của bạn.
                </p>
            </div>
        </div>

        {/* Loading State */}
        {loading && (
            <div className="mt-12 flex flex-col items-center justify-center text-gray-400">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm animate-pulse">AI đang thiết kế trò chơi mới...</p>
            </div>
        )}

        {/* Content List */}
        {!loading && (
            <div className="mt-6 px-4 pb-6 flex flex-col gap-4">
            {filteredActivities.map((activity) => {
                const completed = isCompleted(activity.id);
                return (
                <div 
                    key={activity.id}
                    onClick={() => {
                        setSelectedActivity(activity);
                        setInputValue("");
                        setFeedback(completed ? 'correct' : 'none');
                    }}
                    className={`group flex p-3 bg-white dark:bg-surface-dark rounded-2xl border transition-all cursor-pointer relative overflow-hidden
                        ${completed ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10' : 'border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg'}
                    `}
                >
                    {/* Visual Decoration based on type */}
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        completed ? 'bg-green-500' : 
                        activity.type === 'puzzle' ? 'bg-purple-400' : activity.type === 'challenge' ? 'bg-orange-400' : 'bg-blue-400'
                    }`}></div>

                    <div className={`h-20 w-20 rounded-xl shrink-0 flex items-center justify-center overflow-hidden relative ${
                        completed ? 'bg-green-100 text-green-600' :
                        activity.type === 'puzzle' ? 'bg-purple-100 text-purple-500' : activity.type === 'challenge' ? 'bg-orange-100 text-orange-500' : 'bg-blue-100 text-blue-500'
                    }`}>
                         {/* Checkmark Overlay if completed */}
                        {completed && (
                            <div className="absolute inset-0 bg-green-500/80 flex items-center justify-center text-white z-10">
                                <CheckCircle size={32} />
                            </div>
                        )}
                        
                        {activity.type === 'game' && <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJB-Dol0V_mJhzkoKbnvGnpPoFiqCIBDjjyu6D4IXuVewTH625KZowI3iOKOXP9xm8fkzYV5g1jHrXMmoPDPd3H311GA495EA-eHfsJe_NNEEH9h-HbxyDYVXq-fswmYIKH3rXXxN8am34nzx5-2TSfktM41yR5ZuEP-8szc2GidBrn38VbAL-Zdn2DsLQ3DkJqwkTRgcs9cAE5l7XrbRJDmW-OURAnoEYo1IpruXVmztS-WGtfINyeA2DFZQJxYkhZmSEck6RyaI" className="w-full h-full object-cover opacity-80" alt="game" />}
                        {activity.type === 'puzzle' && <HelpCircle size={32} />}
                        {activity.type === 'challenge' && <Bolt size={32} />}
                    </div>

                    <div className="ml-3 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start">
                        <h3 className={`font-bold text-sm line-clamp-1 transition-colors ${completed ? 'text-green-800 dark:text-green-300' : 'text-gray-900 dark:text-white group-hover:text-primary'}`}>{activity.title}</h3>
                        <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${completed ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-700'}`}>
                            <Star size={10} fill="currentColor" /> {activity.xpReward} XP
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2 line-clamp-2">{activity.description}</p>
                    <div className="flex items-center gap-2 text-[10px]">
                        <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Timer size={10} /> {activity.duration}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md font-medium ${getColorClass(activity.type)}`}>
                            {getTypeLabel(activity.type)}
                        </span>
                    </div>
                    </div>
                    <div className="flex items-center pl-2">
                        <button className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                            <Play size={18} fill="currentColor" />
                        </button>
                    </div>
                </div>
                );
            })}
            </div>
        )}
      </div>

      {/* Play Modal */}
      {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  {/* Modal Header */}
                  <div className={`p-6 pb-8 relative ${
                      selectedActivity.type === 'puzzle' ? 'bg-purple-600' : selectedActivity.type === 'challenge' ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                      <button 
                        onClick={() => {
                            setSelectedActivity(null);
                            setFeedback('none');
                        }}
                        className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-1 transition-colors"
                      >
                          <X size={20} />
                      </button>
                      
                      <div className="flex justify-center mb-4">
                          <div className="bg-white/20 p-4 rounded-full backdrop-blur-md shadow-inner">
                             {selectedActivity.type === 'puzzle' ? <HelpCircle size={40} className="text-white" /> : 
                              selectedActivity.type === 'challenge' ? <Bolt size={40} className="text-white" /> :
                              <Gamepad2 size={40} className="text-white" />}
                          </div>
                      </div>
                      <h2 className="text-2xl font-bold text-center text-white">{selectedActivity.title}</h2>
                      <div className="flex justify-center gap-2 mt-2">
                          <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg">{selectedActivity.difficulty}</span>
                          <span className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-lg">{selectedActivity.duration}</span>
                      </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 flex-1 overflow-y-auto">
                      <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                         <h4 className="text-sm font-bold text-gray-500 uppercase mb-2 flex items-center gap-2">
                            <Sparkles size={14} /> Sự thật thú vị
                         </h4>
                         <p className="text-sm italic text-gray-700 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: selectedActivity.funFact || "" }}></p>
                      </div>

                      <div className="mb-6">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Nội dung:</h3>
                          <p 
                            className="text-base text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-line math-formula"
                            dangerouslySetInnerHTML={{ __html: selectedActivity.interactiveContent }}
                          >
                          </p>
                      </div>

                      {/* Input Section */}
                      <div className="mt-4">
                          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">Câu trả lời của bạn:</p>
                          <div className="relative">
                            <input 
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    if (feedback === 'incorrect') setFeedback('none'); // Reset error on typing
                                }}
                                disabled={feedback === 'correct'}
                                placeholder="Nhập đáp án tại đây..."
                                className={`w-full p-4 rounded-xl border-2 outline-none font-medium transition-all ${
                                    feedback === 'correct' ? 'border-green-500 bg-green-50 text-green-800' :
                                    feedback === 'incorrect' ? 'border-red-500 bg-red-50 text-red-800' :
                                    'border-gray-200 focus:border-primary dark:bg-black/20 dark:border-gray-700'
                                }`}
                            />
                            {feedback === 'correct' && (
                                <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600 animate-bounce" />
                            )}
                            {feedback === 'incorrect' && (
                                <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-red-600 animate-pulse" />
                            )}
                          </div>
                          
                          {feedback === 'incorrect' && (
                              <p className="text-xs text-red-500 mt-2 font-bold animate-pulse">Chưa chính xác, hãy thử lại nhé!</p>
                          )}
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-black/10">
                      {feedback === 'correct' ? (
                          <button 
                            onClick={() => setSelectedActivity(null)}
                            className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] animate-bounce"
                          >
                              Tuyệt vời! Đóng (+{selectedActivity.xpReward} XP)
                          </button>
                      ) : (
                          <button 
                            onClick={handleCheckAnswer}
                            disabled={!inputValue.trim()}
                            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-black font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                              Kiểm tra đáp án
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
