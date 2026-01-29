import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, User, Cpu, Sparkles, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

import { SEO } from '@/components/SEO';

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
            <SEO
                title="About - Samarth Kashyap"
                description="Learn about the mission behind Effortless and its creator, Samarth Kashyap. Building trust in an AI world."
                keywords={['Samarth Kashyap', 'Creator', 'Mission', 'Trust', 'AI Safety']}
            />
            <Navbar />

            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-32 pb-20">
                {/* Ambient Glows */}
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000" />

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="max-w-4xl mx-auto"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-md mb-8"
                        >
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                            <span className="text-xs font-medium text-cyan-200 tracking-wide uppercase">Our Mission</span>
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight text-white drop-shadow-2xl">
                            Prove How Your Work <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-purple-500 drop-shadow-lg">
                                Was Created
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
                            In an AI-heavy world, the creation process matters.
                            Effortless verifies how your work was written and cryptographically links it to the final document.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* What Section - Glassmorphic Cards */}
            <section className="py-32 relative">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                    <ShieldCheck className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest">What is Effortless?</h2>
                            </div>

                            <h3 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">
                                Proof-of-Process <br /> for the <span className="text-zinc-400">AI Era</span>
                            </h3>

                            <div className="space-y-6 text-lg text-zinc-400 leading-relaxed font-light">
                                <p>
                                    Effortless is not just another detection tool. It's a fundamental shift in how we prove authorship.
                                </p>
                                <p>
                                    By unobtrusively tracking the <span className="text-white font-medium">process</span> of creation, editing patterns, typing cadence, and focus interaction, we generate a cryptographic certificate that mathematically proves human effort was involved.
                                </p>
                                <p>
                                    This protects students, writers, and developers from false accusations of AI plagiarism without ever needing to share their raw work content.
                                </p>
                            </div>

                            <div className="mt-10 flex gap-6">
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-3xl font-bold text-white">0%</h4>
                                    <span className="text-sm text-zinc-500 uppercase tracking-wider">False Positives</span>
                                </div>
                                <div className="w-px h-16 bg-white/10" />
                                <div className="flex flex-col gap-1">
                                    <h4 className="text-3xl font-bold text-white">100%</h4>
                                    <span className="text-sm text-zinc-500 uppercase tracking-wider">Privacy Preserved</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Abstract Tech Visualization */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 rounded-3xl blur-2xl transform rotate-3 scale-95 opacity-60" />
                            <div className="relative bg-[#0f0f12]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden group hover:border-cyan-500/30 transition-colors duration-500">

                                {/* Grid Overlay */}
                                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

                                {/* Floating Elements */}
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                            <Activity className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <div className="h-2 w-24 bg-zinc-700 rounded mb-2" />
                                            <div className="h-1.5 w-16 bg-zinc-800 rounded" />
                                        </div>
                                        <div className="ml-auto text-xs text-green-400 font-mono">Verified</div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors translate-x-4">
                                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                            <Cpu className="w-5 h-5 text-purple-400" />
                                        </div>
                                        <div>
                                            <div className="h-2 w-32 bg-zinc-700 rounded mb-2" />
                                            <div className="h-1.5 w-20 bg-zinc-800 rounded" />
                                        </div>
                                        <div className="ml-auto text-xs text-blue-400 font-mono">Processing</div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group-hover:bg-white/10 transition-colors">
                                        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                            <Sparkles className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div>
                                            <div className="h-2 w-20 bg-zinc-700 rounded mb-2" />
                                            <div className="h-1.5 w-12 bg-zinc-800 rounded" />
                                        </div>
                                        <div className="ml-auto text-xs text-zinc-500 font-mono">Encrypted</div>
                                    </div>
                                </div>

                                {/* Decorative Bottom Gradient */}
                                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-500/10 to-transparent pointer-events-none" />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Why Section */}
            <section className="py-32 bg-zinc-900/20 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

                <div className="container mx-auto px-6 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">Why We Built It</h2>
                        <p className="text-xl text-zinc-400 leading-relaxed font-light">
                            The rise of AI has created a "trust gap." Legitimate work is being unfairly flagged, and genuine creators are struggling to prove their worth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Target,
                                title: "False Accusations",
                                description: "Students and professionals are being accused of AI use they didn’t commit. Effortless gives them verifiable proof of how their work was created.",
                                gradient: "from-red-500/20 to-orange-500/20",
                                border: "group-hover:border-red-500/30"
                            },
                            {
                                icon: ShieldCheck,
                                title: "Preserving Value",
                                description: "In a world of infinite content, the human process becomes the premium. We help you showcase that distinct value.",
                                gradient: "from-cyan-500/20 to-blue-500/20",
                                border: "group-hover:border-cyan-500/30"
                            },
                            {
                                icon: User,
                                title: "Transparent Verification",
                                description: "AI detectors make guesses. Effortless provides verifiable data that anyone can independently check.",
                                gradient: "from-purple-500/20 to-pink-500/20",
                                border: "group-hover:border-purple-500/30"
                            }
                        ].map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`group p-8 rounded-3xl bg-[#0f0f12] border border-white/5 relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${item.border}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                                <div className="relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:bg-white/10 transition-colors border border-white/5">
                                        <item.icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-white transition-colors">{item.title}</h3>
                                    <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                                        {item.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who Section - Premium Bio Card */}
            <section className="py-32 relative">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="relative rounded-[2.5rem] bg-[#0f0f12] border border-white/10 overflow-hidden"
                        >
                            {/* Decorative Background for Card */}
                            <div className="absolute inset-0">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-cyan-900/20 to-transparent blur-3xl opacity-50" />
                                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-purple-900/20 to-transparent blur-3xl opacity-50" />
                            </div>

                            <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row gap-12 items-start">
                                {/* Avatar Section */}
                                <div className="flex-shrink-0 relative">
                                    <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full blur-xl opacity-30" />
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 p-[2px] relative z-10">
                                        <img
                                            src="https://github.com/samarthkashyap03.png"
                                            alt="Samarth Kashyap"
                                            className="w-full h-full object-cover rounded-full"
                                        />                    </div>
                                </div>


                                <div className="flex-1">
                                    <h2 className="text-4xl font-bold mb-2 text-white">Samarth Kashyap</h2>
                                    <p className="text-cyan-400 font-medium mb-6">MSc Computer Science @ RPTU | Builder of Effortless</p>

                                    <div className="space-y-6 text-base md:text-lg text-zinc-300 leading-relaxed font-light">
                                        <p>
                                            I’m a computer science graduate student at RPTU, currently focused on building scalable systems that solve real-world problems.
                                        </p>
                                        <p>
                                            I saw how unreliable AI detection tools were becoming. People doing genuine work were being flagged with no way to prove their innocence.
                                            <span className="text-white font-medium"> Effortless</span> came from that frustration, building a way to verify
                                            <span className="italic"> how</span> work is created, not just guessing based on the final text.
                                        </p>
                                        <p className="text-xl text-white font-serif italic opacity-90">
                                            ❝ A developer is like a magician — turning ideas into reality through creativity, logic, and code. ❞
                                        </p>
                                        <p className="text-zinc-400 text-sm italic">
                                            If you’re interested in improving effortless or want to collaborate, you’re welcome to reach out.
                                        </p>
                                    </div>

                                    <div className="mt-10 flex gap-4">
                                        <Button
                                            variant="outline"
                                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white rounded-full px-6 h-12"
                                            onClick={() => window.open('https://github.com/samarthkashyap03', '_blank')}
                                        >
                                            GitHub
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="bg-white/5 border-white/10 hover:bg-white/10 text-white hover:text-white rounded-full px-6 h-12"
                                            onClick={() => window.open('https://www.linkedin.com/in/samarthkashyap/', '_blank')}
                                        >
                                            LinkedIn
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div >
            </section >

            <Footer />
        </div >
    );
};

export default About;
