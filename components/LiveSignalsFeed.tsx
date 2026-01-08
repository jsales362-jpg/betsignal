
import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import { BettingSignal } from '../types';
import { Zap, TrendingUp, Clock, Shield, Bookmark, BookmarkCheck, Filter, ChevronDown, ChevronUp, CheckCircle2, Info, Bell, BellOff, Star, Percent, Trophy, Activity } from 'lucide-react';
import { VariableSizeList as List } from 'react-window';

interface SignalCardProps {
  signal: BettingSignal;
  isSaved: boolean;
  isExpanded: boolean;
  onSave: (signal: BettingSignal) => void;
  onToggleExpand: (id: string) => void;
}

const SignalCard = memo(({ signal, isSaved, isExpanded, onSave, onToggleExpand }: SignalCardProps) => {
  const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`;
  const isHighConfidence = signal.confidence > 0.85;

  return (
    <div 
      className={`glass-card p-5 rounded-2xl border transition-all group relative overflow-hidden flex flex-col h-full ${
        isHighConfidence 
          ? 'border-emerald-500/60 bg-emerald-500/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/20' 
          : 'border-white/5 hover:border-emerald-500/30'
      } ${
        isExpanded ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10' : ''
      }`}
    >
      {isHighConfidence && (
        <div className="absolute -left-8 top-4 -rotate-45 bg-emerald-500 text-slate-950 text-[8px] font-black py-1 px-10 shadow-lg z-10 uppercase tracking-tighter">
          Alta Precisão
        </div>
      )}

      <div className="absolute top-0 right-0 p-3 flex gap-2">
         {isHighConfidence && (
           <div className="bg-emerald-500 text-slate-950 p-1 rounded-full shadow-lg shadow-emerald-500/20">
             <Star size={10} fill="currentColor" />
           </div>
         )}
         <div className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1">
           <span className="w-1 h-1 bg-emerald-400 rounded-full animate-ping"></span>
           Novo
         </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 truncate uppercase">
          <Shield size={10} className="text-slate-600" /> {signal.leagueName}
        </span>
      </div>

      <h3 className="text-sm font-black text-white mb-2 truncate">
        {signal.matchName}
      </h3>

      <div className="flex items-center gap-2 mb-4">
        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
          isHighConfidence ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-500 text-slate-950'
        }`}>
          {signal.type}
        </span>
        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
          <Clock size={10} /> {signal.timestamp}
        </span>
        {signal.minute && (
          <span className="text-[10px] text-emerald-500 font-black ml-1">
            {signal.minute}'
          </span>
        )}
      </div>

      <div className={`p-3 rounded-xl mb-4 border transition-colors flex-grow ${
        isHighConfidence 
          ? 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/15' 
          : 'bg-slate-950/40 border-white/5 group-hover:bg-slate-900/60'
      }`}>
         <p className={`text-xs font-black mb-1 leading-tight ${
           isHighConfidence ? 'text-white' : 'text-emerald-400'
         }`}>{signal.description}</p>
         <div className="flex items-start gap-1">
            <p className={`text-[10px] leading-relaxed italic line-clamp-2 flex-1 ${
              isHighConfidence ? 'text-emerald-100/70' : 'text-slate-400'
            }`}>"{signal.analysis}"</p>
         </div>
      </div>

      {isExpanded && (
        <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Info size={10} /> Contexto da Partida
            </h4>
            <div className="bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
              <p className="text-[11px] text-slate-300 leading-tight">
                Sinal gerado aos <span className="text-emerald-400 font-bold">{signal.minute}'</span> na <span className="text-white font-bold">{signal.leagueName}</span>.
              </p>
            </div>
          </div>

          {signal.keyFactors && signal.keyFactors.length > 0 && (
            <div className={`p-3 rounded-xl border ${
              isHighConfidence ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-500/5 border-emerald-500/10'
            }`}>
              <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-1 ${
                isHighConfidence ? 'text-white' : 'text-emerald-400'
              }`}>
                Fatores Decisivos
              </h4>
              <ul className="space-y-1">
                {signal.keyFactors.map((factor, fIdx) => (
                  <li key={fIdx} className="text-[10px] text-slate-300 flex items-start gap-2 leading-tight">
                    <CheckCircle2 size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* FOOTER COM ODD EM DESTAQUE */}
      <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex flex-col gap-3">
          {/* BADGE DE ODD PROEMINENTE */}
          <div className={`relative group/odd flex flex-col items-start bg-slate-950/80 px-4 py-2 rounded-xl border transition-all ${
            isHighConfidence 
              ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)] scale-105' 
              : 'border-white/10'
          }`}>
            <div className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-[0.15em] mb-0.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Real-Time
            </div>
            <div className="flex items-center gap-1 font-black text-2xl text-white tracking-tighter">
              <span className="text-emerald-400 text-sm mt-1">@</span>
              {signal.oddSuggested.toFixed(2)}
              <TrendingUp size={16} className="text-emerald-500/50 ml-1" />
            </div>
          </div>
          
          <button 
            onClick={() => onToggleExpand(signalId)}
            className={`flex items-center gap-1.5 text-[10px] font-black px-2 py-1.5 rounded-lg transition-all ${
              isExpanded ? 'text-white bg-white/10' : 'text-slate-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isExpanded ? 'OCULTAR' : 'VER ANÁLISE'}
          </button>
        </div>
        
        <button 
          onClick={() => onSave(signal)}
          className={`p-3 rounded-xl transition-all shadow-lg ${
            isSaved 
              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30' 
              : 'text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 border border-transparent'
          }`}
          title={isSaved ? "Salvo nos meus sinais" : "Salvar sinal"}
        >
          {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
        </button>
      </div>

      {!isExpanded && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full" 
              style={{ width: `${signal.confidence * 100}%` }}
            ></div>
          </div>
          <span className={`text-[9px] font-bold ${isHighConfidence ? 'text-emerald-400' : 'text-slate-500'}`}>
            {Math.round(signal.confidence * 100)}% Precisão
          </span>
        </div>
      )}
    </div>
  );
});

interface LiveSignalsFeedProps {
  signals: BettingSignal[];
  onSave: (signal: BettingSignal) => void;
  savedIds: string[];
}

const LiveSignalsFeed: React.FC<LiveSignalsFeedProps> = ({ signals, onSave, savedIds }) => {
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [leagueFilter, setLeagueFilter] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [columnCount, setColumnCount] = useState(3);
  
  const listRef = useRef<List>(null);
  const lastSignalIdRef = useRef<string | null>(null);

  // Resize listener para colunas dinâmicas
  useEffect(() => {
    const updateColumns = () => {
      if (window.innerWidth < 768) setColumnCount(1);
      else if (window.innerWidth < 1024) setColumnCount(2);
      else setColumnCount(3);
    };
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Notificações nativas
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled || signals.length === 0) return;
    const latest = signals[0];
    const latestId = `${latest.matchId}-${latest.type}-${latest.timestamp}`;
    if (latestId !== lastSignalIdRef.current) {
      lastSignalIdRef.current = latestId;
      if (Notification.permission === 'granted') {
        new Notification(`Novo Sinal: ${latest.type}`, {
          body: `${latest.matchName} - @${latest.oddSuggested.toFixed(2)}`,
        });
      }
    }
  }, [signals, notificationsEnabled]);

  const availableTypes = useMemo(() => Array.from(new Set(signals.map(s => s.type))).sort(), [signals]);
  const availableLeagues = useMemo(() => Array.from(new Set(signals.map(s => s.leagueName).filter(Boolean) as string[])).sort(), [signals]);

  const filteredSignals = useMemo(() => {
    return signals.filter(signal => {
      const matchesType = !typeFilter || signal.type === typeFilter;
      const matchesLeague = !leagueFilter || signal.leagueName === leagueFilter;
      const matchesConfidence = signal.confidence >= minConfidence;
      return matchesType && matchesLeague && matchesConfidence;
    });
  }, [signals, typeFilter, leagueFilter, minConfidence]);

  // Agrupamento de sinais em linhas para virtualização
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredSignals.length; i += columnCount) {
      result.push(filteredSignals.slice(i, i + columnCount));
    }
    return result;
  }, [filteredSignals, columnCount]);

  // Resetar cache de alturas quando houver mudança estrutural
  useEffect(() => {
    listRef.current?.resetAfterIndex(0);
  }, [rows, expandedSignalId]);

  const getRowHeight = (index: number) => {
    const currentRow = rows[index];
    if (!currentRow) return 0;
    const hasExpanded = currentRow.some(s => `${s.matchId}-${s.type}-${s.timestamp}` === expandedSignalId);
    // Altura base ajustada para a nova odd proeminente
    return (hasExpanded ? 520 : 340) + 24;
  };

  const Row = ({ index, style }: any) => {
    const currentRow = rows[index];
    return (
      <div style={style} className="px-1">
        <div className={`grid gap-6 h-full pb-6 ${
          columnCount === 3 ? 'grid-cols-3' : columnCount === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {currentRow.map((signal) => {
            const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`;
            return (
              <SignalCard 
                key={signalId}
                signal={signal}
                isSaved={savedIds.includes(signalId)}
                isExpanded={expandedSignalId === signalId}
                onSave={onSave}
                onToggleExpand={setExpandedSignalId}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const resetFilters = () => {
    setTypeFilter(null);
    setLeagueFilter(null);
    setMinConfidence(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Filter size={18} className="text-emerald-400" />
            <h2 className="text-sm font-black uppercase tracking-widest">Filtros Inteligentes</h2>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
              notificationsEnabled ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-800 border-white/5 text-slate-500 hover:text-slate-300'
            }`}
          >
            {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            {notificationsEnabled ? 'ALERTAS ATIVOS' : 'ATIVAR ALERTAS'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mercado</span>
            <select 
              value={typeFilter || ''} 
              onChange={(e) => setTypeFilter(e.target.value || null)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos os Mercados</option>
              {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confiança</span>
            <select 
              value={minConfidence} 
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value={0}>Qualquer Confiança</option>
              <option value={0.7}>+70% Precisão</option>
              <option value={0.85}>+85% Precisão (Elite)</option>
            </select>
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Liga</span>
            <select 
              value={leagueFilter || ''} 
              onChange={(e) => setLeagueFilter(e.target.value || null)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todas as Ligas</option>
              {availableLeagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredSignals.length > 0 ? (
        <div className="flex-grow min-h-[600px]">
          <List
            ref={listRef}
            height={700}
            itemCount={rows.length}
            itemSize={getRowHeight}
            width="100%"
            overscanCount={2}
          >
            {Row}
          </List>
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-2xl border-dashed border-2 border-white/5">
          <Zap size={48} className="text-slate-700 animate-pulse mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-300">Nenhum sinal encontrado</h3>
          <p className="text-slate-500 mt-2">Ajuste os filtros para ver mais oportunidades.</p>
        </div>
      )}
    </div>
  );
};

export default LiveSignalsFeed;
