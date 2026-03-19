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
            <div className="form-grid-2 full-width">
                <Field label="Total Doctors" name="total_doctors" form={form} setForm={setForm} type="number" />
                <Field label="Full-Time Consultants" name="full_time_doctors" form={form} setForm={setForm} type="number" />
                <Field label="Total Nursing Staff" name="total_nursing_staff" form={form} setForm={setForm} type="number" />
                <Field label="Full-Time Nursing" name="full_time_nursing_staff" form={form} setForm={setForm} type="number" />
            </div>
        </StepLayout>
    );
}
