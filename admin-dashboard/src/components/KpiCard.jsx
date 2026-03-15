import React from 'react';
import { motion } from 'framer-motion';

export function KpiCard({ icon, value, label, color, suffix = '', isText = false, delay = 0 }) {
    return (
        <motion.div
            className="kpi-card-premium"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
            <div className="kpi-icon-box" style={{ backgroundColor: `${color}15`, color: color }}>
                {icon}
            </div>
            <div className="kpi-data">
                <div className="kpi-value-row">
                    <span className={`kpi-value ${isText ? 'text-mode' : ''}`}>
                        {value}
                    </span>
                    <span className="kpi-suffix">{suffix}</span>
                </div>
                <span className="kpi-label">{label}</span>
            </div>
            <div className="kpi-accent-bar" style={{ backgroundColor: color }} />
        </motion.div>
    );
}
