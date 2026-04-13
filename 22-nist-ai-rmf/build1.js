const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>NIST AI Risk Management Framework</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#c9d1d9;--muted:#8b949e;
  --accent:#6c5ce7;--accent2:#a29bfe;--accent3:#d6d0ff;
  --rmf:#6c5ce7;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.6;display:flex;}
a{text-decoration:none;color:inherit;}
.sidebar{width:240px;min-width:240px;height:100vh;position:sticky;top:0;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;padding:0 0 40px;flex-shrink:0;}
.sidebar-logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);}
.sidebar-logo-title{font-size:13px;font-weight:700;color:var(--accent2);}
.sidebar-logo-sub{font-size:10px;color:var(--muted);margin-top:2px;}
.nav-group-title{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;padding:10px 16px 4px;}
.nav-link{display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;color:var(--muted);cursor:pointer;transition:all .15s;}
.nav-link:hover,.nav-link.active{color:var(--text);background:rgba(108,92,231,.08);}
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
.btn-tab.active{background:var(--accent);color:#fff;border-color:var(--accent);}
.btn-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;}
.formula{background:#0d1117;border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;color:#a29bfe;line-height:1.8;margin-bottom:16px;white-space:pre;}
.stats-row{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px;}
.stat{text-align:center;}
.stat-val{font-size:28px;font-weight:800;color:var(--accent2);}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;}
.section-bridge{margin-top:48px;padding-top:28px;border-top:1px solid var(--border);text-align:right;}
.section-bridge-link{font-size:12px;color:var(--accent2);font-weight:600;border:1px solid var(--accent2);border-radius:6px;padding:6px 14px;transition:all .15s;}
.section-bridge-link:hover{background:rgba(108,92,231,.1);}
.accordion-item{border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden;}
.accordion-header{padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;background:var(--surface);}
.accordion-header:hover{background:#1c2128;}
.accordion-chevron{transition:transform .2s;font-size:10px;color:var(--muted);}
.accordion-body{padding:14px 16px;font-size:12px;color:var(--muted);display:none;border-top:1px solid var(--border);}
#pg-gate{position:fixed;inset:0;background:linear-gradient(135deg,#0d1117 0%,#161b22 50%,#0d1117 100%);z-index:9999;display:flex;align-items:center;justify-content:center;}
.pg-box{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px 48px;max-width:440px;width:100%;text-align:center;box-shadow:0 0 40px rgba(108,92,231,.12);}
.pg-icon{font-size:2.5rem;margin-bottom:16px;}
.pg-title{font-size:1.3rem;font-weight:800;color:#c9d1d9;margin-bottom:6px;}
.pg-subtitle{font-size:13px;font-weight:600;color:#a29bfe;margin-bottom:6px;}
.pg-sub{font-size:11px;color:#8b949e;margin-bottom:24px;}
.pg-input{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px 14px;color:#c9d1d9;font-size:14px;outline:none;text-align:center;}
.pg-input:focus{border-color:#6c5ce7;}
.pg-btn{margin-top:12px;width:100%;background:linear-gradient(135deg,#6c5ce7,#4a3ab5);color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600;cursor:pointer;}
.pg-err{color:#ff6b6b;font-size:11px;margin-top:8px;min-height:16px;}
.pg-join{margin-top:16px;font-size:11px;color:#8b949e;}
.pg-join a{color:#a29bfe;text-decoration:underline;}
.highlight-box{border-left:3px solid var(--accent);padding:12px 16px;background:rgba(108,92,231,.06);border-radius:0 8px 8px 0;margin-bottom:16px;font-size:13px;color:var(--muted);}
.highlight-box.amber{border-color:#f7b731;background:rgba(247,183,49,.06);}
.highlight-box.green{border-color:#51cf66;background:rgba(81,207,102,.06);}
.highlight-box.red{border-color:#ff6b6b;background:rgba(255,107,107,.06);}
.highlight-box.teal{border-color:#00b894;background:rgba(0,184,148,.06);}
.info-panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-top:12px;font-size:13px;color:var(--muted);min-height:80px;}
.info-panel strong{color:var(--text);}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-right:4px;}
.badge-purple{background:rgba(108,92,231,.2);color:#a29bfe;}
.badge-blue{background:rgba(9,132,227,.2);color:#74b9ff;}
.badge-amber{background:rgba(247,183,49,.2);color:#f7b731;}
.badge-green{background:rgba(81,207,102,.2);color:#51cf66;}
.badge-red{background:rgba(255,107,107,.2);color:#ff6b6b;}
.badge-teal{background:rgba(0,184,148,.2);color:#00b894;}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;background:var(--border);border-radius:4px;outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;}
.slider-row{display:flex;gap:12px;align-items:center;margin-bottom:12px;}
.slider-lbl{font-size:11px;color:var(--muted);min-width:120px;}
.slider-val{font-size:12px;font-weight:700;color:var(--accent2);min-width:40px;}
#scroll-progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9998;transition:width .1s;}
.func-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:5px;font-size:10px;font-weight:700;margin:2px;}
</style>
</head>
<body>

<div id="pg-gate">
  <div class="pg-box">
    <div class="pg-icon">&#9878;</div>
    <div class="pg-title">NIST AI Risk Management Framework</div>
    <div class="pg-subtitle">GOVERN &middot; MAP &middot; MEASURE &middot; MANAGE</div>
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
    <div class="sidebar-logo-sub">Post 22 &middot; NIST AI RMF</div>
  </div>

  <div class="nav-group-title">The Framework</div>
  <div class="nav-link" data-sec="s-overview" onclick="setActive(this,'s-overview')">
    <span class="dot" style="background:#6c5ce7"></span>What Is AI RMF?</div>
  <div class="nav-link" data-sec="s-trustworthy" onclick="setActive(this,'s-trustworthy')">
    <span class="dot" style="background:#00b894"></span>7 Characteristics</div>

  <div class="nav-group-title">The Four Functions</div>
  <div class="nav-link" data-sec="s-govern" onclick="setActive(this,'s-govern')">
    <span class="dot" style="background:#0984e3"></span>GOVERN</div>
  <div class="nav-link" data-sec="s-map" onclick="setActive(this,'s-map')">
    <span class="dot" style="background:#f7b731"></span>MAP</div>
  <div class="nav-link" data-sec="s-measure" onclick="setActive(this,'s-measure')">
    <span class="dot" style="background:#ff6b6b"></span>MEASURE</div>
  <div class="nav-link" data-sec="s-manage" onclick="setActive(this,'s-manage')">
    <span class="dot" style="background:#51cf66"></span>MANAGE</div>

  <div class="nav-group-title">In Practice</div>
  <div class="nav-link" data-sec="s-lifecycle" onclick="setActive(this,'s-lifecycle')">
    <span class="dot" style="background:#6c5ce7"></span>AI Lifecycle</div>
</nav>

<!-- MAIN -->
<div class="main" id="main-scroll">
<div class="pipeline-map">
  <div class="pipe-step"><span class="pipe-dot" style="background:#6c5ce7"></span>Overview</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#00b894"></span>Trust</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#0984e3"></span>GOVERN</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#f7b731"></span>MAP</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#ff6b6b"></span>MEASURE</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#51cf66"></span>MANAGE</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#6c5ce7"></span>Lifecycle</div>
</div>

<!-- ====== S1: OVERVIEW ====== -->
<section class="section" id="s-overview">
  <div class="section-tag" style="color:#6c5ce7">The Framework &middot; ~12 min read</div>
  <h1 class="section-title">NIST AI RMF: A Common Language for AI Risk</h1>
  <p class="section-sub">Most organizations deploying AI have no structured way to think about its risks. The NIST AI Risk Management Framework — developed with 240+ organizations — gives them a shared vocabulary, four core functions, and 72 subcategories to identify, assess, and manage AI risks at every stage of the lifecycle.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#6c5ce7">240+</div><div class="stat-lbl">contributing orgs</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">4</div><div class="stat-lbl">core functions</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">72</div><div class="stat-lbl">subcategories</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">Jan 2023</div><div class="stat-lbl">v1.0 released</div></div>
  </div>

  <canvas id="canvas-rmf-wheel" width="700" height="360" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="function-detail">
    <strong>Click any function</strong> in the diagram to learn what it covers.
  </div>

  <div class="highlight-box" style="margin-top:16px;">
    <strong>GOVERN is not just one of four functions &mdash; it wraps all the others.</strong> Without organizational culture, policies, and accountability, MAP, MEASURE, and MANAGE are activities without ownership. This is the key architectural insight of the AI RMF.
  </div>

  <canvas id="canvas-rmf-timeline" width="700" height="130" style="margin-top:24px;margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="timeline-detail">Click a milestone node to see what changed at each stage of the framework's development.</div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#6c5ce7">Why Voluntary?</div>
      <div class="card-body">The AI RMF is intentionally not regulation. NIST designed it to be flexible enough for organizations of any size, sector, or risk tolerance. Being voluntary means it can be adopted incrementally — start with one function, then expand. It complements (rather than replaces) existing risk frameworks like NIST CSF or ISO 31000.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">Who Uses It?</div>
      <div class="card-body">Government agencies, healthcare systems, financial institutions, tech companies, and critical infrastructure operators. Any organization that develops, deploys, or procures AI systems. The framework is designed for all AI actors: developers, deployers, evaluators, and affected communities.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">How It Differs from Regulation</div>
      <div class="card-body">Regulation tells you what you must do. The AI RMF tells you how to think about what you should do. It provides structure for risk conversations rather than compliance checklists. The EU AI Act and US Executive Order on AI both reference it as a baseline for responsible AI practice.</div>
    </div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-trustworthy">7 Characteristics &rarr;</a>
  </div>
</section>

<!-- ====== S2: TRUSTWORTHY ====== -->
<section class="section" id="s-trustworthy">
  <div class="section-tag" style="color:#00b894">Trustworthy AI</div>
  <h2 class="section-title">7 Characteristics Every Trustworthy AI System Needs</h2>
  <p class="section-sub">Trustworthiness is the foundation. NIST defines 7 characteristics that trustworthy AI systems must exhibit simultaneously &mdash; not sequentially. They guide risk identification across all four functions and define what &ldquo;good&rdquo; looks like for an AI system.</p>

  <canvas id="canvas-trust-wheel" width="700" height="340" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="trust-detail">
    <strong>Click a spoke</strong> to expand it and see the full NIST definition with a real-world example.
  </div>

  <div class="highlight-box teal" style="margin-top:16px;">
    <strong>These 7 characteristics are simultaneous design requirements &mdash; not a checklist to complete in order.</strong> A system that is safe but not fair, reliable but not explainable, or accurate but not privacy-enhanced is not fully trustworthy by NIST standards.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Accountable &amp; Transparent <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Organizations and individuals responsible for AI systems are answerable for outcomes and decisions. Transparency means stakeholders can access meaningful information about the system &mdash; its purpose, design, data, and limitations. Example: a hiring AI that discloses its decision criteria to candidates and HR.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Explainable &amp; Interpretable <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Explainable AI can provide reasons for its outputs in human-understandable terms. Interpretable AI allows users to understand, appropriately trust, and effectively manage the system. Example: a loan decision model that outputs &ldquo;declined because debt-to-income ratio exceeds threshold.&rdquo;</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Privacy-Enhanced <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">AI systems should incorporate privacy protections by design &mdash; data minimization, purpose limitation, anonymization. This includes not just legal compliance (GDPR, HIPAA) but proactive respect for individuals' autonomy over their data. Example: a medical AI trained on federated data that never centralizes patient records.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Reliable <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Reliable AI performs consistently and as expected across contexts and over time. This includes accuracy, precision, and stability. Reliability failures are often subtle &mdash; a model that works well in testing but degrades under distribution shift in production is unreliable. Example: a fraud detection model that maintains performance as transaction patterns evolve.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Safe <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Safe AI systems do not cause unintended physical, psychological, financial, or societal harm. Safety goes beyond preventing failures &mdash; it includes considering how the system could be misused or cause harm when used correctly. Example: a clinical decision support AI that flags its own uncertainty rather than producing confident wrong answers.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Secure &amp; Resilient <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Secure AI systems resist adversarial attacks (data poisoning, model inversion, prompt injection). Resilient systems maintain core functionality under stress or attack and recover gracefully from failures. Example: a content moderation system that remains effective even when adversaries attempt to evade detection.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Fair with Bias Managed <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">AI systems should treat individuals and groups equitably. This requires actively identifying, measuring, and mitigating harmful biases in data, models, and outputs. Fairness is multi-dimensional &mdash; equal accuracy across groups, equal error rates, equal opportunity &mdash; and trade-offs must be made explicitly. Example: a recidivism prediction model audited for equal false positive rates across demographic groups.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-govern">GOVERN &rarr;</a>
  </div>
</section>

<!-- ====== S3: GOVERN ====== -->
<section class="section" id="s-govern">
  <div class="section-tag" style="color:#0984e3">Function 1: GOVERN</div>
  <h2 class="section-title">GOVERN: Set the Culture Before You Set the Tools</h2>
  <p class="section-sub">GOVERN is the foundation layer. It establishes the organizational culture, policies, accountability structures, roles, and processes that make AI risk management actually happen. Without GOVERN, MAP, MEASURE, and MANAGE are activities without ownership &mdash; isolated audits with no organizational backing.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#0984e3">6</div><div class="stat-lbl">categories</div></div>
    <div class="stat"><div class="stat-val" style="color:#6c5ce7">~20</div><div class="stat-lbl">subcategories</div></div>
    <div class="stat"><div class="stat-val" style="color:#a29bfe">Entire Org</div><div class="stat-lbl">scope</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">Wraps All</div><div class="stat-lbl">other functions</div></div>
  </div>

  <canvas id="canvas-govern-org" width="700" height="300" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="govern-detail">
    <strong>Hover a node</strong> to see what each GOVERN category covers and example actions organizations take.
  </div>

  <div class="formula">GOVERN categories:
G1 &mdash; Policies, processes, and practices across the organization related to AI risk
G2 &mdash; Accountability: roles, responsibilities, and authorities are defined
G3 &mdash; Workforce diversity, equity, inclusion, and AI risk competencies
G4 &mdash; Organizational teams are committed to risk management practices
G5 &mdash; Policies managing AI risk are defined and communicated
G6 &mdash; Policies for AI risk in human oversight are maintained</div>

  <div class="grid2" style="margin-top:4px;">
    <div class="card">
      <div class="card-title" style="color:#0984e3">What GOVERN Is Not</div>
      <div class="card-body">GOVERN is not a compliance checkbox. It's not about writing a policy document and filing it away. It's about building a living culture where risk questions are asked at every AI decision: Who is accountable if this fails? What are the acceptable risk levels? Who has the authority to pause or stop this system? These must be answered before deployment, not after an incident.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#6c5ce7">Who Owns GOVERN?</div>
      <div class="card-body">Everyone &mdash; but with clear accountability. C-suite and board: set risk appetite and resource commitment. Legal and compliance: translate risk appetite into policy. AI development teams: implement governance requirements in practice. HR and workforce: ensure staff have the skills to recognize and escalate AI risks. GOVERN fails when it's owned by one team in isolation.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is a risk culture? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">A risk culture is the set of shared values, beliefs, and norms that determine how an organization identifies, discusses, and responds to risk. In AI, a healthy risk culture means teams proactively surface concerns rather than suppress them, failures are investigated not hidden, and risk trade-offs are made explicitly with documented rationale. GOVERN G1 and G4 directly address building this culture.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Who is accountable when AI fails? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">GOVERN G2 requires that accountability is defined before deployment. This includes: who owns the AI system's outcomes (the deployer, not just the developer), who monitors it in production, who has authority to pause or shut it down, and who communicates to affected parties if harm occurs. The absence of clear accountability is itself a governance failure.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does GOVERN connect to MANAGE? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">GOVERN sets the authority and policies that MANAGE uses to act. When MEASURE identifies that a system has drifted outside acceptable fairness bounds, MANAGE needs GOVERN's pre-established authority structure to decide: who escalates this, who decides to retrain or roll back, who communicates to users? Without GOVERN, MANAGE can identify the problem but has no institutional mechanism to respond.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-map">MAP &rarr;</a>
  </div>
</section>

<!-- ====== S4: MAP ====== -->
<section class="section" id="s-map">
  <div class="section-tag" style="color:#f7b731">Function 2: MAP</div>
  <h2 class="section-title">MAP: Understand What Could Go Wrong</h2>
  <p class="section-sub">Before measuring or managing risk, you must identify it. MAP establishes context &mdash; what the AI system is, who it affects, what benefits it provides, and what risks it introduces. MAP outputs the risk register that MEASURE and MANAGE act on.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#f7b731">5</div><div class="stat-lbl">categories</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">Context</div><div class="stat-lbl">step 1</div></div>
    <div class="stat"><div class="stat-val" style="color:#ff6b6b">Risks</div><div class="stat-lbl">step 3</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">Impact</div><div class="stat-lbl">step 5</div></div>
  </div>

  <canvas id="canvas-map-pipeline" width="700" height="280" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="map-detail">
    <strong>Click a step</strong> in the MAP pipeline to see what questions to ask at each stage.
  </div>

  <h3 style="font-size:15px;font-weight:700;color:var(--text);margin:28px 0 12px;">Risk Register: Plot Risks by Likelihood &times; Impact</h3>
  <p style="font-size:13px;color:var(--muted);margin-bottom:16px;max-width:680px;">MAP produces a risk register &mdash; a catalogue of identified AI risks placed by likelihood and impact. Click any risk to see its details and which MAP category covers it.</p>
  <canvas id="canvas-risk-register" width="700" height="240" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="risk-detail">Click a risk dot to see its name, category, likelihood, and impact.</div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#f7b731">Intended vs Unintended Use</div>
      <div class="card-body">MAP 1 requires documenting both. A medical AI intended to assist radiologists may be unintentionally used as a replacement for radiologists in under-resourced settings. The unintended use case has different risk profiles &mdash; and must be mapped even if the deployer doesn't plan for it, because users will find it.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">AI Actors and Stakeholders</div>
      <div class="card-body">MAP identifies all parties: developers, operators, deployers, users, affected individuals, and society. Each actor has different risk exposure and different obligations. A facial recognition system deployed by police affects citizens who never interact with it directly &mdash; they are stakeholders that MAP 5 requires you to consider.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#ff6b6b">Cataloguing AI Risks</div>
      <div class="card-body">MAP 3 covers risks across two dimensions: technical (model failures, data quality, adversarial attacks) and societal (bias, privacy, labor displacement, concentration of power). Both must be mapped. A system with zero technical failures can still cause profound harm through systematic unfairness.</div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is &ldquo;context&rdquo; in MAP? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Context in MAP means: what problem does this AI system solve? Who built it, for whom, under what constraints? What data does it use? In what environment will it operate? Who will use it and who will be affected? Answering these questions (MAP 1) is the prerequisite for all subsequent risk identification. Without context, you can't know what risks are plausible or significant.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How do you categorize AI harms? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">NIST categorizes AI harms along several dimensions: the type of harm (physical, psychological, financial, reputational, societal), the affected party (individual, group, organization, society, environment), the severity (minor, significant, catastrophic), and the reversibility (temporary, permanent). MAP 3 requires assessing risks across all these dimensions, not just the most obvious ones.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is a MAP 5 societal impact assessment? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">MAP 5 covers impacts beyond immediate users &mdash; to communities, society, and democratic institutions. This includes: effects on labor markets (job displacement), effects on power concentration (who controls this AI?), environmental impact (compute costs), and effects on civil liberties. This is often the hardest category to assess because the impacts are diffuse and long-term.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-measure">MEASURE &rarr;</a>
  </div>
</section>

<!-- ====== S5: MEASURE ====== -->
<section class="section" id="s-measure">
  <div class="section-tag" style="color:#ff6b6b">Function 3: MEASURE</div>
  <h2 class="section-title">MEASURE: Turn Risk Awareness Into Numbers</h2>
  <p class="section-sub">MEASURE takes the risks identified in MAP and asks: how bad are they, actually? It defines metrics, runs evaluations, sets up monitoring, and builds the feedback loops that keep measurements current. Good measurement is what separates &ldquo;we know it&rsquo;s risky&rdquo; from &ldquo;we know how risky it is.&rdquo;</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#ff6b6b">4</div><div class="stat-lbl">categories</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">Metrics</div><div class="stat-lbl">MS 1</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">Evaluation</div><div class="stat-lbl">MS 2</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">Feedback</div><div class="stat-lbl">MS 4</div></div>
  </div>

  <h3 style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:12px;">Interactive Risk Dashboard</h3>
  <p style="font-size:13px;color:var(--muted);margin-bottom:16px;max-width:680px;">Use the sliders to set measurement values for four AI trustworthiness dimensions. Watch the dashboard update live and see the composite score change.</p>

  <div class="grid4" style="margin-bottom:12px;">
    <div><div class="slider-lbl" style="font-size:10px;color:#74b9ff;font-weight:700;text-align:center;margin-bottom:4px;">Accuracy</div><input type="range" id="sl-accuracy" min="0" max="100" value="82" oninput="updateDashboard()"></div>
    <div><div class="slider-lbl" style="font-size:10px;color:#fd79a8;font-weight:700;text-align:center;margin-bottom:4px;">Fairness</div><input type="range" id="sl-fairness" min="0" max="100" value="61" oninput="updateDashboard()"></div>
    <div><div class="slider-lbl" style="font-size:10px;color:#f7b731;font-weight:700;text-align:center;margin-bottom:4px;">Robustness</div><input type="range" id="sl-robustness" min="0" max="100" value="74" oninput="updateDashboard()"></div>
    <div><div class="slider-lbl" style="font-size:10px;color:#00b894;font-weight:700;text-align:center;margin-bottom:4px;">Transparency</div><input type="range" id="sl-transparency" min="0" max="100" value="55" oninput="updateDashboard()"></div>
  </div>
  <canvas id="canvas-measure-dashboard" width="700" height="280" style="margin-bottom:12px;"></canvas>

  <canvas id="canvas-measure-loop" width="700" height="180" style="margin-top:20px;margin-bottom:12px;"></canvas>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How do you measure AI fairness? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Fairness is multi-dimensional and context-dependent. Common metrics include: demographic parity (equal selection rates across groups), equalized odds (equal true/false positive rates), and individual fairness (similar individuals treated similarly). MEASURE requires choosing the right metric for the deployment context &mdash; there is no universal fairness metric, and optimizing one often degrades another.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is robustness testing? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Robustness testing evaluates how AI performance degrades under challenging conditions: distribution shift (different data than training), adversarial inputs (crafted to fool the model), edge cases (rare but plausible scenarios), and noisy data. MEASURE 2 requires systematic robustness evaluation before deployment and periodic re-evaluation as the deployment environment evolves.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">MEASURE 3: why internal experts matter <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">MEASURE 3 covers internal expert review &mdash; specifically, red-teaming and adversarial testing by people who understand both the AI system and the deployment domain. External auditors are valuable but domain context matters. A healthcare AI risk evaluator needs both ML expertise and clinical knowledge to find meaningful failure modes. NIST recommends diverse expert teams including ethicists, domain experts, and affected community representatives.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-manage">MANAGE &rarr;</a>
  </div>
</section>

<!-- ====== S6: MANAGE ====== -->
<section class="section" id="s-manage">
  <div class="section-tag" style="color:#51cf66">Function 4: MANAGE</div>
  <h2 class="section-title">MANAGE: Turn Measurement Into Action</h2>
  <p class="section-sub">MANAGE closes the loop. It prioritizes risks from MEASURE, implements mitigation strategies, monitors ongoing operation, and handles residual risk. It includes the hard decision of whether to deploy, pause, or shut down an AI system entirely.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#51cf66">4</div><div class="stat-lbl">categories</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">MG1</div><div class="stat-lbl">Mitigate</div></div>
    <div class="stat"><div class="stat-val" style="color:#0984e3">MG2</div><div class="stat-lbl">Respond</div></div>
    <div class="stat"><div class="stat-val" style="color:#ff6b6b">MG3</div><div class="stat-lbl">Monitor</div></div>
  </div>

  <canvas id="canvas-manage-playbook" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="playbook-detail">Click a card to see example actions for each MANAGE category.</div>

  <h3 style="font-size:15px;font-weight:700;color:var(--text);margin:28px 0 12px;">Risk Response Options</h3>
  <p style="font-size:13px;color:var(--muted);margin-bottom:12px;max-width:680px;">Every identified risk requires a response decision. Hover each quadrant to understand when to use each strategy.</p>
  <canvas id="canvas-risk-response" width="700" height="200" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="response-detail">Hover a quadrant to see when to use each risk response strategy.</div>

  <div class="highlight-box green" style="margin-top:16px;">
    <strong>MANAGE explicitly includes the option to NOT deploy.</strong> If risk cannot be adequately mitigated to an acceptable level, the framework supports pausing or discontinuing an AI system. This decision requires the accountability structures established in GOVERN to be meaningful.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is residual risk? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Residual risk is the risk that remains after mitigation measures have been applied. No mitigation eliminates risk entirely &mdash; MANAGE MG4 requires explicitly tracking, documenting, and communicating residual risks to relevant stakeholders. Residual risk must be within the organization's accepted risk tolerance (defined in GOVERN) before a system can be deployed or continue operating.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does MANAGE connect to incident response? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">MANAGE MG2 and MG3 together define the incident response pathway. MG2 covers planned responses to anticipated risks. MG3 covers monitoring to detect when something unexpected happens. When monitoring (MG3) detects an incident, the response plan (MG2) is activated. This requires pre-established escalation paths, communication protocols, and rollback procedures &mdash; all of which are governed by GOVERN's accountability structures.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">When should you stop an AI system? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">MANAGE provides guidance: when monitored metrics indicate unacceptable performance degradation, when a new risk is identified that cannot be mitigated within acceptable timelines, when the deployment context has changed (new regulations, new stakeholder concerns, unexpected use patterns), or when an incident has caused harm. The key is that the decision criteria for stopping should be pre-defined in GOVERN &mdash; not improvised during a crisis.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-lifecycle">AI Lifecycle &rarr;</a>
  </div>
</section>

<!-- ====== S7: LIFECYCLE ====== -->
<section class="section" id="s-lifecycle">
  <div class="section-tag" style="color:#6c5ce7">In Practice</div>
  <h2 class="section-title">The AI Lifecycle: Where Does the RMF Apply?</h2>
  <p class="section-sub">The AI RMF is not a one-time audit &mdash; it applies continuously across the entire AI lifecycle. Each phase has different risk profiles, different actors, and different RMF activities. Hover each stage to see which functions apply and what risks emerge.</p>

  <canvas id="canvas-lifecycle-map" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="lifecycle-detail">Hover a lifecycle stage to see which RMF functions apply, who is responsible, and the key risks at that phase.</div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#6c5ce7">GenAI Profile Highlights</div>
      <div class="card-body">The Generative AI Profile (NIST-AI-600-1, July 2024) extends the core RMF with 12 unique GenAI risks: hallucination, prompt injection, data provenance, copyright concerns, CBRN information hazards, and more. It maps these risks to the same GOVERN/MAP/MEASURE/MANAGE structure, making it directly compatible with the core framework.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#00b894">How to Start</div>
      <div class="card-body">NIST recommends starting with GOVERN &mdash; establish accountability and risk appetite before building anything else. Then MAP one AI system: document its context, intended use, and top 5 risks. You don't need to implement all 72 subcategories immediately. The framework explicitly supports incremental adoption based on your organization's risk tolerance and resources.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">RMF vs Regulation</div>
      <div class="card-body">The EU AI Act and US Executive Order on AI both reference NIST AI RMF as a baseline. Organizations implementing the RMF are better positioned for regulatory compliance &mdash; but the frameworks are complementary, not equivalent. Regulation sets minimum requirements; the RMF provides the structure to exceed them systematically.</div>
    </div>
  </div>

  <div class="highlight-box" style="margin-top:16px;">
    <strong>The AI RMF is not a checklist &mdash; it&rsquo;s a conversation starter.</strong> A shared vocabulary that lets engineers, ethicists, lawyers, and executives talk about AI risk in the same language. That shared language is what makes AI governance actually work in practice.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does the Generative AI Profile differ from the core RMF? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The GenAI Profile (NIST-AI-600-1) adds 12 risks unique to generative AI systems: hallucination and fabrication, data privacy violations from training data, intellectual property and copyright issues, prompt injection and jailbreaking, homogenization of outputs, and potential for chemical/biological/radiological/nuclear (CBRN) harm. These risks don't map cleanly to traditional AI risk categories but use the same GOVERN/MAP/MEASURE/MANAGE structure.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Where do I start if my org is new to this? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Three concrete first steps: (1) GOVERN: name one person accountable for AI risk in your organization &mdash; even temporarily. (2) MAP: pick your highest-risk AI system and write a one-page context document: what it does, who it affects, top 3 risks. (3) MEASURE: define one measurable metric for each of those risks. This gets you the minimum viable implementation and reveals what else you need to build.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does the RMF align with the EU AI Act? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The EU AI Act uses a risk-based approach similar to the RMF: systems are categorized by risk level (unacceptable, high, limited, minimal). The RMF's MAP function aligns with the EU Act's risk categorization requirements. GOVERN aligns with the Act's conformity assessment and documentation requirements. MEASURE aligns with post-market monitoring obligations. NIST has published a crosswalk document mapping RMF categories to EU AI Act articles.</div>
  </div>

</section>

</div><!-- /main -->
<script>
var PG_PASSWORD='visual2025';
var PG_KEY='pg_unlocked_22';
function pgCheck(){
  var v=document.getElementById('pg-input').value.trim();
  if(v===PG_PASSWORD){localStorage.setItem(PG_KEY,'1');document.getElementById('pg-gate').style.display='none';}
  else{document.getElementById('pg-err').textContent='Incorrect password. Try again.';}
}
document.getElementById('pg-input').addEventListener('keydown',function(e){if(e.key==='Enter')pgCheck();});
if(localStorage.getItem(PG_KEY)==='1'){document.getElementById('pg-gate').style.display='none';}

var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle'];
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

// Dashboard slider update
function updateDashboard(){
  if(typeof drawMeasureDashboard==='function')drawMeasureDashboard();
}

// RMF function data
var RMF_FUNCTIONS=[
  {name:'GOVERN',color:'#0984e3',short:'G',
   desc:'Sets organizational culture, policies, roles, and accountability. GOVERN wraps all other functions \u2014 without it, risk management has no institutional backing.',
   cats:['G1: Policies & culture','G2: Accountability','G3: Workforce','G4: Team commitment','G5: Risk policies','G6: Human oversight']},
  {name:'MAP',color:'#f7b731',short:'M',
   desc:'Identifies and categorizes AI risks in context. Produces the risk register that MEASURE and MANAGE act on. Covers both technical and societal harms.',
   cats:['MAP1: Context','MAP2: Scientific knowledge','MAP3: AI risks & benefits','MAP4: Prioritize','MAP5: Societal impact']},
  {name:'MEASURE',color:'#ff6b6b',short:'MS',
   desc:'Quantifies identified risks using metrics, evaluations, and monitoring. Turns risk awareness into actionable numbers with continuous feedback loops.',
   cats:['MS1: Risk metrics defined','MS2: AI systems evaluated','MS3: Internal expert review','MS4: Feedback & improvement']},
  {name:'MANAGE',color:'#51cf66',short:'MG',
   desc:'Responds to and mitigates risks identified by MEASURE. Includes risk treatment decisions (accept, avoid, mitigate, transfer), incident response, and residual risk tracking.',
   cats:['MG1: Risk mitigation plans','MG2: Response strategies','MG3: Ongoing monitoring','MG4: Residual risk tracking']}
];

// Trustworthiness characteristics
var TRUST_CHARS=[
  {name:'Accountable\\n& Transparent',color:'#6c5ce7',desc:'Organizations are answerable for AI outcomes. Stakeholders can access meaningful information about system purpose, design, and limitations.',example:'A hiring AI that discloses its decision factors to candidates.'},
  {name:'Explainable\\n& Interpretable',color:'#0984e3',desc:'AI outputs can be explained in human-understandable terms. Users can understand, trust, and manage the system effectively.',example:'A loan model that outputs "declined: debt-to-income ratio too high."'},
  {name:'Privacy-\\nEnhanced',color:'#00b894',desc:'Privacy protections built in by design: data minimization, purpose limitation, anonymization. Beyond compliance \u2014 proactive respect for autonomy.',example:'A medical AI trained on federated data that never centralizes records.'},
  {name:'Reliable',color:'#51cf66',desc:'Consistent and expected performance across contexts and over time. Includes accuracy, precision, and stability under distribution shift.',example:'A fraud model that maintains performance as transaction patterns evolve.'},
  {name:'Safe',color:'#f7b731',desc:'Does not cause unintended physical, psychological, financial, or societal harm. Considers misuse scenarios, not just correct-use failures.',example:'A clinical AI that flags its own uncertainty rather than confident wrong answers.'},
  {name:'Secure\\n& Resilient',color:'#ff6b6b',desc:'Resists adversarial attacks (data poisoning, prompt injection, model inversion). Maintains core functionality under stress and recovers from failures.',example:'A content moderation system that remains effective against evasion attempts.'},
  {name:'Fair /\\nBias Managed',color:'#fd79a8',desc:'Treats individuals and groups equitably. Actively identifies, measures, and mitigates harmful biases in data, models, and outputs.',example:'A recidivism model audited for equal false positive rates across groups.'}
];

// GOVERN nodes
var GOVERN_CATS=[
  {id:'root',label:'AI Risk\\nGovernance',x:340,y:40,w:120,h:44,color:'#0984e3',parent:null,
   desc:'The overarching governance structure. Establishes that AI risk management is an organizational priority with executive sponsorship and dedicated resources.'},
  {id:'g1',label:'G1: Policies\\n& Culture',x:80,y:130,w:110,h:44,color:'#6c5ce7',parent:'root',
   desc:'G1: Policies, processes, and practices across the organization related to AI risk management are established, documented, and communicated. Builds the cultural foundation.'},
  {id:'g2',label:'G2: Accountability',x:230,y:130,w:110,h:44,color:'#0984e3',parent:'root',
   desc:'G2: Roles, responsibilities, and authorities for AI risk management are defined, documented, and assigned. Clear ownership when things go wrong.'},
  {id:'g3',label:'G3: Workforce',x:380,y:130,w:110,h:44,color:'#00b894',parent:'root',
   desc:'G3: Organizational teams are committed to and equipped with appropriate training and skills for AI risk management. Diversity and inclusion in AI roles.'},
  {id:'g4',label:'G4: Team\\nCommitment',x:510,y:130,w:110,h:44,color:'#51cf66',parent:'root',
   desc:'G4: Organizational teams are committed to a culture of risk management and are incentivized to identify and escalate AI risks rather than suppress them.'},
  {id:'g5',label:'G5: Risk\\nPolicies',x:155,y:230,w:110,h:44,color:'#f7b731',parent:'g2',
   desc:'G5: Policies and procedures that manage AI risk are defined, communicated, and applied consistently across the organization and supply chain.'},
  {id:'g6',label:'G6: Human\\nOversight',x:440,y:230,w:110,h:44,color:'#ff6b6b',parent:'g3',
   desc:'G6: Policies, processes, and procedures are in place for human oversight and intervention for AI systems, including escalation paths and shutdown procedures.'}
];

// MAP pipeline steps
var MAP_STEPS=[
  {label:'MAP 1\\nContext',color:'#f7b731',
   desc:'Establish context: What is the AI system? What problem does it solve? Who built it, for whom, under what constraints? What data does it use and in what environment will it operate?',
   questions:['What is the intended purpose?','Who are the affected parties?','What data sources are used?','What regulatory context applies?']},
  {label:'MAP 2\\nKnowledge',color:'#e67e22',
   desc:'Apply scientific and established knowledge. What do we know from research about risks in this domain? What have other deployments experienced? What are known failure modes?',
   questions:['What does research say about failure modes?','Are there analogous deployments to learn from?','What are known biases in this data type?','What external standards apply?']},
  {label:'MAP 3\\nRisks &\\nBenefits',color:'#e17055',
   desc:'Identify and catalogue AI risks AND benefits. Technical risks (model failures, adversarial attacks) and societal risks (bias, privacy, labor displacement) must both be mapped.',
   questions:['What technical risks exist?','What societal harms could occur?','What benefits does the system provide?','Who bears the risks vs. who gets the benefits?']},
  {label:'MAP 4\\nPrioritize',color:'#d35400',
   desc:'Prioritize risks by likelihood and impact. Not all risks can be mitigated equally. Prioritization determines what MEASURE focuses on and what MANAGE addresses first.',
   questions:['What is the likelihood of each risk?','What is the severity if it occurs?','Which risks are most urgent to address?','What is the cost of mitigation vs. the cost of harm?']},
  {label:'MAP 5\\nSocietal\\nImpact',color:'#c0392b',
   desc:'Assess broader societal and environmental impacts beyond immediate users: effects on labor markets, power concentration, civil liberties, and communities not directly interacting with the system.',
   questions:['How does this affect communities at scale?','What are long-term societal implications?','Does this concentrate power inappropriately?','What is the environmental footprint?']}
];

// Risk register dots
var RISK_DOTS=[
  {name:'Algorithmic Bias in Hiring',x:0.72,y:0.85,color:'#fd79a8',cat:'MAP 3 / MAP 5',
   desc:'AI screening system systematically disadvantages certain demographic groups. High likelihood in recruitment AI; severe societal impact.'},
  {name:'Hallucination in Medical AI',x:0.55,y:0.90,color:'#ff6b6b',cat:'MAP 3',
   desc:'LLM-based clinical tool generates plausible but incorrect medical information. Moderate-high likelihood; catastrophic potential impact.'},
  {name:'Data Poisoning Attack',x:0.35,y:0.70,color:'#e17055',cat:'MAP 3',
   desc:'Adversarial manipulation of training data to embed backdoors. Moderate likelihood with sophisticated attackers; high impact if exploited.'},
  {name:'Model Drift',x:0.60,y:0.50,color:'#f7b731',cat:'MAP 4',
   desc:'Performance degrades over time as real-world data diverges from training distribution. High likelihood over long deployment; moderate impact.'},
  {name:'Privacy Leakage',x:0.45,y:0.75,color:'#6c5ce7',cat:'MAP 3 / MAP 5',
   desc:'Training data memorization allows extraction of personal information. Moderate likelihood; high regulatory and reputational impact.'},
  {name:'Over-Reliance by Users',x:0.78,y:0.40,color:'#0984e3',cat:'MAP 1 / MAP 5',
   desc:'Users trust AI recommendations without appropriate critical evaluation. Very high likelihood in decision-support systems; moderate impact.'},
  {name:'Supply Chain Risk',x:0.28,y:0.55,color:'#00b894',cat:'MAP 2',
   desc:'Third-party model or dataset introduces undisclosed risks. Moderate likelihood; variable impact depending on dependency depth.'},
  {name:'Prompt Injection',x:0.42,y:0.62,color:'#a29bfe',cat:'MAP 3',
   desc:'Malicious inputs manipulate LLM to perform unintended actions. High likelihood for publicly-exposed generative AI; potentially severe impact.'}
];

// Manage cards
var MANAGE_CARDS=[
  {id:'mg1',title:'MG1: Mitigate',color:'#51cf66',
   front:'Risk prioritization and mitigation planning. Develop and document treatment plans for each prioritized risk.',
   back:'Actions: assign mitigation owners, define success metrics, set timelines, document trade-offs, obtain sign-off from GOVERN accountability holders.'},
  {id:'mg2',title:'MG2: Respond',color:'#0984e3',
   front:'Response strategies for identified risks: accept, avoid, transfer, or mitigate. Each requires explicit rationale.',
   back:'Accept: risk is within tolerance. Avoid: stop or redesign the system. Transfer: insurance or contractual liability shift. Mitigate: technical or process controls.'},
  {id:'mg3',title:'MG3: Monitor',color:'#f7b731',
   front:'Ongoing monitoring of deployed AI systems. Detect when systems drift outside acceptable performance or risk bounds.',
   back:'Continuous metric tracking, anomaly detection, incident reporting, user feedback channels, periodic formal re-evaluation against MAP risk register.'},
  {id:'mg4',title:'MG4: Residual Risk',color:'#ff6b6b',
   front:'Track, document, and communicate risks that remain after mitigation. These must be within accepted risk tolerance.',
   back:'Maintain residual risk register, communicate to stakeholders, review periodically, update when context changes, include in decommissioning decisions.'}
];

var flippedCards={};
function flipCard(idx){
  flippedCards[idx]=!flippedCards[idx];
  if(typeof drawManagePlaybook==='function')drawManagePlaybook();
  var c=MANAGE_CARDS[idx];
  var det=document.getElementById('playbook-detail');
  if(det)det.innerHTML='<strong>'+c.title+'</strong> &mdash; '+(flippedCards[idx]?c.back:c.front);
}

// Lifecycle stages
var LIFECYCLE_STAGES=[
  {name:'Plan &\\nDesign',color:'#6c5ce7',
   functions:['GOVERN','MAP'],
   actors:'AI developers, product managers, ethicists, legal',
   risks:'Scope creep, missing stakeholder input, unclear accountability, biased problem framing',
   detail:'Risk management starts before a line of code is written. GOVERN establishes ownership. MAP documents intended use, affected parties, and known risks in the problem domain.'},
  {name:'Data &\\nDevelopment',color:'#0984e3',
   functions:['MAP','MEASURE'],
   actors:'Data scientists, ML engineers, data governance teams',
   risks:'Training data bias, data quality issues, model overfitting, privacy violations in data collection',
   detail:'MAP identifies data-related risks. MEASURE defines evaluation metrics and runs fairness, robustness, and privacy assessments before any deployment decision.'},
  {name:'Deployment',color:'#f7b731',
   functions:['GOVERN','MEASURE','MANAGE'],
   actors:'Deployment engineers, legal, compliance, communications',
   risks:'Integration failures, user over-reliance, deployment context mismatch, inadequate user training',
   detail:'GOVERN authorizes deployment against defined risk tolerance. MEASURE baselines initial production performance. MANAGE establishes monitoring and incident response plans.'},
  {name:'Operation &\\nMonitoring',color:'#ff6b6b',
   functions:['MEASURE','MANAGE'],
   actors:'Operations teams, product teams, affected community representatives',
   risks:'Model drift, emerging bias, adversarial exploitation, regulatory changes, evolving user needs',
   detail:'MEASURE monitors continuous performance. MANAGE responds to incidents and updates treatment plans. Periodic re-evaluation against the original MAP risk register is required.'},
  {name:'Decommission',color:'#51cf66',
   functions:['GOVERN','MANAGE'],
   actors:'Operations, legal, data governance, stakeholder communications',
   risks:'Data retention violations, user dependency disruption, knowledge loss, inadequate handoff',
   detail:'GOVERN determines decommission criteria and process. MANAGE executes the wind-down, including data deletion, user communication, and documentation of lessons learned.'}
];
var hoveredStage=null;
</script>
<script>
/* CANVAS CODE INJECTED HERE */
</script>
</body>
</html>`;

fs.writeFileSync('index.html',html,'utf8');
console.log('build1 done:',html.length,'bytes',html.split('\n').length,'lines');
