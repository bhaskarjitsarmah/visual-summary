// inject_v3.js — adds 8 new sections to Blog 22
const fs = require('fs');

// ===== NAV ITEMS =====
const NAV_NEW = `  <div class="nav-group-title">Expert Tools</div>
  <div class="nav-link" data-sec="s-inventory" onclick="setActive(this,'s-inventory')">
    <span class="dot" style="background:#6c5ce7"></span>System Inventory</div>
  <div class="nav-link" data-sec="s-checklist" onclick="setActive(this,'s-checklist')">
    <span class="dot" style="background:#0984e3"></span>72-Subcat Checklist</div>
  <div class="nav-link" data-sec="s-advisor" onclick="setActive(this,'s-advisor')">
    <span class="dot" style="background:#00b894"></span>Priority Advisor</div>
  <div class="nav-link" data-sec="s-genai-wheel" onclick="setActive(this,'s-genai-wheel')">
    <span class="dot" style="background:#fd79a8"></span>GenAI Risk Wheel</div>
  <div class="nav-link" data-sec="s-tension" onclick="setActive(this,'s-tension')">
    <span class="dot" style="background:#f7b731"></span>Tension Map</div>
  <div class="nav-link" data-sec="s-incidents" onclick="setActive(this,'s-incidents')">
    <span class="dot" style="background:#ff6b6b"></span>Incident Mapper</div>
  <div class="nav-link" data-sec="s-decision" onclick="setActive(this,'s-decision')">
    <span class="dot" style="background:#51cf66"></span>Decision Tree</div>
  <div class="nav-link" data-sec="s-stakeholder" onclick="setActive(this,'s-stakeholder')">
    <span class="dot" style="background:#a29bfe"></span>Stakeholder Comms</div>`;

// ===== HTML SECTIONS =====
const SECTIONS_NEW = `
<section class="section" id="s-inventory">
  <div class="section-tag" style="color:#6c5ce7">Expert Tools &middot; Interactive</div>
  <h2>AI System Inventory Builder</h2>
  <p class="sub">Track every AI system in your organization with its risk profile, lifecycle stage, and RMF coverage. A complete inventory is the prerequisite for MAP-1.1 and GV-1.1 compliance.</p>
  <div style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px;">
      <div>
        <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">System Name</div>
        <input id="inv-name" type="text" placeholder="e.g. Hiring Screener v2" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;box-sizing:border-box;">
      </div>
      <div>
        <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">AI Type</div>
        <select id="inv-type" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
          <option value="decision">Decision Support</option>
          <option value="generative">Generative AI</option>
          <option value="classification">Classification</option>
          <option value="prediction">Prediction</option>
          <option value="nlp">NLP / Text</option>
          <option value="vision">Computer Vision</option>
        </select>
      </div>
      <div>
        <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Risk Level</div>
        <select id="inv-risk" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
        <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Lifecycle Stage</div>
        <select id="inv-stage" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
          <option value="design">Plan &amp; Design</option>
          <option value="dev">Development</option>
          <option value="deployed">Deployed</option>
          <option value="monitoring">Monitoring</option>
          <option value="decommission">Decommissioning</option>
        </select>
      </div>
      <div>
        <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Owner / Team</div>
        <input id="inv-owner" type="text" placeholder="e.g. ML Platform Team" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;box-sizing:border-box;">
      </div>
      <div>
        <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">RMF Coverage</div>
        <select id="inv-rmf" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
          <option value="none">None yet</option>
          <option value="partial">Partial (1-2 functions)</option>
          <option value="most">Most (3 functions)</option>
          <option value="full">Full (all 4 functions)</option>
        </select>
      </div>
    </div>
    <div style="display:flex;gap:10px;">
      <button class="btn" onclick="invAdd()">Add System</button>
      <button class="btn" onclick="invExport()" style="background:#161b22;border:1px solid #30363d;">Export JSON</button>
      <button class="btn" onclick="invClear()" style="background:#161b22;border:1px solid #30363d;color:#ff6b6b;">Clear All</button>
    </div>
  </div>
  <div id="inv-table-wrap" style="overflow-x:auto;">
    <div style="color:#8b949e;font-size:13px;padding:12px 0;">No systems added yet. Fill the form above and click Add System.</div>
  </div>
</section>

<section class="section" id="s-checklist">
  <div class="section-tag" style="color:#0984e3">Expert Tools &middot; Assessment</div>
  <h2>72-Subcategory Assessment Checklist</h2>
  <p class="sub">Track your implementation status across all four RMF functions. For each subcategory, mark Pass, Partial, Fail, or N/A. The dashboard updates in real time.</p>
  <div style="display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
    <canvas id="canvas-checklist" width="680" height="110" style="border-radius:10px;"></canvas>
  </div>
  <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
    <button class="btn" onclick="checkExport()" style="background:#161b22;border:1px solid #30363d;">Export Report</button>
    <button class="btn" onclick="checkReset()" style="background:#161b22;border:1px solid #30363d;color:#ff6b6b;">Reset All</button>
    <span id="check-summary" style="font-size:12px;color:#8b949e;padding-top:8px;"></span>
  </div>
  <div id="checklist-body" style="display:flex;flex-direction:column;gap:8px;"></div>
</section>

<section class="section" id="s-advisor">
  <div class="section-tag" style="color:#00b894">Expert Tools &middot; Prioritization</div>
  <h2>Subcategory Prioritization Advisor</h2>
  <p class="sub">Select your organization context and get a data-driven ranking of which RMF subcategories to tackle first. Scores combine regulatory risk, implementation effort, and impact leverage.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Organization Size</div>
      <select id="adv-size" onchange="advisorCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="small">Small (&lt;50 employees)</option>
        <option value="mid" selected>Mid (50-500)</option>
        <option value="large">Large (500+)</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Sector</div>
      <select id="adv-sector" onchange="advisorCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="general">General</option>
        <option value="healthcare">Healthcare</option>
        <option value="finance">Finance</option>
        <option value="government">Government</option>
        <option value="hr">HR / Hiring</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Primary AI Type</div>
      <select id="adv-aitype" onchange="advisorCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="decision">Decision Support</option>
        <option value="generative">Generative AI</option>
        <option value="classification">Classification</option>
        <option value="prediction">Prediction</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Current Maturity</div>
      <select id="adv-maturity" onchange="advisorCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="none">No RMF practice</option>
        <option value="initial">Initial (ad hoc)</option>
        <option value="managed">Managed (partial)</option>
        <option value="defined">Defined (systematic)</option>
      </select>
    </div>
  </div>
  <canvas id="canvas-advisor" width="680" height="320" style="cursor:pointer;margin-bottom:12px;" onclick="advisorClickCanvas(event)"></canvas>
  <div id="adv-detail" style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;font-size:13px;color:#8b949e;min-height:48px;">Click a bar to see why this subcategory is prioritized for your context.</div>
</section>

<section class="section" id="s-genai-wheel">
  <div class="section-tag" style="color:#fd79a8">GenAI Profile &middot; NIST-AI-600-1</div>
  <h2>GenAI Risk Wheel</h2>
  <p class="sub">The Generative AI Profile (NIST-AI-600-1, July 2024) identifies 12 unique risks specific to generative AI systems. Click any spoke to explore the risk, its severity, and which RMF subcategories address it.</p>
  <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start;">
    <canvas id="canvas-genai-wheel" width="420" height="420" style="cursor:pointer;" onclick="genaiWheelClick(event)"></canvas>
    <div id="genai-wheel-detail" style="flex:1;min-width:220px;background:#161b22;border:1px solid #30363d;border-radius:10px;padding:18px;font-size:13px;color:#8b949e;">
      Click a spoke to explore that GenAI risk.
    </div>
  </div>
</section>

<section class="section" id="s-tension">
  <div class="section-tag" style="color:#f7b731">Trustworthy AI &middot; Trade-offs</div>
  <h2>Trustworthiness Tension Map</h2>
  <p class="sub">The 7 trustworthiness characteristics are design requirements, not a checklist. Some pull against each other in practice. Understanding these tensions is essential for making informed trade-off decisions.</p>
  <canvas id="canvas-tension" width="680" height="360" style="cursor:pointer;" onclick="tensionClick(event)" onmousemove="tensionHover(event)"></canvas>
  <div id="tension-detail" style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;font-size:13px;color:#8b949e;margin-top:12px;min-height:52px;">Click a tension edge (dashed line) to understand the trade-off and how the RMF approaches it.</div>
</section>

<section class="section" id="s-incidents">
  <div class="section-tag" style="color:#ff6b6b">Case Studies &middot; RMF Gaps</div>
  <h2>Real-World AI Incident &rarr; RMF Gap Mapper</h2>
  <p class="sub">Each real AI incident maps to specific RMF subcategory gaps that allowed it to occur. Click an incident to see which steps were skipped and what the framework would have caught.</p>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;" id="incident-btns"></div>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
    <canvas id="canvas-incidents" width="400" height="320" style="border-radius:10px;flex-shrink:0;"></canvas>
    <div id="incident-detail" style="flex:1;min-width:220px;background:#161b22;border:1px solid #30363d;border-radius:10px;padding:18px;font-size:13px;color:#8b949e;">Select an incident above to see the RMF gap analysis.</div>
  </div>
</section>

<section class="section" id="s-decision">
  <div class="section-tag" style="color:#51cf66">Decision Support &middot; Interactive</div>
  <h2>AI Deployment Decision Tree</h2>
  <p class="sub">Answer 8 yes/no questions about your AI system and get a deployment recommendation grounded in the RMF. Each question maps to a specific subcategory that must be satisfied.</p>
  <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
    <div style="flex:1;min-width:280px;">
      <div id="decision-q-panel" style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:20px;margin-bottom:12px;">
        <div id="decision-progress" style="font-size:11px;color:#8b949e;margin-bottom:8px;"></div>
        <div id="decision-ref" style="font-size:11px;color:#51cf66;margin-bottom:6px;"></div>
        <div id="decision-q" style="font-size:15px;color:#c9d1d9;font-weight:600;line-height:1.5;margin-bottom:16px;">Press Start to begin the assessment.</div>
        <div style="display:flex;gap:10px;">
          <button class="btn" id="dec-yes" onclick="decisionAnswer(true)" style="display:none;background:#51cf66;color:#0d1117;">Yes</button>
          <button class="btn" id="dec-no" onclick="decisionAnswer(false)" style="display:none;background:#ff6b6b;color:#fff;">No</button>
          <button class="btn" id="dec-start" onclick="decisionStart()" style="background:#51cf66;color:#0d1117;">Start Assessment</button>
          <button class="btn" id="dec-reset" onclick="decisionReset()" style="display:none;background:#161b22;border:1px solid #30363d;">Restart</button>
        </div>
      </div>
      <div id="decision-result" style="display:none;border-radius:12px;padding:20px;font-size:14px;"></div>
    </div>
    <canvas id="canvas-decision" width="320" height="380" style="border-radius:10px;flex-shrink:0;"></canvas>
  </div>
</section>

<section class="section" id="s-stakeholder">
  <div class="section-tag" style="color:#a29bfe">Communication &middot; Generator</div>
  <h2>Stakeholder Communication Generator</h2>
  <p class="sub">Different audiences need different explanations of AI risk. Select your audience and context, and get a plain-language summary tailored for that stakeholder — grounded in RMF language.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Audience</div>
      <select id="stk-audience" onchange="stakhGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="board">Board of Directors</option>
        <option value="engineering">Engineering Team</option>
        <option value="legal">Legal / Compliance</option>
        <option value="users">End Users</option>
        <option value="regulators">Regulators</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Risk Level</div>
      <select id="stk-risk" onchange="stakhGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="low">Low Risk</option>
        <option value="medium">Medium Risk</option>
        <option value="high">High Risk</option>
        <option value="critical">Critical Risk</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">AI System Type</div>
      <select id="stk-aitype" onchange="stakhGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="decision">Decision Support</option>
        <option value="generative">Generative AI</option>
        <option value="classification">Classification</option>
        <option value="prediction">Predictive Model</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Primary Concern</div>
      <select id="stk-concern" onchange="stakhGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="bias">Fairness / Bias</option>
        <option value="safety">Safety</option>
        <option value="privacy">Privacy</option>
        <option value="accountability">Accountability</option>
        <option value="explainability">Explainability</option>
      </select>
    </div>
  </div>
  <textarea id="stk-output" readonly style="width:100%;min-height:280px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px;color:#a29bfe;font-family:'JetBrains Mono',monospace;font-size:12px;line-height:1.8;resize:vertical;box-sizing:border-box;"></textarea>
  <div style="display:flex;gap:10px;margin-top:10px;">
    <button class="btn" onclick="stakhGen()">Generate / Refresh</button>
    <button class="btn" onclick="stakhCopy()" style="background:#161b22;border:1px solid #30363d;">Copy to Clipboard</button>
  </div>
</section>`;

