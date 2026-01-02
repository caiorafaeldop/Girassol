import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { JournalEntry } from '../types';
import { analyzeJournalEntry } from '../services/geminiService';
import { Sparkles, Save, BookOpen, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onUpdateEntries: (entries: JournalEntry[]) => void;
}

export const Journal: React.FC<JournalProps> = ({ entries, onUpdateEntries }) => {
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estados para edição e exclusão
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

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

  const confirmDelete = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    onUpdateEntries(updatedEntries);
    setDeletingId(null);
  };

  const startEditing = (entry: JournalEntry) => {
    // Cancela qualquer deleção pendente
    setDeletingId(null);
    setEditingId(entry.id);
    setEditContent(entry.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent('');
  };

  const saveEdit = (id: string) => {
    if (!editContent.trim()) return;
    
    const updatedEntries = entries.map(entry => 
      entry.id === id ? { ...entry, content: editContent } : entry
    );
    onUpdateEntries(updatedEntries);
    setEditingId(null);
    setEditContent('');
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
    <div className="space-y-6 animate-fadeIn pb-24">
      {/* Input Card */}
      <GlassCard 
        title="Diário de Bordo" 
        headerAction={
           <button
              onClick={handleSave}
              disabled={!content.trim()}
              className="flex items-center gap-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1.5 rounded-full shadow-lg hover:shadow-cyan-400/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
            >
              <Save size={14} />
              Registrar
            </button>
        }
      >
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Como foi sua jornada hoje? Escreva aqui..."
          className="w-full h-24 bg-white/50 border border-white/60 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-blue-400 text-blue-900 text-base"
        />
        <p className="text-[10px] text-blue-800/60 mt-2 text-right italic">
          Suas memórias ficam salvas neste aparelho.
        </p>
      </GlassCard>

      {/* Entries List */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <GlassCard key={entry.id} className="relative overflow-visible">
            
            {/* Header com Data e Ações */}
            <div className="flex justify-between items-start mb-3 h-8">
              <span className="text-xs font-bold text-cyan-800 bg-cyan-100/50 px-2 py-1 rounded-lg border border-cyan-200 self-center">
                {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </span>
              
              {/* Controles de Edição/Exclusão */}
              {editingId !== entry.id && (
                <div>
                    {deletingId === entry.id ? (
                        <div className="flex items-center gap-2 animate-fadeIn bg-red-50 px-2 py-1 rounded-lg border border-red-100">
                            <span className="text-[10px] text-red-500 font-bold uppercase">Apagar?</span>
                            <button 
                                onClick={() => confirmDelete(entry.id)}
                                className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                            >
                                <Check size={14} />
                            </button>
                            <button 
                                onClick={() => setDeletingId(null)}
                                className="p-1 bg-slate-200 text-slate-500 rounded hover:bg-slate-300 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => startEditing(entry)}
                                className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-white/50 rounded-lg transition-colors"
                                title="Editar"
                            >
                                <Pencil size={14} />
                            </button>
                            <button 
                                onClick={() => setDeletingId(entry.id)}
                                className="p-1.5 text-red-300 hover:text-red-500 hover:bg-white/50 rounded-lg transition-colors"
                                title="Excluir"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
              )}
            </div>

            {/* Conteúdo: Modo Edição vs Modo Visualização */}
            {editingId === entry.id ? (
              <div className="animate-fadeIn">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-32 bg-white/60 border border-blue-200 rounded-xl p-3 text-blue-900 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none mb-2"
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={cancelEditing}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button 
                    onClick={() => saveEdit(entry.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-md transition-colors"
                  >
                    <Check size={14} /> Salvar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-blue-900 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
            )}
            
            {/* Seção de Análise IA (Só mostra se não estiver editando ou excluindo) */}
            {editingId !== entry.id && deletingId !== entry.id && (
              <div className="mt-4 pt-4 border-t border-white/40">
                {entry.aiAnalysis ? (
                  <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-xl border border-indigo-100 flex gap-3 animate-fadeIn">
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
            )}
          </GlassCard>
        ))}
        
        {entries.length === 0 && (
            <div className="text-center py-10 opacity-60">
                <BookOpen size={48} className="mx-auto mb-2 text-blue-300"/>
                <p className="text-blue-800 font-medium">Seu diário está vazio.<br/>O primeiro passo é escrever.</p>
            </div>
        )}
      </div>
    </div>
  );
};