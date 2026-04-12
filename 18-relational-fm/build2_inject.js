// ─── UTILITIES ───────────────────────────────────────────────────────────────
function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function drawRoundedRect(ctx,x,y,w,h,r,fill,stroke){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.5;ctx.stroke();}
}
function seededRand(s){return function(){s=Math.sin(s)*10000;return s-Math.floor(s);};}

// ─── CANVAS 1: PROBLEM ──────────────────────────────────────────────────────
var TABLES=[
  {id:'users',label:'users',x:80,y:60,w:140,h:40,color:'#0ea5e9',cols:['id','name','email','created_at']},
  {id:'orders',label:'orders',x:300,y:30,w:140,h:40,color:'#7c3aed',cols:['id','user_id','total','date']},
  {id:'products',label:'products',x:520,y:60,w:140,h:40,color:'#10b981',cols:['id','name','category','price']},
  {id:'events',label:'events',x:80,y:200,w:140,h:40,color:'#f59e0b',cols:['id','user_id','type','ts']},
  {id:'support',label:'support_tickets',x:300,y:220,w:160,h:40,color:'#f87171',cols:['id','user_id','priority','status']},
  {id:'inventory',label:'inventory',x:520,y:200,w:140,h:40,color:'#a78bfa',cols:['id','product_id','qty','warehouse']},
];
var PROBLEM_JOINS=[
  {from:'users',to:'orders',label:'user_id'},
  {from:'orders',to:'products',label:'product_id'},
  {from:'users',to:'events',label:'user_id'},
  {from:'users',to:'support',label:'user_id'},
  {from:'products',to:'inventory',label:'product_id'},
];
var selectedTable=null;
var problemBounce=0;
function getTableCenter(t){return{x:t.x+t.w/2,y:t.y+t.h/2};}
function drawProblem(t){
  var c=document.getElementById('canvas-problem');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,340);
  // bg
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,340);
  // title
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('Relational Database Schema — click a table to see required joins',14,22);
  // edges
  PROBLEM_JOINS.forEach(function(j){
    var ft=TABLES.find(function(x){return x.id===j.from;});
    var tt=TABLES.find(function(x){return x.id===j.to;});
    if(!ft||!tt)return;
    var fc=getTableCenter(ft),tc=getTableCenter(tt);
    var isActive=selectedTable&&(selectedTable===j.from||selectedTable===j.to);
    ctx.beginPath();ctx.moveTo(fc.x,fc.y);ctx.lineTo(tc.x,tc.y);
    ctx.strokeStyle=isActive?'#f59e0b':'#30363d';
    ctx.lineWidth=isActive?2:1;
    ctx.setLineDash(isActive?[]:[4,4]);
    ctx.stroke();ctx.setLineDash([]);
    if(isActive){
      var mx=(fc.x+tc.x)/2,my=(fc.y+tc.y)/2;
      ctx.fillStyle='#f59e0b';ctx.font='bold 10px JetBrains Mono,monospace';
      ctx.fillText(j.label,mx-20,my-5);
    }
  });
  // tables
  TABLES.forEach(function(tb){
    var bounce=selectedTable===tb.id?Math.sin(t*3)*2:0;
    var isActive=selectedTable===tb.id;
    drawRoundedRect(ctx,tb.x,tb.y+bounce,tb.w,tb.h,7,isActive?tb.color+'33':'#1e2530',isActive?tb.color:'#30363d');
    ctx.fillStyle=isActive?tb.color:'#8b949e';
    ctx.font='bold 12px Inter,sans-serif';
    ctx.fillText(tb.label,tb.x+10,tb.y+26+bounce);
  });
  // info panel
  if(selectedTable){
    var tb=TABLES.find(function(x){return x.id===selectedTable;});
    if(tb){
      var pj=PROBLEM_JOINS.filter(function(j){return j.from===selectedTable||j.to===selectedTable;});
      ctx.fillStyle='#0d1117';ctx.fillRect(0,280,700,60);
      ctx.strokeStyle='#30363d';ctx.beginPath();ctx.moveTo(0,280);ctx.lineTo(700,280);ctx.stroke();
      ctx.fillStyle=tb.color;ctx.font='bold 11px Inter,sans-serif';
      ctx.fillText('Table: '+tb.label,14,300);
      ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
      ctx.fillText('Columns: '+tb.cols.join(', '),14,318);
      ctx.fillStyle='#f59e0b';
      ctx.fillText('Joins required: '+pj.map(function(j){return j.label;}).join(', '),14,334);
    }
  }else{
    // show "No table selected" hint
    ctx.fillStyle='#0d1117';ctx.fillRect(0,280,700,60);
    ctx.strokeStyle='#30363d';ctx.beginPath();ctx.moveTo(0,280);ctx.lineTo(700,280);ctx.stroke();
    ctx.fillStyle='#30363d';ctx.font='11px Inter,sans-serif';
    ctx.fillText('Click any table above to see which joins are needed for a prediction task',14,310);
  }
}
function initProblem(){
  var c=document.getElementById('canvas-problem');if(!c)return;
  var t=0;
  function frame(){t+=0.02;drawProblem(t);requestAnimationFrame(frame);}
  frame();
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var hit=null;
    TABLES.forEach(function(tb){if(mx>=tb.x&&mx<=tb.x+tb.w&&my>=tb.y&&my<=tb.y+tb.h)hit=tb.id;});
    selectedTable=hit===selectedTable?null:hit;
  });
}

