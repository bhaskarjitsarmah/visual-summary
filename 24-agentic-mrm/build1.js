const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Runtime Governance for Agentic AI in Finance</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#c9d1d9;--muted:#8b949e;
  --accent:#0ea5e9;--accent2:#38bdf8;--accent3:#bae6fd;
  --mrm:#0ea5e9;
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
.grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:14px;}
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
#pg-gate{position:fixed;inset:0;background:linear-gradient(135deg,#0d1117 0%,#161b22 50%,#0d1117 100%);z-index:9999;display:flex;align-items:center;justify-content:center;}
.pg-box{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px 48px;max-width:440px;width:100%;text-align:center;box-shadow:0 0 40px rgba(14,165,233,.1);}
.pg-icon{font-size:2.5rem;margin-bottom:16px;}
.pg-title{font-size:1.3rem;font-weight:800;color:#c9d1d9;margin-bottom:6px;}
.pg-subtitle{font-size:13px;font-weight:600;color:#38bdf8;margin-bottom:6px;}
.pg-sub{font-size:11px;color:#8b949e;margin-bottom:24px;}
.pg-input{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px 14px;color:#c9d1d9;font-size:14px;outline:none;text-align:center;}
.pg-input:focus{border-color:#0ea5e9;}
.pg-btn{margin-top:12px;width:100%;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600;cursor:pointer;}
.pg-err{color:#ff6b6b;font-size:11px;margin-top:8px;min-height:16px;}
.pg-join{margin-top:16px;font-size:11px;color:#8b949e;}
.pg-join a{color:#38bdf8;text-decoration:underline;}
.highlight-box{border-left:3px solid var(--accent);padding:12px 16px;background:rgba(14,165,233,.06);border-radius:0 8px 8px 0;margin-bottom:16px;font-size:13px;color:var(--muted);}
.highlight-box.amber{border-color:#f7b731;background:rgba(247,183,49,.06);}
.highlight-box.green{border-color:#51cf66;background:rgba(81,207,102,.06);}
.highlight-box.violet{border-color:#6c5ce7;background:rgba(108,92,231,.06);}
.highlight-box.red{border-color:#e11844;background:rgba(225,24,68,.06);}
.info-panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-top:12px;font-size:13px;color:var(--muted);min-height:80px;}
.info-panel strong{color:var(--text);}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-right:4px;}
.badge-blue{background:rgba(14,165,233,.2);color:#38bdf8;}
.badge-amber{background:rgba(247,183,49,.2);color:#f7b731;}
.badge-green{background:rgba(81,207,102,.2);color:#51cf66;}
.badge-violet{background:rgba(108,92,231,.2);color:#a29bfe;}
.badge-red{background:rgba(225,24,68,.2);color:#e11844;}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;background:var(--border);border-radius:4px;outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;}
.slider-row{display:flex;gap:12px;align-items:center;margin-bottom:16px;}
.slider-lbl{font-size:11px;color:var(--muted);min-width:140px;}
.slider-val{font-size:12px;font-weight:700;color:var(--accent2);min-width:50px;}
#scroll-progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9998;transition:width .1s;}
.traj-btn-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;}
.traj-fail-btn{background:#ff6b6b22;border:1px solid #ff6b6b55;color:#ff6b6b;border-radius:6px;padding:5px 12px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;}
.traj-fail-btn:hover,.traj-fail-btn.active{background:#ff6b6b44;border-color:#ff6b6b;}
.lod-pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin-right:4px;}
.lod-1{background:rgba(14,165,233,.2);color:#38bdf8;}
.lod-2{background:rgba(108,92,231,.2);color:#a29bfe;}
.lod-sec{background:rgba(225,24,68,.2);color:#e11844;}
</style>
</head>
<body>

<div id="pg-gate">
  <div class="pg-box">
    <div class="pg-icon">&#127963;</div>
    <div class="pg-title">Runtime Governance for Agentic AI</div>
    <div class="pg-subtitle">Model Risk Management &mdash; Financial Services Edition</div>
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
    <div class="sidebar-logo-sub">Post 24 &middot; Agentic MRM</div>
  </div>

  <div class="nav-group-title">The Problem</div>
  <div class="nav-link" data-sec="s-overview" onclick="setActive(this,'s-overview')">
    <span class="dot" style="background:#e11844"></span>The Guardrail Illusion</div>

  <div class="nav-group-title">The Framework</div>
  <div class="nav-link" data-sec="s-capability" onclick="setActive(this,'s-capability')">
    <span class="dot" style="background:#6c5ce7"></span>Capabilities</div>
  <div class="nav-link" data-sec="s-trajectory" onclick="setActive(this,'s-trajectory')">
    <span class="dot" style="background:#f7b731"></span>Governed Trajectories</div>
  <div class="nav-link" data-sec="s-risk-tiers" onclick="setActive(this,'s-risk-tiers')">
    <span class="dot" style="background:#ff6b6b"></span>4-Tier Risk Framework</div>

  <div class="nav-group-title">In Practice</div>
  <div class="nav-link" data-sec="s-mrm" onclick="setActive(this,'s-mrm')">
    <span class="dot" style="background:#00b894"></span>7-Step MRM Programme</div>
  <div class="nav-link" data-sec="s-usecase" onclick="setActive(this,'s-usecase')">
    <span class="dot" style="background:#a29bfe"></span>Capability Reuse</div>

  <div class="nav-group-title">Critical Analysis</div>
  <div class="nav-link" data-sec="s-limitations" onclick="setActive(this,'s-limitations')">
    <span class="dot" style="background:#ff6b6b"></span>13 Limitations</div>
</nav>

<!-- MAIN -->
<div class="main" id="main-scroll">
<div class="pipeline-map">
  <div class="pipe-step"><span class="pipe-dot" style="background:#e11844"></span>Guardrail Illusion</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#6c5ce7"></span>Capabilities</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#f7b731"></span>Trajectories</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#ff6b6b"></span>Risk Tiers</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#00b894"></span>MRM Programme</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#a29bfe"></span>Reuse</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#ff6b6b"></span>Limitations</div>
</div>

<!-- ====== S1: OVERVIEW ====== -->
<section class="section" id="s-overview">
  <div class="section-tag" style="color:#e11844">The Problem &middot; ~12 min read</div>
  <h1 class="section-title">The Guardrail Illusion: Why Prompt-Level Controls Aren't Enough</h1>
  <p class="section-sub">Modern AI agents in finance don't just answer questions &mdash; they execute multi-step plans: query databases, draft filings, approve credit, flag suspicious transactions. Traditional guardrails (prompt filters, output scanners) only see individual steps. They miss the emergent risk of the whole sequence. This paper proposes a new governance architecture built for runtime.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#e11844">4</div><div class="stat-lbl">Risk tiers</div></div>
    <div class="stat"><div class="stat-val" style="color:#6c5ce7">4</div><div class="stat-lbl">Capability types</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">7</div><div class="stat-lbl">MRM steps</div></div>
    <div class="stat"><div class="stat-val" style="color:#00b894">3</div><div class="stat-lbl">LoD layers</div></div>
  </div>

  <canvas id="canvas-guardrail-compare" width="700" height="240" style="margin-bottom:16px;"></canvas>

  <div class="highlight-box red">
    <strong>The core problem:</strong> A prompt filter that blocks "transfer funds" can't detect a 12-step plan that transfers funds as an emergent side-effect of portfolio rebalancing. Governance must operate at trajectory level, not token level.
  </div>

  <div class="grid3" style="margin-top:24px;">
    <div class="card">
      <div class="card-title" style="color:#e11844">Why Finance Is Different</div>
      <div class="card-body">Financial agents operate under SR 11-7 model risk management rules. Validators must be able to explain every consequential decision. An agent that produces correct outputs via un-auditable reasoning chains violates regulatory expectations regardless of accuracy.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#6c5ce7">What the Paper Proposes</div>
      <div class="card-body">A three-layer architecture: (1) decompose agents into discrete capabilities, each with authority, constraints, and evidence requirements; (2) govern execution trajectories as first-class audit objects; (3) apply MRM validation at both capability and trajectory level.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">Why "Scalable"</div>
      <div class="card-body">Once validated, individual capabilities can be reused across multiple agents. Governance cost does not scale linearly with the number of deployed agents &mdash; it scales with the number of distinct capabilities, which grows much more slowly.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is SR 11-7 and why does it apply to AI agents? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">SR 11-7 is the Federal Reserve's 2011 supervisory guidance on model risk management. It requires financial institutions to validate, monitor, and govern all "models" used in decision-making. The paper argues AI agents qualify as models under SR 11-7 and must satisfy the same conceptual soundness, outcome analysis, and ongoing monitoring requirements &mdash; even when the model is an autonomous reasoning agent rather than a statistical formula.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What makes agentic risk different from LLM risk? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">A standalone LLM generates text. An agent executes a plan with real-world effects: API calls, database writes, financial transactions, regulatory filings. The risk is not hallucination in isolation &mdash; it's compounding errors across a multi-step execution where each step may be individually acceptable but the sequence violates a constraint. This requires trajectory-level governance, not output-level filtering.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does this relate to the EU AI Act? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The EU AI Act classifies AI systems in financial services as high-risk (Annex III). High-risk systems require conformity assessment, registration, technical documentation, and ongoing monitoring. The capability-based governance architecture in this paper maps cleanly onto those requirements: each capability is a documentable, testable unit that can satisfy technical documentation obligations at granular level.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-capability">Capabilities &rarr;</a>
  </div>
</section>

<!-- ====== S2: CAPABILITY ====== -->
<section class="section" id="s-capability">
  <div class="section-tag" style="color:#6c5ce7">Framework Layer 1</div>
  <h2 class="section-title">Capabilities: The Atomic Unit of Governance</h2>
  <p class="section-sub">Instead of governing an agent as a monolithic black box, the framework decomposes it into capabilities &mdash; discrete action types with defined authority, constraints, and evidence requirements. Four capability types cover the full surface area of financial AI agents.</p>

  <div class="btn-row">
    <button class="btn-tab active" id="cap-btn-0" onclick="selectCap(0)">C1 Data Query</button>
    <button class="btn-tab" id="cap-btn-1" onclick="selectCap(1)">C2 Computation</button>
    <button class="btn-tab" id="cap-btn-2" onclick="selectCap(2)">C3 Generation</button>
    <button class="btn-tab" id="cap-btn-3" onclick="selectCap(3)">C4 Execution</button>
  </div>
  <canvas id="canvas-capability" width="700" height="260" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="cap-detail">
    <strong>C1 &mdash; Data Query &amp; Retrieval:</strong> Read-only access to structured and unstructured data sources. Authority is limited to SELECT operations. Evidence required: data lineage, schema version, access log. Failure modes: data staleness, scope creep into write operations.
  </div>

  <div class="formula">Capability definition schema
---------------------------------
id          : C1 | C2 | C3 | C4
authority   : what actions this capability may take
constraints : hard limits (no cross-account write, no external calls)
evidence    : audit artifacts required for each invocation
failures    : known failure modes and their signatures
risk_weight : contribution to tier assignment</div>

  <div class="highlight-box violet">
    <strong>Why decompose to capabilities?</strong> Every consequential AI action in finance is one of: reading data (C1), computing derived values (C2), generating documents or recommendations (C3), or executing real-world effects (C4). This decomposition is exhaustive and maps directly to regulatory audit requirements.
  </div>

  <div class="grid2" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#6c5ce7">Authority vs. Autonomy</div>
      <div class="card-body">Each capability type carries a defined authority scope. C1 (read-only) has high autonomy; C4 (execution) requires explicit authorization at each invocation. The authority hierarchy prevents capability escalation &mdash; a common attack vector where an agent acquires permissions beyond its stated function through multi-step reasoning.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#a29bfe">Evidence as Governance</div>
      <div class="card-body">Every capability invocation must produce an audit artifact: data lineage, computation trace, generation rationale, or execution receipt. These artifacts are the raw material for 2nd Line of Defence review. Without them, model validation cannot be performed retroactively &mdash; a critical gap in current practice.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What prevents an agent from combining capabilities to bypass a constraint? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The trajectory governance layer (Section 3) monitors the sequence of capability invocations. Constraint violations are evaluated at the trajectory level, not just per-capability. For example: querying data (C1) is allowed; executing a transfer (C4) is allowed with authorization; but querying data specifically to identify authorization tokens and then transferring funds triggers a trajectory-level violation even if each step passed its individual constraint check.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does C4 (Execution) authorization work in practice? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">C4 capabilities require out-of-band authorization: a human sign-off, a cryptographic approval token, or a pre-authorized budget envelope from a prior governance review. The agent cannot self-authorize C4 operations. This is analogous to dual-control requirements in traditional treasury operations. The authorization event is logged as a trajectory artifact and is required for audit trails under SR 11-7.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-trajectory">Governed Trajectories &rarr;</a>
  </div>
</section>

<!-- ====== S3: TRAJECTORY ====== -->
<section class="section" id="s-trajectory">
  <div class="section-tag" style="color:#f7b731">Framework Layer 2</div>
  <h2 class="section-title">The Credit Memo: A Governed Execution Trajectory</h2>
  <p class="section-sub">A trajectory is the full sequence of capability invocations for a single agent task. The paper uses credit memo generation as a running example: an agent that retrieves borrower data, computes financials, assesses risk, generates a memo, and flags it for human review. Each step is governed. Failures inject at specific points.</p>

  <canvas id="canvas-trajectory" width="700" height="220" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="btn-row">
    <button class="btn" onclick="trajPlay()">&#9654; Play Trajectory</button>
    <button class="btn-tab" onclick="trajReset()">&#8635; Reset</button>
  </div>

  <p style="font-size:12px;color:var(--muted);margin-bottom:8px;margin-top:8px;">Inject a failure at any step to see how governance blocks propagation:</p>
  <div class="traj-btn-row" id="traj-fail-btns">
    <button class="traj-fail-btn" id="tfb-0" onclick="injectFailure(0)">F0: Stale data</button>
    <button class="traj-fail-btn" id="tfb-1" onclick="injectFailure(1)">F1: Computation drift</button>
    <button class="traj-fail-btn" id="tfb-2" onclick="injectFailure(2)">F2: Hallucinated rationale</button>
    <button class="traj-fail-btn" id="tfb-3" onclick="injectFailure(3)">F3: Missing human flag</button>
    <button class="traj-fail-btn" id="tfb-4" onclick="injectFailure(4)">F4: Scope escalation</button>
  </div>
  <div class="info-panel" id="traj-detail" style="margin-top:12px;">
    <strong>Click Play</strong> to animate the credit memo trajectory. Each step lights up as the agent completes it. Inject a failure to see the guardrail block and audit record.
  </div>

  <div class="highlight-box amber" style="margin-top:16px;">
    <strong>Trajectories as audit objects:</strong> Under this framework, the trajectory &mdash; not the final output &mdash; is the primary governance object. Regulators can inspect every capability invocation, its inputs, outputs, and evidence artifacts. The memo is a byproduct; the trajectory is the record.
  </div>

  <div class="grid2" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#f7b731">What the Runtime Monitor Does</div>
      <div class="card-body">A lightweight process runs alongside the agent and observes every capability invocation. It checks: (1) is this capability authorized for this agent? (2) are the inputs within declared scope? (3) does the output satisfy evidence requirements? If any check fails, the trajectory is halted and an incident record is created.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0ea5e9">Why Runtime, Not Post-Hoc</div>
      <div class="card-body">Post-hoc review catches errors after they propagate. A credit memo built on stale data (F0) that passes all subsequent steps will generate a flawed recommendation. Runtime governance blocks at the point of failure, preventing downstream contamination and reducing remediation cost dramatically.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What happens when the runtime monitor blocks a trajectory step? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">A trajectory halt triggers three concurrent actions: (1) the current trajectory is archived as a failed execution object with all evidence artifacts collected so far; (2) a human-in-the-loop notification is issued to the designated 1LoD owner; (3) the incident is logged to the audit trail with the specific constraint violated, the capability type, and the trajectory step. The agent does not self-recover &mdash; human approval is required to resume or restart.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How are trajectory constraints specified? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Constraints are defined at the capability level (e.g., C2 computation must use approved model versions) and at the task level (e.g., credit memo trajectory must flag for human review before C4 execution). The runtime monitor maintains a constraint registry indexed by capability type and task template. Constraints are versioned &mdash; changes require a 2nd Line of Defence sign-off before deployment.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-risk-tiers">4-Tier Risk Framework &rarr;</a>
  </div>
</section>

<!-- ====== S4: RISK TIERS ====== -->
<section class="section" id="s-risk-tiers">
  <div class="section-tag" style="color:#ff6b6b">Framework Layer 3</div>
  <h2 class="section-title">4-Tier Risk Framework: From Advisory to Autonomous</h2>
  <p class="section-sub">Not all agents carry the same risk. The framework assigns each deployed agent a risk tier based on five dimensions: autonomy level, financial materiality, reversibility of actions, regulatory exposure, and human oversight available. Tiers drive governance intensity &mdash; from light-touch monitoring to full MRM validation cycles.</p>

  <canvas id="canvas-tier-matrix" width="700" height="260" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="tier-detail">
    <strong>Click a tier</strong> to see its risk profile, required controls, and example use cases.
  </div>

  <div class="formula">Tier assignment function
------------------------------
T1 Advisory      : autonomy=LOW,  materiality=LOW,  reversible=YES
T2 Assisted      : autonomy=MED,  materiality=MED,  reversible=YES
T3 Semi-auto     : autonomy=HIGH, materiality=MED,  reversible=PARTIAL
T4 Autonomous    : autonomy=FULL, materiality=HIGH, reversible=NO

Controls scale with tier:
  T1 : logging + periodic review
  T2 : + drift detection + human-in-loop for outliers
  T3 : + full MRM validation + runtime monitor + pre-auth C4
  T4 : + continuous validation + regulatory pre-notification</div>

  <div class="highlight-box red">
    <strong>Tier 4 is not aspirational.</strong> The paper explicitly covers T4 autonomous agents (e.g., fully automated market-making, real-time credit adjudication at scale) and provides governance specifications for them. The question is not whether to deploy T4 agents, but how to govern them.
  </div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#ff6b6b">Why Reversibility Matters</div>
      <div class="card-body">Reversibility is the most important dimension for tier assignment. An agent that generates a draft document (fully reversible) can tolerate higher autonomy than one that executes an irrevocable payment. The framework mandates C4 (execution) authorization for all irreversible actions, regardless of tier.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">Materiality Thresholds</div>
      <div class="card-body">Financial materiality is defined at the task level, not the agent level. A credit memo agent may handle T1 (advisory) tasks for retail clients and T3 (semi-autonomous) tasks for large corporate loans &mdash; with different governance controls applied to the same agent in different contexts.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0ea5e9">Dynamic Tier Assignment</div>
      <div class="card-body">Tier assignment is evaluated per-task, not per-agent. The runtime monitor checks the task context at trajectory start and applies the appropriate control set. An agent's effective tier can change between invocations based on the nature of the specific request.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How do you handle an agent that spans multiple tiers within a single trajectory? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The trajectory inherits the highest tier encountered across all its capability invocations. If a trajectory begins with T1 data queries and ends with a T3 computation used to approve a loan, the entire trajectory is governed as T3. This prevents tier dilution through task decomposition &mdash; a governance bypass where high-risk operations are disguised as sequences of low-risk steps.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What triggers a tier re-assessment? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Tier re-assessment is triggered by: (1) material changes in agent capability (new tool access, updated model weights); (2) evidence of performance degradation beyond drift thresholds; (3) regulatory guidance changes; (4) incident events that reveal new failure modes not captured in the original tier assignment. Re-assessment is a 2nd Line of Defence responsibility under the MRM programme.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-mrm">7-Step MRM Programme &rarr;</a>
  </div>
</section>

<!-- ====== S5: MRM ====== -->
<section class="section" id="s-mrm">
  <div class="section-tag" style="color:#00b894">In Practice</div>
  <h2 class="section-title">7-Step MRM Programme: Who Does What</h2>
  <p class="section-sub">The framework specifies a complete Model Risk Management lifecycle for agentic AI. Each step assigns clear accountability across three lines of defence: 1st Line (business/development), 2nd Line (risk/validation), and SecOps (security monitoring). Click any step to see the full accountability matrix.</p>

  <canvas id="canvas-mrm-pipeline" width="700" height="260" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="mrm-detail">
    <strong>Click a step</strong> to see who is accountable, what is produced, and how it connects to regulatory requirements.
  </div>

  <div class="grid3" style="margin-top:16px;">
    <div class="card">
      <div class="card-title" style="color:#38bdf8"><span class="lod-pill lod-1">1LoD</span> Business Line</div>
      <div class="card-body">Owns the agent use case, defines business requirements, performs initial capability scoping, monitors production performance, and escalates anomalies. Accountable for operational continuity and first-level incident response.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#a29bfe"><span class="lod-pill lod-2">2LoD</span> Risk &amp; Validation</div>
      <div class="card-body">Independent validation of capability specifications, trajectory constraint logic, and tier assignments. Approves deployment and change events. Reviews evidence artifacts from trajectory logs. Issues annual model validation opinion.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#e11844"><span class="lod-pill lod-sec">SecOps</span> Security</div>
      <div class="card-body">Monitors for adversarial inputs (prompt injection, jailbreaking), anomalous trajectory patterns, and capability escalation attempts. Operates the runtime threat detection layer. Coordinates incident response for security events.</div>
    </div>
  </div>

  <div class="highlight-box green" style="margin-top:16px;">
    <strong>The key innovation:</strong> Step 4 (Trajectory Registry) is new to AI MRM. Traditional model validation validates models in isolation. This framework validates execution trajectories as composite governance objects &mdash; capturing emergent risks that per-model validation misses.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Step 1: Capability Inventory &mdash; what exactly gets documented? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">For each capability instance: (a) capability type (C1-C4); (b) authority scope &mdash; what systems can be accessed, what operations are permitted; (c) constraint set &mdash; explicit prohibitions and pre-conditions; (d) evidence specification &mdash; what audit artifacts must be produced per invocation; (e) failure mode catalog &mdash; known ways this capability can fail and their detection signatures; (f) model components involved &mdash; LLM version, embedding model, tool definitions. This inventory is the input to Step 3 (validation).</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Step 5: Ongoing Monitoring &mdash; what metrics matter? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The framework specifies four monitoring tracks: (1) Performance drift &mdash; output quality relative to validated baseline; (2) Trajectory anomalies &mdash; unusual capability sequences, unexpected halt rates; (3) Constraint violation rates &mdash; frequency and type of runtime monitor interventions; (4) Evidence completeness &mdash; fraction of trajectory steps with full artifact coverage. Drift thresholds trigger 2LoD review; breach of absolute limits triggers trading halt equivalent (suspension of agent authority).</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does the MRM cycle handle model updates? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Model updates (weight changes, fine-tuning, tool version changes) trigger a partial re-validation. The scope depends on which capabilities are affected: if only C2 computation is impacted, only C2 capability validation is required, not a full programme re-run. This proportionality principle keeps governance cost manageable for iteratively updated systems. All changes are logged to the capability version history and require 2LoD sign-off before re-deployment.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-usecase">Capability Reuse &rarr;</a>
  </div>
</section>

<!-- ====== S6: USECASE ====== -->
<section class="section" id="s-usecase">
  <div class="section-tag" style="color:#a29bfe">In Practice &middot; Scalability</div>
  <h2 class="section-title">Capability Reuse: Governance That Scales</h2>
  <p class="section-sub">The central scalability argument: financial AI agents are compositional. A credit memo agent, a trading surveillance agent, and a regulatory filing agent all share the same four capability types &mdash; just assembled differently. Validate each capability once; reuse across all agents. Governance cost grows with distinct capabilities, not agent count.</p>

  <canvas id="canvas-usecase-reuse" width="700" height="260" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="uc-detail">
    <strong>Click a use case column</strong> to see which capabilities it uses and what the governance reuse means.
  </div>

  <div class="grid2" style="margin-top:16px;">
    <div class="card">
      <div class="card-title" style="color:#a29bfe">The Reuse Dividend</div>
      <div class="card-body">If C1 (Data Query) has been fully validated for the credit memo agent, deploying it in the trading surveillance agent requires only incremental validation of the new authority scope &mdash; not a full capability re-assessment. The savings compound: 10 agents sharing 4 capabilities = 4 full validations + 10 incremental reviews, not 40 full validations.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0ea5e9">Constraint Inheritance</div>
      <div class="card-body">When a capability is reused, it inherits its validated constraint set as a floor. New agents may add stricter constraints but cannot relax validated ones without a full re-validation. This one-way ratchet ensures that validated governance properties are preserved across reuse contexts.</div>
    </div>
  </div>

  <div class="highlight-box" style="margin-top:8px;">
    <strong>The research gap addressed:</strong> Existing MRM guidance (SR 11-7) was designed for statistical models with fixed inputs and outputs. Agentic AI introduces dynamic tool use, multi-step planning, and emergent behavior. This framework is the first structured attempt to extend SR 11-7 principles to that regime without abandoning its core requirements.
  </div>

  <div class="formula">Governance cost model
--------------------------
Traditional approach:
  cost = O(agents x validation_cost)

Capability-reuse approach:
  cost = O(capabilities x validation_cost) + O(agents x incremental_review)

  where incremental_review << validation_cost

For 10 agents, 4 capabilities:
  Traditional : 10 full validations
  Reuse model : 4 full + 10 incremental  ~  60-70% cost reduction</div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Can capability reuse create governance blind spots? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Yes, and the paper addresses this. Reuse creates risk if the new agent context introduces hazards not present in the original validation. The incremental review process explicitly checks for: (1) new authority combinations that create emergent risk; (2) interaction effects between reused and new capabilities; (3) novel failure modes in the new deployment context. The constraint inheritance mechanism mitigates but does not eliminate this risk &mdash; human judgment remains required for each new deployment.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What happens when a shared capability has a vulnerability? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">A validated vulnerability in a shared capability triggers a cross-agent review: all deployed agents using that capability must be assessed for exposure to the vulnerability. The capability registry enables rapid blast-radius analysis &mdash; a key operational advantage of the architecture. In traditional per-model validation, a vulnerability in an underlying tool might not surface until each model is individually reviewed.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Where does this framework fall short? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The paper acknowledges three open problems: (1) Emergent multi-agent risk &mdash; when multiple governed agents interact, trajectory-level governance of each does not automatically govern their interactions; (2) Constraint completeness &mdash; the framework assumes constraints can be specified in advance, but novel failure modes by definition are not anticipated; (3) Human oversight latency &mdash; for T4 autonomous agents operating at millisecond timescales, human-in-the-loop requirements create practical tensions with operational requirements. These remain active research questions.</div>
  </div>

  <div class="highlight-box green" style="margin-top:16px;">
    <strong>Bottom line:</strong> The paper is the most practically-grounded bridge between AI safety research and financial services regulation published to date. It gives risk officers a vocabulary &mdash; capabilities, trajectories, tiers &mdash; and a process &mdash; the 7-step MRM programme &mdash; that maps directly to existing SR 11-7 obligations. Implementation starts with the capability inventory.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-limitations">Critical Limitations &rarr;</a>
  </div>
</section>

<!-- ====== S7: LIMITATIONS ====== -->
<section class="section" id="s-limitations">
  <div class="section-tag" style="color:#ff6b6b">Critical Analysis &middot; 13 Open Problems</div>
  <h2 class="section-title">Where the Framework Falls Short</h2>
  <p class="section-sub">A structured audit of the paper's gaps, contradictions, and unresolved problems &mdash; organized across five categories. These are not minor implementation details; several represent fundamental incompatibilities between the framework's claims and its technical logic. Click any limitation card to expand the full argument.</p>

  <div class="btn-row" id="lim-cat-btns">
    <button class="btn-tab active" id="lcat-btn-all" onclick="filterLim('all')">All 13</button>
    <button class="btn-tab" id="lcat-btn-taxonomy" onclick="filterLim('taxonomy')">Taxonomy Gaps</button>
    <button class="btn-tab" id="lcat-btn-logic" onclick="filterLim('logic')">Framework Logic</button>
    <button class="btn-tab" id="lcat-btn-sr117" onclick="filterLim('sr117')">SR 11-7 Alignment</button>
    <button class="btn-tab" id="lcat-btn-scale" onclick="filterLim('scale')">Scalability Claims</button>
    <button class="btn-tab" id="lcat-btn-missing" onclick="filterLim('missing')">Missing Layers</button>
  </div>

  <canvas id="canvas-limitations" width="700" height="300" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="lim-detail">
    <strong>Click a limitation card</strong> to see the full argument and the question the authors cannot answer from the paper.
  </div>

  <div id="lim-accordions" style="margin-top:20px;"></div>

  <div class="highlight-box red" style="margin-top:20px;">
    <strong>The hardest problem (L13):</strong> The framework is a set of process controls, not a completeness proof. It reduces the probability of harmful trajectories &mdash; but it cannot bound the residual risk. No formal guarantee exists that a trajectory satisfying all capability constraints and trajectory templates will not produce a materially harmful outcome through emergent multi-step behavior. This is not a gap the authors can close with an addendum; it is an open research problem in AI safety.
  </div>
</section>

</div><!-- /.main -->

<script>
/* =========== PASSWORD GATE =========== */
var PG_PASSWORD='visual2025';
var PG_KEY='pg_unlocked_24';
function pgCheck(){
  var v=document.getElementById('pg-input').value;
  if(v===PG_PASSWORD){
    localStorage.setItem(PG_KEY,'1');
    document.getElementById('pg-gate').style.display='none';
    doInit();
  } else {
    document.getElementById('pg-err').textContent='Incorrect password. Try again.';
  }
}
document.getElementById('pg-input').addEventListener('keydown',function(e){if(e.key==='Enter')pgCheck();});
if(localStorage.getItem(PG_KEY)==='1'){
  document.getElementById('pg-gate').style.display='none';
}

/* =========== SCROLL PROGRESS =========== */
var mainEl=document.getElementById('main-scroll');
mainEl.addEventListener('scroll',function(){
  var sp=document.getElementById('scroll-progress');
  var pct=mainEl.scrollTop/(mainEl.scrollHeight-mainEl.clientHeight)*100;
  sp.style.width=Math.min(100,pct)+'%';
  updateNavOnScroll();
});

/* =========== NAV =========== */
var sectionIds=['s-overview','s-capability','s-trajectory','s-risk-tiers','s-mrm','s-usecase','s-limitations'];
function setActive(el,sec){
  document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active');});
  el.classList.add('active');
  document.getElementById(sec).scrollIntoView({behavior:'smooth'});
}
function updateNavOnScroll(){
  var scrollTop=mainEl.scrollTop;
  var best=sectionIds[0];
  sectionIds.forEach(function(id){
    var el=document.getElementById(id);
    if(el&&el.offsetTop-120<=scrollTop)best=id;
  });
  document.querySelectorAll('.nav-link').forEach(function(l){
    l.classList.toggle('active',l.getAttribute('data-sec')===best);
  });
}

/* =========== ACCORDION =========== */
function toggleAcc(h){
  var body=h.nextElementSibling;
  var chev=h.querySelector('.accordion-chevron');
  var open=body.style.display==='block';
  body.style.display=open?'none':'block';
  if(chev)chev.style.transform=open?'':'rotate(180deg)';
}

/* =========== DATA =========== */
var CAPABILITIES=[
  {id:'C1',label:'Data Query & Retrieval',color:'#0ea5e9',
   authority:'Read-only access to approved data sources (market data, credit files, regulatory databases)',
   constraints:'No write operations; no cross-entity data joins without explicit scope; schema version pinned',
   evidence:'Data lineage record, access timestamp, schema version, row-level filter applied',
   failures:['Stale data beyond freshness threshold','Scope creep into write APIs','Cross-entity data leakage'],
   desc:'The safest capability type. C1 is read-only and constrained to approved data catalogs. High autonomy granted; primary risk is data staleness and scope drift.'},
  {id:'C2',label:'Computation & Analysis',color:'#6c5ce7',
   authority:'Numerical computation, statistical analysis, model inference using approved model versions',
   constraints:'Approved model version list only; computation trace required; no external API calls',
   evidence:'Computation trace with inputs/outputs, model version hash, confidence intervals if applicable',
   failures:['Model version mismatch','Numerical instability in edge cases','Confidence score suppression'],
   desc:'C2 covers all derived computations: risk scores, financial ratios, model inferences. Evidence requirement is the computation trace &mdash; regulators must be able to reproduce any output.'},
  {id:'C3',label:'Generation & Recommendation',color:'#f7b731',
   authority:'Draft documents, summaries, recommendations. Output is advisory unless C4 is invoked to action it.',
   constraints:'Must cite C1/C2 evidence for every material claim; no self-referential sourcing; hallucination detection active',
   evidence:'Generation trace, source citations, hallucination check result, human review flag if material',
   failures:['Hallucinated rationale citing non-existent data','Unsupported quantitative claims','Overconfident framing'],
   desc:'C3 is where LLM capabilities are most visible. The key constraint: every material claim must cite a C1 or C2 evidence artifact. Unsupported generation is a T3/T4 violation.'},
  {id:'C4',label:'Execution & Action',color:'#e11844',
   authority:'Real-world effects: API writes, transaction submission, regulatory filing, alert escalation',
   constraints:'Requires out-of-band authorization; irrevocable actions require dual authorization; budget envelope enforced',
   evidence:'Authorization token, execution receipt, pre/post state snapshot, rollback plan if applicable',
   failures:['Unauthorized execution','Budget envelope breach','Irrevocable action without human sign-off'],
   desc:'C4 is the highest-risk capability. All C4 invocations require explicit authorization. Irrevocable actions (payments, filings) require dual authorization. Rollback plans are mandatory where actions are partially reversible.'}
];

var TRAJ_STATES=[
  {id:'s0',label:'Task Start',sub:'Request received',color:'#0ea5e9',x:0.05,y:0.5},
  {id:'s1',label:'C1: Fetch Data',sub:'Borrower & market data',color:'#0ea5e9',x:0.22,y:0.5},
  {id:'s2',label:'C2: Compute',sub:'Risk ratios & scores',color:'#6c5ce7',x:0.40,y:0.5},
  {id:'s3',label:'C3: Generate',sub:'Draft credit memo',color:'#f7b731',x:0.58,y:0.5},
  {id:'s4',label:'Human Review',sub:'1LoD sign-off required',color:'#00b894',x:0.76,y:0.5},
  {id:'s5',label:'C4: File',sub:'Submit to system',color:'#e11844',x:0.92,y:0.5}
];

var FAILURE_MODES=[
  {step:1,naive:'Data served from 3-day-old cache; staleness not checked',guard:'C1 freshness constraint fires; trajectory halted; 1LoD notified'},
  {step:2,naive:'Computation uses deprecated model version; drift undetected',guard:'C2 model version check fails; computation trace archived; re-run required'},
  {step:3,naive:'Memo cites a ratio the model invented; no evidence artifact',guard:'C3 citation check finds unsupported claim; hallucination flag raised; draft blocked'},
  {step:4,naive:'Human review skipped; agent proceeds directly to C4',guard:'Trajectory constraint: C4 cannot follow C3 without human review token; halt'},
  {step:2,naive:'C1 query scope extended mid-trajectory to include competitor data',guard:'Runtime monitor detects scope escalation; capability authority violated; trajectory archived'}
];

var RISK_TIERS=[
  {id:'T1',label:'Advisory',color:'#51cf66',
   dims:{autonomy:'Low',materiality:'Low',reversible:'Full',regulatory:'Minimal',oversight:'High'},
   controls:['Activity logging','Quarterly output review','Drift alerting (90-day lag)'],
   examples:['Market commentary generation','Regulatory Q&A assistant','Internal knowledge search'],
   detail:'T1 agents advise humans who make the final decision. Governance is lightweight: logging, periodic output review, and basic drift monitoring. No runtime monitor required; 2LoD review is annual.'},
  {id:'T2',label:'Assisted Decision',color:'#f7b731',
   dims:{autonomy:'Medium',materiality:'Medium',reversible:'Yes',regulatory:'Moderate',oversight:'Medium'},
   controls:['Runtime logging','Monthly output sampling','Human-in-loop for outlier cases','Drift detection (30-day)'],
   examples:['Credit scoring (human approves)','Trade idea generation','Client suitability screening'],
   detail:'T2 agents produce structured recommendations that humans act on in most cases, with explicit human override for outliers. Full audit trail required; 2LoD validation every 6-12 months.'},
  {id:'T3',label:'Semi-Autonomous',color:'#ff9f43',
   dims:{autonomy:'High',materiality:'Medium-High',reversible:'Partial',regulatory:'High',oversight:'Low'},
   controls:['Full runtime monitor','C4 pre-authorization required','2LoD validation before deployment','Continuous drift detection'],
   examples:['Automated credit adjudication','Regulatory filing preparation','Portfolio rebalancing with limits'],
   detail:'T3 agents execute consequential actions with minimal human involvement except for defined escalation triggers. Full MRM programme required; trajectory governance is mandatory; pre-deployment 2LoD sign-off.'},
  {id:'T4',label:'Autonomous',color:'#e11844',
   dims:{autonomy:'Full',materiality:'High',reversible:'No',regulatory:'Critical',oversight:'Minimal'},
   controls:['Continuous 2LoD validation','Regulatory pre-notification','Real-time trajectory monitoring','Adversarial red-teaming','Incident kill switch'],
   examples:['High-frequency market-making','Real-time AML transaction flagging','Autonomous regulatory response'],
   detail:'T4 agents operate at scale with irreversible financial consequences. Requires regulatory pre-notification in most jurisdictions, continuous 2LoD oversight, adversarial testing, and a documented kill switch procedure. Highest governance intensity.'}
];

var MRM_STEPS=[
  {id:'M1',label:'Capability Inventory',color:'#0ea5e9',
   lod1:'Define use case; scope capabilities; specify authority and constraints',
   lod2:'Review inventory for completeness; approve capability taxonomy',
   secops:'Threat model per capability; identify attack surfaces',
   detail:'The foundation step. 1LoD documents every capability the agent will use, its authority scope, constraints, and evidence requirements. 2LoD reviews for regulatory completeness. SecOps identifies adversarial risks. Output: approved capability inventory.'},
  {id:'M2',label:'Tier Assignment',color:'#6c5ce7',
   lod1:'Propose tier based on materiality and autonomy assessment',
   lod2:'Validate tier assignment; check against regulatory exposure',
   secops:'Assess security implications of proposed tier',
   detail:'Each agent (and task type) is assigned a risk tier (T1-T4). 1LoD proposes based on business context; 2LoD validates independently. Tier drives all subsequent governance requirements. Output: approved tier assignment per agent-task combination.'},
  {id:'M3',label:'Capability Validation',color:'#f7b731',
   lod1:'Provide test cases; support validation testing',
   lod2:'Independent testing of each capability; conceptual soundness review',
   secops:'Adversarial testing: prompt injection, scope escalation, jailbreak attempts',
   detail:'Each capability is validated independently before deployment. 2LoD tests conceptual soundness, outcome accuracy, and constraint enforcement. SecOps runs adversarial tests. Output: validation opinion per capability.'},
  {id:'M4',label:'Trajectory Registry',color:'#00b894',
   lod1:'Define approved trajectory templates for each use case',
   lod2:'Review trajectory constraints; validate runtime monitor logic',
   secops:'Review for adversarial trajectory patterns',
   detail:'The novel MRM step for agentic AI. Approved trajectory templates are registered; runtime monitor constraint logic is validated. 2LoD reviews that trajectory-level governance covers emergent risks not visible at capability level. Output: approved trajectory registry.'},
  {id:'M5',label:'Deployment Approval',color:'#ff9f43',
   lod1:'Production readiness sign-off; runbook complete',
   lod2:'Formal deployment approval; conditions documented',
   secops:'Security deployment review; incident response plan confirmed',
   detail:'Formal gate before production. Requires sign-off from all three lines. T3/T4 agents may require regulatory notification at this step. Deployment approval is conditional and time-limited (typically 12 months before re-validation required). Output: signed deployment approval.'},
  {id:'M6',label:'Ongoing Monitoring',color:'#a29bfe',
   lod1:'Daily operational monitoring; escalate anomalies',
   lod2:'Monthly evidence review; quarterly performance sampling',
   secops:'Continuous threat detection; anomalous pattern alerting',
   detail:'Production monitoring is continuous for T3/T4 and periodic for T1/T2. Four metric tracks: performance drift, trajectory anomalies, constraint violation rates, evidence completeness. Breach of drift thresholds triggers Step 7. Output: monitoring dashboard and monthly reports.'},
  {id:'M7',label:'Revalidation & Change',color:'#e11844',
   lod1:'Document changes; request re-validation; manage transition',
   lod2:'Scope re-validation; proportional to change magnitude',
   secops:'Regression security testing; confirm no new attack surface',
   detail:'All material changes (model updates, new capabilities, constraint changes) trigger proportional re-validation. Minor changes (tool version patch) require incremental review; major changes (new capability type) require full Step 3-5 re-run. Output: updated validation opinion.'}
];

var USE_CASES=[
  {id:'U1',label:'Credit Memo Agent',color:'#0ea5e9',
   caps:[true,true,true,true],
   capAuth:['Borrower data, market rates','Financial ratios, risk scores','Draft memo','File to loan system'],
   detail:'Uses all four capability types. C4 (file to system) requires human review token from Step 4. Tier T3 for large corporate loans; T2 for retail. Shares C1 data query validation with U2 and U3.'},
  {id:'U2',label:'Trading Surveillance',color:'#6c5ce7',
   caps:[true,true,false,true],
   capAuth:['Trade data, order books','Anomaly scores, pattern match',null,'Escalate alert, freeze account'],
   detail:'No C3 (generation) &mdash; surveillance decisions are structured outputs, not free text. C4 (freeze account) is T4 with dual authorization. Reuses C1 and C2 from credit memo validation with incremental scope review.'},
  {id:'U3',label:'Regulatory Filing',color:'#f7b731',
   caps:[true,true,true,true],
   capAuth:['Regulatory data pulls','Computation of required metrics','Draft filing text','Submit to regulator'],
   detail:'Highest regulatory exposure. C4 (submit to regulator) is irrevocable &mdash; requires dual authorization and pre-submission 2LoD review. All four capabilities reused from other agents; only the trajectory template and C4 authorization scope are new.'}
];

var LIMITATIONS=[
  {id:'L1',cat:'taxonomy',color:'#f7b731',label:'Memory Gap',
   short:'C1-C4 misses persistent agent memory',
   detail:'Agents that update their own context between sessions or modify their own instructions do not fit into C1-C4. A memory write is not a data query, computation, generation, or external execution. Persistent agents are ungoverneable under this taxonomy.',
   question:'Where in C1-C4 does a persistent agent inter-session memory write belong? If none, the taxonomy is not exhaustive.'},
  {id:'L2',cat:'taxonomy',color:'#f7b731',label:'Inter-Agent Trust',
   short:'No trust boundary between Agent A and Agent B',
   detail:'When Agent B receives output from Agent A, the runtime monitor must classify it as either C1 (trusted data) or C3 (generated content requiring verification). If C1, internal errors from Agent A propagate as verified facts. If C3, Agent B must re-verify the entire evidence chain from Agent A, collapsing the efficiency argument. The paper specifies neither.',
   question:'When Agent B receives output from Agent A, which capability type governs that input? If C1, how are errors from Agent A detected? If C3, how does capability reuse remain efficient?'},
  {id:'L3',cat:'logic',color:'#ff6b6b',label:'T4 Contradiction',
   short:'T4 autonomy incompatible with C4 dual authorization',
   detail:'T4 agents operate at millisecond timescales (HFT, real-time AML). The framework simultaneously requires dual human authorization for irrevocable C4 actions. No T4 use case can satisfy both requirements. The framework includes T4 but cannot govern it.',
   question:'Name one T4 use case where dual human authorization for C4 is operationally compatible with millisecond latency requirements.'},
  {id:'L4',cat:'logic',color:'#ff6b6b',label:'Reversibility Binary',
   short:'Reversibility is time-dependent, not binary',
   detail:'A payment instruction is reversible for minutes, then irrevocable once the counterparty acts. The framework treats reversibility as a static property set at tier assignment. It has no mechanism to handle an action that begins as reversible and becomes irrevocable due to external state changes during execution.',
   question:'At what point in time is reversibility assessed for tier assignment? How does the runtime monitor handle a trajectory that starts as T2-reversible and becomes T3-irreversible mid-execution?'},
  {id:'L5',cat:'logic',color:'#ff6b6b',label:'Static Tier Assignment',
   short:'Tier checked at start; risk can escalate mid-trajectory',
   detail:'The runtime monitor assigns tier at trajectory start based on task context. A routine C1 query may return data mid-trajectory that materially changes the risk profile &mdash; a sanctioned counterparty, a regulatory breach, an exposure limit violation. The tier-appropriate controls are not applied retroactively.',
   question:'How does the runtime monitor handle dynamic risk escalation discovered during execution? Does the trajectory inherit the new tier retroactively, halt and restart, or continue under the original tier?'},
  {id:'L6',cat:'sr117',color:'#e11844',label:'Conceptual Soundness',
   short:'SR 11-7 conceptual soundness is unevaluable for LLMs',
   detail:'SR 11-7 requires validators to establish that the model methodology is theoretically grounded and assumptions are justified. For a statistical model this means reviewing mathematical logic. For a 70B-parameter LLM, no such assessment is possible by current means. The paper claims SR 11-7 alignment without resolving this fundamental incompatibility.',
   question:'How would a 2LoD validator establish conceptual soundness for an LLM agent under SR 11-7? Has any regulator accepted such an assessment? If not, on what basis is SR 11-7 alignment claimed?'},
  {id:'L7',cat:'sr117',color:'#e11844',label:'Model Boundary',
   short:'SR 11-7 monitoring requires a defined model; agents have none',
   detail:'SR 11-7 requires ongoing monitoring relative to a validated baseline. An agentic system includes base model weights, fine-tuning, system prompt, tool definitions, and retrieval corpus &mdash; each updated on different schedules by different teams. The paper does not define which components constitute the model for SR 11-7 purposes, nor which changes trigger full re-validation.',
   question:'Which components of an agentic system constitute the model for SR 11-7 monitoring? Does a system prompt change trigger a full M7 re-validation? A tool version patch? The paper does not specify.'},
  {id:'L8',cat:'sr117',color:'#e11844',label:'C3 Advisory Authority',
   short:'Advisory outputs carry institutional weight in finance',
   detail:'The framework frames C3 (Generation) as low-risk because outputs are advisory. But in financial services, analyst recommendations carry institutional authority &mdash; an employee who ignores a system recommendation must document the override. The effective executability of C3 outputs in high-trust organizations is not governed by the framework.',
   question:'How does the framework govern the downstream harm from a C3 output that a human follows uncritically? NIST AI RMF MAP-5 identifies this as societal-level risk. The paper does not.'},
  {id:'L9',cat:'scale',color:'#6c5ce7',label:'Independence Assumption',
   short:'Cost model assumes capabilities are independent',
   detail:'The 60-70% cost reduction claim assumes validating C1 in one context transfers to another. But new trajectories combining previously-validated capabilities create emergent risks absent in any individual capability. The paper does not specify whether novel combinations require full trajectory validation or only incremental review, and on what criterion.',
   question:'What validation is required for a new trajectory combining four previously-validated capabilities? If incremental, what is the formal criterion? If full, the cost reduction claim is overstated.'},
  {id:'L10',cat:'scale',color:'#6c5ce7',label:'Template Coverage',
   short:'Novel trajectories may not match any approved template',
   detail:'The Trajectory Registry stores approved templates. Financial agents by design handle novel instruction combinations. If a trajectory does not match a template, it either cannot run (breaking real-time operations) or runs under a default template (defeating governance). The paper does not address this coverage gap.',
   question:'What fraction of real production trajectories would match a pre-approved template exactly? How are non-matching trajectories governed without breaking real-time operations?'},
  {id:'L11',cat:'missing',color:'#00b894',label:'No GOVERN Layer',
   short:'Culture and board accountability entirely absent',
   detail:'The GOVERN function in NIST AI RMF covers board-level accountability, AI risk culture, organizational commitment, and workforce competency (GV-1 through GV-6). The MRM programme in this paper is entirely operational. Without a GOVERN-equivalent, the framework risks becoming a compliance checkbox exercise with no organizational mandate behind it.',
   question:'Which step in the 7-step MRM programme addresses board-level AI risk accountability and organizational culture? If none, how does the framework avoid becoming a purely technical compliance exercise?'},
  {id:'L12',cat:'missing',color:'#00b894',label:'GenAI Risk Gap',
   short:'NIST-AI-600-1 identifies 12 GenAI risks; paper addresses 1',
   detail:'NIST-AI-600-1 (GenAI Profile, July 2024) identifies 12 unique risks including CBRN content generation, data privacy violations, value chain integration risks, homogenization of outputs, and confabulation. The C3 capability in this paper only addresses hallucination detection via citation checks. The other 11 GenAI-specific risks are entirely outside the framework.',
   question:'Which of the 12 GenAI-specific risks in NIST-AI-600-1 does the framework address? For those it does not, what is the proposed governance mechanism?'},
  {id:'L13',cat:'missing',color:'#00b894',label:'Unbounded Residual Risk',
   short:'Framework reduces risk but cannot bound it',
   detail:'The framework is a set of process controls, not a formal safety guarantee. A trajectory can satisfy every individual capability constraint and every trajectory template constraint while the sequence as a whole produces a materially harmful outcome through emergent behavior. No proof exists that the constraint system is sufficient to detect any materially harmful trajectory. The residual risk is unquantified.',
   question:'Can you prove, or empirically demonstrate, that the trajectory constraint system is sufficient to detect any materially harmful trajectory in a financial services context? If not, how should institutions account for the unquantified residual risk?'}
];

var selectedLimitation=0;
var activeLimCat='all';

var selectedCap=0;
var selectedTier=0;
var selectedStep=0;
var selectedUC=0;
var trajStep=-1;
var trajFailure=-1;
var trajRaf=null;

/* =========== CAPABILITY =========== */
function selectCap(i){
  selectedCap=i;
  [0,1,2,3].forEach(function(j){
    var b=document.getElementById('cap-btn-'+j);
    if(b)b.classList.toggle('active',j===i);
  });
  var c=CAPABILITIES[i];
  var detail=document.getElementById('cap-detail');
  if(detail){
    detail.innerHTML='<strong>'+c.id+' &mdash; '+c.label+'</strong><br>'
      +'<span style="color:#38bdf8">Authority:</span> '+c.authority+'<br>'
      +'<span style="color:#a29bfe">Constraints:</span> '+c.constraints+'<br>'
      +'<span style="color:#00b894">Evidence:</span> '+c.evidence+'<br>'
      +'<span style="color:#ff6b6b">Failures:</span> '+c.failures.join('; ');
  }
  if(typeof drawCapability==='function')drawCapability();
}

/* =========== TRAJECTORY =========== */
function trajPlay(){
  trajFailure=-1;
  document.querySelectorAll('.traj-fail-btn').forEach(function(b){b.classList.remove('active');});
  trajStep=0;
  runTrajStep();
}
function runTrajStep(){
  if(typeof drawTrajectory==='function')drawTrajectory();
  if(trajStep<TRAJ_STATES.length-1){
    trajRaf=setTimeout(function(){
      trajStep++;
      runTrajStep();
    },700);
  } else {
    updateTrajDetail();
  }
}
function trajReset(){
  if(trajRaf){clearTimeout(trajRaf);trajRaf=null;}
  trajStep=-1;
  trajFailure=-1;
  document.querySelectorAll('.traj-fail-btn').forEach(function(b){b.classList.remove('active');});
  if(typeof drawTrajectory==='function')drawTrajectory();
  var d=document.getElementById('traj-detail');
  if(d)d.innerHTML='<strong>Click Play</strong> to animate the credit memo trajectory. Each step lights up as the agent completes it. Inject a failure to see the guardrail block and audit record.';
}
function injectFailure(i){
  if(trajRaf){clearTimeout(trajRaf);trajRaf=null;}
  trajFailure=i;
  trajStep=FAILURE_MODES[i].step;
  document.querySelectorAll('.traj-fail-btn').forEach(function(b,j){b.classList.toggle('active',j===i);});
  if(typeof drawTrajectory==='function')drawTrajectory();
  var f=FAILURE_MODES[i];
  var d=document.getElementById('traj-detail');
  if(d)d.innerHTML='<strong style="color:#ff6b6b">FAILURE INJECTED at step '+trajStep+'</strong><br>'
    +'<span style="color:#ff6b6b">Without governance:</span> '+f.naive+'<br>'
    +'<span style="color:#51cf66">With runtime monitor:</span> '+f.guard;
}
function updateTrajDetail(){
  var d=document.getElementById('traj-detail');
  if(d)d.innerHTML='<strong style="color:#51cf66">Trajectory complete.</strong> All 6 steps passed governance checks. Audit trail: 5 capability invocations, 1 human review token, 1 C4 authorization. Filed to loan system.';
}

/* =========== TIER =========== */
function selectTier(i){
  selectedTier=i;
  var t=RISK_TIERS[i];
  var d=document.getElementById('tier-detail');
  if(d){
    var dims=t.dims;
    d.innerHTML='<strong style="color:'+t.color+'">'+t.id+' &mdash; '+t.label+'</strong><br>'
      +'Autonomy: '+dims.autonomy+' | Materiality: '+dims.materiality+' | Reversible: '+dims.reversible+'<br>'
      +'Controls: '+t.controls.join('; ')+'<br>'
      +'Examples: '+t.examples.join(', ')+'<br><br>'
      +t.detail;
  }
  if(typeof drawTierMatrix==='function')drawTierMatrix();
}

/* =========== MRM =========== */
function selectStep(i){
  selectedStep=i;
  var s=MRM_STEPS[i];
  var d=document.getElementById('mrm-detail');
  if(d){
    d.innerHTML='<strong style="color:'+s.color+'">'+s.id+' &mdash; '+s.label+'</strong><br>'
      +'<span class="lod-pill lod-1">1LoD</span> '+s.lod1+'<br>'
      +'<span class="lod-pill lod-2">2LoD</span> '+s.lod2+'<br>'
      +'<span class="lod-pill lod-sec">SecOps</span> '+s.secops+'<br><br>'
      +s.detail;
  }
  if(typeof drawMRMPipeline==='function')drawMRMPipeline();
}

/* =========== USE CASES =========== */
function selectUC(i){
  selectedUC=i;
  var u=USE_CASES[i];
  var d=document.getElementById('uc-detail');
  if(d){
    var capLabels=['C1 Data Query','C2 Computation','C3 Generation','C4 Execution'];
    var used=capLabels.filter(function(_,j){return u.caps[j];});
    d.innerHTML='<strong style="color:'+u.color+'">'+u.id+' &mdash; '+u.label+'</strong><br>'
      +'Capabilities used: '+used.join(', ')+'<br><br>'+u.detail;
  }
  if(typeof drawUsecaseReuse==='function')drawUsecaseReuse();
}

/* =========== LIMITATIONS =========== */
function filterLim(cat){
  activeLimCat=cat;
  ['all','taxonomy','logic','sr117','scale','missing'].forEach(function(c){
    var b=document.getElementById('lcat-btn-'+c);
    if(b)b.classList.toggle('active',c===cat);
  });
  if(typeof drawLimitations==='function')drawLimitations();
  renderLimAccordions();
}
function selectLimitation(i){
  selectedLimitation=i;
  var lim=LIMITATIONS[i];
  var d=document.getElementById('lim-detail');
  if(d){
    var catNames={taxonomy:'Taxonomy Gap',logic:'Framework Logic',sr117:'SR 11-7 Alignment',scale:'Scalability Claim',missing:'Missing Layer'};
    d.innerHTML='<strong style="color:'+lim.color+'">'+lim.id+' &mdash; '+lim.label+'</strong>'
      +' <span style="font-size:10px;color:'+lim.color+'66;font-weight:700;text-transform:uppercase;letter-spacing:.6px;">['+catNames[lim.cat]+']</span><br><br>'
      +lim.detail+'<br><br>'
      +'<span style="color:#8b949e;font-size:11px;font-style:italic;">Question the authors cannot answer: </span>'
      +'<span style="color:#f7b731;font-size:11px;">'+lim.question+'</span>';
  }
  if(typeof drawLimitations==='function')drawLimitations();
}
function renderLimAccordions(){
  var container=document.getElementById('lim-accordions');
  if(!container)return;
  var filtered=activeLimCat==='all'?LIMITATIONS:LIMITATIONS.filter(function(l){return l.cat===activeLimCat;});
  var catNames={taxonomy:'Taxonomy Gap',logic:'Framework Logic',sr117:'SR 11-7 Alignment',scale:'Scalability Claim',missing:'Missing Layer'};
  container.innerHTML='';
  filtered.forEach(function(lim){
    var div=document.createElement('div');
    div.className='accordion-item';
    div.style.borderColor=lim.color+'44';
    div.innerHTML='<div class="accordion-header" onclick="toggleAcc(this)" style="border-left:3px solid '+lim.color+';">'
      +'<span><strong style="color:'+lim.color+'">'+lim.id+'</strong> &nbsp; '+lim.label
      +' <span style="font-size:9px;color:'+lim.color+'88;margin-left:6px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;">['+catNames[lim.cat]+']</span>'
      +'</span><span class="accordion-chevron">&#9660;</span></div>'
      +'<div class="accordion-body">'
      +'<p style="margin-bottom:10px;">'+lim.detail+'</p>'
      +'<div style="background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:10px 14px;font-size:11px;">'
      +'<span style="color:#8b949e;font-weight:600;">Question the authors cannot answer from the paper:</span><br>'
      +'<span style="color:#f7b731;">'+lim.question+'</span></div></div>';
    container.appendChild(div);
  });
}

/* =========== INIT =========== */
function doInit(){
  if(typeof drawGuardrailCompare==='function'){
    drawGuardrailCompare();
    setInterval(drawGuardrailCompare,50);
  }
  if(typeof drawLimitations==='function')drawLimitations();
  selectCap(0);
  trajReset();
  selectTier(0);
  selectStep(0);
  selectUC(0);
  renderLimAccordions();
  selectLimitation(0);
  updateNavOnScroll();
}

if(localStorage.getItem(PG_KEY)==='1'){
  window.addEventListener('load',doInit);
}
</script>
</body>
</html>`;

fs.writeFileSync('./index.html', html, 'utf8');
console.log('build1 done:', html.length, 'bytes', html.split('\n').length, 'lines');
