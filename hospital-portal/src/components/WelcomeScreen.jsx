import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, ShieldCheck, Zap, ArrowRight, Info } from 'lucide-react';

export function WelcomeScreen({ onStart }) {
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="welcome-overlay">
            <motion.div 
                className="welcome-card-premium"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                <div className="welcome-header">
                    <div className="welcome-icon-ring">
                        <ClipboardCheck size={32} color="var(--primary)" />
                    </div>
                    <h1>Hospital Empanelment 2026</h1>
                    <p>Welcome to the digital registration portal. Please review the instructions below to ensure a smooth application process.</p>
                </div>

                <div className="welcome-grid">
                    <div className="instruction-box">
                        <div className="ins-icon"><Zap size={20} /></div>
                        <div className="ins-content">
                            <h6>Preparation Checklist</h6>
                            <ul>
                                <li><strong>IDs</strong>: Keep PAN and GST numbers ready.</li>
                                <li><strong>Quality</strong>: NABH/NABL/JCI certificates (if applicable).</li>
                                <li><strong>Statutory</strong>: Fire Safety, BMW, and Pharmacy licenses.</li>
                                <li><strong>Banking</strong>: Account details and IFSC code.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="instruction-box highlight">
                        <div className="ins-icon"><FileText size={20} /></div>
                        <div className="ins-content">
                            <h6>Application Structure</h6>
                            <p>The form consists of 14 steps (A-N). Your progress is **auto-saved** every time you click "Next". You can log out and resume later using your Reference ID.</p>
                        </div>
                    </div>

                    <div className="instruction-box warning">
                        <div className="ins-icon"><ShieldCheck size={20} /></div>
                        <div className="ins-content">
                            <h6>Physical Submission</h6>
                            <p>Submission is not complete until the <strong>Final PDF</strong> is downloaded, physically signed/stamped on every page, and submitted to the office.</p>
                        </div>
                    </div>

                    <div className="instruction-box info">
                        <div className="ins-icon"><Info size={20} /></div>
                        <div className="ins-content">
                            <h6>Support</h6>
                            <p>If you encounter technical issues or have queries regarding the form fields, please contact the vendor support desk at +91-XXXXXXXXXX.</p>
                        </div>
                    </div>
                </div>

                <div className="welcome-footer">
                    <label className="checkbox-container">
                        <input 
                            type="checkbox" 
                            checked={agreed} 
                            onChange={(e) => setAgreed(e.target.checked)} 
                        />
                        <span className="checkmark"></span>
                        I have read and understood the instructions.
                    </label>

                    <button 
                        className={`btn-welcome-start ${agreed ? 'active' : ''}`}
                        disabled={!agreed}
                        onClick={onStart}
                    >
                        <span>Start Application</span>
                        <ArrowRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
