// =====================================================
// Blog 20 — Claude Managed Agents
// build2_inject.js — all canvas drawing + interactions
// =====================================================

var BG='#0d1117',SURF='#161b22',BORDER='#30363d',TEXT='#c9d1d9',MUTED='#8b949e';
var CYAN='#00b4d8',CYAN2='#38d9f5',PURPLE='#7c6af4',GREEN='#51cf66',AMBER='#f7b731',RED='#ff6b6b';

function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function drawRoundedRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);
  ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}
function drawArrow(ctx,x1,y1,x2,y2,color,size){
  size=size||8;
  var dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
  var nx=dx/len,ny=dy/len;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-size*nx+size*0.4*ny,y2-size*ny-size*0.4*nx);
  ctx.lineTo(x2-size*nx-size*0.4*ny,y2-size*ny+size*0.4*nx);ctx.closePath();
  ctx.fillStyle=color;ctx.fill();
}
function seededRand(seed){var x=Math.sin(seed)*10000;return x-Math.floor(x);}

// ================================================
// CANVAS 1: Agent Anatomy (s-overview)
// ================================================
var anatomyHovered=-1;
var ANATOMY_PARTS=[
  {label:'Model',sub:'claude-opus-4-6',color:PURPLE,x:60,y:50,w:140,h:60,desc:'<strong>Model</strong> — The LLM backbone. Any Claude model (Opus 4.6, Sonnet 4.6, Haiku 4.5). Stateless — reads the session event log and generates the next turn.'},
  {label:'System Prompt',sub:'Role + instructions',color:AMBER,x:60,y:130,w:140,h:60,desc:'<strong>System Prompt</strong> — Defines the agent\'s role, rules, and context. Injected at the start of every model call. Can reference environment variables for dynamic configuration.'},
  {label:'Tools',sub:'bash, files, search…',color:GREEN,x:240,y:50,w:140,h:60,desc:'<strong>Tools</strong> — Capabilities the agent can invoke: Bash, File I/O, Web Search, Web Fetch, Code Run, Screenshot. Declared in the Agent config; executed in the Environment.'},
  {label:'MCP Servers',sub:'Custom integrations',color:CYAN,x:240,y:130,w:140,h:60,desc:'<strong>MCP Servers</strong> — Model Context Protocol connectors. Any MCP-compatible service (databases, APIs, internal tools) can be wired in. Auth handled by the Vault+MCP proxy.'},
  {label:'Environment',sub:'Container template',color:'#f87171',x:420,y:50,w:140,h:60,desc:'<strong>Environment</strong> — The execution container. Defines filesystem, network policy, CPU/memory limits, installed runtimes. Reusable across agents.'},
  {label:'Session',sub:'Running instance',color:'#fb923c',x:420,y:130,w:140,h:60,desc:'<strong>Session</strong> — Combines Agent + Environment into a running instance. Owns the append-only event log. Lifecycle: created → running → paused → complete.'}
];

function drawAnatomyCanvas(){
  var c=document.getElementById('canvas-agent-anatomy');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  // Title
  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('AGENT BLUEPRINT',16,22);

  // Arrow from parts to "Agent" box
  var agentBoxX=590,agentBoxY=75,agentBoxW=90,agentBoxH=90;
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;ctx.setLineDash([4,3]);
  ANATOMY_PARTS.forEach(function(p,i){
    ctx.beginPath();ctx.moveTo(p.x+p.w,p.y+p.h/2);ctx.lineTo(agentBoxX,agentBoxY+agentBoxH/2);ctx.stroke();
  });
  ctx.setLineDash([]);

  // Draw parts
  ANATOMY_PARTS.forEach(function(p,i){
    var hov=anatomyHovered===i;
    ctx.fillStyle=hov?p.color+'22':SURF;
    drawRoundedRect(ctx,p.x,p.y,p.w,p.h,8);ctx.fill();
    ctx.strokeStyle=hov?p.color:BORDER;ctx.lineWidth=hov?1.5:1;
    drawRoundedRect(ctx,p.x,p.y,p.w,p.h,8);ctx.stroke();
    ctx.fillStyle=p.color;ctx.font='bold 11px Inter';ctx.textAlign='left';
    ctx.fillText(p.label,p.x+10,p.y+22);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';
    ctx.fillText(p.sub,p.x+10,p.y+40);
  });

  // Agent result box
  var grad=ctx.createLinearGradient(agentBoxX,agentBoxY,agentBoxX+agentBoxW,agentBoxY+agentBoxH);
  grad.addColorStop(0,CYAN+'44');grad.addColorStop(1,PURPLE+'44');
  ctx.fillStyle=grad;drawRoundedRect(ctx,agentBoxX,agentBoxY,agentBoxW,agentBoxH,10);ctx.fill();
  ctx.strokeStyle=CYAN;ctx.lineWidth=1.5;drawRoundedRect(ctx,agentBoxX,agentBoxY,agentBoxW,agentBoxH,10);ctx.stroke();
  ctx.fillStyle=CYAN2;ctx.font='bold 12px Inter';ctx.textAlign='center';
  ctx.fillText('AGENT',agentBoxX+agentBoxW/2,agentBoxY+38);
  ctx.fillStyle=MUTED;ctx.font='10px Inter';
  ctx.fillText('Blueprint',agentBoxX+agentBoxW/2,agentBoxY+54);
  ctx.fillText('registered',agentBoxX+agentBoxW/2,agentBoxY+68);
}

function initAnatomyHover(){
  var c=document.getElementById('canvas-agent-anatomy');
  if(!c)return;
  c.addEventListener('mousemove',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var prev=anatomyHovered;
    anatomyHovered=-1;
    ANATOMY_PARTS.forEach(function(p,i){
      if(mx>=p.x&&mx<=p.x+p.w&&my>=p.y&&my<=p.y+p.h)anatomyHovered=i;
    });
    if(anatomyHovered!==prev){
      drawAnatomyCanvas();
      var panel=document.getElementById('anatomy-detail');
      if(panel&&anatomyHovered>=0)panel.innerHTML=ANATOMY_PARTS[anatomyHovered].desc;
      else if(panel)panel.innerHTML='<strong>Hover a component</strong> to see what it does inside a Managed Agent.';
    }
  });
  c.addEventListener('mouseleave',function(){anatomyHovered=-1;drawAnatomyCanvas();});
  drawAnatomyCanvas();
}

// ================================================
// CANVAS 2: TTFT Performance Bar Chart
// ================================================
var ttftProgress=0,ttftRaf=null;
function animateTTFT(){
  var c=document.getElementById('canvas-ttft-perf');
  if(!c)return;
  if(ttftProgress>=1){drawTTFT(1);return;}
  ttftProgress+=0.018;
  drawTTFT(Math.min(ttftProgress,1));
  ttftRaf=requestAnimationFrame(animateTTFT);
}

function drawTTFT(prog){
  var c=document.getElementById('canvas-ttft-perf');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  var t=easeInOut(prog);
  var metrics=[
    {label:'Traditional Agent',p50:4.2,p95:18.0,color:'#64748b'},
    {label:'Managed Agent',p50:1.7,p95:1.8,color:CYAN}
  ];
  var maxVal=20;
  var barH=36,barGap=16,startX=200,barW=W-startX-40;
  var startY=40;

  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('TIME TO FIRST TOKEN (TTFT) — lower is better',16,22);

  // Grid lines
  [0,5,10,15,20].forEach(function(v){
    var x=startX+v/maxVal*barW;
    ctx.strokeStyle=BORDER;ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(x,30);ctx.lineTo(x,H-20);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
    ctx.fillText(v+'s',x,H-8);
  });

  metrics.forEach(function(m,mi){
    var yBase=startY+mi*(barH*2+barGap+20);

    // p50 bar
    var p50W=m.p50/maxVal*barW*t;
    ctx.fillStyle=m.color+'33';drawRoundedRect(ctx,startX,yBase,p50W,barH,4);ctx.fill();
    ctx.fillStyle=m.color;drawRoundedRect(ctx,startX,yBase,p50W,barH,4);ctx.stroke();
    ctx.fillStyle=SURF;drawRoundedRect(ctx,startX,yBase,p50W,barH,4);ctx.fill();
    var gr=ctx.createLinearGradient(startX,0,startX+p50W,0);
    gr.addColorStop(0,m.color+'88');gr.addColorStop(1,m.color);
    ctx.fillStyle=gr;drawRoundedRect(ctx,startX,yBase,p50W,barH,4);ctx.fill();

    ctx.fillStyle=TEXT;ctx.font='bold 11px Inter';ctx.textAlign='right';
    ctx.fillText(m.label,startX-10,yBase+22);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='right';
    ctx.fillText('p50 TTFT',startX-10,yBase+36);
    if(t>0.3){
      ctx.fillStyle=m.color;ctx.font='bold 11px Inter';ctx.textAlign='left';
      ctx.fillText(m.p50.toFixed(1)+'s',startX+p50W+6,yBase+22);
    }

    // p95 bar
    var p95W=m.p95/maxVal*barW*t;
    var y95=yBase+barH+8;
    ctx.fillStyle=SURF;drawRoundedRect(ctx,startX,y95,p95W,22,4);ctx.fill();
    var gr2=ctx.createLinearGradient(startX,0,startX+p95W,0);
    gr2.addColorStop(0,m.color+'55');gr2.addColorStop(1,m.color+'99');
    ctx.fillStyle=gr2;drawRoundedRect(ctx,startX,y95,p95W,22,4);ctx.fill();
    ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='right';
    ctx.fillText('p95 TTFT',startX-10,y95+14);
    if(t>0.3){
      ctx.fillStyle=m.color+'cc';ctx.font='bold 10px Inter';ctx.textAlign='left';
      ctx.fillText(m.p95.toFixed(1)+'s',startX+p95W+6,y95+14);
    }
  });

  // Delta labels
  if(t>0.8){
    ctx.fillStyle=GREEN;ctx.font='bold 11px Inter';ctx.textAlign='right';
    ctx.fillText('-60% p50',W-16,80);
    ctx.fillText('-90% p95',W-16,97);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';
    ctx.fillText('vs traditional',W-16,110);
  }
}

function initTTFT(){
  var c=document.getElementById('canvas-ttft-perf');
  if(!c)return;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(en){if(en.isIntersecting){ttftProgress=0;animateTTFT();obs.disconnect();}});
  },{threshold:0.3});
  obs.observe(c);
}

// ================================================
// CANVAS 3: Concepts Map (s-concepts)
// ================================================
var conceptsSelected=-1;
var CONCEPT_NODES=[
  {id:'agent',label:'Agent',sub:'Blueprint',color:PURPLE,x:160,y:140,r:48,
   desc:'<strong>Agent</strong> — A reusable configuration blueprint. Defines model, system prompt, tools, and MCP servers. Creating an Agent registers it; it does nothing until a Session is started from it. Think: class definition.'},
  {id:'environment',label:'Environment',sub:'Container',color:CYAN,x:350,y:60,r:48,
   desc:'<strong>Environment</strong> — A container template. Specifies what resources a session gets: filesystem layout, network policy, installed runtimes, CPU/memory limits. One Environment can be shared across many Sessions.'},
  {id:'session',label:'Session',sub:'Running instance',color:GREEN,x:540,y:140,r:48,
   desc:'<strong>Session</strong> — The live combination of Agent + Environment. Owns the append-only event log. Transitions through: created → running → paused → complete → failed. This is where computation happens.'},
  {id:'event',label:'Event',sub:'Message unit',color:AMBER,x:350,y:230,r:48,
   desc:'<strong>Event</strong> — The atomic unit of communication. Everything is an event: user messages, assistant turns, tool invocations, tool results, status changes. The event log is the single source of truth.'}
];
var CONCEPT_EDGES=[
  {from:0,to:2,label:'instantiates →'},
  {from:1,to:2,label:'hosts →'},
  {from:2,to:3,label:'produces →'},
  {from:3,to:0,label:'read by →'}
];

