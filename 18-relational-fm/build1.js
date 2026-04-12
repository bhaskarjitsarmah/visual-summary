const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Relational Foundation Models &#8212; AI That Speaks SQL</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#c9d1d9;--muted:#8b949e;
  --accent:#0ea5e9;--accent2:#38bdf8;--accent3:#e0f2fe;
  --rfm:#0ea5e9;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.6;display:flex;}
a{text-decoration:none;color:inherit;}
.sidebar{width:240px;min-width:240px;height:100vh;position:sticky;top:0;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;padding:0 0 40px;flex-shrink:0;}
.sidebar-logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);}
.sidebar-logo-title{font-size:13px;font-weight:700;color:var(--accent2);}
.sidebar-logo-sub{font-size:10px;color:var(--muted);margin-top:2px;}
.nav-group-title{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;padding:10px 16px 4px;}
.nav-link{display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;color:var(--muted);cursor:pointer;transition:all .15s;}
.nav-link:hover,.nav-link.active{color:var(--text);background:rgba(14,165,233,.08);}
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
canvas{display:block;border-radius:10px;background:var(--surface);border:1px solid var(--border);}
.btn{background:var(--accent);color:#fff;border:none;border-radius:8px;padding:9px 18px;font-size:12px;font-weight:600;cursor:pointer;transition:opacity .15s;}
.btn:hover{opacity:.85;}
.btn-tab{background:var(--surface);color:var(--muted);border:1px solid var(--border);border-radius:6px;padding:6px 14px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;}
.btn-tab.active,.btn.active{background:var(--accent);color:#fff;border-color:var(--accent);}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
.formula{background:#0d1117;border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;color:#38bdf8;line-height:1.8;margin-bottom:16px;white-space:pre;}
.stats-row{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px;}
.stat{text-align:center;}
.stat-val{font-size:28px;font-weight:800;color:var(--accent2);}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;}
.section-bridge{margin-top:48px;padding-top:28px;border-top:1px solid var(--border);text-align:right;}
.section-bridge-link{font-size:12px;color:var(--accent2);font-weight:600;border:1px solid var(--accent2);border-radius:6px;padding:6px 14px;transition:all .15s;}
.section-bridge-link:hover{background:rgba(14,165,233,.1);}
.accordion-item{border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden;}
.accordion-header{padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;background:var(--surface);}
.accordion-header:hover{background:#1c2128;}
.accordion-chevron{transition:transform .2s;font-size:10px;color:var(--muted);}
.accordion-body{padding:14px 16px;font-size:12px;color:var(--muted);display:none;border-top:1px solid var(--border);}
#pg-gate{position:fixed;inset:0;background:#0d1117;z-index:9999;display:flex;align-items:center;justify-content:center;}
.pg-box{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px 48px;max-width:420px;width:100%;text-align:center;}
.pg-icon{font-size:2.5rem;margin-bottom:16px;}
.pg-title{font-size:1.3rem;font-weight:800;color:#c9d1d9;margin-bottom:6px;}
.pg-sub{font-size:12px;color:#8b949e;margin-bottom:24px;}
.pg-input{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px 14px;color:#c9d1d9;font-size:14px;outline:none;text-align:center;}
.pg-input:focus{border-color:#0ea5e9;}
.pg-btn{margin-top:12px;width:100%;background:#0ea5e9;color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600;cursor:pointer;}
.pg-err{color:#ff6b6b;font-size:11px;margin-top:8px;min-height:16px;}
.code-block{background:#0d1117;border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:11px;color:#e2e8f0;line-height:1.7;margin-bottom:16px;overflow-x:auto;}
.code-block .kw{color:#0ea5e9;}.code-block .str{color:#51cf66;}.code-block .cm{color:#64748b;}.code-block .fn{color:#38bdf8;}.code-block .cls{color:#e0f2fe;}
.highlight-box{border-left:3px solid var(--accent);padding:12px 16px;background:rgba(14,165,233,.06);border-radius:0 8px 8px 0;margin-bottom:16px;font-size:13px;color:var(--muted);}
.highlight-box.green{border-color:#51cf66;background:rgba(81,207,102,.06);}
.highlight-box.red{border-color:#ff6b6b;background:rgba(255,107,107,.06);}
.highlight-box.amber{border-color:#f59e0b;background:rgba(245,158,11,.06);}
.highlight-box.violet{border-color:#7c3aed;background:rgba(124,58,237,.06);}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;background:var(--border);border-radius:4px;outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;}
.slider-row{display:flex;gap:12px;align-items:center;margin-bottom:16px;}
.slider-lbl{font-size:11px;color:var(--muted);min-width:120px;}
.slider-val{font-size:12px;font-weight:700;color:var(--accent2);min-width:40px;}
.info-panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-top:12px;font-size:13px;color:var(--muted);min-height:80px;}
.info-panel strong{color:var(--text);}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-right:4px;}
.badge-sky{background:rgba(14,165,233,.2);color:#38bdf8;}
.badge-violet{background:rgba(124,58,237,.2);color:#a78bfa;}
.badge-mint{background:rgba(81,207,102,.2);color:#51cf66;}
.badge-amber{background:rgba(245,158,11,.2);color:#f59e0b;}
.badge-coral{background:rgba(255,107,107,.2);color:#ff6b6b;}
#scroll-progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9998;transition:width .1s;}
.table-wrap{overflow-x:auto;margin-bottom:16px;}
table{width:100%;border-collapse:collapse;font-size:12px;}
th{background:var(--surface);border:1px solid var(--border);padding:8px 12px;text-align:left;font-weight:700;color:var(--accent2);font-size:10px;text-transform:uppercase;letter-spacing:.8px;}
td{border:1px solid var(--border);padding:8px 12px;color:var(--muted);}
tr:hover td{background:rgba(14,165,233,.04);}
td.highlight{color:var(--text);font-weight:600;}
.pql-select{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:8px 10px;color:var(--text);font-size:12px;outline:none;font-family:'JetBrains Mono','Courier New',monospace;}
.pql-select:focus{border-color:var(--accent);}
.matrix-grid{display:grid;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:10px;overflow:hidden;}
.matrix-cell{padding:8px 10px;font-size:11px;cursor:pointer;transition:background .15s;background:var(--surface);}
.matrix-cell:hover{background:#1c2128;}
.matrix-cell.header{background:#0d1117;font-weight:700;font-size:10px;text-transform:uppercase;letter-spacing:.8px;cursor:default;}
.matrix-cell.header:hover{background:#0d1117;}
</style>
</head>
<body>

<div id="pg-gate">
  <div class="pg-box">
    <div class="pg-icon">&#128200;</div>
    <div class="pg-title">Relational Foundation Models</div>
    <div class="pg-sub">AI that learns directly from databases &#8212; KumoRFM, RDB-PFN, RelBench</div>
    <input class="pg-input" id="pg-input" type="password" placeholder="Enter password" autocomplete="off">
    <button class="pg-btn" onclick="pgCheck()">Unlock</button>
    <div class="pg-err" id="pg-err"></div>
  </div>
</div>

<div id="scroll-progress"></div>

<!-- SIDEBAR -->
<nav class="sidebar">
  <div class="sidebar-logo">
    <div class="sidebar-logo-title">Visual AI Papers</div>
    <div class="sidebar-logo-sub">Post 18 &middot; Relational Foundation Models</div>
  </div>

  <div class="nav-group-title">The Problem</div>
  <div class="nav-link" data-sec="s-problem" onclick="setActive(this,'s-problem')">
    <span class="dot" style="background:#f59e0b"></span>Feature Engineering Wall
  </div>

  <div class="nav-group-title">The Foundation</div>
  <div class="nav-link" data-sec="s-graph" onclick="setActive(this,'s-graph')">
    <span class="dot" style="background:#0ea5e9"></span>Databases as Graphs
  </div>
  <div class="nav-link" data-sec="s-incontext" onclick="setActive(this,'s-incontext')">
    <span class="dot" style="background:#10b981"></span>In-Context Learning
  </div>

  <div class="nav-group-title">How It Works</div>
  <div class="nav-link" data-sec="s-architecture" onclick="setActive(this,'s-architecture')">
    <span class="dot" style="background:#7c3aed"></span>KumoRFM Architecture
  </div>
  <div class="nav-link" data-sec="s-synthetic" onclick="setActive(this,'s-synthetic')">
    <span class="dot" style="background:#f59e0b"></span>Synthetic Pre-training
  </div>

  <div class="nav-group-title">Evaluation</div>
  <div class="nav-link" data-sec="s-relbench" onclick="setActive(this,'s-relbench')">
    <span class="dot" style="background:#0ea5e9"></span>RelBench Benchmark
  </div>
  <div class="nav-link" data-sec="s-results" onclick="setActive(this,'s-results')">
    <span class="dot" style="background:#f87171"></span>Results &amp; Impact
  </div>
</nav>

<!-- MAIN -->
<div class="main" id="main-scroll">
  <!-- Pipeline Map -->
  <div class="pipeline-map">
    <a class="pipe-step" href="#s-problem"><span class="pipe-dot" style="background:#f59e0b"></span>Problem</a>
    <span class="pipe-arrow">&#8250;</span>
    <a class="pipe-step" href="#s-graph"><span class="pipe-dot" style="background:#0ea5e9"></span>Graphs</a>
    <span class="pipe-arrow">&#8250;</span>
    <a class="pipe-step" href="#s-incontext"><span class="pipe-dot" style="background:#10b981"></span>In-Context</a>
    <span class="pipe-arrow">&#8250;</span>
    <a class="pipe-step" href="#s-architecture"><span class="pipe-dot" style="background:#7c3aed"></span>KumoRFM</a>
    <span class="pipe-arrow">&#8250;</span>
    <a class="pipe-step" href="#s-synthetic"><span class="pipe-dot" style="background:#f59e0b"></span>Synthetic</a>
    <span class="pipe-arrow">&#8250;</span>
    <a class="pipe-step" href="#s-relbench"><span class="pipe-dot" style="background:#0ea5e9"></span>RelBench</a>
    <span class="pipe-arrow">&#8250;</span>
    <a class="pipe-step" href="#s-results"><span class="pipe-dot" style="background:#f87171"></span>Results</a>
  </div>

  <!-- ─── SECTION 1: PROBLEM ─── -->
  <section class="section" id="s-problem">
    <div class="section-tag" style="color:#f59e0b">&#9632; The Problem &middot; ~12 min read</div>
    <h1 class="section-title">The Feature Engineering Wall</h1>
    <p class="section-sub">Most of the world's data lives in relational databases &#8212; spread across dozens of interconnected tables. Teaching a machine learning model to use all of it requires months of manual work that hasn't changed in decades.</p>

    <div class="stats-row">
      <div class="stat"><div class="stat-val" style="color:#f59e0b">60&#8211;80%</div><div class="stat-lbl">ML time on feature engineering</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">878</div><div class="stat-lbl">lines of code to do it manually</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">12.3h</div><div class="stat-lbl">expert time per new task</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">1</div><div class="stat-lbl">model per task (no transfer)</div></div>
    </div>

    <canvas id="canvas-problem" width="700" height="340" style="margin-bottom:20px;cursor:pointer"></canvas>
    <p style="font-size:11px;color:var(--muted);margin-bottom:20px;">Click a table to see what joins are needed to make a single prediction.</p>

    <div style="margin-bottom:28px">
      <div class="section-tag" style="margin-bottom:12px;color:#f59e0b">Join Complexity Scaler</div>
      <div class="slider-row">
        <span class="slider-lbl">Number of tables</span>
        <input type="range" id="fe-table-slider" min="1" max="10" value="3" oninput="updateFEScale(this.value)">
        <span class="slider-val" id="fe-table-val">3</span>
      </div>
      <canvas id="canvas-fe-scale" width="700" height="200" style="margin-bottom:8px"></canvas>
      <p style="font-size:11px;color:var(--muted)">Manual join complexity grows O(n&sup2;). Graph approach stays flat O(n).</p>
    </div>

    <div style="margin-bottom:28px">
      <div class="section-tag" style="margin-bottom:8px;color:#f87171">Temporal Leakage Visualizer</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Drag the red cutoff line left or right to control the train/test split. Watch what happens to accuracy when future data leaks into training features.</p>
      <canvas id="canvas-leakage" width="700" height="220" style="margin-bottom:8px;cursor:ew-resize"></canvas>
      <div class="info-panel" id="leakage-info"><strong>Drag the cutoff line</strong> to control when training stops. Future events leaking in = silent accuracy collapse in production.</div>
    </div>

    <div class="highlight-box amber">
      <strong>The core problem:</strong> No ML method can learn directly from multiple interconnected tables. Data must be manually joined and aggregated into a single flat training table &#8212; a process called feature engineering. It is slow, error-prone, and produces suboptimal models.
    </div>

    <div class="grid3">
      <div class="card">
        <div class="card-title" style="color:#f59e0b">Manual Joins</div>
        <div class="card-body">To predict customer churn, a data scientist must join users, orders, products, events, and support tickets &#8212; writing hundreds of lines of SQL before any ML begins.</div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#f59e0b">Temporal Leakage</div>
        <div class="card-body">Aggregating future data into past features is a silent killer. One wrong timestamp in a join corrupts the entire dataset, and the model learns from the future.</div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#f59e0b">No Transfer</div>
        <div class="card-body">Every new prediction task &#8212; churn, fraud, LTV &#8212; requires a fresh round of feature engineering from scratch. Nothing learned from one task transfers to another.</div>
      </div>
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">Why can&#8217;t we just use SQL joins? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">SQL joins create a flat table where many rows from child tables become duplicated columns in the parent. This causes data leakage (future events folded into past features), representation loss (only simple aggregates like COUNT, SUM survive), and combinatorial explosion as table count grows.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">Why not just use an LLM on the raw data? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">LLMs are trained on text, not structured relational data. Feeding raw tables as text loses the relational structure entirely. A 50M-row database can&#8217;t fit in any context window, and LLMs can&#8217;t compute statistics or reason about temporal ordering of events.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What does &#8220;temporal&#8221; mean in this context? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">Every row in a relational database has a timestamp (created_at, updated_at, event_time). When building features for a prediction at time T, you must only use data from before T. Violating this &#8212; even by including data from T+1 &#8212; means you&#8217;re predicting the past from the future, causing artificially high accuracy that collapses in production.</div>
    </div>

    <div class="section-bridge">
      <a class="section-bridge-link" href="#s-graph">Databases as Graphs &#8250;</a>
    </div>
  </section>

  <!-- ─── SECTION 2: GRAPH ─── -->
  <section class="section" id="s-graph">
    <div class="section-tag" style="color:#0ea5e9">&#9632; Relational Deep Learning</div>
    <h1 class="section-title">Databases as Temporal Graphs</h1>
    <p class="section-sub">The key insight from the Relational Deep Learning paper (arXiv:2312.04615, Fey &amp; Leskovec): every relational database is already a graph &#8212; we just haven&#8217;t been treating it as one.</p>

    <div class="highlight-box">
      <strong>The transformation:</strong> Each <em>row</em> becomes a <em>node</em>. Each <em>primary&#8211;foreign key relationship</em> becomes an <em>edge</em>. Timestamps on rows make the graph temporal. Different table types make it heterogeneous.
    </div>

    <canvas id="canvas-db-graph" width="700" height="380" style="margin-bottom:20px;cursor:pointer"></canvas>
    <div class="btn-row">
      <button class="btn-tab active" id="tab-db" onclick="setDbGraphTab('db')">Raw Database</button>
      <button class="btn-tab" id="tab-graph" onclick="setDbGraphTab('graph')">As a Graph</button>
      <button class="btn-tab" id="tab-gnn" onclick="setDbGraphTab('gnn')">GNN Message Passing</button>
    </div>

    <div class="grid3">
      <div class="card">
        <div class="card-title" style="color:#0ea5e9">Nodes = Table Rows</div>
        <div class="card-body">Every row in every table becomes a node. A users table with 1M rows creates 1M nodes. Products, orders, events &#8212; each table type gets a different node type in the heterogeneous graph.</div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#0ea5e9">Edges = Foreign Keys</div>
        <div class="card-body">A foreign key relationship (orders.user_id &#8594; users.id) becomes a directed edge from each order node to its user node. These edges carry the relational structure that SQL flattening destroys.</div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#0ea5e9">Temporal = Safe</div>
        <div class="card-body">Because every node carries its timestamp, GNNs can be constrained to only aggregate along temporally valid edges &#8212; automatically preventing data leakage without manual date filters.</div>
      </div>
    </div>

    <div style="margin-bottom:28px">
      <div class="section-tag" style="margin-bottom:12px;color:#0ea5e9">GNN Hop Depth Explorer</div>
      <div class="slider-row">
        <span class="slider-lbl">Message passing depth</span>
        <input type="range" id="hop-slider" min="1" max="3" value="1" oninput="updateHopDepth(this.value)">
        <span class="slider-val" id="hop-val">1 hop</span>
      </div>
      <canvas id="canvas-hop" width="700" height="300" style="margin-bottom:8px"></canvas>
      <div class="info-panel" id="hop-info"><strong>1 hop:</strong> Direct neighbors only &#8212; equivalent to a single SQL JOIN. Gets orders, events, and support tickets directly connected to the user.</div>
    </div>

    <div class="formula">// Relational Database &#8594; Temporal Heterogeneous Graph
G = (V, E, T_v, T_e, &#981;_v, &#981;_e)

V = &#8899; rows(table_i)            // nodes = all rows across all tables
E &#8712; V &#215; V via FK links        // edges = primary-foreign key relationships
&#981;_v: V &#8594; node_type            // node type = which table it came from
&#981;_e: E &#8594; edge_type            // edge type = which FK relationship
T_v: V &#8594; timestamp             // temporal ordering for leak prevention</div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What is a heterogeneous graph? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">A heterogeneous graph has multiple types of nodes and edges. Unlike a social network where every node is a "person," a relational graph has user nodes, product nodes, order nodes, event nodes &#8212; each with different features and different roles. GNNs must handle this by having separate learnable weights for each node and edge type.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">How does message passing work on a relational graph? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">Each node aggregates feature vectors from its neighbors, weighted by edge type. A user node might aggregate from all their orders, events, and support tickets simultaneously. After multiple rounds of message passing, each node&#8217;s embedding captures information from its multi-hop neighborhood &#8212; the equivalent of a complex SQL join, but learned automatically.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">Which paper introduced Relational Deep Learning? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">arXiv:2312.04615, &#8220;Relational Deep Learning: Graph Representation Learning on Relational Databases&#8221; by Matthias Fey and Jure Leskovec (December 2023). Fey is the creator of PyTorch Geometric (PyG). The paper also introduced the RelBench benchmark suite and is the foundation on which KumoRFM is built.</div>
    </div>

    <div class="section-bridge">
      <a class="section-bridge-link" href="#s-incontext">In-Context Learning &#8250;</a>
    </div>
  </section>

  <!-- ─── SECTION 3: IN-CONTEXT ─── -->
  <section class="section" id="s-incontext">
    <div class="section-tag" style="color:#10b981">&#9632; How It Works</div>
    <h1 class="section-title">In-Context Learning at Inference Time</h1>
    <p class="section-sub">Like GPT-4 using few-shot examples, KumoRFM samples historical labeled subgraphs from the database and uses them as context &#8212; making predictions without any gradient updates or task-specific training.</p>

    <canvas id="canvas-incontext" width="700" height="340" style="margin-bottom:16px"></canvas>
    <div class="btn-row" style="justify-content:center">
      <button class="btn" onclick="icStep()">Step Through &#8250;</button>
      <button class="btn-tab" onclick="icReset()">Reset</button>
    </div>
    <div class="info-panel" id="ic-info">
      <strong>Press Step</strong> to walk through how KumoRFM makes a prediction using in-context learning.
    </div>

    <div class="highlight-box green">
      <strong>The key insight:</strong> Historical data in a database IS the in-context examples. KumoRFM treats past user behavior as few-shot demonstrations and uses them to predict future behavior &#8212; without retraining.
    </div>

    <div style="margin-bottom:28px">
      <div class="section-tag" style="margin-bottom:12px;color:#10b981">Interactive PQL Builder</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:14px">Build a real PQL query by selecting the prediction target, time window, and aggregations. See the assembled query and mock output update live.</p>
      <div class="grid2" style="margin-bottom:12px">
        <div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:6px">Target Variable</div>
          <select id="pql-target" class="pql-select" onchange="updatePQL()">
            <option value="churn">user.will_churn_30d</option>
            <option value="fraud">transaction.fraud_score</option>
            <option value="ltv">user.ltv_90d</option>
            <option value="recommend">user.next_purchase_item</option>
          </select>
        </div>
        <div>
          <div style="font-size:11px;color:var(--muted);margin-bottom:6px">History Window</div>
          <select id="pql-window" class="pql-select" onchange="updatePQL()">
            <option value="30">30 days</option>
            <option value="90" selected>90 days</option>
            <option value="180">180 days</option>
            <option value="365">1 year</option>
          </select>
        </div>
      </div>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">Aggregations to include</div>
      <div class="btn-row" style="margin-bottom:14px">
        <button class="btn-tab active" id="agg-count" onclick="toggleAgg('count')">COUNT(*)</button>
        <button class="btn-tab active" id="agg-sum" onclick="toggleAgg('sum')">SUM(amount)</button>
        <button class="btn-tab" id="agg-first" onclick="toggleAgg('first')">FIRST(event_type)</button>
        <button class="btn-tab" id="agg-list" onclick="toggleAgg('list')">LIST_DISTINCT(category)</button>
      </div>
      <div class="formula" id="pql-output" style="min-height:90px;white-space:pre-wrap"></div>
      <div class="info-panel" id="pql-result" style="margin-top:0"></div>
    </div>

    <div style="margin-bottom:28px">
      <div class="section-tag" style="margin-bottom:12px;color:#10b981">In-Context Examples vs Accuracy</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">Drag to add more in-context examples. Watch accuracy rise then plateau &#8212; the same scaling shape as LLM few-shot learning.</p>
      <div class="slider-row">
        <span class="slider-lbl">Context examples</span>
        <input type="range" id="ic-examples-slider" min="0" max="16" value="4" oninput="updateICExamples(this.value)">
        <span class="slider-val" id="ic-examples-val">4</span>
      </div>
      <canvas id="canvas-ic-acc" width="700" height="220" style="margin-bottom:8px"></canvas>
      <div class="info-panel" id="ic-acc-info"></div>
    </div>

    <div style="margin-bottom:20px">
      <div class="section-tag" style="margin-bottom:12px">PQL Reference</div>
      <div class="formula">PREDICT user.will_churn_30d
FOR users WHERE subscription_tier = 'pro'
USING HISTORY 90 DAYS
AGGREGATE orders: COUNT(*), SUM(amount)
          events: LIST_DISTINCT(event_type)
          support_tickets: COUNT(*), FIRST(priority)</div>
    </div>

    <div class="grid2">
      <div class="card">
        <div class="card-title" style="color:#10b981">Traditional Approach</div>
        <div class="card-body">Write SQL to join 5 tables &#8212; 200 lines. Compute feature aggregations manually. Split into train/test. Train a gradient boosted tree. Tune hyperparameters. Deploy. <strong>Time: hours to days.</strong></div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#10b981">KumoRFM Approach</div>
        <div class="card-body">Write one PQL query. KumoRFM samples in-context examples, runs the graph transformer, returns predictions. Zero training code. <strong>Time: ~1 second.</strong></div>
      </div>
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">How are in-context examples selected? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">The In-Context Label Generator samples historical entities that are structurally similar to the query entity (same table, similar subgraph topology) and temporally valid (their labels were observed before the query time). The sampling strategy balances class distribution to avoid showing only majority-class examples.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What task types does PQL support? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">PQL supports four task types: (1) <strong>Binary classification</strong> &#8212; will event X happen? (2) <strong>Multi-class classification</strong> &#8212; which category? (3) <strong>Regression</strong> &#8212; how much? (4) <strong>Link prediction</strong> &#8212; which items will user X interact with? (recommendation systems). All four use the same in-context learning mechanism.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">How does this differ from in-context learning in LLMs? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">LLM in-context learning uses text examples in the prompt. KumoRFM&#8217;s in-context learning uses graph-structured examples &#8212; labeled subgraphs extracted from the database. The model attends to these examples using the same Graph Transformer that processes the query entity, so it can reason about structural similarity rather than just surface-level text similarity.</div>
    </div>

    <div class="section-bridge">
      <a class="section-bridge-link" href="#s-architecture">KumoRFM Architecture &#8250;</a>
    </div>
  </section>

  <!-- ─── SECTION 4: ARCHITECTURE ─── -->
  <section class="section" id="s-architecture">
    <div class="section-tag" style="color:#7c3aed">&#9632; KumoRFM &middot; May 2025</div>
    <h1 class="section-title">KumoRFM: The 5-Module Architecture</h1>
    <p class="section-sub">Now that you understand in-context learning, every module clicks. KumoRFM (Fey, Kocijan, Lopez, Leskovec) is the first foundation model for relational databases &#8212; each of its 5 modules serves the in-context learning pipeline.</p>

    <canvas id="canvas-arch" width="700" height="420" style="margin-bottom:16px;cursor:pointer"></canvas>
    <div class="info-panel" id="arch-info">
      <strong>Hover a module</strong> to see what it does in the pipeline.
    </div>

    <div style="margin-top:20px">
      <div class="grid2">
        <div class="card">
          <div class="card-title" style="color:#7c3aed">&#10102; In-Context Label Generator</div>
          <div class="card-body">Dynamically samples historical labeled subgraphs from the database at inference time. These examples &#8212; like few-shot examples for LLMs &#8212; condition the model&#8217;s predictions without any gradient updates.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color:#7c3aed">&#10103; Table-Width Invariant Encoder</div>
          <div class="card-body">Encodes each cell (numerical, categorical, timestamp, text) into a dense vector independently of the total number of columns. This allows the model to handle any database schema without architectural changes.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color:#7c3aed">&#10104; Relational Graph Transformer</div>
          <div class="card-body">A Graph Transformer that performs attention across the temporal heterogeneous graph. Uses positional encodings for node type, time delta, structural proximity, and local subgraph patterns to capture relational context.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color:#7c3aed">&#10105; Explainability Module</div>
          <div class="card-body">Provides gradient-based and analytical explanations at both global (which features matter most?) and individual prediction levels (why was this user flagged?). Critical for production deployments in regulated industries.</div>
        </div>
      </div>
      <div class="card" style="border-color:#7c3aed44">
        <div class="card-title" style="color:#7c3aed">&#10106; Fine-tuning Pipeline</div>
        <div class="card-body">While KumoRFM works zero-shot via in-context learning, it can be fine-tuned on specific databases or query types for production deployments &#8212; similar to fine-tuning an LLM on domain-specific text. Fine-tuning adds 10&#8211;30% accuracy improvement over the already-competitive zero-shot baseline.</div>
      </div>
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What is Predictive Query Language (PQL)? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">PQL is a SQL-like syntax designed for prediction tasks rather than data retrieval. A PQL query specifies: (1) the target variable to predict, (2) which entities to make predictions for, (3) optional filters and aggregation functions (FIRST, COUNT, SUM, LIST_DISTINCT). KumoRFM accepts a PQL query and a database connection, and returns predictions &#8212; no training code needed.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">How does KumoRFM handle different column types? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">The Table-Width Invariant Column Encoder handles: numerical values (standardized, then embedded), categorical values (tokenized, then embedded), timestamps (decomposed into cyclical features + time-delta encodings), and text (encoded via a small language model). Each column&#8217;s embedding is processed independently, so the total number of columns doesn&#8217;t affect the architecture.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What makes the Graph Transformer &#8220;relational&#8221;? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">Standard Graph Transformers use global attention (every node attends to every other node). The Relational Graph Transformer restricts attention to the relational graph topology &#8212; a node can only attend to its neighbors defined by foreign key relationships. This makes computation tractable on million-node graphs while preserving the structural inductive bias of the database schema.</div>
    </div>

    <div class="section-bridge">
      <a class="section-bridge-link" href="#s-synthetic">Synthetic Pre-training &#8250;</a>
    </div>
  </section>

  <!-- ─── SECTION 5: SYNTHETIC ─── -->
  <section class="section" id="s-synthetic">
    <div class="section-tag" style="color:#f59e0b">&#9632; RDB-PFN &amp; PLUREL</div>
    <h1 class="section-title">Synthetic Pre-training &amp; Scaling Laws</h1>
    <p class="section-sub">Training a relational foundation model requires diverse databases &#8212; but real databases are private. RDB-PFN (arXiv:2603.03805) and PLUREL (arXiv:2602.04029) solve this by generating millions of synthetic relational databases from scratch.</p>

    <div class="stats-row">
      <div class="stat"><div class="stat-val" style="color:#f59e0b">2M+</div><div class="stat-lbl">synthetic pre-training tasks</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">19</div><div class="stat-lbl">real-world benchmarks evaluated</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">Power-law</div><div class="stat-lbl">scaling with data volume</div></div>
      <div class="stat"><div class="stat-val" style="color:#f59e0b">0</div><div class="stat-lbl">private databases required</div></div>
    </div>

    <canvas id="canvas-synthetic" width="700" height="360" style="margin-bottom:16px"></canvas>
    <div class="btn-row">
      <button class="btn-tab active" id="tab-syn-gen" onclick="setSynTab('gen')">Generation Pipeline</button>
      <button class="btn-tab" id="tab-syn-scale" onclick="setSynTab('scale')">Scaling Laws</button>
    </div>

    <div class="grid2" style="margin-top:16px">
      <div class="card">
        <div class="card-title" style="color:#f59e0b">RDB-PFN (arXiv:2603.03805)</div>
        <div class="card-body">The first relational foundation model trained purely on synthetic data. Uses a Relational Prior Generator based on Structural Causal Models (SCMs) to generate diverse databases. Builds on Prior-Data Fitted Networks (PFNs) &#8212; models that learn from distributions of datasets rather than fixed datasets.</div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#f59e0b">PLUREL (arXiv:2602.04029)</div>
        <div class="card-body">Discovers that RFM pre-training loss follows <strong>power-law scaling</strong> with both the number of synthetic databases and total pre-training tokens. More synthetic data reliably improves real-world performance &#8212; unlocking the same scaling recipe that drove LLM progress.</div>
      </div>
    </div>

    <div class="formula">// PLUREL Synthetic Database Generation Pipeline
Step 1: Schema     G_schema = directed graph of tables + column types
Step 2: Connect    G_bipart = bipartite graph of PK&#8594;FK cardinalities
Step 3: Features   P(X_col | parent_cols) via conditional causal mechanisms

// Scaling Law (empirical)
Loss(D, T) &#8733; D^&#945; &#215; T^&#946;  where &#945;,&#946; &lt; 0
// D = number of synthetic databases
// T = total pre-training tokens
// Doubling D or T reliably reduces downstream task loss</div>

    <div class="highlight-box amber">
      <strong>Why this matters:</strong> LLMs scaled because the internet provided nearly unlimited text. Relational databases are private. Synthetic generation gives RFMs the same unlimited pre-training data advantage &#8212; the power-law scaling curve means more synthetic data always helps.
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What is a Prior-Data Fitted Network (PFN)? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">A PFN is a model trained on distributions of datasets rather than a single fixed dataset. During training, PFNs sample a new synthetic dataset for each forward pass and learn to make predictions in-context from the examples in that dataset. This trains the model to be a general-purpose in-context learner rather than a specialist on any particular distribution.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What is a Structural Causal Model (SCM)? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">An SCM defines variables and causal relationships between them using directed acyclic graphs. PLUREL uses SCMs to generate realistic feature distributions within synthetic tables &#8212; ensuring that synthetic column values have realistic correlations, nonlinear relationships, and noise levels rather than being purely random.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">Are synthetic databases realistic enough? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">RDB-PFN demonstrates competitive performance with supervised deep learning baselines on 19 real-world benchmarks &#8212; using only synthetic pre-training. PLUREL shows further improvements by scaling synthetic data volume. The key insight is that diversity of generated schemas matters more than individual realism: the model learns generalizable inductive biases by seeing millions of different schema structures.</div>
    </div>

    <div class="section-bridge">
      <a class="section-bridge-link" href="#s-relbench">RelBench Benchmark &#8250;</a>
    </div>
  </section>

  <!-- ─── SECTION 6: RELBENCH ─── -->
  <section class="section" id="s-relbench">
    <div class="section-tag" style="color:#0ea5e9">&#9632; Evaluation</div>
    <h1 class="section-title">RelBench: Measuring What Matters</h1>
    <p class="section-sub">RelBench (Fey &amp; Leskovec) is the first public benchmark specifically designed for evaluating machine learning on relational databases. It covers 30 tasks across 7 domains at varying scales of complexity.</p>

    <div class="stats-row">
      <div class="stat"><div class="stat-val" style="color:#0ea5e9">30</div><div class="stat-lbl">prediction tasks</div></div>
      <div class="stat"><div class="stat-val" style="color:#0ea5e9">11</div><div class="stat-lbl">real-world databases</div></div>
      <div class="stat"><div class="stat-val" style="color:#0ea5e9">7</div><div class="stat-lbl">domains covered</div></div>
      <div class="stat"><div class="stat-val" style="color:#0ea5e9">3</div><div class="stat-lbl">task types</div></div>
    </div>

    <canvas id="canvas-relbench" width="700" height="360" style="margin-bottom:16px;cursor:pointer"></canvas>
    <p style="font-size:11px;color:var(--muted);margin-bottom:16px">Click a dataset card to see its schema and tasks.</p>

    <div class="info-panel" id="rb-info">
      <strong>Select a dataset</strong> above to see its domain, schema size, and available tasks.
    </div>

    <div class="table-wrap" style="margin-top:20px">
      <table>
        <thead>
          <tr>
            <th>Dataset</th><th>Domain</th><th>Tables</th><th>Rows</th><th>Tasks</th>
          </tr>
        </thead>
        <tbody id="rb-table-body">
          <tr><td class="highlight">rel-stack</td><td>Q&amp;A / Social</td><td>8</td><td>~16M</td><td>User engagement, post votes, badge prediction</td></tr>
          <tr><td class="highlight">rel-amazon</td><td>E-commerce</td><td>7</td><td>~48M</td><td>Product rating, recommendation, churn</td></tr>
          <tr><td class="highlight">rel-trial</td><td>Medical</td><td>5</td><td>~3M</td><td>Trial success, patient outcomes</td></tr>
          <tr><td class="highlight">rel-f1</td><td>Sports</td><td>9</td><td>~1.2M</td><td>Race results, driver performance</td></tr>
          <tr><td class="highlight">rel-hm</td><td>Fashion / Retail</td><td>4</td><td>~31M</td><td>Purchase prediction, recommendation</td></tr>
          <tr><td class="highlight">rel-event</td><td>Events</td><td>5</td><td>~1.5M</td><td>Ticket sales, attendance prediction</td></tr>
          <tr><td class="highlight">rel-avito</td><td>Classifieds</td><td>6</td><td>~12M</td><td>Ad click-through, price prediction</td></tr>
          <tr><td class="highlight">rel-arxiv</td><td>Academic</td><td>5</td><td>~8M</td><td>Citation prediction, author linkage</td></tr>
          <tr><td class="highlight">rel-mimic</td><td>Healthcare</td><td>15</td><td>~22M</td><td>ICU mortality, readmission, diagnosis</td></tr>
          <tr><td class="highlight">rel-ratebeer</td><td>Reviews</td><td>4</td><td>~2.9M</td><td>Beer rating, reviewer churn</td></tr>
          <tr><td class="highlight">rel-salt</td><td>Supply Chain</td><td>6</td><td>~5M</td><td>Demand forecast, inventory prediction</td></tr>
        </tbody>
      </table>
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">How does RelBench prevent data leakage? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">RelBench defines a strict temporal split: each task specifies a cutoff time T. Training data uses only rows with timestamps before T; test data uses labels from after T. This mirrors real production ML systems where models are trained on historical data and evaluated on truly unseen future data.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What are the three task types in RelBench? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">(1) <strong>Entity classification/regression</strong>: predict a property of an entity row (e.g., "will this user churn?"). (2) <strong>Temporal link prediction</strong>: predict which two entities will be linked in the future (e.g., "which product will this user buy next?"). (3) <strong>Multi-hop prediction</strong>: predict labels that require reasoning across multiple table hops.</div>
    </div>

    <div class="section-bridge">
      <a class="section-bridge-link" href="#s-results">Results &amp; Impact &#8250;</a>
    </div>
  </section>

  <!-- ─── SECTION 7: RESULTS ─── -->
  <section class="section" id="s-results">
    <div class="section-tag" style="color:#f87171">&#9632; Results &amp; Impact</div>
    <h1 class="section-title">Results: 1 Second vs. 12 Hours</h1>
    <p class="section-sub">KumoRFM doesn&#8217;t just match traditional approaches &#8212; it arrives at comparable accuracy orders of magnitude faster, with a fraction of the code.</p>

    <div class="stats-row">
      <div class="stat"><div class="stat-val" style="color:#f87171">1s</div><div class="stat-lbl">KumoRFM inference time</div></div>
      <div class="stat"><div class="stat-val" style="color:#f87171">vs 30m</div><div class="stat-lbl">traditional RDL baseline</div></div>
      <div class="stat"><div class="stat-val" style="color:#f87171">vs 12.3h</div><div class="stat-lbl">human data scientist</div></div>
      <div class="stat"><div class="stat-val" style="color:#f87171">2&#8211;8%</div><div class="stat-lbl">accuracy gain zero-shot</div></div>
    </div>

    <canvas id="canvas-results" width="700" height="360" style="margin-bottom:16px"></canvas>
    <div class="btn-row">
      <button class="btn-tab active" id="tab-res-time" onclick="setResTab('time')">Time Comparison</button>
      <button class="btn-tab" id="tab-res-code" onclick="setResTab('code')">Code Complexity</button>
      <button class="btn-tab" id="tab-res-acc" onclick="setResTab('acc')">Accuracy (RelBench)</button>
    </div>

    <div style="margin-top:20px">
      <div class="grid3">
        <div class="card">
          <div class="card-title" style="color:#f87171">Zero-shot Wins</div>
          <div class="card-body">On entity classification tasks in RelBench, KumoRFM outperforms feature-engineered baselines by 2&#8211;8% accuracy without any task-specific training &#8212; just in-context examples sampled from historical data.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color:#f87171">Fine-tuned Jumps</div>
          <div class="card-body">When fine-tuned on specific databases or query types, KumoRFM improves 10&#8211;30% over the already-competitive zero-shot baseline, matching or exceeding expert-built supervised deep learning systems.</div>
        </div>
        <div class="card">
          <div class="card-title" style="color:#f87171">Recommendation</div>
          <div class="card-body">On temporal link prediction (recommendation) tasks, KumoRFM demonstrates competitive MAP@k performance against specialized recommender systems that took weeks of engineering to build.</div>
        </div>
      </div>
    </div>

    <div class="highlight-box green">
      <strong>The full stack:</strong> Relational Graph Transformers (April 2025) show an additional 10% win over GNN baselines and 40% over LightGBM on RelBench &#8212; with 95% less data preparation effort and 20&#215; faster time-to-value vs. traditional approaches.
    </div>

    <div style="margin-bottom:28px">
      <div class="section-tag" style="margin-bottom:10px;color:#f87171">Method Comparison Matrix</div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:14px">Click any cell to see a concrete example of what that score means in practice.</p>
      <div id="method-matrix"></div>
      <div class="info-panel" id="matrix-detail" style="margin-top:12px;display:none"></div>
    </div>

    <div class="grid2" style="margin-top:20px">
      <div class="card">
        <div class="card-title" style="color:#f87171">What this means for enterprise</div>
        <div class="card-body">SAP partnership (Nov 2025) + Snowflake Intelligence integration bring KumoRFM to production enterprise databases. Any org with a relational database can now run production-grade ML predictions with one PQL query &#8212; no ML team required.</div>
      </div>
      <div class="card">
        <div class="card-title" style="color:#f87171">MCP Integration (Sept 2025)</div>
        <div class="card-body">KumoRFM added Model Context Protocol support &#8212; exposing its prediction capabilities as tools that AI agents can call. An LLM agent can now issue PQL queries and receive predictions as part of a larger reasoning workflow.</div>
      </div>
    </div>

    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">What is the Relational Graph Transformer? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">The Relational Graph Transformer (April 2025, Lopez, Fey, Leskovec) extends standard Graph Transformers with three innovations: (1) topology-aware attention that respects database schema, (2) multi-modal node attribute encoding for heterogeneous column types, and (3) composable positional encodings (hop, tree, time encodings). It outperforms GNN baselines by ~10% and LightGBM by ~40% on RelBench.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">Why does this matter beyond benchmarks? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">The benchmark gains translate directly to business value: churn prediction, fraud detection, recommendation, demand forecasting &#8212; every company with a relational database runs these tasks. Reducing the time from months to seconds while matching or exceeding expert accuracy represents a fundamental shift in how production ML is built and deployed.</div>
    </div>
    <div class="accordion-item">
      <div class="accordion-header" onclick="toggleAcc(this)">Where is KumoRFM available? <span class="accordion-chevron">&#9660;</span></div>
      <div class="accordion-body">KumoRFM is available through the Kumo AI platform (kumo.ai) with native integrations for Snowflake, SAP, and other enterprise data systems. The underlying research &#8212; RelBench, the RDL paper, and related methods &#8212; is open-source and available on PyG (PyTorch Geometric).</div>
    </div>
  </section>

</div><!-- end .main -->

<script>
// Password gate
var PG_PASSWORD='visual2025';
(function(){
  var key='pg_unlocked_18';
  if(sessionStorage.getItem(key)==='1'){document.getElementById('pg-gate').style.display='none';}
  var inp=document.getElementById('pg-input');
  if(inp){inp.addEventListener('keydown',function(e){if(e.key==='Enter')pgCheck();});}
})();
function pgCheck(){
  var v=document.getElementById('pg-input').value;
  if(v===PG_PASSWORD){sessionStorage.setItem('pg_unlocked_18','1');document.getElementById('pg-gate').style.display='none';}
  else{document.getElementById('pg-err').textContent='Incorrect password';}
}

// Accordion
function toggleAcc(h){
  var b=h.nextElementSibling;
  var c=h.querySelector('.accordion-chevron');
  var open=b.style.display==='block';
  b.style.display=open?'none':'block';
  c.style.transform=open?'':'rotate(180deg)';
}

// Nav
var sectionIds=['s-problem','s-graph','s-incontext','s-architecture','s-synthetic','s-relbench','s-results'];
function setActive(el,id){
  document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active');});
  if(el)el.classList.add('active');
  var sec=document.getElementById(id);
  if(sec)sec.scrollIntoView({behavior:'smooth'});
}
function updateNavOnScroll(){
  var main=document.getElementById('main-scroll');
  if(!main)return;
  var scrollTop=main.scrollTop;
  var total=main.scrollHeight-main.clientHeight;
  var pct=total>0?Math.round(scrollTop/total*100):0;
  var prog=document.getElementById('scroll-progress');
  if(prog)prog.style.width=pct+'%';
  var best=null,bestDist=Infinity;
  sectionIds.forEach(function(id){
    var el=document.getElementById(id);
    if(!el)return;
    var rect=el.getBoundingClientRect();
    var dist=Math.abs(rect.top);
    if(dist<bestDist){bestDist=dist;best=id;}
  });
  document.querySelectorAll('.nav-link').forEach(function(l){
    l.classList.toggle('active',l.dataset.sec===best);
  });
}
document.getElementById('main-scroll').addEventListener('scroll',updateNavOnScroll);
</script>
<script>
</script>
</body>
</html>`;
fs.writeFileSync('./index.html', html);
const s = fs.statSync('./index.html');
console.log('build1 done:', s.size, 'bytes');
