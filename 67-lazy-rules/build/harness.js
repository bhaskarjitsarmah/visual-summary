/* Executes the built page's inline script against a stubbed DOM and asserts what the page displays. */
"use strict";
var fs = require('fs');
var html = fs.readFileSync(process.argv[2] || '../index.html', 'utf8');
var script = html.match(/<script>([\s\S]*)<\/script>/)[1];
var ok = 0, bad = 0;
function check(name, cond, info){ if(cond) ok++; else { bad++; console.log('[X] ' + name + (info !== undefined ? '  -> ' + JSON.stringify(info).slice(0, 300) : '')); } }
function strip(s){ return String(s).replace(/<[^>]+>/g, '').replace(/&asymp;/g, '≈').replace(/&amp;/g, '&'); }

/* ── every id the script reads must exist in the HTML ── */
var ids = {}; html.replace(/\sid="([^"]+)"/g, function(_, id){ ids[id] = true; });
var used = {}; script.replace(/\$\('([^']+)'\)/g, function(_, id){ used[id] = true; });
Object.keys(used).forEach(function(id){ if(id !== 'invoke-skill') check('id exists: ' + id, ids[id]); });

/* ── DOM stub ── */
var els = {};
function El(id, attrs){
  this.id = id; this.attrs = attrs || {}; this.innerHTML = ''; this.textContent = ''; this.className = '';
  this.style = {}; this.handlers = {}; this.disabled = false;
  this.value = this.attrs.value || ''; this.checked = 'checked' in this.attrs;
  var self = this;
  this.classList = { toggle:function(c, on){ self['cls_' + c] = on; }, contains:function(c){ return !!self['cls_' + c]; } };
}
El.prototype.addEventListener = function(t, f){ (this.handlers[t] = this.handlers[t] || []).push(f); };
El.prototype.getAttribute = function(a){ return this.attrs[a]; };
El.prototype.fire = function(t, ev){ (this.handlers[t] || []).forEach(function(f){ f(ev || {}); }); };
/* parse attributes of every tag with an id */
html.replace(/<(input|div|pre|span|button|table|b|i)\b([^>]*)>/g, function(_, tag, a){
  var attrs = {}; a.replace(/([\w-]+)(?:="([^"]*)")?/g, function(__, k, v){ attrs[k] = v === undefined ? '' : v; });
  if(attrs.id) els[attrs.id] = new El(attrs.id, attrs);
});
var dataBtns = { scn:[], glob:[] };
html.replace(/<button[^>]*data-(scn|glob)="([^"]*)"[^>]*>/g, function(_, k, v){ var a = {}; a['data-' + k] = v; dataBtns[k].push(new El(null, a)); });
var store = {};
global.localStorage = { getItem:function(k){ return store[k] || null; }, setItem:function(k, v){ store[k] = v; } };
global.document = {
  getElementById:function(id){ if(!els[id]){ els[id] = new El(id); els[id].missing = true; } return els[id]; },
  querySelectorAll:function(sel){ var m = sel.match(/^\[data-(scn|glob)\]$/); if(!m) throw new Error('unstubbed selector ' + sel); return dataBtns[m[1]]; },
  documentElement:{ scrollTop:0, scrollHeight:1000, clientHeight:500 }
};
var intervals = [];
global.window = { addEventListener:function(){} };
global.setInterval = function(f){ intervals.push(f); return intervals.length; };
global.clearInterval = function(){};
/* fake event whose target.closest() returns a node with the given attributes */
function evAt(attrs){ return { target:{ closest:function(){ return { getAttribute:function(a){ return attrs[a]; } }; } } }; }

try { (0, eval)(script + '\n;globalThis.__P = { allTokens:allTokens, simulate:simulate, SCENARIOS:SCENARIOS, userEvent:userEvent };'); ok++; } catch(e){ bad++; console.log('[X] script threw', e.stack); }
function $(id){ return els[id]; }

/* ── 1 · flip ── */
check('flip starts on-read', $('flip-tag').textContent === 'on matching read');
check('flip shows frontmatter', /paths:/.test($('flip-api').innerHTML) && $('flip-api').innerHTML.indexOf('fm off') < 0);
$('flip-toggle').checked = false; $('flip-toggle').fire('change');
check('flip off -> every session', $('flip-tag').textContent === 'every session' && $('flip-tag').className === 'tag-l');
check('flip off strikes frontmatter', $('flip-api').innerHTML.indexOf('fm off') >= 0);
$('flip-toggle').checked = true; $('flip-toggle').fire('change');

