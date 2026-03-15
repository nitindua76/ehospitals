import React from 'react';
import { StepLayout } from './StepLayout';
import { Eye, CheckCircle2 } from 'lucide-react';

export function Step14({ form }) {
    return (
        <StepLayout title="Review Application" subtitle="Please verify all information before final submission." icon="🔍">
            <div className="review-container-premium full-width">
                <div className="review-notice">
                    <Eye size={20} />
                    <p>Information once submitted cannot be edited. Please review carefully.</p>
                </div>

                <div className="review-summary-grid">
                    <div className="review-item">
                        <span className="review-label">Hospital Name</span>
                        <span className="review-val">{form.name}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Sector / Category</span>
                        <span className="review-val">{form.ownership_type || form.type}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">MSME Status</span>
                        <span className="review-val">{form.msme_status === 'Yes' ? form.msme_type : 'Not Registered'}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Contact Email</span>
                        <span className="review-val">{form.contact_email || 'Not Provided'}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">City, State</span>
                        <span className="review-val">{form.city}, {form.state}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Total Beds</span>
                        <span className="review-val">{form.total_beds} ({form.capacity?.icu} ICU)</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Specialties</span>
                        <span className="review-val">{form.specialties?.length || 0} Registered</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Total Doctors</span>
                        <span className="review-val">{form.total_doctors || '0'} ({form.full_time_doctors || '0'} Full-Time)</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Nursing Staff</span>
                        <span className="review-val">{form.total_nursing_staff || '0'} Total</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">NABH Accreditation</span>
                        <span className="review-val">{form.nabh_accredited}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">JCI Accreditation</span>
                        <span className="review-val">{form.jci_accredited}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Fire Safety</span>
                        <span className="review-val">{form.fire_safety_clearance}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Emergency Dept</span>
                        <span className="review-val">{form.emergency_department}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">Blood Bank</span>
                        <span className="review-val">{form.blood_bank}</span>
                    </div>
                    <div className="review-item">
                        <span className="review-label">ONGC Discount</span>
                        <span className="review-val">{form.ongc_discount_percent ? `${form.ongc_discount_percent}%` : 'None'}</span>
                    </div>
                </div>

                <div className="final-declaration">
                    <CheckCircle2 size={16} />
                    <span>I confirm that all provided details are accurate to the best of my knowledge.</span>
                </div>
            </div>
        </StepLayout>
    );
}
