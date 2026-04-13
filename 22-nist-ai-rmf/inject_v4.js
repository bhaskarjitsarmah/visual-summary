// inject_v4.js — adds 8 more sections to Blog 22
const fs = require('fs');

// ===== NEW NAV ITEMS =====
const NAV_NEW_V4 = `  <div class="nav-group-title">Calculators</div>
  <div class="nav-link" data-sec="s-costbenefit" onclick="setActive(this,'s-costbenefit')">
    <span class="dot" style="background:#00b894"></span>Cost-Benefit Calc</div>
  <div class="nav-link" data-sec="s-impl-roadmap" onclick="setActive(this,'s-impl-roadmap')">
    <span class="dot" style="background:#6c5ce7"></span>Impl Roadmap</div>
  <div class="nav-link" data-sec="s-vendor-q" onclick="setActive(this,'s-vendor-q')">
    <span class="dot" style="background:#0984e3"></span>Vendor Questionnaire</div>
  <div class="nav-link" data-sec="s-charter" onclick="setActive(this,'s-charter')">
    <span class="dot" style="background:#fd79a8"></span>Ethics Charter</div>
  <div class="nav-link" data-sec="s-narrative" onclick="setActive(this,'s-narrative')">
    <span class="dot" style="background:#f7b731"></span>Risk Narrative</div>
  <div class="nav-link" data-sec="s-radar" onclick="setActive(this,'s-radar')">
    <span class="dot" style="background:#ff6b6b"></span>Trust Radar</div>
  <div class="nav-link" data-sec="s-iso42001" onclick="setActive(this,'s-iso42001')">
    <span class="dot" style="background:#51cf66"></span>RMF vs ISO 42001</div>
  <div class="nav-link" data-sec="s-scorecard" onclick="setActive(this,'s-scorecard')">
    <span class="dot" style="background:#a29bfe"></span>Risk Scorecard</div>`;

