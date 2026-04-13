import React from 'react';
import { Field, Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';
import { Landmark } from 'lucide-react';

export function Step15({ form, setForm, errors }) {
    const handleDiscountChange = (value) => {
        // Remove non-numeric characters
        let numeric = value.replace(/[^0-9]/g, '');
        // Limit to 100%
        if (parseInt(numeric) > 100) numeric = '100';
        
        setForm({ 
            ...form, 
            ongc_discount_percent: numeric
        });
    };

    const displayValue = form.ongc_discount_percent ? `${form.ongc_discount_percent}%` : '';

    return (
        <StepLayout
            title="Step K: Financials"
            subtitle="Financial terms and discounts for empanelment."
            icon="💰"
        >
            <div className="full-width">
                <Toggle
                    label="Acceptability of CGHS rates for empanelment?"
                    name="cghs_rates_acceptable"
                    form={form}
                    setForm={setForm}
                    required={true}
                    error={errors?.cghs_rates_acceptable}
                    hint="Please confirm if your hospital accepts the standard CGHS rate list."
                />

                <div className="form-group" style={{ marginTop: '24px' }}>
                    <label className="form-label">
                        Please mention the discounts which you would be offering to ONGC over and above the general public rates. <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                        <input
                            type="text"
                            value={displayValue}
                            onChange={(e) => handleDiscountChange(e.target.value)}
                            className={`form-input ${errors?.ongc_discount_percent ? 'error' : ''}`}
                            placeholder="e.g. 10%"
                        />
                    </div>
                    <p className="form-hint" style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <Landmark size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />
                        Enter numeric percentage only.
                    </p>
                    {errors?.ongc_discount_percent && <p className="error-text">{errors.ongc_discount_percent}</p>}
                </div>
            </div>
        </StepLayout>
    );
}