// ===== JS DATA AND FUNCTIONS (goes into build1.js <script> block) =====
const JS_NEW = `
// ===== INVENTORY DATA =====
var INVENTORY=[];
var invRiskColors={low:'#51cf66',medium:'#f7b731',high:'#ff6b6b',critical:'#e84118'};
var invRMFMap={
  decision:['MAP-1.1 Intended use','MAP-4.1 Risk priority','MS-2.1 Evaluation','GV-6.2 Human override','MG-2.1 Treatment'],
  generative:['MAP-1.1 Intended use','MS-2.5 Bias audit','MS-2.6 Robustness','GV-1.2 Disclosure','MG-3.2 Incident response'],
  classification:['MAP-3.1 Risk ID','MS-2.5 Fairness','MAP-3.3 Rights impact','MS-2.6 Robustness','MG-1.1 Mitigation'],
  prediction:['MAP-1.1 Scope','MAP-4.2 Tolerance','MS-1.1 Metrics','MS-4.1 Monitoring','MG-4.1 Residual risk'],
  nlp:['MAP-1.3 Context','MS-2.8 Privacy','MS-2.9 Explainability','GV-1.2 Transparency','MG-3.1 Monitoring'],
  vision:['MAP-3.3 Rights impact','MS-2.5 Bias','MS-2.7 Adversarial test','GV-5.1 Regulations','MG-2.2 Controls']
};
function invAdd(){
  var name=document.getElementById('inv-name').value.trim()||'Unnamed System';
  var type=document.getElementById('inv-type').value;
  var risk=document.getElementById('inv-risk').value;
  var stage=document.getElementById('inv-stage').value;
  var owner=document.getElementById('inv-owner').value.trim()||'Unassigned';
  var rmf=document.getElementById('inv-rmf').value;
  INVENTORY.push({id:Date.now(),name:name,type:type,risk:risk,stage:stage,owner:owner,rmf:rmf});
  document.getElementById('inv-name').value='';
  document.getElementById('inv-owner').value='';
  invRender();
}
function invRender(){
  var wrap=document.getElementById('inv-table-wrap');
  if(!wrap)return;
  if(!INVENTORY.length){wrap.innerHTML='<div style="color:#8b949e;font-size:13px;padding:12px 0;">No systems added yet.</div>';return;}
  var rows=INVENTORY.map(function(s,i){
    var rc=invRiskColors[s.risk]||'#8b949e';
    var rmfMap=(invRMFMap[s.type]||[]).slice(0,3).join(', ');
    return '<tr style="border-bottom:1px solid #21262d;">'+
      '<td style="padding:10px 12px;color:#c9d1d9;font-weight:600;">'+s.name+'</td>'+
      '<td style="padding:10px 12px;color:#8b949e;">'+s.type+'</td>'+
      '<td style="padding:10px 12px;"><span style="background:'+rc+'22;color:'+rc+';border-radius:4px;padding:2px 8px;font-size:11px;">'+s.risk.toUpperCase()+'</span></td>'+
      '<td style="padding:10px 12px;color:#8b949e;">'+s.stage+'</td>'+
      '<td style="padding:10px 12px;color:#8b949e;">'+s.owner+'</td>'+
      '<td style="padding:10px 12px;color:#6c5ce7;font-size:11px;">'+rmfMap+'</td>'+
      '<td style="padding:10px 12px;"><button onclick="invRemove('+i+')" style="background:none;border:1px solid #30363d;color:#ff6b6b;border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">Remove</button></td>'+
    '</tr>';
  }).join('');
  wrap.innerHTML='<table style="width:100%;border-collapse:collapse;font-size:13px;">'+
    '<thead><tr style="border-bottom:1px solid #30363d;">'+
    '<th style="text-align:left;padding:8px 12px;color:#8b949e;font-weight:600;">System</th>'+
    '<th style="text-align:left;padding:8px 12px;color:#8b949e;font-weight:600;">Type</th>'+
    '<th style="text-align:left;padding:8px 12px;color:#8b949e;font-weight:600;">Risk</th>'+
    '<th style="text-align:left;padding:8px 12px;color:#8b949e;font-weight:600;">Stage</th>'+
    '<th style="text-align:left;padding:8px 12px;color:#8b949e;font-weight:600;">Owner</th>'+
    '<th style="text-align:left;padding:8px 12px;color:#8b949e;font-weight:600;">Key Subcats</th>'+
    '<th></th>'+
    '</thead><tbody>'+rows+'</tbody></table>';
}
function invRemove(i){INVENTORY.splice(i,1);invRender();}
function invClear(){INVENTORY=[];invRender();}
function invExport(){
  var json=JSON.stringify(INVENTORY,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='ai-inventory.json';a.click();
}

// ===== CHECKLIST DATA =====
var SUBCATS=[
  {fn:'GV',color:'#0984e3',id:'GV-1.1',name:'AI risk policies established'},
  {fn:'GV',color:'#0984e3',id:'GV-1.2',name:'Roles and responsibilities defined'},
  {fn:'GV',color:'#0984e3',id:'GV-1.3',name:'Organizational risk tolerance set'},
  {fn:'GV',color:'#0984e3',id:'GV-1.4',name:'AI risk integrated with enterprise risk'},
  {fn:'GV',color:'#0984e3',id:'GV-1.5',name:'Policies enforced and updated'},
  {fn:'GV',color:'#0984e3',id:'GV-1.6',name:'Policies cover entire AI lifecycle'},
  {fn:'GV',color:'#0984e3',id:'GV-2.1',name:'AI risk accountability defined'},
  {fn:'GV',color:'#0984e3',id:'GV-2.2',name:'Risk tolerance documented and communicated'},
  {fn:'GV',color:'#0984e3',id:'GV-3.1',name:'AI governance teams established'},
  {fn:'GV',color:'#0984e3',id:'GV-3.2',name:'Teams reflect organizational diversity'},
  {fn:'GV',color:'#0984e3',id:'GV-4.1',name:'Leadership committed to AI risk management'},
  {fn:'GV',color:'#0984e3',id:'GV-4.2',name:'Organizational incentives support risk management'},
  {fn:'GV',color:'#0984e3',id:'GV-5.1',name:'Regulatory requirements identified'},
  {fn:'GV',color:'#0984e3',id:'GV-5.2',name:'Practices align with applicable standards'},
  {fn:'GV',color:'#0984e3',id:'GV-6.1',name:'Human oversight policies documented'},
  {fn:'GV',color:'#0984e3',id:'GV-6.2',name:'Human override capability documented'},
  {fn:'MP',color:'#f7b731',id:'MAP-1.1',name:'Intended purpose documented'},
  {fn:'MP',color:'#f7b731',id:'MAP-1.2',name:'Scientific basis reviewed'},
  {fn:'MP',color:'#f7b731',id:'MAP-1.3',name:'Context and environment established'},
  {fn:'MP',color:'#f7b731',id:'MAP-1.4',name:'Affected individuals identified'},
  {fn:'MP',color:'#f7b731',id:'MAP-1.5',name:'Benefits documented'},
  {fn:'MP',color:'#f7b731',id:'MAP-1.6',name:'AI risk management prioritized'},
  {fn:'MP',color:'#f7b731',id:'MAP-2.1',name:'Scientific basis for trustworthiness established'},
  {fn:'MP',color:'#f7b731',id:'MAP-2.2',name:'Scientific basis for risk established'},
  {fn:'MP',color:'#f7b731',id:'MAP-3.1',name:'AI risks identified and documented'},
  {fn:'MP',color:'#f7b731',id:'MAP-3.2',name:'Potential benefits identified'},
  {fn:'MP',color:'#f7b731',id:'MAP-3.3',name:'Fundamental rights impact assessed'},
  {fn:'MP',color:'#f7b731',id:'MAP-3.4',name:'Third-party AI risks assessed'},
  {fn:'MP',color:'#f7b731',id:'MAP-3.5',name:'Data-related risks assessed'},
  {fn:'MP',color:'#f7b731',id:'MAP-4.1',name:'Risk prioritization documented'},
  {fn:'MP',color:'#f7b731',id:'MAP-4.2',name:'Risk tolerances applied to prioritization'},
  {fn:'MP',color:'#f7b731',id:'MAP-5.1',name:'Likelihood of risks estimated'},
  {fn:'MP',color:'#f7b731',id:'MAP-5.2',name:'Risk documentation maintained and current'},
  {fn:'MS',color:'#ff6b6b',id:'MS-1.1',name:'Trustworthiness metrics defined'},
  {fn:'MS',color:'#ff6b6b',id:'MS-1.2',name:'Context for metrics established'},
  {fn:'MS',color:'#ff6b6b',id:'MS-1.3',name:'Measurement approaches identified'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.1',name:'System evaluated against defined metrics'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.2',name:'Evaluation results documented'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.3',name:'Evaluation methodology justified'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.4',name:'Stakeholder feedback incorporated'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.5',name:'Bias and fairness evaluated'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.6',name:'Robustness tested'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.7',name:'Security and adversarial testing performed'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.8',name:'Privacy risks evaluated'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.9',name:'Explainability evaluated'},
  {fn:'MS',color:'#ff6b6b',id:'MS-2.10',name:'Environmental impact evaluated'},
  {fn:'MS',color:'#ff6b6b',id:'MS-3.1',name:'Internal experts review AI risks'},
  {fn:'MS',color:'#ff6b6b',id:'MS-3.2',name:'External experts engaged'},
  {fn:'MS',color:'#ff6b6b',id:'MS-4.1',name:'Feedback loops established for ongoing measurement'},
  {fn:'MS',color:'#ff6b6b',id:'MS-4.2',name:'Measurements updated regularly'},
  {fn:'MG',color:'#51cf66',id:'MG-1.1',name:'Mitigation plans developed for identified risks'},
  {fn:'MG',color:'#51cf66',id:'MG-1.2',name:'Mitigation effectiveness assessed'},
  {fn:'MG',color:'#51cf66',id:'MG-1.3',name:'Residual risks documented'},
  {fn:'MG',color:'#51cf66',id:'MG-2.1',name:'Risk treatment approach selected'},
  {fn:'MG',color:'#51cf66',id:'MG-2.2',name:'Risk treatment implemented'},
  {fn:'MG',color:'#51cf66',id:'MG-2.3',name:'Incidents and anomalies responded to'},
  {fn:'MG',color:'#51cf66',id:'MG-3.1',name:'Ongoing monitoring processes established'},
  {fn:'MG',color:'#51cf66',id:'MG-3.2',name:'Incident detection and response defined'},
  {fn:'MG',color:'#51cf66',id:'MG-4.1',name:'Residual risks communicated to stakeholders'},
  {fn:'MG',color:'#51cf66',id:'MG-4.2',name:'Discovered risks shared across organization'}
];
var CHECKLIST_STATUS={};
function checkRender(){
  var body=document.getElementById('checklist-body');
  if(!body)return;
  var groups={GV:[],MP:[],MS:[],MG:[]};
  SUBCATS.forEach(function(s){if(groups[s.fn])groups[s.fn].push(s);});
  var fnMeta={
    GV:{label:'GOVERN',color:'#0984e3'},
    MP:{label:'MAP',color:'#f7b731'},
    MS:{label:'MEASURE',color:'#ff6b6b'},
    MG:{label:'MANAGE',color:'#51cf66'}
  };
  var html='';
  Object.keys(groups).forEach(function(fn){
    var meta=fnMeta[fn];
    html+='<div style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:16px;margin-bottom:12px;">';
    html+='<div style="font-weight:700;color:'+meta.color+';font-size:13px;margin-bottom:10px;">'+meta.label+'</div>';
    groups[fn].forEach(function(s){
      var st=CHECKLIST_STATUS[s.id]||'none';
      html+='<div style="display:flex;align-items:center;gap:10px;padding:5px 0;border-bottom:1px solid #21262d;">';
      html+='<span style="font-size:11px;color:'+s.color+';font-weight:700;min-width:60px;">'+s.id+'</span>';
      html+='<span style="flex:1;font-size:13px;color:#c9d1d9;">'+s.name+'</span>';
      ['pass','partial','fail','na'].forEach(function(v){
        var labels={pass:'Pass',partial:'Partial',fail:'Fail',na:'N/A'};
        var colors={pass:'#51cf66',partial:'#f7b731',fail:'#ff6b6b',na:'#8b949e'};
        var active=st===v;
        html+='<button onclick="checkSet(\''+s.id+'\',\''+v+'\')" style="border:1px solid '+(active?colors[v]:'#30363d')+';background:'+(active?colors[v]+'22':'transparent')+';color:'+(active?colors[v]:'#8b949e')+';border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">'+labels[v]+'</button>';
      });
      html+='</div>';
    });
    html+='</div>';
  });
  body.innerHTML=html;
  checkSummary();
  if(typeof drawChecklistProgress==='function')drawChecklistProgress();
}
function checkSet(id,val){
  CHECKLIST_STATUS[id]=val;
  checkRender();
}
function checkReset(){CHECKLIST_STATUS={};checkRender();}
function checkSummary(){
  var total=SUBCATS.length,pass=0,partial=0,fail=0,na=0;
  SUBCATS.forEach(function(s){
    var v=CHECKLIST_STATUS[s.id];
    if(v==='pass')pass++;else if(v==='partial')partial++;else if(v==='fail')fail++;else if(v==='na')na++;
  });
  var el=document.getElementById('check-summary');
  if(el)el.textContent='Pass: '+pass+' | Partial: '+partial+' | Fail: '+fail+' | N/A: '+na+' | Unset: '+(total-pass-partial-fail-na);
}
function checkExport(){
  var LF=String.fromCharCode(10);
  var lines=['NIST AI RMF SUBCATEGORY ASSESSMENT REPORT','Generated: '+new Date().toLocaleDateString(),'','SUBCATEGORY STATUS','=================='];
  SUBCATS.forEach(function(s){
    lines.push(s.id+' ('+s.fn+'): '+(CHECKLIST_STATUS[s.id]||'Not assessed')+' — '+s.name);
  });
  var pass=0,partial=0,fail=0,na=0;
  SUBCATS.forEach(function(s){var v=CHECKLIST_STATUS[s.id];if(v==='pass')pass++;else if(v==='partial')partial++;else if(v==='fail')fail++;else if(v==='na')na++;});
  lines.push('');lines.push('SUMMARY');lines.push('=======');
  lines.push('Total: '+SUBCATS.length);
  lines.push('Pass: '+pass+' ('+Math.round(pass/SUBCATS.length*100)+'%)');
  lines.push('Partial: '+partial);lines.push('Fail: '+fail);lines.push('N/A: '+na);
  var txt=lines.join(LF);
  var blob=new Blob([txt],{type:'text/plain'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='rmf-assessment.txt';a.click();
}
function initChecklist(){checkRender();}

// ===== ADVISOR DATA =====
var ADVISOR_SUBCATS=[
  {id:'GV-1.1',label:'AI Policies',fn:'GV',color:'#0984e3',base:8,reg:{healthcare:3,finance:3,government:3,hr:2,general:1},aitype:{decision:2,generative:2,classification:1,prediction:1},maturity:{none:3,initial:2,managed:1,defined:0}},
  {id:'GV-2.2',label:'Risk Tolerance',fn:'GV',color:'#0984e3',base:9,reg:{healthcare:2,finance:3,government:2,hr:2,general:1},aitype:{decision:3,generative:2,classification:2,prediction:2},maturity:{none:3,initial:2,managed:1,defined:0}},
  {id:'MAP-1.1',label:'Intended Use',fn:'MP',color:'#f7b731',base:10,reg:{healthcare:3,finance:2,government:3,hr:3,general:2},aitype:{decision:3,generative:3,classification:2,prediction:2},maturity:{none:3,initial:2,managed:1,defined:0}},
  {id:'MAP-3.1',label:'Risk Identification',fn:'MP',color:'#f7b731',base:9,reg:{healthcare:2,finance:2,government:2,hr:2,general:2},aitype:{decision:2,generative:2,classification:2,prediction:2},maturity:{none:3,initial:2,managed:1,defined:0}},
  {id:'MAP-4.1',label:'Risk Priority',fn:'MP',color:'#f7b731',base:8,reg:{healthcare:2,finance:3,government:2,hr:2,general:1},aitype:{decision:3,generative:1,classification:2,prediction:3},maturity:{none:2,initial:2,managed:1,defined:0}},
  {id:'MS-2.5',label:'Bias Evaluation',fn:'MS',color:'#ff6b6b',base:9,reg:{healthcare:2,finance:3,government:3,hr:3,general:1},aitype:{decision:3,generative:2,classification:3,prediction:2},maturity:{none:3,initial:2,managed:1,defined:0}},
  {id:'MS-2.6',label:'Robustness Testing',fn:'MS',color:'#ff6b6b',base:7,reg:{healthcare:3,finance:2,government:2,hr:1,general:1},aitype:{decision:2,generative:3,classification:2,prediction:2},maturity:{none:2,initial:2,managed:1,defined:0}},
  {id:'MS-1.1',label:'Metrics Defined',fn:'MS',color:'#ff6b6b',base:8,reg:{healthcare:2,finance:2,government:2,hr:2,general:2},aitype:{decision:2,generative:2,classification:2,prediction:3},maturity:{none:3,initial:2,managed:1,defined:0}},
  {id:'MG-1.1',label:'Mitigation Plans',fn:'MG',color:'#51cf66',base:8,reg:{healthcare:2,finance:2,government:2,hr:2,general:1},aitype:{decision:2,generative:2,classification:2,prediction:2},maturity:{none:2,initial:2,managed:1,defined:0}},
  {id:'MG-3.2',label:'Incident Response',fn:'MG',color:'#51cf66',base:9,reg:{healthcare:3,finance:3,government:3,hr:1,general:2},aitype:{decision:2,generative:3,classification:2,prediction:2},maturity:{none:2,initial:2,managed:1,defined:0}},
  {id:'GV-6.2',label:'Human Override',fn:'GV',color:'#0984e3',base:8,reg:{healthcare:3,finance:2,government:3,hr:3,general:1},aitype:{decision:3,generative:2,classification:2,prediction:2},maturity:{none:2,initial:2,managed:1,defined:0}},
  {id:'MS-4.1',label:'Feedback Loops',fn:'MS',color:'#ff6b6b',base:7,reg:{healthcare:2,finance:2,government:2,hr:1,general:1},aitype:{decision:2,generative:2,classification:2,prediction:3},maturity:{none:1,initial:2,managed:2,defined:1}}
];
var advisorScores=[];
var advisorSelected=-1;
function advisorCalc(){
  var size=document.getElementById('adv-size')?document.getElementById('adv-size').value:'mid';
  var sector=document.getElementById('adv-sector')?document.getElementById('adv-sector').value:'general';
  var aitype=document.getElementById('adv-aitype')?document.getElementById('adv-aitype').value:'decision';
  var maturity=document.getElementById('adv-maturity')?document.getElementById('adv-maturity').value:'none';
  var sizeBonus={small:1,mid:0,large:-1}[size]||0;
  advisorScores=ADVISOR_SUBCATS.map(function(s){
    var score=s.base+(s.reg[sector]||0)+(s.aitype[aitype]||0)+(s.maturity[maturity]||0)+sizeBonus;
    return {id:s.id,label:s.label,fn:s.fn,color:s.color,score:Math.min(score,20)};
  });
  advisorScores.sort(function(a,b){return b.score-a.score;});
  advisorSelected=-1;
  if(typeof drawAdvisor==='function')drawAdvisor();
}
function advisorClickCanvas(e){
  var c=document.getElementById('canvas-advisor');
  if(!c)return;
  var rect=c.getBoundingClientRect();
  var y=e.clientY-rect.top;
  var barH=22,gap=4,startY=40;
  var idx=Math.floor((y-startY)/(barH+gap));
  if(idx>=0&&idx<advisorScores.length){
    advisorSelected=idx;
    var s=advisorScores[idx];
    var full=ADVISOR_SUBCATS.find(function(x){return x.id===s.id;});
    var reasons=[];
    var sector=document.getElementById('adv-sector')?document.getElementById('adv-sector').value:'general';
    var aitype=document.getElementById('adv-aitype')?document.getElementById('adv-aitype').value:'decision';
    var maturity=document.getElementById('adv-maturity')?document.getElementById('adv-maturity').value:'none';
    if(full){
      if((full.reg[sector]||0)>=2)reasons.push('High regulatory relevance for your sector');
      if((full.aitype[aitype]||0)>=2)reasons.push('Critical for your AI system type');
      if((full.maturity[maturity]||0)>=2)reasons.push('Foundational gap at your current maturity level');
    }
    var el=document.getElementById('adv-detail');
    if(el)el.innerHTML='<strong style="color:'+s.color+'">'+s.id+' — '+s.label+'</strong><br>Priority score: '+s.score+'/20<br>'+(reasons.length?reasons.join(' &bull; '):'Strong baseline priority for all contexts.');
    if(typeof drawAdvisor==='function')drawAdvisor();
  }
}

// ===== GENAI RISK WHEEL DATA =====
var GENAI_RISKS=[
  {name:'Hallucination',color:'#e84118',likelihood:90,severity:85,subcats:['MS-2.6 Robustness','MG-3.2 Incident response','GV-1.2 Disclosure'],desc:'Model generates false but plausible content. High likelihood in all LLM deployments. Addressed by robustness testing and user disclosure requirements.'},
  {name:'Prompt Injection',color:'#ff6b6b',likelihood:75,severity:88,subcats:['MS-2.7 Adversarial test','MG-2.2 Controls','MAP-3.1 Risk ID'],desc:'Malicious inputs that hijack model behavior. Critical for customer-facing GenAI systems. Requires adversarial red-teaming before deployment.'},
  {name:'Training Data Privacy',color:'#fd79a8',likelihood:65,severity:80,subcats:['MS-2.8 Privacy eval','MAP-3.3 Rights impact','GV-5.1 Regulations'],desc:'Model memorization of sensitive training data leading to inadvertent disclosure. Privacy evaluation (MS-2.8) and data minimization required.'},
  {name:'IP and Copyright',color:'#a29bfe',likelihood:70,severity:72,subcats:['GV-5.1 Legal mapping','MAP-1.1 Use scope','MG-2.1 Treatment'],desc:'Model outputs that reproduce copyrighted material or create IP ownership uncertainty. Regulatory alignment (GV-5.1) and use-case scoping (MAP-1.1) are key controls.'},
  {name:'CBRN Hazards',color:'#6c5ce7',likelihood:20,severity:99,subcats:['MAP-3.1 Risk ID','MG-2.1 Avoid decision','GV-2.2 Risk tolerance'],desc:'Use of GenAI to generate chemical, biological, radiological or nuclear harm information. Low likelihood but catastrophic severity — should trigger risk avoidance (MG-2.1).'},
  {name:'Data Provenance',color:'#0984e3',likelihood:60,severity:65,subcats:['MAP-3.5 Data risks','MS-1.1 Metrics','GV-1.1 Policies'],desc:'Inability to trace what training data contributed to a specific output. Undermines explainability and accountability. Data lineage tracking is the primary control.'},
  {name:'Output Homogenization',color:'#00b894',likelihood:55,severity:58,subcats:['MS-2.5 Diversity eval','MAP-5.1 Impact est','GV-3.2 Diverse teams'],desc:'Widespread GenAI adoption leading to homogenized outputs across society. Societal impact assessment (MAP-5.1) should include homogenization risk analysis.'},
  {name:'Misinformation at Scale',color:'#f7b731',likelihood:80,severity:90,subcats:['MAP-5.1 Societal impact','GV-1.2 Disclosure','MG-3.1 Monitoring'],desc:'GenAI enabling generation of false information at unprecedented scale and personalization. Societal impact assessment and provenance disclosure are primary mitigations.'},
  {name:'Human Over-reliance',color:'#fdcb6e',likelihood:72,severity:68,subcats:['GV-6.1 Oversight policy','GV-6.2 Human override','MAP-1.4 User impact'],desc:'Users deferring to AI outputs without appropriate critical evaluation. Human oversight policy (GV-6.1) and interface design must counteract automation bias.'},
  {name:'Agentic System Risks',color:'#74b9ff',likelihood:50,severity:85,subcats:['MAP-1.1 Scope','GV-6.2 Override','MG-3.2 Incident resp'],desc:'AI agents taking autonomous multi-step actions with real-world consequences. Scoping (MAP-1.1) and human override (GV-6.2) requirements are critical before deployment.'},
  {name:'AI Power Concentration',color:'#b2bec3',likelihood:40,severity:80,subcats:['MAP-5.1 Societal','GV-5.1 Regulatory','MG-4.1 Transparency'],desc:'GenAI capabilities concentrating economic and informational power in few organizations. Framework encourages societal impact assessment and transparency at scale.'},
  {name:'Environmental Impact',color:'#55efc4',likelihood:85,severity:50,subcats:['MS-2.10 Env eval','MAP-5.1 Impact','GV-1.1 Policy'],desc:'Significant energy and water consumption from GenAI training and inference. Environmental impact evaluation (MS-2.10) is a GenAI-specific subcategory addition.'}
];
var selectedGenAIRisk=-1;
function genaiWheelClick(e){
  var c=document.getElementById('canvas-genai-wheel');
  if(!c)return;
  var rect=c.getBoundingClientRect();
  var cx=c.width/2,cy=c.height/2;
  var mx=e.clientX-rect.left,my=e.clientY-rect.top;
  var angle=Math.atan2(my-cy,mx-cx);
  var n=GENAI_RISKS.length;
  var step=Math.PI*2/n;
  var idx=Math.round((angle+Math.PI/2)/(step)+n)%n;
  selectedGenAIRisk=selectedGenAIRisk===idx?-1:idx;
  var det=document.getElementById('genai-wheel-detail');
  if(det){
    if(selectedGenAIRisk<0){det.innerHTML='Click a spoke to explore that GenAI risk.';det.style.color='#8b949e';}
    else{
      var r=GENAI_RISKS[selectedGenAIRisk];
      det.innerHTML='<strong style="color:'+r.color+';font-size:15px;">'+r.name+'</strong><br>'+
        '<span style="color:#8b949e;font-size:11px;">Likelihood: '+r.likelihood+'% | Severity: '+r.severity+'%</span><br><br>'+
        r.desc+'<br><br>'+
        '<strong style="color:#c9d1d9;font-size:11px;">Key RMF Subcategories:</strong><br>'+
        r.subcats.map(function(s){return '<span style="color:'+r.color+';font-size:11px;">&#9679; '+s+'</span>';}).join('<br>');
      det.style.color='#c9d1d9';
    }
  }
  if(typeof drawGenAIWheel==='function')drawGenAIWheel();
}

// ===== TENSION MAP DATA =====
var TENSION_NODES=[
  {id:'safe',label:'Safe',color:'#f7b731',px:0.5,py:0.08},
  {id:'secure',label:'Secure',color:'#ff6b6b',px:0.85,py:0.3},
  {id:'reliable',label:'Reliable',color:'#51cf66',px:0.82,py:0.7},
  {id:'explainable',label:'Explainable',color:'#0984e3',px:0.5,py:0.88},
  {id:'fair',label:'Fair',color:'#fd79a8',px:0.18,py:0.7},
  {id:'privacy',label:'Privacy-Enhanced',color:'#00b894',px:0.15,py:0.3},
  {id:'accountable',label:'Accountable',color:'#6c5ce7',px:0.5,py:0.45}
];
var TENSION_EDGES=[
  {from:'explainable',to:'privacy',label:'Explaining predictions can expose sensitive training data',rmf:'Balance MS-2.9 and MS-2.8 — consider differential privacy'},
  {from:'fair',to:'reliable',label:'Bias mitigation constraints can reduce overall model accuracy',rmf:'MS-2.5 fairness vs MS-2.1 accuracy — document accepted trade-offs'},
  {from:'safe',to:'explainable',label:'High-accuracy safety models (e.g. neural nets) resist simple explanation',rmf:'MS-2.9 explainability scope defined in MAP-1.1 intended use'},
  {from:'secure',to:'accountable',label:'Security opacity (not disclosing controls) limits audit accountability',rmf:'GV-6.1 oversight policy must balance security and transparency'},
  {from:'accountable',to:'safe',label:'Automation increases safety but reduces clear human accountability',rmf:'GV-6.2 human override and GV-2.1 accountability must co-exist'},
  {from:'privacy',to:'accountable',label:'Anonymization of logs limits incident traceability',rmf:'MG-3.2 incident response requires log access — scope carefully'},
  {from:'reliable',to:'fair',label:'Optimizing for accuracy on majority groups can embed group bias',rmf:'MS-2.5 must evaluate subgroup performance, not just aggregate'}
];
var selectedTension=-1;
var hoveredTension=-1;
function tensionClick(e){
  var c=document.getElementById('canvas-tension');
  if(!c)return;
  var rect=c.getBoundingClientRect();
  var mx=e.clientX-rect.left,my=e.clientY-rect.top;
  var W=c.width,H=c.height;
  var hit=-1;
  TENSION_EDGES.forEach(function(edge,i){
    var a=TENSION_NODES.find(function(n){return n.id===edge.from;});
    var b=TENSION_NODES.find(function(n){return n.id===edge.to;});
    if(!a||!b)return;
    var ax=a.px*W,ay=a.py*H,bx=b.px*W,by=b.py*H;
    var t=((mx-ax)*(bx-ax)+(my-ay)*(by-ay))/((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
    t=Math.max(0,Math.min(1,t));
    var px=ax+t*(bx-ax),py=ay+t*(by-ay);
    var d=Math.sqrt((mx-px)*(mx-px)+(my-py)*(my-py));
    if(d<14)hit=i;
  });
  selectedTension=selectedTension===hit?-1:hit;
  var det=document.getElementById('tension-detail');
  if(det){
    if(selectedTension<0){det.innerHTML='Click a tension edge (dashed line) to understand the trade-off and how the RMF approaches it.';det.style.color='#8b949e';}
    else{
      var te=TENSION_EDGES[selectedTension];
      det.innerHTML='<strong style="color:#f7b731;">'+te.from+' &harr; '+te.to+'</strong><br>'+te.label+'<br><span style="color:#6c5ce7;font-size:12px;">RMF guidance: '+te.rmf+'</span>';
      det.style.color='#c9d1d9';
    }
  }
  if(typeof drawTensionMap==='function')drawTensionMap();
}
function tensionHover(e){
  var c=document.getElementById('canvas-tension');
  if(!c)return;
  var rect=c.getBoundingClientRect();
  var mx=e.clientX-rect.left,my=e.clientY-rect.top;
  var W=c.width,H=c.height;
  var hit=-1;
  TENSION_EDGES.forEach(function(edge,i){
    var a=TENSION_NODES.find(function(n){return n.id===edge.from;});
    var b=TENSION_NODES.find(function(n){return n.id===edge.to;});
    if(!a||!b)return;
    var ax=a.px*W,ay=a.py*H,bx=b.px*W,by=b.py*H;
    var t=((mx-ax)*(bx-ax)+(my-ay)*(by-ay))/((bx-ax)*(bx-ax)+(by-ay)*(by-ay));
    t=Math.max(0,Math.min(1,t));
    var px=ax+t*(bx-ax),py=ay+t*(by-ay);
    var d=Math.sqrt((mx-px)*(mx-px)+(my-py)*(my-py));
    if(d<14)hit=i;
  });
  if(hit!==hoveredTension){hoveredTension=hit;if(typeof drawTensionMap==='function')drawTensionMap();}
}

// ===== INCIDENTS DATA =====
var INCIDENTS=[
  {title:'COMPAS Recidivism',year:'2016',domain:'Criminal Justice',color:'#e84118',
   desc:'Predictive recidivism scoring showed racial disparity — Black defendants scored as higher risk at nearly twice the rate of white defendants with similar profiles.',
   gaps:['MS-2.5: No fairness evaluation before deployment','MAP-3.3: No fundamental rights impact assessment','GV-2.2: Risk tolerance did not cover demographic disparity'],
   lesson:'An MS-2.5 fairness audit using demographic parity metrics would have surfaced this before deployment.'},
  {title:'Amazon Hiring Tool',year:'2018',domain:'Human Resources',color:'#f7b731',
   desc:'Resume screening AI trained on historical hires systematically downgraded resumes containing the word "women." The tool was scrapped after discovery.',
   gaps:['MS-2.5: No gender fairness evaluation','MAP-3.5: Training data risks not assessed','MAP-1.4: Affected individuals not adequately identified'],
   lesson:'Training data audit (MAP-3.5) and fairness evaluation (MS-2.5) across protected attributes would have identified this.'},
  {title:'UK A-level Algorithm',year:'2020',domain:'Education',color:'#6c5ce7',
   desc:'Algorithmic grading during COVID-19 systematically downgraded students from lower-income schools. Policy reversed within days under public pressure.',
   gaps:['MAP-5.1: No societal impact assessment','GV-6.2: No human override mechanism','GV-6.1: No clear human oversight policy'],
   lesson:'Human override capability (GV-6.2) and societal impact assessment (MAP-5.1) were absent. GOVERN failures drove MAP and MANAGE failures.'},
  {title:'GPT Legal Hallucination',year:'2023',domain:'Legal',color:'#fd79a8',
   desc:'Attorneys submitted AI-generated court briefs citing non-existent cases. The AI fabricated plausible but entirely fictional legal citations.',
   gaps:['MAP-1.1: Intended use did not include legal citation generation','GV-1.2: No disclosure to downstream users','MS-2.6: No hallucination rate testing'],
   lesson:'Scope documentation (MAP-1.1) should explicitly exclude high-stakes factual claims. MS-2.6 robustness testing must include hallucination benchmarks.'},
  {title:'Uber Self-Driving Fatality',year:'2018',domain:'Autonomous Vehicles',color:'#ff6b6b',
   desc:'An Uber self-driving vehicle struck and killed a pedestrian. Post-investigation revealed the system detected the pedestrian but classified her incorrectly for too long.',
   gaps:['MG-3.1: Monitoring gaps in production safety systems','MS-2.6: Edge-case robustness not sufficiently tested','GV-6.2: Human operator backup not effective'],
   lesson:'Ongoing monitoring (MG-3.1) and adversarial edge-case testing (MS-2.6) are minimum requirements for safety-critical AI systems.'},
  {title:'Optum Health Algorithm',year:'2019',domain:'Healthcare',color:'#00b894',
   desc:'Algorithm used across US hospitals to allocate care management resources showed racial bias — at equal health scores, Black patients received fewer resources.',
   gaps:['MS-2.5: Race not included as a fairness dimension','MAP-3.3: Disparate impact on protected class not assessed','GV-2.2: Equity not in risk tolerance definition'],
   lesson:'Disparity in proxy variables (healthcare cost vs. need) must be caught in MAP-3.5 data risk assessment and MS-2.5 fairness evaluation.'},
  {title:'Facebook Emotion Experiment',year:'2014',domain:'Social Media',color:'#0984e3',
   desc:'Facebook manipulated news feeds of 689,000 users without consent to study emotional contagion. Published in academic journal before exposure.',
   gaps:['MAP-1.4: Affected individuals not informed or consented','GV-1.1: No policy covering experimental AI use on users','GV-1.2: No transparency about AI manipulation'],
   lesson:'MAP-1.4 requires identifying and considering affected individuals. GV-1.1 policies must cover experimental AI use cases, not just production systems.'},
  {title:'Clearview AI',year:'2020',domain:'Surveillance',color:'#a29bfe',
   desc:'Clearview scraped billions of public photos to build a facial recognition database sold to law enforcement, raising privacy and civil liberties concerns globally.',
   gaps:['MAP-3.3: No fundamental rights impact assessment','GV-5.1: Regulatory requirements not identified','MS-2.8: Privacy risk evaluation absent'],
   lesson:'MAP-3.3 rights impact assessment and MS-2.8 privacy evaluation are mandatory before deployment of biometric AI in any context.'}
];
var selectedIncident=0;
function incidentBtnsRender(){
  var wrap=document.getElementById('incident-btns');
  if(!wrap)return;
  wrap.innerHTML=INCIDENTS.map(function(inc,i){
    var active=selectedIncident===i;
    return '<button onclick="showIncident('+i+')" style="border:1px solid '+(active?inc.color:'#30363d')+';background:'+(active?inc.color+'22':'transparent')+';color:'+(active?inc.color:'#8b949e')+';border-radius:6px;padding:5px 12px;cursor:pointer;font-size:11px;font-weight:600;">'+inc.title+' ('+inc.year+')</button>';
  }).join('');
}
function showIncident(i){
  selectedIncident=i;
  incidentBtnsRender();
  var det=document.getElementById('incident-detail');
  if(det){
    var inc=INCIDENTS[i];
    det.innerHTML='<strong style="color:'+inc.color+';font-size:14px;">'+inc.title+'</strong>'+
      ' <span style="color:#8b949e;font-size:11px;">('+inc.year+' &bull; '+inc.domain+')</span><br><br>'+
      '<span style="color:#c9d1d9;">'+inc.desc+'</span><br><br>'+
      '<strong style="color:#ff6b6b;font-size:12px;">RMF Gaps:</strong><br>'+
      inc.gaps.map(function(g){return '<span style="color:#ff6b6b;font-size:12px;">&#9679; '+g+'</span>';}).join('<br>')+'<br><br>'+
      '<strong style="color:#51cf66;font-size:12px;">What RMF Would Have Caught:</strong><br>'+
      '<span style="color:#c9d1d9;font-size:12px;">'+inc.lesson+'</span>';
  }
  if(typeof drawIncidents==='function')drawIncidents();
}
function initIncidentsSection(){incidentBtnsRender();showIncident(0);}

// ===== DECISION TREE DATA =====
var DECISION_QS=[
  {id:1,text:'Is the intended use of this AI system clearly documented and bounded?',ref:'MAP-1.1',hint:'Includes scope, purpose, user population, and explicit out-of-scope uses.'},
  {id:2,text:'Has a risk register been created identifying potential negative outcomes?',ref:'MAP-3.1 + MAP-4.1',hint:'Should include at minimum: top 5 risks, likelihood, impact, and responsible party.'},
  {id:3,text:'Is there a designated AI risk owner with authority to act?',ref:'GV-2.1',hint:'A named person accountable for this system across its lifecycle, not just during development.'},
  {id:4,text:'Has fairness evaluation been conducted across relevant demographic groups?',ref:'MS-2.5',hint:'Required if the system affects individuals differently — hiring, lending, healthcare, justice.'},
  {id:5,text:'Is human override capability documented and accessible to operators?',ref:'GV-6.2',hint:'A trained human must be able to review and override AI decisions for high-stakes outputs.'},
  {id:6,text:'Has robustness testing been performed including adversarial and edge cases?',ref:'MS-2.6',hint:'Especially critical for safety systems, GenAI, and public-facing AI.'},
  {id:7,text:'Is there a documented incident response procedure for this AI system?',ref:'MG-3.2',hint:'Who is notified when the system fails or causes harm? What is the rollback plan?'},
  {id:8,text:'Are the residual risks acceptable given your documented risk tolerance?',ref:'GV-2.2 + MG-1.3',hint:'Compare identified residual risks against the GV-2.2 risk tolerance threshold.'}
];
var DECISION_RESULTS={
  'yes-yes-yes-yes-yes-yes-yes-yes':{label:'Deploy',color:'#51cf66',desc:'All 8 RMF gates satisfied. Document residual risks (MG-1.3) and establish monitoring schedule (MG-3.1). Schedule first post-deployment review.'},
  'default-any-no':{label:'Conditional Deploy',color:'#f7b731',desc:'Some RMF requirements are not yet fully met. Address the failed gates, establish a time-bound remediation plan, and confirm with the AI risk owner before full deployment.'}
};
var decisionAnswers=[];
var decisionIdx=0;
var decisionActive=false;
function decisionStart(){
  decisionAnswers=[];decisionIdx=0;decisionActive=true;
  document.getElementById('dec-start').style.display='none';
  document.getElementById('dec-reset').style.display='';
  document.getElementById('decision-result').style.display='none';
  decisionShowQ();
  if(typeof drawDecision==='function')drawDecision();
}
function decisionShowQ(){
  var q=DECISION_QS[decisionIdx];
  if(!q)return;
  document.getElementById('decision-progress').textContent='Question '+(decisionIdx+1)+' of '+DECISION_QS.length;
  document.getElementById('decision-ref').textContent='RMF: '+q.ref;
  document.getElementById('decision-q').innerHTML=q.text+'<br><span style="font-size:11px;color:#8b949e;margin-top:6px;display:block;">'+q.hint+'</span>';
  document.getElementById('dec-yes').style.display='';
  document.getElementById('dec-no').style.display='';
}
function decisionAnswer(ans){
  decisionAnswers.push(ans);
  decisionIdx++;
  if(typeof drawDecision==='function')drawDecision();
  if(decisionIdx>=DECISION_QS.length){
    decisionShowResult();
  }else{
    decisionShowQ();
  }
}
function decisionShowResult(){
  document.getElementById('dec-yes').style.display='none';
  document.getElementById('dec-no').style.display='none';
  document.getElementById('decision-progress').textContent='Assessment Complete';
  document.getElementById('decision-ref').textContent='';
  document.getElementById('decision-q').textContent='';
  var failedAt=decisionAnswers.indexOf(false);
  var allYes=decisionAnswers.every(function(a){return a===true;});
  var result=document.getElementById('decision-result');
  if(result){
    result.style.display='block';
    if(allYes){
      result.style.background='#51cf6622';result.style.border='1px solid #51cf66';
      result.innerHTML='<div style="font-size:18px;font-weight:700;color:#51cf66;margin-bottom:8px;">DEPLOY</div>All 8 RMF prerequisite gates are satisfied. Proceed to deployment with documented monitoring plan (MG-3.1) and scheduled review cycle.';
    }else if(failedAt>=0&&failedAt<=1){
      result.style.background='#e8411822';result.style.border='1px solid #e84118';
      result.innerHTML='<div style="font-size:18px;font-weight:700;color:#e84118;margin-bottom:8px;">DO NOT DEPLOY</div>Critical gate failed at question '+(failedAt+1)+': <strong>'+DECISION_QS[failedAt].ref+'</strong>. This is a foundational requirement. Address before any further steps.';
    }else{
      result.style.background='#f7b73122';result.style.border='1px solid #f7b731';
      result.innerHTML='<div style="font-size:18px;font-weight:700;color:#f7b731;margin-bottom:8px;">CONDITIONAL DEPLOY</div>'+(8-decisionAnswers.filter(Boolean).length)+' gate(s) not yet satisfied. Highest priority gap: <strong>'+DECISION_QS[failedAt].ref+'</strong>. Remediate and re-assess.';
    }
  }
}
function decisionReset(){
  decisionAnswers=[];decisionIdx=0;decisionActive=false;
  document.getElementById('dec-start').style.display='';
  document.getElementById('dec-reset').style.display='none';
  document.getElementById('dec-yes').style.display='none';
  document.getElementById('dec-no').style.display='none';
  document.getElementById('decision-result').style.display='none';
  document.getElementById('decision-progress').textContent='';
  document.getElementById('decision-ref').textContent='';
  document.getElementById('decision-q').textContent='Press Start to begin the assessment.';
  if(typeof drawDecision==='function')drawDecision();
}

// ===== STAKEHOLDER COMMUNICATION GENERATOR =====
function stakhGen(){
  var audience=document.getElementById('stk-audience')?document.getElementById('stk-audience').value:'board';
  var risk=document.getElementById('stk-risk')?document.getElementById('stk-risk').value:'medium';
  var aitype=document.getElementById('stk-aitype')?document.getElementById('stk-aitype').value:'decision';
  var concern=document.getElementById('stk-concern')?document.getElementById('stk-concern').value:'bias';
  var ta=document.getElementById('stk-output');
  if(!ta)return;
  var LF=String.fromCharCode(10);

  var auditLabel={board:'EXECUTIVE BRIEFING',engineering:'TECHNICAL MEMO',legal:'COMPLIANCE NOTICE',users:'USER NOTICE',regulators:'REGULATORY DISCLOSURE'}[audience];
  var riskLabel={low:'LOW',medium:'MEDIUM',high:'HIGH',critical:'CRITICAL'}[risk];
  var aitypeLabel={decision:'Decision Support AI System',generative:'Generative AI System',classification:'Classification AI System',prediction:'Predictive Model'}[aitype];
  var concernLabel={bias:'Fairness and Bias',safety:'Safety',privacy:'Privacy',accountability:'Accountability',explainability:'Explainability'}[concern];

  var openings={
    board:'This briefing summarizes the AI risk status of our '+aitypeLabel+' and the governance actions taken in accordance with the NIST AI Risk Management Framework (AI RMF 1.0).',
    engineering:'This memo documents the current risk management requirements for the '+aitypeLabel+' under development. Engineers must address the items below before deployment approval.',
    legal:'This notice identifies the regulatory and compliance obligations associated with our '+aitypeLabel+', mapped to NIST AI RMF subcategories and applicable regulations.',
    users:'We want to be transparent about how AI is used in this service and what protections are in place to ensure it is fair, safe, and respects your rights.',
    regulators:'This disclosure describes our organization AI risk management practices for the '+aitypeLabel+', aligned to NIST AI Risk Management Framework version 1.0.'
  }[audience];

  var concernBlocks={
    bias:{
      board:'FAIRNESS AND BIAS STATUS (RMF: MS-2.5, MAP-3.3)'+LF+'Our AI system has been evaluated for demographic bias across protected attributes. Fairness metrics are tracked and reviewed quarterly. Any identified disparity triggers a mandatory remediation process with executive sign-off.',
      engineering:'FAIRNESS REQUIREMENTS (RMF: MS-2.5)'+LF+'Before deployment, you must: (1) Run fairness evaluation across all protected attributes in MAP-1.4. (2) Document disparity metrics and acceptable thresholds per GV-2.2. (3) If fairness gap exceeds threshold, escalate to AI risk owner — do not deploy.',
      legal:'FAIRNESS COMPLIANCE (RMF: MS-2.5, MAP-3.3)'+LF+'The system is subject to fairness requirements under applicable law. A bias audit has been conducted and documented. Ongoing fairness monitoring is in place per MG-3.1. Audit records are available for regulatory review.',
      users:'FAIRNESS COMMITMENT'+LF+'This AI system has been tested to ensure it does not produce unfair outcomes based on demographic characteristics. If you believe a decision affecting you was unfair, you may request a human review.',
      regulators:'FAIRNESS EVALUATION DISCLOSURE (NIST AI RMF MS-2.5)'+LF+'Bias evaluation methodology: [specify]. Metrics tracked: [specify]. Evaluation frequency: quarterly. Documented thresholds: per GV-2.2 risk tolerance. Last audit date: [specify].'
    },
    safety:{
      board:'SAFETY STATUS (RMF: MS-2.6, MG-3.2)'+LF+'The '+aitypeLabel+' has undergone robustness and adversarial testing. An incident response plan is in place. Human override capability is documented and operational. Safety is reviewed at each major release.',
      engineering:'SAFETY REQUIREMENTS (RMF: MS-2.6, GV-6.2)'+LF+'Before deployment: (1) Complete robustness testing including edge cases and adversarial inputs. (2) Document human override procedure per GV-6.2. (3) Validate incident response playbook per MG-3.2. All safety tests must pass at defined thresholds.',
      legal:'SAFETY COMPLIANCE (RMF: MS-2.6, MG-3.2)'+LF+'Robustness testing completed and documented. Incident response procedure established. Human oversight mechanism in place per GV-6.2. Safety documentation available for regulatory inspection.',
      users:'SAFETY ASSURANCE'+LF+'This AI system undergoes regular safety testing. A human can always review or override AI decisions. If you experience an unexpected or harmful output, please report it through our feedback channel.',
      regulators:'SAFETY EVALUATION DISCLOSURE (NIST AI RMF MS-2.6)'+LF+'Robustness testing framework: [specify]. Adversarial test coverage: [specify]. Human override mechanism: [describe]. Incident response contact: [specify]. Last safety review: [specify].'
    },
    privacy:{
      board:'PRIVACY STATUS (RMF: MS-2.8, MAP-3.3)'+LF+'Privacy risk evaluation has been completed. Data minimization principles are applied. The system does not retain personally identifiable information beyond its stated purpose. Privacy posture is reviewed annually.',
      engineering:'PRIVACY REQUIREMENTS (RMF: MS-2.8, MAP-3.5)'+LF+'Before deployment: (1) Complete privacy risk evaluation per MS-2.8. (2) Document data inputs and retention per MAP-3.5. (3) Confirm data minimization is applied. (4) Verify no PII is logged in model outputs or debug data.',
      legal:'PRIVACY COMPLIANCE (RMF: MS-2.8, GV-5.1)'+LF+'Privacy impact assessment completed per MS-2.8. Applicable privacy regulations identified per GV-5.1. Data retention and processing practices documented. Privacy documentation available for regulatory review.',
      users:'PRIVACY COMMITMENT'+LF+'This AI system processes only the minimum data necessary to provide the service. Your personal information is not used to train AI models without explicit consent. You may request information about how your data is used.',
      regulators:'PRIVACY EVALUATION DISCLOSURE (NIST AI RMF MS-2.8)'+LF+'Privacy risk evaluation methodology: [specify]. Data minimization controls: [describe]. Applicable regulations: [list]. Data subject rights mechanism: [describe]. Last privacy review: [specify].'
    },
    accountability:{
      board:'ACCOUNTABILITY STRUCTURE (RMF: GV-2.1, GV-4.1)'+LF+'A named AI Risk Owner is designated for this system with authority to pause or discontinue deployment. Accountability chain from engineering to the board is documented. Annual accountability review is part of the governance calendar.',
      engineering:'ACCOUNTABILITY REQUIREMENTS (RMF: GV-2.1, MG-2.3)'+LF+'Every AI system must have: (1) A named owner in the system record. (2) Documented escalation path for incidents. (3) Annual acknowledgment from the owner. (4) Clear criteria for when to escalate to the AI Risk Committee.',
      legal:'ACCOUNTABILITY COMPLIANCE (RMF: GV-2.1, GV-4.1)'+LF+'AI risk ownership is formally assigned per GV-2.1. Accountability structures are documented and reviewed annually. Incident escalation procedures are in place. Accountability records available for regulatory review.',
      users:'ACCOUNTABILITY COMMITMENT'+LF+'A named individual in our organization is responsible for this AI system and its outcomes. If this system causes harm, you can contact us and the matter will be reviewed by a human with authority to act.',
      regulators:'ACCOUNTABILITY DISCLOSURE (NIST AI RMF GV-2.1)'+LF+'AI risk owner: [name/role]. Escalation path: [describe]. Accountability review frequency: annual. Incident escalation procedure: [describe]. Board oversight mechanism: [describe].'
    },
    explainability:{
      board:'EXPLAINABILITY STATUS (RMF: MS-2.9, GV-1.2)'+LF+'The '+aitypeLabel+' provides explanations for its outputs at a level appropriate to user needs. Explanation methodology is documented. Transparency disclosures are provided to affected individuals per GV-1.2.',
      engineering:'EXPLAINABILITY REQUIREMENTS (RMF: MS-2.9)'+LF+'Before deployment: (1) Define explanation scope per MAP-1.1 intended use. (2) Implement appropriate explanation method (SHAP, LIME, rule extraction, etc.). (3) Document limitations of explanations. (4) Test that explanations are accurate and not misleading.',
      legal:'EXPLAINABILITY COMPLIANCE (RMF: MS-2.9, GV-1.2)'+LF+'Explanation methodology documented and justified. Transparency disclosures provided to affected individuals per GV-1.2. Explanation accuracy tested per MS-2.9. Records available for regulatory review.',
      users:'TRANSPARENCY COMMITMENT'+LF+'When this AI system makes a decision that affects you, you have the right to request an explanation. We will tell you the main factors that influenced the decision in plain language.',
      regulators:'EXPLAINABILITY DISCLOSURE (NIST AI RMF MS-2.9)'+LF+'Explanation method: [specify]. Explanation scope per MAP-1.1: [describe]. Explanation accuracy validation: [describe]. User-facing explanation mechanism: [describe]. Last explainability review: [specify].'
    }
  };

  var riskNote={
    low:'Risk Level: LOW — Standard monitoring and annual review cycle applies.',
    medium:'Risk Level: MEDIUM — Quarterly review cycle. Fairness and robustness metrics tracked continuously.',
    high:'Risk Level: HIGH — Monthly review. Executive sign-off required before major changes. Enhanced monitoring active.',
    critical:'Risk Level: CRITICAL — Continuous monitoring. Board-level oversight. Any incident requires immediate escalation and potential pause of deployment.'
  }[risk];

  var lines=[
    auditLabel,
    'AI System: '+aitypeLabel,
    'Risk Level: '+riskLabel,
    'Primary Concern: '+concernLabel,
    'Framework: NIST AI Risk Management Framework 1.0',
    '='.repeat(55),
    '',
    openings,
    '',
    concernBlocks[concern][audience]||'',
    '',
    riskNote,
    '',
    'For questions about this communication, contact your designated AI Risk Owner.',
    '',
    '[Generated by NIST AI RMF Blog 22 — visual-summary.github.io]'
  ];
  ta.value=lines.join(LF);
}
function stakhCopy(){
  var ta=document.getElementById('stk-output');
  if(!ta||!ta.value)return;
  navigator.clipboard.writeText(ta.value).then(function(){alert('Copied to clipboard.');}).catch(function(){ta.select();document.execCommand('copy');});
}`;

