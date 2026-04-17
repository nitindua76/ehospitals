import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Download, Upload, Trash2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';

export function SystemView({ api }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleBackup = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const response = await api.get('/admin/db/backup', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/x-gzip' }));
            const link = document.createElement('a');
            link.href = url;
            const date = new Date().toISOString().split('T')[0];
            link.setAttribute('download', `hospital_system_backup_${date}.json.gz`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setMessage({ type: 'success', text: 'Compressed backup (.json.gz) downloaded successfully.' });
        } catch (err) {
            console.error('Backup Error:', err);
            setMessage({ type: 'error', text: 'Backup failed. This may be blocked by local antivirus or a connection timeout.' });
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const isGzip = file.name.endsWith('.gz');
        const msg = isGzip 
            ? 'WARNING: This will overwrite ALL existing records with the compressed backup. Proceed?'
            : 'WARNING: This will overwrite ALL existing records. Proceed?';

        if (!window.confirm(msg)) {
            e.target.value = '';
            return;
        }

        setLoading(true);
        setMessage({ type: 'info', text: 'Uploading and processing backup... please wait.' });
        
        try {
            const formData = new FormData();
            formData.append('backup', file);

            const response = await api.post('/admin/db/restore', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000 // 2 minute timeout for large restores
            });
            
            setMessage({ type: 'success', text: response.data.message });
        } catch (err) {
            console.error('Restore Error:', err);
            setMessage({ type: 'error', text: 'Restore failed: ' + (err.response?.data?.error || err.message) });
        } finally {
            setLoading(false);
            e.target.value = '';
        }
    };

    const handleClear = async () => {
        const confirm = window.prompt('DANGER: This will delete ALL hospital submissions. Type "DELETE" to confirm:');
        if (confirm !== 'DELETE') return;

        setLoading(true);
        try {
            const response = await api.delete('/admin/db/clear');
            setMessage({ type: 'success', text: response.data.message });
        } catch (err) {
            setMessage({ type: 'error', text: 'Clear failed: ' + err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            className="system-view-pro"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
        >
            <div className="maintenance-grid">
                <div className="maintenance-card">
                    <div className="card-m-head">
                        <Database size={24} className="icon-main" />
                        <div className="head-m-text">
                            <h3>Database Lifecycle</h3>
                            <p>Manage empanelment records and binary storage across the system.</p>
                        </div>
                    </div>

                    {message && (
                        <div className={`m-msg ${message.type}`}>
                            <AlertTriangle size={18} />
                            <span>{message.text}</span>
                        </div>
                    )}

                    <div className="m-actions">
                        <div className="m-action-item">
                            <div className="a-meta">
                                <h4>System Backup</h4>
                                <p>Generate a complete snapshot of all clinical and administrative data.</p>
                            </div>
                            <button className="pill-btn primary" onClick={handleBackup} disabled={loading}>
                                <Download size={18} />
                                {loading ? 'Processing...' : 'Export JSON Backup'}
                            </button>
                        </div>

                        <div className="m-action-item">
                            <div className="a-meta">
                                <h4>Data Restoration</h4>
                                <p>Upload a previously generated JSON backup to restore system state.</p>
                            </div>
                            <div className="upload-wrapper">
                                <label className="pill-btn">
                                    <Upload size={18} />
                                    {loading ? 'Processing...' : 'Select Backup File'}
                                    <input type="file" accept=".json,.gz" onChange={handleRestore} hidden disabled={loading} />
                                </label>
                            </div>
                        </div>

                        <div className="m-action-item danger-zone">
                            <div className="a-meta">
                                <h4>Cycle Reset</h4>
                                <p>Wipe all hospital records and attachments for a new empanelment cycle.</p>
                            </div>
                            <button className="pill-btn danger" onClick={handleClear} disabled={loading}>
                                <Trash2 size={18} />
                                {loading ? 'Processing...' : 'Clear All Production Data'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="system-specs-card">
                    <h3>System Security</h3>
                    <div className="spec-list">
                        <div className="spec-item">
                            <ShieldCheck size={18} />
                            <span>JWT Encrypted Sessions</span>
                        </div>
                        <div className="spec-item">
                            <ShieldCheck size={18} />
                            <span>Bcrypt Password Hashing</span>
                        </div>
                        <div className="spec-item">
                            <ShieldCheck size={18} />
                            <span>GridFS Binary Integrity</span>
                        </div>
                    </div>
                    <div className="system-notice">
                        <p>Database management actions are logged under the current administrative session ID for audit purposes.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