// ===== HTML SECTIONS =====
const SECTIONS_V4 = `
<section class="section" id="s-costbenefit">
  <div class="section-tag" style="color:#00b894">Calculators &middot; ROI</div>
  <h2>RMF Cost-Benefit Calculator</h2>
  <p class="sub">Quantify the business case for implementing the AI RMF. Compare the annual cost of implementation against the expected loss from AI incidents. See the break-even point and 5-year ROI.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Organization Size</div>
      <select id="cb-size" onchange="costBenefitCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="small">Small (&lt;50 FTE)</option>
        <option value="mid" selected>Mid (50-500 FTE)</option>
        <option value="large">Large (500+ FTE)</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Number of AI Systems</div>
      <input id="cb-numsys" type="number" min="1" max="200" value="5" oninput="costBenefitCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;box-sizing:border-box;">
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Average Risk Level</div>
      <select id="cb-risk" onchange="costBenefitCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Implementation Level</div>
      <select id="cb-impl" onchange="costBenefitCalc()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="basic">Basic (GOVERN + MAP)</option>
        <option value="standard" selected>Standard (all 4 functions)</option>
        <option value="advanced">Advanced (full + tooling)</option>
      </select>
    </div>
  </div>
  <canvas id="canvas-costbenefit" width="680" height="280" style="margin-bottom:12px;border-radius:10px;"></canvas>
  <div id="cb-summary" style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px;margin-bottom:8px;"></div>
</section>

<section class="section" id="s-impl-roadmap">
  <div class="section-tag" style="color:#6c5ce7">Calculators &middot; Planning</div>
  <h2>Implementation Roadmap Builder</h2>
  <p class="sub">Select your current maturity level and target state to generate a week-by-week implementation plan with milestones, owners, and RMF subcategory targets. Export and use directly in project planning.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Current Maturity</div>
      <select id="roadmap-current" onchange="implRoadmapGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="none">None (no RMF practice)</option>
        <option value="initial">Initial (ad hoc)</option>
        <option value="managed">Managed (partial)</option>
        <option value="defined">Defined (systematic)</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Target Maturity</div>
      <select id="roadmap-target" onchange="implRoadmapGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="initial">Initial</option>
        <option value="managed" selected>Managed</option>
        <option value="defined">Defined</option>
        <option value="optimizing">Optimizing</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Organization Size</div>
      <select id="roadmap-size" onchange="implRoadmapGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="small">Small</option>
        <option value="mid" selected>Mid-size</option>
        <option value="large">Large</option>
      </select>
    </div>
  </div>
  <textarea id="roadmap-output" readonly style="width:100%;min-height:360px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px;color:#a29bfe;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.8;resize:vertical;box-sizing:border-box;"></textarea>
  <div style="display:flex;gap:10px;margin-top:10px;">
    <button class="btn" onclick="implRoadmapGen()">Generate / Refresh</button>
    <button class="btn" onclick="implRoadmapDownload()" style="background:#161b22;border:1px solid #30363d;">Download</button>
  </div>
</section>

<section class="section" id="s-vendor-q">
  <div class="section-tag" style="color:#0984e3">Procurement &middot; Due Diligence</div>
  <h2>AI Vendor Procurement Questionnaire</h2>
  <p class="sub">When procuring third-party AI systems, ask the right questions. Generate a tailored due-diligence questionnaire mapped to specific RMF subcategories. Send to vendors before contract signature.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">AI System Type</div>
      <select id="vq-type" onchange="vendorQGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="decision">Decision Support</option>
        <option value="generative">Generative AI</option>
        <option value="classification">Classification</option>
        <option value="prediction">Predictive Model</option>
        <option value="vision">Computer Vision</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Risk Level</div>
      <select id="vq-risk" onchange="vendorQGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Deployment Context</div>
      <select id="vq-context" onchange="vendorQGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="customer">Customer-Facing</option>
        <option value="internal">Internal Tool</option>
        <option value="highstakes">High-Stakes (healthcare/finance/justice)</option>
        <option value="agentic">Agentic / Autonomous</option>
      </select>
    </div>
  </div>
  <textarea id="vq-output" readonly style="width:100%;min-height:400px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px;color:#74b9ff;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.8;resize:vertical;box-sizing:border-box;"></textarea>
  <div style="display:flex;gap:10px;margin-top:10px;">
    <button class="btn" onclick="vendorQGen()">Generate / Refresh</button>
    <button class="btn" onclick="vendorQDownload()" style="background:#161b22;border:1px solid #30363d;">Download</button>
  </div>
</section>

<section class="section" id="s-charter">
  <div class="section-tag" style="color:#fd79a8">Governance &middot; Generator</div>
  <h2>AI Ethics Committee Charter Generator</h2>
  <p class="sub">Generate a draft charter for an AI ethics or risk committee, tailored to your organization size and sector. Each clause is mapped to the RMF GOVERN subcategories it satisfies.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Organization Size</div>
      <select id="ch-size" onchange="charterGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="small">Small (&lt;50)</option>
        <option value="mid" selected>Mid (50-500)</option>
        <option value="large">Large (500+)</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Sector</div>
      <select id="ch-sector" onchange="charterGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="tech">Technology</option>
        <option value="healthcare">Healthcare</option>
        <option value="finance">Finance</option>
        <option value="government">Government</option>
        <option value="general">General</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Committee Scope</div>
      <select id="ch-scope" onchange="charterGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="all">All AI Systems</option>
        <option value="highrisk">High-Risk AI Only</option>
        <option value="external">External-Facing AI Only</option>
        <option value="genai">Generative AI Focus</option>
      </select>
    </div>
  </div>
  <textarea id="charter-output" readonly style="width:100%;min-height:400px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px;color:#fd79a8;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.8;resize:vertical;box-sizing:border-box;"></textarea>
  <div style="display:flex;gap:10px;margin-top:10px;">
    <button class="btn" onclick="charterGen()">Generate / Refresh</button>
    <button class="btn" onclick="charterCopy()" style="background:#161b22;border:1px solid #30363d;">Copy</button>
  </div>
</section>

<section class="section" id="s-narrative">
  <div class="section-tag" style="color:#f7b731">Documentation &middot; Generator</div>
  <h2>AI Risk Narrative Generator</h2>
  <p class="sub">Generate a formal NIST-style risk narrative for a specific AI system, ready for internal governance review or board presentation. Based on MAP and MEASURE subcategories.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;background:#161b22;border:1px solid #30363d;border-radius:12px;padding:16px;">
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">System Name</div>
      <input id="nar-name" type="text" placeholder="e.g. Loan Approval Model v3" oninput="narrativeGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;box-sizing:border-box;">
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">AI System Type</div>
      <select id="nar-type" onchange="narrativeGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="decision">Decision Support</option>
        <option value="generative">Generative AI</option>
        <option value="classification">Classification</option>
        <option value="prediction">Predictive Model</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Overall Risk Level</div>
      <select id="nar-risk" onchange="narrativeGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="low">Low</option>
        <option value="medium" selected>Medium</option>
        <option value="high">High</option>
        <option value="critical">Critical</option>
      </select>
    </div>
    <div>
      <div style="font-size:11px;color:#8b949e;margin-bottom:4px;">Deployment Stage</div>
      <select id="nar-stage" onchange="narrativeGen()" style="width:100%;background:#0d1117;border:1px solid #30363d;border-radius:6px;padding:7px 10px;color:#c9d1d9;font-size:13px;outline:none;">
        <option value="predeployment">Pre-Deployment Review</option>
        <option value="operational">Operational Review</option>
        <option value="incident">Incident Post-Mortem</option>
      </select>
    </div>
  </div>
  <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;margin-bottom:12px;">
    <div style="font-size:11px;color:#8b949e;margin-bottom:8px;">Identified Risk Areas (check all that apply)</div>
    <div style="display:flex;flex-wrap:wrap;gap:12px;">
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#c9d1d9;cursor:pointer;"><input type="checkbox" id="nar-r-bias" onchange="narrativeGen()"> Fairness / Bias (MS-2.5)</label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#c9d1d9;cursor:pointer;"><input type="checkbox" id="nar-r-halluc" onchange="narrativeGen()"> Hallucination / Accuracy (MS-2.6)</label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#c9d1d9;cursor:pointer;"><input type="checkbox" id="nar-r-privacy" onchange="narrativeGen()"> Privacy (MS-2.8)</label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#c9d1d9;cursor:pointer;"><input type="checkbox" id="nar-r-safety" onchange="narrativeGen()"> Safety (MG-3.2)</label>
      <label style="display:flex;align-items:center;gap:6px;font-size:13px;color:#c9d1d9;cursor:pointer;"><input type="checkbox" id="nar-r-acct" onchange="narrativeGen()"> Accountability (GV-2.1)</label>
    </div>
  </div>
  <textarea id="nar-output" readonly style="width:100%;min-height:380px;background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:16px;color:#f7b731;font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1.8;resize:vertical;box-sizing:border-box;"></textarea>
  <div style="display:flex;gap:10px;margin-top:10px;">
    <button class="btn" onclick="narrativeGen()">Generate / Refresh</button>
    <button class="btn" onclick="narrativeCopy()" style="background:#161b22;border:1px solid #30363d;">Copy</button>
  </div>
</section>

<section class="section" id="s-radar">
  <div class="section-tag" style="color:#ff6b6b">Self-Assessment &middot; Visual</div>
  <h2>Trustworthiness Radar Chart</h2>
  <p class="sub">Rate your AI system across all 7 trustworthiness dimensions. The radar chart compares your self-assessment against the NIST-recommended minimum baseline. Identify your lowest dimensions and prioritize remediation.</p>
  <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-start;">
    <canvas id="canvas-radar" width="380" height="380" style="flex-shrink:0;"></canvas>
    <div style="flex:1;min-width:200px;">
      <div id="radar-sliders" style="display:flex;flex-direction:column;gap:10px;"></div>
      <div id="radar-gaps" style="margin-top:16px;background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;font-size:12px;color:#8b949e;"></div>
    </div>
  </div>
</section>

<section class="section" id="s-iso42001">
  <div class="section-tag" style="color:#51cf66">Standards &middot; Crosswalk</div>
  <h2>NIST AI RMF vs. ISO/IEC 42001 Crosswalk</h2>
  <p class="sub">ISO/IEC 42001 (published December 2023) is the first international AI management system standard. Click any row to see how the two frameworks address the same concern — and where they diverge.</p>
  <div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:10px 14px;margin-bottom:16px;font-size:13px;color:#8b949e;">
    Alignment: <span style="color:#51cf66;font-weight:700;">&#11044; Full</span> &nbsp;&nbsp;
    <span style="color:#f7b731;font-weight:700;">&#11044; Partial</span> &nbsp;&nbsp;
    <span style="color:#ff6b6b;font-weight:700;">&#11044; Weak / Gap</span>
  </div>
  <div style="overflow-x:auto;margin-bottom:14px;">
    <table id="iso-table" style="width:100%;border-collapse:collapse;font-size:13px;"></table>
  </div>
  <div id="iso-detail" style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:14px;font-size:13px;color:#8b949e;min-height:52px;">Click a row to see the detailed alignment note and practical guidance.</div>
</section>

<section class="section" id="s-scorecard">
  <div class="section-tag" style="color:#a29bfe">Reporting &middot; Executive</div>
  <h2>AI Risk Scorecard</h2>
  <p class="sub">Generate an executive-level A through F report card across all four RMF functions. Aggregates your 72-subcategory checklist results, identifies top gaps, and produces a board-ready summary paragraph.</p>
  <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
    <button class="btn" onclick="scorecardCalc()" style="background:#6c5ce7;">Calculate from Checklist</button>
    <button class="btn" onclick="scorecardReset()" style="background:#161b22;border:1px solid #30363d;">Reset</button>
    <span style="font-size:12px;color:#8b949e;padding-top:8px;">Uses results from the 72-Subcategory Checklist section above.</span>
  </div>
  <canvas id="canvas-scorecard" width="680" height="180" style="margin-bottom:16px;border-radius:10px;"></canvas>
  <div id="scorecard-gaps" style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:16px;margin-bottom:12px;font-size:13px;color:#8b949e;display:none;"></div>
  <div id="scorecard-summary" style="background:#161b22;border:1px solid #30363d;border-radius:10px;padding:18px;font-size:13px;color:#c9d1d9;display:none;"></div>
</section>`;

