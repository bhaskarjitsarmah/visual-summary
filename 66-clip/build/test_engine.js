"use strict";
var E = require('./engine.js');
var fails = 0, checks = 0;
function assert(cond, msg){ checks++; if(!cond){ fails++; console.log('  FAIL: ' + msg); } else console.log('  ok:   ' + msg); }

/* ───────── 1. gradient check: analytic vs central differences ───────── */
function numGrad(m, pairs, getSet, eps){
  var v0 = getSet();
  getSet(v0 + eps); var lp = E.computeLossAndGrads(m, pairs).lo.loss;
  getSet(v0 - eps); var lm = E.computeLossAndGrads(m, pairs).lo.loss;
  getSet(v0);
  return (lp - lm) / (2 * eps);
}
function gradCheck(lossKind, tempMode){
  var rng = E.makeRng(7);
  var m = E.makeModel(11, { loss: lossKind, temp: tempMode });
  var pairs = []; for(var i = 0; i < 6; i++) pairs.push(E.makePair(rng));
  var r = E.computeLossAndGrads(m, pairs);
  var maxRel = 0, count = 0;
  var eps = 1e-5;
  ['img', 'txt'].forEach(function(tower){
    ['W1', 'b1', 'W2', 'b2'].forEach(function(key){
      var arr = m[tower][key], g = (tower === 'img' ? r.gi : r.gt)[key];
      for(var k = 0; k < arr.length; k += Math.max(1, Math.floor(arr.length / 12))){
        (function(idx){
          var ng = numGrad(m, pairs, function(v){ if(v !== undefined) arr[idx] = v; return arr[idx]; }, eps);
          var ag = g[idx];
          var rel = Math.abs(ng - ag) / Math.max(1e-6, Math.abs(ng) + Math.abs(ag));
          if(rel > maxRel) maxRel = rel; count++;
        })(k);
      }
    });
  });
  var ngT = numGrad(m, pairs, function(v){ if(v !== undefined) m.logT = v; return m.logT; }, eps);
  var relT = Math.abs(ngT - r.gLogT) / Math.max(1e-6, Math.abs(ngT) + Math.abs(r.gLogT));
  var relB = 0;
  if(lossKind === 'sigmoid'){
    var ngB = numGrad(m, pairs, function(v){ if(v !== undefined) m.bias = v; return m.bias; }, eps);
    relB = Math.abs(ngB - r.gBias) / Math.max(1e-6, Math.abs(ngB) + Math.abs(r.gBias));
  }
  console.log('gradcheck ' + lossKind + '/' + tempMode + ': ' + count + ' weights, max rel err ' + maxRel.toExponential(2) + ', logT rel ' + relT.toExponential(2) + ', bias rel ' + relB.toExponential(2));
  assert(maxRel < 1e-4, 'weight gradients match central differences (' + lossKind + ')');
  assert(relT < 1e-4, 'log-temperature gradient matches (' + lossKind + ')');
  if(lossKind === 'sigmoid') assert(relB < 1e-4, 'sigmoid bias gradient matches');
}
console.log('── gradient checks ──');
gradCheck('softmax', 'learn');
gradCheck('sigmoid', 'learn');

/* ───────── 2. loss at init ≈ ln N for the softmax objective ───────── */
console.log('── init loss vs ln N ──');
[2, 4, 8, 16, 32].forEach(function(N){
  var acc = 0, K = 20;
  for(var t = 0; t < K; t++){
    var m = E.makeModel(100 + t, { loss: 'softmax', temp: 1.0 });   // tau = 1 so logits are just cosines in [-1,1]
    var rng = E.makeRng(500 + t), pairs = []; for(var i = 0; i < N; i++) pairs.push(E.makePair(rng));
    acc += E.computeLossAndGrads(m, pairs).lo.loss;
  }
  var mean = acc / K;
  console.log('  N=' + N + ' init loss (tau=1) ' + mean.toFixed(3) + '  ln N = ' + Math.log(N).toFixed(3));
});
[2, 8, 32].forEach(function(N){
  var acc = 0, K = 20;
  for(var t = 0; t < K; t++){
    var m = E.makeModel(100 + t, { loss: 'softmax', temp: 'learn' });   // tau = 0.07 init
    var rng = E.makeRng(500 + t), pairs = []; for(var i = 0; i < N; i++) pairs.push(E.makePair(rng));
    acc += E.computeLossAndGrads(m, pairs).lo.loss;
  }
  console.log('  N=' + N + ' init loss (tau=0.07) ' + (acc / K).toFixed(3) + '  ln N = ' + Math.log(N).toFixed(3));
});

