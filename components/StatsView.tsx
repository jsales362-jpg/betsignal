
import React, { useMemo } from 'react';
import { BettingSignal } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, Target, Award, Activity, CheckCircle2, XCircle, Clock, BarChart3 } from 'lucide-react';

interface StatsViewProps {
  signals: BettingSignal[];
}

const StatsView: React.FC<StatsViewProps> = ({ signals }) => {
  const stats = useMemo(() => {
    const today = new Date().toDateString();
    
    const resolved = signals.filter(s => s.status !== 'PENDING');
    const todayResolved = resolved.filter(s => new Date(s.fullTimestamp).toDateString() === today);
    
    const getMetrics = (list: BettingSignal[]) => {
      const wins = list.filter(s => s.status === 'WIN').length;
      const losses = list.filter(s => s.status === 'LOSS').length;
      const total = wins + losses || 1;
      return {
        wins,
        losses,
        total: list.length,
        rate: (wins / total) * 100,
        roi: list.reduce((acc, s) => {
          if (s.status === 'WIN') return acc + (s.oddSuggested - 1);
          if (s.status === 'LOSS') return acc - 1;
          return acc;
        }, 0)
      };
    };

    return {
      overall: getMetrics(resolved),
      today: getMetrics(todayResolved)
    };
  }, [signals]);

  const weeklyData = useMemo(() => {
    const groups: Record<string, { signals: BettingSignal[], timestamp: number }> = {};
    
    signals.forEach(s => {
      if (s.status === 'PENDING') return;
      const date = new Date(s.fullTimestamp);
      const day = date.getDay();
      const diff = date.getDate() - day;
      const startOfWeek = new Date(date.getFullYear(), date.getMonth(), diff);
      const weekKey = startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      if (!groups[weekKey]) {
        groups[weekKey] = { signals: [], timestamp: startOfWeek.getTime() };
      }
      groups[weekKey].signals.push(s);
    });

    return Object.entries(groups)
      .map(([week, group]) => {
        const wins = group.signals.filter(s => s.status === 'WIN').length;
        const total = group.signals.length;
        const roi = group.signals.reduce((acc, s) => {
          if (s.status === 'WIN') return acc + (s.oddSuggested - 1);
          if (s.status === 'LOSS') return acc - 1;
          return acc;
        }, 0);

        return {
          week,
          timestamp: group.timestamp,
          winRate: parseFloat(((wins / total) * 100).toFixed(1)),
          roi: parseFloat(roi.toFixed(2))
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-6); // Mostrar as últimas 6 semanas
  }, [signals]);

  const pieData = [
    { name: 'Wins', value: stats.overall.wins, fill: '#10b981' },
    { name: 'Losses', value: stats.overall.losses, fill: '#f43f5e' }
  ];

  return (
    <div className="animate-in fade-in duration-500 space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black mb-1">Performance da IA</h1>
        <p className="text-slate-400 text-sm">Análise detalhada de assertividade e resultados acumulados.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Taxa de Acerto" 
          value={`${stats.overall.rate.toFixed(1)}%`} 
          icon={<Target className="text-emerald-400" />} 
          subValue="Geral"
        />
        <StatCard 
          label="Sinais do Dia" 
          value={stats.today.total.toString()} 
          icon={<Activity className="text-blue-400" />} 
          subValue={`${stats.today.wins}W - ${stats.today.losses}L`}
        />
        <StatCard 
          label="ROI Acumulado" 
          value={`${stats.overall.roi > 0 ? '+' : ''}${stats.overall.roi.toFixed(2)}u`} 
          icon={<TrendingUp className={stats.overall.roi >= 0 ? 'text-emerald-400' : 'text-rose-400'} />} 
          subValue="Unidades"
        />
        <StatCard 
          label="Status IA" 
          value="OTIMIZADO" 
          icon={<Award className="text-yellow-400" />} 
          subValue="Gemini 3 Flash"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl border border-white/5">
          <h3 className="text-lg font-black mb-6 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-400" /> Distribuição de Resultados
          </h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={pieData} 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={80} 
                  outerRadius={100} 
                  paddingAngle={8} 
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-slate-500 text-xs font-black uppercase">Win Rate</span>
              <span className="text-3xl font-black text-white">{stats.overall.rate.toFixed(0)}%</span>
            </div>
          </div>
          <div className="flex justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-xs font-bold text-slate-300">{stats.overall.wins} Greens</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-rose-500 rounded-full"></div>
              <span className="text-xs font-bold text-slate-300">{stats.overall.losses} Reds</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Activity size={18} className="text-blue-400" /> Resumo de Hoje
            </h3>
            <div className="space-y-6">
              <MetricRow label="Total de Sinais Enviados" value={stats.today.total} color="text-white" />
              <MetricRow label="Sinais Finalizados (Win/Loss)" value={stats.today.wins + stats.today.losses} color="text-slate-300" />
              <MetricRow label="Taxa de Assertividade Diária" value={`${stats.today.rate.toFixed(1)}%`} color="text-emerald-400" />
              <MetricRow label="Performance em Relação à Média" value={stats.today.rate >= stats.overall.rate ? 'ACIMA' : 'ABAIXO'} color={stats.today.rate >= stats.overall.rate ? 'text-emerald-400' : 'text-rose-400'} />
            </div>
          </div>
          <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-white/5 italic text-[10px] text-slate-500 leading-relaxed">
            * As estatísticas são baseadas nos sinais gerados automaticamente e validados em tempo real. Os resultados passados não garantem lucros futuros.
          </div>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-lg font-black flex items-center gap-2">
            <BarChart3 size={18} className="text-emerald-400" /> Evolução Semanal
          </h3>
          <div className="flex gap-4">
             <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Win Rate (%)</span>
             </div>
             <div className="flex items-center gap-2">
                <div className="w-3 h-1.5 bg-blue-500 rounded-full"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ROI (Units)</span>
             </div>
          </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="week" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ 
                  backgroundColor: '#0f172a', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '12px',
                  fontSize: '11px'
                }}
              />
              <Bar 
                dataKey="winRate" 
                name="Taxa de Acerto" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
              <Bar 
                dataKey="roi" 
                name="ROI" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]} 
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-4 text-[10px] text-slate-500 italic text-center">
          Visualização das últimas 6 semanas de operação.
        </p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; subValue: string }> = ({ label, value, icon, subValue }) => (
  <div className="glass-card p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all">
    <div className="flex justify-between items-start mb-4">
      <div className="bg-slate-900/50 p-2 rounded-lg border border-white/10">
        {icon}
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{subValue}</span>
    </div>
    <div className="text-2xl font-black text-white mb-1">{value}</div>
    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</div>
  </div>
);

const MetricRow: React.FC<{ label: string; value: string | number; color: string }> = ({ label, value, color }) => (
  <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
    <span className="text-xs font-bold text-slate-400">{label}</span>
    <span className={`text-sm font-black ${color}`}>{value}</span>
  </div>
);

export default StatsView;
