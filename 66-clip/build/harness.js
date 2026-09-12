"use strict";
/* Execute the page's inline script in a stubbed DOM and assert what it displays. */
var fs = require('fs'), vm = require('vm');
var page = fs.readFileSync(process.argv[2], 'utf8');
var m = page.match(/<script>\n([\s\S]*)\n<\/script>\n<\/body>/);
if(!m) throw new Error('script block not found');
var src = m[1];

/* ── DOM stubs ── */
var noop = function(){};
function ctx2d(){
  return new Proxy({}, { get: function(t, k){ if(k === 'measureText') return function(){ return { width: 10 }; }; if(typeof k === 'string' && k.indexOf('Symbol') < 0) return t[k] !== undefined ? t[k] : noop; return undefined; }, set: function(t, k, v){ t[k] = v; return true; } });
}
function ClassList(el){ this.el = el; this.set = {}; }
ClassList.prototype.add = function(c){ this.set[c] = 1; };
ClassList.prototype.remove = function(c){ delete this.set[c]; };
ClassList.prototype.toggle = function(c, on){ if(on) this.add(c); else this.remove(c); };
ClassList.prototype.contains = function(c){ return !!this.set[c]; };
var elCount = 0;
function El(tag, id){
  this.tagName = (tag || 'div').toUpperCase(); this.id = id || ''; this.children = []; this.style = {}; this.dataset = {};
  this.classList = new ClassList(this); this._attrs = {}; this._inner = ''; this._text = ''; this.value = ''; this.disabled = false;
  this.clientWidth = 600; this.clientHeight = 300; this.offsetWidth = 340; this.offsetLeft = 0; this.width = 300; this.height = 150; this.scrollTop = 0; this.scrollHeight = 5000;
  this.listeners = {}; this.uid = ++elCount;
}
Object.defineProperty(El.prototype, 'innerHTML', { get: function(){ return this._inner; }, set: function(v){ this._inner = String(v); this.children = []; } });
Object.defineProperty(El.prototype, 'textContent', { get: function(){ return this._text || this._inner.replace(/<[^>]+>/g, ''); }, set: function(v){ this._text = String(v); this._inner = String(v); } });
Object.defineProperty(El.prototype, 'className', { get: function(){ return Object.keys(this.classList.set).join(' '); }, set: function(v){ var self = this; this.classList.set = {}; String(v).split(/\s+/).filter(Boolean).forEach(function(c){ self.classList.set[c] = 1; }); } });
El.prototype.appendChild = function(c){ this.children.push(c); c.parentNode = this; return c; };
El.prototype.getAttribute = function(k){ return this._attrs[k] !== undefined ? this._attrs[k] : (k === 'height' ? String(this.height) : null); };
El.prototype.setAttribute = function(k, v){ this._attrs[k] = String(v); };
El.prototype.getContext = function(){ return ctx2d(); };
El.prototype.getBoundingClientRect = function(){ return { left: 0, top: 0, width: 600, height: 300, right: 600, bottom: 300 }; };
El.prototype.addEventListener = function(t, f){ (this.listeners[t] = this.listeners[t] || []).push(f); };
El.prototype.setPointerCapture = noop; El.prototype.releasePointerCapture = noop;
El.prototype.querySelectorAll = function(){ return []; };
El.prototype.querySelector = function(){ return null; };
El.prototype.title = '';
var registry = {};
var document = {
  getElementById: function(id){ if(!registry[id]) registry[id] = new El(id === 'norm-canvas' || /canvas|circle|heat|curve/.test(id) ? 'canvas' : 'div', id); return registry[id]; },
  createElement: function(tag){ return new El(tag); },
  querySelectorAll: function(){ return []; },
  documentElement: { scrollTop: 0, scrollHeight: 5000, clientHeight: 800 },
};
/* canvases referenced by the script must report the attribute height they have in the HTML */
var heights = {}; page.replace(/<canvas id="([^"]+)" height="(\d+)"/g, function(_, id, h){ heights[id] = +h; return _; });
Object.keys(heights).forEach(function(id){ var c = document.getElementById(id); c.tagName = 'CANVAS'; c.setAttribute('height', heights[id]); c.height = heights[id]; });
/* inputs must report their HTML value attribute */
page.replace(/<input[^>]*id="([^"]+)"[^>]*value="([^"]*)"/g, function(_, id, v){ document.getElementById(id).value = v; return _; });
page.replace(/<select[^>]*id="([^"]+)"[^>]*>\s*<option value="([^"]*)"/g, function(_, id, v){ document.getElementById(id).value = v; return _; });
var storage = {};
var sandbox = {
  document: document, console: console, Math: Math,
  window: { addEventListener: noop, devicePixelRatio: 2 },
  localStorage: { getItem: function(k){ return storage[k] || null; }, setItem: function(k, v){ storage[k] = String(v); } },
  requestAnimationFrame: function(){ return 0; }, setTimeout: function(f){ return 0; }, Float64Array: Float64Array, Proxy: Proxy, Object: Object, Array: Array, String: String, Number: Number, Infinity: Infinity, NaN: NaN,
};
sandbox.window.devicePixelRatio = 2;
vm.createContext(sandbox);
var t0 = Date.now();
vm.runInContext(src, sandbox, { filename: 'page.js' });
console.log('script executed in ' + (Date.now() - t0) + ' ms (includes training the page-load model)');

var fails = 0, checks = 0;
function assert(c, msg){ checks++; if(!c){ fails++; console.log('  FAIL: ' + msg); } else console.log('  ok:   ' + msg); }
function txt(id){ return document.getElementById(id).textContent; }
function run(code){ return vm.runInContext(code, sandbox); }

console.log('── page-load model ──');
var pre = run('PRE_EVAL');
console.log('  PRE i2t ' + pre.i2t + ' t2i ' + pre.t2i + ' gap ' + pre.gap.toFixed(3) + ' tau ' + (1 / run('scaleOf(PRE)')).toFixed(4) + ' step ' + run('PRE.step'));
assert(pre.i2t >= 0.95, 'page-load model reaches >= 95% held-out image->caption accuracy');
assert(run('evaluate(UNTRAINED, HELDOUT)').i2t < 0.5, 'untrained twin is poor');

console.log('── section 3 matrix ──');
assert(txt('mx-neg').indexOf('56') === 0 && txt('mx-pos') === '8', 'N=8 → 8 positives, 56 negatives (' + txt('mx-neg') + ')');
assert(Math.abs(+txt('mx-lnn') - Math.log(8)) < 1e-3, 'ln N readout');
var dm = +txt('mx-dmean'), om = +txt('mx-omean'); console.log('  trained: mean diag ' + dm + ' mean off ' + om);
assert(dm > om + 0.3, 'trained model: diagonal cosines clearly above off-diagonal');
run('mx.N = 16; drawMx();'); assert(txt('mx-neg').indexOf('240') === 0 && registry['mx'].children.length === 256, 'N=16 renders 256 cells, 240 negatives (' + txt('mx-neg') + ')');
run('mx.trained = false; drawMx();'); var dm0 = +txt('mx-dmean'), om0 = +txt('mx-omean'); console.log('  untrained: mean diag ' + dm0 + ' mean off ' + om0);
assert(dm0 < om0 + 0.3, 'untrained model: diagonal not clearly above off-diagonal');
run('mx.trained = true; mx.N = 8; drawMx();');

console.log('── section 4 stepper ──');
for(var s = 0; s <= 8; s++){ run('lossLab.step = ' + s + '; drawLoss();'); }
run('lossLab.step = 7; drawLoss();');
var li = +txt('l-li'), lt = +txt('l-lt'), ll = +txt('l-l');
console.log('  loss_i ' + li + ' loss_t ' + lt + ' loss ' + ll);
assert(isFinite(li) && isFinite(lt) && isFinite(ll), 'stepper losses are finite');
assert(Math.abs(ll - 0.5 * (li + lt)) < 0.002, 'displayed loss = ½(loss_i + loss_t)');
assert(ll < Math.log(4), 'mid-training model beats chance ln 4 on the stepper batch');
assert(ll > 0.2, 'mid-training snapshot is not saturated (loss ' + ll + ')');
assert(registry['lmx'].children.length === 16, '4×4 grid has 16 cells');
/* gradient step: row-view rows sum to zero, column-view columns sum to zero, signs as described */
run('lossLab.step = 8; drawLoss();');
(function(){ var lo = run('(function(){ var fw=forwardBatch(MID, lossLab.batch); var l = softmaxLoss(4, fw.C, scaleOf(MID)); return { G: Array.from(l.G), Prow: Array.from(l.Prow), Pcol: Array.from(l.Pcol) }; })()');
  var ok = true; for(var i = 0; i < 4; i++){ var rs = 0, cs = 0; for(var j = 0; j < 4; j++){ rs += lo.Prow[i * 4 + j] - (i === j ? 1 : 0); cs += lo.Pcol[j * 4 + i] - (i === j ? 1 : 0); } if(Math.abs(rs) > 1e-9 || Math.abs(cs) > 1e-9) ok = false; }
  assert(ok, 'row-view rows and column-view columns of P − I sum to zero');
  var diagNeg = true, offPos = true; for(i = 0; i < 4; i++) for(var j = 0; j < 4; j++){ if(i === j && !(lo.G[i * 4 + j] < 0)) diagNeg = false; if(i !== j && !(lo.G[i * 4 + j] > 0)) offPos = false; }
  assert(diagNeg && offPos, 'diagonal gradient negative (pull up), off-diagonal positive (push down)');
  console.log('  G×N: ' + lo.G.map(function(g){ return (g * 4).toFixed(2); }).join(' ')); })();
/* editing a negative raises the loss and both directional terms */
run('lossPin(1, 2); lossNudge(0.3); lossNudge(0.3); lossLab.step = 7; drawLoss();');
var li2 = +txt('l-li'), lt2 = +txt('l-lt'), ll2 = parseFloat(txt('l-l'));
console.log('  after +0.6 on cell (2,3): loss_i ' + li2 + ' loss_t ' + lt2 + ' loss ' + ll2 + ' note: ' + txt('loss-note').slice(-120));
assert(ll2 > ll && li2 > li && lt2 > lt, 'raising a negative cosine raises loss, loss_i and loss_t');
assert(txt('l-l').indexOf('was') >= 0, 'edited loss shows the original value');
run('lossNudge(0); lossLab.pin = -1; lossLab.step = 0; drawLoss();');
assert(Math.abs(parseFloat(txt('l-l')) - ll) < 1e-9 || txt('l-l') === '—', 'restore returns to the original loss');

console.log('── section 5 temperature ──');
function tempAt(v){ registry['temp-slider'].value = String(v); run('drawTemp();'); return { loss: +txt('temp-loss'), tau: +txt('temp-val'), hard: +txt('temp-hard').replace('+', ''), share: txt('temp-share') }; }
var t1 = tempAt(0), t07 = tempAt(578), t001 = tempAt(1000);
console.log('  tau=1 loss ' + t1.loss + ' | tau=' + t07.tau + ' loss ' + t07.loss + ' hard ' + t07.hard + ' share ' + t07.share + ' | tau=0.01 loss ' + t001.loss + ' share ' + t001.share);
assert(t1.tau === 1 && Math.abs(t07.tau - 0.07) < 0.002 && t001.tau === 0.01, 'slider maps to tau = 1 / 0.07 / 0.01');
assert(t1.loss > t07.loss && t07.loss > t001.loss, 'loss falls as tau falls for this row (positive is the top cosine)');
assert(Math.abs(t1.loss - Math.log(8)) < 0.2, 'tau=1 loss is near ln 8 (nearly uniform softmax)');
/* reproduce the tau=1 loss independently */
(function(){ var cos = [0.31, 0.24, 0.21, 0.18, 0.15, 0.12, 0.10, 0.08], Z = 0; cos.forEach(function(c){ Z += Math.exp(c); }); var l = -Math.log(Math.exp(0.31) / Z); assert(Math.abs(l - t1.loss) < 0.002, 'tau=1 loss reproduced independently: ' + l.toFixed(3)); })();
assert(Math.abs(4.2e14 - 390625 * (32768 * 32768 - 32768)) / 4.2e14 < 0.01, 'comparisons over training = 4.2e14 (prose claim)');
assert(Math.abs(+txt('temp-floor') - Math.log(1 + 7 * Math.exp(-2 / 0.01))) < 1e-6, 'floor at tau=0.01, N=8 is ~0');
tempAt(0); assert(Math.abs(+txt('temp-floor') - Math.log(1 + 7 * Math.exp(-2))) < 1e-3, 'floor at tau=1, N=8 = ' + Math.log(1 + 7 * Math.exp(-2)).toFixed(3));
run('tempSwapped = true;'); var sw = tempAt(1000); console.log('  swapped hardest negative to 0.60 at tau=0.01: loss ' + sw.loss);
assert(sw.loss > 5, 'a negative 0.05 above the positive at tau=0.01 gives a loss above 5 (got ' + sw.loss + ')');
run('tempSwapped = false;'); tempAt(578);
assert(Math.abs(run('floorLoss(32768, 1)') - 8.397) < 0.01, 'floor at tau=1, N=32768 = 8.40 (prose claim)');

console.log('── section 6 lab ──');
var h1 = registry['lab-circle'].height; run('labDraw(); labDraw(); labDraw();'); assert(registry['lab-circle'].height === h1, 'canvas backing height stable across repeated draws (' + h1 + ')');
assert(run('lab.model.step') === 0 && txt('lab-stepc') === '0', 'lab starts at step 0');
var pc0 = run('lab.ev.posCos'); console.log('  init posCos ' + pc0.toFixed(3) + ' cones I/T ' + txt('cone-i') + '/' + txt('cone-t') + ' init acc ' + run('lab.ev.i2t') + ' nuisance ' + txt('nuis-init'));
assert(+txt('cone-t') > 0.5, 'captions start concentrated in a cone (' + txt('cone-t') + ')');
run('labStep(50);'); var e50 = run('lab.ev'); console.log('  step 50: loss ' + txt('lab-loss') + ' acc ' + e50.i2t + ' col ' + e50.colAcc + ' shp ' + e50.shpAcc + ' fn ' + txt('acc-fn') + ' note: ' + txt('lab-note').slice(0, 80));
run('labStep(550);'); var e400 = run('lab.ev'); console.log('  step 600: loss ' + txt('lab-loss') + ' tau ' + txt('lab-tau') + ' acc ' + e400.i2t + ' posCos ' + e400.posCos.toFixed(3) + ' nuisance ' + txt('nuis-now') + ' fn ' + txt('acc-fn'));
assert(e400.i2t >= 0.9, 'default lab config reaches >= 90% by step 600 (seed ' + run('lab.seed') + ')');
assert(isFinite(+txt('lab-loss')) && isFinite(+txt('lab-tau')), 'lab readouts finite');
assert(e400.posCos > pc0 + 0.5, 'positive-pair cosine rises (init ' + pc0.toFixed(2) + ' → ' + e400.posCos.toFixed(2) + ')');
assert(parseFloat(txt('nuis-now')) < parseFloat(txt('nuis-init')), 'nuisance sensitivity falls (init ' + txt('nuis-init') + ' → ' + txt('nuis-now') + ')');
assert(/^\d+ of 240$/.test(txt('acc-fn')), 'false-negative readout has the form "k of 240" (got ' + txt('acc-fn') + ')');
assert(txt('lab-note').indexOf('Solved') >= 0 || txt('lab-note').indexOf('Training') >= 0, 'lab note is a recognised state');
/* the loss must sit between the floor (duplicates + tau) and chance; the duplicate floor must reproduce the closed form */
(function(){ var loss = +txt('lab-loss'), fl = run('lab.floorHist[lab.floorHist.length-1]'), df = run('dupFloor(lab.lastFw.fw.pairs)'); console.log('  floor ' + fl.toFixed(3) + ' (dup ' + df.toFixed(3) + '), loss ' + loss); assert(loss > 0.8 * fl && loss < Math.log(16), 'loss sits between the floor and chance'); })();
(function(){ var ids = [0, 0, 0, 1, 2, 2], pairs = ids.map(function(id){ return { img: { id: id } }; }); var df = run('dupFloor(' + JSON.stringify(pairs) + ')'); var expect = (3 * Math.log(3) + 0 + 2 * Math.log(2)) / 6; assert(Math.abs(df - expect) < 1e-12, 'dupFloor closed form: [3,3,3,1,2,2] → ' + expect.toFixed(4)); })();
/* over 300 batches at N=32 the mean duplicate floor should be near the critic's measured 1.4 */
(function(){ var m = run('(function(){ var r = makeRng(5), s = 0; for(var b = 0; b < 300; b++){ var p = []; for(var i = 0; i < 32; i++) p.push(makePair(r)); s += dupFloor(p); } return s / 300; })()'); console.log('  mean duplicate floor at N=32: ' + m.toFixed(3)); assert(m > 1.3 && m < 1.5, 'mean duplicate floor at N=32 is about 1.4'); })();
/* presets exist and run */
['default', 'tau1', 'tiny', 'siglip', 'collide'].forEach(function(p){ run('lab.playing=false; labPreset("' + p + '"); lab.playing=false; labStep(30);'); assert(isFinite(+txt('lab-loss')), 'preset ' + p + ' runs (N=' + run('lab.N') + ', loss ' + txt('lab-loss') + ')'); });
run('lab.playing=false; lab.N = 16; lab.tempMode = "learn"; lab.loss = "softmax"; labReset(false);');
/* every control combination runs without NaN */
[['4', 'learn', 'softmax'], ['32', 'learn', 'softmax'], ['16', '1', 'softmax'], ['16', '0.07', 'softmax'], ['16', 'learn', 'sigmoid'], ['4', 'learn', 'sigmoid']].forEach(function(cfg){
  run('lab.N = ' + cfg[0] + '; lab.tempMode = "' + cfg[1] + '"; lab.loss = "' + cfg[2] + '"; labReset(false); labStep(120);');
  var e = run('lab.ev'), loss = +txt('lab-loss');
  console.log('  N=' + cfg[0] + ' tau=' + cfg[1] + ' ' + cfg[2] + ': loss ' + loss.toFixed(3) + ' acc ' + e.i2t.toFixed(2) + ' tau ' + txt('lab-tau') + ' bias ' + txt('lab-bias'));
  assert(isFinite(loss) && isFinite(e.i2t) && isFinite(e.gap), 'config ' + cfg.join('/') + ' produces finite numbers');
});
/* tau fixed at 1: loss floor stays high */
run('lab.N = 16; lab.tempMode = "1"; lab.loss = "softmax"; labReset(false); labStep(600);');
var lossT1 = +txt('lab-loss'), accT1 = run('lab.ev.i2t');
run('lab.tempMode = "learn"; labReset(false); labStep(600);');
var lossL = +txt('lab-loss'), accL = run('lab.ev.i2t');
console.log('  600 steps: tau=1 loss ' + lossT1 + ' acc ' + accT1 + ' | learnable loss ' + lossL + ' acc ' + accL + ' tau ' + txt('lab-tau'));
assert(lossT1 > lossL + 0.5, 'tau fixed at 1 leaves the loss far above the learnable-tau run');
assert(+txt('lab-tau') < 0.07, 'learnable tau falls below its 0.07 init');
run('lab.N = 16; lab.tempMode = "learn"; lab.loss = "softmax"; labReset(false);');

console.log('── section 7 zero-shot ──');
run('zsRefresh();'); console.log('  which: ' + txt('zs-which').slice(0, 60)); console.log('  canonical acc ' + txt('zs-acc') + ' pred ' + txt('zs-pred'));
var accCanon = parseFloat(txt('zs-acc'));
assert(accCanon >= 95, 'canonical template classifies >= 95% of held-out images');
run('zs.tmpl = "{C} {S}"; zsRefresh();'); var accBare = parseFloat(txt('zs-acc')); console.log('  bare label acc ' + accBare + ' note: ' + txt('zs-note').slice(0, 90));
run('zs.tmpl = "photo photo photo {C} {S}"; zsRefresh();'); var accWeird = parseFloat(txt('zs-acc')); console.log('  unseen template acc ' + accWeird);
run('zs.tmpl = "ensemble"; zsRefresh();'); var accEns = parseFloat(txt('zs-acc')); console.log('  ensemble acc ' + accEns + ' chips: ' + registry['zs-chips'].innerHTML.slice(0, 60));
assert(accWeird < accCanon, 'a template never seen in training scores lower than the canonical one');
assert(accBare < accCanon, 'the bare label (out of distribution) scores lower than the canonical template');
assert(accEns >= 95, 'ensemble of four templates scores >= 95%');
run('zs.tmpl = "a photo of a {C} {S}"; zsRefresh();');
var chips = registry['zs-chips'].innerHTML; assert(chips.indexOf('bad') < 0, 'canonical template: every word in vocabulary');
run('zs.tmpl = "a banana {C} {S}"; zsRefresh();'); assert(registry['zs-chips'].innerHTML.indexOf('chip bad">banana') >= 0, 'unknown word is flagged');
run('zs.tmpl = "a photo of a {C} {S}"; zsRefresh();');

console.log('── section 8 scale ──');
assert(txt('sc-steps') === '390,625', 'total steps at paper settings = 390,625 (got ' + txt('sc-steps') + ')');
assert(txt('sc-spe') === '12,207', 'steps per epoch = 12,207 (got ' + txt('sc-spe') + ')');
assert(txt('sc-seen') === '12.80 B', 'pairs seen = 12.80 B (got ' + txt('sc-seen') + ')');
assert(txt('sc-negs') === '1.07 B', 'negatives per step = 1.07 B (got ' + txt('sc-negs') + ')');
assert(txt('sc-mem') === '2.15 GB', 'fp16 logit matrix = 2.15 GB (got ' + txt('sc-mem') + ')');
assert(Math.abs(+txt('sc-lnn') - 10.40) < 0.01, 'ln 32768 = 10.40');
assert(txt('sc-gpudays-r') === '10,656' && txt('sc-gpudays-v') === '3,072', 'V100-days 10,656 and 3,072');

console.log('── section 9 ──');
assert(txt('bow-cos').indexOf('1.0000') === 0, 'bag-of-words: reordered caption has cosine 1.0000');
registry['bow-b'].value = 'a blue square'; run('bowUpdate();'); console.log('  red circle vs blue square: ' + txt('bow-cos'));
assert(parseFloat(txt('bow-cos')) < 0.999, 'a different caption is not identical (cosine < 0.999)');

console.log('── section 1 game ──');
assert(registry['game-imgs'].children.length === 5 && registry['game-caps'].children.length === 5, 'game renders 5 + 5 items');
run('game.links = {}; for(var i=0;i<5;i++){ game.links[i] = game.order.indexOf(i); } gameCheck();');
assert(txt('game-note').indexOf('5 of 5') >= 0, 'all-correct matching reports 5 of 5');
run('gameMatrix();'); assert(registry['game-note'].innerHTML.indexOf('&#10003;') >= 0, 'matrix view renders ticks');
run('gameShuffle(); game.links = {0:0,1:1,2:2,3:3,4:4}; gameCheck();'); console.log('  identity matching: ' + txt('game-note').slice(0, 20));
run('gameMatrix(); gameScale();'); assert(registry['game-scalebox'].style.display === '', 'scale-to-CLIP box is shown');
assert(32768 * 32768 - 32768 === 1073709056 && page.indexOf('1,073,709,056') >= 0, 'negatives at N=32,768 = 1,073,709,056 and the page prints it');
assert(page.indexOf('1,073,708,032') < 0, 'the wrong figure 1,073,708,032 does not appear anywhere');
assert(Math.abs(32768 / (32768 * 32768) * 100 - 0.00305) < 0.0001, 'positives share = 0.003%');
/* norm demo: the stretched T3 wins the raw dot product but not the cosine */
run('drawNorm();'); var nr0 = registry['norm-read'].innerHTML; console.log('  norm readout: ' + nr0.replace(/<[^>]+>/g, ''));
assert(nr0.indexOf('different winners') >= 0, 'raw dot and cosine pick different winners with the long text vector');
run('norm.pts[4].x *= 4; norm.pts[4].y *= 4; drawNorm();'); var nr1 = registry['norm-read'].innerHTML; console.log('  after stretching T2: ' + nr1.replace(/<[^>]+>/g, ''));
assert(nr1.indexOf('different winners') < 0 && nr1.indexOf('raw dot picks <b style="color:var(--txt)">T2') >= 0, 'stretching T2 ×4 makes the raw winner agree with cosine');

console.log('\n' + checks + ' checks, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
