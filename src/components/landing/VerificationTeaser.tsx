import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const VerificationTeaser = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-2 text-primary text-sm font-semibold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-4 h-4" />
              Verification
            </span>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground text-balance">
              Anyone can verify your document
            </h2>

            <p className="text-muted-foreground text-lg mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
              Effortless certificates are cryptographically bound to your document. 
              Anyone with the file and certificate can independently prove authenticity.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="bg-foreground text-background hover:bg-foreground/90 rounded-full font-medium px-6 h-11"
                asChild
              >
                <Link to="/verify-guide">
                  Learn how to verify
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <span className="text-sm text-muted-foreground">
                No software required
              </span>
            </div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="rounded-2xl border border-border bg-card p-8">
              {/* Document + Certificate visual */}
              <div className="flex items-center justify-center gap-6 mb-6">
                <div className="w-16 h-20 rounded-lg bg-muted border border-border flex items-center justify-center">
                  <div className="w-8 h-10 rounded bg-muted-foreground/20" />
                </div>
                <div className="text-2xl text-muted-foreground">+</div>
                <div className="w-16 h-20 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Hash match indicator */}
              <div className="bg-muted rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Document hash</span>
                  <span className="text-xs font-medium text-primary">Match</span>
                </div>
                <code className="text-xs text-muted-foreground font-mono">
                  7f83b165...e9a2
                </code>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Mathematical proof the document matches its certificate
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