// ─── CANVAS 2: DB → GRAPH ────────────────────────────────────────────────────
var dbGraphTab='db';
function setDbGraphTab(tab){
  dbGraphTab=tab;
  ['db','graph','gnn'].forEach(function(t){
    var el=document.getElementById('tab-'+t);
    if(el)el.className='btn-tab'+(t===tab?' active':'');
  });
}
var dbGraphT=0;
function drawDbGraph(t){
  var c=document.getElementById('canvas-db-graph');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,380);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,380);
  if(dbGraphTab==='db'){drawDbView(ctx,t);}
  else if(dbGraphTab==='graph'){drawGraphView(ctx,t);}
  else{drawGnnView(ctx,t);}
}
function drawDbView(ctx,t){
  // Show 3 tables with FK arrows
  var tables=[
    {label:'users',cols:['id','name','email'],x:30,y:80,color:'#0ea5e9'},
    {label:'orders',cols:['id','user_id*','amount'],x:280,y:80,color:'#7c3aed'},
    {label:'products',cols:['id','name','price'],x:530,y:80,color:'#10b981'},
  ];
  tables.forEach(function(tb){
    drawRoundedRect(ctx,tb.x,tb.y,160,120,8,'#0d1117',tb.color+'88');
    ctx.fillStyle=tb.color;ctx.font='bold 12px Inter,sans-serif';
    ctx.fillText(tb.label,tb.x+10,tb.y+22);
    ctx.strokeStyle=tb.color+'44';ctx.beginPath();ctx.moveTo(tb.x,tb.y+30);ctx.lineTo(tb.x+160,tb.y+30);ctx.stroke();
    tb.cols.forEach(function(col,i){
      ctx.fillStyle=col.endsWith('*')?'#f59e0b':'#8b949e';
      ctx.font=(i===0?'bold ':'')+'11px JetBrains Mono,monospace';
      ctx.fillText(col,tb.x+10,tb.y+50+i*22);
    });
  });
  // FK arrow orders.user_id -> users.id
  ctx.beginPath();ctx.moveTo(280,118);ctx.lineTo(190,118);
  ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.5;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#f59e0b';ctx.font='bold 10px Inter,sans-serif';ctx.fillText('FK',220,110);
  // Data rows
  var rows=[['1','Alice','alice@…'],['2','Bob','bob@…'],['3','Carol','carol@…']];
  ctx.fillStyle='#30363d';ctx.fillRect(30,220,160,100);
  ctx.fillStyle='#8b949e';ctx.font='10px JetBrains Mono,monospace';
  rows.forEach(function(r,i){r.forEach(function(v,j){ctx.fillStyle=j===0?'#0ea5e9':'#8b949e';ctx.fillText(v,40+j*52,240+i*22);});});
  var orows=[['10','1','29.99'],['11','1','14.50'],['12','2','99.00']];
  ctx.fillStyle='#30363d';ctx.fillRect(280,220,160,100);
  orows.forEach(function(r,i){r.forEach(function(v,j){ctx.fillStyle=j===1?'#f59e0b':j===0?'#7c3aed':'#8b949e';ctx.fillText(v,290+j*52,240+i*22);});});
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('Traditional ML: must JOIN these tables manually',30,350);
  ctx.fillStyle='#f87171';ctx.fillText('→ 878 lines of code, 12+ hours of data engineering',30,368);
}
function drawGraphView(ctx,t){
  // Show DB as graph
  var nodes=[
    {id:'u1',label:'User:Alice',x:120,y:100,color:'#0ea5e9',r:28},
    {id:'u2',label:'User:Bob',x:120,y:240,color:'#0ea5e9',r:28},
    {id:'o1',label:'Order:10',x:300,y:60,color:'#7c3aed',r:24},
    {id:'o2',label:'Order:11',x:300,y:150,color:'#7c3aed',r:24},
    {id:'o3',label:'Order:12',x:300,y:280,color:'#7c3aed',r:24},
    {id:'p1',label:'Prod:A',x:500,y:80,color:'#10b981',r:24},
    {id:'p2',label:'Prod:B',x:500,y:200,color:'#10b981',r:24},
    {id:'e1',label:'Event:view',x:120,y:330,color:'#f59e0b',r:20},
  ];
  var edges=[
    {from:'u1',to:'o1'},{from:'u1',to:'o2'},{from:'u2',to:'o3'},
    {from:'o1',to:'p1'},{from:'o2',to:'p2'},{from:'o3',to:'p1'},
    {from:'u1',to:'e1'},
  ];
  function getNode(id){return nodes.find(function(n){return n.id===id;});}
  // Animate pulse on edges
  edges.forEach(function(e){
    var fn=getNode(e.from),tn=getNode(e.to);if(!fn||!tn)return;
    ctx.beginPath();ctx.moveTo(fn.x,fn.y);ctx.lineTo(tn.x,tn.y);
    ctx.strokeStyle='#30363d';ctx.lineWidth=1.5;ctx.setLineDash([]);ctx.stroke();
  });
  // Pulse dot
  var pt=(t%3)/3;
  edges.forEach(function(e,i){
    var fn=getNode(e.from),tn=getNode(e.to);if(!fn||!tn)return;
    var phase=((t+i*0.4)%2)/2;
    var px=lerp(fn.x,tn.x,phase),py=lerp(fn.y,tn.y,phase);
    ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);
    ctx.fillStyle='#0ea5e9aa';ctx.fill();
  });
  // Nodes
  nodes.forEach(function(n){
    ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle=n.color+'22';ctx.fill();
    ctx.strokeStyle=n.color;ctx.lineWidth=2;ctx.stroke();
    ctx.fillStyle=n.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';
    var parts=n.label.split(':');
    ctx.fillText(parts[0],n.x,n.y-4);
    ctx.fillStyle='#c9d1d9';ctx.font='9px Inter,sans-serif';
    ctx.fillText(parts[1]||'',n.x,n.y+8);
    ctx.textAlign='left';
  });
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('Rows become nodes. Foreign keys become edges. Temporal graph. No manual joins needed.',20,355);
  ctx.fillStyle='#10b981';ctx.fillText('→ GNN automatically aggregates across all connected rows',20,373);
}
function drawGnnView(ctx,t){
  // Show message passing
  var centerNode={x:350,y:190,color:'#7c3aed',label:'Target\nUser'};
  var neighbors=[
    {x:170,y:100,color:'#0ea5e9',label:'Order\n#10',msg:true},
    {x:170,y:280,color:'#0ea5e9',label:'Order\n#11',msg:true},
    {x:530,y:100,color:'#10b981',label:'Product\nA',msg:false},
    {x:530,y:280,color:'#f59e0b',label:'Event\nview',msg:true},
    {x:350,y:50,color:'#f87171',label:'Support\n#3',msg:true},
  ];
  var hop2=[
    {x:80,y:50,color:'#10b981',label:'Prod\nB'},
  ];
  // Draw hop-2 edges
  hop2.forEach(function(n){
    ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(neighbors[0].x,neighbors[0].y);
    ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    ctx.beginPath();ctx.arc(n.x,n.y,18,0,Math.PI*2);
    ctx.fillStyle=n.color+'22';ctx.fill();ctx.strokeStyle=n.color+'44';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=n.color+'88';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(n.label.split('\n')[0],n.x,n.y-3);ctx.fillText(n.label.split('\n')[1]||'',n.x,n.y+8);ctx.textAlign='left';
  });
  // Message arrows (animated)
  neighbors.forEach(function(n){
    ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(centerNode.x,centerNode.y);
    ctx.strokeStyle=n.msg?n.color+'66':'#30363d';ctx.lineWidth=1.5;ctx.stroke();
    if(n.msg){
      var phase=(t*0.5+neighbors.indexOf(n)*0.3)%1;
      var px=lerp(n.x,centerNode.x,phase),py=lerp(n.y,centerNode.y,phase);
      ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);
      ctx.fillStyle=n.color;ctx.fill();
    }
  });
  // Draw neighbor nodes
  neighbors.forEach(function(n){
    ctx.beginPath();ctx.arc(n.x,n.y,26,0,Math.PI*2);
    ctx.fillStyle=n.color+'22';ctx.fill();ctx.strokeStyle=n.color;ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=n.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';
    var parts=n.label.split('\n');
    ctx.fillText(parts[0],n.x,n.y-3);ctx.fillStyle='#c9d1d9';ctx.font='9px Inter,sans-serif';
    ctx.fillText(parts[1]||'',n.x,n.y+9);ctx.textAlign='left';
  });
  // Center node
  var pulse=1+Math.sin(t*2)*0.05;
  ctx.beginPath();ctx.arc(centerNode.x,centerNode.y,36*pulse,0,Math.PI*2);
  ctx.fillStyle=centerNode.color+'33';ctx.fill();
  ctx.strokeStyle=centerNode.color;ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle=centerNode.color;ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Target',centerNode.x,centerNode.y-4);ctx.fillText('User',centerNode.x,centerNode.y+10);ctx.textAlign='left';
  // Labels
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('GNN message passing: neighbors aggregate to center node automatically (no SQL)',20,340);
  ctx.fillStyle='#7c3aed';
  ctx.fillText('→ Multi-hop: hop-2 neighbors also contribute (orders of products, etc.)',20,358);
  ctx.fillStyle='#0ea5e9';ctx.font='10px Inter,sans-serif';
  ctx.fillText('Hop 1: orders, events, support tickets',20,376);
  ctx.fillText('Hop 2: products ordered (via order nodes)',250,376);
}
function initDbGraph(){
  var c=document.getElementById('canvas-db-graph');if(!c)return;
  var t=0;
  function frame(){t+=0.025;drawDbGraph(t);requestAnimationFrame(frame);}
  frame();
}

// ─── CANVAS 3: ARCHITECTURE ─────────────────────────────────────────────────
var ARCH_MODULES=[
  {id:0,label:'In-Context\nLabel Generator',sublabel:'Samples historical subgraphs',color:'#f59e0b',y:320},
  {id:1,label:'Table-Width Invariant\nColumn Encoder',sublabel:'Encodes numerical, categorical, text, timestamps',color:'#0ea5e9',y:240},
  {id:2,label:'Relational Graph\nTransformer',sublabel:'Attention across temporal heterogeneous graph',color:'#7c3aed',y:160},
  {id:3,label:'Explainability\nModule',sublabel:'Gradient-based + analytical explanations',color:'#10b981',y:80},
  {id:4,label:'Fine-tuning\nPipeline',sublabel:'Task-specific specialization (+10–30% accuracy)',color:'#f87171',y:20},
];
var hoveredModule=-1;
var archPackets=[];
function initArchPackets(){
  archPackets=[];
  for(var i=0;i<8;i++){
    archPackets.push({layer:Math.floor(Math.random()*5),progress:Math.random(),speed:0.003+Math.random()*0.004});
  }
}
function drawArch(t){
  var c=document.getElementById('canvas-arch');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,420);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,420);
  // Input arrow
  ctx.strokeStyle='#30363d';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(350,400);ctx.lineTo(350,365);ctx.stroke();
  ctx.fillStyle='#30363d';ctx.beginPath();ctx.moveTo(344,368);ctx.lineTo(350,355);ctx.lineTo(356,368);ctx.fill();
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('PQL Query + Database Connection',350,414);ctx.textAlign='left';
  // Draw modules
  ARCH_MODULES.forEach(function(m){
    var isHover=hoveredModule===m.id;
    var y=m.y+20;
    drawRoundedRect(ctx,100,y,500,52,10,isHover?m.color+'22':'#1e2530',isHover?m.color:'#30363d');
    ctx.fillStyle=m.color;ctx.font='bold 12px Inter,sans-serif';
    var lparts=m.label.split('\n');
    ctx.fillText(lparts[0],120,y+20);
    if(lparts[1]){ctx.font='bold 12px Inter,sans-serif';ctx.fillText(lparts[1],120,y+35);}
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
    ctx.fillText(m.sublabel,isHover?120:300,y+48);
    // Module number circle
    ctx.beginPath();ctx.arc(90,y+26,12,0,Math.PI*2);
    ctx.fillStyle=m.color+'33';ctx.fill();ctx.strokeStyle=m.color;ctx.lineWidth=1.5;ctx.stroke();
    ctx.fillStyle=m.color;ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(m.id+1,90,y+30);ctx.textAlign='left';
    // Connect arrows
    if(m.id<4){
      ctx.strokeStyle='#30363d';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(350,y);ctx.lineTo(350,y-8);ctx.stroke();
    }
  });
  // Packets
  archPackets.forEach(function(p){
    p.progress+=p.speed;
    if(p.progress>1){p.progress=0;p.layer=Math.floor(Math.random()*5);}
    var m=ARCH_MODULES[p.layer];
    var y=m.y+20;
    var px=lerp(100,600,p.progress);
    ctx.beginPath();ctx.arc(px,y+26,4,0,Math.PI*2);
    ctx.fillStyle=m.color+'88';ctx.fill();
  });
  // Output label
  ctx.fillStyle='#0ea5e9';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Prediction Output',350,18);ctx.textAlign='left';
}
function initArch(){
  var c=document.getElementById('canvas-arch');if(!c)return;
  initArchPackets();
  var t=0;
  function frame(){t+=0.02;drawArch(t);requestAnimationFrame(frame);}
  frame();
  c.addEventListener('mousemove',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var hit=-1;
    ARCH_MODULES.forEach(function(m){
      var y=m.y+20;
      if(mx>=100&&mx<=600&&my>=y&&my<=y+52)hit=m.id;
    });
    hoveredModule=hit;
    var panel=document.getElementById('arch-info');
    if(panel&&hit>=0){
      var m=ARCH_MODULES[hit];
      panel.innerHTML='<strong style="color:'+m.color+'">Module '+(hit+1)+': '+m.label.replace('\n',' ')+'</strong><br>'+[
        'Dynamically samples labeled subgraphs from historical database rows at inference time. Acts like few-shot examples for LLMs — no gradient updates needed. Balances class distribution to avoid majority-class bias in context.',
        'Encodes each database cell independently of schema width: numerical (standardized), categorical (tokenized), timestamps (cyclical decomposition + time-delta), text (mini LM encoder). Allows the model to handle any database without architectural changes.',
        'A Graph Transformer restricted to the relational topology. Attention follows foreign key edges rather than being fully global. Positional encodings capture node type, temporal distance, structural proximity, and local subgraph patterns. Scales to million-node databases.',
        'Provides gradient-based attribution (which input features drove this prediction?) and analytical explanations at both global (dataset-level) and individual prediction levels. Required for regulated industries (finance, healthcare).',
        'Fine-tunes the pre-trained KumoRFM on specific databases or query types. Adds 10–30% accuracy improvement over the already-competitive zero-shot baseline. Follows the same pattern as LLM fine-tuning on domain-specific data.',
      ][hit]+'<br><br><span style="color:#8b949e;font-size:11px">'+m.sublabel+'</span>';
    }else if(panel){
      panel.innerHTML='<strong>Hover a module</strong> to see what it does in the pipeline.';
    }
  });
}

