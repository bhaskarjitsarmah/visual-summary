"use strict";
/* Post 67: main index card + counts, learning map node/edges, strip on post 20. Idempotent. */
var fs = require('fs');
var ROOT = 'C:/Users/Bhaskarjit/visual-summary/';
function once(hay, needle, what){ var n = hay.split(needle).length - 1; if(n !== 1) throw new Error(what + ': expected exactly one occurrence, found ' + n); }
function rw(file, fn){ var p = ROOT + file, s = fs.readFileSync(p, 'utf8'), t = fn(s); if(t !== s){ fs.writeFileSync(p, t); console.log('updated ' + file); } else console.log('unchanged ' + file); }

/* ── main index ── */
rw('index.html', function(s){
  if(s.indexOf('./67-lazy-rules/') < 0){
    var card = [
      '    <!-- Post 67 · agents (Claude Code instruction loading) -->',
      '    <a class="post-card" data-group="agents" data-level="1" href="./67-lazy-rules/" style="--accent-color: linear-gradient(90deg,#f97316,#38bdf8);">',
      '      <div>',
      '        <div class="post-num">Post 67 &middot; Agents &amp; Systems</div>',
      '        <div class="post-title">Why .claude/rules Waits and CLAUDE.md Doesn&rsquo;t</div>',
      '      </div>',
      '      <div class="post-desc">',
      '        Two markdown files in the same repo: one is in Claude Code&rsquo;s prompt from the first turn, the other arrives only when Claude reads a matching file. The folder doesn&rsquo;t decide which. Three lines of <code>paths:</code> frontmatter do. A session simulator shows the prompt filling file by file across three scenarios, including the greenfield case where a new endpoint is written before its rule loads. Plus a glob playground, a context-budget calculator, the full load ladder (launch, on read, on invoke, after /compact), a where-does-this-belong quiz, and how to debug it with /context and the InstructionsLoaded hook. Every load rule is cited to the Claude Code docs.',
      '      </div>',
      '      <div class="post-tags">',
      '        <span class="tag">Claude Code</span>',
      '        <span class="tag">CLAUDE.md</span>',
      '        <span class="tag">Context Engineering</span>',
      '        <span class="tag">Lazy Loading</span>',
      '        <span class="tag">Agent Harness</span>',
      '        <span class="tag">Interactive Simulator</span>',
      '      </div>',
      '    </a>',
      '',
      ''].join('\n');
    var anchor = '    <!-- Post 66 · representations (CLIP) -->';
    once(s, anchor, 'index anchor');
    s = s.replace(anchor, function(){ return card + anchor; });
  }
  var counts = {}; var total = 0;
  s.replace(/class="post-card" data-group="([a-z]+)"/g, function(_, g){ counts[g] = (counts[g] || 0) + 1; total++; return _; });
  console.log('  card counts', counts, 'total', total);
  function setCount(filter, n){
    var re = new RegExp('(<button class="filter-tab[^"]*" data-filter="' + filter + '"[\\s\\S]*?<span class="filter-count">)(\\d+)(</span>)');
    var m = s.match(re); if(!m) throw new Error('filter ' + filter + ' not found');
    if(m[0].split('filter-count').length !== 2) throw new Error('filter ' + filter + ' anchor spans more than one count');
    s = s.replace(re, '$1' + n + '$3');
  }
  setCount('all', total);
  Object.keys(counts).forEach(function(g){ setCount(g, counts[g]); });
  return s;
});

/* ── learning map ── */
rw('learning-map/index.html', function(s){
  if(s.indexOf("id:'p67'") < 0){
    var node = "  {id:'p67',    label:'Claude Code\\nLazy Rules', post:'67', level:5, row:24, cat:'agents', href:'../67-lazy-rules/', desc:'Why .claude/rules/*.md with paths: frontmatter load only when Claude reads a matching file, while CLAUDE.md loads every session. Session simulator (three scenarios incl. the greenfield catch), glob playground, context-budget calculator, the load ladder (launch / on read / on invoke / after /compact), placement quiz, and debugging with /context and the InstructionsLoaded hook.'},\n";
    var anchor = "  {id:'p60',";
    once(s, anchor, 'map node anchor');
    s = s.replace(anchor, function(){ return node + anchor; });
  }
  if(s.indexOf("['p35','p67']") < 0){
    var edgeAnchor = "  ['g-vdb','p21'],\n";
    once(s, edgeAnchor, 'map edge anchor');
    s = s.replace(edgeAnchor, function(){ return "  ['p35','p67'],   ['p59','p67'],   ['p50','p67'],   ['p20','p67'],\n" + edgeAnchor; });
  }
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

/* ── strip on post 20 ── */
function rcCard(why, eol){
  return ['      <a class="rc" href="../67-lazy-rules/">', '        <div class="rc-type" style="color:#a78bfa;">Related</div>', '        <div class="rc-num">Post 67 · Agents</div>', '        <div class="rc-title">Why .claude/rules Waits</div>', '        <div class="rc-why">' + why + '</div>', '      </a>', ''].join(eol);
}
[
  ['20-managed-agents/index.html', 'How Claude Code decides which instruction files enter the prompt, and when: launch, on read, on invoke.'],
].forEach(function(item){
  rw(item[0], function(s){
    if(s.indexOf('../67-lazy-rules/') >= 0) return s;
    var eol = s.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    /* post 20's strip has a stray "Next" card between the grid and the map link; insert at the end of the grid */
    var re = /(    <\/div>\r?\n    <a class="rc" href="\.\.\/35-agent-harness\/">)/;
    var m = s.match(re); if(!m) throw new Error(item[0] + ': strip anchor not found');
    if(s.split(m[1]).length !== 2) throw new Error(item[0] + ': strip anchor not unique');
    return s.replace(re, function(){ return rcCard(item[1], eol) + m[1]; });
  });
});
console.log('done');
