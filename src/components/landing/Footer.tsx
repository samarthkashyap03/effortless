import { motion } from 'framer-motion';
import { ContactModal } from './ContactModal';

const footerLinks = {
  Product: ['Features', 'Pricing'],
  Company: ['About', 'Contact Us'],
  Legal: ['Privacy Policy'],
  Connect: ['LinkedIn', 'GitHub'],
};

export const Footer = () => {
  return (
    <footer className="py-16 border-t border-border relative">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <motion.a
              href="#"
              className="flex items-center gap-2 mb-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold gradient-text">Effortless</span>
            </motion.a>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Support your work’s authenticity with privacy-first verification.
            </p>
            <p className="text-muted-foreground/60 text-xs mt-4 leading-relaxed">
              Effortless is currently in early access. Paid plans will be introduced based on usage and feedback.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    {link === 'Contact Us' ? (
                      <ContactModal>
                        <button className="text-muted-foreground hover:text-foreground transition-colors text-sm link-underline text-left bg-transparent border-none p-0 cursor-pointer">
                          Contact Us
                        </button>
                      </ContactModal>
                    ) : (
                      <a
                        href={
                          link === 'Privacy Policy' ? '/privacy' :
                            link === 'Help Center' ? '/faq' :
                              link === 'Features' ? '/#features' :
                                link === 'Pricing' ? '/pricing' :
                                  link === 'About' ? '/about' :
                                    link === 'GitHub' ? 'https://github.com/samarthkashyap03' :
                                      link === 'LinkedIn' ? 'https://www.linkedin.com/in/samarthkashyap/' :
                                        '#'
                        }
                        target={link === 'GitHub' || link === 'LinkedIn' ? '_blank' : '_self'}
                        rel={link === 'GitHub' || link === 'LinkedIn' ? 'noopener noreferrer' : ''}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm link-underline"
                      >
                        {link}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Effortless. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <a href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
