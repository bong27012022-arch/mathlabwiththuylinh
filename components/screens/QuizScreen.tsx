
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Zap, Bookmark, CheckCircle, Lightbulb, Send, XCircle, AlertCircle } from 'lucide-react';
import { LearningUnit, Question, QuizResult } from '../../types';

interface Props {
  unit: LearningUnit | null;
  onFinish: (result: QuizResult) => void;
  onBack: () => void;
  isReviewMode?: boolean;
  existingAnswers?: Record<string, string>;
}

export const QuizScreen: React.FC<Props> = ({ unit, onFinish, onBack, isReviewMode = false, existingAnswers = {} }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers);
  const [inputValue, setInputValue] = useState("");
  
  // State to track if the current question has been checked/submitted
  const [isChecked, setIsChecked] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    // If reviewing, jump to start and answers are pre-filled
    if (isReviewMode) {
      setAnswers(existingAnswers);
      setIsChecked(true); // In review mode, everything is "checked"
    } else {
      setAnswers({});
      setIsChecked(false);
      setCurrentIndex(0);
    }
  }, [isReviewMode, unit]);

  useEffect(() => {
    // When changing questions in normal mode, reset check state and input
    if (!isReviewMode) {
      setIsChecked(false);
      const savedAns = answers[unit?.questions[currentIndex]?.id || ''] || "";
      setInputValue(savedAns);
      // If we already have an answer for this ID (unlikely in linear flow but good safety), set checked
      if (answers[unit?.questions[currentIndex]?.id || '']) {
        setIsChecked(true);
      }
    } else {
      // In review mode, populate input for fill-in-blank
      const savedAns = answers[unit?.questions[currentIndex]?.id || ''] || "";
      setInputValue(savedAns);
      setIsChecked(true);
    }
  }, [currentIndex, unit]);

  if (!unit || !unit.questions || unit.questions.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center h-screen bg-primary-surface dark:bg-dark-bg p-6 text-center">
         <h2 className="text-xl font-bold mb-2">Đang tải dữ liệu...</h2>
         <button onClick={onBack} className="bg-primary text-white px-4 py-2 rounded-lg font-bold">Quay lại</button>
       </div>
     );
  }

  const question = unit.questions[currentIndex];
  const totalQuestions = unit.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  
  // Helper to normalize answers for comparison (trimmed, lowercase, and language mapping)
  const normalize = (str: string) => {
    const s = str.trim().toLowerCase();
    // Map Vietnamese UI terms to English logical values often returned by AI
    if (s === 'đúng') return 'true';
    if (s === 'sai') return 'false';
    return s;
  };
  
  const isCorrectAnswer = (userAns: string, correctAns: string) => normalize(userAns) === normalize(correctAns);

  const handleAnswerSelect = (val: string) => {
    if (isReviewMode || isChecked) return; // Prevent changing answer after check or in review

    const newAnswers = { ...answers, [question.id]: val };
    setAnswers(newAnswers);
    setInputValue(val); // Sync for text inputs
    
    // Immediate Feedback trigger:
    setIsChecked(true);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Finish Quiz
      let correctCount = 0;
      unit.questions.forEach(q => {
        if (isCorrectAnswer(answers[q.id] || "", q.correctAnswer)) {
          correctCount++;
        }
      });
      
      const result: QuizResult = {
        unitId: unit.id,
        score: correctCount,
        totalQuestions: totalQuestions,
        userAnswers: answers,
        timeSpentSeconds: Math.floor((Date.now() - startTime) / 1000)
      };
      
      onFinish(result);
    }
  };

  const currentAnswer = answers[question.id];
  const isCurrentCorrect = currentAnswer ? isCorrectAnswer(currentAnswer, question.correctAnswer) : false;

  const renderExplanation = () => {
    if (!isChecked && !isReviewMode) return null;

    return (
      <div className={`mt-6 p-6 rounded-2xl border-l-8 animate-fade-in-up shadow-sm ${isCurrentCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
        <div className="flex items-center gap-3 mb-3">
          {isCurrentCorrect ? (
             <><CheckCircle className="text-green-600 w-8 h-8" /><span className="font-bold text-green-800 text-xl">Chính xác!</span></>
          ) : (
             <><XCircle className="text-red-600 w-8 h-8" /><span className="font-bold text-red-800 text-xl">Chưa chính xác</span></>
          )}
        </div>
        
        {!isCurrentCorrect && (
          <div className="mb-4 text-lg">
            <span className="font-bold text-gray-600 block mb-1">Đáp án đúng: </span>
            <div className="bg-white/50 inline-block px-4 py-2 rounded-lg border border-gray-200">
               <span className="font-bold text-gray-900 text-xl math-formula" dangerouslySetInnerHTML={{ __html: question.correctAnswer === 'True' ? 'Đúng' : question.correctAnswer === 'False' ? 'Sai' : question.correctAnswer }}></span>
            </div>
          </div>
        )}

        <div className="text-base md:text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
           <span className="font-bold block mb-2 text-primary-dark">Giải thích chi tiết:</span>
           <div className="math-formula space-y-2 [&>p]:mb-2" dangerouslySetInnerHTML={{ __html: question.explanation }}></div>
        </div>
      </div>
    );
  };

  const renderQuestionInput = (q: Question) => {
    if (q.type === 'multiple-choice') {
      return (
        <div className="flex flex-col gap-4">
          <p className="text-base font-bold text-gray-500 dark:text-gray-400 ml-1 uppercase tracking-wide">Chọn đáp án đúng:</p>
          <div className="grid grid-cols-1 gap-4">
            {q.options?.map((ans, idx) => {
              const labels = ['A', 'B', 'C', 'D'];
              const isSelected = currentAnswer === ans;
              const isThisCorrect = isCorrectAnswer(ans, q.correctAnswer);
              
              // Styles based on state
              let borderColor = "border-transparent";
              let bgColor = "bg-white dark:bg-surface-dark";
              let shadow = "shadow-sm hover:shadow-md";
              let labelBg = "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-white/60";
              let icon = null;

              if (isChecked || isReviewMode) {
                shadow = "shadow-none";
                if (isSelected && isThisCorrect) {
                   borderColor = "border-green-500";
                   bgColor = "bg-green-50 dark:bg-green-900/20";
                   labelBg = "bg-green-500 text-white";
                   icon = <CheckCircle className="text-green-600 w-8 h-8 fill-current" />;
                } else if (isSelected && !isThisCorrect) {
                   borderColor = "border-red-500";
                   bgColor = "bg-red-50 dark:bg-red-900/20";
                   labelBg = "bg-red-500 text-white";
                   icon = <XCircle className="text-red-500 w-8 h-8" />;
                } else if (!isSelected && isThisCorrect) {
                   // Show correct answer if user missed it
                   borderColor = "border-green-500 border-dashed";
                   bgColor = "bg-white dark:bg-surface-dark";
                   labelBg = "bg-green-100 text-green-700";
                   icon = <CheckCircle className="text-green-500 w-8 h-8 opacity-50" />;
                }
              } else {
                 if (isSelected) {
                   borderColor = "border-primary";
                   bgColor = "bg-teal-50 dark:bg-teal-900/10";
                   labelBg = "bg-primary text-white";
                 }
              }

              return (
                <button 
                  key={idx}
                  disabled={isChecked || isReviewMode}
                  onClick={() => handleAnswerSelect(ans)}
                  className={`flex items-center justify-between w-full p-6 md:p-5 rounded-2xl border-2 transition-all group relative overflow-hidden
                    ${borderColor} ${bgColor} ${shadow}
                    ${(!isChecked && !isReviewMode) ? 'hover:border-teal-200 cursor-pointer active:scale-[0.99]' : 'cursor-default'}
                  `}
                >
                  <div className="flex items-center gap-6 text-left relative z-10 w-full">
                    <div className={`size-12 md:size-14 rounded-xl text-xl md:text-2xl font-bold flex shrink-0 items-center justify-center transition-colors
                      ${labelBg}
                    `}>
                      {labels[idx]}
                    </div>
                    {/* Answer Text - Using Lexend for clear math display */}
                    <span 
                      className="text-xl md:text-2xl font-medium text-gray-800 dark:text-white leading-normal font-display flex-1 math-formula"
                      dangerouslySetInnerHTML={{ __html: ans }}
                    >
                    </span>
                  </div>
                  {icon && <div className="ml-4">{icon}</div>}
                </button>
              );
            })}
          </div>
        </div>
      );
    } 
    
    if (q.type === 'true-false') {
      return (
         <div className="flex gap-6 mt-4">
           {['Đúng', 'Sai'].map((opt) => {
             const isSelected = currentAnswer === opt;
             const isThisCorrect = isCorrectAnswer(opt, q.correctAnswer);
             
             let containerClass = "bg-white border-transparent hover:shadow-md";
             if (isChecked || isReviewMode) {
                if (isSelected && isThisCorrect) containerClass = "bg-green-50 border-green-500 text-green-700";
                else if (isSelected && !isThisCorrect) containerClass = "bg-red-50 border-red-500 text-red-700";
                else if (!isSelected && isThisCorrect) containerClass = "bg-white border-green-500 border-dashed text-green-700 opacity-60";
             } else {
                if (isSelected) {
                   containerClass = opt === 'Đúng' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700';
                }
             }

             return (
               <button
                 key={opt}
                 disabled={isChecked || isReviewMode}
                 onClick={() => handleAnswerSelect(opt)}
                 className={`flex-1 h-48 md:h-64 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 transition-all shadow-sm ${containerClass}`}
               >
                 <span className="text-4xl md:text-5xl font-bold">{opt}</span>
                 {(isChecked || isReviewMode) && isSelected && (
                    isThisCorrect ? <CheckCircle className="w-10 h-10" /> : <XCircle className="w-10 h-10" />
                 )}
               </button>
             )
           })}
         </div>
      );
    }

    if (q.type === 'fill-in-blank') {
       return (
         <div className="mt-4">
           <p className="text-base font-bold text-gray-500 dark:text-gray-400 ml-1 mb-3">Nhập câu trả lời của bạn:</p>
           <div className="relative">
             <input 
               type="text" 
               disabled={isChecked || isReviewMode}
               value={inputValue}
               onChange={(e) => setInputValue(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !isChecked && inputValue) {
                   handleAnswerSelect(inputValue);
                 }
               }}
               className={`w-full h-20 md:h-24 px-6 text-3xl md:text-4xl font-bold rounded-2xl border-2 outline-none bg-white dark:bg-surface-dark dark:text-white text-center tracking-widest math-formula
                 ${(isChecked || isReviewMode) 
                    ? (isCurrentCorrect ? 'border-green-500 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-700')
                    : 'border-teal-100 focus:border-primary placeholder-gray-300'
                 }
               `}
               placeholder="..."
             />
             {!isChecked && !isReviewMode && (
               <button 
                 onClick={() => handleAnswerSelect(inputValue)}
                 disabled={!inputValue}
                 className="absolute right-3 top-3 bottom-3 bg-primary hover:bg-primary-dark text-white px-8 rounded-xl font-bold text-lg disabled:opacity-50 transition-colors"
               >
                 Kiểm tra
               </button>
             )}
           </div>
         </div>
       );
    }
  };

  return (
    <div className="bg-primary-surface dark:bg-dark-bg h-screen flex flex-col font-display text-gray-900 dark:text-white transition-colors duration-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center bg-white/90 dark:bg-dark-bg/90 backdrop-blur-md px-6 py-4 justify-between sticky top-0 z-20 border-b border-teal-100 dark:border-white/5">
        <button onClick={onBack} className="text-gray-600 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-teal-50 dark:hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center max-w-[60%]">
          <h2 className="text-gray-900 dark:text-white text-lg md:text-xl font-bold leading-tight truncate w-full text-center">
             {isReviewMode ? "Xem lại bài làm" : unit.title}
          </h2>
          <span className="text-sm text-teal-600 dark:text-teal-400 font-bold tracking-wide mt-0.5">Câu {currentIndex + 1} <span className="text-gray-400 font-normal">/</span> {totalQuestions}</span>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-2 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
          <Zap className="text-primary w-5 h-5 fill-current" />
          <p className="text-primary-dark dark:text-primary text-base font-bold leading-normal shrink-0">XP</p>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full bg-gray-200 dark:bg-gray-800 h-1.5 z-30">
        <div className="h-full bg-primary transition-all duration-500 ease-out shadow-[0_0_10px_rgba(13,148,136,0.5)]" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 pb-40 flex flex-col gap-8 relative max-w-5xl mx-auto w-full">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
            <div className="absolute top-10 left-[-50px] w-60 h-60 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-40 right-[-50px] w-60 h-60 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
         </div>

         {/* AI Tutor Hint */}
         <div className="flex items-start gap-4 relative z-10 max-w-4xl mx-auto w-full">
           <div className="bg-white dark:bg-gray-800 p-1.5 rounded-full border-2 border-teal-100 dark:border-teal-500/30 shadow-md">
             <div className="bg-center bg-no-repeat bg-cover rounded-full size-12 shrink-0" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBQarLdFTHLgxIye1wwtHTSXV1qxWdOx9oZq4Zsrbt3FTkn4PyyrJFUx4M15Ny4pGyfNUxt7duZsOSmD4A20-MiVlFq9CN4xiWt_BPo9MB9-Lxo0BnPHc19NtNw_twiHtFIJTPUF_nX5gP5FDlXMv7t7NMGk36Hsgf1lvdJw-97s8GOeOlyicnXT4YzYt_D_YKFNZvzfxZDQ6o2WLnP9tA-0GmIfeNN5sQ9F61VfJEBxc-gMmwX9OPBaJuabF_WkRP9Y_iAfnXpv8Y")' }}></div>
           </div>
           <div className="flex flex-1 flex-col gap-1.5 items-start">
             <div className="flex items-center gap-2">
               <p className="text-teal-700 dark:text-teal-300 text-xs font-bold uppercase tracking-wide bg-teal-100 dark:bg-teal-900/30 px-2 py-0.5 rounded">AI Tutor</p>
             </div>
             <div className="relative text-base md:text-lg font-medium leading-relaxed rounded-2xl rounded-tl-none px-6 py-4 bg-white dark:bg-surface-dark text-gray-700 dark:text-gray-200 shadow-sm border border-teal-50 dark:border-teal-500/10 w-full">
               <p>{isChecked 
                   ? (isCurrentCorrect ? "Giỏi lắm! Bạn đã làm đúng rồi. 🎉" : "Không sao cả, hãy xem giải thích bên dưới nhé. 👇")
                   : (question.difficulty === 'easy' ? "Câu này khởi động nhẹ nhàng thôi nhé! 😉" : "Tập trung nào, bạn làm được mà! 🚀")
               }</p>
             </div>
           </div>
         </div>

         {/* Question Card */}
         <div className="flex flex-col gap-6 relative z-10 w-full animate-fade-in-up">
           <div className="rounded-3xl bg-white dark:bg-surface-dark border-2 border-white/50 dark:border-white/5 p-8 md:p-10 shadow-xl shadow-teal-100/50 dark:shadow-none">
             <div className="flex justify-between items-start mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
               <div className="flex gap-3">
                 <span className="bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border border-teal-100 dark:border-teal-500/20">
                    {question.type === 'multiple-choice' ? 'Trắc nghiệm' : question.type === 'true-false' ? 'Đúng / Sai' : 'Điền từ'}
                 </span>
                 <span className={`text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider border ${
                     question.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-100' :
                     question.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                     'bg-red-50 text-red-700 border-red-100'
                 }`}>
                    {question.difficulty === 'easy' ? 'Dễ' : question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                 </span>
               </div>
               <button className="text-gray-300 hover:text-teal-500 transition-colors">
                 <Bookmark className="w-6 h-6" />
               </button>
             </div>
             
             {/* Large Question Text with HTML support - Enhanced Styling */}
             <div className="min-h-[120px] flex items-center">
                <div 
                  className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-relaxed tracking-tight math-formula w-full [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: question.content }}
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    textWrap: 'pretty'
                  }}
                >
                </div>
             </div>
           </div>

           {/* Dynamic Answer Section */}
           {renderQuestionInput(question)}

           {/* Explanation Section */}
           {renderExplanation()}

         </div>

         {/* Hint Button */}
         {!isChecked && !isReviewMode && (
           <div className="flex justify-center mt-4 relative z-10 pb-4">
              <button className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-full bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-base font-bold hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors border border-teal-100 dark:border-teal-800">
                <Lightbulb className="w-5 h-5 group-hover:animate-bounce" />
                Cần gợi ý? (-5 XP)
              </button>
           </div>
         )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 md:left-64 right-0 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl border-t border-teal-100 dark:border-white/5 p-5 md:p-6 z-40 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex gap-6 max-w-4xl mx-auto">
          {!isReviewMode && (
             <button onClick={onBack} className="flex-none px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold text-lg hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center justify-center min-w-[120px]">
               Bỏ qua
             </button>
          )}
          <button 
            onClick={handleNext}
            disabled={!isReviewMode && !isChecked}
            className={`flex-1 rounded-2xl text-white text-xl font-bold py-4 shadow-xl flex items-center justify-center gap-3 group transition-all active:scale-[0.99]
              ${(!isReviewMode && !isChecked) ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed shadow-none text-gray-500' : 'bg-primary hover:bg-primary-dark shadow-teal-500/30'}
            `}
          >
            <span>{currentIndex === totalQuestions - 1 ? (isReviewMode ? 'Thoát xem lại' : 'Hoàn thành') : 'Tiếp tục'}</span>
            <Send className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </footer>
    </div>
  );
};
