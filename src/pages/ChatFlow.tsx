// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Square, Sparkles, AlertCircle, WifiOff, RefreshCcw, Paperclip, ChevronDown, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';

// --- Glowie Icon (From True North Icons.tsx) ---
export const GlowieIcon = ({ className }: { className?: string }) => (
    <div className={`${className || "w-6 h-6"} relative group/glowie-icon flex items-center justify-center`}>
        {/* Soft Outer Glow - Magical Aura */}
        <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-0 group-hover/glowie-icon:opacity-40 transition-opacity duration-700 animate-pulse"></div>

        {/* The EXACT Image provided by User */}
        <img
            src="/glowie_mood_happy.png"
            alt="Glowie Character"
            className="relative z-10 w-full h-full object-contain drop-shadow-lg transition-transform duration-300 group-hover/glowie-icon:scale-105"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        />
    </div>
);

// --- Markdown Formatter (From True North GlowieBot.tsx) ---
const formatMessageText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        const citationRegex = /\[\[Source:\s*(.*?)\|(.*?)\]\]/g;
        let citations: { title: string, url: string }[] = [];

        let cleanLine = line.replace(citationRegex, (match, title, url) => {
            citations.push({ title, url });
            return '';
        });

        const renderContent = () => {
            if (cleanLine.trim().startsWith('- ') || cleanLine.trim().startsWith('* ')) {
                const content = cleanLine.trim().substring(2);
                return (
                    <div className="flex items-start ml-2 mb-1">
                        <span className="mr-2 text-teal-600">•</span>
                        <span>{parseBold(content)}</span>
                    </div>
                );
            }
            if (cleanLine.trim().startsWith('### ')) {
                return <h4 className="font-bold text-base mt-2 mb-1 text-slate-800">{parseBold(cleanLine.trim().substring(4))}</h4>
            }
            return <div className="min-h-[2px]">{parseBold(cleanLine)}</div>
        };

        return (
            <div key={i} className={msgRole === 'user' ? "text-white" : "text-slate-800"}>
                {renderContent()}
                {citations.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1 ml-2">
                        {citations.map((cit, idx) => (
                            <a key={idx} href={cit.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 no-underline">
                                🔗 {cit.title}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        );
    });
};

const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

let msgRole = "user"; // Terrible hack for formatMessageText coloring, but effective in prototypes 

// AVAILABLE GEMINI VOICES (From True North)
const AVAILABLE_VOICES = [
    { id: 'Zephyr', name: 'Zephyr', desc: 'Standard & Balanced', icon: '🤖' },
    { id: 'Puck', name: 'Puck', desc: 'Playful & Energetic', icon: '🧚' },
    { id: 'Charon', name: 'Charon', desc: 'Deep & Calm', icon: '🌑' },
    { id: 'Kore', name: 'Kore', desc: 'Soft & Gentle', icon: '🌸' },
    { id: 'Fenrir', name: 'Fenrir', desc: 'Authoritative', icon: '🐺' },
    { id: 'Aoede', name: 'Aoede', desc: 'Bright & Friendly', icon: '🎶' }
];

const WELCOME_MESSAGE = {
    id: 'welcome',
    role: 'assistant' as const,
    content: "Hi! I'm **Glowie** ✨ — your True North AI guide from the book *Designing for AGENCY*. I'm here to help you map out your personal AI journey in education.\n\nTo get started, **what is your current role?** (e.g. Teacher, Tech Director, Administrator, Curriculum Coordinator)"
};

export default function ChatFlow() {
    const navigate = useNavigate();
    const [isRecording, setIsRecording] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [selectedVoice, setSelectedVoice] = useState('Zephyr');
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Vercel AI SDK Hook
    const { messages, input = '', handleInputChange, handleSubmit, setMessages, isLoading, error, append } = useChat({
        api: '/api/chat',
        onError: () => {
            setOfflineMode(true);
        }
    });

    // Set the welcome message once on mount (initialMessages changed format in @ai-sdk/react v3)
    useEffect(() => {
        setMessages([WELCOME_MESSAGE]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, offlineMode]);

    // Offline/Mock Logic Fallback for Presentations
    const handleOfflineSend = () => {
        if (!input.trim()) return;

        const newMessages = [...messages, { id: Date.now().toString(), role: 'user' as const, content: input }];
        setMessages(newMessages);

        handleInputChange({ target: { value: '' } } as any);

        setTimeout(() => {
            let aiContent = "That's insightful. Which path are you focusing on today: Institutional change (RISE), Curriculum (AGENCY), or Classroom (PROMPT)?";
            if (newMessages.length > 3) {
                aiContent = "I've gathered enough insights! Let's generate your personalized action report. REPORT_READY";
            }

            setMessages([...newMessages, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: aiContent
            }]);
        }, 1500);
    };

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (offlineMode) {
            handleOfflineSend();
        } else {
            handleSubmit(e);
        }
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (offlineMode) {
                handleOfflineSend();
            } else {
                append({ role: 'user', content: input });
                handleInputChange({ target: { value: '' } } as any);
            }
        }
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support the Web Speech API. Please use Chrome or Safari.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            if (finalTranscript) {
                handleInputChange({ target: { value: input + (input ? ' ' : '') + finalTranscript } } as any);
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
        };

        recognition.start();
    };

    const isReportReady = messages.some(m => m.content.includes("REPORT_READY"));
    const cleanContent = (content: string) => content.replace('REPORT_READY', '').trim();

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-2xl relative">

            {/* Header */}
            <div className="px-6 py-4 bg-white/80 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-tn-primary/10 flex items-center justify-center overflow-hidden border border-tn-primary/20">
                        <GlowieIcon className="w-10 h-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Glowie
                            <span className="bg-tn-primary/10 text-tn-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-tn-primary/20">AIFE AI Base</span>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">Powered by Gemini Realtime Knowledge</p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-3">
                    {/* Voice Selector */}
                    <div className="relative">
                        <button
                            onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors text-sm text-slate-600"
                        >
                            <Headphones className="w-4 h-4" />
                            {AVAILABLE_VOICES.find(v => v.id === selectedVoice)?.name}
                            <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                        {showVoiceMenu && (
                            <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                                {AVAILABLE_VOICES.map(voice => (
                                    <button
                                        key={voice.id}
                                        onClick={() => { setSelectedVoice(voice.id); setShowVoiceMenu(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm flex items-center gap-3 hover:bg-slate-50 transition-colors ${selectedVoice === voice.id ? 'bg-tn-primary/5 text-tn-primary font-medium' : 'text-slate-600'}`}
                                    >
                                        <span>{voice.icon}</span>
                                        <div className="flex-1">
                                            <div className="font-medium">{voice.name}</div>
                                            <div className="text-[10px] opacity-70">{voice.desc}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setOfflineMode(!offlineMode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors border ${offlineMode
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                        title={offlineMode ? "Offline Mode Active (Mock Fallback)" : "Online Mode (Gemini)"}
                    >
                        {offlineMode ? <WifiOff className="w-3.5 h-3.5" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                        {offlineMode ? 'Offline Mode' : 'Online Mode'}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && !offlineMode && (
                <div className="bg-rose-50 text-rose-600 p-3 flex items-center gap-3 text-sm border-b border-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>
                        Error connecting to Glowie via Gemini.
                        <button onClick={() => setOfflineMode(true)} className="ml-2 font-bold underline hover:text-rose-700">
                            Switch to Offline Demo Mode
                        </button>
                    </p>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        msgRole = msg.role; // Set the hack before formatMessageText is called
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role !== 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-sm">
                                        <GlowieIcon className="w-6 h-6" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-tn-primary to-blue-500 text-white rounded-tr-sm shadow-md'
                                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-sm'
                                        }`}
                                >
                                    <div className="leading-relaxed text-[15px]">
                                        {msg.role === 'user' ? cleanContent(msg.content) : formatMessageText(cleanContent(msg.content))}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}

                    {(isLoading && !offlineMode) && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center mr-3 flex-shrink-0">
                                <GlowieIcon className="w-6 h-6 grayscale opacity-60" />
                            </div>
                            <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex gap-2 items-center text-slate-500 text-sm">
                                <div className="flex gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-tn-primary/60 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-tn-primary/60 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-tn-primary/60 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                                <span className="ml-2 font-medium">Glowie is thinking...</span>
                            </div>
                        </motion.div>
                    )}

                    {isReportReady && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-center mt-8 pt-4 border-t border-slate-200"
                        >
                            <button
                                onClick={() => navigate('/report')}
                                className="bg-gradient-to-r from-tn-secondary to-tn-accent hover:opacity-90 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" /> View Your Personalized Action Report
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {!isReportReady && messages.length < 3 && (
                <div className="px-5 pb-2 flex gap-2 overflow-x-auto hide-scrollbar">
                    {["I'm a Technology Director", "I'm a School Administrator", "I'm a Classroom Teacher"].map(suggestion => (
                        <button
                            key={suggestion}
                            onClick={() => {
                                handleInputChange({ target: { value: suggestion } } as any);
                            }}
                            className="whitespace-nowrap px-4 py-2 bg-white/50 hover:bg-white text-slate-600 border border-slate-200 rounded-full text-xs font-medium transition-colors shadow-sm"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white/60 border-t border-slate-200">
                <form onSubmit={onSubmit} className="flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-tn-primary/50 focus-within:ring-2 focus-within:ring-tn-primary/10 transition-all">
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={onKeyDown}
                        placeholder={isReportReady ? "Conversation finished. Click above to view report." : "Ask Glowie about RISE, AGENCY, or PROMPT..."}
                        disabled={isReportReady || (isLoading && !offlineMode)}
                        className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none text-slate-800 p-2 placeholder-slate-400 disabled:opacity-50"
                        rows={1}
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
                                onClick={() => alert("File uploads disabled for AIFE Prototype.")}
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`p-2 rounded-lg transition-colors flex flex-shrink-0 ${isRecording
                                    ? 'bg-rose-50 text-rose-500'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {isRecording ? <Square className="w-4 h-4 fill-current animate-pulse" /> : <Mic className="w-4 h-4" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={!input.trim() || isReportReady || (isLoading && !offlineMode)}
                            className="px-4 py-2 bg-tn-primary hover:bg-tn-primary/80 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
                        >
                            <span>Send</span>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