// ─── CANVAS 4: IN-CONTEXT ────────────────────────────────────────────────────
var IC_STEPS=[
  {title:'Query arrives',desc:'A PQL query asks: "Will user Alice churn in the next 30 days?" KumoRFM receives the query entity (Alice) and the target variable.',color:'#0ea5e9',phase:'query'},
  {title:'Sample in-context examples',desc:'The In-Context Label Generator finds 8 historical users with similar behavior patterns. These become the few-shot context — labeled examples of users who did and didn\'t churn.',color:'#f59e0b',phase:'sample'},
  {title:'Build subgraph',desc:'For Alice and each context example, the system extracts their local subgraph: orders, events, support tickets, and connected products — all temporally constrained.',color:'#7c3aed',phase:'subgraph'},
  {title:'Encode + attend',desc:'The Column Encoder turns each cell into vectors. The Relational Graph Transformer runs attention across Alice\'s subgraph, conditioned on the in-context examples.',color:'#10b981',phase:'encode'},
  {title:'Output prediction',desc:'The model outputs a probability: P(churn) = 0.82. The Explainability Module shows that 3 support tickets + 0 orders in last 30 days were the primary drivers.',color:'#f87171',phase:'output'},
];
var icCurrentStep=-1;
function icStep(){
  icCurrentStep=Math.min(icCurrentStep+1,IC_STEPS.length-1);
  drawInContext(icCurrentStep);
  var panel=document.getElementById('ic-info');
  if(panel&&icCurrentStep>=0){
    var s=IC_STEPS[icCurrentStep];
    panel.innerHTML='<strong style="color:'+s.color+'">Step '+(icCurrentStep+1)+': '+s.title+'</strong><br>'+s.desc;
  }
}
function icReset(){
  icCurrentStep=-1;
  var panel=document.getElementById('ic-info');
  if(panel)panel.innerHTML='<strong>Press Step</strong> to walk through how KumoRFM makes a prediction using in-context learning.';
  drawInContext(-1);
}
function drawInContext(step){
  var c=document.getElementById('canvas-incontext');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,340);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,340);
  // Draw 5 step boxes
  var bw=110,bh=60,bx=20,by=30,gap=18;
  IC_STEPS.forEach(function(s,i){
    var x=bx+i*(bw+gap);
    var isActive=step>=i;
    var isCurrent=step===i;
    drawRoundedRect(ctx,x,by,bw,bh,8,isActive?s.color+'22':'#1e2530',isCurrent?s.color:isActive?s.color+'44':'#30363d');
    // Step number
    ctx.beginPath();ctx.arc(x+18,by+18,12,0,Math.PI*2);
    ctx.fillStyle=isActive?s.color:'#30363d';ctx.fill();
    ctx.fillStyle=isActive?'#fff':'#8b949e';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(i+1,x+18,by+22);ctx.textAlign='left';
    // Label
    ctx.fillStyle=isActive?s.color:'#8b949e';ctx.font='bold 9px Inter,sans-serif';
    var words=s.title.split(' ');
    var line='',lines=[];
    words.forEach(function(w){if((line+' '+w).trim().length>12&&line){lines.push(line.trim());line=w;}else{line=(line+' '+w).trim();}});
    if(line)lines.push(line.trim());
    lines.slice(0,3).forEach(function(l,li){ctx.fillText(l,x+34,by+18+li*12);});
    // Arrow
    if(i<IC_STEPS.length-1){
      ctx.beginPath();ctx.moveTo(x+bw+2,by+bh/2);ctx.lineTo(x+bw+gap-2,by+bh/2);
      ctx.strokeStyle=step>i?s.color+'88':'#30363d';ctx.lineWidth=1.5;ctx.stroke();
      ctx.beginPath();ctx.moveTo(x+bw+gap-6,by+bh/2-4);ctx.lineTo(x+bw+gap-2,by+bh/2);ctx.lineTo(x+bw+gap-6,by+bh/2+4);
      ctx.strokeStyle=step>i?s.color+'88':'#30363d';ctx.lineWidth=1.5;ctx.stroke();
    }
  });
  // Show visualization for current step
  if(step>=0){
    var s=IC_STEPS[step];
    ctx.strokeStyle=s.color+'44';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.strokeRect(20,110,660,210);ctx.setLineDash([]);
    ctx.fillStyle=s.color+'11';ctx.fillRect(20,110,660,210);
    ctx.fillStyle=s.color;ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(s.title,350,138);ctx.textAlign='left';
    // Visual for each phase
    if(s.phase==='query'){
      drawRoundedRect(ctx,100,150,500,60,10,'#0d1117','#0ea5e9');
      ctx.fillStyle='#38bdf8';ctx.font='12px JetBrains Mono,monospace';
      ctx.fillText('PREDICT user.will_churn_30d FOR users WHERE id = \'alice\'',115,176);
      ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.fillText('USING HISTORY 90 DAYS',115,196);
      ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
      ctx.fillText('PQL query received — no training code, no model selection',350,235);ctx.textAlign='left';
    }else if(s.phase==='sample'){
      var examples=[
        {label:'User:Bob',churn:true,color:'#f87171'},
        {label:'User:Carol',churn:false,color:'#10b981'},
        {label:'User:Dave',churn:true,color:'#f87171'},
        {label:'User:Eve',churn:false,color:'#10b981'},
      ];
      examples.forEach(function(ex,i){
        var x=60+i*150,y=155;
        drawRoundedRect(ctx,x,y,130,60,8,'#0d1117',ex.churn?'#f87171':'#10b981');
        ctx.fillStyle=ex.churn?'#f87171':'#10b981';ctx.font='bold 10px Inter,sans-serif';
        ctx.textAlign='center';ctx.fillText(ex.label,x+65,y+22);
        ctx.fillText(ex.churn?'✗ churned':'✓ retained',x+65,y+40);
        ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.fillText('90 days history',x+65,y+55);
        ctx.textAlign='left';
      });
      ctx.fillStyle='#f59e0b';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
      ctx.fillText('4 in-context examples sampled from historical data (no retraining)',350,235);ctx.textAlign='left';
    }else if(s.phase==='subgraph'){
      // Mini graph
      var cx=350,cy=190,r=55;
      [[0,'#7c3aed','Order'],[Math.PI/3*2,'#0ea5e9','Event'],[Math.PI/3*4,'#f59e0b','Support'],[Math.PI,'#10b981','Product']].forEach(function(n){
        var nx=cx+r*Math.cos(n[0]),ny=cy+r*Math.sin(n[0]);
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(nx,ny);ctx.strokeStyle=n[1]+'66';ctx.lineWidth=1.5;ctx.stroke();
        ctx.beginPath();ctx.arc(nx,ny,16,0,Math.PI*2);ctx.fillStyle=n[1]+'22';ctx.fill();ctx.strokeStyle=n[1];ctx.lineWidth=1.5;ctx.stroke();
        ctx.fillStyle=n[1];ctx.font='8px Inter,sans-serif';ctx.textAlign='center';ctx.fillText(n[2],nx,ny+3);ctx.textAlign='left';
      });
      ctx.beginPath();ctx.arc(cx,cy,22,0,Math.PI*2);ctx.fillStyle='#7c3aed33';ctx.fill();ctx.strokeStyle='#7c3aed';ctx.lineWidth=2;ctx.stroke();
      ctx.fillStyle='#7c3aed';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('Alice',cx,cy+3);ctx.textAlign='left';
      ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
      ctx.fillText('Subgraph extracted: orders, events, support tickets, products — all before query time T',350,235);ctx.textAlign='left';
    }else if(s.phase==='encode'){
      var colTypes=[{type:'num',label:'age: 32',color:'#0ea5e9'},{type:'cat',label:'tier: pro',color:'#10b981'},{type:'ts',label:'last_order: -14d',color:'#f59e0b'},{type:'txt',label:'support: angry',color:'#f87171'}];
      colTypes.forEach(function(col,i){
        var x=50+i*155,y=155;
        drawRoundedRect(ctx,x,y,130,40,6,'#0d1117',col.color+'44');
        ctx.fillStyle=col.color;ctx.font='10px JetBrains Mono,monospace';ctx.textAlign='center';ctx.fillText(col.label,x+65,y+24);ctx.textAlign='left';
      });
      ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('↓ Table-Width Invariant Column Encoder',350,210);ctx.textAlign='left';
      var vec=[0.82,0.41,0.95,0.23,0.67,0.11,0.78,0.56];
      ctx.fillStyle='#7c3aed';ctx.font='10px JetBrains Mono,monospace';ctx.textAlign='center';
      ctx.fillText('['+vec.map(function(v){return v.toFixed(2);}).join(', ')+'...]',350,230);ctx.textAlign='left';
    }else if(s.phase==='output'){
      drawRoundedRect(ctx,200,150,300,80,12,'#0d1117','#f87171');
      ctx.fillStyle='#f87171';ctx.font='bold 16px Inter,sans-serif';ctx.textAlign='center';
      ctx.fillText('P(churn) = 0.82',350,180);
      ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
      ctx.fillText('Top drivers: 3 support tickets, 0 orders (30d)',350,200);
      ctx.fillText('Confidence: HIGH  |  Calibrated probability',350,216);ctx.textAlign='left';
      ctx.fillStyle='#10b981';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
      ctx.fillText('1 PQL query → prediction in ~1 second (vs 12+ hours manually)',350,247);ctx.textAlign='left';
    }
  }
}
function initInContext(){drawInContext(-1);}

