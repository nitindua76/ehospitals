import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export function Stepper({ steps, currentStep, maxStep = 1, onStepClick }) {
    const progress = ((maxStep - 1) / (steps.length - 1)) * 100;

    return (
        <div className="stepper-wrapper">
            <div className="stepper-progress-bg">
                <motion.div
                    className="stepper-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
            <div className="stepper-items">
                {steps.map((step, idx) => {
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
                                    scale: isActive ? 1.1 : 1,
                                    backgroundColor: isActive || isDone ? 'var(--primary)' : 'var(--bg-card)',
                                    borderColor: isActive || isDone ? 'var(--primary)' : 'var(--border)'
                                }}
                            >
                                {isDone ? <Check size={14} color="white" strokeWidth={3} /> : step.icon}
                            </motion.div>
                            <span className="stepper-label">{step.label.split(': ')[1] || step.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
