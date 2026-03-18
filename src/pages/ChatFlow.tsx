// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Square, Sparkles, AlertCircle, WifiOff, RefreshCcw, Paperclip, ChevronDown, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// --- Glowie Icon ---
export const GlowieIcon = ({ className }: { className?: string }) => (
    <div className={`${className || "w-6 h-6"} relative group/glowie-icon flex items-center justify-center`}>
        <div className="absolute inset-0 bg-yellow-300 rounded-full blur-xl opacity-0 group-hover/glowie-icon:opacity-40 transition-opacity duration-700 animate-pulse"></div>
        <img
            src="/glowie_mood_happy.png"
            alt="Glowie Character"
            className="relative z-10 w-full h-full object-cover drop-shadow-lg transition-transform duration-300 group-hover/glowie-icon:scale-105 rounded-full"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}
        />
    </div>
);

// --- Markdown Formatter ---
const parseBold = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
};

const parseItalic = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*[^*]+?\*)/g);
    return parts.map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
            return <em key={index} className="italic text-inherit">{part.slice(1, -1)}</em>;
        }
        return part;
    });
};

const formatMessageText = (text: string, isUser = false) => {
    const colorClass = isUser ? 'text-white' : 'text-slate-800';
    const lines = text.split('\n');
    return lines.map((line, i) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
                <div key={i} className={`flex items-start ml-2 mb-1 ${colorClass}`}>
                    <span className="mr-2 text-teal-500 font-bold">•</span>
                    <span>{parseBold(trimmed.substring(2))}</span>
                </div>
            );
        }
        if (trimmed.startsWith('### ')) {
            return <h4 key={i} className={`font-bold text-base mt-2 mb-1 ${colorClass}`}>{parseBold(trimmed.substring(4))}</h4>;
        }
        return <div key={i} className={`min-h-[2px] ${colorClass}`}>{parseBold(trimmed)}</div>;
    });
};

// --- Voice options ---
const AVAILABLE_VOICES = [
    { id: 'Zephyr', name: 'Zephyr', desc: 'Standard & Balanced', icon: '🤖' },
    { id: 'Puck', name: 'Puck', desc: 'Playful & Energetic', icon: '🧚' },
    { id: 'Charon', name: 'Charon', desc: 'Deep & Calm', icon: '🌑' },
    { id: 'Kore', name: 'Kore', desc: 'Soft & Gentle', icon: '🌸' },
    { id: 'Aoede', name: 'Aoede', desc: 'Bright & Friendly', icon: '🎶' },
];

// --- Welcome Message ---
const WELCOME_CONTENT = "Hi! I'm **Glowie** ✨ — your True North AI guide from the book *Designing for AGENCY*. I'm here to help you map out your personal AI journey in education.\n\nTo get started, **what is your current role?** (e.g. Teacher, Tech Director, Administrator, Curriculum Coordinator)";

type Message = { id: string; role: 'user' | 'assistant'; content: string };

// --- Offline scripted responses ---
const OFFLINE_RESPONSES = [
    "That's a great role to be in! To help focus our conversation today, which pathway resonates most with you right now?\n\n- **RISE** — Institutional/leadership-level change\n- **AGENCY** — Curriculum design and pedagogy\n- **PROMPT** — Classroom AI interactions with students",
    "Excellent choice. Let me ask you something core to that path: **What does your current AI policy or approach look like?** Is it more restrictive, exploratory, or somewhere in between?",
    "That's a really honest reflection. Here's something from the book to consider: the *Human-First Protocol* asks us — what decisions should always remain with a human, even as AI becomes more capable?\n\n**What comes to mind for you in your context?**",
    "I've gathered enough insight to map your True North. Your answers show a clear trajectory. Let me generate your personalized action report now. REPORT_READY",
];

