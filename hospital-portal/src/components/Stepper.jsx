import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function Stepper({ steps, currentStep, maxStep = 1, onStepClick }) {
    return (
        <div className="stepper-wrapper">
            <div className="stepper-items">
                {steps.map((step) => {
                    const isUnlocked = maxStep >= step.id;
                    const isDone = currentStep > step.id || (maxStep > step.id && currentStep !== step.id);
                    const isActive = currentStep === step.id;

                    return (
                        <div
                            key={step.id}
                            className={`stepper-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                            onClick={() => isUnlocked && onStepClick(step.id)}
                            style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
                        >
                            <motion.div
                                className="stepper-circle"
                                initial={false}
                                animate={{
                                    scale: isActive ? 1.08 : 1,
                                    backgroundColor: isActive || isDone ? 'var(--primary)' : 'var(--slate-100)',
                                    borderColor: isActive || isDone ? 'var(--primary)' : 'var(--border)',
                                    color: isActive || isDone ? '#ffffff' : 'var(--text-muted)'
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                {isDone ? <Check size={14} strokeWidth={3} /> : step.icon}
                            </motion.div>
                            <span className="stepper-label">
                                {step.label.split(': ')[1] || step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