var conceptPulse=0;
function drawConceptsMap(prog){
  var c=document.getElementById('canvas-concepts-map');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();
  prog=prog===undefined?1:prog;
  conceptPulse=(conceptPulse+0.03)%1;

  // Edges
  CONCEPT_EDGES.forEach(function(e){
    var a=CONCEPT_NODES[e.from],b=CONCEPT_NODES[e.to];
    var dx=b.x-a.x,dy=b.y-a.y,dist=Math.sqrt(dx*dx+dy*dy);
    var nx=dx/dist,ny=dy/dist;
    var x1=a.x+nx*a.r,y1=a.y+ny*a.r,x2=b.x-nx*b.r*1.2,y2=b.y-ny*b.r*1.2;
    ctx.strokeStyle=BORDER;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    // Animated packet
    var tp=(conceptPulse+e.from*0.25)%1;
    var px=lerp(x1,x2,tp),py=lerp(y1,y2,tp);
    ctx.fillStyle=CONCEPT_NODES[e.from].color;
    ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();
    // Edge label
    var mx=(x1+x2)/2,my=(y1+y2)/2;
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
    ctx.fillText(e.label,mx,my-6);
  });

  // Nodes
  CONCEPT_NODES.forEach(function(n,i){
    var sel=conceptsSelected===i;
    var pulse=sel?(1+0.08*Math.sin(Date.now()*0.004)):1;
    ctx.globalAlpha=sel?1:0.92;
    // Glow
    if(sel){var grd=ctx.createRadialGradient(n.x,n.y,n.r*0.5,n.x,n.y,n.r*1.4);grd.addColorStop(0,n.color+'44');grd.addColorStop(1,'transparent');ctx.fillStyle=grd;ctx.beginPath();ctx.arc(n.x,n.y,n.r*1.4*pulse,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=sel?n.color+'33':SURF;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=sel?n.color:BORDER;ctx.lineWidth=sel?2:1.5;ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.stroke();
    ctx.globalAlpha=1;
    ctx.fillStyle=sel?n.color:TEXT;ctx.font='bold 12px Inter';ctx.textAlign='center';
    ctx.fillText(n.label,n.x,n.y+4);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';
    ctx.fillText(n.sub,n.x,n.y+18);
  });
}

var conceptsRaf=null;
function animateConceptsMap(){
  drawConceptsMap(1);
  conceptsRaf=requestAnimationFrame(animateConceptsMap);
}
function initConceptsMap(){
  var c=document.getElementById('canvas-concepts-map');
  if(!c)return;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var prev=conceptsSelected;
    conceptsSelected=-1;
    CONCEPT_NODES.forEach(function(n,i){
      var dx=mx-n.x,dy=my-n.y;
      if(Math.sqrt(dx*dx+dy*dy)<=n.r)conceptsSelected=i;
    });
    var panel=document.getElementById('concepts-detail');
    if(panel&&conceptsSelected>=0)panel.innerHTML=CONCEPT_NODES[conceptsSelected].desc;
    else if(panel)panel.innerHTML='<strong>Click a node</strong> to explore its role in the runtime.';
  });
  animateConceptsMap();
}

// ================================================
// CANVAS 4: Session Lifecycle (s-concepts)
// ================================================
var LC_STATES=['created','running','paused','complete','failed'];
var LC_COLORS=[CYAN,GREEN,AMBER,PURPLE,RED];
var LC_X=[80,210,340,470,600];
var LC_Y=90;
var lcActive=1; // default: running

function drawSessionLifecycle(){
  var c=document.getElementById('canvas-session-lifecycle');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  // Connecting arrows
  var transitions=[
    {from:0,to:1,label:'start()'},
    {from:1,to:2,label:'pause()'},
    {from:2,to:1,label:'resume()'},
    {from:1,to:3,label:'done'},
    {from:1,to:4,label:'error'}
  ];
  transitions.forEach(function(tr){
    var x1=LC_X[tr.from],x2=LC_X[tr.to];
    var y=LC_Y+(tr.to===4?30:0);
    var curved=tr.from===2&&tr.to===1;
    ctx.strokeStyle=BORDER;ctx.lineWidth=1.5;ctx.setLineDash([]);
    if(curved){
      ctx.beginPath();ctx.moveTo(x1-20,LC_Y-20);ctx.quadraticCurveTo((x1+x2)/2,LC_Y-50,x2+20,LC_Y-20);ctx.stroke();
      ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';ctx.fillText(tr.label,(x1+x2)/2,LC_Y-54);
    } else {
      var dir=x2>x1?1:-1;
      drawArrow(ctx,x1+dir*26,LC_Y+(tr.to===4?14:0),x2-dir*26,LC_Y+(tr.to===4?14:0),BORDER,6);
      ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
      ctx.fillText(tr.label,(x1+x2)/2,LC_Y+(tr.to===4?8:-6));
    }
  });

  // State nodes
  LC_STATES.forEach(function(s,i){
    var sel=lcActive===i;
    var x=LC_X[i];
    var pulse=sel?(1+0.06*Math.sin(Date.now()*0.005)):1;
    if(sel){var gr=ctx.createRadialGradient(x,LC_Y,10,x,LC_Y,32*pulse);gr.addColorStop(0,LC_COLORS[i]+'55');gr.addColorStop(1,'transparent');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(x,LC_Y,32*pulse,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle=sel?LC_COLORS[i]+'33':SURF;ctx.beginPath();ctx.arc(x,LC_Y,24,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=sel?LC_COLORS[i]:BORDER;ctx.lineWidth=sel?2:1;ctx.beginPath();ctx.arc(x,LC_Y,24,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=sel?LC_COLORS[i]:TEXT;ctx.font='bold 10px Inter';ctx.textAlign='center';
    ctx.fillText(s,x,LC_Y+4);
    if(sel){
      ctx.fillStyle=LC_COLORS[i];ctx.font='9px Inter';
      ctx.fillText('◀ active',x,LC_Y+38);
    }
  });
}

var lcRaf=null;
function animateLC(){drawSessionLifecycle();lcRaf=requestAnimationFrame(animateLC);}
function initSessionLifecycle(){
  var c=document.getElementById('canvas-session-lifecycle');
  if(!c)return;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    LC_STATES.forEach(function(s,i){
      var dx=mx-LC_X[i],dy=my-LC_Y;
      if(Math.sqrt(dx*dx+dy*dy)<=28){
        lcActive=i;
        var lbl=document.getElementById('lifecycle-label');
        var msgs=['Session created — environment provisioned, waiting to start.','Session running — model and tools are active, events flowing.','Session paused — state preserved, waiting for resume or approval.','Session complete — all turns finished, log is sealed.','Session failed — an unrecoverable error was encountered.'];
        if(lbl)lbl.textContent=msgs[i];
      }
    });
  });
  animateLC();
}

// ================================================
// CANVAS 5: Brain / Hands / Session Architecture (s-architecture)
// ================================================
var archSelected=-1;
var ARCH_PARTS=[
  {label:'Brain',sub:'Stateless Model Harness',color:PURPLE,x:40,y:100,w:180,h:160,
   desc:'<strong>Brain — Stateless Model Harness</strong><br><br>Reads the session event log, runs the LLM, emits assistant_turn events with text and tool_use blocks. Completely stateless — no session data stored here. Can be scaled horizontally. If a Brain instance crashes, the next one picks up from the same log with no data loss.'},
  {label:'Hands',sub:'Execution Environment',color:GREEN,x:260,y:100,w:180,h:160,
   desc:'<strong>Hands — Execution Environment</strong><br><br>An isolated container that executes tool calls. Runs Bash, file ops, web fetch, MCP servers. Writes tool_result events back to the log. Each session gets its own fresh container — complete isolation. The Brain never directly touches the Hands.'},
  {label:'Session Log',sub:'Append-Only Event Ledger',color:AMBER,x:480,y:100,w:180,h:160,
   desc:'<strong>Session Log — Append-Only Event Ledger</strong><br><br>The single source of truth. Both Brain and Hands read from it and write to it. Durable, queryable, resumable. Because it\'s append-only, you get a complete audit trail and can replay or resume sessions from any point. This decoupling is what enables -60%/-90% TTFT improvements.'}
];

var archPackets=[];
function initArchPackets(){
  archPackets=[];
  for(var i=0;i<6;i++){
    archPackets.push({x:130,y:260,tx:0,ty:0,phase:i*0.2,color:PURPLE,route:0,t:seededRand(i)*0.5});
  }
}

function drawArchBHS(){
  var c=document.getElementById('canvas-arch-bhs');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  // Title
  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('MANAGED AGENT RUNTIME ARCHITECTURE',16,22);

  // Bidirectional arrows between boxes
  var connectors=[
    {x1:220,y1:180,x2:260,y2:180,label:'reads log\nwrites turns',color:PURPLE},
    {x1:440,y1:180,x2:480,y2:180,label:'reads log\nwrites results',color:GREEN}
  ];
  connectors.forEach(function(con){
    // Double-headed arrow
    drawArrow(ctx,con.x1,con.y1,con.x2,con.y2,con.color,6);
    drawArrow(ctx,con.x2,con.y1+16,con.x1,con.y1+16,con.color,6);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
    var lines=con.label.split('\n');
    lines.forEach(function(l,i){ctx.fillText(l,(con.x1+con.x2)/2,con.y1-12+i*12);});
  });

  // Component boxes
  ARCH_PARTS.forEach(function(p,i){
    var sel=archSelected===i;
    ctx.fillStyle=sel?p.color+'22':SURF;
    drawRoundedRect(ctx,p.x,p.y,p.w,p.h,10);ctx.fill();
    ctx.strokeStyle=sel?p.color:BORDER;ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,p.x,p.y,p.w,p.h,10);ctx.stroke();

    // Icon band at top
    ctx.fillStyle=p.color+'22';drawRoundedRect(ctx,p.x,p.y,p.w,36,10);ctx.fill();
    ctx.fillStyle=p.color+'22';ctx.fillRect(p.x,p.y+20,p.w,16);
    ctx.fillStyle=p.color;ctx.font='bold 13px Inter';ctx.textAlign='center';
    ctx.fillText(p.label,p.x+p.w/2,p.y+24);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';
    ctx.fillText(p.sub,p.x+p.w/2,p.y+50);

    // Internal bullets
    var bullets=[
      ['Reads event log','Calls LLM','Emits turns'],
      ['Runs tools','File / shell / web','Writes results'],
      ['Append-only','Durable+queryable','Resumable']
    ];
    bullets[i].forEach(function(b,j){
      ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
      ctx.fillText('• '+b,p.x+14,p.y+75+j*18);
    });

    // Scale indicator
    var scaleLabels=['Scales horizontally','Scales per session','Scales with storage'];
    ctx.fillStyle=p.color;ctx.font='9px Inter';ctx.textAlign='center';
    ctx.fillText(scaleLabels[i],p.x+p.w/2,p.y+p.h-10);
  });

  // Animated event packets flowing
  var now=Date.now()*0.001;
  // Brain → Log
  var t1=(now*0.3)%1;
  var px=lerp(ARCH_PARTS[0].x+ARCH_PARTS[0].w,ARCH_PARTS[2].x,t1);
  var py=ARCH_PARTS[0].y+80;
  ctx.globalAlpha=0.8;
  ctx.fillStyle=PURPLE;ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();
  // Hands → Log
  var t2=(now*0.3+0.5)%1;
  var px2=lerp(ARCH_PARTS[1].x+ARCH_PARTS[1].w,ARCH_PARTS[2].x,t2);
  var py2=ARCH_PARTS[1].y+100;
  ctx.fillStyle=GREEN;ctx.beginPath();ctx.arc(px2,py2,4,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;

  // Bottom labels
  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='center';
  ctx.fillText('Stateless — can crash+restart',ARCH_PARTS[0].x+ARCH_PARTS[0].w/2,H-12);
  ctx.fillText('Isolated per session',ARCH_PARTS[1].x+ARCH_PARTS[1].w/2,H-12);
  ctx.fillText('Single source of truth',ARCH_PARTS[2].x+ARCH_PARTS[2].w/2,H-12);
}

var archRaf=null;
function animateArchBHS(){drawArchBHS();archRaf=requestAnimationFrame(animateArchBHS);}
function initArchBHS(){
  var c=document.getElementById('canvas-arch-bhs');
  if(!c)return;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var prev=archSelected;
    archSelected=-1;
    ARCH_PARTS.forEach(function(p,i){
      if(mx>=p.x&&mx<=p.x+p.w&&my>=p.y&&my<=p.y+p.h)archSelected=i;
    });
    var panel=document.getElementById('arch-detail');
    if(panel&&archSelected>=0)panel.innerHTML=ARCH_PARTS[archSelected].desc;
    else if(panel)panel.innerHTML='<strong>Click a component</strong> to see its responsibilities and scaling properties.';
  });
  animateArchBHS();
}