export default function ChatFlow() {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [offlineMode, setOfflineMode] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedVoice, setSelectedVoice] = useState('Zephyr');
    const [showVoiceMenu, setShowVoiceMenu] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const offlineIndexRef = useRef(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const isReportReady = messages.some(m => m.content.includes('REPORT_READY'));
    const cleanContent = (content: string) => content.replace('REPORT_READY', '').trim();

    // Hydrate from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('glowieConversation');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            } catch (e) {
                console.error('Failed to load chat history:', e);
            }
        }
    }, []);

    // Save conversation to localStorage
    useEffect(() => {
        if (messages.length > 0) {
            localStorage.setItem('glowieConversation', JSON.stringify(messages));
            // Also keep sessionStorage for backward compatibility with Report page if needed
            sessionStorage.setItem('glowieConversation', JSON.stringify(messages));
        }
    }, [messages]);

    // Analytics: Save session summary to Supabase when report is ready
    const hasSavedAnalytics = useRef(false);
    useEffect(() => {
        if (isReportReady && !hasSavedAnalytics.current && !offlineMode) {
            saveAnalytics();
        }
    }, [isReportReady]);

    const saveAnalytics = async () => {
        hasSavedAnalytics.current = true;
        try {
            const userRole = messages.find(m => m.role === 'user')?.content || 'Unknown';
            const framework = messages.some(m => m.content.includes('RISE')) ? 'RISE' :
                messages.some(m => m.content.includes('AGENCY')) ? 'AGENCY' :
                    messages.some(m => m.content.includes('PROMPT')) ? 'PROMPT' : 'General';

            await supabase.from('glowie_analytics').insert({
                role: userRole,
                framework_focus: framework,
                message_count: messages.length,
                session_id: Date.now().toString(),
                completed_at: new Date().toISOString(),
                // Basic takeaway capture: total tokens approximation or just the last user message
                last_user_input: messages.filter(m => m.role === 'user').pop()?.content || ''
            });
            console.log('Analytics saved successfully.');
        } catch (err) {
            console.error('Failed to save analytics:', err);
        }
    };

    // --- Main send handler using fetch ---
    const sendMessage = async (userText: string) => {
        if (!userText.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
        const updatedMessages = [...messages, userMsg];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
        setError(null);

        if (offlineMode) {
            // Offline scripted fallback
            setTimeout(() => {
                const idx = offlineIndexRef.current;
                const content = OFFLINE_RESPONSES[Math.min(idx, OFFLINE_RESPONSES.length - 1)];
                offlineIndexRef.current = idx + 1;
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content,
                }]);
                setIsLoading(false);
            }, 1200);
            return;
        }

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantContent = '';

            const assistantMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    // NEW: More robust regex-based parsing for Vercel AI SDK Data Stream
                    // Matches patterns like 0:"..." regardless of newlines
                    const matches = chunk.matchAll(/0:"((?:[^"\\]|\\.)*)"/g);

                    let foundMatches = false;
                    for (const match of matches) {
                        foundMatches = true;
                        try {
                            // The match[1] is already the escaped string content
                            // We wrap it in quotes and parse it to handle escapes properly
                            const content = JSON.parse(`"${match[1]}"`);
                            assistantContent += content;

                            setMessages(prev =>
                                prev.map(m => m.id === assistantMsgId
                                    ? { ...m, content: assistantContent }
                                    : m
                                )
                            );
                        } catch (e) {
                            console.warn('Regex match parse error:', e);
                        }
                    }

                    // Fallback for non-standard chunks (older format or line-based)
                    if (!foundMatches) {
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            const trimmedLine = line.trim();
                            if (trimmedLine.startsWith('0:')) {
                                try {
                                    const jsonStr = trimmedLine.substring(2);
                                    const parsed = JSON.parse(jsonStr);
                                    assistantContent += parsed;
                                    setMessages(prev =>
                                        prev.map(m => m.id === assistantMsgId
                                            ? { ...m, content: assistantContent }
                                            : m
                                        )
                                    );
                                } catch (e) { }
                            }
                        }
                    }
                }
            }

            // Safety check: if the stream finished but content is empty
            if (!assistantContent) {
                throw new Error("Glowie is silent. This usually means the API key is missing or invalid on the server.");
            }
        } catch (err) {
            console.error('Chat API error:', err);
            setError(err instanceof Error ? err.message : 'Could not connect to Glowie. Switching to offline demo mode.');
            setOfflineMode(true);
            // ... scripted fallback logic ...
            const idx = offlineIndexRef.current;
            const content = OFFLINE_RESPONSES[Math.min(idx, OFFLINE_RESPONSES.length - 1)];
            offlineIndexRef.current = idx + 1;
            setMessages(prev => [...prev, {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content,
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleSuggestion = (text: string) => {
        sendMessage(text);
    };

    const toggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            return;
        }
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Voice input requires Chrome or Safari.');
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0]?.[0]?.transcript || '';
            if (transcript) setInput(prev => prev + (prev ? ' ' : '') + transcript);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full bg-white/60 backdrop-blur-xl border border-slate-200 rounded-2xl overflow-hidden shadow-2xl relative">

            {/* Header */}
            <div className="px-6 py-4 bg-white/80 border-b border-slate-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-tn-primary/10 flex items-center justify-center overflow-hidden border border-tn-primary/20 aspect-square">
                        <GlowieIcon className="w-full h-full aspect-square" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            Glowie
                            <div className="flex items-center gap-1.5 bg-tn-primary/10 text-tn-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold border border-tn-primary/20">
                                <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0 bg-white">
                                    <img src="/logo.png" alt="" className="w-full h-full object-cover mix-blend-multiply" />
                                </div>
                                AIFE AI Base
                            </div>
                        </h2>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">Powered by Gemini 2.0 Flash</p>
                    </div>
                </div>
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
                    {/* Mode toggle */}
                    <button
                        onClick={() => setOfflineMode(!offlineMode)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors border ${offlineMode
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            }`}
                    >
                        {offlineMode ? <WifiOff className="w-3.5 h-3.5" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                        {offlineMode ? 'Offline Mode' : 'Online Mode'}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-rose-50 text-rose-600 p-3 flex items-center gap-3 text-sm border-b border-rose-200 flex-shrink-0">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Static Welcome Message */}
                <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-sm">
                        <GlowieIcon className="w-6 h-6" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm bg-white text-slate-800 border border-slate-200 rounded-tl-sm">
                        <div className="leading-relaxed text-[15px]">
                            {formatMessageText(WELCOME_CONTENT, false)}
                        </div>
                    </div>
                </div>

                {/* Dynamic Messages */}
                <AnimatePresence initial={false}>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.2 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role !== 'user' && (
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center mr-3 mt-1 flex-shrink-0 shadow-sm">
                                    <GlowieIcon className="w-6 h-6" />
                                </div>
                            )}
                            <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${msg.role === 'user'
                                ? 'bg-gradient-to-r from-tn-primary to-blue-500 text-white rounded-tr-sm shadow-md'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                                }`}>
                                <div className="leading-relaxed text-[15px]">
                                    {formatMessageText(cleanContent(msg.content), msg.role === 'user')}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing Indicator */}
                {isLoading && (
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

                {/* Report Ready CTA */}
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

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            {!isReportReady && messages.length === 0 && (
                <div className="px-5 pb-2 flex gap-2 overflow-x-auto flex-shrink-0">
                    {["I'm a Technology Director", "I'm a School Administrator", "I'm a Classroom Teacher"].map(suggestion => (
                        <button
                            key={suggestion}
                            onClick={() => handleSuggestion(suggestion)}
                            disabled={isLoading}
                            className="whitespace-nowrap px-4 py-2 bg-white/50 hover:bg-white text-slate-600 border border-slate-200 rounded-full text-xs font-medium transition-colors shadow-sm disabled:opacity-50"
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white/60 border-t border-slate-200 flex-shrink-0">
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm focus-within:border-tn-primary/50 focus-within:ring-2 focus-within:ring-tn-primary/10 transition-all">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isReportReady ? 'Consultation complete — view your report above!' : 'Ask Glowie about RISE, AGENCY, or PROMPT...'}
                        disabled={isReportReady || isLoading}
                        className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none text-slate-800 p-2 placeholder-slate-400 disabled:opacity-50"
                        rows={1}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                                onClick={() => alert('File uploads are not enabled for this prototype.')}
                            >
                                <Paperclip className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={toggleRecording}
                                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${isRecording ? 'bg-rose-50 text-rose-500' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                            >
                                {isRecording ? <Square className="w-4 h-4 fill-current animate-pulse" /> : <Mic className="w-4 h-4" />}
                            </button>
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isReportReady || isLoading}
                            className="px-4 py-2 bg-tn-primary hover:bg-tn-primary/80 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg transition-colors flex items-center gap-2 font-medium text-sm"
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
