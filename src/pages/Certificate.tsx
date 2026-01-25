import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Award,
    Clock,
    Edit3,
    Copy,
    CheckCircle2,
    ArrowLeft,
    Share2,
    ShieldCheck,
    Download,
    Info
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import QRCode from "react-qr-code";

interface SessionData {
    id: string;
    session_type: string;
    started_at: string;
    total_duration_ms: number;
    score: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metrics: any;
    verification_token: string;
    keystroke_count: number;
    active_time_ms: number;
    idle_time_ms: number;
    paste_event_count: number;
    delete_count: number;
    document_hash?: string;
}

export default function Certificate() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [session, setSession] = useState<SessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSession();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            // 1. Fetch Session Data (for timing, user, etc.)
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('id', sessionId)
                .single();

            if (sessionError) throw sessionError;

            // 2. Fetch Report Data (for certificate specifics)
            const { data: reportData, error: reportError } = await supabase
                .from('reports')
                .select('*')
                .eq('session_id', sessionId)
                .maybeSingle(); // maybeSingle because it might not exist yet for old sessions

            if (reportError) {
                console.warn('Error fetching report:', reportError);
            }

            // 3. Merge Data (Prioritize Report)
            let finalData = { ...sessionData };

            if (reportData && reportData.report_data) {
                // Overlay report data
                finalData = {
                    ...finalData,
                    score: reportData.report_data.score,
                    metrics: reportData.report_data.metrics,
                    verification_token: reportData.verification_token,
                    // If generated_at is needed, we could use it too
                };
                // Incremenet view count if it's a report viewing
                // fire-and-forget update
                supabase.from('reports')
                    .update({
                        views_count: (reportData.views_count || 0) + 1,
                        last_viewd_at: new Date().toISOString()
                    })
                    .eq('id', reportData.id)
                    .then(({ error }) => {
                        if (error) console.error("Failed to update view count", error);
                    });
            }

            setSession(finalData);
        } catch (error) {
            console.error('Error fetching session:', error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to load certificate data.",
            });
        } finally {
            setLoading(false);
        }
    };

    const getScoreBand = (score: number): { band: string; color: string; bgColor: string; borderColor: string } => {
        if (score >= 80) return {
            band: 'HIGH CONFIDENCE',
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200'
        };
        if (score >= 50) return {
            band: 'MODERATE CONFIDENCE',
            color: 'text-amber-700',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200'
        };
        return {
            band: 'LOW CONFIDENCE',
            color: 'text-rose-700',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200'
        };
    };

    const getVerdict = (score: number): string => {
        if (score >= 80) return "Analysis indicates strong evidence of authentic, iterative drafting during this session.";
        if (score >= 50) return "Analysis indicates mixed evidence, with significant external content detected.";
        return "Analysis indicates limited iterative drafting; majority of content was introduced via external sources.";
    };

    const getPasteColor = (density: number): string => {
        if (density < 0.2) return 'text-emerald-700';
        if (density <= 0.5) return 'text-amber-700';
        return 'text-rose-700';
    };

    const formatDuration = (ms: number): string => {
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m ${seconds}s`;
    };

    const formatPercentage = (value: number): string => {
        return `${Math.round(value * 100)}%`;
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/verify/${session?.verification_token}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast({
            title: "Link Copied",
            description: "Verification link copied to clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600 font-medium">Loading certificate...</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600 font-medium">Certificate not found</div>
            </div>
        );
    }

    const { band, color, bgColor, borderColor } = getScoreBand(session.score);
    const metrics = session.metrics || {};
    const pasteDensity = metrics.output_len > 0
        ? metrics.paste_total_len / metrics.output_len
        : 0;

    return (
        <div className="min-h-screen bg-[#0A0A0B] py-12 px-4 print:bg-white print:p-0 relative overflow-hidden font-sans selection:bg-cyan-500/30 flex flex-col items-center">

            {/* Ambient Background Effects (Landing Page Style) */}
            <div className="fixed inset-0 pointer-events-none print:hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/20 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[80px] mix-blend-screen opacity-30 animate-pulse-slow delay-500" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page { margin: 0; size: portrait; }
                    body { -webkit-print-color-adjust: exact; }
                    #certificate-container {
                        transform: scale(0.9);
                        transform-origin: top center;
                        margin-bottom: 0 !important;
                    }
                }
            `}</style>
            <div className="w-full max-w-[210mm] relative z-10 flex flex-col">

                {/* Navigation - Hidden on Print */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex items-center justify-between print:hidden"
                >
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/sessions')}
                        className="text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Sessions
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => window.print()}
                            variant="outline"
                            className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                        <Button
                            onClick={handleCopyLink}
                            className="bg-zinc-100 text-zinc-900 hover:bg-white transition-all shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)] font-medium"
                        >
                            {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Share2 className="h-4 w-4 mr-2" />}
                            {copied ? "Copied" : "Share"}
                        </Button>
                    </div>
                </motion.div>

                {/* Main Certificate Card - The "Paper" */}
                <motion.div
                    id="certificate-container"
                    initial={{ opacity: 0, y: 30, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="bg-white text-zinc-900 shadow-2xl shadow-black/50 print:shadow-none relative overflow-hidden print:overflow-visible flex flex-col rounded-sm"
                    style={{ aspectRatio: '1/1.55' }} // Extended Ratio
                >
                    {/* Top Black Bar */}
                    <div className="h-4 w-full bg-zinc-950 shrink-0" />

                    <div className="p-12 print:p-8 flex-1 flex flex-col relative z-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]">

                        {/* Header: Branding & ID */}
                        <div className="flex justify-between items-start mb-16 print:mb-6 border-b-2 border-zinc-100 pb-8 print:pb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-zinc-950 flex items-center justify-center text-white font-serif font-bold text-2xl shadow-lg print:shadow-none">
                                    E
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 font-serif">Effortless</h2>
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium mt-0.5">Verification System</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-1">Session Reference</p>
                                <p className="font-mono text-xs text-zinc-600 bg-zinc-50 px-2 py-1 rounded border border-zinc-100 print:bg-transparent print:border-none">{session.id}</p>
                            </div>
                        </div>

                        {/* Title Section */}
                        <div className="text-center mb-16 print:mb-8 relative">
                            <div className="absolute top-1/2 left-0 w-full h-px bg-zinc-100 -z-10" />
                            <h1 className="text-5xl print:text-4xl font-serif font-medium text-zinc-900 mb-6 print:mb-4 tracking-tight bg-white/80 backdrop-blur-sm inline-block px-8 relative z-10">
                                Certificate of Authenticity
                            </h1>
                            <p className="text-zinc-500 text-sm uppercase tracking-widest max-w-lg mx-auto leading-relaxed bg-white/80 inline-block px-4">
                                Behavioral Biometrics Analysis
                            </p>
                        </div>

                        {/* Main Body Grid */}
                        <div className="grid grid-cols-12 gap-16 print:gap-8 flex-1">

                            {/* Left Column: Metrics & Evidence */}
                            <div className="col-span-7 space-y-12 print:space-y-4">
                                {/* Verdict Section */}
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Verification Verdict</h3>
                                    <div className={`p-6 rounded-xl border-l-4 ${bgColor} ${borderColor} bg-white shadow-sm`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <ShieldCheck className={`w-5 h-5 ${color}`} />
                                            <span className={`text-xs font-bold ${color} tracking-wider`}>{band}</span>
                                        </div>
                                        <p className="text-sm text-zinc-700 leading-relaxed font-medium font-serif italic">
                                            "{getVerdict(session.score)}"
                                        </p>
                                    </div>
                                </div>

                                {/* Key Evidence Summary */}
                                <div>
                                    <h2 className="text-lg font-serif font-bold text-zinc-900 mb-6 border-b border-zinc-100 pb-2">Analysis Summary</h2>

                                    <TooltipProvider>
                                        <div className="space-y-8">
                                            {/* Content Origin */}
                                            <div>
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <Copy className="h-3.5 w-3.5" /> Content Origin
                                                    <Info className="h-3 w-3 text-zinc-300" />
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="bg-zinc-50 p-3 rounded border border-zinc-100 cursor-help transition-colors hover:bg-zinc-100">
                                                                <span className="text-xs text-zinc-400 block mb-1">Paste Density</span>
                                                                <span className={`font-mono font-bold ${getPasteColor(pasteDensity)}`}>{formatPercentage(pasteDensity)}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="max-w-xs">The proportion of content that was pasted from external sources rather than typed.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                    <div className="bg-zinc-50 p-3 rounded border border-zinc-100">
                                                        <span className="text-xs text-zinc-400 block mb-1">Evaluation</span>
                                                        <span className="text-xs font-medium text-zinc-700">
                                                            {pasteDensity < 0.2 ? 'Organic Typing' : pasteDensity <= 0.5 ? 'Mixed Sources' : 'Heavily Pasted'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Session Activity */}
                                            <div>
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <Clock className="h-3.5 w-3.5" /> Temporal Data
                                                    <Info className="h-3 w-3 text-zinc-300" />
                                                </h3>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="cursor-help transition-opacity hover:opacity-70">
                                                                <p className="text-zinc-400 text-[10px] uppercase tracking-wide mb-1">Total Time</p>
                                                                <p className="font-mono text-sm text-zinc-900">{formatDuration(session.total_duration_ms)}</p>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Total duration of the session from start to finish.</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="cursor-help transition-opacity hover:opacity-70">
                                                                <p className="text-zinc-400 text-[10px] uppercase tracking-wide mb-1">Active Typing</p>
                                                                <p className="font-mono text-sm text-zinc-900">{formatDuration(session.active_time_ms)}</p>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Time spent actively interacting with the editor.</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="cursor-help transition-opacity hover:opacity-70">
                                                                <p className="text-zinc-400 text-[10px] uppercase tracking-wide mb-1">Tab Switches</p>
                                                                <p className="font-mono text-sm text-zinc-900">{metrics.tab_switch_count}</p>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Number of times you switched tabs during the session.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>

                                            {/* Editing Behavior */}
                                            <div>
                                                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                                                    <Edit3 className="h-3.5 w-3.5" /> Editing Behavior
                                                    <Info className="h-3 w-3 text-zinc-300" />
                                                </h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="bg-zinc-50 p-3 rounded border border-zinc-100 cursor-help transition-colors hover:bg-zinc-100">
                                                                <span className="text-xs text-zinc-400 block mb-1">Characters Typed</span>
                                                                <span className="font-mono font-bold text-zinc-900">{metrics.typed_char_count || 0}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Total number of keystrokes recorded.</p>
                                                        </TooltipContent>
                                                    </Tooltip>

                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className="bg-zinc-50 p-3 rounded border border-zinc-100 cursor-help transition-colors hover:bg-zinc-100">
                                                                <span className="text-xs text-zinc-400 block mb-1">Deletions</span>
                                                                <span className="font-mono font-bold text-zinc-900">{session.delete_count}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Total number of characters deleted, indicating revision.</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipProvider>
                                </div>
                            </div>

                            {/* Right Column: Score & Seal */}
                            <div className="col-span-5 flex flex-col items-center justify-start pt-8 border-l border-zinc-100 pl-8">

                                {/* The Seal */}
                                <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                                    <div className={`absolute inset-0 rounded-full border-[3px] ${borderColor} opacity-30`} />
                                    <div className={`absolute inset-1.5 rounded-full border border-dashed ${borderColor} opacity-60`} />

                                    <div className="flex flex-col items-center justify-center text-center z-10 p-4">
                                        <Award className={`w-10 h-10 ${color} mb-1`} />
                                        <div className="flex flex-col items-center">
                                            <span className={`text-4xl font-bold ${color} tracking-tighter font-serif`}>{session.score}</span>
                                        </div>
                                    </div>

                                    {/* Simulated Seal Text Ring */}
                                    <svg className="absolute inset-0 w-full h-full animate-spin-slow opacity-20" viewBox="0 0 100 100">
                                        <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                        <text width="500">
                                            <textPath xlinkHref="#curve" className={`text-[10px] uppercase font-bold ${color} fill-current tracking-widest`}>
                                                • Official Verification • Effortless System •
                                            </textPath>
                                        </text>
                                    </svg>
                                </div>

                                <div className="text-center mb-10">
                                    <p className="font-serif text-lg text-zinc-900 mb-1">
                                        {new Date(session.started_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Date of Creation</p>
                                </div>

                                {/* Explanation Box */}
                                <div className="w-full bg-zinc-50 rounded-lg p-5 border border-zinc-100 text-center">
                                    <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                                        Authenticity Statement
                                    </h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                                        This document confirms that the associated content was produced within a monitored environment, validating human typing patterns and temporal consistency.
                                    </p>
                                </div>


                            </div>
                        </div>



                        {/* Footer */}
                        <div className="mt-auto pt-8 border-t-2 border-zinc-100 flex items-end justify-between">
                            <div>
                                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Cryptographic Token</p>
                                <p className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-2 py-1.5 rounded select-all border border-zinc-100 max-w-[300px] truncate mb-4">
                                    {session.verification_token}
                                </p>

                                {session.document_hash && (
                                    <>
                                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Document Hash (SHA-256)</p>
                                        <p className="text-[10px] font-mono text-zinc-500 bg-zinc-50 px-2 py-1.5 rounded select-all border border-zinc-100 max-w-[300px] break-all">
                                            {session.document_hash}
                                        </p>
                                    </>
                                )}
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="flex flex-col items-end gap-1">
                                    <div className="bg-white p-1 rounded border border-zinc-100">
                                        <QRCode
                                            value={`${window.location.host}/verify/${session.verification_token}`}
                                            size={48}
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                            viewBox={`0 0 256 256`}
                                        />
                                    </div>
                                    <span className="text-[8px] text-zinc-400 font-medium uppercase tracking-wider">Scan to Verify</span>
                                </div>
                                <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 mb-1">
                                    <span className="h-5 w-5 rounded bg-zinc-900 flex items-center justify-center text-white text-[9px] font-bold">E</span>
                                    <span className="text-xs font-bold text-zinc-900 tracking-tight">Effortless</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Black Bar */}
                    <div className="h-4 w-full bg-zinc-950 shrink-0" />
                </motion.div>

                <div className="text-center mt-8 pb-12 print:hidden">
                    <p className="text-zinc-500 text-sm">
                        Verify this certificate at <span className="text-zinc-400">{window.location.host}/verify</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