// ================================================
// CANVAS 6: Event Loop (s-event-loop)
// ================================================
var EL_STEPS=[
  {label:'user_message',color:CYAN,x:60,y:160,w:120},
  {label:'assistant_turn\n+ tool_use',color:PURPLE,x:220,y:160,w:120},
  {label:'tool_result',color:GREEN,x:380,y:160,w:120},
  {label:'assistant_turn\n(final)',color:AMBER,x:540,y:160,w:120}
];
var elCurrentStep=-1,elPaused=false,elPackets=[];

function resetEventLoop(){
  elCurrentStep=-1;elPaused=false;elPackets=[];
  clearEventFeed();
  addEventFeedLine('session.created','{ id: "sess_01", status: "running" }',CYAN);
  runEventLoopStep(0);
}
function pauseEventLoop(){
  elPaused=!elPaused;
  var btn=document.getElementById('btn-pause-loop');
  if(btn)btn.textContent=elPaused?'▶ Resume':'⏸ Pause';
}
function runEventLoopStep(step){
  if(elPaused||step>=EL_STEPS.length)return;
  elCurrentStep=step;
  setTimeout(function(){
    var s=EL_STEPS[step];
    var types=['user_message','assistant_turn + tool_use calls','tool_result','assistant_turn (complete)'];
    var data=[
      '{ content: "Review this PR..." }',
      '{ text: "Looking at the diff...", tool_use: [bash] }',
      '{ tool_use_id: "tu_1", content: "14 passed 0 failed" }',
      '{ text: "All tests pass. LGTM." }'
    ];
    addEventFeedLine(types[step],data[step],s.color);
    if(step===EL_STEPS.length-1){
      setTimeout(function(){addEventFeedLine('status_change','{ new_status: "complete" }',GREEN);},600);
    } else {
      runEventLoopStep(step+1);
    }
  },900);
}

var elFeedLines=[];
function clearEventFeed(){
  elFeedLines=[];
  var feed=document.getElementById('event-feed');
  if(feed){feed.innerHTML='';}
}
function addEventFeedLine(type,data,color){
  var feed=document.getElementById('event-feed');
  if(!feed)return;
  var now=new Date();
  var ts='00:0'+Math.floor(elFeedLines.length*1.2).toString().padStart(2,'0');
  var line=document.createElement('div');
  line.className='event-line';
  line.innerHTML='<span class="event-ts">'+ts+' </span><span class="event-type" style="color:'+color+'">'+type+' </span><span class="event-data">'+data+'</span>';
  feed.appendChild(line);
  feed.scrollTop=feed.scrollHeight;
  elFeedLines.push({type:type,data:data,color:color});
}

function drawEventLoop(){
  var c=document.getElementById('canvas-event-loop');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('SESSION EVENT LOOP',16,22);

  // Connecting lines
  for(var i=0;i<EL_STEPS.length-1;i++){
    var s=EL_STEPS[i],ns=EL_STEPS[i+1];
    drawArrow(ctx,s.x+s.w,s.y+26,ns.x,ns.y+26,elCurrentStep>i?s.color:BORDER,7);
  }

  // Return arrow at bottom
  ctx.strokeStyle=BORDER;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
  ctx.beginPath();
  ctx.moveTo(EL_STEPS[EL_STEPS.length-1].x+EL_STEPS[EL_STEPS.length-1].w+10,EL_STEPS[0].y+50);
  ctx.lineTo(EL_STEPS[EL_STEPS.length-1].x+EL_STEPS[EL_STEPS.length-1].w+10,H-30);
  ctx.lineTo(EL_STEPS[0].x-10,H-30);
  ctx.lineTo(EL_STEPS[0].x-10,EL_STEPS[0].y+50);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
  ctx.fillText('loop continues until complete/paused/failed',W/2,H-14);

  // Step boxes
  EL_STEPS.forEach(function(s,i){
    var active=elCurrentStep===i;
    var done=elCurrentStep>i;
    var col=done||active?s.color:BORDER;
    ctx.fillStyle=active?s.color+'33':(done?s.color+'11':SURF);
    drawRoundedRect(ctx,s.x,s.y,s.w,52,8);ctx.fill();
    ctx.strokeStyle=col;ctx.lineWidth=active?2:1;
    drawRoundedRect(ctx,s.x,s.y,s.w,52,8);ctx.stroke();
    ctx.fillStyle=active?s.color:TEXT;ctx.font='bold 10px Inter';ctx.textAlign='center';
    var lines=s.label.split('\n');
    lines.forEach(function(l,j){ctx.fillText(l,s.x+s.w/2,s.y+18+j*14);});
    if(done){ctx.fillStyle=GREEN;ctx.font='12px Inter';ctx.fillText('✓',s.x+s.w-14,s.y+14);}

    // Event log indicator
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
    ctx.fillText('→ event log',s.x+s.w/2,s.y+70);
    // Arrow down to log bar
    ctx.strokeStyle=done||active?col:BORDER;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(s.x+s.w/2,s.y+52);ctx.lineTo(s.x+s.w/2,s.y+58);ctx.stroke();
  });

  // Event log bar
  ctx.fillStyle=BG;drawRoundedRect(ctx,40,230,W-80,28,6);ctx.fill();
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;drawRoundedRect(ctx,40,230,W-80,28,6);ctx.stroke();
  ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='left';ctx.fillText('APPEND-ONLY EVENT LOG',52,248);
  // Filled segments
  EL_STEPS.forEach(function(s,i){
    if(elCurrentStep>=i){
      var segW=(W-80)/EL_STEPS.length-4;
      var segX=44+(i*(segW+4));
      ctx.fillStyle=s.color+'55';drawRoundedRect(ctx,segX,232,segW,24,4);ctx.fill();
      ctx.fillStyle=s.color;ctx.font='8px Inter';ctx.textAlign='center';
      ctx.fillText(['msg','turn','result','done'][i],segX+segW/2,248);
    }
  });
}

var elRaf=null;
function animateEventLoop(){drawEventLoop();elRaf=requestAnimationFrame(animateEventLoop);}
function initEventLoop(){
  var c=document.getElementById('canvas-event-loop');
  if(!c)return;
  clearEventFeed();
  addEventFeedLine('session.created','{ id: "sess_01", agent: "code-reviewer" }',CYAN);
  animateEventLoop();
}

// ================================================
// CANVAS 7: Multi-Agent Thread (s-multiagent)
// ================================================
var maPhase=0,maRaf=null,maRunning=false;
var MA_AGENTS=[
  {label:'Orchestrator',color:CYAN,x:30,y:150,w:140,h:60},
  {label:'Researcher',color:GREEN,x:250,y:60,w:130,h:50},
  {label:'Analyst',color:AMBER,x:250,y:150,w:130,h:50},
  {label:'Summarizer',color:PURPLE,x:250,y:240,w:130,h:50}
];
var maEvents=[];
var maEventLog=[];
var maFinalResult=false;

function startMultiAgent(){
  maPhase=0;maEvents=[];maEventLog=[];maFinalResult=false;maRunning=true;
  runMAPhase();
}
function resetMultiAgent(){
  maPhase=0;maEvents=[];maEventLog=[];maFinalResult=false;maRunning=false;
}
function runMAPhase(){
  if(!maRunning)return;
  if(maPhase===0){
    maEventLog.push({text:'user_message → "Research quantum computing trends"',color:CYAN});
    maPhase=1;setTimeout(function(){maEventLog.push({text:'assistant_turn → dispatching 3 agent_use calls',color:PURPLE});maPhase=2;setTimeout(runMAPhase,700);},700);
  } else if(maPhase===2){
    maEvents.push({agent:1,t:0,done:false,result:'Found 12 papers on QEC'});
    maEvents.push({agent:2,t:0,done:false,result:'Trend: error-rate -40% YoY'});
    maEvents.push({agent:3,t:0,done:false,result:'Summary ready'});
    maPhase=3;
  } else if(maPhase===4){
    maEventLog.push({text:'agent_result × 3 events received',color:GREEN});
    maPhase=5;setTimeout(function(){maEventLog.push({text:'assistant_turn → synthesizing final response',color:AMBER});maFinalResult=true;maPhase=6;},900);
  }
}

function drawMultiThread(){
  var c=document.getElementById('canvas-multi-thread');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('MULTI-AGENT ORCHESTRATION',16,22);

  // Animate sub-agent progress
  if(maPhase>=3){
    maEvents.forEach(function(ev){
      if(!ev.done){ev.t=Math.min(ev.t+0.012,1);if(ev.t>=1)ev.done=true;}
    });
    if(maEvents.length&&maEvents.every(function(e){return e.done;})&&maPhase===3){maPhase=4;runMAPhase();}
  }

  // Draw agent boxes
  MA_AGENTS.forEach(function(ag,i){
    var active=i>0&&maPhase>=2;
    var done=i>0&&maEvents[i-1]&&maEvents[i-1].done;
    ctx.fillStyle=active?ag.color+'22':SURF;
    drawRoundedRect(ctx,ag.x,ag.y,ag.w,ag.h,8);ctx.fill();
    ctx.strokeStyle=done?GREEN:(active?ag.color:BORDER);ctx.lineWidth=active?1.5:1;
    drawRoundedRect(ctx,ag.x,ag.y,ag.w,ag.h,8);ctx.stroke();
    ctx.fillStyle=active?ag.color:TEXT;ctx.font='bold 11px Inter';ctx.textAlign='center';
    ctx.fillText(ag.label,ag.x+ag.w/2,ag.y+22);
    if(i===0){
      ctx.fillStyle=MUTED;ctx.font='9px Inter';
      ctx.fillText('Session',ag.x+ag.w/2,ag.y+37);
      ctx.fillText('#main',ag.x+ag.w/2,ag.y+50);
    } else {
      var ev=maEvents[i-1];
      if(ev){
        // Progress bar
        var bx=ag.x+8,by=ag.y+32,bw=(ag.w-16)*ev.t;
        ctx.fillStyle=BORDER;drawRoundedRect(ctx,bx,by,ag.w-16,8,3);ctx.fill();
        ctx.fillStyle=ev.done?GREEN:ag.color;drawRoundedRect(ctx,bx,by,bw,8,3);ctx.fill();
        if(ev.done){ctx.fillStyle=GREEN;ctx.font='9px Inter';ctx.textAlign='center';ctx.fillText(ev.result,ag.x+ag.w/2,ag.y+50);}
      } else {
        ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
        ctx.fillText('waiting...',ag.x+ag.w/2,ag.y+37);
      }
    }
  });

  // Connecting lines from orchestrator to sub-agents
  MA_AGENTS.slice(1).forEach(function(ag,i){
    var orch=MA_AGENTS[0];
    var active=maPhase>=2;
    ctx.strokeStyle=active?MA_AGENTS[i+1].color:BORDER;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(orch.x+orch.w,orch.y+30);ctx.lineTo(ag.x,ag.y+25);ctx.stroke();
    // Return arrow
    if(maEvents[i]&&maEvents[i].done){
      drawArrow(ctx,ag.x,ag.y+35,orch.x+orch.w,orch.y+40,GREEN,6);
    }
  });

  // Result box
  if(maFinalResult){
    var rx=430,ry=130,rw=240,rh=100;
    ctx.fillStyle=GREEN+'22';drawRoundedRect(ctx,rx,ry,rw,rh,10);ctx.fill();
    ctx.strokeStyle=GREEN;ctx.lineWidth=1.5;drawRoundedRect(ctx,rx,ry,rw,rh,10);ctx.stroke();
    ctx.fillStyle=GREEN;ctx.font='bold 11px Inter';ctx.textAlign='center';
    ctx.fillText('✓ Orchestration Complete',rx+rw/2,ry+24);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';
    ctx.fillText('3 subagent sessions ran in',rx+rw/2,ry+44);
    ctx.fillText('parallel — results merged',rx+rw/2,ry+58);
    ctx.fillStyle=CYAN;ctx.font='9px Inter';
    ctx.fillText('Total: 3 child sessions · 3 event logs',rx+rw/2,ry+82);
  }

  // Event log panel
  var logX=430,logY=40,logW=240,logH=85;
  if(!maFinalResult){
    ctx.fillStyle=BG;drawRoundedRect(ctx,logX,logY,logW,logH,8);ctx.fill();
    ctx.strokeStyle=BORDER;ctx.lineWidth=1;drawRoundedRect(ctx,logX,logY,logW,logH,8);ctx.stroke();
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='left';
    ctx.fillText('Orchestrator Event Log',logX+8,logY+14);
    maEventLog.forEach(function(ev,i){
      ctx.fillStyle=ev.color;ctx.font='9px JetBrains Mono,monospace';
      ctx.fillText(ev.text.substring(0,36),logX+8,logY+28+i*14);
    });
  }
}

