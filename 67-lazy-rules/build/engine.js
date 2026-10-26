/* ═══════════════ LOADER ENGINE — a model of when Claude Code puts instruction files into context ═══════════════ */
"use strict";
//GLOB//

/* The instruction files in the demo repo. `load` is the trigger, straight from code.claude.com/docs/en/memory:
   launch  — loaded at session start (CLAUDE.md files at/above cwd, CLAUDE.local.md, rules without `paths`)
   glob    — rules with `paths:` frontmatter, loaded when Claude reads a matching file
   nested  — CLAUDE.md in a subdirectory, loaded when Claude reads a file in that subdirectory
   skill   — description at launch, body when the skill is invoked */
var INSTR = [
  { id:'user', path:'~/.claude/CLAUDE.md', scope:'user', load:'launch', text:
'# Personal\n- Explain trade-offs before any large refactor.\n- Small commits, imperative commit messages.' },
  { id:'root', path:'CLAUDE.md', scope:'project', load:'launch', text:
'# acme-shop\nNode 20 + TypeScript. Next.js storefront in src/web, Express API in src/api.\n\n## Commands\n- npm run dev    start web + api\n- npm test       vitest, all packages\n- npm run lint   eslint + prettier\n\n## Conventions\n- TypeScript strict; no `any` without a comment saying why.\n- Money is integer cents (amountCents), never floats.' },
  { id:'local', path:'CLAUDE.local.md', scope:'local', load:'launch', text:
'- My local API runs on port 4001, not 4000.\n- Log in as the seeded user dev@acme.test.' },
  { id:'style', path:'.claude/rules/style.md', scope:'project', load:'launch', text:
'# Code style\n- Named exports only; no default exports.\n- Dates are ISO-8601 strings at every boundary.' },
  { id:'api', path:'.claude/rules/api.md', scope:'project', load:'glob', paths:['src/api/**/*.ts'], text:
'---\npaths:\n  - "src/api/**/*.ts"\n---\n# API conventions\n- Throw ApiError(status, code, message). Never hand-return a status shape.\n- Validate every request body with the zod schema in src/api/schemas.ts.\n- Handlers are async and never call res.send directly.' },
  { id:'tests', path:'.claude/rules/tests.md', scope:'project', load:'glob', paths:['**/*.test.ts'], text:
'---\npaths:\n  - "**/*.test.ts"\n---\n# Tests\n- One describe() per exported function.\n- Build data with test/factories.ts; never inline fixtures.\n- No network: mock fetch with msw.' },
  { id:'react', path:'.claude/rules/frontend/react.md', scope:'project', load:'glob', paths:['src/web/**/*.{ts,tsx}'], text:
'---\npaths:\n  - "src/web/**/*.{ts,tsx}"\n---\n# React\n- Server components by default; "use client" only for state or effects.\n- Tailwind classes; no inline style objects.\n- Every interactive element needs an accessible name.' },
  { id:'migr', path:'.claude/rules/migrations.md', scope:'project', load:'glob', paths:['db/migrations/*.sql'], text:
'---\npaths:\n  - "db/migrations/*.sql"\n---\n# Migrations\n- Additive only: never drop or rename a column in the same release.\n- Every migration ships with a tested down-migration.' },
  { id:'nested', path:'src/api/CLAUDE.md', scope:'project', load:'nested', dir:'src/api/', text:
'# src/api\nRoutes are registered in router.ts. A new handler is dead code until it is added there.' },
  { id:'skill', path:'.claude/skills/deploy-check/SKILL.md', scope:'project', load:'skill', name:'deploy-check',
    desc:'---\nname: deploy-check\ndescription: Pre-release checklist. Use before any release or when asked "is this ready to ship?"\n---',
    text:'---\nname: deploy-check\ndescription: Pre-release checklist. Use before any release or when asked "is this ready to ship?"\n---\n# Deploy check\n1. npm run lint && npm test must both pass.\n2. Migrations in db/migrations are additive only.\n3. Bump the version in package.json; add a CHANGELOG entry.\n4. Post the release note in #releases.' }
];

