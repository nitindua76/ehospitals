import React from 'react';
import { Toggle } from '../ui/InputControls';
import { StepLayout } from './StepLayout';

export function Step11({ form, setForm }) {
    const toggleFacility = (f) => setForm({
        ...form,
        general_facilities: { ...form.general_facilities, [f]: !form.general_facilities[f] }
    });

    return (
        <StepLayout
            title="Step I: General Facilities"
            subtitle="General amenities for patients and attendants."
            icon="💡"
        >
            <div className="form-grid-2">
                <Toggle label="Parking" name="parking" form={{ parking: form.general_facilities.parking ? 'Yes' : 'No' }} setForm={() => toggleFacility('parking')} />
                <Toggle label="Power Backup" name="power_backup" form={{ power_backup: form.general_facilities.power_backup ? 'Yes' : 'No' }} setForm={() => toggleFacility('power_backup')} />
                <Toggle label="Central AC" name="central_ac" form={{ central_ac: form.general_facilities.central_ac ? 'Yes' : 'No' }} setForm={() => toggleFacility('central_ac')} />
                <Toggle label="Waiting Lounge" name="waiting_lounge" form={{ waiting_lounge: form.general_facilities.waiting_lounge ? 'Yes' : 'No' }} setForm={() => toggleFacility('waiting_lounge')} />
                <Toggle label="Cafeteria" name="cafeteria" form={{ cafeteria: form.general_facilities.cafeteria ? 'Yes' : 'No' }} setForm={() => toggleFacility('cafeteria')} />
                <Toggle label="Attendant Lodging" name="attendant_lodging" form={{ attendant_lodging: form.general_facilities.attendant_lodging ? 'Yes' : 'No' }} setForm={() => toggleFacility('attendant_lodging')} />
                <Toggle label="Mortuary" name="mortuary" form={{ mortuary: form.general_facilities.mortuary ? 'Yes' : 'No' }} setForm={() => toggleFacility('mortuary')} />
            </div>
        </StepLayout>
    );
}