var maAnimRaf=null;
function animateMultiAgent(){drawMultiThread();maAnimRaf=requestAnimationFrame(animateMultiAgent);}
function initMultiAgent(){var c=document.getElementById('canvas-multi-thread');if(!c)return;animateMultiAgent();}

// ================================================
// CANVAS 8: Security Model (s-tools)
// ================================================
var secSelected=-1;
var SEC_LAYERS=[
  {label:'API Gateway',sub:'Rate limits · Auth header',color:CYAN,x:40,y:40,w:620,h:36,
   desc:'<strong>API Gateway</strong> — First line of defense. Validates the x-api-key header, enforces per-workspace rate limits (60 session creates/min, 600 event reads/min), and blocks oversized payloads. All traffic is TLS 1.3.'},
  {label:'Session Boundary',sub:'One container per session · No cross-session filesystem access',color:AMBER,x:40,y:100,w:620,h:36,
   desc:'<strong>Session Boundary</strong> — Each session runs in its own container. Filesystem namespaces prevent cross-session access. A compromised session cannot read another session\'s files, environment variables, or credentials.'},
  {label:'Vault + MCP Proxy',sub:'Scoped tokens · No master credentials in container',color:GREEN,x:40,y:160,w:620,h:36,
   desc:'<strong>Vault + MCP Proxy</strong> — Credentials are never injected into the container directly. The proxy mediates all auth: the agent requests access to a resource, the policy engine evaluates the request, and issues a short-lived scoped token. The container never sees master credentials.'},
  {label:'Resource Limits',sub:'cgroup CPU/memory caps · 30s tool timeout · SIGKILL on breach',color:PURPLE,x:40,y:220,w:620,h:36,
   desc:'<strong>Resource Limits</strong> — cgroup v2 enforces hard CPU, memory, and disk I/O limits per session. Tools have a 30-second execution timeout. Exceeding limits triggers SIGKILL on the offending process; a tool_result error event is written, and the session continues.'}
];

function drawSecurityModel(){
  var c=document.getElementById('canvas-security-model');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('SECURITY LAYERS — click to inspect',16,22);

  SEC_LAYERS.forEach(function(l,i){
    var sel=secSelected===i;
    ctx.fillStyle=sel?l.color+'22':l.color+'0d';
    drawRoundedRect(ctx,l.x,l.y,l.w,l.h,6);ctx.fill();
    ctx.strokeStyle=sel?l.color:BORDER;ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,l.x,l.y,l.w,l.h,6);ctx.stroke();
    ctx.fillStyle=sel?l.color:TEXT;ctx.font='bold 11px Inter';ctx.textAlign='left';
    ctx.fillText(l.label,l.x+12,l.y+16);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';
    ctx.fillText(l.sub,l.x+12,l.y+28);
    // Right indicator
    ctx.fillStyle=l.color;ctx.font='10px Inter';ctx.textAlign='right';
    ctx.fillText(sel?'▼ details':'▶',l.x+l.w-12,l.y+16);
  });

  // Agent core in center bottom
  var acX=240,acY=270,acW=220,acH=40;
  ctx.fillStyle=CYAN+'22';drawRoundedRect(ctx,acX,acY,acW,acH,8);ctx.fill();
  ctx.strokeStyle=CYAN;ctx.lineWidth=1.5;drawRoundedRect(ctx,acX,acY,acW,acH,8);ctx.stroke();
  ctx.fillStyle=CYAN2;ctx.font='bold 11px Inter';ctx.textAlign='center';
  ctx.fillText('Agent Session (Isolated Container)',acX+acW/2,acY+24);
}

function initSecurityModel(){
  var c=document.getElementById('canvas-security-model');
  if(!c)return;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var prev=secSelected;
    secSelected=-1;
    SEC_LAYERS.forEach(function(l,i){
      if(mx>=l.x&&mx<=l.x+l.w&&my>=l.y&&my<=l.y+l.h)secSelected=i;
    });
    var panel=document.getElementById('security-detail');
    if(panel&&secSelected>=0)panel.innerHTML=SEC_LAYERS[secSelected].desc;
    else if(panel)panel.innerHTML='<strong>Click a security layer</strong> to learn how it protects the host system.';
  });
  drawSecurityModel();
}

// ================================================
// CANVAS 9: API Flow (s-api)
// ================================================
var API_STEPS=[
  {label:'Create Agent',sub:'POST /v1/beta/agents',color:PURPLE},
  {label:'Create Env',sub:'POST /v1/beta/environments',color:CYAN},
  {label:'Start Session',sub:'POST /v1/beta/sessions',color:GREEN},
  {label:'Send Message',sub:'POST …/events',color:AMBER},
  {label:'Stream Results',sub:'GET …/events?stream',color:RED}
];
var apiFlowStep=-1,apiFlowRaf=null,apiFlowRunning=false;

function runApiFlow(){
  apiFlowStep=-1;apiFlowRunning=true;
  stepApiFlow();
}
function resetApiFlow(){
  apiFlowStep=-1;apiFlowRunning=false;
  var lbl=document.getElementById('api-step-label');
  if(lbl)lbl.textContent='Click "Run Steps" to walk through the API flow';
}
function stepApiFlow(){
  if(!apiFlowRunning)return;
  apiFlowStep++;
  if(apiFlowStep>=API_STEPS.length){apiFlowRunning=false;return;}
  var lbl=document.getElementById('api-step-label');
  var msgs=[
    'Step 1 — Register your agent blueprint with model, system prompt, and tools.',
    'Step 2 — Create a reusable container template with resource limits.',
    'Step 3 — Combine Agent + Environment into a live session instance.',
    'Step 4 — Post a user_message event to start the agent working.',
    'Step 5 — Stream all session events via SSE; read assistant turns and tool results.'
  ];
  if(lbl)lbl.textContent=msgs[apiFlowStep];
  setTimeout(stepApiFlow,1200);
}

function drawApiFlow(){
  var c=document.getElementById('canvas-api-flow');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  var boxW=110,boxH=60,gapX=(W-80-boxW*API_STEPS.length)/(API_STEPS.length-1);
  var startX=40,startY=(H-boxH)/2;

  API_STEPS.forEach(function(s,i){
    var x=startX+i*(boxW+gapX);
    var active=apiFlowStep===i,done=apiFlowStep>i;
    // Arrow
    if(i>0){
      var px=x-gapX;
      drawArrow(ctx,px+boxW,startY+boxH/2,x,startY+boxH/2,done||active?API_STEPS[i-1].color:BORDER,6);
    }
    ctx.fillStyle=active?s.color+'33':(done?s.color+'11':SURF);
    drawRoundedRect(ctx,x,startY,boxW,boxH,8);ctx.fill();
    ctx.strokeStyle=done||active?s.color:BORDER;ctx.lineWidth=active?2:1;
    drawRoundedRect(ctx,x,startY,boxW,boxH,8);ctx.stroke();
    ctx.fillStyle=active?s.color:TEXT;ctx.font='bold 10px Inter';ctx.textAlign='center';
    ctx.fillText(s.label,x+boxW/2,startY+22);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';
    ctx.fillText(s.sub,x+boxW/2,startY+36);
    if(done){ctx.fillStyle=GREEN;ctx.font='11px Inter';ctx.fillText('✓',x+boxW-14,startY+14);}
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
    ctx.fillText('Step '+(i+1),x+boxW/2,startY+boxH+14);
  });
}

var apiFlowAnimRaf=null;
function animateApiFlow(){drawApiFlow();apiFlowAnimRaf=requestAnimationFrame(animateApiFlow);}
function initApiFlow(){var c=document.getElementById('canvas-api-flow');if(!c)return;animateApiFlow();}

// ================================================
// CANVAS: Cost Calculator (s-overview)
// ================================================
function updateCostCalc(){
  var sessions=parseInt(document.getElementById('sl-sessions').value)||50;
  var duration=parseInt(document.getElementById('sl-duration').value)||5;
  var tokens=parseInt(document.getElementById('sl-tokens').value)||10000;
  document.getElementById('val-sessions').textContent=sessions;
  document.getElementById('val-duration').textContent=duration+' min';
  document.getElementById('val-tokens').textContent=tokens>=1000?(tokens/1000).toFixed(0)+'k':tokens;
  drawCostCalc(sessions,duration,tokens);
}

