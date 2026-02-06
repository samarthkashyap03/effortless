import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UpdatePassword from "./pages/UpdatePassword";
import Demo from "./pages/Demo";
import Sessions from "./pages/Sessions";
import WritingSession from "./pages/WritingSession";
import Certificate from "./pages/Certificate";
import Verify from "./pages/Verify";
import NotFound from "./pages/NotFound";
import Implementation from "./pages/Implementation";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import FAQ from "./pages/FAQ";
import { PrivacyProtector } from "./components/PrivacyProtector";
import VerificationGuide from "./pages/VerificationGuide";
import About from "./pages/About";
import Pricing from "./pages/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/demo" element={<Demo />} />
          <Route path="/implementation" element={<Implementation />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />


          <Route path="/verify" element={<Verify />} />
          <Route path="/verify/:token" element={<Verify />} />
          <Route path="/verify-guide" element={<VerificationGuide />} />

          {/* Protected Routes (Wrapped in PrivacyProtector) */}
          <Route path="/sessions" element={
            <PrivacyProtector>
              <Sessions />
            </PrivacyProtector>
          } />
          <Route path="/session/writing" element={
            <PrivacyProtector>
              <WritingSession />
            </PrivacyProtector>
          } />
          <Route path="/certificate/:sessionId" element={
            <PrivacyProtector>
              <Certificate />
            </PrivacyProtector>
          } />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
