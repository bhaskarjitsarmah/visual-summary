// ============================================================
// UTILITIES
// ============================================================
function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function drawRoundedRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}
function drawArrow(ctx,x1,y1,x2,y2,color,w){
  w=w||2;color=color||'#8b949e';
  ctx.save();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  var ang=Math.atan2(y2-y1,x2-x1);var hs=7;
  ctx.fillStyle=color;ctx.beginPath();
  ctx.moveTo(x2,y2);ctx.lineTo(x2-hs*Math.cos(ang-0.4),y2-hs*Math.sin(ang-0.4));
  ctx.lineTo(x2-hs*Math.cos(ang+0.4),y2-hs*Math.sin(ang+0.4));ctx.closePath();ctx.fill();
  ctx.restore();
}
function seededRand(seed){var x=Math.sin(seed)*10000;return x-Math.floor(x);}
function wrapText(ctx,text,x,y,maxW,lineH){
  var words=text.split(' '),line='';
  words.forEach(function(w){
    var t=line?line+' '+w:w;
    if(ctx.measureText(t).width>maxW&&line){ctx.fillText(line,x,y);line=w;y+=lineH;}
    else line=t;
  });
  ctx.fillText(line,x,y);
}

// ============================================================
// SECTION 1: RAG PIPELINE
// ============================================================
var pipelineNodes=[
  {id:'query',label:'User Query',x:50,y:140,w:90,h:40,color:'#f7b731',latency:null,role:'The starting point. A natural language question that may require multi-hop reasoning across many documents.'},
  {id:'embed',label:'Embed Query',x:175,y:100,w:80,h:32,color:'#74b9ff',latency:'~10ms',role:'The query is encoded into a dense vector using the embedding model (512-dim or 4096-dim MRL). Fast step.'},
  {id:'bm25',label:'BM25',x:175,y:148,w:80,h:32,color:'#74b9ff',latency:'~20ms',role:'Sparse keyword retrieval using an inverted index. Catches exact matches the dense model may miss.'},
  {id:'ann',label:'ANN',x:175,y:196,w:80,h:32,color:'#74b9ff',latency:'~50ms',role:'Approximate nearest-neighbor search over the vector index. Fast approximate matching by semantic similarity.'},
  {id:'rerank',label:'Reranker',x:310,y:140,w:90,h:40,color:'#ff6b6b',latency:'~1500ms',role:'A cross-encoder model scores every (query, doc) pair. The bottleneck: 50-200 forward passes through a 2B-6B model. Non-negotiable for quality.'},
  {id:'topk',label:'Top-K Docs',x:450,y:140,w:90,h:40,color:'#51cf66',latency:'~5ms',role:'The top-ranked documents after reranking. Fed into the LLM context window for reasoning.'},
  {id:'llm',label:'LLM Reason',x:590,y:90,w:90,h:40,color:'#7c6af4',latency:'varies',role:'The language model reasons over retrieved documents. Decides: is this enough to answer? Or search again?'},
  {id:'again',label:'Search Again?',x:590,y:175,w:90,h:32,color:'#f7b731',latency:null,role:'The planner decides whether to issue another search call. A trained planner converges at ~3 calls. Untrained may call 8-10 times.'},
  {id:'answer',label:'Answer',x:590,y:240,w:90,h:32,color:'#51cf66',latency:null,role:'The final answer produced after sufficient evidence has been gathered. Quality depends on both tool quality and planner efficiency.'}
];
var hoveredPipeNode=null;
var pipePackets=[];
var pipeAF=null;

function initPipeline(){
  var c=document.getElementById('canvas-rag-pipeline');
  if(!c)return;
  pipePackets=[];
  for(var i=0;i<6;i++){
    pipePackets.push({t:i*0.15,phase:0});
  }
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var found=null;
    pipelineNodes.forEach(function(n){
      if(mx>=n.x&&mx<=n.x+n.w&&my>=n.y&&my<=n.y+n.h)found=n;
    });
    if(found!==hoveredPipeNode){
      hoveredPipeNode=found;
      if(found){
        document.getElementById('pipeline-detail').innerHTML='<strong>'+found.label+'</strong>'+(found.latency?' &mdash; Latency: <span style="color:#ff6b6b">'+found.latency+'</span>':'')+': '+found.role;
      } else {
        document.getElementById('pipeline-detail').innerHTML='<strong>Hover a node</strong> to see its latency contribution and role in the pipeline.';
      }
    }
  });
  animatePipeline();
}

function animatePipeline(){
  var c=document.getElementById('canvas-rag-pipeline');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);

  // Background
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  // Draw edges
  var edges=[
    ['query','embed'],['query','bm25'],['query','ann'],
    ['embed','rerank'],['bm25','rerank'],['ann','rerank'],
    ['rerank','topk'],['topk','llm'],
    ['llm','again'],['again','llm'],['llm','answer']
  ];
  var nm={};
  pipelineNodes.forEach(function(n){nm[n.id]=n;});

  edges.forEach(function(e){
    var a=nm[e[0]],b=nm[e[1]];
    if(!a||!b)return;
    var x1=a.x+a.w,y1=a.y+a.h/2,x2=b.x,y2=b.y+b.h/2;
    if(e[0]==='query'){x1=a.x+a.w/2;y1=a.y+a.h/2;x2=b.x;y2=b.y+b.h/2;}
    if(e[0]==='again'&&e[1]==='llm'){
      // loop back
      var ax=a.x+a.w/2,ay=a.y,bx=b.x+b.w/2,by=b.y+b.h;
      ctx.save();ctx.strokeStyle='#f7b731';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);
      ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax,ay-18);ctx.lineTo(bx,ay-18);ctx.lineTo(bx,by);ctx.stroke();
      ctx.setLineDash([]);ctx.restore();
      return;
    }
    if(e[0]==='llm'&&e[1]==='again'){x1=a.x+a.w/2;y1=a.y+a.h;x2=b.x+b.w/2;y2=b.y;}
    if(e[0]==='llm'&&e[1]==='answer'){x1=a.x+a.w/2;y1=a.y+a.h;x2=b.x+b.w/2;y2=b.y;}
    var col='#30363d';
    if(e[0]==='rerank'||e[1]==='rerank')col='rgba(255,107,107,0.4)';
    ctx.save();ctx.strokeStyle=col;ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.restore();
  });

  // Draw nodes
  pipelineNodes.forEach(function(n){
    var hov=hoveredPipeNode&&hoveredPipeNode.id===n.id;
    ctx.save();
    drawRoundedRect(ctx,n.x,n.y,n.w,n.h,8);
    ctx.fillStyle=hov?n.color:n.color+'33';
    ctx.fill();
    ctx.strokeStyle=hov?n.color:n.color+'88';
    ctx.lineWidth=hov?2:1;
    ctx.stroke();
    ctx.fillStyle=hov?'#0d1117':n.color;
    ctx.font=(hov?'700 ':'600 ')+'11px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(n.label,n.x+n.w/2,n.y+n.h/2);
    if(n.latency){
      ctx.fillStyle=n.id==='rerank'?'#ff6b6b88':'#8b949e88';
      ctx.font='9px Inter,sans-serif';
      ctx.fillText(n.latency,n.x+n.w/2,n.y+n.h+10);
    }
    ctx.restore();
  });

  // Latency label
  ctx.save();
  ctx.fillStyle='#ff6b6b';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('BOTTLENECK',nm['rerank'].x+nm['rerank'].w/2,nm['rerank'].y-10);
  ctx.restore();

  // Animate packets
  pipePackets.forEach(function(p){
    p.t=(p.t+0.004)%1;
    // Simple path along main highway
    var prog=p.t;
    var px,py;
    if(prog<0.2){var tt=prog/0.2;px=lerp(nm['query'].x+nm['query'].w,nm['rerank'].x,tt);py=nm['rerank'].y+nm['rerank'].h/2;}
    else if(prog<0.4){var tt=(prog-0.2)/0.2;px=lerp(nm['rerank'].x+nm['rerank'].w,nm['topk'].x+nm['topk'].w,tt);py=nm['topk'].y+nm['topk'].h/2;}
    else if(prog<0.6){var tt=(prog-0.4)/0.2;px=nm['llm'].x+nm['llm'].w/2;py=lerp(nm['llm'].y+nm['llm'].h,nm['answer'].y,tt);}
    else{px=-20;py=-20;}
    ctx.save();
    ctx.fillStyle=prog<0.2?'#ff6b6b':prog<0.4?'#51cf66':'#7c6af4';
    ctx.globalAlpha=0.8;
    ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fill();
    ctx.restore();
  });

  pipeAF=requestAnimationFrame(animatePipeline);
}