// ─── CANVAS 5: SYNTHETIC ────────────────────────────────────────────────────
var synTab='gen';
function setSynTab(tab){
  synTab=tab;
  ['gen','scale'].forEach(function(t){
    var el=document.getElementById('tab-syn-'+t);
    if(el)el.className='btn-tab'+(t===tab?' active':'');
  });
}
var synT=0;
function drawSynthetic(t){
  var c=document.getElementById('canvas-synthetic');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,360);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,360);
  if(synTab==='gen')drawSynGen(ctx,t);
  else drawSynScale(ctx,t);
}
function drawSynGen(ctx,t){
  // 3-stage pipeline
  var stages=[
    {label:'Schema\nGeneration',sub:'Directed graph of\ntables + column types',color:'#0ea5e9',x:60,y:120},
    {label:'Connectivity\nModeling',sub:'Bipartite PK→FK\ncardinality graph',color:'#7c3aed',x:270,y:120},
    {label:'Feature\nDistribution',sub:'Conditional causal\nmechanisms (SCMs)',color:'#10b981',x:480,y:120},
  ];
  // Input
  drawRoundedRect(ctx,60,30,130,40,8,'#0d1117','#30363d');
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('Prior over schemas',125,55);ctx.textAlign='left';
  ctx.beginPath();ctx.moveTo(125,70);ctx.lineTo(125,118);ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.stroke();
  stages.forEach(function(s,i){
    var pulse=1+Math.sin(t*2+i)*0.03;
    drawRoundedRect(ctx,s.x,s.y,170,100,10,s.color+'22',s.color);
    ctx.fillStyle=s.color;ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(s.label.split('\n')[0],s.x+85,s.y+24);
    ctx.fillText(s.label.split('\n')[1]||'',s.x+85,s.y+38);
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
    ctx.fillText(s.sub.split('\n')[0],s.x+85,s.y+62);
    ctx.fillText(s.sub.split('\n')[1]||'',s.x+85,s.y+76);
    ctx.textAlign='left';
    // Arrow
    if(i<2){
      var ax=s.x+170,ay=s.y+50;
      ctx.beginPath();ctx.moveTo(ax+4,ay);ctx.lineTo(ax+95,ay);
      ctx.strokeStyle=s.color+'88';ctx.lineWidth=1.5;ctx.stroke();
      var pp=(t*0.4+i*0.5)%1;
      ctx.beginPath();ctx.arc(lerp(ax+4,ax+95,pp),ay,3,0,Math.PI*2);
      ctx.fillStyle=s.color;ctx.fill();
    }
  });
  // Output stats
  ctx.fillStyle='#30363d';ctx.fillRect(60,250,580,80);
  ctx.strokeStyle='#30363d';ctx.strokeRect(60,250,580,80);
  var stats=[{v:'2M+',l:'synthetic tasks generated'},{v:'19',l:'real-world benchmarks'},{v:'Power-law',l:'scaling discovered'},{v:'0',l:'private databases needed'}];
  stats.forEach(function(st,i){
    var x=90+i*145;
    ctx.fillStyle='#f59e0b';ctx.font='bold 16px Inter,sans-serif';ctx.textAlign='center';ctx.fillText(st.v,x,278);
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.fillText(st.l,x,295);ctx.textAlign='left';
  });
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('RDB-PFN: first relational FM trained purely on synthetic data (arXiv:2603.03805)',350,346);ctx.textAlign='left';
}
function drawSynScale(ctx,t){
  // Power law scaling curve
  var ox=80,oy=280,w=580,h=220;
  // Axes
  ctx.strokeStyle='#30363d';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ox,oy-h);ctx.lineTo(ox,oy);ctx.lineTo(ox+w,oy);ctx.stroke();
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
  ctx.fillText('Synthetic Databases (log scale)',ox+w/2-60,oy+20);
  ctx.save();ctx.translate(ox-35,oy-h/2);ctx.rotate(-Math.PI/2);ctx.fillText('Test Loss (lower = better)',0,0);ctx.restore();
  // Grid lines
  for(var i=1;i<=5;i++){
    var gy=oy-i*h/5;
    ctx.beginPath();ctx.moveTo(ox,gy);ctx.lineTo(ox+w,gy);
    ctx.strokeStyle='#30363d44';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
  }
  // Power law curve for two methods
  var colors=['#0ea5e9','#7c3aed','#10b981'];
  var labels=['RDB-PFN','PLUREL','Supervised baseline'];
  [[0.8,0.3],[0.9,0.2],[0,0]].forEach(function(params,ci){
    if(ci===2){
      // Flat supervised baseline
      ctx.beginPath();ctx.moveTo(ox,oy-h*0.45);ctx.lineTo(ox+w,oy-h*0.45);
      ctx.strokeStyle=colors[ci]+'66';ctx.lineWidth=1.5;ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=colors[ci];ctx.font='10px Inter,sans-serif';ctx.fillText('Supervised (fixed)',ox+w-120,oy-h*0.45-5);
      return;
    }
    var animLen=Math.min(1,(t*0.3)%3);
    ctx.beginPath();
    for(var j=0;j<=100;j++){
      var frac=j/100*animLen;
      var x2=ox+frac*w;
      // Power law: loss = A * x^(-alpha) + baseline
      var logX=Math.log(1+frac*20);
      var loss=params[0]*Math.exp(-logX*1.8)+params[1]+0.02;
      var y2=oy-loss*h;
      if(j===0)ctx.moveTo(x2,y2);else ctx.lineTo(x2,y2);
    }
    ctx.strokeStyle=colors[ci];ctx.lineWidth=2.5;ctx.stroke();
    // Label
    var finalLoss=params[0]*Math.exp(-Math.log(21)*1.8)+params[1]+0.02;
    ctx.fillStyle=colors[ci];ctx.font='bold 10px Inter,sans-serif';ctx.fillText(labels[ci],ox+w+4,oy-finalLoss*h);
  });
  // X axis labels
  ['100','1K','10K','100K','1M','10M'].forEach(function(l,i){
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(l,ox+i*(w/5),oy+12);ctx.textAlign='left';
  });
  ctx.fillStyle='#f59e0b';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('PLUREL (arXiv:2602.04029): power-law scaling — more synthetic data reliably improves real-world performance',350,310);
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
  ctx.fillText('Same scaling recipe that drove LLM progress now available for relational databases',350,328);ctx.textAlign='left';
}
function initSynthetic(){
  var c=document.getElementById('canvas-synthetic');if(!c)return;
  var t=0;
  function frame(){t+=0.02;drawSynthetic(t);requestAnimationFrame(frame);}
  frame();
}

// ─── CANVAS 6: RELBENCH ─────────────────────────────────────────────────────
var RB_DATASETS=[
  {id:'rel-stack',domain:'Q&A / Social',tables:8,rows:'16M',color:'#0ea5e9',tasks:['User engagement','Post votes','Badge prediction'],x:50,y:60},
  {id:'rel-amazon',domain:'E-commerce',tables:7,rows:'48M',color:'#f59e0b',tasks:['Product rating','Recommendation','Churn'],x:230,y:60},
  {id:'rel-trial',domain:'Medical',tables:5,rows:'3M',color:'#f87171',tasks:['Trial success','Patient outcomes'],x:410,y:60},
  {id:'rel-f1',domain:'Sports',tables:9,rows:'1.2M',color:'#10b981',tasks:['Race results','Driver performance'],x:590,y:60},
  {id:'rel-hm',domain:'Fashion',tables:4,rows:'31M',color:'#a78bfa',tasks:['Purchase prediction','Recommendation'],x:50,y:200},
  {id:'rel-mimic',domain:'Healthcare',tables:15,rows:'22M',color:'#f87171',tasks:['ICU mortality','Readmission'],x:230,y:200},
  {id:'rel-arxiv',domain:'Academic',tables:5,rows:'8M',color:'#38bdf8',tasks:['Citation prediction','Author linkage'],x:410,y:200},
  {id:'rel-salt',domain:'Supply Chain',tables:6,rows:'5M',color:'#fbbf24',tasks:['Demand forecast','Inventory prediction'],x:590,y:200},
];
var selectedRBDataset=null;
function drawRelbench(){
  var c=document.getElementById('canvas-relbench');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,360);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,360);
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('RelBench datasets — click to explore tasks',14,22);
  RB_DATASETS.forEach(function(d){
    var isActive=selectedRBDataset===d.id;
    drawRoundedRect(ctx,d.x,d.y,150,110,10,isActive?d.color+'22':'#1e2530',isActive?d.color:'#30363d');
    ctx.fillStyle=d.color;ctx.font='bold 11px Inter,sans-serif';ctx.fillText(d.id,d.x+10,d.y+22);
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';
    ctx.fillText(d.domain,d.x+10,d.y+38);
    ctx.fillText(d.tables+' tables  '+d.rows+' rows',d.x+10,d.y+52);
    ctx.fillStyle=isActive?d.color:'#30363d';ctx.font='8px Inter,sans-serif';
    d.tasks.slice(0,2).forEach(function(task,i){ctx.fillText('• '+task,d.x+10,d.y+68+i*14);});
    if(isActive){
      ctx.strokeStyle=d.color;ctx.lineWidth=1.5;ctx.strokeRect(d.x+1,d.y+1,148,108);
    }
  });
  // Task type legend
  var types=[{t:'Classification',c:'#0ea5e9'},{t:'Regression',c:'#10b981'},{t:'Link Prediction',c:'#7c3aed'}];
  var lx=50,ly=338;
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.fillText('Task types:',lx,ly);
  types.forEach(function(type,i){
    ctx.beginPath();ctx.arc(lx+90+i*120,ly-4,5,0,Math.PI*2);ctx.fillStyle=type.c;ctx.fill();
    ctx.fillStyle='#8b949e';ctx.fillText(type.t,lx+100+i*120,ly);
  });
}
function initRelbench(){
  drawRelbench();
  var c=document.getElementById('canvas-relbench');if(!c)return;
  c.addEventListener('click',function(e){
    var rect=c.getBoundingClientRect();
    var mx=e.clientX-rect.left,my=e.clientY-rect.top;
    var hit=null;
    RB_DATASETS.forEach(function(d){if(mx>=d.x&&mx<=d.x+150&&my>=d.y&&my<=d.y+110)hit=d.id;});
    selectedRBDataset=hit===selectedRBDataset?null:hit;
    drawRelbench();
    var panel=document.getElementById('rb-info');
    if(panel&&hit){
      var d=RB_DATASETS.find(function(x){return x.id===hit;});
      if(d)panel.innerHTML='<strong style="color:'+d.color+'">'+d.id+'</strong> — '+d.domain+'<br>'+d.tables+' tables, ~'+d.rows+' rows<br><strong>Tasks:</strong> '+d.tasks.join(', ');
    }else if(panel){panel.innerHTML='<strong>Select a dataset</strong> above to see its domain, schema size, and available tasks.';}
  });
}

