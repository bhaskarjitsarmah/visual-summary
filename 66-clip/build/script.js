
/* ═══════════════ GATE ═══════════════ */
(function(){ if(localStorage.getItem('pg_unlocked_66')==='1') document.getElementById('gate').style.display='none'; })();
function checkGate(){
  if(document.getElementById('gate-input').value==='visual2025'){
    localStorage.setItem('pg_unlocked_66','1');
    document.getElementById('gate').style.display='none';
    setTimeout(redrawAll, 50);          // canvases size from clientWidth; redraw once the overlay is gone
  } else document.getElementById('gate-err').style.display='block';
}

/* ═══════════════ SMALL HELPERS ═══════════════ */
function $(id){ return document.getElementById(id); }
function clamp(x, a, b){ return x < a ? a : (x > b ? b : x); }
function fmtInt(n){ return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function fmtBig(n){
  if(n >= 1e12) return (n / 1e12).toFixed(2) + ' T';
  if(n >= 1e9)  return (n / 1e9).toFixed(2) + ' B';
  if(n >= 1e6)  return (n / 1e6).toFixed(1) + ' M';
  if(n >= 1e3)  return (n / 1e3).toFixed(1) + ' k';
  return String(Math.round(n));
}
/* DPR-aware canvas sizing; the design height is cached on first use so repeated calls are idempotent */
function setupCanvas(cv){
  var dpr = window.devicePixelRatio || 1;
  if(!cv.dataset.baseH) cv.dataset.baseH = cv.getAttribute('height') || 240;
  var h = +cv.dataset.baseH, w = cv.clientWidth || 600;
  cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  cv.style.height = h + 'px';
  var ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: ctx, w: w, h: h };
}
var SHAPE_COLORS = ['#ef4444', '#22c55e', '#3b82f6'];
function drawShape(ctx, x, y, r, c, s, alpha){
  ctx.save();
  ctx.globalAlpha = alpha == null ? 1 : alpha;
  ctx.fillStyle = SHAPE_COLORS[c];
  ctx.beginPath();
  if(s === 0){ ctx.arc(x, y, r, 0, Math.PI * 2); }
  else if(s === 1){ ctx.rect(x - r, y - r, 2 * r, 2 * r); }
  else { ctx.moveTo(x, y - r * 1.15); ctx.lineTo(x + r * 1.1, y + r * 0.85); ctx.lineTo(x - r * 1.1, y + r * 0.85); ctx.closePath(); }
  ctx.fill();
  ctx.restore();
}
/* diverging colour for a cosine in [-1, 1]: blue → dark → rose */
function cosColor(c){
  c = clamp(c, -1, 1);
  if(!(c === c)) c = 0;
  if(c >= 0){ var t = c; return 'rgb(' + Math.round(15 + (244 - 15) * t) + ',' + Math.round(24 + (63 - 24) * t) + ',' + Math.round(48 + (94 - 48) * t) + ')'; }
  var u = -c; return 'rgb(' + Math.round(15 + (29 - 15) * u) + ',' + Math.round(24 + (78 - 24) * u) + ',' + Math.round(48 + (216 - 48) * u) + ')';
}
function shapeIcon(size, c, s, img){
  var cv = document.createElement('canvas'); cv.width = size * 2; cv.height = size * 2; cv.style.width = size + 'px'; cv.style.height = size + 'px';
  var ctx = cv.getContext('2d'); ctx.scale(2, 2);
  ctx.fillStyle = '#050811'; ctx.fillRect(0, 0, size, size);
  var r = size * 0.22 * (img ? img.size : 0.85), cx = size / 2 + (img ? img.px * size * 0.18 : 0);
  drawShape(ctx, cx, size / 2, r, c, s);
  return cv;
}

/* ═══════════════ CLIP-IN-MINIATURE ENGINE ═══════════════ */
//ENGINE//

/* ═══════════════ MODELS TRAINED AT PAGE LOAD ═══════════════ */
var PRE_SEED = 1;
var UNTRAINED = makeModel(PRE_SEED, { loss: 'softmax', temp: 'learn' });
var PRE = makeModel(PRE_SEED, { loss: 'softmax', temp: 'learn' });
var MID = makeModel(PRE_SEED, { loss: 'softmax', temp: 'learn' });   // a snapshot part-way through training, for the loss stepper
(function trainPre(){
  var rng = makeRng(PRE_SEED * 7919), rng2 = makeRng(PRE_SEED * 7919);
  for(var s = 0; s < 400; s++){
    var pairs = []; for(var i = 0; i < 16; i++) pairs.push(makePair(rng));
    trainStep(PRE, pairs, 0.02);
    if(s < 90){ var p2 = []; for(i = 0; i < 16; i++) p2.push(makePair(rng2)); trainStep(MID, p2, 0.02); }
  }
})();
var HELDOUT = makeEvalSet(999, 10);          // 90 images + 9 canonical captions
var PRE_EVAL = evaluate(PRE, HELDOUT);