function drawCostCalc(sessions,duration,tokens){
  var c=document.getElementById('canvas-cost-calc');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  // Calculations
  var runtimeHrsMonth=(sessions*duration/60)*30;
  var runtimeCost=runtimeHrsMonth*0.08;
  // Claude Sonnet: ~$3/M input + $15/M output → avg ~$9/M, split 60/40
  var modelCost=(sessions*tokens/1000000)*9*30;
  var managedTotal=runtimeCost+modelCost;
  // Self-hosted: EC2 t3.large $0.083/hr running same hours + $300/mo ops overhead
  var selfInfra=runtimeHrsMonth*0.083;
  var selfOps=300; // monthly DevOps / maintenance
  var selfTotal=selfInfra+selfOps;

  var maxCost=Math.max(managedTotal,selfTotal,20)*1.25;
  var barW=100,barGap=60,baseY=H-40,maxBarH=150;
  var group1X=80,group2X=380;

  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('ESTIMATED MONTHLY COST — '+sessions+' sessions/day · '+duration+'min avg · '+(tokens/1000).toFixed(0)+'k tokens/session',16,20);

  // Grid lines
  [0,0.25,0.5,0.75,1].forEach(function(f){
    var y=baseY-f*maxBarH;
    var val=f*maxCost;
    ctx.strokeStyle=BORDER;ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(50,y);ctx.lineTo(W-20,y);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='right';
    ctx.fillText('$'+Math.round(val),46,y+4);
  });

  function drawBar(x,h,color,label,val,sublabel){
    var bh=Math.min((h/maxCost)*maxBarH,maxBarH);
    var gr=ctx.createLinearGradient(0,baseY-bh,0,baseY);
    gr.addColorStop(0,color);gr.addColorStop(1,color+'88');
    ctx.fillStyle=gr;
    drawRoundedRect(ctx,x,baseY-bh,barW,bh,4);ctx.fill();
    ctx.fillStyle=color;ctx.font='bold 11px Inter';ctx.textAlign='center';
    if(bh>20)ctx.fillText('$'+Math.round(val),x+barW/2,baseY-bh-6);
    ctx.fillStyle=TEXT;ctx.font='bold 10px Inter';
    ctx.fillText(label,x+barW/2,baseY+14);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';
    ctx.fillText(sublabel,x+barW/2,baseY+26);
  }

  // Managed Agents: stacked runtime + model
  var rhModel=(modelCost/maxCost)*maxBarH;
  var rhRuntime=(runtimeCost/maxCost)*maxBarH;
  var gr1=ctx.createLinearGradient(0,baseY-rhModel-rhRuntime,0,baseY);
  gr1.addColorStop(0,PURPLE);gr1.addColorStop(1,PURPLE+'88');
  ctx.fillStyle=gr1;drawRoundedRect(ctx,group1X,baseY-rhModel-rhRuntime,barW,rhModel,4);ctx.fill();
  var gr2=ctx.createLinearGradient(0,baseY-rhRuntime,0,baseY);
  gr2.addColorStop(0,CYAN);gr2.addColorStop(1,CYAN+'88');
  ctx.fillStyle=gr2;drawRoundedRect(ctx,group1X,baseY-rhRuntime,barW,rhRuntime,4);ctx.fill();
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;drawRoundedRect(ctx,group1X,baseY-rhModel-rhRuntime,barW,rhModel+rhRuntime,4);ctx.stroke();
  ctx.fillStyle=TEXT;ctx.font='bold 10px Inter';ctx.textAlign='center';
  ctx.fillText('Managed Agents',group1X+barW/2,baseY+14);
  ctx.fillStyle=CYAN;ctx.font='9px Inter';
  ctx.fillText('$'+Math.round(managedTotal)+'/mo total',group1X+barW/2,baseY+26);

  // Legend for stacked
  ctx.fillStyle=PURPLE+'cc';drawRoundedRect(ctx,group1X,baseY+35,10,10,2);ctx.fill();
  ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='left';ctx.fillText('Model tokens $'+Math.round(modelCost),group1X+13,baseY+44);
  ctx.fillStyle=CYAN+'cc';drawRoundedRect(ctx,group1X,baseY+48,10,10,2);ctx.fill();
  ctx.fillText('Runtime $'+Math.round(runtimeCost),group1X+13,baseY+57);

  // Self-hosted: stacked infra + ops
  var rhInfra=(selfInfra/maxCost)*maxBarH;
  var rhOps=(selfOps/maxCost)*maxBarH;
  var gr3=ctx.createLinearGradient(0,baseY-rhOps-rhInfra,0,baseY);
  gr3.addColorStop(0,'#f97316');gr3.addColorStop(1,'#f9731688');
  ctx.fillStyle=gr3;drawRoundedRect(ctx,group2X,baseY-rhOps-rhInfra,barW,rhOps,4);ctx.fill();
  var gr4=ctx.createLinearGradient(0,baseY-rhInfra,0,baseY);
  gr4.addColorStop(0,RED);gr4.addColorStop(1,RED+'88');
  ctx.fillStyle=gr4;drawRoundedRect(ctx,group2X,baseY-rhInfra,barW,rhInfra,4);ctx.fill();
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;drawRoundedRect(ctx,group2X,baseY-rhOps-rhInfra,barW,rhOps+rhInfra,4);ctx.stroke();
  ctx.fillStyle=TEXT;ctx.font='bold 10px Inter';ctx.textAlign='center';
  ctx.fillText('Self-Hosted DIY',group2X+barW/2,baseY+14);
  ctx.fillStyle=RED;ctx.font='9px Inter';
  ctx.fillText('$'+Math.round(selfTotal)+'/mo total',group2X+barW/2,baseY+26);

  ctx.fillStyle='#f97316cc';drawRoundedRect(ctx,group2X,baseY+35,10,10,2);ctx.fill();
  ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='left';ctx.fillText('Ops overhead $'+selfOps+'/mo',group2X+13,baseY+44);
  ctx.fillStyle=RED+'cc';drawRoundedRect(ctx,group2X,baseY+48,10,10,2);ctx.fill();
  ctx.fillText('EC2/container $'+Math.round(selfInfra),group2X+13,baseY+57);

  // Savings callout
  var saving=selfTotal-managedTotal;
  if(saving>0){
    ctx.fillStyle=GREEN+'22';drawRoundedRect(ctx,group2X+barW+20,baseY-80,160,56,8);ctx.fill();
    ctx.strokeStyle=GREEN;ctx.lineWidth=1;drawRoundedRect(ctx,group2X+barW+20,baseY-80,160,56,8);ctx.stroke();
    ctx.fillStyle=GREEN;ctx.font='bold 12px Inter';ctx.textAlign='center';
    ctx.fillText('Save $'+Math.round(saving)+'/mo',group2X+barW+100,baseY-58);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';
    ctx.fillText('with Managed Agents',group2X+barW+100,baseY-44);
    ctx.fillText('vs self-hosting',group2X+barW+100,baseY-32);
  }

  // Update detail panel
  var panel=document.getElementById('cost-detail');
  if(panel)panel.innerHTML='<strong style="color:'+CYAN+'">Managed Agents: $'+Math.round(managedTotal)+'/mo</strong> ($'+Math.round(runtimeCost)+' runtime + $'+Math.round(modelCost)+' model tokens) &nbsp;|&nbsp; <strong style="color:'+RED+'">Self-hosted: $'+Math.round(selfTotal)+'/mo</strong> ($'+Math.round(selfInfra)+' EC2 + $'+selfOps+' ops). &nbsp; Token pricing based on Claude Sonnet 4.6 avg $9/M tokens. Self-hosted ops assumes $300/mo maintenance baseline.';
}

function initCostCalc(){
  updateCostCalc();
}

// ================================================
// CANVAS: Prompt Wall (s-why-managed)
// ================================================
var pwStep=-1,pwRunning=false,pwRaf=null;
var PW_TURNS=[
  {label:'Turn 1',trad:60,managed:60,tradColor:AMBER,desc:'Turn 1 — both send roughly the same size prompt. No difference yet.'},
  {label:'Turn 2',trad:180,managed:70,tradColor:AMBER,desc:'Turn 2 — traditional agent re-sends Turn 1 history + new message (3x bigger). Managed Agent sends only the new event.'},
  {label:'Turn 3',trad:340,managed:80,tradColor:'#f97316',desc:'Turn 3 — traditional prompt is now 5x larger than Managed. Latency climbing fast. Tool results included repeatedly.'},
  {label:'Turn 4',trad:520,managed:85,tradColor:RED,desc:'Turn 4 — traditional agent re-sends everything again. You\'re paying for tokens you already paid for in turns 1-3.'},
  {label:'Turn 5',trad:700,managed:90,tradColor:RED,desc:'Turn 5 — traditional prompt hits context limit. Task FAILS. Managed Agent is barely growing — only new events each turn.'}
];

function resetPromptWall(){
  pwStep=-1;pwRunning=false;
  var panel=document.getElementById('prompt-wall-detail');
  if(panel)panel.innerHTML='<strong>Click "Watch it grow"</strong> — see how traditional agents re-send the full history every turn, while Managed Agents only send new events.';
  drawPromptWall(0);
}
function runPromptWall(){
  if(pwRunning)return;
  pwRunning=true;
  pwStep=0;
  stepPromptWall();
}
function stepPromptWall(){
  if(!pwRunning||pwStep>=PW_TURNS.length){pwRunning=false;return;}
  var panel=document.getElementById('prompt-wall-detail');
  if(panel)panel.innerHTML='<span style="color:'+PW_TURNS[pwStep].tradColor+'"><strong>'+PW_TURNS[pwStep].label+'</strong></span> — '+PW_TURNS[pwStep].desc;
  animatePromptWallStep(pwStep,function(){
    pwStep++;
    setTimeout(stepPromptWall,600);
  });
}

var pwBarProgress=[];
function animatePromptWallStep(step,cb){
  var target=PW_TURNS[step];
  var startTrad=pwBarProgress[step]?pwBarProgress[step].trad:0;
  var startManaged=pwBarProgress[step]?pwBarProgress[step].managed:0;
  var t=0;
  function tick(){
    t=Math.min(t+0.06,1);
    var et=easeInOut(t);
    pwBarProgress[step]={trad:lerp(startTrad,target.trad,et),managed:lerp(startManaged,target.managed,et)};
    drawPromptWall(step+1);
    if(t<1)requestAnimationFrame(tick);
    else if(cb)cb();
  }
  tick();
}

function drawPromptWall(upToStep){
  var c=document.getElementById('canvas-prompt-wall');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  var maxH=180,maxTokens=700;
  var colW=55,gap=18;
  var groupW=colW*2+gap;
  var totalW=PW_TURNS.length*(groupW+24);
  var startX=(W-totalW)/2+12;
  var baseY=H-50;

  // Labels at top
  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='center';
  ctx.fillText('TOKENS SENT PER TURN — growing = more cost + latency',W/2,18);

  // Legend
  var legX=W-220,legY=30;
  ctx.fillStyle=AMBER+'cc';drawRoundedRect(ctx,legX,legY,14,14,2);ctx.fill();
  ctx.fillStyle=TEXT;ctx.font='10px Inter';ctx.textAlign='left';ctx.fillText('Traditional agent',legX+18,legY+11);
  ctx.fillStyle=CYAN+'cc';drawRoundedRect(ctx,legX,legY+18,14,14,2);ctx.fill();
  ctx.fillStyle=TEXT;ctx.fillText('Managed agent',legX+18,legY+29);

  PW_TURNS.forEach(function(turn,i){
    var gx=startX+i*(groupW+24);
    var prog=pwBarProgress[i]||{trad:0,managed:0};
    var show=i<upToStep;

    // Traditional bar
    var tradH=show?(prog.trad/maxTokens)*maxH:0;
    var tradColor=turn.tradColor;
    if(show){
      var gr=ctx.createLinearGradient(0,baseY-tradH,0,baseY);
      gr.addColorStop(0,tradColor);gr.addColorStop(1,tradColor+'66');
      ctx.fillStyle=gr;
      drawRoundedRect(ctx,gx,baseY-tradH,colW,tradH,4);ctx.fill();
      // Token count
      if(tradH>16){ctx.fillStyle=TEXT;ctx.font='bold 9px Inter';ctx.textAlign='center';ctx.fillText(Math.round(prog.trad)+'t',gx+colW/2,baseY-tradH-4);}
    } else {
      ctx.fillStyle=BORDER;drawRoundedRect(ctx,gx,baseY-10,colW,10,2);ctx.fill();
    }

    // Managed bar
    var managedH=show?(prog.managed/maxTokens)*maxH:0;
    if(show){
      var gr2=ctx.createLinearGradient(0,baseY-managedH,0,baseY);
      gr2.addColorStop(0,CYAN);gr2.addColorStop(1,CYAN+'66');
      ctx.fillStyle=gr2;
      drawRoundedRect(ctx,gx+colW+gap,baseY-managedH,colW,managedH,4);ctx.fill();
      if(managedH>16){ctx.fillStyle=TEXT;ctx.font='bold 9px Inter';ctx.textAlign='center';ctx.fillText(Math.round(prog.managed)+'t',gx+colW+gap+colW/2,baseY-managedH-4);}
    } else {
      ctx.fillStyle=BORDER;drawRoundedRect(ctx,gx+colW+gap,baseY-10,colW,10,2);ctx.fill();
    }

    // Turn label
    ctx.fillStyle=i<upToStep?TEXT:MUTED;ctx.font='9px Inter';ctx.textAlign='center';
    ctx.fillText(turn.label,gx+groupW/2,baseY+14);
  });

  // Context limit wall
  var wallY=baseY-maxH;
  ctx.strokeStyle=RED+'aa';ctx.lineWidth=1.5;ctx.setLineDash([5,3]);
  ctx.beginPath();ctx.moveTo(startX-10,wallY);ctx.lineTo(W-20,wallY);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle=RED;ctx.font='bold 9px Inter';ctx.textAlign='right';
  ctx.fillText('Context Limit — task fails here',W-22,wallY-4);

  // Base line
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(startX-10,baseY+1);ctx.lineTo(W-20,baseY+1);ctx.stroke();

  // Arrow annotation for Turn 5 if shown
  if(upToStep>=5){
    var lastGx=startX+4*(groupW+24);
    ctx.strokeStyle=RED;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(lastGx+colW/2,wallY+4);ctx.lineTo(lastGx+colW/2,wallY+20);ctx.stroke();
    ctx.fillStyle=RED;ctx.font='bold 9px Inter';ctx.textAlign='center';
    ctx.fillText('FAILS',lastGx+colW/2,wallY+32);
    ctx.fillStyle=CYAN;
    ctx.fillText('still growing',lastGx+colW+gap+colW/2,baseY-(pwBarProgress[4]?pwBarProgress[4].managed/maxTokens*maxH:0)-14);
  }
}

