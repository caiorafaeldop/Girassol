import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { DailyLog } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Save, Calendar, Check, Dumbbell, Utensils } from 'lucide-react';

interface WeightTrackerProps {
  logs: DailyLog[]; // Changed from WeightLog[] to DailyLog[]
  onUpdateLogs: (logs: DailyLog[]) => void;
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({ logs, onUpdateLogs }) => {
  // Use today as default ID
  const todayISO = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayISO);
  
  // Local state for the form
  const [currentLog, setCurrentLog] = useState<DailyLog>({
    date: todayISO,
    weight: undefined,
    workout: false,
    meals: {
        breakfast: false,
        morningSnack: false,
        lunch: false,
        afternoonSnack: false,
        dinner: false,
        supper: false
    }
  });

  // When date changes or logs load, find existing data
  useEffect(() => {
    const existing = logs.find(l => l.date === selectedDate);
    if (existing) {
        setCurrentLog(existing);
    } else {
        // Reset for new date
        setCurrentLog({
            date: selectedDate,
            weight: undefined,
            workout: false,
            meals: { breakfast: false, morningSnack: false, lunch: false, afternoonSnack: false, dinner: false, supper: false }
        });
    }
  }, [selectedDate, logs]);

  const handleSave = () => {
    // Upsert logic
    const otherLogs = logs.filter(l => l.date !== selectedDate);
    // Sort by date
    const newLogs = [...otherLogs, currentLog].sort((a, b) => a.date.localeCompare(b.date));
    onUpdateLogs(newLogs);
    alert('Progresso salvo!');
  };

  const toggleMeal = (key: keyof typeof currentLog.meals) => {
    setCurrentLog(prev => ({
        ...prev,
        meals: { ...prev.meals, [key]: !prev.meals[key] }
    }));
  };

  // Prepare chart data (filter out days with no weight if you only want to see weight progress)
  const data = logs.filter(l => l.weight !== undefined).slice(-7).map(l => ({
      date: l.date.substring(5), // MM-DD
      weight: l.weight
  }));

  const MealCheckbox = ({ label, mKey }: { label: string, mKey: keyof typeof currentLog.meals }) => (
    <div 
        onClick={() => toggleMeal(mKey)}
        className={`cursor-pointer flex items-center justify-between p-3 rounded-xl border transition-all ${
            currentLog.meals[mKey] 
            ? 'bg-green-100/80 border-green-300' 
            : 'bg-white/40 border-white/50 hover:bg-white/60'
        }`}
    >
        <span className={`text-sm font-medium ${currentLog.meals[mKey] ? 'text-green-800' : 'text-blue-900'}`}>{label}</span>
        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
            currentLog.meals[mKey] ? 'bg-green-500 border-green-500 text-white' : 'border-blue-300 bg-white/50'
        }`}>
            {currentLog.meals[mKey] && <Check size={12} strokeWidth={3} />}
        </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* --- Date & Weight Section --- */}
      <GlassCard title="Nutrição & Corpo">
        <div className="flex flex-col gap-4">
            
            {/* Date Picker */}
            <div className="flex items-center gap-2 bg-white/60 p-2 rounded-xl border border-white/60">
                <Calendar className="text-yellow-400 ml-2" size={20} />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none focus:outline-none text-blue-900 font-bold w-full"
                />
            </div>

            {/* Weight Input */}
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="text-xs text-blue-800 font-bold ml-1 mb-1 block">Peso (kg)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={currentLog.weight || ''}
                        onChange={(e) => setCurrentLog(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                        className="w-full bg-white/70 border border-white/60 rounded-xl px-4 py-3 text-lg font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder:font-normal"
                        placeholder="--"
                    />
                </div>
                
                {/* Workout Toggle */}
                <div 
                    onClick={() => setCurrentLog(prev => ({ ...prev, workout: !prev.workout }))}
                    className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all h-[78px] ${
                        currentLog.workout 
                        ? 'bg-orange-100/80 border-orange-300 shadow-md' 
                        : 'bg-white/40 border-white/50 hover:bg-white/60'
                    }`}
                >
                    <Dumbbell className={currentLog.workout ? "text-orange-600" : "text-blue-300"} size={24} />
                    <span className={`text-xs font-bold mt-1 ${currentLog.workout ? "text-orange-800" : "text-blue-500"}`}>
                        {currentLog.workout ? "Treino Feito!" : "Sem Treino"}
                    </span>
                </div>
            </div>
        </div>
      </GlassCard>

      {/* --- Diet Checklist --- */}
      <GlassCard>
        <div className="flex items-center gap-2 mb-4">
            <Utensils className="text-green-500" size={20} />
            <h3 className="font-bold text-blue-900">Checklist Alimentar</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
            <MealCheckbox label="Café da Manhã" mKey="breakfast" />
            <MealCheckbox label="Lanche Manhã" mKey="morningSnack" />
            <MealCheckbox label="Almoço" mKey="lunch" />
            <MealCheckbox label="Lanche Tarde" mKey="afternoonSnack" />
            <MealCheckbox label="Jantar" mKey="dinner" />
            <MealCheckbox label="Ceia" mKey="supper" />
        </div>
      </GlassCard>
        
      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2 hover:brightness-105"
      >
        <Save size={20} />
        Salvar Registro do Dia
      </button>

      {/* --- Chart --- */}
      <GlassCard title="Evolução de Peso">
        <div className="h-64 w-full mt-2">
          {data.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
                <XAxis dataKey="date" stroke="#1e3a8a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#1e3a8a" fontSize={12} tickLine={false} axisLine={false} width={30} />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="#f97316" 
                    strokeWidth={4} 
                    dot={{ fill: '#f97316', r: 4, strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-blue-800 italic bg-white/20 rounded-xl border border-white/30 text-center p-4">
              Registre o peso em 2 dias diferentes para visualizar o gráfico.
            </div>
          )}
        </div>
      </GlassCard>

    </div>
  );
};