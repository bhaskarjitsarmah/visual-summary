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

  <div class="nav-group-title">Going Deeper</div>
  <div class="nav-link" data-sec="s-risk-flow" onclick="setActive(this,'s-risk-flow')">
    <span class="dot" style="background:#f7b731"></span>Follow a Risk</div>
  <div class="nav-link" data-sec="s-genai" onclick="setActive(this,'s-genai')">
    <span class="dot" style="background:#fd79a8"></span>GenAI Profile</div>
  <div class="nav-link" data-sec="s-subcats" onclick="setActive(this,'s-subcats')">
    <span class="dot" style="background:#6c5ce7"></span>72 Subcategories</div>
  <div class="nav-link" data-sec="s-maturity" onclick="setActive(this,'s-maturity')">
    <span class="dot" style="background:#51cf66"></span>Maturity Check</div>
  <div class="nav-link" data-sec="s-crosswalk" onclick="setActive(this,'s-crosswalk')">
    <span class="dot" style="background:#0984e3"></span>EU AI Act</div>

  <div class="nav-group-title">Applied</div>
  <div class="nav-link" data-sec="s-cases" onclick="setActive(this,'s-cases')">
    <span class="dot" style="background:#ff6b6b"></span>Case Studies</div>
  <div class="nav-link" data-sec="s-roadmap" onclick="setActive(this,'s-roadmap')">
    <span class="dot" style="background:#6c5ce7"></span>Roadmap</div>
  <div class="nav-link" data-sec="s-tradeoffs" onclick="setActive(this,'s-tradeoffs')">
    <span class="dot" style="background:#a29bfe"></span>Trade-offs</div>
  <div class="nav-link" data-sec="s-sectors" onclick="setActive(this,'s-sectors')">
    <span class="dot" style="background:#00b894"></span>Sector Profiles</div>
  <div class="nav-link" data-sec="s-actors" onclick="setActive(this,'s-actors')">
    <span class="dot" style="background:#fd79a8"></span>Actor Map</div>

  <div class="nav-group-title">Tools &amp; Reference</div>
  <div class="nav-link" data-sec="s-quiz" onclick="setActive(this,'s-quiz')">
    <span class="dot" style="background:#6c5ce7"></span>Self-Assessment Quiz</div>
  <div class="nav-link" data-sec="s-classifier" onclick="setActive(this,'s-classifier')">
    <span class="dot" style="background:#0984e3"></span>System Classifier</div>
  <div class="nav-link" data-sec="s-sandbox" onclick="setActive(this,'s-sandbox')">
    <span class="dot" style="background:#f7b731"></span>Risk Sandbox</div>
  <div class="nav-link" data-sec="s-incident" onclick="setActive(this,'s-incident')">
    <span class="dot" style="background:#ff6b6b"></span>Incident Tree</div>
  <div class="nav-link" data-sec="s-frameworks" onclick="setActive(this,'s-frameworks')">
    <span class="dot" style="background:#00b894"></span>Framework Comparison</div>
  <div class="nav-link" data-sec="s-glossary" onclick="setActive(this,'s-glossary')">
    <span class="dot" style="background:#a29bfe"></span>Glossary</div>

  <div class="nav-group-title">Advanced</div>
  <div class="nav-link" data-sec="s-simulator" onclick="setActive(this,'s-simulator')">
    <span class="dot" style="background:#ff6b6b"></span>Risk Simulator</div>
  <div class="nav-link" data-sec="s-deepdive" onclick="setActive(this,'s-deepdive')">
    <span class="dot" style="background:#6c5ce7"></span>Deep-Dive Cards</div>
  <div class="nav-link" data-sec="s-policy" onclick="setActive(this,'s-policy')">
    <span class="dot" style="background:#0984e3"></span>Policy Builder</div>
  <div class="nav-link" data-sec="s-propagation" onclick="setActive(this,'s-propagation')">
    <span class="dot" style="background:#f7b731"></span>Risk Propagation</div>
  <div class="nav-link" data-sec="s-progression" onclick="setActive(this,'s-progression')">
    <span class="dot" style="background:#51cf66"></span>Maturity Timeline</div>
  <div class="nav-link" data-sec="s-orgchart" onclick="setActive(this,'s-orgchart')">
    <span class="dot" style="background:#fd79a8"></span>Org Chart</div>
  <div class="nav-link" data-sec="s-depmap" onclick="setActive(this,'s-depmap')">
    <span class="dot" style="background:#00b894"></span>Dependency Map</div>
  <div class="nav-link" data-sec="s-regmap" onclick="setActive(this,'s-regmap')">
    <span class="dot" style="background:#a29bfe"></span>Regulatory Mapper</div>
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

<!-- ====== S8: FOLLOW A RISK ====== -->
<section class="section" id="s-risk-flow">
  <div class="section-tag" style="color:#f7b731">In Practice &middot; Interactive Walkthrough</div>
  <h2 class="section-title">Follow a Risk Through All Four Functions</h2>
  <p class="section-sub">Trace a single real-world risk &mdash; algorithmic bias in a hiring AI &mdash; through MAP, MEASURE, MANAGE, and GOVERN. See exactly what each function does with it, step by step.</p>

  <div class="btn-row">
    <button class="btn" id="flow-btn-0" onclick="setFlowStep(0)">1. MAP: Identify</button>
    <button class="btn-tab" id="flow-btn-1" onclick="setFlowStep(1)">2. MEASURE: Quantify</button>
    <button class="btn-tab" id="flow-btn-2" onclick="setFlowStep(2)">3. MANAGE: Respond</button>
    <button class="btn-tab" id="flow-btn-3" onclick="setFlowStep(3)">4. GOVERN: Institutionalize</button>
  </div>
  <canvas id="canvas-risk-flow" width="700" height="290" style="margin-bottom:12px;"></canvas>
  <div class="info-panel" id="risk-flow-detail">Click a step above to trace algorithmic bias through the AI RMF.</div>

  <div class="highlight-box amber" style="margin-top:16px;">
    <strong>The functions run concurrently, not sequentially.</strong> While MANAGE responds to the bias risk, MAP is cataloguing new risks, MEASURE is tracking mitigation effectiveness, and GOVERN is updating policy. This walkthrough shows each function&rsquo;s role &mdash; not the order they run in.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-genai">GenAI Profile &rarr;</a>
  </div>
</section>

<!-- ====== S9: GENAI PROFILE ====== -->
<section class="section" id="s-genai">
  <div class="section-tag" style="color:#fd79a8">NIST-AI-600-1 &middot; July 2024</div>
  <h2 class="section-title">12 Risks Unique to Generative AI</h2>
  <p class="section-sub">The GenAI Profile extends the core RMF with 12 risks that don&rsquo;t appear in traditional AI systems. From hallucination to CBRN hazards, these require new thinking about measurement and management. Click any card to see mitigations.</p>

  <canvas id="canvas-genai-grid" width="700" height="360" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="genai-detail"><strong>Click a risk card</strong> to see description, severity, and mitigation strategies.</div>

  <div class="highlight-box" style="border-color:#fd79a8;background:rgba(253,121,168,.06);margin-top:16px;">
    <strong>The GenAI Profile uses the same four-function structure as the core RMF.</strong> Organizations already implementing GOVERN/MAP/MEASURE/MANAGE can adopt the GenAI Profile by adding these 12 risks to their existing MAP risk registers &mdash; no new framework to learn.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-subcats">72 Subcategories &rarr;</a>
  </div>
</section>

<!-- ====== S10: SUBCATEGORIES ====== -->
<section class="section" id="s-subcats">
  <div class="section-tag" style="color:#6c5ce7">The Actionable Core</div>
  <h2 class="section-title">72 Subcategories: Where the Framework Becomes Action</h2>
  <p class="section-sub">The 72 subcategories are the actual requirements &mdash; specific things an organization must demonstrate. Filter by function to browse. Each subcategory corresponds to concrete organizational actions.</p>

  <div class="btn-row" id="subcat-filter-row">
    <button class="btn" id="sf-ALL" onclick="filterSubcats('ALL')">All (40 shown)</button>
    <button class="btn-tab" id="sf-GOVERN" onclick="filterSubcats('GOVERN')" style="border-color:#0984e3;color:#0984e3">GOVERN</button>
    <button class="btn-tab" id="sf-MAP" onclick="filterSubcats('MAP')" style="border-color:#f7b731;color:#f7b731">MAP</button>
    <button class="btn-tab" id="sf-MEASURE" onclick="filterSubcats('MEASURE')" style="border-color:#ff6b6b;color:#ff6b6b">MEASURE</button>
    <button class="btn-tab" id="sf-MANAGE" onclick="filterSubcats('MANAGE')" style="border-color:#51cf66;color:#51cf66">MANAGE</button>
  </div>
  <div id="subcat-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;"></div>

  <div class="highlight-box">
    <strong>You don&rsquo;t need all 72 subcategories on day one.</strong> NIST explicitly supports incremental adoption. A practical approach: implement 10&ndash;15 subcategories covering your highest-risk AI systems in year one, then expand. The order matters less than starting.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-maturity">Maturity Check &rarr;</a>
  </div>
</section>

<!-- ====== S11: MATURITY ASSESSMENT ====== -->
<section class="section" id="s-maturity">
  <div class="section-tag" style="color:#51cf66">Self-Assessment</div>
  <h2 class="section-title">AI Governance Maturity: Where Does Your Org Stand?</h2>
  <p class="section-sub">Answer 12 yes/partial/no questions to score your organization&rsquo;s maturity across all four RMF functions. The radar chart updates live. Be honest &mdash; the goal is to find gaps, not pass a test.</p>

  <div class="grid2" style="gap:24px;align-items:start;">
    <div id="maturity-questions-container" style="min-height:300px;"></div>
    <canvas id="canvas-maturity-radar" width="320" height="300" style="margin-bottom:12px;"></canvas>
  </div>
  <div class="info-panel" id="maturity-detail" style="margin-top:12px;">Answer all 12 questions to see your maturity assessment.</div>
  <button class="btn" onclick="scoreMaturity()" style="margin-top:12px;">See My Score</button>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-crosswalk">EU AI Act Crosswalk &rarr;</a>
  </div>
</section>

<!-- ====== S12: EU AI ACT CROSSWALK ====== -->
<section class="section" id="s-crosswalk">
  <div class="section-tag" style="color:#0984e3">Regulatory Alignment</div>
  <h2 class="section-title">EU AI Act Crosswalk: From Framework to Regulation</h2>
  <p class="section-sub">The EU AI Act, fully in effect August 2026, mandates specific obligations for high-risk AI. The NIST AI RMF maps closely to these requirements. Hover any row to see the alignment detail and identify where you need to go beyond the RMF.</p>

  <canvas id="canvas-crosswalk" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="crosswalk-detail">Hover a row to see how the RMF subcategory aligns with the EU AI Act article and where gaps remain.</div>

  <div class="highlight-box" style="border-color:#0984e3;background:rgba(9,132,227,.06);margin-top:16px;">
    <strong>Implementing the RMF significantly reduces your EU AI Act compliance gap</strong> &mdash; but does not close it entirely. EU-specific requirements like CE marking, notified body assessments, and registration in the EU AI database have no RMF equivalent.
  </div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#0984e3">Strongest Alignment</div>
      <div class="card-body">GOVERN G2 (accountability) maps almost directly to EU Art. 9 (risk management system). Both require named owners, documented roles, and clear accountability for AI outcomes. MEASURE MS4 maps well to Art. 61 (post-market monitoring).</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">Partial Overlap</div>
      <div class="card-body">MAP 5 (societal impact) partially overlaps EU Art. 43 (conformity assessment), but the EU Act is narrower &mdash; it mandates assessment only for high-risk system categories. The RMF encourages broader societal impact assessment for all AI systems.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">Gaps to Address</div>
      <div class="card-body">EU-specific: CE marking, notified body involvement, registration in the EU AI database, and Art. 65 market surveillance. Organizations need EU legal counsel alongside RMF implementation to address these gaps.</div>
    </div>
  </div>
</section>

<!-- ====== S13: CASE STUDIES ====== -->
<section class="section" id="s-cases">
  <div class="section-tag" style="color:#ff6b6b">Real-World Failures</div>
  <h2 class="section-title">Three AI Failures the RMF Would Have Caught</h2>
  <p class="section-sub">Abstract frameworks become concrete through failures. These three real incidents show exactly which RMF functions were absent &mdash; and what would have changed if they had been in place.</p>

  <div class="btn-row">
    <button class="btn" id="case-btn-0" onclick="selectCase(0)">Amazon Hiring AI (2018)</button>
    <button class="btn-tab" id="case-btn-1" onclick="selectCase(1)">COMPAS Recidivism (2016)</button>
    <button class="btn-tab" id="case-btn-2" onclick="selectCase(2)">AI Hallucination in Court (2023)</button>
  </div>
  <canvas id="canvas-case-study" width="700" height="320" style="margin-bottom:12px;"></canvas>
  <div class="info-panel" id="case-detail">Select a case study above to see which RMF functions were missing and what the outcome was.</div>

  <div class="highlight-box red" style="margin-top:16px;">
    <strong>These are not edge cases &mdash; they are the norm.</strong> Most AI failures trace directly to missing GOVERN policies, incomplete MAP risk identification, absent MEASURE metrics, or no MANAGE response plan. The RMF does not prevent all AI failures; it prevents the preventable ones.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-roadmap">Implementation Roadmap &rarr;</a>
  </div>
</section>

<!-- ====== S14: ROADMAP ====== -->
<section class="section" id="s-roadmap">
  <div class="section-tag" style="color:#6c5ce7">Getting Started</div>
  <h2 class="section-title">12-Month Implementation Roadmap</h2>
  <p class="section-sub">Where do I start? Here is a realistic first-year implementation sequence for an organization new to structured AI risk management. Hover any bar to see what it involves and which RMF subcategories it covers.</p>

  <canvas id="canvas-roadmap" width="700" height="360" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="roadmap-detail">Hover a roadmap item to see what it involves and which RMF subcategories it covers.</div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#0984e3">Start with GOVERN</div>
      <div class="card-body">Before mapping risks or measuring anything, name one person accountable for AI risk. Without G2 accountability, all subsequent work has no owner. This is the single most important first action and costs almost nothing.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">MAP One System First</div>
      <div class="card-body">Do not try to MAP all AI systems at once. Pick your highest-risk system and complete MAP 1&ndash;5 for it. One fully-mapped system teaches more than five half-mapped ones and gives you a template for the rest.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">Iterate, Don&rsquo;t Perfect</div>
      <div class="card-body">A 60% implementation across all four functions beats 100% in one. The RMF is designed for iteration &mdash; revisit and deepen each function annually. Year 2 is when most organizations achieve real maturity.</div>
    </div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-tradeoffs">Trade-off Explorer &rarr;</a>
  </div>
</section>

<!-- ====== S15: TRADE-OFFS ====== -->
<section class="section" id="s-tradeoffs">
  <div class="section-tag" style="color:#a29bfe">Design Tensions</div>
  <h2 class="section-title">Trustworthiness Trade-offs: You Cannot Maximize Everything</h2>
  <p class="section-sub">The 7 trustworthiness characteristics pull against each other. Select a pair to explore the tension, then use the slider to see how shifting the balance changes what you gain and lose. Understanding these trade-offs is what MEASURE and GOVERN are actually about.</p>

  <div class="btn-row">
    <button class="btn" id="tb-0" onclick="selectTradeoff(0)">Accuracy vs Explainability</button>
    <button class="btn-tab" id="tb-1" onclick="selectTradeoff(1)">Fairness vs Accuracy</button>
    <button class="btn-tab" id="tb-2" onclick="selectTradeoff(2)">Privacy vs Utility</button>
    <button class="btn-tab" id="tb-3" onclick="selectTradeoff(3)">Security vs Access</button>
    <button class="btn-tab" id="tb-4" onclick="selectTradeoff(4)">Safety vs Capability</button>
  </div>
  <canvas id="canvas-tradeoffs" width="700" height="280" style="margin-bottom:12px;"></canvas>
  <div class="slider-row" style="max-width:580px;margin:0 auto 14px;align-items:center;">
    <span class="slider-lbl" id="tradeoff-lbl-a" style="min-width:120px;text-align:right;color:#74b9ff;font-weight:700;">Accurate</span>
    <input type="range" id="sl-tradeoff" min="0" max="100" value="50" oninput="tradeoffSlider=parseInt(this.value);drawTradeoffs()">
    <span class="slider-lbl" id="tradeoff-lbl-b" style="color:#fd79a8;font-weight:700;">Explainable</span>
  </div>
  <div class="info-panel" id="tradeoff-detail">Select a pair above to explore the design tension and the sweet-spot resolution.</div>

  <div class="highlight-box" style="border-color:#a29bfe;background:rgba(162,155,254,.06);margin-top:16px;">
    <strong>There is no universally correct resolution to these trade-offs.</strong> The right balance depends on deployment context and the cost of different failure modes. GOVERN G2 requires that trade-offs are made explicitly &mdash; documented with rationale &mdash; not implicitly by whoever builds the model.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-sectors">Sector Profiles &rarr;</a>
  </div>
</section>

<!-- ====== S16: SECTOR PROFILES ====== -->
<section class="section" id="s-sectors">
  <div class="section-tag" style="color:#00b894">Domain-Specific</div>
  <h2 class="section-title">Sector Risk Profiles: Same Framework, Different Priorities</h2>
  <p class="section-sub">The RMF applies everywhere, but dominant risks, key metrics, and regulatory context differ dramatically by sector. Select your domain to see which RMF functions matter most and which risks are most prevalent.</p>

  <div class="btn-row">
    <button class="btn" id="sec-btn-0" onclick="selectSector(0)">Healthcare</button>
    <button class="btn-tab" id="sec-btn-1" onclick="selectSector(1)">Financial Services</button>
    <button class="btn-tab" id="sec-btn-2" onclick="selectSector(2)">Criminal Justice</button>
    <button class="btn-tab" id="sec-btn-3" onclick="selectSector(3)">HR &amp; Recruitment</button>
  </div>
  <canvas id="canvas-sector-profile" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="sector-detail">Select a sector above to see its dominant AI risks and RMF priorities.</div>

  <div class="highlight-box teal" style="margin-top:16px;">
    <strong>Sector context determines which MAP risks to prioritize, which MEASURE metrics matter, and which regulatory frameworks apply.</strong> The RMF does not prescribe sector-specific metrics &mdash; it provides the structure to derive them. This is what that looks like in practice.
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-actors">Actor Responsibility Map &rarr;</a>
  </div>