// ============================================================
// SECTION 2: CER-C CHART
// ============================================================
var cercData={
  fast:{color:'#74b9ff',label:'Fast (untrained)',vals:[0.18,0.38,0.53,0.63,0.69,0.72]},
  strong:{color:'#51cf66',label:'Strong (untrained)',vals:[0.24,0.46,0.60,0.70,0.76,0.80]},
  max:{color:'#a29bfe',label:'Max (untrained)',vals:[0.28,0.52,0.67,0.77,0.83,0.87]},
  trained:{color:'#f7b731',label:'Trained Fast',vals:[0.32,0.56,0.70,0.78,0.82,0.84]}
};
var cercHoverX=null;
var cercAF=null;

function initCERC(){
  var c=document.getElementById('canvas-cer-c');
  if(!c)return;
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    cercHoverX=e.clientX-r.left;
    drawCERC();
  });
  c.addEventListener('mouseleave',function(){
    cercHoverX=null;
    drawCERC();
  });
  drawCERC();
}

function drawCERC(){
  var c=document.getElementById('canvas-cer-c');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  var pad={l:56,r:20,t:24,b:44};
  var cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var tokens=[0,10,20,30,40,50];
  var steps=tokens.length;
  var xStep=cw/(steps-1);

  // Grid
  ctx.save();ctx.strokeStyle='#21262d';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var y=pad.t+ch*(1-i/4);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+cw,y);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText((i*25)+'%',pad.l-6,y);
  }
  for(var i=0;i<steps;i++){
    var x=pad.l+i*xStep;
    ctx.beginPath();ctx.moveTo(x,pad.t);ctx.lineTo(x,pad.t+ch);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(tokens[i]+'K',x,pad.t+ch+6);
  }
  ctx.restore();

  // Axes labels
  ctx.save();
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Context tokens consumed',pad.l+cw/2,H-14);
  ctx.save();ctx.translate(14,pad.t+ch/2);ctx.rotate(-Math.PI/2);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Evidence recall',0,0);
  ctx.restore();
  ctx.restore();

  // Lines
  var keys=['fast','strong','max','trained'];
  keys.forEach(function(k){
    if(!cerLines[k])return;
    var d=cercData[k];
    ctx.save();
    ctx.strokeStyle=d.color;ctx.lineWidth=2;ctx.lineJoin='round';
    ctx.beginPath();
    d.vals.forEach(function(v,i){
      var x=pad.l+i*xStep,y=pad.t+ch*(1-v);
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.stroke();
    // Fill under
    ctx.globalAlpha=0.08;ctx.fillStyle=d.color;
    ctx.lineTo(pad.l+(steps-1)*xStep,pad.t+ch);ctx.lineTo(pad.l,pad.t+ch);ctx.closePath();ctx.fill();
    ctx.globalAlpha=1;
    // Label at end
    var last=d.vals[d.vals.length-1];
    var lx=pad.l+(steps-1)*xStep+4,ly=pad.t+ch*(1-last);
    ctx.fillStyle=d.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(d.label.split(' ')[0],lx,ly);
    ctx.restore();
  });

  // Hover crosshair
  if(cercHoverX!==null&&cercHoverX>=pad.l&&cercHoverX<=pad.l+cw){
    var idx=(cercHoverX-pad.l)/xStep;
    var lo=Math.floor(idx),hi=Math.min(Math.ceil(idx),steps-1);
    var frac=idx-lo;
    ctx.save();
    ctx.strokeStyle='#8b949e';ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(cercHoverX,pad.t);ctx.lineTo(cercHoverX,pad.t+ch);ctx.stroke();
    ctx.setLineDash([]);
    // Values
    var tokLabel=Math.round(lerp(tokens[lo]||0,tokens[Math.min(hi,steps-1)]||0,frac));
    var detParts=['<strong>'+tokLabel+'K tokens:</strong>'];
    keys.forEach(function(k){
      if(!cerLines[k])return;
      var d=cercData[k];
      var v=lerp(d.vals[lo]||0,d.vals[Math.min(hi,steps-1)]||0,frac);
      detParts.push('<span style="color:'+d.color+'">'+d.label+': '+(v*100).toFixed(0)+'%</span>');
    });
    var det=document.getElementById('cer-detail');
    if(det)det.innerHTML=detParts.join(' &nbsp;|&nbsp; ');
    ctx.restore();
  }
}

// ============================================================
// SECTION 3: COMPONENT COMPARISON
// ============================================================
function initComponentChart(){
  drawComponentChart();
}

function drawComponentChart(){
  var c=document.getElementById('canvas-component');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  // Divider
  ctx.save();ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(W/2,20);ctx.lineTo(W/2,H-20);ctx.stroke();
  ctx.restore();

  // LEFT: Reranker impact
  var lw=W/2-20;
  ctx.save();
  ctx.fillStyle='#c9d1d9';ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Reranker Impact on Quality (nDCG@5)',lw/2+10,14);

  var bh=44,bmarginY=16,startY=46,bx=30;
  var bars=[
    {label:'With Reranker (6B)',val:0.203,max:0.25,color:'#51cf66'},
    {label:'Without Reranker',val:0.089,max:0.25,color:'#ff6b6b'}
  ];
  bars.forEach(function(b,i){
    var by=startY+i*(bh+bmarginY);
    var bw=(lw-bx-50)*(b.val/b.max);
    // Bar
    drawRoundedRect(ctx,bx,by,bw,bh,6);
    ctx.fillStyle=b.color+'44';ctx.fill();
    ctx.strokeStyle=b.color;ctx.lineWidth=1.5;ctx.stroke();
    // Label
    ctx.fillStyle='#c9d1d9';ctx.font='11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(b.label,bx,by-14);
    // Value
    ctx.fillStyle=b.color;ctx.font='bold 16px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(b.val.toFixed(3),bx+bw+8,by+bh/2);
  });

  // Delta annotation
  ctx.fillStyle='#ff6b6b';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('56% quality drop without reranker',lw/2+10,startY+2*(bh+bmarginY)+8);
  ctx.restore();

  // RIGHT: Config comparison (3 configs, 3 metrics)
  var rx=W/2+10,rw=W/2-20;
  ctx.save();
  ctx.fillStyle='#c9d1d9';ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Config Comparison',rx+rw/2,14);

  var cfgs=['fast','strong','max'];
  var metrics=[
    {key:'recall',label:'Recall',max:1.0,color:'#74b9ff'},
    {key:'ndcg',label:'nDCG@5',max:0.25,color:'#51cf66'},
  ];
  var barW=22,barGap=8,groupGap=28;
  var chartH=180,chartY=H-chartH-30,chartX=rx+20;
  var chartW=rw-40;

  // Y axis
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var gy=chartY+chartH*(1-i/4);
    ctx.beginPath();ctx.moveTo(chartX,gy);ctx.lineTo(chartX+chartW,gy);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText((i*25)+'%',chartX-4,gy);
  }

  cfgs.forEach(function(cfg,gi){
    var c2=CONFIGS[cfg];
    var gx=chartX+gi*(chartW/3)+10;
    metrics.forEach(function(m,mi){
      var rawVal=m.key==='ndcg'?c2[m.key]/m.max:c2[m.key];
      var bh2=rawVal*chartH;
      var bx2=gx+mi*(barW+barGap);
      var by2=chartY+chartH-bh2;
      var isSelected=cfg===selectedConfig;
      drawRoundedRect(ctx,bx2,by2,barW,bh2,4);
      ctx.fillStyle=isSelected?m.color:m.color+'55';ctx.fill();
      ctx.strokeStyle=isSelected?m.color:m.color+'44';ctx.lineWidth=isSelected?2:1;ctx.stroke();
    });
    // Label
    ctx.fillStyle=cfg===selectedConfig?CONFIGS[cfg].color:'#8b949e';
    ctx.font=(cfg===selectedConfig?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(CONFIGS[cfg].label,gx+(metrics.length*(barW+barGap))/2-barGap/2,chartY+chartH+4);
    // Latency
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';
    ctx.fillText(CONFIGS[cfg].latency+'s',gx+(metrics.length*(barW+barGap))/2-barGap/2,chartY+chartH+16);
  });

  // Legend
  metrics.forEach(function(m,i){
    var lx=rx+20+i*80;
    ctx.fillStyle=m.color;ctx.fillRect(lx,H-14,12,8);
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(m.label,lx+16,H-14);
  });

  ctx.restore();
}

// ============================================================
// SECTION 4: TRAINING FLOW
// ============================================================
var trainingAF=null;
var trainPackets=[];
var trainT=0;

function initTraining(){
  trainPackets=[];
  for(var i=0;i<4;i++)trainPackets.push({t:i*0.25,side:i%2===0?1:2});
  animateTraining();
}

function animateTraining(){
  drawTrainingFlow();
  trainT+=0.008;
  trainingAF=requestAnimationFrame(animateTraining);
}

function drawTrainingFlow(){
  var c=document.getElementById('canvas-training');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var half=W/2;
  // Divider
  ctx.save();ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(half,10);ctx.lineTo(half,H-10);ctx.stroke();
  ctx.setLineDash([]);ctx.restore();

  // Panel labels
  ctx.save();
  ctx.fillStyle='#74b9ff';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Recipe 1: GRPO (RL with binary reward)',half/2,8);
  ctx.fillStyle='#a29bfe';
  ctx.fillText('Recipe 2: On-policy Distillation',half+half/2,8);
  ctx.restore();

  function drawNode(lx,ly,lw,lh,label,col,active){
    ctx.save();
    drawRoundedRect(ctx,lx,ly,lw,lh,8);
    ctx.fillStyle=active?col:col+'33';ctx.fill();
    ctx.strokeStyle=active?col:col+'66';ctx.lineWidth=active?2:1;ctx.stroke();
    ctx.fillStyle=active?'#0d1117':col;
    ctx.font=(active?'bold ':'')+'11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(label,lx+lw/2,ly+lh/2);
    ctx.restore();
  }

  // Recipe 1 nodes
  var r1=selectedRecipe===1||selectedRecipe===0;
  var r1nodes=[
    {x:30,y:50,w:80,h:32,label:'Query',col:'#f7b731'},
    {x:30,y:120,w:80,h:36,label:'Planner',col:'#74b9ff'},
    {x:140,y:100,w:80,h:36,label:'Tool Calls',col:'#51cf66'},
    {x:140,y:170,w:80,h:36,label:'Answer',col:'#74b9ff'},
    {x:30,y:230,w:80,h:36,label:'Reward +1/0',col:'#ff6b6b'},
    {x:140,y:230,w:80,h:36,label:'Policy Update',col:'#7c6af4'}
  ];
  r1nodes.forEach(function(n){drawNode(n.x,n.y,n.w,n.h,n.label,n.col,r1);});

  var r1edges=[
    [[70,66],[70,120]],[[70,138],[140,118]],[[180,118],[180,170]],
    [[180,188],[180,230]],[[140,248],[110,248]],[[70,248],[70,156]]
  ];
  r1edges.forEach(function(e){
    ctx.save();ctx.strokeStyle=r1?'#30363d88':'#21262d';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(e[0][0],e[0][1]);ctx.lineTo(e[1][0],e[1][1]);ctx.stroke();
    ctx.restore();
  });

  // Binary reward label
  ctx.save();ctx.fillStyle=r1?'#ff6b6b':'#ff6b6b44';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('BINARY SIGNAL',70,290);ctx.restore();

  // Recipe 2 nodes
  var r2=selectedRecipe===2||selectedRecipe===0;
  var ox=half+10;
  var r2nodes=[
    {x:ox+10,y:50,w:80,h:32,label:'Query',col:'#f7b731'},
    {x:ox+10,y:120,w:80,h:36,label:'Student',col:'#74b9ff'},
    {x:ox+120,y:80,w:90,h:36,label:'Trajectory',col:'#51cf66'},
    {x:ox+120,y:155,w:90,h:44,label:'Teacher\nQwen3-235B',col:'#ff6b6b'},
    {x:ox+10,y:220,w:80,h:36,label:'KL Signal',col:'#a29bfe'},
    {x:ox+120,y:220,w:90,h:36,label:'Dense Update',col:'#7c6af4'}
  ];
  r2nodes.forEach(function(n){
    // Handle newline in label
    ctx.save();
    drawRoundedRect(ctx,n.x,n.y,n.w,n.h,8);
    ctx.fillStyle=r2?n.col:n.col+'33';ctx.fill();
    ctx.strokeStyle=r2?n.col:n.col+'66';ctx.lineWidth=r2?2:1;ctx.stroke();
    ctx.fillStyle=r2?'#0d1117':n.col;
    ctx.font=(r2?'bold ':'')+'10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    var lines=n.label.split('\n');
    if(lines.length>1){
      ctx.fillText(lines[0],n.x+n.w/2,n.y+n.h/2-8);
      ctx.font='9px Inter,sans-serif';
      ctx.fillText(lines[1],n.x+n.w/2,n.y+n.h/2+8);
    } else ctx.fillText(n.label,n.x+n.w/2,n.y+n.h/2);
    ctx.restore();
  });

  // Dense signal arrows (many small arrows)
  if(r2){
    ctx.save();
    for(var i=0;i<5;i++){
      var ay=r2nodes[3].y+8+i*8,ax1=ox+120,ax2=ox+90;
      ctx.strokeStyle='#a29bfe';ctx.lineWidth=1;ctx.globalAlpha=0.5+i*0.1;
      ctx.beginPath();ctx.moveTo(ax1,ay);ctx.lineTo(ax2,ay);ctx.stroke();
    }
    ctx.fillStyle='#a29bfe';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.globalAlpha=1;
    ctx.fillText('DENSE SIGNAL',ox+half/2+10,290);
    ctx.restore();
  }

  // 39% KL label
  if(r2){
    ctx.save();ctx.fillStyle='#51cf66';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText('39% KL reduction in 50 steps',ox+half/2+10,310);
    ctx.restore();
  }

  // Combined mode extra text
  if(selectedRecipe===0){
    ctx.save();
    ctx.fillStyle='#f7b731';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText('Stage 1: 50 steps distillation  +  Stage 2: 30 steps GRPO+CLP',W/2,H-16);
    ctx.restore();
  }
}

// ============================================================
// SECTION 5: PENALTY CURVES
// ============================================================
var penaltyHoverX=null;

function initPenalty(){
  var c=document.getElementById('canvas-penalty');
  if(!c)return;
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    penaltyHoverX=e.clientX-r.left;
    var eps=parseFloat(document.getElementById('sl-epsilon').value)/100;
    drawPenaltyChart(eps);
  });
  c.addEventListener('mouseleave',function(){
    penaltyHoverX=null;
    var eps=parseFloat(document.getElementById('sl-epsilon').value)/100;
    drawPenaltyChart(eps);
  });
  drawPenaltyChart(0.15);
}

