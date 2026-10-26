
/* ═══════════════ GATE ═══════════════ */
(function(){ if(localStorage.getItem('pg_unlocked_67')==='1') document.getElementById('gate').style.display='none'; })();
function checkGate(){
  if(document.getElementById('gate-input').value==='visual2025'){
    localStorage.setItem('pg_unlocked_67','1');
    document.getElementById('gate').style.display='none';
  } else document.getElementById('gate-err').style.display='block';
}

/* ═══════════════ HELPERS ═══════════════ */
function $(id){ return document.getElementById(id); }
function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function fmtInt(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmtK(n){ return n >= 1e6 ? (n / 1e6).toFixed(2) + ' M' : (n >= 1e4 ? (n / 1e3).toFixed(1) + ' k' : fmtInt(n)); }

//ENGINE//

var TRIGGER_TAG = { launch:'<span class="tag-l">launch</span>', glob:'<span class="tag-r">on read</span>', nested:'<span class="tag-r">on read</span>', skill:'<span class="tag-i">on invoke</span>' };
function triggerText(f){
  if(f.load === 'launch') return 'Loaded at session start, every session.';
  if(f.load === 'glob') return 'Loaded the first time Claude reads a file matching ' + f.paths.map(function(p){ return '<code>' + esc(p) + '</code>'; }).join(', ') + '.';
  if(f.load === 'nested') return 'A CLAUDE.md in a subdirectory: loaded when Claude reads a file under <code>' + esc(f.dir) + '</code>.';
  return 'Its name and description load at launch so Claude knows the skill exists. The body loads when the skill is invoked.';
}
function srcHtml(text){
  /* colour YAML frontmatter */
  var m = text.match(/^---\n[\s\S]*?\n---/);
  if(!m) return esc(text);
  return '<span class="fm">' + esc(m[0]) + '</span>' + esc(text.slice(m[0].length));
}

/* ═══════════════ 1 · FLIP ═══════════════ */
var API_BODY = instrById('api').text.replace(/^---\n[\s\S]*?\n---\n/, '');
function renderFlip(){
  var on = $('flip-toggle').checked;
  $('flip-claude').innerHTML = esc(instrById('root').text);
  var fm = instrById('api').text.match(/^---\n[\s\S]*?\n---\n/)[0];
  $('flip-api').innerHTML = '<span class="fm' + (on ? '' : ' off') + '">' + esc(fm) + '</span>' + esc(API_BODY);
  $('flip-card').className = 'fcard ' + (on ? 'on' : 'launch');
  $('flip-tag').className = on ? 'tag-r' : 'tag-l';
  $('flip-tag').textContent = on ? 'on matching read' : 'every session';
  $('flip-when').innerHTML = on
    ? 'Waits. It loads the first time Claude <b>reads</b> a file matching <code>src/api/**/*.ts</code>. Until then it costs nothing.'
    : 'Same folder, same text, no <code>paths</code>: it now <b>loads at launch</b> with the same priority as <code>.claude/CLAUDE.md</code>, in every session, including ones that never touch the API.';
}
$('flip-toggle').addEventListener('change', renderFlip);

/* ═══════════════ 2 · SIMULATOR ═══════════════ */
var TREE = [
  { g:'~/.claude/  (your machine, every project)' },
  { d:0, n:'CLAUDE.md', i:'user' },
  { g:'acme-shop/  (the repo)' },
  { d:0, n:'CLAUDE.md', i:'root' },
  { d:0, n:'CLAUDE.local.md', i:'local' },
  { d:0, n:'package.json', s:'package.json' },
  { d:0, n:'README.md', s:'README.md' },
  { d:0, n:'.claude/', dir:true },
  { d:1, n:'rules/', dir:true },
  { d:2, n:'style.md', i:'style' },
  { d:2, n:'api.md', i:'api' },
  { d:2, n:'tests.md', i:'tests' },
  { d:2, n:'migrations.md', i:'migr' },
  { d:2, n:'frontend/', dir:true },
  { d:3, n:'react.md', i:'react' },
  { d:1, n:'skills/deploy-check/', dir:true },
  { d:2, n:'SKILL.md', i:'skill' },
  { d:0, n:'db/migrations/', dir:true },
  { d:1, n:'001_init.sql', s:'db/migrations/001_init.sql' },
  { d:1, n:'002_refunds.sql', s:'db/migrations/002_refunds.sql' },
  { d:0, n:'src/', dir:true },
  { d:1, n:'api/', dir:true },
  { d:2, n:'CLAUDE.md', i:'nested' },
  { d:2, n:'router.ts', s:'src/api/router.ts' },
  { d:2, n:'orders.ts', s:'src/api/orders.ts' },
  { d:2, n:'orders.test.ts', s:'src/api/orders.test.ts' },
  { d:2, n:'refunds.ts', s:'src/api/refunds.ts' },
  { d:1, n:'web/', dir:true },
  { d:2, n:'Cart.tsx', s:'src/web/Cart.tsx' },
  { d:2, n:'Button.tsx', s:'src/web/Button.tsx' },
  { d:2, n:'styles.css', s:'src/web/styles.css' }
];
var sim = { scn:'bug', timeline:[], pos:0, inspect:null, playing:null, lastAdded:[] };
function loadScenario(key){
  stopPlay();
  sim.scn = key;
  sim.timeline = SCENARIOS[key].events.slice();
  sim.pos = 0; sim.inspect = null;
  document.querySelectorAll('[data-scn]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-scn') === key); });
  renderSim();
}
function currentSnap(){
  if(sim.pos === 0) return null;
  var snaps = simulate(sim.timeline.slice(0, sim.pos));
  return { snap:snaps[snaps.length - 1], all:snaps };
}
function userEvent(ev){
  stopPlay();
  sim.timeline = sim.timeline.slice(0, sim.pos);
  if(sim.pos === 0){ sim.timeline.push({ t:'launch', say:'Session starts.' }); sim.pos = 1; }
  sim.timeline.push(ev); sim.pos++;
  renderSim();
}
function describe(ev, snap){
  if(ev.say) return ev.say;
  if(snap.err) return snap.err;
  var names = snap.added.map(function(k){ return '<b>' + esc(k === 'skill:desc' ? 'skill description' : instrById(k).path) + '</b>'; });
  if(ev.t === 'read') return 'Claude reads <code>' + esc(ev.f) + '</code>. ' + (names.length ? 'Loaded: ' + names.join(', ') + '.' : 'No new instruction file matches, so nothing new loads.');
  if(ev.t === 'create') return 'Claude creates <code>' + esc(ev.f) + '</code>. Creating is not reading, so nothing loads.' + (snap.violation ? ' <b>' + esc(snap.violation.path) + '</b> covers this file but is not in context.' : '');
  if(ev.t === 'skill') return 'You run <code>/deploy-check</code>. The full SKILL.md body loads and stays for the rest of the session.';
  return '';
}
function evLine(ev){
  if(ev.t === 'launch') return '$ claude';
  if(ev.t === 'prompt') return '<span class="p">you &rsaquo;</span> ' + esc(ev.text);
  if(ev.t === 'read') return 'Read(' + esc(ev.f) + ')';
  if(ev.t === 'create') return 'Write(' + esc(ev.f) + ')  <span style="color:var(--muted)">new file</span>';
  if(ev.t === 'skill') return 'Skill(deploy-check)';
  return '';
}
var CODE_BAD = 'export async function createRefund(req, res) {\n  const order = await db.orders.find(req.body.orderId);\n  if (!order) {\n    <span class="hl">return res.status(404).json({ error: "not found" });</span>\n  }\n  const refund = await refunds.create(order, req.body.amountCents);\n  <span class="hl">res.send(refund);</span>\n}';
var CODE_GOOD = 'export async function createRefund(req: Request) {\n  <span class="hl">const body = RefundSchema.parse(req.body);</span>\n  const order = await db.orders.find(body.orderId);\n  if (!order) <span class="hl">throw new ApiError(404, "ORDER_NOT_FOUND", "No such order");</span>\n  return refunds.create(order, body.amountCents);\n}';
function renderSim(){
  var cs = currentSnap(), snap = cs ? cs.snap : null;
  var loadedKeys = {}, seen = {}, files = {};
  SRC.forEach(function(f){ if(f.exists) files[f.path] = true; });
  if(snap){
    snap.loaded.forEach(function(l){ loadedKeys[l.key] = true; });
    sim.timeline.slice(0, sim.pos).forEach(function(e){ if(e.f) seen[e.f] = true; });
    files = snap.files;
  }
  var added = snap ? snap.added : [];
  /* tree */
  var h = '';
  TREE.forEach(function(r){
    if(r.g){ h += '<div class="grp">' + esc(r.g) + '</div>'; return; }
    var ind = '<span class="ind">' + new Array(r.d + 1).join('&#9474; ') + '</span>';
    if(r.dir){ h += '<div class="tnode dir">' + ind + '<span class="nm">' + esc(r.n) + '</span></div>'; return; }
    if(r.i){
      var f = instrById(r.i), cls = 'tnode k-' + f.load;
      if(loadedKeys[r.i]) cls += ' in'; else if(r.i === 'skill' && loadedKeys['skill:desc']) cls += ' half';
      if(added.indexOf(r.i) >= 0) cls += ' flash';
      h += '<div class="' + cls + '" data-i="' + r.i + '">' + ind + '<span class="dot"></span><span class="nm">' + esc(r.n) + '</span><span class="act">inspect</span></div>';
      return;
    }
    var ex = !!files[r.s], c2 = 'tnode src' + (ex ? '' : ' ghost') + (seen[r.s] ? ' seen' : '');
    h += '<div class="' + c2 + '" data-s="' + esc(r.s) + '">' + ind + '<span class="dot"></span><span class="nm">' + esc(r.n) + '</span><span class="act">' + (ex ? 'Claude reads' : 'Claude creates') + '</span></div>';
  });
  $('tree').innerHTML = h;
  /* context */
  var total = allTokens();
  if(!snap){
    $('ctx-list').innerHTML = '<div class="ctx-empty">Nothing yet. The session has not started.</div>';
    $('ctx-tok').textContent = '0 of ' + total + ' tokens';
    $('ctx-meter').innerHTML = '';
  } else {
    var colors = { session_start:'var(--launch)', path_glob_match:'var(--onread)', nested_traversal:'var(--onread)', 'skill invoked':'var(--oninvoke)' };
    $('ctx-list').innerHTML = snap.loaded.map(function(l){
      var rcls = l.reason === 'skill invoked' ? 'skill' : l.reason;
      return '<div class="centry r-' + rcls + (added.indexOf(l.key) >= 0 ? ' new' : '') + '" data-i="' + (l.key === 'skill:desc' ? 'skill' : l.key) + '">' +
        '<span class="cr">#' + l.step + '</span><span class="cp">' + esc(l.label) + ' <span class="cr">' + esc(l.reason) + '</span></span><span class="ct">&asymp;' + l.tokens + '</span></div>';
    }).join('');
    $('ctx-tok').textContent = '≈ ' + snap.tokens + ' of ' + total + ' tokens if everything loaded';
    $('ctx-meter').innerHTML = snap.loaded.map(function(l){
      return '<i style="width:' + (100 * l.tokens / total).toFixed(2) + '%;background:' + colors[l.reason] + ';border-right:1px solid var(--bg)"></i>';
    }).join('');
  }
  /* narration */
  if(!snap){
    $('sim-narr').innerHTML = '<span class="ev">' + esc(SCENARIOS[sim.scn] ? SCENARIOS[sim.scn].title : '') + '</span>Press <b>Next step</b> to start the session, or click any file in the tree.';
  } else {
    var ev = sim.timeline[sim.pos - 1];
    $('sim-narr').innerHTML = '<span class="ev">step ' + (sim.pos - 1) + ' &middot; ' + evLine(ev) + '</span>' + describe(ev, snap);
  }
  /* generated-code panel: the most recent create of an API file */
  var out = $('sim-out'), lastCreate = -1;
  if(cs) cs.all.forEach(function(s, i){ if(s.ev.t === 'create' && !s.err && globMatch('src/api/**/*.ts', s.ev.f)) lastCreate = i; });
  if(lastCreate < 0){ out.style.display = 'none'; }
  else {
    var cv = cs.all[lastCreate], bad = !!cv.violation;
    out.style.display = 'block';
    out.className = 'out ' + (bad ? 'bad' : 'good');
    out.innerHTML = '<div class="oh"><span>' + esc(cv.ev.f) + ' (written at step ' + lastCreate + ')</span><b>' + (bad ? 'api.md was not in context' : 'api.md was in context') + '</b></div><pre>' + (bad ? CODE_BAD : CODE_GOOD) + '</pre>';
  }
  /* steps */
  var st = '';
  for(var i = 0; i < sim.timeline.length; i++){
    st += '<span class="dotstep' + (i < sim.pos - 1 ? ' done' : '') + (i === sim.pos - 1 ? ' cur' : '') + '" data-step="' + (i + 1) + '">' + i + '</span>';
  }
  $('sim-steps').innerHTML = st;
  $('sim-back').disabled = sim.pos === 0;
  $('sim-next').disabled = sim.pos >= sim.timeline.length;
  $('sim-play').disabled = sim.pos >= sim.timeline.length;
  renderInspect(loadedKeys);
}
function renderInspect(loadedKeys){
  var box = $('inspect');
  if(!sim.inspect){ box.className = 'inspect'; box.innerHTML = ''; return; }
  var f = instrById(sim.inspect);
  var state = loadedKeys[f.id] ? '<span style="color:#6ee7b7">in context</span>' :
    (f.id === 'skill' && loadedKeys['skill:desc'] ? '<span style="color:var(--oninvoke)">description only</span>' : '<span style="color:var(--muted)">not loaded</span>');
  box.className = 'inspect show';
  box.innerHTML = '<div class="ih"><span class="fname">' + esc(f.path) + '</span><span>' + TRIGGER_TAG[f.load] + ' &nbsp;' + state + '</span></div>' +
    '<div class="note" style="margin:0 0 .5rem">' + triggerText(f) + '</div><pre class="src">' + srcHtml(f.text) + '</pre>' +
    (f.id === 'skill' ? '<div style="margin-top:.6rem"><button class="btn sm" id="invoke-skill"' + (loadedKeys.skill ? ' disabled' : '') + '>Run /deploy-check</button></div>' : '');
  var ib = $('invoke-skill');
  if(ib) ib.addEventListener('click', function(){ userEvent({ t:'skill' }); });
}
$('tree').addEventListener('click', function(e){
  var n = e.target.closest('.tnode'); if(!n) return;
  if(n.getAttribute('data-i')){ sim.inspect = n.getAttribute('data-i'); renderSim(); return; }
  var p = n.getAttribute('data-s'); if(!p) return;
  var cs = currentSnap(), files = cs ? cs.snap.files : null;
  var exists = files ? !!files[p] : SRC.some(function(f){ return f.path === p && f.exists; });
  userEvent({ t:exists ? 'read' : 'create', f:p });
});
$('ctx-list').addEventListener('click', function(e){
  var n = e.target.closest('.centry'); if(!n) return;
  sim.inspect = n.getAttribute('data-i'); renderSim();
});
$('sim-steps').addEventListener('click', function(e){
  var n = e.target.closest('.dotstep'); if(!n) return;
  stopPlay(); sim.pos = +n.getAttribute('data-step'); renderSim();
});
document.querySelectorAll('[data-scn]').forEach(function(b){ b.addEventListener('click', function(){ loadScenario(b.getAttribute('data-scn')); }); });
$('sim-next').addEventListener('click', function(){ stopPlay(); if(sim.pos < sim.timeline.length){ sim.pos++; renderSim(); } });
$('sim-back').addEventListener('click', function(){ stopPlay(); if(sim.pos > 0){ sim.pos--; renderSim(); } });
$('sim-reset').addEventListener('click', function(){ loadScenario(sim.scn); });
function stopPlay(){ if(sim.playing){ clearInterval(sim.playing); sim.playing = null; $('sim-play').innerHTML = '&#9654; Play'; } }
$('sim-play').addEventListener('click', function(){
  if(sim.playing){ stopPlay(); return; }
  if(sim.pos >= sim.timeline.length) return;
  $('sim-play').innerHTML = '&#10074;&#10074; Pause';
  function tick(){ if(sim.pos >= sim.timeline.length){ stopPlay(); renderSim(); return; } sim.pos++; renderSim(); }
  tick();
  sim.playing = setInterval(tick, 2200);
});

