import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell,
    LineChart, Line,
    ScatterChart, Scatter, ZAxis,
} from 'recharts'
import './App.css'

const API = import.meta.env.VITE_API_URL || '/api'
const FACTOR_COLORS = {
    patient_outcomes: '#6366f1',
    infrastructure: '#10b981',
    staff_quality: '#f59e0b',
    financial_health: '#ef4444',
    technology: '#8b5cf6',
    patient_satisfaction: '#06b6d4',
    accreditation: '#f97316',
}
const FACTOR_LABELS = {
    patient_outcomes: 'Patient Outcomes',
    infrastructure: 'Infrastructure',
    staff_quality: 'Staff Quality',
    financial_health: 'Financial Health',
    technology: 'Technology',
    patient_satisfaction: 'Patient Satisfaction',
    accreditation: 'Accreditation',
}
const TYPE_COLORS = { Government: '#10b981', Private: '#6366f1', Trust: '#f59e0b', Corporate: '#06b6d4' }
const PRESETS = {
    balanced: { patient_outcomes: 25, infrastructure: 15, staff_quality: 15, financial_health: 10, technology: 10, patient_satisfaction: 15, accreditation: 10 },
    clinical: { patient_outcomes: 40, infrastructure: 10, staff_quality: 25, financial_health: 5, technology: 5, patient_satisfaction: 10, accreditation: 5 },
    financial: { patient_outcomes: 10, infrastructure: 15, staff_quality: 10, financial_health: 35, technology: 10, patient_satisfaction: 10, accreditation: 10 },
    tech: { patient_outcomes: 15, infrastructure: 15, staff_quality: 15, financial_health: 10, technology: 30, patient_satisfaction: 10, accreditation: 5 },
}

