import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, Loader2, ChevronDown, AlertCircle } from 'lucide-react'

import './index.css'
import './App.css'

import { Header } from './components/Header'
import { Stepper } from './components/Stepper'
import { StepContent } from './components/StepContent'
import { SuccessScreen } from './components/SuccessScreen'
import { HospitalLoginScreen } from './components/HospitalLoginScreen'
import { WelcomeScreen } from './components/WelcomeScreen'

const API = import.meta.env.VITE_API_URL || '/api'

const STEPS = [
    { id: 1, label: 'A: Basic Details', icon: '🏥', group: 'Organizational Profile' },
    { id: 2, label: 'B: Address & Nodal', icon: '📍', group: 'Organizational Profile' },
    { id: 3, label: 'C: Statutory Compliance', icon: '📜', group: 'Compliance & Quality' },
    { id: 4, label: 'D: Clinical Services', icon: '👩‍⚕️', group: 'Clinical Capabilities' },
    { id: 9, label: 'E: Clinical Specialties', icon: '🔍', group: 'Clinical Capabilities' },
    { id: 5, label: 'F: Facilities', icon: '🏢', group: 'Facilities' },
    { id: 6, label: 'G: Capacity', icon: '🛏️', group: 'Facilities' },
    { id: 7, label: 'H: Support Facilities', icon: '🛠️', group: 'Facilities' },
    { id: 11, label: 'I: General Facilities', icon: '🌟', group: 'Facilities' },
    { id: 10, label: 'J: Clinical Staff', icon: '👥', group: 'Human Resources' },
    { id: 8, label: 'K: History & Associations', icon: '🏛️', group: 'Business & History' },
    { id: 12, label: 'L: Declaration', icon: '✅', group: 'Finalization' },
    { id: 13, label: 'M: Document Uploads', icon: '📤', group: 'Finalization' },
    { id: 14, label: 'N: Review & Submit', icon: '📋', group: 'Finalization' }
];

const defaultForm = {
    name: '', brand_name: '', pan_number: '', gst_number: '', msme_status: 'No', msme_type: 'None', type: 'Multi-Specialty',
    address: '', city: '', state: '', contact_phone: '', contact_email: '', nodal_contacts: [{ purpose: 'Billing', name: '', mobile: '', email: '' }, { purpose: 'Emergency', name: '', mobile: '', email: '' }, { purpose: 'Grievance / Feedback', name: '', mobile: '', email: '' }],
    nabh_accredited: 'No', nabl_accredited: 'No', jci_accredited: 'No', fire_safety_clearance: 'No', biomedical_waste_clearance: 'No', aerb_approval: 'No', pharmacy_license: 'No', lift_safety_clearance: 'No', cea_registration: 'No', pollution_control_certificate: 'No',
    emergency_department: 'No', blood_bank: 'No', cathlab: 'No', organ_transplant: 'No', dialysis_unit: 'No', opd_services: 'No', ipd_services: 'No',
    advanced_trauma_care: 'No', burns_unit: 'No', ipd_psychiatry: 'No', ivf_facility: 'No', ventilator_facility: 'No', nicu_facility: 'No', picu_facility: 'No',
    central_oxygen_supply: 'No', icu_facility: 'No', trauma_facility: 'No', interventional_radiology: 'No', nuclear_medicine: 'No', physiotherapy: 'No',
    pain_management: 'No', palliative_care: 'No', air_ambulance_tieup: 'No', hearse_van_tieup: 'No',
    ct_scan: 'No Scan', mri_scan: 'Not Available', pet_ct_scan: 'Not Available', echo_cardiology: 'No', digital_xray: 'No', ultrasound: 'No',
    specialties: [],
    capacity: { general: '', semi_private: '', private: '', private_single_ac: '', private_deluxe_ac: '', private_suite: '', icu: '', hdu: '' }, total_beds: '', tariffs_attached: 'No',
    pathology_lab: 'No', pharmacy_24x7: 'No', trauma_support_24x7: 'No', corporate_help_desk: 'No', ambulance_facility: 'No', ambulance_free_pickup: 'No',
    bank_name: '', account_no: '', ifsc_code: '', ecs_mandate_attached: 'No',
    date_of_inception: '', panel_organizations: [], tpa_tieups: [],
    signatory_name: '', signatory_designation: '', signatory_date: '',
    cghs_rates_acceptable: 'No', ongc_discount_percent: '', ongc_association: 'No', ongc_association_years: '', ongc_patient_count: { fy_22_23: '', fy_23_24: '', fy_24_25: '' },
    total_doctors: '', full_time_doctors: '', total_nursing_staff: '', full_time_nursing_staff: '', clinicians: [{ name: '', specialty: '', experience: '' }],
    general_facilities: { parking: false, power_backup: false, central_ac: false, waiting_lounge: false, cafeteria: false, attendant_lodging: false },
    declaration_no_blacklisting: false, achievements: '',
}

