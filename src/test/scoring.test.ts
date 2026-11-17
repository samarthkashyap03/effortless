import { describe, it, expect } from "vitest";
import { calculateScore } from "@/lib/scoring";
import type { FinalPayload } from "@/lib/tracking";

// A valid baseline payload representing a genuine, well-behaved writing session.
// Individual tests override specific fields to isolate the behaviour under test.
function makePayload(overrides: Partial<FinalPayload> = {}): FinalPayload {
  return {
    session_id: "test-session",
    duration_ms: 300_000,       // 5 minutes
    output_len: 500,
    active_ms_total: 240_000,   // 80 % active
    focus_ms_total: 270_000,    // 90 % focused
    away_ms_total: 30_000,      // 10 % away
    blur_ms_total: 30_000,
    tab_switch_count: 1,
    longest_away_ms: 15_000,
    keystroke_count: 600,
    typed_char_count: 550,
    delete_count: 55,           // ~10 % delete ratio → revision bonus
    pause_hist: { lt250: 300, ms250_1000: 100, s1_5: 20, s5_30: 5, gt30: 0 },
    inter_word_gap_hist: { lt250: 50, ms250_1000: 20, s1_2: 10, s2_5: 8, s5_30: 2, gt30: 0 },
    paste_count: 0,
    paste_total_len: 0,
    paste_max_len: 0,
    paste_ranges: [],
    paste_events: [],
    typing_bursts: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Minimum Evidence Gate
// ---------------------------------------------------------------------------
describe("calculateScore — minimum evidence gate", () => {
  it("returns score 0 and LOW band when typed_char_count < 50 and no paste", () => {
    const result = calculateScore(makePayload({ typed_char_count: 10, paste_total_len: 0 }));
    expect(result.score).toBe(0);
    expect(result.band).toBe("LOW");
  });

  it("does NOT trigger the gate when paste compensates for low typing", () => {
    // 10 typed chars but 200 pasted — gate should not fire
    const result = calculateScore(makePayload({ typed_char_count: 10, paste_total_len: 200 }));
    expect(result.score).not.toBe(0);
  });

  it("does NOT trigger the gate when typed_char_count is exactly 50", () => {
    const result = calculateScore(makePayload({ typed_char_count: 50, paste_total_len: 0 }));
    expect(result.score).not.toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Banding
// ---------------------------------------------------------------------------
describe("calculateScore — banding", () => {
  it("returns HIGH band for a clean, genuine session", () => {
    const result = calculateScore(makePayload());
    expect(result.band).toBe("HIGH");
    expect(result.score).toBeGreaterThanOrEqual(80);
  });

  it("returns LOW band when score is below 50", () => {
    // Force low score: very low activity + heavy pasting
    const result = calculateScore(makePayload({
      active_ms_total: 10_000,   // ~3 % activity → -40 penalty
      paste_total_len: 450,       // 90 % of output_len → paste dominance cap
      output_len: 500,
      typed_char_count: 50,
    }));
    expect(result.band).toBe("LOW");
    expect(result.score).toBeLessThan(50);
  });

  it("returns MEDIUM band for a borderline session", () => {
    // active_ms_total=50_000 (16%) → -20 penalty (sporadic)
    // paste_total_len=130 (26% of 500) → -10 penalty
    // No revision bonus (delete_count=0), no thinking bonus (too few gaps)
    // Score: 100 - 20 - 10 = 70 → MEDIUM
    const result = calculateScore(makePayload({
      active_ms_total: 50_000,
      paste_total_len: 130,
      output_len: 500,
      typed_char_count: 200,
      delete_count: 0,
      inter_word_gap_hist: { lt250: 1, ms250_1000: 1, s1_2: 0, s2_5: 0, s5_30: 0, gt30: 0 },
    }));
    expect(result.band).toBe("MEDIUM");
    expect(result.score).toBeGreaterThanOrEqual(50);
    expect(result.score).toBeLessThan(80);
  });
});

// ---------------------------------------------------------------------------
// Penalties
// ---------------------------------------------------------------------------
describe("calculateScore — penalties", () => {
  it("applies -40 penalty for critically low activity (< 10 %)", () => {
    // Use a stripped-down session so there are no bonuses inflating the score.
    // No thinking bonus (< 5 gaps), no revision bonus (delete_count=0).
    // critical low activity (<10%) → -40. Score = 100 - 40 = 60.
    const lowActivity = calculateScore(makePayload({
      active_ms_total: 5_000,     // 1.6 % of 300_000 → critically low
      delete_count: 0,
      inter_word_gap_hist: { lt250: 1, ms250_1000: 1, s1_2: 0, s2_5: 0, s5_30: 0, gt30: 0 },
    }));
    expect(lowActivity.score).toBeLessThanOrEqual(60);
    expect(lowActivity.explanations.some(e => e.toLowerCase().includes("activity"))).toBe(true);
  });

  it("applies -20 penalty for sporadic activity (10 %–30 %)", () => {
    const baseline = calculateScore(makePayload());
    const sporadicActivity = calculateScore(makePayload({ active_ms_total: 50_000 })); // 16.6 %
    expect(sporadicActivity.score).toBeLessThan(baseline.score);
  });

  it("applies -60 penalty when paste density exceeds 80 %", () => {
    const result = calculateScore(makePayload({
      paste_total_len: 450,
      output_len: 500,
      typed_char_count: 100,
    }));
    // Paste density = 90 % → -60 penalty + paste dominance cap (score ≤ 40)
    expect(result.score).toBeLessThanOrEqual(40);
    expect(result.explanations.some(e => e.toLowerCase().includes("paste"))).toBe(true);
  });

  it("applies -15 penalty for large single paste events (> 1000 chars)", () => {
    const baseline = calculateScore(makePayload());
    const largePaste = calculateScore(makePayload({
      paste_max_len: 1500,
      paste_total_len: 100,
      output_len: 500,
    }));
    expect(largePaste.score).toBeLessThan(baseline.score);
  });

  it("applies -40 penalty when away ratio exceeds 60 %", () => {
    const result = calculateScore(makePayload({
      away_ms_total: 210_000,   // 70 % away
      focus_ms_total: 90_000,
    }));
    expect(result.explanations.some(e => e.toLowerCase().includes("away") || e.toLowerCase().includes("outside"))).toBe(true);
    expect(result.score).toBeLessThan(80);
  });

  it("applies -25 penalty for unnatural typing speed (> 800 keys/min)", () => {
    const result = calculateScore(makePayload({
      typed_char_count: 10_000,  // 10,000 chars in 5 min = 2,000 chars/min
      duration_ms: 300_000,
    }));
    expect(result.explanations.some(e => e.toLowerCase().includes("speed") || e.toLowerCase().includes("typing"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Bonuses
// ---------------------------------------------------------------------------
describe("calculateScore — bonuses", () => {
  it("awards revision bonus when delete ratio is between 5 % and 40 %", () => {
    // Start from a session that already has a penalty (sporadic activity -20)
    // so the bonus can lift the score above the no-revision baseline visibly.
    const base = {
      active_ms_total: 50_000,   // -20 (sporadic)
      delete_count: 0,
      typed_char_count: 200,
      inter_word_gap_hist: { lt250: 1, ms250_1000: 1, s1_2: 0, s2_5: 0, s5_30: 0, gt30: 0 },
    };
    const noRevision = calculateScore(makePayload(base));
    const withRevision = calculateScore(makePayload({ ...base, delete_count: 30 })); // 15 % ratio → bonus
    expect(withRevision.score).toBeGreaterThan(noRevision.score);
    expect(withRevision.explanations.some(e => e.toLowerCase().includes("revision"))).toBe(true);
  });

  it("does NOT award revision bonus when typed_char_count < 100", () => {
    const result = calculateScore(makePayload({
      typed_char_count: 80,
      delete_count: 20, // 25 % ratio, but typed < 100 so bonus should not apply
    }));
    expect(result.explanations.some(e => e.toLowerCase().includes("revision"))).toBe(false);
  });

  it("awards thinking bonus when sufficient thinking pauses exist", () => {
    // inter_word_gap_hist with > 15 % pauses in s2_5 or s5_30 buckets
    const thinkingPayload = makePayload({
      inter_word_gap_hist: { lt250: 10, ms250_1000: 10, s1_2: 2, s2_5: 5, s5_30: 5, gt30: 0 },
      // total=32, thinking pauses (s2_5+s5_30)=10 → 31 % > 15 %
    });
    const result = calculateScore(thinkingPayload);
    expect(result.explanations.some(e => e.toLowerCase().includes("composition") || e.toLowerCase().includes("thinking"))).toBe(true);
  });

  it("does NOT award thinking bonus when fewer than 5 inter-word gaps exist", () => {
    const result = calculateScore(makePayload({
      inter_word_gap_hist: { lt250: 2, ms250_1000: 1, s1_2: 0, s2_5: 0, s5_30: 0, gt30: 0 },
    }));
    expect(result.explanations.some(e => e.toLowerCase().includes("composition") || e.toLowerCase().includes("thinking"))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Hard paste dominance cap
// ---------------------------------------------------------------------------
describe("calculateScore — paste dominance cap", () => {
  it("caps score at 40 when paste density >= 85 %", () => {
    const result = calculateScore(makePayload({
      paste_total_len: 450,
      output_len: 500,          // 90 % paste density
      typed_char_count: 100,
    }));
    expect(result.score).toBeLessThanOrEqual(40);
  });

  it("does NOT cap score when paste density is below 85 %", () => {
    const result = calculateScore(makePayload({
      paste_total_len: 100,
      output_len: 500,          // 20 % paste density
    }));
    expect(result.score).toBeGreaterThan(40);
  });
});

// ---------------------------------------------------------------------------
// Final clamp — score always 0–100
// ---------------------------------------------------------------------------
describe("calculateScore — score clamp", () => {
  it("score is never below 0", () => {
    const result = calculateScore(makePayload({
      active_ms_total: 1,
      paste_total_len: 490,
      output_len: 500,
      paste_max_len: 2000,
      away_ms_total: 290_000,
      focus_ms_total: 10_000,
      typed_char_count: 100,
    }));
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it("score is never above 100", () => {
    const result = calculateScore(makePayload());
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// Returned metrics
// ---------------------------------------------------------------------------
describe("calculateScore — returned metrics", () => {
  it("returns correct active_ratio", () => {
    const payload = makePayload({ active_ms_total: 150_000, duration_ms: 300_000 });
    const result = calculateScore(payload);
    expect(result.metrics.active_ratio).toBeCloseTo(0.5, 2);
  });

  it("returns correct focus_ratio", () => {
    const payload = makePayload({ focus_ms_total: 240_000, duration_ms: 300_000 });
    const result = calculateScore(payload);
    expect(result.metrics.focus_ratio).toBeCloseTo(0.8, 2);
  });

  it("returns correct paste_density", () => {
    const payload = makePayload({ paste_total_len: 100, output_len: 500 });
    const result = calculateScore(payload);
    expect(result.metrics.paste_density).toBeCloseTo(0.2, 2);
  });

  it("returns 0 for keys_per_min when session is shorter than 60 seconds", () => {
    const payload = makePayload({ duration_ms: 30_000, typed_char_count: 200 });
    const result = calculateScore(payload);
    expect(result.metrics.keys_per_min).toBe(0);
  });

  it("returns 0 for keys_per_min when typed_char_count < 100", () => {
    const payload = makePayload({ typed_char_count: 50, paste_total_len: 200 });
    const result = calculateScore(payload);
    expect(result.metrics.keys_per_min).toBe(0);
  });

  it("returns non-zero keys_per_min for long sessions with enough typing", () => {
    const payload = makePayload({ duration_ms: 120_000, typed_char_count: 300 });
    const result = calculateScore(payload);
    expect(result.metrics.keys_per_min).toBeGreaterThan(0);
  });

  it("active_ratio is clamped to 1 even if active_ms exceeds duration", () => {
    const payload = makePayload({ active_ms_total: 999_999, duration_ms: 300_000 });
    const result = calculateScore(payload);
    expect(result.metrics.active_ratio).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------
describe("calculateScore — edge cases", () => {
  it("handles zero duration without throwing or dividing by zero", () => {
    expect(() => calculateScore(makePayload({ duration_ms: 0, typed_char_count: 60 }))).not.toThrow();
  });

  it("handles zero output_len without throwing", () => {
    expect(() => calculateScore(makePayload({ output_len: 0, paste_total_len: 0 }))).not.toThrow();
  });

  it("always returns at least one explanation string", () => {
    const result = calculateScore(makePayload());
    expect(result.explanations.length).toBeGreaterThan(0);
  });
});
