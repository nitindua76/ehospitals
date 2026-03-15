import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step5({ form, setForm }) {
    return (
        <StepLayout
            title="Step E: Diagnostic Services"
            subtitle="Imaging and laboratory capabilities."
            icon="🔬"
        >
            <div className="form-grid-2">
                <div className="form-group">
                    <label className="form-label">CT Scan Facility</label>
                    <div className="radio-group-modern">
                        {['No Scan', 'Single-Slice', 'Multi-Slice'].map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.ct_scan === v ? 'active' : ''}`} onClick={() => setForm({ ...form, ct_scan: v })}>{v}</button>
                        ))}
                    </div>
                </div>
                <div className="form-group">
                    <label className="form-label">MRI Scan Facility</label>
                    <div className="radio-group-modern">
                        {['No MRI', '0.5 Tesla', '1.5 Tesla', '3.0 Tesla'].map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.mri_scan === v ? 'active' : ''}`} onClick={() => setForm({ ...form, mri_scan: v })}>{v}</button>
                        ))}
                    </div>
                </div>
                <Toggle label="PET-CT Scan" name="pet_ct_scan" form={form} setForm={setForm} />
                <Toggle label="Digital X-Ray" name="digital_xray" form={form} setForm={setForm} />
                <Toggle label="Ultrasound / Color Doppler" name="ultrasound" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
