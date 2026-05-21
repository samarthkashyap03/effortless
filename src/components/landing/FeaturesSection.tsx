import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Shield, Fingerprint, FileCheck } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Privacy First',
    tagline: 'We verify your work without seeing it.',
    description: 'Zero-knowledge architecture means we never store or access your content. Only a cryptographic fingerprint of your final document is recorded.',
  },
  {
    icon: Fingerprint,
    title: 'Your Writing Signature',
    tagline: 'Proof comes from how you write.',
    description: 'Timing, pauses, and revision patterns create a unique signature that proves authentic creation, without identifying you personally.',
  },
  {
    icon: FileCheck,
    title: 'Verifiable Proof',
    tagline: 'One document. One certificate.',
    description: 'Generate cryptographic certificates bound to your final document. Share proof of authentic authorship with anyone.',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <div className="h-full p-8 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        {/* Icon */}
        <div className="w-12 h-12 mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
          <feature.icon className="w-6 h-6 text-primary" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {feature.title}
        </h3>
        <p className="text-primary font-medium text-sm mb-3">
          {feature.tagline}
        </p>
        <p className="text-muted-foreground leading-relaxed">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
};

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-2xl mx-auto"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            How it helps
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-4 mb-6 text-foreground text-balance">
            Built for people who care about authenticity
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Whether you&apos;re a student, freelancer, or professional, Effortless helps you prove your work is genuinely yours.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
