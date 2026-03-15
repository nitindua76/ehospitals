import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Loader2, PlusCircle, LogIn, Building } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '/api';

export function HospitalLoginScreen({ onAuth }) {
    const [mode, setMode] = useState('login'); // 'login' or 'register'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'login') {
                const res = await axios.post(`${API}/hospital-auth/login`, { username, password });
                onAuth(res.data);
            } else {
                await axios.post(`${API}/hospital-auth/register`, { name, username, password, type: 'Multi-Specialty', total_beds: 0 });
                setSuccess('Registration successful! Please login.');
                setMode('login');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Operation failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-viewport">
            <div className="login-mesh-bg" />
            <motion.div
                className="login-card-pro"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <div className="login-tabs">
                    <button
                        className={`tab-btn ${mode === 'login' ? 'active' : ''}`}
                        onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                    >
                        <LogIn size={16} /> Login
                    </button>
                    <button
                        className={`tab-btn ${mode === 'register' ? 'active' : ''}`}
                        onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                    >
                        <PlusCircle size={16} /> Register
                    </button>
                </div>

                <div className="login-brand">
                    <div className="brand-icon-pro">
                        <Shield className="shield-icon" size={32} />
                    </div>
                    <h1>{mode === 'login' ? 'Hospital Panel' : 'Join the Network'}</h1>
                    <p>{mode === 'login' ? 'On-boarding & Collaboration Portal' : 'Create an account to start your application'}</p>
                </div>

                <form className="login-form-pro" onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {mode === 'register' && (
                            <motion.div
                                className="input-group-pro"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label>Hospital Official Name</label>
                                <div className="input-field-pro">
                                    <Building size={18} className="field-icon" />
                                    <input
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        placeholder="Enter Full Hospital Name"
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="input-group-pro">
                        <label>Portal Username</label>
                        <div className="input-field-pro">
                            <User size={18} className="field-icon" />
                            <input
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Choose a unique ID"
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group-pro">
                        <label>Secure Access Key</label>
                        <div className="input-field-pro">
                            <Lock size={18} className="field-icon" />
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && <div className="login-error-pro">{error}</div>}
                    {success && <div className="login-success-pro">{success}</div>}

                    <button type="submit" className="login-submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="spinner" size={20} /> : (
                            <>
                                <span>{mode === 'login' ? 'Enter Portal' : 'Create Account'}</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="login-footer-pro">
                    <p>Authorized access points only. Protocol 256-BIT Active.</p>
                </div>
            </motion.div>
        </div>
    );
}