</section>

<!-- ====== S17: ACTOR MAP ====== -->
<section class="section" id="s-actors">
  <div class="section-tag" style="color:#fd79a8">Who Does What</div>
  <h2 class="section-title">AI Actor Responsibility Map</h2>
  <p class="section-sub">Different actors have different obligations across the four functions. Developers, deployers, operators, affected communities, and regulators all play distinct roles. Click any actor to see their specific responsibilities &mdash; and where accountability gaps most often occur.</p>

  <canvas id="canvas-actor-map" width="700" height="340" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="actor-detail">Click an actor to see their responsibilities across each RMF function.</div>

  <div class="highlight-box" style="margin-top:16px;">
    <strong>The most common accountability failure: everyone assumes someone else is responsible.</strong> Developers assume deployers will address context-specific risks. Deployers assume developers handled technical risks. The RMF requires all of these to be explicitly assigned &mdash; with names attached.
  </div>
</section>

<!-- ====== S18: SELF-ASSESSMENT QUIZ ====== -->
<section class="section" id="s-quiz">
  <div class="section-tag" style="color:#6c5ce7">Tools &middot; Interactive</div>
  <h2 class="section-title">RMF Self-Assessment Quiz</h2>
  <p class="section-sub">Answer 15 yes/no questions about your organization to see how you score across the four RMF functions. The radar chart shows where you are strong and where the gaps are &mdash; with specific subcategory recommendations.</p>

  <canvas id="canvas-quiz-radar" width="700" height="280" style="margin-bottom:12px;"></canvas>

  <div class="info-panel" id="quiz-question" style="min-height:100px;">
    <strong>Click Start to begin the 15-question assessment.</strong> Each question maps to a specific RMF function. Your answers generate a scored radar chart and priority recommendations.
    <div style="margin-top:12px;"><button class="btn" onclick="quizStart()">Start Assessment</button></div>
  </div>

  <div class="info-panel" id="quiz-recs" style="min-height:40px;margin-top:8px;font-size:12px;"></div>

  <div class="highlight-box" style="margin-top:16px;">
    <strong>This is a directional tool, not an audit.</strong> Use the results to prioritize where to invest next in your RMF journey. Low GOVERN scores mean governance must come first &mdash; MAP and MEASURE cannot function without it.
  </div>
</section>

<!-- ====== S19: SYSTEM CLASSIFIER ====== -->
<section class="section" id="s-classifier">
  <div class="section-tag" style="color:#0984e3">Tools &middot; Interactive</div>
  <h2 class="section-title">AI System Risk Classifier</h2>
  <p class="section-sub">Answer four questions about an AI system you are building or deploying. The classifier outputs a risk tier, the RMF functions to prioritize, and the subcategories most relevant to your context &mdash; giving you a starting point rather than a blank framework.</p>

  <div class="card" style="max-width:600px;margin-bottom:16px;">
    <div class="grid2" style="gap:20px;margin-bottom:16px;">
      <div>
        <div class="card-title" style="color:#0984e3">1. Deployment Domain</div>
        <select id="cls-domain" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
          <option value="general">General / Other</option>
          <option value="healthcare">Healthcare</option>
          <option value="finance">Financial Services</option>
          <option value="hr">HR &amp; Recruitment</option>
          <option value="justice">Criminal Justice</option>
          <option value="education">Education</option>
        </select>
      </div>
      <div>
        <div class="card-title" style="color:#0984e3">2. Automation Level</div>
        <select id="cls-automation" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
          <option value="advisory">Advisory (human decides)</option>
          <option value="semi">Semi-automated (human in loop)</option>
          <option value="full">Fully automated (no human review)</option>
        </select>
      </div>
      <div>
        <div class="card-title" style="color:#f7b731">3. Decision Stakes</div>
        <select id="cls-stakes" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
          <option value="low">Low (recommendation, convenience)</option>
          <option value="medium">Medium (significant but reversible)</option>
          <option value="high">High (health, finances, liberty)</option>
          <option value="critical">Critical (life, safety, rights)</option>
        </select>
      </div>
      <div>
        <div class="card-title" style="color:#ff6b6b">4. Data Sensitivity</div>
        <select id="cls-data" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
          <option value="public">Public / Aggregate only</option>
          <option value="internal">Internal business data</option>
          <option value="sensitive">Sensitive (financial, behavioral)</option>
          <option value="personal">Personal / Health / Biometric</option>
        </select>
      </div>
    </div>
    <button class="btn" onclick="runClassifier()">Classify System</button>
  </div>

  <div class="info-panel" id="cls-result" style="min-height:100px;">
    Select your system characteristics above and click Classify to get a risk tier, priority functions, and relevant subcategories.
  </div>

  <div class="highlight-box blue" style="margin-top:16px;border-color:#0984e3;background:rgba(9,132,227,.06);">
    <strong>Context changes everything.</strong> A recommendation engine on a streaming platform is low risk. The same recommendation engine used to flag loan applicants is high risk. The RMF is designed to surface this distinction &mdash; the classifier applies the same logic systematically.
  </div>
</section>

<!-- ====== S20: RISK SANDBOX ====== -->
<section class="section" id="s-sandbox">
  <div class="section-tag" style="color:#f7b731">Tools &middot; Interactive</div>
  <h2 class="section-title">Risk Prioritization Sandbox</h2>
  <p class="section-sub">Click anywhere on the grid to place a risk. Drag existing risks to reposition them. The quadrant determines the recommended response. This is what a MAP 4 risk prioritization exercise looks like in practice.</p>

  <div class="btn-row">
    <select id="sandbox-label-select" style="background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:6px 10px;color:#c9d1d9;font-size:12px;min-width:180px;">
      <option value="Custom Risk">Custom Risk</option>
      <option value="Bias in outputs">Bias in outputs</option>
      <option value="Data poisoning">Data poisoning</option>
      <option value="Hallucination">Hallucination</option>
      <option value="Privacy leak">Privacy leak</option>
      <option value="Model drift">Model drift</option>
      <option value="Overreliance">Overreliance</option>
      <option value="Security breach">Security breach</option>
      <option value="Unexplainability">Unexplainability</option>
      <option value="Scope creep">Scope creep</option>
      <option value="IP violation">IP violation</option>
    </select>
    <button class="btn-tab" onclick="sandboxClear()">Clear All</button>
    <button class="btn-tab" onclick="sandboxExport()">Export Summary</button>
  </div>

  <canvas id="canvas-sandbox" width="700" height="340" style="cursor:crosshair;margin-bottom:12px;"></canvas>
  <div class="info-panel" id="sandbox-detail">Click the grid to place a risk dot. Select a label from the dropdown first. Risks in the top-right quadrant require immediate action.</div>

  <div class="highlight-box amber" style="margin-top:16px;">
    <strong>MAP 4 is about prioritization, not exhaustiveness.</strong> You cannot address every risk. Placing risks on likelihood &times; impact forces the conversation about which ones actually matter this quarter &mdash; and who owns each one.
  </div>
</section>

<!-- ====== S21: INCIDENT RESPONSE TREE ====== -->
<section class="section" id="s-incident">
  <div class="section-tag" style="color:#ff6b6b">Tools &middot; Interactive</div>
  <h2 class="section-title">AI Incident Response Decision Tree</h2>
  <p class="section-sub">Walk through a real AI incident step by step. Each decision point maps to a specific MANAGE subcategory. Use this to understand how MG-2, MG-3, and MG-4 connect in practice &mdash; and to prepare your team before an incident happens.</p>

  <canvas id="canvas-incident-tree" width="700" height="300" style="margin-bottom:12px;"></canvas>

  <div class="info-panel" id="incident-step" style="min-height:100px;">
    <strong>Click Start to walk through an AI incident scenario.</strong> Each step maps to an RMF MANAGE subcategory. The path changes based on your answers.
    <div style="margin-top:12px;"><button class="btn" onclick="incidentStart()" style="background:#ff6b6b">Start Incident Scenario</button></div>
  </div>

  <div class="highlight-box red" style="margin-top:16px;">
    <strong>MG-3.2 requires a pre-defined incident response process &mdash; not one improvised during the incident.</strong> Organizations that have never run through a scenario like this are not compliant with MG-3. This walkthrough is a starting point for that exercise.
  </div>
</section>

<!-- ====== S22: FRAMEWORK COMPARISON ====== -->
<section class="section" id="s-frameworks">
  <div class="section-tag" style="color:#00b894">Reference</div>
  <h2 class="section-title">AI Governance Framework Comparison</h2>
  <p class="section-sub">NIST AI RMF does not exist in isolation. ISO 42001, EU AI Act, OECD AI Principles, and NIST CSF each address overlapping topics with different emphases. Hover a cell to see how each framework approaches each governance dimension.</p>

  <canvas id="canvas-framework-matrix" width="700" height="260" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="framework-detail">Hover a cell to see how that framework approaches the governance dimension.</div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#6c5ce7">NIST AI RMF</div>
      <div class="card-body">Strongest on operational risk management: risk identification, measurement, and treatment. Weakest on enforcement (by design &mdash; it is voluntary). Best overall breadth across all dimensions.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">EU AI Act</div>
      <div class="card-body">Strongest on transparency and human oversight requirements, especially for high-risk AI. Legally binding within the EU. Less prescriptive on measurement methodology &mdash; leaves metrics to the operator.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">ISO 42001</div>
      <div class="card-body">Management system standard (like ISO 27001 for security). Strong on governance and accountability structures. Designed for certification. More process-oriented than outcome-oriented.</div>
    </div>
  </div>

  <div class="highlight-box teal" style="margin-top:16px;">
    <strong>Multi-framework reality:</strong> Organizations operating globally typically need NIST AI RMF for operational structure, EU AI Act compliance for European deployment, and ISO 42001 for third-party certification. The good news: substantial overlap means work done for one transfers to the others.
  </div>
</section>

<!-- ====== S23: GLOSSARY ====== -->
<section class="section" id="s-glossary">
  <div class="section-tag" style="color:#a29bfe">Reference</div>
  <h2 class="section-title">Key Definitions Glossary</h2>
  <p class="section-sub">30 core terms from the NIST AI RMF with definitions and function context. Filter by function or search by term. These are the definitions that appear in the framework itself &mdash; having a shared vocabulary is the first step to shared risk management.</p>

  <div class="btn-row" style="margin-bottom:12px;">
    <input id="glossary-search" type="text" placeholder="Search terms..." oninput="filterGlossary()" style="background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 12px;color:#c9d1d9;font-size:12px;min-width:200px;outline:none;">
    <button class="btn-tab" id="gf-all" onclick="filterGlossaryFn('all')" style="border-color:#6c5ce7;color:#a29bfe;">All</button>
    <button class="btn-tab" id="gf-GOVERN" onclick="filterGlossaryFn('GOVERN')">GOVERN</button>
    <button class="btn-tab" id="gf-MAP" onclick="filterGlossaryFn('MAP')">MAP</button>
    <button class="btn-tab" id="gf-MEASURE" onclick="filterGlossaryFn('MEASURE')">MEASURE</button>
    <button class="btn-tab" id="gf-MANAGE" onclick="filterGlossaryFn('MANAGE')">MANAGE</button>
  </div>

  <div id="glossary-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;"></div>

  <div class="highlight-box" style="margin-top:20px;">
    <strong>Vocabulary is infrastructure.</strong> The most common failure mode in AI risk management is different teams using the same words to mean different things. The RMF glossary exists precisely to prevent this &mdash; engineers, lawyers, and executives need to agree on what &ldquo;risk&rdquo; means before they can manage it together.
  </div>
</section>

<!-- ====== S24: RISK SIMULATOR ====== -->
<section class="section" id="s-simulator">
  <div class="section-tag" style="color:#ff6b6b">Advanced &middot; Interactive</div>
  <h2 class="section-title">AI Risk Scenario Simulator</h2>
  <p class="section-sub">Choose an AI system type and run it through a simulated 12-month operation. Random risk events occur and you respond with the correct RMF action &mdash; or miss it. Your trustworthiness score reflects how well you applied the framework under pressure.</p>

  <div class="btn-row">
    <button class="btn-tab" id="sim-sys-0" onclick="simSelectSystem(0)">Hiring AI</button>
    <button class="btn-tab" id="sim-sys-1" onclick="simSelectSystem(1)">Medical Diagnosis AI</button>
    <button class="btn-tab" id="sim-sys-2" onclick="simSelectSystem(2)">Content Moderation AI</button>
    <button class="btn" onclick="simStart()" id="sim-start-btn">Start Simulation</button>
    <button class="btn-tab" onclick="simReset()">Reset</button>
  </div>

  <canvas id="canvas-simulator" width="700" height="260" style="margin-bottom:12px;"></canvas>

  <div class="info-panel" id="sim-event-panel" style="min-height:110px;">
    Select a system above and click <strong>Start Simulation</strong> to begin the 12-month risk scenario. Events will occur and you will need to respond using the correct RMF action.
  </div>

  <div class="info-panel" id="sim-log" style="min-height:50px;font-size:11px;color:#8b949e;max-height:120px;overflow-y:auto;"></div>

  <div class="highlight-box red" style="margin-top:16px;">
    <strong>The goal is not a perfect score &mdash; it is to understand why each event requires a specific RMF response.</strong> Organizations that have pre-defined responses to common AI risk events score consistently higher than those improvising under pressure. That is MANAGE in action.
  </div>
</section>

<!-- ====== S25: DEEP-DIVE CARDS ====== -->
<section class="section" id="s-deepdive">
  <div class="section-tag" style="color:#6c5ce7">Advanced &middot; Reference</div>
  <h2 class="section-title">Subcategory Deep-Dive: 12 Most Critical</h2>
  <p class="section-sub">The 72 subcategories vary enormously in importance. These 12 are the ones that appear in almost every real-world RMF implementation &mdash; the backbone subcategories. Each card shows the verbatim NIST text, a plain-English translation, a real example, and which other subcategories depend on it.</p>

  <div class="btn-row" style="margin-bottom:16px;">
    <button class="btn-tab" id="dd-all" onclick="ddFilter('all')" style="border-color:#6c5ce7;color:#a29bfe;">All</button>
    <button class="btn-tab" id="dd-GOVERN" onclick="ddFilter('GOVERN')">GOVERN</button>
    <button class="btn-tab" id="dd-MAP" onclick="ddFilter('MAP')">MAP</button>
    <button class="btn-tab" id="dd-MEASURE" onclick="ddFilter('MEASURE')">MEASURE</button>
    <button class="btn-tab" id="dd-MANAGE" onclick="ddFilter('MANAGE')">MANAGE</button>
  </div>

  <div id="deepdive-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:14px;"></div>

  <div class="highlight-box" style="margin-top:20px;">
    <strong>GV-2.2 is the load-bearing subcategory.</strong> Without a defined and communicated risk tolerance, MAP-4 prioritization is arbitrary, MS-1 metric thresholds are undefined, and MG-2 treatment decisions have no benchmark. Everything flows from knowing how much risk the organization will accept.
  </div>
</section>

<!-- ====== S26: POLICY BUILDER ====== -->
<section class="section" id="s-policy">
  <div class="section-tag" style="color:#0984e3">Advanced &middot; Tool</div>
  <h2 class="section-title">AI Risk Policy Template Builder</h2>
  <p class="section-sub">Answer six questions about your organization and get a customized one-page AI risk policy template grounded in GOVERN subcategories. Edit the output, then copy to your document system. This implements the core requirement of GV-1.1.</p>

  <div class="grid2" style="gap:20px;margin-bottom:20px;">
    <div>
      <div class="card-title" style="color:#0984e3;margin-bottom:6px;">Organization Name</div>
      <input id="pol-org" type="text" placeholder="Acme Corp" oninput="policyGenerate()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 12px;color:#c9d1d9;font-size:13px;outline:none;">

      <div class="card-title" style="color:#0984e3;margin-top:14px;margin-bottom:6px;">Sector</div>
      <select id="pol-sector" onchange="policyGenerate()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
        <option value="general">General / Technology</option>
        <option value="healthcare">Healthcare</option>
        <option value="finance">Financial Services</option>
        <option value="hr">HR &amp; Recruitment</option>
        <option value="government">Government / Public Sector</option>
      </select>

      <div class="card-title" style="color:#0984e3;margin-top:14px;margin-bottom:6px;">Organization Size</div>
      <select id="pol-size" onchange="policyGenerate()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
        <option value="small">Small (&lt;100 employees)</option>
        <option value="mid">Mid-size (100-1000)</option>
        <option value="large">Large (1000+)</option>
      </select>
    </div>
    <div>
      <div class="card-title" style="color:#f7b731;margin-bottom:6px;">Current AI Maturity</div>
      <select id="pol-maturity" onchange="policyGenerate()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
        <option value="initial">Initial (no formal AI risk process)</option>
        <option value="managed">Managed (some processes in place)</option>
        <option value="defined">Defined (consistent org-wide process)</option>
      </select>

      <div class="card-title" style="color:#f7b731;margin-top:14px;margin-bottom:6px;">Risk Tolerance</div>
      <select id="pol-tolerance" onchange="policyGenerate()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
        <option value="conservative">Conservative (minimize AI risk)</option>
        <option value="moderate">Moderate (balanced approach)</option>
        <option value="progressive">Progressive (accept higher risk for speed)</option>
      </select>

      <div class="card-title" style="color:#ff6b6b;margin-top:14px;margin-bottom:6px;">Highest-Risk AI Use Case</div>
      <select id="pol-usecase" onchange="policyGenerate()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:8px 10px;color:#c9d1d9;font-size:13px;">
        <option value="decision">High-stakes automated decisions</option>
        <option value="generation">Generative AI (content, code, answers)</option>
        <option value="prediction">Predictive analytics and scoring</option>
        <option value="classification">Classification and flagging</option>
      </select>
    </div>
  </div>

  <textarea id="pol-output" readonly style="width:100%;min-height:340px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px;color:#a29bfe;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.8;resize:vertical;">Click any field above to generate your policy template.</textarea>
  <div style="margin-top:8px;display:flex;gap:10px;">
    <button class="btn" onclick="policyGenerate()">Generate / Refresh</button>
    <button class="btn-tab" onclick="policyCopy()">Copy to Clipboard</button>
  </div>

  <div class="highlight-box blue" style="margin-top:16px;border-color:#0984e3;background:rgba(9,132,227,.06);">
    <strong>GV-1.1 requires a policy &mdash; not a perfect policy.</strong> The most important step is writing something down and getting it approved. A two-page policy that exists and is followed beats a 30-page policy that lives in a SharePoint no one reads.
  </div>