/* ───────── 3. training runs ───────── */
function run(cfg){
  var m = E.makeModel(cfg.seed || 1, { loss: cfg.loss, temp: cfg.temp });
  var rng = E.makeRng((cfg.seed || 1) * 7919);
  var ev = E.makeEvalSet(999, 10);
  var t0 = Date.now(), hist = [];
  var e0 = E.evaluate(m, ev);
  for(var step = 0; step < cfg.steps; step++){
    var pairs = []; for(var i = 0; i < cfg.N; i++) pairs.push(E.makePair(rng));
    var r = E.trainStep(m, pairs, cfg.lr);
    if(step % 50 === 0 || step === cfg.steps - 1){
      var e = E.evaluate(m, ev);
      hist.push({ step: step, loss: r.lo.loss, i2t: e.i2t, t2i: e.t2i, gap: e.gap, tau: 1 / E.scaleOf(m), bias: m.bias });
    }
  }
  var ms = Date.now() - t0;
  var last = hist[hist.length - 1];
  return { m: m, ev: ev, hist: hist, ms: ms, last: last, init: e0 };
}
function fmt(h){ return 'step ' + h.step + ' loss ' + h.loss.toFixed(3) + ' i2t ' + (h.i2t * 100).toFixed(1) + '% t2i ' + (h.t2i * 100).toFixed(1) + '% gap ' + h.gap.toFixed(3) + ' tau ' + h.tau.toFixed(4) + (h.bias ? ' b ' + h.bias.toFixed(2) : ''); }

console.log('── baseline: softmax, learnable tau, N=16, lr=0.02, 600 steps ──');
var base = run({ loss: 'softmax', temp: 'learn', N: 16, lr: 0.02, steps: 600, seed: 1 });
base.hist.forEach(function(h){ if(h.step % 100 === 0 || h.step === 599) console.log('  ' + fmt(h)); });
console.log('  init: i2t ' + (base.init.i2t * 100).toFixed(1) + '% gap ' + base.init.gap.toFixed(3) + '   time ' + base.ms + ' ms for 600 steps');
assert(base.last.i2t >= 0.95, 'baseline reaches ≥95% image→text accuracy on held-out set');
assert(base.last.t2i >= 0.95, 'baseline reaches ≥95% text→image accuracy');
assert(base.init.i2t < 0.5, 'untrained model is poor (' + (base.init.i2t * 100).toFixed(0) + '%)');
assert(base.ms < 4000, 'baseline trains 600 steps in under 4 s in node (' + base.ms + ' ms)');

console.log('── seeds sweep (does it converge reliably?) ──');
var seedsOk = 0;
for(var sd = 1; sd <= 8; sd++){
  var rr = run({ loss: 'softmax', temp: 'learn', N: 16, lr: 0.02, steps: 600, seed: sd });
  console.log('  seed ' + sd + ': ' + fmt(rr.last) + '  init gap ' + rr.init.gap.toFixed(3));
  if(rr.last.i2t >= 0.9) seedsOk++;
}
assert(seedsOk >= 7, 'at least 7/8 seeds reach ≥90% (' + seedsOk + '/8)');

