
import React, { useState, useMemo, useEffect } from 'react';
import { Match } from '../types';
import { Search, Calendar, Shield, Clock, TrendingUp, ChevronRight, BarChart3, Target, Info, Loader2, Sparkles } from 'lucide-react';

interface PreMatchViewProps {
  matches: Match[];
  onSelectMatch: (match: Match) => void;
}

interface EnhancedMatchData {
  tip: string;
  odd: number;
  confidence: number;
  isProcessed: boolean;
}

// Cache persistente durante a sessão (fora do ciclo de vida do componente para persistir entre trocas de abas)
const preMatchAnalysisCache: Record<string, EnhancedMatchData> = {};

const PreMatchView: React.FC<PreMatchViewProps> = ({ matches, onSelectMatch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [enhancedData, setEnhancedData] = useState<Record<string, EnhancedMatchData>>(preMatchAnalysisCache);

  const filtered = useMemo(() => {
    return matches.filter(m => 
      m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.league.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [matches, searchQuery]);

  // Efeito para "processar" novos jogos que entram no radar
  useEffect(() => {
    filtered.forEach(match => {
      if (!enhancedData[match.id] && !processingIds.has(match.id)) {
        processMatchData(match);
      }
    });
  }, [filtered]);

  const processMatchData = async (match: Match) => {
    setProcessingIds(prev => new Set(prev).add(match.id));

    // Simula uma análise estatística complexa (ex: processamento de histórico h2h e forma)
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));

    const analysis: EnhancedMatchData = {
      tip: Math.random() > 0.5 ? 'Mais de 2.5 Gols' : 'Ambas Marcam: Sim',
      odd: 1.70 + (Math.random() * 0.6),
      confidence: 0.65 + (Math.random() * 0.25),
      isProcessed: true
    };

    // Atualiza cache global e estado local
    preMatchAnalysisCache[match.id] = analysis;
    setEnhancedData(prev => ({ ...prev, [match.id]: analysis }));
    setProcessingIds(prev => {
      const next = new Set(prev);
      next.delete(match.id);
      return next;
    });
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1">Próximos Jogos</h1>
          <p className="text-slate-400 text-sm">Análise pré-jogo baseada em IA e dados históricos.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
             <Sparkles size={14} className="text-emerald-400" />
             <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">IA Cache Ativo</span>
          </div>
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Filtrar por time ou liga..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white" 
            />
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(match => {
            const data = enhancedData[match.id];
            const isProcessing = processingIds.has(match.id);

            return (
              <div 
                key={match.id} 
                className="glass-card p-5 rounded-3xl border border-white/5 hover:border-emerald-500/30 transition-all group flex flex-col relative overflow-hidden"
              >
                {/* Indicador de Cache */}
                {data && (
                  <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                  </div>
                )}

                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Shield size={12} className="text-slate-600" /> {match.league}
                  </span>
                  <span className="text-[9px] font-black bg-slate-900 border border-white/5 text-slate-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <Clock size={12} /> {match.scheduledTime}
                  </span>
                </div>

                <div className="grid grid-cols-3 items-center text-center py-4 mb-4 relative z-10">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-2 border border-white/5 shadow-lg group-hover:border-emerald-500/30 transition-all">
                      <span className="text-sm font-black text-white">{match.homeTeam.name.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-bold truncate w-full text-slate-300 uppercase">{match.homeTeam.name}</span>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="text-[8px] font-black text-slate-500 mb-1 tracking-widest">HOJE</div>
                    <div className="text-2xl font-black text-white">VS</div>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-2 border border-white/5 shadow-lg group-hover:border-emerald-500/30 transition-all">
                      <span className="text-sm font-black text-white">{match.awayTeam.name.substring(0, 3).toUpperCase()}</span>
                    </div>
                    <span className="text-[10px] font-bold truncate w-full text-slate-300 uppercase">{match.awayTeam.name}</span>
                  </div>
                </div>

                <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 mb-4 flex-grow relative overflow-hidden">
                  <h4 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Target size={12} /> Sugestão Pré-Jogo
                  </h4>

                  {isProcessing ? (
                    <div className="flex flex-col items-center justify-center py-2 animate-pulse">
                      <Loader2 size={16} className="text-slate-600 animate-spin mb-2" />
                      <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Processando Dados...</span>
                    </div>
                  ) : data ? (
                    <>
                      <div className="flex justify-between items-center animate-in fade-in duration-300">
                         <p className="text-xs font-black text-white">{data.tip}</p>
                         <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">@{data.odd.toFixed(2)}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                         <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                           <div 
                            className="bg-emerald-500 h-full transition-all duration-1000" 
                            style={{ width: `${data.confidence * 100}%` }}
                           ></div>
                         </div>
                         <span className="text-[9px] font-black text-slate-500 uppercase">{Math.round(data.confidence * 100)}%</span>
                      </div>
                    </>
                  ) : (
                    <div className="h-10"></div>
                  )}
                </div>

                <button 
                  onClick={() => onSelectMatch(match)}
                  className="w-full py-3.5 bg-emerald-500/5 hover:bg-emerald-500 hover:text-slate-950 text-white rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-2 uppercase tracking-[0.15em] border border-white/5"
                >
                  <BarChart3 size={14} /> Analisar Probabilidades
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 glass-card rounded-2xl border-dashed border-2 border-white/5">
          <Calendar size={64} className="mx-auto mb-4 text-slate-700" />
          <h2 className="text-2xl font-bold text-slate-300">Nenhum jogo agendado</h2>
          <p className="text-slate-500 mt-2">Não há partidas futuras registradas para hoje.</p>
        </div>
      )}
    </div>
  );
};

export default PreMatchView;
import { CheckCircle2 } from 'lucide-react';
