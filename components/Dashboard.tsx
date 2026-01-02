import React, { useMemo } from 'react';
import { Habit, Todo, WeightLog } from '../types';
import { dailyQuotes } from '../quotes';

interface DashboardProps {
  habits: Habit[];
  todos: Todo[];
  weights: WeightLog[];
}

export const Dashboard: React.FC<DashboardProps> = ({ habits, todos, weights }) => {
  const activeHabits = habits.length;
  const pendingTodos = todos.filter(t => !t.completed).length;
  const latestWeight = weights.length > 0 ? weights[weights.length - 1].weight : '--';

  // Lógica da Frase do Dia
  const dailyInspiration = useMemo(() => {
    const today = new Date();
    const dayOfMonth = today.getDate(); // Retorna 1 a 31
    // Ajustamos o index (dayOfMonth - 1) para pegar do array (0 a 30)
    // O fallback (|| dailyQuotes[0]) garante que nunca quebre
    return dailyQuotes[dayOfMonth - 1] || dailyQuotes[0];
  }, []);

  return (
    <div className="space-y-5 animate-fadeIn">
      
      {/* Hero Card */}
      <section className="aero-card bg-gradient-to-br from-white/80 via-white/50 to-white/30 border border-white/60 rounded-3xl p-6 text-center shadow-glass relative group">
        <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-100 to-white border-2 border-white shadow-lg flex items-center justify-center mb-4 orb-icon">
                <span className="material-icons-round text-3xl text-orange-400">wb_sunny</span>
            </div>
            
            {/* Título Menor */}
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-2">
                Inspiração de Hoje
            </h2>

            {/* Frase do Dia */}
            <h1 className="text-xl md:text-2xl font-display font-bold text-blue-900 mb-2 drop-shadow-sm leading-tight max-w-[320px] mx-auto">
                "{dailyInspiration}"
            </h1>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
      </section>

      {/* Grid Stats */}
      <div className="grid gap-4">
        {/* Habits */}
        <div className="aero-card bg-gradient-to-r from-green-100/90 to-green-200/70 border border-white/60 rounded-2xl p-4 flex items-center gap-4 shadow-glass transition-transform active:scale-[0.98]">
            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-b from-white to-green-50 shadow-md flex items-center justify-center border border-white/80">
                <span className="material-icons-round text-green-600 text-3xl">ecg_heart</span>
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-bold text-green-800 uppercase tracking-wider mb-0.5">Hábitos Vivos</h3>
                <p className="text-4xl font-display font-bold text-green-900 drop-shadow-sm">{activeHabits}</p>
            </div>
        </div>

        {/* Tasks */}
        <div className="aero-card bg-gradient-to-r from-blue-100/90 to-blue-200/70 border border-white/60 rounded-2xl p-4 flex items-center gap-4 shadow-glass transition-transform active:scale-[0.98]">
            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-b from-white to-blue-50 shadow-md flex items-center justify-center border border-white/80">
                <span className="material-icons-round text-blue-500 text-3xl">check_circle_outline</span>
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-0.5">Tarefas de Hoje</h3>
                <p className="text-4xl font-display font-bold text-blue-900 drop-shadow-sm">{pendingTodos}</p>
            </div>
        </div>

        {/* Weight */}
        <div className="aero-card bg-gradient-to-r from-amber-100/90 to-orange-100/70 border border-white/60 rounded-2xl p-4 flex items-center gap-4 shadow-glass transition-transform active:scale-[0.98]">
            <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-b from-white to-orange-50 shadow-md flex items-center justify-center border border-white/80">
                <span className="material-icons-round text-amber-500 text-3xl">show_chart</span>
            </div>
            <div className="relative z-10">
                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-0.5">Peso Atual</h3>
                <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-display font-bold text-amber-900 drop-shadow-sm">{latestWeight}</p>
                    <span className="text-lg font-bold text-amber-800/70">kg</span>
                </div>
            </div>
        </div>
      </div>

      {/* Garden Card */}
      <section className="relative mt-8">
        <div className="aero-card bg-white/40 border border-white/50 rounded-3xl p-6 min-h-[220px] shadow-glass flex flex-col justify-center text-center overflow-hidden">
            <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay"></div>
            <div className="relative z-10">
                <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center justify-center gap-2">
                    <span className="material-icons-round text-green-500">yard</span>
                    Jardim de Metas
                </h2>
                {pendingTodos === 0 && activeHabits === 0 ? (
                    <p className="text-slate-600 italic font-medium leading-relaxed">
                        "Seu jardim está esperando as primeiras sementes. Adicione hábitos e tarefas!"
                    </p>
                ) : (
                    <p className="text-slate-600 italic font-medium leading-relaxed">
                        "Você tem {pendingTodos} sementes para plantar e {activeHabits} raízes para regar hoje."
                    </p>
                )}
                
                <div className="mt-6 flex justify-center gap-2 opacity-60">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-bounce delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-bounce delay-150"></span>
                    <span className="w-2 h-2 rounded-full bg-green-300 animate-bounce delay-300"></span>
                </div>
            </div>
        </div>
      </section>

      <div className="text-center pb-8 pt-4">
        <p className="text-xs text-blue-900/40 font-semibold tracking-wide">
            © 2026 Girassol • Floresça todos os dias
        </p>
      </div>
    </div>
  );
};