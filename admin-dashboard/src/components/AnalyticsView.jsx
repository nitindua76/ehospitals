import React from 'react';
import { motion } from 'framer-motion';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

const OWNERSHIP_COLORS = {
    Government: '#10b981',
    Private: '#818cf8',
    Trust: '#f59e0b',
    Corporate: '#ec4899'
};

const ACCREDITATION_COLORS = {
    NABH: '#3b82f6',
    JCI: '#8b5cf6',
    NABL: '#10b981',
    None: '#64748b'
};

export function AnalyticsView({ hospitals }) {
    if (!hospitals || hospitals.length === 0) return (
        <div className="empty-analytics-pro">
            <p>No data available for analytical processing.</p>
        </div>
    );

    // 1. Accreditation Mix (Pie)
    const accreditationMix = [
        { name: 'NABH', value: hospitals.filter(h => h.accreditations?.nabh).length },
        { name: 'JCI', value: hospitals.filter(h => h.accreditations?.jci).length },
        { name: 'NABL', value: hospitals.filter(h => h.accreditations?.nabl).length },
        { name: 'None', value: hospitals.filter(h => !h.accreditations?.nabh && !h.accreditations?.jci && !h.accreditations?.nabl).length }
    ].filter(d => d.value > 0);

    // 2. Clinical Readiness (Facility Percentages)
    const facilityKeys = [
        { key: 'emergency', label: 'ER' },
        { key: 'blood_bank', label: 'Blood' },
        { key: 'dialysis', label: 'Dialysis' },
        { key: 'ventilator', label: 'Vent' },
        { key: 'nicu', label: 'NICU' },
        { key: 'central_oxygen', label: 'O2' }
    ];
    const clinicalReadiness = facilityKeys.map(fk => ({
        subject: fk.label,
        value: Math.round((hospitals.filter(h => h.facilities?.[fk.key]).length / hospitals.length) * 100)
    }));

    // 3. Specialty Landscape (Top 8)
    const allSpecialties = hospitals.flatMap(h => h.specialties || []);
    const specialtyFreq = allSpecialties.reduce((acc, s) => {
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});
    const specialtyData = Object.entries(specialtyFreq)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

    // 4. Category Performance (Using ownership_type)
    const ownershipTypes = Object.keys(OWNERSHIP_COLORS);
    const categoryData = ownershipTypes.map(type => {
        const typeHospitals = hospitals.filter(h => h.ownership_type === type);
        const avgScore = typeHospitals.length
            ? typeHospitals.reduce((acc, h) => acc + (h.overallScore || 0), 0) / typeHospitals.length
            : 0;
        return { type, score: Math.round(avgScore) };
    }).filter(d => d.score > 0);

    // 5. Radar Data
    const topHospital = [...hospitals].sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0))[0];
    const factors = [
        { key: 'patient_outcomes', label: 'Outcomes' },
        { key: 'infrastructure', label: 'Infra' },
        { key: 'staff_quality', label: 'Staff' },
        { key: 'financial_health', label: 'Finance' },
        { key: 'technology', label: 'Tech' },
        { key: 'patient_satisfaction', label: 'Service' }
    ];
    const radarData = factors.map(f => {
        const sum = hospitals.reduce((acc, h) => acc + (h.categoryScores?.[f.key] || 0), 0);
        return {
            subject: f.label,
            Avg: Math.round(sum / hospitals.length),
            Top: Math.round(topHospital?.categoryScores?.[f.key] || 0),
        };
    });

    // 6. Capacity Distribution (New - Distribution Logic)
    let micro = 0, small = 0, medium = 0, large = 0;
    hospitals.forEach(h => {
        const beds = h.total_beds || 0;
        if (beds < 50) micro++;
        else if (beds <= 100) small++;
        else if (beds <= 300) medium++;
        else large++;
    });

    const capacitySum = [
        { name: 'Micro (<50)', value: micro },
        { name: 'Small (50-100)', value: small },
        { name: 'Medium (101-300)', value: medium },
        { name: 'Large (300+)', value: large }
    ].filter(d => d.value > 0);

    const CAPACITY_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

    // 7. Commercial Analysis (New - Distribution Logic)
    let tier1 = 0, tier2 = 0, tier3 = 0, tier4 = 0, tier5 = 0;
    hospitals.forEach(h => {
        const discount = h.ongc_discount_percent || 0;
        if (discount <= 5) tier1++;
        else if (discount <= 10) tier2++;
        else if (discount <= 15) tier3++;
        else if (discount <= 20) tier4++;
        else tier5++;
    });

    const ongcDistribution = [
        { name: '0-5%', count: tier1 },
        { name: '6-10%', count: tier2 },
        { name: '11-15%', count: tier3 },
        { name: '16-20%', count: tier4 },
        { name: '21%+', count: tier5 }
    ].filter(d => d.count > 0);

    const cghsAcceptance = [
        { name: 'Accepted', value: hospitals.filter(h => h.cghs_rates_acceptable === 'Yes').length },
        { name: 'Not Accepted', value: hospitals.filter(h => h.cghs_rates_acceptable !== 'Yes').length }
    ];

    // 8. Workforce Summary (New - Distribution Logic)
    let bout = 0, std = 0, ext = 0, mas = 0;
    hospitals.forEach(h => {
        const docs = h.consultants?.length || 0;
        if (docs <= 10) bout++;
        else if (docs <= 50) std++;
        else if (docs <= 100) ext++;
        else mas++;
    });

    const workforceData = [
        { name: 'Boutique (1-10)', count: bout },
        { name: 'Standard (11-50)', count: std },
        { name: 'Extensive (51-100)', count: ext },
        { name: 'Massive (100+)', count: mas }
    ].filter(d => d.count > 0);

    // 9. Statutory Compliance Overview (New)
    const complianceKeys = [
        { key: 'fire_safety', label: 'Fire Safety' },
        { key: 'biomedical_waste', label: 'Bio Waste' },
        { key: 'aerb_approval', label: 'AERB' },
        { key: 'pharmacy_license', label: 'Pharmacy' },
        { key: 'lift_safety', label: 'Lift Safety' },
        { key: 'cea_registration', label: 'CEA' }
    ];

    const complianceData = complianceKeys.map(ck => ({
        subject: ck.label,
        value: Math.round((hospitals.filter(h => h.statutory_clearances?.[ck.key]).length / hospitals.length) * 100)
    }));

    // Re-verify that categoryData captures anything
    if (categoryData.length === 0 && hospitals.length > 0) {
        // Fallback
        const avgScore = hospitals.reduce((acc, h) => acc + (h.overallScore || 0), 0) / hospitals.length;
        categoryData.push({ type: 'Sector Avg', score: Math.round(avgScore) });
    }

    const COLORS_2 = ['#10b981', '#64748b'];


    return (
        <motion.div className="analytics-view-pro" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="analytics-grid">

                {/* 1. Accreditation Landscape */}
                <div className="chart-card-pro">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Accreditation Mix</h3>
                            <p>Distribution of certified medical quality benchmarks</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={accreditationMix}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {accreditationMix.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={ACCREDITATION_COLORS[entry.name]} />
                                ))}
                            </Pie>
                            <Tooltip itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Clinical Readiness */}
                <div className="chart-card-pro">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Capability Readiness</h3>
                            <p>% of hospitals equipped with critical clinical units</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={clinicalReadiness} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Category Benchmarking */}
                <div className="chart-card-pro">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Sectoral performance</h3>
                            <p>Average quality scores grouped by ownership type</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={categoryData} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis type="number" hide domain={[0, 100]} />
                            <YAxis dataKey="type" type="category" stroke="#94a3b8" fontSize={11} width={85} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
                                {categoryData.map((e, i) => (
                                    <Cell key={i} fill={OWNERSHIP_COLORS[e.type]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 4. Specialty Landscape */}
                <div className="chart-card-pro col-span-2">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Specialty Prevalence</h3>
                            <p>Top medical specialties across the empanelled network</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={specialtyData} margin={{ top: 10, right: 30, left: 10, bottom: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} angle={-25} textAnchor="end" height={60} />
                            <YAxis stroke="#94a3b8" fontSize={10} />
                            <Tooltip itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 5. Sectoral Benchmarking (Radar) */}
                <div className="chart-card-pro">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Quality Index</h3>
                            <p>Network average vs. Top-Tier performers</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                            <PolarGrid stroke="#334155" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar name="Avg" dataKey="Avg" stroke="#818cf8" fill="#818cf8" fillOpacity={0.2} />
                            <Radar name="Top" dataKey="Top" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                            <Legend />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* 6. Capacity Distribution (New) */}
                <div className="chart-card-pro">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Bed Capacity Mix</h3>
                            <p>Aggregated view of facility bed allocation</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={capacitySum}
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {capacitySum.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CAPACITY_COLORS[index % CAPACITY_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* 7. Commercial Standing (New - Distribution) */}
                <div className="chart-card-pro col-span-2">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Commercial Engagements</h3>
                            <p>CGHS Acceptance & ONGC Discount Band Distribution</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center', height: '260px', marginTop: '10px' }}>
                        <div style={{ flex: 1, height: '100%' }}>
                            <h4 style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 0 }}>CGHS Rates Acceptance</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <PieChart>
                                    <Pie
                                        data={cghsAcceptance}
                                        innerRadius={0}
                                        outerRadius={70}
                                        dataKey="value"
                                        labelLine={false}
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                            const RADIAN = Math.PI / 180;
                                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                            return percent > 0 ? (
                                                <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
                                                    {`${(percent * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null;
                                        }}
                                    >
                                        {cghsAcceptance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_2[index % COLORS_2.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div style={{ width: '1px', background: 'var(--border)', height: '80%' }} />

                        <div style={{ flex: 1.5, height: '100%' }}>
                            <h4 style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', marginBottom: 10 }}>ONGC Discount Tiers</h4>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={ongcDistribution} margin={{ top: 0, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                                    <YAxis stroke="#94a3b8" fontSize={11} />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                                    <Bar dataKey="count" fill="#22d3ee" radius={[4, 4, 0, 0]} barSize={35} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* 8. Workforce Metrics (New) */}
                <div className="chart-card-pro">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Workforce Capital</h3>
                            <p>Overall pool of medical and support staff</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={workforceData} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={85} axisLine={false} tickLine={false} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} fill="#f59e0b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* 9. Statutory Clearances (New) */}
                <div className="chart-card-pro col-span-2">
                    <div className="card-header-pro">
                        <div className="head-text">
                            <h3>Statutory Clearances Adherence</h3>
                            <p>% of network with validated legal and safety clearances</p>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={complianceData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                            <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} itemStyle={{ color: '#f8fafc' }} labelStyle={{ color: '#f8fafc' }} contentStyle={{ background: '#1e293b', border: 'none' }} />
                            <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={35} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}

export function CompareView({ hospitals, compareList, setCompareList }) {
    const selectedHospitals = hospitals.filter(h => compareList.includes(h._id));

    return (
        <motion.div className="compare-view-pro" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {selectedHospitals.length === 0 ? (
                <div className="empty-compare-pro">
                    <div className="empty-icon">⚖️</div>
                    <h2>Benchmarking Sandbox</h2>
                    <p>Select multiple hospitals from the registers to perform a head-to-head architectural and performance analysis.</p>
                </div>
            ) : (
                <div className="compare-grid-pro">
                    {selectedHospitals.map(h => (
                        <div key={h._id} className="compare-card-pro">
                            <div className="c-card-head">
                                <div className="c-score-ring">
                                    <svg viewBox="0 0 36 36" className="circular-chart">
                                        <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <path className="circle" strokeDasharray={`${h.overallScore}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                                        <text x="18" y="20.35" className="percentage">{(h.overallScore || 0).toFixed(0)}%</text>
                                    </svg>
                                </div>
                                <h3>{h.name}</h3>
                                <p className="c-loc">{h.city}, {h.state}</p>
                            </div>

                            <div className="c-card-body">
                                <div className="c-stat-group">
                                    <div className="c-stat"><span>Typology</span><strong>{h.ownership_type || h.type}</strong></div>
                                    <div className="c-stat"><span>Capacity</span><strong>{h.total_beds} Beds</strong></div>
                                    <div className="c-stat"><span>Accreditation</span><strong className="success-text">NABH Certified</strong></div>
                                </div>

                                <div className="c-divider" />

                                <div className="c-factors-pro">
                                    <p className="factor-title">Dimensional Performance</p>
                                    {Object.entries(h.categoryScores || {}).map(([k, v]) => (
                                        <div key={k} className="c-f-row-pro">
                                            <div className="f-info">
                                                <span className="lbl">{k.replace(/_/g, ' ')}</span>
                                                <span className="val">{v}%</span>
                                            </div>
                                            <div className="bar-track-pro">
                                                <motion.div
                                                    className="bar-thumb-pro"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${v}%` }}
                                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                                    style={{ background: v > 80 ? 'var(--success)' : v > 60 ? 'var(--primary)' : 'var(--warning)' }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="c-remove-btn-pro" onClick={() => setCompareList(prev => prev.filter(id => id !== h._id))}>
                                Dismantle Comparison
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
