import React, { useState, useMemo } from 'react';
import { ArrowUp, CheckCircle, Clock, TrendingUp, ArrowRight, BookOpen, Calculator, Shapes, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from 'recharts';
import { UserProfile, QuizResult } from '../../types';

interface Props {
  user: UserProfile;
}

export const ParentReportScreen: React.FC<Props> = ({ user }) => {
  const history = user.history || [];
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // --- HELPER: Date Utils ---
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday, ...
    let day = new Date(year, month, 1).getDay();
    // Adjust so Monday is 0 (if we want Monday start), but let's stick to Sunday = 0 for standard calendars or adjust visual
    return day;
  };

  // --- 1. FILTER DATA BASED ON VIEW MODE (Week vs Month) ---
  const filteredHistory = useMemo(() => {
    const now = new Date();
    const startPeriod = new Date();
    
    if (viewMode === 'week') {
      // Last 7 days
      startPeriod.setDate(now.getDate() - 7);
    } else {
      // Current Month
      startPeriod.setDate(1); 
    }

    return history.filter(h => new Date(h.timestamp || 0) >= startPeriod);
  }, [history, viewMode]);

  // --- 2. STATISTICS CALCULATION (Based on Filtered Data) ---
  const totalSeconds = filteredHistory.reduce((acc, item) => acc + (item.timeSpentSeconds || 0), 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  const completedUnits = filteredHistory.length;

  const calculateAverageScore = (data: QuizResult[]) => {
    if (data.length === 0) return 0;
    let totalScoreNormalized = 0;
    data.forEach(item => {
      const normalized = (item.score / item.totalQuestions) * 10;
      totalScoreNormalized += normalized;
    });
    return (totalScoreNormalized / data.length).toFixed(1);
  };
  const averageScore = calculateAverageScore(filteredHistory);

  // --- 3. CHART DATA GENERATION ---
  const chartData = useMemo(() => {
    const dataPoints = [];
    const now = new Date();
    
    if (viewMode === 'week') {
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        dataPoints.push(d);
      }
    } else {
      // Generate all days of current month so far OR last 30 days. Let's do days of current month.
      const daysInMonth = now.getDate(); // Up to today
      for (let i = 1; i <= daysInMonth; i++) {
         const d = new Date(now.getFullYear(), now.getMonth(), i);
         dataPoints.push(d);
      }
    }

    return dataPoints.map(date => {
      const dateStr = date.toDateString();
      const quizzesOnDate = history.filter(h => new Date(h.timestamp || 0).toDateString() === dateStr);
      
      let dayScore = 0;
      if (quizzesOnDate.length > 0) {
        const total = quizzesOnDate.reduce((acc, q) => acc + (q.score / q.totalQuestions) * 10, 0); // Scale 0-10
        dayScore = total / quizzesOnDate.length;
      }

      return {
        name: viewMode === 'week' ? ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()] : `${date.getDate()}`,
        score: parseFloat(dayScore.toFixed(1)),
        fullDate: dateStr,
        hasActivity: quizzesOnDate.length > 0
      };
    });
  }, [history, viewMode]);

  // --- 4. CALENDAR LOGIC ---
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysCount = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month); // 0 is Sunday

    const days = [];
    // Padding for empty slots
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // Actual days
    for (let i = 1; i <= daysCount; i++) {
      const d = new Date(year, month, i);
      const dayActivity = history.filter(h => isSameDay(new Date(h.timestamp || 0), d));
      days.push({
        date: d,
        activityCount: dayActivity.length,
        avgScore: calculateAverageScore(dayActivity)
      });
    }
    return days;
  }, [currentMonth, history]);

  // Selected Day Details
  const selectedDayActivity = useMemo(() => {
    return history.filter(h => isSameDay(new Date(h.timestamp || 0), selectedDate));
  }, [history, selectedDate]);

  return (
    <div className="bg-primary-surface dark:bg-dark-bg min-h-screen text-gray-900 dark:text-white pb-24 font-display transition-colors">
       {/* Header */}
       <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-md border-b border-teal-100 dark:border-teal-900/30">
        <div className="flex items-center p-4 justify-between max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-primary" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBH-lzjPwoBuGXAY80EXqGwzO-G6jxq6GTPRlfm_S2o2IdOHnnZBZM17YAVjsJloxtdwSq-klJbrM9fEepBEDEB7eM2a1vivOeALepq_y6DMNRyTzP3eOVlZhbbPje1GR3ltIagfw3qzXkq9fQP-c1WWtpKq5l8f4yzXPwSIhGO30A8e8lUAYai-w1ja6xv0K8wYmiEpJ11vHefcDJrn-ke8TJGxHOruB_jWcK22StqWXBtO5BE6xBsxAuXlTEZS7nqC0XSoq3vk4")' }}></div>
              <div className="absolute -bottom-1 -right-1 bg-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full text-teal-900 shadow-sm border border-white">LV.{Math.floor(history.length / 3) + 1}</div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Phụ huynh của</p>
              <h2 className="text-base font-bold leading-tight">{user.name || "Bé yêu"}</h2>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-8 flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Toggle View Mode */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Tổng quan</h2>
          <div className="flex h-10 bg-teal-50 dark:bg-teal-900/20 p-1 rounded-xl border border-teal-100 dark:border-teal-800/30">
            <button 
              onClick={() => setViewMode('week')}
              className={`px-4 rounded-lg text-xs font-bold transition-all ${viewMode === 'week' ? 'bg-white dark:bg-dark-surface text-teal-900 dark:text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              Tuần này
            </button>
            <button 
              onClick={() => setViewMode('month')}
              className={`px-4 rounded-lg text-xs font-bold transition-all ${viewMode === 'month' ? 'bg-white dark:bg-dark-surface text-teal-900 dark:text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
              Tháng này
            </button>
          </div>
        </div>

        {/* Top Grid: Stats & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Stats Cards */}
            <div className="grid grid-cols-2 gap-3 lg:col-span-1 h-full">
                <div className="col-span-2 flex flex-col gap-1 rounded-2xl p-5 bg-gradient-to-br from-primary to-[#00d4c0] shadow-lg shadow-teal-200/50 dark:shadow-none text-teal-950 relative overflow-hidden h-full min-h-[160px]">
                    <div className="absolute -right-8 -top-8 size-32 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="flex justify-between items-start z-10">
                    <div>
                        <p className="text-sm font-bold opacity-80 mb-1">Điểm trung bình</p>
                        <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-extrabold tracking-tight">{averageScore}</span>
                        <span className="text-lg font-bold opacity-70">/10</span>
                        </div>
                    </div>
                    <div className="bg-white/30 backdrop-blur-sm p-2 rounded-lg">
                        <TrendingUp size={28} />
                    </div>
                    </div>
                    <div className="flex items-center gap-1 mt-auto z-10">
                    {filteredHistory.length > 0 ? (
                        <>
                            <ArrowUp size={14} strokeWidth={3} />
                            <span className="text-sm font-bold">Thực tế</span>
                            <span className="text-xs opacity-70 font-medium ml-1">trong {viewMode === 'week' ? 'tuần' : 'tháng'}</span>
                        </>
                    ) : (
                        <span className="text-sm font-medium opacity-80">Chưa có dữ liệu</span>
                    )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 mb-1">
                    <CheckCircle size={20} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Hoàn thành</p>
                    <p className="text-xl font-bold">{completedUnits} <span className="text-xs font-normal text-slate-400">bài</span></p>
                </div>

                <div className="flex flex-col gap-2 rounded-2xl p-4 bg-white dark:bg-surface-dark shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-1">
                    <Clock size={20} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">Thời gian học</p>
                    <p className="text-xl font-bold whitespace-nowrap">{timeDisplay}</p>
                </div>
            </div>

            {/* Right Column: Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 h-full min-h-[300px] flex flex-col">
                <div className="flex justify-between items-end mb-4">
                    <div>
                    <p className="text-lg font-bold leading-tight">Biểu đồ năng lực</p>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                      {viewMode === 'week' ? '7 ngày gần đây' : 'Tháng này'}
                    </p>
                    </div>
                </div>
                <div className="w-full flex-1 min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.5} />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 12, fill: '#9CA3AF' }} 
                          domain={[0, 10]}
                          ticks={[0, 5, 10]}
                        />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} 
                          formatter={(value: number) => [`${value}/10`, 'Điểm']}
                          labelStyle={{ color: '#0d9488', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="score" stroke="#0d9488" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* --- CALENDAR SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold px-1 flex items-center gap-2">
                 <CalendarIcon className="text-primary w-5 h-5" />
                 Lịch học tập
              </h2>
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                 {/* Calendar Header */}
                 <div className="flex items-center justify-between mb-6">
                    <button 
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                       <ChevronLeft size={20} />
                    </button>
                    <span className="text-base font-bold capitalize">
                       Tháng {currentMonth.getMonth() + 1}, {currentMonth.getFullYear()}
                    </span>
                    <button 
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                       <ChevronRight size={20} />
                    </button>
                 </div>

                 {/* Days Header */}
                 <div className="grid grid-cols-7 mb-2 text-center">
                    {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                       <span key={d} className="text-xs font-bold text-gray-400 mb-2">{d}</span>
                    ))}
                 </div>

                 {/* Calendar Grid */}
                 <div className="grid grid-cols-7 gap-y-2 gap-x-1">
                    {calendarDays.map((day, idx) => {
                       if (!day) return <div key={`empty-${idx}`} className="aspect-square"></div>;
                       
                       const isSelected = isSameDay(day.date, selectedDate);
                       const isToday = isSameDay(day.date, new Date());
                       const hasActivity = day.activityCount > 0;

                       return (
                          <button
                             key={day.date.toISOString()}
                             onClick={() => setSelectedDate(day.date)}
                             className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all duration-200 border-2
                                ${isSelected 
                                   ? 'bg-primary text-white border-primary shadow-md transform scale-105 z-10' 
                                   : 'bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300'
                                }
                                ${isToday && !isSelected ? 'text-primary font-bold border-primary/30' : ''}
                             `}
                          >
                             <span className="text-sm font-medium">{day.date.getDate()}</span>
                             
                             {/* Indicators */}
                             <div className="flex gap-0.5 mt-1">
                                {hasActivity && (
                                   <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>
                                )}
                             </div>
                          </button>
                       );
                    })}
                 </div>
              </div>
           </div>

           {/* Selected Day Details */}
           <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold px-1 opacity-0 lg:opacity-100 transition-opacity">Chi tiết ngày</h2>
              <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-full flex flex-col">
                 <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                       <p className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
                          {selectedDate.toLocaleDateString('vi-VN', { weekday: 'long' })}
                       </p>
                       <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          Ngày {selectedDate.getDate()} tháng {selectedDate.getMonth() + 1}
                       </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${selectedDayActivity.length > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                       {selectedDayActivity.length > 0 ? 'Đã học tập' : 'Không có hoạt động'}
                    </div>
                 </div>

                 {selectedDayActivity.length > 0 ? (
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-1">
                       {/* Day Summary */}
                       <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                             <p className="text-xs text-gray-500">Tổng thời gian</p>
                             <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {Math.floor(selectedDayActivity.reduce((acc, i) => acc + i.timeSpentSeconds, 0) / 60)} phút
                             </p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                             <p className="text-xs text-gray-500">Bài hoàn thành</p>
                             <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {selectedDayActivity.length} bài
                             </p>
                          </div>
                       </div>

                       <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-2">Bài tập đã làm:</p>
                       {selectedDayActivity.map((activity, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-dark-bg border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm ${
                                   (activity.score / activity.totalQuestions) >= 0.8 ? 'bg-green-100 text-green-700' : 
                                   (activity.score / activity.totalQuestions) >= 0.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                   {((activity.score / activity.totalQuestions) * 10).toFixed(0)}
                                </div>
                                <div>
                                   <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{activity.unitTitle || "Bài tập"}</p>
                                   <p className="text-xs text-gray-500">{new Date(activity.timestamp || 0).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</p>
                                </div>
                             </div>
                             <div className="text-xs font-medium text-gray-400">
                                {activity.score}/{activity.totalQuestions} câu
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-60">
                       <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                          <CalendarIcon className="text-gray-400 w-8 h-8" />
                       </div>
                       <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Hôm nay bé nghỉ ngơi</p>
                       <p className="text-xs text-gray-400 mt-1 max-w-[200px]">Không có dữ liệu bài tập nào được ghi nhận vào ngày này.</p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* AI Advice Footer */}
        <div className="flex flex-col gap-3 mt-4">
            <h2 className="text-lg font-bold px-1">Góc tư vấn AI</h2>
            <div className="bg-gradient-to-r from-teal-50 to-white dark:from-surface-dark dark:to-dark-bg border border-teal-200 dark:border-teal-900 rounded-2xl p-5 relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all duration-500"></div>
                <div className="flex gap-4 items-start relative z-10">
                    <div className="bg-white dark:bg-slate-700 p-2 rounded-xl shadow-sm shrink-0">
                        <BookOpen className="text-3xl text-primary-dark dark:text-primary" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                        <span className="bg-primary/20 text-teal-800 dark:text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider border border-primary/20">
                            Thần số học: Số {user.numerologyNumber}
                        </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                        {user.name || "Bé"} có tính cách <span className="font-bold text-teal-700 dark:text-primary">Số {user.numerologyNumber}</span> - {user.numerologyProfile?.title || "Sáng tạo"}. 
                        <br/>
                        Dựa trên {filteredHistory.length} bài học {viewMode === 'week' ? 'trong tuần' : 'trong tháng'}, AI nhận thấy bé {Number(averageScore) >= 8 ? "đang làm rất tốt" : Number(averageScore) >= 5 ? "đang tiến bộ đều" : "cần được động viên thêm"}.
                        <br/>
                        Mẹo: {user.numerologyProfile?.mathApproach || "Hãy kết hợp học với trò chơi nhỏ để tăng hứng thú."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
};