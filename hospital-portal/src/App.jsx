import { useState, useEffect } from 'react'
import axios from 'axios'
import './index.css'
import './App.css'

import { SPECIALTIES_LIST } from './constants/specialties'

const API = import.meta.env.VITE_API_URL || '/api'

// ── Hospital Login Screen ──────────────────────────────────────────────────
function HospitalLoginScreen({ onAuth }) {
    const [mode, setMode] = useState('login') // 'login' | 'register'
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')      // register only
    const [confirmPwd, setConfirmPwd] = useState('') // register only
    const [loading, setLoading] = useState(false)
    const [err, setErr] = useState('')

    const submit = async (e) => {
        e.preventDefault()
        setErr('')
        if (mode === 'register') {
            if (password !== confirmPwd) return setErr('Passwords do not match')
            if (password.length < 8) return setErr('Password must be at least 8 characters')
            if (!name.trim()) return setErr('Hospital name is required')
        }
        setLoading(true)
        try {
            const endpoint = mode === 'login' ? '/hospital-auth/login' : '/hospital-auth/register'
            const payload = mode === 'login'
                ? { username, password }
                : { username, password, name: name.trim(), type: 'Multi-Specialty', address: '-', city: '-', state: 'Delhi', contact_phone: '0000000000', contact_email: `${username}@hospital.com`, total_beds: 0 }
            const res = await axios.post(`${API}${endpoint}`, payload)
            if (mode === 'register') {
                setMode('login')
                setErr('')
                setPassword('')
                setConfirmPwd('')
                setUsername(username)
                alert('Registration successful! Please log in.')
            } else {
                sessionStorage.setItem('hospital_token', res.data.token)
                sessionStorage.setItem('hospital_name', res.data.name)
                sessionStorage.setItem('hospital_id', res.data.hospitalId)
                onAuth(res.data)
            }
        } catch (e) {
            setErr(e?.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-page">
            <div className="login-bg" />
            <div className="login-card animate-in">
                <div className="login-logo">🏥</div>
                <h1>Hospital Collaboration Portal</h1>
                <p>{mode === 'login' ? 'Sign in with your hospital credentials' : 'Register your hospital for empanelment'}</p>

                <div className="login-tabs">
                    <button className={`login-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setErr('') }}>Sign In</button>
                    <button className={`login-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => { setMode('register'); setErr('') }}>Register</button>
                </div>

                <form onSubmit={submit}>
                    {mode === 'register' && (
                        <div className="login-field">
                            <label>Hospital Legal Name</label>
                            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Apollo Main Hospital Chennai" required />
                        </div>
                    )}
                    <div className="login-field">
                        <label>Username</label>
                        <input value={username} onChange={e => setUsername(e.target.value.toLowerCase().trim())} placeholder="e.g. apollo_chennai" required autoComplete="username" />
                    </div>
                    <div className="login-field">
                        <label>Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                    </div>
                    {mode === 'register' && (
                        <div className="login-field">
                            <label>Confirm Password</label>
                            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat your password" required />
                        </div>
                    )}
                    {err && <div className="login-error">{err}</div>}
                    <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                        {loading ? <><div className="spinner" /> {mode === 'login' ? 'Signing in...' : 'Registering...'}</> : mode === 'login' ? '🔐 Sign In' : '✍️ Register Hospital'}
                    </button>
                </form>
                <p className="login-hint">{mode === 'login' ? 'Don\'t have an account? Switch to Register above.' : 'Already registered? Switch to Sign In above.'}</p>
            </div>
        </div>
    )
}

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
    // A
    name: '', brand_name: '', pan_number: '', pan_attached: false, gst_number: '', gst_attached: false, msme_status: 'No', msme_type: 'None', msme_attached: false, type: 'Multi-Specialty',
    // B
    address: '', city: '', state: '', contact_phone: '', contact_email: '', nodal_contacts: [{ purpose: 'Admission', name: '', designation: '', mobile: '', email: '' }],
    // C
    bank_ecs_attached: false, accreditations: { nabh: false, nabl: false, jci: false, not_accredited: false }, accreditation_valid_until: '', accreditation_attached: false, it_exemption: 'No', it_exemption_valid_until: '', it_exemption_attached: false, statutory_clearances: { fire_safety: false, biomedical_waste: false, aerb_approval: false, pharmacy_license: false, lift_safety: false, cea_registration: false },
    // D
    specialties: [], core_specialties: [], super_specialties: [], support_services: [],
    // E
    facilities: { advanced_trauma: false, blood_bank: false, dialysis: false, organ_transplant: false, burns_unit: false, ipd_psychiatry: false, ivf: false, cathlab: false, emergency: false, ventilator: false, nicu: false, picu: false, central_oxygen: false }, ambulance_facility: 'No', ambulance_free_pickup: 'No', diagnostic_facilities: { ct: 'No', mri: 'No', pet_ct: 'No', outsourced_info: '' },
    // F
    capacity: { general: '', semi_private: '', private: '', icu: '', hdu: '' }, total_beds: '', tariffs_attached: false,
    // G
    pathology_lab: 'No', pharmacy_24x7: 'No', trauma_support_24x7: 'No', corporate_help_desk: 'No',
    // H
    cghs_rates_acceptable: 'No', ongc_discount_percent: '', schedule_of_charges_attached: false,
    // I
    hospital_age: '', outsourced_services: '', panel_organizations_attached: false, ongc_association_years: '', ongc_patient_count: { fy_23_24: '', fy_24_25: '', period_25: '' },
    // J
    consultants: [{ name: '', specialty: '', type: 'Full time', qualification: '', experience_years: '', mobile: '' }], paramedical_staff_count: '', support_staff_count: '', patient_feedbacks_attached: false,
    // K
    general_facilities: { parking: false, power_backup: false, central_ac: false, waiting_lounge: false, cafeteria: false, attendant_lodging: false },
    // L
    declaration_no_blacklisting: false, achievements: '',
}

function Field({ label, name, type = 'text', form, setForm, min, max, step, required, hint }) {
    return (
        <div className="field-group">
            <label>{label}{required && <span className="required">*</span>}</label>
            <input
                type={type} step={step} min={min} max={max}
                value={form[name]}
                onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))}
                required={required}
            />
            {hint && <p className="field-hint">{hint}</p>}
        </div>
    )
}

