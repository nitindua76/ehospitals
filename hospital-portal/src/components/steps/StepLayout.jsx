import React from 'react';
import { motion } from 'framer-motion';

export function SectionTitle({ icon, title, subtitle }) {
    return (
        <motion.div
            className="section-header-premium"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="section-icon-wrap">{icon}</div>
            <div className="section-title-text">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
            </div>
        </motion.div>
    );
}

export function StepLayout({ children, title, subtitle, icon }) {
    return (
        <motion.div
            className="step-layout-premium"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
        >
            <SectionTitle icon={icon} title={title} subtitle={subtitle} />
            <div className="step-grid-layout">
                {children}
            </div>
        </motion.div>
    );
}