// ── Axios instance ──
const api = axios.create({ baseURL: API })
api.interceptors.request.use(cfg => {
    const token = sessionStorage.getItem('token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
})

export default function App() {
    const [token, setToken] = useState(sessionStorage.getItem('token'))
    const [view, setView] = useState('dashboard')
    const [hospitals, setHospitals] = useState([])
    const [weights, setWeights] = useState(PRESETS.balanced)
    const [stats, setStats] = useState(null)
    const [factors, setFactors] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedHospital, setSelectedHospital] = useState(null)
    const [compareList, setCompareList] = useState([])
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const perPage = 12

    const fetchData = useCallback(async () => {
        if (!token) return
        setLoading(true)
        try {
            const [rankRes, statsRes, factorsRes, cfgRes] = await Promise.all([
                api.get('/scoring/rank'),
                api.get('/scoring/stats'),
                api.get('/scoring/factors'),
                api.get('/scoring/config'),
            ])
            setHospitals(rankRes.data.hospitals || [])
            setStats(statsRes.data)
            setFactors(factorsRes.data.factors || [])
            if (cfgRes.data.weights) setWeights(cfgRes.data.weights)
        } catch { }
        finally { setLoading(false) }
    }, [token])

    useEffect(() => { fetchData() }, [fetchData])

    const rerank = useCallback(async (w) => {
        try {
            const res = await api.post('/scoring/rank', { weights: w })
            setHospitals(res.data.hospitals || [])
        } catch { }
    }, [])

    const handleWeightChange = (key, val) => {
        const newW = { ...weights, [key]: Number(val) }
        setWeights(newW)
        rerank(newW)
    }

    const saveWeights = async () => {
        await api.put('/scoring/config', { weights })
        alert('Weights saved!')
    }

    const toggleSelect = async (id) => {
        // Optimistic Update
        const target = hospitals.find(h => h._id === id);
        if (!target) return;

        const originalHospitals = [...hospitals];
        const originalStats = { ...stats };
        const newSelectedState = !target.selected;

        // Update hospitals
        setHospitals(hospitals.map(h =>
            h._id === id ? { ...h, selected: newSelectedState } : h
        ));

        // Update stats (selectedCount)
        if (stats) {
            setStats({
                ...stats,
                selectedCount: stats.selectedCount + (newSelectedState ? 1 : -1)
            });
        }

        try {
            await api.patch(`/hospitals/${id}/select`);
        } catch (err) {
            console.error('Failed to toggle selection:', err);
            // Revert on error
            setHospitals(originalHospitals);
            setStats(originalStats);
            alert('Failed to update selection. Please try again.');
        }
    }

    const downloadCSV = async (url, filename) => {
        try {
            const res = await api.get(url, { responseType: 'blob' })
            const href = URL.createObjectURL(res.data)
            const a = document.createElement('a')
            a.href = href
            a.download = filename
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(href)
        } catch { alert('Export failed. Please try again.') }
    }
    const exportCSV = () => downloadCSV('/export/csv', 'hospitals_export.csv')
    const exportSelected = () => downloadCSV('/export/selected', 'selected_hospitals.csv')

    const filtered = hospitals.filter(h => {
        const matchSearch = !search || h.name.toLowerCase().includes(search.toLowerCase()) || h.city.toLowerCase().includes(search.toLowerCase())
        const matchType = !typeFilter || h.type === typeFilter
        return matchSearch && matchType
    })
    const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)
    const totalPages = Math.ceil(filtered.length / perPage)

    if (!token) return <LoginPage onLogin={(t) => { sessionStorage.setItem('token', t); setToken(t) }} />

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-logo">⚕️</div>
                    <div>
                        <div className="brand-name">MedCollaborate</div>
                        <div className="brand-sub">Admin Panel</div>
                    </div>
                </div>
                <nav className="sidebar-nav">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: '📊' },
                        { id: 'ranking', label: 'Hospital Ranking', icon: '🏆' },
                        { id: 'analytics', label: 'Analytics', icon: '📈' },
                        { id: 'compare', label: 'Compare', icon: '⚖️' },
                        { id: 'weights', label: 'Scoring Config', icon: '⚙️' },
                    ].map(item => (
                        <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => setView(item.id)}>
                            <span>{item.icon}</span> {item.label}
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="btn btn-ghost btn-sm" onClick={() => { sessionStorage.removeItem('token'); setToken(null) }}>🚪 Logout</button>
                </div>
            </aside>

            {/* Main */}
            <main className="main-content">
                <header className="topbar">
                    <div>
                        <h1 className="topbar-title">{
                            { dashboard: 'Dashboard Overview', ranking: 'Hospital Rankings', analytics: 'Data Analytics', compare: 'Side-by-Side Compare', weights: 'Scoring Configuration' }[view]
                        }</h1>
                        <p className="topbar-sub">2026 Collaboration Cycle • {stats?.total || 0} hospitals evaluated</p>
                    </div>
                    <div className="topbar-actions">
                        <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 Export All</button>
                        <button className="btn btn-success btn-sm" onClick={exportSelected}>🎯 Export Selected</button>
                    </div>
                </header>

                <div className="content-area">
                    {loading && <div className="loading-bar"><div className="loading-fill" /></div>}

                    {view === 'dashboard' && <DashboardView stats={stats} hospitals={hospitals} weights={weights} factors={factors} setView={setView} />}
                    {view === 'ranking' && <RankingView hospitals={paginated} allHospitals={filtered} weights={weights} search={search} setSearch={setSearch} typeFilter={typeFilter} setTypeFilter={setTypeFilter} currentPage={currentPage} setCurrentPage={setCurrentPage} totalPages={totalPages} perPage={perPage} onToggleSelect={toggleSelect} onViewHospital={setSelectedHospital} compareList={compareList} setCompareList={setCompareList} />}
                    {view === 'analytics' && <AnalyticsView hospitals={hospitals} />}
                    {view === 'compare' && <CompareView hospitals={hospitals} compareList={compareList} setCompareList={setCompareList} />}
                    {view === 'weights' && <WeightsView weights={weights} setWeights={setWeights} factors={factors} onWeightChange={handleWeightChange} onSave={saveWeights} onPreset={(p) => { setWeights(PRESETS[p]); rerank(PRESETS[p]) }} />}
                </div>

                {selectedHospital && <HospitalDrawer hospital={selectedHospital} onClose={() => setSelectedHospital(null)} onToggleSelect={toggleSelect} />}
            </main>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════ */
function LoginPage({ onLogin }) {
    const [u, setU] = useState(''), [p, setP] = useState(''), [loading, setLoading] = useState(false), [err, setErr] = useState('')
    const submit = async (e) => {
        e.preventDefault(); setErr(''); setLoading(true)
        try {
            const res = await axios.post(`${API}/auth/login`, { username: u, password: p })
            onLogin(res.data.token)
        } catch (err) {
            setErr(err.response?.data?.error || 'Invalid credentials')
        }
        finally { setLoading(false) }
    }
    return (
        <div className="login-page">
            <div className="login-bg" />
            <div className="login-card animate-in">
                <div className="login-logo">⚕️</div>
                <h1>MedCollaborate</h1>
                <p>Admin Dashboard — Hospital Selection Platform</p>
                <form onSubmit={submit}>
                    <div className="login-field">
                        <label>Username</label>
                        <input value={u} onChange={e => setU(e.target.value)} placeholder="admin" required />
                    </div>
                    <div className="login-field">
                        <label>Password</label>
                        <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" required />
                    </div>
                    {err && <div className="login-error">{err}</div>}
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? <><div className="spinner" /> Signing in...</> : '🔐 Sign In'}
                    </button>
                </form>
                <p className="login-hint">Default: admin / admin</p>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   DASHBOARD VIEW
═══════════════════════════════════════════════ */
function DashboardView({ stats, hospitals, weights, factors, setView }) {
    if (!stats) return <div className="loading-state"><div className="spinner" /></div>
    const top5 = hospitals.slice(0, 5)
    const typeData = Object.entries(stats.typeDistribution || {}).map(([name, value]) => ({ name, value, color: TYPE_COLORS[name] || '#6366f1' }))
    const selected = hospitals.filter(h => h.selected)

    return (
        <div className="dashboard-view animate-in">
            {/* KPI Cards */}
            <div className="kpi-grid">
                <KpiCard icon="🏥" value={stats.total} label="Total Submissions" color="#6366f1" />
                <KpiCard icon="⭐" value={stats.avgScore} label="Average Score" color="#10b981" suffix="/100" />
                <KpiCard icon="🎯" value={stats.selectedCount} label="Selected Hospitals" color="#06b6d4" />
                <KpiCard icon="🏆" value={stats.topHospital?.split(' ').slice(0, 2).join(' ')} label="Top Ranked" color="#f59e0b" isText />
            </div>

            {/* Charts row */}
            <div className="charts-row">
                {/* Type Pie */}
                <div className="chart-card">
                    <h3 className="chart-title">Hospital Type Distribution</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={typeData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                                {typeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#e2e8f0' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Top 5 bar */}
                <div className="chart-card chart-wide">
                    <h3 className="chart-title">Top 5 Hospitals — Overall Score</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={top5} layout="vertical" margin={{ left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={140} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => v.length > 18 ? v.slice(0, 16) + '...' : v} />
                            <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#e2e8f0' }} />
                            <Bar dataKey="overallScore" fill="url(#bg)" radius={4} name="Score">
                                {top5.map((e, i) => <Cell key={i} fill={['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Selected hospitals */}
            {selected.length > 0 && (
                <div className="section-card">
                    <h3 className="section-card-title">✅ Currently Selected Hospitals ({selected.length})</h3>
                    <div className="selected-chips">
                        {selected.map(h => <div key={h._id} className="selected-chip"><span className="chip-rank">#{h.rank}</span>{h.name}<span className="chip-score">{h.overallScore}</span></div>)}
                    </div>
                </div>
            )}

            {/* Quick score breakdown */}
            <div className="section-card">
                <div className="section-card-header">
                    <h3 className="section-card-title">📊 Category Score Overview</h3>
                    <button className="btn btn-ghost btn-sm" onClick={() => setView('ranking')}>View All Rankings →</button>
                </div>
                <div className="factor-overview">
                    {Object.entries(FACTOR_LABELS).map(([key, label]) => {
                        const avg = hospitals.length ? Math.round(hospitals.reduce((s, h) => s + (h.categoryScores?.[key] || 0), 0) / hospitals.length) : 0
                        return (
                            <div key={key} className="factor-bar-item">
                                <div className="factor-bar-header">
                                    <span className="factor-name" style={{ color: FACTOR_COLORS[key] }}>{label}</span>
                                    <span className="factor-avg">{avg}</span>
                                </div>
                                <div className="factor-bar-bg"><div className="factor-bar-fill" style={{ width: `${avg}%`, background: FACTOR_COLORS[key] }} /></div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

function KpiCard({ icon, value, label, color, suffix, isText }) {
    return (
        <div className="kpi-card" style={{ '--accent': color }}>
            <div className="kpi-icon">{icon}</div>
            <div className="kpi-value">{isText ? value : `${value ?? '—'}${suffix || ''}`}</div>
            <div className="kpi-label">{label}</div>
            <div className="kpi-glow" />
        </div>
    )
}

/* ═══════════════════════════════════════════════
   RANKING VIEW
═══════════════════════════════════════════════ */
function RankingView({ hospitals, allHospitals, weights, search, setSearch, typeFilter, setTypeFilter, currentPage, setCurrentPage, totalPages, perPage, onToggleSelect, onViewHospital, compareList, setCompareList }) {
    const getRankClass = (rank) => rank <= 3 ? 'gold' : rank <= 10 ? 'silver' : rank <= 20 ? 'bronze' : ''
    const getRowClass = (rank) => rank <= 20 ? 'shortlisted' : rank <= 30 ? 'borderline' : ''
    const toggleCompare = (id) => setCompareList(l => l.includes(id) ? l.filter(x => x !== id) : l.length < 5 ? [...l, id] : l)

    return (
        <div className="ranking-view animate-in">
            {/* Filters */}
            <div className="filter-bar">
                <input placeholder="🔍 Search hospitals..." value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1) }} className="search-input" />
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1) }}>
                    <option value="">All Types</option>
                    {['Government', 'Private', 'Trust', 'Corporate'].map(t => <option key={t}>{t}</option>)}
                </select>
                <div className="filter-count">{allHospitals.length} hospitals</div>
            </div>

            {/* Legend */}
            <div className="rank-legend">
                <span className="legend-item shortlisted">🟢 Top 20 — Shortlisted</span>
                <span className="legend-item borderline">🟡 21–30 — Borderline</span>
                <span className="legend-item">⚪ Rest</span>
            </div>

            {/* Table */}
            <div className="rank-table-wrap">
                <table className="rank-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Hospital</th>
                            <th>Type</th>
                            <th>Score</th>
                            {Object.keys(FACTOR_LABELS).map(k => <th key={k} title={FACTOR_LABELS[k]}>{FACTOR_LABELS[k].split(' ')[0]}</th>)}
                            <th>Compare</th>
                            <th>Select</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {hospitals.map(h => (
                            <tr key={h._id} className={`rank-row ${getRowClass(h.rank)}`}>
                                <td><span className={`rank-badge ${getRankClass(h.rank)}`}>{h.rank <= 3 ? ['🥇', '🥈', '🥉'][h.rank - 1] : `#${h.rank}`}</span></td>
                                <td>
                                    <div className="hospital-cell">
                                        <div className="hosp-name">{h.name}</div>
                                        <div className="hosp-loc">📍 {h.city}, {h.state}</div>
                                    </div>
                                </td>
                                <td><span className="type-badge" style={{ '--tc': TYPE_COLORS[h.type] }}>{h.type}</span></td>
                                <td>
                                    <div className="score-cell">
                                        <span className="score-num">{h.overallScore}</span>
                                        <div className="score-mini-bar"><div style={{ width: `${h.overallScore}%`, background: h.overallScore >= 80 ? '#10b981' : h.overallScore >= 60 ? '#f59e0b' : '#ef4444' }} /></div>
                                    </div>
                                </td>
                                {Object.keys(FACTOR_LABELS).map(k => (
                                    <td key={k}><span className={`sub-score ${scoreClass(h.categoryScores?.[k])}`}>{Math.round(h.categoryScores?.[k] || 0)}</span></td>
                                ))}
                                <td><input type="checkbox" checked={compareList.includes(h._id)} onChange={() => toggleCompare(h._id)} /></td>
                                <td>
                                    <button className={`select-btn ${h.selected ? 'selected' : ''}`} onClick={() => onToggleSelect(h._id)}>
                                        {h.selected ? '✅' : '○'}
                                    </button>
                                </td>
                                <td><button className="btn btn-ghost btn-sm" onClick={() => onViewHospital(h)}>👁</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="pagination">
                <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
            </div>
        </div>
    )
}

function scoreClass(v) {
    if (v === undefined || v === null) return ''
    if (v >= 80) return 'score-high'
    if (v >= 55) return 'score-mid'
    return 'score-low'
}

/* ═══════════════════════════════════════════════
   ANALYTICS VIEW
═══════════════════════════════════════════════ */
function AnalyticsView({ hospitals }) {
    const top20 = hospitals.slice(0, 20)
    const typeDistData = Object.entries(hospitals.reduce((acc, h) => { acc[h.type] = (acc[h.type] || 0) + 1; return acc }, {}))
        .map(([name, value]) => ({ name, value, color: TYPE_COLORS[name] || '#6366f1' }))

    const scatterData = hospitals.map(h => ({
        x: h.categoryScores?.patient_outcomes || 0,
        y: h.categoryScores?.patient_satisfaction || 0,
        z: h.total_beds || 100,
        name: h.name,
        score: h.overallScore,
    }))

    const stateData = Object.entries(
        hospitals.reduce((a, h) => { a[h.state] = (a[h.state] || 0) + 1; return a }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 10) + '...' : name, count }))

    const factorRadarData = Object.keys(FACTOR_LABELS).map(key => ({
        // Use a short, unique label for the radar axis
        factor: key === 'patient_outcomes' ? 'Outcomes' :
            key === 'patient_satisfaction' ? 'Satisfaction' :
                key === 'staff_quality' ? 'Staff' :
                    key === 'financial_health' ? 'Financial' :
                        key === 'accreditation' ? 'Accred' :
                            FACTOR_LABELS[key],
        avg: hospitals.length ? Math.round(hospitals.reduce((s, h) => s + (h.categoryScores?.[key] || 0), 0) / hospitals.length) : 0,
        top10: hospitals.slice(0, 10).length ? Math.round(hospitals.slice(0, 10).reduce((s, h) => s + (h.categoryScores?.[key] || 0), 0) / 10) : 0,
    }))

    // Flatten categoryScores into top-level keys for Recharts stacked bar (dot-notation dataKey doesn't work on nested objects)
    const top20flat = hospitals.slice(0, 20).map(h => ({
        name: h.name,
        ...Object.fromEntries(Object.keys(FACTOR_LABELS).map(k => [k, Math.round(h.categoryScores?.[k] || 0)]))
    }))

    const scoreDistribution = [
        { range: '90–100', count: hospitals.filter(h => h.overallScore >= 90).length },
        { range: '80–89', count: hospitals.filter(h => h.overallScore >= 80 && h.overallScore < 90).length },
        { range: '70–79', count: hospitals.filter(h => h.overallScore >= 70 && h.overallScore < 80).length },
        { range: '60–69', count: hospitals.filter(h => h.overallScore >= 60 && h.overallScore < 70).length },
        { range: 'Below 60', count: hospitals.filter(h => h.overallScore < 60).length },
    ]

    const accredData = [
        { name: 'NABH', count: hospitals.filter(h => h.nabh_accredited).length },
        { name: 'JCI', count: hospitals.filter(h => h.jci_accredited).length },
        { name: 'NABL', count: hospitals.filter(h => h.nabl_lab).length },
        { name: 'ISO', count: hospitals.filter(h => h.iso_certified).length },
    ]

    const techData = [
        { name: 'HIS/EMR', count: hospitals.filter(h => h.his_emr_software).length },
        { name: 'Telemedicine', count: hospitals.filter(h => h.telemedicine).length },
        { name: 'AI Tools', count: hospitals.filter(h => h.ai_diagnostic_tools).length },
        { name: 'Robotic', count: hospitals.filter(h => h.robotic_surgery).length },
        { name: 'IoT', count: hospitals.filter(h => h.iot_monitoring).length },
    ]

    const TOOLTIP_STYLE = { background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }

    return (
        <div className="analytics-view animate-in">
            {/* Row 1: radar + score distribution */}
            <div className="analytics-row">
                <div className="chart-card">
                    <h3 className="chart-title">📡 Factor Performance Radar — All vs Top 10</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={factorRadarData} outerRadius="75%">
                            <PolarGrid stroke="rgba(255,255,255,.12)" />
                            <PolarAngleAxis dataKey="factor" tick={{ fill: '#cbd5e1', fontSize: 12, fontWeight: 500 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} tickCount={4} />
                            <Radar name="All Hospitals" dataKey="avg" stroke="#818cf8" strokeWidth={4} fill="#6366f1" fillOpacity={0.6} />
                            <Radar name="Top 10" dataKey="top10" stroke="#34d399" strokeWidth={4} fill="#10b981" fillOpacity={0.6} />
                            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3 className="chart-title">📊 Score Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scoreDistribution}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                            <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Bar dataKey="count" name="Hospitals" radius={[6, 6, 0, 0]}>
                                {scoreDistribution.map((e, i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b', '#f97316', '#ef4444'][i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 2: scatter + state bar */}
            <div className="analytics-row">
                <div className="chart-card chart-wide">
                    <h3 className="chart-title">🔵 Patient Outcomes vs. Satisfaction (bubble = bed count)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                            <XAxis dataKey="x" name="Patient Outcomes" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Patient Outcomes', position: 'insideBottom', offset: -5, fill: '#64748b', fontSize: 11 }} />
                            <YAxis dataKey="y" name="Patient Satisfaction" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Satisfaction', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11 }} />
                            <ZAxis dataKey="z" range={[40, 400]} name="Beds" />
                            <Tooltip content={<ScatterTip />} />
                            <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.7} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3 className="chart-title">🗺️ Hospitals by State (Top 10)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={stateData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                            <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} name="Count" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Row 3: accreditation + tech adoption */}
            <div className="analytics-row">
                <div className="chart-card">
                    <h3 className="chart-title">🏆 Accreditation Coverage</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={accredData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Bar dataKey="count" name="Hospitals" radius={[6, 6, 0, 0]}>
                                {accredData.map((e, i) => <Cell key={i} fill={['#f59e0b', '#6366f1', '#10b981', '#06b6d4'][i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3 className="chart-title">💻 Technology Adoption</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={techData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                            <Bar dataKey="count" name="Hospitals" radius={[6, 6, 0, 0]}>
                                {techData.map((e, i) => <Cell key={i} fill={['#8b5cf6', '#06b6d4', '#f97316', '#6366f1', '#10b981'][i]} />)}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="chart-card">
                    <h3 className="chart-title">🏥 Hospital Type Mix</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie data={typeDistData} cx="50%" cy="50%" outerRadius={85} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine>
                                {typeDistData.map((e, i) => <Cell key={i} fill={e.color} />)}
                            </Pie>
                            <Tooltip contentStyle={TOOLTIP_STYLE} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top 20 bar */}
            <div className="chart-card">
                <h3 className="chart-title">🏅 Top 20 Hospitals — Category Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={340}>
                    <BarChart data={top20flat} margin={{ bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 9, angle: -40, textAnchor: 'end' }} interval={0} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: 11 }} />
                        <Legend wrapperStyle={{ paddingTop: 20, fontSize: 11, color: '#94a3b8' }} />
                        {Object.keys(FACTOR_LABELS).map(k => (
                            <Bar key={k} dataKey={k} name={FACTOR_LABELS[k]} stackId="a" fill={FACTOR_COLORS[k]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

function ScatterTip({ active, payload }) {
    if (!active || !payload?.length) return null
    const d = payload[0]?.payload || {}
    return (
        <div style={{ background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#e2e8f0' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</div>
            <div>Outcomes: {d.x?.toFixed(1)}</div>
            <div>Satisfaction: {d.y?.toFixed(1)}</div>
            <div>Beds: {d.z}</div>
            <div>Score: <b>{d.score}</b></div>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   COMPARE VIEW
═══════════════════════════════════════════════ */
function CompareView({ hospitals, compareList, setCompareList }) {
    // If user has checked compare boxes, use those. Otherwise, show all shortlisted hospitals.
    const selected = (compareList.length > 0
        ? hospitals.filter(h => compareList.includes(h._id))
        : hospitals.filter(h => h.selected)).slice(0, 5)

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ef4444']

    if (selected.length < 1) return (
        <div className="empty-state animate-in">
            <div className="empty-icon">⚖️</div>
            <h3>Select hospitals to compare</h3>
            <p>Go to Hospital Ranking and shortlist (✅) or check "Compare" on hospitals you want to analyze side-by-side.</p>
        </div>
    )

    const radarData = Object.keys(FACTOR_LABELS).map(key => {
        const point = {
            factor: key === 'patient_outcomes' ? 'Outcomes' :
                key === 'patient_satisfaction' ? 'Satisfaction' :
                    key === 'staff_quality' ? 'Staff' :
                        key === 'financial_health' ? 'Financial' :
                            key === 'accreditation' ? 'Accred' :
                                FACTOR_LABELS[key]
        }
        selected.forEach(h => { point[h._id] = Math.round(h.categoryScores?.[key] || 0) })
        return point
    })

    const barData = Object.keys(FACTOR_LABELS).map(key => {
        const point = { factor: FACTOR_LABELS[key] }
        selected.forEach(h => { point[h.name] = Math.round(h.categoryScores?.[key] || 0) })
        return point
    })

    const TOOLTIP_STYLE = { background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }

    return (
        <div className="compare-view animate-in">
            <div className="compare-header">
                <h3>Comparing {selected.length} hospitals</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setCompareList([])}>Clear All</button>
            </div>

            {/* Score cards */}
            <div className="compare-cards">
                {selected.map((h, i) => (
                    <div key={h._id} className="compare-card" style={{ '--accent': COLORS[i] }}>
                        <div className="compare-rank">#{h.rank}</div>
                        <div className="compare-name">{h.name}</div>
                        <div className="compare-loc">📍 {h.city}</div>
                        <div className="compare-score" style={{ color: COLORS[i] }}>{h.overallScore}</div>
                        <div className="compare-score-label">Overall Score</div>
                        <button className="btn btn-ghost btn-sm" onClick={() => setCompareList(l => l.filter(x => x !== h._id))}>Remove</button>
                    </div>
                ))}
            </div>

            {/* Radar comparison */}
            <div className="chart-card">
                <h3 className="chart-title">🕸️ Multi-Factor Radar Comparison</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData} outerRadius="75%">
                        <PolarGrid stroke="rgba(255,255,255,.12)" />
                        <PolarAngleAxis dataKey="factor" tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} tickCount={4} />
                        {selected.map((h, i) => (
                            <Radar key={h._id} name={h.name} dataKey={h._id} stroke={COLORS[i]} strokeWidth={4} fill={COLORS[i]} fillOpacity={0.5} />
                        ))}
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Grouped bar */}
            <div className="chart-card">
                <h3 className="chart-title">📊 Category Scores Comparison</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.05)" />
                        <XAxis dataKey="factor" tick={{ fill: '#64748b', fontSize: 9, angle: -30, textAnchor: 'end' }} interval={0} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8', paddingTop: 16 }} />
                        {selected.map((h, i) => <Bar key={h._id} dataKey={h.name} fill={COLORS[i]} radius={[3, 3, 0, 0]} />)}
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Detail table */}
            <div className="compare-table-wrap">
                <table className="compare-table">
                    <thead>
                        <tr>
                            <th>Metric</th>
                            {selected.map((h, i) => <th key={h._id} style={{ color: COLORS[i] }}>{h.name.split(' ').slice(0, 2).join(' ')}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            ['Type', h => h.type],
                            ['City', h => h.city],
                            ['Total Beds', h => h.total_beds],
                            ['ICU Beds', h => h.icu_beds],
                            ['NABH', h => h.nabh_accredited ? '✅' : '❌'],
                            ['JCI', h => h.jci_accredited ? '✅' : '❌'],
                            ['Telemedicine', h => h.telemedicine ? '✅' : '❌'],
                            ['AI Tools', h => h.ai_diagnostic_tools ? '✅' : '❌'],
                            ['Doctors', h => h.total_doctors],
                            ['Satisfaction', h => h.patient_satisfaction_score],
                        ].map(([label, fn]) => (
                            <tr key={label}>
                                <td className="compare-metric-label">{label}</td>
                                {selected.map(h => <td key={h._id}>{fn(h) ?? '—'}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   WEIGHTS VIEW
═══════════════════════════════════════════════ */
function WeightsView({ weights, factors, onWeightChange, onSave, onPreset }) {
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    return (
        <div className="weights-view animate-in">
            <div className="weights-header">
                <div>
                    <h3>Configure Scoring Weights</h3>
                    <p>Adjust priority of each factor. Rankings update live as you drag sliders.</p>
                </div>
                <div className="weight-total" style={{ color: Math.abs(total - 100) < 5 ? '#10b981' : '#f59e0b' }}>
                    Total: {total}% {Math.abs(total - 100) >= 5 && '⚠️'}
                </div>
            </div>

            <div className="preset-bar">
                <span>Quick Presets:</span>
                {Object.keys(PRESETS).map(k => (
                    <button key={k} className="btn btn-ghost btn-sm" onClick={() => onPreset(k)}>
                        {k === 'balanced' ? '⚖️' : k === 'clinical' ? '🩺' : k === 'financial' ? '💰' : '💻'} {k.charAt(0).toUpperCase() + k.slice(1)}
                    </button>
                ))}
            </div>

            <div className="sliders">
                {factors.map(f => (
                    <div key={f.key} className="slider-card">
                        <div className="slider-header">
                            <div className="slider-dot" style={{ background: f.color }} />
                            <div className="slider-info">
                                <div className="slider-label">{f.label}</div>
                                <div className="slider-desc">{f.description}</div>
                            </div>
                            <div className="slider-value">{weights[f.key] || 0}%</div>
                        </div>
                        <input
                            type="range" min="0" max="100" step="1"
                            value={weights[f.key] || 0}
                            onChange={e => onWeightChange(f.key, e.target.value)}
                            style={{ '--color': f.color }}
                            className="factor-slider"
                        />
                    </div>
                ))}
            </div>

            <div className="weights-chart">
                <h4>Current Weight Distribution</h4>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={factors.map(f => ({ name: f.label, value: weights[f.key] || 0, color: f.color }))} cx="50%" cy="50%" outerRadius={90} innerRadius={45} paddingAngle={3} dataKey="value">
                            {factors.map((f, i) => <Cell key={i} fill={f.color} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(255,255,255,.1)', borderRadius: '8px', color: '#e2e8f0', fontSize: 12 }} formatter={(v) => `${v}%`} />
                        <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <button className="btn btn-primary" onClick={onSave} style={{ marginTop: 16 }}>💾 Save Configuration</button>
        </div>
    )
}

/* ═══════════════════════════════════════════════
   HOSPITAL DRAWER
═══════════════════════════════════════════════ */
function HospitalDrawer({ hospital: h, onClose, onToggleSelect }) {
    return (
        <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="drawer animate-in">
                <div className="drawer-header">
                    <div>
                        <div className="drawer-rank">Rank #{h.rank}</div>
                        <h2 className="drawer-name">{h.name}</h2>
                        <div className="drawer-loc">📍 {h.city}, {h.state} · <span className="type-badge" style={{ '--tc': TYPE_COLORS[h.type] }}>{h.type}</span></div>
                    </div>
                    <div className="drawer-actions">
                        <button className={`btn ${h.selected ? 'btn-success' : 'btn-ghost'} btn-sm`} onClick={() => onToggleSelect(h._id)}>
                            {h.selected ? '✅ Selected' : '+ Select'}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
                    </div>
                </div>

                <div className="drawer-score-row">
                    <div className="drawer-main-score">{h.overallScore}<span>/100</span></div>
                    <div className="factor-bars">
                        {Object.entries(FACTOR_LABELS).map(([k, l]) => (
                            <div key={k} className="drawer-factor">
                                <span style={{ color: FACTOR_COLORS[k], fontSize: 12 }}>{l}</span>
                                <div className="dfactor-bar-bg"><div style={{ width: `${h.categoryScores?.[k] || 0}%`, background: FACTOR_COLORS[k] }} /></div>
                                <span className="dfactor-val">{Math.round(h.categoryScores?.[k] || 0)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="drawer-sections">
                    <DrawerSection title="🏥 Section A & B: Basic & Contact" items={[
                        ['Brand Name', h.brand_name],
                        ['PAN Number', h.pan_number],
                        ['GST Number', h.gst_number],
                        ['MSME Status', `${h.msme_status} (${h.msme_type})`],
                        ['Official Email', h.contact_email],
                        ['Primary Phone', h.contact_phone],
                        ['Address', h.address],
                    ]} />

                    <DrawerSection title="📜 Section C: Statutory & Compliance" items={[
                        ['NABH', h.accreditations?.nabh ? '✅' : '❌'],
                        ['NABL', h.accreditations?.nabl ? '✅' : '❌'],
                        ['JCI', h.accreditations?.jci ? '✅' : '❌'],
                        ['Fire Safety', h.statutory_clearances?.fire_safety ? '✅' : '❌'],
                        ['BMW Approval', h.statutory_clearances?.biomedical_waste ? '✅' : '❌'],
                        ['AERB Approval', h.statutory_clearances?.aerb_approval ? '✅' : '❌'],
                        ['Pharmacy License', h.statutory_clearances?.pharmacy_license ? '✅' : '❌'],
                        ['Lift Safety', h.statutory_clearances?.lift_safety ? '✅' : '❌'],
                        ['CEA Registration', h.statutory_clearances?.cea_registration ? '✅' : '❌'],
                    ]} />

                    <DrawerSection title="🛋️ Section F & K: Capacity & General" items={[
                        ['Total Beds', h.total_beds],
                        ['ICU Beds', h.capacity?.icu],
                        ['General Beds', h.capacity?.general],
                        ['Semi-Private', h.capacity?.semi_private],
                        ['Private Beds', h.capacity?.private],
                        ['HDU Beds', h.capacity?.hdu],
                        ['Parking', h.general_facilities?.parking ? '✅' : '❌'],
                        ['Power Backup', h.general_facilities?.power_backup ? '✅' : '❌'],
                        ['Central AC', h.general_facilities?.central_ac ? '✅' : '❌'],
                        ['Waiting Lounge', h.general_facilities?.waiting_lounge ? '✅' : '❌'],
                        ['Cafeteria', h.general_facilities?.cafeteria ? '✅' : '❌'],
                    ]} />

                    <DrawerSection title="🚑 Section E & G: Facilities & Support" items={[
                        ['Emergency Dept', h.facilities?.emergency ? '✅' : '❌'],
                        ['Blood Bank', h.facilities?.blood_bank ? '✅' : '❌'],
                        ['Cathlab', h.facilities?.cathlab ? '✅' : '❌'],
                        ['Organ Transplant', h.facilities?.organ_transplant ? '✅' : '❌'],
                        ['Dialysis', h.facilities?.dialysis ? '✅' : '❌'],
                        ['Ambulance', h.ambulance_facility],
                        ['Free Pickup', h.ambulance_free_pickup],
                        ['CT Scan', h.diagnostic_facilities?.ct],
                        ['MRI Scan', h.diagnostic_facilities?.mri],
                        ['PET-CT', h.diagnostic_facilities?.pet_ct],
                    ]} />

                    <DrawerSection title="📊 Section H & I: Association" items={[
                        ['Association Yrs', h.ongc_association_years],
                        ['CGHS Acceptable', h.cghs_rates_acceptable],
                        ['ONGC Discount', `${h.ongc_discount_percent}%`],
                        ['FY 23-24 Patients', h.ongc_patient_count?.fy_23_24],
                        ['FY 24-25 Patients', h.ongc_patient_count?.fy_24_25],
                    ]} />
                </div>

                {h.specialties?.length > 0 && (
                    <div className="drawer-specialties">
                        <h4>Selected Specialties</h4>
                        <div className="spec-tags">
                            {h.specialties.map(s => <span key={s} className="spec-tag">{s}</span>)}
                        </div>
                    </div>
                )}

                {h.nodal_contacts?.length > 0 && (
                    <div className="drawer-nodal">
                        <h4>Nodal Contacts</h4>
                        <table className="mini-table">
                            <thead>
                                <tr><th>Purpose</th><th>Name</th><th>Mobile</th></tr>
                            </thead>
                            <tbody>
                                {h.nodal_contacts.map((nc, idx) => (
                                    <tr key={idx}><td>{nc.purpose}</td><td>{nc.name}</td><td>{nc.mobile}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

function DrawerSection({ title, items }) {
    return (
        <div className="drawer-section">
            <h4>{title}</h4>
            <div className="drawer-grid">
                {items.map(([label, val]) => (
                    <div key={label} className="drawer-row">
                        <span className="row-label">{label}</span>
                        <span className="row-val">{val ?? '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
