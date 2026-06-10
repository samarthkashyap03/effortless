import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, FileText, Code, LogOut, ChevronRight, ChevronDown, Sparkles, Clock, Calendar, Shield, CheckCircle2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
// @ts-ignore
import html2pdf from 'html2pdf.js';

interface Session {
    id: string;
    session_type: "writing" | "coding";
    status: "active" | "completed" | "deleted";
    started_at: string;
    total_duration_ms: number | null;
    keystroke_count: number;
    report_id?: string | null;
    title?: string | null;
    metrics?: any;
}

export default function Sessions() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [userName, setUserName] = useState("");
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const PAGE_SIZE = 3;

    useEffect(() => {
        checkUser();
        fetchSessions(0, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate("/auth");
            return;
        }
        setUserName(user.user_metadata.full_name || "User");
    };

    const fetchSessions = async (pageIndex: number, isInitialLoad: boolean = false) => {
        try {
            if (isInitialLoad) {
                setIsLoading(true);
            } else {
                setIsLoadingMore(true);
            }

            const from = pageIndex * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            const { data: sessionsData, error: sessionsError } = await supabase
                .from("sessions")
                .select("*")
                .order("started_at", { ascending: false })
                .range(from, to);

            if (sessionsError) throw sessionsError;

            if (!sessionsData || sessionsData.length === 0) {
                if (isInitialLoad) setSessions([]);
                setHasMore(false);
                return;
            }

            if (sessionsData.length < PAGE_SIZE) {
                setHasMore(false);
            } else {
                setHasMore(true);
            }

            const sessionIds = sessionsData.map(s => s.id);
            const { data: reportsData, error: reportsError } = await supabase
                .from("reports")
                .select("id, session_id")
                .in("session_id", sessionIds);

            if (reportsError) {
                console.warn("Could not fetch reports:", reportsError);
            }

            const newSessions = sessionsData.map(session => {
                const report = reportsData?.find(r => r.session_id === session.id);
                return {
                    ...session,
                    report_id: report ? report.id : null
                };
            });

            if (isInitialLoad) {
                setSessions(newSessions);
                setPage(0);
            } else {
                setSessions(prev => [...prev, ...newSessions]);
            }

        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load sessions.",
            });
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchSessions(nextPage, false);
    };

    const handleCreateSession = () => {
        setIsReady(false);
        setShowCreateDialog(true);
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const handleDownloadWork = async (session: Session) => {
        try {
            if (session.session_type === 'writing' && session.metrics?.pdf_base64) {
                // Directly download the original base64 PDF
                const base64Str = session.metrics.pdf_base64;
                const response = await fetch(base64Str);
                const blob = await response.blob();
                const pdfFilename = `${session.title?.trim() || 'Effortless_Session'}.pdf`;

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = pdfFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                toast({
                    title: "Download complete",
                    description: `Successfully downloaded original PDF: ${session.title || 'Session work'}`,
                });
                return;
            }

            const final_text = session.metrics?.final_text;
            if (!final_text) {
                toast({
                    variant: "destructive",
                    title: "Download failed",
                    description: "No text content found for this session.",
                });
                return;
            }

            if (session.session_type === 'writing') {
                // Fallback for older sessions without pdf_base64
                const pdfFilename = `${session.title?.trim() || 'Effortless_Session'}.pdf`;

                // Create a temporary element to render the text nicely as a document
                const container = document.createElement('div');
                container.style.padding = '40px';
                container.style.fontFamily = 'Arial, sans-serif';
                container.style.color = '#111';
                container.style.lineHeight = '1.6';
                container.style.backgroundColor = '#fff';

                const h1 = document.createElement('h1');
                h1.style.fontSize = '24px';
                h1.style.marginBottom = '20px';
                h1.style.borderBottom = '1px solid #eee';
                h1.style.paddingBottom = '10px';
                h1.textContent = session.title || "Writing Session Document";
                container.appendChild(h1);

                const body = document.createElement('div');
                body.style.whiteSpace = 'pre-wrap';
                body.style.fontSize = '14px';
                body.textContent = final_text;
                container.appendChild(body);

                document.body.appendChild(container);

                const opt = {
                    margin: 10,
                    filename: pdfFilename,
                    image: { type: 'jpeg' as const, quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
                };

                await html2pdf().set(opt).from(container).save();
                document.body.removeChild(container);
            } else {
                // Download code as text file
                const codeBlob = new Blob([final_text], { type: 'text/plain;charset=utf-8' });
                const codeFilename = `${session.title?.trim() || 'Effortless_Code'}.txt`;
                const url = URL.createObjectURL(codeBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = codeFilename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }

            toast({
                title: "Download complete",
                description: `Successfully downloaded: ${session.title || 'Session work'}`,
            });
        } catch (e: any) {
            console.error("Error downloading work:", e);
            toast({
                variant: "destructive",
                title: "Error",
                description: e.message || "Failed to download work",
            });
        }
    };

    const formatDuration = (ms: number | null) => {
        if (!ms && ms !== 0) return "-";
        const minutes = Math.floor(ms / 60000);
        if (minutes < 1) return "<1m";
        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return `${hours}h ${mins}m`;
        }
        return `${minutes}m`;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const dateStr = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
        const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true
        });
        return { date: dateStr, time: timeStr };
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Loading sessions...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Hero gradient glow - matching landing page */}
            <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-hero-gradient opacity-60 pointer-events-none" />

            {/* Secondary purple glow */}
            <div className="absolute top-[200px] right-[-200px] w-[500px] h-[500px] bg-gradient-radial from-glow-purple/10 to-transparent rounded-full blur-3xl pointer-events-none" />

            {/* Particle grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(hsl(var(--glass-border)/0.3)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--glass-border)/0.3)_1px,transparent_1px)] bg-[size:80px_80px] pointer-events-none opacity-40" />

            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">
                            <span className="gradient-text">Verification Sessions</span>
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            View and manage your verification reports.
                        </p>
                        <p className="text-sm text-muted-foreground/60 mt-1">
                            {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} visible
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleSignOut}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/50 h-9 px-3"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Sign out
                        </Button>

                        {sessions.length > 0 && (
                            <Button
                                onClick={handleCreateSession}
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 font-medium btn-glow"
                            >
                                <Plus className="h-4 w-4 mr-1.5" />
                                New session
                            </Button>
                        )}
                    </div>
                </motion.header>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {sessions.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="flex flex-col items-center justify-center py-4 relative"
                        >
                            {/* Card Container */}
                            <div className="relative w-full max-w-2xl bg-[#121215]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-12 text-center overflow-hidden shadow-2xl">

                                {/* Ambient Card Glows */}
                                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay" />

                                <div className="relative z-10 flex flex-col items-center">
                                    {/* Icon */}
                                    <div className="relative mb-8 group">
                                        <div className="absolute inset-0 bg-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" />
                                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1a1a1e] to-[#0f0f12] border border-white/10 flex items-center justify-center relative shadow-xl group-hover:scale-105 transition-transform duration-500">
                                            <Sparkles className="h-8 w-8 text-cyan-400 group-hover:text-white transition-colors duration-500" />
                                        </div>
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                                        Start Your First Session
                                    </h2>

                                    <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
                                        When you end a session, your document is downloaded as a PDF and cryptographically linked to a verification certificate.
                                    </p>

                                    {/* Feature Grid - Mixed: Latest Design Layout + Old Text Concepts */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-10 text-left">
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <FileText className="h-5 w-5 text-cyan-500/70 mb-3" />
                                            <h3 className="font-semibold text-white text-sm mb-1">Download</h3>
                                            <p className="text-xs text-zinc-500">You will download your document locally</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <Shield className="h-5 w-5 text-cyan-500/70 mb-3" />
                                            <h3 className="font-semibold text-white text-sm mb-1">Binding</h3>
                                            <p className="text-xs text-zinc-500">Cryptographically bound to a certificate</p>
                                        </div>
                                        <div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                            <LogOut className="h-5 w-5 text-cyan-500/70 mb-3" />
                                            <h3 className="font-semibold text-white text-sm mb-1">Privacy</h3>
                                            <p className="text-xs text-zinc-500">Effortless does not store your content</p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleCreateSession}
                                        size="lg"
                                        className="bg-white text-black hover:bg-cyan-50 h-12 px-8 rounded-full font-bold text-sm shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Begin Writing
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="list"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid gap-4"
                        >
                            {sessions.map((session) => {
                                const dateTime = formatDateTime(session.started_at);
                                return (
                                    <motion.div
                                        key={session.id}
                                        variants={itemVariants}
                                        className="group relative"
                                    >
                                        <div
                                            className="glass-card glow-border p-5 transition-all duration-300 cursor-pointer hover:border-primary/30"
                                            onClick={() => session.report_id && navigate(`/certificate/${session.id}`)}
                                        >
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4 flex-1 min-w-0">
                                                    {/* Icon */}
                                                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${session.session_type === 'coding'
                                                        ? 'bg-glow-blue/15 text-glow-blue'
                                                        : 'bg-primary/15 text-primary'
                                                        }`}>
                                                        {session.session_type === "coding"
                                                            ? <Code className="h-5 w-5" />
                                                            : <FileText className="h-5 w-5" />
                                                        }
                                                    </div>

                                                    {/* Title & Meta */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                            <h3 className="font-semibold text-foreground truncate text-base max-w-[180px] sm:max-w-xs">
                                                                {session.title || "Untitled Session"}
                                                            </h3>
                                                            <Badge
                                                                variant="outline"
                                                                className={`shrink-0 text-[10px] uppercase tracking-wider border-0 px-2.5 py-1 font-semibold ${session.status === "completed"
                                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                                    : "bg-amber-500/20 text-amber-400"
                                                                    }`}
                                                            >
                                                                {session.status}
                                                            </Badge>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="h-3.5 w-3.5 text-primary/60" />
                                                                {dateTime.date}
                                                            </span>
                                                            <span className="flex items-center gap-1.5">
                                                                <Clock className="h-3.5 w-3.5 text-primary/60" />
                                                                {dateTime.time}
                                                            </span>
                                                            <span className="hidden sm:inline text-muted-foreground/60">•</span>
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="text-muted-foreground/60">Duration:</span>
                                                                {formatDuration(session.total_duration_ms)}
                                                            </span>
                                                            <span className="capitalize px-2 py-0.5 rounded-md bg-muted/50 text-muted-foreground">
                                                                {session.session_type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action */}
                                                <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0">
                                                    {session.report_id ? (
                                                        <>
                                                            {(session.metrics?.final_text || session.metrics?.pdf_base64) && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="w-full sm:w-auto h-9 px-3 text-xs text-muted-foreground hover:text-white hover:bg-white/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDownloadWork(session);
                                                                    }}
                                                                >
                                                                    <Download className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
                                                                    Download Work
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="w-full sm:w-auto h-9 px-4 text-xs border-glass-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-primary/50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    navigate(`/certificate/${session.id}`);
                                                                }}
                                                            >
                                                                View report
                                                                <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <div className="w-9 h-9 flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {hasMore && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center mt-6"
                                >
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={isLoadingMore}
                                        className="gap-2 bg-white/5 border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all duration-300 min-w-[140px]"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                View More
                                                <ChevronDown className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Create Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="sm:max-w-xl p-0 overflow-hidden border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">

                        {/* Decorative Background Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

                        <DialogHeader className="p-8 pb-4 relative z-10">
                            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                Create New Session
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400 text-base">
                                Choose a session type to begin verification.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="p-8 pt-2 space-y-6 relative z-10">
                            {/* Writing Session Option */}
                            <div
                                className={`group relative p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${isReady
                                    ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_30px_-5px_rgba(6,182,212,0.15)]"
                                    : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                                    }`}
                                onClick={() => setIsReady(!isReady)}
                            >
                                <div className="flex items-start gap-5">
                                    <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isReady ? "bg-cyan-500/20 text-cyan-400" : "bg-white/10 text-zinc-400 group-hover:text-zinc-100"
                                        }`}>
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className={`font-semibold text-lg transition-colors ${isReady ? "text-white" : "text-zinc-200"}`}>
                                                Writing Session
                                            </h3>
                                            <Checkbox
                                                checked={isReady}
                                                onCheckedChange={(checked) => setIsReady(checked as boolean)}
                                                className="data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 border-zinc-600 h-6 w-6 rounded-full"
                                            />
                                        </div>
                                        <p className="text-sm text-zinc-400 leading-relaxed max-w-[90%]">
                                            Effortless measures timing and editing behavior — your text is never stored.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowCreateDialog(false)}
                                    className="text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => navigate("/session/writing")}
                                    disabled={!isReady}
                                    size="lg"
                                    className={`
                                        relative overflow-hidden font-semibold px-8 transition-all duration-300
                                        ${isReady
                                            ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-[1.02] shadow-lg shadow-cyan-500/25 text-white border-0"
                                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                                        }
                                    `}
                                >
                                    {isReady && <Sparkles className="h-4 w-4 mr-2 animate-pulse" />}
                                    Start Verification
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="text-center py-6 relative z-10">
                <p className="text-zinc-600 text-xs text-muted-foreground/50">
                    Effortless is currently in early access. Paid plans will be introduced based on usage and feedback.
                </p>
            </div>
        </div>
    );
}
