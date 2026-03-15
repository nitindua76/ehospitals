import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { KpiCard } from './KpiCard';
import { Users, Star, Target, Bed, Award, TrendingUp, ChevronRight } from 'lucide-react';

export function DashboardView({ stats, hospitals, TYPE_COLORS, setView }) {
    if (!stats) return null;

    const DISTINCT_COLORS = ['#38bdf8', '#fbbf24', '#f472b6', '#34d399', '#a78bfa'];
    const typeData = Object.entries(stats.typeDistribution || {}).map(([name, value], idx) => ({
        name, value, color: DISTINCT_COLORS[idx % DISTINCT_COLORS.length]
    }));

    const STATE_COLORS = ['#818cf8', '#4ade80', '#fbbf24', '#f87171', '#22d3ee', '#c084fc', '#fb923c'];

    const stateData = Object.entries(stats.stateDistribution || {})
        .filter(([name]) => name && name !== 'undefined' && name !== 'Unknown')
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div
            className="dashboard-content"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <div className="kpi-row-pro">
                <KpiCard icon={<Users size={20} />} value={stats.total} label="Submissions" color="#818cf8" delay={0.1} />
                <KpiCard icon={<Star size={20} />} value={stats.avgScore} label="Avg Score" color="#4ade80" suffix="/100" delay={0.2} />
                <KpiCard icon={<Target size={20} />} value={stats.selectedCount} label="Selected" color="#22d3ee" delay={0.3} />
                <KpiCard icon={<Award size={20} />} value={stats.accreditedCount} label="Accredited" color="#fb923c" delay={0.4} />
                <KpiCard icon={<TrendingUp size={20} />} value={stats.topHospital?.split(' ')[0]} label="Top Agency" color="#f472b6" isText delay={0.5} />
            </div>

            <div className="visuals-grid">
                <motion.div className="chart-container-pro" variants={container}>
                    <div className="chart-head">
                        <h3>Type Distribution</h3>
                        <p>Hospital categories spread</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={typeData}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={85}
                                paddingAngle={5}
                            >
                                {typeData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                            </Pie>
                            <Tooltip
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#f8fafc' }}
                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        {typeData.map(t => (
                            <div key={t.name} className="legend-item">
                                <span className="dot" style={{ backgroundColor: t.color }} />
                                <span className="lab">{t.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="chart-container-pro" variants={container}>
                    <div className="chart-head">
                        <h3>Geographical Context</h3>
                        <p>Top 5 active states</p>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={stateData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                stroke="#94a3b8"
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                                width={85}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                itemStyle={{ color: '#f8fafc' }}
                                labelStyle={{ color: '#f8fafc' }}
                                contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={18}>
                                {stateData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATE_COLORS[index % STATE_COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div className="recent-list-pro" variants={container}>
                    <div className="list-head">
                        <h3>Top Ranked</h3>
                        <button onClick={() => setView('ranking')}>View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="h-list">
                        {hospitals.slice(0, 4).map((h, i) => (
                            <div key={h._id} className="h-item-pro">
                                <div className="h-rank">{i + 1}</div>
                                <div className="h-info">
                                    <span className="h-name">{h.name}</span>
                                    <span className="h-meta">{(h.city || 'Unknown')} • Score: {(h.overallScore || 0).toFixed(1)}</span>
                                </div>
                                <div className="h-pct">{(h.overallScore || 0).toFixed(0)}%</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
