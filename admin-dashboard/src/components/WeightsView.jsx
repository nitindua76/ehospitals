import React from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, Info, Sliders, ShieldCheck } from 'lucide-react';

export function WeightsView({ weights, essentialFactors, factors, onWeightChange, onEssentialChange, onSave, onPreset }) {
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
                            <h3>Category Attribution</h3>
                            <p>Adjust the relative importance of each metric</p>
                        </div>
                        <div className="preset-group">
                            <button className="preset-btn" onClick={() => onPreset('balanced')}>Balanced</button>
                            <button className="preset-btn" onClick={() => onPreset('clinical')}>Clinical</button>
                        </div>
                    </div>

                    <div className="weights-list-pro">
                        {factors.map(f => (
                            <div key={f.key} className="weight-item-pro">
                                <div className="weight-meta">
                                    <label>{f.label}</label>
                                    <span className="weight-val">{weights[f.key] || 0}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="50"
                                    value={weights[f.key] || 0}
                                    onChange={e => onWeightChange(f.key, e.target.value)}
                                    className="weight-slider-pro"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <div className="config-side-panel">
                    <section className="essential-factors-config">
                        <div className="config-card-head">
                            <div className="head-text">
                                <h3>Essential Criteria</h3>
                                <p>Mandatory requirements for eligibility</p>
                            </div>
                        </div>
                        <div className="essential-list-pro">
                            {[
                                { key: 'fire_safety', label: 'Fire Safety Clearance', icon: '🔥' },
                                { key: 'nabh', label: 'NABH Accreditation', icon: '📜' },
                                { key: 'emergency', label: '24x7 Emergency', icon: '🏥' },
                                { key: 'power_backup', label: 'Power Backup', icon: '⚡' },
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
                            <p>Hospitals not meeting these criteria will be automatically moved to the bottom.</p>
                        </div>
                    </section>

                    <button className="save-config-btn-pro" onClick={onSave}>
                        <Save size={18} />
                        <span>Apply & Persistent Configuration</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
