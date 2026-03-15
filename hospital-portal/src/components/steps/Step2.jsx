import React from 'react';
import { Field } from '../ui/InputControls';
import { StepLayout } from './StepLayout';
import { Plus, Trash2 } from 'lucide-react';

export function Step2({ form, setForm, updateArrayField, addArrayItem, removeArrayItem }) {
    return (
        <StepLayout
            title="Step B: Address & Nodal"
            subtitle="Provide location details and key contact persons."
            icon="📍"
        >
            <div className="form-group full-width">
                <Field label="Complete Address" name="address" form={form} setForm={setForm} />
            </div>
            <Field label="State" name="state" form={form} setForm={setForm} />
            <Field label="City" name="city" form={form} setForm={setForm} />
            <Field label="Official Phone" name="contact_phone" form={form} setForm={setForm} />
            <Field label="Official Email" name="contact_email" form={form} setForm={setForm} type="email" />

            <div className="form-section-divider full-width">
                <h4>Nodal Contacts</h4>
            </div>

            <div className="array-manager full-width">
                {form.nodal_contacts.map((nc, idx) => (
                    <div key={idx} className="array-card-premium">
                        <div className="array-card-header">
                            <h5>Contact {idx + 1}</h5>
                            <button className="icon-btn-danger" onClick={() => removeArrayItem('nodal_contacts', idx)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="form-grid-3">
                            <Field label="Purpose" name={`purpose_${idx}`} form={{ [`purpose_${idx}`]: nc.purpose }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'purpose', obj[`purpose_${idx}`])} />
                            <Field label="Name" name={`name_${idx}`} form={{ [`name_${idx}`]: nc.name }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'name', obj[`name_${idx}`])} />
                            <Field label="Mobile" name={`mobile_${idx}`} form={{ [`mobile_${idx}`]: nc.mobile }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'mobile', obj[`mobile_${idx}`])} />
                        </div>
                    </div>
                ))}
                <button className="btn-add-item" onClick={() => addArrayItem('nodal_contacts', { purpose: '', name: '', mobile: '' })}>
                    <Plus size={16} /> Add Another Contact
                </button>
            </div>
        </StepLayout>
    );
}
