
import React, { useState, useMemo, memo, useEffect, useRef } from 'react';
import { BettingSignal } from '../types';
import { Zap, TrendingUp, Clock, Shield, Bookmark, BookmarkCheck, Filter, ChevronDown, ChevronUp, CheckCircle2, Info, Bell, BellOff, Star, Percent, Trophy, Activity, Settings2, Radio, Copy, HelpCircle } from 'lucide-react';
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
  const [showCopied, setShowCopied] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const analysisRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = analysisRef.current;
    if (!element) return;

    const checkTruncation = () => {
      const truncated = element.scrollHeight > element.clientHeight;
      setIsTruncated(truncated);
    };

    const observer = new ResizeObserver(checkTruncation);
    observer.observe(element);
    checkTruncation();

    return () => observer.disconnect();
  }, [signal.analysis]);

  const handleCopyOdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(signal.oddSuggested.toFixed(2));
    setShowCopied(true);
    setTimeout(() => setShowCopied(false), 2000);
  };

  return (
    <div 
      className={`glass-card p-5 rounded-2xl border transition-all group relative overflow-hidden flex flex-col h-full animate-signal-entry ${
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

      <div className={`p-3 rounded-xl mb-3 border transition-all flex-grow-0 relative group/tooltip cursor-help ${
        isHighConfidence 
          ? 'bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/15' 
          : 'bg-slate-950/40 border-white/5 group-hover:bg-slate-900/60'
      }`}>
         <p className={`text-xs font-black mb-1 leading-tight ${
           isHighConfidence ? 'text-white' : 'text-emerald-400'
         }`}>{signal.description}</p>
         
         <div className="flex items-start gap-1">
            <p 
              ref={analysisRef}
              className={`text-[10px] leading-relaxed italic line-clamp-2 flex-1 transition-opacity ${
                isHighConfidence ? 'text-emerald-100/70' : 'text-slate-400'
              }`}
            >
              "{signal.analysis}"
            </p>
         </div>

         {isTruncated && (
           <div className="absolute inset-x-0 bottom-full mb-3 p-4 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/40 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] opacity-0 invisible translate-y-2 scale-95 group-hover/tooltip:opacity-100 group-hover/tooltip:visible group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100 transition-all duration-300 z-50 pointer-events-none ring-1 ring-white/5">
              <div className="flex items-start gap-2 mb-2">
                <Info size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Análise Completa</span>
              </div>
              <p className="text-[10px] text-white leading-relaxed italic">
                "{signal.analysis}"
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-slate-900/95"></div>
           </div>
         )}
      </div>

      <button 
        onClick={() => onToggleExpand(signalId)}
        className={`mb-4 flex items-center justify-center gap-1.5 text-[10px] font-black px-4 py-2.5 rounded-xl transition-all w-full border border-white/5 ${
          isExpanded ? 'text-white bg-emerald-500/20 border-emerald-500/40' : 'text-slate-400 bg-slate-800/50 hover:text-white hover:bg-slate-800'
        }`}
      >
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {isExpanded ? 'OCULTAR DETALHES' : 'VER ANÁLISE'}
      </button>

      {isExpanded && (
        <div className="mb-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="pt-3 border-t border-white/10">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Info size={10} className="text-emerald-500" /> Contexto da Partida
            </h4>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Sinal processado pela IA aos <span className="text-emerald-400 font-bold">{signal.minute}'</span> minutos. Jogo monitorado na <span className="text-white font-bold">{signal.leagueName}</span> com alto índice de pressão detectado.
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
                <Activity size={10} className="text-emerald-500" /> Fatores Decisivos
              </h4>
              <ul className="space-y-1.5">
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

      <div className="flex items-end justify-between mt-auto pt-4 border-t border-white/5 gap-3">
        <div className="flex flex-col gap-3 flex-1">
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
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleCopyOdd}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 border ${
              showCopied 
                ? 'bg-blue-500 text-white border-blue-400 shadow-blue-500/20' 
                : 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-emerald-500/20 hover:bg-emerald-400'
            }`}
          >
            {showCopied ? <>COPIADO!</> : <><Copy size={14} /> @{signal.oddSuggested.toFixed(2)}</>}
          </button>

          <button 
            onClick={() => onSave(signal)}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center border ${
              isSaved 
                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
                : 'text-slate-500 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
            }`}
            title={isSaved ? "Salvo nos meus sinais" : "Salvar sinal"}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>
      </div>

      {!isExpanded && (
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${signal.confidence * 100}%` }}></div>
          </div>
          <span className={`text-[9px] font-bold ${isHighConfidence ? 'text-emerald-400' : 'text-slate-500'}`}>
            {Math.round(signal.confidence * 100)}% Precisão
          </span>
        </div>
      )}
    </div>
  );
});

