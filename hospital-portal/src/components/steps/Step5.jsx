import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';
import { Download, Info } from 'lucide-react';

export function Step5({ form, setForm, errors = {} }) {
    const diagnosticOptions = ['Not Available', 'InHouse', 'Outsourced'];

    const renderOutsourcedInfo = (fieldValue) => {
        if (fieldValue !== 'Outsourced') return null;
        return (
            <div className="outsourced-alert-premium">
                <Info size={16} />
                <div className="alert-content">
                    <p>Has to upload signed declaration for the same.</p>
                    <a href="/templates/Draft declaration.docx" className="download-form-link" download>
                        <Download size={14} /> Download Declaration Form
                    </a>
                </div>
            </div>
        );
    };

    return (
        <StepLayout
            title="Step F: Diagnostic Services"
            subtitle="Imaging and laboratory capabilities."
            icon="🔬"
        >
            <div className="form-grid-2 full-width">
                <div className="form-group">
                    <label className="form-label">
                        PET-CT Scan <span className="required">*</span>
                    </label>
                    <div className={`radio-group-modern ${errors.pet_ct_scan ? 'input-error-ring' : ''}`}>
                        {diagnosticOptions.map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.pet_ct_scan === v ? 'active' : ''}`} onClick={() => setForm({ ...form, pet_ct_scan: v })}>{v}</button>
                        ))}
                    </div>
                    {errors.pet_ct_scan && <p className="error-text">{errors.pet_ct_scan}</p>}
                    {renderOutsourcedInfo(form.pet_ct_scan)}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        MRI Scan Facility <span className="required">*</span>
                    </label>
                    <div className={`radio-group-modern ${errors.mri_scan ? 'input-error-ring' : ''}`}>
                        {diagnosticOptions.map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.mri_scan === v ? 'active' : ''}`} onClick={() => setForm({ ...form, mri_scan: v })}>{v}</button>
                        ))}
                    </div>
                    {errors.mri_scan && <p className="error-text">{errors.mri_scan}</p>}
                    {renderOutsourcedInfo(form.mri_scan)}
                </div>

                <div className="form-group">
                    <label className="form-label">
                        CT Scan Facility <span className="required">*</span>
                    </label>
                    <div className="radio-group-modern">
                        {['No Scan', 'Single-Slice', 'Multi-Slice'].map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.ct_scan === v ? 'active' : ''}`} onClick={() => setForm({ ...form, ct_scan: v })}>{v}</button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="form-grid-3 full-width" style={{ marginTop: '20px' }}>
                <Toggle label="ECHO / CARDIOLOGY" name="echo_cardiology" form={form} setForm={setForm} />
                <Toggle label="Digital X-Ray" name="digital_xray" form={form} setForm={setForm} />
                <Toggle label="Ultrasound / Color Doppler" name="ultrasound" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
