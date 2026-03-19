import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';
import { Plus, Trash2 } from 'lucide-react';

export function Step8({ form, setForm, errors = {} }) {
    const addArrayItem = (key, initial) => {
        const arr = [...(form[key] || [])];
        arr.push(initial);
        setForm({ ...form, [key]: arr });
    };

    const removeArrayItem = (key, idx) => {
        const arr = [...(form[key] || [])];
        arr.splice(idx, 1);
        setForm({ ...form, [key]: arr });
    };

    const updateArrayField = (key, idx, field, val) => {
        const arr = [...(form[key] || [])];
        arr[idx] = { ...arr[idx], [field]: val };
        setForm({ ...form, [key]: arr });
    };

    return (
        <StepLayout
            title="Step K: History & Associations"
            subtitle="Terms of association and historical data."
            icon="🏛️"
        >
            <div className="form-grid-3 full-width">
                <Field label="Date of Inception of Hospital" name="date_of_inception" form={form} setForm={setForm} type="date" required error={errors.date_of_inception} />
                <Toggle label="Previous Association with ONGC ?" name="ongc_association" form={form} setForm={setForm} />
                {form.ongc_association === 'Yes' && (
                    <Field label="Years of Association (with ONGC)" name="ongc_association_years" form={form} setForm={setForm} type="number" />
                )}
            </div>

            <div className="form-section-divider full-width">
                <h4>Organizations / PSUs on Panel</h4>
            </div>
            <div className="array-manager full-width">
                {(form.panel_organizations || []).map((org, idx) => (
                    <div key={idx} className="array-card-premium">
                        <div className="array-card-header">
                            <h5>Organization - {idx + 1}</h5>
                            <button className="icon-btn-danger" onClick={() => removeArrayItem('panel_organizations', idx)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="form-grid-2">
                            <Field label="Organization Name" name={`org_name_${idx}`} form={{ [`org_name_${idx}`]: org.name }} setForm={(obj) => updateArrayField('panel_organizations', idx, 'name', obj[`org_name_${idx}`])} />
                            <Field label="Associated Since (Year)" name={`org_year_${idx}`} form={{ [`org_year_${idx}`]: org.since_year }} setForm={(obj) => updateArrayField('panel_organizations', idx, 'since_year', obj[`org_year_${idx}`])} type="number" />
                        </div>
                    </div>
                ))}
                <button className="btn-add-item" onClick={() => addArrayItem('panel_organizations', { name: '', since_year: '' })}>
                    <Plus size={16} /> Add Organization
                </button>
            </div>

            <div className="form-section-divider full-width">
                <h4>Insurance / TPA Tie-Ups</h4>
            </div>
            <div className="array-manager full-width">
                {(form.tpa_tieups || []).map((tpa, idx) => (
                    <div key={idx} className="array-card-premium">
                        <div className="array-card-header">
                            <h5>TPA / Insurance TieUp - {idx + 1}</h5>
                            <button className="icon-btn-danger" onClick={() => removeArrayItem('tpa_tieups', idx)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <Field label="TPA Name" name={`tpa_name_${idx}`} form={{ [`tpa_name_${idx}`]: tpa.name }} setForm={(obj) => updateArrayField('tpa_tieups', idx, 'name', obj[`tpa_name_${idx}`])} />
                    </div>
                ))}
                <button className="btn-add-item" onClick={() => addArrayItem('tpa_tieups', { name: '' })}>
                    <Plus size={16} /> Add TPA Tie-Up
                </button>
            </div>

            <div className="form-section-divider full-width">
                <h4>ONGC Patient Footfall (Previous Years)</h4>
            </div>
            <div className="form-grid-3">
                <Field label="Patients 2023 (Jan-2023 to Dec-2023)" name="fy_22_23" form={{ fy_22_23: form.ongc_patient_count.fy_22_23 }} setForm={v => setForm({ ...form, ongc_patient_count: { ...form.ongc_patient_count, fy_22_23: v.fy_22_23 } })} type="number" />
                <Field label="Patients 2024 (Jan-2024 to Dec-2024)" name="fy_23_24" form={{ fy_23_24: form.ongc_patient_count.fy_23_24 }} setForm={v => setForm({ ...form, ongc_patient_count: { ...form.ongc_patient_count, fy_23_24: v.fy_23_24 } })} type="number" />
                <Field label="Patients 2025 (Jan-2025 to Dec-2025)" name="fy_24_25" form={{ fy_24_25: form.ongc_patient_count.fy_24_25 }} setForm={v => setForm({ ...form, ongc_patient_count: { ...form.ongc_patient_count, fy_24_25: v.fy_24_25 } })} type="number" />
            </div>
        </StepLayout>
    );
}