function drawPenaltyChart(eps){
  eps=eps||0.15;
  var c=document.getElementById('canvas-penalty');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  var pad={l:56,r:24,t:30,b:44};
  var cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var maxTC=12,minR=-0.3,maxR=1.1;
  var alpha=0.25; // linear multiplicative param

  function tx(tc){return pad.l+tc/maxTC*cw;}
  function ty(r){return pad.t+ch*(1-(r-minR)/(maxR-minR));}

  // Grid
  ctx.save();ctx.strokeStyle='#21262d';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var rv=minR+(maxR-minR)*i/4;
    var gy=ty(rv);
    ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+cw,gy);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(rv.toFixed(1),pad.l-6,gy);
  }
  // Zero line
  ctx.strokeStyle='#30363d';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(pad.l,ty(0));ctx.lineTo(pad.l+cw,ty(0));ctx.stroke();
  for(var i=0;i<=maxTC;i+=2){
    var gx=tx(i);
    ctx.strokeStyle='#21262d';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(gx,pad.t);ctx.lineTo(gx,pad.t+ch);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('tc='+i,gx,pad.t+ch+6);
  }

  // tc=4 marker (where linear hits 0)
  ctx.strokeStyle='#f7b731';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(tx(4),pad.t);ctx.lineTo(tx(4),pad.t+ch);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#f7b731';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Linear→0',tx(4),pad.t+2);

  // Curves
  var curves=[
    {label:'Additive (broken)',color:'#ff6b6b',fn:function(tc){return 1+0.15*tc;}},
    {label:'Linear Mult.',color:'#f7b731',fn:function(tc){return Math.max(-0.3,1-alpha*tc);}},
    {label:'CLP (winner)',color:'#51cf66',fn:function(tc){return Math.max(0,1-eps*Math.log(1+tc));}}
  ];
  curves.forEach(function(curve){
    ctx.save();ctx.strokeStyle=curve.color;ctx.lineWidth=2.5;ctx.lineJoin='round';
    ctx.beginPath();
    for(var i=0;i<=maxTC*10;i++){
      var tc=i/10;
      var r=curve.fn(tc);
      if(i===0)ctx.moveTo(tx(tc),ty(r));
      else ctx.lineTo(tx(tc),ty(r));
    }
    ctx.stroke();
    // End label
    var lastTc=maxTC,lastR=curve.fn(lastTc);
    ctx.fillStyle=curve.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(curve.label,tx(lastTc)+4,ty(lastR));
    ctx.restore();
  });

  // CLP breakeven annotation
  var clpBreakTC=Math.exp(1/eps)-1;
  if(clpBreakTC<=maxTC){
    ctx.save();ctx.strokeStyle='#51cf66';ctx.lineWidth=1;ctx.setLineDash([3,3]);
    ctx.beginPath();ctx.moveTo(tx(clpBreakTC),ty(0));ctx.lineTo(tx(clpBreakTC),pad.t+ch);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='#51cf66';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText('CLP→0 at tc='+(clpBreakTC.toFixed(0)),tx(clpBreakTC),ty(-0.25));
    ctx.restore();
  } else {
    ctx.save();
    ctx.fillStyle='#51cf66';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='top';
    ctx.fillText('CLP stays positive until tc\u2248'+Math.round(clpBreakTC),pad.l+cw,pad.t+4);
    ctx.restore();
  }

  // Hover crosshair
  if(penaltyHoverX!==null&&penaltyHoverX>=pad.l&&penaltyHoverX<=pad.l+cw){
    var tc=(penaltyHoverX-pad.l)/cw*maxTC;
    ctx.save();ctx.strokeStyle='#8b949e';ctx.lineWidth=1;ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(penaltyHoverX,pad.t);ctx.lineTo(penaltyHoverX,pad.t+ch);ctx.stroke();
    ctx.setLineDash([]);
    var parts=['<strong>tc='+tc.toFixed(1)+'</strong>'];
    curves.forEach(function(curve){
      var r=curve.fn(tc);
      parts.push('<span style="color:'+curve.color+'">'+curve.label+': '+(r).toFixed(3)+'</span>');
    });
    var det=document.getElementById('penalty-detail');
    if(det)det.innerHTML=parts.join(' &nbsp;|&nbsp; ');
    ctx.restore();
  }

  // Axes labels
  ctx.save();
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Number of tool calls (tc)',pad.l+cw/2,H-14);
  ctx.save();ctx.translate(14,pad.t+ch/2);ctx.rotate(-Math.PI/2);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Reward multiplier',0,0);
  ctx.restore();
  ctx.restore();
}

