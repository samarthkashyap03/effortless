import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Check, Lock, Eye, Keyboard, Clipboard, Monitor, Timer } from 'lucide-react';

const securityFeatures = [
  { icon: Keyboard, text: 'No raw keystrokes stored' },
  { icon: Clipboard, text: 'No clipboard access' },
  { icon: Monitor, text: 'No screen recording' },
  { icon: Timer, text: 'No background tracking' },
  { icon: Eye, text: 'No content visibility' },
  { icon: Lock, text: 'End-to-end encrypted' },
];

export const SecuritySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="security" className="py-24 bg-background">
      <div className="container mx-auto px-6" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-primary text-sm font-semibold uppercase tracking-wider">
              Privacy first
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-foreground text-balance">
              Your privacy is non-negotiable
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              We use zero-knowledge architecture to verify your work without ever accessing your content. 
              We capture behavioral patterns only, not what you type.
            </p>

            {/* Security Checklist */}
            <div className="grid sm:grid-cols-2 gap-3">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground text-sm font-medium">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative flex items-center justify-center"
          >
            {/* Simple, clean visual */}
            <div className="relative w-full max-w-sm">
              <div className="aspect-square rounded-3xl bg-card border border-border p-8 flex flex-col items-center justify-center">
                <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Lock className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Zero Knowledge</h3>
                <p className="text-muted-foreground text-center text-sm leading-relaxed">
                  We verify without seeing. Your content stays yours.
                </p>
              </div>
              
              {/* Subtle decorative elements */}
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-rose-400/5 rounded-full blur-2xl pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
