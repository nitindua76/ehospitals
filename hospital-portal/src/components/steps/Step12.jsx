import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step12({ form, setForm, errors }) {
    return (
        <StepLayout
            title="Step L: Declaration"
            subtitle="Final confirmations and achievements."
            icon="✅"
        >
            <div className="full-width">
                <Toggle
                    label="I declare that this hospital is not blacklisted by any government/private agency."
                    name="declaration_no_blacklisting"
                    form={{ declaration_no_blacklisting: form.declaration_no_blacklisting ? 'Yes' : 'No' }}
                    setForm={(v) => setForm({ ...form, declaration_no_blacklisting: v.declaration_no_blacklisting === 'Yes' })}
                    required={true}
                    error={errors?.declaration_no_blacklisting}
                />
                <div className="form-section-divider full-width">
                    <h4>Authorized Signatory</h4>
                </div>
                <div className="form-grid-3 full-width">
                    <Field label="Signatory Name" name="signatory_name" form={form} setForm={setForm} required={true} error={errors?.signatory_name} />
                    <Field label="Designation" name="signatory_designation" form={form} setForm={setForm} required={true} error={errors?.signatory_designation} />
                    <Field label="Date" name="signatory_date" form={form} setForm={setForm} type="date" required={true} error={errors?.signatory_date} />
                </div>

                <div className="form-group" style={{ marginTop: 24 }}>
                    <label className="form-label">Key Achievements / Awards / Facilities</label>
                    <textarea
                        className="form-input"
                        rows="4"
                        value={form.achievements}
                        onChange={e => setForm({ ...form, achievements: e.target.value })}
                        placeholder="Detail any significant quality certifications or awards..."
                    />
                </div>
            </div>
        </StepLayout>
    );
}
