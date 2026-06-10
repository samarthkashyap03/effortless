import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, MoreHorizontal, History, ChevronDown, Check, Pencil, StopCircle, HelpCircle, Settings, Type } from "lucide-react";
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
import { SessionOnboarding } from "@/components/session/SessionOnboarding";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import html2pdf from 'html2pdf.js';

const FONT_OPTIONS = [
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Times New Roman", value: "'Times New Roman', serif" },
    { name: "Calibri", value: "Calibri, sans-serif" },
    { name: "Courier", value: "'Courier New', monospace" },
];

const SIZE_OPTIONS = [
    { name: "Small", value: "15px" },
    { name: "Medium", value: "17px" },
    { name: "Large", value: "19px" },
    { name: "Extra Large", value: "21px" },
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
    <div class="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
        <h3 class="font-bold flex items-center gap-2 mb-2 text-blue-900">👋 Welcome to Effortless Editor</h3>
        <p class="text-sm text-blue-800">A distraction-free writing environment designed for flow.</p>
    </div>
    
    <div class="grid gap-4">
        <div class="feature-card p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <strong class="block mb-1 text-zinc-900">⚡ Slash Commands</strong>
            <p class="text-sm text-zinc-600">Type <code class="bg-zinc-200 px-1 py-0.5 rounded text-xs">/</code> to insert headings, lists, images, and more.</p>
        </div>
        
        <div class="feature-card p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <strong class="block mb-1 text-zinc-900">✨ Rich Formatting</strong>
            <p class="text-sm text-zinc-600">Select text to bold, italicize, or add links via the bubble menu.</p>
        </div>

        <div class="feature-card p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <strong class="block mb-1 text-zinc-900">🎨 Customization</strong>
            <p class="text-sm text-zinc-600">Use the Appearance menu to change fonts and sizes to your liking.</p>
        </div>
    </div>
</div>
`;

export default function WritingSession() {
    const navigate = useNavigate();
    const [title, setTitle] = useState(() => {
        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        return `Writing Session — ${dateStr}, ${timeStr}`;
    });
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
    const [editorWidth, setEditorWidth] = useState(720);
    const [isResizing, setIsResizing] = useState(false);
    const { toast } = useToast();

    // Tracking SDK
    const isPasteEventRef = useRef(false);
    const trackingRef = useRef<TrackingSDK | null>(null);
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(true);
    const [showDownloadConfirmDialog, setShowDownloadConfirmDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingSessionData, setPendingSessionData] = useState<{
        payload: unknown;
        scoreResult: unknown;
        hashHex: string;
    } | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            // Calculate new width: 2 * (x - center) for symmetric resizing or just based on movement
            // Let's do simple right-side resizing for now, but centered layout requires math
            // Since the container is centered, dragging the right edge increases width from center.
            // Distance from center of screen to mouse X * 2 = width
            const centerX = window.innerWidth / 2;
            const distFromCenter = Math.abs(e.clientX - centerX);
            const newWidth = Math.max(400, Math.min(1200, distFromCenter * 2));
            setEditorWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'ew-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

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

        // Analyze transaction steps
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transaction.steps.forEach((step: any) => {
            // Use Tiptap/Prosemirror ReplaceStep properties directly
            // standard ReplaceStep has .from, .to, and .slice
            // We check for .slice to confirm it's a replacement/insertion
            if (step.slice) {
                const insertedLen = step.slice.content ? step.slice.content.size : 0;
                const deletedLen = step.to - step.from;

                if (deletedLen > 0) {
                    trackingRef.current?.trackDelete(deletedLen, step.from);
                }

                if (insertedLen > 0) {
                    // Use flag from Tiptap onPaste event
                    if (isPasteEventRef.current) {
                        trackingRef.current?.trackPaste("x".repeat(insertedLen), step.from);
                    } else {
                        // Single character typing
                        trackingRef.current?.trackTyping(1);

                        // Check for word boundary (space, newline, or punctuation)
                        // We need to extract the text content from the slice
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

        // Reset paste flag at end of transaction processing
        isPasteEventRef.current = false;
    };

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
        const saved = localStorage.getItem("effortless_writing_draft");
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
                        description: "Your previous unsaved writing draft has been automatically restored.",
                    });
                }
            } catch (e) {
                console.error("Failed to parse saved draft:", e);
            }
        }
    }, [draftLoaded, toast]);

    useEffect(() => {
        if (content && content !== "<p></p>" && content !== HOW_TO_USE_CONTENT) {
            localStorage.setItem("effortless_writing_draft", JSON.stringify({ title, content }));
        }
    }, [title, content]);

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };

    const handleStopSession = async () => {
        try {
            if (!trackingRef.current) return;
            setIsSaving(true);

            const payload = trackingRef.current.getSessionPayload();
            const { calculateScore } = await import("@/lib/scoring");
            const scoreResult = calculateScore(payload);

            // --- PDF Generation ---
            const element = document.getElementById('editor-content');
            if (!element) throw new Error("Editor content not found");

            const pdfFilename = `${title.trim() || 'Effortless_Session'}.pdf`;
            const opt = {
                margin: 10,
                filename: pdfFilename,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            // Generate PDF Blob
            const pdfBlob = await html2pdf().set(opt).from(element).output('blob');

            // Compute Hash of PDF binary blob
            const pdfBuffer = await pdfBlob.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest('SHA-256', pdfBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Convert PDF blob to base64 for dashboard download persistence
            const pdfBase64 = await blobToBase64(pdfBlob);
            // @ts-ignore
            payload.pdf_base64 = pdfBase64;

            // Trigger Download automatically
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = pdfFilename;
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
                session_type: 'writing',
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
                title: title.trim() || "Untitled Document",
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

                // Clear local draft
                localStorage.removeItem("effortless_writing_draft");

                // Show completion dialog with redirection option
                setPendingSessionData({ payload, scoreResult, hashHex: sessionData.id }); // Reuse hashHex field temporarily to store ID
                setShowDownloadConfirmDialog(true);
            } else {
                throw new Error("No session data returned after insert");
            }

        } catch (error) {
            console.error('Error initiating session end:', error);
            const err = error as Error;
            toast({
                variant: 'destructive',
                title: "Error Ending Session",
                description: err.message || "Unknown error occurred",
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
        <div className="min-h-screen bg-[#0A0A0B] relative flex flex-col font-sans overflow-hidden selection:bg-cyan-500/30">

            {/* Onboarding Overlay */}
            <AnimatePresence>
                {showOnboarding && (
                    <SessionOnboarding onComplete={() => setShowOnboarding(false)} />
                )}
            </AnimatePresence>

            {/* Ambient Background Effects - INCREASED OPACITY */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/30 rounded-full blur-[120px] mix-blend-screen opacity-50 animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[100px] mix-blend-screen opacity-40 animate-pulse-slow delay-1000" />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] mix-blend-screen opacity-30 animate-pulse-slow delay-500" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            {/* Header / Top Bar */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="h-14 px-6 fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-300 hover:bg-black/40 hover:backdrop-blur-md"
            >
                {/* Left Action - DISABLED FADE */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setShowExitDialog(true)} className="text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 bg-zinc-900/80 ring-1 ring-white/10 rounded-full px-3 py-1">
                            <Input
                                ref={titleInputRef}
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                onKeyDown={handleTitleKeyDown}
                                onBlur={handleTitleSave}
                                className="h-6 bg-transparent border-none text-zinc-200 text-sm font-medium placeholder:text-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0 w-48 p-0"
                                placeholder="Document name..."
                                maxLength={100}
                            />
                            <button
                                onClick={handleTitleSave}
                                className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            >
                                <Check className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleTitleEdit}
                            className="flex items-center gap-2 cursor-pointer hover:bg-zinc-800/50 px-3 py-1.5 rounded-full transition-all text-zinc-400 hover:text-zinc-100 group/title overflow-hidden max-w-[150px] sm:max-w-xs"
                        >
                            <span className="font-medium text-sm tracking-wide truncate">{title}</span>
                            <Pencil className="h-3 w-3 text-zinc-600 group-hover/title:text-zinc-400 transition-colors opacity-0 group-hover/title:opacity-100 shrink-0" />
                        </button>
                    )}
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1">
                    {/* Reassuring Verification Badge */}
                    <button
                        onClick={() => toast({
                            title: "Verification Active",
                            description: "Don't worry! Your writing behavior is being verified, content is never stored.",
                            className: "bg-emerald-950/90 border-emerald-500/50 text-emerald-50 pointer-events-none"
                        })}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mr-4 shadow-[0_0_10px_-4px_rgba(16,185,129,0.3)] backdrop-blur-sm hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </div>
                        <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                            Verification Active
                        </span>
                    </button>

                    <span className="text-[10px] uppercase tracking-widest text-zinc-600 mr-4 hidden sm:inline-block font-medium">
                        {wordCount} Words
                    </span>



                    <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                        <DialogTrigger asChild>
                            <Button
                                size="sm"
                                className="ml-4 h-8 px-4 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 transition-all duration-300 shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.5)]"
                            >
                                <StopCircle className="h-3.5 w-3.5 mr-2" />
                                <span className="text-xs font-semibold">End Session</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#121214] border-zinc-800 text-zinc-100 sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <StopCircle className="h-5 w-5 text-red-500" />
                                    End Writing Session?
                                </DialogTitle>
                            </DialogHeader>

                            <div className="py-4 space-y-4">
                                <p className="text-zinc-400 text-sm leading-relaxed">
                                    What happens next:
                                </p>

                                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">Verification report generated</p>
                                            <p className="text-xs text-zinc-500 mt-1">We’ll create a report based on how you wrote — not what you wrote.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">Download your work now</p>
                                            <p className="text-xs text-zinc-500 mt-1">Your content is not stored. You must download the PDF now or it will be lost.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">Your content stays private</p>
                                            <p className="text-xs text-zinc-500 mt-1">Your text is never stored. Only anonymous timing and editing patterns are used.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowExitDialog(false)}
                                    className="text-zinc-400 hover:text-white hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={() => {
                                        setShowExitDialog(false);
                                        handleStopSession();
                                    }}
                                    className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg shadow-red-500/20"
                                >
                                    End Session & Verify
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
                                    Your writing session has been successfully verified and saved to the database.
                                </p>
                                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-xs text-zinc-400 leading-normal space-y-3">
                                    <p className="font-semibold text-zinc-200">📥 Document Download started:</p>
                                    <p className="text-zinc-500">
                                        Your PDF download was triggered automatically. If the download didn't start or you closed the page early, don't worry!
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
                </div>
            </motion.header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 z-10 relative">
                <div className="w-full flex justify-center items-start min-h-[calc(100vh-6rem)] pt-20 pb-32">
                    {/* The Editor Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                         style={{
                             width: "100%",
                             maxWidth: `${editorWidth}px`,
                             "--editor-font-family": fontSettings.family,
                             "--editor-font-size": fontSettings.size,
                         } as React.CSSProperties}
                         className="relative bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 ring-1 ring-zinc-900/5 flex flex-col min-h-[400px] text-zinc-900 selection:bg-cyan-100 selection:text-cyan-900 group/editor transition-all duration-300 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]"
                     >
                         {/* Top reflection glow */}
                         <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50" />
 
                         {/* Editor Header / Top padding is handled by Editor component layout usually, ensuring rounded corners */}
                         <div className="flex-1 flex flex-col overflow-hidden rounded-[2rem] bg-white">
                             <Editor
                                 content={content}
                                 onChange={setContent}
                                 onTransaction={handleTransaction}
                                 fontFamily={fontSettings.family}
                                 onFontChange={(font) => setFontSettings(prev => ({ ...prev, family: font }))}
                                 fontSize={fontSettings.size}
                                 onFontSizeChange={(size) => setFontSettings(prev => ({ ...prev, size: size }))}
                                 onPaste={() => {
                                     isPasteEventRef.current = true;
                                 }}
                             />
                         </div>
 
                         {/* Resize Handles */}
                         <div
                             className="absolute top-10 bottom-10 -right-6 w-8 cursor-ew-resize hidden md:flex items-center justify-center opacity-0 group-hover/editor:opacity-100 transition-opacity duration-300"
                             onMouseDown={(e) => {
                                 e.preventDefault();
                                 setIsResizing(true);
                             }}
                         >
                             <div className="w-1.5 h-16 rounded-full bg-zinc-600/20 backdrop-blur-sm border border-white/10 hover:bg-cyan-500/50 transition-colors shadow-lg" />
                         </div>
                         <div
                             className="absolute top-10 bottom-10 -left-6 w-8 cursor-ew-resize hidden md:flex items-center justify-center opacity-0 group-hover/editor:opacity-100 transition-opacity duration-300"
                             onMouseDown={(e) => {
                                 e.preventDefault();
                                 setIsResizing(true);
                             }}
                         >
                             <div className="w-1.5 h-16 rounded-full bg-zinc-600/20 backdrop-blur-sm border border-white/10 hover:bg-cyan-500/50 transition-colors shadow-lg" />
                         </div>
                     </motion.div>
                </div>
            </main>
        </div>
    );
}
