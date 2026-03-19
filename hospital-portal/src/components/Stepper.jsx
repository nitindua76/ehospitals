import React from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle } from 'lucide-react';

export function Stepper({ steps, currentStep, maxStep = 1, onStepClick, stepErrors = {} }) {
    // Map steps with their linear index to maintain consistent navigation
    const stepsWithIndex = steps.map((s, idx) => ({ ...s, linearIndex: idx + 1 }));

    // Group steps by their group property
    const groupedSteps = stepsWithIndex.reduce((acc, step) => {
        const groupName = step.group || 'General';
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(step);
        return acc;
    }, {});

    return (
        <div className="stepper-wrapper">
            <div className="stepper-items">
                {Object.entries(groupedSteps).map(([groupName, groupSteps]) => (
                    <div key={groupName} className="stepper-group">
                        <div className="stepper-group-header">{groupName}</div>
                        {groupSteps.map((step) => {
                            const isUnlocked = maxStep >= step.linearIndex;
                            const hasError = stepErrors[step.id];
                            const isDone = (currentStep > step.linearIndex || (maxStep > step.linearIndex && currentStep !== step.linearIndex)) && !hasError;
                            const isActive = currentStep === step.linearIndex;

                            return (
                                <div
                                    key={step.id}
                                    className={`stepper-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                                    onClick={() => isUnlocked && onStepClick(step.linearIndex)}
                                    style={{ cursor: isUnlocked ? 'pointer' : 'default' }}
                                >
                                    <motion.div
                                        className="stepper-circle"
                                        initial={false}
                                        animate={{
                                            scale: isActive ? 1.05 : 1,
                                            backgroundColor: hasError ? '#fee2e2' : (isActive || isDone ? 'var(--primary)' : 'var(--slate-100)'),
                                            borderColor: hasError ? '#ef4444' : (isActive || isDone ? 'var(--primary)' : 'var(--border)'),
                                            color: hasError ? '#ef4444' : (isActive || isDone ? '#ffffff' : 'var(--text-muted)')
                                        }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {hasError ? <AlertCircle size={14} /> : (isDone ? <Check size={12} strokeWidth={3} /> : step.icon)}
                                    </motion.div>
                                    <span className="stepper-label">
                                        {step.label.includes(': ') ? step.label.split(': ')[1] : step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
