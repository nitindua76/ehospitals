import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { KpiCard } from './KpiCard';
import { Users, Star, Target, Bed, Award, TrendingUp, ChevronRight } from 'lucide-react';

export function DashboardView({ stats, hospitals, TYPE_COLORS, setView, categoryFilter, setCategoryFilter }) {
    if (!stats) return null;

    // Local Filtering Logic for Interactive Dashboard
    const filteredHospitals = categoryFilter 
        ? hospitals.filter(h => h.type === categoryFilter)
        : hospitals;

    const statsToDisplay = categoryFilter ? {
        total: filteredHospitals.length,
        avgScore: filteredHospitals.length ? Math.round(filteredHospitals.reduce((s, h) => s + (h.overallScore || 0), 0) / filteredHospitals.length) : 0,
        selectedCount: filteredHospitals.filter(h => h.selected).length,
        accreditedCount: filteredHospitals.filter(h => h.accreditations?.nabh || h.accreditations?.jci).length,
        compliantCount: filteredHospitals.filter(h => (h.missingFactors || []).length === 0 && h.has_submitted).length,
        topHospital: filteredHospitals.sort((a,b) => (b.overallScore || 0) - (a.overallScore || 0))[0]?.name
    } : stats;

    const DISTINCT_COLORS = ['#38bdf8', '#fbbf24', '#f472b6', '#34d399', '#a78bfa'];
    const typeData = Object.entries(stats.typeDistribution || {}).map(([name, value], idx) => ({
        name, value, color: DISTINCT_COLORS[idx % DISTINCT_COLORS.length]
    }));

    const funnelData = [
        { name: 'Applied', value: statsToDisplay.total, color: '#818cf8', icon: <Users size={14}/> },
        { name: 'Compliant', value: statsToDisplay.compliantCount || 0, color: '#34d399', icon: <Target size={14}/> },
        { name: 'Selected', value: statsToDisplay.selectedCount || 0, color: '#fbbf24', icon: <Award size={14}/> }
    ];

    const container = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    return (
        <motion.div className="dashboard-content" variants={container} initial="hidden" animate="show">
            {categoryFilter && (
                <div className="active-filter-banner">
                    <span className="filter-label">Filtering by Category: <strong>{categoryFilter}</strong></span>
                    <button className="clear-filter-btn" onClick={() => setCategoryFilter('')}><X size={14} /> Clear Filter</button>
                </div>
            )}

            <div className="kpi-row-pro">
                <KpiCard icon={<Users size={20} />} value={statsToDisplay.total} label="Submissions" color="#818cf8" delay={0.1} />
                <KpiCard icon={<Star size={20} />} value={statsToDisplay.avgScore} label="Avg Score" color="#4ade80" suffix="/100" delay={0.2} />
                <KpiCard icon={<Target size={20} />} value={statsToDisplay.selectedCount} label="Selected" color="#22d3ee" delay={0.3} />
                <KpiCard icon={<Award size={20} />} value={statsToDisplay.accreditedCount} label="Accredited" color="#fb923c" delay={0.4} />
                <KpiCard icon={<TrendingUp size={20} />} value={statsToDisplay.topHospital?.split(' ')[0]} label="Top Agency" color="#f472b6" isText delay={0.5} />
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
                                onClick={(data) => setCategoryFilter(categoryFilter === data.name ? '' : data.name)}
                                style={{ cursor: 'pointer' }}
                            >
                                {typeData.map((e, i) => (
                                    <Cell 
                                        key={i} 
                                        fill={e.color} 
                                        stroke={categoryFilter === e.name ? '#fff' : 'none'} 
                                        strokeWidth={categoryFilter === e.name ? 2 : 0}
                                        opacity={!categoryFilter || categoryFilter === e.name ? 1 : 0.4}
                                    />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        {typeData.map(t => (
                            <div key={t.name} className={`legend-item ${categoryFilter === t.name ? 'active' : ''}`} onClick={() => setCategoryFilter(categoryFilter === t.name ? '' : t.name)}>
                                <span className="dot" style={{ backgroundColor: t.color }} />
                                <span className="lab">{t.name}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="chart-container-pro funnel-container" variants={container}>
                    <div className="chart-head">
                        <h3>Selection Funnel</h3>
                        <p>Agency vetting conversion</p>
                    </div>
                    <div className="funnel-viz">
                        {funnelData.map((stage, i) => (
                            <div key={stage.name} className="funnel-stage">
                                <div className="stage-meta">
                                    <span className="stage-icon" style={{ color: stage.color }}>{stage.icon}</span>
                                    <span className="stage-label">{stage.name}</span>
                                    <span className="stage-value">{stage.value}</span>
                                </div>
                                <div className="stage-bar-wrap">
                                    <motion.div 
                                        className="stage-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stage.value / (funnelData[0].value || 1)) * 100}%` }}
                                        style={{ backgroundColor: stage.color }}
                                    />
                                </div>
                                {i < funnelData.length - 1 && (
                                    <div className="stage-conversion">
                                        <ChevronRight size={12} /> 
                                        {Math.round((funnelData[i+1].value / (stage.value || 1)) * 100)}%
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="recent-list-pro" variants={container}>
                    <div className="list-head">
                        <h3>Top {categoryFilter ? categoryFilter : 'Ranked'}</h3>
                        <button onClick={() => setView('ranking')}>View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="h-list">
                        {filteredHospitals.length > 0 ? filteredHospitals.slice(0, 4).sort((a,b) => (b.overallScore || 0) - (a.overallScore || 0)).map((h, i) => (
                            <div key={h._id} className="h-item-pro">
                                <div className="h-rank">{i + 1}</div>
                                <div className="h-info">
                                    <span className="h-name">{h.name}</span>
                                    <span className="h-meta">{(h.city || 'Unknown')} • Score: {(h.overallScore || 0).toFixed(1)}</span>
                                </div>
                                <div className="h-pct">{(h.overallScore || 0).toFixed(0)}%</div>
                            </div>
                        )) : (
                            <div className="empty-state-mini">No records found for this category</div>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}
