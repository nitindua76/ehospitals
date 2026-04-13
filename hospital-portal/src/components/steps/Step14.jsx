import React, { useState } from 'react';
import { StepLayout } from './StepLayout';
import { Download, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateHospitalPDF } from '../../utils/pdfGenerator';

export function Step14({ form, hospitalId, validation, attachedFiles, token }) {
    const isInvalid = validation && !validation.isValid;
    const refId = hospitalId || 'DRAFT-MODE';
    const [downloadProgress, setDownloadProgress] = useState(0);

    const downloadReview = async () => {
        const API_URL = import.meta.env.VITE_API_URL || '/api';
        setDownloadProgress(1);
        try {
            await generateHospitalPDF(form, refId, attachedFiles, token, API_URL, (p) => {
                setDownloadProgress(p);
            });
        } finally {
            setTimeout(() => setDownloadProgress(0), 1500);
        }
    };

    return (
        <StepLayout title="Step N: Review & Submit" subtitle="Final look at your application before submission." icon="📋">
            <div className="review-page-container full-width">

                <div className="review-actions-header">
                    <div className="ref-badge">
                        <span className="ref-label">Reference ID</span>
                        <span className="ref-value">{refId}</span>
                    </div>
                </div>

                {isInvalid && (
                    <div className="review-error-banner">
                        <AlertCircle size={20} />
                        <div className="error-text">
                            <h6>Application Incomplete</h6>
                            <p>Please complete all mandatory fields across {validation.missing.length} areas before submitting.</p>
                        </div>
                    </div>
                )}

                <div className="review-main-card">
                    <div className="review-card-icon">
                        <FileText size={48} color="var(--primary)" />
                    </div>
                    <div className="review-card-content">
                        <h4>Application Review</h4>
                        <p>To ensure 100% accuracy, please download your complete application as a professional PDF. Cross-check all fields, documents, and declarations before final submission.</p>

                        <button className="btn-download-pdf large" onClick={downloadReview} type="button">
                            <Download size={20} /> Download Review PDF
                        </button>

                        <AnimatePresence>
                            {downloadProgress > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="download-progress-container"
                                    style={{ width: '100%', marginTop: '1.5rem' }}
                                >
                                    <div className="progress-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                                        <span>Merging Review Package...</span>
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
                    </div>
                </div>

                <div className="review-guidance">
                    <h5><CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Next Steps</h5>
                    <ol>
                        <li>Download the <strong>Review PDF</strong> and check all the details.</li>
                        <li>If everything is correct, click <strong>Submit Application</strong>.</li>
                        <li>After submission, download the <strong>Final PDF</strong>, print on the <strong>Hospital Letterhead</strong>, sign each page, and submit the hard copy.</li>
                    </ol>
                </div>

                <div className="final-confirmation">
                    <label className="checkbox-container">
                        <input
                            type="checkbox"
                            checked={form.declaration_no_blacklisting === true}
                            readOnly
                        />
                        <span className="checkmark"></span>
                        I confirm that this hospital is not blacklisted and all information provided is accurate.
                    </label>
                </div>
            </div>
        </StepLayout>
    );
}
