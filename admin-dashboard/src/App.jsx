import { useState, useEffect, useCallback, Component } from 'react'
import axios from 'axios'
import './App.css'

// Admin Components
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { DashboardView } from './components/DashboardView'
import { RankingView } from './components/RankingView'
import { AnalyticsView, CompareView } from './components/AnalyticsView'
import { WeightsView } from './components/WeightsView'
import { HospitalDrawer } from './components/HospitalDrawer'
import { LoginPage } from './components/LoginPage'

// Error Boundary for UI Safety
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '60px', background: '#0f172a', color: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: '#ef4444' }}>Terminal Interface Error</h1>
                    <p style={{ margin: '20px 0', color: '#94a3b8' }}>A critical runtime exception occurred in the dashboard engine.</p>
                    <div style={{ background: '#1e293b', padding: '24px', borderRadius: '12px', border: '1px solid #334155', overflow: 'auto' }}>
                        <code style={{ color: '#fb923c' }}>{this.state.error?.message}</code>
                        <pre style={{ marginTop: '16px', fontSize: '12px', color: '#64748b' }}>{this.state.error?.stack}</pre>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

const API = import.meta.env.VITE_API_URL || '/api'

const FACTOR_COLORS = {
    patient_outcomes: '#818cf8',
    infrastructure: '#4ade80',
    staff_quality: '#fbbf24',
    financial_health: '#f87171',
    technology: '#22d3ee',
    patient_satisfaction: '#c084fc',
    accreditation: '#fb923c',
}

const TYPE_COLORS = {
    Government: '#10b981',
    Private: '#818cf8',
    Trust: '#f59e0b',
    Corporate: '#ec4899'
}

const PRESETS = {
    balanced: { patient_outcomes: 25, infrastructure: 15, staff_quality: 15, financial_health: 10, technology: 10, patient_satisfaction: 15, accreditation: 10 },
    clinical: { patient_outcomes: 40, infrastructure: 10, staff_quality: 25, financial_health: 5, technology: 5, patient_satisfaction: 10, accreditation: 5 },
}

const api = axios.create({ baseURL: API })
api.interceptors.request.use(cfg => {
    const token = sessionStorage.getItem('token')
    if (token) cfg.headers.Authorization = `Bearer ${token}`
    return cfg
})

const downloadFile = async (url, filename) => {
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
    } catch { alert('Download failed.') }
}

