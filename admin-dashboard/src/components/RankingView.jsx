import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, MousePointer2, Scale } from 'lucide-react';

export function RankingView({
    hospitals, allHospitals, search, setSearch, typeFilter, setTypeFilter,
    currentPage, setCurrentPage, totalPages, onToggleSelect, onViewHospital, essentialFactors = [],
    compareList = [], onToggleCompare
}) {
    return (
        <motion.div
            className="ranking-view-pro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="table-controls-pro">
                <div className="search-filter-premium">
                    <Search size={18} className="search-icon" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search" />
                </div>
                <div className="filters-pro">
                    <div className="filter-pill-select">
                        <Filter size={14} />
                        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="">All Sectors</option>
                            <option value="Government">Government</option>
                            <option value="Private">Private</option>
                            <option value="Trust">Trust</option>
                            <option value="Corporate">Corporate</option>
                        </select>
                    </div>
                </div>
            </div>

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
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {hospitals.map((h, i) => {
                            const anyEssentials = essentialFactors.length > 0;

                            const COMPLIANCE_MAP = [
                                {
                                    key: 'nabh',
                                    label: 'NABH',
                                    has: h.accreditations?.nabh
                                },
                                {
                                    key: 'fire_safety',
                                    label: 'FIRE',
                                    has: h.statutory_clearances?.fire_safety || h.fire_safety_attached
                                },
                                {
                                    key: 'emergency',
                                    label: 'EMG',
                                    has: h.facilities?.emergency
                                },
                                {
                                    key: 'power_backup',
                                    label: 'PWR',
                                    has: h.general_facilities?.power_backup
                                }
                            ];

                            const visibleChips = COMPLIANCE_MAP.filter(item => {
                                const isEssential = essentialFactors.includes(item.key);
                                if (!anyEssentials) return true; // Show all if none selected
                                return isEssential && !item.has; // Show only missing essentials
                            });

                            return (
                                <tr key={h._id} className={h.selected ? 'row-selected' : ''}>
                                    <td className="td-rank">
                                        <span className="rank-num">#{(currentPage - 1) * 12 + i + 1}</span>
                                    </td>
                                    <td className="td-name">
                                        <div className="name-stack">
                                            <span className="h-n">{h.name}</span>
                                            <span className="h-l">{h.city}, {h.state}</span>
                                        </div>
                                    </td>
                                    <td><span className={`badge ${(h.ownership_type || 'Private').toLowerCase()}`}>{h.ownership_type || 'Private'}</span></td>
                                    <td><span className="bed-count">{h.total_beds || 0} Beds</span></td>
                                    <td>
                                        <div className="score-pill">
                                            <div className="score-track"><div className="score-thumb" style={{ width: `${Math.min(100, Math.max(0, h.overallScore || 0))}%` }} /></div>
                                            <span>{(h.overallScore || 0).toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="compliance-chips">
                                            {(!anyEssentials || visibleChips.length === 0) ? (
                                                <span className="compliance-ok">All followed</span>
                                            ) : (
                                                visibleChips.map(chip => (
                                                    <span
                                                        key={chip.key}
                                                        className={`chip ${chip.key.replace('_safety', '')} miss`}
                                                    >
                                                        * {chip.label}
                                                    </span>
                                                ))
                                            )}
                                        </div>
                                    </td>
                                    <td className="td-actions">
                                        <div className="actions-wrapper">
                                            <button className="action-btn-pro" onClick={() => onViewHospital(h)} title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            <button className={`action-btn-pro ${h.selected ? 'active' : ''}`} onClick={() => onToggleSelect(h._id)} title="Select">
                                                <MousePointer2 size={16} />
                                            </button>
                                            <button className={`action-btn-pro ${compareList.includes(h._id) ? 'active' : ''}`} onClick={() => onToggleCompare(h._id)} title="Compare">
                                                <Scale size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="pagination-pro">
                <div className="page-info">
                    Showing {(currentPage - 1) * 12 + 1} - {Math.min(currentPage * 12, allHospitals.length)} of {allHospitals.length}
                </div>
                <div className="page-btns">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}><ChevronLeft size={18} /></button>
                    {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
                        <button key={i} className={currentPage === i + 1 ? 'active' : ''} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                    ))}
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}><ChevronRight size={18} /></button>
                </div>
            </div>
        </motion.div>
    );
}
