import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link2, PenTool, ShieldCheck, Share2 } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: Link2,
    title: 'Start Verification',
    description: 'Sign in and start a session in your browser to begin.',
  },
  {
    number: '02',
    icon: PenTool,
    title: 'Write Naturally',
    description: 'Work naturally. Effortless captures your behavioral patterns without seeing content.',
  },
  {
    number: '03',
    icon: ShieldCheck,
    title: 'Generate Report',
    description: 'Your work patterns are encrypted into a tamper-resistant verification record',
  },
  {
    number: '04',
    icon: Share2,
    title: 'Share Proof',
    description: 'Share your document with its verification certificate. Anyone can independently confirm its authentic creation.',
  },
];

export const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Get started in minutes with our seamless four-step process
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line container */}
          <div className="hidden lg:block absolute top-[2.5rem] left-0 right-0 h-0.5 bg-zinc-800/50 -translate-y-1/2 overflow-hidden">
            {/* Animated Progress Line */}
            <motion.div
              initial={{ width: "0%" }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent w-full opacity-50"
            />

            {/* Travelling Beam */}
            <motion.div
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px]"
            />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative group z-10"
              >
                {/* Step Card */}
                <div className="text-center">
                  {/* Number Circle */}
                  <div className="relative mb-8 inline-flex items-center justify-center">

                    {/* Pulsing ring background */}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      className="absolute inset-0 rounded-full bg-cyan-500/10 blur-md"
                    />

                    {/* Main circle */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="relative w-20 h-20 rounded-2xl bg-[#0f0f12] border border-white/10 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(0,0,0,0.3)] group-hover:border-cyan-500/50 group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)] transition-all duration-300"
                    >
                      <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: index * 0.2 }}
                      >
                        <step.icon className="w-8 h-8 text-zinc-400 group-hover:text-cyan-400 transition-colors duration-300" />
                      </motion.div>
                    </motion.div>

                    {/* Step number badge */}
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center shadow-lg z-20 group-hover:scale-110 group-hover:border-cyan-500 transition-all duration-300">
                      <span className="text-xs font-bold text-zinc-300 group-hover:text-cyan-400">{step.number}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-cyan-400 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed font-medium group-hover:text-zinc-400 transition-colors">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-muted-foreground mt-16 max-w-2xl mx-auto font-medium"
        >
          Effortless never stores your document — you own the file, we verify the process.
        </motion.p>
      </div>
    </section>
  );
};
