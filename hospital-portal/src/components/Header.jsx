import React from 'react';
import { Shield, LogOut, User } from 'lucide-react';

export function Header({ hospitalName, hospitalId, onSignOut }) {
    return (
        <header className="premium-header">
            <div className="header-content">
                <div className="header-left">
                    <div className="logo-container">
                        <Shield size={22} />
                    </div>
                    <div className="brand-stack">
                        <h1 className="brand-name">MedCollaborate</h1>
                        <p className="brand-tagline">Empanelment Gateway</p>
                    </div>
                </div>

                <div className="header-right">
                    <div className="user-profile">
                        <div className="profile-info">
                            <span className="user-name">{hospitalName}</span>
                            <span className="user-id">ID: {hospitalId.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="profile-avatar">
                            <User size={16} />
                        </div>
                    </div>
                    <div className="header-divider" />
                    <button className="sign-out-btn" onClick={onSignOut} title="Sign Out">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}
