import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Eye, MousePointer2, Scale, Download, RefreshCcw, Trash2, X, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export function RankingView({
    hospitals, allHospitals, search, setSearch, typeFilter, setTypeFilter,
    currentPage, setCurrentPage, totalPages, onToggleSelect, onViewHospital, essentialFactors = [],
    compareList = [], onToggleCompare, onDownload, onRevert, onDelete
}) {
    const [showFilters, setShowFilters] = useState(false);
    const [activeFilters, setActiveFilters] = useState([]);

    // Data Dictionary for Dynamic Filtering
    const FILTERABLE_FIELDS = [
        { key: 'ownership_type', label: 'Ownership Sector', type: 'select', options: ['Government', 'Private', 'Private/Corporate', 'Trust', 'Corporate'] },
        { key: 'type', label: 'Hospital Category', type: 'select', options: ['Single-Specialty', 'Multi-Specialty', 'Eye-Bank', 'EyeCare Center', 'Diagnostic-Center'] },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'state', label: 'State', type: 'text' },
        { key: 'total_beds', label: 'Total Bed Capacity', type: 'number' },
        { key: 'cghs_rates_acceptable', label: 'CGHS Acceptance', type: 'select', options: ['Yes', 'No'] },
        { key: 'ongc_discount_percent', label: 'ONGC Discount (%)', type: 'number' },
        { key: 'nabh_accredited', label: 'NABH Accredited', type: 'boolean' },
        { key: 'fire_safety_clearance', label: 'Fire Safety Clearance', type: 'boolean' },
        { key: 'emergency_department', label: '24x7 Emergency', type: 'boolean' },
        { key: 'blood_bank', label: 'Blood Bank', type: 'boolean' },
        { key: 'icu_facility', label: 'ICU Availability', type: 'boolean' },
        { key: 'ventilator_facility', label: 'Ventilator Facility', type: 'boolean' },
        { key: 'pathology_lab', label: 'In-House Pathology (24x7)', type: 'select', options: ['Yes', 'No'] },
        { key: 'pharmacy_24x7', label: 'Pharmacy (24x7)', type: 'select', options: ['Yes', 'No'] },
        { key: 'msme_status', label: 'MSME Status', type: 'select', options: ['Yes', 'No'] },
    ];

    const addFilter = () => {
        setActiveFilters([...activeFilters, { id: Date.now(), field: 'total_beds', operator: '>=', value: '' }]);
    };

    const removeFilter = (id) => {
        setActiveFilters(activeFilters.filter(f => f.id !== id));
    };

    const updateFilter = (id, updates) => {
        setActiveFilters(activeFilters.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    // Apply filters logic
    const filteredHospitals = hospitals.filter(h => {
        return activeFilters.every(f => {
            const fieldDef = FILTERABLE_FIELDS.find(fd => fd.key === f.field);
            let val = h[f.field];
            
            // Handle virtuals/boolean consistency
            if (fieldDef.type === 'boolean') {
                val = val === 'Yes' || val === true;
            }

            if (!f.value && f.operator !== 'is_set') return true;

            const target = f.value;
            switch (f.operator) {
                case '>=': return Number(val) >= Number(target);
                case '<=': return Number(val) <= Number(target);
                case '==': return String(val).toLowerCase() === String(target).toLowerCase();
                case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase());
                case 'true': return val === true || val === 'Yes';
                case 'false': return val === false || val === 'No';
                default: return true;
            }
        });
    });

    const resetFilters = () => {
        setActiveFilters([]);
        setTypeFilter('');
        setSearch('');
    };

    return (
        <motion.div
            className="ranking-view-pro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="table-controls-pro">
                <div className="search-wrap-pro">
                    <Search size={18} className="search-icon-dim" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Agency Identity..." />
                </div>
                
                <div className="actions-cluster">
                    <button className={`pill-btn ${showFilters ? 'primary' : ''}`} onClick={() => setShowFilters(!showFilters)}>
                        <Filter size={16} />
                        <span>Advanced Filters</span>
                    </button>
                    <button title="Reset all filters" className="pill-btn" onClick={resetFilters}>
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div 
                        className="filter-sidebar-pro"
                        initial={{ x: 360 }}
                        animate={{ x: 0 }}
                        exit={{ x: 360 }}
                    >
                        <div className="filter-sidebar-head">
                            <h3>Query Builder</h3>
                            <button onClick={() => setShowFilters(false)} className="icon-circ"><X size={18} /></button>
                        </div>

                        <div className="dynamic-filter-list">
                            {activeFilters.map(f => {
                                const fieldDef = FILTERABLE_FIELDS.find(fd => fd.key === f.field);
                                return (
                                    <div key={f.id} className="filter-row-pro">
                                        <div className="filter-row-meta">
                                            <select 
                                                value={f.field} 
                                                onChange={e => updateFilter(f.id, { field: e.target.value, operator: FILTERABLE_FIELDS.find(fd => fd.key === e.target.value).type === 'number' ? '>=' : '==' })}
                                                className="filter-field-select"
                                            >
                                                {FILTERABLE_FIELDS.map(ff => <option key={ff.key} value={ff.key}>{ff.label}</option>)}
                                            </select>
                                            <button className="remove-filter-btn" onClick={() => removeFilter(f.id)}><X size={14} /></button>
                                        </div>
                                        
                                        <div className="filter-row-controls">
                                            <select 
                                                value={f.operator} 
                                                onChange={e => updateFilter(f.id, { operator: e.target.value })}
                                                className="filter-op-select"
                                            >
                                                {fieldDef.type === 'number' && (
                                                    <>
                                                        <option value=">=">Greater Than or Equal</option>
                                                        <option value="<=">Less Than or Equal</option>
                                                        <option value="==">Exact Match</option>
                                                    </>
                                                )}
                                                {fieldDef.type === 'text' && (
                                                    <>
                                                        <option value="contains">Contains</option>
                                                        <option value="==">Equals</option>
                                                    </>
                                                )}
                                                {fieldDef.type === 'select' && (
                                                    <option value="==">Match</option>
                                                )}
                                                {fieldDef.type === 'boolean' && (
                                                    <>
                                                        <option value="true">Is Enabled/Yes</option>
                                                        <option value="false">Is Disabled/No</option>
                                                    </>
                                                )}
                                            </select>

                                            {fieldDef.type !== 'boolean' && (
                                                fieldDef.options ? (
                                                    <select 
                                                        value={f.value} 
                                                        onChange={e => updateFilter(f.id, { value: e.target.value })}
                                                        className="filter-val-input"
                                                    >
                                                        <option value="">Choose Value...</option>
                                                        {fieldDef.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                                    </select>
                                                ) : (
                                                    <input 
                                                        type={fieldDef.type} 
                                                        value={f.value}
                                                        onChange={e => updateFilter(f.id, { value: e.target.value })}
                                                        placeholder="Value..."
                                                        className="filter-val-input"
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button className="add-filter-link" onClick={addFilter}>
                            + Add Query Condition
                        </button>

                        <div className="filter-actions-pro">
                            <button className="pill-btn primary" style={{ flex: 1 }} onClick={() => setShowFilters(false)}>Execute Query ({filteredHospitals.length} Found)</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="table-wrapper-pro">
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Hospital Identity</th>
                            <th>Category</th>
                            <th>Capacity</th>
                            <th>Score</th>
                            <th>Compliance</th>
                            <th>Admin Tools</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredHospitals.map((h, i) => {
                            const anyEssentials = essentialFactors.length > 0;
                            const rank = (currentPage - 1) * 12 + i + 1;

                            const visibleChips = h.missingFactors || [];

                            return (
                                <tr key={h._id} className={h.selected ? 'row-selected' : ''}>
                                    <td className={`td-rank ${rank <= 3 ? `rank-${rank}` : 'rank-default'}`}>
                                        <span className="rank-num">#{rank}</span>
                                    </td>
                                    <td className="td-name">
                                        <div className="name-stack">
                                            <div className="h-n-row">
                                                <span className="h-n">{h.name || 'Unnamed Facility'}</span>
                                                {h.has_submitted ? (
                                                    <span className="h-status submitted">Submitted</span>
                                                ) : (
                                                    <span className="h-status draft">Draft (Step {h.current_step || 1}/14)</span>
                                                )}
                                            </div>
                                            <div className="h-meta-row">
                                                <span className="h-ref">#{h.refId || h._id.slice(-8).toUpperCase()}</span>
                                                {h.brand_name && h.brand_name !== h.name && (
                                                    <span className="h-b">• Brand: {h.brand_name}</span>
                                                )}
                                            </div>
                                            <div className="h-l-row">
                                                <MapPin size={10} />
                                                <span>{h.city || 'Location N/A'}{h.state ? `, ${h.state}` : ''}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${(h.ownership_type || 'Private').toLowerCase()}`}>{h.ownership_type || 'Private'}</span></td>
                                    <td>
                                        <div className="capacity-stack">
                                            <span className="bed-count">{h.total_beds || 0} Beds</span>
                                            {h.cghs_rates_acceptable === 'Yes' && <span className="cghs-tag" style={{ marginLeft: '4px' }}>CGHS ✓</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="score-pill-stack">
                                            <div className={`score-pill ${(h.overallScore === 0 && h.has_submitted) ? 'danger' : ''}`}>
                                                <div className="score-track"><div className="score-thumb" style={{ width: `${Math.min(100, Math.max(0, h.overallScore || 0))}%` }} /></div>
                                                <span>{(h.overallScore || 0).toFixed(1)}</span>
                                            </div>
                                            {(h.overallScore === 0 && h.has_submitted) && <span className="ineligible-tag">Ineligible</span>}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="compliance-chips">
                                            {(!anyEssentials || visibleChips.length === 0) ? (
                                                <span className="compliance-ok"><CheckCircle size={14} /> Verified</span>
                                            ) : (
                                                visibleChips.map(chip => (
                                                    <span key={chip.key} className="chip miss">
                                                        {chip.icon} {chip.label.split(' ')[0]}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td className="td-actions">
                                        <div className="actions-wrapper">
                                            <button className="action-btn-pro" onClick={() => onViewHospital(h)}>
                                                <Eye size={16} />
                                                <span className="tooltip-pro">View Core Details</span>
                                            </button>
                                            <button className={`action-btn-pro ${h.selected ? 'active' : ''}`} onClick={() => onToggleSelect(h._id)}>
                                                <MousePointer2 size={16} />
                                                <span className="tooltip-pro">Select for Panel</span>
                                            </button>
                                            <button className="action-btn-pro" onClick={() => onDownload(h)}>
                                                <Download size={16} />
                                                <span className="tooltip-pro">Download Package</span>
                                            </button>
                                            <button className="action-btn-pro danger" onClick={() => onRevert(h._id)}>
                                                <RefreshCcw size={16} />
                                                <span className="tooltip-pro">Revert to Draft</span>
                                            </button>
                                            <button className="action-btn-pro danger-glow" onClick={() => onDelete(h._id)}>
                                                <Trash2 size={16} />
                                                <span className="tooltip-pro">Permanent Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {filteredHospitals.length === 0 && (
                    <div className="empty-state-pro">
                        <AlertCircle size={40} />
                        <h3>No matching results found</h3>
                        <p>Try adjusting your filters or search keywords.</p>
                    </div>
                )}
            </div>

            <div className="pagination-pro">
                <div className="page-info">
                    Showing {(currentPage - 1) * 12 + 1} - {Math.min(currentPage * 12, allHospitals.length)} of {allHospitals.length} entries
                </div>
                <div className="page-btns">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
                    {Array.from({ length: totalPages }).map((_, i) => (
                        (i < 3 || i > totalPages - 2) ? (
                            <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                        ) : (i === 3 ? <span key={i}>...</span> : null)
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
                </div>
            </div>
        </motion.div>
    );
}
