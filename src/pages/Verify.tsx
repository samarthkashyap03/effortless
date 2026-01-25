import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Award,
    Clock,
    Edit3,
    Copy,
    CheckCircle2,
    ShieldCheck,
    AlertTriangle,
    XCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

interface ReportData {
    id: string;
    session_id: string;
    user_id: string;
    score: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metrics: any;
    verification_token: string;
    report_data: {
        score: number;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metrics: any;
        final_output_hash: string;
        final_output_length: number;
    };
    created_at: string;
    sessions?: {
        started_at: string;
        total_duration_ms: number;
        active_time_ms: number;
        idle_time_ms: number;
        status: string;
    }
}

export default function Verify() {
    const { token } = useParams();
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                // Fetch report by verification token
                // Also join session data for timing info if possible
                const { data, error } = await supabase
                    .from('reports')
                    .select('*, sessions (started_at, total_duration_ms, active_time_ms, idle_time_ms, status)')
                    .eq('verification_token', token)
                    .maybeSingle();

                if (error) throw error;

                if (!data) {
                    setError("Invalid verification token.");
                } else {
                    setReport(data);

                    // Fire and forget view count update
                    supabase.from('reports')
                        .update({
                            views_count: (data.views_count || 0) + 1,
                            last_viewd_at: new Date().toISOString()
                        })
                        .eq('id', data.id)
                        .then(({ error }) => {
                            if (error) console.error("Failed to update view count", error);
                        });
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                console.error('Error verifying token:', err);
                setError("Unable to verify certificate. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchReport();
        }
    }, [token]);

    const getScoreBand = (score: number) => {
        if (score >= 80) return {
            band: 'HIGH CONFIDENCE',
            color: 'text-emerald-700',
            bgColor: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            icon: CheckCircle2
        };
        if (score >= 50) return {
            band: 'MODERATE CONFIDENCE',
            color: 'text-amber-700',
            bgColor: 'bg-amber-50',
            borderColor: 'border-amber-200',
            icon: AlertTriangle
        };
        return {
            band: 'LOW CONFIDENCE',
            color: 'text-rose-700',
            bgColor: 'bg-rose-50',
            borderColor: 'border-rose-200',
            icon: AlertTriangle
        };
    };

    const formatDuration = (ms: number): string => {
        if (!ms) return "0s";
        const hours = Math.floor(ms / 3600000);
        const minutes = Math.floor((ms % 3600000) / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m ${seconds}s`;
    };

    const formatPercentage = (value: number): string => {
        return `${Math.round(value * 100)}%`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-slate-600 font-medium flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-slate-600 border-t-transparent rounded-full"></div>
                    Verifying authenticity...
                </div>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-rose-100">
                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Verification Failed</h1>
                    <p className="text-slate-600 mb-6">{error || "Certificate not found"}</p>
                    <Button onClick={() => window.location.href = '/'} variant="outline">
                        Go to Home
                    </Button>
                </div>
            </div>
        );
    }

    // Extract data
    // Use report_data if available (preferred), or fallback to report root (if schema evolved)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reportDetails = report.report_data || {} as { score?: number; metrics?: any };
    const metrics = reportDetails.metrics || {};
    const score = reportDetails.score ?? 0;

    // Combine session info
    const sessionInfo = report.sessions || {
        started_at: report.created_at, // fallback
        total_duration_ms: 0,
        active_time_ms: 0,
        idle_time_ms: 0
    };

    const { band, color, bgColor, borderColor, icon: BandIcon } = getScoreBand(score);
    const pasteDensity = metrics.output_len > 0
        ? (metrics.paste_total_len || 0) / metrics.output_len
        : 0;

    const getPasteColor = (density: number): string => {
        if (density < 0.2) return 'text-emerald-700';
        if (density <= 0.5) return 'text-amber-700';
        return 'text-rose-700';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 selection:bg-cyan-500/30 font-sans relative overflow-hidden flex flex-col items-center">

            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <div className="w-full max-w-[210mm] relative z-10 flex flex-col">

                {/* Public Verification Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900/80 backdrop-blur-md border border-white/10 text-white p-4 rounded-t-2xl flex items-center justify-between mb-0 shadow-2xl relative z-10"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">
                            E
                        </div>
                        <div>
                            <p className="text-sm font-bold tracking-tight">Effortless Verification</p>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Public Record</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Live</span>
                        </div>
                        <p className="text-xs font-mono bg-black/40 border border-white/5 px-2 py-1 rounded text-zinc-300">
                            {token?.slice(0, 16)}...
                        </p>
                    </div>
                </motion.div>

                {/* Main Certificate Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[#121215] text-white shadow-2xl shadow-black/80 rounded-b-2xl overflow-hidden flex flex-col border border-white/5 border-t-0 ring-1 ring-white/5"
                    style={{ minHeight: '800px' }}
                >
                    {/* Decorative Top Gradient Line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shrink-0 opacity-50" />

                    <div className="p-10 flex-1 flex flex-col relative z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-5">

                        {/* Title Section */}
                        <div className="text-center mb-16 mt-6">
                            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4 tracking-tight relative inline-block">
                                Certificate of Authenticity
                                {/* Subtle Glow under text */}
                                <div className="absolute inset-0 bg-white/5 blur-2xl -z-10 rounded-full" />
                            </h1>
                            <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed border-t border-white/5 pt-4 mt-2">
                                This document certifies the behavioral patterns recorded during the creation of the work associated with this token.
                            </p>
                        </div>

                        {/* Main Body: Two Columns */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 flex-1">

                            {/* Left Column: Metrics & Evidence (7 Cols) */}
                            <div className="md:col-span-7 space-y-10">
                                {/* Verdict Section */}
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Analysis Result</h3>
                                    <div className={`p-6 rounded-xl border ${borderColor.replace('border-', 'border-opacity-30 border-')} ${bgColor.replace('bg-', 'bg-opacity-10 bg-')} backdrop-blur-sm`}>
                                        <div className="flex items-center gap-3 mb-2">
                                            <ShieldCheck className={`w-5 h-5 ${color}`} />
                                            <span className={`text-xs font-bold ${color} tracking-wider`}>{band}</span>
                                        </div>
                                        <p className={`text-sm ${color} leading-relaxed font-medium opacity-90`}>
                                            Score: {score} / 100
                                        </p>
                                    </div>
                                </div>

                                {/* Key Evidence Summary */}
                                <div>
                                    <h2 className="text-lg font-serif font-medium text-white mb-6 border-b border-white/5 pb-2">Recorded Evidence</h2>

                                    <div className="space-y-8">
                                        {/* Content Origin */}
                                        <div className="pb-6 border-b border-white/5">
                                            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                                                <Copy className="h-4 w-4 text-cyan-500/70" />
                                                Content Origin
                                            </h3>
                                            <div className="pl-6 space-y-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <span className="text-zinc-400 font-medium text-sm">Pasted Content</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`font-mono font-bold ${getPasteColor(pasteDensity)}`}>
                                                            {formatPercentage(pasteDensity)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-zinc-500 pl-1">
                                                    {pasteDensity < 0.2
                                                        ? 'High originality detected.'
                                                        : 'Significant external content detected.'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Session Activity */}
                                        <div className="pb-6 border-b border-white/5">
                                            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-cyan-500/70" />
                                                Session Activity
                                            </h3>
                                            <div className="pl-6 grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Total Duration</p>
                                                    <p className="font-mono font-medium text-white">{formatDuration(sessionInfo.total_duration_ms)}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Active Typing</p>
                                                    <p className="font-mono font-medium text-white">{formatDuration(sessionInfo.active_time_ms)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editing Behavior */}
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2">
                                                <Edit3 className="h-4 w-4 text-cyan-500/70" />
                                                Effort Metrics
                                            </h3>
                                            <div className="pl-6 grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Keystrokes</p>
                                                    <p className="font-mono font-medium text-white">{metrics.keystroke_count || 0}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5">
                                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Deletions</p>
                                                    <p className="font-mono font-medium text-white">{metrics.delete_count || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Seal (5 Cols) */}
                            <div className="md:col-span-5 flex flex-col items-center justify-start pt-8 border-l border-white/5 pl-8">
                                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                    <div className={`absolute inset-0 rounded-full border-4 ${borderColor.replace('border-', 'border-opacity-20 border-')} opacity-30`} />
                                    <div className={`absolute inset-4 rounded-full border border-dashed ${borderColor.replace('border-', 'border-opacity-40 border-')} opacity-50 animate-spin-slow`} />

                                    <div className="flex flex-col items-center justify-center text-center z-10 p-4">
                                        <Award className={`w-12 h-12 ${color} mb-2 drop-shadow-lg`} />
                                        <span className={`text-5xl font-bold ${color} font-serif tracking-tighter drop-shadow-2xl`}>{score}</span>
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Verified Timestamp</p>
                                    <p className="text-sm font-mono text-cyan-100/80 bg-cyan-900/20 px-3 py-1 rounded border border-cyan-500/20 inline-block">
                                        {new Date(report.created_at || sessionInfo.started_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-10 border-t border-white/5 flex justify-center">
                            <div className="flex items-center gap-2 opacity-40 hover:opacity-80 transition-opacity">
                                <span className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center text-white text-[9px] font-bold">E</span>
                                <span className="text-xs font-bold text-zinc-500 tracking-tight">Verified by Effortless</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
