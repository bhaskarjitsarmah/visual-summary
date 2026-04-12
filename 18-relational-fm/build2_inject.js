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

// ─── INIT ALL ────────────────────────────────────────────────────────────────
(function(){
  function doInit(){
    initProblem();
    initDbGraph();
    initArch();
    initInContext();
    initSynthetic();
    initRelbench();
    initResults();
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',doInit);
  }else{
    doInit();
  }
})();
