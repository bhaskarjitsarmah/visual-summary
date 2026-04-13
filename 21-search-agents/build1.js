const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Making Search Agents Faster &amp; Smarter</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#c9d1d9;--muted:#8b949e;
  --accent:#0984e3;--accent2:#74b9ff;--accent3:#d6eaff;
  --search:#0984e3;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.6;display:flex;}
a{text-decoration:none;color:inherit;}
.sidebar{width:240px;min-width:240px;height:100vh;position:sticky;top:0;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;padding:0 0 40px;flex-shrink:0;}
.sidebar-logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);}
.sidebar-logo-title{font-size:13px;font-weight:700;color:var(--accent2);}
.sidebar-logo-sub{font-size:10px;color:var(--muted);margin-top:2px;}
.nav-group-title{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;padding:10px 16px 4px;}
.nav-link{display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;color:var(--muted);cursor:pointer;transition:all .15s;}
.nav-link:hover,.nav-link.active{color:var(--text);background:rgba(9,132,227,.08);}
.nav-link.active{color:var(--accent2);}
.dot{width:7px;height:7px;border-radius:50%;flex-shrink:0;}
.main{flex:1;overflow-y:auto;height:100vh;}
.pipeline-map{position:sticky;top:0;z-index:50;background:rgba(13,17,23,.96);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);padding:8px 24px;display:flex;align-items:center;flex-wrap:wrap;gap:4px;}
.pipe-step{display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted);padding:2px 6px;border-radius:4px;transition:color .15s;}
.pipe-step:hover{color:var(--text);}
.pipe-dot{width:6px;height:6px;border-radius:50%;}
.pipe-arrow{color:var(--border);font-size:12px;}
.section{min-height:100vh;padding:60px 48px 80px;border-bottom:1px solid var(--border);}
.section-tag{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px;}
.section-title{font-size:28px;font-weight:800;color:var(--text);margin-bottom:8px;line-height:1.25;}
.section-sub{font-size:14px;color:var(--muted);margin-bottom:28px;max-width:680px;}
.card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:20px 22px;margin-bottom:16px;}
.card-title{font-size:12px;font-weight:700;margin-bottom:8px;text-transform:uppercase;letter-spacing:.8px;}
.card-body{font-size:13px;color:var(--muted);line-height:1.6;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
.grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;}
canvas{display:block;border-radius:10px;background:var(--surface);border:1px solid var(--border);}
.btn{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .15s;}
.btn:hover{opacity:.85;}
.btn-tab{background:var(--surface);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:6px 14px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;}
.btn-tab.active,.btn.active{background:var(--accent);color:#fff;border-color:var(--accent);}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
.formula{background:#0d1117;border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;color:#74b9ff;line-height:1.8;margin-bottom:16px;white-space:pre;}
.stats-row{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px;}
.stat{text-align:center;}
.stat-val{font-size:28px;font-weight:800;color:var(--accent2);}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;}
.section-bridge{margin-top:48px;padding-top:28px;border-top:1px solid var(--border);text-align:right;}
.section-bridge-link{font-size:12px;color:var(--accent2);font-weight:600;border:1px solid var(--accent2);border-radius:6px;padding:6px 14px;transition:all .15s;}
.section-bridge-link:hover{background:rgba(9,132,227,.1);}
.accordion-item{border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden;}
.accordion-header{padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;background:var(--surface);}
.accordion-header:hover{background:#1c2128;}
.accordion-chevron{transition:transform .2s;font-size:10px;color:var(--muted);}
.accordion-body{padding:14px 16px;font-size:12px;color:var(--muted);display:none;border-top:1px solid var(--border);}
#pg-gate{position:fixed;inset:0;background:linear-gradient(135deg,#0d1117 0%,#161b22 50%,#0d1117 100%);z-index:9999;display:flex;align-items:center;justify-content:center;}
.pg-box{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px 48px;max-width:440px;width:100%;text-align:center;box-shadow:0 0 40px rgba(9,132,227,.1);}
.pg-icon{font-size:2.5rem;margin-bottom:16px;}
.pg-title{font-size:1.3rem;font-weight:800;color:#c9d1d9;margin-bottom:6px;}
.pg-subtitle{font-size:13px;font-weight:600;color:#74b9ff;margin-bottom:6px;}
.pg-sub{font-size:11px;color:#8b949e;margin-bottom:24px;}
.pg-input{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px 14px;color:#c9d1d9;font-size:14px;outline:none;text-align:center;}
.pg-input:focus{border-color:#0984e3;}
.pg-btn{margin-top:12px;width:100%;background:linear-gradient(135deg,#0984e3,#0652a3);color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600;cursor:pointer;}
.pg-err{color:#ff6b6b;font-size:11px;margin-top:8px;min-height:16px;}
.pg-join{margin-top:16px;font-size:11px;color:#8b949e;}
.pg-join a{color:#74b9ff;text-decoration:underline;}
.highlight-box{border-left:3px solid var(--accent);padding:12px 16px;background:rgba(9,132,227,.06);border-radius:0 8px 8px 0;margin-bottom:16px;font-size:13px;color:var(--muted);}
.highlight-box.amber{border-color:#f7b731;background:rgba(247,183,49,.06);}
.highlight-box.green{border-color:#51cf66;background:rgba(81,207,102,.06);}
.highlight-box.violet{border-color:#7c6af4;background:rgba(124,106,244,.06);}
.highlight-box.red{border-color:#ff6b6b;background:rgba(255,107,107,.06);}
.info-panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-top:12px;font-size:13px;color:var(--muted);min-height:80px;}
.info-panel strong{color:var(--text);}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-right:4px;}
.badge-blue{background:rgba(9,132,227,.2);color:#74b9ff;}
.badge-amber{background:rgba(247,183,49,.2);color:#f7b731;}
.badge-green{background:rgba(81,207,102,.2);color:#51cf66;}
.badge-violet{background:rgba(124,106,244,.2);color:#a29bfe;}
.badge-red{background:rgba(255,107,107,.2);color:#ff6b6b;}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;background:var(--border);border-radius:4px;outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;}
.slider-row{display:flex;gap:12px;align-items:center;margin-bottom:16px;}
.slider-lbl{font-size:11px;color:var(--muted);min-width:140px;}
.slider-val{font-size:12px;font-weight:700;color:var(--accent2);min-width:50px;}
#scroll-progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9998;transition:width .1s;}
.config-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid transparent;transition:all .15s;}
.config-badge.active{border-color:var(--accent);}
</style>
</head>
<body>

<div id="pg-gate">
  <div class="pg-box">
    <div class="pg-icon">&#128269;</div>
    <div class="pg-title">Search Agents: Faster &amp; Smarter</div>
    <div class="pg-subtitle">RAG Optimization &mdash; Tool Stack + Planner Training</div>
    <div class="pg-sub">This post is for paid subscribers of Visual Summary</div>
    <input class="pg-input" id="pg-input" type="password" placeholder="Enter password" autocomplete="off">
    <button class="pg-btn" onclick="pgCheck()">Unlock</button>
    <div class="pg-err" id="pg-err"></div>
    <div class="pg-join">Not a subscriber yet? <a href="https://visualsummary.substack.com" target="_blank">Join Visual Summary &rarr;</a></div>
  </div>
</div>

<div id="scroll-progress"></div>

<!-- SIDEBAR -->
<nav class="sidebar">
  <div class="sidebar-logo">
    <div class="sidebar-logo-title">Visual AI Papers</div>
    <div class="sidebar-logo-sub">Post 21 &middot; Search Agents</div>
  </div>

  <div class="nav-group-title">The Problem</div>
  <div class="nav-link" data-sec="s-overview" onclick="setActive(this,'s-overview')">
    <span class="dot" style="background:#f7b731"></span>The Bottleneck</div>

  <div class="nav-group-title">Measurement</div>
  <div class="nav-link" data-sec="s-metric" onclick="setActive(this,'s-metric')">
    <span class="dot" style="background:#0984e3"></span>CER-C Metric</div>

  <div class="nav-group-title">The Solutions</div>
  <div class="nav-link" data-sec="s-tool" onclick="setActive(this,'s-tool')">
    <span class="dot" style="background:#51cf66"></span>Search Tool Stack</div>
  <div class="nav-link" data-sec="s-training" onclick="setActive(this,'s-training')">
    <span class="dot" style="background:#7c6af4"></span>Planner Training</div>

  <div class="nav-group-title">Optimization &amp; Results</div>
  <div class="nav-link" data-sec="s-clp" onclick="setActive(this,'s-clp')">
    <span class="dot" style="background:#ff6b6b"></span>CLP Formula</div>
  <div class="nav-link" data-sec="s-results" onclick="setActive(this,'s-results')">
    <span class="dot" style="background:#f7b731"></span>Results</div>
</nav>

<!-- MAIN -->
<div class="main" id="main-scroll">
<div class="pipeline-map">
  <div class="pipe-step"><span class="pipe-dot" style="background:#f7b731"></span>Bottleneck</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#0984e3"></span>CER-C</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#51cf66"></span>Tool Stack</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#7c6af4"></span>Planner</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#ff6b6b"></span>CLP</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#f7b731"></span>Results</div>
</div>

<!-- ====== S1: OVERVIEW ====== -->
<section class="section" id="s-overview">
  <div class="section-tag" style="color:#f7b731">The Problem &middot; ~10 min read</div>
  <h1 class="section-title">Search Agents Are Bottlenecked by Their Own Research</h1>
  <p class="section-sub">RAG agents spend most of their time searching — but most of that time is wasted on bad searches, redundant retrievals, and oversized context. Contextual AI's research identifies two axes to fix this: optimize the search tool, and train the planner to use it more efficiently.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#f7b731">60.7%</div><div class="stat-lbl">Best accuracy</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">2x</div><div class="stat-lbl">Speed gain</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">~3</div><div class="stat-lbl">Tool calls (converged)</div></div>
    <div class="stat"><div class="stat-val" style="color:#7c6af4">2</div><div class="stat-lbl">Design axes</div></div>
  </div>

  <canvas id="canvas-rag-pipeline" width="700" height="300" style="margin-bottom:16px;cursor:pointer;"></canvas>
  <div class="info-panel" id="pipeline-detail">
    <strong>Hover a node</strong> to see its latency contribution and role in the pipeline.
  </div>

  <div class="highlight-box amber" style="margin-top:16px;">
    <strong>The reranker matters most.</strong> Without it, nDCG@5 drops from 0.203 to 0.089 &mdash; a 56% quality collapse. But the reranker also accounts for ~1.5s of latency per search call. This tension between quality and speed is what the research resolves.
  </div>

  <div class="grid3" style="margin-top:24px;">
    <div class="card">
      <div class="card-title" style="color:#f7b731">Why Search Agents Stall</div>
      <div class="card-body">Each research loop involves embedding the query, running ANN + BM25 retrieval, reranking the results, and feeding them into the LLM. The reranker alone takes ~1.5 seconds. Across 5&ndash;10 searches per query, latency compounds fast.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">The Two Axes</div>
      <div class="card-body"><strong>Axis 1:</strong> Search tool configuration — which components (embedding, reranker, retrieval method) to use and at what quality level.<br><strong>Axis 2:</strong> Planner training — teaching the model when to search, how many times, and when to stop.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">BrowseComp-Plus</div>
      <div class="card-body">The evaluation benchmark. A harder version of BrowseComp requiring multi-hop reasoning across many documents. The baseline untrained Strong config achieves 50% accuracy. Trained configs push to 60.7%.</div>
    </div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-metric">CER-C Metric &rarr;</a>
  </div>
</section>

<!-- ====== S2: METRIC ====== -->
<section class="section" id="s-metric">
  <div class="section-tag" style="color:#0984e3">The Metric</div>
  <h2 class="section-title">CER-C: How Quickly Does the Agent Find Evidence?</h2>
  <p class="section-sub">Traditional metrics like nDCG measure final retrieval quality. CER-C (Cumulative Evidence Recall &mdash; Curves) measures something different: how quickly the agent finds relevant documents <em>per token of context consumed</em>. It's a trajectory-level metric.</p>

  <div class="formula">CER-C (Cumulative Evidence Recall - Curves)
------------------------------------------
x-axis : context tokens consumed (bucketed at 10K intervals)
y-axis : fraction of known-relevant documents found

Efficient agent : steep initial rise (finds docs early, uses few tokens)
Wasteful agent  : slow crawl (needs many tokens to find the same docs)

Key insight: a fast tool + trained planner = steeper curve = better CER-C</div>

  <div class="btn-row" id="cer-toggles">
    <button class="btn-tab active" id="cer-btn-fast" onclick="toggleCERLine('fast')">Fast Config</button>
    <button class="btn-tab active" id="cer-btn-strong" onclick="toggleCERLine('strong')">Strong Config</button>
    <button class="btn-tab active" id="cer-btn-max" onclick="toggleCERLine('max')">Max Config</button>
    <button class="btn-tab active" id="cer-btn-trained" onclick="toggleCERLine('trained')">Trained Fast</button>
  </div>
  <canvas id="canvas-cer-c" width="700" height="280" style="margin-bottom:16px;cursor:crosshair;"></canvas>
  <div class="info-panel" id="cer-detail">
    <strong>Hover the chart</strong> to read exact recall values at each token budget.
  </div>

  <div class="highlight-box" style="margin-top:16px;">
    <strong>What a steep curve means:</strong> the agent is finding relevant documents efficiently &mdash; each additional token of context contributes to evidence accumulation. A flat curve means the agent is burning tokens on unhelpful searches.
  </div>

  <div class="grid2" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#0984e3">Why Per-Token, Not Just Accuracy?</div>
      <div class="card-body">Final accuracy hides how the agent got there. An agent that found all evidence in 20K tokens is far better than one that needed 80K tokens for the same result &mdash; even if both score identically on accuracy. CER-C makes this efficiency visible and comparable.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">How Relevant Docs Are Labeled</div>
      <div class="card-body">Ground-truth relevant documents are known for each query. The metric tracks what fraction of those labeled documents have been retrieved at each 10K-token checkpoint in the agent's context window. Simple, interpretable, actionable.</div>
    </div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-tool">Search Tool Stack &rarr;</a>
  </div>
</section>

<!-- ====== S3: TOOL ====== -->
<section class="section" id="s-tool">
  <div class="section-tag" style="color:#51cf66">Tool Optimization</div>
  <h2 class="section-title">The Search Tool Stack: Three Components, Three Trade-offs</h2>
  <p class="section-sub">The search tool has three moving parts: the embedding model (dimension controls recall vs. latency), the reranker (size controls quality vs. speed), and the retrieval method (sparse + dense hybrid vs. ANN-only). Three configurations were tested:</p>

  <div class="btn-row" id="config-toggles">
    <button class="btn-tab active" id="cfg-btn-fast" onclick="selectConfig('fast')">Fast</button>
    <button class="btn-tab" id="cfg-btn-strong" onclick="selectConfig('strong')">Strong</button>
    <button class="btn-tab" id="cfg-btn-max" onclick="selectConfig('max')">Max</button>
  </div>
  <canvas id="canvas-component" width="700" height="300" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="config-detail">
    <strong>Fast config:</strong> 512-dim embeddings, 2B reranker, hybrid retrieval, top-50. Best latency (13s). The planner training erases the quality gap with Strong at no extra cost.
  </div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#51cf66">Embedding Dimensions</div>
      <div class="card-body">MRL (Matryoshka Representation Learning) embeddings let you choose dimension at inference. 512-dim vs 4096-dim: the larger gains 13% recall and 11% nDCG but introduces 7x retrieval latency. Since the reranker dominates latency, this trade-off often isn't worth it.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">The Reranker</div>
      <div class="card-body">The 6B reranker delivers 27% quality improvement over the 2B at roughly 2x latency cost. Without <em>any</em> reranker, nDCG@5 drops from 0.203 to 0.089 &mdash; a 56% collapse. The reranker is non-negotiable for quality; the question is which size to use.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">Hybrid Retrieval</div>
      <div class="card-body">ANN (dense vector) + BM25 (sparse keyword) retrieval combined adds 11% quality at modest latency overhead relative to total reasoning time. BM25 catches exact-match queries that dense embeddings miss. Hybrid is almost always worth the small overhead.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is Matryoshka Representation Learning (MRL)? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">MRL trains a single embedding model such that prefixes of the embedding vector are themselves valid, lower-dimensional embeddings. This means you can truncate a 4096-dim embedding to 512-dim and still get a semantically meaningful representation &mdash; just with less nuance. At query time, you choose the dimension: 512 for speed, 4096 for maximum recall.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Why does the reranker dominate latency? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">ANN retrieval is approximate nearest-neighbor lookup &mdash; very fast even at scale (~50ms). BM25 is inverted-index keyword search &mdash; also fast. But the reranker runs a cross-encoder model over every candidate document pair (query, doc). With top-50 or top-200 candidates, that's 50&ndash;200 forward passes through a 2B or 6B parameter model. That takes ~1.5 seconds &mdash; dwarfing the upstream retrieval.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Why does hybrid retrieval work? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Dense embeddings capture semantic meaning &mdash; great for paraphrases and conceptual queries. Sparse BM25 captures exact keyword matches &mdash; great for proper nouns, model names, acronyms, and rare terms. Real queries often have both aspects. Union of both retrieval sets fed into the reranker gives the reranker more signal to work with, improving final precision.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-training">Planner Training &rarr;</a>
  </div>
</section>

<!-- ====== S4: TRAINING ====== -->
<section class="section" id="s-training">
  <div class="section-tag" style="color:#7c6af4">Planner Training</div>
  <h2 class="section-title">Two Recipes to Teach the Planner When to Search and When to Stop</h2>
  <p class="section-sub">A better search tool only helps if the planner uses it well. Two training recipes were tested: RL with outcome reward (GRPO) and on-policy distillation from a large teacher model. The best result combines both.</p>

  <canvas id="canvas-training" width="700" height="340" style="margin-bottom:16px;cursor:pointer;"></canvas>
  <div class="btn-row">
    <button class="btn-tab active" id="train-btn-1" onclick="selectRecipe(1)">Recipe 1: GRPO</button>
    <button class="btn-tab" id="train-btn-2" onclick="selectRecipe(2)">Recipe 2: Distillation</button>
    <button class="btn-tab" id="train-btn-both" onclick="selectRecipe(0)">Combined (Best)</button>
  </div>
  <div class="info-panel" id="recipe-detail">
    <strong>Recipe 1 &mdash; GRPO:</strong> The planner generates a full trajectory (search &rarr; read &rarr; answer). A binary reward (+1 correct, 0 wrong) is applied. The model learns search behavior through trial and error. Simple but sparse signal.
  </div>

  <div class="formula">Recipe 1 &mdash; RL with Outcome Reward (GRPO)
  reward : +1 if final answer correct, 0 if wrong
  signal : binary, applied only at completion
  based on: Search-R1 approach

Recipe 2 &mdash; On-policy Distillation
  teacher : Qwen3-235B (large reasoning model)
  student : smaller planner model
  signal  : dense per-token via reverse KL divergence
  result  : 39% KL reduction in 50 steps

Combined (Two-stage, Best Result)
  Stage 1 : 50 steps of distillation (learn search behavior)
  Stage 2 : 30 steps of GRPO + CLP (tune for efficiency)</div>

  <div class="highlight-box violet">
    <strong>Why two stages?</strong> Distillation teaches the planner <em>how</em> to search (what a good search trajectory looks like). GRPO then teaches it <em>when</em> to stop (efficiency). Pure GRPO from random initialization is too slow &mdash; the sparse binary signal struggles to teach nuanced search behavior. Distillation first gives GRPO a strong starting point.
  </div>

  <div class="grid2">
    <div class="card">
      <div class="card-title" style="color:#7c6af4">Recipe 1: GRPO</div>
      <div class="card-body">Grouped Relative Policy Optimization. The model generates multiple trajectory rollouts per query. Correct trajectories are rewarded, incorrect ones are penalized. The policy gradient update favors trajectories that led to correct answers. No teacher model needed &mdash; but signal is sparse.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">Recipe 2: On-policy Distillation</div>
      <div class="card-body">The student model generates its own trajectories (on-policy). The teacher (Qwen3-235B) evaluates each token of the student's trajectory and provides a dense supervision signal via reverse KL divergence. 50 steps cut teacher-student divergence by 39% &mdash; far faster than GRPO alone.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is GRPO? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Grouped Relative Policy Optimization is a reinforcement learning algorithm for LLMs. For each query, the model generates a group of trajectories. Within the group, trajectories that scored better than average receive positive rewards; worse ones receive negative. The policy is updated to increase the probability of better trajectories. It's computationally cheaper than PPO because it doesn't require a separate value model.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Why reverse KL divergence? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Reverse KL (KL[student || teacher]) encourages the student to concentrate probability mass on modes the teacher assigns high probability. This is "mode-seeking" behavior &mdash; the student learns to be confidently correct in regions where the teacher is confident. Forward KL would be "mean-seeking" and spread probability, causing the student to hedge on uncertain regions. For search behavior learning, mode-seeking produces sharper, more decisive search strategies.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Why two stages rather than just one? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Distillation alone teaches good search behavior but doesn't optimize for efficiency (tool call count). GRPO alone has sparse signal &mdash; it takes many steps to learn what a good trajectory looks like from scratch. Two-stage: distillation gives GRPO a warm start with already-reasonable search behavior, then GRPO + CLP penalty fine-tunes for efficiency. Combined, 80 total steps achieves what neither recipe could alone.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-clp">The CLP Formula &rarr;</a>
  </div>
</section>

<!-- ====== S5: CLP ====== -->
<section class="section" id="s-clp">
  <div class="section-tag" style="color:#ff6b6b">Efficiency Reward Shaping</div>
  <h2 class="section-title">The Conditional Log Penalty: Teaching Agents to Stop Searching</h2>
  <p class="section-sub">Training the planner to be accurate is step one. Step two is teaching it to be <em>efficient</em> &mdash; to not make unnecessary search calls. Three penalty formulas were tested. Only one preserves correct incentives while giving headroom for complex queries.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#ff6b6b">3</div><div class="stat-lbl">Formulas tested</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">13.4&times;</div><div class="stat-lbl">CLP headroom vs linear</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">tc=4</div><div class="stat-lbl">Linear hits zero</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">tc=54</div><div class="stat-lbl">CLP stays positive</div></div>
  </div>

  <div class="formula">Three Penalty Formulas for Tool Call Count (tc):

Additive:              R = em + &lambda;&middot;tc         BROKEN: wrong+fast beats correct+slow
Linear Multiplicative: R = em &times; (1 - &alpha;&middot;tc)  NARROW: reward hits 0 at tc=4
CLP (winner):          R = em &times; max(0, 1 - &epsilon;&middot;log(1+tc))

  &epsilon; = 0.15 (optimal)  &rarr;  stays positive until tc &asymp; 54
  em = 1 if answer correct, 0 if wrong

CLP insight: the first search call is expensive (skip it on easy questions),
but additional searches are cheap &mdash; so the penalty should be logarithmic.</div>

  <div class="slider-row" style="margin-top:16px;">
    <span class="slider-lbl">Epsilon (&epsilon;) value:</span>
    <input type="range" id="sl-epsilon" min="5" max="40" value="15" oninput="updatePenaltyChart()">
    <span class="slider-val" id="val-epsilon">0.15</span>
  </div>
  <canvas id="canvas-penalty" width="700" height="300" style="margin-bottom:12px;cursor:crosshair;"></canvas>
  <div class="info-panel" id="penalty-detail">
    Hover the chart to compare reward values at each tool call count.
  </div>

  <div class="highlight-box red" style="margin-top:16px;">
    <strong>Why additive fails:</strong> R = em + &lambda;&middot;tc means a wrong answer with many tool calls still gets a positive reward (&lambda;&middot;tc). It breaks "separation" &mdash; the guarantee that a correct answer always beats a wrong one. The agent can be rewarded for being wrong as long as it tries hard.
  </div>

  <div class="grid2" style="margin-top:16px;">
    <div class="card">
      <div class="card-title" style="color:#ff6b6b">Why Linear Fails</div>
      <div class="card-body">Linear multiplicative R = em &times; (1 - &alpha;&middot;tc) hits zero at tc=4 (with standard &alpha;). Complex multi-hop queries legitimately need 5&ndash;10 searches. Any penalty that zeroes out the reward at tc=4 punishes the agent for doing thorough research on hard questions &mdash; the exact behavior you want on BrowseComp.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">Why Log Scale Works</div>
      <div class="card-body">Logarithm grows slowly &mdash; doubling tool calls adds a fixed increment of penalty, not a proportional one. Early calls are penalized steeply (skip easy searches), later calls are penalized gently (allow deep research). This asymmetry matches the real cost structure: the first search is almost always worth doing, the 10th rarely is.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What does "breaks separation" mean for additive? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Separation is the requirement that R(correct answer) &gt; R(wrong answer) always. With additive reward R = em + &lambda;&middot;tc, if a wrong answer uses tc=10 tool calls and &lambda;=0.2, it gets reward 0 + 2.0 = 2.0. A correct answer with tc=0 gets 1.0 + 0 = 1.0. The wrong, inefficient answer wins. This trains the planner to make many calls even when it knows it's wrong &mdash; a pathological failure mode.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How was &epsilon; = 0.15 chosen? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">It was swept empirically. At &epsilon; = 0.15, CLP stays positive (reward &gt; 0) until tc &asymp; 54 tool calls &mdash; well beyond any realistic query complexity. Lower &epsilon; values (&lt; 0.05) are too permissive and don't meaningfully penalize redundant searches. Higher values (&gt; 0.30) start to discourage legitimate multi-hop research. 0.15 was the sweet spot on the development set.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-results">Compound Gains &rarr;</a>
  </div>
</section>

<!-- ====== S6: RESULTS ====== -->
<section class="section" id="s-results">
  <div class="section-tag" style="color:#f7b731">Results</div>
  <h2 class="section-title">Compound Gains: Tool + Planner Together</h2>
  <p class="section-sub">Tool optimization and planner training compound &mdash; combining both beats either alone. The headline result: a trained planner on the fastest (cheapest) tool matches an untrained planner on the strongest (most expensive) tool, at half the latency.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#51cf66">50.1%</div><div class="stat-lbl">Trained Fast acc.</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">50.0%</div><div class="stat-lbl">Untrained Strong acc.</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">60.7%</div><div class="stat-lbl">Trained Max acc.</div></div>
    <div class="stat"><div class="stat-val" style="color:#7c6af4">~3</div><div class="stat-lbl">Tool calls (all trained)</div></div>
  </div>

  <canvas id="canvas-scatter" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="scatter-detail">
    <strong>Hover a data point</strong> to see its configuration, accuracy, and latency.
  </div>

  <div class="highlight-box green" style="margin-top:16px;">
    <strong>The key insight:</strong> "A trained planner on the fastest tool gathers evidence more efficiently than an untrained planner with the strongest tool." This means you don't need to pay for the Max config &mdash; train the planner on Fast and get Strong-quality results at Fast speed.
  </div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#51cf66">Out-of-Distribution Generalization</div>
      <div class="card-body">Training happened on NQ + HotpotQA (1&ndash;2 hop questions). Evaluation was on harder out-of-distribution benchmarks: MuSiQue, Bamboogle, 2WikiMultihop, TriviaQA, PopQA, and BrowseComp-Plus. Consistent improvements across all &mdash; the planner learns generalizable search strategy, not dataset-specific patterns.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">Why Tool Calls Converge to ~3</div>
      <div class="card-body">With CLP shaping, the trained planner learns to use exactly as many searches as needed &mdash; regardless of which retrieval stack it's on. Fast config with low-quality retrieval: ~3 calls. Max config with high-quality retrieval: also ~3 calls. The planner adapts its confidence threshold to the tool's capability.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">Production Implication</div>
      <div class="card-body">Deploy the Fast tool config (cheaper embedding, smaller reranker) and invest in planner training. You get Strong-config quality at Fast-config cost. For most production RAG systems, this is the optimal operating point: minimize infrastructure cost, train the planner to compensate.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Which benchmarks were used? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Six evaluation benchmarks: <strong>NQ</strong> (Natural Questions &mdash; single-hop), <strong>HotpotQA</strong> (two-hop), <strong>MuSiQue</strong> (multi-hop, compositional), <strong>Bamboogle</strong> (adversarial, hard), <strong>2WikiMultihop</strong> (multi-hop across Wikipedia), <strong>TriviaQA</strong> (trivia), <strong>PopQA</strong> (popularity-stratified), and <strong>BrowseComp-Plus</strong> (hardest: requires web-scale search across many documents).</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Why does training on easy questions help with hard ones? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The training tasks (NQ, HotpotQA) teach the planner general search strategy: query formulation, evidence synthesis, when a document is relevant, when to refine the search. These are transferable skills. Hard multi-hop queries on BrowseComp-Plus require the same underlying behaviors, just chained more times. The CLP penalty generalizes too &mdash; the planner learns to be parsimonious with searches across all complexity levels.</div>
  </div>

</section>

</div><!-- /main -->
<script>
var PG_PASSWORD='visual2025';
var PG_KEY='pg_unlocked_21';
function pgCheck(){
  var v=document.getElementById('pg-input').value.trim();
  if(v===PG_PASSWORD){localStorage.setItem(PG_KEY,'1');document.getElementById('pg-gate').style.display='none';}
  else{document.getElementById('pg-err').textContent='Incorrect password. Try again.';}
}
document.getElementById('pg-input').addEventListener('keydown',function(e){if(e.key==='Enter')pgCheck();});
if(localStorage.getItem(PG_KEY)==='1'){document.getElementById('pg-gate').style.display='none';}

var sectionIds=['s-overview','s-metric','s-tool','s-training','s-clp','s-results'];
function setActive(el,id){
  document.querySelectorAll('.nav-link').forEach(function(n){n.classList.remove('active');});
  el.classList.add('active');
  var sec=document.getElementById(id);
  if(sec)sec.scrollIntoView({behavior:'smooth'});
}
function updateNavOnScroll(){
  var main=document.getElementById('main-scroll');
  if(!main)return;
  main.addEventListener('scroll',function(){
    var sp=document.getElementById('scroll-progress');
    if(sp){var pct=(main.scrollTop/(main.scrollHeight-main.clientHeight))*100;sp.style.width=pct+'%';}
    var best=null,bestDist=999999;
    sectionIds.forEach(function(id){
      var el=document.getElementById(id);
      if(!el)return;
      var d=Math.abs(el.getBoundingClientRect().top);
      if(d<bestDist){bestDist=d;best=id;}
    });
    if(best){
      document.querySelectorAll('.nav-link').forEach(function(n){
        n.classList.toggle('active',n.dataset.sec===best);
      });
    }
  });
}
function toggleAcc(header){
  var body=header.nextElementSibling;
  var chev=header.querySelector('.accordion-chevron');
  var open=body.style.display==='block';
  body.style.display=open?'none':'block';
  if(chev)chev.style.transform=open?'':'rotate(180deg)';
}

// Config data
var CONFIGS={
  fast:{label:'Fast',color:'#74b9ff',dim:512,reranker:'2B',hybrid:true,topK:50,recall:0.71,ndcg:0.172,latency:13,trained_acc:50.1,untrained_acc:35.2},
  strong:{label:'Strong',color:'#51cf66',dim:512,reranker:'6B',hybrid:true,topK:50,recall:0.79,ndcg:0.203,latency:26,trained_acc:57.2,untrained_acc:50.0},
  max:{label:'Max',color:'#a29bfe',dim:4096,reranker:'6B',hybrid:true,topK:200,recall:0.84,ndcg:0.221,latency:52,trained_acc:60.7,untrained_acc:54.3}
};
var selectedConfig='fast';
function selectConfig(name){
  selectedConfig=name;
  ['fast','strong','max'].forEach(function(n){
    var b=document.getElementById('cfg-btn-'+n);
    if(b)b.classList.toggle('active',n===name);
  });
  var c=CONFIGS[name];
  var det=document.getElementById('config-detail');
  if(det){det.innerHTML='<strong>'+c.label+' config:</strong> '+c.dim+'-dim embeddings, '+c.reranker+' reranker, '+(c.hybrid?'hybrid':'ANN-only')+' retrieval, top-'+c.topK+'. Retrieval latency: '+c.latency+'s. nDCG@5: '+c.ndcg.toFixed(3)+'. Recall: '+(c.recall*100).toFixed(0)+'%.';}
  if(typeof drawComponentChart==='function')drawComponentChart();
}

// CER-C line toggle
var cerLines={fast:true,strong:true,max:true,trained:true};
function toggleCERLine(name){
  cerLines[name]=!cerLines[name];
  var b=document.getElementById('cer-btn-'+name);
  if(b)b.classList.toggle('active',cerLines[name]);
  if(typeof drawCERC==='function')drawCERC();
}

// Recipe selection
var selectedRecipe=1;
function selectRecipe(n){
  selectedRecipe=n;
  [1,2,0].forEach(function(r){
    var id=r===0?'train-btn-both':'train-btn-'+r;
    var b=document.getElementById(id);
    if(b)b.classList.toggle('active',r===n);
  });
  var det=document.getElementById('recipe-detail');
  if(!det)return;
  if(n===1)det.innerHTML='<strong>Recipe 1 &mdash; GRPO:</strong> Binary reward (+1 correct, 0 wrong). The planner learns search behavior through trial and error. Simple but sparse signal &mdash; many training steps required to learn nuanced behavior.';
  else if(n===2)det.innerHTML='<strong>Recipe 2 &mdash; On-policy Distillation:</strong> Teacher model (Qwen3-235B) provides dense per-token supervision via reverse KL divergence. 50 steps cut teacher-student divergence by 39%. Faster learning but no explicit efficiency incentive.';
  else det.innerHTML='<strong>Combined (Two-stage, Best):</strong> Stage 1: 50 steps distillation to learn search behavior. Stage 2: 30 steps GRPO + CLP to optimize efficiency. Result: all trained planners converge to ~3 tool calls while accuracy rises across all configs.';
  if(typeof drawTrainingFlow==='function')drawTrainingFlow();
}

// Penalty chart update
function updatePenaltyChart(){
  var v=parseFloat(document.getElementById('sl-epsilon').value)/100;
  document.getElementById('val-epsilon').textContent=v.toFixed(2);
  if(typeof drawPenaltyChart==='function')drawPenaltyChart(v);
}
</script>
<script>
/* CANVAS CODE INJECTED HERE */
</script>
</body>
</html>`;

fs.writeFileSync('index.html',html,'utf8');
console.log('build1 done:',html.length,'bytes',html.split('\n').length,'lines');
