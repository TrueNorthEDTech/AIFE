import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle2, ChevronRight, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type ReportData = {
    role: string;
    framework: string;
    stage: string;
    summary: string;
    strengths: string[];
    actions: { step: number; title: string; description: string }[];
    nextSteps: string;
};

const FRAMEWORK_COLORS: Record<string, { primary: string; badge: string; bg: string }> = {
    RISE: { primary: 'text-orange-600', badge: 'bg-orange-100 text-orange-700 border-orange-200', bg: 'bg-orange-50' },
    AGENCY: { primary: 'text-blue-600', badge: 'bg-blue-100 text-blue-700 border-blue-200', bg: 'bg-blue-50' },
    PROMPT: { primary: 'text-green-600', badge: 'bg-green-100 text-green-700 border-green-200', bg: 'bg-green-50' },
};

const DEFAULT_REPORT: ReportData = {
    role: "Educator",
    framework: "AGENCY",
    stage: "Developing",
    summary: "Based on your session with Glowie, you're exploring how AI can support meaningful learning agency. You're thinking carefully about both the opportunities and the human dimensions that need to stay intact.",
    strengths: [
        "You recognize the importance of keeping humans at the center of AI decisions.",
        "You are thoughtfully approaching adoption rather than reacting to AI trends.",
    ],
    actions: [
        { step: 1, title: "Clarify Your True North", description: "Hold a team session to define your institution's non-negotiable values around technology and human agency." },
        { step: 2, title: "Map One Opportunity", description: "Identify one process where AI can save time, and explicitly plan how to reinvest that time into human connection." },
        { step: 3, title: "Pilot With PROMPT", description: "Design one classroom activity that increases student choice and creative agency using AI scaffolding." },
        { step: 4, title: "Reflect & Iterate", description: "After 4 weeks, assess whether your pilot increased or decreased learner agency and adjust accordingly." },
    ],
    nextSteps: "Join the True North community at truenorthed.tech to continue your journey and connect with educators on the same path.",
};