// ─── CANVAS 7: RESULTS ───────────────────────────────────────────────────────
var resTab='time';
function setResTab(tab){
  resTab=tab;
  ['time','code','acc'].forEach(function(t){
    var el=document.getElementById('tab-res-'+t);
    if(el)el.className='btn-tab'+(t===tab?' active':'');
  });
}
var resT=0;
var resBarProgress=0;
function drawResults(t){
  var c=document.getElementById('canvas-results');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,360);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,360);
  if(resTab==='time')drawResTime(ctx,t);
  else if(resTab==='code')drawResCode(ctx,t);
  else drawResAcc(ctx,t);
}
function drawResTime(ctx,t){
  var anim=Math.min(1,t*0.3);
  var methods=[
    {label:'KumoRFM\n(zero-shot)',time:1,unit:'second',color:'#10b981',maxBar:0.008},
    {label:'KumoRFM\n(fine-tuned)',time:5,unit:'seconds',color:'#0ea5e9',maxBar:0.04},
    {label:'Traditional\nRDL baseline',time:1800,unit:'seconds\n(30 min)',color:'#f59e0b',maxBar:0.97},
    {label:'Human data\nscientist',time:44280,unit:'seconds\n(12.3 hrs)',color:'#f87171',maxBar:1.0},
  ];
  var maxT=44280;
  var ox=160,oy=40,bh=52,gap=14;
  methods.forEach(function(m,i){
    var y=oy+i*(bh+gap);
    var barW=Math.round(lerp(0,480,m.maxBar)*easeInOut(Math.min(1,anim*1.5)));
    drawRoundedRect(ctx,ox,y,barW||2,bh,6,m.color+'22',m.color+'44');
    drawRoundedRect(ctx,ox,y,barW||2,bh,6,m.color+'22',m.color);
    ctx.fillStyle=m.color;ctx.font='bold 11px Inter,sans-serif';
    var parts=m.label.split('\n');
    ctx.textAlign='right';ctx.fillText(parts[0],ox-8,y+24);ctx.fillText(parts[1]||'',ox-8,y+38);ctx.textAlign='left';
    if(barW>60){
      ctx.fillStyle='#fff';ctx.font='bold 12px Inter,sans-serif';
      ctx.fillText(m.time<60?m.time+'s':m.time>=3600?Math.round(m.time/3600*10)/10+'h':Math.round(m.time/60)+'m',ox+8,y+30);
    }
  });
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Time to first prediction on a new task (log-scale proportional)',350,320);
  ctx.fillStyle='#10b981';ctx.fillText('KumoRFM is ~44,000× faster than a human data scientist for setup',350,340);ctx.textAlign='left';
}
function drawResCode(ctx,t){
  var anim=Math.min(1,t*0.3);
  var methods=[
    {label:'KumoRFM',lines:1,color:'#10b981'},
    {label:'RDL baseline',lines:56,color:'#0ea5e9'},
    {label:'Traditional\nfeature engineering',lines:878,color:'#f87171'},
  ];
  var ox=200,oy=50,bw=60,gap=80;
  var maxLines=878;
  methods.forEach(function(m,i){
    var x=ox+i*(bw+gap);
    var barH=Math.round(lerp(0,220,m.lines/maxLines)*easeInOut(Math.min(1,anim*2)));
    var y=290-barH;
    drawRoundedRect(ctx,x,y,bw,barH||2,6,m.color+'22',m.color);
    ctx.fillStyle=m.color;ctx.font='bold 16px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText(m.lines+(m.lines===1?' line':' lines'),x+bw/2,y-10);
    var parts=m.label.split('\n');
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
    ctx.fillText(parts[0],x+bw/2,308);
    if(parts[1])ctx.fillText(parts[1],x+bw/2,322);
    ctx.textAlign='left';
  });
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(160,290);ctx.lineTo(560,290);ctx.stroke();
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Lines of code required to run a new prediction task',350,346);ctx.textAlign='left';
}
function drawResAcc(ctx,t){
  var anim=Math.min(1,t*0.3);
  var tasks=[
    {task:'User Churn',zeroshot:62,finetuned:74,baseline:68,color:'#0ea5e9'},
    {task:'Fraud Detection',zeroshot:71,finetuned:83,baseline:75,color:'#f59e0b'},
    {task:'LTV Prediction',zeroshot:58,finetuned:71,baseline:63,color:'#7c3aed'},
    {task:'Recommendation\n(MAP@10)',zeroshot:34,finetuned:42,baseline:38,color:'#10b981'},
  ];
  var ox=80,oy=280,w=540,bw=16,gap=4,groupGap=28;
  tasks.forEach(function(task,gi){
    var gx=ox+gi*(bw*3+gap*2+groupGap);
    var bars=[
      {val:task.zeroshot,color:task.color+'88',label:'Zero-shot'},
      {val:task.finetuned,color:task.color,label:'Fine-tuned'},
      {val:task.baseline,color:'#30363d',label:'Baseline'},
    ];
    bars.forEach(function(b,bi){
      var x=gx+bi*(bw+gap);
      var barH=Math.round(b.val/100*180*easeInOut(Math.min(1,anim*2)));
      drawRoundedRect(ctx,x,oy-barH,bw,barH||2,3,b.color,b.color);
      ctx.fillStyle=b.color;ctx.font='8px Inter,sans-serif';ctx.textAlign='center';
      if(barH>14)ctx.fillText(b.val+'%',x+bw/2,oy-barH-3);
      ctx.textAlign='left';
    });
    ctx.fillStyle=task.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';
    var tparts=task.task.split('\n');
    ctx.fillText(tparts[0],gx+(bw*3+gap*2)/2,oy+14);
    if(tparts[1])ctx.fillText(tparts[1],gx+(bw*3+gap*2)/2,oy+26);
    ctx.textAlign='left';
  });
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(60,280);ctx.lineTo(660,280);ctx.stroke();
  // Legend
  var legend=[{c:'#0ea5e9',l:'Zero-shot'},{c:'#0ea5e9',l:'Fine-tuned'},{c:'#30363d',l:'Baseline'}];
  ctx.fillStyle='#0ea5e988';ctx.fillRect(60,310,14,10);ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.fillText('Zero-shot',78,319);
  ctx.fillStyle='#0ea5e9';ctx.fillRect(148,310,14,10);ctx.fillText('Fine-tuned',166,319);
  ctx.fillStyle='#30363d';ctx.fillRect(240,310,14,10);ctx.fillText('Baseline (feature eng.)',258,319);
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Accuracy on RelBench tasks (higher = better) — averaged across domain variants',350,346);ctx.textAlign='left';
}
function initResults(){
  var c=document.getElementById('canvas-results');if(!c)return;
  var t=0;
  function frame(){t+=0.02;drawResults(t);requestAnimationFrame(frame);}
  frame();
}

