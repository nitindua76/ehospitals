import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step12({ form, setForm }) {
    return (
        <StepLayout
            title="Step L: Declaration"
            subtitle="Final confirmations and achievements."
            icon="✅"
        >
            <div className="full-width">
                <Toggle label="I declare that this hospital is not blacklisted by any government/private agency." name="declaration_no_blacklisting" form={{ declaration_no_blacklisting: form.declaration_no_blacklisting ? 'Yes' : 'No' }} setForm={(v) => setForm({ ...form, declaration_no_blacklisting: v.declaration_no_blacklisting === 'Yes' })} />
                <div className="form-group" style={{ marginTop: 20 }}>
                    <label className="form-label">Key Achievements / Awards</label>
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
