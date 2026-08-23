# Build Lessons — visual-summary

Running log of mistakes and fixes for this repo, so they don't repeat.
Format: what happened → root cause → fix → prevention. Tag how it was caught
(self-review / my test / USER).

---

## 2026-08-23 — Post 64 (Prompt Tuning)

### 1. `Math.pow(negativeTinyNumber, 0.75)` → NaN → silently garbage colours
**Caught by:** my test (executing the page's JS in a stubbed DOM).

**What happened.** The loss landscape was stored in a `Float32Array`, but the running
min/max were tracked from the *double* values before storing. Float32 rounding meant some
stored cells came back very slightly **below** the recorded minimum, so the normalised
`t` went marginally negative. `Math.pow(-1e-8, 0.75)` is `NaN`, which indexed off the end
of the colour-stop array and threw.

**Root cause.** Comparing values across a precision boundary — computing statistics in
float64 over data that is persisted as float32.

**Fix.** Read the value back out of the `Float32Array` before using it in the min/max
comparison, so the statistics describe the data actually being rendered. Plus a
`if(!(t>=0)) t=0;` guard, which also catches NaN (`NaN >= 0` is false).

**Prevention.** When a typed array is involved, compute summary stats from the values
*after* the round-trip, never from the source doubles. And clamp before any fractional
`Math.pow`.

### 2. Repainting a static heatmap every animation frame
**Caught by:** my test (the node harness took >2 min on work the browser does per frame).

**What happened.** The landscape canvas redrew ~7k heatmap rects plus ~49k contour rects
on *every* optimiser step, though it only changes when the task or mode changes.

**Fix.** Render it once to an offscreen `<canvas>`, keyed on `task|mode|width|height`,
then `drawImage` it each frame and draw only the path and the moving point on top. Also
split `labStep` into `labStepCore` (no repaint) + `labStep`, so the animation loop can
take two optimiser steps per single repaint.

**Prevention.** If a draw call's output depends only on state that changes rarely, cache
it offscreen. A slow headless test run is a real signal about browser jank, not just test
overhead — don't dismiss it.

### 3. A summarised source number contradicted the arithmetic
**Caught by:** self-review (reconciling against the source).

**What happened.** A web-fetch summary of Lester et al. Table 4 reported T5-Large at
`0.0191%` task parameters. But `102,400 / 783.15M = 0.0131%`, and the same table's Small
row (`51,200` / `0.0665%`) reconciles exactly with `k × d_model`. The `0.0191%` was a
summariser error, not a paper value.

**Fix.** Made the cost calculator *compute* from `k × d_model` and the published parameter
counts, then asserted it reproduces every figure the paper actually states
(51,200 / 0.0665% / 102,400 / 20,480 / 409,600). All pass.

**Prevention.** Never transcribe a number from a summary of a source. Derive it, then use
the source's own reported values as test assertions. If a derived value and a quoted value
disagree, find out which one reconciles with everything else before shipping either.

### 4. Don't assert landscape topology you haven't measured
**Caught by:** self-review.

Draft prose said an initialisation "starts in a flat region on the far side of a ridge."
That was a plausible-sounding invention — the test only established that it converges to a
*different, worse* minimum. Rewrote to claim exactly what was measured.

**Prevention.** For any generated visualisation, the prose may only assert what the
harness actually printed.

---

## Standing practice for this repo

- Each post is a single self-contained `index.html` in an `NN-slug/` directory; register
  it by adding a card to the root `index.html` grid. `build1.js` / `build2.js` / `reindex.js`
  at the root are legacy one-offs and are no longer used.
- Gate key is `pg_unlocked_NN` in `localStorage`; password `visual2025`. Bump `NN` per post.
- **Verify interactive content by executing it**, not by reading it: extract the inline
  `<script>` and run it in node against a stubbed DOM, then assert the numbers the page
  will actually display. This catches runtime errors, NaN propagation, and perf problems
  that eyeballing the source cannot.
- Any number quoted from a paper should be reproducible by the page's own arithmetic, and
  that reproduction should be an assertion in the test harness.
