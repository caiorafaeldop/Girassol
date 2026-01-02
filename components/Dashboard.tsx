import React, { useMemo } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Habit, Todo, WeightLog } from '../types';
import { TrendingUp, CheckCircle, Activity, Sun, Sunrise, Moon } from 'lucide-react';

interface DashboardProps {
  habits: Habit[];
  todos: Todo[];
  weights: WeightLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ habits, todos, weights }) => {
  const activeHabits = habits.length;
  const pendingTodos = todos.filter(t => !t.completed).length;
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : '--';

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return { text: "Bom dia, raio de sol!", icon: Sunrise, color: "text-yellow-400" };
    if (hour >= 12 && hour < 18) return { text: "Boa tarde! Continue brilhando.", icon: Sun, color: "text-yellow-400" };
    return { text: "Boa noite. Descanse para crescer.", icon: Moon, color: "text-blue-500" };
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Greeting Section */}
      <div className="relative text-center py-8 px-4 rounded-3xl overflow-hidden shadow-xl border border-white/50 bg-gradient-to-r from-yellow-200/40 via-orange-100/40 to-blue-200/40 backdrop-blur-md group">
         {/* Shiny effect */}
         <div className="absolute top-0 left-0 w-full h-1/2 bg-white/40 skew-y-3 transform -translate-y-1/2 pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col items-center gap-2">
            <div className={`p-3 rounded-full bg-white/70 shadow-lg ${greeting.color} mb-2`}>
                <greeting.icon size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-blue-900 tracking-tight drop-shadow-sm">
                {greeting.text}
            </h1>
            <p className="text-blue-800 font-medium">
                Hoje é um novo dia para florescer em 2026.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Habits - Green (Nature) */}
        <GlassCard className="bg-gradient-to-br from-lime-200/60 to-green-300/40 border-green-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/60 rounded-full shadow-lg shadow-green-500/10">
              <Activity className="text-green-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-green-900 font-bold uppercase tracking-wider">Hábitos Vivos</p>
              <p className="text-3xl font-black text-green-900">{activeHabits}</p>
            </div>
          </div>
        </GlassCard>

        {/* Pending Tasks - Blue (Sky) */}
        <GlassCard className="bg-gradient-to-br from-sky-200/60 to-blue-300/40 border-blue-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/60 rounded-full shadow-lg shadow-blue-500/10">
              <CheckCircle className="text-blue-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-blue-900 font-bold uppercase tracking-wider">Tarefas de Hoje</p>
              <p className="text-3xl font-black text-blue-900">{pendingTodos}</p>
            </div>
          </div>
        </GlassCard>

        {/* Weight - Yellow (Sun energy) */}
        <GlassCard className="bg-gradient-to-br from-yellow-200/60 to-orange-300/40 border-yellow-200/50">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/60 rounded-full shadow-lg shadow-orange-500/10">
              <TrendingUp className="text-yellow-500 w-8 h-8" />
            </div>
            <div>
              <p className="text-xs text-yellow-900 font-bold uppercase tracking-wider">Peso Atual</p>
              <p className="text-3xl font-black text-yellow-900">{latestWeight} <span className="text-lg font-bold">kg</span></p>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard title="Jardim de Metas">
        <div className="text-blue-900">
          {pendingTodos === 0 && activeHabits === 0 ? (
            <p className="italic text-center py-8 opacity-70">
                Seu jardim está esperando as primeiras sementes. Adicione hábitos e tarefas!
            </p>
          ) : (
            <div className="space-y-4 text-center">
                <p>Você tem <strong className="text-blue-600">{pendingTodos} oportunidades</strong> de crescer hoje.</p>
                <p>Regue seus <strong className="text-green-600">{activeHabits} hábitos</strong> para vê-los florescer.</p>
                
                <div className="mt-4 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-100/50 shadow-inner">
                    <p className="font-bold text-yellow-700 italic text-lg">
                        "Sempre voltado para o sol, as sombras ficam para trás."
                    </p>
                </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};