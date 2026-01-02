import React, { useRef, useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { Download, Upload, Trash2, X, CheckCircle, AlertTriangle, Bell, Volume2, Info, ToggleRight, ToggleLeft, Clock } from 'lucide-react';

interface DataSettingsProps {
  onClose: () => void;
  onDataImported: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ onClose, onDataImported }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  // Preferências
  const [prefs, setPrefs] = useState({
    sounds: true,
    notifications: false,
    notificationTime: "07:00",
  });

  useEffect(() => {
    const saved = localStorage.getItem('c26_prefs');
    if (saved) {
        setPrefs(JSON.parse(saved));
    } else {
        // Se não tiver salvo, verifica se já tem permissão nativa e sincroniza
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
             setPrefs(p => ({ ...p, notifications: true }));
        }
    }
  }, []);

  const savePrefs = (newPrefs: typeof prefs) => {
      setPrefs(newPrefs);
      localStorage.setItem('c26_prefs', JSON.stringify(newPrefs));
  }

  const toggleSound = () => {
      savePrefs({ ...prefs, sounds: !prefs.sounds });
  }

  const toggleNotifications = async () => {
      // 1. Verifica suporte do navegador
      if (!("Notification" in window)) {
          alert("Este navegador não suporta notificações de sistema.");
          return;
      }

      // 2. Se estiver ativado, desativa (sempre permitido)
      if (prefs.notifications) {
          savePrefs({ ...prefs, notifications: false });
          return;
      }

      // 3. Tentar Ativar
      // 3a. Verifica se já está negado
      if (Notification.permission === 'denied') {
          alert("As notificações estão bloqueadas no seu navegador. Acesse as configurações do site/app para permitir manualmente.");
          return;
      }

      // 3b. Se já tem permissão concedida
      if (Notification.permission === 'granted') {
          savePrefs({ ...prefs, notifications: true });
          try {
            new Notification("Girassol 2026", { 
                body: "🌻 Lembretes reativados! Vamos florescer juntos.",
                icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png"
            });
          } catch(e) { console.log(e); }
          return;
      }

      // 3c. Solicita Permissão (Estado 'default')
      try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
              savePrefs({ ...prefs, notifications: true });
              new Notification("Girassol 2026", { 
                  body: "🌻 Lembretes ativados! Vamos florescer juntos.",
                  icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png"
              });
          } else {
              // Usuário negou ou fechou o prompt
              alert("Precisamos da sua permissão para enviar a frase do dia. Tente novamente.");
          }
      } catch (error) {
          console.error("Erro ao solicitar notificação:", error);
      }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      savePrefs({ ...prefs, notificationTime: e.target.value });
  }

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

  // Componente Auxiliar para Toggle Simples
  const SimpleToggle = ({ label, icon: Icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) => (
    <div onClick={onClick} className="flex items-center justify-between p-3 bg-white/40 border border-white/50 rounded-xl cursor-pointer hover:bg-white/60 transition-colors">
        <div className="flex items-center gap-3 text-blue-900">
            <Icon size={18} className="text-blue-500" />
            <span className="font-bold text-sm">{label}</span>
        </div>
        {active ? (
            <ToggleRight size={28} className="text-green-500 transition-colors" />
        ) : (
            <ToggleLeft size={28} className="text-slate-400 transition-colors" />
        )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white/80 border border-white/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl relative backdrop-blur-xl max-h-[90vh] overflow-y-auto no-scrollbar animate-popIn">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-blue-900/50 hover:text-red-500 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-6">
            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Configurações
            </h3>
        </div>

        <div className="space-y-6">
            
            {/* Seção Preferências */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Preferências</h4>
                <div className="space-y-2">
                    <SimpleToggle 
                        label="Sons da Interface" 
                        icon={Volume2} 
                        active={prefs.sounds} 
                        onClick={toggleSound} 
                    />
                    
                    {/* Toggle de Notificação com Relógio */}
                    <div className="flex flex-col gap-2 bg-white/40 border border-white/50 rounded-xl p-3 transition-colors hover:bg-white/60">
                        <div className="flex items-center justify-between cursor-pointer" onClick={toggleNotifications}>
                            <div className="flex items-center gap-3 text-blue-900">
                                <Bell size={18} className="text-blue-500" />
                                <span className="font-bold text-sm">Lembretes Diários</span>
                            </div>
                            {prefs.notifications ? (
                                <ToggleRight size={28} className="text-green-500 transition-colors" />
                            ) : (
                                <ToggleLeft size={28} className="text-slate-400 transition-colors" />
                            )}
                        </div>
                        
                        {prefs.notifications && (
                            <div className="flex items-center gap-3 mt-2 pl-2 border-t border-white/30 pt-2 animate-fadeIn">
                                <Clock size={16} className="text-blue-400" />
                                <span className="text-xs font-bold text-blue-800">Horário:</span>
                                <input 
                                    type="time" 
                                    value={prefs.notificationTime} 
                                    onChange={handleTimeChange}
                                    className="bg-white/60 border border-blue-200 rounded-lg px-2 py-1 text-sm font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seção Dados */}
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-widest ml-1">Dados & Backup</h4>
                <button 
                    onClick={handleExport}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-xl hover:shadow-md transition-all active:scale-95 group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-blue-200/50 rounded-lg text-blue-700">
                            <Download size={16} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-blue-900 text-sm">Fazer Backup</p>
                        </div>
                    </div>
                </button>

                <button 
                    onClick={handleImportClick}
                    className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-green-100 rounded-xl hover:shadow-md transition-all active:scale-95"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-green-200/50 rounded-lg text-green-700">
                            <Upload size={16} />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-green-900 text-sm">Restaurar Dados</p>
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
            </div>

            {/* Zona de Perigo */}
            <div className="pt-2">
                <button 
                    onClick={handleClear}
                    className="w-full py-3 text-xs text-red-400 hover:text-red-600 font-bold flex items-center justify-center gap-2 border border-red-100 rounded-xl hover:bg-red-50 transition-colors"
                >
                    <Trash2 size={14} />
                    Resetar App de Fábrica
                </button>
            </div>

            {/* Footer Sobre */}
            <div className="pt-4 border-t border-blue-100 text-center space-y-1">
                <div className="flex items-center justify-center gap-1 text-blue-900 font-bold text-sm">
                    <Info size={14} />
                    <span>Girassol OS</span>
                </div>
                <p className="text-[10px] text-blue-400">Versão 2026.1.1 (Beta)</p>
                <p className="text-[10px] text-blue-300">Feito com 🌻 para você brilhar.</p>
            </div>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
            <div className="absolute bottom-6 left-6 right-6 p-2 bg-green-100 border border-green-200 text-green-800 text-xs font-bold rounded-lg flex items-center justify-center gap-2 animate-bounce-slow shadow-lg">
                <CheckCircle size={14} />
                Operação realizada!
            </div>
        )}
        {status === 'error' && (
            <div className="absolute bottom-6 left-6 right-6 p-2 bg-red-100 border border-red-200 text-red-800 text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg">
                <AlertTriangle size={14} />
                Erro no arquivo.
            </div>
        )}

      </div>
    </div>
  );
};