import { motion } from 'framer-motion';
import {
    ShieldCheck,
    Activity,
    FileCheck,
    Clock,
    Edit3,
    Database,
    EyeOff,
    VideoOff,
    MicOff,
    ClipboardX,
    CheckCircle2,
    AlertTriangle,
    HelpCircle,
    ArrowRight,
    Download
} from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import heroAbstractBg from '@/assets/hero-abstract-bg.jpg';

export default function Implementation() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden selection:bg-cyan-500/30">
            <Navbar />

            {/* SECTION 1: HERO */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a] pointer-events-none" />

                {/* Ambient Glows */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/20 bg-cyan-900/10 backdrop-blur-md mb-8">
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-cyan-100 font-medium tracking-wide"> Methodology & Implementation </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-8 leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                            Implementation
                        </h1>

                        <h2 className="text-2xl md:text-4xl font-semibold text-white mb-8 leading-snug">
                            We verify the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">process</span>, <br className="hidden md:block" />
                            never the content.
                        </h2>

                        {/* Clean Line under Tagline */}
                        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mb-8" />

                        <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
                            Authenticity is proven through behavioral signals like timing and edits—not by analyzing your text.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* SECTION 2: 3-STEP FLOW */}
            <section className="py-20 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid md:grid-cols-4 gap-6">
                        {[
                            {
                                step: "01",
                                icon: Activity,
                                title: "Start a verification",
                                description: "You create a verification session for writing (and later, coding)."
                            },
                            {
                                step: "02",
                                icon: Edit3,
                                title: "Work normally",
                                description: "We capture behavioral signals like pauses, revisions, and typing rhythm."
                            },
                            {
                                step: "03",
                                icon: Download,
                                title: "Download & Bind",
                                description: "You download your work with a digital fingerprint linking it to your certificate."
                            },
                            {
                                step: "04",
                                icon: FileCheck,
                                title: "Verify & Share",
                                description: "You receive a shareable verification report with a secure token."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.1,
                                    ease: "easeOut"
                                }}
                                className="relative group p-8 rounded-3xl bg-[#0f0f12]/60 border border-white/5 hover:border-cyan-500/30 hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)] transition-all duration-300 backdrop-blur-sm flex flex-col items-center text-center hover:bg-[#121215]"
                            >
                                <div className="absolute top-4 right-4 text-4xl font-bold text-white/5 font-mono select-none group-hover:text-white/10 transition-colors">
                                    {item.step}
                                </div>
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/5 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-500">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-100 transition-colors">{item.title}</h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">{item.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3: COLLECT VS NOT COLLECT */}
            <section className="py-24 px-6 relative">
                <div className="container mx-auto max-w-5xl">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-5xl font-bold text-center mb-16"
                    >
                        Data Privacy Architecture
                    </motion.h2>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        {/* What We Collect */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.01 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="p-8 md:p-10 rounded-3xl bg-[#0f0f12]/40 border border-cyan-500/20 backdrop-blur-md shadow-lg shadow-cyan-900/5 group"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-cyan-900/20 shrink-0">
                                    <Database className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">What we collect</h3>
                            </div>

                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <Clock className="w-5 h-5 text-cyan-500/70 mt-1 shrink-0 group-hover:text-cyan-400 transition-colors" />
                                    <div>
                                        <span className="font-semibold text-zinc-200 block group-hover:text-white transition-colors">Timestamps and intervals</span>
                                        <span className="text-sm text-zinc-500">When edits happen (ms precision)</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <Edit3 className="w-5 h-5 text-cyan-500/70 mt-1 shrink-0 group-hover:text-cyan-400 transition-colors" />
                                    <div>
                                        <span className="font-semibold text-zinc-200 block group-hover:text-white transition-colors">Revision depth</span>
                                        <span className="text-sm text-zinc-500">Add/remove/replace patterns</span>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <Activity className="w-5 h-5 text-cyan-500/70 mt-1 shrink-0 group-hover:text-cyan-400 transition-colors" />
                                    <div>
                                        <span className="font-semibold text-zinc-200 block group-hover:text-white transition-colors">Session duration & rhythm</span>
                                        <span className="text-sm text-zinc-500">Focus periods and idle time</span>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>

                        {/* What We Never Collect */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.01 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="p-8 md:p-10 rounded-3xl bg-[#0f0f12]/40 border border-red-500/20 backdrop-blur-md shadow-lg shadow-red-900/5 group"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-xl bg-red-900/20 shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-red-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white">What we never collect</h3>
                            </div>

                            <ul className="space-y-6">
                                <li className="flex items-start gap-4">
                                    <EyeOff className="w-5 h-5 text-red-500/70 mt-1 shrink-0 group-hover:text-red-400 transition-colors" />
                                    <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">Your text content</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <VideoOff className="w-5 h-5 text-red-500/70 mt-1 shrink-0 group-hover:text-red-400 transition-colors" />
                                    <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">Screenshots / screen recording</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <MicOff className="w-5 h-5 text-red-500/70 mt-1 shrink-0 group-hover:text-red-400 transition-colors" />
                                    <span className="font-semibold text-zinc-300 group-hover:text-white transition-colors">Camera or microphone</span>
                                </li>
                                <li className="flex items-start gap-4">
                                    <ClipboardX className="w-5 h-5 text-red-500/70 mt-1 shrink-0 group-hover:text-red-400 transition-colors" />
                                    <div>
                                        <span className="font-semibold text-zinc-300 block group-hover:text-white transition-colors">Clipboard contents</span>
                                        <span className="text-xs text-zinc-500 mt-1 block">
                                            We may detect that a paste event happened as a timestamped signal, but we never store the pasted text itself.
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SECTION 4: REPORT MEANING */}
            <section className="py-24 px-6 bg-black/40 border-t border-white/5">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold mb-4">What your report means</h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            The report provides supporting evidence that the work was created through a natural writing process.
                            <br /> It is <span className="text-white font-semibold">not a plagiarism or “AI detector” verdict</span>.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: CheckCircle2, color: "emerald", label: "High Confidence", text: "Strong human-like process signals, consistent drafting, and revision patterns." },
                            { icon: HelpCircle, color: "amber", label: "Medium Confidence", text: "Mixed signals detected, such as long idle periods interspersed with heavy pasting." },
                            { icon: AlertTriangle, color: "rose", label: "Low Confidence", text: "Weak process evidence, typically characterized by large paste events and minimal subsequent revisions." }
                        ].map((card, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-6 rounded-2xl bg-zinc-900/50 border border-${card.color}-500/20 hover:border-${card.color}-500/40 transition-all duration-300`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    <card.icon className={`w-5 h-5 text-${card.color}-500`} />
                                    <span className={`font-bold text-${card.color}-500 text-sm uppercase tracking-wider`}>{card.label}</span>
                                </div>
                                <p className="text-zinc-400 text-sm leading-relaxed">{card.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <Button
                            onClick={() => navigate('/auth')}
                            size="lg"
                            className="bg-white text-black hover:bg-zinc-200 rounded-full font-semibold text-lg px-10 py-6 h-auto shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)] transition-all duration-300 transform hover:scale-105"
                        >
                            Start Verifying Now <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
