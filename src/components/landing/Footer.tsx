import { Link } from 'react-router-dom';

const footerLinks = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'How It Works', href: '/#how-it-works' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '#' },
  ],
  Connect: [
    { label: 'GitHub', href: 'https://github.com/samarthkashyap03', external: true },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/samarthkashyap/', external: true },
  ],
};

export const Footer = () => {
  return (
    <footer className="py-16 border-t border-border bg-background">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link
              to="/"
              className="flex items-center gap-2.5 mb-4"
            >
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Effortless</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Privacy-first verification for authentic work.
            </p>
            <p className="text-muted-foreground/60 text-xs leading-relaxed">
              Currently in early access. Paid plans coming soon based on feedback.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-foreground mb-4 text-sm">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        to={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
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
            {new Date().getFullYear()} Effortless. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
