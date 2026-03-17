import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Send, Building2, Users, Pencil, Compass, Clock, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// True North Logo Colors
// Red   = True North Core Compass   #D13038
// Orange = RISE (Macro / Institutional) #EC8B29
// Blue   = AGENCY (Meso / Curriculum)   #357DB8
// Green  = PROMPT (Micro / Classroom)   #5BB76A

// Framework data sourced directly from Designing for AGENCY (2026) by Norman, Garvin & Pelletier
const frameworks = [
    {
        id: 'RISE',
        level: 'Macro · Institutional',
        icon: Building2,
        color: '#EC8B29',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-600',
        badgeColor: 'bg-orange-100 text-orange-700',
        title: 'RISE',
        subtitle: 'Readiness · Implementation Ability · Strategic Alignment · Ethical Foundation',
        description: 'The architectural blueprint for institutional change. RISE is the governance framework that moves institutions from reactive AI bans toward a strategic, human-centred structure anchored to their True North — mission, values, and strategic goals.',
        keyIdeas: [
            'R: Readiness Assessment — building awareness and desire before adoption',
            'I: Implementation Ability — knowledge, coaching, and time for execution',
            'S: Strategic Alignment — every initiative tied to your True North',
            'E: Ethical Foundation — Human-in-the-Loop governance and the Human-First Protocol',
        ],
    },
    {
        id: 'AGENCY',
        level: 'Meso · Pedagogical',
        icon: Users,
        color: '#357DB8',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-600',
        badgeColor: 'bg-blue-100 text-blue-700',
        title: 'AGENCY',
        subtitle: 'Assess · Guide · Empower · Network · Critique · Your Voice',
        description: 'The six-step pedagogical flywheel for educators. AGENCY engineers the human-AI interaction so students move from passive consumption to active, critical creation — counteracting cognitive offloading and hollow authenticity.',
        keyIdeas: [
            'A: Assess — define the core human skill the lesson builds',
            'G: Guide — structure purposeful AI interactions with scaffolding',
            'E: Empower — move students from consumption to tangible creation',
            'N: Network — mandate unmediated human collaboration (Human-First Protocol)',
            'C: Critique — students become the ethical auditors of AI output',
            "Y: Your Voice — centre the student's unique perspective in the final product",
        ],
    },
    {
        id: 'PROMPT',
        level: 'Micro · Classroom',
        icon: Pencil,
        color: '#5BB76A',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-600',
        badgeColor: 'bg-green-100 text-green-700',
        title: 'PROMPT',
        subtitle: 'Purpose · Relationship · Outcome · Method · Parameters · Test & Refine',
        description: "The tactical steering wheel. PROMPT is a structured briefing language that keeps the human firmly in the pilot's seat — transforming vague AI requests into intentional, agentic goals and preventing vending-machine usage of AI.",
        keyIdeas: [
            'P: Purpose — define intent and link to the pedagogical why',
            'R: Relationship — establish context and cast AI in a specific role',
            'O: Outcome — specify the exact format and artifact expected',
            "M: Method — embed pedagogical models (e.g. Bloom's Taxonomy) in the AI instructions",
            'P: Parameters & Ethical Checkpoints — set the boundaries and safety guardrails',
            'T: Test & Refine — the first output is only a first draft; the human remains quality control',
        ],
    },
];

const steps = [
    {
        num: '01', title: 'Share Your Role', desc: "Tell Glowie whether you're a school leader, curriculum designer, or classroom teacher."
    },
    { num: '02', title: 'Explore Your Path', desc: 'Glowie asks targeted questions about your current AI challenges and goals.' },
    { num: '03', title: 'Get Your Report', desc: 'Receive a personalised action plan aligned to RISE, AGENCY, or PROMPT.' },
];

