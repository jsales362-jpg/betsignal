
import React, { useState, useEffect, useMemo } from 'react';
import { Match, BettingSignal, Player, HistoricalMatchStats, PlayerPerformance } from '../types';
import { generateBettingSignals } from '../services/geminiService';
import { ArrowLeft, BarChart3, Target, Zap, TrendingUp, AlertCircle, Loader2, TrendingDown, Bookmark, BookmarkCheck, CheckCircle2, Activity, Clock, History, Trophy, Users, User, ShieldAlert, Crosshair, Swords, Ghost, Info, PieChart as PieChartIcon, Shield, ChevronRight, Flame, Snowflake, Thermometer, Calendar, Swords as SwordsIcon, Percent } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Legend, PieChart, Pie, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

interface MatchDetailProps {
  match: Match;
  onBack: () => void;
}

const StatComparisonRow: React.FC<{ label: string; home: number; away: number; unit?: string }> = ({ label, home, away, unit = '' }) => {
  const total = home + away || 1;
  const homePct = (home / total) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter mb-1 px-1">
        <span className="text-emerald-400">{home.toFixed(1)}{unit}</span>
        <span className="text-slate-500">{label}</span>
        <span className="text-blue-400">{away.toFixed(1)}{unit}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
        <div className="h-full bg-emerald-500" style={{ width: `${homePct}%` }}></div>
        <div className="h-full bg-blue-500" style={{ width: `${100 - homePct}%` }}></div>
      </div>
    </div>
  );
};

