"use strict";
var E = require('./engine.js');
function evalAttr(m, ev){
  var U = ev.imgs.map(function(im){ return E.embedImage(m, im); });
  var V = ev.caps.map(function(cp){ return E.embedText(m, cp); });
  var hitC = 0, hitS = 0, hit = 0;
  for(var i = 0; i < U.length; i++){
    var best = -1, bj = -1;
    for(var j = 0; j < V.length; j++){ var d = E.cos2(U[i], V[j]); if(d > best){ best = d; bj = j; } }
    if(ev.caps[bj].c === ev.imgs[i].c) hitC++;
    if(ev.caps[bj].s === ev.imgs[i].s) hitS++;
    if(ev.caps[bj].id === ev.imgs[i].id) hit++;
  }
  return { all: hit / U.length, color: hitC / U.length, shape: hitS / U.length };
}
function run(N, steps, seed){
  var m = E.makeModel(seed, { loss: 'softmax', temp: 'learn' }), rng = E.makeRng(seed * 7919), ev = E.makeEvalSet(999, 10);
  for(var s = 0; s < steps; s++){ var pairs = []; for(var i = 0; i < N; i++) pairs.push(E.makePair(rng)); E.trainStep(m, pairs, 0.02); }
  return evalAttr(m, ev);
}
console.log('fixed 6400 pairs: accuracy overall / colour-correct / shape-correct');
[2, 4, 8, 16, 32].forEach(function(N){
  var rows = [];
  for(var s = 1; s <= 6; s++){ var r = run(N, 6400 / N, s); rows.push((r.all*100).toFixed(0) + '(' + (r.color*100).toFixed(0) + '/' + (r.shape*100).toFixed(0) + ')'); }
  console.log('  N=' + N + ': ' + rows.join('  '));
});
console.log('fixed 400 steps:');
[2, 4, 8, 16, 32].forEach(function(N){
  var rows = [];
  for(var s = 1; s <= 6; s++){ var r = run(N, 400, s); rows.push((r.all*100).toFixed(0) + '(' + (r.color*100).toFixed(0) + '/' + (r.shape*100).toFixed(0) + ')'); }
  console.log('  N=' + N + ': ' + rows.join('  '));
});
console.log('how often does a batch of N contain a negative sharing the colour of pair 0? (analytic: 1-(2/3)^(N-1))');
[2,4,8,16,32].forEach(function(N){ console.log('  N=' + N + ': ' + (100*(1-Math.pow(2/3,N-1))).toFixed(1) + '%'); });
