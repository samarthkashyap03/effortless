import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Award,
    Clock,
    Edit3,
    Copy,
    CheckCircle2,
    ShieldCheck,
    AlertTriangle,
    XCircle,
    Upload,
    FileText,
    Scan,
    ArrowRight,
    ArrowLeft,
    Loader2,
    FileCheck,
    Search,
    Lock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Types
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

    if (token) {
        return <OnlineVerification token={token} />;
    }

    return <OfflineVerificationTool />;
}

// ----------------------------------------------------------------------
// Offline Verification Tool (Professional Redesign)
// ----------------------------------------------------------------------

function OfflineVerificationTool() {
    const [documentFile, setDocumentFile] = useState<File | null>(null);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'processing' | 'success' | 'failure'>('idle');
    const [statusMessage, setStatusMessage] = useState<string>("");

    // Detailed Steps for Animation
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const steps = [
        { id: 'hash', label: "Cryptographic Hashing", icon: Lock },
        { id: 'ocr', label: "Optical Character Recognition", icon: Scan },
        { id: 'verify', label: "Logic Verification", icon: ShieldCheck },
    ];

    const [extractedHash, setExtractedHash] = useState<string | null>(null);
    const [calculatedHash, setCalculatedHash] = useState<string | null>(null);

    // Reset state when files change
    useEffect(() => {
        if (!documentFile && !certificateFile) {
            setVerificationStatus('idle');
            setCurrentStepIndex(0);
        }
    }, [documentFile, certificateFile]);

    const onDropDocument = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setDocumentFile(file);
    }, []);

    const onDropCertificate = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) setCertificateFile(file);
    }, []);

    const calculateSHA256 = async (file: File): Promise<string> => {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        // Attempt direct text extraction (better for digital PDFs)
        try {
            const textContent = await page.getTextContent();
            const directText = textContent.items.map((item: any) => item.str).join(' ');
            // If we got a reasonable amount of text, return it
            if (directText.length > 50) {
                console.log("Used direct PDF text extraction");
                return directText;
            }
        } catch (err) {
            console.warn("Direct PDF text extraction failed:", err);
        }

        // Fallback to OCR (for scanned documents)
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        if (!context) throw new Error("Canvas context not available");

        // @ts-expect-error - PDF.js types known issue
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');
        const result = await Tesseract.recognize(dataUrl, 'eng');
        return result.data.text;
    };

    const getLevenshteinDistance = (a: string, b: string): number => {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) matrix[i] = [i];
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[b.length][a.length];
    };

    const performVerification = async () => {
        if (!documentFile || !certificateFile) return;

        setVerificationStatus('processing');
        setCurrentStepIndex(0);
        setExtractedHash(null);
        setCalculatedHash(null);
        setStatusMessage("");

        try {
            // Step 1: Document Hash
            setCurrentStepIndex(0);
            await new Promise(r => setTimeout(r, 600)); // Minimum animation time
            const docHash = await calculateSHA256(documentFile);
            setCalculatedHash(docHash);

            // Step 2: OCR
            setCurrentStepIndex(1);
            let text = "";
            if (certificateFile.type === 'application/pdf') {
                text = await extractTextFromPDF(certificateFile);
            } else {
                const result = await Tesseract.recognize(certificateFile, 'eng');
                text = result.data.text;
            }

            // Step 3: Logic
            setCurrentStepIndex(2);
            await new Promise(r => setTimeout(r, 600));

            // Logic Match
            const cleanTextForKeyword = text.replace(/\s+/g, ' ').toLowerCase();
            const hasEffortless = cleanTextForKeyword.includes("effortless");

            const candidates = text.match(/[a-fA-F0-9OIlZSG]{5,}/g) || [];
            const stream1 = candidates.join('').toUpperCase()
                .replace(/O/g, '0').replace(/[Il]/g, '1').replace(/Z/g, '2').replace(/S/g, '5').replace(/G/g, '6');

            const stream2 = text.replace(/[^a-fA-F0-9]/gi, '').toUpperCase();

            const potentialHexStream = stream1 + "|||" + stream2;

            const targetHash = docHash.toUpperCase();
            let matchType: 'exact' | 'fuzzy' | 'none' = 'none';
            let bestCandidate = "";

            if (potentialHexStream.includes(targetHash)) {
                matchType = 'exact';
                bestCandidate = targetHash;
            } else {
                let bestDist = 1000;
                if (potentialHexStream.length >= 64) {
                    for (let i = 0; i <= potentialHexStream.length - 64; i++) {
                        const window = potentialHexStream.substring(i, i + 64);
                        const dist = getLevenshteinDistance(window, targetHash);
                        if (dist < bestDist) {
                            bestDist = dist;
                            bestCandidate = window;
                        }
                    }
                }
                if (bestDist <= 4) matchType = 'fuzzy';
            }

            setExtractedHash(bestCandidate || "No hash found");

            // Final Result Delay for effect
            await new Promise(r => setTimeout(r, 500));

            if (matchType !== 'none' && hasEffortless) {
                setVerificationStatus('success');
                setStatusMessage(matchType === 'fuzzy' ? "Authenticated (OCR Corrected)" : "Authenticated Successfully");
            } else {
                setVerificationStatus('failure');
                setStatusMessage(!hasEffortless
                    ? "Certificate invalid: Missing 'Effortless' security mark."
                    : "Verification Failed: Document hash mismatch.");
            }

        } catch (error: any) {
            console.error(error);
            setVerificationStatus('failure');
            setStatusMessage("Verification Error: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 font-sans relative overflow-hidden flex flex-col items-center">

            {/* Subtle Lighting */}
            <div className={`fixed inset-0 transition-opacity duration-1000 pointer-events-none ${verificationStatus === 'success' ? 'opacity-100' : 'opacity-30'}`}>
                <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${verificationStatus === 'success' ? 'bg-emerald-500/20' : 'bg-cyan-500/10'}`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] transition-colors duration-1000 ${verificationStatus === 'success' ? 'bg-emerald-500/10' : 'bg-blue-600/10'}`} />
            </div>

            <div className="w-full max-w-5xl relative z-10 px-6 py-12 flex flex-col items-center">

                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16 relative w-full"
                >
                    <a href="/verify-guide" className="absolute left-0 top-0 p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </a>

                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 mb-6 backdrop-blur-sm">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-medium text-zinc-300 tracking-wide">Client-Side Verification</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Verify Authenticity
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-xl mx-auto leading-relaxed">
                        Independently validate Effortless certificates by comparing them with your original work. Zero data upload.
                    </p>
                </motion.div>

                {/* Main Interaction Area */}
                <div className="w-full grid lg:grid-cols-2 gap-6 mb-12">
                    {/* Document Input */}
                    <DropZone
                        title="Original Document"
                        subtitle="Drag PDF, DOCX, or Code"
                        icon={FileText}
                        file={documentFile}
                        setFile={setDocumentFile}
                        onDrop={onDropDocument}
                        color="cyan"
                    />

                    {/* Certificate Input */}
                    <DropZone
                        title="Effortless Certificate"
                        subtitle="Drag Certificate PDF or Image"
                        icon={Award}
                        file={certificateFile}
                        setFile={setCertificateFile}
                        onDrop={onDropCertificate}
                        color="purple"
                    />
                </div>

                {/* Action Area */}
                <div className="w-full flex flex-col items-center justify-center min-h-[120px]">
                    <AnimatePresence mode="wait">
                        {verificationStatus === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <Button
                                    size="lg"
                                    onClick={performVerification}
                                    disabled={!documentFile || !certificateFile}
                                    className="px-10 h-14 text-lg rounded-full bg-white text-black hover:bg-zinc-200 transition-all font-medium disabled:opacity-30 disabled:hover:bg-white"
                                >
                                    Start Verification
                                </Button>
                                {(!documentFile || !certificateFile) && (
                                    <p className="text-zinc-500 text-sm mt-4 animate-pulse">Upload both files to begin</p>
                                )}
                            </motion.div>
                        )}

                        {verificationStatus === 'processing' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full max-w-md bg-zinc-900/80 backdrop-blur border border-white/10 rounded-2xl p-6"
                            >
                                <div className="space-y-4">
                                    {steps.map((step, idx) => {
                                        const isActive = idx === currentStepIndex;
                                        const isDone = idx < currentStepIndex;

                                        return (
                                            <div key={step.id} className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-500
                                                    ${isActive ? 'border-cyan-500 text-cyan-500 bg-cyan-500/10 scale-110 shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]' :
                                                        isDone ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' :
                                                            'border-zinc-800 text-zinc-600 bg-zinc-900'}`}>
                                                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                                                </div>
                                                <span className={`text-sm font-medium transition-colors duration-300 ${isActive ? 'text-white' : isDone ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                                    {step.label}
                                                </span>
                                                {isActive && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin ml-auto" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {verificationStatus === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="relative w-full max-w-lg bg-[#0A0F0C] border border-emerald-500/30 rounded-2xl p-8 overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />

                                <div className="flex flex-col items-center text-center relative z-10">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring" }}
                                        className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]"
                                    >
                                        <CheckCircle2 className="w-10 h-10 text-black p-0.5" />
                                    </motion.div>

                                    <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Verified Authentic</h3>
                                    <p className="text-emerald-400/80 text-sm mb-6">{statusMessage}</p>

                                    <div className="w-full bg-black/40 rounded-lg p-4 border border-emerald-500/20 text-left">
                                        <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider mb-2">Cryptographic Match</p>
                                        <div className="font-mono text-xs text-emerald-400 break-all leading-relaxed opacity-80">
                                            {extractedHash}
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-3">
                                        <Button variant="outline" onClick={() => { setVerificationStatus('idle'); setDocumentFile(null); setCertificateFile(null); }} className="border-white/10 hover:bg-white/5">
                                            Verify Another
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {verificationStatus === 'failure' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                className="relative w-full max-w-2xl bg-[#0F0505] border border-red-500/30 rounded-2xl p-8 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-red-500/5" />

                                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                                    <div className="flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20 text-red-500">
                                            <XCircle className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-1">Verification Failed</h3>
                                        <p className="text-red-400 text-sm mb-4">{statusMessage}</p>
                                        <Button variant="ghost" onClick={() => setVerificationStatus('idle')} className="text-zinc-400 hover:text-white pl-0">
                                            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Try Again
                                        </Button>
                                    </div>

                                    <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 text-xs font-mono">
                                        <div className="mb-4">
                                            <span className="text-zinc-500 block mb-1 uppercase tracking-wider text-[10px]">Document Hash (Calculated)</span>
                                            <span className="text-cyan-400 block break-all leading-tight select-all">
                                                {calculatedHash}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-zinc-500 block mb-1 uppercase tracking-wider text-[10px]">Certificate Hash (Extracted)</span>
                                            {extractedHash ? (
                                                <span className="text-red-400 block break-all leading-tight select-all">
                                                    {extractedHash}
                                                </span>
                                            ) : (
                                                <span className="text-zinc-600 italic">
                                                    Could not find a valid hash pattern in the certificate file.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>

            </div>
        </div>
    );
}

// Sub-component: Professional Drop Zone
function DropZone({
    title, subtitle, icon: Icon, file, setFile, onDrop, color
}: {
    title: string, subtitle: string, icon: any, file: File | null, setFile: (f: File | null) => void, onDrop: (e: React.DragEvent) => void, color: 'cyan' | 'purple'
}) {
    const [isDragging, setIsDragging] = useState(false);
    const borderColor = color === 'cyan' ? 'group-hover:border-cyan-500/50' : 'group-hover:border-purple-500/50';
    const bgColor = color === 'cyan' ? 'group-hover:bg-cyan-500/5' : 'group-hover:bg-purple-500/5';
    const iconColor = color === 'cyan' ? 'text-cyan-400' : 'text-purple-400';

    return (
        <div
            className={`relative group cursor-pointer border border-white/10 bg-zinc-900/40 backdrop-blur-sm rounded-2xl h-[280px] transition-all duration-500
                ${isDragging ? `scale-[1.02] border-${color}-500 bg-${color}-500/10` : 'hover:bg-zinc-900/60'}
                ${file ? `border-${color}-500/30 bg-${color}-500/5` : errorCheckingBorder(borderColor)}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { setIsDragging(false); onDrop(e); }}
            onClick={() => !file && document.getElementById(`file-${color}`)?.click()}
        >
            <input
                id={`file-${color}`}
                type="file"
                className="hidden"
                accept={color === 'cyan' ? undefined : ".pdf, .png, .jpg, .jpeg"}
                onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />

            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                <AnimatePresence mode="wait">
                    {!file ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="flex flex-col items-center"
                        >
                            <div className={`w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 transition-all duration-500 ${isDragging ? 'scale-110 rotate-3' : 'group-hover:scale-105'}`}>
                                <Icon className={`w-8 h-8 text-zinc-400 group-hover:${iconColor} transition-colors duration-500`} />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
                            <p className="text-sm text-zinc-500">{subtitle}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="filled"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center w-full"
                        >
                            <div className={`w-20 h-20 rounded-full ${color === 'cyan' ? 'bg-cyan-500/20' : 'bg-purple-500/20'} flex items-center justify-center mb-6 relative`}>
                                <div className={`absolute inset-0 rounded-full ${color === 'cyan' ? 'bg-cyan-500' : 'bg-purple-500'} blur-xl opacity-20 animate-pulse`} />
                                <FileCheck className={`w-10 h-10 ${iconColor}`} />
                            </div>
                            <p className="text-lg font-medium text-white truncate w-full px-8">{file.name}</p>
                            <p className="text-xs text-zinc-500 mt-1 mb-6">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-red-400 hover:bg-red-950/30 hover:text-red-300">
                                Remove File
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function errorCheckingBorder(cls: string) {
    // Helper to allow dynamic class in template, actual Tailwind usage handles simpler
    // Just a placeholder to keep code clean in the snippet above
    return cls;
}


// ----------------------------------------------------------------------
// Online Verification Logic (Existing - Preserved)
// ----------------------------------------------------------------------

function OnlineVerification({ token }: { token: string }) {
    // (Previous OnlineVerification code remains exactly the same for public links)
    // To save space in this response, I'm assuming we keep the existing OnlineVerification component
    // If you need me to reprint it, I can, but typically we just verify the route logic

    // ... Copying the exact existing OnlineVerification component from previous active file ...
    // For the sake of this file replace, I will paste the FULL original OnlineVerification content below to ensure the file is complete.

    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReport = async () => {
            try {
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
        if (score >= 80) return { band: 'HIGH CONFIDENCE', color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200', icon: CheckCircle2 };
        if (score >= 50) return { band: 'MODERATE CONFIDENCE', color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200', icon: AlertTriangle };
        return { band: 'LOW CONFIDENCE', color: 'text-rose-700', bgColor: 'bg-rose-50', borderColor: 'border-rose-200', icon: AlertTriangle };
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
                    <Button onClick={() => window.location.href = '/'} variant="outline">Go to Home</Button>
                </div>
            </div>
        );
    }

    // Extract data
    const reportDetails = report.report_data || {} as { score?: number; metrics?: any };
    const metrics = reportDetails.metrics || {};
    const score = reportDetails.score ?? 0;
    const sessionInfo = report.sessions || { started_at: report.created_at, total_duration_ms: 0, active_time_ms: 0, idle_time_ms: 0 };
    const { band, color: scoreColor, bgColor, borderColor } = getScoreBand(score);
    const pasteDensity = metrics.output_len > 0 ? (metrics.paste_total_len || 0) / metrics.output_len : 0;
    const getPasteColor = (density: number): string => {
        if (density < 0.2) return 'text-emerald-700';
        if (density <= 0.5) return 'text-amber-700';
        return 'text-rose-700';
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 selection:bg-cyan-500/30 font-sans relative overflow-hidden flex flex-col items-center">
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>
            <div className="w-full max-w-[210mm] relative z-10 flex flex-col">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/80 backdrop-blur-md border border-white/10 text-white p-4 rounded-t-2xl flex items-center justify-between mb-0 shadow-2xl relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]">E</div>
                        <div><p className="text-sm font-bold tracking-tight">Effortless Verification</p><p className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">Public Record</p></div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 mb-1 justify-end"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Live</span></div>
                        <p className="text-xs font-mono bg-black/40 border border-white/5 px-2 py-1 rounded text-zinc-300">{token?.slice(0, 16)}...</p>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#121215] text-white shadow-2xl shadow-black/80 rounded-b-2xl overflow-hidden flex flex-col border border-white/5 border-t-0 ring-1 ring-white/5" style={{ minHeight: '800px' }}>
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shrink-0 opacity-50" />
                    <div className="p-10 flex-1 flex flex-col relative z-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-opacity-5">
                        <div className="text-center mb-16 mt-6">
                            <h1 className="text-4xl md:text-5xl font-serif font-medium text-white mb-4 tracking-tight relative inline-block">Certificate of Authenticity<div className="absolute inset-0 bg-white/5 blur-2xl -z-10 rounded-full" /></h1>
                            <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed border-t border-white/5 pt-4 mt-2">This document certifies the behavioral patterns recorded during the creation of the work associated with this token.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 flex-1">
                            <div className="md:col-span-7 space-y-10">
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Analysis Result</h3>
                                    <div className={`p-6 rounded-xl border ${borderColor.replace('border-', 'border-opacity-30 border-')} ${bgColor.replace('bg-', 'bg-opacity-10 bg-')} backdrop-blur-sm`}>
                                        <div className="flex items-center gap-3 mb-2"><ShieldCheck className={`w-5 h-5 ${scoreColor}`} /><span className={`text-xs font-bold ${scoreColor} tracking-wider`}>{band}</span></div>
                                        <p className={`text-sm ${scoreColor} leading-relaxed font-medium opacity-90`}>Score: {score} / 100</p>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-serif font-medium text-white mb-6 border-b border-white/5 pb-2">Recorded Evidence</h2>
                                    <div className="space-y-8">
                                        <div className="pb-6 border-b border-white/5">
                                            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Copy className="h-4 w-4 text-cyan-500/70" />Content Origin</h3>
                                            <div className="pl-6 space-y-3">
                                                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5"><span className="text-zinc-400 font-medium text-sm">Pasted Content</span><div className="flex items-center gap-3"><span className={`font-mono font-bold ${getPasteColor(pasteDensity)}`}>{formatPercentage(pasteDensity)}</span></div></div>
                                                <p className="text-xs text-zinc-500 pl-1">{pasteDensity < 0.2 ? 'High originality detected.' : 'Significant external content detected.'}</p>
                                            </div>
                                        </div>
                                        <div className="pb-6 border-b border-white/5">
                                            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Clock className="h-4 w-4 text-cyan-500/70" />Session Activity</h3>
                                            <div className="pl-6 grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5"><p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Total Duration</p><p className="font-mono font-medium text-white">{formatDuration(sessionInfo.total_duration_ms)}</p></div>
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5"><p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Active Typing</p><p className="font-mono font-medium text-white">{formatDuration(sessionInfo.active_time_ms)}</p></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-semibold text-zinc-300 mb-4 flex items-center gap-2"><Edit3 className="h-4 w-4 text-cyan-500/70" />Effort Metrics</h3>
                                            <div className="pl-6 grid grid-cols-2 gap-4 text-sm">
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5"><p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Keystrokes</p><p className="font-mono font-medium text-white">{metrics.keystroke_count || 0}</p></div>
                                                <div className="p-3 rounded-lg bg-white/5 border border-white/5"><p className="text-zinc-500 text-[10px] uppercase tracking-wide mb-1">Deletions</p><p className="font-mono font-medium text-white">{metrics.delete_count || 0}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-5 flex flex-col items-center justify-start pt-8 border-l border-white/5 pl-8">
                                <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                    <div className={`absolute inset-0 rounded-full border-4 ${borderColor.replace('border-', 'border-opacity-20 border-')} opacity-30`} />
                                    <div className={`absolute inset-4 rounded-full border border-dashed ${borderColor.replace('border-', 'border-opacity-40 border-')} opacity-50 animate-spin-slow`} />
                                    <div className="flex flex-col items-center justify-center text-center z-10 p-4"><Award className={`w-12 h-12 ${scoreColor} mb-2 drop-shadow-lg`} /><span className={`text-5xl font-bold ${scoreColor} font-serif tracking-tighter drop-shadow-2xl`}>{score}</span></div>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Verified Timestamp</p>
                                    <p className="text-sm font-mono text-cyan-100/80 bg-cyan-900/20 px-3 py-1 rounded border border-cyan-500/20 inline-block">{new Date(report.created_at || sessionInfo.started_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-auto pt-10 border-t border-white/5 flex justify-center">
                            <div className="flex items-center gap-2 opacity-40 hover:opacity-80 transition-opacity"><span className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center text-white text-[9px] font-bold">E</span><span className="text-xs font-bold text-zinc-500 tracking-tight">Verified by Effortless</span></div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
