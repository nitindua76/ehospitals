import React, { useRef } from 'react';
import { StepLayout } from './StepLayout';
import { Upload, X, FileCheck, Loader2 } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export function Step13({ attachedFiles, setAttachedFiles }) {
    const fileInputs = {
        pan: useRef(), gst: useRef(), accreditation: useRef(), fire_safety: useRef(),
        bank_ecs: useRef(), tariff: useRef(), biomedical: useRef(), pharmacy: useRef()
    };

    const handleFile = async (key, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = sessionStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('field', key);

        setAttachedFiles(prev => ({ ...prev, [key]: { loading: true } }));

        try {
            const res = await axios.post(`${API}/hospital-auth/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
            });
            setAttachedFiles(prev => ({ ...prev, [key]: { id: res.data.fileId, name: file.name, loading: false } }));
        } catch (err) {
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
            setAttachedFiles(prev => ({ ...prev, [key]: null }));
        }
    };

    const removeFile = (key) => setAttachedFiles(prev => ({ ...prev, [key]: null }));

    const DOCS = [
        { key: 'pan', label: 'PAN Card Copy' },
        { key: 'gst', label: 'GST Registration' },
        { key: 'accreditation', label: 'Accreditation Certificate' },
        { key: 'fire_safety', label: 'Fire Safety Clearance' },
        { key: 'bank_ecs', label: 'Bank/ECS Details' },
        { key: 'tariff', label: 'Schedule of Tariffs' },
        { key: 'biomedical', label: 'BMW Management Approval' },
        { key: 'pharmacy', label: 'Pharmacy License' },
    ];

    return (
        <StepLayout title="Step M: Document Uploads" subtitle="Attach mandatory PDF documents for verification." icon="📎">
            <div className="doc-upload-grid full-width">
                {DOCS.map(doc => (
                    <div key={doc.key} className={`doc-card ${attachedFiles[doc.key] ? 'has-file' : ''}`}>
                        <div className="doc-info">
                            <span className="doc-label">{doc.label}</span>
                            {attachedFiles[doc.key] && (
                                <span className="doc-status">
                                    <FileCheck size={12} /> {attachedFiles[doc.key].name}
                                </span>
                            )}
                        </div>
                        <div className="doc-actions">
                            {attachedFiles[doc.key]?.loading ? (
                                <Loader2 className="spinner" size={18} />
                            ) : attachedFiles[doc.key] ? (
                                <button className="remove-doc" onClick={() => removeFile(doc.key)}><X size={16} /></button>
                            ) : (
                                <button className="upload-doc-btn" onClick={() => fileInputs[doc.key].current.click()}>
                                    <Upload size={16} />
                                </button>
                            )}
                        </div>
                        <input type="file" ref={fileInputs[doc.key]} style={{ display: 'none' }} onChange={e => handleFile(doc.key, e)} accept="application/pdf" />
                    </div>
                ))}
            </div>
        </StepLayout>
    );
}