function AdminApp() {
    const [token, setToken] = useState(sessionStorage.getItem('token'))
    const [view, setView] = useState('dashboard')
    const [hospitals, setHospitals] = useState([])
    const [weights, setWeights] = useState(PRESETS.balanced)
    const [essentialFactors, setEssentialFactors] = useState([])
    const [stats, setStats] = useState(null)
    const [factors, setFactors] = useState([])
    const [loading, setLoading] = useState(false)
    const [selectedHospital, setSelectedHospital] = useState(null)
    const [compareList, setCompareList] = useState([])
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [toasts, setToasts] = useState([])

    const showToast = (msg, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, msg, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }

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
            if (cfgRes.data?.weights) setWeights(cfgRes.data.weights)
            if (cfgRes.data?.essentialFactors) setEssentialFactors(cfgRes.data.essentialFactors)
        } catch (e) {
            console.error('Data Fetch Failed:', e)
        } finally { setLoading(false) }
    }, [token])

    useEffect(() => { fetchData() }, [fetchData])

    const rerank = async (w, ef) => {
        try {
            const res = await api.post('/scoring/rank', { weights: w, essentialFactors: ef || essentialFactors })
            setHospitals(res.data.hospitals || [])
        } catch { }
    }

    const handleWeightChange = (key, val) => {
        const newW = { ...weights, [key]: Number(val) }
        setWeights(newW)
        rerank(newW)
    }

    const saveWeights = async () => {
        await api.put('/scoring/config', { weights, essentialFactors })
        showToast('Configuration persistence updated')
    }

    const refreshData = async () => {
        showToast('Synchronizing with hospital data vault...', 'info')
        await fetchData()
        showToast('Data synchronization complete')
    }

    const toggleSelect = async (id) => {
        const target = hospitals.find(h => h._id === id);
        if (!target) return;
        const newState = !target.selected;

        setHospitals(hospitals.map(h => h._id === id ? { ...h, selected: newState } : h));
        if (stats) setStats({ ...stats, selectedCount: (stats.selectedCount || 0) + (newState ? 1 : -1) });
        if (selectedHospital && selectedHospital._id === id) {
            setSelectedHospital({ ...selectedHospital, selected: newState });
        }

        // Auto-manage Compare Sandbox
        setCompareList(prev => {
            if (newState && !prev.includes(id)) return [...prev, id];
            if (!newState && prev.includes(id)) return prev.filter(c => c !== id);
            return prev;
        });

        try {
            await api.patch(`/hospitals/${id}/select`);
            showToast(newState ? 'Selected for Panel & Sandbox' : 'Selection & Sandbox Revoked');
        } catch { fetchData() }
    }

    const exportCSV = () => downloadFile('/export/csv', 'hospitals_audit.csv')
    const exportSelected = () => downloadFile('/export/selected', 'selected_panel.csv')

    const filtered = hospitals.filter(h => {
        const hName = h.name || ''
        const hCity = h.city || ''
        const matchSearch = !search || hName.toLowerCase().includes(search.toLowerCase()) || hCity.toLowerCase().includes(search.toLowerCase())
        const matchType = !typeFilter || h.ownership_type === typeFilter
        return matchSearch && matchType
    })

    const paginated = filtered.slice((currentPage - 1) * 12, currentPage * 12)
    const totalPages = Math.ceil(filtered.length / 12)

    if (!token) return <LoginPage onLogin={(t) => { sessionStorage.setItem('token', t); setToken(t) }} />

    const viewTitles = { dashboard: 'Strategic Overview', ranking: 'Hospital Registers', analytics: 'Data Intelligence', compare: 'Side-by-Side Analysis', weights: 'Scoring Control' };

    return (
        <div className="dashboard-layout">
            <Sidebar currentView={view} setView={setView} onLogout={() => { sessionStorage.removeItem('token'); setToken(null) }} />

            <main className="main-content">
                <Topbar
                    viewTitle={viewTitles[view] || 'Dashboard'}
                    statsCount={stats?.total || 0}
                    onExportAll={exportCSV}
                    onExportSelected={exportSelected}
                    onRefresh={refreshData}
                    isLoading={loading}
                    search={search}
                    setSearch={setSearch}
                    onLogout={() => { sessionStorage.removeItem('token'); setToken(null) }}
                />

                <div className="content-area-pro">
                    {loading && <div className="loading-line-pro" />}

                    {view === 'dashboard' && <DashboardView stats={stats} hospitals={hospitals} TYPE_COLORS={TYPE_COLORS} setView={setView} />}
                    {view === 'ranking' && (
                        <RankingView
                            hospitals={paginated}
                            allHospitals={filtered}
                            search={search} setSearch={setSearch}
                            typeFilter={typeFilter} setTypeFilter={setTypeFilter}
                            currentPage={currentPage} setCurrentPage={setCurrentPage}
                            totalPages={totalPages}
                            onToggleSelect={toggleSelect}
                            onViewHospital={setSelectedHospital}
                            essentialFactors={essentialFactors}
                            compareList={compareList}
                            onToggleCompare={(id) => {
                                setCompareList(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
                                showToast(compareList.includes(id) ? 'Removed from Sandbox' : 'Added to Sandbox')
                            }}
                        />
                    )}
                    {view === 'analytics' && <AnalyticsView hospitals={hospitals} />}
                    {view === 'compare' && (
                        <CompareView
                            hospitals={hospitals}
                            compareList={compareList}
                            setCompareList={setCompareList}
                        />
                    )}
                    {view === 'weights' && (
                        <WeightsView
                            weights={weights}
                            essentialFactors={essentialFactors}
                            factors={factors}
                            onWeightChange={handleWeightChange}
                            onEssentialChange={(key) => {
                                const newEf = essentialFactors.includes(key) ? essentialFactors.filter(k => k !== key) : [...essentialFactors, key]
                                setEssentialFactors(newEf)
                                rerank(weights, newEf)
                            }}
                            onSave={saveWeights}
                            onPreset={(k) => { setWeights(PRESETS[k]); rerank(PRESETS[k]) }}
                        />
                    )}
                </div>

                {selectedHospital && (
                    <HospitalDrawer
                        hospital={selectedHospital}
                        onClose={() => setSelectedHospital(null)}
                        onToggleSelect={toggleSelect}
                        downloadFile={downloadFile}
                    />
                )}

                <div className="toast-container">
                    {toasts.map(t => (
                        <div key={t.id} className={`toast-item toast-${t?.type || 'success'}`}>
                            <span className="toast-msg">{t?.msg || ''}</span>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

export default function App() {
    return (
        <ErrorBoundary>
            <AdminApp />
        </ErrorBoundary>
    )
}
