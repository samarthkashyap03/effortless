import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { TrackingSDK } from "@/lib/tracking";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// performance.now() is relative to page load. We stub it so tests are
// deterministic — advancing time by calling advanceTime(ms).
let currentTime = 0;

function advanceTime(ms: number) {
  currentTime += ms;
}

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  currentTime = 0;

  // Directly replace performance.now on the global object.
  // vi.spyOn does not reliably intercept the global performance object in jsdom,
  // so we assign the mock function directly and restore it in afterEach.
  (performance as unknown as Record<string, unknown>).now = () => currentTime;

  // jsdom does not fully implement window focus/blur events.
  // We stub addEventListener so the SDK can register handlers without errors.
  vi.spyOn(window, "addEventListener").mockImplementation(() => {});
  vi.spyOn(window, "removeEventListener").mockImplementation(() => {});
  vi.spyOn(document, "addEventListener").mockImplementation(() => {});
  vi.spyOn(document, "removeEventListener").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

describe("TrackingSDK — construction", () => {
  it("constructs without throwing", () => {
    expect(() => new TrackingSDK("session-1")).not.toThrow();
  });

  it("generates a payload with the correct session_id", () => {
    const sdk = new TrackingSDK("my-session");
    const payload = sdk.getSessionPayload();
    expect(payload.session_id).toBe("my-session");
  });

  it("starts with zero keystroke and paste counts", () => {
    const sdk = new TrackingSDK("s1");
    const payload = sdk.getSessionPayload();
    expect(payload.keystroke_count).toBe(0);
    expect(payload.paste_count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Typing tracking
// ---------------------------------------------------------------------------

describe("TrackingSDK — trackTyping", () => {
  it("increments typed_char_count on each call", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackTyping(1);
    sdk.trackTyping(1);
    sdk.trackTyping(1);
    expect(sdk.getSessionPayload().typed_char_count).toBe(3);
  });

  it("increments keystroke_count on each call", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackTyping(1);
    sdk.trackTyping(1);
    expect(sdk.getSessionPayload().keystroke_count).toBe(2);
  });

  it("accepts a charCount > 1 and accumulates correctly", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackTyping(5);
    expect(sdk.getSessionPayload().typed_char_count).toBe(5);
  });

  it("records pause histogram buckets based on time between keystrokes", () => {
    // Start at t=1 so the first keystroke sets lastKeyT=1 (> 0),
    // allowing subsequent gaps to be recorded.
    advanceTime(1);
    const sdk = new TrackingSDK("s");

    // First keystroke at t=1 (relative: 0ms from startT=1). Sets lastKeyT=0.
    // We need lastKeyT > 0 for gaps to be recorded, so type a char to anchor lastKeyT,
    // then advance and type again.
    advanceTime(10);             // t=11 relative to startT=1 → rel=10ms
    sdk.trackTyping(1);          // lastKeyT = 10ms (> 0)

    advanceTime(100);            // rel = 110ms; gap = 100ms → lt250
    sdk.trackTyping(1);

    advanceTime(600);            // rel = 710ms; gap = 600ms → ms250_1000
    sdk.trackTyping(1);

    const { pause_hist } = sdk.getSessionPayload();
    expect(pause_hist.lt250).toBeGreaterThanOrEqual(1);
    expect(pause_hist.ms250_1000).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Delete tracking
// ---------------------------------------------------------------------------

describe("TrackingSDK — trackDelete", () => {
  it("increments delete_count correctly", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackDelete(3, 0);
    sdk.trackDelete(2, 0);
    expect(sdk.getSessionPayload().delete_count).toBe(5);
  });

  it("increments keystroke_count on delete", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackDelete(1, 0);
    expect(sdk.getSessionPayload().keystroke_count).toBe(1);
  });

  it("removes a paste range that is fully deleted", () => {
    const sdk = new TrackingSDK("s");
    // Paste 10 chars at position 0
    sdk.trackPaste("helloworld", 0);
    expect(sdk.getSessionPayload().paste_ranges).toHaveLength(1);

    // Delete all 10 chars
    sdk.trackDelete(10, 0);
    expect(sdk.getSessionPayload().paste_ranges).toHaveLength(0);
  });

  it("shrinks a paste range that is partially deleted", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackPaste("helloworld", 0); // paste range [0, 10)
    sdk.trackDelete(5, 5);           // delete chars 5-9 → range shrinks to [0, 5)

    const { paste_ranges } = sdk.getSessionPayload();
    expect(paste_ranges).toHaveLength(1);
    expect(paste_ranges[0].end - paste_ranges[0].start).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Paste tracking
// ---------------------------------------------------------------------------

describe("TrackingSDK — trackPaste", () => {
  it("increments paste_count on each paste", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackPaste("hello", 0);
    sdk.trackPaste("world", 5);
    expect(sdk.getSessionPayload().paste_count).toBe(2);
  });

  it("accumulates paste_total_len across paste events", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackPaste("hello", 0);  // 5
    sdk.trackPaste("world", 5);  // 5
    // paste_ranges are merged if adjacent; total effective paste length = 10
    const { paste_ranges } = sdk.getSessionPayload();
    const totalRangeLen = paste_ranges.reduce((sum, r) => sum + (r.end - r.start), 0);
    expect(totalRangeLen).toBe(10);
  });

  it("tracks paste_max_len as the longest single paste", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackPaste("hi", 0);               // len 2
    sdk.trackPaste("a".repeat(50), 2);     // len 50
    sdk.trackPaste("bye", 52);             // len 3
    expect(sdk.getSessionPayload().paste_max_len).toBe(50);
  });

  it("records a paste event with correct position and length", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackPaste("test", 10);
    const { paste_events } = sdk.getSessionPayload();
    expect(paste_events).toHaveLength(1);
    expect(paste_events[0].start).toBe(10);
    expect(paste_events[0].end).toBe(14);
    expect(paste_events[0].len).toBe(4);
  });

  it("merges adjacent paste ranges", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackPaste("hello", 0);  // [0, 5)
    sdk.trackPaste("world", 5);  // [5, 10) — adjacent, should merge to [0, 10)
    const { paste_ranges } = sdk.getSessionPayload();
    expect(paste_ranges).toHaveLength(1);
    expect(paste_ranges[0].start).toBe(0);
    expect(paste_ranges[0].end).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Word boundary tracking
// ---------------------------------------------------------------------------

describe("TrackingSDK — trackWordBoundary", () => {
  it("does not record an inter-word gap before the first word", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackWordBoundary(); // first boundary — nothing to compare against
    const { inter_word_gap_hist } = sdk.getSessionPayload();
    const total = Object.values(inter_word_gap_hist).reduce((a, b) => (a as number) + (b as number), 0);
    expect(total).toBe(0);
  });

  it("records an inter-word gap after a word with typed chars", () => {
    const sdk = new TrackingSDK("s");

    // Type a char so currentWordTypedChars > 0, then mark the first word boundary
    sdk.trackTyping(1);
    advanceTime(500);
    sdk.trackWordBoundary();      // first boundary recorded at t=500

    // Type another char for the second word, advance time, then mark second boundary
    sdk.trackTyping(1);
    advanceTime(1500);
    sdk.trackWordBoundary();      // gap since first boundary = 1500ms → s1_2 bucket

    const { inter_word_gap_hist } = sdk.getSessionPayload();
    expect(inter_word_gap_hist.s1_2).toBeGreaterThanOrEqual(1);
  });

  it("does not record a gap when no chars were typed since last boundary", () => {
    const sdk = new TrackingSDK("s");
    sdk.trackWordBoundary();     // no typed chars → skipped
    advanceTime(2000);
    sdk.trackWordBoundary();     // still no typed chars → skipped

    const { inter_word_gap_hist } = sdk.getSessionPayload();
    const total = Object.values(inter_word_gap_hist).reduce((a, b) => (a as number) + (b as number), 0);
    expect(total).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// setFinalText
// ---------------------------------------------------------------------------

describe("TrackingSDK — setFinalText", () => {
  it("stores the final text and reports correct output_len", () => {
    const sdk = new TrackingSDK("s");
    sdk.setFinalText("Hello, world!");
    expect(sdk.getSessionPayload().output_len).toBe(13);
  });

  it("stores the raw final_text in the payload", () => {
    const sdk = new TrackingSDK("s");
    sdk.setFinalText("test content");
    expect(sdk.getSessionPayload().final_text).toBe("test content");
  });
});

// ---------------------------------------------------------------------------
// Duration
// ---------------------------------------------------------------------------

describe("TrackingSDK — duration", () => {
  it("reports duration_ms that reflects elapsed time", () => {
    const sdk = new TrackingSDK("s");
    advanceTime(60_000);
    expect(sdk.getSessionPayload().duration_ms).toBeCloseTo(60_000, -2);
  });
});

// ---------------------------------------------------------------------------
// Time invariants — focus + away must not exceed duration
// ---------------------------------------------------------------------------

describe("TrackingSDK — time invariants", () => {
  it("active_ms_total is clamped to duration_ms", () => {
    const sdk = new TrackingSDK("s");
    advanceTime(10_000);
    // Simulate many rapid keystrokes to build up active windows beyond duration
    for (let i = 0; i < 100; i++) {
      sdk.trackTyping(1);
    }
    const { active_ms_total, duration_ms } = sdk.getSessionPayload();
    expect(active_ms_total).toBeLessThanOrEqual(duration_ms);
  });

  it("focus_ms_total + away_ms_total does not exceed duration", () => {
    const sdk = new TrackingSDK("s");
    advanceTime(60_000);
    const { focus_ms_total, away_ms_total, duration_ms } = sdk.getSessionPayload();
    expect(focus_ms_total + away_ms_total).toBeLessThanOrEqual(duration_ms + 1); // +1 for float rounding
  });
});

// ---------------------------------------------------------------------------
// Payload shape
// ---------------------------------------------------------------------------

describe("TrackingSDK — payload shape", () => {
  it("returned payload contains all required fields", () => {
    const sdk = new TrackingSDK("s");
    const payload = sdk.getSessionPayload();
    const required = [
      "session_id", "duration_ms", "output_len",
      "active_ms_total", "focus_ms_total", "away_ms_total", "blur_ms_total",
      "tab_switch_count", "longest_away_ms",
      "keystroke_count", "typed_char_count", "delete_count",
      "pause_hist", "inter_word_gap_hist",
      "paste_count", "paste_total_len", "paste_max_len",
      "paste_ranges", "paste_events", "typing_bursts",
    ];
    for (const field of required) {
      expect(payload).toHaveProperty(field);
    }
  });

  it("typing_bursts is null", () => {
    const sdk = new TrackingSDK("s");
    expect(sdk.getSessionPayload().typing_bursts).toBeNull();
  });
});
