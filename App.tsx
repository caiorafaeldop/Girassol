import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Navigation } from './components/Navigation';
import { TodoList } from './components/TodoList';
import { HabitTracker } from './components/HabitTracker';
import { WeightTracker } from './components/WeightTracker';
import { Journal } from './components/Journal';
import { ProgressView } from './components/ProgressView';
import { NewsFeed } from './components/NewsFeed';
import { DataSettings } from './components/DataSettings';
import { AppView, Habit, Todo, JournalEntry, DailyLog } from './types';
import { StorageService } from './services/storageService';
import { dailyQuotes } from './quotes';

// Ordem das views para determinar direção da animação
const VIEW_ORDER = [
  AppView.DASHBOARD,
  AppView.PROGRESS,
  AppView.TODO,
  AppView.HABITS,
  AppView.WEIGHT,
  AppView.NEWS,
  AppView.JOURNAL,
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showSettings, setShowSettings] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  
  // State
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [healthLogs, setHealthLogs] = useState<DailyLog[]>([]);

  // Function to load all data from storage
  const loadAllData = () => {
    setHabits(StorageService.load(StorageService.keys.HABITS, []));
    setTodos(StorageService.load(StorageService.keys.TODOS, []));
    setEntries(StorageService.load(StorageService.keys.JOURNAL, []));
    const savedHealthLogs = StorageService.load<DailyLog[]>(StorageService.keys.HEALTH_LOGS, []);
    setHealthLogs(savedHealthLogs);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // --- NOTIFICATION SCHEDULER ---
  useEffect(() => {
    const checkNotification = () => {
        const saved = localStorage.getItem('c26_prefs');
        if (!saved) return;
        const prefs = JSON.parse(saved);

        // Se notificações desativadas ou sem permissão, pare
        if (!prefs.notifications || Notification.permission !== 'granted') return;

        const now = new Date();
        const currentTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Chave única para garantir que só envia uma vez por dia
        const lastSentKey = 'c26_last_notification_date';
        const lastSentDate = localStorage.getItem(lastSentKey);
        const todayStr = now.toDateString();

        // Se for a hora exata e ainda não enviamos hoje
        if (currentTime === prefs.notificationTime && lastSentDate !== todayStr) {
             const dayOfMonth = now.getDate();
             // Pega a frase do dia (ajusta index 0-30)
             const quote = dailyQuotes[dayOfMonth - 1] || dailyQuotes[0];
             
             try {
                new Notification("Girassol 2026", {
                    body: `🌻 ${quote}`,
                    icon: 'https://cdn-icons-png.flaticon.com/512/869/869869.png',
                    tag: 'daily-quote' // Substitui notificação anterior se houver
                });
                
                // Marca como enviado hoje
                localStorage.setItem(lastSentKey, todayStr);
             } catch (e) {
                 console.error("Erro ao enviar notificação", e);
             }
        }
    };

    // Verifica a cada 30 segundos
    const interval = setInterval(checkNotification, 30000); 
    
    // Verifica imediatamente ao carregar
    checkNotification();

    return () => clearInterval(interval);
  }, []);

  const updateHabits = (newHabits: Habit[]) => {
    setHabits(newHabits);
    StorageService.save(StorageService.keys.HABITS, newHabits);
  };

  const updateTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    StorageService.save(StorageService.keys.TODOS, newTodos);
  };

  const updateEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    StorageService.save(StorageService.keys.JOURNAL, newEntries);
  };

  const updateHealthLogs = (newLogs: DailyLog[]) => {
    setHealthLogs(newLogs);
    StorageService.save(StorageService.keys.HEALTH_LOGS, newLogs);
  };

  // Lógica de navegação com animação
  const handleViewChange = (newView: AppView) => {
      const currentIndex = VIEW_ORDER.indexOf(currentView);
      const newIndex = VIEW_ORDER.indexOf(newView);
      
      // Se for pra direita (índice maior), entra da direita (right). 
      // Se for pra esquerda (índice menor), entra da esquerda (left).
      if (newIndex > currentIndex) {
          setSlideDirection('right');
      } else {
          setSlideDirection('left');
      }
      setCurrentView(newView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        const simplifiedWeights = healthLogs
            .filter(l => l.weight !== undefined)
            .map(l => ({ id: l.date, date: l.date, weight: l.weight as number }));
        return <Dashboard habits={habits} todos={todos} weights={simplifiedWeights} />;
      case AppView.PROGRESS:
        return <ProgressView habits={habits} todos={todos} logs={healthLogs} />;
      case AppView.HABITS:
        return <HabitTracker habits={habits} onUpdateHabits={updateHabits} />;
      case AppView.TODO:
        return <TodoList todos={todos} onUpdateTodos={updateTodos} />;
      case AppView.WEIGHT:
        return <WeightTracker logs={healthLogs} onUpdateLogs={updateHealthLogs} />;
      case AppView.NEWS:
        return <NewsFeed />;
      case AppView.JOURNAL:
        return <Journal entries={entries} onUpdateEntries={updateEntries} />;
      default:
        return <Dashboard habits={habits} todos={todos} weights={[]} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
       {/* FIXED Background - Gradient + Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" 
           style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F7FA 40%, #C8E6C9 100%)' }}>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-300/30 blur-[100px] mix-blend-overlay animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-green-400/30 blur-[80px] mix-blend-overlay"></div>
        <div className="absolute top-[30%] right-[-20%] w-[300px] h-[300px] rounded-full bg-blue-400/20 blur-[60px] mix-blend-overlay"></div>
      </div>

      {/* Header */}
      <header className="pt-8 px-6 flex justify-between items-center sticky top-0 z-40">
        <div 
            onClick={() => handleViewChange(AppView.DASHBOARD)}
            className="relative group cursor-pointer"
        >
            <div className="absolute inset-0 bg-white/60 blur-md rounded-full group-hover:bg-white/80 transition-all"></div>
            <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 rounded-full py-2 px-5 shadow-glass flex items-center gap-2 transition-transform active:scale-95 group-hover:scale-105">
                <span className="material-icons-round text-primary text-2xl drop-shadow-sm">wb_sunny</span>
                <span className="font-display font-bold text-xl text-green-600 tracking-tight">Girassol</span>
            </div>
        </div>
        <button 
            onClick={() => setShowSettings(true)}
            className="w-12 h-12 rounded-full bg-white/40 backdrop-blur-md border border-white/40 flex items-center justify-center shadow-glass text-blue-600 hover:bg-white/60 hover:text-blue-800 transition-all duration-300 hover:rotate-90 active:scale-90"
        >
            <span className="material-icons-round text-2xl">settings</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-5 mt-6 pb-32 relative z-10">
        <div key={currentView} className={slideDirection === 'right' ? 'animate-slide-right' : 'animate-slide-left'}>
            {renderView()}
        </div>
      </main>

      {/* Navigation */}
      <Navigation currentView={currentView} onChangeView={handleViewChange} />
      
      {/* Settings Modal */}
      {showSettings && (
        <DataSettings 
            onClose={() => setShowSettings(false)} 
            onDataImported={loadAllData}
        />
      )}
    </div>
  );
};

export default App;