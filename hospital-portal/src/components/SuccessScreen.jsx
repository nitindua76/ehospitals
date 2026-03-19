import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Home, FileText, BadgeCheck, Download } from 'lucide-react';
import { generateHospitalPDF } from '../utils/pdfGenerator';

export function SuccessScreen({ data, form, attachedFiles, onReset, token, loading }) {
    const referenceId = data?.hospital?._id || data?.id || 'EMP-2026-XP92';
    const [downloadProgress, setDownloadProgress] = useState(0);

    const handleDownload = async () => {
        if (!form) {
            alert("Application data not found for PDF generation.");
            return;
        }
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        setDownloadProgress(1);
        try {
            await generateHospitalPDF(form, referenceId, attachedFiles, token, API_URL, (p) => {
                setDownloadProgress(p);
            });
        } finally {
            setTimeout(() => setDownloadProgress(0), 1500);
        }
    };

    return (
        <div className="success-overlay">
            <motion.div
                className="success-card-premium"
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 120 }}
            >
                <div className="success-header-art">
                    <motion.div
                        className="confetti-burst"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.15, 1] }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        <CheckCircle2 size={72} className="check-icon-main" />
                    </motion.div>
                </div>

                <div className="success-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        Application Submitted!
                    </motion.h1>
                    <motion.p
                        className="success-message"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        Thank you for initiating the empanelment process. Your application has been successfully received and is currently under review.
                    </motion.p>

                    <motion.div
                        className="id-badge-container"
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <span className="id-label">Reference ID</span>
                        <div className="id-value-box">
                            <code>{referenceId}</code>
                        </div>
                    </motion.div>

                    <div className="next-steps-modern">
                        <h3>Mandatory Final Step</h3>
                        <div className="physical-submission-alert">
                            <CheckCircle2 size={16} />
                            <p>Please download the final application PDF below, <strong>physically sign and stamp all pages</strong>, and submit the hard copy to the office for final approval.</p>
                        </div>
                    </div>

                    <div className="success-action-group">
                        <button 
                            className="btn-premium primary success" 
                            onClick={handleDownload}
                            disabled={loading || !form?.name}
                        >
                            {loading ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    >
                                        <Download size={16} />
                                    </motion.div>
                                    <span>Syncing Records...</span>
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    <span>Download Signed Application</span>
                                </>
                            )}
                        </button>

                        <AnimatePresence>
                            {downloadProgress > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="download-progress-container"
                                    style={{ width: '100%', marginTop: '1rem' }}
                                >
                                    <div className="progress-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        <span>Merging Documents...</span>
                                        <span>{downloadProgress}%</span>
                                    </div>
                                    <div className="progress-track" style={{ height: '8px', background: 'rgba(52, 152, 219, 0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div 
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${downloadProgress}%` }}
                                            style={{ height: '100%', background: 'linear-gradient(90deg, #3498db, #2ecc71)', borderRadius: '4px' }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button className="btn-premium-ghost" onClick={onReset}>
                            <Home size={16} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>

                <div className="success-footer-badge">
                    <BadgeCheck size={14} />
                    <span>Secure Submission · 2026 Cycle</span>
                </div>
            </motion.div>
        </div>
    );
}
