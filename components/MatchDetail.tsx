
import React, { useState, useEffect, useMemo } from 'react';
import { Match, BettingSignal, Player, HistoricalMatchStats, PlayerPerformance } from '../types';
import { generateBettingSignals } from '../services/geminiService';
import { ArrowLeft, BarChart3, Target, Zap, TrendingUp, AlertCircle, Loader2, TrendingDown, Bookmark, BookmarkCheck, CheckCircle2, Activity, Clock, History, Trophy, Users, User, ShieldAlert, Crosshair, Swords, Ghost, Info, PieChart as PieChartIcon, Shield, ChevronRight, Flame, Snowflake, Thermometer, Calendar } from 'lucide-react';
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

  return (
    <div className={`glass-card rounded-xl border border-white/5 overflow-hidden transition-all ${expanded ? 'col-span-full' : ''}`}>
      <button onClick={() => setExpanded(!expanded)} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 text-xs font-black" style={{ color }}>
            {player.number}
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white">{player.name}</h4>
            <span className="text-[10px] text-slate-500 uppercase font-black">{player.position}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-500 uppercase font-black">Média 10j</div>
            <div className="text-sm font-black text-emerald-400">
              {(player.lastTenGames.reduce((acc, g) => acc + g.rating, 0) / 10).toFixed(1)}
            </div>
          </div>
          <div className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <Users size={16} className="text-slate-600" />
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
  const [activeTab, setActiveTab] = useState<'LIVE' | 'PRE' | 'PLAYERS'>('LIVE');
  const [historyFilter, setHistoryFilter] = useState<'OVERALL' | 'SPECIFIC'>('OVERALL');
  const [signals, setSignals] = useState<BettingSignal[]>([]);
  const [loadingSignals, setLoadingSignals] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const possessionData = useMemo(() => [{ name: match.homeTeam.name, value: match.homeTeam.possession, fill: '#10b981' }, { name: match.awayTeam.name, value: match.awayTeam.possession, fill: '#3b82f6' }], [match.homeTeam.possession, match.awayTeam.possession]);
  
  const thermalData = useMemo(() => {
    const min = Math.max(1, match.minute);
    const dpm = (match.homeTeam.dangerousAttacks + match.awayTeam.dangerousAttacks) / min;
    const spm = (match.homeTeam.shotsOnTarget + match.homeTeam.shotsOffTarget + match.awayTeam.shotsOnTarget + match.awayTeam.shotsOffTarget) / min;
    const score = Math.min(100, (dpm * 35) + (spm * 15));
    
    if (score > 80) return { score, label: 'SUPER QUENTE', color: 'text-orange-500', icon: <Flame className="animate-bounce" /> };
    if (score > 60) return { score, label: 'QUENTE', color: 'text-amber-500', icon: <Flame /> };
    if (score > 35) return { score, label: 'MORNO', color: 'text-slate-400', icon: <Thermometer /> };
    return { score, label: 'FRIO', color: 'text-blue-400', icon: <Snowflake /> };
  }, [match]);

  const radarData = useMemo(() => [
    { subject: 'Posse', A: match.homeTeam.possession, B: match.awayTeam.possession },
    { subject: 'Finaliz.', A: (match.homeTeam.shotsOnTarget + match.homeTeam.shotsOffTarget) * 5, B: (match.awayTeam.shotsOnTarget + match.awayTeam.shotsOffTarget) * 5 },
    { subject: 'No Alvo', A: match.homeTeam.shotsOnTarget * 10, B: match.awayTeam.shotsOnTarget * 10 },
    { subject: 'Cantos', A: match.homeTeam.corners * 6, B: match.awayTeam.corners * 6 },
    { subject: 'Pressão', A: (match.homeTeam.dangerousAttacks / Math.max(1, match.minute)) * 40, B: (match.awayTeam.dangerousAttacks / Math.max(1, match.minute)) * 40 },
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
    setLoadingSignals(true);
    const result = await generateBettingSignals(match);
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
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"><ArrowLeft size={20} /> Voltar</button>
        <div className="flex bg-slate-800 p-1 rounded-xl border border-white/10">
          <button onClick={() => setActiveTab('LIVE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'LIVE' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400'}`}><Activity size={14} /> AO VIVO</button>
          <button onClick={() => setActiveTab('PRE')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'PRE' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400'}`}><History size={14} /> PRÉ-JOGO</button>
          <button onClick={() => setActiveTab('PLAYERS')} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all ${activeTab === 'PLAYERS' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400'}`}><User size={14} /> JOGADORES</button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl mb-6 relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-4"><span className="text-emerald-400 font-mono text-xl font-bold">{match.minute}'</span></div>
        <div className="flex justify-between items-center max-w-lg mx-auto">
          <div className="text-center flex-1"><h2 className="text-xl font-bold mb-2">{match.homeTeam.name}</h2><div className="text-5xl font-black">{match.homeTeam.score}</div></div>
          <div className="px-8 text-2xl font-light text-slate-500">VS</div>
          <div className="text-center flex-1"><h2 className="text-xl font-bold mb-2">{match.awayTeam.name}</h2><div className="text-5xl font-black">{match.awayTeam.score}</div></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'LIVE' && (
            <>
              {/* HeatSense Gauge */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-emerald-400" /> HeatSense™ Medidor de Calor
                  </h3>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 ${thermalData.color} text-[10px] font-black`}>
                    {thermalData.icon} {thermalData.label}
                  </div>
                </div>
                
                <div className="relative h-4 w-full bg-slate-900 rounded-full border border-white/5 overflow-hidden">
                   <div 
                    className={`h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(249,115,22,0.5)] bg-gradient-to-r from-blue-500 via-amber-500 to-orange-500`}
                    style={{ width: `${thermalData.score}%` }}
                   ></div>
                </div>
                <div className="flex justify-between mt-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
                  <span>Frio</span>
                  <span>Morno</span>
                  <span>Quente</span>
                  <span>Pegando Fogo</span>
                </div>
                
                <p className="mt-4 text-[10px] text-slate-400 italic leading-relaxed">
                  * Este medidor analisa a densidade de ataques perigosos e volume de chutes nos últimos 10 minutos para determinar a probabilidade de um evento iminente (gol ou canto).
                </p>
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
            <div className="flex justify-between items-center mb-6"><h3 className="text-lg font-bold flex items-center gap-2"><Zap className="text-yellow-400 fill-yellow-400" /> IA BetSignal</h3>{loadingSignals && <Loader2 className="animate-spin text-slate-400" size={18} />}</div>
            <div className="space-y-4">
              {signals.map((signal, idx) => (
                <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group">
                   <div className="flex justify-between items-center mb-2"><span className="bg-emerald-500 text-[10px] font-black px-2 py-0.5 rounded text-slate-950 uppercase">{signal.type}</span><span className="text-emerald-400 font-bold text-sm">ODD @{signal.oddSuggested.toFixed(2)}</span></div>
                   <p className="text-sm font-black mb-2">{signal.description}</p>
                   <div className="flex items-center justify-between mt-4"><div className="flex items-center gap-2"><div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden"><div className="bg-emerald-500 h-full" style={{ width: `${signal.confidence * 100}%` }} ></div></div><span className="text-[9px] font-bold text-slate-500 uppercase">{Math.round(signal.confidence * 100)}%</span></div><button onClick={() => toggleSaveSignal(signal)} className="p-1.5 text-slate-500 hover:text-emerald-400 transition-colors">{savedIds.includes(`${signal.matchId}-${signal.type}-${signal.timestamp}`) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}</button></div>
                </div>
              ))}
            </div>
            <button onClick={fetchSignals} disabled={loadingSignals} className="w-full mt-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"><Target size={18} /> RECALCULAR COM IA</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;
