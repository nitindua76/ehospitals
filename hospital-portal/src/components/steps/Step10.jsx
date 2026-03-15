import React from 'react';
import { Field } from '../ui/InputControls';
import { StepLayout } from './StepLayout';
import { Plus, Trash2 } from 'lucide-react';

export function Step10({ form, setForm, updateArrayField, addArrayItem, removeArrayItem }) {
    return (
        <StepLayout
            title="Step J: Clinical Staff"
            subtitle="Details of doctors and medical personnel."
            icon="👥"
        >
            <Field label="Total Doctors" name="total_doctors" form={form} setForm={setForm} type="number" />
            <Field label="Full-Time Consultants" name="full_time_doctors" form={form} setForm={setForm} type="number" />
            <Field label="Total Nursing Staff" name="total_nursing_staff" form={form} setForm={setForm} type="number" />
            <Field label="Full-Time Nursing" name="full_time_nursing_staff" form={form} setForm={setForm} type="number" />

            <div className="form-section-divider full-width">
                <h4>List of Specialists / Senior Doctors</h4>
            </div>

            <div className="array-manager full-width">
                {form.clinicians.map((cl, idx) => (
                    <div key={idx} className="array-card-premium">
                        <div className="array-card-header">
                            <h5>Clinician {idx + 1}</h5>
                            <button className="icon-btn-danger" onClick={() => removeArrayItem('clinicians', idx)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="form-grid-3">
                            <Field label="Doctor Name" name={`cname_${idx}`} form={{ [`cname_${idx}`]: cl.name }} setForm={(obj) => updateArrayField('clinicians', idx, 'name', obj[`cname_${idx}`])} />
                            <Field label="Specialty" name={`cspec_${idx}`} form={{ [`cspec_${idx}`]: cl.specialty }} setForm={(obj) => updateArrayField('clinicians', idx, 'specialty', obj[`cspec_${idx}`])} />
                            <Field label="Years of Exp." name={`cexp_${idx}`} form={{ [`cexp_${idx}`]: cl.experience }} setForm={(obj) => updateArrayField('clinicians', idx, 'experience', obj[`cexp_${idx}`])} type="number" />
                        </div>
                    </div>
                ))}
                <button className="btn-add-item" onClick={() => addArrayItem('clinicians', { name: '', specialty: '', experience: '' })}>
                    <Plus size={16} /> Add Another Clinician
                </button>
            </div>
        </StepLayout>
    );
}
