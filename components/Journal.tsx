import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { JournalEntry } from '../types';
import { analyzeJournalEntry } from '../services/geminiService';
import { Sparkles, Save, BookOpen, Loader2 } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onUpdateEntries: (entries: JournalEntry[]) => void;
}

export const Journal: React.FC<JournalProps> = ({ entries, onUpdateEntries }) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content,
    };

    // Optimistic update
    const updatedEntries = [newEntry, ...entries];
    onUpdateEntries(updatedEntries);
    setContent('');
  };

  const handleAnalyze = async (entry: JournalEntry) => {
    if (entry.aiAnalysis) return;
    setIsAnalyzing(true);
    const analysis = await analyzeJournalEntry(entry.content);
    
    const updatedEntries = entries.map(e => 
      e.id === entry.id ? { ...e, aiAnalysis: analysis } : e
    );
    onUpdateEntries(updatedEntries);
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn h-full">
      <GlassCard title="Diário de Bordo C26" className="h-full flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Como foi sua jornada hoje? Escreva aqui..."
          className="w-full h-32 bg-white/50 border border-white/60 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-blue-400 text-blue-900 mb-4"
        />
        <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-cyan-400/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              Registrar
            </button>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {entries.map((entry) => (
          <GlassCard key={entry.id} className="relative overflow-visible">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-cyan-800 bg-cyan-100/50 px-2 py-1 rounded-lg border border-cyan-200">
                {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-blue-900 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            
            <div className="mt-4 pt-4 border-t border-white/40">
              {entry.aiAnalysis ? (
                <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-xl border border-indigo-100 flex gap-3">
                    <Sparkles className="text-yellow-400 shrink-0 mt-1" size={20} />
                    <div>
                        <p className="text-xs font-bold text-purple-700 uppercase mb-1">C26 Coach IA</p>
                        <p className="text-sm text-blue-900 italic">"{entry.aiAnalysis}"</p>
                    </div>
                </div>
              ) : (
                <button
                  onClick={() => handleAnalyze(entry)}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  {isAnalyzing ? <Loader2 className="animate-spin" size={16}/> : <Sparkles size={16} className="text-yellow-400" />}
                  {isAnalyzing ? 'Analisando...' : 'Pedir conselho para IA'}
                </button>
              )}
            </div>
          </GlassCard>
        ))}
        {entries.length === 0 && (
            <div className="text-center py-10 opacity-60">
                <BookOpen size={48} className="mx-auto mb-2 text-blue-300"/>
                <p>Seu diário está vazio. O primeiro passo é escrever.</p>
            </div>
        )}
      </div>
    </div>
  );
};