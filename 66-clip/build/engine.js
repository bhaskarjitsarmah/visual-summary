/* ═══════════ CLIP-in-miniature engine (pure functions, no DOM) ═══════════ */
"use strict";

/* seeded RNG (mulberry32) so a reset is reproducible */
function makeRng(seed){
  var a = seed >>> 0;
  var r = function(){
    a = (a + 0x6D2B79F5) >>> 0;
    var t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.gauss = function(){ var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  r.int = function(n){ return Math.floor(r() * n); };
  return r;
}

/* ── the toy world: 3 colours × 3 shapes = 9 concepts ── */
var COLORS = ['red', 'green', 'blue'];
var SHAPES = ['circle', 'square', 'triangle'];
var VOCAB  = ['a', 'an', 'photo', 'picture', 'image', 'of', 'the', 'is', 'small', 'large',
              'red', 'green', 'blue', 'circle', 'square', 'triangle'];   // 16 tokens
var IMG_DIM = 3 + 3 + 2 + 4;   // colour one-hot, shape one-hot, size, x-position, 4 noise dims
var TXT_DIM = VOCAB.length;
var EMB_DIM = 2;               // so every embedding lives on the unit circle
var HID     = 16;

/* every training caption is a sentence around the concept — a bare "red circle" never occurs,
   so at zero-shot time the bare label is genuinely out of distribution (as in web captions) */
var TEMPLATES = [
  ['a', 'photo', 'of', 'a', 'C', 'S'],
  ['a', 'photo', 'of', 'a', 'C', 'S'],
  ['a', 'photo', 'of', 'the', 'C', 'S'],
  ['a', 'picture', 'of', 'a', 'C', 'S'],
  ['an', 'image', 'of', 'a', 'C', 'S'],
  ['the', 'S', 'is', 'C'],
  ['a', 'picture', 'of', 'a', 'small', 'C', 'S'],
  ['a', 'photo', 'of', 'a', 'large', 'C', 'S'],
];
/* the best loss any geometry can reach when cosines are bounded in [-1, 1]:
   positive at +1, every negative at -1, N candidates, temperature tau */
function floorLoss(N, tau){ return Math.log(1 + (N - 1) * Math.exp(-2 / tau)); }
/* the floor set by duplicate concepts in a batch: if k_i items share item i's concept, the best any
   model can do for that row is spread probability evenly over the k_i, costing ln k_i */
function dupFloor(pairs){
  var N = pairs.length, s = 0, counts = {};
  for(var i = 0; i < N; i++) counts[pairs[i].img.id] = (counts[pairs[i].img.id] || 0) + 1;
  for(i = 0; i < N; i++) s += Math.log(counts[pairs[i].img.id]);
  return s / N;
}

function conceptId(c, s){ return c * 3 + s; }

/* an "image": a feature vector plus the metadata we render it from */
function makeImage(rng, c, s){
  var x = new Float64Array(IMG_DIM);
  x[c] = 1; x[3 + s] = 1;
  var size = 0.6 + 0.4 * rng();          // 0.6 .. 1.0
  var px   = rng() * 2 - 1;              // -1 .. 1
  x[6] = size; x[7] = px;
  for(var k = 8; k < IMG_DIM; k++) x[k] = 0.5 * rng.gauss();
  return { x: x, c: c, s: s, id: conceptId(c, s), size: size, px: px };
}

/* a "caption": a bag-of-tokens vector plus the words */
function tokensToVec(words){
  var v = new Float64Array(TXT_DIM);
  for(var i = 0; i < words.length; i++){
    var k = VOCAB.indexOf(words[i]);
    if(k < 0) throw new Error('unknown token ' + words[i]);
    v[k] += 1;
  }
  return v;
}
function captionWords(c, s, tmpl){
  return tmpl.map(function(w){ return w === 'C' ? COLORS[c] : (w === 'S' ? SHAPES[s] : w); });
}
function makeCaption(rng, c, s, tmplIndex){
  var t = TEMPLATES[tmplIndex == null ? rng.int(TEMPLATES.length) : tmplIndex];
  var words = captionWords(c, s, t);
  return { y: tokensToVec(words), words: words, c: c, s: s, id: conceptId(c, s) };
}
function makePair(rng, noise){
  var c = rng.int(3), s = rng.int(3);
  var img = makeImage(rng, c, s), cap;
  if(noise && rng() < noise){                     // a mislabelled web pair: the caption describes some other concept
    cap = makeCaption(rng, rng.int(3), rng.int(3)); cap.noisy = true;
  } else cap = makeCaption(rng, c, s);
  return { img: img, cap: cap };
}

/* ── a 2-layer MLP encoder: in → HID (tanh) → EMB_DIM ── */
function makeMLP(rng, inDim){
  var W1 = new Float64Array(HID * inDim), b1 = new Float64Array(HID);
  var W2 = new Float64Array(EMB_DIM * HID), b2 = new Float64Array(EMB_DIM);
  var s1 = 1 / Math.sqrt(inDim), s2 = 1 / Math.sqrt(HID);
  for(var i = 0; i < W1.length; i++) W1[i] = rng.gauss() * s1;
  for(var j = 0; j < W2.length; j++) W2[j] = rng.gauss() * s2;
  return { inDim: inDim, W1: W1, b1: b1, W2: W2, b2: b2 };
}
/* forward one input; returns {h, z, u, nz} — u is the L2-normalised embedding */
function mlpForward(m, x){
  var h = new Float64Array(HID), z = new Float64Array(EMB_DIM);
  for(var i = 0; i < HID; i++){
    var a = m.b1[i], row = i * m.inDim;
    for(var k = 0; k < m.inDim; k++) a += m.W1[row + k] * x[k];
    h[i] = Math.tanh(a);
  }
  for(var o = 0; o < EMB_DIM; o++){
    var zz = m.b2[o], r2 = o * HID;
    for(var q = 0; q < HID; q++) zz += m.W2[r2 + q] * h[q];
    z[o] = zz;
  }
  var nz = 0; for(var d = 0; d < EMB_DIM; d++) nz += z[d] * z[d];
  nz = Math.sqrt(nz) + 1e-12;
  var u = new Float64Array(EMB_DIM); for(d = 0; d < EMB_DIM; d++) u[d] = z[d] / nz;
  return { h: h, z: z, u: u, nz: nz };
}
/* backward: gu = dLoss/du; accumulates into grads g (same shapes as m) */
function mlpBackward(m, x, fw, gu, g){
  var d, q, k;
  /* through L2 normalisation: gz = (gu - u (u·gu)) / |z| */
  var dot = 0; for(d = 0; d < EMB_DIM; d++) dot += fw.u[d] * gu[d];
  var gz = new Float64Array(EMB_DIM);
  for(d = 0; d < EMB_DIM; d++) gz[d] = (gu[d] - fw.u[d] * dot) / fw.nz;
  /* through W2 */
  var gh = new Float64Array(HID);
  for(d = 0; d < EMB_DIM; d++){
    var r2 = d * HID;
    g.b2[d] += gz[d];
    for(q = 0; q < HID; q++){ g.W2[r2 + q] += gz[d] * fw.h[q]; gh[q] += m.W2[r2 + q] * gz[d]; }
  }
  /* through tanh and W1 */
  for(q = 0; q < HID; q++){
    var ga = gh[q] * (1 - fw.h[q] * fw.h[q]);
    g.b1[q] += ga;
    var row = q * m.inDim;
    for(k = 0; k < m.inDim; k++) g.W1[row + k] += ga * x[k];
  }
}
function zeroLike(m){
  return { W1: new Float64Array(m.W1.length), b1: new Float64Array(m.b1.length),
           W2: new Float64Array(m.W2.length), b2: new Float64Array(m.b2.length) };
}

/* ── the model: two towers + logit scale (+ bias for sigmoid) ── */
/* opts.loss: 'softmax' | 'sigmoid'; opts.temp: 'learn' | number (fixed tau) */
function makeModel(seed, opts){
  var rng = makeRng(seed);
  var m = {
    img: makeMLP(rng, IMG_DIM),
    txt: makeMLP(rng, TXT_DIM),
    loss: opts.loss || 'softmax',
    tempMode: opts.temp == null ? 'learn' : opts.temp,
    logT: 0, bias: 0, step: 0, rng: rng,
  };
  if(m.loss === 'sigmoid'){ m.logT = Math.log(10); m.bias = -10; }      // SigLIP init: t' = log 10, b = -10
  else m.logT = Math.log(1 / 0.07);                                        // CLIP init: tau = 0.07
  if(typeof m.tempMode === 'number') m.logT = Math.log(1 / m.tempMode);
  m.adam = { i: zeroLike(m.img), t: zeroLike(m.txt), i2: zeroLike(m.img), t2: zeroLike(m.txt),
             logT: [0, 0], bias: [0, 0] };
  return m;
}
function scaleOf(m){ return Math.exp(m.logT); }

/* forward a batch of pairs; returns everything needed for the loss and for drawing */
function forwardBatch(m, pairs){
  var N = pairs.length, fi = [], ft = [], U = [], V = [];
  for(var i = 0; i < N; i++){
    fi.push(mlpForward(m.img, pairs[i].img.x)); U.push(fi[i].u);
    ft.push(mlpForward(m.txt, pairs[i].cap.y)); V.push(ft[i].u);
  }
  var C = new Float64Array(N * N);                       // cosine similarities
  for(i = 0; i < N; i++) for(var j = 0; j < N; j++){
    var d = 0; for(var k = 0; k < EMB_DIM; k++) d += U[i][k] * V[j][k];
    C[i * N + j] = d;
  }
  return { N: N, fi: fi, ft: ft, U: U, V: V, C: C };
}

/* loss value + dLoss/dLogit for the symmetric softmax (CLIP) objective.
   logits L_ij = s * C_ij.  loss = ½(CE over rows + CE over columns), CE averaged over N. */
function softmaxLoss(N, C, s){
  var L = new Float64Array(N * N), G = new Float64Array(N * N), i, j;
  for(i = 0; i < N * N; i++) L[i] = s * C[i];
  var lossRow = 0, lossCol = 0;
  var Prow = new Float64Array(N * N), Pcol = new Float64Array(N * N);
  for(i = 0; i < N; i++){                                  // image i → which text?
    var mx = -Infinity; for(j = 0; j < N; j++) mx = Math.max(mx, L[i * N + j]);
    var Z = 0; for(j = 0; j < N; j++) Z += Math.exp(L[i * N + j] - mx);
    for(j = 0; j < N; j++) Prow[i * N + j] = Math.exp(L[i * N + j] - mx) / Z;
    lossRow += -Math.log(Prow[i * N + i]);
  }
  for(j = 0; j < N; j++){                                  // text j → which image?
    var mx2 = -Infinity; for(i = 0; i < N; i++) mx2 = Math.max(mx2, L[i * N + j]);
    var Z2 = 0; for(i = 0; i < N; i++) Z2 += Math.exp(L[i * N + j] - mx2);
    for(i = 0; i < N; i++) Pcol[i * N + j] = Math.exp(L[i * N + j] - mx2) / Z2;
    lossCol += -Math.log(Pcol[j * N + j]);
  }
  for(i = 0; i < N; i++) for(j = 0; j < N; j++){
    var dij = i === j ? 1 : 0;
    G[i * N + j] = 0.5 * ((Prow[i * N + j] - dij) + (Pcol[i * N + j] - dij)) / N;
  }
  return { loss: 0.5 * (lossRow + lossCol) / N, lossRow: lossRow / N, lossCol: lossCol / N,
           L: L, G: G, Prow: Prow, Pcol: Pcol };
}
/* SigLIP: l_ij = s*C_ij + b ; z_ij = +1 on the diagonal, -1 elsewhere ;
   loss = -(1/N) Σ_ij log σ(z_ij l_ij) */
function sigmoidLoss(N, C, s, b){
  var L = new Float64Array(N * N), G = new Float64Array(N * N), P = new Float64Array(N * N), loss = 0;
  for(var i = 0; i < N; i++) for(var j = 0; j < N; j++){
    var l = s * C[i * N + j] + b, z = i === j ? 1 : -1;
    L[i * N + j] = l;
    var sig = 1 / (1 + Math.exp(-z * l));                 // σ(z l) = probability the pair is labelled correctly
    P[i * N + j] = 1 / (1 + Math.exp(-l));                // σ(l)   = model's "is a match" probability
    loss += -Math.log(Math.max(sig, 1e-300));
    G[i * N + j] = -z * (1 - sig) / N;
  }
  return { loss: loss / N, L: L, G: G, P: P };
}

/* one full training step on a batch; returns the forward + loss for drawing */
function computeLossAndGrads(m, pairs){
  var fw = forwardBatch(m, pairs), N = fw.N, s = scaleOf(m);
  var lo = m.loss === 'sigmoid' ? sigmoidLoss(N, fw.C, s, m.bias) : softmaxLoss(N, fw.C, s);
  var gi = zeroLike(m.img), gt = zeroLike(m.txt), gS = 0, gB = 0, i, j, k;
  var gU = [], gV = [];
  for(i = 0; i < N; i++){ gU.push(new Float64Array(EMB_DIM)); gV.push(new Float64Array(EMB_DIM)); }
  for(i = 0; i < N; i++) for(j = 0; j < N; j++){
    var g = lo.G[i * N + j];
    for(k = 0; k < EMB_DIM; k++){ gU[i][k] += s * g * fw.V[j][k]; gV[j][k] += s * g * fw.U[i][k]; }
    gS += g * fw.C[i * N + j];
    gB += g;
  }
  for(i = 0; i < N; i++){
    mlpBackward(m.img, pairs[i].img.x, fw.fi[i], gU[i], gi);
    mlpBackward(m.txt, pairs[i].cap.y, fw.ft[i], gV[i], gt);
  }
  return { fw: fw, lo: lo, gi: gi, gt: gt, gLogT: gS * s, gBias: gB, gU: gU, gV: gV };
}

/* Adam update (β1=.9, β2=.999) with bias correction; m1/m2 are the moment arrays, t the step */
function adamArr(p, g, m1, m2, lr, t){
  var b1 = 0.9, b2 = 0.999, eps = 1e-8;
  var c1 = 1 - Math.pow(b1, t), c2 = 1 - Math.pow(b2, t);
  for(var i = 0; i < p.length; i++){
    m1[i] = b1 * m1[i] + (1 - b1) * g[i];
    m2[i] = b2 * m2[i] + (1 - b2) * g[i] * g[i];
    p[i] -= lr * (m1[i] / c1) / (Math.sqrt(m2[i] / c2) + eps);
  }
}
function trainStep(m, pairs, lr){
  var r = computeLossAndGrads(m, pairs);
  m.step++;
  var t = m.step, A = m.adam;
  ['W1', 'b1', 'W2', 'b2'].forEach(function(key){
    adamArr(m.img[key], r.gi[key], A.i[key], A.i2[key], lr, t);
    adamArr(m.txt[key], r.gt[key], A.t[key], A.t2[key], lr, t);
  });
  if(m.tempMode === 'learn'){
    var p = [m.logT], m1 = [A.logT[0]], m2 = [A.logT[1]];
    adamArr(p, [r.gLogT], m1, m2, lr, t);
    A.logT[0] = m1[0]; A.logT[1] = m2[0];
    m.logT = p[0];
    if(m.logT > Math.log(100)) m.logT = Math.log(100);          // CLIP: never scale logits by more than 100
  }
  if(m.loss === 'sigmoid'){
    var pb = [m.bias], n1 = [A.bias[0]], n2 = [A.bias[1]];
    adamArr(pb, [r.gBias], n1, n2, lr, t);
    A.bias[0] = n1[0]; A.bias[1] = n2[0];
    m.bias = pb[0];
  }
  return r;
}

/* ── evaluation helpers ── */
function embedImage(m, img){ return mlpForward(m.img, img.x).u; }
function embedText(m, cap){ return mlpForward(m.txt, cap.y).u; }
function cos2(a, b){ var d = 0; for(var k = 0; k < EMB_DIM; k++) d += a[k] * b[k]; return d; }

/* held-out set: nPer images per concept + one canonical caption per concept */
function makeEvalSet(seed, nPer, tmplIndex){
  var rng = makeRng(seed), imgs = [], caps = [];
  for(var c = 0; c < 3; c++) for(var s = 0; s < 3; s++){
    caps.push(makeCaption(rng, c, s, tmplIndex == null ? 0 : tmplIndex));
    for(var n = 0; n < nPer; n++) imgs.push(makeImage(rng, c, s));
  }
  return { imgs: imgs, caps: caps };
}
/* image→text top-1 over the 9 canonical captions; text→image top-1 over all images */
function evaluate(m, ev){
  var U = ev.imgs.map(function(im){ return embedImage(m, im); });
  var V = ev.caps.map(function(cp){ return embedText(m, cp); });
  var hit = 0, i, j;
  for(i = 0; i < U.length; i++){
    var best = -1, bj = -1;
    for(j = 0; j < V.length; j++){ var d = cos2(U[i], V[j]); if(d > best){ best = d; bj = j; } }
    if(ev.caps[bj].id === ev.imgs[i].id) hit++;
  }
  var hit2 = 0;
  for(j = 0; j < V.length; j++){
    var best2 = -1, bi = -1;
    for(i = 0; i < U.length; i++){ var d2 = cos2(U[i], V[j]); if(d2 > best2){ best2 = d2; bi = i; } }
    if(ev.imgs[bi].id === ev.caps[j].id) hit2++;
  }
  /* how concentrated is each modality? mean resultant length: 1 = one narrow cone, 0 = spread evenly */
  var mu = [0, 0], mv = [0, 0];
  for(i = 0; i < U.length; i++){ mu[0] += U[i][0] / U.length; mu[1] += U[i][1] / U.length; }
  for(j = 0; j < V.length; j++){ mv[0] += V[j][0] / V.length; mv[1] += V[j][1] / V.length; }
  var gap = Math.sqrt((mu[0] - mv[0]) * (mu[0] - mv[0]) + (mu[1] - mv[1]) * (mu[1] - mv[1]));
  var coneI = Math.sqrt(mu[0] * mu[0] + mu[1] * mu[1]), coneT = Math.sqrt(mv[0] * mv[0] + mv[1] * mv[1]);
  /* positive-pair cosine: each image against the canonical caption of its own concept (honest on a circle) */
  var pc = 0, byId = {};
  for(j = 0; j < V.length; j++) byId[ev.caps[j].id] = V[j];
  for(i = 0; i < U.length; i++) pc += cos2(U[i], byId[ev.imgs[i].id]);
  return { i2t: hit / U.length, t2i: hit2 / V.length, gap: gap, coneI: coneI, coneT: coneT, posCos: pc / U.length, U: U, V: V, mu: mu, mv: mv };
}
/* nuisance probe: change only the size of an image (a feature no caption ever mentions) and
   measure how far its embedding moves, in degrees, averaged over concepts and noise draws */
function nuisanceProbe(m, seed){
  var rng = makeRng(seed || 31), tot = 0, n = 0;
  for(var c = 0; c < 3; c++) for(var s = 0; s < 3; s++) for(var k = 0; k < 4; k++){
    var a = makeImage(rng, c, s), b = { x: new Float64Array(a.x) };
    a.x[6] = 0.6; b.x[6] = 1.0;
    var ua = mlpForward(m.img, a.x).u, ub = mlpForward(m.img, b.x).u;
    var d = Math.acos(Math.max(-1, Math.min(1, cos2(ua, ub)))) * 180 / Math.PI;
    tot += d; n++;
  }
  return tot / n;
}

if(typeof module !== 'undefined') module.exports = {
  makeRng: makeRng, COLORS: COLORS, SHAPES: SHAPES, VOCAB: VOCAB, TEMPLATES: TEMPLATES,
  IMG_DIM: IMG_DIM, TXT_DIM: TXT_DIM, EMB_DIM: EMB_DIM, HID: HID,
  makeImage: makeImage, makeCaption: makeCaption, makePair: makePair, tokensToVec: tokensToVec, captionWords: captionWords,
  makeModel: makeModel, scaleOf: scaleOf, forwardBatch: forwardBatch, softmaxLoss: softmaxLoss, sigmoidLoss: sigmoidLoss,
  computeLossAndGrads: computeLossAndGrads, trainStep: trainStep, zeroLike: zeroLike, mlpForward: mlpForward,
  embedImage: embedImage, embedText: embedText, cos2: cos2, makeEvalSet: makeEvalSet, evaluate: evaluate,
  floorLoss: floorLoss, dupFloor: dupFloor, nuisanceProbe: nuisanceProbe,
};
