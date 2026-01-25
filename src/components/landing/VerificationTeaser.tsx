import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Lock, FileKey } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const VerificationTeaser = () => {
    return (
        <section className="py-24 relative overflow-hidden bg-zinc-950/50 border-t border-b border-white/5">
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">

                    {/* Left: Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex-1 text-center md:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 mb-6 mx-auto md:mx-0">
                            <ShieldCheck className="w-4 h-4 text-cyan-400" />
                            <span className="text-xs font-semibold text-cyan-300 uppercase tracking-widest">Trust & Transparency</span>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                            Verify <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Effortless Documents</span>
                        </h2>

                        <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                            Effortless certificates are specifically bound to documents generated in our secure session.
                            Anyone with the original file and its certificate can independently prove authenticity.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link to="/verify-guide">
                                <Button size="lg" className="rounded-full bg-white text-black hover:bg-zinc-200 font-semibold px-8 h-12">
                                    How to Verify <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </Link>
                            <span className="text-sm text-zinc-500 bg-zinc-900/50 px-3 py-1 rounded-full border border-white/5">
                                No software required
                            </span>
                        </div>
                    </motion.div>

                    {/* Right: Visual */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 relative w-full max-w-md"
                    >
                        <div className="relative aspect-square backdrop-blur-sm rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 flex flex-col items-center justify-center gap-6 overflow-hidden group">

                            {/* Glows */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl group-hover:bg-cyan-500/30 transition-colors" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-colors" />

                            {/* Connecting Icons */}
                            <div className="flex items-center gap-4 z-10">
                                <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 shadow-xl">
                                    <FileKey className="w-8 h-8 text-zinc-400" />
                                </div>
                                <div className="h-0.5 w-12 bg-gradient-to-r from-zinc-700 to-cyan-500" />
                                <div className="p-4 rounded-2xl bg-zinc-900 border border-cyan-500/30 shadow-xl shadow-cyan-900/20">
                                    <Lock className="w-8 h-8 text-cyan-400" />
                                </div>
                            </div>

                            <div className="bg-black/40 rounded-lg p-3 font-mono text-xs text-zinc-500 border border-white/5 w-full text-center z-10">
                                <span className="text-emerald-500">MATCH</span> 7f83b165...e9a2
                            </div>

                            <p className="text-sm text-zinc-400 text-center max-w-[200px] z-10">
                                Mathematical proof that the document matches the certificate.
                            </p>

                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
