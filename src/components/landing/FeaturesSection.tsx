import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import iconPrivacy from '@/assets/icon-privacy.png';
import iconDna from '@/assets/icon-dna.png';
import iconVerify from '@/assets/icon-verify.png';

const features = [
  {
    image: iconPrivacy,
    title: 'Privacy First',
    tagline: 'We verify your work — without seeing it.',
    description: 'Zero-knowledge architecture means we never store or access your work content, only a cryptographic fingerprint of the final document is recorded.',
    gradient: 'from-primary to-glow-blue',
  },
  {
    image: iconDna,
    title: 'Writing Signals',
    tagline: 'Proof comes from how you write, not what you write.',
    description: 'Timing, pauses, and revision patterns provide process signals that are difficult to replicate, without identifying you or storing content.',
    gradient: 'from-secondary to-glow-purple',
  },
  {
    image: iconVerify,
    title: 'Verifiable Proof',
    tagline: 'One document. One certificate. One truth.',
    description: 'Generate cryptographic certificates that are mathematically bound to your final document, proving authentic authorship to clients, employers, or institutions.',
    gradient: 'from-glow-cyan to-primary',
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-[350px]" style={{ perspective: "1000px" }}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, delay: index * 0.15 }}
        className="relative w-full h-full cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative"
          initial={false}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
          >
            <div className="relative p-8 h-full rounded-3xl bg-[#0f0f12]/80 border border-white/5 flex flex-col items-center justify-center text-center transition-all duration-300 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)] group-hover:bg-[#121215]">

              {/* Icon */}
              <div className="w-20 h-20 mb-6 relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-500 group-hover:scale-110 relative z-10"
                />
              </div>

              <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-cyan-100 transition-colors">
                {feature.title}
              </h3>

              <p className="text-zinc-400 font-medium px-2 leading-snug">
                {feature.tagline}
              </p>

              <div className="mt-auto pt-6 flex items-center gap-2 text-xs text-zinc-500 font-medium opacity-60 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Flip to know more
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0 w-full h-full rounded-3xl bg-[#0f0f12] border border-cyan-500/30 shadow-[0_0_40px_-10px_rgba(6,182,212,0.2)] p-10 flex flex-col items-start justify-center text-left overflow-hidden"
            style={{
              transform: "rotateY(180deg)",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden"
            }}
          >
            {/* Decorative gradients for the back */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 relative z-10">
              {feature.title}
            </h3>

            <p className="text-zinc-300 leading-relaxed relative z-10 text-[15px]">
              {feature.description}
            </p>

            <div className="mt-auto pt-4 flex items-center gap-2 text-xs text-zinc-600 font-medium group-hover:text-cyan-500/50 transition-colors">
              <span className="w-1 h-1 rounded-full bg-current" />
              Tap to return
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-wider">
            Core Features
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-6">
            Why Choose <span className="gradient-text">Effortless</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built from the ground up with privacy and security at its core,
            Effortless provides privacy-first verification based on how work is created,
            not what is written..
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
