import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step7({ form, setForm }) {
    return (
        <StepLayout
            title="Step G: Support Facilities"
            subtitle="Additional hospital support services."
            icon="🚑"
        >
            <div className="form-grid-2">
                <Toggle label="Pathology Lab (24x7)" name="pathology_lab" form={form} setForm={setForm} />
                <Toggle label="Pharmacy (24x7)" name="pharmacy_24x7" form={form} setForm={setForm} />
                <Toggle label="Trauma Support (24x7)" name="trauma_support_24x7" form={form} setForm={setForm} />
                <Toggle label="Corporate Help Desk" name="corporate_help_desk" form={form} setForm={setForm} />
                <div className="form-group">
                    <label className="form-label">Ambulance Facility</label>
                    <div className="radio-group-modern">
                        {['No', 'Basic', 'ALS'].map(v => (
                            <button key={v} type="button" className={`radio-btn ${form.ambulance_facility === v ? 'active' : ''}`} onClick={() => setForm({ ...form, ambulance_facility: v })}>{v}</button>
                        ))}
                    </div>
                </div>
                <Toggle label="Free Ambulance Pickup (within 10km)?" name="ambulance_free_pickup" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
