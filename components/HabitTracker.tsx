import React, { useState, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Habit } from '../types';
import { Check, Plus, Trash2, Flame, CalendarDays } from 'lucide-react';

interface HabitTrackerProps {
  habits: Habit[];
  onUpdateHabits: (habits: Habit[]) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ habits, onUpdateHabits }) => {
  const [newHabit, setNewHabit] = useState('');

  const addHabit = () => {
    if (!newHabit.trim()) return;
    const habit: Habit = {
      id: Date.now().toString(),
      title: newHabit,
      streak: 0,
      completedDates: [],
    };
    onUpdateHabits([...habits, habit]);
    setNewHabit('');
  };

  const toggleHabitDate = (id: string, dateStr: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        const isCompleted = h.completedDates.includes(dateStr);
        let newDates = [...h.completedDates];

        if (isCompleted) {
          newDates = newDates.filter(d => d !== dateStr);
        } else {
          newDates.push(dateStr);
        }
        
        // Recalculate streak based on new dates
        // Simple streak logic: consecutive days going backwards from today
        const sortedDates = [...newDates].sort().reverse();
        let currentStreak = 0;
        const today = new Date();
        // Check today first
        const todayStr = today.toISOString().split('T')[0];
        
        // If done today, start streak at 1, else 0 (unless we did yesterday)
        // This is a simplified streak calculation for UI speed
        let checkDate = new Date();
        let streakCount = 0;
        
        // Logic: Check up to 365 days back
        for (let i = 0; i < 365; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dStr = d.toISOString().split('T')[0];
            if (newDates.includes(dStr)) {
                streakCount++;
            } else {
                // If it's today and we haven't done it yet, streak isn't broken, just paused.
                // But generally streak implies contiguous.
                // Let's stick to the stored property or simple logic:
                if (i === 0) continue; // Skip checking "today" for break if we assume streak counts "up to yesterday" + "today"
                break;
            }
        }
        
        return { ...h, completedDates: newDates, streak: streakCount };
      }
      return h;
    });
    onUpdateHabits(updated);
  };

  const deleteHabit = (id: string) => {
    onUpdateHabits(habits.filter(h => h.id !== id));
  };

  // Helper to generate last 7 days including today
  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // -6 to 0 (today)
      return {
        fullDate: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('pt-BR', { weekday: 'narrow' }).toUpperCase(),
        dayNum: d.getDate()
      };
    });
  }, []);

  return (
    <div className="space-y-4 animate-fadeIn">
       <GlassCard title="Minhas Raízes (Hábitos)">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Plantar novo hábito (ex: Ler 10min)"
            className="flex-1 bg-white/70 border border-white/60 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-blue-400 text-blue-900"
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          />
          <button
            onClick={addHabit}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-2 rounded-xl shadow-lg transition-all active:scale-95 hover:shadow-green-400/30"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="grid gap-4">
          {habits.map((habit) => {
            const todayStr = new Date().toISOString().split('T')[0];
            const isDoneToday = habit.completedDates.includes(todayStr);

            return (
              <div
                key={habit.id}
                className="bg-white/40 border border-white/60 rounded-2xl p-4 shadow-sm backdrop-blur-md relative overflow-hidden"
              >
                {/* Header Row */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-blue-900 leading-tight">{habit.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-100/50 px-2 py-0.5 rounded-full border border-yellow-200">
                                <Flame size={12} fill="currentColor" />
                                <span>{habit.streak} dias seguidos</span>
                            </div>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => deleteHabit(habit.id)}
                        className="text-slate-300 hover:text-red-400 transition-colors p-1"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                {/* Calendar Strip */}
                <div className="flex justify-between items-center gap-1">
                    {last7Days.map((day, index) => {
                        const isDone = habit.completedDates.includes(day.fullDate);
                        const isToday = index === 6; // last item is today
                        
                        return (
                            <div key={day.fullDate} className="flex flex-col items-center gap-1">
                                <span className="text-[9px] font-bold text-blue-800/60">{day.dayName}</span>
                                <button
                                    onClick={() => toggleHabitDate(habit.id, day.fullDate)}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                        isDone 
                                        ? 'bg-gradient-to-b from-green-400 to-emerald-600 border-transparent shadow-md shadow-green-500/30 scale-105' 
                                        : 'bg-white/40 border-blue-200 hover:border-blue-400 hover:bg-white/60'
                                    } ${isToday ? 'ring-2 ring-offset-1 ring-blue-300' : ''}`}
                                >
                                    {isDone && <Check size={16} strokeWidth={4} className="text-white" />}
                                    {!isDone && isToday && <span className="w-2 h-2 rounded-full bg-blue-300/50"></span>}
                                </button>
                                <span className="text-[10px] text-blue-900 font-medium">{day.dayNum}</span>
                            </div>
                        );
                    })}
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <p className="text-center text-blue-900/60 py-4 italic">Nenhum hábito cultivado ainda.</p>
          )}
        </div>
      </GlassCard>
    </div>
  );
};