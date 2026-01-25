import { motion } from "framer-motion";
import { ArrowLeft, Play, Volume2, Maximize, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-glow-cyan/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-glow-purple/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-6 py-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="gradient-text">See Effortless in Action</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Watch how Effortless helps you prove the authenticity of your work with zero-knowledge verification.
            </p>
          </motion.div>

          {/* Video Player Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <div className="glass-card rounded-2xl overflow-hidden glow-border">
              {/* Video Area */}
              <div className="relative aspect-video bg-black/60 flex items-center justify-center group cursor-pointer">
                {/* Placeholder content */}
                <div className="absolute inset-0 bg-gradient-to-br from-glow-cyan/5 via-transparent to-glow-purple/5" />
                
                {/* Grid pattern overlay */}
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                  }}
                />

                {/* Play button */}
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative z-10 w-24 h-24 rounded-full bg-glow-cyan/20 border border-glow-cyan/50 flex items-center justify-center backdrop-blur-sm group-hover:bg-glow-cyan/30 transition-colors"
                >
                  <Play className="w-10 h-10 text-glow-cyan fill-glow-cyan/30 ml-1" />
                </motion.div>

                {/* Video placeholder text */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground text-sm">
                  Video coming soon
                </div>

                {/* Duration badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-sm text-muted-foreground border border-white/10">
                  2:34
                </div>
              </div>

              {/* Video Controls */}
              <div className="p-4 bg-black/40 border-t border-white/10">
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-glow-cyan to-glow-purple rounded-full" />
                  </div>
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <Play className="w-5 h-5 text-foreground ml-0.5" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <Volume2 className="w-5 h-5 text-foreground" />
                    </button>
                    <span className="text-sm text-muted-foreground">0:00 / 2:34</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <Settings className="w-5 h-5 text-foreground" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                      <Maximize className="w-5 h-5 text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Additional info cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-5xl mx-auto mt-12 grid md:grid-cols-3 gap-6"
          >
            {[
              { title: "2 Minutes", subtitle: "Quick overview of core features" },
              { title: "Zero Setup", subtitle: "See how easy it is to get started" },
              { title: "Real Results", subtitle: "Watch verification in action" }
            ].map((item, index) => (
              <div 
                key={index}
                className="glass-card rounded-xl p-6 text-center border border-white/5 hover:border-glow-cyan/30 transition-colors"
              >
                <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Demo;