export default function App() {
    const [hospitalAuth, setHospitalAuth] = useState(null)
    const [step, setStep] = useState(1)
    const [maxStep, setMaxStep] = useState(1)
    const [form, setForm] = useState(defaultForm)
    const [attachedFiles, setAttachedFiles] = useState({})
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(null)
    const [errors, setErrors] = useState({})
    const [showWelcome, setShowWelcome] = useState(false)

    useEffect(() => {
        // Show welcome only on the first step for hospitals that haven't submitted
        if (hospitalAuth && !hospitalAuth.has_submitted && step === 1 && !submitted) {
            const hasSeen = sessionStorage.getItem('welcome_seen')
            if (!hasSeen) setShowWelcome(true)
        }
    }, [hospitalAuth, step, submitted])

    useEffect(() => {
        const savedToken = sessionStorage.getItem('token') || sessionStorage.getItem('hospital_token')
        if (savedToken) {
            setHospitalAuth({
                token: savedToken,
                name: sessionStorage.getItem('hospital_name'),
                hospitalId: sessionStorage.getItem('hospital_id'),
                has_submitted: sessionStorage.getItem('hospital_submitted') === 'true',
            })
        }
    }, [])

    useEffect(() => {
        if (!hospitalAuth) return;
        const loadDraft = async () => {
            setLoading(true)
            try {
                const res = await axios.get(`${API}/hospital-auth/me`, {
                    headers: { Authorization: `Bearer ${hospitalAuth.token}` }
                })
                if (res.data) {
                    const data = { ...res.data };
                    if (data.date_of_inception) data.date_of_inception = data.date_of_inception.split('T')[0];
                    if (data.signatory_date) data.signatory_date = data.signatory_date.split('T')[0];
                    
                    setForm(f => ({ ...f, ...data }))
                    if (data.current_step) {
                        setStep(data.current_step)
                        setMaxStep(data.current_step)
                    }
                    if (res.data.attachments && typeof res.data.attachments === 'object') {
                        const reconstructedFiles = {}
                        Object.keys(res.data.attachments).forEach(key => {
                            if (res.data.attachments[key]) {
                                reconstructedFiles[key] = {
                                    id: res.data.attachments[key],
                                    name: 'Uploaded Document',
                                    loading: false
                                }
                            }
                        })
                        setAttachedFiles(reconstructedFiles)
                    }
                }
            } catch (e) {
                console.error('Draft load failed:', e)
            } finally {
                setLoading(false)
            }
        }
        loadDraft()
    }, [hospitalAuth?.token])

    if (!hospitalAuth) {
        return <HospitalLoginScreen onAuth={(data) => {
            sessionStorage.setItem('token', data.token)
            sessionStorage.setItem('hospital_name', data.name)
            sessionStorage.setItem('hospital_id', data.hospitalId)
            sessionStorage.setItem('hospital_submitted', data.has_submitted ? 'true' : 'false')
            setHospitalAuth(data)
        }} />
    }

    const signOut = () => {
        sessionStorage.clear()
        setHospitalAuth(null)
        setForm(defaultForm)
        setAttachedFiles({})
        setStep(1)
        setMaxStep(1)
        setSubmitted(null)
    }

    const getStepErrors = (s, formData, files) => {
        const e = {}
        if (s === 1) {
            if (!formData.name?.trim()) e.name = 'Hospital name required'
            if (!formData.brand_name?.trim()) e.brand_name = 'Brand name required'
            if (!formData.pan_number?.trim()) e.pan_number = 'PAN number required'
            if (!formData.gst_number?.trim()) e.gst_number = 'GST number required'
            if (!formData.type) e.type = 'Please select hospital type'
            if (!formData.ownership_type) e.ownership_type = 'Please select sector/category'
            if (!formData.msme_status) e.msme_status = 'Please select MSME status'
            if (formData.msme_status === 'Yes' && !formData.msme_type?.trim()) e.msme_type = 'MSME Category required'
        }
        if (s === 2) {
            if (!formData.address?.trim()) e.address = 'Address required'
            if (!formData.city?.trim()) e.city = 'City required'
            if (!formData.state?.trim()) e.state = 'State required'
            if (!formData.contact_phone?.trim()) e.contact_phone = 'Phone required'
            if (!formData.contact_email?.trim()) e.contact_email = 'Email required'
            
            // Validate first 3 nodal contacts
            const nodalErrors = []
            for (let i = 0; i < 3; i++) {
                const nc = formData.nodal_contacts?.[i] || {}
                if (!nc.name?.trim() || !nc.mobile?.trim() || !nc.email?.trim()) {
                    nodalErrors.push(`Nodal Contact ${i + 1} (${nc.purpose || 'Required'}) Incomplete`)
                }
            }
            if (nodalErrors.length > 0) e.nodal_contacts = nodalErrors[0]
        }
        if (s === 8) {
            if (!formData.date_of_inception) e.date_of_inception = 'Inception date required'
        }
        if (s === 12) {
            if (!formData.declaration_no_blacklisting) e.declaration_no_blacklisting = 'Declaration required'
            if (!formData.signatory_name?.trim()) e.signatory_name = 'Signatory name required'
            if (!formData.signatory_designation?.trim()) e.signatory_designation = 'Designation required'
            if (!formData.signatory_date?.trim()) e.signatory_date = 'Date required'
        }
        if (s === 13) {
            const reqKeys = ['pan', 'gst', 'bank_ecs'];
            if (formData.msme_status === 'Yes') reqKeys.push('mse_certificate');
            if (formData.nabh_accredited === 'Yes') reqKeys.push('nabh_certificate');
            if (formData.nabl_accredited === 'Yes') reqKeys.push('nabl_certificate');
            if (formData.jci_accredited === 'Yes') reqKeys.push('jci_certificate');
            if (formData.fire_safety_clearance === 'Yes') reqKeys.push('fire_safety');
            if (formData.biomedical_waste_clearance === 'Yes') reqKeys.push('biomedical');
            if (formData.pharmacy_license === 'Yes') reqKeys.push('pharmacy');
            if (formData.aerb_approval === 'Yes') reqKeys.push('aerb_approval');
            if (formData.pollution_control_certificate === 'Yes') reqKeys.push('pollution_control');
            if (formData.lift_safety_clearance === 'Yes') reqKeys.push('lift_safety');
            if (formData.cea_registration === 'Yes') reqKeys.push('cea_registration');
            if (formData.mri_scan === 'Outsourced') reqKeys.push('mri_declaration');
            if (formData.pet_ct_scan === 'Outsourced') reqKeys.push('pet_ct_declaration');

            for (const k of reqKeys) {
                if (!files[k] || files[k].loading) {
                    e.uploads = 'All mandatory documents must be uploaded.'
                    break
                }
            }
        }
        return e
    }

    const validate = (s) => {
        const e = getStepErrors(s, form, attachedFiles)
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const validateAll = () => {
        const stepErrors = {}
        const missing = []
        for (let i = 0; i < STEPS.length; i++) {
            const stepId = STEPS[i].id
            const e = getStepErrors(stepId, form, attachedFiles)
            if (Object.keys(e).length > 0) {
                stepErrors[stepId] = true
                Object.values(e).forEach(msg => {
                    if (!missing.includes(msg)) missing.push(msg)
                })
            } else {
                stepErrors[stepId] = false
            }
        }
        return { isValid: missing.length === 0, missing, stepErrors }
    }

    const saveDraft = async (targetMaxStep) => {
        try {
            await axios.put(`${API}/hospital-auth/me`, { ...form, current_step: targetMaxStep || maxStep }, {
                headers: { Authorization: `Bearer ${hospitalAuth.token}` }
            })
            return true
        } catch (e) {
            console.error('Save failed:', e)
            alert('Progress could not be saved. Please check your connection.')
            return false
        }
    }

    const next = async () => {
        if (!validate(STEPS[step - 1].id)) return
        const n = Math.min(step + 1, STEPS.length)
        const newMax = Math.max(maxStep, n)
        const ok = await saveDraft(newMax)
        if (ok) {
            setMaxStep(newMax)
            setStep(n)
        }
    }
    const prev = async () => {
        const p = Math.max(step - 1, 1)
        const ok = await saveDraft(maxStep)
        if (ok) setStep(p)
    }

    const updateArrayField = (field, index, subfield, value) => {
        setForm(f => {
            const arr = [...f[field]]
            arr[index] = { ...arr[index], [subfield]: value }
            return { ...f, [field]: arr }
        })
    }
    const addArrayItem = (field, template) => setForm(f => ({ ...f, [field]: [...f[field], template] }))
    const removeArrayItem = (field, index) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))

    const submit = async () => {
        setLoading(true)
        try {
            await saveDraft(step)
            await axios.post(`${API}/hospital-auth/submit`, {}, {
                headers: { Authorization: `Bearer ${hospitalAuth.token}` }
            })
            sessionStorage.setItem('hospital_submitted', 'true')
            setHospitalAuth(a => ({ ...a, has_submitted: true }))
            setSubmitted({ hospital: { _id: hospitalAuth.hospitalId } })
        } catch (err) {
            alert(err.response?.data?.error || 'Submission failed')
        } finally { setLoading(false) }
    }

    if (submitted) return <><Header hospitalName={hospitalAuth.name} hospitalId={hospitalAuth.hospitalId} onSignOut={signOut} /><SuccessScreen loading={loading} data={submitted} form={form} attachedFiles={attachedFiles} token={hospitalAuth.token} onReset={signOut} /></>

    if (hospitalAuth.has_submitted && !submitted) {
        return (
            <div className="portal-layout">
                <Header hospitalName={hospitalAuth.name} hospitalId={hospitalAuth.hospitalId} onSignOut={signOut} />
                <SuccessScreen data={{ hospital: { _id: hospitalAuth.hospitalId } }} form={form} attachedFiles={attachedFiles} token={hospitalAuth.token} loading={loading} onReset={signOut} />
            </div>
        )
    }

    const stepClickHandler = (s) => { saveDraft(maxStep); setStep(s) }

    return (
        <div className="portal-layout">
            {showWelcome && <WelcomeScreen onStart={() => {
                setShowWelcome(false);
                sessionStorage.setItem('welcome_seen', 'true');
            }} />}
            <Header hospitalName={hospitalAuth.name} hospitalId={hospitalAuth.hospitalId} onSignOut={signOut} />

            <main className="portal-main">
                <Stepper steps={STEPS} currentStep={step} maxStep={maxStep} onStepClick={stepClickHandler} stepErrors={validateAll().stepErrors} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Mobile step selector */}
                    <div className="mobile-step-selector">
                        <button className="step-dropdown-btn" onClick={() => { }}>
                            <span>{STEPS[step - 1].icon} {STEPS[step - 1].label}</span>
                            <ChevronDown size={16} />
                        </button>
                        <div className="step-progress-bar">
                            <div className="step-progress-fill" style={{ width: `${((step) / STEPS.length) * 100}%` }} />
                        </div>
                    </div>

                    <motion.div
                        className="form-card-premium"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                    >
                        <StepContent
                            stepId={STEPS[step - 1].id}
                            hospitalId={hospitalAuth.hospitalId}
                            form={form}
                            setForm={setForm}
                            errors={errors}
                            updateArrayField={updateArrayField}
                            addArrayItem={addArrayItem}
                            removeArrayItem={removeArrayItem}
                            attachedFiles={attachedFiles}
                            setAttachedFiles={setAttachedFiles}
                            validation={validateAll()}
                            token={hospitalAuth.token}
                        />

                        <div className="form-nav-premium">
                            <button className="btn-premium ghost" onClick={prev} disabled={step === 1}>
                                <ChevronLeft size={16} /> Back
                            </button>
                            <div className="step-counter-pro">{step} / {STEPS.length}</div>
                            {step < STEPS.length ? (
                                <button className="btn-premium primary" onClick={next}>
                                    Continue <ChevronRight size={16} />
                                </button>
                            ) : (() => {
                                const { isValid } = validateAll();
                                return (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                                        {!isValid && (
                                            <div className="submit-warning" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--danger)', fontSize: '12px', fontWeight: '700' }}>
                                                <AlertCircle size={14} />
                                                <span>Mandatory fields/uploads missing</span>
                                            </div>
                                        )}
                                        <button 
                                            className={`btn-premium primary success ${!isValid ? 'disabled' : ''}`} 
                                            onClick={submit} 
                                            disabled={loading || !isValid}
                                        >
                                            {loading ? <Loader2 className="spinner" size={18} /> : <><Send size={16} /> Submit Application</>}
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
