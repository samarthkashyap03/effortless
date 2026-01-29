import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { motion } from 'framer-motion';
import { Check, X, Shield, Zap, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ParticleBackground } from '@/components/landing/ParticleBackground';
import { SEO } from '@/components/SEO';

const Pricing = () => {
    const navigate = useNavigate();

    const plans = [
        {
            name: "Free",
            price: "€0",
            description: "Perfect for testing the waters.",
            features: [
                "Up to 3 verification certificates",
                "Full writing & tracking experience",
                "Verified document PDF",
                "Cryptographic certificate",
                "No credit card required"
            ],
            cta: "Start Free",
            ctaLink: "/auth?mode=signup",
            variant: "outline",
            popular: false
        },
        {
            name: "Individual",
            price: "Coming Soon",
            period: "",
            description: "This plan is currently being updated.",
            features: [],
            cta: "",
            ctaLink: "",
            variant: "default",
            popular: true,
            highlight: "Coming Soon"
        },
        {
            name: "Enterprise",
            price: "Custom",
            description: "For teams and academic institutions.",
            features: [
                "Unlimited certificates",
                "Team & institution support",
                "Central verification dashboard",
                "Custom workflows",
                "Priority support"
            ],
            cta: "Contact Sales",
            ctaLink: "mailto:sales@effortless.com", // Placeholder
            variant: "outline",
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-foreground overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
            <SEO
                title="Pricing - Early Access"
                description="Effortless is currently in early access. Check our future pricing plans for authentic verification."
                keywords={['Pricing', 'Early Access', 'Plans', 'Subscription']}
            />
            <Navbar />

            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                <ParticleBackground />
            </div>

            <section className="relative pt-32 pb-20 px-6 z-10">
                <div className="container mx-auto text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                            Pay for <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Proof</span>, Not Time.
                        </h1>
                        <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
                            No monthly subscriptions. No hidden fees. Just verifiable authenticity when you need it.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="relative pb-32 px-6 z-10">
                <div className="container mx-auto max-w-6xl">
                    <div className="mb-12 p-4 rounded-xl bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 text-center shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]">
                        <p className="text-cyan-100 text-sm font-medium">
                            <span className="bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded text-xs uppercase tracking-wide mr-2 border border-cyan-500/20">Early Access</span>
                            Effortless is currently in early access. Paid plans will be introduced based on usage and feedback.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 items-start">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative rounded-3xl p-8 border ${plan.popular
                                    ? 'bg-[#0f0f12]/80 border-cyan-500/30 shadow-[0_0_30px_-10px_rgba(6,182,212,0.2)]'
                                    : 'bg-[#0f0f12]/40 border-white/10'
                                    } backdrop-blur-xl flex flex-col h-full group hover:border-cyan-500/20 transition-all duration-300`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium shadow-lg">
                                        {plan.highlight}
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                                    <p className="text-zinc-400 text-sm h-10">{plan.description}</p>
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                                        {plan.period && <span className="text-zinc-500">{plan.period}</span>}
                                    </div>
                                </div>

                                <ul className="space-y-4 mb-8 flex-1">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 p-1 rounded-full ${plan.popular ? 'bg-cyan-500/20' : 'bg-white/10'}`}>
                                                <Check className={`w-3 h-3 ${plan.popular ? 'text-cyan-400' : 'text-zinc-400'}`} />
                                            </div>
                                            <span className="text-zinc-300 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.cta && <Button
                                    onClick={() => plan.ctaLink.startsWith('http') || plan.ctaLink.startsWith('mailto') ? window.open(plan.ctaLink, '_blank') : navigate(plan.ctaLink)}
                                    className={`w-full h-12 rounded-xl font-medium transition-all duration-300 ${plan.popular
                                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/25'
                                        : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                                        }`}
                                >
                                    {plan.cta}
                                </Button>}
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 text-center">
                        <p className="text-zinc-500 text-sm mb-4">
                            Need a custom solution? <a href="mailto:contact@effortless.com" className="text-cyan-400 hover:underline">Contact us</a>.
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Pricing;
