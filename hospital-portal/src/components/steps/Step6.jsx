import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step6({ form, setForm }) {
    return (
        <StepLayout
            title="Step G: Bed Capacity"
            subtitle="Breakdown of available beds by category."
            icon="🛏️"
        >
            <div className="form-grid-3">
                <Field label="General Ward" name="capacity_general" form={{ capacity_general: form.capacity.general }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, general: v.capacity_general } })} type="number" />
                <Field label="Semi-Private" name="capacity_semi" form={{ capacity_semi: form.capacity.semi_private }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, semi_private: v.capacity_semi } })} type="number" />
                <Field label="Private Room" name="capacity_private" form={{ capacity_private: form.capacity.private }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, private: v.capacity_private } })} type="number" />
                <Field label="Private (Single AC)" name="private_single_ac" form={{ private_single_ac: form.capacity.private_single_ac }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, private_single_ac: v.private_single_ac } })} type="number" />
                <Field label="Deluxe AC" name="private_deluxe_ac" form={{ private_deluxe_ac: form.capacity.private_deluxe_ac }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, private_deluxe_ac: v.private_deluxe_ac } })} type="number" />
                <Field label="Suite" name="private_suite" form={{ private_suite: form.capacity.private_suite }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, private_suite: v.private_suite } })} type="number" />
                <Field label="ICU / CCU" name="capacity_icu" form={{ capacity_icu: form.capacity.icu }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, icu: v.capacity_icu } })} type="number" />
                <Field label="HDU / Step-down" name="capacity_hdu" form={{ capacity_hdu: form.capacity.hdu }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, hdu: v.capacity_hdu } })} type="number" />
            </div>
        </StepLayout>
    );
}
