// --- EFFORTLESS HARDENED TRACKING SDK ---

export interface PauseHistogram {
    lt250: number;
    ms250_1000: number;
    s1_5?: number;
    s1_2?: number;
    s2_5?: number;
    s5_30: number;
    gt30: number;
}

export interface PasteRange {
    start: number;
    end: number;
}

export interface PasteEvent {
    t: number;
    start: number;
    end: number;
    len: number;
}

export interface FinalPayload {
    session_id: string;
    duration_ms: number;
    output_len: number;
    output_hash_sha256?: string;

    active_ms_total: number;
    focus_ms_total: number;
    away_ms_total: number;
    blur_ms_total: number; // Required by section 2 update
    tab_switch_count: number;
    longest_away_ms: number;

    keystroke_count: number;
    typed_char_count: number;
    delete_count: number;

    pause_hist: PauseHistogram;
    inter_word_gap_hist: PauseHistogram;

    paste_count: number;
    paste_total_len: number;
    paste_max_len: number;

    paste_ranges: PasteRange[];
    paste_events: PasteEvent[];
    typing_bursts: null;

    final_text?: string;
}

export class TrackingSDK {
    private sessionId: string;
    private startT: number;

    // Activity
    private activeWindowEnd: number = 0;
    private activeMsTotal: number = 0;
    private readonly ACTIVITY_WINDOW = 5000;

    // Focus Tracking (Hardened StateMachine)
    private focusStartT: number | null = null;
    private awayStartT: number | null = null;
    private focusMsTotal: number = 0;
    private awayMsTotal: number = 0;
    private longestAwayMs: number = 0;
    private tabSwitchCount: number = 0;

    // Input Stats
    private keystrokeCount: number = 0;
    private typedCharCount: number = 0;
    private deleteCount: number = 0;

    // Pauses
    private lastKeyT: number = 0;
    private pauseHist: PauseHistogram = { lt250: 0, ms250_1000: 0, s1_5: 0, s5_30: 0, gt30: 0 };

    // Inter-word
    private lastWordBoundaryT: number = 0;
    private currentWordTypedChars: number = 0;
    private interWordGapHist: PauseHistogram = { lt250: 0, ms250_1000: 0, s1_2: 0, s2_5: 0, s5_30: 0, gt30: 0 };

    // Paste
    private pasteCount: number = 0;
    private pasteTotalLen: number = 0;
    private pasteMaxLen: number = 0;
    private pasteRanges: PasteRange[] = [];
    private pasteEvents: PasteEvent[] = [];

    private finalText: string = "";

    constructor(sessionId: string) {
        this.sessionId = sessionId;
        this.startT = performance.now();

        // Exact state start from instructions
        // focus_start_t = 0
        // away_start_t = null
        this.focusStartT = 0;
        this.awayStartT = null;

        this.bindEvents();
    }

    private bindEvents() {
        window.addEventListener('focus', this.handleFocusEvent);
        window.addEventListener('blur', this.handleAwayEvent);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }

    public cleanup() {
        window.removeEventListener('focus', this.handleFocusEvent);
        window.removeEventListener('blur', this.handleAwayEvent);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        this.closeOpenSegments();
    }

    private getRelativeTime() {
        return performance.now() - this.startT;
    }

    // --- SECTION 3: REVISED ACTIVE TIME ---
    private logActivity() {
        const t = this.getRelativeTime();
        if (t > this.activeWindowEnd) {
            this.activeMsTotal += this.ACTIVITY_WINDOW;
            this.activeWindowEnd = t + this.ACTIVITY_WINDOW;
        } else if (t + this.ACTIVITY_WINDOW > this.activeWindowEnd) {
            this.activeMsTotal += (t + this.ACTIVITY_WINDOW - this.activeWindowEnd);
            this.activeWindowEnd = t + this.ACTIVITY_WINDOW;
        }
    }

    // --- SECTION 2: HARDENED FOCUS / AWAY LOGIC ---

    private handleFocusEvent = () => {
        const t = this.getRelativeTime();
        // On window.focus OR document.visibilityState === "visible"
        if (document.visibilityState === "visible") {
            if (this.awayStartT !== null) {
                const segment = Math.max(0, t - this.awayStartT);
                this.awayMsTotal += segment;
                this.longestAwayMs = Math.max(this.longestAwayMs, segment);
                this.awayStartT = null;
            }
            if (this.focusStartT === null) {
                this.focusStartT = t;
            }
        }
    };

    private handleAwayEvent = () => {
        const t = this.getRelativeTime();
        // On window.blur OR document.visibilityState === "hidden"
        if (this.focusStartT !== null) {
            this.focusMsTotal += Math.max(0, t - this.focusStartT);
            this.focusStartT = null;
        }
        if (this.awayStartT === null) {
            this.awayStartT = t;
        }
    };

    private handleVisibilityChange = () => {
        const t = this.getRelativeTime();
        if (document.visibilityState === "hidden") {
            this.tabSwitchCount++; // Section 3: only hidden
            this.handleAwayEvent();
        } else {
            this.handleFocusEvent();
        }
    };

    private closeOpenSegments() {
        const t = this.getRelativeTime();
        if (this.focusStartT !== null) {
            this.focusMsTotal += Math.max(0, t - this.focusStartT);
            this.focusStartT = null;
        }
        if (this.awayStartT !== null) {
            const segment = Math.max(0, t - this.awayStartT);
            this.awayMsTotal += segment;
            this.longestAwayMs = Math.max(this.longestAwayMs, segment);
            this.awayStartT = null;
        }
    }

