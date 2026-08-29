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

## 2026-08-29 - Post 65 (NDCG)

### 1. `setupCanvas` re-read `cv.height` after mutating it - canvas doubled every redraw
**Caught by:** my test (asserting the backing height is stable across three `drawDiscount()` calls).

**What happened.** The DPR helper did `var h = cv.height; cv.height = h * dpr;`. On the first call
that is correct. On every subsequent call `cv.height` is the *already scaled* value, so the design
height doubled each time - 240 -> 480 -> 960. The bug is invisible on a page that draws once, and
this page redraws on every interaction.

**Fix.** Cache the design height in a `data-base-h` attribute on first use and always read the
design height from there, never from the live `cv.height`.

**Prevention.** A helper that both reads and writes the same property needs a separate source of
truth for the input. Test idempotence explicitly: call the draw function three times and assert the
geometry is unchanged.

### 2. A "same documents, same precision" example that did not actually have the same precision
**Caught by:** my test (asserting `precisionAt(A,5) === precisionAt(B,5)`).

**What happened.** The opening hook claimed two rankings of the same 8 documents have identical
Precision@5 while NDCG separates them. The two orderings I wrote by hand gave P@5 of 0.80 and 0.60 -
the headline claim of section 1 was simply false, and the page displayed both numbers.

**Fix.** Reordered list B so the top 5 contains the same *count* of relevant documents by
construction, then asserted it. Now 0.80 / 0.80 with NDCG@5 of 0.911 / 0.294.

**Prevention.** When a section's argument is "metric X is blind here, metric Y is not", that is a
testable claim about the example data, not just prose. Assert it - hand-built examples that
"obviously" have a property frequently do not.

### 3. Standalone-first, then port
Post 65 was written as a self-contained file in `Downloads/` first, verified there, and only then
transformed into the post (gate, topbar, `s-*` section ids, PM Lens) by a script. Re-running the
same 37-check harness against the *generated* post caught nothing new, which is the point - the
transform is mechanical and re-verifiable. Worth repeating when a post starts life as a one-off.

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
