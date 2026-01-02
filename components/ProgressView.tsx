import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Habit, Todo, DailyLog } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid 
} from 'recharts';
import { Trophy, Target, Zap, Dumbbell, Star, TrendingUp } from 'lucide-react';

interface ProgressViewProps {
  habits: Habit[];
  todos: Todo[];
  logs: DailyLog[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({ habits, todos, logs }) => {
  
  // 1. Calculate Habit Consistency (Last 7 Days)
  const habitData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    return habits.map(habit => {
      const count = last7Days.filter(day => habit.completedDates.includes(day)).length;
      return {
        name: habit.title,
        count: count,
        score: (count / 7) * 100
      };
    }).sort((a, b) => b.score - a.score);
  }, [habits]);

  // 2. Task Statistics
  const taskData = useMemo(() => {
    const completed = todos.filter(t => t.completed).length;
    const pending = todos.length - completed;
    return [
      { name: 'Feitas', value: completed, color: '#84cc16' }, // Lime Green
      { name: 'Fazer', value: pending, color: '#bae6fd' },   // Sky Blue
    ];
  }, [todos]);

  // 3. Health & Workout Trends
  const healthData = useMemo(() => {
    return logs
      .filter(l => l.weight !== undefined || l.workout)
      .slice(-14) // Last 14 entries
      .map(l => ({
        date: l.date.substring(5).replace('-', '/'), // MM/DD
        weight: l.weight,
        workout: l.workout ? 1 : 0
      }));
  }, [logs]);

  // 4. Achievements / Badges Logic
  const badges = useMemo(() => {
    const b = [];
    const workoutsLast7Days = logs.slice(-7).filter(l => l.workout).length;
    const completedTasks = todos.filter(t => t.completed).length;
    const maxStreak = Math.max(...habits.map(h => h.streak), 0);

    if (workoutsLast7Days >= 3) b.push({ icon: Dumbbell, color: 'text-orange-500', bg: 'bg-orange-100', title: 'Energia Pura', desc: '3+ treinos/semana' });
    if (completedTasks >= 10) b.push({ icon: Target, color: 'text-blue-500', bg: 'bg-blue-100', title: 'Focado', desc: '10+ tarefas feitas' });
    if (maxStreak >= 7) b.push({ icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-100', title: 'Imparável', desc: '7 dias seguidos!' });
    if (habits.length > 0 && habitData.every(h => h.score > 50)) b.push({ icon: Star, color: 'text-green-500', bg: 'bg-green-100', title: 'Jardineiro', desc: 'Cultivando hábitos' });
    
    return b;
  }, [logs, todos, habits, habitData]);

  return (
    <div className="space-y-6 animate-fadeIn pb-24">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-blue-900 drop-shadow-sm bg-white/40 inline-block px-6 py-2 rounded-full backdrop-blur-sm">
            Seu Crescimento
        </h2>
      </div>

      {/* Badges Section */}
      <GlassCard title="Conquistas">
        {badges.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {badges.map((badge, idx) => (
              <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border border-white/40 ${badge.bg} bg-opacity-80 backdrop-blur-sm shadow-sm`}>
                <div className={`p-2 rounded-full bg-white/70 shadow-sm ${badge.color}`}>
                  <badge.icon size={20} />
                </div>
                <div>
                  <p className="font-bold text-blue-900 text-sm leading-tight">{badge.title}</p>
                  <p className="text-[10px] text-blue-800 font-medium">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-blue-800 text-sm italic bg-white/30 rounded-xl">
            Semeie suas primeiras ações para colher medalhas!
          </div>
        )}
      </GlassCard>

      {/* Habits Chart */}
      <GlassCard title="Raízes Fortes (7 dias)">
        <div className="h-48 w-full">
          {habits.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={habitData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 7]} />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#1e3a8a', fontWeight: 600 }} interval={0} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.3)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                   {habitData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#65a30d' : entry.score >= 50 ? '#facc15' : '#94a3b8'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-blue-800 text-sm italic">Adicione hábitos para ver o gráfico.</div>
          )}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Task Completion Pie */}
        <GlassCard title="Colheita de Tarefas">
            <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={taskData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                        >
                            {taskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{borderRadius: '8px'}} />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-2xl font-black text-blue-900">{Math.round((taskData[0].value / (todos.length || 1)) * 100)}%</span>
                     <span className="text-[9px] text-blue-700 uppercase font-bold tracking-widest">Completo</span>
                </div>
            </div>
        </GlassCard>

        {/* Weight Trend */}
        <GlassCard title="Vitalidade">
             <div className="h-48 w-full">
                {healthData.length > 1 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={healthData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                            <XAxis dataKey="date" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                            <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                            <Line 
                                type="monotone" 
                                dataKey="weight" 
                                stroke="#f97316" 
                                strokeWidth={3} 
                                dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full text-blue-800 text-xs text-center">
                        Registre peso em dias diferentes para ver a curva.
                    </div>
                )}
             </div>
             <div className="mt-2 text-xs text-center text-blue-800">
                <span className="inline-flex items-center gap-1 font-medium">
                    <TrendingUp size={12} className="text-yellow-500"/> Tendência dos últimos 14 registros
                </span>
             </div>
        </GlassCard>
      </div>
    </div>
  );
};