import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '/implementation', label: 'Implementation' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '/faq', label: 'FAQ' },
    { href: '/verify-guide', label: 'Verify Certificate' },
    { href: '#security', label: 'Privacy' },
  ];

  const getHref = (href: string) => {
    if (href.startsWith('#') && location.pathname !== '/') {
      return `/${href}`;
    }
    return href;
  };

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    // If we are on home page and clicking an anchor, let default behavior handle scroll
    if (location.pathname === '/' && href.startsWith('#')) {
      // do nothing, let anchor work
      return;
    }

    // If we are navigating to another page or from another page to home anchor
    if (href.startsWith('#') && location.pathname !== '/') {
      // Allow navigation to /#anchor
      return;
    }

    // If it's a specific route like /implementation
    if (!href.startsWith('#')) {
      // let it navigate
      return;
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <nav className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="cursor-pointer flex items-center gap-3 group"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 group-hover:shadow-cyan-400/50 transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="text-white font-bold text-lg relative z-10">E</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 group-hover:to-white transition-all duration-300">Effortless</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={getHref(link.href)}
              className="text-sm font-medium text-zinc-400 hover:text-white transition-colors relative group py-2"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              <span className="absolute -inset-2 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </a>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => navigate('/auth')}
          >
            Sign In
          </Button>
          <Button
            className="bg-white text-black hover:bg-zinc-100 rounded-full font-semibold px-6 transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)]"
            onClick={() => navigate('/auth?mode=signup')}
          >
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-zinc-400 hover:text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-2xl border-b border-white/5 overflow-hidden"
          >
            <div className="container mx-auto px-6 py-8 flex flex-col gap-6">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={getHref(link.href)}
                  className="text-lg font-medium text-zinc-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-4 pt-6 border-t border-white/5">
                <Button
                  variant="ghost"
                  className="justify-start text-zinc-400 hover:text-white hover:bg-white/5 h-12 text-lg"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth');
                  }}
                >
                  Sign In
                </Button>
                <Button
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white h-12 text-lg font-medium rounded-xl group"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/auth?mode=signup');
                  }}
                >
                  Start Tracking Now
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
