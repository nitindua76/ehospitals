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
            <div className="form-section-divider full-width">
                <h4>Core Clinical Services</h4>
            </div>
            <div className="form-grid-3 full-width">
                <Toggle label="Emergency Department" name="emergency_department" form={form} setForm={setForm} />
                <Toggle label="OPD Services" name="opd_services" form={form} setForm={setForm} />
                <Toggle label="IPD Services" name="ipd_services" form={form} setForm={setForm} />
                <Toggle label="Blood Bank" name="blood_bank" form={form} setForm={setForm} />
                <Toggle label="Dialysis Unit" name="dialysis_unit" form={form} setForm={setForm} />
                <Toggle label="Organ Transplant" name="organ_transplant" form={form} setForm={setForm} />
            </div>

            <div className="form-section-divider full-width">
                <h4>Infrastructure & Specialized Facilities</h4>
            </div>
            <div className="form-grid-3 full-width">
                <Toggle label="Advanced Trauma Care" name="advanced_trauma_care" form={form} setForm={setForm} />
                <Toggle label="Trauma Center" name="trauma_facility" form={form} setForm={setForm} />
                <Toggle label="Burns Unit" name="burns_unit" form={form} setForm={setForm} />
                <Toggle label="CATHLAB" name="cathlab" form={form} setForm={setForm} />
                <Toggle label="ICU Facility" name="icu_facility" form={form} setForm={setForm} />
                <Toggle label="Ventilator Facility" name="ventilator_facility" form={form} setForm={setForm} />
                <Toggle label="NICU" name="nicu_facility" form={form} setForm={setForm} />
                <Toggle label="PICU" name="picu_facility" form={form} setForm={setForm} />
                <Toggle label="IPD Psychiatry" name="ipd_psychiatry" form={form} setForm={setForm} />
                <Toggle label="IVF Facility" name="ivf_facility" form={form} setForm={setForm} />
                <Toggle label="Central Oxygen Supply" name="central_oxygen_supply" form={form} setForm={setForm} />
                <Toggle label="Interventional Radiology" name="interventional_radiology" form={form} setForm={setForm} />
                <Toggle label="Nuclear Medicine" name="nuclear_medicine" form={form} setForm={setForm} />
                <Toggle label="Physiotherapy" name="physiotherapy" form={form} setForm={setForm} />
                <Toggle label="Pain Management" name="pain_management" form={form} setForm={setForm} />
                <Toggle label="Palliative Care" name="palliative_care" form={form} setForm={setForm} />
                <Toggle label="Air Ambulance Tie-Up" name="air_ambulance_tieup" form={form} setForm={setForm} />
                <Toggle label="Hearse Van Tie-Up" name="hearse_van_tieup" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