/* ── 2 · simulator ── */
var E = global.__P;
var total = E.allTokens();
check('sim initial empty', /has not started/.test($('ctx-list').innerHTML) && $('ctx-tok').textContent === '0 of ' + total + ' tokens');
check('sim back disabled at 0', $('sim-back').disabled === true);
function next(n){ for(var i = 0; i < n; i++) $('sim-next').fire('click'); }
next(1);
var launch = E.simulate([{ t:'launch' }])[0];
check('launch: 5 entries listed', ($('ctx-list').innerHTML.match(/class="centry/g) || []).length === 5);
check('launch: token readout', $('ctx-tok').textContent === '≈ ' + launch.tokens + ' of ' + total + ' tokens if everything loaded', $('ctx-tok').textContent);
next(2);
var l = $('ctx-list').innerHTML;
check('bug step2: api.md + nested loaded', l.indexOf('.claude/rules/api.md') >= 0 && l.indexOf('src/api/CLAUDE.md') >= 0);
check('bug step2: both flagged new', (l.match(/ new"/g) || []).length === 2);
check('bug step2: reasons', l.indexOf('path_glob_match') >= 0 && l.indexOf('nested_traversal') >= 0);
check('bug step2: react absent', l.indexOf('react.md') < 0);
check('bug step2: tree flashes api', /k-glob in flash" data-i="api"/.test($('tree').innerHTML));
check('bug narr mentions api.md', /api\.md/.test($('sim-narr').innerHTML));
next(5);
var bugEnd = E.simulate(E.SCENARIOS.bug.events);
check('bug end tokens', $('ctx-tok').textContent.indexOf('≈ ' + bugEnd[4].tokens + ' ') === 0, $('ctx-tok').textContent);
check('next disabled at end', $('sim-next').disabled === true);
check('no code panel in bug', $('sim-out').style.display === 'none');

/* catch */
dataBtns.scn.forEach(function(b){ if(b.attrs['data-scn'] === 'catch') b.fire('click'); });
next(4);
check('catch step3: code panel bad', $('sim-out').style.display === 'block' && $('sim-out').className === 'out bad', $('sim-out').className);
check('catch step3: says not in context', /api\.md was not in context/.test($('sim-out').innerHTML));
check('catch step3: api not in ctx', $('ctx-list').innerHTML.indexOf('.claude/rules/api.md') < 0);
check('catch step3: refunds no longer ghost', /tnode src" data-s="src\/api\/refunds.ts"|tnode src seen" data-s="src\/api\/refunds.ts"/.test($('tree').innerHTML));
next(1);
check('catch step4: api arrives', $('ctx-list').innerHTML.indexOf('.claude/rules/api.md') >= 0);
check('catch step4: code still bad', $('sim-out').className === 'out bad');
$('sim-back').fire('click'); $('sim-back').fire('click');
check('catch back: panel gone before write', $('sim-out').style.display === 'none');

/* free mode: read orders first, then create refunds -> good code */
$('sim-reset').fire('click');
$('tree').fire('click', evAt({ 'data-s':'src/api/orders.ts' }));
check('free: auto-launch + read = 2 steps', ($('sim-steps').innerHTML.match(/dotstep/g) || []).length === 2);
check('free: api loaded', $('ctx-list').innerHTML.indexOf('.claude/rules/api.md') >= 0);
$('tree').fire('click', evAt({ 'data-s':'src/api/refunds.ts' }));
check('free: create after read -> good code', $('sim-out').className === 'out good' && /api\.md was in context/.test($('sim-out').innerHTML));
$('tree').fire('click', evAt({ 'data-s':'src/api/refunds.ts' }));
check('free: second click reads refunds, nothing new', /nothing new loads/.test($('sim-narr').innerHTML), strip($('sim-narr').innerHTML));
/* inspect + skill */
$('tree').fire('click', evAt({ 'data-i':'skill' }));
check('inspect skill shows description-only state', /description only/.test($('inspect').innerHTML) && $('inspect').className === 'inspect show');
var stepsBefore = ($('sim-steps').innerHTML.match(/dotstep/g) || []).length;
E.userEvent({ t:'skill' });
check('skill invoked loads body', /skill invoked/.test($('ctx-list').innerHTML) && ($('sim-steps').innerHTML.match(/dotstep/g) || []).length === stepsBefore + 1);
check('inspect after invoke: in context', /in context/.test($('inspect').innerHTML));
/* step dots jump */
$('sim-steps').fire('click', evAt({ 'data-step':'1' }));
check('dot jump to launch', ($('ctx-list').innerHTML.match(/class="centry/g) || []).length === 5);
/* play */
dataBtns.scn.forEach(function(b){ if(b.attrs['data-scn'] === 'web') b.fire('click'); });
$('sim-play').fire('click');
var tick = intervals[intervals.length - 1]; for(var i = 0; i < 6; i++) tick();
var webEnd = E.simulate(E.SCENARIOS.web.events);
check('play runs web to end', $('sim-next').disabled && $('ctx-tok').textContent.indexOf('≈ ' + webEnd[4].tokens + ' ') === 0);
check('web end: react only scoped rule', $('ctx-list').innerHTML.indexOf('react.md') >= 0 && $('ctx-list').innerHTML.indexOf('api.md') < 0 && $('ctx-list').innerHTML.indexOf('tests.md') < 0);

/* ── 3 · glob ── */
function glob(p){ $('glob-in').value = p; $('glob-in').fire('input'); return +($('glob-stat').innerHTML.match(/<b>(\d+)<\/b>/) || [0, -1])[1]; }
check('glob default 6', glob('src/api/**/*.ts') === 6);
check('glob src/api/*.ts = 4', glob('src/api/*.ts') === 4);
check('glob **/*.test.ts = 4 (incl. root)', glob('**/*.test.ts') === 4);
check('glob web braces = 4 (Cart.test.ts is a .ts file too)', glob('src/web/**/*.{ts,tsx}') === 4);
check('glob *.md = 2', glob('*.md') === 2);
check('glob comma list', glob('*.md, db/migrations/*.sql') === 4);
check('glob comma list with braces', glob('src/web/**/*.{ts,tsx}, *.md') === 6);
glob('   '); check('glob empty message', /Empty pattern/.test($('glob-stat').innerHTML));

/* ── 4 · budget ── */
check('budget always', $('b-all').textContent === '10,500 tokens / turn');
check('budget scoped', $('b-sc').textContent === '2,400 tokens / turn');
check('budget saved', $('b-saved').textContent === '8,100');
check('budget ratio', $('b-ratio').textContent === '23%');
check('budget session', $('b-sess-all').textContent === '420.0 k' && $('b-sess-sc').textContent === '96.0 k', [$('b-sess-all').textContent, $('b-sess-sc').textContent]);
check('budget widths sum', Math.abs(parseFloat($('b-all-core').style.width) + parseFloat($('b-all-rules').style.width) - 100) < 1e-9);
$('b-share').value = '100'; $('b-share').fire('input');
check('budget share 100 -> equal', $('b-sc').textContent === $('b-all').textContent && $('b-saved').textContent === '0');
$('b-rules').value = '80'; $('b-tok').value = '1500'; $('b-turns').value = '150'; $('b-share').value = '0'; $('b-share').fire('input');
check('budget extremes', $('b-all').textContent === '121,500 tokens / turn' && $('b-sess-all').textContent === '18.23 M', [$('b-all').textContent, $('b-sess-all').textContent]);

/* ── 5 · strategy table ── */
var st = strip($('strat-table').innerHTML);
check('strategy: one miss under on-read', (st.match(/1 rule missing at write/g) || []).length === 1);
check('strategy: all-at-launch never misses', (st.match(/rule present when needed/g) || []).length === 5);
check('strategy: on-read never wastes', (st.match(/no unneeded tokens/g) || []).length === 3);

/* ── 7 · quiz ── */
check('quiz renders 6', ($('quiz').innerHTML.match(/class="q"/g) || []).length === 6);
$('quiz').fire('click', evAt({ 'data-q':'0', 'data-o':'CLAUDE.md' }));
$('quiz').fire('click', evAt({ 'data-q':'1', 'data-o':'CLAUDE.md' }));
check('quiz score', /1 \/ 6/.test($('qscore').innerHTML) && /4 to go/.test($('qscore').innerHTML));
check('quiz wrong shows better', /Better: <b>rule \+ paths:/.test($('quiz').innerHTML));

/* nothing touched an element missing from the HTML */
Object.keys(els).forEach(function(id){ if(els[id].missing) check('stub-created element ' + id, false); });

console.log(bad ? '[X]' : '[OK]', ok, 'passed,', bad, 'failed');
process.exitCode = bad ? 1 : 0;