// ===== JS DATA AND FUNCTIONS =====
const JS_V4 = `
// ===== COST-BENEFIT CALCULATOR =====
var CB_IMPL_COST={small:{basic:15,standard:45,advanced:120},mid:{basic:60,standard:180,advanced:450},large:{basic:200,standard:600,advanced:1800}};
var CB_RISK_LOSS={low:40,medium:180,high:750,critical:2800};
var CB_RISK_PROB={low:0.05,medium:0.15,high:0.35,critical:0.6};
var CB_REDUCTION={basic:0.40,standard:0.65,advanced:0.82};
function costBenefitCalc(){
  var size=document.getElementById('cb-size')?document.getElementById('cb-size').value:'mid';
  var numsys=parseInt(document.getElementById('cb-numsys')?document.getElementById('cb-numsys').value:'5')||5;
  var risk=document.getElementById('cb-risk')?document.getElementById('cb-risk').value:'medium';
  var impl=document.getElementById('cb-impl')?document.getElementById('cb-impl').value:'standard';
  var annImplCost=(CB_IMPL_COST[size]||CB_IMPL_COST.mid)[impl]||180;
  var expLossPerSys=CB_RISK_LOSS[risk]*CB_RISK_PROB[risk];
  var totalLossNoRMF=expLossPerSys*numsys;
  var totalLossWithRMF=totalLossNoRMF*(1-CB_REDUCTION[impl]);
  var annBenefit=totalLossNoRMF-totalLossWithRMF;
  var netAnn=annBenefit-annImplCost;
  var cbData={impl:annImplCost,lossNo:totalLossNoRMF,lossWith:totalLossWithRMF,benefit:annBenefit,net:netAnn};
  if(typeof drawCostBenefit==='function')drawCostBenefit(cbData,numsys);
  var sum=document.getElementById('cb-summary');
  if(sum){
    var fmt=function(v){return v>=1000?'$'+(v/1000).toFixed(1)+'M':'$'+Math.round(v)+'K';};
    var cards=[
      {label:'Annual RMF Cost',val:fmt(annImplCost),color:'#ff6b6b'},
      {label:'Expected Loss (no RMF)',val:fmt(totalLossNoRMF),color:'#f7b731'},
      {label:'Expected Loss (with RMF)',val:fmt(totalLossWithRMF),color:'#51cf66'},
      {label:'5-Year Net Benefit',val:fmt(netAnn*5-annImplCost*0.5),color:netAnn>0?'#00b894':'#ff6b6b'}
    ];
    sum.innerHTML=cards.map(function(c){
      return '<div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:12px;text-align:center;">'+
        '<div style="font-size:20px;font-weight:700;color:'+c.color+';">'+c.val+'</div>'+
        '<div style="font-size:11px;color:#8b949e;margin-top:4px;">'+c.label+'</div></div>';
    }).join('');
  }
}

// ===== IMPLEMENTATION ROADMAP BUILDER =====
var ROADMAP_ACTIONS={
  initial:[
    {week:'1-2',action:'Appoint AI Risk Owner with formal authority and budget',ref:'GV-2.1',owner:'CEO or Executive Sponsor',deliverable:'AI risk owner appointment memo signed by leadership'},
    {week:'1-2',action:'Complete inventory of all AI systems currently in use',ref:'MAP-1.1',owner:'CTO or IT Director',deliverable:'AI system inventory with name, type, owner, and risk level'},
    {week:'3-4',action:'Draft initial AI risk policy covering key responsibilities',ref:'GV-1.1',owner:'Legal or Risk Function',deliverable:'AI Risk Policy v0.1 reviewed by AI Risk Owner'},
    {week:'5-6',action:'Document intended use for the three highest-risk systems',ref:'MAP-1.1',owner:'System owners',deliverable:'Intended use documentation per system'},
    {week:'7-8',action:'Create basic risk register for the highest-risk system',ref:'MAP-3.1',owner:'ML team and Risk Function',deliverable:'Risk register with top five risks and owners'},
    {week:'9-10',action:'Define and document organizational AI risk tolerance statement',ref:'GV-2.2',owner:'CEO and Board',deliverable:'Risk tolerance statement formally approved'},
    {week:'11-12',action:'Establish basic incident reporting and escalation procedure',ref:'MG-3.2',owner:'Operations',deliverable:'Incident report template and escalation contact list'}
  ],
  managed:[
    {week:'1-3',action:'Expand risk register to cover all AI systems in inventory',ref:'MAP-3.1',owner:'ML team and Risk',deliverable:'Full risk register across all systems'},
    {week:'2-4',action:'Conduct fairness evaluation on all customer-facing AI',ref:'MS-2.5',owner:'ML Engineering',deliverable:'Fairness audit report with demographic breakdown'},
    {week:'3-5',action:'Define trustworthiness metrics for all deployed systems',ref:'MS-1.1',owner:'AI Risk Owner',deliverable:'Metrics framework document with thresholds'},
    {week:'4-6',action:'Establish AI Risk Committee with defined meeting cadence',ref:'GV-3.1',owner:'AI Risk Owner',deliverable:'Committee charter and member list'},
    {week:'5-7',action:'Map applicable regulatory requirements to AI systems',ref:'GV-5.1',owner:'Legal',deliverable:'Regulatory mapping matrix'},
    {week:'6-8',action:'Implement and test human override capability for high-risk AI',ref:'GV-6.2',owner:'Engineering',deliverable:'Override mechanism documented and tested'},
    {week:'7-9',action:'Run robustness and adversarial testing for deployed systems',ref:'MS-2.6',owner:'ML Engineering',deliverable:'Robustness test report per system'},
    {week:'8-10',action:'Develop mitigation plans for all top-priority identified risks',ref:'MG-1.1',owner:'AI Risk Owner',deliverable:'Risk treatment plans with owners and timelines'},
    {week:'9-12',action:'Establish ongoing monitoring dashboards for production systems',ref:'MG-3.1',owner:'Operations',deliverable:'Monitoring dashboard live with alert thresholds'}
  ],
  defined:[
    {week:'1-4',action:'Apply consistent risk management processes organization-wide',ref:'GV-1.1',owner:'AI Risk Owner',deliverable:'Process rollout complete across all teams'},
    {week:'2-5',action:'Implement diversity policy for AI development teams',ref:'GV-3.2',owner:'HR and AI Risk',deliverable:'Diversity in AI teams policy published and tracked'},
    {week:'3-6',action:'Implement feedback loops from production systems to risk team',ref:'MS-4.1',owner:'Operations and ML',deliverable:'Feedback loop process documented and operational'},
    {week:'4-7',action:'Engage external experts for independent AI risk review',ref:'MS-3.2',owner:'AI Risk Owner',deliverable:'External review report with findings and remediations'},
    {week:'5-8',action:'Conduct societal impact assessments for all AI systems',ref:'MAP-5.1',owner:'Ethics team',deliverable:'Impact assessment reports filed per system'},
    {week:'6-10',action:'Implement privacy risk evaluation process for all AI',ref:'MS-2.8',owner:'Privacy and ML',deliverable:'Privacy evaluation completed per system'},
    {week:'8-12',action:'Establish residual risk communication to board quarterly',ref:'MG-4.1',owner:'AI Risk Owner',deliverable:'Quarterly board AI risk report template and first report'}
  ],
  optimizing:[
    {week:'1-6',action:'Implement continuous feedback loops from production to all four RMF functions',ref:'MS-4.1, MG-3.1',owner:'AI Operations',deliverable:'Real-time risk dashboard connected to all systems'},
    {week:'2-8',action:'Conduct cross-functional review of all 72 RMF subcategories',ref:'All functions',owner:'AI Risk Committee',deliverable:'Full subcategory audit report with gap closure plan'},
    {week:'4-10',action:'Integrate AI risk metrics into board-level reporting cycle',ref:'GV-4.1, MG-4.1',owner:'AI Risk Owner and CFO',deliverable:'Board AI risk report included in quarterly governance cycle'},
    {week:'6-12',action:'Implement automated risk monitoring tooling across all systems',ref:'MS-4.1, MG-3.1',owner:'Engineering',deliverable:'Automated alerting and risk scoring operational'},
    {week:'8-16',action:'Establish AI risk training program for all staff touching AI',ref:'GV-3.1',owner:'HR and AI Risk',deliverable:'Training curriculum delivered and completion tracked'},
    {week:'10-20',action:'Publish external transparency report on AI risk practices',ref:'GV-1.2',owner:'Communications and AI Risk',deliverable:'Annual AI transparency report published'}
  ]
};
function implRoadmapGen(){
  var LF=String.fromCharCode(10);
  var current=document.getElementById('roadmap-current')?document.getElementById('roadmap-current').value:'none';
  var target=document.getElementById('roadmap-target')?document.getElementById('roadmap-target').value:'managed';
  var size=document.getElementById('roadmap-size')?document.getElementById('roadmap-size').value:'mid';
  var sizeLabel={small:'Small Organization',mid:'Mid-size Organization',large:'Large Organization'}[size];
  var order=['initial','managed','defined','optimizing'];
  var cIdx=order.indexOf(current);
  var tIdx=order.indexOf(target);
  if(tIdx<0)tIdx=1;
  if(cIdx>=tIdx)tIdx=Math.min(cIdx+1,order.length-1);
  var lines=[
    'NIST AI RMF IMPLEMENTATION ROADMAP',
    sizeLabel+' | Maturity: '+current.toUpperCase()+' to '+target.toUpperCase(),
    '='.repeat(55),
    'Generated: '+new Date().toLocaleDateString(),
    ''
  ];
  var totalActions=0;
  for(var i=cIdx+1;i<=tIdx;i++){
    var matKey=order[i];
    var actions=ROADMAP_ACTIONS[matKey]||[];
    lines.push('PHASE: '+matKey.toUpperCase()+' MATURITY');
    lines.push('-'.repeat(40));
    actions.forEach(function(a){
      lines.push('');
      lines.push('WEEK '+a.week+' | '+a.ref);
      lines.push('  Action:      '+a.action);
      lines.push('  Owner:       '+a.owner);
      lines.push('  Deliverable: '+a.deliverable);
      totalActions++;
    });
    lines.push('');
  }
  lines.push('='.repeat(55));
  lines.push('TOTAL ACTIONS: '+totalActions);
  lines.push('Framework: NIST AI Risk Management Framework 1.0');
  var ta=document.getElementById('roadmap-output');
  if(ta)ta.value=lines.join(LF);
}
function implRoadmapDownload(){
  var ta=document.getElementById('roadmap-output');
  if(!ta||!ta.value)return;
  var blob=new Blob([ta.value],{type:'text/plain'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='rmf-implementation-roadmap.txt';a.click();
}

// ===== VENDOR QUESTIONNAIRE GENERATOR =====
var VQ_BASE=[
  {cat:'System Information',q:'What is the intended use, scope, and explicit out-of-scope uses of this AI system?',ref:'MAP-1.1'},
  {cat:'System Information',q:'What is the model architecture, training dataset size, and data vintage?',ref:'MAP-2.1'},
  {cat:'Risk Management',q:'Has a formal risk assessment been conducted? Please provide documentation.',ref:'MAP-3.1'},
  {cat:'Risk Management',q:'What is your process for identifying and responding to new risks discovered post-deployment?',ref:'MG-2.3'},
  {cat:'Risk Management',q:'Has an independent third-party audit been conducted? When was the last review?',ref:'MS-3.2'},
  {cat:'Fairness and Bias',q:'What fairness metrics are tracked, and what are the acceptable thresholds by demographic group?',ref:'MS-2.5'},
  {cat:'Fairness and Bias',q:'What is the process for addressing a fairness violation discovered in production?',ref:'MG-2.2'},
  {cat:'Data Practices',q:'What training data was used, how was it collected, and how was quality verified?',ref:'MAP-3.5'},
  {cat:'Data Practices',q:'How is data minimization enforced for data processed at inference time?',ref:'MS-2.8'},
  {cat:'Data Practices',q:'How are training data updates and model version changes communicated to customers?',ref:'GV-1.2'},
  {cat:'Safety and Security',q:'What robustness and adversarial testing has been performed? Provide test methodology.',ref:'MS-2.6'},
  {cat:'Safety and Security',q:'What security controls prevent prompt injection or model extraction attacks?',ref:'MS-2.7'},
  {cat:'Safety and Security',q:'What is the incident response procedure if the system causes harm? Who is the contact?',ref:'MG-3.2'},
  {cat:'Transparency',q:'Can the system provide explanations for its outputs? At what level of detail?',ref:'MS-2.9'},
  {cat:'Transparency',q:'What disclosures are provided to end users about AI involvement in decisions affecting them?',ref:'GV-1.2'},
  {cat:'Monitoring',q:'How is model drift detected and addressed in production?',ref:'MS-4.1'},
  {cat:'Monitoring',q:'What monitoring alerts exist and what triggers a human review of system behavior?',ref:'MG-3.1'},
  {cat:'Monitoring',q:'How often is system performance reviewed against defined metrics?',ref:'MS-4.2'},
  {cat:'Oversight',q:'What human override mechanism exists for high-stakes decisions?',ref:'GV-6.2'},
  {cat:'Oversight',q:'What is the process for system decommissioning and customer data deletion?',ref:'MG-4.1'}
];
var VQ_EXTRA={
  generative:[
    {cat:'Generative AI',q:'What hallucination rate has been measured, and how is it communicated to users?',ref:'MS-2.6'},
    {cat:'Generative AI',q:'What controls prevent generation of harmful, illegal, or CBRN-related content?',ref:'MG-2.1'},
    {cat:'Generative AI',q:'How is copyright and IP risk managed for generated outputs?',ref:'GV-5.1'}
  ],
  highstakes:[
    {cat:'High-Stakes',q:'What regulatory approvals or certifications has this system received?',ref:'GV-5.1'},
    {cat:'High-Stakes',q:'What is the documented liability and indemnification position for AI errors?',ref:'MG-4.1'},
    {cat:'High-Stakes',q:'Has a clinical or domain expert reviewed system outputs for accuracy and appropriateness?',ref:'MS-3.1'}
  ],
  agentic:[
    {cat:'Agentic AI',q:'What actions can the system take autonomously without human confirmation?',ref:'GV-6.2'},
    {cat:'Agentic AI',q:'What is the maximum consequence scope of a single autonomous action?',ref:'MAP-1.1'},
    {cat:'Agentic AI',q:'How can the system be stopped or rolled back if it takes an unintended action?',ref:'MG-3.2'}
  ]
};
function vendorQGen(){
  var LF=String.fromCharCode(10);
  var type=document.getElementById('vq-type')?document.getElementById('vq-type').value:'decision';
  var risk=document.getElementById('vq-risk')?document.getElementById('vq-risk').value:'medium';
  var context=document.getElementById('vq-context')?document.getElementById('vq-context').value:'customer';
  var riskLabel={low:'LOW',medium:'MEDIUM',high:'HIGH',critical:'CRITICAL'}[risk];
  var contextLabel={customer:'Customer-Facing',internal:'Internal Tool',highstakes:'High-Stakes',agentic:'Agentic / Autonomous'}[context];
  var questions=VQ_BASE.slice();
  if(type==='generative')questions=questions.concat(VQ_EXTRA.generative);
  if(context==='highstakes')questions=questions.concat(VQ_EXTRA.highstakes);
  if(context==='agentic')questions=questions.concat(VQ_EXTRA.agentic);
  if(risk==='critical'||risk==='high'){
    questions=questions.concat([
      {cat:'Enhanced Due Diligence',q:'Provide your most recent independent AI risk audit report.',ref:'MS-3.2'},
      {cat:'Enhanced Due Diligence',q:'What board or executive-level governance exists for this AI system?',ref:'GV-4.1'}
    ]);
  }
  var lines=[
    'AI VENDOR PROCUREMENT QUESTIONNAIRE',
    'AI Type: '+type.toUpperCase()+' | Risk Level: '+riskLabel+' | Context: '+contextLabel,
    'Framework: NIST AI Risk Management Framework 1.0',
    '='.repeat(55),
    '',
    'INSTRUCTIONS TO VENDOR:',
    'Please answer all questions in writing. For each question,',
    'provide supporting documentation where available.',
    'Responses will be evaluated against NIST AI RMF subcategories.',
    ''
  ];
  var currentCat='';
  var qNum=1;
  questions.forEach(function(item){
    if(item.cat!==currentCat){
      currentCat=item.cat;
      lines.push('--- '+currentCat.toUpperCase()+' ---');
    }
    lines.push('Q'+qNum+'. ['+item.ref+'] '+item.q);
    lines.push('   Answer: _______________________________________________');
    lines.push('   Supporting doc: ________________________________________');
    lines.push('');
    qNum++;
  });
  lines.push('='.repeat(55));
  lines.push('Total questions: '+(qNum-1));
  lines.push('Vendor company: _________________________ Date: ____________');
  lines.push('Vendor signatory: ___________________________________________');
  var ta=document.getElementById('vq-output');
  if(ta)ta.value=lines.join(LF);
}
function vendorQDownload(){
  var ta=document.getElementById('vq-output');
  if(!ta||!ta.value)return;
  var blob=new Blob([ta.value],{type:'text/plain'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='ai-vendor-questionnaire.txt';a.click();
}

// ===== ETHICS COMMITTEE CHARTER GENERATOR =====
function charterGen(){
  var LF=String.fromCharCode(10);
  var size=document.getElementById('ch-size')?document.getElementById('ch-size').value:'mid';
  var sector=document.getElementById('ch-sector')?document.getElementById('ch-sector').value:'tech';
  var scope=document.getElementById('ch-scope')?document.getElementById('ch-scope').value:'all';
  var sectorLabel={tech:'Technology',healthcare:'Healthcare',finance:'Financial Services',government:'Government',general:'General Business'}[sector];
  var scopeLabel={all:'all AI systems',highrisk:'high-risk AI systems only',external:'external-facing AI systems',genai:'generative AI systems'}[scope];
  var membershipBySize={
    small:'AI Risk Owner (Chair), Legal Counsel, Product Lead, Engineering Lead',
    mid:'AI Risk Owner (Chair), CTO or VP Engineering, Legal/Compliance, Product Management, Data Science Lead, HR Representative',
    large:'Chief AI Officer or AI Risk Owner (Chair), CTO, Chief Legal Officer, Chief Privacy Officer, VP Product, VP Engineering, Head of Ethics, External Independent Member, HR'
  };
  var cadenceBySize={small:'Quarterly meetings; ad hoc for high-risk deployments',mid:'Bi-monthly meetings; monthly for active high-risk deployments',large:'Monthly meetings; weekly for critical deployments or incidents'};
  var lines=[
    'AI ETHICS AND RISK COMMITTEE CHARTER',
    sectorLabel+' Organization',
    'Aligned to NIST AI Risk Management Framework 1.0',
    '='.repeat(55),
    '',
    '1. NAME AND PURPOSE [GV-3.1]',
    '   Name: AI Ethics and Risk Committee (AERC)',
    '   Purpose: To provide organizational oversight of AI risk management,',
    '   ensure trustworthy AI development and deployment, and maintain',
    '   alignment with the NIST AI Risk Management Framework across',
    '   '+scopeLabel+'.',
    '',
    '2. SCOPE [GV-1.1, MAP-1.1]',
    '   This committee has oversight authority over '+scopeLabel+'.',
    '   Scope includes: development, procurement, deployment, operation,',
    '   and decommissioning phases of the AI lifecycle.',
    '',
    '3. MEMBERSHIP [GV-3.2]',
    '   '+membershipBySize[size],
    '   Membership must reflect organizational diversity in perspective,',
    '   discipline, and demographic background (GV-3.2).',
    '',
    '4. DECISION AUTHORITY [GV-2.1, GV-4.1]',
    '   The AERC has authority to:',
    '   - Approve or block deployment of AI systems above defined risk threshold',
    '   - Require additional risk assessment or mitigation before deployment',
    '   - Pause or discontinue AI systems posing unacceptable risk (MG-2.1)',
    '   - Set organizational AI risk tolerance (GV-2.2)',
    '   - Escalate to the Board for critical-risk decisions',
    '',
    '5. MEETING CADENCE [GV-3.1]',
    '   '+cadenceBySize[size],
    '   All meetings must be minuted. Decisions and rationale recorded.',
    '',
    '6. MANDATORY REVIEW ITEMS [MAP-4.1, MG-4.1]',
    '   At each meeting the AERC must review:',
    '   - New AI system deployment requests above risk threshold',
    '   - Outstanding risk register items not yet remediated',
    '   - Any AI-related incidents since last meeting (MG-3.2)',
    '   - Residual risk updates for deployed systems (MG-1.3)',
    '',
    '7. SUBCATEGORY RESPONSIBILITIES [GV-2.2]',
    '   GV-1.1: Committee approves all AI risk policies',
    '   GV-2.2: Committee sets and reviews risk tolerance annually',
    '   GV-5.1: Legal member ensures regulatory requirements are current',
    '   MAP-4.1: Risk prioritization requires committee sign-off for high risk',
    '   MG-2.1: Risk treatment decisions for critical risks require committee vote',
    '   MG-4.1: Residual risk communication to board is committee responsibility',
    '',
    '8. REPORTING [GV-4.1, MG-4.1]',
    '   The AERC Chair reports to the Board of Directors quarterly.',
    '   Annual AI risk posture report is published internally.',
    '   Critical incidents trigger immediate board notification.',
    '',
    '9. CHARTER REVIEW',
    '   This charter is reviewed annually or following a significant AI incident.',
    '   Amendments require majority vote of full committee membership.',
    '',
    '='.repeat(55),
    'Approved by: _________________________ Date: ______________',
    'AI Risk Owner: _______________________ Role: ______________'
  ];
  var ta=document.getElementById('charter-output');
  if(ta)ta.value=lines.join(LF);
}
function charterCopy(){
  var ta=document.getElementById('charter-output');
  if(!ta||!ta.value)return;
  navigator.clipboard.writeText(ta.value).then(function(){alert('Charter copied.');}).catch(function(){ta.select();document.execCommand('copy');});
}

// ===== RISK NARRATIVE GENERATOR =====
function narrativeGen(){
  var LF=String.fromCharCode(10);
  var name=document.getElementById('nar-name')?document.getElementById('nar-name').value.trim()||'[AI System Name]':'[AI System Name]';
  var type=document.getElementById('nar-type')?document.getElementById('nar-type').value:'decision';
  var risk=document.getElementById('nar-risk')?document.getElementById('nar-risk').value:'medium';
  var stage=document.getElementById('nar-stage')?document.getElementById('nar-stage').value:'predeployment';
  var hasBias=document.getElementById('nar-r-bias')&&document.getElementById('nar-r-bias').checked;
  var hasHalluc=document.getElementById('nar-r-halluc')&&document.getElementById('nar-r-halluc').checked;
  var hasPrivacy=document.getElementById('nar-r-privacy')&&document.getElementById('nar-r-privacy').checked;
  var hasSafety=document.getElementById('nar-r-safety')&&document.getElementById('nar-r-safety').checked;
  var hasAcct=document.getElementById('nar-r-acct')&&document.getElementById('nar-r-acct').checked;
  var riskLabel={low:'LOW',medium:'MEDIUM',high:'HIGH',critical:'CRITICAL'}[risk];
  var stageLabel={predeployment:'Pre-Deployment Risk Review',operational:'Operational Risk Review',incident:'Incident Post-Mortem'}[stage];
  var typeDesc={decision:'a decision support AI system',generative:'a generative AI system',classification:'a classification AI system',prediction:'a predictive model'}[type];
  var lines=[
    'AI RISK NARRATIVE',
    name,
    stageLabel+' | Risk Level: '+riskLabel,
    'Prepared pursuant to NIST AI Risk Management Framework 1.0',
    'Date: '+new Date().toLocaleDateString(),
    '='.repeat(55),
    '',
    '1. SYSTEM OVERVIEW [MAP-1.1, MAP-2.1]',
    '   '+name+' is '+typeDesc+'. The intended use, scope,',
    '   and operational context of this system have been documented',
    '   in accordance with MAP-1.1. Affected individuals and stakeholder',
    '   groups have been identified per MAP-1.4.',
    ''
  ];
  lines.push('2. RISK CONTEXT [MAP-3.1, MAP-4.1]');
  lines.push('   This system has been assessed at the '+riskLabel+' risk level.');
  lines.push('   The following risk areas have been identified through');
  lines.push('   structured risk identification (MAP-3.1) and prioritized');
  lines.push('   against organizational risk tolerance (GV-2.2):');
  lines.push('');
  if(!hasBias&&!hasHalluc&&!hasPrivacy&&!hasSafety&&!hasAcct){
    lines.push('   [No risk areas selected. Check applicable risks above.]');
  }else{
    if(hasBias)lines.push('   - Fairness and Bias (MS-2.5): Risk of disparate outcomes');
    if(hasHalluc)lines.push('   - Accuracy and Hallucination (MS-2.6): Risk of incorrect outputs');
    if(hasPrivacy)lines.push('   - Privacy (MS-2.8): Risk of personal data exposure or misuse');
    if(hasSafety)lines.push('   - Safety (MG-3.2): Risk of physical or systemic harm');
    if(hasAcct)lines.push('   - Accountability (GV-2.1): Risk of unclear decision ownership');
  }
  lines.push('');
  lines.push('3. EXISTING CONTROLS [MS-1.1, MG-1.1]');
  lines.push('   The following controls have been implemented or planned:');
  if(hasBias)lines.push('   - Fairness evaluation conducted per MS-2.5 methodology');
  if(hasHalluc)lines.push('   - Robustness and hallucination testing per MS-2.6');
  if(hasPrivacy)lines.push('   - Privacy risk evaluation completed per MS-2.8');
  if(hasSafety)lines.push('   - Incident response procedure established per MG-3.2');
  if(hasAcct)lines.push('   - Accountability structure documented per GV-2.1');
  lines.push('   - Human override capability documented per GV-6.2');
  lines.push('   - Ongoing monitoring process established per MG-3.1');
  lines.push('');
  lines.push('4. RESIDUAL RISK ASSESSMENT [MG-1.3, GV-2.2]');
  var residualLabel={low:'LOW — Within acceptable tolerance',medium:'MEDIUM — Monitored with quarterly review',high:'HIGH — Requires executive sign-off before deployment',critical:'CRITICAL — Board notification required; deployment not recommended without mitigation'}[risk];
  lines.push('   Residual Risk Level: '+residualLabel);
  lines.push('   Residual risks are documented in the system risk register and');
  lines.push('   communicated to relevant stakeholders per MG-4.1.');
  lines.push('');
  lines.push('5. RECOMMENDATION');
  var recLabel={predeployment:{low:'APPROVE FOR DEPLOYMENT with standard monitoring.',medium:'CONDITIONAL APPROVAL — address residual risks within 30 days.',high:'HOLD — additional risk treatment required before deployment.',critical:'DO NOT DEPLOY — critical risks must be mitigated first.'},operational:{low:'CONTINUE OPERATION — next review in 12 months.',medium:'CONTINUE WITH ENHANCED MONITORING — next review in 6 months.',high:'CONDITIONAL CONTINUATION — remediation plan required within 60 days.',critical:'CONSIDER SUSPENSION — immediate executive review required.'},incident:{low:'NO SYSTEMIC ISSUE IDENTIFIED — update monitoring.',medium:'PROCESS IMPROVEMENT REQUIRED — remediate root cause within 90 days.',high:'SIGNIFICANT CONTROL FAILURE — mandatory remediation and re-assessment.',critical:'SYSTEMIC FAILURE — suspend system pending full investigation.'}}[stage][risk];
  lines.push('   '+recLabel);
  lines.push('');
  lines.push('='.repeat(55));
  lines.push('Prepared by: _______________________ Date: ______________');
  lines.push('Reviewed by AI Risk Owner: _________ Date: ______________');
  var ta=document.getElementById('nar-output');
  if(ta)ta.value=lines.join(LF);
}
function narrativeCopy(){
  var ta=document.getElementById('nar-output');
  if(!ta||!ta.value)return;
  navigator.clipboard.writeText(ta.value).then(function(){alert('Narrative copied.');}).catch(function(){ta.select();document.execCommand('copy');});
}

// ===== TRUSTWORTHINESS RADAR =====
var RADAR_CHARS=['Accountable','Explainable','Privacy','Reliable','Safe','Secure','Fair'];
var RADAR_COLORS=['#6c5ce7','#0984e3','#00b894','#51cf66','#f7b731','#ff6b6b','#fd79a8'];
var RADAR_BASELINE=[6,5,6,7,8,7,7];
var radarScores=[7,6,7,7,8,7,7];
function radarSliderRender(){
  var wrap=document.getElementById('radar-sliders');
  if(!wrap)return;
  wrap.innerHTML=RADAR_CHARS.map(function(name,i){
    return '<div style="display:flex;align-items:center;gap:10px;">'+
      '<span style="font-size:11px;color:'+RADAR_COLORS[i]+';min-width:100px;font-weight:600;">'+name+'</span>'+
      '<input type="range" min="0" max="10" value="'+radarScores[i]+'" data-ridx="'+i+'" oninput="radarUpdate('+i+', this.value)" style="flex:1;accent-color:'+RADAR_COLORS[i]+';">'+
      '<span id="radar-val-'+i+'" style="font-size:12px;color:#c9d1d9;min-width:20px;text-align:right;">'+radarScores[i]+'</span>'+
      '</div>';
  }).join('');
}
function radarUpdate(idx,val){
  radarScores[idx]=parseInt(val);
  var el=document.getElementById('radar-val-'+idx);
  if(el)el.textContent=val;
  radarGapsUpdate();
  if(typeof drawRadar==='function')drawRadar();
}
function radarGapsUpdate(){
  var gaps=[];
  RADAR_CHARS.forEach(function(name,i){
    if(radarScores[i]<RADAR_BASELINE[i])gaps.push({name:name,score:radarScores[i],min:RADAR_BASELINE[i],color:RADAR_COLORS[i]});
  });
  var el=document.getElementById('radar-gaps');
  if(!el)return;
  if(!gaps.length){el.innerHTML='<span style="color:#51cf66;font-weight:600;">All dimensions meet the recommended minimum baseline.</span>';return;}
  el.innerHTML='<strong style="color:#ff6b6b;">Below baseline:</strong><br>'+
    gaps.map(function(g){return '<span style="color:'+g.color+';">'+g.name+': '+g.score+'/10 (min '+g.min+')</span>';}).join('<br>');
}
function initRadar(){radarSliderRender();radarGapsUpdate();if(typeof drawRadar==='function')drawRadar();}

// ===== ISO 42001 CROSSWALK =====
var ISO42001_MAP=[
  {rmf:'GV-1.1',rmfName:'AI Risk Policies',iso:'5.2',isoTitle:'AI Policy',align:3,note:'Near-identical requirement. Both mandate documented AI risk policies at organizational level. ISO 5.2 requires board-level approval; RMF GV-1.1 does not explicitly require board sign-off.'},
  {rmf:'GV-1.2',rmfName:'Roles Defined',iso:'5.3',isoTitle:'Roles and Responsibilities',align:3,note:'Direct mapping. Both require named roles, responsibilities, and authorities for AI risk. ISO 5.3 is equally prescriptive.'},
  {rmf:'GV-2.2',rmfName:'Risk Tolerance',iso:'8.2',isoTitle:'AI Risk Assessment',align:2,note:'RMF is more specific about documenting and communicating risk tolerance. ISO 8.2 requires risk criteria but frames it within the risk assessment process, not as a standalone communication artifact.'},
  {rmf:'GV-4.1',rmfName:'Leadership Commitment',iso:'5.1',isoTitle:'Leadership and Commitment',align:3,note:'Near-identical. Both require demonstrable top management commitment to AI risk management, including resource allocation and accountability.'},
  {rmf:'GV-5.1',rmfName:'Regulatory Requirements',iso:'4.2',isoTitle:'Needs and Expectations',align:2,note:'ISO 4.2 covers all stakeholder needs; RMF GV-5.1 is specifically focused on regulatory and legal requirements. RMF is more targeted here.'},
  {rmf:'GV-6.2',rmfName:'Human Override',iso:'8.5',isoTitle:'AI System Lifecycle',align:2,note:'ISO 8.5 covers human oversight within lifecycle management. RMF GV-6.2 specifically mandates a documented override capability — more prescriptive than ISO.'},
  {rmf:'MAP-1.1',rmfName:'Intended Use',iso:'8.5',isoTitle:'AI System Lifecycle',align:2,note:'ISO 8.5 includes intended purpose documentation within lifecycle. RMF MAP-1.1 is more detailed about scope, boundaries, and out-of-scope uses.'},
  {rmf:'MAP-3.1',rmfName:'Risk Identification',iso:'8.2',isoTitle:'AI Risk Assessment',align:3,note:'Strong alignment. Both require systematic identification of AI risks as a formal process step before deployment. ISO uses standard ISO 31000 risk terminology.'},
  {rmf:'MAP-4.1',rmfName:'Risk Prioritization',iso:'8.2',isoTitle:'AI Risk Assessment',align:2,note:'ISO risk assessment includes prioritization implicitly. RMF MAP-4 is more explicit about documenting prioritization rationale and linking to risk tolerance.'},
  {rmf:'MAP-5.1',rmfName:'Societal Impact',iso:'8.4',isoTitle:'AI System Impact Assessment',align:3,note:'ISO 8.4 directly maps to MAP-5 societal and environmental impact assessment. One of the strongest alignments between the two frameworks.'},
  {rmf:'MS-1.1',rmfName:'Metrics Defined',iso:'9.1',isoTitle:'Monitoring and Measurement',align:2,note:'ISO 9.1 requires performance evaluation but is less prescriptive about trustworthiness-specific metrics. RMF MS-1 provides more structure around metric selection for AI characteristics.'},
  {rmf:'MS-2.5',rmfName:'Fairness Evaluation',iso:'8.2',isoTitle:'AI Risk Assessment + Annex B',align:2,note:'ISO Annex B.7 addresses bias but does not mandate specific fairness testing. RMF MS-2.5 is more prescriptive about demographic evaluation and disparity metrics.'},
  {rmf:'MS-4.1',rmfName:'Feedback Loops',iso:'9.1',isoTitle:'Monitoring and Measurement',align:2,note:'Both require ongoing monitoring. RMF MS-4 is more specific about feedback loops from production back to risk assessment. ISO 9.1 is less prescriptive about the feedback mechanism.'},
  {rmf:'MG-1.1',rmfName:'Mitigation Plans',iso:'8.3',isoTitle:'AI Risk Treatment',align:3,note:'Strong alignment. Both ISO 8.3 and RMF MG-1 require documented risk treatment plans with selected treatment options and implementation tracking.'},
  {rmf:'MG-3.2',rmfName:'Incident Response',iso:'10.1',isoTitle:'Nonconformity and Corrective Action',align:2,note:'ISO 10.1 covers corrective action for nonconformities. RMF MG-3.2 is more specific to AI incidents, including real-time detection and response — more operationally prescriptive.'}
];
var selectedIsoIdx=-1;
function isoRender(){
  var table=document.getElementById('iso-table');
  if(!table)return;
  var alignColors={3:'#51cf66',2:'#f7b731',1:'#ff6b6b'};
  var alignLabels={3:'Full',2:'Partial',1:'Weak'};
  var alignDots={3:'&#11044;&#11044;&#11044;',2:'&#11044;&#11044;&#9711;',1:'&#11044;&#9711;&#9711;'};
  var html='<thead><tr style="border-bottom:1px solid #30363d;">'+
    '<th style="text-align:left;padding:8px 10px;color:#8b949e;font-size:11px;">RMF</th>'+
    '<th style="text-align:left;padding:8px 10px;color:#8b949e;font-size:11px;">Subcategory</th>'+
    '<th style="text-align:left;padding:8px 10px;color:#8b949e;font-size:11px;">ISO 42001</th>'+
    '<th style="text-align:left;padding:8px 10px;color:#8b949e;font-size:11px;">Clause Title</th>'+
    '<th style="text-align:center;padding:8px 10px;color:#8b949e;font-size:11px;">Alignment</th>'+
    '</tr></thead><tbody>';
  ISO42001_MAP.forEach(function(m,i){
    var isSelected=selectedIsoIdx===i;
    var ac=alignColors[m.align];
    html+='<tr data-idx="'+i+'" onclick="isoClick(this)" style="border-bottom:1px solid #21262d;cursor:pointer;background:'+(isSelected?'#1c2128':'transparent')+';transition:background 0.15s;">'+
      '<td style="padding:9px 10px;color:'+ac+';font-weight:700;font-size:12px;">'+m.rmf+'</td>'+
      '<td style="padding:9px 10px;color:#c9d1d9;font-size:12px;">'+m.rmfName+'</td>'+
      '<td style="padding:9px 10px;color:#51cf66;font-weight:700;font-size:12px;">'+m.iso+'</td>'+
      '<td style="padding:9px 10px;color:#c9d1d9;font-size:12px;">'+m.isoTitle+'</td>'+
      '<td style="padding:9px 10px;text-align:center;"><span style="color:'+ac+';font-size:11px;font-weight:700;">'+alignDots[m.align]+' '+alignLabels[m.align]+'</span></td>'+
    '</tr>';
  });
  html+='</tbody>';
  table.innerHTML=html;
}
function isoClick(row){
  var idx=parseInt(row.getAttribute('data-idx'));
  selectedIsoIdx=selectedIsoIdx===idx?-1:idx;
  isoRender();
  var det=document.getElementById('iso-detail');
  if(det){
    if(selectedIsoIdx<0){det.innerHTML='Click a row to see the detailed alignment note and practical guidance.';det.style.color='#8b949e';}
    else{
      var m=ISO42001_MAP[selectedIsoIdx];
      var ac={3:'#51cf66',2:'#f7b731',1:'#ff6b6b'}[m.align];
      det.innerHTML='<strong style="color:'+ac+';">'+m.rmf+' ('+m.rmfName+') &harr; ISO 42001 Clause '+m.iso+' ('+m.isoTitle+')</strong><br><br>'+m.note;
      det.style.color='#c9d1d9';
    }
  }
}
function initIso42001(){isoRender();}

// ===== AI RISK SCORECARD =====
var scorecardGrades=null;
function scorecardCalc(){
  var fnMap={GV:'GOVERN',MP:'MAP',MS:'MEASURE',MG:'MANAGE'};
  var fnColors={GV:'#0984e3',MP:'#f7b731',MS:'#ff6b6b',MG:'#51cf66'};
  var grades={};
  var topGaps=[];
  ['GV','MP','MS','MG'].forEach(function(fn){
    var cats=SUBCATS.filter(function(s){return s.fn===fn;});
    var total=cats.length;
    var pass=cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='pass';}).length;
    var partial=cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='partial';}).length;
    var fail=cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='fail';}).length;
    var unset=total-pass-partial-fail-cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='na';}).length;
    var score=(pass+partial*0.5)/(total-cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='na';}).length||1);
    var letter=score>=0.9?'A':score>=0.75?'B':score>=0.6?'C':score>=0.45?'D':'F';
    grades[fn]={letter:letter,score:Math.round(score*100),pass:pass,partial:partial,fail:fail,unset:unset,total:total,color:fnColors[fn],label:fnMap[fn]};
    // Find top gaps
    cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='fail'||!CHECKLIST_STATUS[s.id];}).slice(0,2).forEach(function(s){
      topGaps.push({fn:fn,id:s.id,name:s.name,status:CHECKLIST_STATUS[s.id]||'unset',color:fnColors[fn]});
    });
  });
  scorecardGrades=grades;
  if(typeof drawScorecard==='function')drawScorecard(grades);
  // Top gaps
  var gapsEl=document.getElementById('scorecard-gaps');
  if(gapsEl){
    gapsEl.style.display='block';
    topGaps=topGaps.slice(0,6);
    gapsEl.innerHTML='<strong style="color:#ff6b6b;">Top Gaps to Address:</strong><br>'+
      (topGaps.length?topGaps.map(function(g){
        return '<span style="color:'+g.color+';font-size:12px;">'+g.id+' ('+g.fn+'): '+g.name+' — '+g.status+'</span>';
      }).join('<br>'):'<span style="color:#51cf66;">No critical gaps identified. Well done!</span>');
  }
  // Board summary
  var sumEl=document.getElementById('scorecard-summary');
  if(sumEl){
    sumEl.style.display='block';
    var overallScore=Math.round(Object.values(grades).reduce(function(a,g){return a+g.score;},0)/4);
    var overallLetter=overallScore>=90?'A':overallScore>=75?'B':overallScore>=60?'C':overallScore>=45?'D':'F';
    var weakest=Object.entries(grades).sort(function(a,b){return a[1].score-b[1].score;})[0];
    sumEl.innerHTML='<strong style="color:#a29bfe;font-size:14px;">Board-Ready Summary</strong><br><br>'+
      'Overall AI RMF Implementation Score: <strong style="color:#c9d1d9;">'+overallScore+'% (Grade '+overallLetter+')</strong><br>'+
      'GOVERN: '+grades.GV.letter+' ('+grades.GV.score+'%) | '+
      'MAP: '+grades.MP.letter+' ('+grades.MP.score+'%) | '+
      'MEASURE: '+grades.MS.letter+' ('+grades.MS.score+'%) | '+
      'MANAGE: '+grades.MG.letter+' ('+grades.MG.score+'%)<br><br>'+
      'Lowest-performing function: <strong style="color:'+weakest[1].color+';">'+weakest[1].label+' ('+weakest[1].score+'%)</strong>. '+
      'Priority action: address '+weakest[1].fail+' failing and '+weakest[1].unset+' unassessed subcategories in this function.';
  }
}
function scorecardReset(){
  scorecardGrades=null;
  if(typeof drawScorecard==='function')drawScorecard(null);
  var gapsEl=document.getElementById('scorecard-gaps');
  if(gapsEl)gapsEl.style.display='none';
  var sumEl=document.getElementById('scorecard-summary');
  if(sumEl)sumEl.style.display='none';
}
function initScorecard(){if(typeof drawScorecard==='function')drawScorecard(null);}`;

