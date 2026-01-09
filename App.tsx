
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Match, ViewMode, BettingSignal, Player, PlayerPerformance, ReadyTicket, HistoricalMatchStats, TeamHistory } from './types';
import MatchCard from './components/MatchCard';
import MatchDetail from './components/MatchDetail';
import LiveSignalsFeed from './components/LiveSignalsFeed';
import ReadyTicketsFeed from './components/ReadyTicketsFeed';
import HistoryView from './components/HistoryView';
import StatsView from './components/StatsView';
import PreMatchView from './components/PreMatchView';
import { generateBettingSignals, generateReadyTickets } from './services/geminiService';
import { LayoutDashboard, Bell, Globe, Search, Zap, Trash2, Calendar, Shield, TrendingUp, Radio, Ticket, History, PieChart, Clock, CheckCircle2, Target, Award, Wifi, WifiOff, RefreshCw } from 'lucide-react';

const generateMockHistory = (teamName: string, isHomeMode: boolean): HistoricalMatchStats[] => {
  const opponents = ['Arsenal', 'Chelsea', 'Spurs', 'Newcastle', 'Aston Villa', 'Everton', 'West Ham'];
  return Array.from({ length: 5 }).map((_, i) => {
    const gf = Math.floor(Math.random() * 4);
    const ga = Math.floor(Math.random() * 3);
    const result = gf > ga ? 'W' : gf === ga ? 'D' : 'L';
    return {
      date: `${10 + i}/05`,
      opponent: opponents[Math.floor(Math.random() * opponents.length)],
      result,
      score: `${gf}-${ga}`,
      isHome: isHomeMode ? true : Math.random() > 0.5,
      goalsFor: gf,
      goalsAgainst: ga,
      shots: 10 + Math.floor(Math.random() * 10),
      shotsOnTarget: 3 + Math.floor(Math.random() * 6),
      corners: 4 + Math.floor(Math.random() * 8),
      cornersAgainst: 3 + Math.floor(Math.random() * 6),
      yellowCards: Math.floor(Math.random() * 4),
      redCards: Math.random() > 0.9 ? 1 : 0,
      fouls: 8 + Math.floor(Math.random() * 10),
      offsides: Math.floor(Math.random() * 5)
    };
  });
};

const generateMockPlayers = (teamName: string): Player[] => {
  const positions: ('GK' | 'DF' | 'MF' | 'FW')[] = ['GK', 'DF', 'DF', 'MF', 'MF', 'FW'];
  const names = teamName === 'Manchester City' ? ['Ederson', 'Dias', 'Akanji', 'Rodri', 'De Bruyne', 'Haaland'] :
                teamName === 'Liverpool' ? ['Alisson', 'Van Dijk', 'Konate', 'Mac Allister', 'Szoboszlai', 'Salah'] :
                ['Player A', 'Player B', 'Player C', 'Player D', 'Player E', 'Player F'];

  return positions.map((pos, i) => {
    const lastTenGames: PlayerPerformance[] = Array.from({ length: 10 }).map((_, j) => ({
      matchDate: `${10 - j} rodada atrás`,
      minutesPlayed: Math.floor(Math.random() * 30) + 60,
      rating: parseFloat((Math.random() * 3 + 6).toFixed(1)),
      goals: Math.random() > 0.85 ? 1 : 0,
      assists: Math.random() > 0.90 ? 1 : 0,
      shots: pos === 'FW' ? Math.floor(Math.random() * 5) : pos === 'MF' ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * 2),
      tackles: pos === 'DF' ? Math.floor(Math.random() * 6) : pos === 'MF' ? Math.floor(Math.random() * 4) : Math.floor(Math.random() * 2),
      saves: pos === 'GK' ? Math.floor(Math.random() * 7) : 0,
      fouls: Math.floor(Math.random() * 4),
      yellowCards: Math.random() > 0.8 ? 1 : 0
    }));

    return {
      id: `${teamName}-${i}`,
      name: names[i] || `Atleta ${i}`,
      position: pos,
      number: Math.floor(Math.random() * 99) + 1,
      lastTenGames
    };
  });
};

