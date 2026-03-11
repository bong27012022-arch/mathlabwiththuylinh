import React from 'react';
import { ScreenName } from '../types';
import { Home, Map, BarChart2, User, Gamepad2, History } from 'lucide-react';

interface Props {
  currentScreen: ScreenName;
  onNavigate: (screen: ScreenName) => void;
}

export const BottomNavigation: React.FC<Props> = ({ currentScreen, onNavigate }) => {
  const tabs = [
    { id: ScreenName.LEARNING_PATH, icon: Home, label: 'Trang chủ' },
    { id: ScreenName.HISTORY, icon: History, label: 'Lịch sử' },
    { id: ScreenName.CHAT, icon: Map, label: 'AI Tutor' },
    { id: ScreenName.PARENT_REPORT, icon: BarChart2, label: 'Báo cáo' },
    { id: ScreenName.PROFILE, icon: User, label: 'Cá nhân' },
  ];

  return (
    <div className="md:hidden absolute bottom-0 w-full bg-white border-t border-gray-100 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center h-16">
        {tabs.map((tab) => {
          const isActive = currentScreen === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-400 hover:text-primary-light'
                }`}
            >
              <div className={`relative ${isActive ? '-top-1' : ''} transition-all`}>
                {isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(13,148,136,0.8)]"></div>
                )}
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} className={isActive ? "text-primary opacity-20" : ""} />
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className="absolute top-0 left-0" />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="h-4 w-full"></div>
    </div>
  );
};