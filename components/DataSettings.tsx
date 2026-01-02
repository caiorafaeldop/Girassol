import React, { useRef, useState } from 'react';
import { StorageService } from '../services/storageService';
import { Download, Upload, Trash2, X, Database, CheckCircle, AlertTriangle } from 'lucide-react';

interface DataSettingsProps {
  onClose: () => void;
  onDataImported: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ onClose, onDataImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleExport = () => {
    const json = StorageService.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = href;
    link.download = `girassol_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setStatus('success');
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importAll(content);
        if (success) {
          setStatus('success');
          onDataImported(); // Refresh App state
          setTimeout(() => {
             onClose();
          }, 1500);
        } else {
          setStatus('error');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleClear = () => {
      if (window.confirm("Tem certeza absoluta? Isso apagará TODOS os seus hábitos, tarefas e diários deste aparelho.")) {
          StorageService.clearAll();
          onDataImported();
          onClose();
      }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/80 border border-white/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative backdrop-blur-xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-900/50 hover:text-red-500 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
            <div className="p-3 bg-blue-100 rounded-full text-blue-600 mb-3 shadow-inner">
                <Database size={28} />
            </div>
            <h3 className="text-xl font-black text-blue-900">Meus Dados</h3>
            <p className="text-xs text-blue-800/70 text-center mt-1">
                Seus dados vivem neste aparelho. <br/>Faça backup para garantir que nada se perca.
            </p>
        </div>

        <div className="space-y-3">
            {/* Export */}
            <button 
                onClick={handleExport}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-md transition-all active:scale-95 group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-200/50 rounded-lg text-blue-700">
                        <Download size={20} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-blue-900 text-sm">Fazer Backup</p>
                        <p className="text-[10px] text-blue-700">Baixar arquivo .json</p>
                    </div>
                </div>
            </button>

            {/* Import */}
            <button 
                onClick={handleImportClick}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-100 rounded-xl hover:shadow-md transition-all active:scale-95"
            >
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-200/50 rounded-lg text-green-700">
                        <Upload size={20} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-green-900 text-sm">Restaurar Dados</p>
                        <p className="text-[10px] text-green-700">Carregar arquivo .json</p>
                    </div>
                </div>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".json" 
                onChange={handleFileChange} 
            />

             {/* Clear */}
             <button 
                onClick={handleClear}
                className="w-full mt-6 py-2 text-xs text-red-400 hover:text-red-600 font-bold flex items-center justify-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
                <Trash2 size={12} />
                Limpar Memória do App
            </button>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
            <div className="mt-4 p-2 bg-green-100 border border-green-200 text-green-800 text-xs font-bold rounded-lg flex items-center justify-center gap-2 animate-bounce-slow">
                <CheckCircle size={14} />
                Sucesso!
            </div>
        )}
        {status === 'error' && (
            <div className="mt-4 p-2 bg-red-100 border border-red-200 text-red-800 text-xs font-bold rounded-lg flex items-center justify-center gap-2">
                <AlertTriangle size={14} />
                Erro ao ler arquivo.
            </div>
        )}

      </div>
    </div>
  );
};