const INITIAL_MATCHES: Match[] = [
  {
    id: 'm1',
    league: 'Premier League',
    minute: 74,
    status: 'LIVE',
    homeTeam: { 
      name: 'Manchester City', score: 1, possession: 64, shotsOnTarget: 8, shotsOffTarget: 5, corners: 11, yellowCards: 1, redCards: 0, dangerousAttacks: 112, attacks: 145,
      players: generateMockPlayers('Manchester City')
    },
    awayTeam: { 
      name: 'Liverpool', score: 1, possession: 36, shotsOnTarget: 3, shotsOffTarget: 2, corners: 4, yellowCards: 3, redCards: 0, dangerousAttacks: 45, attacks: 88,
      players: generateMockPlayers('Liverpool')
    },
    preMatch: {
      homeForm: ['W', 'W', 'W', 'D', 'W'],
      awayForm: ['W', 'D', 'W', 'W', 'L'],
      leaguePosition: { home: 1, away: 2 },
      h2h: { homeWins: 12, draws: 8, awayWins: 10 },
      avgGoals: { home: 2.8, away: 2.4 },
      avgCorners: { home: 7.2, away: 6.5 },
      homeHistory: { overall: generateMockHistory('Manchester City', false), specific: generateMockHistory('Manchester City', true) },
      awayHistory: { overall: generateMockHistory('Liverpool', false), specific: generateMockHistory('Liverpool', true) }
    }
  },
  {
    id: 'm2',
    league: 'La Liga',
    minute: 42,
    status: 'LIVE',
    homeTeam: { 
      name: 'Real Madrid', score: 0, possession: 52, shotsOnTarget: 4, shotsOffTarget: 3, corners: 6, yellowCards: 0, redCards: 0, dangerousAttacks: 65, attacks: 92,
      players: generateMockPlayers('Real Madrid')
    },
    awayTeam: { 
      name: 'Barcelona', score: 0, possession: 48, shotsOnTarget: 5, shotsOffTarget: 1, corners: 3, yellowCards: 2, redCards: 0, dangerousAttacks: 58, attacks: 85,
      players: generateMockPlayers('Barcelona')
    },
    preMatch: {
      homeForm: ['W', 'D', 'W', 'W', 'W'],
      awayForm: ['L', 'W', 'W', 'D', 'W'],
      leaguePosition: { home: 1, away: 3 },
      h2h: { homeWins: 15, draws: 5, awayWins: 14 },
      avgGoals: { home: 2.1, away: 1.9 },
      avgCorners: { home: 5.8, away: 5.2 },
      homeHistory: { overall: generateMockHistory('Real Madrid', false), specific: generateMockHistory('Real Madrid', true) },
      awayHistory: { overall: generateMockHistory('Barcelona', false), specific: generateMockHistory('Barcelona', true) }
    }
  },
  {
    id: 'm3',
    league: 'Bundesliga',
    minute: 0,
    status: 'SCHEDULED',
    scheduledTime: '15:30',
    homeTeam: { 
      name: 'Bayern Munich', score: 0, possession: 0, shotsOnTarget: 0, shotsOffTarget: 0, corners: 0, yellowCards: 0, redCards: 0, dangerousAttacks: 0, attacks: 0,
      players: generateMockPlayers('Bayern Munich')
    },
    awayTeam: { 
      name: 'Dortmund', score: 0, possession: 0, shotsOnTarget: 0, shotsOffTarget: 0, corners: 0, yellowCards: 0, redCards: 0, dangerousAttacks: 0, attacks: 0,
      players: generateMockPlayers('Dortmund')
    },
    preMatch: {
      homeForm: ['W', 'W', 'L', 'W', 'D'],
      awayForm: ['D', 'W', 'W', 'W', 'W'],
      leaguePosition: { home: 1, away: 2 },
      h2h: { homeWins: 18, draws: 4, awayWins: 8 },
      avgGoals: { home: 3.1, away: 2.2 },
      avgCorners: { home: 8.1, away: 5.4 },
      homeHistory: { overall: generateMockHistory('Bayern Munich', false), specific: generateMockHistory('Bayern Munich', true) },
      awayHistory: { overall: generateMockHistory('Dortmund', false), specific: generateMockHistory('Dortmund', true) }
    }
  }
];