/* ═══════════════ 1 · THE GAME ═══════════════ */
var GAME_ITEMS = [
  { e: '🐕', cap: 'a dog running on a beach' },
  { e: '🦮', cap: 'a guide dog wearing a harness' },
  { e: '🐈', cap: 'a cat asleep on a sofa' },
  { e: '🌅', cap: 'sunset over the ocean' },
  { e: '🚲', cap: 'a bicycle leaning on a wall' },
];
var game = { order: [], sel: -1, links: {}, checked: false, rng: makeRng(42) };
function gameShuffle(){
  game.order = [0, 1, 2, 3, 4];
  for(var i = 4; i > 0; i--){ var j = game.rng.int(i + 1); var t = game.order[i]; game.order[i] = game.order[j]; game.order[j] = t; }
  game.sel = 0; game.links = {}; game.checked = false;
  $('game-check').disabled = true; $('game-matrix').style.display = 'none'; $('game-scale').style.display = 'none'; $('game-scalebox').style.display = 'none';
  $('game-note').innerHTML = 'Image 1 is selected. Tap the caption you think belongs to it; the next image is selected for you. Tap any image to re-select it.';
  gameRender();
}
function gameNextUnlinked(){ for(var i = 0; i < 5; i++) if(game.links[i] == null) return i; return -1; }
function gameRender(){
  var imgs = $('game-imgs'), caps = $('game-caps');
  imgs.innerHTML = ''; caps.innerHTML = '';
  GAME_ITEMS.forEach(function(it, i){
    var d = document.createElement('div'); d.className = 'gitem' + (game.sel === i ? ' sel' : '') + (game.links[i] != null ? ' linked' : '');
    if(game.checked) d.className += (game.order[game.links[i]] === i ? ' right' : ' wrong');
    d.innerHTML = '<span class="idx">I' + (i + 1) + '</span><span class="emoji">' + it.e + '</span><span class="cap">image ' + (i + 1) + '<small>which caption?</small></span>';
    d.onclick = function(){ if(game.checked) return; game.sel = (game.sel === i ? -1 : i); gameRender(); };
    imgs.appendChild(d);
  });
  game.order.forEach(function(orig, pos){
    var linkedBy = -1; Object.keys(game.links).forEach(function(k){ if(game.links[k] === pos) linkedBy = +k; });
    var d = document.createElement('div'); d.className = 'gitem' + (linkedBy >= 0 ? ' linked' : '');
    if(game.checked && linkedBy >= 0) d.className += (orig === linkedBy ? ' right' : ' wrong');
    d.innerHTML = '<span class="idx">T' + (pos + 1) + '</span><span class="cap">' + GAME_ITEMS[orig].cap + '</span>';
    d.onclick = function(){
      if(game.checked || game.sel < 0) return;
      Object.keys(game.links).forEach(function(k){ if(game.links[k] === pos) delete game.links[k]; });
      game.links[game.sel] = pos; game.sel = gameNextUnlinked();
      $('game-check').disabled = Object.keys(game.links).length < 5;
      gameRender();
    };
    caps.appendChild(d);
  });
  requestAnimationFrame(gameLines);
}
function gameLines(){
  var svg = $('game-svg'), box = $('game').getBoundingClientRect();
  var imgs = $('game-imgs').children, caps = $('game-caps').children;
  var html = '';
  Object.keys(game.links).forEach(function(k){
    var a = imgs[+k].getBoundingClientRect(), b = caps[game.links[k]].getBoundingClientRect();
    var cls = game.checked ? (game.order[game.links[k]] === +k ? 'right' : 'wrong') : '';
    html += '<line class="' + cls + '" x1="' + (a.right - box.left) + '" y1="' + (a.top + a.height / 2 - box.top) + '" x2="' + (b.left - box.left) + '" y2="' + (b.top + b.height / 2 - box.top) + '"></line>';
  });
  svg.innerHTML = html;
}
function gameCheck(){
  game.checked = true;
  var right = 0; Object.keys(game.links).forEach(function(k){ if(game.order[game.links[k]] === +k) right++; });
  var note = '<b>' + right + ' of 5 correct.</b> ';
  if(right === 5) note += 'You solved the batch. CLIP\'s loss for this batch would be near zero &mdash; every image put all its probability on its own caption. ';
  else note += 'The wrong lines are where the loss lives: each one is a caption the model (you) ranked above the true one, and the gradient pushes those pairs apart. ';
  note += 'Now look at it the way the model does: as a 5&times;5 grid.';
  $('game-note').innerHTML = note;
  $('game-matrix').style.display = '';
  gameRender();
}
function gameMatrix(){
  var html = '<div style="display:grid;grid-template-columns:auto repeat(5,34px);gap:3px;justify-content:center;margin-top:.6rem;font-family:Courier New,monospace;font-size:.62rem">';
  html += '<div></div>'; for(var j = 0; j < 5; j++) html += '<div style="text-align:center;color:var(--txt)">T' + (j + 1) + '</div>';
  for(var i = 0; i < 5; i++){
    html += '<div style="color:var(--img);padding-right:.3rem;line-height:34px">I' + (i + 1) + '</div>';
    for(j = 0; j < 5; j++){
      var truth = game.order[j] === i, picked = game.links[i] === j;
      var bg = picked ? (truth ? 'rgba(16,185,129,.55)' : 'rgba(239,68,68,.55)') : 'var(--surface2)';
      html += '<div style="height:34px;border-radius:5px;background:' + bg + ';border:1px solid ' + (truth ? '#fff' : 'transparent') + ';display:flex;align-items:center;justify-content:center;color:#fff">' + (picked ? '&#10003;' : '') + '</div>';
    }
  }
  html += '</div><div class="hint">white outline = the true pairs (the "labels"). Filled = your picks. The captions were shuffled, so the truth is a permutation &mdash; CLIP orders its batch so the truth is exactly the diagonal.</div>';
  $('game-note').innerHTML += html;
  $('game-matrix').style.display = 'none'; $('game-scale').style.display = '';
}
function gameScale(){
  $('game-scale').style.display = 'none'; $('game-scalebox').style.display = '';
  var cv = $('game-scale-cv'); if(!cv || !cv.clientWidth) return;
  var c = setupCanvas(cv), ctx = c.ctx, w = c.w, h = c.h, S = h - 30, ox = (w - S) / 2, oy = 12;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0f1830'; ctx.fillRect(ox, oy, S, S);
  ctx.strokeStyle = '#1a2a4a'; ctx.strokeRect(ox + 0.5, oy + 0.5, S - 1, S - 1);
  ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(ox + S, oy + S); ctx.stroke();
  ctx.fillStyle = '#94a3b8'; ctx.font = '11px Segoe UI'; ctx.textAlign = 'center';
  ctx.fillText('32,768 captions →', ox + S / 2, oy + S + 14);
  ctx.save(); ctx.translate(ox - 8, oy + S / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('32,768 images →', 0, 0); ctx.restore();
  ctx.textAlign = 'left'; ctx.fillStyle = '#5eead4'; ctx.fillText('the diagonal: one pixel wide', ox + S * 0.55, oy + S * 0.4);
  ctx.fillStyle = '#fda4af'; ctx.fillText('everything else: negatives', ox + S * 0.08, oy + S * 0.8);
}

/* ═══════════════ 2 · ARCHITECTURE + NORMALISATION ═══════════════ */
function initArch(){
  var boxes = document.querySelectorAll('.abox'), note = $('arch-note');
  boxes.forEach(function(b){
    b.addEventListener('mouseenter', function(){ note.innerHTML = b.dataset.note; });
    b.addEventListener('click', function(){ note.innerHTML = b.dataset.note; });
  });
}
var norm = { on: false, pts: [], drag: -1, anim: 0 };
(function(){
  /* I1 is best aligned with the SHORT text vector T2; the LONG text vector T1 sits 45° off but wins the raw dot product */
  var P = [[0.90, 0.35], [-0.40, 0.80], [0.20, -0.85], [0.55 * 2.4, 0.83 * 2.4], [0.93 * 0.5, 0.36 * 0.5], [-0.60, -0.50]];
  for(var i = 0; i < 6; i++) norm.pts.push({ x: P[i][0], y: P[i][1], img: i < 3 });
})();
function drawNorm(){
  var cv = $('norm-canvas'); if(!cv || !cv.clientWidth) return;
  var c = setupCanvas(cv), ctx = c.ctx, w = c.w, h = c.h;
  var cx = w * 0.5, cy = h * 0.5, R = Math.min(w, h) * 0.42;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#1a2a4a'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
  ctx.setLineDash([4, 4]); ctx.strokeStyle = norm.on ? '#2dd4bf' : '#1a2a4a'; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
  var t = norm.anim;
  var pos = norm.pts.map(function(p){
    var len = Math.sqrt(p.x * p.x + p.y * p.y) || 1e-9;
    var f = (1 - t) + t / len;                 // interpolate raw → unit
    return { x: cx + p.x * f * R, y: cy - p.y * f * R, len: len };
  });
  pos.forEach(function(q, i){
    var col = norm.pts[i].img ? '#2dd4bf' : '#fb7185';
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(q.x, q.y); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.arc(q.x, q.y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e2e8f0'; ctx.font = '11px Courier New'; ctx.fillText((norm.pts[i].img ? 'I' : 'T') + ((i % 3) + 1), q.x + 8, q.y - 6);
  });
  /* readout: for I1, who wins under raw dot vs cosine? */
  var I1 = norm.pts[0], best = -1, bi = -1, bestc = -2, bic = -1;
  for(var j = 3; j < 6; j++){
    var T = norm.pts[j], d = I1.x * T.x + I1.y * T.y;
    var cs = d / ((Math.sqrt(I1.x * I1.x + I1.y * I1.y) || 1e-9) * (Math.sqrt(T.x * T.x + T.y * T.y) || 1e-9));
    if(d > best){ best = d; bi = j; } if(cs > bestc){ bestc = cs; bic = j; }
  }
  $('norm-read').innerHTML = 'For I1 &mdash; raw dot picks <b style="color:var(--txt)">T' + (bi - 2) + '</b> (' + best.toFixed(2) + '), cosine picks <b style="color:var(--txt)">T' + (bic - 2) + '</b> (' + bestc.toFixed(2) + ')' + (bi !== bic ? ' &nbsp;&larr; different winners' : '');
}
function normTick(){
  var target = norm.on ? 1 : 0;
  if(Math.abs(norm.anim - target) > 0.005){ norm.anim += (target - norm.anim) * 0.18; drawNorm(); requestAnimationFrame(normTick); }
  else { norm.anim = target; drawNorm(); }
}
function initNorm(){
  $('norm-off').onclick = function(){ norm.on = false; $('norm-off').classList.add('active'); $('norm-on').classList.remove('active'); normTick(); };
  $('norm-on').onclick = function(){ norm.on = true; $('norm-on').classList.add('active'); $('norm-off').classList.remove('active'); normTick(); };
  $('norm-stretch').onclick = function(){ var p = norm.pts[4], l = Math.hypot(p.x, p.y); var f = l > 1 ? 0.25 : 4; p.x *= f; p.y *= f; this.textContent = l > 1 ? 'stretch T2 ×4' : 'shrink T2 ÷4'; drawNorm(); };
  var cv = $('norm-canvas');
  function toWorld(ev){
    var b = cv.getBoundingClientRect(), R = Math.min(b.width, b.height) * 0.42;
    return { x: (ev.clientX - b.left - b.width / 2) / R, y: -(ev.clientY - b.top - b.height / 2) / R };
  }
  cv.addEventListener('pointerdown', function(ev){
    var p = toWorld(ev), best = 1e9, bi = -1;
    norm.pts.forEach(function(q, i){
      var len = Math.sqrt(q.x * q.x + q.y * q.y) || 1e-9, f = (1 - norm.anim) + norm.anim / len;
      var d = Math.hypot(q.x * f - p.x, q.y * f - p.y); if(d < best){ best = d; bi = i; }
    });
    if(best < 0.18){ norm.drag = bi; cv.setPointerCapture(ev.pointerId); }
  });
  cv.addEventListener('pointermove', function(ev){
    if(norm.drag < 0) return;
    var p = toWorld(ev), q = norm.pts[norm.drag];
    if(norm.on){ var l = Math.sqrt(p.x * p.x + p.y * p.y) || 1e-9, old = Math.sqrt(q.x * q.x + q.y * q.y) || 1e-9; q.x = p.x / l * old; q.y = p.y / l * old; }
    else { q.x = clamp(p.x, -1.15, 1.15); q.y = clamp(p.y, -1.15, 1.15); }
    drawNorm();
  });
  cv.addEventListener('pointerup', function(){ norm.drag = -1; });
  cv.addEventListener('pointercancel', function(){ norm.drag = -1; });
}

/* ═══════════════ 3 · THE BATCH MATRIX ═══════════════ */
var mx = { N: 8, trained: true, seed: 11, batch: [] };
function mxSample(){
  var rng = makeRng(mx.seed);
  mx.batch = []; for(var i = 0; i < 16; i++) mx.batch.push(makePair(rng));
}
function renderMatrix(opts){
  /* generic N×N matrix renderer used by sections 3 and 4.
     opts: {N, batch, model, gridEl, colsEl, rowsEl, values(N,fw)->{vals,text,color,cls}, tip, delta} */
  var N = opts.N, pairs = opts.batch.slice(0, N), fw = forwardBatch(opts.model, pairs);
  if(opts.delta){ var C2 = new Float64Array(fw.C); for(var q = 0; q < N * N; q++) C2[q] = clamp(C2[q] + (opts.delta[q] || 0), -1, 1); fw.C = C2; }
  var grid = opts.gridEl, cols = opts.colsEl, rows = opts.rowsEl;
  grid.style.gridTemplateColumns = 'repeat(' + N + ',minmax(0,1fr))';   // minmax(0,…) so the grid can shrink below the cells' text on phones
  cols.style.gridTemplateColumns = 'repeat(' + N + ',minmax(0,1fr))';
  cols.innerHTML = ''; rows.innerHTML = ''; grid.innerHTML = '';
  rows.style.gridTemplateRows = 'repeat(' + N + ',1fr)';
  pairs.forEach(function(p){
    var d = document.createElement('div'); d.textContent = N > 10 ? COLORS[p.cap.c][0] + ' ' + SHAPES[p.cap.s][0] : COLORS[p.cap.c] + '\n' + SHAPES[p.cap.s];
    d.title = p.cap.words.join(' '); d.style.whiteSpace = 'pre'; cols.appendChild(d);
    var r = document.createElement('div'); r.appendChild(shapeIcon(30, p.img.c, p.img.s, p.img)); rows.appendChild(r);
  });
  var v = opts.values(N, fw);
  for(var i = 0; i < N; i++) for(var j = 0; j < N; j++){
    (function(i, j){
      var cell = document.createElement('div'); cell.className = 'cell' + (i === j ? ' diag' : '');
      var val = v.vals[i * N + j];
      cell.style.background = v.color ? v.color(val, i, j) : cosColor(val);
      if(v.text) cell.textContent = v.text(val, i, j);
      if(v.cls) cell.className += ' ' + v.cls(i, j);
      if(i !== j && pairs[i].img.id === pairs[j].cap.id) cell.style.borderColor = 'rgba(245,158,11,.85)';   // a false negative
      cell.onmouseenter = function(){ if(opts.tip) opts.tip(i, j, fw, val, pairs); };
      cell.onclick = function(){ if(opts.tip) opts.tip(i, j, fw, val, pairs); if(opts.pin) opts.pin(i, j); };
      grid.appendChild(cell);
    })(i, j);
  }
  return fw;
}
function drawMx(){
  var model = mx.trained ? PRE : UNTRAINED, N = mx.N;
  var fw = renderMatrix({
    N: N, batch: mx.batch, model: model, gridEl: $('mx'), colsEl: $('mx-cols'), rowsEl: $('mx-rows'),
    values: function(N, fw){ return { vals: fw.C, text: N <= 8 ? function(v){ return v.toFixed(2); } : null }; },
    tip: function(i, j, fw, val, pairs){
      var p = pairs[i], q = pairs[j];
      $('mx-tip').innerHTML = 'image ' + (i + 1) + ' (<b>' + COLORS[p.img.c] + ' ' + SHAPES[p.img.s] + '</b>) &middot; caption ' + (j + 1) + ' "<b>' + q.cap.words.join(' ') + '</b>" &rarr; cos = <b>' + val.toFixed(3) + '</b>' + (i === j ? ' &nbsp;(a positive)' : (p.img.id === q.cap.id ? ' &nbsp;(same concept, but scored as a negative &mdash; a <span style="color:#fde68a">false negative</span>)' : ' &nbsp;(a negative)'));
    }
  });
  var fn = 0; for(var a = 0; a < N; a++) for(var b = 0; b < N; b++) if(a !== b && mx.batch[a].img.id === mx.batch[b].cap.id) fn++;
  var dsum = 0, osum = 0;
  for(var i = 0; i < N; i++) for(var j = 0; j < N; j++){ if(i === j) dsum += fw.C[i * N + j]; else osum += fw.C[i * N + j]; }
  $('mx-n').textContent = N; $('mx-pos').textContent = N; $('mx-neg').textContent = (N * N - N) + (fn ? ' (' + fn + ' false)' : '');
  $('mx-dmean').textContent = (dsum / N).toFixed(3); $('mx-omean').textContent = N > 1 ? (osum / (N * N - N)).toFixed(3) : '—';
  $('mx-lnn').textContent = Math.log(N).toFixed(3);
}
function initMx(){
  mxSample();
  $('mx-slider').oninput = function(){ mx.N = +this.value; drawMx(); };
  $('mx-trained').onclick = function(){ mx.trained = true; this.classList.add('active'); $('mx-untrained').classList.remove('active'); drawMx(); };
  $('mx-untrained').onclick = function(){ mx.trained = false; this.classList.add('active'); $('mx-trained').classList.remove('active'); drawMx(); };
  $('mx-resample').onclick = function(){ mx.seed++; mxSample(); drawMx(); };
  drawMx();
}

/* ═══════════════ 4 · THE LOSS STEPPER ═══════════════ */
var PSEUDO = [
  ['cm', '# image_encoder - ResNet or Vision Transformer'],
  ['cm', '# text_encoder  - CBOW or Text Transformer'],
  ['cm', '# I[n, h, w, c] - minibatch of aligned images'],
  ['cm', '# T[n, l]       - minibatch of aligned texts'],
  ['cm', '# W_i[d_i, d_e] - learned proj of image to embed'],
  ['cm', '# W_t[d_t, d_e] - learned proj of text to embed'],
  ['cm', '# t             - learned temperature parameter'],
  ['', ''],
  ['cm', '# extract feature representations of each modality'],
  ['', 'I_f = image_encoder(I) #[n, d_i]'],
  ['', 'T_f = text_encoder(T)  #[n, d_t]'],
  ['', ''],
  ['cm', '# joint multimodal embedding [n, d_e]'],
  ['', 'I_e = l2_normalize(np.dot(I_f, W_i), axis=1)'],
  ['', 'T_e = l2_normalize(np.dot(T_f, W_t), axis=1)'],
  ['', ''],
  ['cm', '# scaled pairwise cosine similarities [n, n]'],
  ['', 'logits = np.dot(I_e, T_e.T) * np.exp(t)'],
  ['', ''],
  ['cm', '# symmetric loss function'],
  ['', 'labels = np.arange(n)'],
  ['', 'loss_i = cross_entropy_loss(logits, labels, axis=0)'],
  ['', 'loss_t = cross_entropy_loss(logits, labels, axis=1)'],
  ['', 'loss   = (loss_i + loss_t)/2'],
];
var STEP_LINES = { 0: [0, 1, 2, 3, 4, 5, 6], 1: [9, 10], 2: [13, 14], 3: [17], 4: [20], 5: [21], 6: [22], 7: [23], 8: [21, 22, 23] };
var lossLab = { step: 0, batch: [], delta: new Float64Array(16), pin: -1, base: null };
(function(){ var rng = makeRng(23); for(var i = 0; i < 4; i++) lossLab.batch.push(makePair(rng)); })();
function lossPin(i, j){
  lossLab.pin = i * 4 + j;
  var p = lossLab.batch[i], q = lossLab.batch[j];
  $('lmx-pin').innerHTML = 'Pinned: image ' + (i + 1) + ' (' + COLORS[p.img.c] + ' ' + SHAPES[p.img.s] + ') &times; caption ' + (j + 1) + ' "' + q.cap.words.join(' ') + '"' + (i === j ? ' &mdash; a positive' : ' &mdash; a negative');
  $('lmx-up').disabled = false; $('lmx-down').disabled = false; $('lmx-restore').disabled = false;
  drawLoss();
}
function lossNudge(d){
  if(lossLab.pin < 0) return;
  if(d === 0) lossLab.delta = new Float64Array(16); else lossLab.delta[lossLab.pin] += d;
  drawLoss();
}
function renderPseudo(){
  var el = $('pseudo'); el.innerHTML = '';
  PSEUDO.forEach(function(l, i){
    var d = document.createElement('div'); d.className = 'ln ' + l[0] + (STEP_LINES[lossLab.step].indexOf(i) >= 0 ? ' hi' : ''); d.textContent = l[1] || ' '; el.appendChild(d);
  });
}
function drawLoss(){
  var step = lossLab.step, N = 4, s = scaleOf(MID);
  renderPseudo();
  var fw0 = forwardBatch(MID, lossLab.batch);
  var C = new Float64Array(fw0.C); for(var q = 0; q < 16; q++) C[q] = clamp(C[q] + lossLab.delta[q], -1, 1);
  var lo = softmaxLoss(N, C, s);
  if(!lossLab.base) lossLab.base = softmaxLoss(N, fw0.C, s).loss;
  var edited = false; for(q = 0; q < 16; q++) if(lossLab.delta[q] !== 0) edited = true;
  var title = { 0: 'The batch: 4 images, 4 captions', 1: 'Encoded: I_f and T_f (not yet comparable)', 2: 'Cosine similarities I<sub>e</sub> &middot; T<sub>e</sub><sup>T</sup>', 3: 'logits = cos &times; exp(t) = cos &times; ' + s.toFixed(1), 4: 'labels = [0, 1, 2, 3] &mdash; the diagonal', 5: 'softmax across each row: which caption?', 6: 'softmax down each column: which image?', 7: 'loss = (loss_i + loss_t) / 2', 8: '&part;loss / &part;logits = P &minus; I, averaged over both directions' }[step];
  $('loss-mx-title').innerHTML = title;
  var side = $('lmx-side'), bottom = $('lmx-bottom'); side.innerHTML = ''; bottom.innerHTML = '';
  side.style.gridTemplateRows = 'repeat(4,1fr)'; bottom.style.gridTemplateColumns = 'repeat(4,minmax(0,1fr))';
  renderMatrix({
    N: N, batch: lossLab.batch, model: MID, gridEl: $('lmx'), colsEl: $('lmx-cols'), rowsEl: $('lmx-rows'), delta: lossLab.delta, pin: lossPin,
    values: function(N, fw){
      if(step === 8) return { vals: lo.G, color: function(v){ var a = clamp(Math.abs(v) * N * 2.2, 0, 1); return v < 0 ? 'rgba(45,212,191,' + (0.1 + 0.85 * a) + ')' : 'rgba(251,113,133,' + (0.1 + 0.85 * a) + ')'; }, text: function(v){ var g = v * N; if(Math.abs(g) < 0.005) return '0.00'; return (g > 0 ? '+' : '') + g.toFixed(2); }, cls: function(i, j){ return lossLab.pin === i * N + j ? 'lit' : ''; } };
      if(step <= 1) return { vals: fw.C, color: function(){ return step === 0 ? 'var(--surface2)' : 'rgba(167,139,250,.18)'; }, text: function(v, i, j){ return step === 0 ? '?' : ''; } };
      var pinCls = function(i, j){ return lossLab.pin === i * N + j ? 'lit' : ''; };
      if(step === 2) return { vals: fw.C, text: function(v){ return v.toFixed(2); }, cls: pinCls };
      if(step === 3) return { vals: lo.L, color: function(v){ return cosColor(v / s); }, text: function(v){ return v.toFixed(1); }, cls: pinCls };
      if(step === 4) return { vals: fw.C, text: function(v, i, j){ return i === j ? '1' : '0'; }, color: function(v, i, j){ return i === j ? 'rgba(16,185,129,.6)' : 'var(--surface2)'; }, cls: pinCls };
      if(step === 5) return { vals: lo.Prow, color: function(v){ return 'rgba(45,212,191,' + (0.08 + 0.85 * v) + ')'; }, text: function(v){ return v.toFixed(2); }, cls: pinCls };
      if(step === 6) return { vals: lo.Pcol, color: function(v){ return 'rgba(251,113,133,' + (0.08 + 0.85 * v) + ')'; }, text: function(v){ return v.toFixed(2); }, cls: pinCls };
      return { vals: fw.C, text: function(v){ return v.toFixed(2); }, cls: function(i, j){ return i === j ? 'lit' : 'dimmed'; } };
    }
  });
  if(step >= 5){
    for(var i = 0; i < N; i++){ var d = document.createElement('div'); d.innerHTML = step === 5 || step === 7 ? '&minus;log ' + lo.Prow[i * N + i].toFixed(2) + ' = ' + (-Math.log(lo.Prow[i * N + i])).toFixed(2) : ''; side.appendChild(d); }
    if(step >= 6 && step < 8) for(var j = 0; j < N; j++){ var b = document.createElement('div'); b.innerHTML = '&minus;log ' + lo.Pcol[j * N + j].toFixed(2) + '<br>= ' + (-Math.log(lo.Pcol[j * N + j])).toFixed(2); bottom.appendChild(b); }
  }
  $('l-li').textContent = step >= 5 ? lo.lossRow.toFixed(3) : '—';
  $('l-lt').textContent = step >= 6 ? lo.lossCol.toFixed(3) : '—';
  $('l-l').textContent = step >= 7 ? lo.loss.toFixed(3) + (edited ? ' (was ' + lossLab.base.toFixed(3) + ')' : '') : '—';
  var notes = [
    '<b>Start.</b> A batch of n = 4 pairs enters. W_i, W_t and the temperature t are parameters that will be learned along with both encoders. The numbers come from the toy model on this page caught <em>part-way</em> through training (step ' + MID.step + '), so its probabilities are neither uniform nor saturated.',
    '<b>Encode.</b> The image tower and the text tower run independently &mdash; on different GPUs if you like. Their outputs have different sizes (d_i vs d_t) and cannot be compared yet.',
    '<b>Project and normalise.</b> Two linear maps bring both sides to d_e dimensions, and l2_normalize puts every vector on the unit sphere. From here on a dot product is a cosine.',
    '<b>Logits.</b> One matrix multiply computes all n&sup2; cosines at once, then multiplies by exp(t). The toy\'s learned scale is ' + s.toFixed(1) + ' (&tau; = ' + (1 / s).toFixed(3) + '); CLIP\'s started at 14.3 and was capped at 100.',
    '<b>Labels.</b> Because the batch was assembled as pairs, the correct answer for image i is caption i. The label vector is just 0, 1, 2, &hellip;, n&minus;1 &mdash; no annotation anywhere.',
    '<b>Image &rarr; text.</b> Softmax along each row turns the logits into "which caption is mine?" probabilities. Cross-entropy takes &minus;log of the diagonal entry in each row and averages: loss_i = ' + lo.lossRow.toFixed(3) + '.',
    '<b>Text &rarr; image.</b> The same thing down each column: each caption picks an image. loss_t = ' + lo.lossCol.toFixed(3) + '. The two are not equal &mdash; a caption can be confident while its image is still ambiguous.',
    '<b>Average.</b> loss = ' + lo.loss.toFixed(3) + '. For comparison, a uniform guess scores ln 4 = ' + Math.log(4).toFixed(3) + ', and a perfect geometry with an infinite scale scores 0. Backprop pushes both towers <em>and</em> t.',
    '<b>The gradient.</b> Every cell is <em>probability minus label</em>, averaged over the row view and the column view (numbers shown &times; N). Rose cells are pushed <em>down</em> (negatives that took probability), teal cells are pulled <em>up</em> (the diagonal, by 1 &minus; p). In the row view each row sums to zero and in the column view each column does: whatever the positive gains, the negatives around it lose. A negative the model already ignores gets almost no gradient.',
  ];
  if(edited && step >= 5){
    var pi = Math.floor(lossLab.pin / 4), pj = lossLab.pin % 4;
    notes[step] += ' <span style="color:#fde68a">You changed image ' + (pi + 1) + ' &times; caption ' + (pj + 1) + ' by ' + (lossLab.delta[lossLab.pin] >= 0 ? '+' : '') + lossLab.delta[lossLab.pin].toFixed(2) + ': loss ' + lossLab.base.toFixed(3) + ' &rarr; ' + lo.loss.toFixed(3) + '.' + (pi !== pj ? ' Both row ' + (pi + 1) + ' (loss_i) and column ' + (pj + 1) + ' (loss_t) paid for it &mdash; that is what "symmetric" buys.' : ' A better positive helps its row and its column at once.') + '</span>';
  }
  $('loss-note').innerHTML = notes[step];
}
function initLoss(){
  document.querySelectorAll('#loss-steps .step-btn').forEach(function(b){
    b.onclick = function(){ document.querySelectorAll('#loss-steps .step-btn').forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); lossLab.step = +b.dataset.step; drawLoss(); };
  });
  $('lmx-up').onclick = function(){ lossNudge(0.15); }; $('lmx-down').onclick = function(){ lossNudge(-0.15); }; $('lmx-restore').onclick = function(){ lossNudge(0); };
  drawLoss();
}

/* ═══════════════ 5 · TEMPERATURE ═══════════════ */
/* one image's row of cosines, in the narrow band a trained CLIP actually produces: index 0 is the positive */
var TEMP_COS = [0.31, 0.24, 0.21, 0.18, 0.15, 0.12, 0.10, 0.08];
var tempSwapped = false;
function tauFromSlider(v){ return Math.pow(10, -2 * v / 1000); }
function drawTemp(){
  var v = +$('temp-slider').value, tau = tauFromSlider(v), s = 1 / tau;
  TEMP_COS[1] = tempSwapped ? 0.36 : 0.24;
  var L = TEMP_COS.map(function(c){ return c * s; }), mx = Math.max.apply(null, L);
  var Z = 0; L.forEach(function(l){ Z += Math.exp(l - mx); });
  var P = L.map(function(l){ return Math.exp(l - mx) / Z; });
  $('temp-val').textContent = tau.toFixed(tau < 0.1 ? 3 : 2); $('temp-scale').textContent = s.toFixed(1);
  $('temp-floor').textContent = floorLoss(8, tau).toFixed(3);
  var bars = $('tbars'); bars.innerHTML = '';
  TEMP_COS.forEach(function(c, i){
    var g = P[i] - (i === 0 ? 1 : 0);
    var row = document.createElement('div'); row.className = 'tbar' + (i === 0 ? ' pos' : '');
    row.innerHTML = '<span class="tl' + (i === 0 ? ' pos' : '') + '">' + (i === 0 ? 'true caption' : 'negative ' + i) + '</span><div class="tw"><div class="tf" style="width:' + (P[i] * 100).toFixed(2) + '%"></div></div><span class="tv">' + c.toFixed(2) + '</span><span class="tg">' + (g >= 0 ? '+' : '') + g.toFixed(3) + '</span>';
    bars.appendChild(row);
  });
  var negMass = 1 - P[0], share = negMass > 1e-12 ? (P[1] + P[2]) / negMass : 0;
  $('temp-loss').textContent = (-Math.log(P[0])).toFixed(3);
  $('temp-hard').textContent = '+' + P[1].toFixed(3);
  $('temp-share').textContent = (share * 100).toFixed(0) + '%';
  var note;
  if(tempSwapped) note = '<b>A negative above the positive.</b> The hardest negative now scores 0.36 against the positive\'s 0.31. At &tau; = ' + tau.toFixed(3) + ' that costs a loss of ' + (-Math.log(P[0])).toFixed(2) + (tau < 0.03 ? ' &mdash; one bad cell and the loss is large, and its gradient is a full-strength push on that one pair. A few such rows per batch and fp16 training destabilises, which is why the scale is clipped at 100.' : '. Lower &tau; and watch this number grow.');
  else if(tau > 0.4) note = '<b>Flat.</b> The eight cosines span only ' + ((0.31 - 0.08) * s).toFixed(2) + ' logits, so the softmax is close to uniform: the positive gets ' + (P[0] * 100).toFixed(0) + '% against a chance level of 12.5%, and the gradient is smeared over every negative almost equally. Even a perfect geometry could not get below ' + floorLoss(8, tau).toFixed(2) + ' here.';
  else if(tau > 0.03) note = '<b>Working range.</b> Scale ' + s.toFixed(0) + ' stretches the 0.07 gap between positive and hardest negative into ' + ((0.31 - 0.24) * s).toFixed(1) + ' logits. The positive gets ' + (P[0] * 100).toFixed(0) + '% and the hardest negative carries ' + (P[1] / negMass * 100).toFixed(0) + '% of the push. This is where CLIP starts (&tau; = 0.07) &mdash; and notice the positive is still far from confident, which is why the learned scale keeps rising.';
  else note = '<b>Sharp.</b> At &tau; = ' + tau.toFixed(3) + ' the positive gets ' + (P[0] * 100).toFixed(0) + '% and the contest is essentially against the single closest negative: the two hardest negatives hold ' + (share * 100).toFixed(0) + '% of the push, the rest are ignored. Released CLIP checkpoints sit here (scale 100).';
  $('temp-note').innerHTML = note;
}
function initTemp(){
  var sl = $('temp-slider'); sl.oninput = drawTemp;
  document.querySelectorAll('[data-tau]').forEach(function(b){ b.onclick = function(){ sl.value = Math.round(-1000 * Math.log10(+b.dataset.tau) / 2); drawTemp(); }; });
  $('temp-swap').onclick = function(){ tempSwapped = !tempSwapped; this.classList.toggle('active', tempSwapped); this.innerHTML = tempSwapped ? 'hardest negative &rarr; 0.24' : 'hardest negative &rarr; 0.36'; drawTemp(); };
  var marks = $('temp-marks'), W = sl.offsetWidth || 340;
  marks.style.width = W + 'px'; marks.style.marginLeft = ($('temp-slider').offsetLeft || 0) + 'px';
  marks.innerHTML = '<span style="left:0">&tau;=1</span><span style="left:' + (57.8) + '%">0.07 init</span><span style="left:100%">0.01 clip</span>';
  drawTemp();
}

/* ═══════════════ 6 · THE LAB ═══════════════ */
var lab = { N: 16, tempMode: 'learn', loss: 'softmax', lr: 0.02, seed: 3, speed: 3, forces: true, model: null, rng: null, playing: false,
            hist: [], tauHist: [], floorHist: [], lastFw: null, ev: null, ev0: null, nuis0: 0, frame: 0, heat: null };
function labReset(newSeed){
  if(newSeed) lab.seed++;
  var opts = { loss: lab.loss, temp: lab.tempMode === 'learn' ? 'learn' : +lab.tempMode };
  lab.model = makeModel(lab.seed, opts);
  lab.rng = makeRng(lab.seed * 7919);
  lab.hist = []; lab.tauHist = []; lab.floorHist = []; lab.lastFw = null; lab.heat = null;
  lab.ev = evaluateFull(lab.model); lab.ev0 = lab.ev; lab.nuis0 = nuisanceProbe(lab.model);
  $('lab-biaswrap').style.display = lab.loss === 'sigmoid' ? '' : 'none';
  labDraw();
}
var LAB_PRESETS = {
  default: { N: 16, t: 'learn', l: 'softmax' },
  tau1:    { N: 16, t: '1',     l: 'softmax' },
  tiny:    { N: 4,  t: 'learn', l: 'softmax' },
  siglip:  { N: 16, t: 'learn', l: 'sigmoid' },
  collide: { N: 32, t: 'learn', l: 'softmax' },
};
function labPreset(name){
  var p = LAB_PRESETS[name]; if(!p) return;
  lab.N = p.N; lab.tempMode = p.t; lab.loss = p.l; lab.seed = 3;
  document.querySelectorAll('.lab-preset').forEach(function(b){ b.classList.toggle('active', b.dataset.preset === name); });
  document.querySelectorAll('.lab-n').forEach(function(b){ b.classList.toggle('active', +b.dataset.n === p.N); });
  document.querySelectorAll('.lab-t').forEach(function(b){ b.classList.toggle('active', b.dataset.t === p.t); });
  document.querySelectorAll('.lab-l').forEach(function(b){ b.classList.toggle('active', b.dataset.l === p.l); });
  labReset(false);
  if(!lab.playing){ lab.playing = true; $('lab-play').innerHTML = '&#10074;&#10074; Pause'; requestAnimationFrame(labLoop); }
}
function evaluateFull(m){
  var e = evaluate(m, HELDOUT), U = e.U, V = e.V, hitC = 0, hitS = 0;
  for(var i = 0; i < U.length; i++){
    var best = -2, bj = 0;
    for(var j = 0; j < V.length; j++){ var d = cos2(U[i], V[j]); if(d > best){ best = d; bj = j; } }
    if(HELDOUT.caps[bj].c === HELDOUT.imgs[i].c) hitC++;
    if(HELDOUT.caps[bj].s === HELDOUT.imgs[i].s) hitS++;
  }
  e.colAcc = hitC / U.length; e.shpAcc = hitS / U.length;
  return e;
}
function labStepCore(k){
  for(var s = 0; s < k; s++){
    var pairs = []; for(var i = 0; i < lab.N; i++) pairs.push(makePair(lab.rng));
    var r = trainStep(lab.model, pairs, lab.lr);
    r.fw.pairs = pairs;
    lab.hist.push(r.lo.loss); lab.tauHist.push(1 / scaleOf(lab.model));
    lab.floorHist.push(Math.max(dupFloor(pairs), floorLoss(lab.N, 1 / scaleOf(lab.model))));
    if(lab.hist.length > 1200){ lab.hist.shift(); lab.tauHist.shift(); lab.floorHist.shift(); }
    lab.lastFw = r;
  }
}
function labStep(k){ labStepCore(k); lab.ev = evaluateFull(lab.model); labDraw(); }
function labLoop(){
  if(!lab.playing) return;
  labStepCore(lab.speed);
  lab.frame++;
  lab.ev = evaluateFull(lab.model);
  labDraw();
  if(lab.model.step >= 3000){ lab.playing = false; $('lab-play').innerHTML = '&#9654; Train'; }
  requestAnimationFrame(labLoop);
}
function batchFalseNegatives(fw){
  if(!fw) return 0;
  var pairs = fw.pairs, N = fw.N, k = 0;
  for(var i = 0; i < N; i++) for(var j = 0; j < N; j++) if(i !== j && pairs[i].img.id === pairs[j].cap.id) k++;
  return k;
}
function labDraw(){
  var m = lab.model, e = lab.ev;
  $('lab-stepc').textContent = m.step;
  $('lab-loss').textContent = lab.hist.length ? lab.hist[lab.hist.length - 1].toFixed(3) : '—';
  $('lab-tau').textContent = (1 / scaleOf(m)).toFixed(4);
  $('lab-bias').textContent = m.bias.toFixed(2);
  $('acc-i2t').textContent = (e.i2t * 100).toFixed(0) + '%'; $('accf-i2t').style.width = (e.i2t * 100) + '%';
  $('acc-col').textContent = (e.colAcc * 100).toFixed(0) + '%'; $('accf-col').style.width = (e.colAcc * 100) + '%';
  $('acc-shp').textContent = (e.shpAcc * 100).toFixed(0) + '%'; $('accf-shp').style.width = (e.shpAcc * 100) + '%';
  $('acc-pc').textContent = e.posCos.toFixed(3); $('accf-pc').style.width = clamp((e.posCos + 1) / 2 * 100, 0, 100) + '%';
  var fn = batchFalseNegatives(lab.lastFw && lab.lastFw.fw), negs = lab.N * lab.N - lab.N;
  $('acc-fn').textContent = lab.lastFw ? fn + ' of ' + negs : '—'; $('accf-fn').style.width = (negs ? fn / negs * 100 * 4 : 0) + '%';
  $('cone-i').textContent = lab.ev0.coneI.toFixed(2); $('cone-t').textContent = lab.ev0.coneT.toFixed(2);
  $('pc-init').textContent = lab.ev0.posCos.toFixed(2); $('pc-now').textContent = e.posCos.toFixed(2);
  $('nuis-init').textContent = lab.nuis0.toFixed(1) + '°'; $('nuis-now').textContent = nuisanceProbe(m).toFixed(1) + '°';
  drawCircle(); drawHeat(); drawCurve(); drawTauCurve();
  labNote();
  if(lab.frame % 20 === 0) zsRefresh();
}
function drawCircle(){
  var cv = $('lab-circle'); if(!cv || !cv.clientWidth) return;
  var c = setupCanvas(cv), ctx = c.ctx, w = c.w, h = c.h, cx = w / 2, cy = h / 2, R = Math.min(w, h) * 0.36;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = '#1a2a4a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - R - 10, cy); ctx.lineTo(cx + R + 10, cy); ctx.moveTo(cx, cy - R - 10); ctx.lineTo(cx, cy + R + 10); ctx.stroke();
  var e = lab.ev;
  /* mean vectors (the modality gap) */
  var mu = [0, 0], mv = [0, 0];
  e.U.forEach(function(u){ mu[0] += u[0] / e.U.length; mu[1] += u[1] / e.U.length; });
  e.V.forEach(function(v){ mv[0] += v[0] / e.V.length; mv[1] += v[1] / e.V.length; });
  ctx.lineWidth = 2; ctx.setLineDash([3, 3]);
  ctx.strokeStyle = 'rgba(45,212,191,.7)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + mu[0] * R, cy - mu[1] * R); ctx.stroke();
  ctx.strokeStyle = 'rgba(251,113,133,.7)'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + mv[0] * R, cy - mv[1] * R); ctx.stroke();
  ctx.setLineDash([]);
  /* images: little shapes on the circle, jittered radially so overlaps stay visible */
  e.U.forEach(function(u, i){
    var im = HELDOUT.imgs[i], rr = R + ((i % 5) - 2) * 4;
    drawShape(ctx, cx + u[0] * rr, cy - u[1] * rr, 4.2, im.c, im.s, 0.9);
  });
  /* forces: the current batch's points with their gradient (negated, tangent to the circle) */
  if(lab.forces && lab.lastFw){
    var r = lab.lastFw, fw = r.fw, N = fw.N, gmax = 1e-9, k;
    for(k = 0; k < N; k++){ gmax = Math.max(gmax, Math.hypot(r.gU[k][0], r.gU[k][1]), Math.hypot(r.gV[k][0], r.gV[k][1])); }
    var scaleA = 34 / gmax;
    function arrow(p, g, col){
      var x = cx + p[0] * (R + 14), y = cy - p[1] * (R + 14);
      var tg = g[0] * (-p[1]) + g[1] * p[0];                 // tangential component (the only one that survives normalisation)
      var len = clamp(-tg * scaleA, -40, 40), tx = -p[1], ty = p[0];
      ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + tx * len, y - ty * len); ctx.stroke();
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill();
    }
    for(k = 0; k < N; k++){ arrow(fw.U[k], r.gU[k], 'rgba(45,212,191,.75)'); arrow(fw.V[k], r.gV[k], 'rgba(251,113,133,.75)'); }
  }
  /* captions: rose markers on the circle + labels outside */
  ctx.font = '10px Courier New'; ctx.textBaseline = 'middle';
  e.V.forEach(function(v, j){
    var cp = HELDOUT.caps[j], x = cx + v[0] * R, y = cy - v[1] * R;
    ctx.fillStyle = '#fb7185'; ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fb7185'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(cx + v[0] * (R + 22), cy - v[1] * (R + 22)); ctx.stroke();
    var lx = cx + v[0] * (R + 26), ly = cy - v[1] * (R + 26), label = COLORS[cp.c] + ' ' + SHAPES[cp.s];
    ctx.textAlign = v[0] < -0.2 ? 'right' : (v[0] > 0.2 ? 'left' : 'center');
    var tw = ctx.measureText(label).width;                    // keep the label inside the canvas
    if(ctx.textAlign === 'right' && lx - tw < 4){ ctx.textAlign = 'left'; lx = 4; }
    if(ctx.textAlign === 'left' && lx + tw > w - 4){ ctx.textAlign = 'right'; lx = w - 4; }
    if(ctx.textAlign === 'center'){ lx = clamp(lx, tw / 2 + 4, w - tw / 2 - 4); }
    ly = clamp(ly, 10, h - 20);
    ctx.fillStyle = '#fda4af'; ctx.fillText(label, lx, ly);
  });
  ctx.textAlign = 'left'; ctx.fillStyle = '#64748b'; ctx.font = '10px Segoe UI';
  ctx.fillText('dashed arrows: mean image (teal) and mean caption (rose) embedding', 8, h - 8);
}
function drawHeat(){
  var cv = $('lab-heat'); if(!cv || !cv.clientWidth) return;
  var c = setupCanvas(cv), ctx = c.ctx, w = c.w, h = c.h;
  ctx.clearRect(0, 0, w, h);
  if(!lab.lastFw){ ctx.fillStyle = '#64748b'; ctx.font = '11px Segoe UI'; ctx.fillText('press Train or Step to see a batch', 10, h / 2); return; }
  var fw = lab.lastFw.fw, N = fw.N, size = Math.min((w - 8) / N, (h - 8) / N), ox = (w - size * N) / 2, oy = (h - size * N) / 2;
  for(var i = 0; i < N; i++) for(var j = 0; j < N; j++){
    ctx.fillStyle = cosColor(fw.C[i * N + j]); ctx.fillRect(ox + j * size, oy + i * size, size - 1, size - 1);
    if(i === j){ ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; ctx.strokeRect(ox + j * size + 0.5, oy + i * size + 0.5, size - 2, size - 2); }
    else if(fw.pairs && fw.pairs[i].img.id === fw.pairs[j].cap.id){ ctx.strokeStyle = 'rgba(245,158,11,.9)'; ctx.lineWidth = 1; ctx.strokeRect(ox + j * size + 0.5, oy + i * size + 0.5, size - 2, size - 2); }
  }
}
function drawCurve(){
  var cv = $('lab-curve'); if(!cv || !cv.clientWidth) return;
  var c = setupCanvas(cv), ctx = c.ctx, w = c.w, h = c.h, pad = 26;
  ctx.clearRect(0, 0, w, h);
  var H = lab.hist; if(!H.length) return;
  var lnN = Math.log(lab.N), ymax = 0;
  for(var i = 0; i < H.length; i++) if(H[i] > ymax) ymax = H[i];
  if(lab.loss === 'softmax') ymax = Math.max(ymax, lnN * 1.15);
  ymax = ymax * 1.05 || 1;
  function X(i){ return pad + (w - pad - 6) * i / Math.max(1, H.length - 1); }
  function Y(v){ return h - 14 - (h - 22) * clamp(v / ymax, 0, 1); }
  ctx.strokeStyle = '#1a2a4a'; ctx.beginPath(); ctx.moveTo(pad, h - 14); ctx.lineTo(w - 6, h - 14); ctx.moveTo(pad, 6); ctx.lineTo(pad, h - 14); ctx.stroke();
  if(lab.loss === 'softmax'){
    ctx.setLineDash([4, 4]); ctx.strokeStyle = '#a78bfa'; ctx.beginPath(); ctx.moveTo(pad, Y(lnN)); ctx.lineTo(w - 6, Y(lnN)); ctx.stroke();
    ctx.fillStyle = '#c4b5fd'; ctx.font = '9px Courier New'; ctx.fillText('chance ln ' + lab.N + ' = ' + lnN.toFixed(2), pad + 4, Y(lnN) - 3);
    /* the floor: whichever is higher of the duplicate-concept floor for that step's batch and the bounded-cosine floor at that step's tau */
    ctx.strokeStyle = '#f59e0b'; ctx.beginPath();
    for(i = 0; i < H.length; i++){ var fy = Y(lab.floorHist[i]); if(i === 0) ctx.moveTo(X(i), fy); else ctx.lineTo(X(i), fy); }
    ctx.stroke(); ctx.setLineDash([]);
    var fl = lab.floorHist[lab.floorHist.length - 1];
    ctx.fillStyle = '#fde68a'; ctx.fillText('floor ' + fl.toFixed(2), w - 70, Y(fl) - 3);
  }
  ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 1.5; ctx.beginPath();
  for(i = 0; i < H.length; i++){ var y = Y(H[i]); if(i === 0) ctx.moveTo(X(i), y); else ctx.lineTo(X(i), y); }
  ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.font = '9px Courier New'; ctx.fillText(ymax.toFixed(1), 2, 12); ctx.fillText('0', 14, h - 12);
  ctx.fillText('last ' + H.length + ' steps', w - 80, h - 3);
}
function drawTauCurve(){
  var cv = $('lab-tcurve'); if(!cv || !cv.clientWidth) return;
  var c = setupCanvas(cv), ctx = c.ctx, w = c.w, h = c.h, pad = 26;
  ctx.clearRect(0, 0, w, h);
  var T = lab.tauHist; if(!T.length) return;
  function X(i){ return pad + (w - pad - 6) * i / Math.max(1, T.length - 1); }
  function Y(t){ var lt = Math.log10(clamp(t, 0.005, 2)); return 6 + (h - 16) * (Math.log10(2) - lt) / (Math.log10(2) - Math.log10(0.005)); }
  ctx.strokeStyle = '#1a2a4a'; ctx.beginPath(); ctx.moveTo(pad, h - 10); ctx.lineTo(w - 6, h - 10); ctx.moveTo(pad, 6); ctx.lineTo(pad, h - 10); ctx.stroke();
  ctx.setLineDash([4, 4]); ctx.strokeStyle = '#fb7185'; ctx.beginPath(); ctx.moveTo(pad, Y(0.01)); ctx.lineTo(w - 6, Y(0.01)); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5; ctx.beginPath();
  for(var i = 0; i < T.length; i++){ var y = Y(T[i]); if(i === 0) ctx.moveTo(X(i), y); else ctx.lineTo(X(i), y); }
  ctx.stroke();
  ctx.fillStyle = '#64748b'; ctx.font = '9px Courier New'; ctx.fillText('1.0', 6, Y(1) + 3); ctx.fillText('0.07', 2, Y(0.07) + 3); ctx.fillText('0.01', 2, Y(0.01) + 3);
}
function labNote(){
  var m = lab.model, e = lab.ev, n, last = lab.hist.length ? lab.hist[lab.hist.length - 1] : 0;
  var recent = lab.hist.slice(-200), stalled = recent.length === 200 && (Math.max.apply(null, recent) - Math.min.apply(null, recent)) < 0.35;
  if(m.step === 0) n = '<b>Step 0.</b> Two random encoders. Concentration: captions ' + e.coneT.toFixed(2) + ', images ' + e.coneI.toFixed(2) + ' (1.0 would be a single point) &mdash; each modality sits in its own cone, the cone effect that Liang et al. found in every real encoder. Accuracy ' + (e.i2t * 100).toFixed(0) + '% against a chance level of 11%.';
  else if(e.i2t >= 0.97){
    var df = lab.lastFw ? dupFloor(lab.lastFw.fw.pairs) : 0, fnk = batchFalseNegatives(lab.lastFw && lab.lastFw.fw);
    n = '<b>Solved.</b> Nine clusters, each caption sitting inside its image cluster; positive-pair cosine ' + e.posCos.toFixed(2) + '. The loss is ' + last.toFixed(2) + ' rather than 0 because this batch of ' + lab.N + ' drawn from 9 concepts contains ' + fnk + ' false-negative cells (amber): pairs of the <em>same</em> concept that the objective still insists on telling apart. The best any model could score on this batch is (1/N) &Sigma; ln k<sub>i</sub> = ' + df.toFixed(2) + ', the amber line.' + (lab.tempMode === 'learn' ? ' &tau; has fallen to ' + (1 / scaleOf(m)).toFixed(3) + ' and keeps drifting toward the clip, as in the paper.' : '');
  }
  else if(m.step >= 600 && e.i2t < 0.6 && stalled) n = '<b>Stuck.</b> Accuracy ' + (e.i2t * 100).toFixed(0) + '% and the loss has stopped moving. On a one-dimensional ring two clusters cannot pass through each other, so this seed has locked in the wrong order. It is an artefact of the 2-D toy &mdash; 768 dimensions leave room to route around &mdash; press <em>Reset</em> for a new seed.';
  else if(e.colAcc > 0.85 && e.shpAcc < 0.6) n = '<b>Colour learned, shape ignored.</b> Colour accuracy ' + (e.colAcc * 100).toFixed(0) + '%, shape ' + (e.shpAcc * 100).toFixed(0) + '%. The batches have been easy enough that separating colours already wins most of the game. Larger batches make same-colour negatives unavoidable.';
  else if(e.shpAcc > 0.85 && e.colAcc < 0.6) n = '<b>Shape learned, colour ignored.</b> Shape accuracy ' + (e.shpAcc * 100).toFixed(0) + '%, colour ' + (e.colAcc * 100).toFixed(0) + '%. The batches have been easy enough that separating shapes already wins most of the game.';
  else if(lab.tempMode !== 'learn' && +lab.tempMode >= 1 && m.step > 150) n = '<b>&tau; pinned at 1.</b> Loss ' + last.toFixed(2) + ' against a floor of ' + floorLoss(lab.N, 1).toFixed(2) + ' for N = ' + lab.N + ': with cosines capped at 1 the softmax stays soft, so even a perfect ring cannot score well. Retrieval accuracy is ' + (e.i2t * 100).toFixed(0) + '% anyway &mdash; the geometry is fine, the loss just cannot say so.';
  else if(lab.loss === 'sigmoid') n = '<b>Sigmoid.</b> Every cell is its own yes/no question. The bias b = ' + m.bias.toFixed(2) + ' keeps the ' + (lab.N * lab.N - lab.N) + ' negatives near "no" from the start, so early steps are not dominated by pushing negatives apart. Accuracy ' + (e.i2t * 100).toFixed(0) + '%.';
  else n = '<b>Training.</b> Step ' + m.step + ': the captions are spreading around the circle first &mdash; they are the easier side, since every caption of a concept is nearly the same bag of words &mdash; and the image clusters are drifting to meet them. Accuracy ' + (e.i2t * 100).toFixed(0) + '%, positive-pair cosine ' + e.posCos.toFixed(2) + '.';
  $('lab-note').innerHTML = n;
}
function initLab(){
  document.querySelectorAll('.lab-n').forEach(function(b){ b.onclick = function(){ document.querySelectorAll('.lab-n').forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); lab.N = +b.dataset.n; labDraw(); }; });
  document.querySelectorAll('.lab-sp').forEach(function(b){ b.onclick = function(){ document.querySelectorAll('.lab-sp').forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); lab.speed = +b.dataset.sp; }; });
  document.querySelectorAll('.lab-preset').forEach(function(b){ b.onclick = function(){ labPreset(b.dataset.preset); }; });
  $('lab-forces').onclick = function(){ lab.forces = !lab.forces; this.classList.toggle('active', lab.forces); this.textContent = lab.forces ? 'forces on' : 'forces off'; drawCircle(); };
  document.querySelectorAll('.lab-t').forEach(function(b){ b.onclick = function(){ document.querySelectorAll('.lab-t').forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); lab.tempMode = b.dataset.t; labReset(false); }; });
  document.querySelectorAll('.lab-l').forEach(function(b){ b.onclick = function(){ document.querySelectorAll('.lab-l').forEach(function(x){ x.classList.remove('active'); }); b.classList.add('active'); lab.loss = b.dataset.l; labReset(false); }; });
  $('lab-play').onclick = function(){ lab.playing = !lab.playing; this.innerHTML = lab.playing ? '&#10074;&#10074; Pause' : '&#9654; Train'; if(lab.playing) requestAnimationFrame(labLoop); };
  $('lab-step').onclick = function(){ labStep(1); };
  $('lab-step50').onclick = function(){ labStep(50); };
  $('lab-reset').onclick = function(){ lab.playing = false; $('lab-play').innerHTML = '&#9654; Train'; labReset(true); };
  labReset(false);
}

