import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MousePointerClick, PenLine, ShieldCheck, Share2 } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: MousePointerClick,
    title: 'Start a session',
    description: 'Sign in and begin a verification session in your browser.',
  },
  {
    number: '2',
    icon: PenLine,
    title: 'Write naturally',
    description: 'Work as you normally would. We capture patterns, not content.',
  },
  {
    number: '3',
    icon: ShieldCheck,
    title: 'Get your certificate',
    description: 'Your work patterns become a tamper-proof verification record.',
  },
  {
    number: '4',
    icon: Share2,
    title: 'Share with confidence',
    description: 'Anyone can verify your document was authentically created.',
  },
];

export const HowItWorksSection = () => {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6" ref={containerRef}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Simple process
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-foreground">
            Four steps to verified work
          </h2>
          <p className="text-muted-foreground text-lg">
            Get started in minutes with a straightforward process
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                <div className="flex gap-5 p-6 rounded-2xl bg-card border border-border hover:border-primary/20 transition-all">
                  {/* Number & Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Step {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground mt-12 max-w-xl mx-auto text-sm"
        >
          Your document never leaves your device. You own the file, we verify the process.
        </motion.p>
      </div>
    </section>
  );
};