const TopStatsHeader: React.FC<{ signals: BettingSignal[]; isOnline: boolean; lastSync: Date | null }> = ({ signals, isOnline, lastSync }) => {
  const stats = useMemo(() => {
    const resolved = signals.filter(s => s.status !== 'PENDING');
    const wins = resolved.filter(s => s.status === 'WIN').length;
    const rate = resolved.length > 0 ? (wins / resolved.length) * 100 : 0;
    const avgOdd = resolved.length > 0 ? resolved.reduce((acc, s) => acc + s.oddSuggested, 0) / resolved.length : 0;

    return { wins, rate, avgOdd };
  }, [signals]);

  return (
    <div className="space-y-4 mb-8">
      {/* Barra de Status de Sincronização */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/40 rounded-xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
            isOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            {isOnline ? <Wifi size={12} className="animate-pulse" /> : <WifiOff size={12} />}
            {isOnline ? 'Conectado' : 'Offline'}
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <RefreshCw size={12} className={isOnline ? 'animate-spin-slow' : ''} />
            Auto-Sync: {lastSync ? lastSync.toLocaleTimeString('pt-BR') : 'Aguardando...'}
          </div>
        </div>
        <div className="hidden md:block text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
          BetSignal Live Sync Engine v2.5
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-2xl border-l-4 border-emerald-500 flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Greens Hoje</div>
            <div className="text-xl font-black text-white">{stats.wins}</div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border-l-4 border-blue-500 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
            <Target size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Assertividade</div>
            <div className="text-xl font-black text-white">{stats.rate.toFixed(0)}%</div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border-l-4 border-amber-500 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Odd Média</div>
            <div className="text-xl font-black text-white">@{stats.avgOdd > 0 ? stats.avgOdd.toFixed(2) : '1.85'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [globalLiveSignals, setGlobalLiveSignals] = useState<BettingSignal[]>([]);
  const [allSignalsHistory, setAllSignalsHistory] = useState<BettingSignal[]>(() => {
    return JSON.parse(localStorage.getItem('betsignal_history') || '[]');
  });
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [readyTickets, setReadyTickets] = useState<ReadyTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  
  // Estados de Conectividade e Sync
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<Date | null>(new Date());

  const matchesRef = useRef(matches);
  matchesRef.current = matches;

  // Monitoramento de Conexão Internet
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Ao voltar a ficar online, forçamos um refresh dos sinais
      triggerSignalSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('betsignal_history', JSON.stringify(allSignalsHistory));
  }, [allSignalsHistory]);

  // Simulador de Atualização de Partidas (Stats e Minutos)
  useEffect(() => {
    const interval = setInterval(() => {
      // Só atualizamos se estivermos "online" (simulação lógica)
      if (!isOnline) return;

      setMatches(prev => prev.map(m => {
        if (m.status === 'SCHEDULED' || m.minute >= 90) return m;
        return {
          ...m,
          minute: m.minute + (Math.random() > 0.8 ? 1 : 0),
          homeTeam: {
            ...m.homeTeam,
            score: Math.random() > 0.98 ? m.homeTeam.score + 1 : m.homeTeam.score,
            dangerousAttacks: m.homeTeam.dangerousAttacks + Math.floor(Math.random() * 2),
            shotsOnTarget: Math.random() > 0.96 ? m.homeTeam.shotsOnTarget + 1 : m.homeTeam.shotsOnTarget
          },
          awayTeam: {
            ...m.awayTeam,
            score: Math.random() > 0.99 ? m.awayTeam.score + 1 : m.awayTeam.score,
            dangerousAttacks: m.awayTeam.dangerousAttacks + Math.floor(Math.random() * 2),
            shotsOnTarget: Math.random() > 0.98 ? m.awayTeam.shotsOnTarget + 1 : m.awayTeam.shotsOnTarget
          }
        };
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Função centralizada para sincronização de sinais IA
  const triggerSignalSync = async () => {
    if (!navigator.onLine) return;

    const activeMatches = matchesRef.current.filter(m => m.status === 'LIVE' && m.minute < 90);
    if (activeMatches.length === 0) return;
    
    const batch = activeMatches.sort(() => 0.5 - Math.random()).slice(0, 2);

    try {
      const result = await generateBettingSignals(batch);
      if (result && result.length > 0) {
        const newSignalsWithMeta = result.map(s => {
          const match = batch.find(m => m.id === s.matchId);
          return {
            ...s,
            status: 'PENDING',
            fullTimestamp: Date.now(),
            matchName: match ? `${match.homeTeam.name} vs ${match.awayTeam.name}` : 'Partida Desconhecida',
            leagueName: match ? match.league : 'Liga',
            minute: match ? match.minute : 0
          } as BettingSignal;
        });
        
        setGlobalLiveSignals(prev => [...newSignalsWithMeta, ...prev].slice(0, 30));
        setAllSignalsHistory(prev => [...newSignalsWithMeta, ...prev]);
        setLastSyncTimestamp(new Date());
      }
    } catch (err) {
      console.warn("[App Sync] Falha na sincronização de sinais:", err);
    }
  };

  // Ciclo de Polling de Sinais de IA
  useEffect(() => {
    const signalGenerator = setInterval(() => {
      if (isOnline) {
        triggerSignalSync();
      }
    }, 45000);
    return () => clearInterval(signalGenerator);
  }, [isOnline]);

  const toggleSaveSignal = (signal: BettingSignal) => {
    const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`;
    const currentSaved = JSON.parse(localStorage.getItem('saved_bet_signals') || '[]');
    if (savedIds.includes(signalId)) {
      const filtered = currentSaved.filter((s: any) => `${s.matchId}-${s.type}-${s.timestamp}` !== signalId);
      localStorage.setItem('saved_bet_signals', JSON.stringify(filtered));
      setSavedIds(prev => prev.filter(id => id !== signalId));
    } else {
      const updated = [signal, ...currentSaved];
      localStorage.setItem('saved_bet_signals', JSON.stringify(updated));
      setSavedIds(prev => [signalId, ...prev]);
    }
  };

  const filteredMatches = useMemo(() => matches.filter(match => {
    if (match.status !== 'LIVE') return false;
    return match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) || match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase());
  }), [matches, searchQuery]);

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64">
      {/* Sidebar Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-card lg:h-screen lg:w-64 lg:right-auto z-50 flex lg:flex-col items-center justify-around lg:justify-start lg:p-6 lg:gap-8 border-t lg:border-t-0 lg:border-r border-white/5">
        <div className="hidden lg:flex flex-col items-center gap-1 mb-10 w-full">
          <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
            <Zap className="text-slate-950 fill-slate-950" size={32} />
          </div>
          <span className="text-xl font-black tracking-tighter">BETSIGNAL <span className="text-emerald-400">PRO</span></span>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 mt-2">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
              {isOnline ? 'IA Core Online' : 'Core Offline'}
            </span>
          </div>
        </div>
        
        <div className="flex lg:flex-col w-full gap-2 lg:gap-3 justify-around lg:justify-start px-2 lg:px-0">
          <NavItem icon={<LayoutDashboard />} label="Jogos" active={viewMode === ViewMode.DASHBOARD} onClick={() => setViewMode(ViewMode.DASHBOARD)} />
          <NavItem icon={<Calendar />} label="Pré-Jogo" active={viewMode === ViewMode.PRE_MATCH} onClick={() => setViewMode(ViewMode.PRE_MATCH)} />
          <NavItem icon={<Radio />} label="Ao Vivo" active={viewMode === ViewMode.LIVE_SIGNALS} onClick={() => setViewMode(ViewMode.LIVE_SIGNALS)} badge={globalLiveSignals.length > 0 ? globalLiveSignals.length : undefined} />
          <NavItem icon={<History />} label="Histórico" active={viewMode === ViewMode.HISTORY} onClick={() => setViewMode(ViewMode.HISTORY)} />
          <NavItem icon={<PieChart />} label="Stats" active={viewMode === ViewMode.STATS} onClick={() => setViewMode(ViewMode.STATS)} />
          <NavItem icon={<Ticket />} label="Bilhetes" active={viewMode === ViewMode.TICKETS} onClick={() => setViewMode(ViewMode.TICKETS)} />
          <NavItem icon={<Bell />} label="Salvos" active={viewMode === ViewMode.SIGNALS} onClick={() => setViewMode(ViewMode.SIGNALS)} />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-4 lg:p-10">
        <TopStatsHeader signals={allSignalsHistory} isOnline={isOnline} lastSync={lastSyncTimestamp} />

        {viewMode === ViewMode.DASHBOARD && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div><h1 className="text-3xl font-black mb-1">Live Dashboard</h1><p className="text-slate-400 text-sm">IA monitorando estatísticas de campo em tempo real.</p></div>
              <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white" /></div>
            </div>
            
            {!isOnline && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                 <div className="flex items-center gap-3 text-rose-400">
                    <WifiOff size={20} />
                    <div>
                       <p className="text-xs font-black uppercase tracking-widest">Sem Conexão com a Internet</p>
                       <p className="text-[10px] opacity-70">Os dados ao vivo estão pausados até que a rede seja restabelecida.</p>
                    </div>
                 </div>
                 <button onClick={() => window.location.reload()} className="p-2 bg-rose-500/20 rounded-lg text-rose-400 hover:bg-rose-500/30 transition-all">
                    <RefreshCw size={16} />
                 </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMatches.map(match => (<MatchCard key={match.id} match={match} onClick={(m) => { setSelectedMatch(m); setViewMode(ViewMode.DETAILS); }} />))}
            </div>
          </div>
        )}

        {viewMode === ViewMode.PRE_MATCH && (<PreMatchView matches={matches.filter(m => m.status === 'SCHEDULED')} onSelectMatch={(m) => { setSelectedMatch(m); setViewMode(ViewMode.DETAILS); }} />)}
        {viewMode === ViewMode.LIVE_SIGNALS && (<LiveSignalsFeed signals={globalLiveSignals} onSave={toggleSaveSignal} savedIds={savedIds} />)}
        {viewMode === ViewMode.HISTORY && (<HistoryView signals={allSignalsHistory} />)}
        {viewMode === ViewMode.STATS && (<StatsView signals={allSignalsHistory} />)}
        {viewMode === ViewMode.TICKETS && (<ReadyTicketsFeed tickets={readyTickets} isLoading={isLoadingTickets} onGenerate={async () => {
          setIsLoadingTickets(true);
          try {
            const active = matches.filter(m => m.status === 'LIVE');
            const result = await generateReadyTickets(active);
            setReadyTickets(result);
          } catch (e) { setTicketError("Erro na IA."); }
          finally { setIsLoadingTickets(false); }
        }} error={ticketError} />)}
        {viewMode === ViewMode.DETAILS && selectedMatch && (<MatchDetail match={selectedMatch} onBack={() => setViewMode(selectedMatch.status === 'LIVE' ? ViewMode.DASHBOARD : ViewMode.PRE_MATCH)} />)}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick?: () => void; badge?: number; }> = ({ icon, label, active, onClick, badge }) => (
  <button onClick={onClick} className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-4 w-full lg:px-4 lg:py-3.5 rounded-2xl transition-all relative ${active ? 'text-emerald-400 lg:bg-emerald-500/10 lg:text-white lg:shadow-lg lg:shadow-emerald-500/5' : 'text-slate-500 hover:text-slate-300 lg:hover:bg-white/5'}`}>
    <span className={`${active ? 'scale-110 text-emerald-400' : ''} transition-transform`}>{icon}</span>
    <span className="text-[10px] lg:text-[13px] font-black uppercase tracking-widest">{label}</span>
    {badge && !active && (<span className="absolute top-1 right-1 lg:right-4 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-900 animate-bounce">{badge > 9 ? '9+' : badge}</span>)}
  </button>
);

export default App;
