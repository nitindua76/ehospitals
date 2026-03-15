import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step3({ form, setForm }) {
    return (
        <StepLayout
            title="Step C: Compliance"
            subtitle="Indicate registration and accreditation status."
            icon="📜"
        >
            <div className="form-grid-2">
                <Toggle label="NABH Accredited" name="nabh_accredited" form={form} setForm={setForm} />
                <Toggle label="NABL Accredited" name="nabl_accredited" form={form} setForm={setForm} />
                <Toggle label="JCI Accredited" name="jci_accredited" form={form} setForm={setForm} />
                <Toggle label="Fire Safety Clearance" name="fire_safety_clearance" form={form} setForm={setForm} />
                <Toggle label="Biomedical Waste Clearance" name="biomedical_waste_clearance" form={form} setForm={setForm} />
                <Toggle label="AERB Approval" name="aerb_approval" form={form} setForm={setForm} />
                <Toggle label="Pharmacy License" name="pharmacy_license" form={form} setForm={setForm} />
                <Toggle label="Lift Safety Clearance" name="lift_safety_clearance" form={form} setForm={setForm} />
                <Toggle label="CEA Registration" name="cea_registration" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