// ============================================================
// SECTION 6: SCATTER PLOT
// ============================================================
var scatterPoints=[
  {label:'Untrained Fast',latency:13,acc:35.2,config:'fast',trained:false,color:'#74b9ff',r:8},
  {label:'Untrained Strong',latency:26,acc:50.0,config:'strong',trained:false,color:'#51cf66',r:11},
  {label:'Untrained Max',latency:52,acc:54.3,config:'max',trained:false,color:'#a29bfe',r:14},
  {label:'Trained Fast',latency:13,acc:50.1,config:'fast',trained:true,color:'#74b9ff',r:8},
  {label:'Trained Strong',latency:26,acc:57.2,config:'strong',trained:true,color:'#51cf66',r:11},
  {label:'Trained Max',latency:52,acc:60.7,config:'max',trained:true,color:'#a29bfe',r:14}
];
var scatterHovered=null;

function initScatter(){
  var c=document.getElementById('canvas-scatter');
  if(!c)return;
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    scatterHovered=null;
    var pad={l:60,r:24,t:30,b:50};
    var cw=c.width-pad.l-pad.r,ch=c.height-pad.t-pad.b;
    scatterPoints.forEach(function(p){
      var px=pad.l+(p.latency/65)*cw;
      var py=pad.t+ch*(1-(p.acc-25)/45);
      if(Math.hypot(mx-px,my-py)<p.r+6)scatterHovered=p;
    });
    drawScatter();
    if(scatterHovered){
      var det=document.getElementById('scatter-detail');
      if(det)det.innerHTML='<strong>'+scatterHovered.label+'</strong> &mdash; Accuracy: <span style="color:#51cf66">'+scatterHovered.acc+'%</span> &nbsp;|&nbsp; Latency: <span style="color:#f7b731">'+scatterHovered.latency+'s</span> &nbsp;|&nbsp; Config: '+CONFIGS[scatterHovered.config].label+(scatterHovered.trained?' (trained)':' (untrained)');
    }
  });
  c.addEventListener('mouseleave',function(){scatterHovered=null;drawScatter();});
  drawScatter();
}