console.log('── batch size sweep at fixed 400 steps ──');
[2, 4, 8, 16, 32].forEach(function(N){
  var accs = [];
  for(var s = 1; s <= 4; s++){ var r2 = run({ loss: 'softmax', temp: 'learn', N: N, lr: 0.02, steps: 400, seed: s }); accs.push(r2.last.i2t); }
  var mean = accs.reduce(function(a, b){ return a + b; }, 0) / accs.length;
  console.log('  N=' + N + ' mean i2t ' + (mean * 100).toFixed(1) + '%  [' + accs.map(function(a){ return (a * 100).toFixed(0); }).join(',') + ']');
});

console.log('── temperature sweep, N=16, 600 steps ──');
[{ t: 1.0, name: 'fixed 1.0' }, { t: 0.3, name: 'fixed 0.3' }, { t: 0.07, name: 'fixed 0.07' }, { t: 0.01, name: 'fixed 0.01' }, { t: 'learn', name: 'learnable' }].forEach(function(c){
  var accs = [], losses = [], taus = [];
  for(var s = 1; s <= 4; s++){ var r3 = run({ loss: 'softmax', temp: c.t, N: 16, lr: 0.02, steps: 600, seed: s }); accs.push(r3.last.i2t); losses.push(r3.last.loss); taus.push(r3.last.tau); }
  var mean = accs.reduce(function(a, b){ return a + b; }, 0) / accs.length;
  var ml = losses.reduce(function(a, b){ return a + b; }, 0) / losses.length;
  console.log('  ' + c.name + ': mean i2t ' + (mean * 100).toFixed(1) + '% mean final loss ' + ml.toFixed(3) + ' final tau ' + taus.map(function(x){ return x.toFixed(3); }).join('/'));
});

console.log('── sigmoid (SigLIP) N=16, 600 steps ──');
var sig = run({ loss: 'sigmoid', temp: 'learn', N: 16, lr: 0.02, steps: 600, seed: 1 });
sig.hist.forEach(function(h){ if(h.step % 100 === 0 || h.step === 599) console.log('  ' + fmt(h)); });
assert(sig.last.i2t >= 0.9, 'sigmoid loss also reaches ≥90% (' + (sig.last.i2t * 100).toFixed(0) + '%)');
console.log('  time ' + sig.ms + ' ms');

console.log('── modality gap at init (cone effect) across seeds ──');
var gaps = [];
for(var g = 1; g <= 12; g++){ var mm = E.makeModel(g, { loss: 'softmax', temp: 'learn' }); var ee = E.evaluate(mm, E.makeEvalSet(999, 10)); gaps.push(ee.gap); }
console.log('  init gaps: ' + gaps.map(function(x){ return x.toFixed(2); }).join(' '));
/* how spread are image embeddings at init? angular std */
(function(){
  var mm = E.makeModel(1, { loss: 'softmax', temp: 'learn' }); var ee = E.evaluate(mm, E.makeEvalSet(999, 10));
  function angSpread(P){ var mx = 0, my = 0; P.forEach(function(p){ mx += p[0]; my += p[1]; }); var R = Math.sqrt(mx * mx + my * my) / P.length; return R; }
  console.log('  init mean resultant length: images ' + angSpread(ee.U).toFixed(3) + ' texts ' + angSpread(ee.V).toFixed(3) + '  (1 = all points at one angle, 0 = uniform)');
})();

