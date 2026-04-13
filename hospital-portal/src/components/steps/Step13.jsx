import React, { useRef } from 'react';
import { StepLayout } from './StepLayout';
import { Upload, X, FileCheck, Loader2, Download, Eye } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export function Step13({ form, attachedFiles, setAttachedFiles }) {
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

    const removeFile = async (key) => {
        const token = sessionStorage.getItem('token');
        try {
            await axios.post(`${API}/hospital-auth/remove-upload`, { field: key }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttachedFiles(prev => ({ ...prev, [key]: null }));
        } catch (err) {
            alert('Failed to remove file from server: ' + (err.response?.data?.error || err.message));
        }
    };
    
    const downloadFile = async (fileId, fileName) => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`${API}/hospital-auth/files/${fileId}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'Document.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert('Download failed');
        }
    };

    const DOCS = [
        { key: 'pan', label: 'PAN Card Copy', required: true },
        { key: 'gst', label: 'GST Registration', required: true },
        ...(form.msme_status === 'Yes' ? [{ key: 'mse_certificate', label: 'MSE Certificate', required: true }] : []),
        ...(form.nabh_accredited === 'Yes' ? [{ key: 'nabh_certificate', label: 'NABH Accreditation Certificate', required: true }] : []),
        ...(form.nabl_accredited === 'Yes' ? [{ key: 'nabl_certificate', label: 'NABL Accreditation Certificate', required: true }] : []),
        ...(form.jci_accredited === 'Yes' ? [{ key: 'jci_certificate', label: 'JCI Accreditation Certificate', required: true }] : []),
        ...(form.fire_safety_clearance === 'Yes' ? [{ key: 'fire_safety', label: 'Fire Safety Clearance', required: true }] : []),
        ...(form.biomedical_waste_clearance === 'Yes' ? [{ key: 'biomedical', label: 'BMW Management Approval', required: true }] : []),
        ...(form.pharmacy_license === 'Yes' ? [{ key: 'pharmacy', label: 'Pharmacy License', required: true }] : []),
        ...(form.aerb_approval === 'Yes' ? [{ key: 'aerb_approval', label: 'AERB Approval Certificate', required: true }] : []),
        ...(form.pollution_control_certificate === 'Yes' ? [{ key: 'pollution_control', label: 'Pollution Control Cert.', required: true }] : []),
        ...(form.lift_safety_clearance === 'Yes' ? [{ key: 'lift_safety', label: 'Lift Safety Clearance', required: true }] : []),
        ...(form.cea_registration === 'Yes' ? [{ key: 'cea_registration', label: 'CEA Registration Certificate', required: true }] : []),
        { key: 'bank_ecs', label: 'Bank/ECS Details (Signed)', required: true, download: '/templates/ECS Mandate Form.pdf' },
        ...(form.mri_scan === 'Outsourced' ? [{ key: 'mri_declaration', label: 'MRI Outsourced Declaration', required: true }] : []),
        ...(form.pet_ct_scan === 'Outsourced' ? [{ key: 'pet_ct_declaration', label: 'PET-CT Outsourced Declaration', required: true }] : []),
    ];

    return (
        <StepLayout title="Step M: Document Uploads" subtitle="Attach mandatory PDF documents. All uploads are mandatory for submission." icon="📎">
            <div className="doc-upload-grid full-width">
                {DOCS.map(doc => (
                    <div key={doc.key} className={`doc-card ${attachedFiles[doc.key] ? 'has-file' : ''}`}>
                        <div className="doc-info">
                            <span className="doc-label">
                                {doc.label} {doc.required && <span className="required">*</span>}
                            </span>
                            {doc.download && (
                                <a href={doc.download} download className="doc-template-link" onClick={e => { e.stopPropagation(); }}>
                                    <FileCheck size={12} /> Download Template
                                </a>
                            )}
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
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button 
                                        className="check-doc" 
                                        onClick={() => downloadFile(attachedFiles[doc.key].id, `${doc.label.replace(/[^a-z0-9]/gi, '_')}.pdf`)} 
                                        title="Download & Check"
                                        style={{ color: '#3498db', background: 'rgba(52, 152, 219, 0.1)', border: 'none', padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        <Eye size={16} />
                                    </button>
                                    <button className="remove-doc" onClick={() => removeFile(doc.key)} title="Remove"><X size={16} /></button>
                                </div>
                            ) : (
                                <label className="upload-doc-btn" style={{ cursor: 'pointer' }}>
                                    <Upload size={16} />
                                    <input type="file" style={{ display: 'none' }} onChange={e => handleFile(doc.key, e)} accept="application/pdf" />
                                </label>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </StepLayout>
    );
}
