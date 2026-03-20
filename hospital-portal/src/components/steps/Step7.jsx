import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step7({ form, setForm }) {
    return (
        <StepLayout
            title="Step H: Support Facilities"
            subtitle="Additional hospital support services."
            icon="🚑"
        >
            <div className="form-grid-2">
                <Toggle label="Surgical & Trauma Support (24x7)" name="trauma_support_24x7" form={form} setForm={setForm} />
                <Toggle label="Corporate Help Desk" name="corporate_help_desk" form={form} setForm={setForm} />
            </div>
        </StepLayout>
    );
}