/* ═══════════════ 3 · GLOB PLAYGROUND ═══════════════ */
var GLOB_FILES = ['CLAUDE.md', 'README.md', 'package.json', 'orders.test.ts', 'docs/architecture.md',
  'db/migrations/001_init.sql', 'db/migrations/002_refunds.sql',
  'src/api/router.ts', 'src/api/orders.ts', 'src/api/orders.test.ts', 'src/api/schemas.ts', 'src/api/v2/refunds.ts', 'src/api/v2/refunds.test.ts', 'src/api/README.md',
  'src/web/Cart.tsx', 'src/web/Button.tsx', 'src/web/hooks/useCart.ts', 'src/web/styles.css', 'src/web/Cart.test.ts',
  'test/factories.ts'];
/* "a, b" is two patterns, but the comma inside {ts,tsx} is part of one */
function splitPatterns(raw){
  var out = [], cur = '', depth = 0;
  for(var i = 0; i < raw.length; i++){
    var c = raw[i];
    if(c === '{') depth++;
    if(c === '}') depth = Math.max(0, depth - 1);
    if(c === ',' && depth === 0){ out.push(cur); cur = ''; } else cur += c;
  }
  out.push(cur);
  return out.map(function(s){ return s.trim(); }).filter(Boolean);
}
function renderGlob(){
  var raw = $('glob-in').value, pats = splitPatterns(raw);
  var hits = 0, html = '';
  GLOB_FILES.forEach(function(f){
    var hit = pats.some(function(p){ return globMatch(p, f); });
    if(hit) hits++;
    html += '<div class="gfile' + (hit ? ' hit' : '') + '" title="' + esc(f) + '">' + esc(f) + '</div>';
  });
  $('glob-files').innerHTML = html;
  $('glob-stat').innerHTML = pats.length
    ? 'Reading any of <b>' + hits + '</b> of ' + GLOB_FILES.length + ' files would load this rule.'
    : '<span class="gerr">Empty pattern: matches nothing.</span>';
  document.querySelectorAll('[data-glob]').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-glob') === raw.trim()); });
}
$('glob-in').addEventListener('input', renderGlob);
document.querySelectorAll('[data-glob]').forEach(function(b){ b.addEventListener('click', function(){ $('glob-in').value = b.getAttribute('data-glob'); renderGlob(); }); });