/* ═══════════════ 7 · ZERO-SHOT ═══════════════ */
var zs = { imgIdx: 0, tmpl: 'a photo of a {C} {S}', imgs: [] };
function zsModel(){
  if(lab.model && lab.ev && lab.ev.i2t >= 0.9) return { m: lab.model, name: 'your lab model (step ' + lab.model.step + ', ' + (lab.ev.i2t * 100).toFixed(0) + '% on held-out images)' };
  return { m: PRE, name: 'the model trained when the page loaded (' + (PRE_EVAL.i2t * 100).toFixed(0) + '% on held-out images) &mdash; train the lab past 90% to use yours' };
}
function zsTokens(tmpl, c, s){
  var words = tmpl.toLowerCase().replace('{c}', COLORS[c]).replace('{s}', SHAPES[s]).split(/[^a-z]+/).filter(Boolean);
  return words;
}
function zsRefresh(){
  if(!zs.imgs.length) return;                      // the lab draws before the zero-shot panel exists
  var M = zsModel(), m = M.m; $('zs-which').innerHTML = M.name;
  var tmpl = zs.tmpl, s = scaleOf(m);
  /* chips: show which words survive the vocabulary */
  var raw = tmpl.toLowerCase().split(/[^a-z{}]+/).filter(Boolean), chips = '';
  raw.forEach(function(w){ var ok = w === '{c}' || w === '{s}' || VOCAB.indexOf(w) >= 0; chips += '<span class="chip ' + (ok ? 'ok' : 'bad') + '">' + w + '</span>'; });
  $('zs-chips').innerHTML = chips || '<span class="chip">empty prompt</span>';
  /* nine classifier weights (an ensemble averages the four template vectors, then renormalises) */
  var ENS = ['a photo of a {C} {S}', 'a picture of a {C} {S}', 'an image of a {C} {S}', 'the {S} is {C}'];
  var W = [], names = [];
  for(var c = 0; c < 3; c++) for(var sh = 0; sh < 3; sh++){
    if(tmpl === 'ensemble'){
      var v = [0, 0];
      ENS.forEach(function(t){ var u = embedText(m, { y: tokensToVec(zsTokens(t, c, sh)) }); v[0] += u[0]; v[1] += u[1]; });
      var nn = Math.hypot(v[0], v[1]) || 1e-9; W.push([v[0] / nn, v[1] / nn]);
    } else {
      var words = zsTokens(tmpl, c, sh).filter(function(w){ return VOCAB.indexOf(w) >= 0; });
      W.push(embedText(m, { y: tokensToVec(words) }));
    }
    names.push(COLORS[c] + ' ' + SHAPES[sh]);
  }
  if(tmpl === 'ensemble') $('zs-chips').innerHTML = ENS.map(function(t){ return '<span class="chip ok">' + t + '</span>'; }).join('');
  var img = zs.imgs[zs.imgIdx], u = embedImage(m, img);
  var L = W.map(function(wv){ return s * cos2(u, wv); }), mx = Math.max.apply(null, L), Z = 0;
  L.forEach(function(l){ Z += Math.exp(l - mx); });
  var P = L.map(function(l){ return Math.exp(l - mx) / Z; }), win = 0;
  P.forEach(function(p, i){ if(p > P[win]) win = i; });
  var bars = $('zs-bars'); bars.innerHTML = '';
  names.forEach(function(n, i){
    var d = document.createElement('div'); d.className = 'zs-bar' + (i === win ? ' win' : '');
    d.innerHTML = '<span class="zl' + (i === win ? ' win' : '') + '">' + (tmpl === 'ensemble' ? 'avg{' + n + '}' : zsTokens(tmpl, Math.floor(i / 3), i % 3).join(' ')) + '</span><div class="zw"><div class="zf" style="width:' + (P[i] * 100).toFixed(1) + '%"></div></div><span class="zv">' + (P[i] * 100).toFixed(1) + '%</span>';
    bars.appendChild(d);
  });
  $('zs-pred').textContent = names[win] + (win === img.id ? ' ✓' : ' ✗');
  /* accuracy of this template over all 90 held-out images */
  var hit = 0;
  HELDOUT.imgs.forEach(function(im){
    var uu = embedImage(m, im), best = -2, bi = 0;
    W.forEach(function(wv, i){ var d = cos2(uu, wv); if(d > best){ best = d; bi = i; } });
    if(bi === im.id) hit++;
  });
  var acc = hit / HELDOUT.imgs.length;
  $('zs-acc').textContent = (acc * 100).toFixed(1) + '%';
  var note = '<b>' + names[win] + '</b> wins with ' + (P[win] * 100).toFixed(1) + '% (scale exp(t) = ' + s.toFixed(1) + '). ';
  if(tmpl === 'ensemble') note += 'Averaging four templates gives ' + (acc * 100).toFixed(0) + '% over the held-out set &mdash; the toy version of the paper\'s 80-prompt ensemble, which added 3.5 points on ImageNet.';
  else if(acc >= 0.99) note += 'This template classifies every held-out image correctly. It looks like the sentences the model was trained on.';
  else if(acc >= 0.8) note += 'This template gets ' + (acc * 100).toFixed(0) + '%. The unfamiliar words shift every class vector by a similar direction, which is enough to flip a few borderline images &mdash; the toy version of the paper\'s 1.3-point template effect.';
  else note += 'This template gets only ' + (acc * 100).toFixed(0) + '%. A prompt that looks nothing like a training caption produces classifier weights that point nowhere useful &mdash; and the model never saw a bare label, just as CLIP rarely saw one on the web.';
  $('zs-note').innerHTML = note;
}
function initZs(){
  var rng = makeRng(777);
  for(var c = 0; c < 3; c++) for(var s = 0; s < 3; s++) zs.imgs.push(makeImage(rng, c, s));
  var wrap = $('zs-imgs');
  zs.imgs.forEach(function(im, i){
    var cv = shapeIcon(46, im.c, im.s, im); if(i === 0) cv.className = 'sel';
    cv.onclick = function(){ zs.imgIdx = i; wrap.querySelectorAll('canvas').forEach(function(x){ x.className = ''; }); cv.className = 'sel'; zsRefresh(); };
    wrap.appendChild(cv);
  });
  $('zs-tmpl').onchange = function(){
    if(this.value === 'custom'){ $('zs-custom').style.display = ''; zs.tmpl = $('zs-custom').value || '{C} {S}'; }
    else { $('zs-custom').style.display = 'none'; zs.tmpl = this.value; }
    zsRefresh();
  };
  $('zs-custom').value = 'a small {C} {S}';
  $('zs-custom').oninput = function(){ zs.tmpl = this.value || '{C} {S}'; zsRefresh(); };
  zsRefresh();
}

