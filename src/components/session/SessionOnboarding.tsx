import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, Zap, Shield, Sparkles, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionOnboardingProps {
    onComplete: () => void;
}

export function SessionOnboarding({ onComplete }: SessionOnboardingProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            icon: <Sparkles className="w-12 h-12 text-cyan-400" />,
            title: "Focus on Your Craft",
            description: "This environment is built for deep work. The interface fades away, minimizing distractions so you can channel your creativity without interruption.",
            color: "from-cyan-500/20 to-blue-500/20",
        },
        {
            icon: <Zap className="w-12 h-12 text-yellow-400" />,
            title: "Powerful Features",
            description: "Type '/' to instantly add headings, lists, or images. Adjust the editor width with the side handles to suit your reading preference. It's all here when you need it.",
            color: "from-yellow-500/20 to-orange-500/20",
        },
        {
            icon: <Shield className="w-12 h-12 text-emerald-400" />,
            title: "We've Got Your Back",
            description: "You just keep working. Our intelligent backend runs quietly in the background, verifying your authenticity and securing your certificate automatically.",
            color: "from-emerald-500/20 to-green-500/20",
        },
        {
            icon: <Download className="w-12 h-12 text-blue-400" />,
            title: "You Own Your Data",
            description: "Whatever you work on will be downloaded and stored on your system. We never save it. You can submit this file along with your certificate.",
            color: "from-blue-500/20 to-indigo-500/20",
        },
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(curr => curr + 1);
        } else {
            onComplete();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
        >
            <div className="relative w-full max-w-lg">
                {/* Background Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} blur-3xl opacity-30 transition-colors duration-500`} />

                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="relative bg-[#121214]/90 border border-white/10 p-8 rounded-3xl shadow-2xl backdrop-blur-xl flex flex-col items-center text-center overflow-hidden ring-1 ring-white/5"
                >
                    {/* Progress Indicators */}
                    <div className="absolute top-6 flex gap-2">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? "w-8 bg-white" : "w-2 bg-white/20"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="mt-8 mb-6 p-4 rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-inner">
                        {slides[currentSlide].icon}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                        {slides[currentSlide].title}
                    </h2>

                    <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mb-8">
                        {slides[currentSlide].description}
                    </p>


                    <Button
                        onClick={nextSlide}
                        size="lg"
                        className="w-full relative overflow-hidden group bg-white text-black hover:bg-zinc-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.5)]"
                    >
                        <span className="relative z-10 flex items-center gap-2 font-semibold">
                            {currentSlide === slides.length - 1 ? "Start Writing" : "Next"}
                            {currentSlide === slides.length - 1 ? <Check className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                    </Button>

                    <button
                        onClick={onComplete}
                        className="mt-4 text-xs text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-widest font-medium"
                    >
                        Skip Tutorial
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
}
