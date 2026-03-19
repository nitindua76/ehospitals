import React from 'react';
import { Field } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step1({ form, setForm, errors }) {
    return (
        <StepLayout
            title="Step A: Basic Details"
            subtitle="Tell us about your hospital's identity and primary type."
            icon="🏥"
        >
            <Field label="Hospital Name" name="name" form={form} setForm={setForm} required error={errors.name} />
            <Field label="Brand Name" name="brand_name" form={form} setForm={setForm} required error={errors.brand_name} />
            <Field label="PAN Number" name="pan_number" form={form} setForm={setForm} required error={errors.pan_number} />
            <Field label="GST Number" name="gst_number" form={form} setForm={setForm} required error={errors.gst_number} />

            <div className="form-group full-width">
                <label className="form-label">Hospital Type <span className="required">*</span></label>
                <div className="radio-group-modern">
                    {['Single-Specialty', 'Multi-Specialty', 'EyeCare Center', 'Diagnostic-Center'].map(t => (
                        <button
                            key={t}
                            type="button"
                            className={`radio-btn ${form.type === t ? 'active' : ''}`}
                            onClick={() => setForm({ ...form, type: t })}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {errors.type && <span className="error-text">{errors.type}</span>}
            </div>

            <div className="form-group full-width">
                <label className="form-label">Sector / Category <span className="required">*</span></label>
                <div className="radio-group-modern">
                    {['Government', 'Private/Corporate', 'Trust'].map(t => (
                        <button
                            key={t}
                            type="button"
                            className={`radio-btn ${form.ownership_type === t ? 'active' : ''}`}
                            onClick={() => setForm({ ...form, ownership_type: t })}
                        >
                            {t}
                        </button>
                    ))}
                </div>
                {errors.ownership_type && <span className="error-text">Please select a sector</span>}
            </div>

            <div className="form-grid-2">
                <div className="form-group">
                    <label className="form-label">MSE Status <span className="required">*</span></label>
                    <div className="radio-group-modern">
                        {['Yes', 'No'].map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.msme_status === v ? 'active' : ''}`} onClick={() => setForm({ ...form, msme_status: v })}>{v}</button>
                        ))}
                    </div>
                    {errors.msme_status && <span className="error-text">{errors.msme_status}</span>}
                </div>
                {form.msme_status === 'Yes' && (
                    <Field label="MSE Category" name="msme_type" form={form} setForm={setForm} required error={errors.msme_type} />
                )}
            </div>
        </StepLayout>
    );
}