/* Ordinary source files. `exists:false` files can be created but not read. */
var SRC = [
  { path:'package.json', exists:true },
  { path:'README.md', exists:true },
  { path:'db/migrations/001_init.sql', exists:true },
  { path:'db/migrations/002_refunds.sql', exists:false },
  { path:'src/api/router.ts', exists:true },
  { path:'src/api/orders.ts', exists:true },
  { path:'src/api/orders.test.ts', exists:true },
  { path:'src/api/refunds.ts', exists:false },
  { path:'src/web/Cart.tsx', exists:true },
  { path:'src/web/Button.tsx', exists:true },
  { path:'src/web/styles.css', exists:true }
];

function tokensOf(s){ return Math.ceil(s.length / 4); }       /* the page's stated heuristic: ≈ 4 characters per token */
function instrById(id){ for(var i = 0; i < INSTR.length; i++) if(INSTR[i].id === id) return INSTR[i]; return null; }
function entryTokens(key){
  if(key === 'skill:desc') return tokensOf(instrById('skill').desc);
  return tokensOf(instrById(key).text);
}
/* the ceiling: every instruction file loaded (skill counted at full body, description included in it) */
function allTokens(){ var t = 0; INSTR.forEach(function(f){ t += tokensOf(f.text); }); return t; }

/* Replay a list of events and return a snapshot after each one.
   Each snapshot: { ev, loaded: [{key,label,reason,step,tokens}], added: [keys], files: {path:true}, note, violation } */
function simulate(events){
  var loaded = [], have = {}, files = {}, snaps = [];
  SRC.forEach(function(f){ if(f.exists) files[f.path] = true; });
  function add(key, label, reason, step, added){
    if(have[key]) return;
    have[key] = true;
    loaded.push({ key:key, label:label, reason:reason, step:step, tokens:entryTokens(key) });
    added.push(key);
  }
  events.forEach(function(ev, step){
    var added = [], note = '', violation = null, err = null;
    if(ev.t === 'launch'){
      INSTR.forEach(function(f){ if(f.load === 'launch') add(f.id, f.path, 'session_start', step, added); });
      add('skill:desc', 'deploy-check (description only)', 'session_start', step, added);
    } else if(ev.t === 'read'){
      if(!files[ev.f]){ err = ev.f + ' does not exist yet, so there is nothing to read.'; }
      else {
        INSTR.forEach(function(f){
          if(f.load === 'glob' && f.paths.some(function(p){ return globMatch(p, ev.f); })) add(f.id, f.path, 'path_glob_match', step, added);
          if(f.load === 'nested' && ev.f.indexOf(f.dir) === 0) add(f.id, f.path, 'nested_traversal', step, added);
        });
      }
    } else if(ev.t === 'create'){
      if(files[ev.f]) err = ev.f + ' already exists.';
      else {
        files[ev.f] = true;
        /* writing a new file is not a read: nothing triggers. Report what a matching rule would have said. */
        INSTR.forEach(function(f){
          if(f.load === 'glob' && f.paths.some(function(p){ return globMatch(p, ev.f); }) && !have[f.id]){
            violation = violation || { rule:f.id, path:f.path };
          }
        });
      }
    } else if(ev.t === 'skill'){
      add('skill', instrById('skill').path, 'skill invoked', step, added);
    }
    var tok = 0; loaded.forEach(function(l){ tok += l.tokens; });
    snaps.push({ ev:ev, loaded:loaded.slice(), added:added, files:Object.assign({}, files), tokens:tok, violation:violation, err:err });
  });
  return snaps;
}
function isLoaded(snap, key){ return snap.loaded.some(function(l){ return l.key === key; }); }

