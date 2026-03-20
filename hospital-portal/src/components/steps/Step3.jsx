import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step3({ form, setForm }) {
    return (
        <StepLayout
            title="Step C: Bank Details & Statutory Compliance"
            subtitle="Provide bank details and indicate registration/accreditation status."
            icon="📜"
        >
            <div className="form-section-divider full-width">
                <h4>Bank Details</h4>
            </div>
            <div className="form-grid-3 full-width">
                <Field label="Bank Name" name="bank_name" form={form} setForm={setForm} />
                <Field label="Account Number" name="account_no" form={form} setForm={setForm} />
                <Field label="IFSC Code" name="ifsc_code" form={form} setForm={setForm} />
            </div>
            <div className="form-grid-3 full-width" style={{ marginTop: '12px' }}>
                <Toggle label="ECS Mandate form attached?" name="ecs_mandate_attached" form={form} setForm={setForm} />
                <Toggle label="Income Tax Exemption (80G / 12A)?" name="it_exemption" form={form} setForm={setForm} />
                
                {form.it_exemption === 'Yes' && (
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input 
                                type="checkbox" 
                                id="it_perm" 
                                checked={form.it_exemption_permanent === 'Yes'} 
                                onChange={(e) => setForm({ 
                                    ...form, 
                                    it_exemption_permanent: e.target.checked ? 'Yes' : 'No',
                                    it_exemption_valid_until: e.target.checked ? '' : form.it_exemption_valid_until 
                                })}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                            />
                            <label htmlFor="it_perm" style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: 'var(--text-main)' }}>
                                Exemption Valid Permanent
                            </label>
                        </div>
                        {form.it_exemption_permanent !== 'Yes' && (
                            <Field label="IT Exemption Valid Upto" name="it_exemption_valid_until" type="date" required form={form} setForm={setForm} />
                        )}
                    </div>
                )}
            </div>
            <div style={{ marginBottom: '12px' }} />

            <div className="form-section-divider full-width">
                <h4>Statutory Compliance</h4>
            </div>
            <div className="form-grid-3">
                <Toggle label="NABH Accredited" name="nabh_accredited" form={form} setForm={setForm} />
                <Toggle label="NABL Accredited" name="nabl_accredited" form={form} setForm={setForm} />
                <Toggle label="JCI Accredited" name="jci_accredited" form={form} setForm={setForm} />
                <Toggle label="Fire Safety NOC" name="fire_safety_clearance" form={form} setForm={setForm} />
                <Toggle label="Biomedical Waste Clearance" name="biomedical_waste_clearance" form={form} setForm={setForm} />
                <Toggle label="AERB Approval" name="aerb_approval" form={form} setForm={setForm} />
                <Toggle label="Pharmacy License" name="pharmacy_license" form={form} setForm={setForm} />
                <Toggle label="Lift Safety Clearance" name="lift_safety_clearance" form={form} setForm={setForm} />
                <Toggle label="Clinical Establishment Act Registration" name="cea_registration" form={form} setForm={setForm} />
                <Toggle label="Pollution Control Board Certificate" name="pollution_control_certificate" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
