import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step8({ form, setForm }) {
    return (
        <StepLayout
            title="Step H: CGHS & ONGC"
            subtitle="Terms of association and historical data."
            icon="📈"
        >
            <Toggle label="Acceptable to CGHS Rates?" name="cghs_rates_acceptable" form={form} setForm={setForm} />
            <Field label="ONGC Discount offered (%)" name="ongc_discount_percent" form={form} setForm={setForm} type="number" max="100" />
            <Toggle label="Previous ONGC Association?" name="ongc_association" form={form} setForm={setForm} />
            {form.ongc_association === 'Yes' && (
                <Field label="Years of Association" name="ongc_association_years" form={form} setForm={setForm} type="number" />
            )}
            <div className="form-section-divider full-width">
                <h4>ONGC Patient Footfall (Previous FYs)</h4>
            </div>
            <div className="form-grid-2">
                <Field label="Patients FY 2023-24" name="fy_23_24" form={{ fy_23_24: form.ongc_patient_count.fy_23_24 }} setForm={v => setForm({ ...form, ongc_patient_count: { ...form.ongc_patient_count, fy_23_24: v.fy_23_24 } })} type="number" />
                <Field label="Patients FY 2024-25" name="fy_24_25" form={{ fy_24_25: form.ongc_patient_count.fy_24_25 }} setForm={v => setForm({ ...form, ongc_patient_count: { ...form.ongc_patient_count, fy_24_25: v.fy_24_25 } })} type="number" />
            </div>
        </StepLayout>
    );
}