function drawScatter(){
  var c=document.getElementById('canvas-scatter');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  var pad={l:60,r:24,t:30,b:50};
  var cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var maxLat=65,minAcc=25,maxAcc=70;
  function px(lat){return pad.l+(lat/maxLat)*cw;}
  function py(acc){return pad.t+ch*(1-(acc-minAcc)/(maxAcc-minAcc));}

  // Grid
  ctx.save();ctx.strokeStyle='#21262d';ctx.lineWidth=1;
  for(var i=0;i<=5;i++){
    var gy=pad.t+ch*i/5;
    ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+cw,gy);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    var av=maxAcc-(maxAcc-minAcc)*i/5;
    ctx.fillText(av.toFixed(0)+'%',pad.l-6,gy);
  }
  [0,13,26,39,52,65].forEach(function(lat){
    var gx=px(lat);
    ctx.beginPath();ctx.moveTo(gx,pad.t);ctx.lineTo(gx,pad.t+ch);ctx.stroke();
    ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(lat+'s',gx,pad.t+ch+6);
  });
  ctx.restore();

  // Connect trained↔untrained pairs
  var pairs=[['fast',0,3],['strong',1,4],['max',2,5]];
  pairs.forEach(function(pr){
    var a=scatterPoints[pr[1]],b=scatterPoints[pr[2]];
    ctx.save();ctx.strokeStyle=a.color+'66';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
    ctx.beginPath();ctx.moveTo(px(a.latency),py(a.acc));ctx.lineTo(px(b.latency),py(b.acc));ctx.stroke();
    ctx.setLineDash([]);ctx.restore();
  });

  // Key annotation: Trained Fast ≈ Untrained Strong
  ctx.save();ctx.strokeStyle='#f7b731';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(px(13),py(50.1));ctx.lineTo(px(26),py(50.0));ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#f7b731';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('Same accuracy, 2x faster!',px(19.5),py(50.5)-4);
  ctx.restore();

  // Draw points
  scatterPoints.forEach(function(p){
    var dotX=px(p.latency),dotY=py(p.acc);
    var hov=scatterHovered&&scatterHovered.label===p.label;
    ctx.save();
    // Outer ring for trained
    if(p.trained){
      ctx.beginPath();ctx.arc(dotX,dotY,p.r+5,0,Math.PI*2);
      ctx.strokeStyle=p.color;ctx.lineWidth=2;ctx.stroke();
    }
    ctx.beginPath();ctx.arc(dotX,dotY,p.r,0,Math.PI*2);
    ctx.fillStyle=p.trained?p.color:p.color+'55';ctx.fill();
    ctx.strokeStyle=p.color;ctx.lineWidth=hov?3:1.5;ctx.stroke();
    if(hov){
      ctx.beginPath();ctx.arc(dotX,dotY,p.r+8,0,Math.PI*2);
      ctx.strokeStyle=p.color+'88';ctx.lineWidth=1.5;ctx.stroke();
    }
    // Label
    ctx.fillStyle=p.trained?p.color:'#8b949e';
    ctx.font=(p.trained?'bold ':'')+'9px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(p.label,dotX,dotY-p.r-4);
    ctx.restore();
  });

  // Legend
  ctx.save();
  ctx.beginPath();ctx.arc(pad.l+10,H-16,6,0,Math.PI*2);
  ctx.fillStyle='#74b9ff55';ctx.fill();ctx.strokeStyle='#74b9ff';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText('Untrained',pad.l+20,H-16);

  ctx.beginPath();ctx.arc(pad.l+100,H-16,6,0,Math.PI*2);
  ctx.fillStyle='#74b9ff';ctx.fill();ctx.strokeStyle='#74b9ff';ctx.lineWidth=1.5;ctx.stroke();
  ctx.beginPath();ctx.arc(pad.l+100,H-16,11,0,Math.PI*2);
  ctx.strokeStyle='#74b9ff';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#8b949e';ctx.fillText('Trained',pad.l+116,H-16);

  // Axes labels
  ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Search latency (seconds)',pad.l+cw/2,H-16);
  ctx.save();ctx.translate(14,pad.t+ch/2);ctx.rotate(-Math.PI/2);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Accuracy (BrowseComp-Plus)',0,0);
  ctx.restore();
  ctx.restore();
}

// ============================================================
// SEARCH STRATEGY REPLAY
// ============================================================
function initReplay(){
  drawReplay();
}