</section>

<!-- ====== S27: RISK PROPAGATION ====== -->
<section class="section" id="s-propagation">
  <div class="section-tag" style="color:#f7b731">Advanced &middot; Visual</div>
  <h2 class="section-title">Risk Propagation Map</h2>
  <p class="section-sub">A single AI failure rarely stays contained. Click a root cause to see how it propagates through the framework &mdash; which MAP risks it activates, which MEASURE metrics it violates, and which MANAGE actions it triggers. This is what cascading AI risk looks like in practice.</p>

  <div class="btn-row">
    <button class="btn-tab" id="prop-0" onclick="propSelect(0)">Biased Training Data</button>
    <button class="btn-tab" id="prop-1" onclick="propSelect(1)">No Intended Use Doc</button>
    <button class="btn-tab" id="prop-2" onclick="propSelect(2)">No Monitoring Process</button>
    <button class="btn-tab" id="prop-3" onclick="propSelect(3)">Missing Risk Tolerance</button>
  </div>

  <canvas id="canvas-propagation" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="prop-detail">Select a root cause above to see how it propagates through GOVERN, MAP, MEASURE, and MANAGE.</div>

  <div class="highlight-box amber" style="margin-top:16px;">
    <strong>Root causes always live in GOVERN or early MAP.</strong> By the time you see a failure in MANAGE, it has passed through at least 3-4 upstream gaps. The framework is designed to catch failures early &mdash; before they cascade.
  </div>
</section>

<!-- ====== S28: MATURITY PROGRESSION ====== -->
<section class="section" id="s-progression">
  <div class="section-tag" style="color:#51cf66">Advanced &middot; Visual</div>
  <h2 class="section-title">Maturity Progression Timeline</h2>
  <p class="section-sub">RMF adoption is a journey, not a switch. This animation shows how an organization progresses from Level 1 (no formal process) to Level 4 (continuous optimization) &mdash; and which subcategories become active at each stage. Click Play to watch the progression.</p>

  <div class="btn-row">
    <button class="btn" onclick="progressionPlay()" id="prog-play-btn">Play Progression</button>
    <button class="btn-tab" onclick="progressionReset()">Reset</button>
    <button class="btn-tab" id="prog-l1" onclick="progressionGoTo(0)">Level 1</button>
    <button class="btn-tab" id="prog-l2" onclick="progressionGoTo(1)">Level 2</button>
    <button class="btn-tab" id="prog-l3" onclick="progressionGoTo(2)">Level 3</button>
    <button class="btn-tab" id="prog-l4" onclick="progressionGoTo(3)">Level 4</button>
  </div>

  <canvas id="canvas-progression" width="700" height="280" style="margin-bottom:12px;"></canvas>
  <div class="info-panel" id="prog-detail">Click Play or a Level button to explore the maturity stages. Each level unlocks new subcategories and capabilities.</div>

  <div class="highlight-box green" style="margin-top:16px;">
    <strong>Most organizations are between Level 1 and Level 2.</strong> Getting to Level 2 (documented processes for the highest-risk systems) delivers most of the risk reduction value. Level 3 and 4 are about consistency and optimization, not survival.
  </div>
</section>

<!-- ====== S29: ORG CHART BUILDER ====== -->
<section class="section" id="s-orgchart">
  <div class="section-tag" style="color:#fd79a8">Advanced &middot; Interactive</div>
  <h2 class="section-title">GOVERN Accountability Org Chart</h2>
  <p class="section-sub">Click any role in the hierarchy to see which GOVERN subcategories it owns and what responsibilities that entails. The most common RMF failure is unassigned accountability &mdash; this visualization shows what a well-assigned org looks like.</p>

  <canvas id="canvas-orgchart" width="700" height="340" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="orgchart-detail">Click any role to see their AI risk responsibilities and which GOVERN subcategories they own.</div>

  <div class="highlight-box" style="margin-top:16px;">
    <strong>GV-2.2 requires that accountability be assigned to specific individuals, not teams.</strong> When AI causes harm, &ldquo;the AI team is responsible&rdquo; is not an accountability structure. The framework requires a named person with defined authority &mdash; and that person must know they are accountable.
  </div>
</section>

<!-- ====== S30: DEPENDENCY MAP ====== -->
<section class="section" id="s-depmap">
  <div class="section-tag" style="color:#00b894">Advanced &middot; Visual</div>
  <h2 class="section-title">Subcategory Dependency Map</h2>
  <p class="section-sub">Not all subcategories are equal. Some must exist before others are meaningful. Click any node to highlight what it enables downstream &mdash; and which upstream subcategories must be in place before it can work. This is the dependency graph that the RMF does not explicitly show you.</p>

  <canvas id="canvas-depmap" width="700" height="320" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="dep-detail">Click a subcategory node to see its upstream dependencies and downstream effects.</div>

  <div class="highlight-box teal" style="margin-top:16px;">
    <strong>You cannot skip tiers.</strong> MAP-4.1 (risk prioritization) requires MAP-3.1 (risk identification) which requires MAP-1.1 (documented intended use) which requires GV-1.1 (an AI policy to exist at all). Trying to prioritize risks before documenting them is theater, not risk management.
  </div>
</section>

<!-- ====== S31: REGULATORY MAPPER ====== -->
<section class="section" id="s-regmap">
  <div class="section-tag" style="color:#a29bfe">Advanced &middot; Reference</div>
  <h2 class="section-title">Regulatory Requirement Mapper</h2>
  <p class="section-sub">Select a regulation to see exactly which NIST AI RMF subcategories satisfy each requirement &mdash; and where gaps remain. Use this to understand how RMF work transfers across compliance frameworks without duplication.</p>

  <div class="btn-row">
    <button class="btn-tab" id="reg-btn-0" onclick="regSelect(0)">EU AI Act</button>
    <button class="btn-tab" id="reg-btn-1" onclick="regSelect(1)">NYC Local Law 144</button>
    <button class="btn-tab" id="reg-btn-2" onclick="regSelect(2)">SR 11-7 Model Risk</button>
    <button class="btn-tab" id="reg-btn-3" onclick="regSelect(3)">HIPAA + AI</button>
  </div>

  <canvas id="canvas-regmap" width="700" height="260" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="reg-detail">Select a regulation above, then hover a cell to see which RMF subcategory satisfies the requirement.</div>

  <div class="grid3" style="margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#f7b731">EU AI Act</div>
      <div class="card-body">Strongest match with RMF: Art. 9 risk management system maps almost directly to GOVERN + MAP. The RMF gives you the operational process that the Act requires but does not prescribe.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#fd79a8">NYC Local Law 144</div>
      <div class="card-body">Narrowly focused on bias audits for automated employment tools. MS-2.5 is the core subcategory. The rest of the RMF builds the context and governance that makes the audit meaningful.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#0984e3">SR 11-7</div>
      <div class="card-body">The OCC model risk management guidance predates AI RMF but aligns strongly on validation (MS-2) and ongoing monitoring (MS-4, MG-3). Organizations doing SR 11-7 are already 60% of the way to RMF compliance.</div>
    </div>
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

var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle','s-risk-flow','s-genai','s-subcats','s-maturity','s-crosswalk','s-cases','s-roadmap','s-tradeoffs','s-sectors','s-actors','s-quiz','s-classifier','s-sandbox','s-incident','s-frameworks','s-glossary','s-simulator','s-deepdive','s-policy','s-propagation','s-progression','s-orgchart','s-depmap','s-regmap'];
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

// ===== RISK FLOW DATA =====
var riskFlowStep=0;
var RISK_FLOW_STEPS=[
  {fn:'MAP',title:'MAP: Identify the Risk',
   desc:'Context established: hiring AI screens resumes for tech roles. MAP 3 identifies the risk: model may encode historical hiring biases present in training data. MAP 4 prioritization: HIGH likelihood, HIGH impact, affecting protected demographic groups.',
   action:'Output: Risk register entry \u2014 Algorithmic Bias, Likelihood: HIGH, Impact: HIGH, Category: MAP3/MAP5'},
  {fn:'MEASURE',title:'MEASURE: Quantify It',
   desc:'MS 1: Define metric \u2014 demographic parity ratio. MS 2: Evaluate on historical data. Result: female candidates selected at 0.62\u00d7 the rate of male candidates for equivalent qualifications.',
   action:'Output: Fairness score 62% \u2014 below 80% threshold. Flagged for MANAGE intervention. MS 4: Report to leadership.'},
  {fn:'MANAGE',title:'MANAGE: Respond',
   desc:'MG 1: Treatment plan \u2014 Mitigate. MG 2: Remove gender-correlated proxy features, add human review for borderline candidates, implement fairness constraints in retraining. MG 3: Monthly fairness monitoring post-deployment.',
   action:'Output: Residual risk 74% parity after mitigation. Monthly review cadence set. Rollback plan documented.'},
  {fn:'GOVERN',title:'GOVERN: Institutionalize',
   desc:'G2: CHRO designated as accountability owner. G5: Policy updated \u2014 fairness testing required before any model update. G6: Human review layer made mandatory for any automated rejection decision.',
   action:'Output: Board-level AI risk summary updated. Annual third-party audit scheduled. Risk tolerance threshold formally documented.'}
];
function setFlowStep(idx){
  riskFlowStep=idx;
  for(var i=0;i<4;i++){var btn=document.getElementById('flow-btn-'+i);if(btn)btn.className=(i===idx)?'btn':'btn-tab';}
  if(typeof drawRiskFlow==='function')drawRiskFlow();
  var s=RISK_FLOW_STEPS[idx];
  var fnObj=RMF_FUNCTIONS.find(function(f){return f.name===s.fn;});
  var det=document.getElementById('risk-flow-detail');
  if(det)det.innerHTML='<strong style="color:'+(fnObj?fnObj.color:'#fff')+'">'+s.title+'</strong><br>'+s.desc+'<div style="margin-top:8px;padding:8px 12px;background:rgba(0,0,0,.3);border-radius:6px;font-size:11px;color:#a29bfe">'+s.action+'</div>';
}

// ===== GENAI RISKS DATA =====
var selectedGenAIRisk=null;
var GENAI_RISKS=[
  {name:'Hallucination\\n& Fabrication',color:'#ff6b6b',fn:'MAP+MEASURE',sev:4,
   desc:'LLMs generate plausible but factually incorrect outputs presented with apparent confidence.',
   mit:'Retrieval augmentation, fact-checking pipelines, uncertainty quantification, calibration training.'},
  {name:'Prompt\\nInjection',color:'#e17055',fn:'MAP+MANAGE',sev:4,
   desc:'Malicious inputs hijack LLM behavior, bypassing safety controls or exfiltrating data.',
   mit:'Input sanitization, instruction hierarchy enforcement, output monitoring, sandboxed execution.'},
  {name:'Training Data\\nPrivacy',color:'#6c5ce7',fn:'MAP+MEASURE',sev:4,
   desc:'LLMs may memorize and reproduce personal information from training data via extraction attacks.',
   mit:'Differential privacy, data minimization, membership inference testing, PII filtering.'},
  {name:'IP &\\nCopyright',color:'#a29bfe',fn:'GOVERN+MAP',sev:3,
   desc:'GenAI may reproduce copyrighted material verbatim or generate infringing derivative works.',
   mit:'Training data licensing review, output filtering, provenance tracking, legal review process.'},
  {name:'CBRN\\nHazards',color:'#fd79a8',fn:'GOVERN+MANAGE',sev:5,
   desc:'GenAI could generate information useful for chemical, biological, radiological, or nuclear harm.',
   mit:'Red-teaming for CBRN scenarios, strict output filtering, deployment restrictions, incident reporting.'},
  {name:'Data\\nProvenance',color:'#00b894',fn:'MAP+MEASURE',sev:3,
   desc:'Unclear sourcing of training data makes it hard to assess bias, licensing, and quality risks.',
   mit:'Data lineage documentation, provenance tracking tools, supply chain audits.'},
  {name:'Output\\nHomogenization',color:'#0984e3',fn:'MAP+MANAGE',sev:2,
   desc:'Widespread GenAI use may reduce diversity of thought, culture, and information in society.',
   mit:'Diversity-aware training, multiple model alternatives, human review requirements.'},
  {name:'Misinformation\\nat Scale',color:'#f7b731',fn:'GOVERN+MANAGE',sev:4,
   desc:'GenAI enables synthetic media creation at scale, dramatically accelerating misinformation.',
   mit:'Watermarking, provenance standards, media literacy programs, platform-level policies.'},
  {name:'Human\\nOver-reliance',color:'#51cf66',fn:'GOVERN+MAP',sev:3,
   desc:'Users defer excessively to GenAI outputs without critical evaluation in high-stakes contexts.',
   mit:'Uncertainty disclosure, calibrated confidence display, user training, human-in-the-loop design.'},
  {name:'Agentic\\nSystem Risks',color:'#fd79a8',fn:'MAP+MEASURE+MANAGE',sev:4,
   desc:'Autonomous AI agents amplify risk: errors cascade across multi-step actions, oversight gaps emerge.',
   mit:'Human oversight checkpoints, action scope constraints, step-level logging, kill-switch mechanisms.'},
  {name:'AI Power\\nConcentration',color:'#e17055',fn:'GOVERN+MAP',sev:3,
   desc:'GenAI capabilities concentrated in few organizations may distort markets and democratic institutions.',
   mit:'Governance policies on deployment scope, open model alternatives, regulatory engagement.'},
  {name:'Environmental\\nImpact',color:'#00b894',fn:'GOVERN+MEASURE',sev:2,
   desc:'Training and running large GenAI models consumes significant energy and water resources.',
   mit:'Efficiency optimization, renewable energy sourcing, compute carbon accounting, public reporting.'}
];

