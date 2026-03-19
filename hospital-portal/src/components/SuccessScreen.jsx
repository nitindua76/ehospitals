import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, FileText, BadgeCheck } from 'lucide-react';

export function SuccessScreen({ data, onReset }) {
    const referenceId = data?.hospital?._id || data?.id || 'EMP-2026-XP92';

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
                        <h3>What's Next?</h3>
                        <div className="steps-list">
                            <div className="modern-step-item completed">
                                <div className="step-dot"><CheckCircle2 size={14} /></div>
                                <span>Application Received</span>
                            </div>
                            <div className="modern-step-item pending">
                                <div className="step-dot" />
                                <span>Document Verification</span>
                            </div>
                            <div className="modern-step-item pending">
                                <div className="step-dot" />
                                <span>Clinical Assessment</span>
                            </div>
                        </div>
                    </div>

                    <div className="success-action-group">
                        <button className="btn-premium-primary" onClick={onReset}>
                            <Home size={16} />
                            <span>Return to Dashboard</span>
                        </button>
                        <button className="btn-premium-ghost">
                            <FileText size={16} />
                            <span>Download Receipt</span>
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
