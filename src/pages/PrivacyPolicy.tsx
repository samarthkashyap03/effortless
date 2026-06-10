import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Server, UserCheck, AlertCircle } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function PrivacyPolicy() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 selection:bg-cyan-500/30 font-sans">
            <Navbar />

            <main className="pt-32 pb-24 px-6 relative">
                {/* Ambient Background */}
                <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="container mx-auto max-w-4xl relative z-10">

                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                            <Shield className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-zinc-300 font-medium">Privacy Policy</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            How Effortless handles your data
                        </h1>
                        <p className="text-xl text-zinc-400">
                            Clearly and transparently. Last updated: {lastUpdated}
                        </p>
                    </motion.div>

                    {/* Key Summary Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-16 p-8 rounded-3xl bg-gradient-to-br from-cyan-900/10 to-blue-900/10 border border-cyan-500/20 backdrop-blur-sm"
                    >
                        <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-cyan-400" />
                            In short (the most important part)
                        </h2>
                        <div className="space-y-4 text-lg text-zinc-300 leading-relaxed">
                            <p>
                                Effortless verifies work by analyzing <span className="text-cyan-400 font-medium">how it is created</span>, not what is written.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 text-zinc-400">
                                <li>We <span className="text-white font-medium">never</span> store your text content.</li>
                                <li>We <span className="text-white font-medium">never</span> record your screen.</li>
                                <li>We <span className="text-white font-medium">never</span> read your clipboard.</li>
                            </ul>
                            <p>
                                All verification is based on behavioral signals such as timing and revisions. <span className="italic opacity-80">If you only read one section, read this one.</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Content Grid */}
                    <div className="grid gap-8">

                        {/* What Effortless Does */}
                        <Section title="What Effortless does" icon={FileText}>
                            <p className="mb-4">
                                Effortless helps users generate verification reports that provide supporting evidence of a natural work process. These reports are based on process signals, not content analysis.
                            </p>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <span className="block font-medium text-white mb-2">Effortless is NOT:</span>
                                <ul className="grid sm:grid-cols-3 gap-2 text-sm text-zinc-400">
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> An AI detector</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> A plagiarism checker</li>
                                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500/50" /> A surveillance tool</li>
                                </ul>
                            </div>
                        </Section>

                        {/* Data Collection */}
                        <div className="grid md:grid-cols-2 gap-8">
                            <Section title="What we collect" icon={Server} className="h-full">
                                <p className="mb-4 text-sm text-zinc-400">We collect only the minimum data required to generate a verification report.</p>
                                <ul className="space-y-3">
                                    <ListItem>Timestamps and time intervals (when edits happen)</ListItem>
                                    <ListItem>Revision patterns (add / remove / replace activity)</ListItem>
                                    <ListItem>Session duration and activity rhythm (focus/idle)</ListItem>
                                    <ListItem>Verification report metadata (session ID, time)</ListItem>
                                    <ListItem>Document Signature (The digital fingerprint of your final file)</ListItem>
                                </ul>
                                <p className="mt-4 text-xs text-cyan-500/80 font-medium uppercase tracking-wider">This data describes process, not content.</p>
                            </Section>

                            <Section title="What we NEVER collect" icon={Lock} className="h-full border-red-500/10 bg-red-500/5">
                                <ul className="space-y-3">
                                    <ListItem cross>Your text content</ListItem>
                                    <ListItem cross>Screenshots or screen recordings</ListItem>
                                    <ListItem cross>Camera or microphone data</ListItem>
                                    <ListItem cross>Clipboard contents</ListItem>
                                </ul>
                                <p className="mt-4 text-xs text-zinc-500 italic border-t border-white/5 pt-3">
                                    We store a one-way digital signature of your final document to enable verification, but this cannot be reversed to reveal your actual text.
                                </p>
                            </Section>
                        </div>

                        {/* Usage & Access */}
                        <Section title="How your data is used" icon={Eye}>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-white mb-2">Used ONLY to:</h4>
                                    <ul className="space-y-2 text-zinc-400">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Generate your verification report</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500" /> Display confidence indicators</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-2">We do NOT:</h4>
                                    <ul className="space-y-2 text-zinc-400">
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Sell user data</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Use data for advertising</li>
                                        <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-700" /> Train models on your content</li>
                                    </ul>
                                </div>
                            </div>
                        </Section>

                        {/* Sharing & Security */}
                        <Section title="Who can see your data" icon={UserCheck}>
                            <p className="text-zinc-300 mb-4">
                                Verification reports are private by default. Only you can access them.
                                Reports are shared <span className="text-white font-medium">only if you choose to share them </span>.
                                Effortless does not automatically share reports with third parties.
                            </p>
                        </Section>

                        {/* Retention */}
                        <Section title="Data Retention & Security" icon={Shield}>
                            <div className="grid md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-semibold text-white mb-2 text-sm uppercase tracking-wider">Retention</h4>
                                    <p className="text-zinc-400 text-sm leading-relaxed">
                                        Verification data is stored only as long as needed to provide the service.
                                        You can delete verification sessions and reports from your dashboard.
                                        Deleted data is permanently removed from our systems.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white mb-2 text-sm uppercase tracking-wider">Security</h4>
                                    <ul className="space-y-1 text-zinc-400 text-sm">
                                        <li>• Encryption in transit</li>
                                        <li>• Encryption at rest</li>
                                        <li>• Restricted internal access</li>
                                    </ul>
                                </div>
                            </div>
                        </Section>

                        {/* Contact */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-8 text-center"
                        >
                            <h3 className="text-xl font-semibold mb-2">Questions?</h3>
                            <p className="text-zinc-400 mb-6">
                                We take privacy questions seriously. Contact us via the Contact form.
                            </p>
                            <p className="text-sm text-zinc-500 italic">
                                Effortless is built with privacy and transparency at the core.
                            </p>
                        </motion.div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

// Helper Components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Section({ title, icon: Icon, children, className = "" }: { title: string, icon: any, children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-6 md:p-8 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-white/10 transition-colors ${className}`}
        >
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-zinc-800/50 flex items-center justify-center text-zinc-200">
                    <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <div className="text-zinc-400 leading-relaxed">
                {children}
            </div>
        </motion.div>
    );
}

function ListItem({ children, cross = false }: { children: React.ReactNode, cross?: boolean }) {
    return (
        <li className="flex items-start gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cross ? 'bg-red-500/10 text-red-500' : 'bg-cyan-500/10 text-cyan-500'}`}>
                {cross ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                )}
            </div>
            <span className={cross ? 'text-zinc-400' : 'text-zinc-300'}>{children}</span>
        </li>
    );
}
