import React, { useState, useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Habit, Todo, DailyLog } from '../types';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { Dumbbell, Utensils, ChevronDown, ChevronUp, Calendar as CalendarIcon, CheckCircle2, Flame } from 'lucide-react';

interface ProgressViewProps {
  habits: Habit[];
  todos: Todo[];
  logs: DailyLog[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ habits, logs }) => {
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);

  // Data helpers
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthName = today.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // 1. Weight Data
  const weightData = useMemo(() => {
    return logs
      .filter(l => l.weight !== undefined)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14) // Last 14 records
      .map(l => ({
        date: l.date.substring(5).replace('-', '/'),
        weight: l.weight,
      }));
  }, [logs]);

  // 2. Calendar Generator Helper
  const renderCalendar = (
    type: 'workout' | 'meals' | 'habit', 
    dataMap?: Record<string, any>, 
    habitDates?: string[]
  ) => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
    
    const days = [];
    // Empty slots for start of month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 w-8" />);
    }

    // Days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      let content = null;
      let bgClass = "bg-white/30 text-blue-900";

      if (type === 'workout') {
        const log = logs.find(l => l.date === dateStr);
        if (log?.workout) {
            bgClass = "bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md scale-110";
            content = <Dumbbell size={12} strokeWidth={3} />;
        }
      } else if (type === 'meals') {
        const log = logs.find(l => l.date === dateStr);
        if (log) {
            const count = Object.values(log.meals).filter(Boolean).length;
            if (count >= 5) bgClass = "bg-green-600 text-white font-bold shadow-md"; // Excellent
            else if (count >= 3) bgClass = "bg-green-400 text-white font-medium"; // Good
            else if (count > 0) bgClass = "bg-red-300 text-white"; // Needs improvement
            
            if (count > 0) content = <span className="text-[10px]">{count}</span>;
        }
      } else if (type === 'habit' && habitDates) {
        if (habitDates.includes(dateStr)) {
            bgClass = "bg-blue-500 text-white shadow-md scale-105";
            content = <CheckCircle2 size={12} />;
        }
      }

      // Highlight Today ring
      const isToday = day === today.getDate() && currentMonth === today.getMonth();
      const borderClass = isToday ? "ring-2 ring-blue-500 ring-offset-1" : "";

      days.push(
        <div key={day} className={`h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all ${bgClass} ${borderClass}`}>
          {content || day}
        </div>
      );
    }

    return (
        <div className="grid grid-cols-7 gap-2 mt-2 place-items-center">
            {['D','S','T','Q','Q','S','S'].map((d, i) => (
                <span key={i} className="text-[10px] font-bold text-blue-800/50">{d}</span>
            ))}
            {days}
        </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      
      {/* 1. WEIGHT CHART */}
      <GlassCard title="Evolução de Peso">
         <div className="h-64 w-full mt-2">
            {weightData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis dataKey="date" tick={{fontSize: 10, fill: '#1e3a8a'}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                            labelStyle={{ color: '#1e3a8a', fontWeight: 'bold' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="weight" 
                            stroke="#f97316" 
                            strokeWidth={4} 
                            dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-blue-800 italic bg-white/20 rounded-xl border border-white/30 text-center p-4">
                    <p>Precisamos de mais dados.</p>
                    <p className="text-xs mt-1">Registre seu peso em dias diferentes.</p>
                </div>
            )}
         </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* 2. WORKOUT CALENDAR */}
        <GlassCard>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                    <Flame size={18} fill="currentColor" />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 leading-none">Frequência de Treinos</h3>
                    <p className="text-[10px] text-blue-800 capitalize">{monthName}</p>
                </div>
            </div>
            {renderCalendar('workout')}
            <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-blue-800/60">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-500"></span>Treino Feito</span>
            </div>
        </GlassCard>

        {/* 3. MEALS CALENDAR */}
        <GlassCard>
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                    <Utensils size={18} />
                </div>
                <div>
                    <h3 className="font-bold text-blue-900 leading-none">Refeições por Dia</h3>
                    <p className="text-[10px] text-blue-800 capitalize">{monthName}</p>
                </div>
            </div>
            {renderCalendar('meals')}
             <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-blue-800/60">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-300"></span>1-2</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400"></span>3-4</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-600"></span>5-6</span>
            </div>
        </GlassCard>

      </div>

      {/* 4. HABIT TRACKING (Interactive) */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-blue-900 px-2 flex items-center gap-2">
            <CalendarIcon size={20}/> Rastreio de Hábitos
        </h3>
        
        {habits.map(habit => {
            const isExpanded = expandedHabitId === habit.id;
            
            return (
                <div key={habit.id} className="relative transition-all duration-300">
                    <button 
                        onClick={() => setExpandedHabitId(isExpanded ? null : habit.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            isExpanded 
                            ? 'bg-white/80 border-blue-300 shadow-glass' 
                            : 'bg-white/40 border-white/50 hover:bg-white/60'
                        }`}
                    >
                        <span className="font-bold text-blue-900">{habit.title}</span>
                        <div className="flex items-center gap-2">
                             <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-medium">
                                {habit.streak} dias
                             </span>
                             {isExpanded ? <ChevronUp size={20} className="text-blue-500"/> : <ChevronDown size={20} className="text-blue-400"/>}
                        </div>
                    </button>

                    {/* Expanded Calendar */}
                    {isExpanded && (
                        <div className="mt-2 p-4 bg-white/30 border border-white/40 rounded-2xl animate-fadeIn">
                             <p className="text-xs text-center text-blue-800 font-bold capitalize mb-2">{monthName}</p>
                             {renderCalendar('habit', undefined, habit.completedDates)}
                             <p className="text-[10px] text-center text-blue-800/60 mt-2 italic">
                                "A consistência é a chave para o 2026."
                             </p>
                        </div>
                    )}
                </div>
            );
        })}
        
        {habits.length === 0 && (
             <div className="text-center py-8 text-blue-800/50 bg-white/20 rounded-2xl border border-white/20">
                Nenhum hábito cadastrado para rastrear.
             </div>
        )}
      </div>

    </div>
  );
};