"use strict";
/* Checklist steps 2, 3 and 5 for Post 66: main index card + counts, learning map node/edges/path, strips on posts 16/08/30. Idempotent. */
var fs = require('fs');
var ROOT = 'C:/Users/Bhaskarjit/visual-summary/';
function once(hay, needle, what){ var n = hay.split(needle).length - 1; if(n !== 1) throw new Error(what + ': expected exactly one occurrence, found ' + n); }
function rw(file, fn){ var p = ROOT + file, s = fs.readFileSync(p, 'utf8'), t = fn(s); if(t !== s){ fs.writeFileSync(p, t); console.log('updated ' + file); } else console.log('unchanged ' + file); }

/* ── 2. main index ── */
rw('index.html', function(s){
  if(s.indexOf('./66-clip/') < 0){
    var card = [
      '    <!-- Post 66 · representations (CLIP) -->',
      '    <a class="post-card" data-group="representations" data-level="2" href="./66-clip/" style="--accent-color: linear-gradient(90deg,#2dd4bf,#a78bfa);">',
      '      <div>',
      '        <div class="post-num">Post 66 &middot; Representations</div>',
      '        <div class="post-title">CLIP Under the Hood &mdash; A Matching Game Played 32,768 Wide</div>',
      '      </div>',
      '      <div class="post-desc">',
      '        CLIP never sees a label. It sees a batch of images and a batch of captions and is asked which goes with which. This post takes that question apart in the distill.pub style: play one training step yourself, watch the two encoders, the N&times;N similarity matrix, the symmetric InfoNCE loss built line by line from the paper&rsquo;s own pseudocode, the gradient matrix P&minus;I, and the temperature knob CLIP learns for itself. Then train a real CLIP-in-miniature live in the browser &mdash; two MLP towers, hand-written backprop checked against finite differences, learnable temperature clipped at 100 &mdash; and watch nine concepts organise themselves on a circle. Five guided experiments (frozen &tau;, tiny batch, SigLIP sigmoid, batch collisions), a zero-shot classifier that writes itself from prompts, prompt ensembling, the cost of 400M pairs, and what the objective never asks for: word order, counting, the modality gap, typographic attacks.',
      '      </div>',
      '      <div class="post-tags">',
      '        <span class="tag">Multimodal</span>',
      '        <span class="tag">Contrastive Learning</span>',
      '        <span class="tag">CLIP</span>',
      '        <span class="tag">Zero-Shot</span>',
      '        <span class="tag">SigLIP</span>',
      '        <span class="tag">Interactive Lab</span>',
      '      </div>',
      '    </a>',
      '',
      ''].join('\n');
    var anchor = '    <!-- Post 60 · agents (Sakana Fugu) -->';
    once(s, anchor, 'index anchor');
    s = s.replace(anchor, card + anchor);
  }
  /* filter counts: set to the real card counts */
  var counts = {}; var total = 0;
  s.replace(/class="post-card" data-group="([a-z]+)"/g, function(_, g){ counts[g] = (counts[g] || 0) + 1; total++; return _; });
  console.log('  card counts', counts, 'total', total);
  function setCount(filter, n){
    /* anchor on the <button>, not on the CSS selector that also contains data-filter="..." */
    var re = new RegExp('(<button class="filter-tab[^"]*" data-filter="' + filter + '"[\\s\\S]*?<span class="filter-count">)(\\d+)(</span>)');
    var m = s.match(re); if(!m) throw new Error('filter ' + filter + ' not found');
    if(m[0].split('filter-count').length !== 2) throw new Error('filter ' + filter + ' anchor spans more than one count');
    s = s.replace(re, '$1' + n + '$3');
  }
  setCount('all', total);
  Object.keys(counts).forEach(function(g){ setCount(g, counts[g]); });
  return s;
});