// ===== SUBCATEGORIES DATA =====
var subcatFilter='ALL';
var SUBCATS=[
  {id:'GV-1.1',fn:'GOVERN',cat:'G1',text:'Policies for the responsible development and use of AI are established, documented, and communicated.',color:'#0984e3'},
  {id:'GV-1.2',fn:'GOVERN',cat:'G1',text:'Organizational teams document the integration of AI in risk management processes.',color:'#0984e3'},
  {id:'GV-1.3',fn:'GOVERN',cat:'G1',text:'Organizational leaders take responsibility for decisions about risks of AI systems.',color:'#0984e3'},
  {id:'GV-1.4',fn:'GOVERN',cat:'G1',text:'Teams commit to organizational principles and policies for responsible AI development.',color:'#0984e3'},
  {id:'GV-2.1',fn:'GOVERN',cat:'G2',text:'Roles and responsibilities for AI risk management are clearly defined and documented.',color:'#0984e3'},
  {id:'GV-2.2',fn:'GOVERN',cat:'G2',text:'Organizational AI risk tolerance is established, communicated, and maintained.',color:'#0984e3'},
  {id:'GV-3.1',fn:'GOVERN',cat:'G3',text:'AI risk training and awareness programs are provided to relevant organizational teams.',color:'#0984e3'},
  {id:'GV-3.2',fn:'GOVERN',cat:'G3',text:'Diversity, equity, inclusion practices are integrated into AI workforce policies.',color:'#0984e3'},
  {id:'GV-4.1',fn:'GOVERN',cat:'G4',text:'Policies for review and update of AI risk management practices are established.',color:'#0984e3'},
  {id:'GV-6.1',fn:'GOVERN',cat:'G6',text:'Policies for human oversight of AI systems including escalation paths are maintained.',color:'#0984e3'},
  {id:'MP-1.1',fn:'MAP',cat:'MAP1',text:'Context is established for AI risk assessment including impacts on all affected communities.',color:'#f7b731'},
  {id:'MP-1.2',fn:'MAP',cat:'MAP1',text:'Intended uses and reasonably foreseeable unintended uses of AI are documented.',color:'#f7b731'},
  {id:'MP-1.3',fn:'MAP',cat:'MAP1',text:'AI system requirements are defined and understood by relevant organizational teams.',color:'#f7b731'},
  {id:'MP-2.1',fn:'MAP',cat:'MAP2',text:'Scientific and domain knowledge about AI risk is established and incorporated into assessment.',color:'#f7b731'},
  {id:'MP-2.2',fn:'MAP',cat:'MAP2',text:'Organizational risk tolerance and policies are applied throughout the AI lifecycle.',color:'#f7b731'},
  {id:'MP-3.1',fn:'MAP',cat:'MAP3',text:'Potential benefits of the AI system to individuals, groups, and society are identified.',color:'#f7b731'},
  {id:'MP-3.2',fn:'MAP',cat:'MAP3',text:'AI system is categorized with trustworthiness characteristics and risk levels considered.',color:'#f7b731'},
  {id:'MP-4.1',fn:'MAP',cat:'MAP4',text:'Risk assessments are performed for high-priority AI risks in alignment with risk tolerance.',color:'#f7b731'},
  {id:'MP-5.1',fn:'MAP',cat:'MAP5',text:'Likelihood and potential magnitude of risks to humans and organizations are assessed.',color:'#f7b731'},
  {id:'MP-5.2',fn:'MAP',cat:'MAP5',text:'Practices for supporting communities affected by AI systems are established.',color:'#f7b731'},
  {id:'MS-1.1',fn:'MEASURE',cat:'MS1',text:'Approaches and metrics for measuring AI risks are established and documented.',color:'#ff6b6b'},
  {id:'MS-1.2',fn:'MEASURE',cat:'MS1',text:'Internal experts who can identify and address AI risks are available to the organization.',color:'#ff6b6b'},
  {id:'MS-1.3',fn:'MEASURE',cat:'MS1',text:'AI test sets are representative of real-world conditions including edge cases.',color:'#ff6b6b'},
  {id:'MS-2.1',fn:'MEASURE',cat:'MS2',text:'Test sets for measuring AI trustworthiness characteristics are in place.',color:'#ff6b6b'},
  {id:'MS-2.2',fn:'MEASURE',cat:'MS2',text:'AI system metrics are documented and tracked throughout the lifecycle.',color:'#ff6b6b'},
  {id:'MS-2.3',fn:'MEASURE',cat:'MS2',text:'AI system performance is regularly evaluated against established metrics.',color:'#ff6b6b'},
  {id:'MS-3.1',fn:'MEASURE',cat:'MS3',text:'AI risks and benefits are evaluated by teams independent from development.',color:'#ff6b6b'},
  {id:'MS-3.2',fn:'MEASURE',cat:'MS3',text:'Human-AI configurations are evaluated for potential failure modes and limitations.',color:'#ff6b6b'},
  {id:'MS-4.1',fn:'MEASURE',cat:'MS4',text:'Measurement feedback is shared with organizational leadership and relevant teams.',color:'#ff6b6b'},
  {id:'MS-4.2',fn:'MEASURE',cat:'MS4',text:'Evaluations are regularly updated to track changes in AI risk over time.',color:'#ff6b6b'},
  {id:'MG-1.1',fn:'MANAGE',cat:'MG1',text:'Plans for managing risks through treatment and response strategies are established.',color:'#51cf66'},
  {id:'MG-1.2',fn:'MANAGE',cat:'MG1',text:'Risk treatment is prioritized based on risk assessment outputs and risk tolerance.',color:'#51cf66'},
  {id:'MG-1.3',fn:'MANAGE',cat:'MG1',text:'Responses to identified AI risks are developed, documented, and tested.',color:'#51cf66'},
  {id:'MG-2.1',fn:'MANAGE',cat:'MG2',text:'Risk treatments (accept, avoid, mitigate, transfer) are implemented with documented rationale.',color:'#51cf66'},
  {id:'MG-2.2',fn:'MANAGE',cat:'MG2',text:'Risk treatment effectiveness is monitored and verified against defined metrics.',color:'#51cf66'},
  {id:'MG-3.1',fn:'MANAGE',cat:'MG3',text:'Responses to incidents and errors involving AI systems are documented and reviewed.',color:'#51cf66'},
  {id:'MG-3.2',fn:'MANAGE',cat:'MG3',text:'AI risk monitoring methods are maintained, evaluated, and improved over time.',color:'#51cf66'},
  {id:'MG-4.1',fn:'MANAGE',cat:'MG4',text:'Post-deployment and residual risks are documented and communicated to stakeholders.',color:'#51cf66'},
  {id:'MG-4.2',fn:'MANAGE',cat:'MG4',text:'Residual risk documentation is reviewed and updated as context changes.',color:'#51cf66'},
  {id:'MG-4.3',fn:'MANAGE',cat:'MG4',text:'Decommissioning plans are in place for AI systems that pose unacceptable risks.',color:'#51cf66'}
];
function filterSubcats(fn){
  subcatFilter=fn;
  ['ALL','GOVERN','MAP','MEASURE','MANAGE'].forEach(function(f){
    var btn=document.getElementById('sf-'+f);
    if(!btn)return;
    var colors={GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'};
    if(f===fn){btn.className='btn';btn.style.borderColor='';btn.style.color='';}
    else{btn.className='btn-tab';if(f!=='ALL'){btn.style.borderColor=colors[f];btn.style.color=colors[f];}}
  });
  if(typeof renderSubcatGrid==='function')renderSubcatGrid();
}

// ===== MATURITY DATA =====
var maturityAnswers={};
var MATURITY_Qs=[
  {fn:'GOVERN',q:'Is there a named owner accountable for AI risk in your organization?'},
  {fn:'GOVERN',q:'Are AI risk policies documented, approved, and communicated to all relevant teams?'},
  {fn:'GOVERN',q:'Are escalation paths and human oversight procedures defined for AI failures?'},
  {fn:'MAP',q:'Do you document intended use and foreseeable unintended use before AI deployment?'},
  {fn:'MAP',q:'Do you assess broader societal impacts beyond immediate users?'},
  {fn:'MAP',q:'Do you maintain a risk register for each AI system currently in production?'},
  {fn:'MEASURE',q:'Do you track accuracy, fairness, or robustness metrics for production AI?'},
  {fn:'MEASURE',q:'Have you conducted adversarial or robustness testing on production AI systems?'},
  {fn:'MEASURE',q:'Do you have a scheduled re-evaluation cadence for production AI systems?'},
  {fn:'MANAGE',q:'Do you have documented incident response plans specific to AI failures?'},
  {fn:'MANAGE',q:'Do you track residual risks after applying mitigation measures?'},
  {fn:'MANAGE',q:'Do you have defined criteria for pausing or shutting down an AI system?'}
];
function scoreMaturity(){
  var scores={GOVERN:0,MAP:0,MEASURE:0,MANAGE:0};
  var counts={GOVERN:3,MAP:3,MEASURE:3,MANAGE:3};
  MATURITY_Qs.forEach(function(q,i){if(maturityAnswers[i]!==undefined)scores[q.fn]+=maturityAnswers[i];});
  var fnColors={GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'};
  var results=Object.keys(scores).map(function(fn){
    var pct=Math.round((scores[fn]/(counts[fn]*2))*100);
    var lbl=pct>=80?'Strong':pct>=50?'Developing':'Early Stage';
    return '<span style="color:'+fnColors[fn]+';font-weight:700">'+fn+'</span>: '+pct+'% ('+lbl+')';
  });
  var det=document.getElementById('maturity-detail');
  if(det)det.innerHTML='<strong>Your Maturity Assessment:</strong><br>'+results.join(' &nbsp;&bull;&nbsp; ')+'<div style="margin-top:8px;font-size:11px;color:#8b949e">Focus on your lowest-scoring function first. Even 50% maturity across all four functions beats 100% in one.</div>';
  if(typeof drawMaturityRadar==='function')drawMaturityRadar(scores,counts);
}
function updateMaturityLive(){
  var scores={GOVERN:0,MAP:0,MEASURE:0,MANAGE:0};
  var counts={GOVERN:3,MAP:3,MEASURE:3,MANAGE:3};
  MATURITY_Qs.forEach(function(q,i){if(maturityAnswers[i]!==undefined)scores[q.fn]+=maturityAnswers[i];});
  if(typeof drawMaturityRadar==='function')drawMaturityRadar(scores,counts);
}

// ===== EU AI ACT DATA =====
var hoveredCrosswalk=null;
var EU_CROSSWALK=[
  {rmfFn:'GOVERN',rmfCat:'G1: Policies',euArt:'Art. 17: Quality Mgmt',euDesc:'Providers of high-risk AI must implement a quality management system covering policies and procedures for responsible AI.',align:0.85,fnColor:'#0984e3'},
  {rmfFn:'GOVERN',rmfCat:'G2: Accountability',euArt:'Art. 9: Risk Management',euDesc:'Requires a documented risk management system with clear roles and responsibilities throughout the AI lifecycle.',align:0.95,fnColor:'#0984e3'},
  {rmfFn:'GOVERN',rmfCat:'G6: Human Oversight',euArt:'Art. 14: Human Oversight',euDesc:'High-risk AI must allow effective human oversight, including ability to override, intervene, or halt the system.',align:1.0,fnColor:'#0984e3'},
  {rmfFn:'MAP',rmfCat:'MAP1: Context',euArt:'Art. 9: Risk Assessment',euDesc:'Risk identification and analysis for known and foreseeable risks to health, safety, and fundamental rights.',align:0.9,fnColor:'#f7b731'},
  {rmfFn:'MAP',rmfCat:'MAP3: Risks & Benefits',euArt:'Art. 13: Transparency',euDesc:'High-risk AI must provide information about purpose, performance metrics, limitations, and intended users.',align:0.75,fnColor:'#f7b731'},
  {rmfFn:'MAP',rmfCat:'MAP5: Societal Impact',euArt:'Art. 43: Conformity',euDesc:'Assessment confirming high-risk AI meets requirements before market placement. Ongoing obligation.',align:0.70,fnColor:'#f7b731'},
  {rmfFn:'MEASURE',rmfCat:'MS1: Metrics',euArt:'Art. 10: Data Governance',euDesc:'Training, validation, and testing data must meet quality criteria including examination for biases.',align:0.80,fnColor:'#ff6b6b'},
  {rmfFn:'MEASURE',rmfCat:'MS2: Evaluation',euArt:'Art. 12: Record-keeping',euDesc:'High-risk AI must automatically log events enabling post-market monitoring and incident investigation.',align:0.85,fnColor:'#ff6b6b'},
  {rmfFn:'MEASURE',rmfCat:'MS4: Feedback',euArt:'Art. 61: Post-market',euDesc:'Providers must proactively collect and analyze data about system performance throughout its operational lifetime.',align:0.90,fnColor:'#ff6b6b'},
  {rmfFn:'MANAGE',rmfCat:'MG2: Response',euArt:'Art. 9: Risk Treatment',euDesc:'Risks must be eliminated or reduced to acceptable levels with appropriate risk management measures.',align:0.90,fnColor:'#51cf66'},
  {rmfFn:'MANAGE',rmfCat:'MG3: Monitor',euArt:'Art. 62: Incidents',euDesc:'Providers must report serious incidents and malfunctions to market surveillance authorities without delay.',align:0.85,fnColor:'#51cf66'},
  {rmfFn:'MANAGE',rmfCat:'MG4: Residual Risk',euArt:'Art. 65: Surveillance',euDesc:'Regulatory authorities conduct market surveillance checks on AI system performance post-deployment.',align:0.65,fnColor:'#51cf66'}
];

// ===== CASE STUDIES DATA =====
var selectedCase=0;
var CASE_STUDIES=[
  {id:'amazon',title:'Amazon Hiring AI',year:'2018',color:'#ff6b6b',
   system:'ML model trained on 10 years of resumes to screen candidates for technical roles at Amazon.',
   wrong:'The model penalized resumes mentioning all-female colleges and downgraded certain extracurricular activities correlated with gender. It had learned from historical data that reflected male-dominated hiring decisions.',
   gaps:{GOVERN:['G2: No named accountability for fairness outcomes','G5: No policy requiring bias testing before hiring AI deployment'],
         MAP:['MAP 3: Bias risk from historical training data not catalogued','MAP 5: Societal gender equity impact not assessed','MAP 1: Unintended use as final decision-maker not documented'],
         MEASURE:['MS 1: No fairness metric defined for demographic parity','MS 2: System not tested across gender-correlated proxies'],
         MANAGE:['MG 3: No monitoring for disparate outcomes post-deployment','MG 2: No planned response if bias was detected']},
   outcome:'Amazon disbanded the team and scrapped the system in 2018 after discovering the bias internally. The system was never used in production hiring decisions.',
   lesson:'Historical data encodes historical bias. Without MAP 3 risk identification and MS 1 fairness metrics, a biased system can operate invisibly for years.'},
  {id:'compas',title:'COMPAS Recidivism',year:'2016',color:'#fd79a8',
   system:'Algorithmic risk score used by US courts to predict likelihood of criminal reoffending and inform bail and sentencing decisions.',
   wrong:'A ProPublica analysis found Black defendants were nearly twice as likely to be falsely flagged high-risk compared to white defendants with similar backgrounds. Northpointe disputed the methodology but the disparate false positive rate was confirmed by multiple analyses.',
   gaps:{GOVERN:['G6: Human oversight requirements not defined - judges varied widely in deference to the score','G2: No clear accountability owner for disparate outcomes'],
         MAP:['MAP 3: Racial bias risk in training data not mapped','MAP 5: Civil liberties impact on affected communities not assessed','MAP 1: Use as decision replacement vs supplement not bounded'],
         MEASURE:['MS 1: Fairness metric (calibration) optimized for accuracy but missed disparate false positive rates','MS 3: No independent fairness evaluation commissioned'],
         MANAGE:['MG 2: No Avoid option exercised despite high-stakes criminal justice context','MG 4: Residual bias risk not communicated to judges using the tool']},
   outcome:'Still used in some US jurisdictions. Sparked national debate on algorithmic fairness in criminal justice. Multiple states have passed algorithmic accountability legislation since.',
   lesson:'In high-stakes domains, MAP 5 societal impact and G6 human oversight policy are not optional. Deployment without these is a governance failure, not a technical one.'},
  {id:'chatgpt-legal',title:'AI Hallucination in Court',year:'2023',color:'#f7b731',
   system:'Attorneys used a large language model to research case law and draft legal briefs submitted to federal court.',
   wrong:'The brief cited six cases that did not exist - all hallucinated by the AI. When the court requested copies of the cases, the attorney submitted AI-generated fake summaries confirming they existed.',
   gaps:{GOVERN:['G1: No firm policy on AI use in legal research and citation','G3: No training on AI hallucination risk for legal professionals'],
         MAP:['MAP 1: Intended use (drafting aid) vs unintended use (authoritative citation) not assessed','MAP 3: Hallucination risk for legal citation not catalogued as high-risk'],
         MEASURE:['MS 2: No output verification process for AI-generated legal citations','MS 3: No expert review of AI outputs before court submission'],
         MANAGE:['MG 1: No mitigation plan for hallucination risk in high-stakes legal context','MG 2: Accept strategy used by default without deliberate risk decision']},
   outcome:'The attorney was sanctioned $5,000. The case became a landmark example of AI hallucination harm. Bar associations across the US issued guidance on AI use in legal practice.',
   lesson:'MAP 1 unintended use assessment would have flagged legal citation as high-risk. G1 policy and G3 training are the GOVERN subcategories that prevent this entire class of failure.'}
];
function selectCase(idx){
  selectedCase=idx;
  for(var i=0;i<3;i++){var b=document.getElementById('case-btn-'+i);if(b)b.className=(i===idx)?'btn':'btn-tab';}
  if(typeof drawCaseStudy==='function')drawCaseStudy();
  showCaseDetail();
}
function showCaseDetail(){
  var det=document.getElementById('case-detail');
  if(!det)return;
  var c=CASE_STUDIES[selectedCase];
  det.innerHTML='<strong style="color:'+c.color+'">'+c.title+' ('+c.year+')</strong><br><strong>What went wrong:</strong> '+c.wrong+'<div style="margin-top:8px;padding:8px 12px;background:rgba(0,0,0,.3);border-radius:6px;font-size:11px"><strong>Lesson:</strong> '+c.lesson+'</div>';
}

// ===== ROADMAP DATA =====
var hoveredRoadmapItem=null;
var ROADMAP_ITEMS=[
  {month:1,duration:2,fn:'GOVERN',color:'#0984e3',label:'Name AI risk owner',
   detail:'G2: Designate one accountable person. Define initial risk tolerance. Conduct AI inventory - what AI systems exist and who built them?'},
  {month:2,duration:2,fn:'GOVERN',color:'#0984e3',label:'Draft AI risk policy',
   detail:'G1: Write a one-page AI risk policy. G5: Define acceptable use cases and prohibited applications. Establish incident escalation path.'},
  {month:3,duration:2,fn:'MAP',color:'#f7b731',label:'MAP one high-risk system',
   detail:'MAP 1-3: Pick your highest-risk AI system. Document intended use, affected parties, top 5 risks. Template becomes reusable.'},
  {month:4,duration:2,fn:'MAP',color:'#f7b731',label:'Build first risk register',
   detail:'MAP 4: Formalize risk prioritization by likelihood x impact. MAP 5: Assess societal impacts. First risk register complete.'},
  {month:5,duration:2,fn:'MEASURE',color:'#ff6b6b',label:'Define metrics',
   detail:'MS 1: For each high-priority risk, define one measurable metric. Baseline current performance before any changes.'},
  {month:6,duration:2,fn:'MEASURE',color:'#ff6b6b',label:'Run evaluation suite',
   detail:'MS 2: Test against defined metrics including fairness and robustness. MS 3: Involve domain experts in evaluation.'},
  {month:7,duration:3,fn:'MANAGE',color:'#51cf66',label:'Build response playbook',
   detail:'MG 1-2: For each risk, document treatment decision with rationale. Assign mitigation owners and timelines.'},
  {month:9,duration:2,fn:'MANAGE',color:'#51cf66',label:'Launch monitoring',
   detail:'MG 3: Establish continuous metric monitoring. Set alert thresholds. Define and test incident response process.'},
  {month:11,duration:2,fn:'GOVERN',color:'#0984e3',label:'Board review + expand',
   detail:'Present AI risk summary to leadership. Expand MAP and MEASURE to 2-3 more AI systems. Plan year 2 maturity goals.'}
];

// ===== TRADE-OFF DATA =====
var selectedTradeoff=0;
var tradeoffSlider=50;
var TRADEOFF_PAIRS=[
  {a:'Accurate',b:'Explainable',colA:'#74b9ff',colB:'#a29bfe',
   tension:'Higher accuracy often requires complex models (deep neural nets, ensemble methods) that are hard to explain. Simple, explainable models (decision trees, logistic regression) typically sacrifice accuracy.',
   examples:['95% accurate deep model with 1000 features vs 89% accurate decision tree with 12 interpretable rules','Medical imaging AI: ResNet accuracy vs radiologist-readable feature analysis'],
   sweetSpot:'SHAP values and feature importance give partial explainability without full accuracy sacrifice. Post-hoc explanation + high-accuracy model is often viable.',
   rmfLink:'MS 1: Define both accuracy AND explainability metrics. GOVERN: document which trade-off was made and why.'},
  {a:'Fair',b:'Accurate',colA:'#fd79a8',colB:'#74b9ff',
   tension:'Demographic parity (equal selection rates) requires different thresholds per group, reducing overall accuracy. Multiple fairness definitions (parity vs equalized odds vs calibration) cannot all be satisfied simultaneously.',
   examples:['Hiring model: 82% accurate unconstrained vs 79% with gender parity constraint','Credit scoring: calibration per race group vs equal false positive rates - mathematically incompatible'],
   sweetSpot:'Define which fairness metric is legally and ethically required for your context BEFORE training. Then optimize accuracy within that constraint.',
   rmfLink:'MAP 3: Catalogue which fairness definition applies. MS 1: Measure the metric you chose, not the easiest one.'},
  {a:'Privacy',b:'Useful',colA:'#00b894',colB:'#f7b731',
   tension:'Data minimization reduces signal available for accurate predictions. Differential privacy adds calibrated noise. Federated learning prevents centralization but limits model quality.',
   examples:['Federated healthcare model: 91% accuracy vs 96% centralized version','Differential privacy on census data: reduces utility for small subgroups most'],
   sweetSpot:'Federated learning plus differential privacy gives most of the utility with most of the privacy. Acceptable for many healthcare and finance use cases.',
   rmfLink:'MAP 3: Privacy risk assessment. MS 1: Measure privacy budget consumed. G1: Policy on data minimization requirements.'},
  {a:'Secure',b:'Accessible',colA:'#ff6b6b',colB:'#51cf66',
   tension:'Adversarial defenses, rate limiting, and access controls make AI harder to use legitimately. Open APIs enable both legitimate use and adversarial probing. CAPTCHA harms accessibility.',
   examples:['Content moderation API: strict rate limiting blocks both spam campaigns and legitimate researchers','Fraud detection: closed-loop system is more secure but prevents external audit for bias'],
   sweetSpot:'Tiered access: open for low-risk use cases, credentialed for high-volume or sensitive access. Separation of audit access from production access.',
   rmfLink:'MAP 3: Model security risk. G6: Policy on who can access AI systems and under what conditions.'},
  {a:'Safe',b:'Capable',colA:'#51cf66',colB:'#6c5ce7',
   tension:'Safety guardrails (refusal, uncertainty flags, conservative outputs) reduce the range of tasks the system performs. Highly capable generative AI requires more constraints to prevent misuse.',
   examples:['Medical AI: always deferring when uncertain is safer but creates bottlenecks in low-resource settings','LLM content policies: strict filtering prevents misuse but also blocks legitimate creative and research use'],
   sweetSpot:'Context-adaptive safety: stricter guardrails in high-stakes domains (medical, legal, financial), more flexible in low-risk creative applications.',
   rmfLink:'MAP 1: Define the deployment context and risk tolerance. MG 2: Explicit decision on acceptable capability-safety balance per context.'}
];
function selectTradeoff(idx){
  selectedTradeoff=idx;
  tradeoffSlider=50;
  var sl=document.getElementById('sl-tradeoff');if(sl)sl.value=50;
  for(var i=0;i<5;i++){var b=document.getElementById('tb-'+i);if(b)b.className=(i===idx)?'btn':'btn-tab';}
  var p=TRADEOFF_PAIRS[idx];
  var la=document.getElementById('tradeoff-lbl-a');var lb=document.getElementById('tradeoff-lbl-b');
  if(la){la.textContent=p.a;la.style.color=p.colA;}
  if(lb){lb.textContent=p.b;lb.style.color=p.colB;}
  if(typeof drawTradeoffs==='function')drawTradeoffs();
  showTradeoffDetail();
}
function showTradeoffDetail(){
  var det=document.getElementById('tradeoff-detail');
  if(!det)return;
  var p=TRADEOFF_PAIRS[selectedTradeoff];
  var bias=tradeoffSlider<40?('Optimizing for <strong style="color:'+p.colA+'">'+p.a+'</strong>'):tradeoffSlider>60?('Optimizing for <strong style="color:'+p.colB+'">'+p.b+'</strong>'):'<strong>Balanced</strong> approach';
  det.innerHTML='<strong style="color:'+p.colA+'">'+p.a+'</strong> vs <strong style="color:'+p.colB+'">'+p.b+'</strong> &mdash; '+p.tension+'<div style="margin-top:8px;padding:8px 12px;background:rgba(0,0,0,.3);border-radius:6px;font-size:11px"><strong>Sweet spot:</strong> '+p.sweetSpot+'<br><strong>RMF action:</strong> '+p.rmfLink+'</div>';
}

// ===== SECTOR PROFILES DATA =====
var selectedSector=0;
var SECTORS=[
  {id:'healthcare',label:'Healthcare',color:'#ff6b6b',
   importance:{GOVERN:85,MAP:90,MEASURE:95,MANAGE:88},
   topRisks:['Hallucination in clinical AI','Model drift in diagnostic systems','Bias in treatment recommendations','Over-reliance by clinicians','Privacy leakage from health records'],
   riskColors:['#ff6b6b','#f7b731','#fd79a8','#0984e3','#6c5ce7'],
   keyMetrics:'Sensitivity and specificity by demographic group; out-of-distribution detection; human override rate',
   regulatory:'FDA AI/ML action plan + EU AI Act (high-risk) + HIPAA + state health data laws'},
  {id:'finance',label:'Financial Services',color:'#f7b731',
   importance:{GOVERN:90,MAP:85,MEASURE:95,MANAGE:80},
   topRisks:['Credit scoring disparate impact','Model risk in trading algorithms','Explainability for adverse action notices','Data poisoning in fraud detection','Regulatory model validation gaps'],
   riskColors:['#fd79a8','#ff6b6b','#6c5ce7','#e17055','#f7b731'],
   keyMetrics:'Disparate impact ratio (4/5ths rule); model stability index; feature attribution for declined applications',
   regulatory:'SR 11-7 Model Risk Management + ECOA/FCRA + Basel III + CFPB guidance on AI in lending'},
  {id:'criminal-justice',label:'Criminal Justice',color:'#6c5ce7',
   importance:{GOVERN:95,MAP:90,MEASURE:85,MANAGE:80},
   topRisks:['Racial bias in risk assessments','Over-reliance replacing human judgment','Lack of explainability for decisions','Historical discrimination in training data','Civil liberties impact at scale'],
   riskColors:['#ff6b6b','#fd79a8','#a29bfe','#e17055','#6c5ce7'],
   keyMetrics:'False positive/negative rates by race and gender; calibration across demographic groups; judge override rate',
   regulatory:'14th Amendment equal protection + state algorithmic accountability laws (IL, CA, NY) + Civil Rights Act'},
  {id:'hr',label:'HR & Recruitment',color:'#00b894',
   importance:{GOVERN:80,MAP:90,MEASURE:85,MANAGE:75},
   topRisks:['Gender and racial bias in screening','Personality assessment validity','Interview AI bias by speech patterns','Proxy discrimination via zip code','EEOC disparate impact liability'],
   riskColors:['#fd79a8','#f7b731','#ff6b6b','#6c5ce7','#e17055'],
   keyMetrics:'Adverse impact ratio by protected class (4/5ths rule); selection rate parity; interview score consistency',
   regulatory:'EEOC guidance on AI in employment + NYC Local Law 144 (mandatory bias audits) + EU AI Act (high-risk)'}
];
function selectSector(idx){
  selectedSector=idx;
  for(var i=0;i<4;i++){var b=document.getElementById('sec-btn-'+i);if(b)b.className=(i===idx)?'btn':'btn-tab';}
  if(typeof drawSectorProfile==='function')drawSectorProfile();
  var s=SECTORS[idx];
  var det=document.getElementById('sector-detail');
  if(det)det.innerHTML='<strong style="color:'+s.color+'">'+s.label+'</strong><br><strong>Key metrics:</strong> '+s.keyMetrics+'<br><strong>Regulatory:</strong> '+s.regulatory;
}

// ===== ACTOR MAP DATA =====
var selectedActor=null;
var hoveredActor=null;
var ACTORS=[
  {id:'developer',label:'AI Developer',color:'#6c5ce7',
   desc:'Creates the AI model, training pipeline, and technical documentation.',
   governs:['G1: Document dev policies','G3: Ensure team competencies'],
   maps:['MAP 2: Apply domain knowledge','MAP 3: Identify technical risks'],
   measures:['MS 1: Define initial metrics','MS 2: Pre-deployment evaluation','MS 3: Internal red-team'],
   manages:['MG 1: Document known limitations','MG 4: Communicate residual risks to deployer']},
  {id:'deployer',label:'AI Deployer',color:'#0984e3',
   desc:'Deploys the AI in a specific context and configures it for their use case.',
   governs:['G2: Define deployment accountability','G5: Establish deployment risk policy'],
   maps:['MAP 1: Document intended and unintended use','MAP 5: Assess societal impact for context'],
   measures:['MS 2: Context-specific evaluation','MS 4: Post-deployment feedback loops'],
   manages:['MG 2: Select risk treatment strategy','MG 3: Operate monitoring systems']},
  {id:'operator',label:'Operator / User',color:'#f7b731',
   desc:'Uses the AI day-to-day in professional contexts (doctors, judges, HR managers).',
   governs:['G4: Commit to risk management practices','G6: Exercise human oversight'],
   maps:['MAP 1: Report unintended use cases observed in practice'],
   measures:['MS 4: Provide user feedback on failures and unexpected outputs'],
   manages:['MG 2: Exercise override authority','MG 3: Report incidents via defined channels']},
  {id:'community',label:'Affected Communities',color:'#fd79a8',
   desc:'Individuals and groups impacted by AI decisions, often without direct interaction.',
   governs:['G1: Provide input into governance policy development','G4: Advocate for accountability mechanisms'],
   maps:['MAP 5: Participate in societal impact assessment as stakeholders'],
   measures:['MS 3: Provide external evaluation input and lived-experience data'],
   manages:['MG 4: Receive clear residual risk communications']},
  {id:'regulator',label:'Regulator',color:'#51cf66',
   desc:'Sets rules, enforces compliance, and conducts market surveillance of AI systems.',
   governs:['G5: Define regulatory policy requirements','G2: Enforce accountability standards'],
   maps:['MAP 3: Define prohibited risk categories and prohibited uses'],
   measures:['MS 2: Mandate evaluation standards and third-party audit requirements'],
   manages:['MG 3: Market surveillance post-deployment','MG 4: Enforcement actions on residual harms']}
];

// ===== QUIZ DATA =====
var QUIZ_QUESTIONS=[
  {fn:'GOVERN',q:'Does your org have a named person accountable for AI risk?',weight:2},
  {fn:'GOVERN',q:'Is there a written policy defining acceptable use of AI?',weight:2},
  {fn:'GOVERN',q:'Do all AI teams receive training on AI risk principles?',weight:1},
  {fn:'GOVERN',q:'Does senior leadership receive regular AI risk reports?',weight:1},
  {fn:'MAP',q:'Do you document the intended use case for each AI system before deployment?',weight:2},
  {fn:'MAP',q:'Have you identified all stakeholders affected by each AI system?',weight:1},
  {fn:'MAP',q:'Do you maintain a risk register with likelihood and impact ratings?',weight:2},
  {fn:'MAP',q:'Do you assess societal impacts of AI beyond direct users?',weight:1},
  {fn:'MEASURE',q:'Do you measure fairness and bias metrics for each AI system?',weight:2},
  {fn:'MEASURE',q:'Is there a defined evaluation process before each model deployment?',weight:2},
  {fn:'MEASURE',q:'Do you collect user feedback on AI system failures?',weight:1},
  {fn:'MEASURE',q:'Do you test AI systems for robustness to adversarial inputs?',weight:1},
  {fn:'MANAGE',q:'Is there a documented process for responding to AI incidents?',weight:2},
  {fn:'MANAGE',q:'Are risk treatment decisions formally documented with rationale?',weight:2},
  {fn:'MANAGE',q:'Is there a process to pause AI systems if risk exceeds tolerance?',weight:2}
];
var quizAnswers=new Array(15).fill(null);
var quizCurrentQ=0;
var quizMaxScores={GOVERN:6,MAP:6,MEASURE:6,MANAGE:6};
var quizScores={GOVERN:0,MAP:0,MEASURE:0,MANAGE:0};
var quizComplete=false;
var quizStarted=false;
function quizStart(){
  quizAnswers=new Array(15).fill(null);
  quizCurrentQ=0;quizComplete=false;quizStarted=true;
  quizScores={GOVERN:0,MAP:0,MEASURE:0,MANAGE:0};
  renderQuizQ();
  if(typeof drawQuizRadar==='function')drawQuizRadar();
}
function quizAnswer(val){
  quizAnswers[quizCurrentQ]=val;
  quizCurrentQ++;
  if(quizCurrentQ>=QUIZ_QUESTIONS.length){quizFinish();return;}
  renderQuizQ();
}
function fnColor(fn){return{GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'}[fn]||'#6c5ce7';}
function renderQuizQ(){
  var q=QUIZ_QUESTIONS[quizCurrentQ];
  var panel=document.getElementById('quiz-question');
  if(!panel)return;
  var pct=Math.round((quizCurrentQ/QUIZ_QUESTIONS.length)*100);
  panel.innerHTML='<div style="margin-bottom:10px;"><div style="height:4px;background:#30363d;border-radius:2px;"><div style="height:4px;background:#6c5ce7;border-radius:2px;width:'+pct+'%;transition:width .3s"></div></div><div style="margin-top:4px;font-size:10px;color:#8b949e">Question '+(quizCurrentQ+1)+' of '+QUIZ_QUESTIONS.length+' &mdash; <strong style="color:'+fnColor(q.fn)+'">'+q.fn+'</strong></div></div><div style="font-size:14px;color:#c9d1d9;margin-bottom:16px;font-weight:600">'+q.q+'</div><div style="display:flex;gap:12px;"><button class="btn" onclick="quizAnswer(true)" style="background:#51cf66">Yes</button><button class="btn" onclick="quizAnswer(false)" style="background:#ff6b6b">No</button><button class="btn-tab" onclick="quizAnswer(null)" style="margin-left:8px">Not sure</button></div>';
}
function quizFinish(){
  quizComplete=true;
  quizScores={GOVERN:0,MAP:0,MEASURE:0,MANAGE:0};
  quizAnswers.forEach(function(a,i){var q=QUIZ_QUESTIONS[i];if(a===true)quizScores[q.fn]+=q.weight;});
  var panel=document.getElementById('quiz-question');
  if(panel)panel.innerHTML='<strong style="color:#51cf66">&#10003; Assessment complete!</strong> Your radar chart is above. <button class="btn-tab" onclick="quizStart()" style="margin-left:12px">Retake</button>';
  if(typeof drawQuizRadar==='function')drawQuizRadar();
  var recs=document.getElementById('quiz-recs');
  if(recs){
    var fns=['GOVERN','MAP','MEASURE','MANAGE'];
    var maxS={GOVERN:6,MAP:6,MEASURE:6,MANAGE:6};
    var sorted=fns.slice().sort(function(a,b){return (quizScores[a]/maxS[a])-(quizScores[b]/maxS[b]);});
    var tips={GOVERN:'Start with GV-2.2: name an AI risk owner and define risk tolerance.',MAP:'Start with MAP 1.1: document intended use and stakeholders for your highest-risk system.',MEASURE:'Start with MS-1.1: define one measurable metric per risk. Baseline before optimizing.',MANAGE:'Start with MG-1.1: document treatment decisions for each prioritized risk.'};
    recs.innerHTML='<strong>Priority gaps to address:</strong><br>'+sorted.slice(0,2).map(function(fn){return '<span style="color:'+fnColor(fn)+'">'+fn+'</span>: '+tips[fn];}).join('<br>');
  }
}

// ===== CLASSIFIER DATA =====
var CLASSIFIER_RESULT=null;
function runClassifier(){
  var domain=document.getElementById('cls-domain').value;
  var automation=document.getElementById('cls-automation').value;
  var stakes=document.getElementById('cls-stakes').value;
  var dataSens=document.getElementById('cls-data').value;
  var score=0;
  score+={general:0,education:1,hr:2,finance:2,healthcare:3,justice:3}[domain]||0;
  score+={advisory:0,semi:1,full:2}[automation]||0;
  score+={low:0,medium:1,high:2,critical:3}[stakes]||0;
  score+={public:0,internal:1,sensitive:2,personal:3}[dataSens]||0;
  var tier=score<=3?'Minimal Risk':score<=5?'Limited Risk':score<=8?'High Risk':'Critical Risk';
  var tierColor=score<=3?'#51cf66':score<=5?'#f7b731':score<=8?'#ff6b6b':'#e84118';
  var fnsToFocus=['GOVERN'];
  if(score>=3)fnsToFocus.push('MAP');
  if(score>=5)fnsToFocus.push('MEASURE');
  if(score>=7)fnsToFocus.push('MANAGE');
  var subcats={justice:['GV-1.2','GV-2.2','MS-2.5','MG-2.4','MAP-5.1'],healthcare:['GV-6.2','MS-2.3','MS-2.6','MG-3.2','MAP-3.5'],finance:['GV-2.2','MS-2.5','MAP-5.2','MG-1.3'],hr:['MS-2.5','MAP-3.5','GV-2.2','MG-2.4'],education:['GV-4.2','MAP-2.1','MS-1.1'],general:['GV-1.1','MAP-1.1','MS-1.1','MG-1.1']};
  var regs={justice:'14th Amendment equal protection; state algorithmic accountability laws',healthcare:'FDA AI/ML action plan; EU AI Act (high-risk); HIPAA',finance:'SR 11-7 Model Risk; ECOA; CFPB AI lending guidance',hr:'EEOC AI guidance; NYC Local Law 144; EU AI Act',education:'FERPA; state student data privacy laws',general:'EU AI Act if EU-deployed; applicable national AI strategies'};
  var panel=document.getElementById('cls-result');
  if(!panel)return;
  panel.innerHTML='<div style="margin-bottom:12px"><span style="font-size:22px;font-weight:800;color:'+tierColor+'">'+tier+'</span> <span style="color:#8b949e;font-size:12px">(score: '+score+'/12)</span></div><strong>Functions to prioritize:</strong> '+fnsToFocus.map(function(f){return '<span style="color:'+fnColor(f)+';font-weight:700">'+f+'</span>';}).join(' &rarr; ')+'<br><strong>Key subcategories:</strong> '+(subcats[domain]||subcats.general).join(', ')+'<br><strong>Regulatory signals:</strong> '+(regs[domain]||regs.general);
}

// ===== SANDBOX DATA =====
var sandboxRisks=[];
var sandboxDragging=null;
var sandboxSelectedIdx=null;
function sandboxClear(){sandboxRisks=[];sandboxSelectedIdx=null;if(typeof drawSandbox==='function')drawSandbox();var d=document.getElementById('sandbox-detail');if(d)d.innerHTML='Grid cleared. Click to place risks.';}
function sandboxExport(){
  if(!sandboxRisks.length){alert('No risks placed yet. Click the grid to add risks.');return;}
  var lines=sandboxRisks.map(function(r,i){var quad=r.px>0.5&&r.py<0.5?'ACT NOW':r.px<=0.5&&r.py<0.5?'PRIORITIZE':r.px>0.5?'WATCH':'MONITOR';return (i+1)+'. '+r.label+' ('+quad+'): Likelihood='+Math.round(r.px*100)+'%, Impact='+Math.round((1-r.py)*100)+'%';});
  alert('Risk Register Export:\\n\\n'+lines.join('\\n'));
}

// ===== INCIDENT TREE DATA =====
var INCIDENT_NODES=[
  {id:0,text:'Your AI system has produced harmful or unexpected output',type:'start',color:'#ff6b6b',yes:1,no:null,yesLabel:'Investigate',noLabel:null,rmf:''},
  {id:1,text:'Is harm ongoing right now?',type:'decision',color:'#ff6b6b',yes:2,no:3,yesLabel:'Yes, active now',noLabel:'No, already occurred',rmf:'MG-3.1'},
  {id:2,text:'Can you pause or disable the AI system?',type:'decision',color:'#e84118',yes:4,no:5,yesLabel:'Yes',noLabel:'No',rmf:'MG-2.2'},
  {id:3,text:'Collect evidence: log outputs, user reports, and timestamps',type:'action',color:'#0984e3',yes:6,no:null,yesLabel:'Done, continue',noLabel:null,rmf:'MG-3.1'},
  {id:4,text:'PAUSE SYSTEM. Notify affected users and stakeholders immediately',type:'action',color:'#e84118',yes:6,no:null,yesLabel:'Done, continue',noLabel:null,rmf:'MG-2.2 / MG-3.2'},
  {id:5,text:'Apply compensating controls. Increase human oversight of all outputs',type:'action',color:'#f7b731',yes:6,no:null,yesLabel:'Done, continue',noLabel:null,rmf:'GV-6.2 / MG-2.2'},
  {id:6,text:'Is the root cause understood?',type:'decision',color:'#6c5ce7',yes:7,no:8,yesLabel:'Yes, root cause known',noLabel:'No, unclear cause',rmf:'MAP-3.1'},
  {id:7,text:'Implement fix. Document treatment decision and residual risk level',type:'action',color:'#51cf66',yes:null,no:null,yesLabel:null,noLabel:null,rmf:'MG-1.1 / MG-4.1'},
  {id:8,text:'Escalate to AI risk team. Commission root cause analysis and external review',type:'action',color:'#fd79a8',yes:null,no:null,yesLabel:null,noLabel:null,rmf:'GV-2.2 / MAP-3.1 / MG-4.2'}
];
var incidentCurrentNode=0;
var incidentPath=[];
var incidentStarted=false;
function incidentStart(){
  incidentCurrentNode=0;incidentPath=[0];incidentStarted=true;
  renderIncidentStep();
  if(typeof drawIncidentTree==='function')drawIncidentTree();
}
function incidentNext(branch){
  var node=INCIDENT_NODES[incidentCurrentNode];
  var next=(branch==='yes')?node.yes:node.no;
  if(next!==null&&next!==undefined){incidentCurrentNode=next;incidentPath.push(next);}
  renderIncidentStep();
  if(typeof drawIncidentTree==='function')drawIncidentTree();
}
function incidentReset(){incidentCurrentNode=0;incidentPath=[0];renderIncidentStep();if(typeof drawIncidentTree==='function')drawIncidentTree();}
function renderIncidentStep(){
  var node=INCIDENT_NODES[incidentCurrentNode];
  var panel=document.getElementById('incident-step');
  if(!panel)return;
  var html='<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="width:8px;height:8px;border-radius:50%;background:'+node.color+'"></div><span style="font-size:10px;color:#8b949e">Step '+incidentPath.length+' of max 5</span></div>';
  html+='<div style="font-size:14px;color:'+node.color+';font-weight:700;margin-bottom:8px">'+node.text+'</div>';
  if(node.rmf)html+='<div style="font-size:11px;color:#a29bfe;margin-bottom:10px">RMF: <strong>'+node.rmf+'</strong></div>';
  if(node.type==='decision'){
    html+='<div style="display:flex;gap:12px;"><button class="btn" onclick="incidentNext(\\'yes\\')" style="background:#51cf66">'+node.yesLabel+'</button><button class="btn" onclick="incidentNext(\\'no\\')" style="background:#ff6b6b">'+node.noLabel+'</button></div>';
  } else if(node.type==='action'&&node.yes!==null){
    html+='<button class="btn" onclick="incidentNext(\\'yes\\')">'+node.yesLabel+'</button>';
  } else {
    html+='<div style="color:#51cf66;font-size:12px;font-weight:600">&#10003; Resolution path identified</div><button class="btn-tab" onclick="incidentReset()" style="margin-top:10px">Restart</button>';
  }
  panel.innerHTML=html;
}

// ===== FRAMEWORK COMPARISON DATA =====
var FRAMEWORK_HEADERS=['Governance','Risk Assessment','Metrics','Monitoring','Transparency','Accountability','Human Oversight','Incident Response'];
var FRAMEWORK_ROWS=[
  {name:'NIST AI RMF',color:'#6c5ce7',scores:[3,3,3,3,2,3,3,3],notes:['All 6 GOVERN categories cover org governance','MAP 1-5 provide structured risk ID and context','MS-1 to MS-4 define measurable metrics','MG-3 mandates ongoing monitoring','GV-1 requires transparency to stakeholders','GV-2 assigns explicit accountability','GV-6 and MAP 1 emphasize human oversight','MG-3.2 requires incident response process']},
  {name:'ISO 42001',color:'#0984e3',scores:[3,3,2,2,2,3,2,2],notes:['Clause 5-6 cover leadership and planning','Clause 8 covers operational risk assessment','Clause 9 covers performance evaluation, less metric-specific','Clause 9.1 covers monitoring but less detailed','Annex A controls include some transparency requirements','Clause 5.3 assigns roles and responsibilities','Management system approach implies human review','Clause 10 covers improvement, incident handling partial']},
  {name:'EU AI Act',color:'#f7b731',scores:[3,3,2,2,3,3,3,2],notes:['Art. 9 requires risk management systems for high-risk AI','Art. 9 mandates systematic risk assessment','Art. 9(7) requires performance metrics but not specific ones','Art. 72 post-market monitoring for providers','Art. 13 transparency and provision of information','Art. 16-21 provider and deployer obligations','Art. 14 mandates human oversight for high-risk AI','Art. 73 reporting of serious incidents to authorities']},
  {name:'OECD AI Principles',color:'#00b894',scores:[2,2,1,1,3,2,2,1],notes:['Principle 1.3 covers inclusive growth and governance','Principle 1.4 covers security and safety but less prescriptive','No specific metric requirements','No specific monitoring requirements','Principle 1.3 covers transparency and explainability','Principle 1.5 covers accountability','Principle 1.4 mentions human oversight','Minimal incident response guidance']},
  {name:'NIST CSF',color:'#fd79a8',scores:[2,2,3,3,1,2,1,3],notes:['Govern function covers org risk strategy','Identify function covers risk assessment','Protect and Detect functions have strong measurement','Detect function is entirely about monitoring','Limited AI-specific transparency requirements','Govern function covers accountability structure','Respond function has human-in-loop elements','Respond and Recover functions are comprehensive']}
];
var hoveredFrameworkCell=null;
var COVERAGE_LABELS=['No Coverage','Basic','Moderate','Strong'];

// ===== GLOSSARY DATA =====
var GLOSSARY_TERMS=[
  {term:'AI Actor',fn:'GOVERN',def:'Any individual or organization involved in the design, development, deployment, evaluation, or operation of an AI system. Includes developers, deployers, operators, affected communities, and regulators.'},
  {term:'AI Risk',fn:'MAP',def:'The combination of the probability that an AI system will cause harm and the severity of that potential harm. Risk is context-dependent: the same system may pose different risks in different deployment contexts.'},
  {term:'Context of Use',fn:'MAP',def:'The conditions under which an AI system is deployed, including intended use case, affected parties, environment, and operational constraints. MAP is primarily concerned with establishing context.'},
  {term:'Risk Tolerance',fn:'GOVERN',def:'The level of risk an organization is willing to accept in pursuit of its objectives. GV-2.2 requires that AI risk tolerance be established, communicated, and maintained across the organization.'},
  {term:'Residual Risk',fn:'MANAGE',def:'The risk that remains after risk treatment measures have been applied. MG-4 requires that residual risk be documented, tracked, and communicated to relevant stakeholders.'},
  {term:'Trustworthiness',fn:'GOVERN',def:'The degree to which an AI system can be trusted to behave as intended across contexts. NIST defines 7 characteristics of trustworthy AI: accountable, explainable, privacy-enhanced, reliable, safe, secure, and fair.'},
  {term:'AI Lifecycle',fn:'GOVERN',def:'The stages of an AI system from initial conception through retirement: plan and design, data and development, deployment, operation, and decommission. The RMF applies across all stages.'},
  {term:'Risk Register',fn:'MAP',def:'A structured record of identified AI risks including their likelihood, potential impact, priority, and assigned owner. MAP 4 describes the process of maintaining and using a risk register.'},
  {term:'Societal Risk',fn:'MAP',def:'Harms that affect communities or society broadly, beyond the direct users of an AI system. MAP-5 requires assessment of societal impacts as part of the risk identification process.'},
  {term:'Impact Assessment',fn:'MAP',def:'A systematic evaluation of the potential benefits and harms of an AI system for individuals, groups, and society. Required under MAP-5 before deployment of significant AI systems.'},
  {term:'Reliability',fn:'MEASURE',def:'The ability of an AI system to perform as intended consistently across contexts and over time. One of the 7 trustworthiness characteristics; measured through MS-2 evaluation processes.'},
  {term:'Robustness',fn:'MEASURE',def:'The ability of an AI system to maintain performance under adversarial inputs, distributional shift, or unexpected conditions. MS-2.6 covers robustness testing as part of the evaluation process.'},
  {term:'Explainability',fn:'MEASURE',def:'The degree to which the internal processes and outputs of an AI system can be understood by humans. Distinct from interpretability, which is about understanding model internals specifically.'},
  {term:'Bias',fn:'MEASURE',def:'Systematic errors in AI outputs that produce unfair treatment of individuals or groups based on protected characteristics. MS-2.5 covers bias evaluation; MAP-3 covers bias in risk identification.'},
  {term:'Calibration',fn:'MEASURE',def:'The degree to which a model confidence score reflects its actual accuracy. A well-calibrated model that says 80% confident is correct 80% of the time across demographic groups.'},
  {term:'Risk Treatment',fn:'MANAGE',def:'The process of selecting and implementing options to address identified risks. Options include: accept (acknowledge and proceed), avoid (do not deploy), mitigate (reduce likelihood or impact), and transfer (shift responsibility, e.g., insurance).'},
  {term:'Incident Response',fn:'MANAGE',def:'A defined process for detecting, reporting, analyzing, and recovering from AI system failures or harmful outputs. MG-3.2 requires organizations to have a pre-defined incident response plan before deployment.'},
  {term:'Human Oversight',fn:'GOVERN',def:'The capability for humans to monitor, intervene in, and override AI system decisions. GV-6 covers policies for human oversight; MAP-1 documents where oversight is required in the intended use case.'},
  {term:'Accountability',fn:'GOVERN',def:'Clear assignment of responsibility for AI system outcomes to specific individuals or teams. GV-2 requires accountability structures to be defined: who is responsible for what, with what authority.'},
  {term:'Transparency',fn:'GOVERN',def:'The degree to which stakeholders can access meaningful information about an AI system including its purpose, data sources, design decisions, and limitations. Distinct from explainability, which focuses on model internals.'},
  {term:'Subcategory',fn:'GOVERN',def:'The most granular level of the RMF hierarchy. Each of the 4 functions contains categories (e.g., GV-1, MAP-3, MS-2), and each category contains subcategories (e.g., GV-1.1, MAP-3.5). There are 72 subcategories in total.'},
  {term:'Profile',fn:'GOVERN',def:'A customized subset of the AI RMF tailored to a specific sector, use case, or risk tolerance. The Generative AI Profile (NIST-AI-600-1) and Critical Infrastructure Profile are two published extensions.'},
  {term:'Intended Use',fn:'MAP',def:'The specific purpose and context for which an AI system is designed and authorized. MAP-1 requires documenting intended use; any deployment beyond intended use becomes unintended use and increases risk.'},
  {term:'Hallucination',fn:'MAP',def:'AI system outputs that are confidently stated but factually incorrect or fabricated. A key GenAI-specific risk identified in the Generative AI Profile (NIST-AI-600-1) as AI-generated content issues.'},
  {term:'Prompt Injection',fn:'MAP',def:'An attack where malicious content in AI system inputs overrides system instructions. A key GenAI-specific risk; relevant to MAP-3 risk identification and MG-1 mitigation planning.'},
  {term:'Model Drift',fn:'MEASURE',def:'The degradation of AI system performance over time as the statistical distribution of real-world inputs diverges from training data. MG-3 monitoring processes are designed to detect drift before it causes harm.'},
  {term:'Differential Privacy',fn:'MEASURE',def:'A mathematical framework for quantifying and limiting the privacy risk of releasing aggregate information about a dataset. Provides a measurable privacy guarantee that can be tracked under MS-1 metrics.'},
  {term:'Red-teaming',fn:'MEASURE',def:'An adversarial testing approach where a team attempts to find failures, harms, or vulnerabilities in an AI system before deployment. MS-3 covers internal red-teaming; the GenAI Profile extends this to safety behaviors.'},
  {term:'Stakeholder',fn:'MAP',def:'Any individual or group affected by or with an interest in an AI system. MAP-2 requires identifying all relevant stakeholders, including indirect stakeholders who may be affected without directly using the system.'},
  {term:'Adverse Action',fn:'MANAGE',def:'A negative decision made about an individual based on AI system output, such as a declined loan or rejected job application. Adverse action notices (required by ECOA/FCRA) must be explainable, which is an MEASURE challenge.'}
];
var glossaryFnFilter='all';
function filterGlossary(){
  var q=(document.getElementById('glossary-search').value||'').toLowerCase();
  renderGlossary(q,glossaryFnFilter);
}
function filterGlossaryFn(fn){
  glossaryFnFilter=fn;
  ['all','GOVERN','MAP','MEASURE','MANAGE'].forEach(function(f){var b=document.getElementById('gf-'+f);if(b){b.style.borderColor=(f===fn)?'#6c5ce7':'';b.style.color=(f===fn)?'#a29bfe':'';}});
  filterGlossary();
}
function renderGlossary(q,fn){
  var grid=document.getElementById('glossary-grid');
  if(!grid)return;
  var filtered=GLOSSARY_TERMS.filter(function(t){
    var matchQ=!q||t.term.toLowerCase().includes(q)||t.def.toLowerCase().includes(q);
    var matchFn=fn==='all'||t.fn===fn;
    return matchQ&&matchFn;
  });
  var fnColors={GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'};
  grid.innerHTML=filtered.map(function(t){
    return '<div class="card" style="margin-bottom:0;"><div style="display:flex;align-items:baseline;gap:8px;margin-bottom:6px;"><span style="font-weight:700;color:#c9d1d9;font-size:13px">'+t.term+'</span><span style="font-size:9px;background:'+fnColors[t.fn]+'22;color:'+fnColors[t.fn]+';padding:2px 7px;border-radius:10px;font-weight:700">'+t.fn+'</span></div><div style="font-size:12px;color:#8b949e;line-height:1.6">'+t.def+'</div></div>';
  }).join('');
  if(!filtered.length)grid.innerHTML='<div style="color:#8b949e;font-size:13px;grid-column:1/-1">No terms match. Try a different search or filter.</div>';
}
function initGlossary(){renderGlossary('','all');}

// ===== SIMULATOR DATA =====
var SIM_SYSTEMS=[
  {id:'hiring',label:'Hiring AI',desc:'ML model screening job applications for initial shortlisting',color:'#6c5ce7'},
  {id:'medical',label:'Medical Diagnosis AI',desc:'Clinical decision support tool for radiology image analysis',color:'#ff6b6b'},
  {id:'content',label:'Content Moderation AI',desc:'Automated flagging system for harmful content at scale',color:'#f7b731'}
];
var SIM_EVENT_POOL=[
  {title:'Bias Complaint Filed',desc:'A protected group reports disproportionate rejection rates',fn:'MANAGE',rmf:'MG-3.1 / MS-2.5',
   goodAction:'Conduct MS-2.5 fairness audit. Document findings. Adjust model thresholds or retrain.',
   badAction:'Ignore complaint. No monitoring process in place. Risk escalates to litigation.',
   goodScore:18,badScore:-22,color:'#fd79a8'},
  {title:'Model Drift Detected',desc:'Performance degrades 8% over 3 months on held-out validation data',fn:'MEASURE',rmf:'MS-4.2 / MG-3.2',
   goodAction:'Trigger retraining pipeline per MS-4 monitoring protocol. Update MS-1 baselines. Notify deployer.',
   badAction:'No monitoring system exists. Drift continues undetected for months.',
   goodScore:20,badScore:-25,color:'#f7b731'},
  {title:'Security Incident',desc:'Adversarial inputs discovered bypassing model safety filters',fn:'MANAGE',rmf:'MG-2.2 / GV-5.2',
   goodAction:'Invoke incident response plan. Patch inputs. Assess retraining need. Notify stakeholders per MG-3.',
   badAction:'No incident plan. Manual patching only. Root cause not documented.',
   goodScore:15,badScore:-28,color:'#ff6b6b'},
  {title:'Regulatory Audit',desc:'Regulator requests documentation of AI risk management practices',fn:'GOVERN',rmf:'GV-1.1 / GV-2.2',
   goodAction:'Provide risk register, treatment decisions, audit trail, and policy documents. Pass audit.',
   badAction:'No documentation. Audit reveals non-compliance. Remediation required.',
   goodScore:25,badScore:-35,color:'#0984e3'},
  {title:'Hallucination Incident',desc:'System produces confident but factually wrong output used in high-stakes decision',fn:'MAP',rmf:'MAP-3.5 / MG-3.2',
   goodAction:'Flag hallucination as known risk in MAP-3 register. Increase human review rate. Add output validation.',
   badAction:'No risk register entry. Incident recurs. No escalation path defined.',
   goodScore:15,badScore:-20,color:'#a29bfe'},
  {title:'Scope Creep Found',desc:'System being used beyond its documented intended use case',fn:'MAP',rmf:'MAP-1.1 / GV-5.1',
   goodAction:'Update MAP-1 context documentation. Assess new risks. Issue guidance to operators. Review policy.',
   badAction:'Undocumented use continues. New risks go unmanaged. No policy update.',
   goodScore:12,badScore:-15,color:'#51cf66'}
];
var simState='idle';
var simSelectedSystem=0;
var simScore=100;
var simMonth=0;
var simCurrentEventIdx=null;
var simEventMonths=[2,4,6,8,10];
var simEventOrder=[];
var simLog=[];
var simHistory=[{month:0,score:100}];
function simSelectSystem(idx){
  simSelectedSystem=idx;
  for(var i=0;i<3;i++){var b=document.getElementById('sim-sys-'+i);if(b)b.className=(i===idx)?'btn':'btn-tab';}
}
function simStart(){
  simState='running';simScore=100;simMonth=0;simLog=[];simHistory=[{month:0,score:100}];
  simCurrentEventIdx=null;
  // Shuffle 5 events from pool
  var pool=[0,1,2,3,4,5];
  for(var i=pool.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=pool[i];pool[i]=pool[j];pool[j]=t;}
  simEventOrder=pool.slice(0,5);
  var sys=SIM_SYSTEMS[simSelectedSystem];
  var panel=document.getElementById('sim-event-panel');
  if(panel)panel.innerHTML='<strong style="color:'+sys.color+'">'+sys.label+'</strong> launched. Month 1 of 12 &mdash; operating normally. First event incoming at month '+simEventMonths[0]+'.';
  var logEl=document.getElementById('sim-log');if(logEl)logEl.innerHTML='';
  if(typeof drawSimulator==='function')drawSimulator();
  setTimeout(simTick,800);
}
function simTick(){
  if(simState!=='running')return;
  simMonth++;
  if(typeof drawSimulator==='function')drawSimulator();
  var eventMonthIdx=simEventMonths.indexOf(simMonth);
  if(eventMonthIdx>=0&&eventMonthIdx<simEventOrder.length){
    simState='event';
    simCurrentEventIdx=simEventOrder[eventMonthIdx];
    renderSimEvent();
    return;
  }
  if(simMonth>=12){simEnd();return;}
  setTimeout(simTick,600);
}
function simRespond(good){
  if(simState!=='event'||simCurrentEventIdx===null)return;
  var ev=SIM_EVENT_POOL[simCurrentEventIdx];
  var delta=good?ev.goodScore:ev.badScore;
  simScore=Math.max(0,Math.min(100,simScore+delta));
  simHistory.push({month:simMonth,score:simScore});
  var logEl=document.getElementById('sim-log');
  if(logEl){
    var entry=document.createElement('div');
    entry.style.cssText='padding:4px 0;border-bottom:1px solid #2d333b;color:'+(good?'#51cf66':'#ff6b6b');
    entry.textContent='Month '+simMonth+': '+ev.title+' '+(good?'+'+ev.goodScore:''+ev.badScore)+' pts. '+(good?'Good response.':'Missed response.');
    logEl.insertBefore(entry,logEl.firstChild);
  }
  simState='running';
  simCurrentEventIdx=null;
  if(simMonth>=12){simEnd();return;}
  setTimeout(simTick,600);
  if(typeof drawSimulator==='function')drawSimulator();
}
function simEnd(){
  simState='done';
  var grade=simScore>=80?'Excellent':simScore>=60?'Good':simScore>=40?'Needs Improvement':'Critical Gaps';
  var gradeColor=simScore>=80?'#51cf66':simScore>=60?'#f7b731':simScore>=40?'#ff6b6b':'#e84118';
  var panel=document.getElementById('sim-event-panel');
  if(panel)panel.innerHTML='<strong style="color:'+gradeColor+'">Simulation complete: '+grade+'</strong> &mdash; Final score: '+simScore+'/100<br>Click Reset to run again with different events.';
  if(typeof drawSimulator==='function')drawSimulator();
}
function simReset(){
  simState='idle';simScore=100;simMonth=0;simHistory=[{month:0,score:100}];simCurrentEventIdx=null;simLog=[];
  var panel=document.getElementById('sim-event-panel');
  if(panel)panel.innerHTML='Select a system above and click <strong>Start Simulation</strong> to begin the 12-month risk scenario.';
  var logEl=document.getElementById('sim-log');if(logEl)logEl.innerHTML='';
  if(typeof drawSimulator==='function')drawSimulator();
}
function renderSimEvent(){
  if(simCurrentEventIdx===null)return;
  var ev=SIM_EVENT_POOL[simCurrentEventIdx];
  var panel=document.getElementById('sim-event-panel');
  if(!panel)return;
  panel.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><div style="width:8px;height:8px;border-radius:50%;background:'+ev.color+'"></div><strong style="color:'+ev.color+'">Month '+simMonth+' Event: '+ev.title+'</strong> <span style="font-size:10px;color:#a29bfe">'+ev.rmf+'</span></div>'
    +'<div style="font-size:13px;color:#c9d1d9;margin-bottom:10px;">'+ev.desc+'</div>'
    +'<div style="display:flex;gap:12px;">'
    +'<button class="btn" onclick="simRespond(true)" style="background:#51cf66">Correct Response</button>'
    +'<button class="btn" onclick="simRespond(false)" style="background:#ff6b6b">Miss / Ignore</button>'
    +'</div>';
}

// ===== DEEP-DIVE DATA =====
var DEEPDIVE_ITEMS=[
  {id:'GV-1.1',fn:'GOVERN',color:'#0984e3',
   nist:'Organizational policies and processes addressing AI risks and benefits exist, are communicated, and maintained.',
   plain:'A written AI risk policy must exist, be shared with all relevant staff, and be kept up to date. Not just intent &mdash; a documented process.',
   example:'A financial institution writes a 2-page AI Risk Policy defining prohibited use cases, required review steps, and the escalation path for AI incidents. It is reviewed annually.',
   connects:['GV-2.2','MAP-1.1','MG-1.1'],impact:'High'},
  {id:'GV-2.2',fn:'GOVERN',color:'#0984e3',
   nist:'The organization establishes, communicates, and maintains its AI risk tolerance.',
   plain:'Define how much AI risk your org will accept. This is a number or category, not a vague statement. It must be approved and communicated.',
   example:'A hospital sets risk tolerance: automated AI decisions are prohibited for final diagnosis. All AI outputs require physician sign-off. Fairness floor: 80% parity ratio.',
   connects:['MAP-4.1','MS-1.1','MG-2.1'],impact:'Critical'},
  {id:'GV-6.2',fn:'GOVERN',color:'#0984e3',
   nist:'Policies and procedures are in place to delineate responsibilities for human oversight of AI systems.',
   plain:'Specify exactly who is responsible for watching each AI system, when they must intervene, and what authority they have to override or stop it.',
   example:'Content moderation AI: human review required for all appeals. Safety team lead has authority to pause the system within 1 hour of a critical incident report.',
   connects:['MAP-1.2','MG-2.2','MG-3.2'],impact:'High'},
  {id:'MAP-1.1',fn:'MAP',color:'#f7b731',
   nist:'Context is established for the AI risk assessment. Organizational mission, goals, and objectives are documented.',
   plain:'Write down what the AI system is supposed to do, for whom, and in what context. This is the foundation for every other risk assessment step.',
   example:'Hiring AI: intended use is scoring resumes for software engineering roles at Acme Corp. Excluded uses: any role where gender or race is a legally protected factor.',
   connects:['MAP-3.1','MAP-5.1','MS-1.1'],impact:'Critical'},
  {id:'MAP-3.1',fn:'MAP',color:'#f7b731',
   nist:'Risks or related impacts from third-party entities or other AI systems are enumerated.',
   plain:'List all the ways this AI system could cause harm &mdash; to users, to affected communities, and to the organization. Include both technical and societal risks.',
   example:'Risk register for a credit scoring AI: 1. Disparate impact on minority applicants. 2. Model drift from economic shifts. 3. Adversarial input manipulation. 4. Regulatory non-compliance.',
   connects:['MAP-4.1','MS-2.5','MS-2.6'],impact:'High'},
  {id:'MAP-4.1',fn:'MAP',color:'#f7b731',
   nist:'Prioritization of risk responses occurs.',
   plain:'Once risks are listed, rank them by likelihood and impact. Not every risk can be addressed. This step forces the hard conversation about what matters most right now.',
   example:'The credit scoring team plots 8 risks on a likelihood x impact matrix. Disparate impact lands in ACT NOW quadrant. Model drift is PRIORITIZE. Third-party data corruption is WATCH.',
   connects:['MG-1.1','MG-2.1'],impact:'High'},
  {id:'MAP-5.1',fn:'MAP',color:'#f7b731',
   nist:'Likelihood and magnitude of each enumerated AI risk is assessed.',
   plain:'Assess how an AI system might affect broader society &mdash; not just direct users. Think about communities who never interact with the system but are affected by its outputs.',
   example:'Predictive policing AI: direct users are officers. Affected communities: neighborhoods with higher patrol rates, individuals with increased false-positive arrest risk.',
   connects:['MS-2.5','MG-2.2'],impact:'Medium'},
  {id:'MS-1.1',fn:'MEASURE',color:'#ff6b6b',
   nist:'Approaches and metrics for measuring AI risk are selected and applied.',
   plain:'For each high-priority risk, define at least one measurable metric. You cannot manage what you do not measure. This converts risk awareness into a number.',
   example:'For disparate impact risk: metric = selection rate ratio across gender groups. Target: at or above 0.8 (4/5ths rule). Measured monthly on production outputs.',
   connects:['MS-2.1','MS-2.5'],impact:'High'},
  {id:'MS-2.5',fn:'MEASURE',color:'#ff6b6b',
   nist:'AI system to be evaluated for fairness-related risks and impacts.',
   plain:'Specifically test whether the AI system produces different outcomes for different demographic groups in ways that are unfair or discriminatory.',
   example:'Loan AI evaluation: test approval rates and interest rate outputs segmented by race, gender, and age. Compare against statistical baselines. Document any gaps above 20%.',
   connects:['MG-2.1','MG-1.1'],impact:'Critical'},
  {id:'MS-2.6',fn:'MEASURE',color:'#ff6b6b',
   nist:'AI system to be evaluated for robustness.',
   plain:'Test whether the AI system maintains performance when inputs are adversarial, out-of-distribution, or noisy. Robustness failures are often the first sign of upcoming drift.',
   example:'Medical imaging AI: test performance on images from different scanner manufacturers, image quality levels, and patient demographics not represented in training data.',
   connects:['MS-4.1','MG-1.1'],impact:'Medium'},
  {id:'MG-1.1',fn:'MANAGE',color:'#51cf66',
   nist:'AI risk priorities are acted on based on assessments of impact, likelihood, and available resources.',
   plain:'For each prioritized risk, document the treatment decision: accept, avoid, mitigate, or transfer. Include rationale, owner, timeline, and success criteria.',
   example:'Disparate impact risk: treatment = Mitigate. Action: Implement fairness constraint in training objective. Owner: ML Lead. Timeline: Q2. Target: SR below 20%.',
   connects:['MG-2.1','MG-4.1'],impact:'High'},
  {id:'MG-3.2',fn:'MANAGE',color:'#51cf66',
   nist:'Procedures are in place to respond to and recover from AI incidents or events.',
   plain:'Before deployment, define what an AI incident looks like, who gets notified, how quickly, and what the escalation path is. This cannot be improvised during an incident.',
   example:'Content moderation AI incident plan: if false positive rate exceeds 5% in any 24-hour window, ML ops team is paged. System paused within 1 hour if not resolved.',
   connects:['MG-4.1'],impact:'High'}
];
var ddCurrentFilter='all';
function ddFilter(fn){
  ddCurrentFilter=fn;
  ['all','GOVERN','MAP','MEASURE','MANAGE'].forEach(function(f){
    var b=document.getElementById('dd-'+f);
    if(b){b.style.borderColor=(f===fn)?'#6c5ce7':'';b.style.color=(f===fn)?'#a29bfe':'';}
  });
  renderDeepdive();
}
function renderDeepdive(){
  var grid=document.getElementById('deepdive-grid');
  if(!grid)return;
  var items=DEEPDIVE_ITEMS.filter(function(it){return ddCurrentFilter==='all'||it.fn===ddCurrentFilter;});
  var fnColors={GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'};
  grid.innerHTML=items.map(function(it,i){
    var impColor={Critical:'#ff6b6b',High:'#f7b731',Medium:'#51cf66'}[it.impact]||'#8b949e';
    return '<div class="card" onclick="ddToggle(this)" style="cursor:pointer;transition:border .15s;" data-idx="'+i+'">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'
      +'<span style="font-weight:800;color:'+it.color+';font-size:14px">'+it.id+'</span>'
      +'<span style="font-size:9px;background:'+impColor+'22;color:'+impColor+';padding:2px 7px;border-radius:10px;font-weight:700">'+it.impact+'</span>'
      +'</div>'
      +'<div style="font-size:11px;font-style:italic;color:#8b949e;margin-bottom:8px;border-left:2px solid '+it.color+';padding-left:8px;">'+it.nist+'</div>'
      +'<div style="font-size:12px;color:#c9d1d9;margin-bottom:8px">'+it.plain+'</div>'
      +'<div class="dd-expand" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid #30363d;">'
      +'<div style="font-size:11px;color:#51cf66;margin-bottom:4px"><strong>Example:</strong> '+it.example+'</div>'
      +'<div style="font-size:10px;color:#a29bfe;margin-top:6px"><strong>Enables:</strong> '+it.connects.join(', ')+'</div>'
      +'</div>'
      +'<div style="font-size:10px;color:#6c5ce7;margin-top:6px;text-align:right">Click to expand &darr;</div>'
      +'</div>';
  }).join('');
}
function ddToggle(card){
  var exp=card.querySelector('.dd-expand');
  var lbl=card.querySelector('[style*="text-align:right"]');
  if(!exp)return;
  var open=exp.style.display==='block';
  exp.style.display=open?'none':'block';
  if(lbl)lbl.textContent=open?'Click to expand \u2193':'Click to collapse \u2191';
}
function initDeepdive(){renderDeepdive();}

// ===== POLICY BUILDER DATA =====
function policyGenerate(){
  var org=document.getElementById('pol-org').value||'[Organization Name]';
  var sector=document.getElementById('pol-sector').value||'general';
  var size=document.getElementById('pol-size').value||'mid';
  var maturity=document.getElementById('pol-maturity').value||'initial';
  var tolerance=document.getElementById('pol-tolerance').value||'moderate';
  var usecase=document.getElementById('pol-usecase').value||'decision';
  var sectorCtx={general:'technology and general business',healthcare:'healthcare and clinical decision support',finance:'financial services and lending',hr:'human resources and employment',government:'government and public services'}[sector];
  var tolText={conservative:'minimize AI risk; all high-risk AI systems require explicit executive approval before deployment',moderate:'balance innovation and risk; high-risk AI requires documented risk assessment and treatment plan',progressive:'accept higher risk for competitive advantage; all AI systems require basic risk documentation'}[tolerance];
  var ucRisk={decision:'Automated or semi-automated high-stakes decisions affecting individuals',generation:'Generative AI systems producing content, code, or answers',prediction:'Predictive models influencing resource allocation or access decisions',classification:'Classification and flagging systems affecting individual outcomes'}[usecase];
  var sizeClause={small:'Given the organization size, risk management responsibilities may be combined; a single AI Risk Owner is designated.',mid:'The organization designates an AI Risk Owner and a cross-functional AI Risk Committee meeting quarterly.',large:'The organization maintains a dedicated AI Risk function with representation from Engineering, Legal, Ethics, and Product.'}[size];
  var reviewFreq={initial:'annually',managed:'semi-annually',defined:'quarterly'}[maturity];
  var ta=document.getElementById('pol-output');
  if(!ta)return;
  var LF=String.fromCharCode(10);
  var lines=[
    'AI RISK MANAGEMENT POLICY',
    org.toUpperCase(),
    '',
    'VERSION: 1.0  |  STATUS: TEMPLATE  |  REVIEW: '+reviewFreq.toUpperCase(),
    'ALIGNED TO: NIST AI RMF 1.0 (GV-1.1, GV-2.2, GV-5.1, GV-6.2)',
    '',
    '1. PURPOSE',
    'This policy establishes the framework for identifying, assessing, and managing',
    'AI-related risks at '+org+', operating in the '+sectorCtx+' sector.',
    '',
    '2. SCOPE',
    'Applies to all AI systems developed, procured, deployed, or operated by '+org+'.',
    'Primary risk area: '+ucRisk+'.',
    '',
    '3. RISK TOLERANCE (GV-2.2)',
    'The organization AI risk tolerance is to '+tolText+'.',
    '',
    '4. ACCOUNTABILITY (GV-2.2, GV-4.1)',
    sizeClause,
    'All AI system owners must acknowledge this policy and their accountability annually.',
    '',
    '5. MANDATORY REQUIREMENTS',
    '  5.1 All AI systems must have documented intended use before deployment (MAP-1.1).',
    '  5.2 High-risk AI systems require a risk register with likelihood x impact ratings (MAP-4.1).',
    '  5.3 Fairness and bias evaluation is required for AI affecting individual outcomes (MS-2.5).',
    '  5.4 An incident response procedure must exist before any AI system goes live (MG-3.2).',
    '  5.5 Human override capability must be documented for all automated decision systems (GV-6.2).',
    '',
    '6. PROHIBITED USES',
    '  - AI making fully autonomous irreversible decisions about individuals without human review.',
    '  - AI systems with no documented intended use case or stakeholder impact assessment.',
    '  - Deployment of AI systems with known uncorrected critical fairness violations.',
    '',
    '7. REVIEW AND MAINTENANCE',
    'This policy is reviewed '+reviewFreq+'. The AI Risk Owner is responsible for updates.',
    '',
    '8. EFFECTIVE DATE',
    '[Insert effective date]  |  Approved by: [Name, Title]'
  ];
  ta.value=lines.join(LF);
}

function policyCopy(){
  var ta=document.getElementById('pol-output');
  if(!ta||!ta.value)return;
  navigator.clipboard.writeText(ta.value).then(function(){alert('Policy copied to clipboard.');}).catch(function(){ta.select();document.execCommand('copy');alert('Policy copied.');});
}

// ===== PROPAGATION DATA =====
var PROP_SCENARIOS=[
  {title:'Biased Training Data',rootColor:'#e84118',
   nodes:[
     {id:'root',label:'Biased Training Data',x:0.08,y:0.45,color:'#e84118',size:16,tier:0},
     {id:'map3',label:'MAP-3.1 Gap: bias not in risk register',x:0.28,y:0.2,color:'#f7b731',size:12,tier:1},
     {id:'ms25',label:'MS-2.5 Gap: no fairness evaluation',x:0.28,y:0.55,color:'#ff6b6b',size:12,tier:1},
     {id:'unfair',label:'Unfair outputs in production',x:0.52,y:0.2,color:'#fd79a8',size:11,tier:2},
     {id:'nogov',label:'GV-2.2 Gap: no fairness threshold defined',x:0.52,y:0.55,color:'#0984e3',size:11,tier:2},
     {id:'comp',label:'Regulatory complaint filed',x:0.76,y:0.2,color:'#ff6b6b',size:11,tier:3},
     {id:'mg3',label:'MG-3 triggered: incident response',x:0.76,y:0.55,color:'#51cf66',size:11,tier:3}
   ],
   edges:[
     {from:'root',to:'map3'},{from:'root',to:'ms25'},
     {from:'map3',to:'unfair'},{from:'ms25',to:'nogov'},
     {from:'unfair',to:'comp'},{from:'nogov',to:'mg3'},{from:'comp',to:'mg3'}
   ],
   detail:'Biased data → MAP-3.1 gap (bias not listed as a risk) → MS-2.5 gap (fairness never measured) → unfair outputs in production → regulatory complaint → MG-3 incident response. Root fix: MAP-3.1 risk identification before training.'},
  {title:'No Intended Use Doc',rootColor:'#f7b731',
   nodes:[
     {id:'root',label:'No Intended Use Document',x:0.08,y:0.45,color:'#f7b731',size:16,tier:0},
     {id:'scope',label:'Scope creep: unintended use cases',x:0.3,y:0.2,color:'#f7b731',size:12,tier:1},
     {id:'map5',label:'MAP-5.1 Gap: no societal impact assessment',x:0.3,y:0.7,color:'#f7b731',size:12,tier:1},
     {id:'newrisk',label:'New unmanaged risks emerge',x:0.55,y:0.2,color:'#ff6b6b',size:11,tier:2},
     {id:'harm',label:'Societal harm not anticipated',x:0.55,y:0.7,color:'#fd79a8',size:11,tier:2},
     {id:'mgap',label:'MG-1.1 Gap: no mitigation plan for new risks',x:0.8,y:0.45,color:'#51cf66',size:11,tier:3}
   ],
   edges:[
     {from:'root',to:'scope'},{from:'root',to:'map5'},
     {from:'scope',to:'newrisk'},{from:'map5',to:'harm'},
     {from:'newrisk',to:'mgap'},{from:'harm',to:'mgap'}
   ],
   detail:'No intended use documentation → scope creep (system used beyond design) + no societal impact assessment → unmanaged new risks + unanticipated societal harm → no mitigation plan exists. Root fix: MAP-1.1 before deployment.'},
  {title:'No Monitoring Process',rootColor:'#51cf66',
   nodes:[
     {id:'root',label:'No MG-3 Monitoring',x:0.08,y:0.45,color:'#51cf66',size:16,tier:0},
     {id:'drift',label:'Model drift undetected',x:0.3,y:0.2,color:'#f7b731',size:12,tier:1},
     {id:'incident',label:'Incident not escalated',x:0.3,y:0.7,color:'#ff6b6b',size:12,tier:1},
     {id:'perf',label:'Performance degradation worsens',x:0.55,y:0.2,color:'#f7b731',size:11,tier:2},
     {id:'harm2',label:'Harm accumulates undetected',x:0.55,y:0.7,color:'#ff6b6b',size:11,tier:2},
     {id:'crisis',label:'Crisis-driven shutdown',x:0.8,y:0.45,color:'#e84118',size:12,tier:3}
   ],
   edges:[
     {from:'root',to:'drift'},{from:'root',to:'incident'},
     {from:'drift',to:'perf'},{from:'incident',to:'harm2'},
     {from:'perf',to:'crisis'},{from:'harm2',to:'crisis'}
   ],
   detail:'No monitoring → model drift goes undetected AND incidents not escalated → performance worsens AND harm accumulates → crisis-driven emergency shutdown. Root fix: MG-3.1 monitoring before go-live.'},
  {title:'Missing Risk Tolerance',rootColor:'#0984e3',
   nodes:[
     {id:'root',label:'No GV-2.2 Risk Tolerance',x:0.08,y:0.45,color:'#0984e3',size:16,tier:0},
     {id:'map4',label:'MAP-4.1 Gap: arbitrary prioritization',x:0.3,y:0.2,color:'#f7b731',size:12,tier:1},
     {id:'ms1',label:'MS-1.1 Gap: no metric thresholds',x:0.3,y:0.7,color:'#ff6b6b',size:12,tier:1},
     {id:'deploy',label:'High-risk system deployed without review',x:0.55,y:0.2,color:'#ff6b6b',size:11,tier:2},
     {id:'noact',label:'No clear trigger to take action',x:0.55,y:0.7,color:'#8b949e',size:11,tier:2},
     {id:'vuln',label:'Organization exposed to preventable risk',x:0.8,y:0.45,color:'#e84118',size:12,tier:3}
   ],
   edges:[
     {from:'root',to:'map4'},{from:'root',to:'ms1'},
     {from:'map4',to:'deploy'},{from:'ms1',to:'noact'},
     {from:'deploy',to:'vuln'},{from:'noact',to:'vuln'}
   ],
   detail:'No risk tolerance definition → MAP-4 prioritization is arbitrary + MS-1 thresholds are undefined → high-risk system deployed without proper review + no clear trigger to act → preventable risk exposure. Root fix: GV-2.2 before any risk assessment.'}
];
var selectedPropScenario=0;
var propAnimT=0;
var propAnimRaf=null;
function propSelect(idx){
  selectedPropScenario=idx;
  for(var i=0;i<4;i++){var b=document.getElementById('prop-'+i);if(b)b.className=(i===idx)?'btn':'btn-tab';}
  propAnimT=0;
  var det=document.getElementById('prop-detail');
  if(det)det.innerHTML=PROP_SCENARIOS[idx].detail;
  if(propAnimRaf)cancelAnimationFrame(propAnimRaf);
  if(typeof animatePropagation==='function')animatePropagation();
}

// ===== PROGRESSION DATA =====
var MATURITY_LEVELS=[
  {level:1,name:'Initial',color:'#8b949e',months:'Month 0-3',
   desc:'Ad hoc. No formal AI risk process. Risks managed reactively when problems surface.',
   subcats:['GV-1.1: Draft first AI policy','GV-2.1: Name AI risk owner','MAP-1.1: Document one high-risk system']},
  {level:2,name:'Managed',color:'#f7b731',months:'Month 3-9',
   desc:'Documented processes for highest-risk systems. Risk register exists. Some metrics defined.',
   subcats:['GV-2.2: Define risk tolerance','GV-5.1: Map regulatory requirements','MAP-3.1: Complete risk register','MAP-4.1: Prioritize by likelihood x impact','MS-1.1: Define key metrics','MG-1.1: Document treatment decisions']},
  {level:3,name:'Defined',color:'#0984e3',months:'Month 9-18',
   desc:'Consistent processes applied org-wide. All AI systems covered. Fairness and robustness evaluated.',
   subcats:['GV-3.2: Diverse AI teams','GV-4.1: Leadership commitment','MAP-2.1: Domain knowledge integrated','MAP-5.1: Societal impact assessed','MS-2.5: Fairness evaluation','MS-2.6: Robustness testing','MG-2.1: Risk treatment decisions formalized','MG-3.1: Incident response tested']},
  {level:4,name:'Optimizing',color:'#51cf66',months:'Month 18+',
   desc:'All 72 subcategories active. Continuous improvement culture. Board-level reporting.',
   subcats:['All 72 subcategories operational','Continuous feedback loops between MAP and MANAGE','Board-level AI risk reporting','External third-party audits conducted','Cross-org AI risk community of practice']}
];
var progressionLevel=-1;
var progressionAnimRaf=null;
var progressionAnimT=0;
function progressionPlay(){
  progressionLevel=-1;progressionAnimT=0;
  function step(){
    progressionAnimT+=0.02;
    if(progressionAnimT>=1){
      progressionAnimT=0;
      progressionLevel++;
      if(progressionLevel>=MATURITY_LEVELS.length){
        if(typeof drawProgression==='function')drawProgression();
        return;
      }
      var det=document.getElementById('prog-detail');
      if(det){var lv=MATURITY_LEVELS[progressionLevel];det.innerHTML='<strong style="color:'+lv.color+'">Level '+lv.level+': '+lv.name+'</strong> &mdash; '+lv.desc+'<br><br><strong>New subcategories:</strong> '+lv.subcats.join(' &middot; ');}
    }
    if(typeof drawProgression==='function')drawProgression();
    progressionAnimRaf=requestAnimationFrame(step);
  }
  progressionAnimRaf=requestAnimationFrame(step);
}
function progressionReset(){
  if(progressionAnimRaf)cancelAnimationFrame(progressionAnimRaf);
  progressionLevel=-1;progressionAnimT=0;
  if(typeof drawProgression==='function')drawProgression();
  var det=document.getElementById('prog-detail');
  if(det)det.innerHTML='Click Play or a Level button to explore the maturity stages.';
}
function progressionGoTo(idx){
  if(progressionAnimRaf)cancelAnimationFrame(progressionAnimRaf);
  progressionLevel=idx;progressionAnimT=1;
  if(typeof drawProgression==='function')drawProgression();
  var lv=MATURITY_LEVELS[idx];
  var det=document.getElementById('prog-detail');
  if(det)det.innerHTML='<strong style="color:'+lv.color+'">Level '+lv.level+': '+lv.name+'</strong> &mdash; '+lv.desc+'<br><br><strong>Subcategories:</strong> '+lv.subcats.join(' &middot; ');
}

// ===== ORG CHART DATA =====
var ORGCHART_ROLES=[
  {id:'board',label:'Board of Directors',x:0.5,y:0.06,color:'#6c5ce7',parent:null,
   subcats:['GV-2.2 Risk tolerance approval','GV-1.2 Policy approval','GV-4.1 Oversight commitment'],
   desc:'Sets AI risk appetite. Approves risk tolerance and major AI risk policies. Receives periodic AI risk reports from management.'},
  {id:'ceo',label:'CEO',x:0.5,y:0.22,color:'#6c5ce7',parent:'board',
   subcats:['GV-4.1 Organizational commitment','GV-2.2 Risk tolerance owner'],
   desc:'Accountable for organizational AI risk posture. Delegates operational management but retains accountability for culture and tone.'},
  {id:'cto',label:'CTO / VP Engineering',x:0.2,y:0.42,color:'#0984e3',parent:'ceo',
   subcats:['GV-3.1 Technical governance','MS-1.1 Metric framework','MG-1.1 Mitigation ownership'],
   desc:'Owns technical risk management. Defines measurement approach and approves mitigation plans. Accountable for evaluation quality.'},
  {id:'legal',label:'Legal / Compliance',x:0.5,y:0.42,color:'#f7b731',parent:'ceo',
   subcats:['GV-1.1 Policy creation','GV-5.1 Regulatory mapping','MG-2.2 Risk transfer decisions'],
   desc:'Translates regulatory requirements into AI risk policies. Handles risk transfer (insurance, contracts). Reviews adverse action notices.'},
  {id:'ethics',label:'AI Ethics / Trust Team',x:0.8,y:0.42,color:'#fd79a8',parent:'ceo',
   subcats:['GV-3.2 Diverse teams','MAP-5.1 Societal impact','MS-2.5 Bias evaluation oversight'],
   desc:'Ensures trustworthiness characteristics embedded in design and evaluation. Reviews societal impact assessments. Escalates ethical concerns.'},
  {id:'mleng',label:'ML Engineering',x:0.25,y:0.7,color:'#74b9ff',parent:'cto',
   subcats:['MAP-3.1 Technical risks','MS-2.1 Model evaluation','MS-2.6 Robustness testing'],
   desc:'Implements technical controls. Runs evaluation suites before each deployment. Documents model limitations and known failure modes.'},
  {id:'ops',label:'AI Operations',x:0.6,y:0.7,color:'#51cf66',parent:'cto',
   subcats:['MG-3.1 Incident detection','MG-3.2 Incident response','MS-4.1 Feedback loops'],
   desc:'Monitors deployed systems in production. Manages incident response process. Feeds operational data back into risk assessments.'}
];
var selectedOrgRoleId=null;
var hoveredOrgRoleId=null;

// ===== DEPENDENCY MAP DATA =====
var DEP_NODES=[
  {id:'gv22',label:'GV-2.2',name:'Risk Tolerance',color:'#0984e3',x:0.08,y:0.12,tier:0},
  {id:'gv11',label:'GV-1.1',name:'AI Policies',color:'#0984e3',x:0.08,y:0.42,tier:0},
  {id:'gv62',label:'GV-6.2',name:'Human Oversight',color:'#0984e3',x:0.08,y:0.72,tier:0},
  {id:'map11',label:'MAP-1.1',name:'Intended Use',color:'#f7b731',x:0.32,y:0.1,tier:1},
  {id:'map31',label:'MAP-3.1',name:'Risk ID',color:'#f7b731',x:0.32,y:0.38,tier:1},
  {id:'map41',label:'MAP-4.1',name:'Risk Priority',color:'#f7b731',x:0.32,y:0.62,tier:1},
  {id:'map51',label:'MAP-5.1',name:'Societal Impact',color:'#f7b731',x:0.32,y:0.86,tier:1},
  {id:'ms11',label:'MS-1.1',name:'Metrics Defined',color:'#ff6b6b',x:0.58,y:0.18,tier:2},
  {id:'ms21',label:'MS-2.1',name:'AI Evaluated',color:'#ff6b6b',x:0.58,y:0.42,tier:2},
  {id:'ms25',label:'MS-2.5',name:'Bias Evaluated',color:'#ff6b6b',x:0.58,y:0.62,tier:2},
  {id:'ms41',label:'MS-4.1',name:'Feedback Loop',color:'#ff6b6b',x:0.58,y:0.82,tier:2},
  {id:'mg11',label:'MG-1.1',name:'Mitigation Plans',color:'#51cf66',x:0.84,y:0.18,tier:3},
  {id:'mg21',label:'MG-2.1',name:'Risk Treatment',color:'#51cf66',x:0.84,y:0.42,tier:3},
  {id:'mg31',label:'MG-3.1',name:'Monitoring',color:'#51cf66',x:0.84,y:0.62,tier:3},
  {id:'mg41',label:'MG-4.1',name:'Residual Risk',color:'#51cf66',x:0.84,y:0.82,tier:3}
];
var DEP_EDGES=[
  {from:'gv22',to:'map41'},{from:'gv22',to:'mg21'},
  {from:'gv11',to:'map11'},{from:'gv11',to:'map31'},
  {from:'gv62',to:'map11'},
  {from:'map11',to:'map31'},{from:'map31',to:'map41'},
  {from:'map31',to:'ms11'},{from:'map41',to:'ms21'},
  {from:'map41',to:'mg11'},{from:'map51',to:'ms25'},
  {from:'ms11',to:'ms21'},{from:'ms11',to:'ms25'},
  {from:'ms21',to:'ms41'},{from:'ms21',to:'mg11'},
  {from:'ms25',to:'mg21'},{from:'ms41',to:'mg31'},
  {from:'mg11',to:'mg21'},{from:'mg21',to:'mg31'},
  {from:'mg31',to:'mg41'},{from:'mg21',to:'mg41'}
];
var selectedDepNodeId=null;
var hoveredDepNodeId=null;

// ===== REGULATORY MAPPER DATA =====
var REGULATIONS=[
  {id:'eu-ai-act',label:'EU AI Act',color:'#f7b731',year:'2024',
   requirements:[
    {req:'Art. 9: Risk Management System',subcats:['GV-1.1','GV-2.2','MAP-1.1','MAP-3.1','MG-1.1'],strength:[3,3,3,3,3]},
    {req:'Art. 13: Transparency',subcats:['GV-1.2','MAP-2.1','MS-2.6'],strength:[3,2,2]},
    {req:'Art. 14: Human Oversight',subcats:['GV-6.2','MAP-1.2','MG-2.2'],strength:[3,3,2]},
    {req:'Art. 15: Accuracy and Robustness',subcats:['MS-2.1','MS-2.6','MS-4.1'],strength:[3,3,2]},
    {req:'Art. 72: Post-Market Monitoring',subcats:['MS-4.1','MS-4.2','MG-3.1','MG-3.2'],strength:[2,3,3,3]}
   ]},
  {id:'nyc-144',label:'NYC Local Law 144',color:'#fd79a8',year:'2023',
   requirements:[
    {req:'Bias Audit Requirement',subcats:['MS-2.5','MAP-3.5','GV-2.2'],strength:[3,3,2]},
    {req:'Candidate Notification',subcats:['GV-1.2','MAP-2.1'],strength:[2,2]},
    {req:'Annual Audit Publication',subcats:['MS-2.5','MG-4.1'],strength:[3,3]},
    {req:'Use Restriction',subcats:['MAP-1.1','GV-5.1'],strength:[3,2]}
   ]},
  {id:'sr11-7',label:'SR 11-7 Model Risk',color:'#0984e3',year:'2011',
   requirements:[
    {req:'Model Development Documentation',subcats:['MAP-2.1','MAP-3.1','MS-1.1'],strength:[2,3,3]},
    {req:'Independent Validation',subcats:['MS-2.1','MS-2.6','MS-3.1'],strength:[3,3,3]},
    {req:'Model Inventory',subcats:['GV-1.1','MAP-1.1'],strength:[2,3]},
    {req:'Ongoing Monitoring',subcats:['MS-4.1','MS-4.2','MG-3.1'],strength:[3,3,3]},
    {req:'Model Risk Reporting',subcats:['MG-4.1','GV-2.2'],strength:[3,2]}
   ]},
  {id:'hipaa-ai',label:'HIPAA + AI',color:'#51cf66',year:'2024',
   requirements:[
    {req:'Data Privacy Safeguards',subcats:['MAP-3.3','GV-5.2','MG-2.2'],strength:[2,3,3]},
    {req:'Minimum Necessary Standard',subcats:['MAP-1.1','GV-1.1'],strength:[2,2]},
    {req:'Security Controls',subcats:['GV-5.2','MS-2.6','MG-2.2'],strength:[3,3,2]},
    {req:'Patient Rights',subcats:['MAP-2.1','GV-1.2','MG-4.1'],strength:[2,2,2]}
   ]}
];
var selectedRegIdx=0;
var hoveredRegCell=null;
function regSelect(idx){
  selectedRegIdx=idx;
  for(var i=0;i<4;i++){var b=document.getElementById('reg-btn-'+i);if(b)b.className=(i===idx)?'btn':'btn-tab';}
  if(typeof drawRegMap==='function')drawRegMap();
  var det=document.getElementById('reg-detail');
  if(det)det.innerHTML='Hover a cell to see how the RMF subcategory satisfies the regulatory requirement.';
}
</script>
<script>
/* CANVAS CODE INJECTED HERE */
</script>
</body>
</html>`;

fs.writeFileSync('index.html',html,'utf8');
console.log('build1 done:',html.length,'bytes',html.split('\n').length,'lines');
