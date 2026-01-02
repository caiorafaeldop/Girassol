import React, { useEffect, useState } from 'react';
import { AppView } from '../types';

interface NavigationProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      // Verifica se o elemento focado é um campo de texto para esconder o menu
      if (['INPUT', 'TEXTAREA'].includes(target.tagName)) {
        setIsKeyboardOpen(true);
      }
    };

    const handleFocusOut = () => {
      // Pequeno delay para garantir que não estamos apenas trocando de campo rapidamente
      setTimeout(() => {
        const active = document.activeElement as HTMLElement;
        if (!active || !['INPUT', 'TEXTAREA'].includes(active.tagName)) {
          setIsKeyboardOpen(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Se o teclado estiver aberto, não renderiza o menu
  if (isKeyboardOpen) return null;

  const navItems = [
    { view: AppView.DASHBOARD, icon: 'grid_view' },
    { view: AppView.PROGRESS, icon: 'show_chart' }, 
    { view: AppView.TODO, icon: 'format_list_bulleted' },
    { view: AppView.HABITS, icon: 'check_box' },
    { view: AppView.WEIGHT, icon: 'fitness_center' },
    { view: AppView.NEWS, icon: 'newspaper' },
    { view: AppView.JOURNAL, icon: 'book' },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 h-[72px] z-50 animate-fadeIn transition-all duration-300">
        <div className="absolute inset-0 bg-white/50 backdrop-blur-xl border border-white/40 rounded-full shadow-glass"></div>
        <div className="relative h-full flex items-center justify-around px-2 z-10 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
                <button 
                    key={item.view}
                    onClick={() => onChangeView(item.view)}
                    className="relative group p-1 flex-shrink-0"
                >
                    {currentView === item.view ? (
                        <>
                             <div className="absolute inset-0 bg-orange-400 blur-md rounded-full opacity-40"></div>
                             <div className="relative w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border border-white/30 transform -translate-y-2 transition-transform duration-300 ease-out">
                                <span className="material-icons-round text-white text-2xl">{item.icon}</span>
                             </div>
                        </>
                    ) : (
                        <div className="p-2 text-slate-500 hover:text-blue-600 transition-colors w-12 h-12 flex items-center justify-center">
                            <span className="material-icons-round text-2xl drop-shadow-sm">{item.icon}</span>
                        </div>
                    )}
                </button>
            ))}
        </div>
    </nav>
  );
};