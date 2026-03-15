import { useState } from 'react';
import { Search, Download, Target, Bell, User, RefreshCw, LogOut } from 'lucide-react';

export function Topbar({ viewTitle, statsCount, onExportAll, onExportSelected, onRefresh, isLoading, search, setSearch, onLogout }) {
    const [profileOpen, setProfileOpen] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);

    return (
        <header className="premium-topbar">
            <div className="topbar-left">
                <div className="view-indicator">
                    <h1>{viewTitle}</h1>
                    <div className="indicator-meta">
                        <span className="dot" />
                        <p>{statsCount} Hospitals Evaluated • 2026</p>
                    </div>
                </div>
            </div>

            <div className="topbar-right">
                <div className="action-pills">
                    <button className="pill-btn secondary" onClick={onRefresh} disabled={isLoading}>
                        {isLoading ? <RefreshCw size={16} className="spinner" /> : <RefreshCw size={16} />}
                        <span>Sync</span>
                    </button>
                    <button className="pill-btn" onClick={onExportAll}>
                        <Download size={16} />
                        <span>All</span>
                    </button>
                    <button className="pill-btn primary" onClick={onExportSelected}>
                        <Target size={16} />
                        <span>Selected</span>
                    </button>
                </div>
                <div className="v-divider" />
                <div className="control-icons">

                    <div className="icon-wrapper" style={{ position: 'relative' }}>
                        <button className="icon-circ" onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}>
                            <Bell size={18} />
                        </button>
                        {notifOpen && (
                            <div className="notif-dropdown">
                                <div className="dropdown-header"><h3>Notifications</h3></div>
                                <div className="dropdown-body">
                                    <p className="empty-notif">No new notifications</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="icon-wrapper" style={{ position: 'relative' }}>
                        <div className="admin-avatar" onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} style={{ cursor: 'pointer' }}>
                            <User size={18} />
                        </div>
                        {profileOpen && (
                            <div className="profile-dropdown">
                                <div className="user-info">
                                    <h4>Administrator</h4>
                                    <p>System Privileges</p>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="logout-btn" onClick={onLogout}>
                                    <LogOut size={16} />
                                    <span>Secure Logout</span>
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </header>
    );
}
