"use strict";
var E = require('./engine.js');
function run(cfg){
  var m = E.makeModel(cfg.seed, { loss: 'softmax', temp: 'learn' }), rng = E.makeRng(cfg.seed * 7919), ev = E.makeEvalSet(999, 10), acc = [];
  for(var st = 0; st < cfg.steps; st++){
    var pairs = []; for(var i = 0; i < cfg.N; i++) pairs.push(E.makePair(rng, cfg.noise || 0));
    E.trainStep(m, pairs, cfg.lr);
    if((st + 1) % 300 === 0) acc.push(E.evaluate(m, ev).i2t);
  }
  return acc;
}
var seeds = [1,2,3,4,5,6,7,8,9,10,11,12];
[0.02, 0.05, 0.1].forEach(function(lr){
  [16, 32].forEach(function(N){
    var rows = seeds.map(function(sd){ return run({ seed: sd, N: N, lr: lr, steps: 1500 }); });
    var at = [0,1,2,3,4].map(function(k){ var ok = rows.filter(function(r){ return r[k] >= 0.9; }).length; return ok; });
    console.log('lr ' + lr + ' N=' + N + ': seeds ≥90% at step 300/600/900/1200/1500 = ' + at.join('/') + ' of 12   stuck at 1500: [' + rows.map(function(r,i){ return r[4] < 0.9 ? 's' + seeds[i] + '=' + (r[4]*100).toFixed(0) : null; }).filter(Boolean).join(' ') + ']');
  });
});
console.log('noise 0.1 lr 0.05 N=16:');
var rows = seeds.map(function(sd){ return run({ seed: sd, N: 16, lr: 0.05, steps: 900, noise: 0.1 }); });
console.log('  acc at 900: ' + rows.map(function(r){ return (r[2]*100).toFixed(0); }).join(' '));
