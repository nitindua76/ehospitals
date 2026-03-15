import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

export function LoginPage({ onLogin }) {
    const [u, setU] = useState('');
    const [p, setP] = useState('');
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        setLoading(true);
        try {
            const res = await axios.post(`${API}/auth/login`, { username: u, password: p });
            onLogin(res.data.token);
        } catch (err) {
            setErr(err.response?.data?.error || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-viewport-admin">
            <div className="login-mesh-bg-admin" />
            <motion.div
                className="login-card-admin"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="admin-login-head">
                    <div className="admin-shield-icon">
                        <Shield size={32} />
                    </div>
                    <h1>Panel Authority</h1>
                    <p>Official Hospital Selection Infrastructure</p>
                </div>

                <form className="admin-login-form" onSubmit={submit}>
                    <div className="admin-input-group">
                        <label>Admin Username</label>
                        <div className="admin-input-wrap">
                            <User size={18} />
                            <input value={u} onChange={e => setU(e.target.value)} placeholder="admin" required />
                        </div>
                    </div>
                    <div className="admin-input-group">
                        <label>Security Key</label>
                        <div className="admin-input-wrap">
                            <Lock size={18} />
                            <input type="password" value={p} onChange={e => setP(e.target.value)} placeholder="••••••••" required />
                        </div>
                    </div>

                    {err && <div className="admin-login-error">{err}</div>}

                    <button type="submit" className="admin-login-btn" disabled={loading}>
                        {loading ? <Loader2 className="spinner" size={20} /> : (
                            <>
                                <span>Authorize Login</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="admin-login-footer">
                    <p>Standardized Credentials: <code>admin</code> / <code>admin</code></p>
                </div>
            </motion.div>
        </div>
    );
}