/* ── 3. learning map ── */
rw('learning-map/index.html', function(s){
  if(s.indexOf("id:'p66'") < 0){
    var node = "  {id:'p66',    label:'CLIP\\nContrastive VL', post:'66', level:2, row:6, cat:'representations', href:'../66-clip/', desc:'CLIP (Radford et al. 2021) under the hood: two encoders, one space; the N×N similarity matrix with the diagonal as the answer key; symmetric InfoNCE built from the paper\\'s pseudocode; the gradient P−I; the learnable temperature (init 0.07, scale clipped at 100). A CLIP-in-miniature trains live in the browser with guided experiments (frozen τ, tiny batch, SigLIP sigmoid, batch collisions), plus a zero-shot classifier written from prompts, prompt ensembling, and the objective\\'s blind spots (word order / ARO, counting, modality gap, typographic attacks).'},\n";
    var anchor = "  {id:'p04',    label:'TurboQuant',";
    once(s, anchor, 'map node anchor');
    s = s.replace(anchor, node + anchor);
  }
  if(s.indexOf("['p16','p66']") < 0){
    var edgeAnchor = "  ['g-vdb','p21'],\n";
    once(s, edgeAnchor, 'map edge anchor');
    s = s.replace(edgeAnchor, "  ['p16','p66'],   ['p08','p66'],   ['p66','p30'],   ['p66','p56'],\n" + edgeAnchor);
  }
  if(s.indexOf("'p08','p16','p66'") < 0){
    var pathNodes = "nodes:['p09','p05','p03','p10','g-cot','g-w2v','p08','p16','g-kvc','p14'],";
    var pathSteps = "steps:['Post 09','Post 05','Post 03','Post 10','Gap: CoT','Gap: Embeddings','Post 08','Post 16','Gap: KV Cache','Post 14']";
    once(s, pathNodes, 'path nodes'); once(s, pathSteps, 'path steps');
    s = s.replace(pathNodes, "nodes:['p09','p05','p03','p10','g-cot','g-w2v','p08','p16','p66','g-kvc','p14'],");
    s = s.replace(pathSteps, "steps:['Post 09','Post 05','Post 03','Post 10','Gap: CoT','Gap: Embeddings','Post 08','Post 16','Post 66','Gap: KV Cache','Post 14']");
  }
  /* stats: count real nodes and edges */
  var nodesBlock = s.slice(s.indexOf('var NODES = ['), s.indexOf('var EDGES = ['));
  var edgesBlock = s.slice(s.indexOf('var EDGES = ['), s.indexOf('var PATHS = {'));
  var posts = (nodesBlock.match(/post:'\d+'/g) || []).length, gaps = (nodesBlock.match(/gap:true/g) || []).length;
  var edges = (edgesBlock.match(/\['[^']+','[^']+'\]/g) || []).length;
  console.log('  map: posts ' + posts + ' gaps ' + gaps + ' nodes ' + (posts + gaps) + ' edges ' + edges);
  s = s.replace(/(<div class="stat-val">)\d+(<\/div><div class="stat-lbl">Published Posts)/, '$1' + posts + '$2');
  s = s.replace(/(<div class="stat-val" style="color:#f7b731;">)\d+(<\/div><div class="stat-lbl">Gap Topics)/, '$1' + gaps + '$2');
  s = s.replace(/(<div class="stat-val" style="color:#e17055;">)\d+(<\/div><div class="stat-lbl">Total Nodes)/, '$1' + (posts + gaps) + '$2');
  s = s.replace(/(<div class="stat-val" style="color:#e11d48;">)\d+(<\/div><div class="stat-lbl">Connections Mapped)/, '$1' + edges + '$2');
  s = s.replace(/<div class="hero-sub">\d+ published posts across (\d+) curriculum levels — plus \d+ gap topics/, '<div class="hero-sub">' + posts + ' published posts across $1 curriculum levels — plus ' + gaps + ' gap topics');
  return s;
});

/* ── 5. strips on affected posts ── */
function rcCard(why, eol){
  return ['      <a class="rc" href="../66-clip/">', '        <div class="rc-type" style="color:#a78bfa;">Related</div>', '        <div class="rc-num">Post 66 · Representations</div>', '        <div class="rc-title">CLIP Under the Hood</div>', '        <div class="rc-why">' + why + '</div>', '      </a>', ''].join(eol);
}
[
  ['16-contrastive-loss/index.html', 'The same pull-together / push-apart idea at web scale, across two modalities — with a CLIP-in-miniature you can train live.'],
  ['08-sbert/index.html', 'A two-tower encoder trained for cosine similarity, one modality later: image tower plus text tower, symmetric InfoNCE loss.'],
  ['30-semantic-collapse/index.html', 'The multimodal case of the same mechanism: CLIP behaves like a bag of words because its negatives never test word order.'],
].forEach(function(item){
  rw(item[0], function(s){
    if(s.indexOf('../66-clip/') >= 0) return s;
    var eol = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    var re = /(    <\/div>\r?\n    <a class="map-link-btn" href="\.\.\/learning-map\/">)/;
    var m = s.match(re); if(!m) throw new Error(item[0] + ': strip anchor not found');
    if(s.split(m[1]).length !== 2) throw new Error(item[0] + ': strip anchor not unique');
    return s.replace(re, rcCard(item[1], eol) + '$1');
  });
});
console.log('done');