const LiveTicker: React.FC<{ signals: BettingSignal[] }> = ({ signals }) => {
  const latestSignals = useMemo(() => signals.slice(0, 5), [signals]);
  if (latestSignals.length === 0) return null;

  return (
    <div className="glass-card mb-6 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.05)]">
      <div className="flex items-center bg-slate-900/90 px-4 py-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Ticker de Sinais Ao Vivo</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
           <Radio size={10} /> Atualizado Agora
        </div>
      </div>
      <div className="flex overflow-x-auto scrollbar-hide p-3 gap-4 items-center no-scrollbar">
        {latestSignals.map((signal, idx) => (
          <div 
            key={`${signal.matchId}-${idx}`} 
            className="flex-none flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right-4 transition-all hover:bg-white/10"
          >
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-emerald-500 uppercase leading-none mb-1">{signal.type}</span>
              <span className="text-[11px] font-bold text-white whitespace-nowrap max-w-[150px] truncate">{signal.matchName}</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-bold text-slate-500 uppercase leading-none mb-1">Odd Sug.</span>
              <span className="text-xs font-black text-emerald-400">@{signal.oddSuggested.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Componente de Tooltip informativo para os filtros.
 */
const FilterTooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => (
  <div className="relative group/filter-tip">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 rounded-lg shadow-xl opacity-0 invisible translate-y-1 group-hover/filter-tip:opacity-100 group-hover/filter-tip:visible group-hover/filter-tip:translate-y-0 transition-all duration-200 z-[60] w-max max-w-[200px] pointer-events-none">
      <p className="text-[9px] font-bold text-white leading-tight text-center">{text}</p>
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-slate-900/95"></div>
    </div>
  </div>
);

interface LiveSignalsFeedProps {
  signals: BettingSignal[];
  onSave: (signal: BettingSignal) => void;
  savedIds: string[];
}

type NotificationFilterType = 'ALL' | 'HIGH_PRECISION';

const LiveSignalsFeed: React.FC<LiveSignalsFeedProps> = ({ signals, onSave, savedIds }) => {
  const [typeFilter, setTypeFilter] = useState<string | null>(() => localStorage.getItem('betsignal_filter_type') || null);
  const [leagueFilter, setLeagueFilter] = useState<string | null>(() => localStorage.getItem('betsignal_filter_league') || null);
  const [minConfidence, setMinConfidence] = useState<number>(() => Number(localStorage.getItem('betsignal_filter_confidence')) || 0);
  const [notificationFilter, setNotificationFilter] = useState<NotificationFilterType>(() => (localStorage.getItem('betsignal_notif_filter') as NotificationFilterType) || 'ALL');
  const [expandedSignalIds, setExpandedSignalIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('betsignal_expanded_ids');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [columnCount, setColumnCount] = useState(3);
  const listRef = useRef<List>(null);
  const lastSignalIdRef = useRef<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSignalIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem('betsignal_expanded_ids', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const playNotificationSound = () => {
    try {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (e) { console.warn("Erro ao tocar som:", e); }
  };

  useEffect(() => {
    localStorage.setItem('betsignal_filter_type', typeFilter || '');
    localStorage.setItem('betsignal_filter_league', leagueFilter || '');
    localStorage.setItem('betsignal_filter_confidence', minConfidence.toString());
    localStorage.setItem('betsignal_notif_filter', notificationFilter);
  }, [typeFilter, leagueFilter, minConfidence, notificationFilter]);

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

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredSignals.length; i += columnCount) {
      result.push(filteredSignals.slice(i, i + columnCount));
    }
    return result;
  }, [filteredSignals, columnCount]);

  useEffect(() => { listRef.current?.resetAfterIndex(0); }, [rows, expandedSignalIds]);

  const getRowHeight = (index: number) => {
    const currentRow = rows[index];
    if (!currentRow) return 0;
    const hasExpanded = currentRow.some(s => expandedSignalIds.has(`${s.matchId}-${s.type}-${s.timestamp}`));
    return (hasExpanded ? 520 : 340) + 24;
  };

  const Row = ({ index, style }: any) => {
    const currentRow = rows[index];
    return (
      <div style={style} className="px-1">
        <div className={`grid gap-6 h-full pb-6 ${columnCount === 3 ? 'grid-cols-3' : columnCount === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {currentRow.map((signal) => {
            const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`;
            return (
              <SignalCard 
                key={signalId}
                signal={signal}
                isSaved={savedIds.includes(signalId)}
                isExpanded={expandedSignalIds.has(signalId)}
                onSave={onSave}
                onToggleExpand={toggleExpand}
              />
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      <LiveTicker signals={signals} />

      <div className="glass-card p-5 rounded-2xl border border-white/5 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-white/5 pb-4 gap-4">
          <div className="flex items-center gap-2 text-slate-300">
            <Filter size={18} className="text-emerald-400" />
            <h2 className="text-sm font-black uppercase tracking-widest">Filtros Inteligentes</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <FilterTooltip text="Reseta todos os critérios de filtragem para a visualização padrão.">
              <button
                onClick={() => { setTypeFilter(null); setLeagueFilter(null); setMinConfidence(0); }}
                className="text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-widest px-2"
              >
                Limpar Filtros
              </button>
            </FilterTooltip>
            
            <div className="flex items-center bg-slate-900/50 rounded-xl p-1 border border-white/5">
              <FilterTooltip text="Exibe todos os sinais recebidos pela IA sem restrição de assertividade.">
                <button 
                  onClick={() => setNotificationFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${
                    notificationFilter === 'ALL' ? 'bg-slate-700 text-white shadow-inner' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  TODOS
                </button>
              </FilterTooltip>
              <FilterTooltip text="Exibe apenas sinais de elite com confiança superior a 85%.">
                <button 
                  onClick={() => setNotificationFilter('HIGH_PRECISION')}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all flex items-center gap-1 ${
                    notificationFilter === 'HIGH_PRECISION' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <Star size={10} fill={notificationFilter === 'HIGH_PRECISION' ? 'currentColor' : 'none'} />
                  ALTA PRECISÃO
                </button>
              </FilterTooltip>
            </div>

            <FilterTooltip text="Ativa ou desativa notificações visuais e sonoras para novos sinais.">
              <button
                onClick={() => { setNotificationsEnabled(!notificationsEnabled); playNotificationSound(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                  notificationsEnabled ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-slate-800 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {notificationsEnabled ? <Bell size={14} className="animate-swing" /> : <BellOff size={14} />}
                {notificationsEnabled ? 'ALERTAS ATIVOS' : 'ATIVAR ALERTAS'}
              </button>
            </FilterTooltip>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mercado</span>
              <FilterTooltip text="Selecione o tipo de evento: Gols, Escanteios, Cartões ou Resultado Final.">
                <HelpCircle size={10} className="text-slate-600 hover:text-emerald-500 transition-colors cursor-help" />
              </FilterTooltip>
            </div>
            <select 
              value={typeFilter || ''} 
              onChange={(e) => setTypeFilter(e.target.value || null)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all hover:border-emerald-500/30 text-white"
            >
              <option value="">Todos os Mercados</option>
              {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confiança Mínima</span>
              <FilterTooltip text="Filtre sinais com base no percentual de precisão estimado pelo nosso algoritmo.">
                <HelpCircle size={10} className="text-slate-600 hover:text-emerald-500 transition-colors cursor-help" />
              </FilterTooltip>
            </div>
            <select 
              value={minConfidence} 
              onChange={(e) => setMinConfidence(Number(e.target.value))}
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all hover:border-emerald-500/30 text-white"
            >
              <option value={0}>Qualquer Confiança</option>
              <option value={0.7}>+70% Precisão</option>
              <option value={0.8}>+80% Precisão</option>
              <option value={0.85}>+85% Precisão (Elite)</option>
              <option value={0.9}>+90% Precisão (Máxima)</option>
            </select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Liga</span>
              <FilterTooltip text="Restrinja a exibição a competições ou campeonatos específicos.">
                <HelpCircle size={10} className="text-slate-600 hover:text-emerald-500 transition-colors cursor-help" />
              </FilterTooltip>
            </div>
            <select 
              value={leagueFilter || ''} 
              onChange={(e) => setLeagueFilter(e.target.value || null)}
              className="w-full bg-slate-800 border border-white/10 rounded-lg py-2.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all hover:border-emerald-500/30 text-white"
            >
              <option value="">Todas as Ligas</option>
              {availableLeagues.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      {filteredSignals.length > 0 ? (
        <div className="flex-grow min-h-[600px]">
          <List ref={listRef} height={700} itemCount={rows.length} itemSize={getRowHeight} width="100%" overscanCount={2}>
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