// ─── FEATURE ENGINEERING COMPLEXITY SCALER ──────────────────────────────────
function updateFEScale(n){
  document.getElementById('fe-table-val').textContent=n;
  drawFEScale(parseInt(n));
}
function drawFEScale(n){
  var c=document.getElementById('canvas-fe-scale');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,200);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,200);
  var manualJoins=n*(n-1)/2;
  var maxManual=10*9/2; // 45
  // Left side: Manual joins O(n²)
  var lx=40,ly=160,lw=280,barH=Math.round(manualJoins/maxManual*120);
  drawRoundedRect(ctx,lx+60,ly-barH,80,barH,4,'#f87171','#f87171');
  ctx.fillStyle='#f87171';ctx.font='bold 22px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText(manualJoins,lx+100,ly-barH-10);
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('manual joins needed',lx+100,ly+16);
  ctx.fillText('O(n²) growth',lx+100,ly+30);
  // Table node mini-viz
  var allJoins=[];
  for(var i=0;i<n;i++){for(var j=i+1;j<n;j++){allJoins.push([i,j]);}}
  var vizX=lx+180,vizY=ly-80,vizR=50;
  allJoins.forEach(function(pair){
    var a1=pair[0]/n*Math.PI*2-Math.PI/2,a2=pair[1]/n*Math.PI*2-Math.PI/2;
    ctx.beginPath();ctx.moveTo(vizX+vizR*Math.cos(a1),vizY+vizR*Math.sin(a1));
    ctx.lineTo(vizX+vizR*Math.cos(a2),vizY+vizR*Math.sin(a2));
    ctx.strokeStyle='#f8717166';ctx.lineWidth=1;ctx.stroke();
  });
  for(var i=0;i<n;i++){
    var angle=i/n*Math.PI*2-Math.PI/2;
    var nx=vizX+vizR*Math.cos(angle),ny=vizY+vizR*Math.sin(angle);
    ctx.beginPath();ctx.arc(nx,ny,7,0,Math.PI*2);
    ctx.fillStyle='#f87171';ctx.fill();
  }
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(350,20);ctx.lineTo(350,170);ctx.stroke();
  // Right side: Graph GNN O(n)
  var rx=360;
  var graphOps=n;
  var gBarH=Math.round(graphOps/10*120);
  drawRoundedRect(ctx,rx+60,ly-gBarH,80,gBarH,4,'#10b981','#10b981');
  ctx.fillStyle='#10b981';ctx.font='bold 22px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText(graphOps,rx+100,ly-gBarH-10);
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('graph edges added',rx+100,ly+16);
  ctx.fillText('O(n) growth',rx+100,ly+30);
  // Star graph mini-viz
  var gvx=rx+210,gvy=ly-80;
  ctx.beginPath();ctx.arc(gvx,gvy,8,0,Math.PI*2);ctx.fillStyle='#7c3aed';ctx.fill();
  for(var i=0;i<n;i++){
    var angle=i/n*Math.PI*2-Math.PI/2;
    var nx=gvx+vizR*Math.cos(angle),ny=gvy+vizR*Math.sin(angle);
    ctx.beginPath();ctx.moveTo(gvx,gvy);ctx.lineTo(nx,ny);ctx.strokeStyle='#10b98166';ctx.lineWidth=1.5;ctx.stroke();
    ctx.beginPath();ctx.arc(nx,ny,7,0,Math.PI*2);ctx.fillStyle='#10b981';ctx.fill();
  }
  // Labels
  ctx.fillStyle='#f87171';ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('Manual Joins',lx+100,14);
  ctx.fillStyle='#10b981';ctx.fillText('Graph (RDL / KumoRFM)',rx+100,14);
  ctx.textAlign='left';
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(40,ly+2);ctx.lineTo(660,ly+2);ctx.stroke();
}

// ─── TEMPORAL LEAKAGE VISUALIZER ─────────────────────────────────────────────
var leakageCutoff=0.6;
var leakageDragging=false;
function leakageAccuracy(cutoff){
  // >0.5 = correct split, <0.5 = leakage
  if(cutoff>=0.7)return{train:84,test:81,status:'good',label:'No leakage ✓'};
  if(cutoff>=0.55)return{train:87,test:79,status:'warn',label:'Minor overlap'};
  if(cutoff>=0.4)return{train:93,test:51,status:'bad',label:'Significant leakage!'};
  return{train:98,test:22,status:'bad',label:'Severe leakage — model is useless in production'};
}
function drawLeakage(){
  var c=document.getElementById('canvas-leakage');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,220);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,220);
  var ox=60,tw=580,ty=60,th=80;
  var cutX=ox+leakageCutoff*tw;
  var acc=leakageAccuracy(leakageCutoff);
  // Timeline background zones
  ctx.fillStyle='#0ea5e911';ctx.fillRect(ox,ty,cutX-ox,th); // train
  if(leakageCutoff<0.75){
    ctx.fillStyle='#f8717133';ctx.fillRect(cutX,ty,Math.max(0,ox+tw*0.75-cutX),th); // leak zone
  }
  ctx.fillStyle='#10b98111';ctx.fillRect(Math.max(cutX,ox+tw*0.75),ty,ox+tw-Math.max(cutX,ox+tw*0.75),th); // test
  // Timeline axis
  ctx.strokeStyle='#30363d';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ox,ty+th+10);ctx.lineTo(ox+tw,ty+th+10);ctx.stroke();
  // Time labels
  ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].forEach(function(m,i){
    var x=ox+i*(tw/11);
    ctx.fillStyle='#30363d';ctx.beginPath();ctx.moveTo(x,ty+th+8);ctx.lineTo(x,ty+th+16);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';ctx.fillText(m,x,ty+th+26);
  });
  ctx.textAlign='left';
  // Events (dots on timeline)
  var rand=seededRand(42);
  for(var i=0;i<60;i++){
    var ex=ox+rand()*tw,ey=ty+10+rand()*(th-20);
    var isLeak=ex>cutX&&ex<ox+tw*0.75;
    ctx.beginPath();ctx.arc(ex,ey,3,0,Math.PI*2);
    ctx.fillStyle=isLeak?'#f87171':(ex<cutX?'#0ea5e9':'#10b981');
    ctx.fill();
  }
  // Zone labels
  ctx.fillStyle='#0ea5e9';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('TRAIN',ox+(cutX-ox)/2,ty+th/2+4);
  if(leakageCutoff<0.75){
    ctx.fillStyle='#f87171';
    ctx.fillText('LEAK',cutX+(ox+tw*0.75-cutX)/2,ty+th/2+4);
  }
  ctx.fillStyle='#10b981';
  var testStart=Math.max(cutX,ox+tw*0.75);
  ctx.fillText('TEST',testStart+(ox+tw-testStart)/2,ty+th/2+4);
  ctx.textAlign='left';
  // Draggable cutoff line
  ctx.strokeStyle='#f87171';ctx.lineWidth=2.5;
  ctx.beginPath();ctx.moveTo(cutX,ty-15);ctx.lineTo(cutX,ty+th+8);ctx.stroke();
  // Drag handle
  ctx.beginPath();ctx.arc(cutX,ty-15,8,0,Math.PI*2);
  ctx.fillStyle='#f87171';ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.fillText('⇔',cutX,ty-12);ctx.textAlign='left';
  // Accuracy bars
  var bx=ox,by=180,bw=260,bh=24;
  ['Train accuracy','Test accuracy'].forEach(function(lbl,i){
    var val=i===0?acc.train:acc.test;
    var color=i===0?'#0ea5e9':(acc.status==='good'?'#10b981':acc.status==='warn'?'#f59e0b':'#f87171');
    drawRoundedRect(ctx,bx+i*300,by,Math.round(val/100*bw),bh,4,color+'44',color);
    ctx.fillStyle=color;ctx.font='bold 11px Inter,sans-serif';
    ctx.fillText(lbl+': '+val+'%',bx+i*300+6,by+16);
  });
  // Status
  var statusColor=acc.status==='good'?'#10b981':acc.status==='warn'?'#f59e0b':'#f87171';
  ctx.fillStyle=statusColor;ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='right';
  ctx.fillText(acc.label,ox+tw,195);ctx.textAlign='left';
  // Update info panel
  var panel=document.getElementById('leakage-info');
  if(panel){
    if(acc.status==='good'){panel.innerHTML='<strong style="color:#10b981">No leakage ✓</strong> — Cutoff is after 70% of data. Train and test are cleanly separated. Model will perform similarly in production.';}
    else if(acc.status==='warn'){panel.innerHTML='<strong style="color:#f59e0b">Minor overlap</strong> — Some future events are bleeding into training features. Train accuracy is slightly inflated. Production accuracy will be lower than measured.';}
    else{panel.innerHTML='<strong style="color:#f87171">Leakage detected!</strong> — Future events (red dots) are included in training features. The model has learned from the future. Test accuracy of '+acc.test+'% will collapse to near-random in production. This is the most common silent failure in production ML.';}
  }
}
function initLeakage(){
  var c=document.getElementById('canvas-leakage');if(!c)return;
  drawLeakage();
  function getCutoff(e){
    var rect=c.getBoundingClientRect();
    var mx=(e.clientX||e.touches[0].clientX)-rect.left;
    return Math.max(0.05,Math.min(0.98,(mx-60)/580));
  }
  c.addEventListener('mousedown',function(e){leakageDragging=true;leakageCutoff=getCutoff(e);drawLeakage();});
  window.addEventListener('mousemove',function(e){if(leakageDragging){leakageCutoff=getCutoff(e);drawLeakage();}});
  window.addEventListener('mouseup',function(){leakageDragging=false;});
}