const HistoryTable: React.FC<{ data: HistoricalMatchStats[]; color: string }> = ({ data, color }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-left text-[10px] border-separate border-spacing-y-2">
      <thead className="text-slate-500 font-black uppercase tracking-widest">
        <tr>
          <th className="pb-1 pl-2">Data</th>
          <th className="pb-1">Oponente</th>
          <th className="pb-1 text-center">Placar</th>
          <th className="pb-1 text-center">Cant</th>
          <th className="pb-1 text-center">Fin</th>
          <th className="pb-1 text-center">Cart</th>
        </tr>
      </thead>
      <tbody>
        {data.map((match, i) => (
          <tr key={i} className="bg-slate-900/40 rounded-lg group hover:bg-slate-800 transition-colors">
            <td className="py-2 pl-2 text-slate-400 rounded-l-lg">{match.date}</td>
            <td className="py-2 text-white font-bold">{match.opponent} <span className="text-[8px] text-slate-500">{match.isHome ? '(C)' : '(F)'}</span></td>
            <td className="py-2 text-center">
              <span className={`px-2 py-0.5 rounded font-black ${match.result === 'W' ? 'bg-emerald-500/20 text-emerald-400' : match.result === 'D' ? 'bg-slate-500/20 text-slate-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {match.score}
              </span>
            </td>
            <td className="py-2 text-center text-slate-300">{match.corners}</td>
            <td className="py-2 text-center text-slate-300">{match.shots}</td>
            <td className="py-2 text-center rounded-r-lg">
              <div className="flex justify-center gap-1">
                <div className="w-2 h-3 bg-yellow-500 rounded-sm"></div>
                <span className="text-slate-400">{match.yellowCards}</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PlayerCard: React.FC<{ player: Player; color: string }> = ({ player, color }) => {
  const [expanded, setExpanded] = useState(false);
  
  const totals = useMemo(() => player.lastTenGames.reduce((acc, game) => ({
    goals: acc.goals + game.goals, 
    assists: acc.assists + game.assists, 
    shots: acc.shots + game.shots, 
    tackles: acc.tackles + game.tackles, 
    saves: acc.saves + game.saves, 
    fouls: acc.fouls + game.fouls, 
    yellowCards: acc.yellowCards + game.yellowCards, 
    minutes: acc.minutes + game.minutesPlayed
  }), { goals: 0, assists: 0, shots: 0, tackles: 0, saves: 0, fouls: 0, yellowCards: 0, minutes: 0 }), [player]);

  const getPosStyle = (pos: string) => {
    switch(pos) {
      case 'FW': return 'border-rose-500/30 text-rose-400 bg-rose-500/5 shadow-[0_0_10px_rgba(244,63,94,0.1)]';
      case 'MF': return 'border-blue-500/30 text-blue-400 bg-blue-500/5 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'DF': return 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      default: return 'border-amber-500/30 text-amber-400 bg-amber-500/5 shadow-[0_0_10px_rgba(245,158,11,0.1)]';
    }
  };

  return (
    <div className={`glass-card rounded-xl border border-white/5 overflow-hidden transition-all ${expanded ? 'col-span-full' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-black" style={{ color }}>
            {player.number}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-sm font-bold text-white leading-none">{player.name}</h4>
              <span className={`text-[8px] px-1.5 py-0.5 rounded font-black border uppercase tracking-wider ${getPosStyle(player.position)}`}>
                {player.position}
              </span>
            </div>
            <span className="text-[9px] text-slate-500 font-medium">ID: {player.id.substring(0, 8)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-black">Média</div>
            <div className="text-sm font-black text-emerald-400">
              {(player.lastTenGames.reduce((acc, g) => acc + g.rating, 0) / 10).toFixed(1)}
            </div>
          </div>
          <div className={`transition-transform text-slate-600 ${expanded ? 'rotate-180' : ''}`}>
            <Users size={16} />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="p-5 border-t border-white/5 bg-slate-900/40 space-y-8 animate-in fade-in slide-in-from-top-2 duration-300">
          <div>
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <BarChart3 size={14} /> Estatísticas Acumuladas (10 Jogos)
            </h5>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatBox label="Finalizações" value={totals.shots} icon={<Crosshair size={14} />} />
              <StatBox label="Desarmes" value={totals.tackles} icon={<Swords size={14} />} />
              {player.position === 'GK' && <StatBox label="Defesas" value={totals.saves} icon={<ShieldAlert size={14} />} />}
              <StatBox label="Gols" value={totals.goals} icon={<Trophy size={14} />} />
              <StatBox label="Faltas" value={totals.fouls} icon={<Ghost size={14} />} />
              <StatBox label="Amarelos" value={totals.yellowCards} icon={<Info size={14} />} />
            </div>
          </div>

          <div>
            <h5 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar size={14} /> Detalhamento Últimas 10 Partidas
            </h5>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[10px] border-separate border-spacing-y-2">
                <thead className="text-slate-500 font-black uppercase tracking-widest">
                  <tr>
                    <th className="pb-1 pl-2">Partida</th>
                    <th className="pb-1 text-center">Min</th>
                    <th className="pb-1 text-center">Nota</th>
                    <th className="pb-1 text-center">Gols</th>
                    <th className="pb-1 text-center">Assis</th>
                    <th className="pb-1 text-center">Fin</th>
                    <th className="pb-1 text-center">Des</th>
                    {player.position === 'GK' && <th className="pb-1 text-center">Def</th>}
                    <th className="pb-1 text-center">Faltas</th>
                    <th className="pb-1 text-center">Cart</th>
                  </tr>
                </thead>
                <tbody>
                  {player.lastTenGames.map((perf, i) => (
                    <tr key={i} className="bg-slate-900/60 rounded-lg hover:bg-slate-800 transition-colors">
                      <td className="py-2 pl-2 text-slate-300 font-bold rounded-l-lg">{perf.matchDate}</td>
                      <td className="py-2 text-center text-slate-400">{perf.minutesPlayed}'</td>
                      <td className="py-2 text-center">
                        <span className={`font-black ${perf.rating >= 7.5 ? 'text-emerald-400' : perf.rating >= 6.5 ? 'text-blue-400' : 'text-slate-400'}`}>
                          {perf.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2 text-center font-bold text-white">{perf.goals}</td>
                      <td className="py-2 text-center text-slate-300">{perf.assists}</td>
                      <td className="py-2 text-center text-slate-300">{perf.shots}</td>
                      <td className="py-2 text-center text-slate-300">{perf.tackles}</td>
                      {player.position === 'GK' && <td className="py-2 text-center text-emerald-400 font-bold">{perf.saves}</td>}
                      <td className="py-2 text-center text-rose-400/70">{perf.fouls}</td>
                      <td className="py-2 text-center rounded-r-lg">
                        {perf.yellowCards > 0 && <div className="w-2 h-3 bg-yellow-500 rounded-sm mx-auto shadow-[0_0_5px_rgba(234,179,8,0.5)]"></div>}
                        {perf.yellowCards === 0 && <span className="text-slate-600">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatBox: React.FC<{ label: string; value: number; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-800/30 border border-white/5 p-3 rounded-xl flex flex-col gap-1 items-center text-center">
    <div className="text-slate-500 mb-1">{icon}</div>
    <div className="text-xl font-black text-white">{value}</div>
    <div className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">{label}</div>
  </div>
);

const MatchDetail: React.FC<MatchDetailProps> = ({ match, onBack }) => {
  const [activeTab, setActiveTab] = useState<'LIVE' | 'PRE' | 'PLAYERS'>(() => 
    match.status === 'SCHEDULED' ? 'PRE' : 'LIVE'
  );
  const [historyFilter, setHistoryFilter] = useState<'OVERALL' | 'SPECIFIC'>('OVERALL');
  const [signals, setSignals] = useState<BettingSignal[]>([]);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const h2h = match.preMatch?.h2h || { homeWins: 0, draws: 0, awayWins: 0 };
  const h2hTotal = h2h.homeWins + h2h.draws + h2h.awayWins || 1;
  const homeWinProb = Math.round((h2h.homeWins / h2hTotal) * 100);
  const drawProb = Math.round((h2h.draws / h2hTotal) * 100);
  const awayWinProb = 100 - homeWinProb - drawProb;

  const possessionData = useMemo(() => [{ name: match.homeTeam.name, value: match.homeTeam.possession, fill: '#10b981' }, { name: match.awayTeam.name, value: match.awayTeam.possession, fill: '#3b82f6' }], [match.homeTeam.possession, match.awayTeam.possession]);
  
  const intensityHistory = useMemo(() => {
    if (match.status === 'SCHEDULED') return [];
    const intervals = Math.ceil(match.minute / 5);
    const data = [];
    const totalDA = match.homeTeam.dangerousAttacks + match.awayTeam.dangerousAttacks;
    const avgDA = totalDA / Math.max(1, intervals);

    for (let i = 1; i <= intervals; i++) {
      const minuteLabel = `${(i - 1) * 5}-${i * 5}'`;
      const variance = (Math.random() * 0.8 + 0.6);
      const intensity = Math.min(100, (avgDA * variance * 10));
      data.push({
        time: minuteLabel,
        intensity: parseFloat(intensity.toFixed(1)),
        homeDA: Math.floor((match.homeTeam.dangerousAttacks / Math.max(1, intervals)) * variance),
        awayDA: Math.floor((match.awayTeam.dangerousAttacks / Math.max(1, intervals)) * variance)
      });
    }
    return data;
  }, [match]);

  const currentIntensity = intensityHistory.length > 0 ? intensityHistory[intensityHistory.length - 1].intensity : 0;

  const thermalData = useMemo(() => {
    const score = currentIntensity;
    if (score > 80) return { score, label: 'SUPER QUENTE', color: 'text-orange-500', icon: <Flame className="animate-bounce" /> };
    if (score > 60) return { score, label: 'QUENTE', color: 'text-amber-500', icon: <Flame /> };
    if (score > 35) return { score, label: 'MORNO', color: 'text-slate-400', icon: <Thermometer /> };
    return { score, label: 'FRIO', color: 'text-blue-400', icon: <Snowflake /> };
  }, [currentIntensity]);

  const radarData = useMemo(() => [
    { subject: 'Posse', A: match.homeTeam.possession, B: match.awayTeam.possession },
    { subject: 'Finaliz.', A: (match.homeTeam.shotsOnTarget + match.homeTeam.shotsOffTarget) * 5, B: (match.awayTeam.shotsOnTarget + match.awayTeam.shotsOffTarget) * 5 },
    { subject: 'No Alvo', A: match.homeTeam.shotsOnTarget * 10, B: match.awayTeam.shotsOnTarget * 10 },
    { subject: 'Cantos', A: match.homeTeam.corners * 6, B: match.awayTeam.corners * 6 },
    { subject: 'Pressão', A: (match.homeTeam.dangerousAttacks / Math.max(1, match.minute || 1)) * 40, B: (match.awayTeam.dangerousAttacks / Math.max(1, match.minute || 1)) * 40 },
  ], [match]);

  const historyToDisplayHome = historyFilter === 'OVERALL' ? match.preMatch?.homeHistory?.overall : match.preMatch?.homeHistory?.specific;
  const historyToDisplayAway = historyFilter === 'OVERALL' ? match.preMatch?.awayHistory?.overall : match.preMatch?.awayHistory?.specific;

  const historyAverages = useMemo(() => {
    const calc = (data: HistoricalMatchStats[] = []) => {
      const l = data.length || 1;
      return {
        goals: data.reduce((a, b) => a + b.goalsFor, 0) / l,
        ga: data.reduce((a, b) => a + b.goalsAgainst, 0) / l,
        corners: data.reduce((a, b) => a + b.corners, 0) / l,
        shots: data.reduce((a, b) => a + b.shots, 0) / l,
        fouls: data.reduce((a, b) => a + b.fouls, 0) / l,
        offsides: data.reduce((a, b) => a + b.offsides, 0) / l,
        cards: data.reduce((a, b) => a + b.yellowCards, 0) / l,
      };
    };
    return { home: calc(historyToDisplayHome), away: calc(historyToDisplayAway) };
  }, [historyToDisplayHome, historyToDisplayAway]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('saved_bet_signals') || '[]');
    setSavedIds(saved.map((s: any) => `${s.matchId}-${s.type}-${s.timestamp}`));
  }, []);

  const fetchSignals = async () => {
    if (match.status !== 'LIVE') return;
    setLoadingSignals(true);
    const result = await generateBettingSignals([match]);
    setSignals(result);
    setLoadingSignals(false);
  };

  useEffect(() => {
    fetchSignals();
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, [match.id]);

  const toggleSaveSignal = (signal: BettingSignal) => {
    const signalId = `${signal.matchId}-${signal.type}-${signal.timestamp}`;
    const currentSaved = JSON.parse(localStorage.getItem('saved_bet_signals') || '[]');
    if (savedIds.includes(signalId)) {
      const filtered = currentSaved.filter((s: any) => `${s.matchId}-${s.type}-${s.timestamp}` !== signalId);
      localStorage.setItem('saved_bet_signals', JSON.stringify(filtered));
      setSavedIds(prev => prev.filter(id => id !== signalId));
    } else {
      const updated = [{ ...signal, homeTeamName: match.homeTeam.name, awayTeamName: match.awayTeam.name, league: match.league }, ...currentSaved];
      localStorage.setItem('saved_bet_signals', JSON.stringify(updated));
      setSavedIds(prev => [signalId, ...prev]);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-10 duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors active:scale-95"><ArrowLeft size={20} /> Voltar</button>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-white/10">
          {match.status === 'LIVE' && (
            <button onClick={() => setActiveTab('LIVE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'LIVE' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}><Activity size={14} /> AO VIVO</button>
          )}
          <button onClick={() => setActiveTab('PRE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'PRE' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}><History size={14} /> PRÉ-JOGO</button>
          <button onClick={() => setActiveTab('PLAYERS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'PLAYERS' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400'}`}><User size={14} /> JOGADORES</button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl mb-6 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-4">
          {match.status === 'LIVE' ? (
            <span className="text-emerald-400 font-mono text-xl font-bold">{match.minute}'</span>
          ) : (
            <div className="flex flex-col items-end">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">INÍCIO ÀS</span>
               <span className="text-white font-mono text-xl font-bold">{match.scheduledTime}</span>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center max-w-lg mx-auto relative z-10">
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/10">
              <span className="text-xl font-black text-white">{match.homeTeam.name.substring(0, 3).toUpperCase()}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-300 uppercase truncate">{match.homeTeam.name}</h2>
            {match.status === 'LIVE' && <div className="text-4xl font-black text-white mt-1">{match.homeTeam.score}</div>}
          </div>
          <div className="px-8 text-2xl font-black text-slate-600">VS</div>
          <div className="text-center flex-1">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/10">
              <span className="text-xl font-black text-white">{match.awayTeam.name.substring(0, 3).toUpperCase()}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-300 uppercase truncate">{match.awayTeam.name}</h2>
            {match.status === 'LIVE' && <div className="text-4xl font-black text-white mt-1">{match.awayTeam.score}</div>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'LIVE' && match.status === 'LIVE' && (
            <>
              <div className="glass-card p-6 rounded-2xl border border-white/5 overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" /> HeatSense™ Intensidade da Partida
                  </h3>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 ${thermalData.color} text-[10px] font-black`}>
                    {thermalData.icon} {thermalData.label}
                  </div>
                </div>
                
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={intensityHistory}>
                      <defs>
                        <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis 
                        dataKey="time" 
                        tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid rgba(255,255,255,0.1)', 
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="intensity" 
                        name="Intensidade %"
                        stroke="#f97316" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorIntensity)" 
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex justify-between mt-4 text-[8px] font-black text-slate-600 uppercase tracking-widest border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span>{match.homeTeam.name}: {match.homeTeam.dangerousAttacks} Atq. Perigosos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>{match.awayTeam.name}: {match.awayTeam.dangerousAttacks} Atq. Perigosos</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-white/5 relative">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><PieChartIcon size={16} className="text-emerald-400" /> Posse de Bola</h3>
                  <div className="h-[200px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={possessionData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">{possessionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"><span className="text-xs text-slate-500 font-bold">POSSE</span><span className="text-2xl font-black text-white">100%</span></div>
                  </div>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-white/5">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Activity size={16} className="text-emerald-400" /> Radar de Performance</h3>
                   <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid stroke="#ffffff10" /><PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} /><Radar name="Casa" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} /><Radar name="Visitante" dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} /><Tooltip /><Legend /></RadarChart></ResponsiveContainer>
                   </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'PRE' && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-6">
              {/* Seção Head-to-Head Avançada */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                   <SwordsIcon size={120} />
                </div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <SwordsIcon size={16} className="text-amber-500" /> Domínio Histórico (H2H)
                  </h3>
                  <div className="bg-slate-900 px-3 py-1 rounded-full border border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Últimos {h2hTotal} Jogos
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                       <div className="text-center flex-1">
                          <div className="text-4xl font-black text-emerald-400">{h2h.homeWins}</div>
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Vitórias {match.homeTeam.name}</div>
                       </div>
                       <div className="text-center flex-1 border-x border-white/5">
                          <div className="text-3xl font-black text-slate-400">{h2h.draws}</div>
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Empates</div>
                       </div>
                       <div className="text-center flex-1">
                          <div className="text-4xl font-black text-blue-400">{h2h.awayWins}</div>
                          <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Vitórias {match.awayTeam.name}</div>
                       </div>
                    </div>
                    <div className="h-3 w-full bg-slate-800 rounded-full flex overflow-hidden ring-4 ring-slate-900/50">
                       <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(h2h.homeWins / h2hTotal) * 100}%` }}></div>
                       <div className="h-full bg-slate-500 transition-all duration-1000" style={{ width: `${(h2h.draws / h2hTotal) * 100}%` }}></div>
                       <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(h2h.awayWins / h2hTotal) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/5">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Percent size={14} className="text-emerald-400" /> Probabilidade Histórica
                    </h4>
                    <div className="space-y-3">
                       <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400">{match.homeTeam.name}</span>
                          <span className="text-emerald-400">{homeWinProb}%</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400">Empate</span>
                          <span className="text-slate-300">{drawProb}%</span>
                       </div>
                       <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-400">{match.awayTeam.name}</span>
                          <span className="text-blue-400">{awayWinProb}%</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-slate-500 italic bg-white/5 p-3 rounded-xl border border-white/5">
                   <Info size={14} className="shrink-0" />
                   <span>Análise de IA: {h2h.homeWins > h2h.awayWins ? `${match.homeTeam.name} demonstra dominância histórica com ${h2h.homeWins} vitórias. Tendência de mercado favorável ao time da casa.` : `${match.awayTeam.name} mantém vantagem no histórico direto. Atenção para surpresas do visitante.`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                 <h3 className="text-xl font-black text-white flex items-center gap-2"><Trophy className="text-yellow-500" /> Histórico Últimos 5 Jogos</h3>
                 <div className="flex bg-slate-900 p-1 rounded-lg border border-white/5">
                    <button onClick={() => setHistoryFilter('OVERALL')} className={`px-3 py-1 text-[9px] font-black rounded uppercase transition-all ${historyFilter === 'OVERALL' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Geral</button>
                    <button onClick={() => setHistoryFilter('SPECIFIC')} className={`px-3 py-1 text-[9px] font-black rounded uppercase transition-all ${historyFilter === 'SPECIFIC' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>Campo</button>
                 </div>
              </div>

              <div className="glass-card p-6 rounded-2xl border border-white/5">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-white/5 pb-2">Comparativo de Médias</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                   <StatComparisonRow label="Gols Marcados" home={historyAverages.home.goals} away={historyAverages.away.goals} />
                   <StatComparisonRow label="Gols Sofridos" home={historyAverages.home.ga} away={historyAverages.away.ga} />
                   <StatComparisonRow label="Escanteios" home={historyAverages.home.corners} away={historyAverages.away.corners} />
                   <StatComparisonRow label="Finalizações" home={historyAverages.home.shots} away={historyAverages.away.shots} />
                   <StatComparisonRow label="Faltas" home={historyAverages.home.fouls} away={historyAverages.away.fouls} />
                   <StatComparisonRow label="Impedimentos" home={historyAverages.home.offsides} away={historyAverages.away.offsides} />
                   <StatComparisonRow label="Cartões" home={historyAverages.home.cards} away={historyAverages.away.cards} />
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest"><Shield size={14} /> {match.homeTeam.name}</div>
                  <HistoryTable data={historyToDisplayHome || []} color="#10b981" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest"><Shield size={14} /> {match.awayTeam.name}</div>
                  <HistoryTable data={historyToDisplayAway || []} color="#3b82f6" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PLAYERS' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-5 duration-300">
              <div className="space-y-4"><h3 className="text-lg font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full"></span> {match.homeTeam.name}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{match.homeTeam.players?.map(player => <PlayerCard key={player.id} player={player} color="#10b981" />)}</div></div>
              <div className="space-y-4"><h3 className="text-lg font-black text-blue-400 uppercase tracking-widest flex items-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> {match.awayTeam.name}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{match.awayTeam.players?.map(player => <PlayerCard key={player.id} player={player} color="#3b82f6" />)}</div></div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 sticky top-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Zap className="text-yellow-400 fill-yellow-400" /> IA BetSignal
              </h3>
              {loadingSignals && <Loader2 className="animate-spin text-slate-400" size={18} />}
            </div>
            
            {match.status === 'LIVE' ? (
              <div className="space-y-4">
                {signals.length > 0 ? signals.map((signal, idx) => (
                  <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                     <div className="flex justify-between items-center mb-2"><span className="bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded text-slate-950 uppercase">{signal.type}</span><span className="text-emerald-400 font-bold text-sm">ODD @{signal.oddSuggested.toFixed(2)}</span></div>
                     <p className="text-sm font-black mb-2">{signal.description}</p>
                     <div className="flex items-center justify-between mt-4"><div className="flex items-center gap-2"><div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${signal.confidence * 100}%` }} ></div></div><span className="text-[9px] font-bold text-slate-500 uppercase">{Math.round(signal.confidence * 100)}%</span></div><button onClick={() => toggleSaveSignal(signal)} className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors active:scale-90">{savedIds.includes(`${signal.matchId}-${signal.type}-${signal.timestamp}`) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div>
                  </div>
                )) : (
                  <p className="text-xs text-slate-500 text-center py-4 italic">Nenhum sinal detectado até o momento...</p>
                )}
                <button onClick={fetchSignals} disabled={loadingSignals} className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"><Target size={18} /> RECALCULAR COM IA</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                   <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                     <TrendingUp size={12} /> Projeção de Especialista
                   </h4>
                   <p className="text-xs text-white font-bold mb-2">Vitória Casa ou Empate (1X)</p>
                   <p className="text-[10px] text-slate-400 leading-relaxed italic">
                     Baseado no histórico recente de {match.homeTeam.name} em casa e na dificuldade do {match.awayTeam.name} fora de seus domínios.
                   </p>
                </div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                   <p className="text-[9px] text-emerald-400 font-bold uppercase text-center">Aguardando Início para Sinais Live</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
