import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContactModal } from './ContactModal';
import { Link } from 'react-router-dom';

export const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="py-24 bg-muted/30" ref={ref}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
            Ready to prove your work is authentic?
          </h2>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Join writers, students, and professionals who value transparency and authenticity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 font-medium text-base px-8 h-12 rounded-full"
              asChild
            >
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <ContactModal>
              <Button
                size="lg"
                variant="outline"
                className="border-border bg-transparent hover:bg-muted font-medium text-base px-8 h-12 rounded-full"
              >
                Contact Us
              </Button>
            </ContactModal>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-muted-foreground text-sm"
          >
            <span>No credit card required</span>
            <span className="text-border">|</span>
            <span>Pay only per report</span>
            <span className="text-border">|</span>
            <span>Cancel anytime</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
