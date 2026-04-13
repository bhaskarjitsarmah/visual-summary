
var PG_PASSWORD='visual2025';
var PG_KEY='pg_unlocked_22';
function pgCheck(){
  var v=document.getElementById('pg-input').value.trim();
  if(v===PG_PASSWORD){localStorage.setItem(PG_KEY,'1');document.getElementById('pg-gate').style.display='none';}
  else{document.getElementById('pg-err').textContent='Incorrect password. Try again.';}
}
document.getElementById('pg-input').addEventListener('keydown',function(e){if(e.key==='Enter')pgCheck();});
if(localStorage.getItem(PG_KEY)==='1'){document.getElementById('pg-gate').style.display='none';}

var sectionIds=['s-overview','s-trustworthy','s-govern','s-map','s-measure','s-manage','s-lifecycle','s-risk-flow','s-genai','s-subcats','s-maturity','s-crosswalk','s-cases','s-roadmap','s-tradeoffs','s-sectors','s-actors','s-quiz','s-classifier','s-sandbox','s-incident','s-frameworks','s-glossary','s-simulator','s-deepdive','s-policy','s-propagation','s-progression','s-orgchart','s-depmap','s-regmap','s-inventory','s-checklist','s-advisor','s-genai-wheel','s-tension','s-incidents','s-decision','s-stakeholder'];
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
   desc:'Sets organizational culture, policies, roles, and accountability. GOVERN wraps all other functions — without it, risk management has no institutional backing.',
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
  {name:'Accountable\n& Transparent',color:'#6c5ce7',desc:'Organizations are answerable for AI outcomes. Stakeholders can access meaningful information about system purpose, design, and limitations.',example:'A hiring AI that discloses its decision factors to candidates.'},
  {name:'Explainable\n& Interpretable',color:'#0984e3',desc:'AI outputs can be explained in human-understandable terms. Users can understand, trust, and manage the system effectively.',example:'A loan model that outputs "declined: debt-to-income ratio too high."'},
  {name:'Privacy-\nEnhanced',color:'#00b894',desc:'Privacy protections built in by design: data minimization, purpose limitation, anonymization. Beyond compliance — proactive respect for autonomy.',example:'A medical AI trained on federated data that never centralizes records.'},
  {name:'Reliable',color:'#51cf66',desc:'Consistent and expected performance across contexts and over time. Includes accuracy, precision, and stability under distribution shift.',example:'A fraud model that maintains performance as transaction patterns evolve.'},
  {name:'Safe',color:'#f7b731',desc:'Does not cause unintended physical, psychological, financial, or societal harm. Considers misuse scenarios, not just correct-use failures.',example:'A clinical AI that flags its own uncertainty rather than confident wrong answers.'},
  {name:'Secure\n& Resilient',color:'#ff6b6b',desc:'Resists adversarial attacks (data poisoning, prompt injection, model inversion). Maintains core functionality under stress and recovers from failures.',example:'A content moderation system that remains effective against evasion attempts.'},
  {name:'Fair /\nBias Managed',color:'#fd79a8',desc:'Treats individuals and groups equitably. Actively identifies, measures, and mitigates harmful biases in data, models, and outputs.',example:'A recidivism model audited for equal false positive rates across groups.'}
];

// GOVERN nodes
var GOVERN_CATS=[
  {id:'root',label:'AI Risk\nGovernance',x:340,y:40,w:120,h:44,color:'#0984e3',parent:null,
   desc:'The overarching governance structure. Establishes that AI risk management is an organizational priority with executive sponsorship and dedicated resources.'},
  {id:'g1',label:'G1: Policies\n& Culture',x:80,y:130,w:110,h:44,color:'#6c5ce7',parent:'root',
   desc:'G1: Policies, processes, and practices across the organization related to AI risk management are established, documented, and communicated. Builds the cultural foundation.'},
  {id:'g2',label:'G2: Accountability',x:230,y:130,w:110,h:44,color:'#0984e3',parent:'root',
   desc:'G2: Roles, responsibilities, and authorities for AI risk management are defined, documented, and assigned. Clear ownership when things go wrong.'},
  {id:'g3',label:'G3: Workforce',x:380,y:130,w:110,h:44,color:'#00b894',parent:'root',
   desc:'G3: Organizational teams are committed to and equipped with appropriate training and skills for AI risk management. Diversity and inclusion in AI roles.'},
  {id:'g4',label:'G4: Team\nCommitment',x:510,y:130,w:110,h:44,color:'#51cf66',parent:'root',
   desc:'G4: Organizational teams are committed to a culture of risk management and are incentivized to identify and escalate AI risks rather than suppress them.'},
  {id:'g5',label:'G5: Risk\nPolicies',x:155,y:230,w:110,h:44,color:'#f7b731',parent:'g2',
   desc:'G5: Policies and procedures that manage AI risk are defined, communicated, and applied consistently across the organization and supply chain.'},
  {id:'g6',label:'G6: Human\nOversight',x:440,y:230,w:110,h:44,color:'#ff6b6b',parent:'g3',
   desc:'G6: Policies, processes, and procedures are in place for human oversight and intervention for AI systems, including escalation paths and shutdown procedures.'}
];

