import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step6({ form, setForm }) {
    return (
        <StepLayout
            title="Step F: Bed Capacity"
            subtitle="Breakdown of available beds by category."
            icon="🛏️"
        >
            <div className="form-grid-3">
                <Field label="General Ward" name="capacity_general" form={{ capacity_general: form.capacity.general }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, general: v.capacity_general } })} type="number" />
                <Field label="Semi-Private" name="capacity_semi" form={{ capacity_semi: form.capacity.semi_private }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, semi_private: v.capacity_semi } })} type="number" />
                <Field label="Private Room" name="capacity_private" form={{ capacity_private: form.capacity.private }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, private: v.capacity_private } })} type="number" />
                <Field label="ICU / CCU" name="capacity_icu" form={{ capacity_icu: form.capacity.icu }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, icu: v.capacity_icu } })} type="number" />
                <Field label="HDU / Step-down" name="capacity_hdu" form={{ capacity_hdu: form.capacity.hdu }} setForm={v => setForm({ ...form, capacity: { ...form.capacity, hdu: v.capacity_hdu } })} type="number" />
            </div>
            <div className="form-group full-width" style={{ marginTop: 20 }}>
                <Field label="Total Effective Beds" name="total_beds" form={form} setForm={setForm} type="number" required />
            </div>
            <Toggle label="Schedule of Tariffs Attached?" name="tariffs_attached" form={form} setForm={setForm} />
        </StepLayout>
    );
}