function drawReplay(){
  var c=document.getElementById('canvas-replay');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var data=REPLAY_DATA[replayMode];
  var total=data.length;
  var isTrained=replayMode==='trained';
  var accentColor=isTrained?'#51cf66':'#ff6b6b';

  // Header
  ctx.save();
  ctx.fillStyle=accentColor;ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText((isTrained?'Trained':'Untrained')+' Planner — '+total+' search calls total',20,14);
  ctx.restore();

  // Timeline bar at top
  var barX=20,barY=38,barW=W-40,barH=12;
  ctx.save();
  drawRoundedRect(ctx,barX,barY,barW,barH,6);
  ctx.fillStyle='#21262d';ctx.fill();
  var prog=(replayStep+1)/total;
  drawRoundedRect(ctx,barX,barY,barW*prog,barH,6);
  ctx.fillStyle=accentColor+'88';ctx.fill();
  // Step markers
  for(var i=0;i<total;i++){
    var mx=barX+barW*(i+0.5)/total;
    ctx.fillStyle=i<=replayStep?accentColor:'#30363d';
    ctx.beginPath();ctx.arc(mx,barY+barH/2,4,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();

  // Cards for each step
  var cardH=52,cardGap=8,startY=66;
  var visStart=Math.max(0,replayStep-2);
  var visEnd=Math.min(total-1,visStart+4);

  for(var i=visStart;i<=visEnd;i++){
    var s=data[i];
    var cy=startY+(i-visStart)*(cardH+cardGap);
    var isCurrent=i===replayStep;
    var isPast=i<replayStep;
    var isFuture=i>replayStep;

    ctx.save();
    drawRoundedRect(ctx,20,cy,W-40,cardH,8);
    ctx.fillStyle=isCurrent?accentColor+'22':isPast?'#21262d':'#161b22';
    ctx.fill();
    ctx.strokeStyle=isCurrent?accentColor:isPast?accentColor+'44':'#30363d';
    ctx.lineWidth=isCurrent?2:1;ctx.stroke();

    // Step number
    ctx.fillStyle=isCurrent?accentColor:isPast?accentColor+'88':'#8b949e';
    ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText('Call '+(i+1),32,cy+10);

    // Query
    ctx.fillStyle=isFuture?'#30363d':'#c9d1d9';
    ctx.font=(isCurrent?'bold ':'')+'11px Inter,sans-serif';
    var q=s.query.length>55?s.query.slice(0,52)+'...':s.query;
    ctx.fillText('"'+q+'"',100,cy+10);

    // Docs retrieved
    if(!isFuture){
      ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';
      ctx.fillText('Retrieved: '+s.docs.join(', '),100,cy+28);
    }

    // Status badge
    if(s.status==='done'&&i<=replayStep){
      ctx.fillStyle='#51cf66';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='right';
      ctx.fillText('STOP \u2713',W-32,cy+10);
    } else if(!isFuture){
      ctx.fillStyle='#f7b731';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='right';
      ctx.fillText('SEARCH \u2192',W-32,cy+10);
    }
    ctx.restore();
  }

  // Summary at bottom
  if(replayStep===total-1){
    ctx.save();
    ctx.fillStyle=accentColor;ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText((isTrained?'Done in '+total+' calls \u2014 efficient!':'Done in '+total+' calls \u2014 '+(total-3)+' redundant searches wasted tokens'),W/2,H-10);
    ctx.restore();
  }
}

// ============================================================
// COMPONENT ABLATION
// ============================================================
var ablationHovered=null;
var ABLATION_BARS=[
  {label:'Max Config (full)',sub:'4096-dim + 6B reranker + hybrid + top-200',ndcg:0.221,color:'#51cf66',removed:'Nothing removed \u2014 this is the full Max configuration.'},
  {label:'- High-dim embeddings',sub:'512-dim + 6B reranker + hybrid + top-50',ndcg:0.203,color:'#74b9ff',removed:'Dropping from 4096-dim to 512-dim MRL: -8% nDCG. Recall drops slightly, but the reranker compensates. The latency saving (7x faster retrieval) is often worth this trade-off.'},
  {label:'- Hybrid retrieval',sub:'512-dim + 6B reranker + ANN-only + top-50',ndcg:0.182,color:'#f7b731',removed:'Removing BM25 (sparse retrieval): additional -11% nDCG on top of dim reduction. Exact-match queries (proper nouns, acronyms) degrade most. Hybrid adds modest latency but meaningful recall.'},
  {label:'- 6B \u2192 2B reranker',sub:'512-dim + 2B reranker + ANN-only + top-50',ndcg:0.135,color:'#ff6b6b',removed:'Downgrading from 6B to 2B reranker: another -26% nDCG. The reranker size is critical. At this point quality is severely degraded.'},
  {label:'- Reranker entirely',sub:'512-dim + no reranker + ANN-only + top-50',ndcg:0.089,color:'#ff4444',removed:'Removing the reranker entirely: -60% nDCG from Strong baseline. Without reranking, the pipeline returns noisy approximate results directly to the LLM. Non-negotiable for quality.'}
];

function initAblation(){
  var c=document.getElementById('canvas-ablation');
  if(!c)return;
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    var my=e.clientY-r.top;
    var pad={t:24,b:10};var ch=c.height-pad.t-pad.b;
    var rowH=ch/ABLATION_BARS.length;
    var idx=Math.floor((my-pad.t)/rowH);
    if(idx>=0&&idx<ABLATION_BARS.length){
      if(ablationHovered!==idx){
        ablationHovered=idx;
        var b=ABLATION_BARS[idx];
        var det=document.getElementById('ablation-detail');
        if(det){
          var drop=idx===0?'Baseline':'-'+(((0.221-b.ndcg)/0.221)*100).toFixed(0)+'% from Max';
          det.innerHTML='<strong>'+b.label+'</strong> &mdash; nDCG@5: <span style="color:'+b.color+'">'+b.ndcg.toFixed(3)+'</span> ('+drop+')<br><span style="color:var(--muted);font-size:12px;">'+b.removed+'</span>';
        }
        drawAblation();
      }
    } else if(ablationHovered!==null){ablationHovered=null;drawAblation();}
  });
  c.addEventListener('mouseleave',function(){ablationHovered=null;drawAblation();});
  drawAblation();
}

function drawAblation(){
  var c=document.getElementById('canvas-ablation');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var pad={l:190,r:80,t:24,b:10};
  var cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  var rowH=ch/ABLATION_BARS.length;
  var maxNDCG=0.25;

  ABLATION_BARS.forEach(function(b,i){
    var y=pad.t+i*rowH;
    var bh=rowH*0.55;
    var by=y+(rowH-bh)/2;
    var bw=cw*(b.ndcg/maxNDCG);
    var hov=ablationHovered===i;

    // Row bg
    if(hov){ctx.save();ctx.fillStyle=b.color+'11';ctx.fillRect(0,y,W,rowH);ctx.restore();}

    // Label
    ctx.save();
    ctx.fillStyle=hov?b.color:'#c9d1d9';ctx.font=(hov?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(b.label,pad.l-8,by+bh/2-6);
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';
    ctx.fillText(b.sub,pad.l-8,by+bh/2+7);
    ctx.restore();

    // Bar
    ctx.save();
    drawRoundedRect(ctx,pad.l,by,bw,bh,4);
    ctx.fillStyle=hov?b.color:b.color+'55';ctx.fill();
    ctx.strokeStyle=b.color;ctx.lineWidth=hov?2:1;ctx.stroke();

    // Value
    ctx.fillStyle=b.color;ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(b.ndcg.toFixed(3),pad.l+bw+6,by+bh/2);

    // Drop label
    if(i>0){
      var drop=((0.221-b.ndcg)/0.221*100).toFixed(0);
      ctx.fillStyle='#ff6b6b88';ctx.font='9px Inter,sans-serif';
      ctx.fillText('-'+drop+'%',pad.l+bw+48,by+bh/2);
    }
    ctx.restore();
  });

  // Axis label
  ctx.save();ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('nDCG@5',pad.l+cw/2,H-8);ctx.restore();
}

// ============================================================
// TRAINING CONVERGENCE
// ============================================================
var convergenceAF=null;
var convergenceT=0;
var convergenceAnimDone=false;

function initConvergence(){
  convergenceT=0;convergenceAnimDone=false;
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(e){if(e.isIntersecting&&!convergenceAnimDone)animateConvergence();});
  },{threshold:0.3});
  var c=document.getElementById('canvas-convergence');
  if(c)obs.observe(c);
}

function animateConvergence(){
  convergenceT=Math.min(convergenceT+0.015,1);
  drawConvergence(convergenceT);
  if(convergenceT<1)requestAnimationFrame(animateConvergence);
  else convergenceAnimDone=true;
}