console.log('── zero-shot prompt template effect, averaged over 8 trained seeds ──');
(function(){
  var imgs = E.makeEvalSet(4242, 20).imgs;
  function accFor(m, caps){ return E.evaluate(m, { imgs: imgs, caps: caps }).i2t; }
  function capsFrom(words){ var caps = []; for(var c = 0; c < 3; c++) for(var s = 0; s < 3; s++) caps.push({ y: E.tokensToVec(words.map(function(w){ return w === 'C' ? E.COLORS[c] : (w === 'S' ? E.SHAPES[s] : w); })), id: c * 3 + s, c: c, s: s }); return caps; }
  var probes = { 'a photo of a C S': ['a', 'photo', 'of', 'a', 'C', 'S'], 'C S (bare)': ['C', 'S'], 'the S is C': ['the', 'S', 'is', 'C'], 'photo photo photo C S': ['photo', 'photo', 'photo', 'C', 'S'], 'small small small C S': ['small', 'small', 'small', 'C', 'S'] };
  var sums = {}, ens = 0, nuis0 = 0, nuis1 = 0, pc0 = 0, pc1 = 0, K = 8;
  Object.keys(probes).forEach(function(k){ sums[k] = 0; });
  for(var sd = 1; sd <= K; sd++){
    var m0 = E.makeModel(sd, { loss: 'softmax', temp: 'learn' });
    var r = run({ loss: 'softmax', temp: 'learn', N: 16, lr: 0.02, steps: 600, seed: sd });
    Object.keys(probes).forEach(function(k){ sums[k] += accFor(r.m, capsFrom(probes[k])); });
    /* prompt ensembling: average the class vectors of 4 templates, renormalise */
    var T = [['a', 'photo', 'of', 'a', 'C', 'S'], ['a', 'picture', 'of', 'a', 'C', 'S'], ['the', 'S', 'is', 'C'], ['an', 'image', 'of', 'a', 'C', 'S']];
    var capsE = [];
    for(var c = 0; c < 3; c++) for(var s = 0; s < 3; s++){
      var v = [0, 0];
      T.forEach(function(t){ var u = E.embedText(r.m, { y: E.tokensToVec(t.map(function(w){ return w === 'C' ? E.COLORS[c] : (w === 'S' ? E.SHAPES[s] : w); })) }); v[0] += u[0]; v[1] += u[1]; });
      var n = Math.hypot(v[0], v[1]) || 1e-9; capsE.push({ vec: [v[0] / n, v[1] / n], id: c * 3 + s });
    }
    var hit = 0; imgs.forEach(function(im){ var u = E.embedImage(r.m, im), best = -2, bi = 0; capsE.forEach(function(cp, i){ var d = E.cos2(u, cp.vec); if(d > best){ best = d; bi = i; } }); if(capsE[bi].id === im.id) hit++; });
    ens += hit / imgs.length;
    nuis0 += E.nuisanceProbe(m0); nuis1 += E.nuisanceProbe(r.m);
    pc0 += E.evaluate(m0, E.makeEvalSet(999, 10)).posCos; pc1 += r.last.posCos == null ? E.evaluate(r.m, E.makeEvalSet(999, 10)).posCos : r.last.posCos;
  }
  Object.keys(probes).forEach(function(k){ console.log('  "' + k + '": mean i2t ' + (sums[k] / K * 100).toFixed(1) + '%'); });
  console.log('  ensemble of 4 templates: mean i2t ' + (ens / K * 100).toFixed(1) + '%');
  console.log('  nuisance probe (size 0.6 -> 1.0 moves the embedding by): init ' + (nuis0 / K).toFixed(1) + '°, trained ' + (nuis1 / K).toFixed(1) + '°');
  console.log('  positive-pair cosine: init ' + (pc0 / K).toFixed(3) + ', trained ' + (pc1 / K).toFixed(3));
  assert(sums['a photo of a C S'] / K >= 0.95, 'canonical template ≥ 95% on average');
})();

console.log('── noisy captions (20% mislabelled), N=16, 600 steps ──');
(function(){
  var accs = [], losses = [];
  for(var sd = 1; sd <= 4; sd++){
    var m = E.makeModel(sd, { loss: 'softmax', temp: 'learn' }), rng = E.makeRng(sd * 7919), ev = E.makeEvalSet(999, 10), last;
    for(var st = 0; st < 600; st++){ var pairs = []; for(var i = 0; i < 16; i++) pairs.push(E.makePair(rng, 0.2)); last = E.trainStep(m, pairs, 0.02); }
    accs.push(E.evaluate(m, ev).i2t); losses.push(last.lo.loss);
  }
  console.log('  i2t: ' + accs.map(function(a){ return (a * 100).toFixed(0) + '%'; }).join(' ') + '   final loss: ' + losses.map(function(l){ return l.toFixed(2); }).join(' '));
})();

console.log('\n' + checks + ' checks, ' + fails + ' failures');
process.exit(fails ? 1 : 0);
