import React from 'react';
import { StepLayout } from './StepLayout';
import { SearchableSpecialtySelect } from '../SearchableSpecialtySelect';

export function Step9({ form, setForm }) {
    const onAdd = (s) => !form.specialties.includes(s) && setForm({ ...form, specialties: [...form.specialties, s] });
    const onRemove = (s) => setForm({ ...form, specialties: form.specialties.filter(x => x !== s) });

    return (
        <StepLayout
            title="Step E: Clinical Specialties"
            subtitle="Select all specialties available at your hospital."
            icon="🩺"
        >
            <div className="full-width">
                <SearchableSpecialtySelect selected={form.specialties} onAdd={onAdd} onRemove={onRemove} />
            </div>
        </StepLayout>
    );
}
