"use strict";
var E = require('./engine.js');
function run(cfg){
  var m = E.makeModel(cfg.seed || 1, { loss: cfg.loss, temp: cfg.temp });
  var rng = E.makeRng((cfg.seed || 1) * 7919);
  var ev = E.makeEvalSet(999, 10);
  var last;
  for(var step = 0; step < cfg.steps; step++){
    var pairs = []; for(var i = 0; i < cfg.N; i++) pairs.push(E.makePair(rng));
    last = E.trainStep(m, pairs, cfg.lr);
  }
  var e = E.evaluate(m, ev);
  return { i2t: e.i2t, loss: last.lo.loss, tau: 1 / E.scaleOf(m) };
}
console.log('── fixed budget of 6400 pairs seen (steps = 6400 / N) ──');
[2, 4, 8, 16, 32].forEach(function(N){
  var accs = [];
  for(var s = 1; s <= 6; s++) accs.push(run({ loss: 'softmax', temp: 'learn', N: N, lr: 0.02, steps: 6400 / N, seed: s }).i2t);
  var mean = accs.reduce(function(a, b){ return a + b; }, 0) / accs.length;
  console.log('  N=' + N + ' steps=' + (6400 / N) + ' mean i2t ' + (mean * 100).toFixed(1) + '%  [' + accs.map(function(a){ return (a * 100).toFixed(0); }).join(',') + ']');
});
console.log('── fixed budget of 1600 pairs seen ──');
[2, 4, 8, 16, 32].forEach(function(N){
  var accs = [];
  for(var s = 1; s <= 6; s++) accs.push(run({ loss: 'softmax', temp: 'learn', N: N, lr: 0.02, steps: 1600 / N, seed: s }).i2t);
  var mean = accs.reduce(function(a, b){ return a + b; }, 0) / accs.length;
  console.log('  N=' + N + ' steps=' + (1600 / N) + ' mean i2t ' + (mean * 100).toFixed(1) + '%  [' + accs.map(function(a){ return (a * 100).toFixed(0); }).join(',') + ']');
});
console.log('── loss floor: with tau fixed at 1, cosines in [-1,1] cap the softmax; theoretical min loss for N=16 ──');
(function(){
  // best case at tau=1: positive cosine 1, all negatives -1 → p = e^1 / (e^1 + 15 e^-1)
  var N = 16, p = Math.exp(1) / (Math.exp(1) + (N - 1) * Math.exp(-1));
  console.log('  ideal-geometry loss at tau=1, N=16: ' + (-Math.log(p)).toFixed(3) + '  (ln N = ' + Math.log(N).toFixed(3) + ')');
  var N2 = 32768, p2 = Math.exp(1) / (Math.exp(1) + (N2 - 1) * Math.exp(-1));
  console.log('  ideal-geometry loss at tau=1, N=32768: ' + (-Math.log(p2)).toFixed(3) + '  (ln N = ' + Math.log(N2).toFixed(3) + ')');
  // in 2-D, 9 clusters: negatives cannot all sit at cosine -1; nearest cluster ~40° apart
  var cosNear = Math.cos(2 * Math.PI / 9);
  console.log('  9 clusters on a circle: nearest neighbour cosine = ' + cosNear.toFixed(3));
})();
console.log('── per-step timing by batch size (browser budget) ──');
[8, 16, 32, 64].forEach(function(N){
  var m = E.makeModel(1, { loss: 'softmax', temp: 'learn' }), rng = E.makeRng(3);
  var t0 = Date.now();
  for(var s = 0; s < 300; s++){ var pairs = []; for(var i = 0; i < N; i++) pairs.push(E.makePair(rng)); E.trainStep(m, pairs, 0.02); }
  console.log('  N=' + N + ': ' + ((Date.now() - t0) / 300).toFixed(3) + ' ms/step');
});
