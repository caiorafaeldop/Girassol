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
import { Sun, Settings } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showSettings, setShowSettings] = useState(false);
  
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
    
    // Load new health logs or migrate old weight logs if necessary
    const savedHealthLogs = StorageService.load<DailyLog[]>(StorageService.keys.HEALTH_LOGS, []);
    
    // Quick migration logic (if user had old weight logs but no new health logs)
    if (savedHealthLogs.length === 0) {
        const oldWeights = StorageService.load<any[]>('c26_weight', []);
        if (oldWeights.length > 0) {
            const migrated: DailyLog[] = oldWeights.map(w => ({
                date: w.date.split('/').reverse().join('-') || new Date().toISOString().split('T')[0], // Try to convert or default
                weight: w.weight,
                workout: false,
                meals: { breakfast: false, morningSnack: false, lunch: false, afternoonSnack: false, dinner: false, supper: false }
            }));
            setHealthLogs(migrated);
        } else {
            setHealthLogs([]);
        }
    } else {
        setHealthLogs(savedHealthLogs);
    }
  };

  // Load Data on Mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Save Data on Change
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
        const defaultWeights = healthLogs
            .filter(l => l.weight !== undefined)
            .map(l => ({ id: l.date, date: l.date, weight: l.weight as number }));
        return <Dashboard habits={habits} todos={todos} weights={defaultWeights} />;
    }
  };

  return (
    <div className="min-h-screen text-blue-900 pb-24 px-4 pt-4 md:pt-8 max-w-2xl mx-auto">
      
      {/* Header Logo Area - Girassol Style */}
      <header className="flex justify-center mb-6 relative">
        <div className="relative group cursor-default">
             <div className="absolute inset-0 bg-yellow-300/40 blur-xl rounded-full group-hover:bg-yellow-300/60 transition-all duration-500"></div>
             <div className="relative bg-gradient-to-br from-white/90 to-white/40 backdrop-blur-md border border-white/80 px-8 py-3 rounded-full shadow-2xl flex items-center gap-3">
                <Sun className="text-yellow-400 animate-spin-slow" size={28} fill="#facc15" />
                <span className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-400 to-green-400 tracking-tighter drop-shadow-sm">
                    Girassol
                </span>
             </div>
        </div>

        {/* Data/Settings Button */}
        <button 
            onClick={() => setShowSettings(true)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-white/40 hover:bg-white/60 text-blue-800 rounded-full transition-all hover:rotate-90"
            title="Meus Dados"
        >
            <Settings size={20} />
        </button>
      </header>

      <main className="min-h-[70vh]">
        {renderView()}
      </main>

      <Navigation currentView={currentView} onChangeView={setCurrentView} />
      
      {showSettings && (
        <DataSettings 
            onClose={() => setShowSettings(false)} 
            onDataImported={loadAllData}
        />
      )}

      <footer className="text-center text-blue-800/60 text-xs py-8 font-medium">
         © 2026 Girassol • Floresça todos os dias
      </footer>
    </div>
  );
};

export default App;