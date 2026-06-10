import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MoreHorizontal, History, ChevronDown, Check, Pencil, StopCircle, HelpCircle, Settings, Type, Code } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Editor from "@/components/editor/Editor";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { TrackingSDK } from "@/lib/tracking";

const FONT_OPTIONS = [
    { name: "Fira Code", value: "'Fira Code', monospace" },
    { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
    { name: "Source Code Pro", value: "'Source Code Pro', monospace" },
    { name: "Courier", value: "'Courier New', monospace" },
];

const SIZE_OPTIONS = [
    { name: "Small", value: "14px" },
    { name: "Medium", value: "16px" },
    { name: "Large", value: "18px" },
    { name: "Extra Large", value: "20px" },
];

const indexToVisualSize = (name: string) => {
    switch (name) {
        case "Small": return "12px";
        case "Medium": return "16px";
        case "Large": return "20px";
        case "Extra Large": return "24px";
        default: return "16px";
    }
};

const HOW_TO_USE_CONTENT = `
<div class="space-y-4">
    <div class="p-4 bg-cyan-50/50 rounded-xl border border-cyan-100">
        <h3 class="font-bold flex items-center gap-2 mb-2 text-cyan-900">👋 Welcome to Effortless Coding</h3>
        <p class="text-sm text-cyan-800">A space to document your coding thought process.</p>
    </div>
    
    <div class="grid gap-4">
        <div class="feature-card p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <strong class="block mb-1 text-zinc-900">💻 Code Blocks</strong>
            <p class="text-sm text-zinc-600">Type <code class="bg-zinc-200 px-1 py-0.5 rounded text-xs">/code</code> to insert code blocks with syntax highlighting.</p>
        </div>
        
        <div class="feature-card p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <strong class="block mb-1 text-zinc-900">⚡ Tracking</strong>
            <p class="text-sm text-zinc-600">We track your typing rhythm just like in writing sessions to verify authenticity.</p>
        </div>
    </div>
</div>
`;

export default function CodingSession() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("Untitled Code Session");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const [content, setContent] = useState("");
    const [fontSettings, setFontSettings] = useState({
        family: FONT_OPTIONS[0].value,
        size: SIZE_OPTIONS[1].value,
    });
    const [wordCount, setWordCount] = useState(0);
    const [startTime] = useState<number>(Date.now());
    const { toast } = useToast();

    // Tracking SDK
    const trackingRef = useRef<TrackingSDK | null>(null);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showDownloadConfirmDialog, setShowDownloadConfirmDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingSessionData, setPendingSessionData] = useState<{
        payload: unknown;
        scoreResult: unknown;
        hashHex: string;
    } | null>(null);

    // Text Normalization & Hashing Helpers
    const normalizeTextForHashing = (text: string): string => {
        return text
            .trim()
            .replace(/\r\n/g, '\n')
            .replace(/\s+/g, ' ');
    };

    const calculateSHA256OfString = async (str: string): Promise<string> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    // Draft Recovery
    const [draftLoaded, setDraftLoaded] = useState(false);
    useEffect(() => {
        const saved = localStorage.getItem("effortless_coding_draft");
        if (saved) {
            try {
                const { title: savedTitle, content: savedContent } = JSON.parse(saved);
                if (savedContent && !draftLoaded) {
                    setTitle(savedTitle);
                    setContent(savedContent);
                    setTempTitle(savedTitle);
                    setDraftLoaded(true);
                    toast({
                        title: "Draft Restored",
                        description: "Your previous unsaved coding draft has been automatically restored.",
                    });
                }
            } catch (e) {
                console.error("Failed to parse saved draft:", e);
            }
        }
    }, [draftLoaded, toast]);

    useEffect(() => {
        if (content && content !== "<p></p>" && content !== HOW_TO_USE_CONTENT) {
            localStorage.setItem("effortless_coding_draft", JSON.stringify({ title, content }));
        }
    }, [title, content]);

    useEffect(() => {
        // Initialize tracking
        const sdk = new TrackingSDK(crypto.randomUUID());
        trackingRef.current = sdk;

        // Push state to trap back button
        history.pushState(null, "", location.href);

        const handlePopState = (event: PopStateEvent) => {
            event.preventDefault();
            // Push state again to prevent going back
            history.pushState(null, "", location.href);
            setShowExitDialog(true);
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            sdk.cleanup();
            window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    // Update word count
    useEffect(() => {
        const text = content.replace(/<[^>]*>?/gm, '');
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);

        // Update final text in SDK
        if (trackingRef.current) {
            trackingRef.current.setFinalText(text);
        }
    }, [content]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleTransaction = (transaction: any) => {
        if (!trackingRef.current) return;
        if (!transaction.docChanged) return; // No content changes

        // Analyze transaction steps (Re-using logic from WritingSession)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction.steps.forEach((step: any) => {
            if (step.slice) {
                const insertedLen = step.slice.content ? step.slice.content.size : 0;
                const deletedLen = step.to - step.from;

                if (deletedLen > 0) {
                    trackingRef.current?.trackDelete(deletedLen, step.from);
                }

                if (insertedLen > 0) {
                    if (insertedLen > 1) {
                        trackingRef.current?.trackPaste("x".repeat(insertedLen), step.from);
                    } else {
                        trackingRef.current?.trackTyping(1);
                        let insertedText = "";
                        try {
                            if (step.slice && step.slice.content) {
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                step.slice.content.descendants((node: any) => {
                                    if (node.isText) {
                                        insertedText += node.text;
                                    }
                                });
                            }
                        } catch (e) {
                            console.error("Error extracting text:", e);
                        }

                        // Regex for word boundary: space, newline, or punctuation
                        if (insertedText && /[\s.,;!?]/.test(insertedText)) {
                            trackingRef.current?.trackWordBoundary();
                        }
                    }
                }
            }
        });
    };

    const handleStopSession = async () => {
        try {
            if (!trackingRef.current) return;
            setIsSaving(true);

            const payload = trackingRef.current.getSessionPayload();
            const { calculateScore } = await import("@/lib/scoring");
            const scoreResult = calculateScore(payload);

            // Compute Hash of normalized text
            const normalizedText = normalizeTextForHashing(payload.final_text);
            const hashHex = await calculateSHA256OfString(normalizedText);

            // Update payload and results with clean hash
            payload.final_text = normalizedText;

            // Trigger download of code content automatically
            const codeBlob = new Blob([payload.final_text], { type: 'text/plain;charset=utf-8' });
            const codeFilename = `${title.trim() || 'Effortless_Code'}.txt`;
            const url = URL.createObjectURL(codeBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = codeFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Verification Token
            const verificationToken = crypto.randomUUID();

            // Verify user exists
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            // Use CANONICAL duration from tracking SDK (performance.now based)
            const duration = Math.round(payload.duration_ms);

            // Insert to Supabase directly
            const { data, error } = await supabase.from('sessions').insert({
                user_id: user.id,
                session_type: 'coding',
                status: 'completed',
                started_at: new Date(startTime).toISOString(),
                ended_at: new Date().toISOString(),
                total_duration_ms: duration,

                // Core counts
                keystroke_count: payload.keystroke_count || 0,
                delete_count: payload.delete_count || 0,
                insert_count: payload.typed_char_count || 0,

                // Time tracking
                active_time_ms: Math.round(payload.active_ms_total || 0),
                idle_time_ms: Math.round(payload.away_ms_total || 0),

                // Paste tracking
                paste_event_count: payload.paste_count || 0,
                paste_sizes: payload.paste_events && payload.paste_events.length > 0
                    ? payload.paste_events
                    : null,

                // Focus tracking
                tab_switch_count: payload.tab_switch_count || 0,
                focus_events: {
                    focus_ms_total: payload.focus_ms_total || 0,
                    away_ms_total: payload.away_ms_total || 0,
                    longest_away_ms: payload.longest_away_ms || 0,
                },
                focus_consistency_score: duration > 0
                    ? Math.round((payload.focus_ms_total / duration) * 100)
                    : 0,

                // Typing patterns
                average_typing_speed: scoreResult.metrics.keys_per_min || 0,
                typing_bursts: null,
                pause_distribution: {
                    pause_hist: payload.pause_hist,
                    inter_word_gap_hist: payload.inter_word_gap_hist,
                },

                // New columns for certificate
                score: scoreResult.score,
                metrics: payload,
                verification_token: verificationToken,
                final_output_hash: hashHex,
                final_output_length: payload.output_len || 0,
                title: title.trim() || "Untitled Code Session",
                document_hash: hashHex,
                hash_algorithm: 'SHA-256',
            }).select();

            if (error) throw error;

            // Create Report
            if (data && data[0]) {
                const sessionData = data[0];
                const reportPayload = {
                    session_id: sessionData.id,
                    user_id: user.id,
                    report_data: {
                        score: scoreResult.score,
                        metrics: payload,
                        final_output_hash: hashHex,
                        final_output_length: payload.output_len || 0,
                    },
                    verification_token: verificationToken,
                    generated_at: new Date().toISOString(),
                    views_count: 0,
                };

                const { error: reportError } = await supabase
                    .from('reports')
                    .insert(reportPayload);

                if (reportError) {
                    console.error('Error creating report:', reportError);
                    toast({
                        variant: 'destructive',
                        title: "Warning",
                        description: "Session saved, but certificate generation failed.",
                    });
                } else {
                    toast({
                        title: "Session Saved",
                        description: `Session saved with Score: ${scoreResult.score} (${scoreResult.band})`,
                    });
                }

                // Clear draft
                localStorage.removeItem("effortless_coding_draft");

                // Show completion dialog with redirection option
                setPendingSessionData({ payload, scoreResult, hashHex: sessionData.id });
                setShowDownloadConfirmDialog(true);
            } else {
                throw new Error("No session data returned after insert");
            }
        } catch (error: any) {
            console.error('Error saving session:', error);
            toast({
                variant: 'destructive',
                title: "Error Saving Session",
                description: error.message || "Unknown error occurred",
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Focus input when editing starts
    useEffect(() => {
        if (isEditingTitle && titleInputRef.current) {
            titleInputRef.current.focus();
            titleInputRef.current.select();
        }
    }, [isEditingTitle]);

    const handleTitleEdit = () => {
        setTempTitle(title);
        setIsEditingTitle(true);
    };

    const handleTitleSave = () => {
        const trimmedTitle = tempTitle.trim();
        if (trimmedTitle) {
            setTitle(trimmedTitle);
        }
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTitleSave();
        } else if (e.key === "Escape") {
            setTempTitle(title);
            setIsEditingTitle(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative flex flex-col font-sans">
            {/* Header / Top Bar */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-16 px-6 bg-transparent sticky top-0 z-50 flex items-center justify-between pointer-events-none"
            >
                {/* Left Action - Pointer events auto to re-enable clicking */}
                <div className="flex items-center gap-4 pointer-events-auto">
                    <Button variant="ghost" size="icon" onClick={() => setShowExitDialog(true)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className="bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded text-xs font-bold border border-cyan-500/20">CODE</div>
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                                <Input
                                    ref={titleInputRef}
                                    value={tempTitle}
                                    onChange={(e) => setTempTitle(e.target.value)}
                                    onKeyDown={handleTitleKeyDown}
                                    onBlur={handleTitleSave}
                                    className="h-7 bg-transparent border-none text-white text-sm font-medium placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 w-48"
                                    placeholder="Session name..."
                                    maxLength={100}
                                />
                                <button
                                    onClick={handleTitleSave}
                                    className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                >
                                    <Check className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleTitleEdit}
                                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors text-white/90 group"
                            >
                                <span className="font-medium text-sm">{title}</span>
                                <Pencil className="h-3 w-3 text-white/30 group-hover:text-white/60 transition-colors" />
                            </button>
                        )}
                    </div>

                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 pointer-events-auto">
                    <span className="text-xs text-white/40 mr-4 hidden sm:inline-block font-medium">
                        Last edited 2m ago
                    </span>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                        <History className="h-4 w-4" />
                    </Button>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2 bg-zinc-900/95 border-zinc-800 text-zinc-100 backdrop-blur-xl">
                            <div className="space-y-4 p-2">
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <Type className="h-3 w-3" /> Font Family
                                    </h4>
                                    <div className="grid gap-1">
                                        {FONT_OPTIONS.map((font) => (
                                            <button
                                                key={font.name}
                                                onClick={() => setFontSettings(prev => ({ ...prev, family: font.value }))}
                                                className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors flex items-center justify-between group ${fontSettings.family === font.value
                                                    ? "bg-zinc-800 text-white"
                                                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                                                    }`}
                                            >
                                                <span style={{ fontFamily: font.value }}>{font.name}</span>
                                                {fontSettings.family === font.value && <Check className="h-3 w-3 text-blue-400" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Font Size</h4>
                                    <div className="grid grid-cols-4 gap-1 bg-zinc-800/50 p-1 rounded-lg">
                                        {SIZE_OPTIONS.map((size) => (
                                            <button
                                                key={size.name}
                                                onClick={() => setFontSettings(prev => ({ ...prev, size: size.value }))}
                                                className={`h-8 flex items-center justify-center rounded transition-all text-sm font-medium ${fontSettings.size === size.value
                                                    ? "bg-zinc-700 text-white shadow-sm"
                                                    : "text-zinc-500 hover:text-zinc-300"
                                                    }`}
                                                title={size.name}
                                            >
                                                <span style={{ fontSize: indexToVisualSize(size.name) }}>A</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full px-3">
                                <HelpCircle className="h-4 w-4" />
                                <span className="hidden sm:inline">How to Use</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white text-zinc-900 border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle>How to use the Editor</DialogTitle>
                            </DialogHeader>
                            <div className="mt-2" dangerouslySetInnerHTML={{ __html: HOW_TO_USE_CONTENT }} />
                        </DialogContent>
                    </Dialog>

                    {/* Exit Confirmation Dialog */}
                    <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
                            <DialogHeader>
                                <DialogTitle>End Session?</DialogTitle>
                            </DialogHeader>
                            <div className="py-4 text-zinc-400">
                                This will discard the current session layout and return to the dashboard. The session will generally be saved if you use "Stop Session", but exiting via Back might not.
                                <br /><br />Do you want to leave?
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setShowExitDialog(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        // Clear history stack by replacing
                                        navigate("/sessions", { replace: true });
                                    }}
                                >
                                    End Session
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Download Confirmation Dialog */}
                    <Dialog open={showDownloadConfirmDialog} onOpenChange={setShowDownloadConfirmDialog}>
                        <DialogContent className="bg-[#121214] border-zinc-800 text-zinc-100 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <Check className="h-5 w-5 text-emerald-500 animate-pulse" />
                                    Session Verified & Saved!
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    Your coding session has been successfully verified and saved to the database.
                                </p>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-xs text-zinc-400 leading-normal space-y-3">
                                    <p className="font-semibold text-zinc-200">📥 Document Download started:</p>
                                    <p className="text-zinc-500">
                                        Your source code download was triggered automatically. If the download didn't start or you closed the page early, don't worry!
                                    </p>
                                    <p className="text-cyan-400 font-medium">
                                        You can always download your work later from the Verification Sessions dashboard at any time.
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                                <Button
                                    onClick={() => {
                                        setShowDownloadConfirmDialog(false);
                                        const targetId = pendingSessionData?.hashHex;
                                        setPendingSessionData(null);
                                        if (targetId) {
                                            navigate(`/certificate/${targetId}`);
                                        } else {
                                            navigate('/sessions');
                                        }
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-500/20 w-full sm:w-auto font-semibold"
                                >
                                    View Certificate
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={handleStopSession}
                        variant="destructive"
                        size="sm"
                        className="mr-2 gap-2 shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all duration-300"
                    >
                        <StopCircle className="h-4 w-4" />
                        Stop Session
                    </Button>
                    <Avatar className="h-9 w-9 ml-2 border-2 border-white/20 shadow-sm">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                </div>
            </motion.header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8">
                <div className="max-w-[1000px] mx-auto min-h-[calc(100vh-6rem)] flex flex-col justify-center">

                    {/* The Editor Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        style={{
                            "--editor-font-family": fontSettings.family,
                            "--editor-font-size": fontSettings.size,
                        } as React.CSSProperties}
                        className="bg-zinc-900 rounded-[2rem] shadow-xl border border-zinc-800 overflow-hidden flex flex-col min-h-[60vh] text-zinc-100 selection:bg-cyan-900 selection:text-white"
                    >
                        <Editor content={content} onChange={setContent} onTransaction={handleTransaction} />
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