/* ═══════════════ 8 · SCALE ═══════════════ */
var SC_PAIRS = [100e6, 200e6, 300e6, 400e6, 500e6, 600e6, 700e6, 800e6, 900e6, 1e9, 1.1e9, 1.2e9, 1.3e9, 1.4e9, 1.5e9, 1.6e9, 1.7e9, 1.8e9, 1.9e9, 2e9];
function scaleCalc(N, D, E){
  var spe = D / N, steps = spe * E, seen = D * E, negs = N * N - N, entries = N * N, bytes16 = entries * 2;
  return { spe: spe, steps: steps, seen: seen, negs: negs, entries: entries, gb16: bytes16 / 1e9, lnN: Math.log(N) };
}
function drawScale(){
  var N = Math.pow(2, +$('sc-nslider').value), D = 400e6, E = 32;
  var r = scaleCalc(N, D, E);
  $('sc-n').textContent = fmtInt(N);
  $('sc-spe').textContent = fmtInt(r.spe); $('sc-steps').textContent = fmtInt(r.steps); $('sc-seen').textContent = fmtBig(r.seen);
  $('sc-negs').textContent = fmtBig(r.negs); $('sc-mem').textContent = r.gb16 >= 1 ? r.gb16.toFixed(2) + ' GB' : (r.gb16 * 1000).toFixed(0) + ' MB';
  $('sc-lnn').textContent = r.lnN.toFixed(2);
  $('sc-note').innerHTML = (N === 32768 ? 'These are the paper\'s settings: ' : 'For comparison, at the paper\'s N = 32,768: ') + fmtInt(400e6 / 32768) + ' steps per epoch, ' + fmtInt(400e6 / 32768 * 32) + ' steps in total, 12.8 B pairs seen, and a logit matrix of ' + fmtBig(32768 * 32768) + ' entries per step &mdash; which is why no single GPU ever materialises it. Halving the batch doubles the number of steps but quarters the negatives each step sees.';
}
function initScale(){
  $('sc-nslider').oninput = drawScale;
  $('sc-gpudays-r').textContent = fmtInt(592 * 18); $('sc-gpudays-v').textContent = fmtInt(256 * 12);
  var eff = $('eff'), rows = [['Transformer LM (predict the caption)', 1, '#64748b'], ['Bag-of-words prediction', 3, '#a78bfa'], ['Contrastive (CLIP)', 12, '#2dd4bf']];
  rows.forEach(function(r){ var d = document.createElement('div'); d.className = 'er'; d.innerHTML = '<span class="el">' + r[0] + '</span><div class="ew"><div class="ef" style="width:' + (r[1] / 12 * 100) + '%;background:' + r[2] + '"></div></div><span class="ev">' + r[1] + '&times;</span>'; eff.appendChild(d); });
  drawScale();
}

