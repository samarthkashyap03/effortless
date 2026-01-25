import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Check, Lock, Eye, Keyboard, Clipboard, Monitor, Timer } from 'lucide-react';

const securityFeatures = [
  { icon: Keyboard, text: 'No Raw Keystrokes Stored' },
  { icon: Clipboard, text: 'No Clipboard Access' },
  { icon: Monitor, text: 'No Screen Recording' },
  { icon: Timer, text: 'No Background Tracking' },
  { icon: Eye, text: 'No Content Visibility' },
  { icon: Lock, text: 'End-to-End Encrypted' },
];

export const SecuritySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="security" className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Zero-Knowledge Architecture
            </span>
            <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
              Your Privacy is{' '}
              <span className="gradient-text">Non-Negotiable</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Effortless uses cutting-edge zero-knowledge cryptography to verify your work
              without ever accessing your actual content. We capture behavioral patterns—timing,
              rhythm, and flow—not what you type.
            </p>

            {/* Security Checklist */}
            <div className="grid sm:grid-cols-2 gap-4">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex items-center gap-3 p-3 rounded-lg transition-all duration-300 hover:bg-muted/50 cursor-default"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${hoveredIndex === index
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                    }`}>
                    {hoveredIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <feature.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-foreground font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Shield Visual */}
            <div className="relative flex items-center justify-center">
              {/* Outer glow rings */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute w-80 h-80 rounded-full border border-primary/20"
              />
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute w-96 h-96 rounded-full border border-secondary/20"
              />

              {/* Main shield */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative"
              >
                <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center glow-cyan">
                  <Lock className="w-24 h-24 text-primary" />
                </div>

                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -5, 0], x: [0, 5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.2 }}
                  className="absolute -top-4 -right-4 glass-card p-3 rounded-xl"
                >
                  <Eye className="w-6 h-6 text-primary" />
                </motion.div>
                <motion.div
                  animate={{ y: [0, 5, 0], x: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.7 }}
                  className="absolute -bottom-4 -left-4 glass-card p-3 rounded-xl"
                >
                  <Keyboard className="w-6 h-6 text-secondary" />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
