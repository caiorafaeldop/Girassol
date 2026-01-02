import React, { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { Todo, SubTask } from '../types';
import { generateSubtasksAI } from '../services/geminiService';
import { Plus, Trash2, AlertCircle, ChevronDown, ChevronUp, Sparkles, Loader2, Check } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onUpdateTodos: (todos: Todo[]) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onUpdateTodos }) => {
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState<Todo['priority']>('medium');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadingAiId, setLoadingAiId] = useState<string | null>(null);
  const [newSubtaskMap, setNewSubtaskMap] = useState<Record<string, string>>({});

  const addTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
      priority,
      subtasks: [],
    };
    onUpdateTodos([...todos, todo]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    const updated = todos.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    onUpdateTodos(updated);
  };

  const deleteTodo = (id: string) => {
    onUpdateTodos(todos.filter(t => t.id !== id));
  };

  // --- Subtask Logic ---

  const addSubTask = (todoId: string) => {
    const text = newSubtaskMap[todoId];
    if (!text?.trim()) return;

    const updated = todos.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          subtasks: [...(t.subtasks || []), { id: Date.now().toString(), text, completed: false }]
        };
      }
      return t;
    });
    onUpdateTodos(updated);
    setNewSubtaskMap(prev => ({ ...prev, [todoId]: '' }));
  };

  const toggleSubtask = (todoId: string, subtaskId: string) => {
    const updated = todos.map(t => {
      if (t.id === todoId) {
        return {
          ...t,
          subtasks: t.subtasks?.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return t;
    });
    onUpdateTodos(updated);
  };

  const generateAiSubtasks = async (todo: Todo) => {
    if (loadingAiId) return;
    setLoadingAiId(todo.id);
    setExpandedId(todo.id); // Auto open
    
    const suggestions = await generateSubtasksAI(todo.text);
    
    if (suggestions.length > 0) {
      const newSubtasks: SubTask[] = suggestions.map((text, idx) => ({
        id: Date.now().toString() + idx,
        text,
        completed: false
      }));

      const updated = todos.map(t => 
        t.id === todo.id 
          ? { ...t, subtasks: [...(t.subtasks || []), ...newSubtasks] }
          : t
      );
      onUpdateTodos(updated);
    }
    setLoadingAiId(null);
  };

  const priorityColors = {
    low: 'text-blue-400',
    medium: 'text-yellow-400',
    high: 'text-red-400',
  };

  // Componente Visual de Checkbox Personalizado
  const CustomCheckbox = ({ checked, size = 'normal' }: { checked: boolean, size?: 'normal'|'small' }) => {
    const sizeClass = size === 'normal' ? 'w-6 h-6 rounded-lg' : 'w-5 h-5 rounded-md';
    const iconSize = size === 'normal' ? 14 : 12;

    return (
      <div className={`${sizeClass} flex items-center justify-center border transition-all duration-300 shadow-sm ${
        checked 
          ? 'bg-gradient-to-br from-green-400 to-emerald-500 border-green-500 scale-105' 
          : 'bg-white/60 border-blue-300 hover:border-blue-400'
      }`}>
        {checked && <Check size={iconSize} strokeWidth={4} className="text-white" />}
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      <GlassCard title="Plano de Ação">
        <div className="flex flex-col gap-2 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="O que vamos conquistar hoje?"
              className="flex-1 bg-white/70 border border-white/60 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder-blue-400 text-blue-900"
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
            />
            <button
              onClick={addTodo}
              className="bg-sky-500 hover:bg-sky-600 text-white px-4 rounded-xl shadow-lg font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Plus />
            </button>
          </div>
          <div className="flex gap-2 justify-end">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`text-xs uppercase font-bold px-3 py-1 rounded-full border transition-all ${
                  priority === p
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white/40 text-blue-900 border-white/60 hover:bg-white/80'
                }`}
              >
                {p === 'low' ? 'Baixa' : p === 'medium' ? 'Média' : 'Alta'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {todos.sort((a,b) => Number(a.completed) - Number(b.completed)).map((todo) => (
            <div key={todo.id} className="relative">
              <div
                className={`group flex items-start justify-between p-4 rounded-xl border transition-all z-10 relative ${
                  todo.completed 
                    ? 'bg-slate-100/60 border-transparent opacity-70' 
                    : 'bg-white/60 border-white/60 shadow-sm hover:bg-white/80'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className="mt-1 flex-shrink-0"
                  >
                    <CustomCheckbox checked={todo.completed} />
                  </button>
                  {/* Mudança: whitespace-pre-wrap permite quebra de linha */}
                  <span className={`text-base font-medium leading-tight pt-0.5 whitespace-pre-wrap break-words ${todo.completed ? 'line-through text-slate-500' : 'text-blue-900'}`}>
                    {todo.text}
                  </span>
                </div>
                
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <AlertCircle size={14} className={`${priorityColors[todo.priority]} mr-1`} />
                  
                  {/* AI Button */}
                  <button
                    onClick={() => generateAiSubtasks(todo)}
                    disabled={loadingAiId === todo.id}
                    className="p-2 text-yellow-400 hover:bg-yellow-100 rounded-full transition-colors"
                    title="Gerar passos com IA"
                  >
                    {loadingAiId === todo.id ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  </button>

                  <button
                    onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                    className="p-2 text-blue-400 hover:text-sky-600 rounded-full"
                  >
                    {expandedId === todo.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Subtasks Section */}
              {expandedId === todo.id && (
                <div className="mt-[-10px] pt-5 px-5 pb-4 bg-white/40 border-x border-b border-white/50 rounded-b-xl mx-2 animate-fadeIn shadow-inner">
                  <div className="space-y-3 mb-4">
                    {todo.subtasks?.map(st => (
                      <div key={st.id} className="flex items-start gap-3">
                        <button onClick={() => toggleSubtask(todo.id, st.id)} className="mt-1 flex-shrink-0">
                           <CustomCheckbox checked={st.completed} size="small" />
                        </button>
                        {/* Fonte maior para subtarefas */}
                        <span className={`text-base leading-snug break-words ${st.completed ? 'line-through text-slate-400' : 'text-blue-800'}`}>{st.text}</span>
                      </div>
                    ))}
                    {(!todo.subtasks || todo.subtasks.length === 0) && (
                      <p className="text-sm text-slate-500 italic">Nenhuma subtarefa. Adicione ou peça para IA.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <input 
                       className="flex-1 bg-white/60 text-base px-3 py-2 rounded-lg border border-white/50 focus:outline-none placeholder-blue-400 text-blue-900"
                       placeholder="Nova subtarefa..."
                       value={newSubtaskMap[todo.id] || ''}
                       onChange={(e) => setNewSubtaskMap(prev => ({ ...prev, [todo.id]: e.target.value }))}
                       onKeyDown={(e) => e.key === 'Enter' && addSubTask(todo.id)}
                    />
                    <button onClick={() => addSubTask(todo.id)} className="bg-sky-100 hover:bg-sky-200 text-sky-600 rounded-lg px-3 transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {todos.length === 0 && <p className="text-center text-blue-900/60 py-4 italic">Lista vazia. Mente tranquila.</p>}
        </div>
      </GlassCard>
    </div>
  );
};