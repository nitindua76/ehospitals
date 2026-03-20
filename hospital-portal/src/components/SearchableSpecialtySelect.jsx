import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, ArrowRight, Activity } from 'lucide-react';
import { SPECIALTIES_LIST } from '../constants/specialties';

const COMMON_SPECIALTIES = [
    "General medicine", "General surgery", "Pediatrics", "Obstetrics and Gynecology",
    "Orthopedic surgery", "Cardiology", "Neurology", "Medical oncology", "Emergency medicine"
];

export function SearchableSpecialtySelect({ selected, onAdd, onRemove }) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const filtered = SPECIALTIES_LIST.filter(s =>
        s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
    ).slice(0, 10);

    // Handle clicks outside
    useEffect(() => {
        const handleClick = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="specialty-overhaul" ref={containerRef}>
            <div className="selected-zone">
                <AnimatePresence mode="popLayout">
                    {selected.map(s => (
                        <motion.span
                            key={s}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="premium-tag"
                        >
                            <Activity size={12} className="tag-icon" />
                            {s}
                            <button className="tag-close" onClick={() => onRemove(s)}><X size={12} /></button>
                        </motion.span>
                    ))}
                </AnimatePresence>
            </div>

            <div className="search-box-pro">
                <div className={`input-inner ${isOpen ? 'active' : ''}`}>
                    <Search className="search-icon" size={18} />
                    <input
                        type="text"
                        placeholder="Type to search medical specialties..."
                        value={query}
                        onFocus={() => setIsOpen(true)}
                        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
                    />
                </div>

                <AnimatePresence>
                    {query || (isOpen && filtered.length > 0) ? (
                        <motion.div
                            className="results-portal"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {filtered.length > 0 ? (
                                filtered.map(s => (
                                    <button
                                        key={s}
                                        className="result-item"
                                        onClick={() => { onAdd(s); setQuery(''); }}
                                    >
                                        <div className="res-lbl">{s}</div>
                                        <ArrowRight size={14} className="res-arrow" />
                                    </button>
                                ))
                            ) : (
                                <div className="no-res">No matching services found.</div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            className="suggested-specialties"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="sugg-header">Commonly Selected:</div>
                            <div className="sugg-tags">
                                {COMMON_SPECIALTIES.filter(s => !selected.includes(s)).map(s => (
                                    <button key={s} className="sugg-tag" onClick={() => onAdd(s)}>
                                        <Activity size={12} className="tag-icon" /> {s}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
