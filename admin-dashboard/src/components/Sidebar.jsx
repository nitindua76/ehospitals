import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Trophy, LineChart, Scale, Settings, LogOut, Shield } from 'lucide-react';

export function Sidebar({ currentView, setView, onLogout }) {
    const MENU_ITEMS = [
        { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
        { id: 'ranking', label: 'Listings', icon: <Trophy size={20} /> },
        { id: 'analytics', label: 'Analytics', icon: <LineChart size={20} /> },
        { id: 'compare', label: 'Comparison', icon: <Scale size={20} /> },
        { id: 'weights', label: 'Scoring', icon: <Settings size={20} /> },
    ];

    return (
        <aside className="premium-sidebar">
            <div className="sidebar-header">
                <div className="brand-badge">
                    <Shield className="brand-icon" size={24} />
                    <div className="brand-glow" />
                </div>
                <div className="brand-text">
                    <span className="brand-name">MedAdmin</span>
                    <span className="brand-cycle">Cycle 2026</span>
                </div>
            </div>

            <nav className="sidebar-nav-pro">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-btn-pro ${currentView === item.id ? 'active' : ''}`}
                        onClick={() => setView(item.id)}
                    >
                        <div className="nav-icon-wrap">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                        {currentView === item.id && (
                            <motion.div
                                className="nav-active-indicator"
                                layoutId="activeNav"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer-pro">
                <button className="logout-btn-pro" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Terminate Session</span>
                </button>
            </div>
        </aside>
    );
}
