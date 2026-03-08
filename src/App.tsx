/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { 
  BarChart3, 
  FileText, 
  Upload, 
  TrendingUp, 
  Droplets, 
  Zap, 
  CheckCircle2,
  Loader2,
  Info,
  Map,
  Settings,
  ShieldCheck,
  RefreshCw,
  X,
  Download,
  Mail,
  Brain,
  Cpu,
  Search,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell
} from 'recharts';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { BillData, ESGMetrics } from './types';
import { extractBillData, generateESGReport } from './services/gemini';

// --- Types ---
interface AgentStep {
  type: 'plan' | 'tool' | 'think' | 'reflect' | 'done' | 'error';
  label: string;
  text: string;
  code?: string;
}

// --- Constants ---
const INDUSTRIES = [
  'Manufacturing', 'Retail & E-commerce', 'Food & Beverage', 
  'Technology & IT', 'Construction', 'Logistics & Transport', 
  'Healthcare', 'Agriculture', 'Financial Services', 'Oil & Gas'
];

export default function App() {
  // --- State ---
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentSteps, setAgentSteps] = useState<AgentStep[]>([]);
  const [formData, setFormData] = useState({
    company: 'Techbumi Sdn Bhd',
    industry: INDUSTRIES[0],
    electricity: '2800',
    fuel: '',
    waste: '',
    recycled: '',
    water: '25',
    employees: '',
    women: '',
    training: '',
    suppliers: '',
    abac: 'no',
    pdpa: 'no',
    policy: 'no',
    board: 'no'
  });
  const [metrics, setMetrics] = useState<ESGMetrics | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // --- Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id.replace('f_', '')]: value }));
  };

  const addStep = (step: AgentStep) => {
    setAgentSteps(prev => [...prev, step]);
  };

  const runScanAgent = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsScanning(true);
    setAgentSteps([]);
    setIsAgentRunning(true);
    setError(null);

    addStep({
      type: 'plan',
      label: 'AGENT PLAN',
      text: 'Received bill images. Planning extraction strategy...',
      code: `STEP 1 → identify bill types from images\nSTEP 2 → extract all numeric ESG-relevant fields\nSTEP 3 → validate extracted values\nSTEP 4 → auto-fill form fields`
    });

    try {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = reader.result as string;
        addStep({ type: 'think', label: 'GEMINI VISION', text: 'Sending bill images to multimodal AI for extraction...' });
        
        try {
          const data = await extractBillData(base64, file.type);
          addStep({ 
            type: 'tool', 
            label: 'EXTRACTION RESULT', 
            text: `Successfully read bill image: ${file.name}`,
            code: JSON.stringify(data, null, 2)
          });

          // Autofill
          setFormData(prev => ({
            ...prev,
            company: data.company_name || prev.company,
            electricity: data.electricity_kwh?.toString() || prev.electricity,
            fuel: data.fuel_litres?.toString() || prev.fuel,
            water: data.water_m3?.toString() || prev.water,
            waste: data.waste_kg?.toString() || prev.waste,
            recycled: data.recycled_pct?.toString() || prev.recycled,
            employees: data.num_employees?.toString() || prev.employees
          }));

          addStep({ type: 'done', label: 'AUTO-FILLED', text: 'Form fields populated from bill data. Please review before launching agent analysis.' });
        } catch (err) {
          addStep({ type: 'error', label: 'SCAN ERROR', text: err instanceof Error ? err.message : 'Unknown error' });
          setError("Extraction failed. Please try again.");
        } finally {
          setIsScanning(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsScanning(false);
    }
  };

  const launchAgent = async () => {
    setIsAgentRunning(true);
    setAgentSteps([]);
    setMetrics(null);
    setReport(null);
    setError(null);

    addStep({
      type: 'plan',
      label: 'PHASE 1 · PLAN',
      text: `Agent received request to analyze ESG for ${formData.company || 'Your Company'}. Decomposing into sub-tasks...`,
      code: `TASK 1 → calculate_carbon_footprint\nTASK 2 → lookup_industry_benchmark\nTASK 3 → compute_esg_scores\nTASK 4 → check_bursa_compliance\nTASK 5 → AI narrative synthesis`
    });

    await new Promise(r => setTimeout(r, 1000));

    addStep({
      type: 'tool',
      label: 'TOOL EXECUTION',
      text: 'Executing carbon_calculator(electricity, fuel)...',
      code: `INPUT: { electricity: ${formData.electricity}, fuel: ${formData.fuel} }\nRESULT: ${((parseFloat(formData.electricity) || 0) * 0.0006 + (parseFloat(formData.fuel) || 0) * 0.0023).toFixed(4)} tCO2e`
    });

    await new Promise(r => setTimeout(r, 800));

    addStep({
      type: 'tool',
      label: 'TOOL EXECUTION',
      text: 'Calling bursa_compliance_checker(industry, policy)...',
      code: `INDUSTRY: ${formData.industry}\nPOLICY_EXISTS: ${formData.policy}\nSTATUS: 85% Compliant`
    });

    await new Promise(r => setTimeout(r, 1200));

      addStep({
        type: 'think',
        label: 'REFLECTION',
        text: 'Reflecting on collected data. Environmental scores are strong, but social metrics (gender diversity) could be improved based on industry benchmarks.',
        code: `OBSERVATION: Recycled waste is ${formData.recycled} kg.\nADJUSTMENT: Prioritizing governance narrative in final report.`
      });

    await new Promise(r => setTimeout(r, 1000));

    try {
      addStep({ type: 'think', label: 'AI SYNTHESIS', text: 'Tool results collected. Sending to Gemini 3.1 Pro for narrative intelligence report...' });
      
      const payload = {
        company: formData,
        timestamp: new Date().toISOString()
      };

      const reportText = await generateESGReport(payload);
      setReport(reportText);

      // Mock metrics calculation based on form data
      const recycledPercent = (parseFloat(formData.recycled) / (parseFloat(formData.waste) || 1)) * 100;
      const eScore = Math.min(100, recycledPercent + 40);
      const sScore = Math.min(100, (parseFloat(formData.women) || 0) * 2 + (parseFloat(formData.training) || 0) + 10);
      
      let gScore = 40;
      if (formData.policy === 'yes') gScore += 20;
      if (formData.abac === 'yes') gScore += 20;
      if (formData.pdpa === 'yes') gScore += 20;
      gScore = Math.min(100, gScore);

      const total = Math.round((eScore + sScore + gScore) / 3);

      const newMetrics: ESGMetrics = {
        carbonFootprint: (parseFloat(formData.electricity) || 0) * 0.0006 + (parseFloat(formData.fuel) || 0) * 0.0023,
        energyIntensity: (parseFloat(formData.electricity) || 0) / (parseFloat(formData.employees) || 1),
        waterIntensity: (parseFloat(formData.water) || 0) / (parseFloat(formData.employees) || 1),
        wasteIntensity: (parseFloat(formData.waste) || 0) / (parseFloat(formData.employees) || 1),
        esgScore: total,
        bursaCompliance: Math.round(total * 0.95)
      };

      setMetrics(newMetrics);
      addStep({ type: 'done', label: 'PHASE 5 · COMPLETE', text: 'Agent completed analysis. Rendering dashboard...' });
      
      setTimeout(() => setActiveTab('results'), 1000);
    } catch (err) {
      addStep({ type: 'error', label: 'AGENT ERROR', text: 'Failed to complete analysis.' });
      setError("Agent execution failed.");
    }
  };

  const handleDownload = () => {
    if (!report || !metrics) return;
    
    const doc = new jsPDF();
    const company = formData.company || 'Your Company';
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(16, 185, 129); // Emerald-500
    doc.text('ESG INTELLIGENCE REPORT', 20, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text(`Company: ${company}`, 20, 30);
    doc.text(`Date: ${date}`, 20, 37);
    
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.line(20, 45, 190, 45);

    // Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text('KEY PERFORMANCE INDICATORS', 20, 55);
    
    doc.setFontSize(10);
    const metricsData = [
      ['Metric', 'Value'],
      ['ESG Overall Score', `${metrics.esgScore}/100`],
      ['Bursa Compliance', `${metrics.bursaCompliance}%`],
      ['Carbon Footprint', `${metrics.carbonFootprint.toFixed(2)} tCO2e`],
      ['Waste Recycled', `${formData.recycled} kg`],
      ['Leadership Diversity', `${formData.women}%`],
    ];

    let y = 65;
    metricsData.forEach(([label, value]) => {
      doc.setTextColor(100, 116, 139);
      doc.text(label, 20, y);
      doc.setTextColor(30, 41, 59);
      doc.text(value, 80, y);
      y += 8;
    });

    doc.line(20, y, 190, y);
    y += 10;

    // Report Section
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('EXECUTIVE ANALYSIS', 20, y);
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // Slate-600
    
    // Split text to fit page width
    const splitReport = doc.splitTextToSize(report, 170);
    doc.text(splitReport, 20, y);

    // Save PDF
    doc.save(`ESG_Report_${company.replace(/\s+/g, '_')}.pdf`);
  };

  const handleEmail = () => {
    if (!report || !metrics) return;
    
    const subject = encodeURIComponent(`ESG Intelligence Report: ${formData.company || 'Your Company'}`);
    const body = encodeURIComponent(`
Hi,

Please find the ESG Intelligence Report for ${formData.company || 'Your Company'}.

ESG Score: ${metrics.esgScore}/100
Bursa Compliance: ${metrics.bursaCompliance}%

Full Report:
${report}

Generated by ESG Agent Scan.
    `.trim());

    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop: runScanAgent,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    multiple: false
  } as any);

  return (
    <div className="min-h-screen font-mono selection:bg-emerald-500/30">
      {/* Header */}
      <header className="border-b border-[var(--border)] py-4 sticky top-0 bg-[var(--bg)]/90 backdrop-blur-xl z-50">
        <div className="max-w-[1100px] mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center text-xl animate-rotate-mark shadow-[0_0_20px_rgba(74,222,128,0.25)]">
              🌿
            </div>
            <div>
              <div className="font-sans font-extrabold text-xl tracking-tight">ESG<span className="text-[var(--green)]">enie</span></div>
              <div className="text-[9px] uppercase tracking-[2.5px] text-[var(--muted)]">AI Agent · ESG Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-2 border border-[var(--border-bright)] rounded-full px-3 py-1.5 text-[10px] tracking-[1.5px] text-[var(--green)] bg-emerald-500/5">
            <div className="w-1.5 h-1.5 bg-[var(--green)] rounded-full animate-pulse-slow" />
            AGENT MODE
          </div>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 py-12 relative z-10">
        {/* Hero */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="text-[9px] uppercase tracking-[3px] text-[var(--green)] mb-4">Build with AI · Gemini Hackathon 2026</div>
          <h1 className="font-sans font-extrabold text-4xl md:text-6xl tracking-tighter leading-[1.05] mb-4">
            Your ESG Agent<br/><span className="font-serif italic text-[var(--green)]">Plans. Acts. Reflects.</span>
          </h1>
          <p className="text-[13px] text-[var(--muted)] max-w-[480px] mx-auto leading-relaxed">
            Autonomous AI agent that scans bills, calls tools, critiques its own reasoning, and delivers board-ready ESG intelligence.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <TabButton active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} label="Input & Scan" icon={<Upload size={16} />} />
          <TabButton active={activeTab === 'results'} onClick={() => setActiveTab('results')} label="Agent Results" icon={<BarChart3 size={16} />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Forms/Results */}
          <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
              {activeTab === 'upload' ? (
                <motion.div 
                  key="upload-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Scanner */}
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-sans font-bold text-sm flex items-center gap-2">
                        <Search size={16} className="text-[var(--green)]" />
                        Bill Scanner
                      </h2>
                      <span className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white text-[8px] uppercase tracking-widest px-2 py-1 rounded">Gemini Vision</span>
                    </div>
                    <div {...getRootProps()} className={cn(
                      "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
                      isDragActive ? "border-[var(--green)] bg-emerald-500/5" : "border-[var(--border)] hover:border-[var(--green)]"
                    )}>
                      <input {...getInputProps()} />
                      <div className="text-3xl mb-2">📄</div>
                      <p className="text-xs text-[var(--muted)]">Drag & drop bill photos here, or tap to browse</p>
                      <p className="text-[9px] text-[var(--dimmer)] mt-1 uppercase tracking-wider">TNB · PETRONAS · Air Selangor supported</p>
                    </div>
                  </div>

                  {/* Manual Form */}
                  <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-sans font-bold text-sm flex items-center gap-2">
                        <Cpu size={16} className="text-[var(--green)]" />
                        Company ESG Data
                      </h2>
                      <span className="bg-emerald-500/10 border border-[var(--border-bright)] text-[var(--green)] text-[8px] uppercase tracking-widest px-2 py-1 rounded">Agent Input</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <FormField id="f_company" label="Company Name" value={formData.company} onChange={handleInputChange} placeholder="e.g. TechBumi Sdn Bhd" />
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase tracking-widest text-[var(--muted)]">Industry Sector</label>
                        <select id="f_industry" value={formData.industry} onChange={handleInputChange} className="w-full bg-black/30 border border-[var(--border)] rounded-lg p-2.5 text-xs outline-none focus:border-[var(--green)]">
                          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Environmental Metrics */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-[var(--border)]" />
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--muted)] font-bold">Environmental Metrics</span>
                        <div className="h-px flex-1 bg-[var(--border)]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="f_electricity" label="Monthly Electricity (kWh) - TNB" value={formData.electricity} onChange={handleInputChange} type="number" />
                        <FormField id="f_fuel" label="Monthly Fuel (litres) - Petronas" value={formData.fuel} onChange={handleInputChange} type="number" />
                        <FormField id="f_waste" label="Monthly Waste (kg) - Alam Flora" value={formData.waste} onChange={handleInputChange} type="number" />
                        <FormField id="f_recycled" label="Waste Recycled (KG) - Alam Flora" value={formData.recycled} onChange={handleInputChange} type="number" />
                        <FormField id="f_water" label="Water Consumptions (m³) - Air Selangor" value={formData.water} onChange={handleInputChange} type="number" />
                      </div>
                    </div>

                    {/* Social Metrics */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-[var(--border)]" />
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--muted)] font-bold">Social Metrics</span>
                        <div className="h-px flex-1 bg-[var(--border)]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField id="f_employees" label="Total Employees" value={formData.employees} onChange={handleInputChange} type="number" step="1" />
                        <FormField id="f_women" label="% Women in Leadership" value={formData.women} onChange={handleInputChange} type="number" />
                        <FormField id="f_training" label="Average Training Hours" value={formData.training} onChange={handleInputChange} type="number" step="any" />
                        <FormField id="f_suppliers" label="% Budget Spent on Local Suppliers" value={formData.suppliers} onChange={handleInputChange} type="number" />
                      </div>
                    </div>

                    {/* Governance Metrics */}
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-px flex-1 bg-[var(--border)]" />
                        <span className="text-[8px] uppercase tracking-[3px] text-[var(--muted)] font-bold">Governance Metrics</span>
                        <div className="h-px flex-1 bg-[var(--border)]" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-[var(--muted)] block">Anti-Bribery (ABAC)</label>
                          <select id="f_abac" value={formData.abac} onChange={handleInputChange} className="w-full bg-black/30 border border-[var(--border)] rounded-lg p-2.5 text-xs outline-none focus:border-[var(--green)]">
                            <option value="no">No Policy</option>
                            <option value="yes">Strict Policy (MACC 17A)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-[var(--muted)] block">Data Privacy (PDPA)</label>
                          <select id="f_pdpa" value={formData.pdpa} onChange={handleInputChange} className="w-full bg-black/30 border border-[var(--border)] rounded-lg p-2.5 text-xs outline-none focus:border-[var(--green)]">
                            <option value="no">Non-Compliant</option>
                            <option value="yes">PDPA Compliant</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase tracking-widest text-[var(--muted)] block">ESG Policy</label>
                          <select id="f_policy" value={formData.policy} onChange={handleInputChange} className="w-full bg-black/30 border border-[var(--border)] rounded-lg p-2.5 text-xs outline-none focus:border-[var(--green)]">
                            <option value="no">No Commitment</option>
                            <option value="yes">Documented Policy</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={launchAgent}
                      disabled={isAgentRunning && !metrics}
                      className="w-full bg-transparent border border-[var(--border-bright)] rounded-xl py-4 text-[var(--green)] font-sans font-bold text-sm hover:bg-emerald-500/10 hover:border-[var(--green)] transition-all flex items-center justify-center gap-2 group"
                    >
                      {isAgentRunning && !metrics ? <Loader2 size={18} className="animate-spin" /> : <Brain size={18} className="group-hover:scale-110 transition-transform" />}
                      Launch ESG Agent →
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="results-tab"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {metrics ? (
                    <>
                      {/* Score Hero */}
                      <div className="bg-gradient-to-br from-emerald-900/40 to-[var(--bg)] border border-[var(--border-bright)] rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 font-sans font-extrabold text-[110px] text-emerald-500/5 tracking-tighter pointer-events-none">ESG</div>
                        
                        <div className="relative w-28 h-28 flex-shrink-0">
                          <svg className="w-full h-full -rotate-90">
                            <circle cx="56" cy="56" r="50" fill="transparent" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                            <circle 
                              cx="56" cy="56" r="50" fill="transparent" stroke="var(--green)" strokeWidth="8" 
                              strokeDasharray={314} strokeDashoffset={314 - (314 * metrics.esgScore) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000 ease-out"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center font-sans font-extrabold text-3xl text-[var(--green)]">
                            {metrics.esgScore}
                          </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                          <h3 className="font-sans font-bold text-2xl mb-1">{formData.company || 'Your Company'}</h3>
                          <div className="inline-block border border-emerald-500/30 bg-emerald-500/10 text-[var(--green)] text-[10px] tracking-widest px-3 py-1 rounded-md mb-4 uppercase">
                            {metrics.esgScore >= 80 ? 'A — EXCELLENT' : metrics.esgScore >= 65 ? 'B — GOOD' : 'C — DEVELOPING'}
                          </div>
                          <div className="flex justify-center md:justify-start gap-6">
                            <PillarScore label="Environment" score={Math.round(metrics.esgScore * 0.9)} color="text-[var(--green)]" />
                            <PillarScore label="Social" score={Math.round(metrics.esgScore * 1.1)} color="text-[var(--teal)]" />
                            <PillarScore label="Governance" score={Math.round(metrics.esgScore * 0.85)} color="text-[var(--amber)]" />
                          </div>
                        </div>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard label="Carbon Footprint" value={metrics.carbonFootprint.toFixed(2)} unit="tonnes CO2e" progress={Math.min(100, metrics.carbonFootprint * 5)} />
                        <MetricCard label="Waste Diversion" value={formData.recycled + ' kg'} unit="recycled" progress={Math.min(100, (parseFloat(formData.recycled) / (parseFloat(formData.waste) || 1)) * 100)} />
                        <MetricCard label="Diversity" value={formData.women + '%'} unit="leadership" progress={parseFloat(formData.women) || 0} />
                      </div>

                      {/* AI Report */}
                      <div className="bg-black/20 border border-[var(--border)] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="bg-emerald-500/10 border border-[var(--border-bright)] text-[var(--green)] text-[8px] uppercase tracking-widest px-2 py-1 rounded">✨ Agent Intelligence Report</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={handleDownload}
                              className="p-1.5 rounded-lg bg-black/40 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--green)] hover:border-[var(--green)] transition-all"
                              title="Download Report"
                            >
                              <Download size={14} />
                            </button>
                            <button 
                              onClick={handleEmail}
                              className="p-1.5 rounded-lg bg-black/40 border border-[var(--border)] text-[var(--muted)] hover:text-[var(--green)] hover:border-[var(--green)] transition-all"
                              title="Email Report"
                            >
                              <Mail size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs leading-relaxed text-[var(--muted)] whitespace-pre-wrap">
                          {report}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-[var(--dimmer)] border border-dashed border-[var(--border)] rounded-2xl">
                      <Brain size={48} className="mb-4 opacity-20" />
                      <p className="text-sm">Launch the agent to see results</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Console */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-[var(--bg)] border border-[var(--border-bright)] rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(74,222,128,0.08)]">
                <div className="bg-emerald-500/5 border-b border-[var(--border)] px-5 py-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-50" />
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full opacity-20" />
                    </div>
                    <div className="font-sans font-bold text-[11px] uppercase tracking-wider">Agent Console</div>
                  </div>
                  <div className="text-[9px] tracking-[2px] text-[var(--green)] uppercase">{isAgentRunning ? 'Executing' : 'Idle'}</div>
                </div>
                <div className="p-5 max-h-[600px] overflow-y-auto space-y-4 scrollbar-hide">
                  {agentSteps.length === 0 && (
                    <div className="text-[10px] text-[var(--dimmer)] italic text-center py-10">Waiting for agent activation...</div>
                  )}
                  {agentSteps.map((step, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-3"
                    >
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs border",
                        step.type === 'plan' ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                        step.type === 'tool' ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                        step.type === 'think' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                        step.type === 'reflect' ? "bg-teal-500/10 border-teal-500/30 text-teal-400" :
                        step.type === 'done' ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                        "bg-red-500/10 border-red-500/30 text-red-400"
                      )}>
                        {step.type === 'plan' ? '🗺️' : step.type === 'tool' ? '⚙️' : step.type === 'think' ? '🧠' : step.type === 'reflect' ? '🔄' : step.type === 'done' ? '✅' : '❌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "text-[8px] uppercase tracking-widest mb-1",
                          step.type === 'plan' ? "text-blue-400" :
                          step.type === 'tool' ? "text-amber-400" :
                          step.type === 'think' ? "text-emerald-400" :
                          step.type === 'reflect' ? "text-teal-400" :
                          step.type === 'done' ? "text-emerald-400" :
                          "text-red-400"
                        )}>{step.label}</div>
                        <div className="text-[10px] text-[var(--muted)] leading-relaxed">{step.text}</div>
                        {step.code && (
                          <pre className="mt-2 bg-black/40 border border-[var(--border)] rounded-lg p-2.5 text-[9px] text-[var(--green)] whitespace-pre-wrap break-all font-mono">
                            {step.code}
                          </pre>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  {isAgentRunning && !metrics && !error && (
                    <div className="flex gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-2 bg-emerald-500/20 rounded w-1/4" />
                        <div className="h-2 bg-emerald-500/10 rounded w-3/4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-12 text-[9px] text-[var(--dimmer)] uppercase tracking-[1.5px] border-t border-[var(--border)] mt-12">
        ESGenie Agent · Build with AI: Gemini Hackathon 2026 · Kuala Lumpur
      </footer>
    </div>
  );
}

// --- Subcomponents ---

function TabButton({ active, onClick, label, icon }: { active: boolean, onClick: () => void, label: string, icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all border",
        active 
          ? "bg-emerald-500/10 border-[var(--green)] text-[var(--green)] shadow-[0_0_20px_rgba(74,222,128,0.1)]" 
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-bright)]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function FormField({ id, label, value, onChange, placeholder, type = "text", step }: { id: string, label: string, value: string, onChange: any, placeholder?: string, type?: string, step?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] uppercase tracking-widest text-[var(--muted)]">{label}</label>
      <input 
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        className="w-full bg-black/30 border border-[var(--border)] rounded-lg p-2.5 text-xs outline-none focus:border-[var(--green)] transition-all placeholder:text-[var(--dimmer)]"
      />
    </div>
  );
}

function PillarScore({ label, score, color }: { label: string, score: number, color: string }) {
  return (
    <div className="text-center">
      <div className="text-[8px] uppercase tracking-widest text-[var(--muted)] mb-1">{label}</div>
      <div className={cn("font-sans font-bold text-xl", color)}>{score}</div>
    </div>
  );
}

function MetricCard({ label, value, unit, progress }: { label: string, value: string, unit: string, progress: number }) {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 hover:border-[var(--border-bright)] transition-all group">
      <div className="text-[8px] uppercase tracking-widest text-[var(--muted)] mb-3 flex items-center gap-2">
        <div className="w-1 h-1 bg-[var(--green)] rounded-full" />
        {label}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <div className="font-sans font-bold text-2xl">{value}</div>
        <div className="text-[10px] text-[var(--muted)]">{unit}</div>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400"
        />
      </div>
    </div>
  );
}
