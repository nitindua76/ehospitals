import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react'

import './index.css'
import './App.css'

import { Header } from './components/Header'
import { Stepper } from './components/Stepper'
import { StepContent } from './components/StepContent'
import { SuccessScreen } from './components/SuccessScreen'
import { HospitalLoginScreen } from './components/HospitalLoginScreen'

const API = import.meta.env.VITE_API_URL || '/api'

const STEPS = [
    { id: 1, label: 'A: Basic Details', icon: '🏥' },
    { id: 2, label: 'B: Address & Nodal', icon: '📍' },
    { id: 3, label: 'C: Compliance', icon: '📜' },
    { id: 4, label: 'D: Clinical Services', icon: '👩‍⚕️' },
    { id: 5, label: 'E: Facilities', icon: '🏢' },
    { id: 6, label: 'F: Capacity', icon: '🛏️' },
    { id: 7, label: 'G: Support Services', icon: '🤝' },
    { id: 8, label: 'H: Commercials', icon: '💰' },
    { id: 9, label: 'I: Experience', icon: '📅' },
    { id: 10, label: 'J: Manpower', icon: '👥' },
    { id: 11, label: 'K: Other Info', icon: '💡' },
    { id: 12, label: 'L: Declaration', icon: '✅' },
    { id: 13, label: 'M: Documents', icon: '📎' },
    { id: 14, label: 'Review', icon: '🔍' },
]

const defaultForm = {
    name: '', brand_name: '', pan_number: '', gst_number: '', msme_status: 'No', msme_type: 'None', type: 'Multi-Specialty',
    address: '', city: '', state: '', contact_phone: '', contact_email: '', nodal_contacts: [{ purpose: 'Admission', name: '', mobile: '' }],
    nabh_accredited: 'No', nabl_accredited: 'No', jci_accredited: 'No', fire_safety_clearance: 'No', biomedical_waste_clearance: 'No', aerb_approval: 'No', pharmacy_license: 'No', lift_safety_clearance: 'No', cea_registration: 'No',
    emergency_department: 'No', blood_bank: 'No', cathlab: 'No', organ_transplant: 'No', dialysis_unit: 'No', opd_services: 'No', ipd_services: 'No',
    ct_scan: 'No Scan', mri_scan: 'No MRI', pet_ct_scan: 'No', digital_xray: 'No', ultrasound: 'No',
    specialties: [],
    capacity: { general: '', semi_private: '', private: '', icu: '', hdu: '' }, total_beds: '', tariffs_attached: 'No',
    pathology_lab: 'No', pharmacy_24x7: 'No', trauma_support_24x7: 'No', corporate_help_desk: 'No', ambulance_facility: 'No', ambulance_free_pickup: 'No',
    cghs_rates_acceptable: 'No', ongc_discount_percent: '', ongc_association: 'No', ongc_association_years: '', ongc_patient_count: { fy_23_24: '', fy_24_25: '' },
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
        if (!hospitalAuth || hospitalAuth.has_submitted) return;
        const loadDraft = async () => {
            setLoading(true)
            try {
                const res = await axios.get(`${API}/hospital-auth/me`, {
                    headers: { Authorization: `Bearer ${hospitalAuth.token}` }
                })
                if (res.data) {
                    setForm(f => ({ ...f, ...res.data }))
                    if (res.data.current_step) {
                        setStep(res.data.current_step)
                        setMaxStep(res.data.current_step)
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

    const validate = (s) => {
        const e = {}
        if (s === 1 && !form.name.trim()) e.name = 'Hospital name required'
        setErrors(e)
        return Object.keys(e).length === 0
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
        if (!validate(step)) return
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

    if (submitted) return <><Header hospitalName={hospitalAuth.name} hospitalId={hospitalAuth.hospitalId} onSignOut={signOut} /><SuccessScreen data={submitted} onReset={signOut} /></>

    if (hospitalAuth.has_submitted && !submitted) {
        return (
            <div className="portal-layout">
                <Header hospitalName={hospitalAuth.name} hospitalId={hospitalAuth.hospitalId} onSignOut={signOut} />
                <SuccessScreen data={{ hospital: { _id: hospitalAuth.hospitalId } }} onReset={signOut} />
            </div>
        )
    }

    return (
        <div className="portal-layout">
            <Header hospitalName={hospitalAuth.name} hospitalId={hospitalAuth.hospitalId} onSignOut={signOut} />

            <main className="portal-main">
                <Stepper steps={STEPS} currentStep={step} maxStep={maxStep} onStepClick={(s) => { saveDraft(maxStep); setStep(s) }} />

                <motion.div
                    className="form-card-premium"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <StepContent
                        step={step}
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        updateArrayField={updateArrayField}
                        addArrayItem={addArrayItem}
                        removeArrayItem={removeArrayItem}
                        attachedFiles={attachedFiles}
                        setAttachedFiles={setAttachedFiles}
                    />

                    <div className="form-nav-premium">
                        <button className="btn-premium ghost" onClick={prev} disabled={step === 1}>
                            <ChevronLeft size={18} /> Back
                        </button>
                        <div className="step-counter-pro">Stage {step} of {STEPS.length}</div>
                        {step < STEPS.length ? (
                            <button className="btn-premium primary" onClick={next}>
                                Next Step <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button className="btn-premium primary success" onClick={submit} disabled={loading}>
                                {loading ? <Loader2 className="spinner" size={20} /> : <><Send size={18} /> Finalize & Submit</>}
                            </button>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    )
}
