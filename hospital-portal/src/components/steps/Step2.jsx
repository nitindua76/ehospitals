import React, { useEffect } from 'react';
import { Field } from '../ui/InputControls';
import { StepLayout } from './StepLayout';
import { Plus, Trash2 } from 'lucide-react';

const REQUIRED_CONTACTS = [
    { purpose: 'Billing', name: '', mobile: '', email: '' },
    { purpose: 'Emergency', name: '', mobile: '', email: '' },
    { purpose: 'Grievance / Feedback', name: '', mobile: '', email: '' },
];

export function Step2({ form, setForm, errors = {}, updateArrayField, addArrayItem, removeArrayItem }) {
    // Ensure minimum 3 nodal contacts always exist
    useEffect(() => {
        if (!form.nodal_contacts || form.nodal_contacts.length < REQUIRED_CONTACTS.length) {
            const existing = form.nodal_contacts || [];
            const merged = REQUIRED_CONTACTS.map((req, i) => ({
                ...req,
                ...(existing[i] || {}),
                purpose: req.purpose,
            }));
            const extra = existing.slice(REQUIRED_CONTACTS.length);
            setForm({ ...form, nodal_contacts: [...merged, ...extra] });
        }
    }, []);

    return (
        <StepLayout
            title="Step B: Address & Nodal"
            subtitle="Provide location details and key contact persons."
            icon="📍"
        >
            <div className="form-group full-width">
                <Field label="Complete Address" name="address" form={form} setForm={setForm} required error={errors.address} />
            </div>
            <div className="nodal-row full-width">
                <Field label="State" name="state" form={form} setForm={setForm} required error={errors.state} />
                <Field label="City" name="city" form={form} setForm={setForm} required error={errors.city} />
                <Field label="Official Phone" name="contact_phone" form={form} setForm={setForm} required error={errors.contact_phone} />
                <Field label="Official Email" name="contact_email" form={form} setForm={setForm} type="email" required error={errors.contact_email} />
            </div>

            <div className="form-section-divider full-width">
                <h4>Nodal Contacts <span className="required">*</span></h4>
                {errors.nodal_contacts && <span className="error-text" style={{ marginLeft: '12px', fontSize: '13px' }}>{errors.nodal_contacts}</span>}
            </div>

            <div className="array-manager full-width">
                {form.nodal_contacts.map((nc, idx) => {
                    const isRequired = idx < REQUIRED_CONTACTS.length;
                    if (isRequired) {
                        return (
                            <div key={idx} className="nodal-row-flat">
                                <div className="purpose-badge">{nc.purpose}</div>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={nc.name}
                                    onChange={e => updateArrayField('nodal_contacts', idx, 'name', e.target.value)}
                                />
                                <input
                                    type="text"
                                    placeholder="Mobile"
                                    value={nc.mobile}
                                    onChange={e => updateArrayField('nodal_contacts', idx, 'mobile', e.target.value)}
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={nc.email || ''}
                                    onChange={e => updateArrayField('nodal_contacts', idx, 'email', e.target.value)}
                                />
                            </div>
                        );
                    }
                    return (
                        <div key={idx} className="array-card-premium">
                            <div className="array-card-header">
                                <h5>Contact {idx + 1}</h5>
                                <button className="icon-btn-danger" onClick={() => removeArrayItem('nodal_contacts', idx)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="nodal-row">
                                <Field label="Purpose" name={`purpose_${idx}`} form={{ [`purpose_${idx}`]: nc.purpose }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'purpose', obj[`purpose_${idx}`])} />
                                <Field label="Name" name={`name_${idx}`} form={{ [`name_${idx}`]: nc.name }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'name', obj[`name_${idx}`])} />
                                <Field label="Mobile" name={`mobile_${idx}`} form={{ [`mobile_${idx}`]: nc.mobile }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'mobile', obj[`mobile_${idx}`])} />
                                <Field label="Email" name={`email_${idx}`} form={{ [`email_${idx}`]: nc.email || '' }} setForm={(obj) => updateArrayField('nodal_contacts', idx, 'email', obj[`email_${idx}`])} type="email" />
                            </div>
                        </div>
                    );
                })}
                <button className="btn-add-item" onClick={() => addArrayItem('nodal_contacts', { purpose: '', name: '', mobile: '', email: '' })}>
                    <Plus size={16} /> Add Another Contact
                </button>
            </div>
        </StepLayout>
    );
}
