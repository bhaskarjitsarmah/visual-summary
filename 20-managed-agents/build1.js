const fs = require('fs');
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Claude Managed Agents &#8212; Stateless Brains, Containerized Hands</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#0d1117;--surface:#161b22;--border:#30363d;--text:#c9d1d9;--muted:#8b949e;
  --accent:#00b4d8;--accent2:#38d9f5;--accent3:#e0f7fa;
  --agents:#00b4d8;
}
body{background:var(--bg);color:var(--text);font-family:'Inter',system-ui,sans-serif;font-size:14px;line-height:1.6;display:flex;}
a{text-decoration:none;color:inherit;}
.sidebar{width:240px;min-width:240px;height:100vh;position:sticky;top:0;background:var(--surface);border-right:1px solid var(--border);overflow-y:auto;padding:0 0 40px;flex-shrink:0;}
.sidebar-logo{padding:18px 16px 14px;border-bottom:1px solid var(--border);}
.sidebar-logo-title{font-size:13px;font-weight:700;color:var(--accent2);}
.sidebar-logo-sub{font-size:10px;color:var(--muted);margin-top:2px;}
.nav-group-title{font-size:9px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:1.2px;padding:10px 16px 4px;}
.nav-link{display:flex;align-items:center;gap:8px;padding:6px 16px;font-size:12px;color:var(--muted);cursor:pointer;transition:all .15s;}
.nav-link:hover,.nav-link.active{color:var(--text);background:rgba(0,180,216,.08);}
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
.formula{background:#0d1117;border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:12px;color:#38d9f5;line-height:1.8;margin-bottom:16px;white-space:pre;}
.stats-row{display:flex;gap:24px;flex-wrap:wrap;margin-bottom:24px;}
.stat{text-align:center;}
.stat-val{font-size:28px;font-weight:800;color:var(--accent2);}
.stat-lbl{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.8px;}
.section-bridge{margin-top:48px;padding-top:28px;border-top:1px solid var(--border);text-align:right;}
.section-bridge-link{font-size:12px;color:var(--accent2);font-weight:600;border:1px solid var(--accent2);border-radius:6px;padding:6px 14px;transition:all .15s;}
.section-bridge-link:hover{background:rgba(0,180,216,.1);}
.accordion-item{border:1px solid var(--border);border-radius:8px;margin-bottom:8px;overflow:hidden;}
.accordion-header{padding:12px 16px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:13px;font-weight:600;background:var(--surface);}
.accordion-header:hover{background:#1c2128;}
.accordion-chevron{transition:transform .2s;font-size:10px;color:var(--muted);}
.accordion-body{padding:14px 16px;font-size:12px;color:var(--muted);display:none;border-top:1px solid var(--border);}
#pg-gate{position:fixed;inset:0;background:linear-gradient(135deg,#0d1117 0%,#161b22 50%,#0d1117 100%);z-index:9999;display:flex;align-items:center;justify-content:center;}
.pg-box{background:#161b22;border:1px solid #30363d;border-radius:16px;padding:40px 48px;max-width:440px;width:100%;text-align:center;box-shadow:0 0 40px rgba(0,180,216,.1);}
.pg-icon{font-size:2.5rem;margin-bottom:16px;}
.pg-title{font-size:1.3rem;font-weight:800;color:#c9d1d9;margin-bottom:6px;}
.pg-subtitle{font-size:13px;font-weight:600;color:#38d9f5;margin-bottom:6px;}
.pg-sub{font-size:11px;color:#8b949e;margin-bottom:24px;}
.pg-input{width:100%;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:10px 14px;color:#c9d1d9;font-size:14px;outline:none;text-align:center;}
.pg-input:focus{border-color:#00b4d8;}
.pg-btn{margin-top:12px;width:100%;background:linear-gradient(135deg,#00b4d8,#0077a8);color:#fff;border:none;border-radius:8px;padding:10px;font-size:14px;font-weight:600;cursor:pointer;}
.pg-err{color:#ff6b6b;font-size:11px;margin-top:8px;min-height:16px;}
.pg-join{margin-top:16px;font-size:11px;color:#8b949e;}
.pg-join a{color:#38d9f5;text-decoration:underline;}
.code-block{background:#0d1117;border:1px solid var(--border);border-radius:8px;padding:14px 18px;font-family:'JetBrains Mono','Courier New',monospace;font-size:11px;color:#e2e8f0;line-height:1.7;margin-bottom:16px;overflow-x:auto;}
.highlight-box{border-left:3px solid var(--accent);padding:12px 16px;background:rgba(0,180,216,.06);border-radius:0 8px 8px 0;margin-bottom:16px;font-size:13px;color:var(--muted);}
.highlight-box.amber{border-color:#f59e0b;background:rgba(245,158,11,.06);}
.highlight-box.green{border-color:#10b981;background:rgba(16,185,129,.06);}
.highlight-box.violet{border-color:#7c3aed;background:rgba(124,58,237,.06);}
.highlight-box.red{border-color:#ef4444;background:rgba(239,68,68,.06);}
.info-panel{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;margin-top:12px;font-size:13px;color:var(--muted);min-height:80px;}
.info-panel strong{color:var(--text);}
.badge{display:inline-block;padding:3px 10px;border-radius:12px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;margin-right:4px;}
.badge-cyan{background:rgba(0,180,216,.2);color:#38d9f5;}
.badge-amber{background:rgba(245,158,11,.2);color:#f59e0b;}
.badge-green{background:rgba(16,185,129,.2);color:#10b981;}
.badge-violet{background:rgba(124,58,237,.2);color:#a78bfa;}
.badge-red{background:rgba(239,68,68,.2);color:#f87171;}
input[type=range]{-webkit-appearance:none;appearance:none;width:100%;height:6px;background:var(--border);border-radius:4px;outline:none;}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:16px;height:16px;border-radius:50%;background:var(--accent);cursor:pointer;}
.slider-row{display:flex;gap:12px;align-items:center;margin-bottom:16px;}
.slider-lbl{font-size:11px;color:var(--muted);min-width:140px;}
.slider-val{font-size:12px;font-weight:700;color:var(--accent2);min-width:50px;}
#scroll-progress{position:fixed;top:0;left:0;height:2px;background:var(--accent);z-index:9998;transition:width .1s;}
.event-feed{background:#0d1117;border:1px solid var(--border);border-radius:10px;padding:14px;font-family:'JetBrains Mono','Courier New',monospace;font-size:11px;height:200px;overflow:hidden;position:relative;}
.event-line{padding:2px 0;border-bottom:1px solid #1c2128;line-height:1.5;}
.event-ts{color:#444d56;}
.event-type{color:#38d9f5;font-weight:700;}
.event-data{color:#8b949e;}
.tool-card{border:1px solid var(--border);border-radius:10px;padding:14px 16px;cursor:pointer;transition:all .2s;background:var(--surface);}
.tool-card:hover{border-color:var(--accent);background:rgba(0,180,216,.04);}
.tool-card.active{border-color:var(--accent);background:rgba(0,180,216,.08);}
.tool-icon{font-size:1.4rem;margin-bottom:8px;}
.tool-name{font-size:12px;font-weight:700;color:var(--text);margin-bottom:4px;}
.tool-desc{font-size:11px;color:var(--muted);}
</style>
</head>
<body>

<div id="pg-gate">
  <div class="pg-box">
    <div class="pg-icon">&#129302;</div>
    <div class="pg-title">Claude Managed Agents</div>
    <div class="pg-subtitle">Stateless Brains, Containerized Hands</div>
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
    <div class="sidebar-logo-sub">Post 20 &middot; Claude Managed Agents</div>
  </div>

  <div class="nav-group-title">The Problem</div>
  <div class="nav-link" data-sec="s-overview" onclick="setActive(this,'s-overview')">
    <span class="dot" style="background:#00b4d8"></span>Why Managed Agents</div>

  <div class="nav-group-title">The Why</div>
  <div class="nav-link" data-sec="s-why-managed" onclick="setActive(this,'s-why-managed')">
    <span class="dot" style="background:#f7b731"></span>Why "Managed"?</div>

  <div class="nav-group-title">Core Concepts</div>
  <div class="nav-link" data-sec="s-concepts" onclick="setActive(this,'s-concepts')">
    <span class="dot" style="background:#7c6af4"></span>Four Primitives</div>
  <div class="nav-link" data-sec="s-architecture" onclick="setActive(this,'s-architecture')">
    <span class="dot" style="background:#51cf66"></span>Brain + Hands + Log</div>

  <div class="nav-group-title">The Runtime</div>
  <div class="nav-link" data-sec="s-event-loop" onclick="setActive(this,'s-event-loop')">
    <span class="dot" style="background:#f7b731"></span>The Event Loop</div>
  <div class="nav-link" data-sec="s-multiagent" onclick="setActive(this,'s-multiagent')">
    <span class="dot" style="background:#00b4d8"></span>Multi-Agent Threads</div>

  <div class="nav-group-title">Security &amp; API</div>
  <div class="nav-link" data-sec="s-tools" onclick="setActive(this,'s-tools')">
    <span class="dot" style="background:#ff6b6b"></span>Tools &amp; Security</div>
  <div class="nav-link" data-sec="s-api" onclick="setActive(this,'s-api')">
    <span class="dot" style="background:#7c6af4"></span>Getting Started</div>
</nav>

<!-- MAIN -->
<div class="main" id="main-scroll">
<div class="pipeline-map">
  <div class="pipe-step"><span class="pipe-dot" style="background:#00b4d8"></span>Overview</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#f7b731"></span>Why Managed</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#7c6af4"></span>Concepts</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#51cf66"></span>Architecture</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#f7b731"></span>Event Loop</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#00b4d8"></span>Multi-Agent</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#ff6b6b"></span>Security</div>
  <span class="pipe-arrow">&#8594;</span>
  <div class="pipe-step"><span class="pipe-dot" style="background:#7c6af4"></span>API</div>
</div>

<!-- ====== S1: OVERVIEW ====== -->
<section class="section" id="s-overview">
  <div class="section-tag" style="color:#00b4d8">Why Managed Agents &middot; ~12 min read</div>
  <h1 class="section-title">Agents Need More Than a Long Context Window</h1>
  <p class="section-sub">Every production AI agent hits the same wall: the model is stateless, but the task isn't. Managed Agents gives you a runtime — containerized execution environments, append-only event logs, and session lifecycle management — so you can build agents that run for minutes or hours without hacking around API limits.</p>

  <div class="stats-row">
    <div class="stat"><div class="stat-val" style="color:#00b4d8">&#8722;60%</div><div class="stat-lbl">p50 TTFT drop</div></div>
    <div class="stat"><div class="stat-val" style="color:#51cf66">&#8722;90%</div><div class="stat-lbl">p95 TTFT drop</div></div>
    <div class="stat"><div class="stat-val" style="color:#f7b731">4</div><div class="stat-lbl">core primitives</div></div>
    <div class="stat"><div class="stat-val" style="color:#7c6af4">$0.08</div><div class="stat-lbl">per runtime hour</div></div>
  </div>

  <canvas id="canvas-agent-anatomy" width="700" height="240" style="margin-bottom:20px;cursor:pointer;"></canvas>
  <div class="info-panel" id="anatomy-detail">
    <strong>Hover a component</strong> to see what it does inside a Managed Agent.
  </div>

  <canvas id="canvas-ttft-perf" width="700" height="220" style="margin-top:20px;margin-bottom:20px;"></canvas>

  <div class="highlight-box">
    <strong>The key insight:</strong> Traditional agents stuff everything into one massive prompt and wait for the model to respond. Managed Agents decouples the model (brain) from execution (hands) so the model can start streaming before all tools have run.
  </div>

  <div class="grid3" style="margin-bottom:24px;">
    <div class="card">
      <div class="card-title" style="color:#00b4d8">Local-First Problem</div>
      <div class="card-body">Traditional LLM calls are stateless round-trips. Long tasks require re-sending the entire conversation each turn, growing the prompt and increasing latency exponentially.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">What Changes</div>
      <div class="card-body">Sessions persist state server-side. The model receives only what's new. Tool results stream in as events rather than blocking the next model call.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">What Stays Same</div>
      <div class="card-body">The Claude API, prompt engineering, and tool-use patterns you already know. Managed Agents is an orchestration layer on top — not a different model.</div>
    </div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-why-managed">Why "Managed"? &rarr;</a>
  </div>
</section>

<!-- ====== S1b: WHY MANAGED ====== -->
<section class="section" id="s-why-managed">
  <div class="section-tag" style="color:#f7b731">Why "Managed"?</div>
  <h2 class="section-title">You Build the Recipe. Anthropic Manages the Kitchen.</h2>
  <p class="section-sub">The word "Managed" means Anthropic runs the infrastructure underneath — containers, session state, security, scaling. You only write the agent logic. Here is exactly what that difference looks like.</p>

  <!-- THE WALL -->
  <div class="card-title" style="color:#ff6b6b;font-size:11px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;">The Problem: The Growing Prompt Wall</div>
  <p class="section-sub" style="margin-bottom:16px;">Every time your agent takes a new action, you must re-send the <em>entire</em> conversation history to the model — because it has no memory between API calls. The prompt grows with every turn. Eventually it hits the context limit and the task dies.</p>

  <canvas id="canvas-prompt-wall" width="700" height="260" style="margin-bottom:12px;"></canvas>
  <div class="btn-row">
    <button class="btn" onclick="runPromptWall()">&#9654; Watch it grow</button>
    <button class="btn-tab" onclick="resetPromptWall()">&#8635; Reset</button>
  </div>
  <div class="info-panel" id="prompt-wall-detail" style="margin-bottom:28px;">
    <strong>Click "Watch it grow"</strong> — see how traditional agents re-send the full history every turn, while Managed Agents only send new events.
  </div>

  <!-- SELF vs MANAGED INFRA -->
  <div class="card-title" style="color:#00b4d8;font-size:11px;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px;margin-top:8px;">What "Managed" Actually Means — Click a Row to Compare</div>

  <canvas id="canvas-infra-compare" width="700" height="360" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="infra-compare-detail">
    <strong>Click any row</strong> to see what building it yourself looks like vs what Anthropic handles for you.
  </div>

  <!-- Restaurant analogy -->
  <div class="highlight-box amber" style="margin-top:20px;">
    <strong>The restaurant analogy:</strong> A self-managed agent is like owning the restaurant building — you buy the equipment, hire the staff, handle maintenance, pay the utilities. Managed Agents is a managed kitchen space — you just bring your recipes (agent logic). The kitchen, staff, and utilities are handled for you. You focus on the food, not the plumbing.
  </div>

  <div class="grid2" style="margin-bottom:24px;margin-top:20px;">
    <div class="card">
      <div class="card-title" style="color:#ff6b6b">Without Managed Agents — You Build</div>
      <div class="card-body" style="line-height:2;">
        &#128196; Session state storage (database)<br>
        &#128187; Tool execution server (VM or container)<br>
        &#128260; Retry + timeout logic (custom code)<br>
        &#129302; Multi-agent orchestration (custom scheduler)<br>
        &#128274; Credential isolation (your own vault/proxy)<br>
        &#128200; Scaling + monitoring (DevOps work)
      </div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">With Managed Agents — Anthropic Handles</div>
      <div class="card-body" style="line-height:2;">
        &#10003; Append-only event log (session state)<br>
        &#10003; Isolated container per session (execution)<br>
        &#10003; Session lifecycle API (created/paused/done)<br>
        &#10003; callable_agents API (multi-agent routing)<br>
        &#10003; Vault + MCP proxy (credential security)<br>
        &#10003; Auto-scaling + observability (built-in)
      </div>
    </div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-concepts">Four Core Primitives &rarr;</a>
  </div>
</section>

<!-- ====== S2: CONCEPTS ====== -->
<section class="section" id="s-concepts">
  <div class="section-tag" style="color:#7c6af4">Core Concepts</div>
  <h2 class="section-title">Four Primitives, One Runtime</h2>
  <p class="section-sub">Everything in Managed Agents reduces to four nouns: Agent, Environment, Session, Event. Understand these and the entire API makes sense.</p>

  <canvas id="canvas-concepts-map" width="700" height="300" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="concepts-detail">
    <strong>Click a node</strong> to explore its role in the runtime.
  </div>

  <div class="grid2" style="margin-top:20px;margin-bottom:20px;">
    <div class="card">
      <div class="card-title" style="color:#7c6af4">Agent</div>
      <div class="card-body">The blueprint. Defines which model, system prompt, tool list, and MCP servers an agent will use. Creating an Agent does nothing — it just registers configuration. Think of it as a class definition.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#00b4d8">Environment</div>
      <div class="card-body">The container template. Specifies what execution resources a session gets — filesystem, network access, installed binaries, memory limits. Environments are reusable across agents.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">Session</div>
      <div class="card-body">The running instance. Combines an Agent with an Environment and starts executing. Sessions have lifecycle states: <code>created → running → paused → complete → failed</code>. This is where computation happens.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">Event</div>
      <div class="card-body">The message unit. Everything that happens in a session is an event: user messages, assistant turns, tool invocations, tool results, status changes. The event log is append-only and queryable.</div>
    </div>
  </div>

  <canvas id="canvas-session-lifecycle" width="700" height="180" style="margin-bottom:20px;cursor:pointer;"></canvas>
  <div id="lifecycle-label" style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:20px;">Session lifecycle — click any state to trigger a transition</div>

  <div class="highlight-box violet">
    <strong>Agent vs Session:</strong> An Agent is like a Docker image — a recipe. A Session is like a running container. You create many Sessions from one Agent, each isolated, each with its own event log.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What is an event log and why is it append-only? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The event log is a sequential record of everything that happened in a session. Append-only means events are never modified or deleted — only new events are added. This gives you a complete audit trail, enables time-travel debugging, and allows resuming a session exactly where it left off after a crash. The model always sees the log as its context.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Can I run multiple agents in one session? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Not directly — a session belongs to one agent. But you can have multiple sessions communicate via the multi-agent API (callable_agents). One session acts as orchestrator and spawns sub-sessions, each with their own agent, environment, and event log. Results flow back as events to the orchestrator.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does pausing a session work? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">A session can be paused mid-execution — for example when it needs human approval before proceeding, or when waiting for an async external event. The environment is preserved (filesystem, process state). When you resume, the agent picks up from the exact event it paused on, as if nothing happened.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-architecture">Inside the Architecture &rarr;</a>
  </div>
</section>

<!-- ====== S3: ARCHITECTURE ====== -->
<section class="section" id="s-architecture">
  <div class="section-tag" style="color:#51cf66">Architecture</div>
  <h2 class="section-title">Brain, Hands, and the Session Log</h2>
  <p class="section-sub">Managed Agents achieves its latency gains through a clean three-way split: a stateless model harness (Brain), isolated execution containers (Hands), and a persistent event log (Session). Each can scale independently.</p>

  <canvas id="canvas-arch-bhs" width="700" height="360" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="arch-detail">
    <strong>Click a component</strong> to see its responsibilities and scaling properties.
  </div>

  <div class="grid3" style="margin-top:20px;margin-bottom:20px;">
    <div class="card">
      <div class="card-title" style="color:#7c6af4">&#129504; Brain — Stateless Harness</div>
      <div class="card-body">The model layer. Receives events, generates the next assistant turn, emits tool calls. Completely stateless — it reads the event log, produces output, done. Can be scaled horizontally with zero coordination. No session state stored here.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">&#128084; Hands — Execution Env</div>
      <div class="card-body">The container layer. Runs tools: shell commands, file I/O, web fetches, MCP servers. Each session gets its own isolated environment. Results are written back to the event log. The Brain never directly touches the environment.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#f7b731">&#128196; Session — Event Log</div>
      <div class="card-body">The memory layer. An append-only ledger of every event. Both Brain and Hands read from it; both write to it. Durable, queryable, resumable. This decoupling is what enables the -60%/-90% TTFT improvements.</div>
    </div>
  </div>

  <div class="formula">// Why TTFT drops so dramatically:
//
// BEFORE (traditional agents):
//   [collect all tool results] → [build full prompt] → [model starts streaming]
//   p50 first token: ~4.2s   p95 first token: ~18s
//
// AFTER (managed agents):
//   [model reads partial event log] → [starts streaming immediately]
//   [tool results arrive as new events while model is running]
//   p50 first token: ~1.7s (-60%)   p95 first token: ~1.8s (-90%)</div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Why is statelessness in the Brain an advantage? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Stateless services are trivially scalable — you can add more Brain instances without coordination, routing, or sticky sessions. If a Brain instance crashes mid-generation, the next one picks up from the event log with no data loss. It also simplifies reasoning about correctness: the model always operates on the canonical log.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How are containers isolated between sessions? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Each session gets a fresh container from the Environment template. Filesystem namespaces, network policies, and resource limits (CPU/memory) are applied per-session. Sessions cannot see each other's filesystems. When a session ends, the container is destroyed (though you can snapshot the filesystem before teardown).</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-event-loop">The Event Loop &rarr;</a>
  </div>
</section>

<!-- ====== S4: EVENT LOOP ====== -->
<section class="section" id="s-event-loop">
  <div class="section-tag" style="color:#f7b731">The Event Loop</div>
  <h2 class="section-title">Everything Is an Event</h2>
  <p class="section-sub">The event loop is the heartbeat of a Managed Agent session. User messages, model turns, tool invocations, tool results, and status changes all flow as typed events through the same append-only log.</p>

  <canvas id="canvas-event-loop" width="700" height="320" style="margin-bottom:16px;"></canvas>
  <div class="btn-row">
    <button class="btn" onclick="resetEventLoop()">&#9654; Run Loop</button>
    <button class="btn-tab" id="btn-pause-loop" onclick="pauseEventLoop()">&#9646;&#9646; Pause</button>
  </div>

  <div class="event-feed" id="event-feed">
    <div class="event-line"><span class="event-ts">00:00:00 </span><span class="event-type">session.created </span><span class="event-data">{ id: "sess_01", agent: "code-reviewer" }</span></div>
  </div>

  <div class="grid2" style="margin-top:20px;margin-bottom:20px;">
    <div>
      <div class="card-title" style="color:#f7b731;margin-bottom:10px;font-size:11px;text-transform:uppercase;letter-spacing:.8px;">Event Types</div>
      <div id="event-types-list">
        <div class="tool-card" style="margin-bottom:8px;" onclick="showEventType('user_message')">
          <div class="tool-name">user_message</div>
          <div class="tool-desc">Human turn — text, files, or structured data sent to the session</div>
        </div>
        <div class="tool-card" style="margin-bottom:8px;" onclick="showEventType('assistant_turn')">
          <div class="tool-name">assistant_turn</div>
          <div class="tool-desc">Model response — text and/or tool_use blocks</div>
        </div>
        <div class="tool-card" style="margin-bottom:8px;" onclick="showEventType('tool_use')">
          <div class="tool-name">tool_use</div>
          <div class="tool-desc">Tool invocation emitted by the model — name, input, call ID</div>
        </div>
        <div class="tool-card" style="margin-bottom:8px;" onclick="showEventType('tool_result')">
          <div class="tool-name">tool_result</div>
          <div class="tool-desc">Execution environment returns the result for a tool_use call</div>
        </div>
        <div class="tool-card" onclick="showEventType('status_change')">
          <div class="tool-name">status_change</div>
          <div class="tool-desc">Session transitions: running → paused → complete → failed</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card-title" style="color:#f7b731;margin-bottom:10px;font-size:11px;text-transform:uppercase;letter-spacing:.8px;">Event Schema</div>
      <div class="info-panel" id="event-type-detail" style="min-height:300px;">
        <strong>Click an event type</strong> to see its JSON schema and an example payload.
      </div>
    </div>
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How do I stream events in real time? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Use the <code>GET /v1/sessions/{id}/events?stream=true</code> endpoint with Server-Sent Events (SSE). Each event is delivered as a JSON line as soon as it's written to the log. You can also poll with <code>after_event_id</code> for simpler integrations that don't need sub-second delivery.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Can I inject events from outside the session? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Yes — POST a <code>user_message</code> event to a running session to send a new human turn. You can also post structured <code>tool_result</code> events for tools that run outside the managed environment (e.g., calling your own API). This is how human-in-the-loop approval flows work.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-multiagent">Multi-Agent Threads &rarr;</a>
  </div>
</section>

<!-- ====== S5: MULTI-AGENT ====== -->
<section class="section" id="s-multiagent">
  <div class="section-tag" style="color:#00b4d8">Multi-Agent Orchestration</div>
  <h2 class="section-title">Orchestrators, Subagents, and Session Threads</h2>
  <p class="section-sub">Complex tasks decompose naturally into parallel workstreams. An orchestrator session can spawn multiple subagent sessions, each with its own agent definition, isolated environment, and independent event log. Results flow back as events.</p>

  <canvas id="canvas-multi-thread" width="700" height="360" style="margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="btn-row">
    <button class="btn" onclick="startMultiAgent()">&#9654; Simulate</button>
    <button class="btn-tab" onclick="resetMultiAgent()">&#8635; Reset</button>
  </div>

  <div class="formula">// Multi-agent API pattern:
const agent = await client.beta.agents.create({
  model: "claude-opus-4-6",
  system: "You are a research orchestrator.",
  callable_agents: [
    { agent_id: "web-researcher", alias: "search" },
    { agent_id: "code-analyst",  alias: "analyze" },
    { agent_id: "summarizer",    alias: "summarize" }
  ]
});
// The model calls sub-agents like tools:
// { type: "agent_use", agent: "search", input: { query: "..." } }</div>

  <div class="grid3" style="margin-bottom:24px;">
    <div class="card">
      <div class="card-title" style="color:#00b4d8">Orchestrator Pattern</div>
      <div class="card-body">One session acts as coordinator. It decomposes the task, dispatches subtasks to specialist subagents via <code>callable_agents</code>, collects results as <code>agent_result</code> events, and synthesizes the final response.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">Parallel Isolation</div>
      <div class="card-body">Subagent sessions run concurrently in fully isolated containers. A crash in one subagent doesn't affect others. The orchestrator receives a <code>failed</code> event and can retry, skip, or escalate.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#7c6af4">Session Threading</div>
      <div class="card-body">Each subagent call creates a child session with a full event log. You can inspect, replay, and debug the subagent's reasoning independently — without re-running the entire orchestration.</div>
    </div>
  </div>

  <div class="highlight-box">
    <strong>Rate limits:</strong> 60 session create/min · 600 event read/min. For high-throughput orchestration, batch subagent calls and use event streaming rather than polling individual sessions.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How does the orchestrator wait for all subagents? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The orchestrator model emits multiple <code>agent_use</code> calls in a single turn (like parallel tool calls). The runtime dispatches all of them concurrently and writes the results back as <code>agent_result</code> events once each subagent completes. The orchestrator's next turn only begins when all pending agent calls have resolved.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">Can subagents call other subagents? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Yes — the tree can be arbitrarily deep. A subagent can itself have callable_agents, spawning grandchildren. Anthropic recommends limiting depth to 3 levels for practical observability. Deep trees are fully inspectable — each node has its own queryable event log.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-tools">Tools &amp; Security &rarr;</a>
  </div>
</section>

<!-- ====== S6: TOOLS & SECURITY ====== -->
<section class="section" id="s-tools">
  <div class="section-tag" style="color:#ff6b6b">Tools &amp; Security</div>
  <h2 class="section-title">What Agents Can Do — and How They're Contained</h2>
  <p class="section-sub">Managed Agents provides a rich tool set out of the box. Security is enforced at the container level — tools run inside the isolated execution environment, not the model harness.</p>

  <div id="tools-grid" class="grid4" style="margin-bottom:20px;">
    <div class="tool-card" onclick="showTool('bash')">
      <div class="tool-icon">&#128187;</div>
      <div class="tool-name">Bash</div>
      <div class="tool-desc">Run shell commands in the container</div>
    </div>
    <div class="tool-card" onclick="showTool('files')">
      <div class="tool-icon">&#128196;</div>
      <div class="tool-name">File I/O</div>
      <div class="tool-desc">Read, write, create, delete files</div>
    </div>
    <div class="tool-card" onclick="showTool('websearch')">
      <div class="tool-icon">&#128269;</div>
      <div class="tool-name">Web Search</div>
      <div class="tool-desc">Query the web, return structured results</div>
    </div>
    <div class="tool-card" onclick="showTool('webfetch')">
      <div class="tool-icon">&#127758;</div>
      <div class="tool-name">Web Fetch</div>
      <div class="tool-desc">Fetch and parse any URL's content</div>
    </div>
    <div class="tool-card" onclick="showTool('mcp')">
      <div class="tool-icon">&#128268;</div>
      <div class="tool-name">MCP Servers</div>
      <div class="tool-desc">Connect to any MCP-compatible service</div>
    </div>
    <div class="tool-card" onclick="showTool('code')">
      <div class="tool-icon">&#128736;</div>
      <div class="tool-name">Code Run</div>
      <div class="tool-desc">Execute Python, JS, and more in sandbox</div>
    </div>
    <div class="tool-card" onclick="showTool('screenshot')">
      <div class="tool-icon">&#128247;</div>
      <div class="tool-name">Screenshot</div>
      <div class="tool-desc">Capture browser or desktop screenshots</div>
    </div>
    <div class="tool-card" onclick="showTool('agent')">
      <div class="tool-icon">&#129302;</div>
      <div class="tool-name">Agents</div>
      <div class="tool-desc">Call subagent sessions as tools</div>
    </div>
  </div>

  <div class="info-panel" id="tool-detail">
    <strong>Click a tool</strong> to see its capabilities, input schema, and security boundaries.
  </div>

  <canvas id="canvas-security-model" width="700" height="280" style="margin-top:20px;margin-bottom:12px;cursor:pointer;"></canvas>
  <div class="info-panel" id="security-detail">
    <strong>Click a security layer</strong> to learn how it protects the host system.
  </div>

  <div class="highlight-box red" style="margin-top:20px;">
    <strong>Resource-bound auth:</strong> Credentials are never injected into the container environment directly. Instead, a Vault+MCP proxy mediates all auth flows — the agent requests access, the proxy evaluates the resource policy, and issues a scoped token. The container never sees the master credentials.
  </div>

  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">How do I restrict which tools an agent can use? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">Define the <code>tools</code> array in your Agent config — only listed tools are available in sessions. For finer control, add a <code>tool_policy</code> to the Environment: specify allowed paths for file operations, allowed domains for web fetch, or a denylist of shell commands. Policies are enforced at the container level, not by the model.</div>
  </div>
  <div class="accordion-item">
    <div class="accordion-header" onclick="toggleAcc(this)">What happens if a tool exceeds its resource limit? <span class="accordion-chevron">&#9660;</span></div>
    <div class="accordion-body">The container's cgroup enforces CPU, memory, and disk limits. If a tool call exceeds them (e.g., a runaway process), the container runtime sends SIGKILL to the offending process. A <code>tool_result</code> event with <code>error: "resource_limit_exceeded"</code> is written to the event log. The session continues — the model receives the error and can decide how to proceed.</div>
  </div>

  <div class="section-bridge">
    <a class="section-bridge-link" href="#s-api">Getting Started &rarr;</a>
  </div>
</section>

<!-- ====== S7: API / GETTING STARTED ====== -->
<section class="section" id="s-api">
  <div class="section-tag" style="color:#7c6af4">Getting Started</div>
  <h2 class="section-title">From Zero to Running Agent in 5 Steps</h2>
  <p class="section-sub">The Managed Agents API follows the same conventions as the Anthropic Messages API. Beta header required during preview. Five steps from setup to a running session.</p>

  <canvas id="canvas-api-flow" width="700" height="200" style="margin-bottom:16px;"></canvas>
  <div id="api-step-label" style="text-align:center;font-size:12px;color:var(--muted);margin-bottom:20px;">Click "Run Steps" to walk through the API flow</div>
  <div class="btn-row">
    <button class="btn" onclick="runApiFlow()">&#9654; Run Steps</button>
    <button class="btn-tab" onclick="resetApiFlow()">&#8635; Reset</button>
  </div>

  <div class="btn-row" style="margin-top:20px;">
    <button class="btn-tab active" id="tab-python" onclick="showCodeTab('python')">Python</button>
    <button class="btn-tab" id="tab-node" onclick="showCodeTab('node')">Node.js</button>
    <button class="btn-tab" id="tab-curl" onclick="showCodeTab('curl')">cURL</button>
  </div>

  <div id="code-python" class="code-block">import anthropic

client = anthropic.Anthropic()

# Step 1: Create an agent blueprint
agent = client.beta.agents.create(
    model="claude-opus-4-6",
    name="code-reviewer",
    system="You are an expert code reviewer.",
    tools=["bash", "files", "web_search"],
    betas=["managed-agents-2026-04-01"]
)

# Step 2: Create an execution environment
env = client.beta.environments.create(
    name="review-env",
    container_template="python3.11",
    memory_mb=2048,
    betas=["managed-agents-2026-04-01"]
)

# Step 3: Start a session
session = client.beta.sessions.create(
    agent_id=agent.id,
    environment_id=env.id,
    betas=["managed-agents-2026-04-01"]
)

# Step 4: Send a message
client.beta.sessions.events.create(
    session_id=session.id,
    type="user_message",
    content="Review this PR: [paste diff here]",
    betas=["managed-agents-2026-04-01"]
)

# Step 5: Stream events
for event in client.beta.sessions.events.stream(
    session_id=session.id,
    betas=["managed-agents-2026-04-01"]
):
    if event.type == "assistant_turn":
        print(event.content)
    elif event.type == "status_change" and event.status == "complete":
        break</div>

  <div id="code-node" class="code-block" style="display:none;">import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();
const BETA = 'managed-agents-2026-04-01';

// Step 1: Create agent
const agent = await client.beta.agents.create({
  model: 'claude-opus-4-6',
  name: 'code-reviewer',
  system: 'You are an expert code reviewer.',
  tools: ['bash', 'files', 'web_search'],
  betas: [BETA]
});

// Step 2: Create environment
const env = await client.beta.environments.create({
  name: 'review-env',
  container_template: 'node20',
  memory_mb: 2048,
  betas: [BETA]
});

// Step 3: Start session
const session = await client.beta.sessions.create({
  agent_id: agent.id,
  environment_id: env.id,
  betas: [BETA]
});

// Step 4: Send message
await client.beta.sessions.events.create({
  session_id: session.id,
  type: 'user_message',
  content: 'Review this PR...',
  betas: [BETA]
});

// Step 5: Stream events
const stream = client.beta.sessions.events.stream({
  session_id: session.id,
  betas: [BETA]
});

for await (const event of stream) {
  if (event.type === 'assistant_turn') console.log(event.content);
  if (event.type === 'status_change' && event.status === 'complete') break;
}</div>

  <div id="code-curl" class="code-block" style="display:none;"># Step 1: Create agent
curl https://api.anthropic.com/v1/beta/agents \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-beta: managed-agents-2026-04-01" \\
  -d '{"model":"claude-opus-4-6","name":"code-reviewer","tools":["bash","files"]}'

# Step 2: Create environment
curl https://api.anthropic.com/v1/beta/environments \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-beta: managed-agents-2026-04-01" \\
  -d '{"name":"review-env","container_template":"python3.11"}'

# Step 3: Start session
curl https://api.anthropic.com/v1/beta/sessions \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-beta: managed-agents-2026-04-01" \\
  -d '{"agent_id":"agt_xxx","environment_id":"env_xxx"}'

# Step 4: Send message
curl https://api.anthropic.com/v1/beta/sessions/sess_xxx/events \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-beta: managed-agents-2026-04-01" \\
  -d '{"type":"user_message","content":"Review this PR..."}'

# Step 5: Stream events (SSE)
curl -N "https://api.anthropic.com/v1/beta/sessions/sess_xxx/events?stream=true" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-beta: managed-agents-2026-04-01"</div>

  <div class="grid3" style="margin-top:28px;margin-bottom:24px;">
    <div class="card">
      <div class="card-title" style="color:#7c6af4">Pricing</div>
      <div class="card-body">$0.08 per session-hour of active execution + standard model token pricing. Sessions that are paused or idle do not count toward the hourly rate. Environments are free to create; you only pay when sessions are running.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#00b4d8">Rate Limits</div>
      <div class="card-body">60 session create/min · 600 event read/min · 20 concurrent active sessions per workspace (beta). Orchestration patterns that dispatch many subagents in parallel should fan-out through a single orchestrator session.</div>
    </div>
    <div class="card">
      <div class="card-title" style="color:#51cf66">Beta Access</div>
      <div class="card-body">Available on the Anthropic Console under "Managed Agents (Beta)". Requires including <code>anthropic-beta: managed-agents-2026-04-01</code> in every request. All endpoints are under <code>/v1/beta/</code> during the preview period.</div>
    </div>
  </div>

  <div class="highlight-box violet">
    <strong>What this enables:</strong> Long-running research agents, automated code review pipelines, multi-step data analysis, parallelized content generation — all without managing your own container infrastructure or building custom session state.
  </div>
</section>

</div><!-- end .main -->

<script>
var PG_PASSWORD='visual2025';
var PG_KEY='pg_unlocked_20';
function pgCheck(){
  var v=document.getElementById('pg-input').value.trim();
  if(v===PG_PASSWORD){sessionStorage.setItem(PG_KEY,'1');document.getElementById('pg-gate').style.display='none';}
  else{document.getElementById('pg-err').textContent='Incorrect password. Try again.';}
}
document.getElementById('pg-input').addEventListener('keydown',function(e){if(e.key==='Enter')pgCheck();});
if(sessionStorage.getItem(PG_KEY)==='1'){document.getElementById('pg-gate').style.display='none';}

var sectionIds=['s-overview','s-why-managed','s-concepts','s-architecture','s-event-loop','s-multiagent','s-tools','s-api'];
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
function showCodeTab(lang){
  ['python','node','curl'].forEach(function(l){
    document.getElementById('code-'+l).style.display=l===lang?'block':'none';
    var btn=document.getElementById('tab-'+l);
    if(btn)btn.classList.toggle('active',l===lang);
  });
}

// Event type schema data
var EVENT_SCHEMAS={
  user_message:{desc:"A human turn sent to the session. Contains text, files, or structured data.",schema:'{\\n  \\"type\\": \\"user_message\\",\\n  \\"id\\": \\"evt_abc123\\",\\n  \\"session_id\\": \\"sess_xyz\\",\\n  \\"timestamp\\": \\"2026-04-12T09:00:00Z\\",\\n  \\"content\\": \\"Review this PR diff: ...\\"\\n}'},
  assistant_turn:{desc:"A model response. May contain text and tool_use blocks requesting tool execution.",schema:'{\\n  \\"type\\": \\"assistant_turn\\",\\n  \\"content\\": [\\n    { \\"type\\": \\"text\\", \\"text\\": \\"I will review this now...\\" },\\n    { \\"type\\": \\"tool_use\\", \\"id\\": \\"tu_1\\",\\n      \\"name\\": \\"bash\\",\\n      \\"input\\": { \\"command\\": \\"git diff HEAD~1\\" } }\\n  ]\\n}'},
  tool_use:{desc:"A tool invocation. The execution environment picks this up and runs the tool.",schema:'{\\n  \\"type\\": \\"tool_use\\",\\n  \\"id\\": \\"tu_1\\",\\n  \\"name\\": \\"bash\\",\\n  \\"input\\": {\\n    \\"command\\": \\"pytest tests/ -v --tb=short\\"\\n  }\\n}'},
  tool_result:{desc:"The result of a tool execution. Written back to the log by the environment.",schema:'{\\n  \\"type\\": \\"tool_result\\",\\n  \\"tool_use_id\\": \\"tu_1\\",\\n  \\"content\\": [\\n    { \\"type\\": \\"text\\",\\n      \\"text\\": \\"14 passed, 0 failed (2.3s)\\" }\\n  ],\\n  \\"is_error\\": false\\n}'},
  status_change:{desc:"Session lifecycle transition. Emitted when the session moves between states.",schema:'{\\n  \\"type\\": \\"status_change\\",\\n  \\"previous_status\\": \\"running\\",\\n  \\"new_status\\": \\"complete\\",\\n  \\"reason\\": \\"max_turns_reached\\"\\n}'}
};
function showEventType(key){
  var data=EVENT_SCHEMAS[key];
  if(!data)return;
  document.querySelectorAll('#event-types-list .tool-card').forEach(function(c){c.classList.remove('active');});
  event.currentTarget.classList.add('active');
  document.getElementById('event-type-detail').innerHTML='<strong>'+key+'</strong><br><span style="color:var(--muted);font-size:12px;margin:6px 0 10px;display:block;">'+data.desc+'</span><pre style="font-family:JetBrains Mono,monospace;font-size:10px;color:#38d9f5;line-height:1.6;white-space:pre-wrap;">'+data.schema+'</pre>';
}

// Tool detail data
var TOOL_DATA={
  bash:{name:"Bash",icon:"&#128187;",desc:"Execute shell commands inside the isolated container. Full Unix shell access within the resource limits of the session environment.",schema:'{ "command": "string" }',notes:"Commands run as a non-root user. Filesystem writes are scoped to the session directory. Network access follows the Environment's network policy."},
  files:{name:"File I/O",icon:"&#128196;",desc:"Read, write, create, move, and delete files within the session's filesystem.",schema:'{ "action": "read|write|list|delete", "path": "string", "content"?: "string" }',notes:"All paths are resolved relative to the session root. Attempts to write outside the sandbox raise a permission error."},
  websearch:{name:"Web Search",icon:"&#128269;",desc:"Query the web and receive structured results: titles, URLs, snippets, published dates.",schema:'{ "query": "string", "num_results"?: "number" }',notes:"Results are cached per session to avoid redundant fetches. Safe-search filters are always enabled."},
  webfetch:{name:"Web Fetch",icon:"&#127758;",desc:"Fetch a URL and return its parsed content: clean text, links, or raw HTML.",schema:'{ "url": "string", "format": "text|html|links" }',notes:"Follows redirects up to 5 hops. Respects robots.txt unless explicitly overridden in the Environment policy."},
  mcp:{name:"MCP Servers",icon:"&#128268;",desc:"Connect to any Model Context Protocol server registered in the Environment. Exposes the server's tools natively to the model.",schema:'{ "server": "string", "tool": "string", "input": "object" }',notes:"MCP servers run as sidecar containers within the session environment. Authentication is handled by the Vault+MCP proxy."},
  code:{name:"Code Run",icon:"&#128736;",desc:"Execute Python, JavaScript, TypeScript, or Bash in an ephemeral sub-sandbox with package installation support.",schema:'{ "language": "python|js|bash", "code": "string", "packages"?: ["string"] }',notes:"Sub-sandboxes have a 30s execution timeout. stdout/stderr are captured and returned as the tool result."},
  screenshot:{name:"Screenshot",icon:"&#128247;",desc:"Capture a screenshot of a running browser or desktop UI within the container.",schema:'{ "target": "browser|desktop", "url"?: "string" }',notes:"The container must have a display server running. Screenshots are returned as base64-encoded PNG."},
  agent:{name:"Callable Agents",icon:"&#129302;",desc:"Invoke a subagent session as a tool call. The subagent runs in its own environment and its result is returned as an event.",schema:'{ "agent": "alias_string", "input": "string|object" }',notes:"Agent calls are asynchronous — the orchestrator session blocks until the subagent completes or fails."}
};
function showTool(key){
  var d=TOOL_DATA[key];
  if(!d)return;
  document.querySelectorAll('#tools-grid .tool-card').forEach(function(c){c.classList.remove('active');});
  event.currentTarget.classList.add('active');
  document.getElementById('tool-detail').innerHTML='<strong>'+d.icon+' '+d.name+'</strong> — '+d.desc+'<br><br><span style="font-size:11px;color:var(--muted);">Input schema: <code style="color:#38d9f5;">'+d.schema+'</code></span><br><br><span style="font-size:11px;color:var(--muted);">'+d.notes+'</span>';
}
</script>
<script>
/* CANVAS CODE INJECTED HERE */
</script>
</body>
</html>`;

fs.writeFileSync('index.html',html,'utf8');
console.log('build1 done');
