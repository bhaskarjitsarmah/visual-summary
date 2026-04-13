// inject_v3b.js — adds canvas functions to build2_inject.js
const fs = require('fs');

const CANVAS_NEW = `
// ===== CHECKLIST PROGRESS CANVAS =====
function drawChecklistProgress(){
  var c=document.getElementById('canvas-checklist');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var fns=[
    {key:'GV',label:'GOVERN',color:'#0984e3'},
    {key:'MP',label:'MAP',color:'#f7b731'},
    {key:'MS',label:'MEASURE',color:'#ff6b6b'},
    {key:'MG',label:'MANAGE',color:'#51cf66'}
  ];
  var colW=W/4;
  fns.forEach(function(fn,fi){
    var cats=SUBCATS.filter(function(s){return s.fn===fn.key;});
    var total=cats.length;
    var pass=cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='pass';}).length;
    var partial=cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='partial';}).length;
    var fail=cats.filter(function(s){return CHECKLIST_STATUS[s.id]==='fail';}).length;
    var cx=fi*colW+colW/2;
    var cy=H/2+10;
    var r=36;
    // Track
    ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.strokeStyle='#21262d';ctx.lineWidth=10;ctx.stroke();
    // Pass arc
    var passAngle=pass/total*Math.PI*2;
    ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+passAngle);
    ctx.strokeStyle=fn.color;ctx.lineWidth=10;ctx.stroke();
    // Partial arc
    if(partial>0){
      var partialAngle=partial/total*Math.PI*2;
      ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2+passAngle,-Math.PI/2+passAngle+partialAngle);
      ctx.strokeStyle=fn.color+'88';ctx.lineWidth=10;ctx.stroke();
    }
    // Center text
    ctx.fillStyle='#c9d1d9';ctx.font='bold 13px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(pass+'/'+total,cx,cy);
    // Label
    ctx.fillStyle=fn.color;ctx.font='bold 11px Inter,sans-serif';ctx.textBaseline='alphabetic';
    ctx.fillText(fn.label,cx,cy+r+18);
    // Stats row
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
    ctx.fillText('P:'+pass+' Par:'+partial+' F:'+fail,cx,cy+r+32);
  });
}

// ===== ADVISOR CANVAS =====
function drawAdvisor(){
  var c=document.getElementById('canvas-advisor');
  if(!c)return;
  if(!advisorScores||!advisorScores.length)advisorCalc();
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var maxScore=20;
  var barH=22,gap=4,startY=40,labelW=90,rightPad=60;
  var barMaxW=W-labelW-rightPad;
  // Title
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText('PRIORITY RANKING — TOP '+advisorScores.length+' SUBCATEGORIES FOR YOUR CONTEXT',8,20);
  advisorScores.forEach(function(s,i){
    var y=startY+i*(barH+gap);
    var w=Math.max(4,s.score/maxScore*barMaxW);
    var isSelected=advisorSelected===i;
    // Bg highlight if selected
    if(isSelected){
      ctx.fillStyle='#ffffff0a';
      ctx.fillRect(0,y-2,W,barH+4);
    }
    // Rank
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText('#'+(i+1),labelW-6,y+barH/2);
    // Bar
    ctx.fillStyle=s.color+(isSelected?'':'88');
    ctx.beginPath();
    ctx.roundRect(labelW,y,w,barH,4);
    ctx.fill();
    // Label on bar
    ctx.fillStyle=isSelected?'#0d1117':'#c9d1d9';
    ctx.font=(isSelected?'bold ':'')+'11px Inter,sans-serif';
    ctx.textAlign='left';
    ctx.fillText(s.id+' — '+s.label,labelW+8,y+barH/2);
    // Score
    ctx.fillStyle=s.color;ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='left';
    ctx.fillText(s.score,labelW+w+6,y+barH/2);
  });
}

// ===== GENAI WHEEL CANVAS =====
function drawGenAIWheel(){
  var c=document.getElementById('canvas-genai-wheel');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var cx=W/2,cy=H/2;
  var n=GENAI_RISKS.length;
  var step=Math.PI*2/n;
  var innerR=50,outerR=160,textR=185;
  // Hub
  ctx.beginPath();ctx.arc(cx,cy,innerR,0,Math.PI*2);
  ctx.fillStyle='#161b22';ctx.fill();
  ctx.strokeStyle='#fd79a8';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#fd79a8';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('NIST-AI',cx,cy-7);ctx.fillText('600-1',cx,cy+7);
  // Spokes
  GENAI_RISKS.forEach(function(r,i){
    var angle=-Math.PI/2+i*step;
    var isSelected=selectedGenAIRisk===i;
    var spokeR=isSelected?outerR+20:outerR;
    var sx=cx+Math.cos(angle)*innerR,sy=cy+Math.sin(angle)*innerR;
    var ex=cx+Math.cos(angle)*spokeR,ey=cy+Math.sin(angle)*spokeR;
    // Spoke line
    ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);
    ctx.strokeStyle=r.color+(isSelected?'':'88');ctx.lineWidth=isSelected?4:2;ctx.stroke();
    // End node
    ctx.beginPath();ctx.arc(ex,ey,isSelected?10:7,0,Math.PI*2);
    ctx.fillStyle=isSelected?r.color:r.color+'44';ctx.fill();
    ctx.strokeStyle=r.color;ctx.lineWidth=1.5;ctx.stroke();
    // Likelihood fill inside node
    var likeR=(isSelected?10:7)*r.likelihood/100;
    ctx.beginPath();ctx.arc(ex,ey,likeR,0,Math.PI*2);
    ctx.fillStyle=r.color+'cc';ctx.fill();
    // Label
    var tr=textR+(isSelected?22:0);
    var tx=cx+Math.cos(angle)*tr,ty=cy+Math.sin(angle)*tr;
    ctx.fillStyle=isSelected?r.color:'#8b949e';
    ctx.font=(isSelected?'bold ':'')+'9px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    // Wrap long names
    var words=r.name.split(' ');
    if(words.length>1&&r.name.length>10){
      ctx.fillText(words[0],tx,ty-6);ctx.fillText(words.slice(1).join(' '),tx,ty+6);
    }else{ctx.fillText(r.name,tx,ty);}
  });
}
function initGenAIWheel(){drawGenAIWheel();}

// ===== TENSION MAP CANVAS =====
function drawTensionMap(){
  var c=document.getElementById('canvas-tension');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  // Draw edges
  TENSION_EDGES.forEach(function(edge,i){
    var a=TENSION_NODES.find(function(n){return n.id===edge.from;});
    var b=TENSION_NODES.find(function(n){return n.id===edge.to;});
    if(!a||!b)return;
    var ax=a.px*W,ay=a.py*H,bx=b.px*W,by=b.py*H;
    var isSelected=selectedTension===i;
    var isHovered=hoveredTension===i;
    ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);
    ctx.strokeStyle=isSelected?'#f7b731':isHovered?'#f7b73188':'#30363d';
    ctx.lineWidth=isSelected?3:isHovered?2:1.5;
    ctx.setLineDash([6,4]);ctx.stroke();ctx.setLineDash([]);
    // Midpoint label on selected
    if(isSelected){
      var mx=(ax+bx)/2,my=(ay+by)/2;
      ctx.fillStyle='#f7b731';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      var words=edge.from+' \u2194 '+edge.to;
      ctx.fillText(words,mx,my-8);
    }
  });
  // Draw nodes
  TENSION_NODES.forEach(function(node){
    var nx=node.px*W,ny=node.py*H;
    var r=32;
    ctx.beginPath();ctx.arc(nx,ny,r,0,Math.PI*2);
    ctx.fillStyle='#161b22';ctx.fill();
    ctx.strokeStyle=node.color;ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle=node.color;ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    var words=node.label.split(' ');
    if(words.length>1&&node.label.length>12){
      ctx.fillText(words[0],nx,ny-6);ctx.fillText(words.slice(1).join(' '),nx,ny+6);
    }else{ctx.fillText(node.label,nx,ny);}
  });
}
function initTensionMap(){drawTensionMap();}

// ===== INCIDENTS CANVAS =====
function drawIncidents(){
  var c=document.getElementById('canvas-incidents');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var inc=INCIDENTS[selectedIncident];
  if(!inc)return;
  var gaps=inc.gaps;
  var n=gaps.length;
  var nodeR=18,nodeSpacingY=(H-80)/(n+1);
  // Incident root
  ctx.beginPath();ctx.arc(W/2,40,28,0,Math.PI*2);
  ctx.fillStyle=inc.color+'22';ctx.fill();
  ctx.strokeStyle=inc.color;ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle=inc.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(inc.title,W/2,34);ctx.fillText(inc.year,W/2,46);
  // Gap nodes
  gaps.forEach(function(g,i){
    var gx=W/2,gy=80+nodeSpacingY*(i+1);
    // Arrow from root or prev
    var fromY=i===0?68:80+nodeSpacingY*i;
    ctx.beginPath();ctx.moveTo(gx,fromY);ctx.lineTo(gx,gy-nodeR);
    ctx.strokeStyle='#ff6b6b88';ctx.lineWidth=2;ctx.stroke();
    // Arrow head
    ctx.beginPath();ctx.moveTo(gx-5,gy-nodeR-8);ctx.lineTo(gx,gy-nodeR);ctx.lineTo(gx+5,gy-nodeR-8);
    ctx.strokeStyle='#ff6b6b';ctx.stroke();
    // Gap node
    ctx.beginPath();ctx.arc(gx,gy,nodeR,0,Math.PI*2);
    ctx.fillStyle='#ff6b6b22';ctx.fill();ctx.strokeStyle='#ff6b6b';ctx.lineWidth=1.5;ctx.stroke();
    // Gap label (subcat ID only)
    var subcatId=g.split(':')[0];
    ctx.fillStyle='#ff6b6b';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(subcatId,gx,gy);
    // Full label to right
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';
    var labelText=g.split(': ')[1]||g;
    ctx.fillText(labelText,gx+nodeR+6,gy);
  });
}
function initIncidentsSection2(){
  if(typeof initIncidentsSection==='function')initIncidentsSection();
  drawIncidents();
}

// ===== DECISION TREE CANVAS =====
function drawDecision(){
  var c=document.getElementById('canvas-decision');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var n=DECISION_QS.length;
  var nodeH=30,gap=8,startY=20;
  var totalH=n*(nodeH+gap);
  var scaleY=Math.min(1,(H-40)/totalH);
  DECISION_QS.forEach(function(q,i){
    var y=startY+i*(nodeH+gap)*scaleY;
    var h=nodeH*scaleY;
    var ans=decisionAnswers[i];
    var isCurrent=decisionActive&&i===decisionAnswers.length;
    var color=ans===true?'#51cf66':ans===false?'#ff6b6b':isCurrent?'#f7b731':'#30363d';
    var textColor=ans!==undefined||isCurrent?'#c9d1d9':'#8b949e';
    ctx.beginPath();ctx.roundRect(8,y,W-16,h,4);
    ctx.fillStyle=color+'22';ctx.fill();
    ctx.strokeStyle=color;ctx.lineWidth=isCurrent?2:1;ctx.stroke();
    // Q number
    ctx.fillStyle=color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('Q'+(i+1),16,y+h/2);
    // Short label
    ctx.fillStyle=textColor;ctx.font='9px Inter,sans-serif';
    var short=q.ref;
    ctx.fillText(short,32,y+h/2);
    // Answer
    if(ans!==undefined){
      ctx.fillStyle=ans?'#51cf66':'#ff6b6b';ctx.textAlign='right';ctx.font='bold 10px Inter,sans-serif';
      ctx.fillText(ans?'Y':'N',W-12,y+h/2);
    }
    // Connector
    if(i<n-1){
      var ny=y+h;ctx.beginPath();ctx.moveTo(W/2,ny);ctx.lineTo(W/2,ny+gap*scaleY);
      ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.stroke();
    }
  });
}
function initDecision(){decisionReset();}
`;

const DOINIT_OLD = `  initSimulator();
  if(typeof initDeepdive==='function')initDeepdive();
  if(typeof policyGenerate==='function')policyGenerate();
  initPropagation();
  initProgression();
  initOrgChart();
  initDepMap();
  initRegMap();
  updateNavOnScroll();`;

const DOINIT_NEW = `  initSimulator();
  if(typeof initDeepdive==='function')initDeepdive();
  if(typeof policyGenerate==='function')policyGenerate();
  initPropagation();
  initProgression();
  initOrgChart();
  initDepMap();
  initRegMap();
  if(typeof initChecklist==='function')initChecklist();
  advisorCalc();
  initGenAIWheel();
  initTensionMap();
  initIncidentsSection2();
  initDecision();
  if(typeof stakhGen==='function')stakhGen();
  updateNavOnScroll();`;

let b2 = fs.readFileSync('./build2_inject.js', 'utf8');
b2 = b2.replace('function doInit(){', CANVAS_NEW + '\nfunction doInit(){');
b2 = b2.replace(DOINIT_OLD, DOINIT_NEW);
fs.writeFileSync('./build2_inject.js', b2, 'utf8');
console.log('build2_inject.js updated:', b2.length, 'bytes');