// ─── GNN HOP DEPTH EXPLORER ───────────────────────────────────────────────────
var hopDepth=1;
var HOP_COLORS=['#0ea5e9','#7c3aed','#f59e0b','#10b981','#f87171'];
var HOP_NODES=[
  {id:0,label:'User\nAlice',type:'center',x:350,y:150,r:28,color:'#7c3aed'},
  {id:1,label:'Order\n#10',type:'hop1',x:180,y:80,r:22,color:'#0ea5e9'},
  {id:2,label:'Order\n#11',type:'hop1',x:180,y:210,r:22,color:'#0ea5e9'},
  {id:3,label:'Event\nview',type:'hop1',x:520,y:80,r:22,color:'#0ea5e9'},
  {id:4,label:'Support\n#3',type:'hop1',x:520,y:210,r:22,color:'#0ea5e9'},
  {id:5,label:'Product\nA',type:'hop2',x:60,y:50,r:18,color:'#f59e0b'},
  {id:6,label:'Product\nB',type:'hop2',x:60,y:250,r:18,color:'#f59e0b'},
  {id:7,label:'User\nBob',type:'hop2',x:620,y:50,r:18,color:'#f59e0b'},
  {id:8,label:'User\nCarol',type:'hop2',x:620,y:250,r:18,color:'#f59e0b'},
  {id:9,label:'Category\nElectronics',type:'hop3',x:30,y:150,r:15,color:'#10b981'},
  {id:10,label:'Purchase\nHistory',type:'hop3',x:670,y:150,r:15,color:'#10b981'},
];
var HOP_EDGES=[
  {a:0,b:1,label:'has order'},{a:0,b:2,label:'has order'},{a:0,b:3,label:'triggered'},{a:0,b:4,label:'filed'},
  {a:1,b:5,label:'product'},{a:2,b:6,label:'product'},{a:3,b:7,label:'similar user'},{a:4,b:8,label:'similar user'},
  {a:5,b:9,label:'category'},{a:7,b:10,label:'history'},
];
var HOP_SQL=['Direct JOIN (1 table)','Two-level JOIN chain (2 tables)','Complex 3-way JOIN (data engineer hours)'];
function updateHopDepth(n){
  hopDepth=parseInt(n);
  document.getElementById('hop-val').textContent=n+' hop'+(n>1?'s':'');
  drawHopDepth();
  var infos=[
    '<strong>1 hop:</strong> Direct neighbors — orders, events, support tickets connected directly to Alice. Equivalent SQL: <code>JOIN orders ON orders.user_id = users.id</code>',
    '<strong>2 hops:</strong> Neighbors of neighbors — products ordered, other users who ordered same products. Equivalent SQL: <code>JOIN orders o ON ... JOIN products p ON o.product_id = p.id</code>. Each hop doubles the relational context.',
    '<strong>3 hops:</strong> Full relational neighborhood — product categories, purchase history patterns, global trends. The equivalent SQL query would take a senior data engineer half a day to write and is prone to data leakage errors.',
  ];
  var panel=document.getElementById('hop-info');if(panel)panel.innerHTML=infos[hopDepth-1];
}
function drawHopDepth(){
  var c=document.getElementById('canvas-hop');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,300);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,300);
  var typeDepth={center:0,hop1:1,hop2:2,hop3:3};
  // Draw edges
  HOP_EDGES.forEach(function(e){
    var an=HOP_NODES[e.a],bn=HOP_NODES[e.b];
    var ad=typeDepth[an.type],bd=typeDepth[bn.type];
    var maxD=Math.max(ad,bd);
    var active=maxD<=hopDepth;
    ctx.beginPath();ctx.moveTo(an.x,an.y);ctx.lineTo(bn.x,bn.y);
    ctx.strokeStyle=active?HOP_COLORS[maxD-1]+'66':'#30363d33';
    ctx.lineWidth=active?2:1;ctx.setLineDash(active?[]:[3,3]);ctx.stroke();ctx.setLineDash([]);
    if(active){
      var mx=(an.x+bn.x)/2,my=(an.y+bn.y)/2;
      ctx.fillStyle=HOP_COLORS[maxD-1]+'88';ctx.font='8px Inter,sans-serif';ctx.textAlign='center';
      ctx.fillText(e.label,mx,my-4);ctx.textAlign='left';
    }
  });
  // Draw nodes
  HOP_NODES.forEach(function(n){
    var depth=typeDepth[n.type];
    var active=depth===0||depth<=hopDepth;
    var alpha=active?1:0.2;
    ctx.globalAlpha=alpha;
    ctx.beginPath();ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
    ctx.fillStyle=n.color+'33';ctx.fill();
    ctx.strokeStyle=n.color;ctx.lineWidth=depth===0?2.5:1.5;ctx.stroke();
    ctx.fillStyle=n.color;ctx.font='bold '+(depth===0?11:9)+'px Inter,sans-serif';ctx.textAlign='center';
    var parts=n.label.split('\n');
    ctx.fillText(parts[0],n.x,n.y-(parts[1]?5:2));
    if(parts[1]){ctx.fillStyle='#c9d1d9';ctx.font='8px Inter,sans-serif';ctx.fillText(parts[1],n.x,n.y+7);}
    ctx.textAlign='left';ctx.globalAlpha=1;
  });
  // Hop ring indicators
  for(var h=1;h<=3;h++){
    var active=h<=hopDepth;
    ctx.beginPath();ctx.arc(350,150,h*90,0,Math.PI*2);
    ctx.strokeStyle=active?HOP_COLORS[h-1]+'22':'#30363d11';
    ctx.lineWidth=active?1:0.5;ctx.setLineDash([4,8]);ctx.stroke();ctx.setLineDash([]);
    if(active){
      ctx.fillStyle=HOP_COLORS[h-1];ctx.font='9px Inter,sans-serif';
      ctx.fillText('hop '+h,350+h*90+4,152);
    }
  }
  // SQL equivalent
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
  ctx.fillText('SQL equivalent: '+HOP_SQL[hopDepth-1],14,288);
  ctx.fillStyle=HOP_COLORS[hopDepth-1];ctx.font='bold 11px Inter,sans-serif';
  ctx.fillText('Active nodes: '+(hopDepth===1?5:hopDepth===2?9:11),500,288);
}

// ─── PQL QUERY BUILDER ────────────────────────────────────────────────────────
var pqlAggs={count:true,sum:true,first:false,list:false};
var PQL_META={
  churn:{entity:'users',filter:"subscription_tier = 'pro'",table:'orders',output:'Binary classification',example:'P(churn) = 0.82 — HIGH risk. Likely drivers: 0 orders in 30d, 3 support tickets.'},
  fraud:{entity:'transactions',filter:"amount > 50",table:'accounts',output:'Regression (0–1 score)',example:'fraud_score = 0.94 — Flag for manual review. Unusual location + velocity.'},
  ltv:{entity:'users',filter:"age_days > 30",table:'purchases',output:'Regression ($ value)',example:'ltv_90d = $284.50 — Top 15% of user cohort.'},
  recommend:{entity:'users',filter:"active_last_7d = true",table:'interactions',output:'Link prediction (ranked list)',example:'next_purchase_item = [SKU-4821, SKU-0033, SKU-7792] — MAP@3 = 0.41'},
};
var AGG_LINES={count:'COUNT(*)',sum:'SUM(amount)',first:'FIRST(event_type)',list:'LIST_DISTINCT(category)'};
function toggleAgg(agg){
  pqlAggs[agg]=!pqlAggs[agg];
  var el=document.getElementById('agg-'+agg);
  if(el)el.className='btn-tab'+(pqlAggs[agg]?' active':'');
  updatePQL();
}
function updatePQL(){
  var target=document.getElementById('pql-target');if(!target)return;
  var tval=target.value;
  var window=document.getElementById('pql-window').value;
  var meta=PQL_META[tval];
  var aggLines=Object.keys(pqlAggs).filter(function(k){return pqlAggs[k];}).map(function(k){return '          '+meta.table+': '+AGG_LINES[k];}).join('\n');
  var pql='PREDICT '+meta.entity.replace(/s$/,'')+'.'+tval+(tval==='recommend'?'_item':tval==='fraud'?'_score':tval==='ltv'?'_90d':'_30d')+'\nFOR '+meta.entity+' WHERE '+meta.filter+'\nUSING HISTORY '+window+' DAYS';
  if(aggLines)pql+='\nAGGREGATE\n'+aggLines;
  var out=document.getElementById('pql-output');
  if(out)out.textContent=pql;
  var res=document.getElementById('pql-result');
  if(res)res.innerHTML='<strong>Output type:</strong> '+meta.output+'<br><strong>Example result:</strong> '+meta.example;
}

// ─── IN-CONTEXT EXAMPLES vs ACCURACY ─────────────────────────────────────────
function updateICExamples(n){
  n=parseInt(n);
  document.getElementById('ic-examples-val').textContent=n;
  drawICAccuracy(n);
}
function drawICAccuracy(n){
  var c=document.getElementById('canvas-ic-acc');if(!c)return;
  var ctx=c.getContext('2d');
  ctx.clearRect(0,0,700,220);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,700,220);
  var ox=70,oy=180,w=580,h=140;
  // Grid
  for(var i=0;i<=4;i++){
    var gy=oy-i*h/4;
    ctx.beginPath();ctx.moveTo(ox,gy);ctx.lineTo(ox+w,gy);
    ctx.strokeStyle='#30363d44';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='right';
    ctx.fillText((40+i*15)+'%',ox-5,gy+3);ctx.textAlign='left';
  }
  // Axes
  ctx.strokeStyle='#30363d';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(ox,oy-h-10);ctx.lineTo(ox,oy);ctx.lineTo(ox+w,oy);ctx.stroke();
  // Three method curves
  var methods=[
    {label:'KumoRFM (in-context)',color:'#10b981',fn:function(x){return 0.48+0.28*(1-Math.exp(-x*0.4));}},
    {label:'LLM few-shot baseline',color:'#7c3aed',fn:function(x){return 0.38+0.18*(1-Math.exp(-x*0.5));}},
    {label:'Zero training (random)',color:'#30363d',fn:function(x){return 0.42;},dash:true},
  ];
  methods.forEach(function(m){
    ctx.beginPath();
    for(var x=0;x<=16;x++){
      var acc=m.fn(x);
      var px=ox+x/16*w,py=oy-(acc-0.4)/0.4*h;
      if(x===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.strokeStyle=m.color;ctx.lineWidth=m.dash?1.5:2.5;
    if(m.dash)ctx.setLineDash([5,5]);ctx.stroke();ctx.setLineDash([]);
    var acc=m.fn(16);
    ctx.fillStyle=m.color;ctx.font='bold 9px Inter,sans-serif';ctx.fillText(m.label,ox+w+4,oy-(acc-0.4)/0.4*h+3);
  });
  // Current n marker
  var curAcc=methods[0].fn(n);
  var px=ox+n/16*w,py=oy-(curAcc-0.4)/0.4*h;
  ctx.beginPath();ctx.arc(px,py,7,0,Math.PI*2);ctx.fillStyle='#10b981';ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();
  // Vertical guide
  ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px,oy);
  ctx.strokeStyle='#10b98144';ctx.lineWidth=1;ctx.setLineDash([3,3]);ctx.stroke();ctx.setLineDash([]);
  // X-axis labels
  [0,2,4,6,8,10,12,14,16].forEach(function(x){
    ctx.fillStyle=x===n?'#10b981':'#8b949e';ctx.font=x===n?'bold 9px Inter,sans-serif':'9px Inter,sans-serif';
    ctx.textAlign='center';ctx.fillText(x,ox+x/16*w,oy+12);ctx.textAlign='left';
  });
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('Number of in-context examples',ox+w/2,oy+26);ctx.textAlign='left';
  // Info panel
  var panel=document.getElementById('ic-acc-info');
  if(panel){
    var accPct=Math.round(curAcc*100);
    var msg=n===0?'<strong style="color:#f87171">0 examples:</strong> Model uses prior knowledge only. Accuracy ~48% — barely above chance for binary classification.'
      :n<=4?'<strong style="color:#f59e0b">'+n+' examples:</strong> Accuracy climbs to ~'+accPct+'%. Even a few examples provide strong signal about local data distribution.'
      :n<=8?'<strong style="color:#10b981">'+n+' examples:</strong> '+accPct+'% accuracy. Approaching plateau — each new example gives diminishing returns beyond this point.'
      :'<strong style="color:#10b981">'+n+' examples:</strong> '+accPct+'% accuracy. Near-plateau. Adding more context barely helps. Same shape as LLM few-shot scaling curves.';
    panel.innerHTML=msg;
  }
}