/* ── guided scenarios ── */
var SCENARIOS = {
  bug: { title:'Fix a bug in an endpoint', events:[
    { t:'launch', say:'Session starts. Everything marked <b>launch</b> enters the prompt before you type a word.' },
    { t:'prompt', text:'GET /orders returns 500 when the cart is empty. Fix it.', say:'Your prompt names no file. Nothing new loads: rules match on files, not on words.' },
    { t:'read', f:'src/api/orders.ts', say:'Claude <b>reads</b> orders.ts. It matches <code>src/api/**/*.ts</code>, so <b>api.md</b> loads, and because the file sits in src/api/, so does <b>src/api/CLAUDE.md</b>.' },
    { t:'read', f:'src/api/orders.test.ts', say:'Reading the test file matches <code>**/*.test.ts</code> &rarr; <b>tests.md</b> loads. api.md is already in context; it is not loaded twice.' },
    { t:'read', f:'src/api/router.ts', say:'Another API file. Every rule that matches is already loaded, so nothing changes.' }
  ]},
  catch: { title:'The catch: a brand-new endpoint', events:[
    { t:'launch', say:'Fresh session.' },
    { t:'prompt', text:'Add a POST /refunds endpoint.', say:'A greenfield task. Claude knows from CLAUDE.md that the API lives in src/api.' },
    { t:'read', f:'package.json', say:'Claude checks dependencies. package.json matches no rule.' },
    { t:'create', f:'src/api/refunds.ts', say:'Claude <b>writes</b> a new file at src/api/refunds.ts. Creating a file is not reading one. The docs tie path-scoped rules to reads, so <b>api.md has not loaded</b>, and the handler hand-returns a status shape.' },
    { t:'read', f:'src/api/orders.ts', say:'Only now, reading a sibling for reference, does api.md arrive. The rule is in context after the code it governs was written.' }
  ]},
  web: { title:'A frontend-only task', events:[
    { t:'launch', say:'Fresh session.' },
    { t:'prompt', text:'The cart badge overlaps the icon on mobile.', say:'A CSS/React task.' },
    { t:'read', f:'src/web/Cart.tsx', say:'Cart.tsx matches <code>src/web/**/*.{ts,tsx}</code> &rarr; <b>react.md</b> loads.' },
    { t:'read', f:'src/web/styles.css', say:'A .css file matches no pattern. Note that react.md\'s brace list is {ts,tsx}.' },
    { t:'read', f:'src/web/Button.tsx', say:'Done. api.md, tests.md, migrations.md and src/api/CLAUDE.md never entered the prompt, because this session never needed them.' }
  ]}
};

/* ── what each trigger strategy would do on a scenario (thought experiment, computed) ──
   all:    every rule loaded at launch
   read:   Claude Code's behaviour (simulate)
   Returns { violations, wastedTokens } where wasted = tokens of path-scoped rules loaded but matching no file the session touched. */
function strategyOutcome(strategy, events){
  var touched = events.filter(function(e){ return e.t === 'read' || e.t === 'create'; }).map(function(e){ return e.f; });
  var scoped = INSTR.filter(function(f){ return f.load === 'glob'; });
  function relevant(f){ return touched.some(function(p){ return f.paths.some(function(g){ return globMatch(g, p); }); }); }
  var violations = 0, wasted = 0;
  if(strategy === 'all'){
    scoped.forEach(function(f){ if(!relevant(f)) wasted += tokensOf(f.text); });
  } else if(strategy === 'read'){
    var snaps = simulate(events);
    snaps.forEach(function(s){ if(s.violation) violations++; });
  }
  return { violations:violations, wastedTokens:wasted };
}

/* ── context budget model (section 4) ── */
function budget(o){
  /* o: rules, tokPerRule, core, share (0..1 of rule areas a session touches), turns */
  var always = o.core + o.rules * o.tokPerRule;
  var scoped = o.core + Math.round(o.rules * o.share) * o.tokPerRule;
  return { always:always, scoped:scoped, saved:always - scoped,
           alwaysSession:always * o.turns, scopedSession:scoped * o.turns,
           ratio:scoped / always };
}

if(typeof module !== 'undefined') module.exports = { INSTR:INSTR, SRC:SRC, simulate:simulate, isLoaded:isLoaded, SCENARIOS:SCENARIOS,
  strategyOutcome:strategyOutcome, budget:budget, tokensOf:tokensOf, allTokens:allTokens, globMatch:globMatch, entryTokens:entryTokens };