/* ═══════════════ 9 · LIMITS ═══════════════ */
function bowUpdate(){
  var wa = $('bow-a').value.toLowerCase().split(/[^a-z]+/).filter(function(w){ return VOCAB.indexOf(w) >= 0; });
  var wb = $('bow-b').value.toLowerCase().split(/[^a-z]+/).filter(function(w){ return VOCAB.indexOf(w) >= 0; });
  if(!wa.length || !wb.length){ $('bow-cos').textContent = '— (no vocabulary words)'; return; }
  var a = embedText(PRE, { y: tokensToVec(wa) }), b = embedText(PRE, { y: tokensToVec(wb) });
  $('bow-cos').textContent = cos2(a, b).toFixed(4) + '  (' + wa.join(' ') + ' | ' + wb.join(' ') + ')';
}
function initLimits(){ $('bow-a').oninput = bowUpdate; $('bow-b').oninput = bowUpdate; bowUpdate(); }

/* ═══════════════ PROGRESS + INIT ═══════════════ */
window.addEventListener('scroll', function(){
  var h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
  $('progress').style.width = (p * 100) + '%';
});
function redrawAll(){ drawNorm(); labDraw(); }
window.addEventListener('resize', function(){ drawNorm(); labDraw(); gameLines(); });
gameShuffle();
$('game-check').onclick = gameCheck; $('game-reset').onclick = gameShuffle; $('game-matrix').onclick = gameMatrix; $('game-scale').onclick = gameScale;
initArch(); initNorm(); initMx(); initLoss(); initTemp(); initLab(); initZs(); initScale(); initLimits();