export default function Report() {
    const [isExporting, setIsExporting] = useState(false);
    const [report, setReport] = useState<ReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [hasConversation, setHasConversation] = useState(false);

    useEffect(() => {
        generateReport();
    }, []);

    const generateReport = async () => {
        setIsGenerating(true);
        const rawConversation = sessionStorage.getItem('glowieConversation');

        if (!rawConversation) {
            // No conversation — show the default report
            setHasConversation(false);
            setReport(DEFAULT_REPORT);
            setIsGenerating(false);
            return;
        }

        setHasConversation(true);
        try {
            const messages = JSON.parse(rawConversation);
            const res = await fetch('/api/report', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages }),
            });

            if (res.ok) {
                const data = await res.json();
                setReport(data.report || DEFAULT_REPORT);
            } else {
                setReport(DEFAULT_REPORT);
            }
        } catch (err) {
            console.error('Report generation error:', err);
            setReport(DEFAULT_REPORT);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleExport = () => {
        setIsExporting(true);
        const element = document.getElementById('report-content');
        setTimeout(() => {
            const opt: any = {
                margin: 0.5,
                filename: `TrueNorth_AIFE_Report_${report?.role?.replace(/\s/g, '_') || 'Educator'}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            if (element) {
                html2pdf().from(element as HTMLElement).set(opt).save().then(() => {
                    setIsExporting(false);
                });
            } else {
                setIsExporting(false);
            }
        }, 100);
    };

    const colors = FRAMEWORK_COLORS[report?.framework || 'AGENCY'] || FRAMEWORK_COLORS['AGENCY'];

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] gap-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                    <Sparkles className="w-12 h-12 text-tn-primary" />
                </motion.div>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Generating Your Report...</h2>
                    <p className="text-slate-500">Glowie is analyzing your session to craft personalized insights.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto w-full pb-12">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-white/80 p-4 rounded-xl border border-slate-200 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Your Personal Action Report</h1>
                    <p className="text-slate-500 text-sm">
                        {hasConversation ? 'Generated by Glowie from your session' : 'Sample report — complete a chat session to personalize this'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!hasConversation && (
                        <Link
                            to="/chat"
                            className="flex items-center gap-2 px-4 py-2 bg-tn-primary text-white font-medium rounded-lg hover:bg-tn-primary/90 transition-colors text-sm"
                        >
                            <Sparkles className="w-4 h-4" />
                            Start Chat First
                        </Link>
                    )}
                    {hasConversation && (
                        <button
                            onClick={generateReport}
                            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors border border-slate-200 shadow-sm font-medium text-sm"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Regenerate
                        </button>
                    )}
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors border border-slate-200 shadow-sm disabled:opacity-50 font-medium text-sm"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export PDF'}</span>
                    </button>
                    <button
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: 'My True North Report', url: window.location.href });
                            } else {
                                navigator.clipboard.writeText(window.location.href);
                                alert('Link copied!');
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-tn-primary hover:bg-tn-primary/80 text-white rounded-lg transition-colors text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Share</span>
                    </button>
                </div>
            </div>

            {/* Report Content */}
            <motion.div
                id="report-content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-slate-900 rounded-2xl p-8 md:p-12 shadow-xl border border-slate-200 relative overflow-hidden"
            >
                {/* Gradient Header Bar */}
                <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-tn-primary via-tn-secondary to-tn-accent" />

                {/* Header */}
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-slate-200 pb-8 mb-8 gap-4 pt-4">
                    <div className="flex items-start gap-6">
                        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0">
                            <img src="/logo.png" alt="True North Logo" className="w-full h-full object-contain drop-shadow-md" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">AIFE Session Insights</h2>
                            <p className="text-slate-500 font-medium">True North · Designing for AGENCY</p>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {report?.role && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                                        {report.role}
                                    </span>
                                )}
                                {report?.framework && (
                                    <span className={`text-xs px-3 py-1 rounded-full font-bold border ${colors.badge}`}>
                                        {report.framework} Framework
                                    </span>
                                )}
                                {report?.stage && (
                                    <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold border border-purple-200">
                                        {report.stage}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold">Date</p>
                        <p className="text-slate-700 font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                </header>

                {/* Summary */}
                <section className="mb-12">
                    <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${colors.primary}`}>
                        <CheckCircle2 className="w-6 h-6" />
                        Current State Assessment
                    </h3>
                    <p className="text-slate-700 text-lg leading-relaxed mb-6">{report?.summary}</p>

                    {report?.strengths && report.strengths.length > 0 && (
                        <div className={`rounded-xl p-6 border ${colors.bg}`}>
                            <h4 className="font-semibold text-slate-900 mb-3">Key Strengths Identified:</h4>
                            <ul className="space-y-2">
                                {report.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-slate-700">
                                        <ChevronRight className="w-5 h-5 text-tn-primary shrink-0 mt-0.5" />
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>

                {/* Action Plan */}
                {report?.actions && report.actions.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl font-bold text-tn-secondary mb-4 flex items-center gap-2">
                            <CheckCircle2 className="w-6 h-6" />
                            Your {report?.framework || 'Action'} Plan
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            {report.actions.map((action, i) => (
                                <div key={i} className={`bg-white border rounded-xl p-5 shadow-sm ${report && i === report.actions.length - 1 ? 'border-tn-secondary/30 ring-1 ring-tn-secondary/10' : ''}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4 ${report && i === report.actions.length - 1 ? 'bg-tn-secondary text-white' : 'bg-tn-secondary/10 text-tn-secondary'}`}>
                                        {action.step}
                                    </div>
                                    <h4 className="font-bold text-slate-900 mb-2">{action.title}</h4>
                                    <p className="text-slate-600 text-sm">{action.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
                    <p className="text-slate-500 font-medium mb-2">Ready for the next step?</p>
                    <p className="text-slate-600 text-sm">{report?.nextSteps}</p>
                    <a
                        href="https://truenorthed.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-6 py-2.5 bg-tn-primary text-white font-semibold rounded-lg hover:bg-tn-primary/90 transition-colors text-sm"
                    >
                        Join TrueNorthEd.tech →
                    </a>
                </footer>
            </motion.div>
        </div>
    );
}
