import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { AiNewsItem } from '../types';
import { fetchLatestAiNews } from '../services/geminiService';
import { Newspaper, ExternalLink, RefreshCw, Loader2, Calendar } from 'lucide-react';

export const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<AiNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchLatestAiNews();
    setNews(data);
    setLastUpdated(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, []);

  return (
    <div className="space-y-4 animate-fadeIn pb-24">
      <GlassCard 
        title="Radar IA" 
        headerAction={
          <button 
            onClick={loadNews} 
            disabled={loading}
            className="p-2 bg-white/50 rounded-full hover:bg-white/80 text-blue-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        }
      >
        <div className="mb-4 text-xs text-blue-800/70 text-center flex justify-center items-center gap-1">
            <Newspaper size={12} />
            Notícias atualizadas em tempo real via Google
            {lastUpdated && <span className="font-bold ml-1">({lastUpdated})</span>}
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-blue-800/60 gap-3">
             <Loader2 size={32} className="animate-spin text-yellow-500" />
             <p className="text-sm font-medium animate-pulse">Buscando novidades no mundo...</p>
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-3">
            {news.map((item, idx) => (
              <div 
                key={idx} 
                className="group relative bg-white/40 border border-white/60 rounded-2xl p-4 transition-all hover:bg-white/60 hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                   <h3 className="font-bold text-blue-900 leading-snug">{item.title}</h3>
                   {item.url && (
                     <a 
                       href={item.url} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="text-blue-400 hover:text-blue-600 p-1"
                     >
                       <ExternalLink size={16} />
                     </a>
                   )}
                </div>
                
                <p className="text-sm text-blue-800/90 mb-3 leading-relaxed">{item.summary}</p>
                
                <div className="flex items-center justify-between text-[10px] font-bold text-blue-900/50 uppercase tracking-wider">
                    <span className="bg-yellow-100/50 px-2 py-1 rounded-md border border-yellow-200/50 text-yellow-700">
                        {item.source || "Web"}
                    </span>
                    <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {item.date || "Recente"}
                    </span>
                </div>
              </div>
            ))}
            
            <p className="text-[10px] text-center text-blue-900/40 mt-4 italic">
              Gerado por IA (Gemini 3.0). Verifique as fontes.
            </p>
          </div>
        ) : (
          <div className="text-center py-8 text-blue-900/60">
             <p>Não foi possível carregar as notícias agora.</p>
             <button onClick={loadNews} className="text-blue-600 underline mt-2 text-sm">Tentar novamente</button>
          </div>
        )}
      </GlassCard>
    </div>
  );
};