function drawConvergence(t){
  t=t||1;
  var c=document.getElementById('canvas-convergence');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  var pad={l:56,r:56,t:30,b:44};
  var cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var totalSteps=80;
  var switchStep=50; // distillation ends, GRPO starts

  // Accuracy data: starts ~35%, rises to ~57% (Strong trained)
  // Tool calls: starts ~8, drops to ~3
  function accAt(step){
    if(step<=switchStep){return 35+15*(step/switchStep);}
    return 50+7*((step-switchStep)/(totalSteps-switchStep));
  }
  function tcAt(step){
    if(step<=switchStep){return 8-3*(step/switchStep);}
    return 5-2*((step-switchStep)/(totalSteps-switchStep));
  }

  // Grid
  ctx.save();ctx.strokeStyle='#21262d';ctx.lineWidth=1;
  for(var i=0;i<=4;i++){
    var gy=pad.t+ch*i/4;
    ctx.beginPath();ctx.moveTo(pad.l,gy);ctx.lineTo(pad.l+cw,gy);ctx.stroke();
  }
  ctx.restore();

  // Switch marker (step 50)
  var switchX=pad.l+cw*(switchStep/totalSteps);
  ctx.save();ctx.strokeStyle='#8b949e';ctx.lineWidth=1.5;ctx.setLineDash([5,4]);
  ctx.beginPath();ctx.moveTo(switchX,pad.t);ctx.lineTo(switchX,pad.t+ch);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='#8b949e';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Switch to GRPO+CLP',switchX,pad.t+2);
  ctx.fillText('(step 50)',switchX,pad.t+13);
  ctx.restore();

  // Phase labels
  ctx.save();
  ctx.fillStyle='#a29bfe';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('Distillation (50 steps)',pad.l+(switchX-pad.l)/2,pad.t-4);
  ctx.fillStyle='#74b9ff';
  ctx.fillText('GRPO + CLP (30 steps)',switchX+(pad.l+cw-switchX)/2,pad.t-4);
  ctx.restore();

  var drawSteps=Math.round(t*totalSteps);

  // Draw accuracy line (left axis, 0-100%)
  ctx.save();ctx.strokeStyle='#51cf66';ctx.lineWidth=2.5;ctx.lineJoin='round';
  ctx.beginPath();
  for(var s=0;s<=drawSteps;s++){
    var x=pad.l+cw*(s/totalSteps);
    var acc=accAt(s);
    var y=pad.t+ch*(1-acc/80);
    if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();ctx.restore();

  // Draw tool-calls line (right axis, 0-10)
  ctx.save();ctx.strokeStyle='#f7b731';ctx.lineWidth=2.5;ctx.lineJoin='round';
  ctx.beginPath();
  for(var s=0;s<=drawSteps;s++){
    var x=pad.l+cw*(s/totalSteps);
    var tc=tcAt(s);
    var y=pad.t+ch*(1-tc/10);
    if(s===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
  }
  ctx.stroke();ctx.restore();

  // End labels
  if(drawSteps===totalSteps){
    ctx.save();
    ctx.fillStyle='#51cf66';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('Accuracy \u2192 57%',pad.l+cw+4,pad.t+ch*(1-57/80));
    ctx.fillStyle='#f7b731';
    ctx.fillText('Tool calls \u2192 ~3',pad.l+cw+4,pad.t+ch*(1-3/10));
    ctx.restore();
  }

  // X axis
  ctx.save();ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  [0,20,40,50,60,80].forEach(function(s){
    ctx.fillText(''+s,pad.l+cw*(s/totalSteps),pad.t+ch+6);
  });
  ctx.fillText('Training steps',pad.l+cw/2,H-12);
  ctx.restore();

  // Left Y axis label (accuracy)
  ctx.save();ctx.translate(14,pad.t+ch/2);ctx.rotate(-Math.PI/2);
  ctx.fillStyle='#51cf66';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Accuracy (%)',0,0);ctx.restore();

  // Right Y axis label (tool calls)
  ctx.save();ctx.translate(W-10,pad.t+ch/2);ctx.rotate(Math.PI/2);
  ctx.fillStyle='#f7b731';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Tool calls',0,0);ctx.restore();

  // Y axis ticks left
  ctx.save();ctx.fillStyle='#51cf66';ctx.font='9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
  [0,20,40,60,80].forEach(function(v){ctx.fillText(v+'%',pad.l-4,pad.t+ch*(1-v/80));});
  ctx.restore();

  // Y axis ticks right
  ctx.save();ctx.fillStyle='#f7b731';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  [0,2,4,6,8,10].forEach(function(v){ctx.fillText(v,pad.l+cw+4,pad.t+ch*(1-v/10));});
  ctx.restore();
}

// ============================================================
// BENCHMARK MATRIX
// ============================================================
var benchmarkHoveredRow=null;
var BENCHMARKS=[
  {name:'NQ',type:'1-hop',vals:[72,81,74,84,76,86]},
  {name:'TriviaQA',type:'factoid',vals:[68,77,70,80,72,82]},
  {name:'HotpotQA',type:'2-hop',vals:[55,66,58,70,60,72]},
  {name:'2WikiMultihop',type:'multi-hop',vals:[48,60,51,63,53,65]},
  {name:'MuSiQue',type:'compositional',vals:[38,50,41,53,44,56]},
  {name:'Bamboogle',type:'adversarial',vals:[42,54,46,58,48,61]},
  {name:'BrowseComp+',type:'hardest',vals:[35,50,50,57,54,61]}
];
var BENCH_COLS=['Fast\nUntrained','Fast\nTrained','Strong\nUntrained','Strong\nTrained','Max\nUntrained','Max\nTrained'];
var BENCH_COLORS=['#74b9ff','#74b9ff','#51cf66','#51cf66','#a29bfe','#a29bfe'];

function initBenchmark(){
  var c=document.getElementById('canvas-benchmark');
  if(!c)return;
  c.addEventListener('mousemove',function(e){
    var r=c.getBoundingClientRect();
    var my=e.clientY-r.top;
    var pad={t:40,b:24,l:100,r:20};
    var ch=c.height-pad.t-pad.b;
    var rowH=ch/BENCHMARKS.length;
    var idx=Math.floor((my-pad.t)/rowH);
    if(idx>=0&&idx<BENCHMARKS.length){
      if(benchmarkHoveredRow!==idx){
        benchmarkHoveredRow=idx;
        var b=BENCHMARKS[idx];
        var det=document.getElementById('benchmark-detail');
        if(det){
          var parts=BENCH_COLS.map(function(col,i){
            return '<span style="color:'+BENCH_COLORS[i]+'">'+col.replace('\\n',' ')+': '+b.vals[i]+'%</span>';
          });
          det.innerHTML='<strong>'+b.name+' ('+b.type+')</strong> &mdash; '+parts.join(' &nbsp;|&nbsp; ');
        }
        drawBenchmark();
      }
    } else if(benchmarkHoveredRow!==null){benchmarkHoveredRow=null;drawBenchmark();}
  });
  c.addEventListener('mouseleave',function(){benchmarkHoveredRow=null;drawBenchmark();});
  drawBenchmark();
}

function drawBenchmark(){
  var c=document.getElementById('canvas-benchmark');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  var pad={t:44,b:24,l:100,r:20};
  var cw=W-pad.l-pad.r,ch=H-pad.t-pad.b;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var nRows=BENCHMARKS.length,nCols=BENCH_COLS.length;
  var cellW=cw/nCols,cellH=ch/nRows;

  // Column headers
  ctx.save();
  BENCH_COLS.forEach(function(col,ci){
    var cx=pad.l+ci*cellW+cellW/2;
    var lines=col.split('\\n');
    ctx.fillStyle=BENCH_COLORS[ci];ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(lines[0],cx,pad.t-14);
    ctx.fillStyle=ci%2===1?BENCH_COLORS[ci]:'#8b949e';
    ctx.font='8px Inter,sans-serif';
    ctx.fillText(lines[1]||'',cx,pad.t-4);
    // Trained indicator
    if(ci%2===1){
      ctx.fillStyle=BENCH_COLORS[ci]+'44';
      ctx.fillRect(pad.l+ci*cellW+2,pad.t,cellW-4,ch);
    }
  });
  ctx.restore();

  // Rows
  BENCHMARKS.forEach(function(bm,ri){
    var ry=pad.t+ri*cellH;
    var hov=benchmarkHoveredRow===ri;

    // Row highlight
    if(hov){ctx.save();ctx.fillStyle='rgba(255,255,255,0.04)';ctx.fillRect(0,ry,W,cellH);ctx.restore();}

    // Row label
    ctx.save();
    ctx.fillStyle=hov?'#c9d1d9':'#8b949e';ctx.font=(hov?'bold ':'')+'11px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(bm.name,pad.l-8,ry+cellH/2-5);
    ctx.fillStyle='#444d56';ctx.font='8px Inter,sans-serif';
    ctx.fillText(bm.type,pad.l-8,ry+cellH/2+7);
    ctx.restore();

    // Grid line
    ctx.save();ctx.strokeStyle='#21262d';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(pad.l,ry);ctx.lineTo(pad.l+cw,ry);ctx.stroke();
    ctx.restore();

    // Cells
    bm.vals.forEach(function(v,ci){
      var cx=pad.l+ci*cellW;
      var norm=(v-30)/(90-30);
      var alpha=0.15+norm*0.7;
      ctx.save();
      drawRoundedRect(ctx,cx+3,ry+4,cellW-6,cellH-8,4);
      ctx.fillStyle=BENCH_COLORS[ci].replace('#','rgba(').replace(/([0-9a-f]{2})/gi,function(m){return parseInt(m,16)+',';}).slice(0,-1)+alpha+')';
      // Simpler approach
      ctx.fillStyle=BENCH_COLORS[ci];ctx.globalAlpha=alpha;
      ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle=norm>0.5?'#c9d1d9':'#8b949e';
      ctx.font=(hov?'bold ':'')+'11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(v+'%',cx+cellW/2,ry+cellH/2);

      // Delta badge for trained cols
      if(ci%2===1){
        var delta=v-bm.vals[ci-1];
        ctx.fillStyle='#51cf66';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';
        ctx.fillText('+'+delta,cx+cellW/2,ry+cellH/2+12);
      }
      ctx.restore();
    });
  });

  // Bottom border
  ctx.save();ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad.l,pad.t+ch);ctx.lineTo(pad.l+cw,pad.t+ch);ctx.stroke();
  ctx.restore();
}

// ============================================================
// CONFIG RECOMMENDER
// ============================================================
function initRecommender(){
  updateRecommender();
}

function drawRecommender(lat,qual,cost){
  lat=lat||5;qual=qual||5;cost=cost||5;
  var c=document.getElementById('canvas-recommender');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  // Compute scores for each option
  // Options: Fast-Untrained, Fast-Trained, Strong-Untrained, Strong-Trained, Max-Untrained, Max-Trained
  // Criteria scores (1-10 scale, higher = better on that dimension)
  var options=[
    {label:'Fast',sub:'Untrained',trained:false,
     latScore:10,qualScore:4,costScore:10,acc:35.2,latency:13,color:'#74b9ff'},
    {label:'Fast',sub:'+ Trained',trained:true,
     latScore:10,qualScore:7,costScore:9,acc:50.1,latency:13,color:'#74b9ff'},
    {label:'Strong',sub:'Untrained',trained:false,
     latScore:6,qualScore:7,costScore:6,acc:50.0,latency:26,color:'#51cf66'},
    {label:'Strong',sub:'+ Trained',trained:true,
     latScore:6,qualScore:9,costScore:5,acc:57.2,latency:26,color:'#51cf66'},
    {label:'Max',sub:'Untrained',trained:false,
     latScore:2,qualScore:8,costScore:2,acc:54.3,latency:52,color:'#a29bfe'},
    {label:'Max',sub:'+ Trained',trained:true,
     latScore:2,qualScore:10,costScore:1,acc:60.7,latency:52,color:'#a29bfe'}
  ];

  // Score each option based on sliders (invert cost: high cost-sensitivity penalizes expensive)
  options.forEach(function(o){
    o.score=(lat/10)*o.latScore+(qual/10)*o.qualScore+((11-cost)/10)*o.costScore;
    o.score=o.score/3; // normalize to ~10
  });
  var maxScore=Math.max.apply(null,options.map(function(o){return o.score;}));
  var bestIdx=options.findIndex(function(o){return o.score===maxScore;});

  // Bar chart
  var barW=80,barGap=16,chartH=160,chartY=H-chartH-50,chartX=(W-(options.length*(barW+barGap)-barGap))/2;

  options.forEach(function(o,i){
    var x=chartX+i*(barW+barGap);
    var bh=(o.score/10)*chartH;
    var by=chartY+chartH-bh;
    var isBest=i===bestIdx;

    ctx.save();
    // Glow for best
    if(isBest){
      ctx.shadowColor=o.color;ctx.shadowBlur=16;
    }
    drawRoundedRect(ctx,x,by,barW,bh,6);
    ctx.fillStyle=isBest?o.color:o.color+'44';ctx.fill();
    ctx.strokeStyle=o.color;ctx.lineWidth=isBest?2.5:1;ctx.stroke();
    ctx.shadowBlur=0;

    // Score label inside bar
    if(bh>24){
      ctx.fillStyle=isBest?'#0d1117':'#c9d1d9';
      ctx.font='bold 14px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(o.score.toFixed(1),x+barW/2,by+8);
    }

    // Config label
    ctx.fillStyle=isBest?o.color:'#8b949e';
    ctx.font=(isBest?'bold ':'')+'11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(o.label,x+barW/2,chartY+chartH+6);
    ctx.fillStyle=o.trained?o.color+'cc':'#444d56';
    ctx.font='9px Inter,sans-serif';
    ctx.fillText(o.sub,x+barW/2,chartY+chartH+19);

    // Best badge
    if(isBest){
      drawRoundedRect(ctx,x,by-26,barW,20,6);
      ctx.fillStyle=o.color;ctx.fill();
      ctx.fillStyle='#0d1117';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('\u2605 RECOMMENDED',x+barW/2,by-16);
    }
    ctx.restore();
  });

  // Title
  ctx.save();ctx.fillStyle='#c9d1d9';ctx.font='bold 13px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Fit score by priority weights (higher = better match)',W/2,12);ctx.restore();

  // Update detail panel
  var best=options[bestIdx];
  var det=document.getElementById('recommender-detail');
  if(det){
    det.innerHTML='<strong style="color:'+best.color+'">\u2605 '+best.label+' config '+best.sub+'</strong> recommended based on your priorities.<br><br>'+
      'Accuracy: <span style="color:#51cf66">'+best.acc+'%</span> &nbsp;|&nbsp; '+
      'Latency: <span style="color:#f7b731">'+best.latency+'s</span> &nbsp;|&nbsp; '+
      'Fit score: <span style="color:'+best.color+'">'+best.score.toFixed(1)+'/10</span><br><br>'+
      '<span style="color:var(--muted);font-size:12px;">'+
      (lat>=7?'High latency sensitivity: Fast config keeps you under 15s. ':'')+
      (qual>=7?'High quality requirement: trained config adds +15% accuracy. ':'')+
      (cost>=7?'Cost-conscious: Fast+Trained gives Strong-quality at lower infrastructure cost.':'')+
      (lat<4&&qual<4&&cost<4?'Balanced priorities: Strong+Trained is the most common production choice.':'')+
      '</span>';
  }
}

// ============================================================
// INIT
// ============================================================
function doInit(){
  initPipeline();
  initCERC();
  initComponentChart();
  initTraining();
  initPenalty();
  initScatter();
  initReplay();
  initAblation();
  initConvergence();
  initBenchmark();
  initRecommender();
  updateNavOnScroll();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',doInit);
} else {
  doInit();
}