/* ═══════════════ 4 · BUDGET ═══════════════ */
function readBudget(){
  return { rules:+$('b-rules').value, tokPerRule:+$('b-tok').value, core:+$('b-core').value, share:+$('b-share').value / 100, turns:+$('b-turns').value };
}
function renderBudget(){
  var o = readBudget(), r = budget(o);
  $('b-rules-v').textContent = o.rules; $('b-tok-v').textContent = fmtInt(o.tokPerRule); $('b-core-v').textContent = fmtInt(o.core);
  $('b-share-v').textContent = Math.round(o.share * 100) + '%'; $('b-turns-v').textContent = o.turns;
  var scale = r.always;
  $('b-all-core').style.width = (100 * o.core / scale) + '%';
  $('b-all-rules').style.width = (100 * (r.always - o.core) / scale) + '%';
  $('b-sc-core').style.width = (100 * o.core / scale) + '%';
  $('b-sc-rules').style.width = (100 * (r.scoped - o.core) / scale) + '%';
  $('b-all').textContent = fmtInt(r.always) + ' tokens / turn';
  $('b-sc').textContent = fmtInt(r.scoped) + ' tokens / turn';
  $('b-saved').textContent = fmtInt(r.saved);
  $('b-ratio').textContent = Math.round(r.ratio * 100) + '%';
  $('b-sess-all').textContent = fmtK(r.alwaysSession);
  $('b-sess-sc').textContent = fmtK(r.scopedSession);
}
['b-rules', 'b-tok', 'b-core', 'b-share', 'b-turns'].forEach(function(id){ $(id).addEventListener('input', renderBudget); });

