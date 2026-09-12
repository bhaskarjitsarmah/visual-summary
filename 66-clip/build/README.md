# Post 66 build sources (untracked, like the other posts' build scripts)

- `head.html` + `body.html` + `script.js` + `engine.js` -> `node build.js ../index.html` assembles the post
  (engine.js is inlined at the `//ENGINE//` marker; a gate-less `shot.html` is written next to the sources for screenshots).
- `node harness.js ../index.html` executes the built page's inline script in a stubbed DOM and asserts every number the page
  displays (75 checks: gradient checks, ln N vs floors, batch-size and temperature sweeps, zero-shot accuracies, paper arithmetic).
- `node test_engine.js` / `test_pairs.js` / `test_attr.js` / `sweep.js` are the engine-level experiments behind the prose claims.
- `apply_checklist.js` is the idempotent script that added the index card, learning-map node/edges/path and the Continue Learning
  cards on posts 16, 08 and 30.
- Headless Chrome clamps its window to 504px wide; to check phone layout, render the page inside a 400px iframe.