// ===== APPLY BUILD1.JS CHANGES =====
let b1 = fs.readFileSync('./build1.js', 'utf8');

// 1. Add nav items before </nav>
b1 = b1.replace('</nav>', NAV_NEW + '\n</nav>');

// 2. Add sections before </div><!-- /main -->
b1 = b1.replace('</div><!-- /main -->', SECTIONS_NEW + '\n</div><!-- /main -->');

// 3. Update sectionIds
const OLD_IDS = "var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle','s-risk-flow','s-genai','s-subcats','s-maturity','s-crosswalk','s-cases','s-roadmap','s-tradeoffs','s-sectors','s-actors','s-quiz','s-classifier','s-sandbox','s-incident','s-frameworks','s-glossary','s-simulator','s-deepdive','s-policy','s-propagation','s-progression','s-orgchart','s-depmap','s-regmap'];";
const NEW_IDS = "var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle','s-risk-flow','s-genai','s-subcats','s-maturity','s-crosswalk','s-cases','s-roadmap','s-tradeoffs','s-sectors','s-actors','s-quiz','s-classifier','s-sandbox','s-incident','s-frameworks','s-glossary','s-simulator','s-deepdive','s-policy','s-propagation','s-progression','s-orgchart','s-depmap','s-regmap','s-inventory','s-checklist','s-advisor','s-genai-wheel','s-tension','s-incidents','s-decision','s-stakeholder'];";
b1 = b1.replace(OLD_IDS, NEW_IDS);

// 4. Add JS data before closing </script> of first script block
const SCRIPT_BOUNDARY = '</script>\n<script>\n/* CANVAS CODE INJECTED HERE */';
b1 = b1.replace(SCRIPT_BOUNDARY, JS_NEW + '\n' + SCRIPT_BOUNDARY);

fs.writeFileSync('./build1.js', b1, 'utf8');
console.log('build1.js updated:', b1.length, 'bytes');
