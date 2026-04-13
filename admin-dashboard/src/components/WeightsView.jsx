import React from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, Info, Sliders, ShieldCheck, PieChart, Activity, DollarSign, Building2 } from 'lucide-react';

export function WeightsView({ weights, essentialFactors, factors, onWeightChange, onEssentialChange, onSave, onPreset }) {
    // Categorize factors for cleaner UI
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
                                <p>Mandatory criteria. Failing any will disqualifies the agency.</p>
                            </div>
                        </div>
                        <div className="essential-list-pro">
                            {[
                                { key: 'fire_safety', label: 'Fire Safety NOC', icon: '🔥' },
                                { key: 'nabh', label: 'NABH Accreditation', icon: '📜' },
                                { key: 'emergency', label: '24x7 Emergency Services', icon: '🏥' },
                                { key: 'power_backup', label: 'Dual Power Backup', icon: '⚡' },
                            ].map(ef => (
                                <button
                                    key={ef.key}
                                    className={`ef-toggle-pill ${essentialFactors.includes(ef.key) ? 'active' : ''}`}
                                    onClick={() => onEssentialChange(ef.key)}
                                >
                                    <span className="ef-icon">{ef.icon}</span>
                                    <span className="ef-label">{ef.label}</span>
                                    {essentialFactors.includes(ef.key) && <ShieldCheck size={14} className="chk" />}
                                </button>
                            ))}
                        </div>
                        <div className="ef-notice">
                            <Info size={14} />
                            <p>Agencies missing these will be penalized -100 points and flagged in reports.</p>
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
