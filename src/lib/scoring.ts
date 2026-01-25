import { FinalPayload } from './tracking';

export interface ScoreResult {
    score: number;
    band: 'HIGH' | 'MEDIUM' | 'LOW';
    explanations: string[];
    metrics: {
        active_ratio: number;
        focus_ratio: number;
        away_ratio: number;
        paste_density: number;
        delete_insert_ratio: number;
        keys_per_min: number;
    };
}

export function calculateScore(payload: FinalPayload): ScoreResult {
    const {
        duration_ms,
        active_ms_total,
        focus_ms_total,
        away_ms_total,
        paste_total_len,
        typed_char_count,
        delete_count,
        output_len
    } = payload;

    // --- SECTION 4 & 6: Minimum Evidence Gate (MANDATORY) ---
    if (typed_char_count < 50 && paste_total_len === 0) {
        return {
            score: 0,
            band: 'LOW',
            explanations: ["Insufficient writing activity to establish an iterative drafting process."],
            metrics: {
                active_ratio: 0,
                focus_ratio: duration_ms > 0 ? focus_ms_total / duration_ms : 0,
                away_ratio: duration_ms > 0 ? away_ms_total / duration_ms : 0,
                paste_density: 0,
                delete_insert_ratio: 0,
                keys_per_min: 0
            }
        };
    }

    // C1. Derived Metrics
    const active_ratio = duration_ms > 0 ? Math.min(1, active_ms_total / duration_ms) : 0;
    const focus_ratio = duration_ms > 0 ? Math.min(1, focus_ms_total / duration_ms) : 0;
    const away_ratio = duration_ms > 0 ? Math.min(1, away_ms_total / duration_ms) : 0;

    const paste_density = output_len > 0 ? Math.min(1, paste_total_len / output_len) : 0;

    // safe divide
    const delete_insert_ratio = typed_char_count > 0 ? delete_count / typed_char_count : 0;

    // --- SECTION 5: Disable Unstable Metrics ---
    // Typing speed (WPM / chars per minute)
    let keys_per_min = 0;
    if (duration_ms >= 60000 && typed_char_count >= 100) {
        const minutes = duration_ms / 60000;
        keys_per_min = typed_char_count / minutes;
    }

    // C2. Process Evidence Score (0–100)
    let score = 100;
    const explanations: string[] = [];

    // --- Penalties ---

    // Low activity
    if (active_ratio < 0.1) {
        score -= 40;
        explanations.push("Critically low activity levels.");
    } else if (active_ratio < 0.3) {
        score -= 20;
        explanations.push("Sporadic drafting activity.");
    }

    // High paste density
    if (paste_density > 0.8) {
        score -= 60;
        explanations.push("Content dominated by pasting.");
    } else if (paste_density > 0.5) {
        score -= 30;
        explanations.push("High volume of pasted content.");
    } else if (paste_density > 0.2) {
        score -= 10;
    }

    // Large paste events
    if (payload.paste_max_len > 1000) {
        score -= 15;
        explanations.push("Anomalous large block pastes recorded.");
    }

    // Impossible typing speed (if data exists)
    if (keys_per_min > 800) {
        score -= 25;
        explanations.push("Unnatural typing speed detected.");
    }

    // Focus / Away
    if (away_ratio > 0.6) {
        score -= 40;
        explanations.push("Extended periods outside the writing environment.");
    } else if (away_ratio > 0.3) {
        score -= 20;
    }

    // --- Bonuses (Conditional) ---

    // Editing bonus (only if typed_char_count >= 100)
    if (typed_char_count >= 100) {
        if (delete_insert_ratio > 0.05 && delete_insert_ratio < 0.4) {
            score += 10;
            explanations.push("Natural revision behavior detected.");
        }
    }

    // Thinking bonus (only if gaps >= 5)
    const total_gaps = Object.values(payload.inter_word_gap_hist).reduce((a, b) => Number(a) + Number(b), 0) as number;
    if (total_gaps >= 5) {
        const thinking_pauses = Number(payload.inter_word_gap_hist.s2_5 || 0) + Number(payload.inter_word_gap_hist.s5_30 || 0);
        if ((thinking_pauses / total_gaps) > 0.15) {
            score += 10;
            explanations.push("Evidence of active composition (rhythm of thinking).");
        }
    }

    // --- SECTION 5: Hard Paste Dominance Cap (REQUIRED) ---
    const paste_density_final = output_len > 0 ? paste_total_len / output_len : 0;
    if (paste_density_final >= 0.85) {
        score = Math.min(score, 40);
        if (!explanations.includes("Most of the final content was introduced via paste operations.")) {
            explanations.push("Most of the final content was introduced via paste operations.");
        }
    }

    // --- SECTION 6: Final Clamp ---
    score = Math.max(0, Math.min(100, score));

    // C3. Banding
    let band: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (score >= 80) band = 'HIGH';
    else if (score >= 50) band = 'MEDIUM';

    // Default explanations
    if (explanations.length === 0) {
        if (score >= 80) explanations.push("Standard iterative drafting patterns.");
        else explanations.push("Insufficient data for full composition analysis.");
    }

    return {
        score,
        band,
        explanations,
        metrics: {
            active_ratio,
            focus_ratio,
            away_ratio,
            paste_density,
            delete_insert_ratio,
            keys_per_min
        }
    };
}
