
import React, { useState, useEffect } from 'react';
import { Key, Save, ExternalLink, AlertTriangle, Check, Zap, Cpu } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onSave: (key: string, model: string) => void;
  onClose?: () => void;
  initialKey?: string;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onSave, onClose, initialKey = '' }) => {
  const [key, setKey] = useState(initialKey);
  const [model, setModel] = useState('gemini-1.5-flash');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialKey) setKey(initialKey);
  }, [initialKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!key.trim()) {
      setError('Vui lòng nhập API Key hợp lệ');
      return;
    }
    if (!key.startsWith('AIza')) {
      setError('API Key có vẻ không đúng định dạng (thường bắt đầu bằng AIza...)');
      // We allow it but show warning/error state
    }
    onSave(key.trim(), model);
    if (onClose) onClose();
  };

  const models = [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', desc: 'Tốc độ cao, Rate Limit thoải mái (Khuyên dùng)' },
    { id: 'gemini-1.5-flash-8b', name: 'Gemini Flash 8B', desc: 'Siêu nhanh, ít lỗi mạng' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', desc: 'Mới nhất, thông minh (Dễ dính 429)' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-teal-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Key size={24} />
            </div>
            <h2 className="text-xl font-bold">Cấu hình API Key</h2>
          </div>
          <p className="text-teal-50 text-sm">
            Ứng dụng cần Gemini API Key của riêng bạn để hoạt động.
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
            <div className="flex gap-3">
              <AlertTriangle className="text-blue-600 shrink-0 w-5 h-5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-bold mb-1">Chưa có API Key?</p>
                <p className="mb-2">Truy cập Google AI Studio để lấy key miễn phí.</p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://aistudio.google.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Lấy Key ngay <ExternalLink size={12} />
                  </a>
                  <a
                    href="https://drive.google.com/drive/folders/1qPZiXAtBtcKvj3WwSdzp_ZHw7DUmcMQ3"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors"
                  >
                    Xem hướng dẫn <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Key Input */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Nhập API Key của bạn</label>
            <input
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setError('');
              }}
              placeholder="AIzaSy..."
              className="w-full p-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-black/20 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm"
            />
            {error && <p className="text-red-500 text-xs font-bold animate-pulse">{error}</p>}
          </div>

          {/* Model Selection */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Chọn Model AI ưu tiên</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  className={`relative flex flex-col items-start p-3 rounded-xl border transition-all text-left
                            ${model === m.id
                      ? 'bg-teal-50 border-primary shadow-sm'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                >
                  {model === m.id && (
                    <div className="absolute top-2 right-2 text-primary">
                      <Check size={16} />
                    </div>
                  )}
                  <span className={`font-bold text-xs mb-1 ${model === m.id ? 'text-teal-900' : 'text-gray-700 dark:text-gray-300'}`}>{m.name}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-black/10">
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-500 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Đóng
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-teal-500/30 transition-all active:scale-95 text-sm flex items-center gap-2"
          >
            <Save size={18} />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};
