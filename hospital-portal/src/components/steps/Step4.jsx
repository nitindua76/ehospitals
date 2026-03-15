import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step4({ form, setForm }) {
    return (
        <StepLayout
            title="Step D: Clinical Services"
            subtitle="General clinical facilities available."
            icon="👩‍⚕️"
        >
            <div className="form-grid-2">
                <Toggle label="Emergency Department" name="emergency_department" form={form} setForm={setForm} />
                <Toggle label="Blood Bank" name="blood_bank" form={form} setForm={setForm} />
                <Toggle label="Cathlab" name="cathlab" form={form} setForm={setForm} />
                <Toggle label="Organ Transplant" name="organ_transplant" form={form} setForm={setForm} />
                <Toggle label="Dialysis Unit" name="dialysis_unit" form={form} setForm={setForm} />
                <Toggle label="OPD Services" name="opd_services" form={form} setForm={setForm} />
                <Toggle label="IPD Services" name="ipd_services" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