export default function Overview() {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [openFramework, setOpenFramework] = useState<string | null>(null);

    const handleWaitlistSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        try {
            if (import.meta.env.VITE_SUPABASE_URL) {
                await supabase.from('waitlist').insert([{ email, source: 'AIFE_Prototype' }]);
            }
            setSubmitted(true);
            setEmail('');
        } catch {
            setSubmitted(true);
            setEmail('');
        }
    };

    return (
        <div className="max-w-5xl mx-auto w-full py-4 space-y-16">

            {/* ── Hero ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6 pt-4"
            >
                {/* Compass Logo Mark */}
                <div className="flex justify-center mb-2">
                    <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-8 border-transparent"
                            style={{ background: 'conic-gradient(#EC8B29 0deg 120deg, #357DB8 120deg 240deg, #5BB76A 240deg 360deg)', borderRadius: '50%' }}>
                        </div>
                        <div className="absolute inset-[6px] bg-white rounded-full flex items-center justify-center">
                            <Compass className="w-8 h-8" style={{ color: '#D13038' }} />
                        </div>
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-gray-900">
                    Welcome to the{' '}
                    <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(to right, #EC8B29, #D13038)' }}>
                        AIFE Experience
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                    A 15-minute guided conversation with Glowie — your True North AI consultant — designed to illuminate
                    your pathway to genuine human agency in an AI-integrated world.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                    <Link
                        to="/chat"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-white text-lg shadow-lg hover:shadow-xl hover:opacity-90 transition-all group"
                        style={{ background: 'linear-gradient(135deg, #D13038 0%, #EC8B29 100%)' }}
                    >
                        Start Your 15-Minute Journey
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <a href="#frameworks" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-gray-700 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 transition-all">
                        Learn the Frameworks
                        <ChevronDown className="w-4 h-4" />
                    </a>
                </div>
            </motion.div>

            {/* ── How It Works ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8"
            >
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">How It Works</h2>
                <p className="text-gray-500 text-center mb-8 text-sm">Three simple steps to your personalised action report</p>
                <div className="flex items-start gap-4">
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5" style={{ color: '#D13038' }} />
                        <span className="text-sm font-semibold text-gray-700">~15 Minutes</span>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mt-4">
                    {steps.map((step, i) => (
                        <div key={step.num} className="relative flex flex-col gap-3">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                style={{ background: i === 0 ? '#EC8B29' : i === 1 ? '#357DB8' : '#5BB76A' }}>
                                {step.num}
                            </div>
                            <h3 className="font-bold text-gray-900">{step.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* ── Framework Cards ── */}
            <div id="frameworks" className="space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">The Three Frameworks</h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
                        True North's approach operates at three interconnected levels. Glowie will identify which level
                        is most urgent <em>for you</em> and map your personalised next steps.
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {frameworks.map((fw, i) => {
                        const Icon = fw.icon;
                        const isOpen = openFramework === fw.id;
                        return (
                            <motion.div
                                key={fw.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 + i * 0.1 }}
                                className={`bg-white rounded-2xl border-2 ${fw.borderColor} shadow-sm overflow-hidden transition-all`}
                            >
                                <button
                                    onClick={() => setOpenFramework(isOpen ? null : fw.id)}
                                    className="w-full flex items-center gap-5 p-6 text-left hover:bg-gray-50/50 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: fw.color }}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${fw.badgeColor}`}>{fw.level}</span>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <h3 className="text-xl font-black tracking-tight" style={{ color: fw.color }}>{fw.title}</h3>
                                            <span className="text-gray-500 text-sm hidden sm:block">{fw.subtitle}</span>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isOpen && (
                                    <div className={`px-6 pb-6 ${fw.bgColor} border-t ${fw.borderColor}`}>
                                        <p className="text-gray-700 leading-relaxed mt-4 mb-5">{fw.description}</p>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {fw.keyIdeas.map((idea) => (
                                                <div key={idea} className="flex items-start gap-2.5 bg-white/70 rounded-xl p-3 border border-white/80">
                                                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: fw.color }}></div>
                                                    <span className="text-sm text-gray-700 leading-snug">{idea}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-5">
                                            <Link
                                                to="/chat"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 shadow-sm"
                                                style={{ backgroundColor: fw.color }}
                                            >
                                                Explore {fw.title} with Glowie
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ── CTA + Waitlist Row ── */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid md:grid-cols-2 gap-6"
            >
                {/* Start CTA */}
                <div className="rounded-2xl p-8 flex flex-col justify-between shadow-sm text-white"
                    style={{ background: 'linear-gradient(135deg, #D13038 0%, #EC8B29 80%)' }}>
                    <div className="mb-6">
                        <Compass className="w-10 h-10 text-white/80 mb-4" />
                        <h3 className="text-2xl font-bold mb-2">Ready to Find Your True North?</h3>
                        <p className="text-white/80 text-sm leading-relaxed">
                            Glowie will guide you through a personalised conversation and generate a concrete action report aligned to your role and context.
                        </p>
                    </div>
                    <Link
                        to="/chat"
                        className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl transition-all hover:bg-white/90 group shadow"
                    >
                        Start the Activity Now
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* Waitlist */}
                <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col justify-between shadow-sm">
                    <div className="mb-6">
                        <BookOpen className="w-10 h-10 mb-4" style={{ color: '#357DB8' }} />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Join the Movement</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Get early access to TrueNorthEd.tech and be notified when <em>Designing for AGENCY</em> launches on Amazon.
                        </p>
                    </div>
                    {submitted ? (
                        <div className="bg-green-50 text-green-700 px-5 py-3 rounded-xl border border-green-200 font-medium text-center">
                            ✓ You're on the list!
                        </div>
                    ) : (
                        <form onSubmit={handleWaitlistSubmit} className="flex gap-2">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Your email address"
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 transition-all"
                                style={{ '--tw-ring-color': '#357DB8' } as any}
                                required
                            />
                            <button
                                type="submit"
                                className="text-white px-4 py-3 rounded-xl transition-all hover:opacity-90 flex items-center justify-center shadow-sm"
                                style={{ backgroundColor: '#357DB8' }}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>

        </div>
    );
}