// ─── METHOD COMPARISON MATRIX ────────────────────────────────────────────────
var MATRIX_METHODS=['Traditional\nFE','AutoML','Supervised\nRDL','KumoRFM\nzero-shot','KumoRFM\nfine-tuned'];
var MATRIX_DIMS=['Setup time','Code needed','Leakage risk','Handles new tasks?','Accuracy','Explainability'];
var MATRIX_DATA=[
  // setup time
  [{v:'12+ hrs',c:'#f87171',s:0},{v:'2–4 hrs',c:'#f59e0b',s:1},{v:'1–2 hrs',c:'#f59e0b',s:1},{v:'~1 sec',c:'#10b981',s:2},{v:'~5 min',c:'#10b981',s:2}],
  // code needed
  [{v:'878 lines',c:'#f87171',s:0},{v:'~50 lines',c:'#f59e0b',s:1},{v:'~100 lines',c:'#f59e0b',s:1},{v:'1 line (PQL)',c:'#10b981',s:2},{v:'~20 lines',c:'#10b981',s:2}],
  // leakage risk
  [{v:'HIGH',c:'#f87171',s:0},{v:'Medium',c:'#f59e0b',s:1},{v:'Low',c:'#10b981',s:2},{v:'None',c:'#10b981',s:2},{v:'None',c:'#10b981',s:2}],
  // new tasks
  [{v:'No — rewrite',c:'#f87171',s:0},{v:'Partial',c:'#f59e0b',s:1},{v:'Partial',c:'#f59e0b',s:1},{v:'Yes — instant',c:'#10b981',s:2},{v:'Yes — fast',c:'#10b981',s:2}],
  // accuracy
  [{v:'Baseline',c:'#0ea5e9',s:1},{v:'Good',c:'#0ea5e9',s:1},{v:'Better',c:'#10b981',s:2},{v:'+2–8%',c:'#10b981',s:2},{v:'+10–30%',c:'#10b981',s:2}],
  // explainability
  [{v:'Manual',c:'#f59e0b',s:1},{v:'Limited',c:'#f59e0b',s:1},{v:'Limited',c:'#f59e0b',s:1},{v:'Built-in',c:'#10b981',s:2},{v:'Full',c:'#10b981',s:2}],
];
var MATRIX_DETAIL=[
  // setup time
  ['878 lines of SQL joins + feature engineering scripts. Data scientist typically needs a full day to set up a new prediction task from scratch.',
   'AutoML tools (H2O, AutoGluon) still require a pre-built flat table — so you still need the feature engineering step first.',
   'RDL reduces engineering by automating joins via GNN, but still needs training data setup and model training (~1–2 hrs on GPU).',
   'One PQL query. No data prep, no training, no model selection. KumoRFM samples in-context examples at inference time — ~1 second end to end.',
   'Fine-tuning adds ~5 minutes on a specific database but gives 10–30% accuracy boost over zero-shot. Still zero feature engineering.'],
  // code
  ['Typical feature engineering pipeline: SQL (200 lines) + aggregation logic (300 lines) + train/test split (100 lines) + model code (278 lines) = 878 lines.',
   'AutoML handles model selection but requires a flat DataFrame — SQL preprocessing still needed. ~50 lines with pandas.',
   'RDL with PyG requires defining the graph schema, temporal splits, and GNN architecture — ~100 lines, but reusable.',
   'PREDICT user.will_churn_30d FOR users USING HISTORY 90 DAYS — literally 1 line. No training code, no model selection, no data pipelines.',
   'Fine-tuning script is ~20 lines: load KumoRFM, call fine_tune(db_connection, pql_query), save checkpoint.'],
  // leakage
  ['Manual feature engineering is the #1 source of data leakage. Aggregating future events (e.g., "did user cancel in next 30 days") into past features is easy to do accidentally and hard to detect.',
   'AutoML cannot prevent leakage in the input features — that is still your responsibility. Many AutoML benchmarks have been found to have leakage.',
   'RDL\'s temporal graph construction enforces strict temporal constraints — only edges with timestamp < prediction_time are used. Leakage is architecturally prevented.',
   'KumoRFM builds on RDL\'s temporal graph — leakage is impossible by construction. The in-context examples are also constrained to be before the query time.',
   'Same as zero-shot — leakage prevention is built into the architecture, not a configuration option.'],
  // new tasks
  ['Every new prediction task requires starting from scratch: new SQL joins, new feature aggregations, new training run. A team of 5 might handle 2–3 new tasks per quarter.',
   'AutoML reduces model selection effort but the feature engineering must be redone for each new task. Partial reuse possible if similar schemas.',
   'The GNN architecture can be retrained on new tasks, but still requires a new training run (30 min – 2 hrs) per task.',
   'New task = new PQL query = instant prediction. The same pre-trained KumoRFM handles any prediction task on any connected database with zero additional work.',
   'Fine-tuned variant is task-specific, but zero-shot KumoRFM handles new tasks instantly. Fine-tuning is optional for extra accuracy.'],
  // accuracy
  ['Feature-engineered baselines (LightGBM, XGBoost on flat features) are the standard comparison point — set to 100% relative accuracy.',
   'AutoML typically matches or marginally improves over manual feature engineering by ensembling models. ~0–5% improvement.',
   'Supervised RDL (Relational Graph Transformer) outperforms feature engineering baselines by ~10% and LightGBM by ~40% on RelBench by capturing multi-hop relational context.',
   'KumoRFM zero-shot outperforms feature engineering baselines by 2–8% without any task-specific training. This is the headline result — better accuracy AND zero setup.',
   'Fine-tuned KumoRFM improves 10–30% over zero-shot, matching or exceeding expert-built supervised deep learning systems on most RelBench tasks.'],
  // explainability
  ['Feature importance from gradient boosted trees tells you which hand-crafted features matter — but the features are aggregated so the original rows are lost.',
   'AutoML explainability is limited to SHAP values on the flat feature table — no connection back to original relational structure.',
   'GNN explainability via attention weights is possible but not built-in. Requires additional tooling (GNNExplainer, etc.).',
   'KumoRFM has a built-in Explainability Module providing gradient-based attribution at both global level (which table/column matters most?) and individual prediction level (why was this user flagged?).',
   'Full explainability with fine-tuning — same Explainability Module, but trained on domain-specific data gives more precise attribution.'],
];
function initMethodMatrix(){
  var el=document.getElementById('method-matrix');if(!el)return;
  var cols=MATRIX_METHODS.length+1;
  var html='<div class="matrix-grid" style="grid-template-columns: 130px '+MATRIX_METHODS.map(function(){return '1fr';}).join(' ')+'">';
  // Header row
  html+='<div class="matrix-cell header" style="color:#8b949e"></div>';
  MATRIX_METHODS.forEach(function(m,mi){
    html+='<div class="matrix-cell header" style="color:'+['#f87171','#f59e0b','#0ea5e9','#10b981','#10b981'][mi]+'">'+m.replace('\n','<br>')+'</div>';
  });
  // Data rows
  MATRIX_DIMS.forEach(function(dim,di){
    html+='<div class="matrix-cell header" style="color:#8b949e">'+dim+'</div>';
    MATRIX_DATA[di].forEach(function(cell,ci){
      html+='<div class="matrix-cell" style="color:'+cell.c+';font-weight:600" onclick="showMatrixDetail('+di+','+ci+')">'+cell.v+'</div>';
    });
  });
  html+='</div>';
  el.innerHTML=html;
}
function showMatrixDetail(di,ci){
  var panel=document.getElementById('matrix-detail');if(!panel)return;
  panel.style.display='block';
  var method=MATRIX_METHODS[ci].replace('\n',' ');
  var dim=MATRIX_DIMS[di];
  var cell=MATRIX_DATA[di][ci];
  var detail=MATRIX_DETAIL[di][ci];
  panel.innerHTML='<strong style="color:'+cell.c+'">'+method+' — '+dim+':</strong> '+cell.v+'<br><br>'+detail;
}

// ─── INIT ALL ────────────────────────────────────────────────────────────────
(function(){
  function doInit(){
    initProblem();
    drawFEScale(3);
    initLeakage();
    initDbGraph();
    drawHopDepth();
    initArch();
    updatePQL();
    updateICExamples(4);
    initInContext();
    initSynthetic();
    initRelbench();
    initResults();
    initMethodMatrix();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',doInit);
  }else{
    doInit();
  }
})();