/* ═══════════════ 5 · POLICY TABLE ═══════════════ */
function renderStrategy(){
  var h = '<tr><th>Scenario</th><th>Load every rule at launch</th><th>Load on read (Claude Code)</th></tr>';
  ['bug', 'catch', 'web'].forEach(function(k){
    var ev = SCENARIOS[k].events, a = strategyOutcome('all', ev), r = strategyOutcome('read', ev);
    function cell(o){
      return '<td class="' + (o.violations ? 'bad' : (o.wastedTokens ? '' : 'good')) + '">' +
        (o.violations ? o.violations + ' rule missing at write' : 'rule present when needed') + '<br>' +
        '<span class="mono">' + (o.wastedTokens ? '&asymp; ' + o.wastedTokens + ' unneeded tokens' : 'no unneeded tokens') + '</span></td>';
    }
    h += '<tr><td>' + esc(SCENARIOS[k].title) + '</td>' + cell(a) + cell(r) + '</tr>';
  });
  $('strat-table').innerHTML = h;
}

/* ═══════════════ 7 · QUIZ ═══════════════ */
var Q_OPTS = ['~/.claude/CLAUDE.md', 'CLAUDE.md', 'CLAUDE.local.md', 'rule + paths:', 'skill'];
var QUIZ = [
  { q:'"Run npm test before you say you are done."', a:['CLAUDE.md'], why:'True for every task in the repo, and short. This is what the always-on file is for.' },
  { q:'"Migrations are additive only. Never drop a column in the same release."', a:['rule + paths:'], why:'Only matters when Claude is in <code>db/migrations/</code>. Scope it with <code>paths: "db/migrations/*.sql"</code>. Writing a <em>new</em> migration is the greenfield case, so if this has ever caused an incident, add one line to CLAUDE.md as well.' },
  { q:'"React components are server components unless they need state."', a:['rule + paths:'], why:'An area convention: <code>src/web/**/*.{ts,tsx}</code>. API-only sessions never pay for it.' },
  { q:'"My local API runs on port 4001."', a:['CLAUDE.local.md'], why:'Personal to this project on your machine. CLAUDE.local.md loads at launch and stays out of git.' },
  { q:'"Release: lint, test, bump the version, write the changelog, post in #releases."', a:['skill'], why:'A procedure you run sometimes. As a skill only its description is always loaded, and the steps arrive when you run it.' },
  { q:'"Explain trade-offs before any large refactor." (you want this everywhere)', a:['~/.claude/CLAUDE.md'], why:'A personal preference across all projects: your user-level CLAUDE.md.' }
];
var quizState = {};
function renderQuiz(){
  var h = '', right = 0, answered = 0;
  QUIZ.forEach(function(item, qi){
    var pick = quizState[qi], ok = pick != null && item.a.indexOf(pick) >= 0;
    if(pick != null){ answered++; if(ok) right++; }
    h += '<div class="q' + (pick == null ? '' : (ok ? ' right' : ' wrong')) + '"><div class="qt">' + esc(item.q) + '</div><div class="qopts">';
    Q_OPTS.forEach(function(o){
      var cls = 'btn';
      if(pick === o) cls += ok ? ' pick-right' : ' pick-wrong';
      else if(pick != null && item.a.indexOf(o) >= 0) cls += ' pick-right';
      h += '<button class="' + cls + '" data-q="' + qi + '" data-o="' + esc(o) + '">' + esc(o) + '</button>';
    });
    h += '</div><div class="qa' + (pick != null ? ' show' : '') + '">' + (ok ? '&#10003; ' : '&#10007; Better: <b>' + esc(item.a.join(' or ')) + '</b>. ') + item.why + '</div></div>';
  });
  $('quiz').innerHTML = h;
  $('qscore').innerHTML = answered ? '<b>' + right + ' / ' + QUIZ.length + '</b> placed where they load at the right time' + (answered < QUIZ.length ? ' (' + (QUIZ.length - answered) + ' to go)' : '.') : '';
}
$('quiz').addEventListener('click', function(e){
  var b = e.target.closest('[data-q]'); if(!b) return;
  quizState[+b.getAttribute('data-q')] = b.getAttribute('data-o');
  renderQuiz();
});

/* ═══════════════ PROGRESS ═══════════════ */
window.addEventListener('scroll', function(){
  var d = document.documentElement, p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight);
  $('progress').style.width = (p * 100) + '%';
});

renderFlip();
loadScenario('bug');
renderGlob();
renderBudget();
renderStrategy();
renderQuiz();
