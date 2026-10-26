# Post 67 build sources

- `head.html` + `body.html` + `script.js` + `engine.js` + `glob.js` -> `node build.js ../index.html` assembles the post
  (glob.js is inlined into engine.js at `//GLOB//`, engine.js into script.js at `//ENGINE//`; a gate-less `shot.html`
  and a 390px `phone.html` wrapper are written next to the sources for screenshots. `shot.html?scn=catch&n=4` opens the
  simulator at a given scenario step).
- `node harness.js ../index.html` executes the built page's inline script in a stubbed DOM and asserts what the page
  displays (102 checks: flip toggle, every simulator scenario step, free-mode clicks, skill invoke, glob counts,
  budget readouts, the policy table, the quiz).
- `node test_engine.js` (28) / `node test_glob.js` (16) test the loader engine and the glob matcher directly.
- `apply_checklist.js` is the idempotent script that added the index card + filter counts, the learning-map node and
  edges, and the Continue Learning card on post 20.
- Load semantics follow code.claude.com/docs/en/memory (checked 2026-10-01). If the docs change, update `INSTR` /
  `simulate()` in engine.js and the ladder in body.html section 6.
