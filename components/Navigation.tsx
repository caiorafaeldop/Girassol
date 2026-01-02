import React from 'react';
import { AppView } from '../types';
import { LayoutDashboard, Book, CheckSquare, Dumbbell, List, PieChart, Newspaper } from 'lucide-react';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, icon: LayoutDashboard, label: 'Sol' },
    { view: AppView.PROGRESS, icon: PieChart, label: 'Crescer' },
    { view: AppView.TODO, icon: List, label: 'Ação' },
    { view: AppView.HABITS, icon: CheckSquare, label: 'Raízes' },
    { view: AppView.WEIGHT, icon: Dumbbell, label: 'Corpo' },
    { view: AppView.NEWS, icon: Newspaper, label: 'Notícias' },
    { view: AppView.JOURNAL, icon: Book, label: 'Alma' },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-2 pointer-events-none">
      <div className="flex items-center justify-between p-2 bg-white/60 backdrop-blur-2xl border border-white/60 rounded-full shadow-2xl shadow-yellow-500/10 pointer-events-auto overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            className={`relative group p-2 min-w-[44px] flex justify-center items-center rounded-full transition-all duration-300 ${
              currentView === item.view
                ? 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg scale-110 -translate-y-2'
                : 'text-blue-900 hover:bg-white/60 hover:scale-105 hover:text-green-600'
            }`}
          >
            <item.icon size={20} strokeWidth={currentView === item.view ? 2.5 : 2} />
            
            {/* Tooltip-ish Label */}
            <span className={`absolute -top-10 left-1/2 transform -translate-x-1/2 bg-blue-900/90 text-white text-[10px] px-2 py-1 rounded opacity-0 transition-opacity pointer-events-none whitespace-nowrap ${
                currentView === item.view ? 'opacity-100' : 'group-hover:opacity-100'
            }`}>
                {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};