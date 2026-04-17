import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Info, ShieldCheck, Activity, DollarSign, Building2, Plus, X, Search } from 'lucide-react';
import api from '../utils/api';

export function WeightsView({ weights, essentialFactors, factors, onWeightChange, onEssentialChange, onSave, onPreset }) {
    const [allCriteria, setAllCriteria] = useState({});
    const [showSelector, setShowSelector] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCriteria = async () => {
            try {
                const res = await api.get('/scoring/criteria');
                setAllCriteria(res.data);
            } catch (e) {
                console.error('Failed to load criteria registry');
            }
        };
        fetchCriteria();
    }, []);

    // Categorize weights for cleaner UI
    const GROUPS = {
        'Strategic & Quality': ['patient_outcomes', 'staff_quality', 'patient_satisfaction', 'accreditation'],
        'Capacity & Tech': ['infrastructure', 'technology'],
        'Financial Alignment': ['financial_health']
    };

    const getIcon = (group) => {
        if (group.includes('Strategic')) return <Activity size={18} />;
        if (group.includes('Capacity')) return <Building2 size={18} />;
        return <DollarSign size={18} />;
    };

    const availableToAdd = Object.keys(allCriteria).filter(key => 
        !essentialFactors.includes(key) && 
        allCriteria[key].label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            className="weights-view-pro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="scoring-grid">
                <section className="weight-config-section">
                    <div className="config-card-head">
                        <div className="head-text">
                            <h3>Scoring Algorithm Control</h3>
                            <p>Define the relative weight of each metric in the overall score calculation.</p>
                        </div>
                        <div className="preset-group">
                            <button className="preset-btn" onClick={() => onPreset('balanced')}>Balanced Mode</button>
                            <button className="preset-btn" onClick={() => onPreset('clinical')}>High Clinical</button>
                        </div>
                    </div>

                    <div className="weights-list-modern">
                        {Object.entries(GROUPS).map(([groupName, factorKeys]) => (
                            <div key={groupName} className="factor-group-card">
                                <div className="group-label">
                                    {getIcon(groupName)}
                                    <span>{groupName}</span>
                                </div>
                                <div className="group-content">
                                    {factors.filter(f => factorKeys.includes(f.key)).map(f => (
                                        <div key={f.key} className="weight-item-pro">
                                            <div className="weight-meta">
                                                <div className="label-stack">
                                                    <label>{f.label}</label>
                                                    <span className="factor-desc">{f.description}</span>
                                                </div>
                                                <span className="weight-val">{weights[f.key] || 0}%</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={weights[f.key] || 0}
                                                onChange={e => onWeightChange(f.key, e.target.value)}
                                                className="weight-slider-pro"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="config-side-panel">
                    <section className="essential-factors-config">
                        <div className="config-card-head">
                            <div className="head-text">
                                <h3>Hard Gatekeepers</h3>
                                <p>Agencies failing any marked criteria will be disqualified (-100 pts).</p>
                            </div>
                            <button className="add-crit-btn" onClick={() => setShowSelector(!showSelector)}>
                                <Plus size={16} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {showSelector && (
                                <motion.div 
                                    className="criteria-selector-popover"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="search-bar-mini">
                                        <Search size={14} />
                                        <input 
                                            placeholder="Search criteria..." 
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <div className="available-list">
                                        {availableToAdd.map(key => (
                                            <div 
                                                key={key} 
                                                className="available-item"
                                                onClick={() => {
                                                    onEssentialChange(key);
                                                    setSearch('');
                                                    setShowSelector(false);
                                                }}
                                            >
                                                <span className="ef-icon">{allCriteria[key].icon}</span>
                                                <div className="ef-text">
                                                    <span className="ef-label">{allCriteria[key].label}</span>
                                                    <span className="ef-cat">{allCriteria[key].category}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {availableToAdd.length === 0 && <p className="no-res">No matching criteria</p>}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="essential-list-pro">
                            {essentialFactors.map(key => {
                                const ef = allCriteria[key];
                                return (
                                    <div key={key} className="ef-toggle-pill active">
                                        <span className="ef-icon">{ef?.icon || '🔹'}</span>
                                        <span className="ef-label">{ef?.label || key}</span>
                                        <button className="ef-remove" onClick={() => onEssentialChange(key)}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                            {essentialFactors.length === 0 && (
                                <div className="empty-essentials">
                                    <Info size={20} />
                                    <p>No mandatory criteria defined. All hospitals are eligible for top ranking.</p>
                                </div>
                            )}
                        </div>
                    </section>

                    <button className="save-config-btn-pro" onClick={onSave} style={{ width: '100%', marginTop: 'auto' }}>
                        <Save size={18} />
                        <span>Save & Re-rank All Applications</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
