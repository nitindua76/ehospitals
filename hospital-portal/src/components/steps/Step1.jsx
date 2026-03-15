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
            <Field label="Brand Name" name="brand_name" form={form} setForm={setForm} hint="If different from legal name" />
            <Field label="PAN Number" name="pan_number" form={form} setForm={setForm} />
            <Field label="GST Number" name="gst_number" form={form} setForm={setForm} />

            <div className="form-group full-width">
                <label className="form-label">Hospital Type</label>
                <div className="radio-group-modern">
                    {['Single-Specialty', 'Multi-Specialty', 'Eye-Bank', 'Diagnostic-Center'].map(t => (
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
            </div>

            <div className="form-group full-width">
                <label className="form-label">Sector / Category</label>
                <div className="radio-group-modern">
                    {['Government', 'Private', 'Trust', 'Corporate'].map(t => (
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
                    <label className="form-label">MSME Status</label>
                    <div className="radio-group-modern">
                        {['Yes', 'No'].map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.msme_status === v ? 'active' : ''}`} onClick={() => setForm({ ...form, msme_status: v })}>{v}</button>
                        ))}
                    </div>
                </div>
                {form.msme_status === 'Yes' && (
                    <Field label="MSME Category" name="msme_type" form={form} setForm={setForm} />
                )}
            </div>
        </StepLayout>
    );
}