// ===== APPLY TO BUILD1.JS =====
let b1 = fs.readFileSync('./build1.js', 'utf8');
b1 = b1.replace(/\r\n/g, '\n'); // normalize CRLF → LF

// 1. Nav items
b1 = b1.replace('</nav>', NAV_NEW_V4 + '\n</nav>');

// 2. HTML sections
b1 = b1.replace('</div><!-- /main -->', SECTIONS_V4 + '\n</div><!-- /main -->');

// 3. Update sectionIds
const OLD_IDS = "var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle','s-risk-flow','s-genai','s-subcats','s-maturity','s-crosswalk','s-cases','s-roadmap','s-tradeoffs','s-sectors','s-actors','s-quiz','s-classifier','s-sandbox','s-incident','s-frameworks','s-glossary','s-simulator','s-deepdive','s-policy','s-propagation','s-progression','s-orgchart','s-depmap','s-regmap','s-inventory','s-checklist','s-advisor','s-genai-wheel','s-tension','s-incidents','s-decision','s-stakeholder'];";
const NEW_IDS = "var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle','s-risk-flow','s-genai','s-subcats','s-maturity','s-crosswalk','s-cases','s-roadmap','s-tradeoffs','s-sectors','s-actors','s-quiz','s-classifier','s-sandbox','s-incident','s-frameworks','s-glossary','s-simulator','s-deepdive','s-policy','s-propagation','s-progression','s-orgchart','s-depmap','s-regmap','s-inventory','s-checklist','s-advisor','s-genai-wheel','s-tension','s-incidents','s-decision','s-stakeholder','s-costbenefit','s-impl-roadmap','s-vendor-q','s-charter','s-narrative','s-radar','s-iso42001','s-scorecard'];";
b1 = b1.replace(OLD_IDS, NEW_IDS);

// 4. Add JS before canvas injection boundary
// Use function replacement to avoid $' and $` special patterns in replacement string
const BOUNDARY = '</script>\n<script>\n/* CANVAS CODE INJECTED HERE */';
b1 = b1.replace(BOUNDARY, function(){ return JS_V4 + '\n' + BOUNDARY; });

fs.writeFileSync('./build1.js', b1, 'utf8');
console.log('build1.js updated:', b1.length, 'bytes');
