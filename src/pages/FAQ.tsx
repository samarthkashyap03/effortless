import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { HelpCircle, Shield, FileCheck, UserCheck, Lock, EyeOff, Activity } from 'lucide-react';
import heroAbstractBg from '@/assets/hero-abstract-bg.jpg';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
    const faqs = [
        {
            question: "What is the full verification process?",
            answer: (
                <ul className="list-disc space-y-2 pl-4">
                    <li><strong>Start Session:</strong> Log in and begin a new writing session in our secure editor.</li>
                    <li><strong>Write Naturally:</strong> Create your content. We silently track writing flow patterns (timing, revisions) in the background.</li>
                    <li><strong>End & Download:</strong> When finished, we generate a PDF of your work on your device and attach a unique digital signature to it.</li>
                    <li><strong>Verify:</strong> You receive a Certificate of Authenticity. Anyone can verify your PDF matches the certificate using the signature.</li>
                </ul>
            ),
            icon: <Activity className="w-5 h-5 text-cyan-400" />
        },
        {
            question: "How does the verification work?",
            answer: "Our system runs in the background while you write. It tracks writing patterns like typing rhythm, pauses, editing corrections, and overall time spent. This allows us to distinguish between human content creation and AI generation without needing to read your actual words.",
            icon: <HelpCircle className="w-5 h-5 text-cyan-400" />
        },
        {
            question: "Is my data private?",
            answer: "Absolutely. Privacy is our core feature. We only analyze how you write, not what you write. No text content, screen captures, or clipboard history is ever stored on our servers. The only data we keep is a secure baseline of your typing style.",
            icon: <Shield className="w-5 h-5 text-purple-400" />
        },
        {
            question: "Can I use this for academic or professional work?",
            answer: "Yes. The \"Certificate of Authenticity\" you generate is a verifiable proof of your effort. It contains a unique verification code that anyone (professors, clients, or editors) can use to verify that the work was created by a human in a monitored environment.",
            icon: <FileCheck className="w-5 h-5 text-emerald-400" />
        },
        {
            question: "If you don’t store my work, how does the certificate apply to my document?",
            answer: "We attach a digital signature of your document to the certificate. Anyone can independently verify they match.",
            icon: <Lock className="w-5 h-5 text-amber-400" />
        },
        {
            question: "Can Effortless see or read my document?",
            answer: "No. Your document is generated and signed on your device. Only the digital signature is stored.",
            icon: <EyeOff className="w-5 h-5 text-rose-400" />
        },
        {
            question: "Do you store my actual text?",
            answer: "No. Your text never leaves your browser. The \"Begin Writing\" editor is a purely local environment for capture. Once you finish, the text is discarded from our awareness, and only the writing patterns are used to generate your certificate.",
            icon: <UserCheck className="w-5 h-5 text-blue-400" />
        }
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden selection:bg-cyan-500/30">
            <Navbar />

            <section className="relative min-h-[60vh] flex flex-col pt-32 pb-24 overflow-hidden">
                {/* Background Effects - No Particles */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black pointer-events-none" />

                {/* Modern Ambient Glows */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none opacity-50" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none opacity-40" />

                <div className="container mx-auto px-6 relative z-10 w-full max-w-3xl">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight"
                        >
                            Frequently Asked Questions
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-lg text-zinc-400 leading-relaxed"
                        >
                            Deep dive into our privacy-first methodology, verification technology, and how we protect your ownership.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl shadow-black/50"
                    >
                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {faqs.map((faq, index) => (
                                <AccordionItem
                                    key={index}
                                    value={`item-${index}`}
                                    className="border border-white/5 bg-white/[0.02] px-4 rounded-xl data-[state=open]:bg-white/[0.05] data-[state=open]:border-cyan-500/30 data-[state=open]:scale-[1.02] data-[state=open]:shadow-[0_0_30px_-10px_rgba(6,182,212,0.15)] transition-all duration-300 ease-out"
                                >
                                    <AccordionTrigger className="hover:no-underline text-lg font-medium text-zinc-200 py-4 [&[data-state=open]]:text-cyan-400 transition-colors">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 group-hover:text-cyan-400 group-data-[state=open]:text-cyan-400 group-data-[state=open]:bg-cyan-500/10 group-data-[state=open]:border-cyan-500/20 transition-all duration-300">
                                                {faq.icon}
                                            </div>
                                            {faq.question}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-zinc-400 leading-relaxed pl-[3.25rem] pb-4 text-base">
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