// MAP pipeline steps
var MAP_STEPS=[
  {label:'MAP 1\nContext',color:'#f7b731',
   desc:'Establish context: What is the AI system? What problem does it solve? Who built it, for whom, under what constraints? What data does it use and in what environment will it operate?',
   questions:['What is the intended purpose?','Who are the affected parties?','What data sources are used?','What regulatory context applies?']},
  {label:'MAP 2\nKnowledge',color:'#e67e22',
   desc:'Apply scientific and established knowledge. What do we know from research about risks in this domain? What have other deployments experienced? What are known failure modes?',
   questions:['What does research say about failure modes?','Are there analogous deployments to learn from?','What are known biases in this data type?','What external standards apply?']},
  {label:'MAP 3\nRisks &\nBenefits',color:'#e17055',
   desc:'Identify and catalogue AI risks AND benefits. Technical risks (model failures, adversarial attacks) and societal risks (bias, privacy, labor displacement) must both be mapped.',
   questions:['What technical risks exist?','What societal harms could occur?','What benefits does the system provide?','Who bears the risks vs. who gets the benefits?']},
  {label:'MAP 4\nPrioritize',color:'#d35400',
   desc:'Prioritize risks by likelihood and impact. Not all risks can be mitigated equally. Prioritization determines what MEASURE focuses on and what MANAGE addresses first.',
   questions:['What is the likelihood of each risk?','What is the severity if it occurs?','Which risks are most urgent to address?','What is the cost of mitigation vs. the cost of harm?']},
  {label:'MAP 5\nSocietal\nImpact',color:'#c0392b',
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
  {name:'Plan &\nDesign',color:'#6c5ce7',
   functions:['GOVERN','MAP'],
   actors:'AI developers, product managers, ethicists, legal',
   risks:'Scope creep, missing stakeholder input, unclear accountability, biased problem framing',
   detail:'Risk management starts before a line of code is written. GOVERN establishes ownership. MAP documents intended use, affected parties, and known risks in the problem domain.'},
  {name:'Data &\nDevelopment',color:'#0984e3',
   functions:['MAP','MEASURE'],
   actors:'Data scientists, ML engineers, data governance teams',
   risks:'Training data bias, data quality issues, model overfitting, privacy violations in data collection',
   detail:'MAP identifies data-related risks. MEASURE defines evaluation metrics and runs fairness, robustness, and privacy assessments before any deployment decision.'},
  {name:'Deployment',color:'#f7b731',
   functions:['GOVERN','MEASURE','MANAGE'],
   actors:'Deployment engineers, legal, compliance, communications',
   risks:'Integration failures, user over-reliance, deployment context mismatch, inadequate user training',
   detail:'GOVERN authorizes deployment against defined risk tolerance. MEASURE baselines initial production performance. MANAGE establishes monitoring and incident response plans.'},
  {name:'Operation &\nMonitoring',color:'#ff6b6b',
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
   action:'Output: Risk register entry — Algorithmic Bias, Likelihood: HIGH, Impact: HIGH, Category: MAP3/MAP5'},
  {fn:'MEASURE',title:'MEASURE: Quantify It',
   desc:'MS 1: Define metric — demographic parity ratio. MS 2: Evaluate on historical data. Result: female candidates selected at 0.62× the rate of male candidates for equivalent qualifications.',
   action:'Output: Fairness score 62% — below 80% threshold. Flagged for MANAGE intervention. MS 4: Report to leadership.'},
  {fn:'MANAGE',title:'MANAGE: Respond',
   desc:'MG 1: Treatment plan — Mitigate. MG 2: Remove gender-correlated proxy features, add human review for borderline candidates, implement fairness constraints in retraining. MG 3: Monthly fairness monitoring post-deployment.',
   action:'Output: Residual risk 74% parity after mitigation. Monthly review cadence set. Rollback plan documented.'},
  {fn:'GOVERN',title:'GOVERN: Institutionalize',
   desc:'G2: CHRO designated as accountability owner. G5: Policy updated — fairness testing required before any model update. G6: Human review layer made mandatory for any automated rejection decision.',
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
  {name:'Hallucination\n& Fabrication',color:'#ff6b6b',fn:'MAP+MEASURE',sev:4,
   desc:'LLMs generate plausible but factually incorrect outputs presented with apparent confidence.',
   mit:'Retrieval augmentation, fact-checking pipelines, uncertainty quantification, calibration training.'},
  {name:'Prompt\nInjection',color:'#e17055',fn:'MAP+MANAGE',sev:4,
   desc:'Malicious inputs hijack LLM behavior, bypassing safety controls or exfiltrating data.',
   mit:'Input sanitization, instruction hierarchy enforcement, output monitoring, sandboxed execution.'},
  {name:'Training Data\nPrivacy',color:'#6c5ce7',fn:'MAP+MEASURE',sev:4,
   desc:'LLMs may memorize and reproduce personal information from training data via extraction attacks.',
   mit:'Differential privacy, data minimization, membership inference testing, PII filtering.'},
  {name:'IP &\nCopyright',color:'#a29bfe',fn:'GOVERN+MAP',sev:3,
   desc:'GenAI may reproduce copyrighted material verbatim or generate infringing derivative works.',
   mit:'Training data licensing review, output filtering, provenance tracking, legal review process.'},
  {name:'CBRN\nHazards',color:'#fd79a8',fn:'GOVERN+MANAGE',sev:5,
   desc:'GenAI could generate information useful for chemical, biological, radiological, or nuclear harm.',
   mit:'Red-teaming for CBRN scenarios, strict output filtering, deployment restrictions, incident reporting.'},
  {name:'Data\nProvenance',color:'#00b894',fn:'MAP+MEASURE',sev:3,
   desc:'Unclear sourcing of training data makes it hard to assess bias, licensing, and quality risks.',
   mit:'Data lineage documentation, provenance tracking tools, supply chain audits.'},
  {name:'Output\nHomogenization',color:'#0984e3',fn:'MAP+MANAGE',sev:2,
   desc:'Widespread GenAI use may reduce diversity of thought, culture, and information in society.',
   mit:'Diversity-aware training, multiple model alternatives, human review requirements.'},
  {name:'Misinformation\nat Scale',color:'#f7b731',fn:'GOVERN+MANAGE',sev:4,
   desc:'GenAI enables synthetic media creation at scale, dramatically accelerating misinformation.',
   mit:'Watermarking, provenance standards, media literacy programs, platform-level policies.'},
  {name:'Human\nOver-reliance',color:'#51cf66',fn:'GOVERN+MAP',sev:3,
   desc:'Users defer excessively to GenAI outputs without critical evaluation in high-stakes contexts.',
   mit:'Uncertainty disclosure, calibrated confidence display, user training, human-in-the-loop design.'},
  {name:'Agentic\nSystem Risks',color:'#fd79a8',fn:'MAP+MEASURE+MANAGE',sev:4,
   desc:'Autonomous AI agents amplify risk: errors cascade across multi-step actions, oversight gaps emerge.',
   mit:'Human oversight checkpoints, action scope constraints, step-level logging, kill-switch mechanisms.'},
  {name:'AI Power\nConcentration',color:'#e17055',fn:'GOVERN+MAP',sev:3,
   desc:'GenAI capabilities concentrated in few organizations may distort markets and democratic institutions.',
   mit:'Governance policies on deployment scope, open model alternatives, regulatory engagement.'},
  {name:'Environmental\nImpact',color:'#00b894',fn:'GOVERN+MEASURE',sev:2,
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
  alert('Risk Register Export:\n\n'+lines.join('\n'));
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
    html+='<div style="display:flex;gap:12px;"><button class="btn" onclick="incidentNext(\'yes\')" style="background:#51cf66">'+node.yesLabel+'</button><button class="btn" onclick="incidentNext(\'no\')" style="background:#ff6b6b">'+node.noLabel+'</button></div>';
  } else if(node.type==='action'&&node.yes!==null){
    html+='<button class="btn" onclick="incidentNext(\'yes\')">'+node.yesLabel+'</button>';
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
  if(lbl)lbl.textContent=open?'Click to expand ↓':'Click to collapse ↑';
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
        html+='<button onclick="checkSet(''+s.id+'',''+v+'')" style="border:1px solid '+(active?colors[v]:'#30363d')+';background:'+(active?colors[v]+'22':'transparent')+';color:'+(active?colors[v]:'#8b949e')+';border-radius:4px;padding:2px 8px;cursor:pointer;font-size:11px;">'+labels[v]+'</button>';
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
}
