import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

export function Field({ label, name, type = 'text', form, setForm, min, max, step, required, hint, error }) {
    return (
        <motion.div
            className="form-group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <label className="form-label">
                {label} {required && <span className="required">*</span>}
            </label>
            <div className="input-wrapper">
                <input
                    type={type}
                    value={form[name] || ''}
                    onChange={e => setForm({ ...form, [name]: e.target.value })}
                    className={`form-input ${error ? 'error' : ''}`}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                    min={min}
                    max={max}
                    step={step}
                />
            </div>
            <AnimatePresence>
                {hint && (
                    <motion.p
                        className="form-hint"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Info size={12} style={{ marginRight: 4 }} />
                        {hint}
                    </motion.p>
                )}
            </AnimatePresence>
            {error && <p className="error-text">{error}</p>}
        </motion.div>
    );
}

export function Toggle({ label, name, form, setForm, hint, required, error }) {
    const active = form[name] === 'Yes';
    return (
        <motion.div
            className={`toggle-group ${error ? 'error' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="toggle-header">
                <span className="form-label">
                    {label} {required && <span className="required">*</span>}
                </span>
                <button
                    type="button"
                    className={`toggle-switch ${active ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, [name]: active ? 'No' : 'Yes' })}
                >
                    <motion.div
                        className="toggle-knob"
                        animate={{ x: active ? 24 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                </button>
            </div>
            {hint && <p className="form-hint">{hint}</p>}
            {error && <p className="error-text">{error}</p>}
        </motion.div>
    );
}