    // --- Input Handling ---

    public trackTyping(charCount: number = 1) {
        this.logActivity();
        const t = this.getRelativeTime();

        this.keystrokeCount++;
        this.typedCharCount += charCount;

        if (this.lastKeyT > 0) {
            const gap = t - this.lastKeyT;
            this.bucketKeyPause(gap, this.pauseHist);
        }
        this.lastKeyT = t;
        this.currentWordTypedChars += charCount;
    }

    public trackWordBoundary() {
        if (this.currentWordTypedChars > 0) {
            const t = this.getRelativeTime();
            if (this.lastWordBoundaryT > 0) {
                const gap = t - this.lastWordBoundaryT;
                this.bucketWordGap(gap, this.interWordGapHist);
            }
            this.lastWordBoundaryT = t;
            this.currentWordTypedChars = 0;
        }
    }

    public trackDelete(count: number, startPos: number) {
        this.logActivity();
        this.keystrokeCount++;
        this.deleteCount += count;

        const endPos = startPos + count;
        const newRanges: PasteRange[] = [];

        for (const r of this.pasteRanges) {
            let newStart = r.start;
            let newEnd = r.end;

            if (r.start >= endPos) newStart = r.start - count;
            else if (r.start > startPos) newStart = startPos;

            if (r.end >= endPos) newEnd = r.end - count;
            else if (r.end > startPos) newEnd = startPos;

            if (newEnd > newStart) {
                newRanges.push({ start: newStart, end: newEnd });
            }
        }
        this.pasteRanges = this.mergeRanges(newRanges);
    }

    public trackPaste(content: string, startPos: number) {
        this.logActivity();
        const len = content.length;
        this.pasteCount++;
        this.pasteTotalLen += len;
        this.pasteMaxLen = Math.max(this.pasteMaxLen, len);

        const t = this.getRelativeTime();
        const endPos = startPos + len;

        this.pasteEvents.push({ t, start: startPos, end: endPos, len });

        for (const r of this.pasteRanges) {
            if (r.start >= startPos) r.start += len;
            if (r.end > startPos) r.end += len;
        }

        this.pasteRanges.push({ start: startPos, end: endPos });
        this.pasteRanges = this.mergeRanges(this.pasteRanges);
    }

    public setFinalText(text: string) {
        this.finalText = text;
    }

    private bucketKeyPause(gapMs: number, hist: PauseHistogram) {
        if (gapMs < 250) hist.lt250++;
        else if (gapMs < 1000) hist.ms250_1000++;
        else if (gapMs < 5000) hist.s1_5 = (hist.s1_5 || 0) + 1;
        else if (gapMs < 30000) hist.s5_30++;
        else hist.gt30++;
    }

    private bucketWordGap(gapMs: number, hist: PauseHistogram) {
        if (gapMs < 1000) {
            if (gapMs < 250) hist.lt250++;
            else hist.ms250_1000++;
        }
        else if (gapMs < 2000) hist.s1_2 = (hist.s1_2 || 0) + 1;
        else if (gapMs < 5000) hist.s2_5 = (hist.s2_5 || 0) + 1;
        else if (gapMs < 30000) hist.s5_30++;
        else hist.gt30++;
    }

    private mergeRanges(ranges: PasteRange[]): PasteRange[] {
        if (ranges.length === 0) return [];
        ranges.sort((a, b) => a.start - b.start);
        const merged: PasteRange[] = [];
        let current = ranges[0];
        for (let i = 1; i < ranges.length; i++) {
            const next = ranges[i];
            if (next.start <= current.end) current.end = Math.max(current.end, next.end);
            else { merged.push(current); current = next; }
        }
        merged.push(current);
        return merged;
    }

    public getSessionPayload(): FinalPayload {
        this.cleanup();
        const duration = this.getRelativeTime();

        // --- SECTION 1: HARD TIME INVARIANTS ---
        this.focusMsTotal = Math.max(0, this.focusMsTotal);
        this.awayMsTotal = Math.max(0, this.awayMsTotal);

        if (this.focusMsTotal + this.awayMsTotal > duration) {
            this.focusMsTotal = Math.max(0, duration - this.awayMsTotal);
        } else if (this.focusMsTotal + this.awayMsTotal < duration && duration > 0) {
            // Reconcile remaining time to focus
            const diff = duration - (this.focusMsTotal + this.awayMsTotal);
            this.focusMsTotal += diff;
        }

        // Active Time Clamp
        this.activeMsTotal = Math.max(0, Math.min(this.activeMsTotal, duration));

        return {
            session_id: this.sessionId,
            duration_ms: duration,
            output_len: this.finalText.length,

            active_ms_total: this.activeMsTotal,
            focus_ms_total: this.focusMsTotal,
            away_ms_total: this.awayMsTotal,
            blur_ms_total: this.awayMsTotal, // Blur equals away

            tab_switch_count: this.tabSwitchCount,
            longest_away_ms: this.longestAwayMs,

            keystroke_count: this.keystrokeCount,
            typed_char_count: this.typedCharCount,
            delete_count: this.deleteCount,

            pause_hist: this.pauseHist,
            inter_word_gap_hist: this.interWordGapHist,

            paste_count: this.pasteCount,
            paste_total_len: this.pasteRanges.reduce((acc, r) => acc + (r.end - r.start), 0),
            paste_max_len: this.pasteMaxLen,

            paste_ranges: this.pasteRanges,
            paste_events: this.pasteEvents,
            typing_bursts: null,

            final_text: this.finalText
        };
    }
}
