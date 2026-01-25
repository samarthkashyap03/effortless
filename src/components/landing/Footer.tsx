import { motion } from 'framer-motion';

const footerLinks = {
  Product: ['Features', 'Pricing', 'Integrations (Coming Soon)', 'Changelog (Coming Soon)'],
  Company: ['About', 'Blog', 'Contact Us'],
  Legal: ['Documentation', 'Help Center', 'Privacy Policy', 'Terms of Service'],
  Connect: ['Twitter', 'LinkedIn', 'GitHub'],
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
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href={
                        link === 'Privacy Policy' ? '/privacy' :
                          link === 'Help Center' ? '/faq' :
                            link === 'Features' ? '/#features' :
                              link === 'Contact Us' ? '#' :
                                '#'
                      }
                      className="text-muted-foreground hover:text-foreground transition-colors text-sm link-underline"
                    >
                      {link}
                    </a>
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
