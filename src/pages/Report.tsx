import { motion } from 'framer-motion';
import { Download, Share2, CheckCircle2, ChevronRight, Loader2, Sparkles, RefreshCw, Clock, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// @ts-ignore
import html2pdf from 'html2pdf.js';

type ReportData = {
    role: string;
    framework: string;
    stage: string;
    trustScore?: string; // 0-100 indicating Agency vs Fear
    summary: string;
    strengths: string[];
    actions: { timeline: string; title: string; description: string }[];
    stakeholders: { role: string; strategy: string }[];
    bookReferences: { concept: string; chapter: string; application: string }[];
    pilot2026?: { recommended: boolean; why: string; cta: string };
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
    trustScore: "65",
    summary: "Based on your session with Glowie, you're exploring how AI can support meaningful learning agency. You're thinking carefully about both the opportunities and the human dimensions that need to stay intact, balancing institutional caution with pedagogical innovation.",
    strengths: [
        "Strong commitment to human-centric pedagogical values.",
        "Awareness of the risks of cognitive offloading in student work.",
        "Proactive approach to stakeholder communication."
    ],
    actions: [
        { timeline: "Immediate (Next 7 Days)", title: "Audit for Agency", description: "Identify one task this week where students could use AI as a 'Scaffolding Partner' rather than a 'Ghostwriter'." },
        { timeline: "Short-term (30-Day Goal)", title: "Stakeholder Alignment", description: "Host a small pilot group to test the AGENCY flywheel in your specific grade level/subject." },
        { timeline: "Strategic (90-Day Vision)", title: "Systemic Integration", description: "Embed the Human-First Protocol into your standard unit planning template." }
    ],
    stakeholders: [
        { role: "Students", strategy: "Communicate clearly about when AI tools are 'Agentic' vs. 'Automatic' to build their critical discernment." },
        { role: "Teachers", strategy: "Share your findings from the Audit for Agency to spark professional dialogue." },
        { role: "Leadership", strategy: "Demystify the school's AI approach by showing examples of human-AI collaboration." }
    ],
    bookReferences: [
        { concept: "Human-First Protocol", chapter: "Chapter 4", application: "Ensures you decide the 'non-negotiable' human skills before selecting AI tools." }
    ],
    pilot2026: {
        recommended: true,
        why: "Your focus on balancing governance with classroom agency makes you an ideal candidate for early-stage framework testing.",
        cta: "You are a prime candidate for our early 2026 True North Pilot. Register interest below."
    },
    nextSteps: "Join the True North community at truenorthed.tech to continue your journey and connect with educators on the same path."
};

export default function Report() {
    const [isExporting, setIsExporting] = useState(false);
    const [report, setReport] = useState<ReportData | null>(null);
    const [isGenerating, setIsGenerating] = useState(true);
    const [hasConversation, setHasConversation] = useState(false);
    
    // Lead Capture State
    const [showLeadForm, setShowLeadForm] = useState(false);
    const [leadName, setLeadName] = useState('');
    const [leadEmail, setLeadEmail] = useState('');

    useEffect(() => {
        const rawConversation = localStorage.getItem('glowieConversation') || sessionStorage.getItem('glowieConversation');
        if (!rawConversation) {
            // No conversation — show the default report
            setHasConversation(false);
            setReport(DEFAULT_REPORT);
            setIsGenerating(false);
        } else {
            setHasConversation(true);
            setIsGenerating(false);
            setShowLeadForm(true); // Require form before generating
        }
    }, []);

    const generateReport = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsGenerating(true);
        setShowLeadForm(false);
        
        // Prioritize localStorage for cross-tab persistence, fallback to sessionStorage
        const rawConversation = localStorage.getItem('glowieConversation') || sessionStorage.getItem('glowieConversation');

        if (!rawConversation) {
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
                body: JSON.stringify({ 
                    messages,
                    name: leadName,
                    email: leadEmail
                }),
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

    if (showLeadForm) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] max-w-md mx-auto w-full px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full relative overflow-hidden"
                >
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-tn-primary to-tn-accent" />
                    <BookOpen className="w-12 h-12 text-tn-primary mb-6" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Unlock Your True North Report</h2>
                    <p className="text-slate-600 mb-8 text-sm leading-relaxed">Glowie has finished analyzing your session. Enter your details to generate your personalized PDF assessment and action plan.</p>
                    
                    <form onSubmit={generateReport} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                            <input 
                                required
                                type="text" 
                                value={leadName}
                                onChange={(e) => setLeadName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tn-primary focus:bg-white transition-all font-medium"
                                placeholder="Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <input 
                                required
                                type="email" 
                                value={leadEmail}
                                onChange={(e) => setLeadEmail(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-tn-primary focus:bg-white transition-all font-medium"
                                placeholder="jane@school.edu"
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full py-3.5 bg-tn-primary text-white font-bold rounded-lg hover:bg-tn-primary/90 transition-colors mt-4 shadow-md flex justify-center items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Generate My Report
                        </button>
                    </form>
                </motion.div>
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
                        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full overflow-hidden border-2 border-slate-100 bg-white shadow-sm flex items-center justify-center">
                            <img src="/logo.png" alt="True North Logo" className="w-full h-full object-cover mix-blend-multiply" />
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

                {/* Summary & Trust Score */}
                <section className="mb-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${colors.primary}`}>
                                <CheckCircle2 className="w-6 h-6" />
                                Current State Assessment
                            </h3>
                            <p className="text-slate-700 text-lg leading-relaxed mb-6">{report?.summary}</p>
                        </div>

                        {report?.trustScore && (
                            <div className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-inner">
                                <div className="text-center mb-4">
                                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Agency vs Fear</span>
                                    <div className="text-4xl font-serif font-black text-tn-primary mt-1">{report.trustScore}%</div>
                                </div>
                                <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden relative">
                                    <div
                                        className="h-full bg-gradient-to-r from-tn-primary to-tn-accent transition-all duration-1000"
                                        style={{ width: `${report.trustScore}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <span>Control</span>
                                    <span>Agency</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {report?.strengths && report.strengths.length > 0 && (
                        <div className={`rounded-xl p-6 border ${colors.bg} mt-6`}>
                            <h4 className="font-semibold text-slate-900 mb-3">Core Opportunities:</h4>
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

                {/* Action Plan - Strategic Timeline */}
                {report?.actions && report.actions.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl font-bold text-tn-secondary mb-6 flex items-center gap-2">
                            <Clock className="w-6 h-6" />
                            Strategic Transformation Timeline
                        </h3>
                        <div className="space-y-4">
                            {report.actions.map((action, i) => (
                                <div key={i} className="flex gap-4 md:gap-6 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'bg-tn-primary border-tn-primary' : 'bg-white border-slate-300'} z-10`} />
                                        {i !== report.actions.length - 1 && <div className="w-0.5 h-full bg-slate-200 -mt-1" />}
                                    </div>
                                    <div className={`flex-1 pb-8`}>
                                        <span className="text-xs font-bold uppercase tracking-widest text-tn-primary mb-1 block">
                                            {action.timeline}
                                        </span>
                                        <h4 className="font-bold text-slate-900 text-lg mb-2">{action.title}</h4>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-600 text-[15px] leading-relaxed">
                                            {action.description}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Stakeholder Strategy */}
                {report?.stakeholders && report.stakeholders.length > 0 && (
                    <section className="mb-12">
                        <h3 className="text-xl font-bold text-tn-accent mb-6 flex items-center gap-2">
                            <Users className="w-6 h-6" />
                            Stakeholder Alignment Strategy
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            {report.stakeholders.map((sh, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                                    <h4 className="font-bold text-slate-900 mb-2 text-sm uppercase tracking-wide border-b pb-2 border-slate-100 flex items-center gap-2">
                                        <div className="w-1.5 h-4 bg-tn-accent rounded-full" />
                                        {sh.role}
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">{sh.strategy}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Book Reference Section */}
                {report?.bookReferences && report.bookReferences.length > 0 && (
                    <section className="mb-12 p-8 rounded-2xl bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <BookOpen className="w-32 h-32 rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-tn-accent">
                                <BookOpen className="w-6 h-6" />
                                Deep Dive: *Designing for AGENCY*
                            </h3>
                            <div className="space-y-6">
                                {report.bookReferences.map((ref, i) => (
                                    <div key={i} className="border-l-2 border-tn-accent/30 pl-6">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-tn-accent font-bold text-sm tracking-widest uppercase">{ref.concept}</span>
                                            <span className="text-slate-400 text-xs">— {ref.chapter}</span>
                                        </div>
                                        <p className="text-slate-300 leading-relaxed italic">
                                            &quot;{ref.application}&quot;
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* Pilot 2026 CTA */}
                {report?.pilot2026 && (
                    <section className="mb-16 p-8 rounded-2xl bg-gradient-to-br from-tn-primary/10 via-white to-tn-accent/10 border-2 border-tn-primary/20 shadow-lg text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Sparkles className="w-24 h-24" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">The True North Pilot 2026</h3>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">{report.pilot2026.why}</p>
                        <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 mb-6 inline-block">
                            <span className="text-tn-primary font-bold">{report.pilot2026.cta}</span>
                        </div>
                        <div>
                            <button
                                onClick={() => alert('Interest registered! We will reach out soon.')}
                                className="px-8 py-4 bg-tn-primary text-white font-bold rounded-xl shadow-xl hover:scale-105 transition-transform"
                            >
                                Register Your Interest
                            </button>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-16 pt-8 border-t border-slate-200 text-center">
                    <p className="text-slate-500 font-medium mb-2 leading-relaxed">
                        Ready to join the movement? Explore the concepts further in our book <br />
                        <strong className="text-slate-900">Designing for AGENCY</strong> and join 1,000+ educators at
                    </p>
                    <a
                        href="https://truenorthed.tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 px-8 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg text-lg"
                    >
                        truenorthed.tech
                    </a>
                    <p className="mt-8 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Phase 9 Assessment Engine · v3.0.0
                    </p>
                </footer>
            </motion.div>
        </div>
    );
}