function initPromptWall(){
  drawPromptWall(0);
}

// ================================================
// CANVAS: Infrastructure Compare (s-why-managed)
// ================================================
var infraSelected=-1;
var INFRA_ROWS=[
  {label:'Session State',icon:'&#128196;',
   self:'Build a database (Redis/Postgres). Write schema for conversation history. Handle TTL, cleanup jobs, concurrent writes, re-read on every turn.',
   managed:'Anthropic stores the append-only event log. You query it with a simple API call. No database to provision or maintain.',
   selfColor:'#f87171',managedColor:GREEN},
  {label:'Tool Execution',icon:'&#128187;',
   self:'Spin up a VM or container. Install runtimes (Python, Node, etc). Handle network policy, filesystem sandboxing, and cleanup after each run.',
   managed:'Each session gets an isolated container from your Environment template. Anthropic spins it up, manages isolation, tears it down.',
   selfColor:'#f87171',managedColor:GREEN},
  {label:'Session Lifecycle',icon:'&#9881;',
   self:'Write pause/resume logic. Handle timeouts. Store "paused" state in your DB. Build human-approval hooks from scratch.',
   managed:'Sessions have a first-class lifecycle API: created, running, paused, complete, failed. Pause/resume with a single API call.',
   selfColor:'#f87171',managedColor:GREEN},
  {label:'Multi-Agent',icon:'&#129302;',
   self:'Build your own orchestrator. Manage child agent state, fan-out, fan-in, failure propagation, result aggregation — all custom code.',
   managed:'Declare callable_agents in your Agent config. The runtime dispatches, waits for all results, routes them back as events.',
   selfColor:'#f87171',managedColor:GREEN},
  {label:'Credential Security',icon:'&#128274;',
   self:'Build a vault or inject secrets as env vars. Risk: secrets leak through shell history, logs, or container dumps.',
   managed:'Vault+MCP proxy mediates all auth. Agent never sees master credentials — only scoped short-lived tokens per resource.',
   selfColor:'#f87171',managedColor:GREEN}
];

function drawInfraCompare(){
  var c=document.getElementById('canvas-infra-compare');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  var rowH=58,rowY=46,colMid=W/2;

  // Column headers
  ctx.fillStyle=RED+'cc';ctx.font='bold 11px Inter';ctx.textAlign='center';
  ctx.fillText('WITHOUT Managed Agents — You Build',colMid/2,22);
  ctx.fillStyle=GREEN;
  ctx.fillText('WITH Managed Agents — Anthropic Handles',colMid+colMid/2,22);

  // Divider
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(colMid,30);ctx.lineTo(colMid,H-10);ctx.stroke();

  INFRA_ROWS.forEach(function(row,i){
    var y=rowY+i*(rowH+8);
    var sel=infraSelected===i;

    // Row background
    if(sel){
      ctx.fillStyle=CYAN+'11';
      drawRoundedRect(ctx,10,y-4,W-20,rowH+2,6);ctx.fill();
    }

    // Left: self-managed
    ctx.fillStyle=sel?'#f8717133':RED+'11';
    drawRoundedRect(ctx,14,y,colMid-24,rowH,6);ctx.fill();
    ctx.strokeStyle=sel?RED:BORDER;ctx.lineWidth=sel?1.5:1;
    drawRoundedRect(ctx,14,y,colMid-24,rowH,6);ctx.stroke();

    // Right: managed
    ctx.fillStyle=sel?GREEN+'33':GREEN+'11';
    drawRoundedRect(ctx,colMid+10,y,colMid-24,rowH,6);ctx.fill();
    ctx.strokeStyle=sel?GREEN:BORDER;ctx.lineWidth=sel?1.5:1;
    drawRoundedRect(ctx,colMid+10,y,colMid-24,rowH,6);ctx.stroke();

    // Row label (center)
    ctx.fillStyle=TEXT;ctx.font='bold 10px Inter';ctx.textAlign='center';
    ctx.fillText(row.label,colMid,y+rowH/2-4);
    ctx.fillStyle=MUTED;ctx.font='10px Inter';
    ctx.fillText(row.icon,colMid,y+rowH/2+10);

    // Left text
    ctx.fillStyle=RED;ctx.font='9px Inter';ctx.textAlign='left';
    var leftLines=wrapText(ctx,row.self,22,colMid-30,rowH-10);
    leftLines.forEach(function(l,j){ctx.fillText(l,22,y+12+j*13);});

    // Right: checkmark + short label
    ctx.fillStyle=GREEN;ctx.font='9px Inter';ctx.textAlign='left';
    ctx.fillText('✓ Handled',colMid+18,y+18);
    ctx.fillStyle=MUTED;ctx.font='9px Inter';
    var rightLines=wrapText(ctx,row.managed.split('.')[0]+'.',colMid+18,colMid-32,rowH-24);
    rightLines.forEach(function(l,j){ctx.fillText(l,colMid+18,y+32+j*12);});
  });
}

function wrapText(ctx,text,x,maxW,maxH){
  var words=text.split(' ');
  var lines=[],line='';
  var maxLines=Math.floor(maxH/13);
  words.forEach(function(w){
    var test=line?line+' '+w:w;
    if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w;}
    else line=test;
  });
  if(line)lines.push(line);
  return lines.slice(0,maxLines);
}

function initInfraCompare(){
  var c=document.getElementById('canvas-infra-compare');
  if(!c)return;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var prev=infraSelected;
    infraSelected=-1;
    var rowH=58,rowY=46;
    INFRA_ROWS.forEach(function(row,i){
      var y=rowY+i*(rowH+8);
      if(my>=y-4&&my<=y+rowH+2)infraSelected=i;
    });
    var panel=document.getElementById('infra-compare-detail');
    if(panel&&infraSelected>=0){
      var r=INFRA_ROWS[infraSelected];
      panel.innerHTML='<strong style="color:'+r.selfColor+'">Without: </strong>'+r.self+'<br><br><strong style="color:'+r.managedColor+'">With Managed Agents: </strong>'+r.managed;
    } else if(panel){
      panel.innerHTML='<strong>Click any row</strong> to see what building it yourself looks like vs what Anthropic handles for you.';
    }
    drawInfraCompare();
  });
  drawInfraCompare();
}

// ================================================
// CANVAS: Use Case Explorer (s-usecases)
// ================================================
var selectedUsecase=0;
var USECASES=[
  {name:'Code Reviewer',color:CYAN,
   tools:['bash','files','web_search'],
   toolColors:[GREEN,AMBER,PURPLE],
   events:[
     {type:'user_message',color:CYAN,label:'user_message',detail:'"Review PR #142 — payment refactor"'},
     {type:'tool_use',color:GREEN,label:'tool_use: bash',detail:'git diff main..feature/payment-refactor'},
     {type:'tool_result',color:GREEN,label:'tool_result',detail:'+847 lines changed, 12 files'},
     {type:'tool_use',color:GREEN,label:'tool_use: bash',detail:'pytest tests/payment/ -v --tb=short'},
     {type:'tool_result',color:GREEN,label:'tool_result',detail:'14 passed, 2 failed — test_refund_edge_case'},
     {type:'tool_use',color:AMBER,label:'tool_use: files',detail:'read src/payment/refund.py'},
     {type:'tool_result',color:AMBER,label:'tool_result',detail:'Line 84: unhandled exception on negative amount'},
     {type:'assistant_turn',color:PURPLE,label:'assistant_turn',detail:'Found 2 issues: unhandled exception (line 84) + missing idempotency key. Approval: REQUEST CHANGES'}
   ],
   summary:'8 events · bash + files · ~2 min session · catches bugs traditional review misses'},
  {name:'Research Agent',color:PURPLE,
   tools:['web_search','web_fetch','files'],
   toolColors:[CYAN,AMBER,GREEN],
   events:[
     {type:'user_message',color:CYAN,label:'user_message',detail:'"Briefing on quantum error correction trends 2025-26"'},
     {type:'tool_use',color:CYAN,label:'tool_use: web_search',detail:'quantum error correction breakthroughs 2026'},
     {type:'tool_result',color:CYAN,label:'tool_result',detail:'12 results: Nature, arXiv, IBM Research blog…'},
     {type:'tool_use',color:AMBER,label:'tool_use: web_fetch',detail:'fetch nature.com/articles/qec-2026'},
     {type:'tool_result',color:AMBER,label:'tool_result',detail:'Error rates -40% YoY, surface codes dominant'},
     {type:'tool_use',color:GREEN,label:'tool_use: files',detail:'write briefing_draft.md'},
     {type:'tool_result',color:GREEN,label:'tool_result',detail:'File written: 1,240 words'},
     {type:'assistant_turn',color:PURPLE,label:'assistant_turn',detail:'Briefing complete: 5 key trends, 3 leading labs, 2 open problems. File saved.'}
   ],
   summary:'8 events · web_search + web_fetch + files · ~4 min session · synthesizes across sources'},
  {name:'Data Analyst',color:AMBER,
   tools:['files','code','bash'],
   toolColors:[CYAN,GREEN,AMBER],
   events:[
     {type:'user_message',color:CYAN,label:'user_message',detail:'"Analyse sales_data.csv — top 5 products by revenue"'},
     {type:'tool_use',color:CYAN,label:'tool_use: files',detail:'read /workspace/sales_data.csv'},
     {type:'tool_result',color:CYAN,label:'tool_result',detail:'5,000 rows · columns: product, revenue, date, region'},
     {type:'tool_use',color:GREEN,label:'tool_use: code (python)',detail:'pandas groupby product, sum revenue, sort desc'},
     {type:'tool_result',color:GREEN,label:'tool_result',detail:'Widget A $2.1M, Widget B $1.8M, Widget C $1.4M…'},
     {type:'tool_use',color:AMBER,label:'tool_use: code (python)',detail:'matplotlib bar chart → save chart.png'},
     {type:'tool_result',color:AMBER,label:'tool_result',detail:'chart.png saved (640×480)'},
     {type:'assistant_turn',color:PURPLE,label:'assistant_turn',detail:'Top 5 products identified. Chart + summary table attached. Widget A leads by 17% margin.'}
   ],
   summary:'8 events · files + code · ~3 min session · full analysis without manual setup'},
  {name:'Support Bot',color:GREEN,
   tools:['files','web_search','agents'],
   toolColors:[AMBER,CYAN,PURPLE],
   events:[
     {type:'user_message',color:CYAN,label:'user_message',detail:'"Order #8821 not arrived — 3 weeks late"'},
     {type:'tool_use',color:AMBER,label:'tool_use: files',detail:'read orders_db.json WHERE id=8821'},
     {type:'tool_result',color:AMBER,label:'tool_result',detail:'Status: DELAYED · carrier: FedEx · last scan: 6 days ago'},
     {type:'tool_use',color:CYAN,label:'tool_use: web_search',detail:'FedEx service alerts northeast US April 2026'},
     {type:'tool_result',color:CYAN,label:'tool_result',detail:'Weather delay — 3-5 day backlog in NY region'},
     {type:'tool_use',color:PURPLE,label:'tool_use: agent (escalate)',detail:'callable_agent: refund-specialist { order_id: 8821 }'},
     {type:'tool_result',color:PURPLE,label:'tool_result (agent)',detail:'Specialist: refund approved $49.99 + $10 credit'},
     {type:'assistant_turn',color:GREEN,label:'assistant_turn',detail:'Delay confirmed (weather). Refund $49.99 + $10 credit issued. Estimated delivery: 2 days.'}
   ],
   summary:'8 events · files + web_search + callable_agent · ~1 min session · auto-escalation via multi-agent'}
];

function selectUsecase(i){
  selectedUsecase=i;
  document.querySelectorAll('#usecase-cards .tool-card').forEach(function(c,j){
    c.classList.toggle('active',j===i);
  });
  drawUsecaseFlow();
}

