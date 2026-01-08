
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Match, ViewMode, BettingSignal, Player, PlayerPerformance, ReadyTicket, HistoricalMatchStats, TeamHistory } from './types';
import MatchCard from './components/MatchCard';
import MatchDetail from './components/MatchDetail';
import LiveSignalsFeed from './components/LiveSignalsFeed';
import ReadyTicketsFeed from './components/ReadyTicketsFeed';
import { generateBettingSignals, generateReadyTickets } from './services/geminiService';
import { LayoutDashboard, Bell, BarChart2, User, Globe, Search, RefreshCw, Zap, Filter, Trash2, Calendar, Shield, TrendingUp, Radio, Ticket, AlertCircle, Download } from 'lucide-react';

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
  }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.DASHBOARD);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [globalLiveSignals, setGlobalLiveSignals] = useState<BettingSignal[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedSignals, setSavedSignals] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [readyTickets, setReadyTickets] = useState<ReadyTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketError, setTicketError] = useState<string | null>(null);
  
  // PWA states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  const matchesRef = useRef(matches);
  matchesRef.current = matches;
  const isQuotaExceededRef = useRef(false);

  useEffect(() => {
    // Escuta pelo evento de instalação do PWA
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prev => prev.map(m => {
        if (m.minute >= 90) return m;
        const luckyHome = Math.random() > 0.95;
        const luckyAway = Math.random() > 0.97;
        return {
          ...m,
          minute: m.minute + (Math.random() > 0.7 ? 1 : 0),
          homeTeam: {
            ...m.homeTeam,
            score: luckyHome ? m.homeTeam.score + 1 : m.homeTeam.score,
            corners: Math.random() > 0.9 ? m.homeTeam.corners + 1 : m.homeTeam.corners,
            dangerousAttacks: m.homeTeam.dangerousAttacks + Math.floor(Math.random() * 2),
            shotsOnTarget: Math.random() > 0.95 ? m.homeTeam.shotsOnTarget + 1 : m.homeTeam.shotsOnTarget
          },
          awayTeam: {
            ...m.awayTeam,
            score: luckyAway ? m.awayTeam.score + 1 : m.awayTeam.score,
            corners: Math.random() > 0.92 ? m.awayTeam.corners + 1 : m.awayTeam.corners,
            dangerousAttacks: m.awayTeam.dangerousAttacks + Math.floor(Math.random() * 2),
            shotsOnTarget: Math.random() > 0.97 ? m.awayTeam.shotsOnTarget + 1 : m.awayTeam.shotsOnTarget
          }
        };
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const signalGenerator = setInterval(async () => {
      if (isQuotaExceededRef.current) {
        isQuotaExceededRef.current = false;
        return;
      }

      const activeMatches = matchesRef.current.filter(m => m.minute < 90);
      if (activeMatches.length === 0) return;
      const randomMatch = activeMatches[Math.floor(Math.random() * activeMatches.length)];
      
      const dpm = (randomMatch.homeTeam.dangerousAttacks + randomMatch.awayTeam.dangerousAttacks) / randomMatch.minute;
      if (dpm < 0.8) return;

      try {
        const result = await generateBettingSignals(randomMatch);
        if (result && result.length > 0) {
          const newSignalsWithMeta = result.map(s => ({
            ...s,
            matchName: `${randomMatch.homeTeam.name} vs ${randomMatch.awayTeam.name}`,
            leagueName: randomMatch.league,
            minute: randomMatch.minute
          }));
          setGlobalLiveSignals(prev => [...newSignalsWithMeta, ...prev].slice(0, 20));
        }
      } catch (err: any) { 
        if (err?.message?.includes('429')) {
          isQuotaExceededRef.current = true;
          console.warn("[App] Sinalizador pausado por excesso de cota.");
        }
        console.error(err); 
      }
    }, 50000);
    return () => clearInterval(signalGenerator);
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_bet_signals') || '[]');
    setSavedSignals(saved);
    setSavedIds(saved.map((s: any) => `${s.matchId}-${s.type}-${s.timestamp}`));
  }, [viewMode]);

  const toggleSaveSignal = (signal: BettingSignal) => {
    const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`;
    const currentSaved = JSON.parse(localStorage.getItem('saved_bet_signals') || '[]');
    if (savedIds.includes(signalId)) {
      const filtered = currentSaved.filter((s: any) => `${s.matchId}-${s.type}-${s.timestamp}` !== signalId);
      localStorage.setItem('saved_bet_signals', JSON.stringify(filtered));
      setSavedSignals(filtered);
      setSavedIds(prev => prev.filter(id => id !== signalId));
    } else {
      const signalToSave = { ...signal, homeTeamName: signal.matchName?.split(' vs ')[0] || '', awayTeamName: signal.matchName?.split(' vs ')[1] || '', league: signal.leagueName || '' };
      const updated = [signalToSave, ...currentSaved];
      localStorage.setItem('saved_bet_signals', JSON.stringify(updated));
      setSavedSignals(updated);
      setSavedIds(prev => [signalId, ...prev]);
    }
  };

  const removeSavedSignal = (signalId: string) => {
    const updated = savedSignals.filter(s => `${s.matchId}-${s.type}-${s.timestamp}` !== signalId);
    localStorage.setItem('saved_bet_signals', JSON.stringify(updated));
    setSavedSignals(updated);
    setSavedIds(prev => prev.filter(id => id !== signalId));
  };

  const handleFetchTickets = async () => {
    setIsLoadingTickets(true);
    setTicketError(null);
    try {
      const active = matches.filter(m => m.minute < 90);
      const result = await generateReadyTickets(active);
      setReadyTickets(result);
    } catch (err: any) { 
      console.error(err);
      if (err?.message?.includes('429')) {
        setTicketError("A IA atingiu o limite de consultas por minuto. Por favor, aguarde 30 segundos e tente novamente.");
      } else {
        setTicketError("Ocorreu um erro ao gerar os bilhetes. Tente novamente mais tarde.");
      }
    } finally { 
      setIsLoadingTickets(false); 
    }
  };

  const leagues = useMemo(() => Array.from(new Set(matches.map(m => m.league))).sort(), [matches]);
  const filteredMatches = useMemo(() => matches.filter(match => {
    const matchesLeague = !selectedLeague || match.league === selectedLeague;
    const matchesSearch = match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) || match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) || match.league.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLeague && matchesSearch;
  }), [matches, selectedLeague, searchQuery]);

  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-64">
      <nav className="fixed bottom-0 left-0 right-0 h-20 glass-card lg:h-screen lg:w-64 lg:right-auto z-50 flex lg:flex-col items-center justify-around lg:justify-start lg:p-6 lg:gap-8 border-t lg:border-t-0 lg:border-r border-white/10">
        <div className="hidden lg:flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="text-slate-950 fill-slate-950" size={24} />
          </div>
          <span className="text-xl font-black tracking-tighter">BETSIGNAL <span className="text-emerald-400">PRO</span></span>
        </div>
        
        <div className="flex lg:flex-col w-full gap-2 lg:gap-4 justify-around lg:justify-start px-2 lg:px-0">
          <NavItem icon={<LayoutDashboard />} label="Jogos" active={viewMode === ViewMode.DASHBOARD || viewMode === ViewMode.DETAILS} onClick={() => setViewMode(ViewMode.DASHBOARD)} />
          <NavItem icon={<Radio />} label="Sinais Live" active={viewMode === ViewMode.LIVE_SIGNALS} onClick={() => setViewMode(ViewMode.LIVE_SIGNALS)} badge={globalLiveSignals.length > 0 ? globalLiveSignals.length : undefined} />
          <NavItem icon={<Ticket />} label="Bilhetes IA" active={viewMode === ViewMode.TICKETS} onClick={() => setViewMode(ViewMode.TICKETS)} />
          <NavItem icon={<Bell />} label="Meus Sinais" active={viewMode === ViewMode.SIGNALS} onClick={() => setViewMode(ViewMode.SIGNALS)} />
        </div>

        {/* Botão de Instalação para PWA */}
        {showInstallBtn && (
          <div className="hidden lg:block mt-auto w-full pt-6 border-t border-white/10">
            <button 
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 animate-pulse hover:animate-none transition-all"
            >
              <Download size={18} /> BAIXAR APP PRO
            </button>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto p-4 lg:p-10">
        {viewMode === ViewMode.DASHBOARD && (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div><h1 className="text-3xl font-black mb-1">Jogos Ao Vivo</h1><p className="text-slate-400 text-sm">Monitorando {filteredMatches.length} eventos em tempo real com IA.</p></div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" placeholder="Buscar time ou liga..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all text-white" /></div>
                <button onClick={() => { setIsRefreshing(true); setTimeout(() => setIsRefreshing(false), 1000); }} className="p-2.5 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors"><RefreshCw className={`${isRefreshing ? 'animate-spin' : ''} text-emerald-400`} size={20} /></button>
              </div>
            </div>
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide"><div className="flex items-center gap-2"><div className="flex items-center gap-2 text-slate-400 mr-2 border-r border-white/10 pr-4"><Filter size={16} /><span className="text-xs font-bold uppercase tracking-wider">Ligas</span></div><button onClick={() => setSelectedLeague(null)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedLeague === null ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'glass-card border-white/10 text-slate-400 hover:border-emerald-500/30'}`}>Todas</button>{leagues.map(league => (<button key={league} onClick={() => setSelectedLeague(league)} className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-bold transition-all border ${selectedLeague === league ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'glass-card border-white/10 text-slate-400 hover:border-emerald-500/30'}`}>{league}</button>))}</div></div>
            {filteredMatches.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">{filteredMatches.map(match => (<MatchCard key={match.id} match={match} onClick={(m) => { setSelectedMatch(m); setViewMode(ViewMode.DETAILS); }} />))}</div>) : (<div className="text-center py-20 glass-card rounded-2xl border-dashed border-2 border-white/5"><Globe size={48} className="mx-auto mb-4 text-slate-700" /><h3 className="text-xl font-bold text-slate-300">Nenhum jogo encontrado</h3><p className="text-slate-500 mt-2">Tente mudar os filtros.</p></div>)}
          </div>
        )}
        {viewMode === ViewMode.LIVE_SIGNALS && (<div className="animate-in fade-in duration-500"><div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-black mb-1 flex items-center gap-3">Feed de Sinais <Radio className="text-rose-500 animate-pulse" size={24} /></h1><p className="text-slate-400 text-sm">Sinais gerados automaticamente.</p></div></div><LiveSignalsFeed signals={globalLiveSignals} onSave={toggleSaveSignal} savedIds={savedIds} /></div>)}
        {viewMode === ViewMode.TICKETS && (<ReadyTicketsFeed tickets={readyTickets} isLoading={isLoadingTickets} onGenerate={handleFetchTickets} error={ticketError} />)}
        {viewMode === ViewMode.DETAILS && selectedMatch && (<MatchDetail match={selectedMatch} onBack={() => setViewMode(ViewMode.DASHBOARD)} />)}
        {viewMode === ViewMode.SIGNALS && (<div className="animate-in fade-in zoom-in duration-300"><div className="flex items-center justify-between mb-8"><div><h1 className="text-3xl font-black mb-1">Meus Sinais</h1><p className="text-slate-400 text-sm">Sinais que você salvou.</p></div></div>{savedSignals.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{savedSignals.map((signal) => { const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`; return (<div key={signalId} className="glass-card p-5 rounded-2xl border-l-4 border-l-emerald-500 hover:bg-slate-800 transition-all relative group"><button onClick={() => removeSavedSignal(signalId)} className="absolute top-4 right-4 text-slate-600 hover:text-rose-500 transition-colors p-1"><Trash2 size={16} /></button><div className="mb-4"><h3 className="text-sm font-black text-white truncate">{signal.homeTeamName} vs {signal.awayTeamName}</h3><div className="flex items-center gap-2 mt-1"><span className="bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded text-slate-950 uppercase">{signal.type}</span></div></div><div className="bg-slate-950/40 p-3 rounded-xl mb-4 border border-white/5"><p className="text-xs text-slate-200 font-bold mb-1">{signal.description}</p></div><div className="flex items-center justify-between"><div className="flex items-center gap-1 text-emerald-400 font-black text-sm"><TrendingUp size={14} /><span>ODD @{signal.oddSuggested.toFixed(2)}</span></div></div></div>); })}</div>) : (<div className="text-center py-24 glass-card rounded-2xl border-dashed border-2 border-white/5"><Bell size={64} className="mx-auto mb-6 text-slate-700" /><h2 className="text-2xl font-bold mb-2 text-slate-300">Sem sinais salvos</h2></div>)}</div>)}
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick?: () => void; badge?: number; }> = ({ icon, label, active, onClick, badge }) => (<button onClick={onClick} className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-4 w-full lg:px-4 lg:py-3 rounded-xl transition-all relative ${active ? 'text-emerald-400 lg:bg-emerald-500/10 lg:text-white' : 'text-slate-500 hover:text-slate-300 lg:hover:bg-white/5'}`}><span className={`${active ? 'scale-110' : ''} transition-transform`}>{icon}</span><span className="text-[10px] lg:text-base font-medium lg:font-bold">{label}</span>{badge && !active && (<span className="absolute top-0 right-1 lg:right-4 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full border-2 border-slate-900 animate-bounce">{badge > 9 ? '9+' : badge}</span>)}</button>);

export default App;
