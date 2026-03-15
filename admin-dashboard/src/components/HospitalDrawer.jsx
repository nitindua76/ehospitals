import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building, MapPin, Activity, Bed, ShieldCheck, Download, FileText, Target, Users, Landmark } from 'lucide-react';

export function HospitalDrawer({ hospital, onClose, onToggleSelect, downloadFile }) {
    if (!hospital) return null;

    const renderDocument = (key, label, attachField) => {
        if (!hospital[attachField] && !hospital.attachments?.[key]) return null;
        return (
            <div key={key} className="doc-card-mini">
                <div className="doc-meta">
                    <FileText size={16} className="doc-icon" />
                    <span>{label}</span>
                </div>
                <button className="doc-dl-btn" onClick={() => downloadFile(`/hospitals/${hospital._id}/documents/${key}`, `${hospital.name}_${key}.pdf`)}>
                    <Download size={14} />
                </button>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className="modal-overlay-pro" onClick={onClose}>
                <motion.div
                    className="premium-modal"
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="modal-header-pro">
                        <div className="header-base">
                            <div className="h-score-badge">
                                <span className="score-val">{(hospital.overallScore || 0).toFixed(1)}</span>
                                <span className="score-lbl">Score</span>
                            </div>
                            <div className="h-identity">
                                <h2>{hospital.name}</h2>
                                <p><MapPin size={14} style={{ marginRight: 4 }} /> {hospital.address}, {hospital.city}, {hospital.state}</p>
                            </div>
                        </div>
                        <button className="close-drawer-btn" onClick={onClose}><X size={20} /></button>
                    </div>

                    <div className="modal-body-pro">
                        <div className="modal-grid">
                            {/* SECTION 1: Company Profile & Core Info */}
                            <div className="modal-section full-width">
                                <div className="m-section-head">
                                    <Building size={18} />
                                    <h3>Corporate Profile & Core Identification</h3>
                                </div>
                                <div className="m-detail-grid">
                                    <div className="m-det-item"><label>Entity Name</label><span>{hospital.name}</span></div>
                                    <div className="m-det-item"><label>Brand Name</label><span>{hospital.brand_name || 'N/A'}</span></div>
                                    <div className="m-det-item"><label>PAN Number</label><span>{hospital.pan_number || 'N/A'}</span></div>
                                    <div className="m-det-item"><label>GST Number</label><span>{hospital.gst_number || 'N/A'}</span></div>
                                    <div className="m-det-item"><label>Operations Type</label><span>{hospital.type}</span></div>
                                    <div className="m-det-item"><label>Sector</label><span className={`status-tag ${(hospital.ownership_type || '').toLowerCase()}`}>{hospital.ownership_type}</span></div>
                                    <div className="m-det-item"><label>MSME Status</label><span>{hospital.msme_status === 'Yes' ? hospital.msme_type : 'Not Registered'}</span></div>
                                    <div className="m-det-item"><label>Hospital Age</label><span>{hospital.hospital_age ? `${hospital.hospital_age} Years` : 'N/A'}</span></div>
                                </div>
                            </div>

                            {/* SECTION 1b: Address & Comms */}
                            <div className="modal-section full-width">
                                <div className="m-section-head">
                                    <MapPin size={18} />
                                    <h3>Address & Communications Contact</h3>
                                </div>
                                <div className="m-detail-grid">
                                    <div className="m-det-item"><label>HQ Edit</label><span>{hospital.address || 'N/A'}, {hospital.city}, {hospital.state}</span></div>
                                    <div className="m-det-item"><label>Primary Phone</label><span>{hospital.contact_phone || 'N/A'}</span></div>
                                    <div className="m-det-item"><label>Primary Email</label><span>{hospital.contact_email || 'N/A'}</span></div>
                                </div>
                                {hospital.nodal_contacts?.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, display: 'block' }}>Nodal Officers</label>
                                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                            {hospital.nodal_contacts.map((contact, idx) => (
                                                <div key={idx} style={{ background: 'var(--surface-light)', padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border)' }}>
                                                    <strong style={{ color: 'var(--primary)' }}>{contact.purpose}</strong>
                                                    <div style={{ color: 'white', marginTop: 4 }}>{contact.name} ({contact.designation})</div>
                                                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>{contact.mobile} | {contact.email}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION 2: Capacity & Infrastructure */}
                            <div className="modal-section">
                                <div className="m-section-head">
                                    <Bed size={18} />
                                    <h3>Bed Inventory & Capacity</h3>
                                </div>
                                <div className="m-detail-grid">
                                    <div className="m-det-item"><label>Total Capacity</label><span>{hospital.total_beds || 0} Beds</span></div>
                                    <div className="m-det-item"><label>General Ward</label><span>{hospital.capacity?.general || 0} Beds</span></div>
                                    <div className="m-det-item"><label>Semi-Private</label><span>{hospital.capacity?.semi_private || 0} Beds</span></div>
                                    <div className="m-det-item"><label>Private</label><span>{hospital.capacity?.private || 0} Beds</span></div>
                                    <div className="m-det-item"><label>ICU Unit</label><span>{hospital.capacity?.icu || 0} Beds</span></div>
                                    <div className="m-det-item"><label>HDU Unit</label><span>{hospital.capacity?.hdu || 0} Beds</span></div>
                                </div>
                            </div>

                            {/* SECTION 3: Clinical Readiness */}
                            <div className="modal-section full-width">
                                <div className="m-section-head">
                                    <Activity size={18} />
                                    <h3>Clinical Services & General Facilities</h3>
                                </div>
                                <div className="modal-tags">
                                    {hospital.facilities?.emergency && <span className="m-tag">24x7 Emergency</span>}
                                    {hospital.facilities?.blood_bank && <span className="m-tag">Blood Bank</span>}
                                    {hospital.facilities?.dialysis && <span className="m-tag">Dialysis Unit</span>}
                                    {hospital.facilities?.cathlab && <span className="m-tag">Cathlab</span>}
                                    {hospital.facilities?.central_oxygen && <span className="m-tag">Central O₂ System</span>}
                                    {hospital.facilities?.ventilator && <span className="m-tag">Ventilator Support</span>}

                                    {hospital.diagnostic_facilities?.ct === 'Yes' && <span className="m-tag">CT Scan</span>}
                                    {hospital.diagnostic_facilities?.mri === 'Yes' && <span className="m-tag">MRI</span>}
                                    {hospital.diagnostic_facilities?.pet_ct === 'Yes' && <span className="m-tag">PET-CT</span>}

                                    {hospital.general_facilities?.central_ac && <span className="m-tag success">Central AC</span>}
                                    {hospital.general_facilities?.power_backup && <span className="m-tag success">Power Backup</span>}
                                    {hospital.general_facilities?.attendant_lodging && <span className="m-tag success">Attendant Lodging</span>}
                                    {hospital.ambulance_facility === 'Yes' && <span className="m-tag success">Ambulance {hospital.ambulance_free_pickup === 'Yes' && '(Free Pickup)'}</span>}
                                </div>
                                <div style={{ marginTop: 16 }}>
                                    <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Declared Specialties</label>
                                    <p style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5, color: 'white' }}>
                                        {hospital.specialties?.length ? hospital.specialties.join(' • ') : 'Not Disclosed'}
                                    </p>
                                </div>
                                {hospital.diagnostic_facilities?.outsourced_info && (
                                    <div style={{ marginTop: 16 }}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Outsourced Diagnostics Setup</label>
                                        <p style={{ fontSize: 13, marginTop: 4, lineHeight: 1.5, color: '#fbbf24' }}>
                                            {hospital.diagnostic_facilities.outsourced_info}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* SECTION 4: Workforce Capital */}
                            <div className="modal-section full-width">
                                <div className="m-section-head">
                                    <Users size={18} />
                                    <h3>Workforce Capital</h3>
                                </div>
                                <div className="m-detail-grid">
                                    <div className="m-det-item"><label>Total Consultants</label><span>{hospital.consultants?.length || 0} Doctors</span></div>
                                    <div className="m-det-item"><label>Paramedical Staff</label><span>{hospital.paramedical_staff_count || 0} Staff</span></div>
                                    <div className="m-det-item"><label>Support Staff</label><span>{hospital.support_staff_count || 0} Staff</span></div>
                                </div>
                                {hospital.consultants?.length > 0 && (
                                    <div style={{ marginTop: 16 }}>
                                        <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Key Medical Officers</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                                            {hospital.consultants.slice(0, 10).map((doc, idx) => (
                                                <div key={idx} style={{ background: 'var(--bg-card)', padding: '8px 12px', borderRadius: 8, fontSize: 13, border: '1px solid var(--border)' }}>
                                                    <div style={{ color: 'white', fontWeight: 500 }}>{doc.name}</div>
                                                    <div style={{ color: 'var(--primary)', marginTop: 2, fontSize: 12 }}>{doc.specialty} • {doc.type}</div>
                                                    <div style={{ color: 'var(--text-muted)', marginTop: 2, fontSize: 12 }}>{doc.experience_years} Years Exp. | {doc.mobile}</div>
                                                </div>
                                            ))}
                                            {hospital.consultants.length > 10 && <div style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>+ {hospital.consultants.length - 10} More...</div>}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SECTION 5: Commercials */}
                            <div className="modal-section">
                                <div className="m-section-head">
                                    <Landmark size={18} />
                                    <h3>Commercials & Finances</h3>
                                </div>
                                <div className="m-detail-grid">
                                    <div className="m-det-item"><label>CGHS Rates Acceptable</label><span className={hospital.cghs_rates_acceptable === 'Yes' ? 'm-tag success' : 'm-tag danger'} style={{ display: 'inline-block', width: 'max-content', padding: '4px 8px' }}>{hospital.cghs_rates_acceptable || 'No'}</span></div>
                                    <div className="m-det-item"><label>ONGC Target Discount</label><span>{hospital.ongc_discount_percent || 0}%</span></div>
                                    <div className="m-det-item"><label>Bank ECS Enabled</label><span>{hospital.bank_ecs_attached ? 'Yes' : 'No'}</span></div>
                                    <div className="m-det-item"><label>Income Tax Exemption</label><span>{hospital.it_exemption === 'Yes' ? `Available until ${new Date(hospital.it_exemption_valid_until).toLocaleDateString()}` : 'No'}</span></div>
                                </div>
                            </div>

                            {/* SECTION 6: Clearances & Documents */}
                            <div className="modal-section full-width">
                                <div className="m-section-head">
                                    <ShieldCheck size={18} />
                                    <h3>Statutory Clearances, Quality Accreditations & Audits</h3>
                                </div>
                                <div className="m-detail-grid">
                                    <div className="m-det-item"><label>NABH Certification</label><span className={hospital.accreditations?.nabh ? 'success-text' : 'danger-text'}>{hospital.accreditations?.nabh ? 'Yes' : 'No'}</span></div>
                                    <div className="m-det-item"><label>JCI Certification</label><span className={hospital.accreditations?.jci ? 'success-text' : 'danger-text'}>{hospital.accreditations?.jci ? 'Yes' : 'No'}</span></div>
                                    <div className="m-det-item"><label>NABL Certification</label><span className={hospital.accreditations?.nabl ? 'success-text' : 'danger-text'}>{hospital.accreditations?.nabl ? 'Yes' : 'No'}</span></div>
                                    <div className="m-det-item"><label>Accreditation Expiration</label><span>{hospital.accreditation_valid_until ? new Date(hospital.accreditation_valid_until).toLocaleDateString() : 'N/A'}</span></div>

                                    <div className="m-det-item"><label>Fire Safety</label><span className={hospital.statutory_clearances?.fire_safety ? 'success-text' : 'danger-text'}>{hospital.statutory_clearances?.fire_safety ? 'Cleared' : 'Lacking'}</span></div>
                                    <div className="m-det-item"><label>Bio-Medical Waste</label><span className={hospital.statutory_clearances?.biomedical_waste ? 'success-text' : 'danger-text'}>{hospital.statutory_clearances?.biomedical_waste ? 'Cleared' : 'Lacking'}</span></div>
                                    <div className="m-det-item"><label>AERB Approval</label><span className={hospital.statutory_clearances?.aerb_approval ? 'success-text' : 'danger-text'}>{hospital.statutory_clearances?.aerb_approval ? 'Cleared' : 'Lacking'}</span></div>
                                    <div className="m-det-item"><label>Pharmacy License</label><span className={hospital.statutory_clearances?.pharmacy_license ? 'success-text' : 'danger-text'}>{hospital.statutory_clearances?.pharmacy_license ? 'Cleared' : 'Lacking'}</span></div>
                                    <div className="m-det-item"><label>Lift Safety</label><span className={hospital.statutory_clearances?.lift_safety ? 'success-text' : 'danger-text'}>{hospital.statutory_clearances?.lift_safety ? 'Cleared' : 'Lacking'}</span></div>
                                    <div className="m-det-item"><label>CEA Registration</label><span className={hospital.statutory_clearances?.cea_registration ? 'success-text' : 'danger-text'}>{hospital.statutory_clearances?.cea_registration ? 'Cleared' : 'Lacking'}</span></div>
                                </div>

                                <div className="doc-download-list" style={{ marginTop: 20 }}>
                                    {renderDocument('pan', 'PAN Card', 'pan_attached')}
                                    {renderDocument('gst', 'GST Registration', 'gst_attached')}
                                    {renderDocument('accreditation', 'Quality Accreditation', 'accreditation_attached')}
                                    {renderDocument('fire_safety', 'Fire NOC', 'fire_safety_attached')}
                                    {renderDocument('bank_ecs', 'Bank ECS', 'bank_ecs_attached')}
                                    {renderDocument('tariff', 'Schedule of Charges', 'tariff_attached')}
                                    {renderDocument('biomedical', 'BMW Mgmt', 'biomedical_attached')}
                                    {renderDocument('pharmacy', 'Pharmacy License', 'pharmacy_attached')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer-pro">
                        <button
                            className={`select-toggle-btn ${hospital.selected ? 'selected' : ''}`}
                            onClick={() => onToggleSelect(hospital._id)}
                            style={{ margin: 0 }}
                        >
                            {hospital.selected ? <ShieldCheck size={18} /> : <Target size={18} />}
                            <span>{hospital.selected ? 'Selected for Panel & Sandbox' : 'Select for Final Panel'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