function drawUsecaseFlow(){
  var c=document.getElementById('canvas-usecase-flow');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  var uc=USECASES[selectedUsecase];

  // Title bar
  ctx.fillStyle=uc.color+'22';ctx.fillRect(0,0,W,34);
  ctx.fillStyle=uc.color;ctx.font='bold 12px Inter';ctx.textAlign='left';
  ctx.fillText('Event Flow: '+uc.name,14,22);

  // Tools badge row
  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='right';
  var tx=W-12;
  uc.tools.slice().reverse().forEach(function(t,i){
    var ri=uc.tools.length-1-i;
    var col=uc.toolColors[ri];
    var tw=ctx.measureText(t).width+16;
    ctx.fillStyle=col+'33';drawRoundedRect(ctx,tx-tw,8,tw,18,4);ctx.fill();
    ctx.fillStyle=col;ctx.fillText(t,tx-6,21);
    tx=tx-tw-6;
  });

  // Event flow — 8 events in 2 columns of 4
  var evW=320,evH=26,evGap=6,col1X=14,col2X=W/2+14;
  uc.events.forEach(function(ev,i){
    var col=i<4?0:1;
    var row=i%4;
    var ex=(col===0?col1X:col2X);
    var ey=46+row*(evH+evGap);

    ctx.fillStyle=ev.color+'18';drawRoundedRect(ctx,ex,ey,evW,evH,5);ctx.fill();
    ctx.strokeStyle=ev.color+'66';ctx.lineWidth=1;drawRoundedRect(ctx,ex,ey,evW,evH,5);ctx.stroke();

    // Event type badge
    ctx.fillStyle=ev.color;ctx.font='bold 9px Inter';ctx.textAlign='left';
    ctx.fillText(ev.label,ex+8,ey+10);

    // Connector dot
    ctx.fillStyle=ev.color;ctx.beginPath();ctx.arc(ex+8,ey+19,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=MUTED;ctx.font='9px Inter';
    ctx.fillText(ev.detail.substring(0,40)+(ev.detail.length>40?'…':''),ex+18,ey+21);

    // Arrow between rows
    if(row<3){
      ctx.strokeStyle=BORDER;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(ex+evW/2,ey+evH);ctx.lineTo(ex+evW/2,ey+evH+evGap);ctx.stroke();
    }
    // Connector between columns at row 3→4
    if(i===3){
      ctx.strokeStyle=BORDER;ctx.lineWidth=1;ctx.setLineDash([3,2]);
      ctx.beginPath();ctx.moveTo(col1X+evW,ey+evH/2);ctx.lineTo(col2X,46+evH/2);ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  // Summary
  ctx.fillStyle=uc.color+'22';ctx.fillRect(0,H-28,W,28);
  ctx.fillStyle=uc.color;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText(uc.summary,14,H-11);

  // Update detail panel
  var panel=document.getElementById('usecase-detail');
  if(panel)panel.innerHTML='<strong style="color:'+uc.color+'">'+uc.name+'</strong> — '+uc.summary;
}

function initUsecaseFlow(){
  selectUsecase(0);
}

// ================================================
// CANVAS: Session Replay (s-event-loop)
// ================================================
var REPLAY_EVENTS=[
  {type:'session.created',color:CYAN,ts:'00:00',tokens:0,
   detail:'session.created { id: "sess_csv_01", agent: "data-analyst", status: "running" }'},
  {type:'user_message',color:CYAN,ts:'00:01',tokens:42,
   detail:'user_message { content: "Analyse sales_data.csv and find the top 5 products by revenue" }'},
  {type:'assistant_turn',color:PURPLE,ts:'00:02',tokens:118,
   detail:'assistant_turn { text: "I\'ll start by reading the file to understand its structure.", tool_use: [files.read] }'},
  {type:'tool_use',color:GREEN,ts:'00:03',tokens:118,
   detail:'tool_use { name: "files", action: "read", path: "/workspace/sales_data.csv" }'},
  {type:'tool_result',color:GREEN,ts:'00:05',tokens:340,
   detail:'tool_result { content: "5000 rows, columns: product_id, product_name, revenue, date, region" }'},
  {type:'assistant_turn',color:PURPLE,ts:'00:06',tokens:420,
   detail:'assistant_turn { text: "File loaded. Running aggregation now.", tool_use: [code.python] }'},
  {type:'tool_use',color:AMBER,ts:'00:07',tokens:420,
   detail:'tool_use { name: "code", language: "python", code: "df.groupby(\'product_name\')[\'revenue\'].sum().nlargest(5)" }'},
  {type:'tool_result',color:AMBER,ts:'00:11',tokens:580,
   detail:'tool_result { content: "Widget A: $2.1M, Widget B: $1.8M, Widget C: $1.4M, Widget D: $0.9M, Widget E: $0.7M" }'},
  {type:'tool_use',color:AMBER,ts:'00:12',tokens:580,
   detail:'tool_use { name: "code", language: "python", code: "plt.bar(products, revenues); plt.savefig(\'chart.png\')" }'},
  {type:'tool_result',color:AMBER,ts:'00:15',tokens:620,
   detail:'tool_result { content: "chart.png saved (640x480px)" }'},
  {type:'assistant_turn',color:PURPLE,ts:'00:16',tokens:820,
   detail:'assistant_turn { text: "Analysis complete. Top 5 products identified. Widget A leads with $2.1M (+17% vs #2). Chart attached." }'},
  {type:'status_change',color:GREEN,ts:'00:17',tokens:820,
   detail:'status_change { previous_status: "running", new_status: "complete", total_events: 12 }'}
];

function scrubReplay(idx){
  idx=Math.max(0,Math.min(idx,REPLAY_EVENTS.length-1));
  drawSessionReplay(idx);
  var ev=REPLAY_EVENTS[idx];
  var panel=document.getElementById('replay-detail');
  if(panel){
    panel.innerHTML='<span style="color:'+ev.color+'">'+ev.type+'</span> &nbsp;|&nbsp; <span style="color:var(--muted)">t='+ev.ts+' &nbsp; tokens_so_far: '+ev.tokens+'</span><br><span style="color:#38d9f5">'+ev.detail+'</span>';
  }
}

function drawSessionReplay(currentIdx){
  var c=document.getElementById('canvas-session-replay');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  ctx.fillStyle=MUTED;ctx.font='10px Inter';ctx.textAlign='left';
  ctx.fillText('SESSION TIMELINE — drag scrubber below to travel through events',14,18);

  var n=REPLAY_EVENTS.length;
  var segW=(W-40)/n;
  var barY=36,barH=44;

  REPLAY_EVENTS.forEach(function(ev,i){
    var x=20+i*segW;
    var past=i<=currentIdx;
    ctx.fillStyle=past?ev.color+'cc':ev.color+'22';
    drawRoundedRect(ctx,x+1,barY,segW-2,barH,3);ctx.fill();
    if(i===currentIdx){
      ctx.strokeStyle=ev.color;ctx.lineWidth=2;
      drawRoundedRect(ctx,x+1,barY,segW-2,barH,3);ctx.stroke();
    }
    // Event type label (rotated-style: abbreviated)
    var abbr=['created','user','asst','tool','result','asst','tool','result','tool','result','asst','done'];
    ctx.fillStyle=past?'#fff':MUTED;ctx.font='8px Inter';ctx.textAlign='center';
    ctx.fillText(abbr[i]||ev.type.split('.')[0].substring(0,6),x+segW/2,barY+14);
    ctx.fillText(ev.ts,x+segW/2,barY+28);

    // Current cursor
    if(i===currentIdx){
      ctx.fillStyle=ev.color;
      ctx.beginPath();ctx.moveTo(x+segW/2-5,barY+barH+2);ctx.lineTo(x+segW/2+5,barY+barH+2);ctx.lineTo(x+segW/2,barY+barH+9);ctx.closePath();ctx.fill();
    }
  });

  // Token accumulation bar
  var tokBarY=105,tokBarH=14;
  var maxTok=REPLAY_EVENTS[REPLAY_EVENTS.length-1].tokens;
  var curTok=REPLAY_EVENTS[currentIdx].tokens;
  ctx.fillStyle=BG;drawRoundedRect(ctx,20,tokBarY,W-40,tokBarH,4);ctx.fill();
  ctx.strokeStyle=BORDER;ctx.lineWidth=1;drawRoundedRect(ctx,20,tokBarY,W-40,tokBarH,4);ctx.stroke();
  var filled=(curTok/maxTok)*(W-40);
  var tgr=ctx.createLinearGradient(20,0,20+filled,0);
  tgr.addColorStop(0,PURPLE);tgr.addColorStop(1,CYAN);
  ctx.fillStyle=tgr;drawRoundedRect(ctx,20,tokBarY,filled,tokBarH,4);ctx.fill();
  ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='left';
  ctx.fillText('Tokens in context: '+curTok,20,tokBarY+tokBarH+12);
  ctx.textAlign='right';
  ctx.fillText('Event '+currentIdx+' of '+(n-1),W-20,tokBarY+tokBarH+12);

  // Phase labels
  var phases=[{label:'Setup',x:20,w:segW*2},{label:'Read File',x:20+segW*2,w:segW*2},{label:'Analyse',x:20+segW*4,w:segW*4},{label:'Chart',x:20+segW*8,w:segW*2},{label:'Done',x:20+segW*10,w:segW*2}];
  phases.forEach(function(p){
    ctx.strokeStyle=BORDER;ctx.lineWidth=1;ctx.setLineDash([2,2]);
    ctx.beginPath();ctx.moveTo(p.x,barY+barH+14);ctx.lineTo(p.x+p.w,barY+barH+14);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle=MUTED;ctx.font='8px Inter';ctx.textAlign='center';
    ctx.fillText(p.label,p.x+p.w/2,barY+barH+25);
  });
}

function initSessionReplay(){
  scrubReplay(0);
}

// ================================================
// CANVAS: Agent Relationship (s-concepts)
// ================================================
var relSelected=-1;
var REL_NODES=[];

function buildRelNodes(){
  var cx=350;
  // Agent blueprint
  REL_NODES=[{id:'agent',type:'agent',label:'Agent',sub:'Blueprint',color:PURPLE,x:cx,y:60,r:36}];
  // Environment
  REL_NODES.push({id:'env',type:'env',label:'Environment',sub:'Container template',color:CYAN,x:cx+220,y:60,r:32});
  // 3 Sessions
  [cx-160,cx,cx+160].forEach(function(sx,i){
    REL_NODES.push({id:'sess'+i,type:'session',label:'Session '+(i+1),sub:'Running instance',color:GREEN,x:sx,y:175,r:30});
  });
  // Events under each session (3 per session)
  [cx-160,cx,cx+160].forEach(function(sx,si){
    var evColors=[AMBER,PURPLE,RED];
    var evLabels=['user_msg','tool_use','asst_turn'];
    [-30,0,30].forEach(function(dx,ei){
      REL_NODES.push({id:'ev'+si+'_'+ei,type:'event',label:evLabels[ei],sub:'',color:evColors[ei],x:sx+dx,y:268,r:14});
    });
  });
}

var relRaf=null,relPulse=0;
function drawAgentRelationship(){
  var c=document.getElementById('canvas-agent-relationship');
  if(!c)return;
  buildRelNodes();
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();
  relPulse=(relPulse||0)+0.04;

  // Cardinality labels
  ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='center';
  ctx.fillText('1 Agent → many Sessions',350,116);
  ctx.fillText('1 Environment → many Sessions',490,106);
  ctx.fillText('1 Session → many Events',350,228);

  // Draw edges: agent → sessions
  REL_NODES.filter(function(n){return n.type==='session';}).forEach(function(s){
    var a=REL_NODES[0];
    ctx.strokeStyle=BORDER;ctx.lineWidth=1.5;ctx.setLineDash([4,3]);
    ctx.beginPath();ctx.moveTo(a.x,a.y+a.r);ctx.lineTo(s.x,s.y-s.r);ctx.stroke();
    ctx.setLineDash([]);
  });
  // env → sessions
  REL_NODES.filter(function(n){return n.type==='session';}).forEach(function(s){
    var env=REL_NODES[1];
    ctx.strokeStyle=CYAN+'55';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(env.x,env.y+env.r);ctx.lineTo(s.x,s.y-s.r);ctx.stroke();
    ctx.setLineDash([]);
  });
  // session → events
  REL_NODES.filter(function(n){return n.type==='session';}).forEach(function(s,si){
    REL_NODES.filter(function(n){return n.id&&n.id.startsWith('ev'+si);}).forEach(function(ev){
      ctx.strokeStyle=BORDER;ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(s.x,s.y+s.r);ctx.lineTo(ev.x,ev.y-ev.r);ctx.stroke();
    });
  });

  // Draw all nodes
  REL_NODES.forEach(function(n,i){
    var sel=relSelected===i;
    var pulse=sel?(1+0.07*Math.sin(relPulse)):1;
    if(sel){
      var gr=ctx.createRadialGradient(n.x,n.y,n.r*0.4,n.x,n.y,n.r*1.6*pulse);
      gr.addColorStop(0,n.color+'44');gr.addColorStop(1,'transparent');
      ctx.fillStyle=gr;ctx.beginPath();ctx.arc(n.x,n.y,n.r*1.6*pulse,0,Math.PI*2);ctx.fill();
    }
    ctx.fillStyle=sel?n.color+'44':SURF;
    ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=sel?n.color:BORDER;ctx.lineWidth=sel?2:1;
    ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle=sel?n.color:TEXT;
    ctx.font='bold '+(n.type==='event'?'8':'10')+'px Inter';ctx.textAlign='center';
    ctx.fillText(n.label,n.x,n.y+(n.type==='event'?4:3));
    if(n.sub&&n.type!=='event'){ctx.fillStyle=MUTED;ctx.font='8px Inter';ctx.fillText(n.sub,n.x,n.y+14);}
  });

  // Legend
  [{color:PURPLE,label:'Agent'},{color:CYAN,label:'Environment'},{color:GREEN,label:'Session'},{color:AMBER,label:'Event'}].forEach(function(l,i){
    ctx.fillStyle=l.color+'cc';ctx.beginPath();ctx.arc(20,H-40+i*0,10,0,Math.PI*2);
    var lx=14+i*100;
    ctx.fillStyle=l.color;ctx.beginPath();ctx.arc(lx,H-14,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=MUTED;ctx.font='9px Inter';ctx.textAlign='left';ctx.fillText(l.label,lx+8,H-10);
  });
}

function animateRelationship(){drawAgentRelationship();relRaf=requestAnimationFrame(animateRelationship);}

var REL_DESCS={
  agent:'<strong>Agent (Blueprint)</strong> — 1 Agent definition can spawn unlimited Session instances. Change the Agent config once (swap model, update system prompt) and every future session inherits it. Like a class: define once, instantiate many times.',
  env:'<strong>Environment (Container Template)</strong> — 1 Environment is reusable across many Agents and Sessions. Set your filesystem layout, network policy, and resource limits once. Every session spawned with this Environment gets an identical fresh container.',
  session:'<strong>Session (Running Instance)</strong> — Each Session is fully isolated: its own container, its own event log, its own lifecycle. 1 Agent can have 100 concurrent Sessions — they never interfere. Crash one; the others keep running.',
  event:'<strong>Event (Atomic Message)</strong> — Every session produces an append-only stream of Events. Each Event is immutable once written. The model reads the event log as its context. You can query, stream, or replay events at any time.'
};

function initAgentRelationship(){
  var c=document.getElementById('canvas-agent-relationship');
  if(!c)return;
  buildRelNodes();
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    relSelected=-1;
    REL_NODES.forEach(function(n,i){
      var dx=mx-n.x,dy=my-n.y;
      if(Math.sqrt(dx*dx+dy*dy)<=n.r+4)relSelected=i;
    });
    var panel=document.getElementById('relationship-detail');
    if(panel&&relSelected>=0){
      var n=REL_NODES[relSelected];
      var key=n.type;
      panel.innerHTML=REL_DESCS[key]||'<strong>'+n.label+'</strong>';
    } else if(panel){
      panel.innerHTML='<strong>Click any node</strong> to understand the cardinality.';
    }
  });
  animateRelationship();
}

// ================================================
// CANVAS: Comparison Matrix (s-compare)
// ================================================
var compareSelected={row:-1,col:-1};
var COMPARE_COLS=['Managed\nAgents','LangChain\n/ Graph','AutoGen','DIY\nAPI'];
var COMPARE_COL_COLORS=[CYAN,AMBER,GREEN,MUTED];
var COMPARE_ROWS=[
  {label:'Persistent Session State',
   vals:[2,1,1,0],
   details:[
     'Append-only event log stored server-side. Query, stream, or resume from any point. Zero code required.',
     'Requires external store (Redis, Postgres). You write the schema, handle TTL, manage concurrent writes.',
     'Memory/context managed in-process. No built-in durable store — state lost on crash.',
     'Re-send full conversation history every turn. Your database, your problem.'
   ]},
  {label:'Isolated Execution Container',
   vals:[2,0,1,0],
   details:[
     'Every session gets a fresh isolated container from your Environment template. Anthropic manages provisioning and teardown.',
     'No built-in execution sandbox. Tools run in your application process — a runaway tool can crash your app.',
     'Docker integration available but manual. You provision, configure, and clean up containers yourself.',
     'No isolation. Tool execution happens wherever your code runs — full blast radius on failure.'
   ]},
  {label:'Multi-Agent Orchestration',
   vals:[2,2,2,0],
   details:[
     'Declare callable_agents in Agent config. Runtime handles fan-out, waits for all results, routes back as events.',
     'LangGraph provides first-class multi-agent graphs with nodes and edges. Mature, flexible, requires more boilerplate.',
     'AutoGen\'s core strength — conversational multi-agent with group chats. Powerful but complex to debug.',
     'Fully custom. You write fan-out logic, manage child state, handle failures, aggregate results. Weeks of work.'
   ]},
  {label:'Human-in-the-Loop (Pause)',
   vals:[2,1,1,0],
   details:[
     'First-class pause/resume API. POST a pause event, session suspends mid-task. Container state preserved. Resume with one call.',
     'Interrupt nodes in LangGraph allow human review. Requires careful graph design; no container state persistence.',
     'Human proxy agent pattern supported. Conversation-level interruption; no execution environment preservation.',
     'Build it yourself: store state, send approval request, poll for response, reconstruct context. Non-trivial.'
   ]},
  {label:'Credential Security',
   vals:[2,0,0,0],
   details:[
     'Vault+MCP proxy mediates all auth. Agent requests access; proxy issues scoped short-lived tokens. Container never sees master credentials.',
     'No built-in credential vault. Secrets injected as env vars or passed in tool configs — visible in logs and memory.',
     'No built-in vault. Agent configs hold credentials directly. Risk of leakage through conversation history.',
     'Your responsibility entirely. Common mistake: secrets in environment variables readable via shell or /proc.'
   ]},
  {label:'Built-in Observability',
   vals:[2,1,1,0],
   details:[
     'Every event is logged and queryable. Session-level tracing, event replay, and streaming all built-in at no extra setup.',
     'LangSmith provides tracing (paid add-on). Rich debugging but requires separate service setup and API key.',
     'Basic logging. Azure AI Studio integration for some visibility. Debugging complex multi-agent flows is hard.',
     'Wire up your own logging, tracing, and dashboards. Each tool call must be instrumented manually.'
   ]},
  {label:'Zero Infra Setup',
   vals:[2,1,0,0],
   details:[
     'No servers, no containers, no Kubernetes. Create an Agent + Environment via API and start running sessions immediately.',
     'Python package install and go. Bring your own LLM keys and any external services. Light setup, flexible.',
     'Heavier setup — Python env, LLM config, often Docker for sandbox execution. Not beginner-friendly.',
     'Maximum setup: provision compute, configure networking, install runtimes, write retry logic, handle scaling.'
   ]}
];

var COMPARE_LABELS=['✗ Manual','~ Partial','✓ Built-in'];
var COMPARE_COLORS=[RED,AMBER,GREEN];

function drawCompareMatrix(){
  var c=document.getElementById('canvas-compare-matrix');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle=SURF;drawRoundedRect(ctx,0,0,W,H,10);ctx.fill();

  var labelW=190,cellW=(W-labelW-20)/COMPARE_COLS.length,cellH=36,startY=50,startX=labelW+10;

  // Column headers
  COMPARE_COLS.forEach(function(col,ci){
    var x=startX+ci*cellW;
    var lines=col.split('\n');
    ctx.fillStyle=COMPARE_COL_COLORS[ci];ctx.font='bold 10px Inter';ctx.textAlign='center';
    lines.forEach(function(l,li){ctx.fillText(l,x+cellW/2,26+li*13);});
    if(ci===0){
      ctx.fillStyle=CYAN+'22';drawRoundedRect(ctx,x+2,startY-4,cellW-4,COMPARE_ROWS.length*cellH+8+COMPARE_ROWS.length*4,6);ctx.fill();
    }
  });

  // Rows
  COMPARE_ROWS.forEach(function(row,ri){
    var y=startY+ri*(cellH+4);
    var hov=compareSelected.row===ri;

    // Row label
    ctx.fillStyle=hov?TEXT:MUTED;ctx.font=(hov?'bold ':'')+'10px Inter';ctx.textAlign='right';
    ctx.fillText(row.label,labelW,y+cellH/2+4);

    // Cells
    row.vals.forEach(function(val,ci){
      var x=startX+ci*cellW;
      var selCell=compareSelected.row===ri&&compareSelected.col===ci;
      var col=COMPARE_COLORS[val];
      ctx.fillStyle=selCell?col+'44':col+'14';
      drawRoundedRect(ctx,x+3,y+3,cellW-6,cellH-6,5);ctx.fill();
      ctx.strokeStyle=selCell?col:BORDER;ctx.lineWidth=selCell?1.5:1;
      drawRoundedRect(ctx,x+3,y+3,cellW-6,cellH-6,5);ctx.stroke();
      ctx.fillStyle=col;ctx.font='bold 9px Inter';ctx.textAlign='center';
      ctx.fillText(COMPARE_LABELS[val],x+cellW/2,y+cellH/2+4);
    });
  });

  // Legend
  COMPARE_LABELS.forEach(function(l,i){
    var lx=startX+i*80+10;
    ctx.fillStyle=COMPARE_COLORS[i];ctx.font='bold 9px Inter';ctx.textAlign='left';
    ctx.fillText(l,lx,H-10);
  });
}

function initCompareMatrix(){
  var c=document.getElementById('canvas-compare-matrix');
  if(!c)return;
  var labelW=190,cellW=(700-labelW-20)/COMPARE_COLS.length,cellH=36,startY=50,startX=labelW+10;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    compareSelected={row:-1,col:-1};
    COMPARE_ROWS.forEach(function(row,ri){
      var y=startY+ri*(cellH+4);
      if(my>=y&&my<=y+cellH){
        COMPARE_COLS.forEach(function(_,ci){
          var x=startX+ci*cellW;
          if(mx>=x&&mx<=x+cellW){compareSelected={row:ri,col:ci};}
        });
      }
    });
    var panel=document.getElementById('compare-detail');
    if(panel&&compareSelected.row>=0&&compareSelected.col>=0){
      var row=COMPARE_ROWS[compareSelected.row];
      var col=COMPARE_COLS[compareSelected.col].replace('\n',' ');
      var val=row.vals[compareSelected.col];
      var valColor=COMPARE_COLORS[val];
      panel.innerHTML='<strong>'+row.label+' — '+col+':</strong> <span style="color:'+valColor+'">'+COMPARE_LABELS[val]+'</span><br><br>'+row.details[compareSelected.col];
    } else if(panel){
      panel.innerHTML='<strong>Click any cell</strong> in the matrix to see a detailed comparison for that feature and framework.';
    }
    drawCompareMatrix();
  });
  drawCompareMatrix();
}

// ================================================
// INIT
// ================================================
function doInit(){
  initCostCalc();
  initAnatomyHover();
  initTTFT();
  initUsecaseFlow();
  initPromptWall();
  initInfraCompare();
  initAgentRelationship();
  initConceptsMap();
  initSessionLifecycle();
  initSessionReplay();
  initArchBHS();
  initEventLoop();
  initMultiAgent();
  initSecurityModel();
  initApiFlow();
  initCompareMatrix();
  updateNavOnScroll();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',doInit);
} else {
  doInit();
}