function Toggle({ label, name, form, setForm, hint }) {
    return (
        <label className="toggle-row">
            <div className="toggle-info">
                <span className="toggle-label">{label}</span>
                {hint && <span className="toggle-hint">{hint}</span>}
            </div>
            <div className={`toggle-switch ${form[name] ? 'on' : ''}`} onClick={() => setForm(f => ({ ...f, [name]: !f[name] }))}>
                <div className="toggle-knob" />
            </div>
        </label>
    )
}

function SearchableSpecialtySelect({ selected, onAdd, onRemove }) {
    const [query, setQuery] = useState('')
    const filtered = SPECIALTIES_LIST.filter(s =>
        s.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s)
    ).slice(0, 8)

    return (
        <div className="specialty-search-container">
            <div className="specialty-tags">
                {selected.map(s => (
                    <span key={s} className="tag">{s} <button onClick={() => onRemove(s)}>×</button></span>
                ))}
            </div>
            <div className="search-input-wrapper">
                <input
                    type="text"
                    placeholder="Search specialties (e.g. Cardiology)..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="search-input"
                />
                {query && (
                    <div className="search-results">
                        {filtered.length > 0 ? (
                            filtered.map(s => (
                                <div key={s} className="search-item" onClick={() => { onAdd(s); setQuery('') }}>
                                    {s}
                                </div>
                            ))
                        ) : (
                            <div className="search-no-results">No matches found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default function App() {
    const [hospitalAuth, setHospitalAuth] = useState(null)
    const [step, setStep] = useState(1)
    const [form, setForm] = useState(defaultForm)
    const [attachedFiles, setAttachedFiles] = useState({})  // Step 13 file attachments
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(null)
    const [errors, setErrors] = useState({})

    // On load: clear any admin localStorage tokens so portal is fully isolated
    useEffect(() => {
        localStorage.removeItem('token') // admin token
        const saved = sessionStorage.getItem('hospital_token')
        if (saved) {
            setHospitalAuth({
                token: saved,
                name: sessionStorage.getItem('hospital_name'),
                hospitalId: sessionStorage.getItem('hospital_id'),
                has_submitted: sessionStorage.getItem('hospital_submitted') === 'true',
            })
        }
    }, [])

    // Block access until hospital is logged in
    if (!hospitalAuth) {
        return <HospitalLoginScreen onAuth={(data) => {
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
        setSubmitted(null)
    }

    const validate = (s) => {
        const e = {}
        if (s === 1) {
            if (!form.name.trim()) e.name = 'Hospital name required'
            if (!form.type) e.type = 'Type required'
        }
        if (s === 2) {
            if (!form.city.trim()) e.city = 'City required'
            if (!form.state) e.state = 'State required'
            if (!form.contact_email.trim()) e.contact_email = 'Email required'
        }
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const next = () => {
        if (!validate(step)) return
        setStep(s => Math.min(s + 1, STEPS.length))
    }
    const prev = () => setStep(s => Math.max(s - 1, 1))

    const updateArrayField = (field, index, subfield, value) => {
        setForm(f => {
            const arr = [...f[field]]
            arr[index] = { ...arr[index], [subfield]: value }
            return { ...f, [field]: arr }
        })
    }
    const addArrayItem = (field, template) => {
        setForm(f => ({ ...f, [field]: [...f[field], template] }))
    }
    const removeArrayItem = (field, index) => {
        setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== index) }))
    }

    const submit = async () => {
        setLoading(true)
        try {
            const payload = { ...form }
            // Basic cleanup of numeric fields
            const numberFields = ['total_beds', 'hospital_age', 'ongc_association_years', 'paramedical_staff_count', 'support_staff_count', 'ongc_discount_percent']
            numberFields.forEach(f => { if (payload[f] !== '') payload[f] = Number(payload[f]); else delete payload[f] })
            // Use PUT /hospital-auth/me with the hospital JWT to update their record
            const res = await axios.put(`${API}/hospital-auth/me`, payload, {
                headers: { Authorization: `Bearer ${hospitalAuth.token}` }
            })
            // Mark as submitted so the form is locked permanently
            sessionStorage.setItem('hospital_submitted', 'true')
            setHospitalAuth(a => ({ ...a, has_submitted: true }))
            setSubmitted(res.data)
        } catch (err) {
            alert(err.response?.data?.error || 'Submission failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    // Show already-submitted screen if hospital has submitted before
    if (hospitalAuth.has_submitted && !submitted) {
        return (
            <div className="portal-layout">
                <header className="portal-header">
                    <div className="header-inner">
                        <div className="header-brand"><div className="brand-icon">🏥</div><div><h1>MedCollaborate</h1><p>Hospital Partnership Program</p></div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div className="header-badge">{hospitalAuth.name}</div>
                            <button className="btn btn-ghost btn-sm" onClick={signOut} style={{ fontSize: 12 }}>🚪 Sign Out</button>
                        </div>
                    </div>
                </header>
                <div className="success-screen">
                    <div className="success-card">
                        <div style={{ fontSize: 64, marginBottom: 16 }}>📌</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Submission Already Received</h2>
                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                            Your hospital's empanelment information has already been submitted.<br />
                            Re-submission is not permitted. Our team will review your application and contact you shortly.
                        </p>
                        <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 20px', fontSize: 13, color: '#34d399' }}>
                            ✅ Application locked · Under review
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (submitted) return <SuccessScreen data={submitted} onReset={() => { setSubmitted(null); setForm(defaultForm); setStep(1) }} />

    return (
        <div className="portal-layout">
            {/* Header */}
            <header className="portal-header">
                <div className="header-inner">
                    <div className="header-brand">
                        <div className="brand-icon">🏥</div>
                        <div>
                            <h1>MedCollaborate</h1>
                            <p>Hospital Partnership Program</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div className="header-badge">{hospitalAuth.name}</div>
                        <button className="btn btn-ghost btn-sm" onClick={signOut} style={{ fontSize: 12 }}>🚪 Sign Out</button>
                    </div>
                </div>
            </header>

            <main className="portal-main">
                {/* Step Indicator */}
                <div className="stepper-container">
                    <div className="stepper">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className={`step-item ${step === s.id ? 'active' : step > s.id ? 'done' : ''}`}>
                                <div className="step-circle">
                                    {step > s.id ? '✓' : s.icon}
                                </div>
                                <span className="step-label">{s.label}</span>
                                {i < STEPS.length - 1 && <div className="step-line" />}
                            </div>
                        ))}
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }} />
                    </div>
                </div>

                {/* Form Card */}
                <div className="form-card animate-in">
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

                    {/* Navigation */}
                    <div className="form-nav">
                        <button className="btn btn-secondary" onClick={prev} disabled={step === 1}>← Back</button>
                        <div className="step-counter">Step {step} of {STEPS.length}</div>
                        {step < STEPS.length
                            ? <button className="btn btn-primary" onClick={next}>Continue →</button>
                            : <button className="btn btn-success" onClick={submit} disabled={loading}>
                                {loading ? <><div className="spinner" /> Submitting...</> : '🚀 Submit Application'}
                            </button>
                        }
                    </div>
                </div>
            </main>
        </div>
    )
}

function StepContent({ step, form, setForm, errors, updateArrayField, addArrayItem, removeArrayItem, attachedFiles, setAttachedFiles }) {
    switch (step) {
        case 1: return <Step1 form={form} setForm={setForm} errors={errors} />
        case 2: return <Step2 form={form} setForm={setForm} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
        case 3: return <Step3 form={form} setForm={setForm} />
        case 4: return <Step4 form={form} setForm={setForm} />
        case 5: return <Step5 form={form} setForm={setForm} />
        case 6: return <Step6 form={form} setForm={setForm} />
        case 7: return <Step7 form={form} setForm={setForm} />
        case 8: return <Step8 form={form} setForm={setForm} />
        case 9: return <Step9 form={form} setForm={setForm} />
        case 10: return <Step10 form={form} setForm={setForm} updateArrayField={updateArrayField} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
        case 11: return <Step11 form={form} setForm={setForm} />
        case 12: return <Step12 form={form} setForm={setForm} />
        case 13: return <Step13 attachedFiles={attachedFiles} setAttachedFiles={setAttachedFiles} />
        case 14: return <Step14 form={form} />
        default: return null
    }
}

function SectionTitle({ icon, title, subtitle }) {
    return (
        <div className="section-title">
            <div className="section-icon">{icon}</div>
            <div>
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </div>
    )
}

function Step1({ form, setForm, errors }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="🏥" title="Section A: Basic Details" subtitle="Brand and legal identification" />
            <div className="form-grid">
                <div className="field-group col-span-2">
                    <label>Hospital Name <span className="required">*</span></label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Legal name of hospital" />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                </div>
                <div className="field-group">
                    <label>Brand Name</label>
                    <input value={form.brand_name} onChange={e => setForm(f => ({ ...f, brand_name: e.target.value }))} placeholder="e.g. Apollo, Fortis" />
                </div>
                <div className="field-group">
                    <label>Category <span className="required">*</span></label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                        <option>Single Specialty</option>
                        <option>Multi-Specialty</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>PAN Number</label>
                    <input value={form.pan_number} onChange={e => setForm(f => ({ ...f, pan_number: e.target.value }))} placeholder="10-digit PAN" />
                </div>
                <div className="field-group checkbox-group">
                    <label><input type="checkbox" checked={form.pan_attached} onChange={e => setForm(f => ({ ...f, pan_attached: e.target.checked }))} /> PAN Attached?</label>
                </div>
                <div className="field-group">
                    <label>GST Number</label>
                    <input value={form.gst_number} onChange={e => setForm(f => ({ ...f, gst_number: e.target.value }))} placeholder="15-digit GST" />
                </div>
                <div className="field-group checkbox-group">
                    <label><input type="checkbox" checked={form.gst_attached} onChange={e => setForm(f => ({ ...f, gst_attached: e.target.checked }))} /> GST Attached?</label>
                </div>
            </div>
            <div className="toggle-section mt-4">
                <Toggle label="MSME Registered?" name="msme_status" form={{ msme_status: form.msme_status === 'Yes' }} setForm={v => setForm(f => ({ ...f, msme_status: v.msme_status ? 'Yes' : 'No' }))} />
                {form.msme_status === 'Yes' && (
                    <div className="form-grid mt-2 pl-4 border-l-2 border-primary/20">
                        <select value={form.msme_type} onChange={e => setForm(f => ({ ...f, msme_type: e.target.value }))}>
                            <option>Micro</option>
                            <option>Small</option>
                            <option>Medium</option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    )
}

function Step2({ form, setForm, updateArrayField, addArrayItem, removeArrayItem }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="📍" title="Section B: Address & Contact" subtitle="Physical location and nodal officers" />
            <div className="form-grid">
                <div className="field-group col-span-2">
                    <label>Full Address <span className="required">*</span></label>
                    <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows="2" />
                </div>
                <div className="field-group">
                    <label>City <span className="required">*</span></label>
                    <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div className="field-group">
                    <label>State <span className="required">*</span></label>
                    <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}>
                        <option value="">Select State</option>
                        {['Andhra Pradesh', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'West Bengal'].map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
                <div className="field-group">
                    <label>Primary Phone <span className="required">*</span></label>
                    <input value={form.contact_phone} onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))} />
                </div>
                <div className="field-group">
                    <label>Official Email <span className="required">*</span></label>
                    <input value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
                </div>
            </div>

            <div className="nodal-section mt-6">
                <h4>Nodal Contacts for Coordination</h4>
                <div className="nodal-list">
                    {form.nodal_contacts.map((nc, i) => (
                        <div key={i} className="nodal-card">
                            <div className="form-grid">
                                <div className="field-group">
                                    <label>Purpose</label>
                                    <select value={nc.purpose} onChange={e => updateArrayField('nodal_contacts', i, 'purpose', e.target.value)}>
                                        <option>Admission</option>
                                        <option>Billing</option>
                                        <option>Emergency</option>
                                        <option>Grievance / Feedback</option>
                                    </select>
                                </div>
                                <div className="field-group">
                                    <label>Name</label>
                                    <input value={nc.name} onChange={e => updateArrayField('nodal_contacts', i, 'name', e.target.value)} />
                                </div>
                                <div className="field-group">
                                    <label>Mobile</label>
                                    <input value={nc.mobile} onChange={e => updateArrayField('nodal_contacts', i, 'mobile', e.target.value)} />
                                </div>
                                <div className="field-group">
                                    <label>Email</label>
                                    <input value={nc.email} onChange={e => updateArrayField('nodal_contacts', i, 'email', e.target.value)} />
                                </div>
                            </div>
                            {i > 0 && <button className="remove-btn" onClick={() => removeArrayItem('nodal_contacts', i)}>Remove</button>}
                        </div>
                    ))}
                    <button className="btn btn-secondary btn-sm" onClick={() => addArrayItem('nodal_contacts', { purpose: 'Admission', name: '', designation: '', mobile: '', email: '' })}>+ Add Nodal Contact</button>
                </div>
            </div>
        </div>
    )
}

function Step3({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="📜" title="Section C: Compliance & Bank" subtitle="Statutory certificates and accreditations" />
            <div className="toggle-section compact">
                <Toggle label="Bank ECS Mandate / Cancelled Cheque Attached?" name="bank_ecs_attached" form={form} setForm={setForm} />
            </div>
            <div className="accreditation-box mt-4">
                <label>Hospital Accreditations</label>
                <div className="toggle-grid">
                    {['nabh', 'nabl', 'jci', 'not_accredited'].map(a => (
                        <label key={a} className="checkbox-row">
                            <input type="checkbox" checked={form.accreditations[a]} onChange={e => setForm(f => ({ ...f, accreditations: { ...f.accreditations, [a]: e.target.checked } }))} />
                            <span>{a.toUpperCase()}</span>
                        </label>
                    ))}
                </div>
            </div>
            <div className="form-grid mt-4">
                <div className="field-group">
                    <label>Valid Until</label>
                    <input type="date" value={form.accreditation_valid_until} onChange={e => setForm(f => ({ ...f, accreditation_valid_until: e.target.value }))} />
                </div>
                <div className="field-group checkbox-group">
                    <label><input type="checkbox" checked={form.accreditation_attached} onChange={e => setForm(f => ({ ...f, accreditation_attached: e.target.checked }))} /> Certificate Attached?</label>
                </div>
            </div>
            <div className="clearances-section mt-6">
                <h4>Statutory Clearances (Valid Licenses)</h4>
                <div className="toggle-grid">
                    {[
                        { name: 'fire_safety', label: 'Fire Safety' },
                        { name: 'biomedical_waste', label: 'Biomedical Waste' },
                        { name: 'aerb_approval', label: 'AERB (Radiology)' },
                        { name: 'pharmacy_license', label: 'Pharmacy License' },
                        { name: 'lift_safety', label: 'Lift Safety' },
                        { name: 'cea_registration', label: 'CEA Registration' },
                    ].map(c => (
                        <label key={c.name} className="checkbox-row">
                            <input type="checkbox" checked={form.statutory_clearances[c.name]} onChange={e => setForm(f => ({ ...f, statutory_clearances: { ...f.statutory_clearances, [c.name]: e.target.checked } }))} />
                            <span>{c.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}

function Step4({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="👩‍⚕️" title="Section D: Clinical Services" subtitle="Core and Super Specialties" />
            <div className="specialty-search-section mb-6">
                <label>Search & Select All Specialties Offered</label>
                <SearchableSpecialtySelect
                    selected={form.specialties}
                    onAdd={s => !form.specialties.includes(s) && setForm(f => ({ ...f, specialties: [...f.specialties, s] }))}
                    onRemove={s => setForm(f => ({ ...f, specialties: f.specialties.filter(x => x !== s) }))}
                />
            </div>
            <div className="clinical-checks">
                <div className="check-column">
                    <h4>Core Specialties</h4>
                    {['General medicine', 'General surgery', 'Obstetrics and gynaecology', 'Paediatrics', 'Orthopaedics', 'ICU / Critical care'].map(s => (
                        <label key={s} className="checkbox-row">
                            <input type="checkbox" checked={form.core_specialties.includes(s)} onChange={e => setForm(f => ({ ...f, core_specialties: e.target.checked ? [...f.core_specialties, s] : f.core_specialties.filter(x => x !== s) }))} />
                            <span>{s}</span>
                        </label>
                    ))}
                </div>
                <div className="check-column">
                    <h4>Super Specialties</h4>
                    {['Cardiology', 'Nephrology', 'Neurosurgery', 'Medical oncology', 'Transplant', 'Urology'].map(s => (
                        <label key={s} className="checkbox-row">
                            <input type="checkbox" checked={form.super_specialties.includes(s)} onChange={e => setForm(f => ({ ...f, super_specialties: e.target.checked ? [...f.super_specialties, s] : f.super_specialties.filter(x => x !== s) }))} />
                            <span>{s}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    )
}

function Step5({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="🏢" title="Section E: Facilities Available" subtitle="Specialized units and diagnostics" />
            <div className="toggle-grid-sm">
                {[
                    { name: 'advanced_trauma', label: 'Advanced Trauma Center' },
                    { name: 'blood_bank', label: 'On-site Blood Bank' },
                    { name: 'dialysis', label: 'Dialysis Unit' },
                    { name: 'organ_transplant', label: 'Organ Transplant' },
                    { name: 'burns_unit', label: 'Burns Unit' },
                    { name: 'cathlab', label: 'Cathlab' },
                    { name: 'emergency', label: '24x7 Emergency' },
                    { name: 'ventilator', label: 'Ventilator Support' },
                    { name: 'nicu', label: 'NICU' },
                    { name: 'picu', label: 'PICU' },
                ].map(f => (
                    <label key={f.name} className="checkbox-row">
                        <input type="checkbox" checked={form.facilities[f.name]} onChange={e => setForm(f2 => ({ ...f2, facilities: { ...f2.facilities, [f.name]: e.target.checked } }))} />
                        <span>{f.label}</span>
                    </label>
                ))}
            </div>
            <div className="form-grid mt-6">
                <div className="field-group">
                    <label>Ambulance Facility?</label>
                    <select value={form.ambulance_facility} onChange={e => setForm(f => ({ ...f, ambulance_facility: e.target.value }))}>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>CT Scan</label>
                    <select value={form.diagnostic_facilities.ct} onChange={e => setForm(f => ({ ...f, diagnostic_facilities: { ...f.diagnostic_facilities, ct: e.target.value } }))}>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>MRI</label>
                    <select value={form.diagnostic_facilities.mri} onChange={e => setForm(f => ({ ...f, diagnostic_facilities: { ...f.diagnostic_facilities, mri: e.target.value } }))}>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>
            </div>
        </div>
    )
}

function Step6({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="🛏️" title="Section F: Bed Capacity" subtitle="Detailed breakdown of beds" />
            <div className="form-grid">
                {[
                    { name: 'general', label: 'General Ward Beds' },
                    { name: 'semi_private', label: 'Semi-Private Beds' },
                    { name: 'private', label: 'Private Room Beds' },
                    { name: 'icu', label: 'ICU Beds' },
                    { name: 'hdu', label: 'HDU Beds' },
                ].map(b => (
                    <div key={b.name} className="field-group">
                        <label>{b.label}</label>
                        <input type="number" value={form.capacity[b.name]} onChange={e => setForm(f => ({ ...f, capacity: { ...f.capacity, [b.name]: e.target.value } }))} />
                    </div>
                ))}
                <div className="field-group highlight">
                    <label>Total Hospital Beds <span className="required">*</span></label>
                    <input type="number" value={form.total_beds} onChange={e => setForm(f => ({ ...f, total_beds: e.target.value }))} />
                </div>
            </div>
            <div className="toggle-section mt-4">
                <Toggle label="Schedule of Tariffs Attached?" name="tariffs_attached" form={form} setForm={setForm} />
            </div>
        </div>
    )
}

function Step7({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="🤝" title="Section G: Support Services" subtitle="Additional operational capabilities" />
            <div className="toggle-grid">
                {[
                    { name: 'pathology_lab', label: 'In-house Pathology Lab' },
                    { name: 'pharmacy_24x7', label: '24x7 Pharmacy' },
                    { name: 'trauma_support_24x7', label: '24x7 Trauma Support' },
                    { name: 'corporate_help_desk', label: 'Dedicated Corporate Help Desk' },
                ].map(s => (
                    <div key={s.name} className="field-group">
                        <label>{s.label}</label>
                        <select value={form[s.name]} onChange={e => setForm(f => ({ ...f, [s.name]: e.target.value }))}>
                            <option>Yes</option>
                            <option>No</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    )
}

function Step8({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="💰" title="Section H: Commercial Terms" subtitle="Rates and discounts" />
            <div className="form-grid">
                <div className="field-group">
                    <label>Are CGHS Rates acceptable?</label>
                    <select value={form.cghs_rates_acceptable} onChange={e => setForm(f => ({ ...f, cghs_rates_acceptable: e.target.value }))}>
                        <option>Yes</option>
                        <option>No</option>
                    </select>
                </div>
                <div className="field-group">
                    <label>Discount offered to ONGC (%)</label>
                    <input type="number" value={form.ongc_discount_percent} onChange={e => setForm(f => ({ ...f, ongc_discount_percent: e.target.value }))} placeholder="e.g. 15" />
                </div>
                <div className="field-group checkbox-group col-span-2">
                    <label><input type="checkbox" checked={form.schedule_of_charges_attached} onChange={e => setForm(f => ({ ...f, schedule_of_charges_attached: e.target.checked }))} /> Detailed Schedule of Charges Attached?</label>
                </div>
            </div>
        </div>
    )
}

function Step9({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="📅" title="Section I: Experience & Association" subtitle="History and existing partnerships" />
            <div className="form-grid">
                <div className="field-group">
                    <label>Age of Hospital (Years)</label>
                    <input type="number" value={form.hospital_age} onChange={e => setForm(f => ({ ...f, hospital_age: e.target.value }))} />
                </div>
                <div className="field-group">
                    <label>Years of Association with ONGC</label>
                    <input type="number" value={form.ongc_association_years} onChange={e => setForm(f => ({ ...f, ongc_association_years: e.target.value }))} />
                </div>
                <div className="field-group col-span-2">
                    <label>Services Outsourced (if any)</label>
                    <textarea value={form.outsourced_services} onChange={e => setForm(f => ({ ...f, outsourced_services: e.target.value }))} placeholder="e.g. Laundry, Canteen..." />
                </div>
            </div>
            <div className="ongc-stats mt-4">
                <h4>No. of ONGC Patients Treated</h4>
                <div className="form-grid">
                    <div className="field-group">
                        <label>FY 2023-24</label>
                        <input type="number" value={form.ongc_patient_count.fy_23_24} onChange={e => setForm(f => ({ ...f, ongc_patient_count: { ...f.ongc_patient_count, fy_23_24: e.target.value } }))} />
                    </div>
                    <div className="field-group">
                        <label>FY 2024-25</label>
                        <input type="number" value={form.ongc_patient_count.fy_24_25} onChange={e => setForm(f => ({ ...f, ongc_patient_count: { ...f.ongc_patient_count, fy_24_25: e.target.value } }))} />
                    </div>
                </div>
            </div>
        </div>
    )
}

function Step10({ form, setForm, updateArrayField, addArrayItem, removeArrayItem }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="👥" title="Section J: Manpower" subtitle="Consultants and support staff" />
            <div className="consultants-section">
                <h4>Key Consultants / Specialists</h4>
                {form.consultants.map((c, i) => (
                    <div key={i} className="nodal-card">
                        <div className="form-grid">
                            <div className="field-group">
                                <label>Name</label>
                                <input value={c.name} onChange={e => updateArrayField('consultants', i, 'name', e.target.value)} />
                            </div>
                            <div className="field-group">
                                <label>Specialty</label>
                                <input value={c.specialty} onChange={e => updateArrayField('consultants', i, 'specialty', e.target.value)} />
                            </div>
                            <div className="field-group">
                                <label>Type</label>
                                <select value={c.type} onChange={e => updateArrayField('consultants', i, 'type', e.target.value)}>
                                    <option>Full time</option>
                                    <option>Visiting</option>
                                </select>
                            </div>
                            <div className="field-group">
                                <label>Exp (Yrs)</label>
                                <input type="number" value={c.experience_years} onChange={e => updateArrayField('consultants', i, 'experience_years', e.target.value)} />
                            </div>
                        </div>
                        {i > 0 && <button className="remove-btn" onClick={() => removeArrayItem('consultants', i)}>Remove</button>}
                    </div>
                ))}
                <button className="btn btn-secondary btn-sm" onClick={() => addArrayItem('consultants', { name: '', specialty: '', type: 'Full time', qualification: '', experience_years: '', mobile: '' })}>+ Add Consultant</button>
            </div>
            <div className="form-grid mt-6">
                <div className="field-group">
                    <label>Total Paramedical Staff</label>
                    <input type="number" value={form.paramedical_staff_count} onChange={e => setForm(f => ({ ...f, paramedical_staff_count: e.target.value }))} />
                </div>
                <div className="field-group">
                    <label>Total Support Staff</label>
                    <input type="number" value={form.support_staff_count} onChange={e => setForm(f => ({ ...f, support_staff_count: e.target.value }))} />
                </div>
            </div>
        </div>
    )
}

function Step11({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="💡" title="Section K: Other Facilities" subtitle="Misc. patient and attendant amenities" />
            <div className="toggle-grid">
                {[
                    { name: 'parking', label: 'Ample Parking' },
                    { name: 'power_backup', label: '24x7 Power Backup' },
                    { name: 'central_ac', label: 'Central AC' },
                    { name: 'waiting_lounge', label: 'Spacious Waiting Lounge' },
                    { name: 'cafeteria', label: 'Hygienic Cafeteria' },
                    { name: 'attendant_lodging', label: 'Attendant Lodging Facility' },
                ].map(f => (
                    <label key={f.name} className="checkbox-row">
                        <input type="checkbox" checked={form.general_facilities[f.name]} onChange={e => setForm(f2 => ({ ...f2, general_facilities: { ...f2.general_facilities, [f.name]: e.target.checked } }))} />
                        <span>{f.label}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}

function Step12({ form, setForm }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="✅" title="Section L: Declaration" subtitle="Final confirmation and accomplishments" />
            <div className="field-group">
                <label>Major Achievements / Awards</label>
                <textarea value={form.achievements} onChange={e => setForm(f => ({ ...f, achievements: e.target.value }))} rows="4" placeholder="List any notable achievements..." />
            </div>
            <div className="declaration-box mt-6">
                <label className="checkbox-row large">
                    <input type="checkbox" checked={form.declaration_no_blacklisting} onChange={e => setForm(f => ({ ...f, declaration_no_blacklisting: e.target.checked }))} />
                    <span>We hereby declare that our hospital has NOT been blacklisted by any Government / PSU / Private organization in the last 3 years. <span className="required">*</span></span>
                </label>
            </div>
        </div>
    )
}

function Step13({ attachedFiles, setAttachedFiles }) {
    const DOCS = [
        { key: 'pan', label: 'PAN Card', hint: 'Scanned copy of PAN card' },
        { key: 'gst', label: 'GST Certificate', hint: 'Valid GST registration certificate' },
        { key: 'accreditation', label: 'Accreditation Certificate', hint: 'NABH / JCI / NABL certificate' },
        { key: 'fire_safety', label: 'Fire Safety Certificate', hint: 'Valid fire safety license' },
        { key: 'bank_ecs', label: 'Bank ECS / Cancelled Cheque', hint: 'Required for payment processing' },
        { key: 'tariff', label: 'Schedule of Charges / Tariff', hint: 'Hospital tariff sheet' },
        { key: 'biomedical', label: 'Biomedical Waste Approval', hint: 'BMW authorization certificate' },
        { key: 'pharmacy', label: 'Pharmacy License', hint: 'Valid pharmacy operating license' },
    ]

    const handleFile = (key, e) => {
        const file = e.target.files[0]
        if (!file) return
        setAttachedFiles(prev => ({ ...prev, [key]: file }))
    }

    const removeFile = (key) => {
        setAttachedFiles(prev => { const n = { ...prev }; delete n[key]; return n })
    }

    return (
        <div className="animate-in">
            <SectionTitle icon="📎" title="Section M: Document Attachments" subtitle="Upload supporting documents (PDF, JPG, PNG — max 5MB each)" />
            <div className="attachment-note">
                ⚠️ File upload functionality is provisional. Exact upload destination and processing will be configured before go-live.
            </div>
            <div className="attachments-grid">
                {DOCS.map(doc => (
                    <div key={doc.key} className="attachment-card">
                        <div className="attachment-header">
                            <span className="attachment-label">{doc.label}</span>
                            {attachedFiles[doc.key] && (
                                <button className="remove-btn" onClick={() => removeFile(doc.key)}>✕ Remove</button>
                            )}
                        </div>
                        <span className="attachment-hint">{doc.hint}</span>
                        {attachedFiles[doc.key] ? (
                            <div className="attachment-selected">
                                📄 {attachedFiles[doc.key].name}
                                <span className="file-size">({(attachedFiles[doc.key].size / 1024).toFixed(1)} KB)</span>
                            </div>
                        ) : (
                            <label className="file-drop-zone">
                                <span>📁 Click to choose file</span>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={e => handleFile(doc.key, e)}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function Step14({ form }) {
    return (
        <div className="animate-in">
            <SectionTitle icon="🔍" title="Final Review" subtitle="Review your application before submission" />
            <div className="review-sections-grid">
                <div className="review-card">
                    <h4>🏥 Basic & Legal</h4>
                    <p><strong>Name:</strong> {form.name}</p>
                    <p><strong>Brand:</strong> {form.brand_name || 'N/A'}</p>
                    <p><strong>PAN:</strong> {form.pan_number}</p>
                    <p><strong>GST:</strong> {form.gst_number}</p>
                </div>
                <div className="review-card">
                    <h4>📍 Location & Contact</h4>
                    <p><strong>Address:</strong> {form.address}</p>
                    <p><strong>City/State:</strong> {form.city}, {form.state}</p>
                    <p><strong>Contact:</strong> {form.contact_phone}</p>
                </div>
                <div className="review-card">
                    <h4>🛏️ Capacity</h4>
                    <p><strong>Total Beds:</strong> {form.total_beds}</p>
                    <p><strong>ICU Beds:</strong> {form.capacity.icu}</p>
                </div>
                <div className="review-card">
                    <h4>👩‍⚕️ Clinical</h4>
                    <p><strong>Specialties:</strong> {form.specialties.length} selected</p>
                    <p><strong>Core:</strong> {form.core_specialties.join(', ')}</p>
                </div>
            </div>
            <div className="submit-declaration mt-6">
                <p>⚠️ By clicking submit, you certify that all information provided is true and accurate to the best of your knowledge.</p>
            </div>
        </div>
    )
}

function SuccessScreen({ data, onReset }) {
    return (
        <div className="portal-layout">
            <header className="portal-header">
                <div className="header-inner">
                    <div className="header-brand">
                        <div className="brand-icon">🏥</div>
                        <div>
                            <h1>MedCollaborate</h1>
                            <p>Hospital Partnership Program</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="success-screen">
                <div className="success-card animate-in">
                    <div className="success-icon">🎉</div>
                    <h1>Application Submitted!</h1>
                    <p>Your hospital's data has been successfully received. Our evaluation team will review it during the 2026 Collaboration Cycle.</p>
                    <div className="submission-id">
                        <span>Submission ID</span>
                        <code>{data?.hospital?._id || data?.id || '—'}</code>
                    </div>
                    <div className="success-steps">
                        <div className="step-item-sm">📬 Confirmation email will be sent</div>
                        <div className="step-item-sm">🔍 Expert review within 4-6 weeks</div>
                        <div className="step-item-sm">📞 Follow-up call if shortlisted</div>
                    </div>
                    <div className="success-actions">
                        <button className="btn btn-secondary" onClick={onReset}>Submit Another Application</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
