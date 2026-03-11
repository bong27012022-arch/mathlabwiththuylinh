
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, MoreVertical, Send, Loader2, Sparkles, Lightbulb, BookOpen, PenTool, Eraser, User, Bot, HelpCircle, Image as ImageIcon, X } from 'lucide-react';
import { UserProfile } from '../../types';
import { chatWithAI } from '../../utils/aiGenerator';

interface Props {
  user: UserProfile;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: string; // Optional Base64 image
}

export const ChatScreen: React.FC<Props> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Xin chào ${user.name}! Cô là trợ lý AI riêng của em đây. Dựa trên thần số học số ${user.numerologyNumber}, cô sẽ giúp em học toán theo cách ${user.numerologyProfile?.mathApproach ? user.numerologyProfile.mathApproach.toLowerCase() : 'phù hợp nhất'}. Hôm nay em cần cô giúp bài nào không? Em có thể chụp ảnh bài tập gửi cho cô nhé!`,
      timestamp: Date.now()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [supportMode, setSupportMode] = useState<'hint' | 'guide' | 'solution'>('guide');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() && !selectedImage) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText,
      image: selectedImage || undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    const imageToSend = selectedImage; // Store temp to send
    setSelectedImage(null); // Clear preview immediately
    setIsLoading(true);

    // Prepare history for API
    const historyForAI = messages.map(m => ({ role: m.role, content: m.content }));

    // Send multimodal request if image exists
    const aiResponseText = await chatWithAI(user, userMsg.content || "Hãy xem hình ảnh này.", historyForAI, supportMode, imageToSend);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      content: aiResponseText,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Bạn có chắc muốn xóa toàn bộ đoạn chat này không?")) {
      setMessages([{
        id: 'welcome-reset',
        role: 'model',
        content: `Chào lại nhé ${user.name}! Chúng ta bắt đầu lại nào. Em cần giúp gì?`,
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-dark-bg font-display h-screen flex flex-col overflow-hidden text-gray-900 dark:text-white transition-colors duration-200">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md sticky top-0 z-20 shadow-sm border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-primary flex items-center justify-center text-white shadow-lg">
              <Bot size={24} />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-dark-bg"></div>
          </div>
          <div>
            <h2 className="text-base font-bold leading-tight">AI Tutor {user.numerologyProfile?.title ? `- ${user.numerologyProfile.title}` : ''}</h2>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">Trực tuyến</span>
            </div>
          </div>
        </div>
        <button onClick={clearHistory} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5" title="Xóa lịch sử">
          <Eraser size={20} />
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-4 scroll-smooth bg-gradient-to-b from-gray-50 to-white dark:from-dark-bg dark:to-surface-dark relative custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex w-full mb-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-primary mr-2 shrink-0 self-start mt-1">
                <Sparkles size={16} />
              </div>
            )}
            <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-sm whitespace-pre-wrap math-formula
                        ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="max-w-full rounded-lg mb-2 border border-white/20" />
                )}
                <div dangerouslySetInnerHTML={{ __html: msg.content }}></div>
              </div>
              <span className="text-[10px] text-gray-400 mt-1 px-1">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 ml-2 shrink-0 self-start mt-1">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex w-full mb-6 justify-start">
            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-primary mr-2 shrink-0">
              <Sparkles size={16} />
            </div>
            <div className="bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-gray-500">Đang suy nghĩ...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-3 z-30">
        {/* Support Mode Selectors */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar px-1">
          <button
            onClick={() => setSupportMode('hint')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                ${supportMode === 'hint'
                ? 'bg-yellow-100 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-400'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-dark-bg dark:border-gray-700 dark:text-gray-400'}`}
          >
            <Lightbulb size={14} />
            Gợi ý nhẹ
          </button>
          <button
            onClick={() => setSupportMode('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                ${supportMode === 'guide'
                ? 'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-400'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-dark-bg dark:border-gray-700 dark:text-gray-400'}`}
          >
            <BookOpen size={14} />
            Hướng dẫn cách làm
          </button>
          <button
            onClick={() => setSupportMode('solution')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border
                ${supportMode === 'solution'
                ? 'bg-green-100 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-400'
                : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 dark:bg-dark-bg dark:border-gray-700 dark:text-gray-400'}`}
          >
            <PenTool size={14} />
            Giải chi tiết
          </button>
        </div>

        {/* Image Preview */}
        {selectedImage && (
          <div className="flex items-start gap-2 mb-2 px-1 animate-fade-in-up">
            <div className="relative">
              <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-teal-200 shadow-sm" />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 max-w-4xl mx-auto relative">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex shrink-0 items-center justify-center rounded-xl size-11 bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary transition-colors hover:bg-teal-50"
            title="Tải ảnh lên"
          >
            <ImageIcon size={20} />
          </button>

          <div className="flex-1 bg-gray-100 dark:bg-black/20 rounded-2xl flex items-center p-1 focus-within:ring-2 focus-within:ring-primary/50 transition-shadow border border-transparent focus-within:border-primary/20">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2.5 max-h-32 min-h-[44px] resize-none"
              placeholder="Nhập bài toán hoặc tải ảnh lên..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
              style={{ height: 'auto', overflow: 'hidden' }}
              onInput={(e) => {
                e.currentTarget.style.height = 'auto';
                e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={(!inputText.trim() && !selectedImage) || isLoading}
            className={`flex shrink-0 items-center justify-center rounded-xl size-11 shadow-md transition-all transform active:scale-95
                ${(!inputText.trim() && !selectedImage) || isLoading
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                : 'bg-primary text-white hover:bg-primary-dark hover:shadow-lg'}`}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} className="ml-0.5" />}
          </button>
        </div>
        <p className="text-[10px] text-center text-gray-400 mt-2">AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.</p>
      </footer>
    </div>
  );
};
