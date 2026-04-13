// ===== UTILITIES =====
function lerp(a,b,t){return a+(b-a)*t;}
function easeInOut(t){return t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;}
function drawRoundedRect(ctx,x,y,w,h,r,fill,stroke){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
  if(fill){ctx.fillStyle=fill;ctx.fill();}
  if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}
}
function drawArrow(ctx,x1,y1,x2,y2,color,w){
  ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=w||1.5;
  var ang=Math.atan2(y2-y1,x2-x1);var d=8;
  ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x2,y2);
  ctx.lineTo(x2-d*Math.cos(ang-0.4),y2-d*Math.sin(ang-0.4));
  ctx.lineTo(x2-d*Math.cos(ang+0.4),y2-d*Math.sin(ang+0.4));
  ctx.closePath();ctx.fill();ctx.restore();
}
function seededRand(seed){var s=seed%2147483647;if(s<=0)s+=2147483646;return function(){s=s*16807%2147483647;return(s-1)/2147483646;};}
function wrapText(ctx,text,x,y,maxW,lineH){
  var words=text.split(' ');var line='';
  words.forEach(function(w,i){
    var test=line+(line?' ':'')+w;
    if(ctx.measureText(test).width>maxW&&i>0){ctx.fillText(line,x,y);line=w;y+=lineH;}
    else{line=test;}
  });
  ctx.fillText(line,x,y);
}

// ===== RMF WHEEL (canvas-rmf-wheel) =====
var rmfWheelRaf=null;
var rmfWheelAngle=0;
var selectedFunction=null;
var rmfWheelCanvas=null;

function initRMFWheel(){
  rmfWheelCanvas=document.getElementById('canvas-rmf-wheel');
  if(!rmfWheelCanvas)return;
  rmfWheelCanvas.addEventListener('click',function(e){
    var r=rmfWheelCanvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    rmfWheelHitTest(mx,my);
  });
  animateRMFWheel();
}

function rmfWheelHitTest(mx,my){
  var cx=350,cy=190;
  // Check GOVERN outer ring (arc segments)
  var dx=mx-cx,dy=my-cy;
  var dist=Math.sqrt(dx*dx+dy*dy);
  if(dist>140&&dist<200){
    selectedFunction=0;
    showFunctionDetail(0);
    return;
  }
  // Check inner triangle functions
  var innerFuncs=[
    {idx:1,x:cx-90,y:cy+50,w:80,h:36},
    {idx:2,x:cx-10,y:cy-80,w:80,h:36},
    {idx:3,x:cx+20,y:cy+50,w:80,h:36}
  ];
  for(var i=0;i<innerFuncs.length;i++){
    var f=innerFuncs[i];
    if(mx>=f.x&&mx<=f.x+f.w&&my>=f.y&&my<=f.y+f.h){
      selectedFunction=f.idx;
      showFunctionDetail(f.idx);
      return;
    }
  }
  selectedFunction=null;
  var det=document.getElementById('function-detail');
  if(det)det.innerHTML='<strong>Click any function</strong> in the diagram to learn what it covers.';
}

function showFunctionDetail(idx){
  var f=RMF_FUNCTIONS[idx];
  var det=document.getElementById('function-detail');
  if(!det)return;
  var cats=f.cats.map(function(c){return '<span style="background:'+f.color+'22;color:'+f.color+';padding:2px 8px;border-radius:4px;font-size:11px;margin:2px;display:inline-block">'+c+'</span>';}).join(' ');
  det.innerHTML='<strong style="color:'+f.color+'">'+f.name+'</strong> &mdash; '+f.desc+'<div style="margin-top:10px;">'+cats+'</div>';
}

function animateRMFWheel(){
  var canvas=document.getElementById('canvas-rmf-wheel');
  if(!canvas){rmfWheelRaf=null;return;}
  var ctx=canvas.getContext('2d');
  var W=700,H=360,cx=350,cy=190;
  ctx.clearRect(0,0,W,H);

  rmfWheelAngle+=0.008;

  // Background
  ctx.fillStyle='#161b22';
  ctx.fillRect(0,0,W,H);

  // Draw GOVERN outer ring (rotating, segmented)
  var govColor='#0984e3';
  var outerR=200,innerR=140;
  var numSegs=24;
  for(var i=0;i<numSegs;i++){
    var a0=rmfWheelAngle+(i/numSegs)*Math.PI*2;
    var a1=a0+(0.85/numSegs)*Math.PI*2;
    var alpha=(selectedFunction===0)?1:0.7;
    ctx.beginPath();
    ctx.moveTo(cx+innerR*Math.cos(a0),cy+innerR*Math.sin(a0));
    ctx.arc(cx,cy,outerR,a0,a1);
    ctx.arc(cx,cy,innerR,a1,a0,true);
    ctx.closePath();
    ctx.fillStyle=(i%2===0)?'rgba(9,132,227,'+(alpha*0.5)+')':'rgba(9,132,227,'+(alpha*0.25)+')';
    ctx.fill();
    if(selectedFunction===0){
      ctx.strokeStyle='rgba(9,132,227,0.8)';ctx.lineWidth=1;ctx.stroke();
    }
  }

  // GOVERN label on ring
  ctx.save();
  ctx.fillStyle=selectedFunction===0?govColor:'rgba(116,185,255,0.9)';
  ctx.font='bold 14px Inter,sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  var govLabelAngle=-Math.PI/2+rmfWheelAngle*0.1;
  ctx.translate(cx+170*Math.cos(govLabelAngle),cy+170*Math.sin(govLabelAngle));
  ctx.rotate(govLabelAngle+Math.PI/2);
  ctx.fillText('GOVERN',0,0);
  ctx.restore();

  // Draw inner circle background
  ctx.beginPath();ctx.arc(cx,cy,135,0,Math.PI*2);
  ctx.fillStyle='#0d1117';ctx.fill();
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.stroke();

  // Animated cycle arrows between MAP, MEASURE, MANAGE
  var cycleT=(Date.now()/1000)%1;
  var triR=80;
  var triPts=[
    {x:cx,y:cy-triR,idx:2},         // MEASURE top
    {x:cx+triR*0.87,y:cy+triR*0.5,idx:3}, // MANAGE bottom-right
    {x:cx-triR*0.87,y:cy+triR*0.5,idx:1}  // MAP bottom-left
  ];

  // Draw arrows with animated particle
  for(var i=0;i<3;i++){
    var p0=triPts[i];
    var p1=triPts[(i+1)%3];
    // Arrow line
    var isActive=(selectedFunction===p0.idx||selectedFunction===p1.idx);
    ctx.strokeStyle=isActive?RMF_FUNCTIONS[p0.idx].color:'rgba(255,255,255,0.15)';
    ctx.lineWidth=isActive?2:1;
    ctx.setLineDash([4,4]);
    ctx.beginPath();ctx.moveTo(p0.x,p0.y);ctx.lineTo(p1.x,p1.y);ctx.stroke();
    ctx.setLineDash([]);
    // Animated particle on arrow
    var pt=((cycleT+i/3)%1);
    var px=lerp(p0.x,p1.x,pt);
    var py=lerp(p0.y,p1.y,pt);
    ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);
    ctx.fillStyle=RMF_FUNCTIONS[p0.idx].color;ctx.fill();
  }

  // Draw function boxes
  var funcs=[
    {f:1,x:cx-triR*0.87-40,y:cy+triR*0.5-18}, // MAP
    {f:2,x:cx-40,y:cy-triR-18},                 // MEASURE
    {f:3,x:cx+triR*0.87-40,y:cy+triR*0.5-18}   // MANAGE
  ];
  funcs.forEach(function(item){
    var fn=RMF_FUNCTIONS[item.f];
    var isSel=(selectedFunction===item.f);
    drawRoundedRect(ctx,item.x,item.y,80,36,6,
      isSel?fn.color+'44':'rgba(22,27,34,0.9)',
      isSel?fn.color:'rgba(255,255,255,0.15)');
    ctx.fillStyle=isSel?fn.color:'rgba(255,255,255,0.7)';
    ctx.font='bold 11px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(fn.name,item.x+40,item.y+18);
  });

  // Center label
  ctx.fillStyle='rgba(255,255,255,0.4)';
  ctx.font='10px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Core Functions',cx,cy);

  // Title
  ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.font='11px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('NIST AI RMF Architecture — Click any function to explore',16,12);

  rmfWheelRaf=requestAnimationFrame(animateRMFWheel);
}

// ===== RMF TIMELINE (canvas-rmf-timeline) =====
var timelineProgress=0;
var timelineAnimating=false;
var selectedMilestone=null;

var MILESTONES=[
  {label:'RFI',date:'Jul 2021',x:0.07,y:0.5,desc:'NIST released Request for Information to gauge interest and gather input on an AI Risk Management Framework.'},
  {label:'Concept\nPaper',date:'Dec 2021',x:0.21,y:0.5,desc:'NIST published a concept paper outlining the proposed structure and scope of the AI RMF.'},
  {label:'Draft 1',date:'Mar 2022',x:0.37,y:0.5,desc:'First public draft released for comment. Introduced the four core functions and 7 trustworthiness characteristics.'},
  {label:'Draft 2',date:'Aug 2022',x:0.54,y:0.5,desc:'Second draft incorporating 240+ organizations feedback. Refined category structure and subcategory definitions.'},
  {label:'RMF 1.0',date:'Jan 2023',x:0.70,y:0.5,desc:'Final AI RMF 1.0 released. Became the de facto standard for AI risk management in the US and internationally.'},
  {label:'GenAI\nProfile',date:'Jul 2024',x:0.86,y:0.5,desc:'NIST-AI-600-1: Generative AI Profile published, extending core RMF with 12 GenAI-specific risks including hallucination and prompt injection.'}
];

function initRMFTimeline(){
  var canvas=document.getElementById('canvas-rmf-timeline');
  if(!canvas)return;
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var W=700,H=130;
    MILESTONES.forEach(function(m,i){
      var px=m.x*W;var py=m.y*H;
      if(Math.abs(mx-px)<16&&Math.abs(my-py)<16){
        selectedMilestone=selectedMilestone===i?null:i;
        drawTimeline(1);
      }
    });
    var det=document.getElementById('timeline-detail');
    if(det&&selectedMilestone!==null){
      var m=MILESTONES[selectedMilestone];
      det.innerHTML='<strong style="color:#6c5ce7">'+m.date+' — '+m.label.replace(/\n/,' ')+'</strong><br>'+m.desc;
    } else if(det){
      det.innerHTML='Click a milestone node to see what changed at each stage of the framework\'s development.';
      selectedMilestone=null;drawTimeline(1);
    }
  });

  // IntersectionObserver trigger
  var obs=new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting&&!timelineAnimating){
        timelineAnimating=true;animateTimeline();
      }
    });
  },{threshold:0.3});
  obs.observe(canvas);
  drawTimeline(0);
}

function animateTimeline(){
  if(timelineProgress>=1){drawTimeline(1);return;}
  timelineProgress=Math.min(1,timelineProgress+0.025);
  drawTimeline(timelineProgress);
  requestAnimationFrame(animateTimeline);
}

function drawTimeline(progress){
  var canvas=document.getElementById('canvas-rmf-timeline');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=130;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var lineY=H*0.5;
  var x0=MILESTONES[0].x*W;
  var x1=MILESTONES[MILESTONES.length-1].x*W;
  var lineEnd=x0+(x1-x0)*progress;

  // Base line
  ctx.strokeStyle='#30363d';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x0,lineY);ctx.lineTo(x1,lineY);ctx.stroke();

  // Progress line
  ctx.strokeStyle='#6c5ce7';ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(x0,lineY);ctx.lineTo(lineEnd,lineY);ctx.stroke();

  // Milestones
  MILESTONES.forEach(function(m,i){
    var px=m.x*W;
    if(px>lineEnd+1)return;
    var isSel=(selectedMilestone===i);
    // Tick
    ctx.strokeStyle=isSel?'#a29bfe':'#6c5ce7';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.moveTo(px,lineY-6);ctx.lineTo(px,lineY+6);ctx.stroke();
    // Node
    ctx.beginPath();ctx.arc(px,lineY,isSel?8:5,0,Math.PI*2);
    ctx.fillStyle=isSel?'#6c5ce7':'#0d1117';ctx.fill();
    ctx.strokeStyle=isSel?'#a29bfe':'#6c5ce7';ctx.lineWidth=2;ctx.stroke();
    // Labels
    ctx.fillStyle=isSel?'#c9d1d9':'#8b949e';
    ctx.font=(isSel?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='bottom';
    var lblY=lineY-14;
    var parts=m.label.split('\n');
    parts.forEach(function(p,pi){ctx.fillText(p,px,lblY-(parts.length-1-pi)*12);});
    ctx.fillStyle=isSel?'#6c5ce7':'#8b949e';
    ctx.font='9px Inter,sans-serif';
    ctx.textBaseline='top';
    ctx.fillText(m.date,px,lineY+12);
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Development Timeline — Click a milestone',10,8);
}

// ===== TRUST WHEEL (canvas-trust-wheel) =====
var selectedChar=null;

function initTrustWheel(){
  var canvas=document.getElementById('canvas-trust-wheel');
  if(!canvas)return;
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var W=700,H=340,cx=350,cy=178;
    var n=TRUST_CHARS.length;
    var baseR=110,hitR=150;
    for(var i=0;i<n;i++){
      var angle=-Math.PI/2+(i/n)*Math.PI*2;
      var spkR=(selectedChar===i)?130:baseR;
      var ex=cx+spkR*Math.cos(angle);
      var ey=cy+spkR*Math.sin(angle);
      if(Math.abs(mx-ex)<28&&Math.abs(my-ey)<28){
        selectedChar=(selectedChar===i)?null:i;
        drawTrustWheel();
        showTrustDetail();
        return;
      }
    }
    selectedChar=null;drawTrustWheel();
    var det=document.getElementById('trust-detail');
    if(det)det.innerHTML='<strong>Click a spoke</strong> to expand it and see the full NIST definition with a real-world example.';
  });
  drawTrustWheel();
}

function showTrustDetail(){
  var det=document.getElementById('trust-detail');
  if(!det)return;
  if(selectedChar===null){
    det.innerHTML='<strong>Click a spoke</strong> to expand it and see the full NIST definition.';
    return;
  }
  var c=TRUST_CHARS[selectedChar];
  det.innerHTML='<strong style="color:'+c.color+'">'+c.name.replace(/\n/,' ')+'</strong><br>'+c.desc+'<div style="margin-top:8px;padding:8px 12px;background:rgba(0,0,0,.3);border-radius:6px;font-size:12px;"><strong>Example:</strong> '+c.example+'</div>';
}

function drawTrustWheel(){
  var canvas=document.getElementById('canvas-trust-wheel');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=340,cx=350,cy=175;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var n=TRUST_CHARS.length;
  var baseR=110;

  // Draw spokes
  for(var i=0;i<n;i++){
    var angle=-Math.PI/2+(i/n)*Math.PI*2;
    var isSel=(selectedChar===i);
    var spkR=isSel?135:baseR;
    var ex=cx+spkR*Math.cos(angle);
    var ey=cy+spkR*Math.sin(angle);
    var c=TRUST_CHARS[i];

    // Spoke line
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(ex,ey);
    ctx.strokeStyle=isSel?c.color:(c.color+'66');
    ctx.lineWidth=isSel?3:1.5;ctx.stroke();

    // Node circle
    ctx.beginPath();ctx.arc(ex,ey,isSel?20:14,0,Math.PI*2);
    ctx.fillStyle=isSel?c.color:(c.color+'33');ctx.fill();
    ctx.strokeStyle=c.color;ctx.lineWidth=isSel?2.5:1.5;ctx.stroke();

    // Label outside node
    var lblR=isSel?168:145;
    var lx=cx+lblR*Math.cos(angle);
    var ly=cy+lblR*Math.sin(angle);
    ctx.fillStyle=isSel?c.color:'rgba(255,255,255,0.6)';
    ctx.font=(isSel?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var parts=c.name.split('\n');
    parts.forEach(function(p,pi){
      ctx.fillText(p,lx,ly+(pi-(parts.length-1)/2)*13);
    });
  }

  // Web polygon
  ctx.beginPath();
  for(var i=0;i<n;i++){
    var angle=-Math.PI/2+(i/n)*Math.PI*2;
    var r=selectedChar===i?135:baseR;
    var ex=cx+(r-25)*Math.cos(angle);
    var ey=cy+(r-25)*Math.sin(angle);
    if(i===0)ctx.moveTo(ex,ey);else ctx.lineTo(ex,ey);
  }
  ctx.closePath();
  ctx.fillStyle='rgba(108,92,231,0.06)';ctx.fill();
  ctx.strokeStyle='rgba(108,92,231,0.2)';ctx.lineWidth=1;ctx.stroke();

  // Center hub
  ctx.beginPath();ctx.arc(cx,cy,28,0,Math.PI*2);
  ctx.fillStyle='#6c5ce7';ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 9px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Trustworthy',cx,cy-5);ctx.fillText('AI',cx,cy+7);

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('7 Trustworthiness Characteristics — Click a spoke to explore',16,12);
}

// ===== GOVERN ORG (canvas-govern-org) =====
var governNodeAlphas=[];
var hoveredGovernNode=null;

function initGovernOrg(){
  var canvas=document.getElementById('canvas-govern-org');
  if(!canvas)return;
  GOVERN_CATS.forEach(function(_,i){governNodeAlphas[i]=0;});
  GOVERN_CATS.forEach(function(_,i){
    setTimeout(function(){animateGovernNodeIn(i);},i*120);
  });
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var found=null;
    GOVERN_CATS.forEach(function(n,i){
      if(mx>=n.x-n.w/2&&mx<=n.x+n.w/2&&my>=n.y&&my<=n.y+n.h){found=i;}
    });
    if(found!==hoveredGovernNode){
      hoveredGovernNode=found;
      drawGovernOrg();
      if(found!==null)showGovernDetail(found);
    }
  });
  canvas.addEventListener('mouseleave',function(){
    hoveredGovernNode=null;drawGovernOrg();
  });
  drawGovernOrg();
}

function animateGovernNodeIn(idx){
  var start=Date.now();
  function step(){
    var t=Math.min(1,(Date.now()-start)/400);
    governNodeAlphas[idx]=easeInOut(t);
    drawGovernOrg();
    if(t<1)requestAnimationFrame(step);
  }
  step();
}

function showGovernDetail(idx){
  var det=document.getElementById('govern-detail');
  if(!det)return;
  var n=GOVERN_CATS[idx];
  det.innerHTML='<strong style="color:'+n.color+'">'+n.label.replace(/\n/,' ')+'</strong><br>'+n.desc;
}

function drawGovernOrg(){
  var canvas=document.getElementById('canvas-govern-org');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=300;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  // Draw edges first
  GOVERN_CATS.forEach(function(n,i){
    if(!n.parent)return;
    var parentIdx=GOVERN_CATS.findIndex(function(p){return p.id===n.parent;});
    if(parentIdx<0)return;
    var p=GOVERN_CATS[parentIdx];
    var alpha=Math.min(governNodeAlphas[i]||0,governNodeAlphas[parentIdx]||0);
    ctx.strokeStyle='rgba(48,54,61,'+alpha+')';ctx.lineWidth=1.5;
    ctx.beginPath();
    ctx.moveTo(p.x,p.y+p.h);
    ctx.lineTo(n.x,n.y);
    ctx.stroke();
  });

  // Draw nodes
  GOVERN_CATS.forEach(function(n,i){
    var alpha=governNodeAlphas[i]||0;
    var isHov=(hoveredGovernNode===i);
    ctx.save();ctx.globalAlpha=alpha;
    drawRoundedRect(ctx,n.x-n.w/2,n.y,n.w,n.h,8,
      isHov?(n.color+'33'):'rgba(22,27,34,0.95)',
      isHov?n.color:(n.color+'55'));
    ctx.fillStyle=isHov?n.color:'rgba(255,255,255,0.7)';
    ctx.font=(isHov?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var parts=n.label.split('\n');
    parts.forEach(function(p,pi){ctx.fillText(p,n.x,n.y+n.h/2+(pi-(parts.length-1)/2)*13);});
    ctx.restore();
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('GOVERN Structure — Hover a node to explore each category',16,10);
}

// ===== MAP PIPELINE (canvas-map-pipeline) =====
var mapParticles=[];
var mapPipelineRaf=null;
var selectedMapStep=null;

function initMapPipeline(){
  var canvas=document.getElementById('canvas-map-pipeline');
  if(!canvas)return;
  for(var i=0;i<18;i++){
    mapParticles.push({step:Math.floor(Math.random()*5),t:Math.random(),speed:0.003+Math.random()*0.004});
  }
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var n=MAP_STEPS.length;
    var stepW=112,stepH=54,gapX=28,startX=18,y=115;
    for(var i=0;i<n;i++){
      var x=startX+i*(stepW+gapX);
      if(mx>=x&&mx<=x+stepW&&my>=y&&my<=y+stepH){
        selectedMapStep=(selectedMapStep===i)?null:i;
        showMapDetail();return;
      }
    }
  });
  animateMapPipeline();
}

function showMapDetail(){
  var det=document.getElementById('map-detail');
  if(!det)return;
  if(selectedMapStep===null){
    det.innerHTML='<strong>Click a step</strong> in the MAP pipeline to see what questions to ask at each stage.';
    return;
  }
  var s=MAP_STEPS[selectedMapStep];
  var qs=s.questions.map(function(q){return '<li style="margin:3px 0">'+q+'</li>';}).join('');
  det.innerHTML='<strong style="color:'+s.color+'">'+s.label.replace(/\n/,' ')+'</strong><br>'+s.desc+'<ul style="margin-top:8px;padding-left:18px;font-size:12px;color:#8b949e">'+qs+'</ul>';
}

function animateMapPipeline(){
  var canvas=document.getElementById('canvas-map-pipeline');
  if(!canvas){mapPipelineRaf=null;return;}
  var ctx=canvas.getContext('2d');
  var W=700,H=280;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var n=MAP_STEPS.length;
  var stepW=112,stepH=54,gapX=28,startX=18,boxY=115;

  // Connector lines
  for(var i=0;i<n-1;i++){
    var x0=startX+i*(stepW+gapX)+stepW;
    var x1=x0+gapX;
    var y=boxY+stepH/2;
    drawArrow(ctx,x0+2,y,x1-2,y,'rgba(255,255,255,0.2)',1.5);
  }

  // Update particles
  mapParticles.forEach(function(p){
    p.t+=p.speed;
    if(p.t>=1){p.t=0;p.step=(p.step+1)%n;}
  });

  // Step boxes
  MAP_STEPS.forEach(function(s,i){
    var x=startX+i*(stepW+gapX);
    var isSel=(selectedMapStep===i);
    drawRoundedRect(ctx,x,boxY,stepW,stepH,8,isSel?(s.color+'22'):'rgba(22,27,34,0.9)',isSel?s.color:(s.color+'55'));
    ctx.fillStyle=isSel?s.color:'rgba(255,255,255,0.7)';
    ctx.font=(isSel?'bold ':'')+'9.5px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var parts=s.label.split('\n');
    parts.forEach(function(p,pi){ctx.fillText(p,x+stepW/2,boxY+stepH/2+(pi-(parts.length-1)/2)*12);});
    // Step number badge
    drawRoundedRect(ctx,x+4,boxY+4,20,14,4,s.color,'');
    ctx.fillStyle='#fff';ctx.font='bold 8px Inter,sans-serif';
    ctx.fillText(''+(i+1),x+14,boxY+11);
  });

  // Draw particles flowing between steps
  mapParticles.forEach(function(p){
    if(p.step>=n-1)return;
    var x0=startX+p.step*(stepW+gapX)+stepW;
    var x1=x0+gapX;
    var px=lerp(x0,x1,p.t);
    var py=boxY+stepH/2;
    ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);
    ctx.fillStyle=MAP_STEPS[p.step].color;ctx.fill();
  });

  // Flow label
  ctx.fillStyle='rgba(247,183,49,0.5)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('MAP Pipeline: Risk Identification Process — Click to explore each step',16,12);

  // Description rows below boxes
  if(selectedMapStep!==null){
    var s=MAP_STEPS[selectedMapStep];
    var x=startX+selectedMapStep*(stepW+gapX);
    // Arrow down
    ctx.strokeStyle=s.color;ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x+stepW/2,boxY+stepH+2);ctx.lineTo(x+stepW/2,boxY+stepH+10);ctx.stroke();
  }

  mapPipelineRaf=requestAnimationFrame(animateMapPipeline);
}

// ===== RISK REGISTER (canvas-risk-register) =====
var selectedRisk=null;

function initRiskRegister(){
  var canvas=document.getElementById('canvas-risk-register');
  if(!canvas)return;
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var W=700,H=240;
    var pad={l:70,r:24,t:28,b:50};
    var pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;
    var found=null;
    RISK_DOTS.forEach(function(d,i){
      var px=pad.l+d.x*pw;
      var py=pad.t+(1-d.y)*ph;
      if(Math.abs(mx-px)<12&&Math.abs(my-py)<12)found=i;
    });
    selectedRisk=(found===selectedRisk)?null:found;
    drawRiskRegister();
    showRiskDetail();
  });
  drawRiskRegister();
}

function showRiskDetail(){
  var det=document.getElementById('risk-detail');
  if(!det)return;
  if(selectedRisk===null){
    det.innerHTML='Click a risk dot to see its name, category, likelihood, and impact.';return;
  }
  var d=RISK_DOTS[selectedRisk];
  var likeLabel=['Low','Moderate','High','Very High'][Math.floor(d.x*3.99)];
  var impLabel=['Low','Moderate','High','Critical'][Math.floor(d.y*3.99)];
  det.innerHTML='<strong style="color:'+d.color+'">'+d.name+'</strong> <span style="background:'+d.color+'22;color:'+d.color+';padding:1px 6px;border-radius:4px;font-size:10px">'+d.cat+'</span><br>'+d.desc+'<div style="margin-top:6px;font-size:11px;color:#8b949e">Likelihood: <strong style="color:'+d.color+'">'+likeLabel+'</strong> &nbsp;|&nbsp; Impact: <strong style="color:'+d.color+'">'+impLabel+'</strong></div>';
}

function drawRiskRegister(){
  var canvas=document.getElementById('canvas-risk-register');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=240;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var pad={l:70,r:24,t:28,b:50};
  var pw=W-pad.l-pad.r,ph=H-pad.t-pad.b;

  // Quadrant fills
  var qColors=[
    {x:0,y:0,w:0.5,h:0.5,fill:'rgba(81,207,102,0.04)',label:'Monitor'},
    {x:0.5,y:0,w:0.5,h:0.5,fill:'rgba(247,183,49,0.06)',label:'Watch'},
    {x:0,y:0.5,w:0.5,h:0.5,fill:'rgba(247,183,49,0.06)',label:'Watch'},
    {x:0.5,y:0.5,w:0.5,h:0.5,fill:'rgba(255,107,107,0.08)',label:'Act Now'}
  ];
  qColors.forEach(function(q){
    ctx.fillStyle=q.fill;
    ctx.fillRect(pad.l+q.x*pw,pad.t+(1-q.y-q.h)*ph,q.w*pw,q.h*ph);
    ctx.fillStyle='rgba(255,255,255,0.12)';
    ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(q.label,pad.l+(q.x+q.w/2)*pw,pad.t+(1-q.y-q.h/2)*ph);
  });

  // Grid lines
  ctx.strokeStyle='rgba(48,54,61,0.5)';ctx.lineWidth=1;ctx.setLineDash([3,4]);
  ctx.beginPath();ctx.moveTo(pad.l+pw/2,pad.t);ctx.lineTo(pad.l+pw/2,pad.t+ph);ctx.stroke();
  ctx.beginPath();ctx.moveTo(pad.l,pad.t+ph/2);ctx.lineTo(pad.l+pw,pad.t+ph/2);ctx.stroke();
  ctx.setLineDash([]);

  // Axes
  ctx.strokeStyle='rgba(255,255,255,0.2)';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,pad.t+ph);ctx.lineTo(pad.l+pw,pad.t+ph);ctx.stroke();

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('Likelihood →',pad.l+pw/2,H-4);
  ctx.save();ctx.translate(16,pad.t+ph/2);ctx.rotate(-Math.PI/2);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('← Impact',0,0);ctx.restore();

  // Axis ticks
  var tickLabels=['Low','Moderate','High'];
  tickLabels.forEach(function(l,i){
    var x=pad.l+(i+0.5)*pw/3;
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';ctx.fillText(l,x,pad.t+ph+4);
  });
  ['Low','Med','High'].forEach(function(l,i){
    var y=pad.t+ph-(i+0.5)*ph/3;
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';
    ctx.textAlign='right';ctx.textBaseline='middle';ctx.fillText(l,pad.l-5,y);
  });

  // Risk dots
  RISK_DOTS.forEach(function(d,i){
    var px=pad.l+d.x*pw;
    var py=pad.t+(1-d.y)*ph;
    var isSel=(selectedRisk===i);
    if(isSel){
      ctx.beginPath();ctx.arc(px,py,16,0,Math.PI*2);
      ctx.fillStyle=d.color+'22';ctx.fill();
    }
    ctx.beginPath();ctx.arc(px,py,isSel?9:6,0,Math.PI*2);
    ctx.fillStyle=d.color;ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=1.5;ctx.stroke();
    if(isSel){
      ctx.fillStyle=d.color;ctx.font='bold 9px Inter,sans-serif';
      ctx.textAlign='center';ctx.textBaseline='bottom';ctx.fillText(d.name,px,py-12);
    }
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Risk Register: Likelihood × Impact — Click a risk dot',pad.l,6);
}

// ===== MEASURE DASHBOARD (canvas-measure-dashboard) =====
function drawMeasureDashboard(){
  var canvas=document.getElementById('canvas-measure-dashboard');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=280;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var accuracy=parseInt(document.getElementById('sl-accuracy')?document.getElementById('sl-accuracy').value:82);
  var fairness=parseInt(document.getElementById('sl-fairness')?document.getElementById('sl-fairness').value:61);
  var robustness=parseInt(document.getElementById('sl-robustness')?document.getElementById('sl-robustness').value:74);
  var transparency=parseInt(document.getElementById('sl-transparency')?document.getElementById('sl-transparency').value:55);
  var vals=[accuracy,fairness,robustness,transparency];
  var colors=['#74b9ff','#fd79a8','#f7b731','#00b894'];
  var labels=['Accuracy','Fairness','Robustness','Transparency'];
  var minimums=[70,65,60,50];

  var gaugeW=140,gaugeH=160,cols=4;
  var totalW=cols*gaugeW+(cols-1)*16;
  var startX=(W-totalW)/2;
  var startY=30;

  vals.forEach(function(v,i){
    var gx=startX+i*(gaugeW+16);
    var gy=startY;
    var cx2=gx+gaugeW/2;
    var cy2=gy+gaugeH*0.6;
    var r=52;
    var startAng=Math.PI*0.75;
    var endAng=Math.PI*0.25+Math.PI;

    // Background arc
    ctx.beginPath();ctx.arc(cx2,cy2,r,startAng,startAng+Math.PI*1.5);
    ctx.strokeStyle='rgba(48,54,61,0.8)';ctx.lineWidth=10;ctx.lineCap='round';ctx.stroke();

    // Value arc
    var fillAng=startAng+(v/100)*Math.PI*1.5;
    ctx.beginPath();ctx.arc(cx2,cy2,r,startAng,fillAng);
    ctx.strokeStyle=colors[i];ctx.lineWidth=10;ctx.stroke();

    // Minimum threshold marker
    var minAng=startAng+(minimums[i]/100)*Math.PI*1.5;
    var mx2=cx2+r*Math.cos(minAng);
    var my2=cy2+r*Math.sin(minAng);
    ctx.beginPath();ctx.arc(mx2,my2,5,0,Math.PI*2);
    ctx.fillStyle='#ff6b6b';ctx.fill();

    // Value text
    ctx.fillStyle=v>=minimums[i]?colors[i]:'#ff6b6b';
    ctx.font='bold 22px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(v+'%',cx2,cy2+4);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Inter,sans-serif';
    ctx.fillText(labels[i],cx2,cy2+24);

    // Min label
    ctx.fillStyle='rgba(255,107,107,0.6)';ctx.font='8px Inter,sans-serif';
    ctx.fillText('min:'+minimums[i]+'%',cx2,gy+gaugeH-8);

    // Status indicator
    var ok=v>=minimums[i];
    ctx.fillStyle=ok?'rgba(81,207,102,0.8)':'rgba(255,107,107,0.8)';
    ctx.font='9px Inter,sans-serif';
    ctx.fillText(ok?'✓ OK':'⚠ Low',cx2,gy+gaugeH+8);
  });

  // Composite score
  var composite=Math.round((accuracy*0.3+fairness*0.3+robustness*0.2+transparency*0.2));
  var scoreX=W/2,scoreY=240;
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Composite Trustworthiness Score',scoreX,scoreY-14);
  // Score bar
  ctx.fillStyle='rgba(48,54,61,0.6)';
  drawRoundedRect(ctx,scoreX-150,scoreY,300,14,7,'rgba(48,54,61,0.6)','');
  var scoreColor=composite>=70?'#51cf66':composite>=50?'#f7b731':'#ff6b6b';
  drawRoundedRect(ctx,scoreX-150,scoreY,300*(composite/100),14,7,scoreColor,'');
  ctx.fillStyle='#fff';ctx.font='bold 11px Inter,sans-serif';
  ctx.fillText(composite+'%',scoreX,scoreY+7);

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('AI Risk Measurement Dashboard — Red dots = NIST minimum thresholds',16,8);
}

// ===== MEASURE LOOP (canvas-measure-loop) =====
var measureLoopRaf=null;
var measureLoopAngle=0;

var LOOP_NODES=[
  {label:'Identify\nMetrics',color:'#ff6b6b',cat:'MS 1'},
  {label:'Collect\nData',color:'#f7b731',cat:'MS 2'},
  {label:'Evaluate\nSystem',color:'#51cf66',cat:'MS 2'},
  {label:'Report\nFindings',color:'#0984e3',cat:'MS 3'},
  {label:'Update &\nImprove',color:'#6c5ce7',cat:'MS 4'}
];

function initMeasureLoop(){
  animateMeasureLoop();
}

function animateMeasureLoop(){
  var canvas=document.getElementById('canvas-measure-loop');
  if(!canvas){measureLoopRaf=null;return;}
  var ctx=canvas.getContext('2d');
  var W=700,H=180,cx=350,cy=95;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  measureLoopAngle+=0.01;
  var n=LOOP_NODES.length;
  var loopR=68;
  var t=(measureLoopAngle/(Math.PI*2))%1;

  // Draw arcs between nodes
  for(var i=0;i<n;i++){
    var a0=-Math.PI/2+(i/n)*Math.PI*2;
    var a1=-Math.PI/2+((i+0.8)/n)*Math.PI*2;
    ctx.beginPath();ctx.arc(cx,cy,loopR,a0,a1);
    ctx.strokeStyle=LOOP_NODES[i].color+'66';ctx.lineWidth=2;ctx.stroke();
    // Arrow at end
    var arrowAngle=-Math.PI/2+((i+0.8)/n)*Math.PI*2;
    var ax=cx+loopR*Math.cos(arrowAngle);
    var ay=cy+loopR*Math.sin(arrowAngle);
    ctx.save();ctx.translate(ax,ay);ctx.rotate(arrowAngle+Math.PI/2);
    ctx.fillStyle=LOOP_NODES[i].color;
    ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(4,3);ctx.lineTo(-4,3);ctx.closePath();
    ctx.fill();ctx.restore();
  }

  // Animated particle
  var partAngle=-Math.PI/2+t*Math.PI*2+measureLoopAngle*0.0;
  var partIdx=Math.floor(((t*n)%n));
  var px2=cx+loopR*Math.cos(-Math.PI/2+t*Math.PI*2);
  var py2=cy+loopR*Math.sin(-Math.PI/2+t*Math.PI*2);
  ctx.beginPath();ctx.arc(px2,py2,5,0,Math.PI*2);
  ctx.fillStyle=LOOP_NODES[partIdx%n].color;ctx.fill();

  // Draw nodes
  LOOP_NODES.forEach(function(nd,i){
    var angle=-Math.PI/2+(i/n)*Math.PI*2;
    var nx=cx+loopR*Math.cos(angle);
    var ny=cy+loopR*Math.sin(angle);
    ctx.beginPath();ctx.arc(nx,ny,18,0,Math.PI*2);
    ctx.fillStyle='#0d1117';ctx.fill();
    ctx.strokeStyle=nd.color;ctx.lineWidth=2;ctx.stroke();
    // Label
    var lblR=loopR+36;
    var lx=cx+lblR*Math.cos(angle);
    var ly=cy+lblR*Math.sin(angle);
    ctx.fillStyle=nd.color;ctx.font='bold 8px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(nd.cat,nx,ny+1);
    ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='9px Inter,sans-serif';
    var parts=nd.label.split('\n');
    parts.forEach(function(p,pi){ctx.fillText(p,lx,ly+(pi-(parts.length-1)/2)*11);});
  });

  // Center
  ctx.fillStyle='rgba(255,107,107,0.15)';
  ctx.beginPath();ctx.arc(cx,cy,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(255,107,107,0.8)';ctx.font='bold 9px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('MEASURE',cx,cy-4);ctx.fillText('Cycle',cx,cy+7);

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('MEASURE Feedback Loop — Continuous risk measurement cycle',16,8);

  measureLoopRaf=requestAnimationFrame(animateMeasureLoop);
}

// ===== MANAGE PLAYBOOK (canvas-manage-playbook) =====
function initManagePlaybook(){
  var canvas=document.getElementById('canvas-manage-playbook');
  if(!canvas)return;
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var cards=getPlaybookCardRects();
    cards.forEach(function(c,i){
      if(mx>=c.x&&mx<=c.x+c.w&&my>=c.y&&my<=c.y+c.h){
        flipCard(i);
      }
    });
  });
  drawManagePlaybook();
}

function getPlaybookCardRects(){
  var W=700,H=320;
  var cw=300,ch=110,gx=28,gy=28,sx=26,sy=36;
  return [
    {x:sx,y:sy,w:cw,h:ch},
    {x:sx+cw+gx,y:sy,w:cw,h:ch},
    {x:sx,y:sy+ch+gy,w:cw,h:ch},
    {x:sx+cw+gx,y:sy+ch+gy,w:cw,h:ch}
  ];
}

function drawManagePlaybook(){
  var canvas=document.getElementById('canvas-manage-playbook');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=320;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var rects=getPlaybookCardRects();
  MANAGE_CARDS.forEach(function(card,i){
    var r=rects[i];
    var flipped=!!flippedCards[i];
    var bg=flipped?(card.color+'22'):'rgba(22,27,34,0.9)';
    drawRoundedRect(ctx,r.x,r.y,r.w,r.h,10,bg,flipped?card.color:(card.color+'55'));

    // Title bar
    drawRoundedRect(ctx,r.x,r.y,r.w,28,10,card.color+'33','');
    ctx.fillStyle=card.color;ctx.font='bold 11px Inter,sans-serif';
    ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(card.title,r.x+14,r.y+14);

    // Flip indicator
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='9px Inter,sans-serif';
    ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(flipped?'click to close':'click to see actions',r.x+r.w-10,r.y+14);

    // Body text
    var text=flipped?card.back:card.front;
    ctx.fillStyle='rgba(255,255,255,0.65)';ctx.font='11px Inter,sans-serif';
    ctx.textAlign='left';ctx.textBaseline='top';
    wrapText(ctx,text,r.x+14,r.y+36,r.w-28,15);
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('MANAGE Playbook — Click a card to see example actions',16,8);
}

// ===== RISK RESPONSE (canvas-risk-response) =====
var hoveredResponse=null;
var RESPONSE_QUADS=[
  {label:'ACCEPT',sub:'Low risk, low cost to change',color:'#51cf66',x:0,y:0.5,
   desc:'Use when: risk is within tolerance AND changing the system would cost more than the risk itself. Document the decision and who approved it. Revisit periodically.'},
  {label:'MITIGATE',sub:'High risk, can be addressed',color:'#0984e3',x:0.5,y:0.5,
   desc:'Use when: risk is significant but technical or process controls can reduce it to acceptable levels. Assign mitigation owners, set deadlines, verify effectiveness.'},
  {label:'MONITOR',sub:'Low risk, evolving situation',color:'#f7b731',x:0,y:0,
   desc:'Use when: risk is currently low but could change. Set up monitoring metrics, define trigger thresholds for escalation, schedule periodic review.'},
  {label:'AVOID/TRANSFER',sub:'High risk, cannot mitigate',color:'#ff6b6b',x:0.5,y:0,
   desc:'Avoid: Redesign or discontinue the AI system. Transfer: Shift liability via insurance or contractual arrangements. Both require GOVERN authorization.'}
];

function initRiskResponse(){
  var canvas=document.getElementById('canvas-risk-response');
  if(!canvas)return;
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var W=700,H=200,pad=30;
    var qw=(W-pad*2)/2,qh=(H-pad*2)/2;
    var found=null;
    RESPONSE_QUADS.forEach(function(q,i){
      var qx=pad+q.x*(W-pad*2);
      var qy=pad+q.y*(H-pad*2);
      if(mx>=qx&&mx<=qx+qw&&my>=qy&&my<=qy+qh)found=i;
    });
    if(found!==hoveredResponse){
      hoveredResponse=found;
      drawRiskResponse();
      if(found!==null){
        var det=document.getElementById('response-detail');
        if(det)det.innerHTML='<strong style="color:'+RESPONSE_QUADS[found].color+'">'+RESPONSE_QUADS[found].label+'</strong> &mdash; '+RESPONSE_QUADS[found].desc;
      }
    }
  });
  canvas.addEventListener('mouseleave',function(){
    hoveredResponse=null;drawRiskResponse();
    var det=document.getElementById('response-detail');
    if(det)det.innerHTML='Hover a quadrant to see when to use each risk response strategy.';
  });
  drawRiskResponse();
}

function drawRiskResponse(){
  var canvas=document.getElementById('canvas-risk-response');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=200,pad=30;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var qw=(W-pad*2)/2,qh=(H-pad*2)/2;

  RESPONSE_QUADS.forEach(function(q,i){
    var qx=pad+q.x*(W-pad*2);
    var qy=pad+q.y*(H-pad*2);
    var isHov=(hoveredResponse===i);
    drawRoundedRect(ctx,qx+2,qy+2,qw-4,qh-4,8,
      isHov?(q.color+'22'):'rgba(22,27,34,0.8)',
      isHov?q.color:(q.color+'44'));
    ctx.fillStyle=isHov?q.color:'rgba(255,255,255,0.7)';
    ctx.font='bold 13px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(q.label,qx+qw/2,qy+qh/2-8);
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
    ctx.fillText(q.sub,qx+qw/2,qy+qh/2+10);
  });

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('← Low Risk         High Risk →',W/2,H-14);
  ctx.save();ctx.translate(14,H/2);ctx.rotate(-Math.PI/2);
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('← Fixable         Not Fixable →',0,0);ctx.restore();

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Risk Response Matrix — Hover to explore options',pad,6);
}

// ===== LIFECYCLE MAP (canvas-lifecycle-map) =====
var lifecycleRaf=null;
var lifecycleArrowT=0;

function initLifecycleMap(){
  var canvas=document.getElementById('canvas-lifecycle-map');
  if(!canvas)return;
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var rects=getLifecycleRects();
    var found=null;
    rects.forEach(function(rc,i){if(mx>=rc.x&&mx<=rc.x+rc.w&&my>=rc.y&&my<=rc.y+rc.h)found=i;});
    if(found!==hoveredStage){
      hoveredStage=found;
      if(found!==null)showLifecycleDetail(found);
    }
  });
  canvas.addEventListener('mouseleave',function(){
    hoveredStage=null;
    var det=document.getElementById('lifecycle-detail');
    if(det)det.innerHTML='Hover a lifecycle stage to see which RMF functions apply, who is responsible, and the key risks at that phase.';
  });
  animateLifecycle();
}

function getLifecycleRects(){
  var W=700,H=320;
  var n=LIFECYCLE_STAGES.length;
  var stageW=116,stageH=70,gapX=16,startX=14,stageY=50;
  return LIFECYCLE_STAGES.map(function(_,i){
    return {x:startX+i*(stageW+gapX),y:stageY,w:stageW,h:stageH};
  });
}

function showLifecycleDetail(idx){
  var det=document.getElementById('lifecycle-detail');
  if(!det)return;
  var s=LIFECYCLE_STAGES[idx];
  var funcBadges=s.functions.map(function(f){
    var fn=RMF_FUNCTIONS.find(function(rf){return rf.name===f;});
    var color=fn?fn.color:'#6c5ce7';
    return '<span style="background:'+color+'22;color:'+color+';padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;margin:2px;display:inline-block">'+f+'</span>';
  }).join(' ');
  det.innerHTML='<strong style="color:'+s.color+'">'+s.name.replace(/\n/,' ')+'</strong> &mdash; '+s.detail+'<div style="margin-top:6px;">Functions: '+funcBadges+'</div><div style="margin-top:6px;font-size:11px;color:#8b949e"><strong>Actors:</strong> '+s.actors+'<br><strong>Risks:</strong> '+s.risks+'</div>';
}

function animateLifecycle(){
  var canvas=document.getElementById('canvas-lifecycle-map');
  if(!canvas){lifecycleRaf=null;return;}
  var ctx=canvas.getContext('2d');
  var W=700,H=320;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  lifecycleArrowT=(lifecycleArrowT+0.01)%1;

  var n=LIFECYCLE_STAGES.length;
  var stageW=116,stageH=70,gapX=16,startX=14,stageY=50;
  var rects=getLifecycleRects();

  // Connector arrows between stages
  for(var i=0;i<n-1;i++){
    var r0=rects[i];var r1=rects[i+1];
    var x0=r0.x+r0.w,y0=r0.y+r0.h/2;
    var x1=r1.x,y1=r1.y+r1.h/2;
    drawArrow(ctx,x0+2,y0,x1-2,y1,'rgba(255,255,255,0.2)',1.5);
    // Animated particle
    var pt=(lifecycleArrowT+i*0.25)%1;
    var px=lerp(x0,x1,pt);var py=lerp(y0,y1,pt);
    ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);
    ctx.fillStyle=LIFECYCLE_STAGES[i].color;ctx.fill();
  }

  // Stage boxes
  LIFECYCLE_STAGES.forEach(function(s,i){
    var rc=rects[i];
    var isHov=(hoveredStage===i);
    drawRoundedRect(ctx,rc.x,rc.y,rc.w,rc.h,8,
      isHov?(s.color+'22'):'rgba(22,27,34,0.9)',
      isHov?s.color:(s.color+'55'));
    // Stage name
    ctx.fillStyle=isHov?s.color:'rgba(255,255,255,0.8)';
    ctx.font=(isHov?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var parts=s.name.split('\n');
    parts.forEach(function(p,pi){ctx.fillText(p,rc.x+rc.w/2,rc.y+rc.h*0.35+(pi-(parts.length-1)/2)*13);});
  });

  // Function badges below each stage
  var badgeY=stageY+stageH+14;
  var funcRow=['GOVERN','MAP','MEASURE','MANAGE'];
  var funcColors={'GOVERN':'#0984e3','MAP':'#f7b731','MEASURE':'#ff6b6b','MANAGE':'#51cf66'};

  LIFECYCLE_STAGES.forEach(function(s,i){
    var rc=rects[i];
    var bx=rc.x+rc.w/2;
    var by=badgeY;
    s.functions.forEach(function(fname,fi){
      var fcol=funcColors[fname]||'#6c5ce7';
      var isHov=(hoveredStage===i);
      drawRoundedRect(ctx,bx-rc.w/2+4,by+fi*20,rc.w-8,16,4,fcol+(isHov?'44':'22'),'');
      ctx.fillStyle=fcol+(isHov?'ff':'aa');
      ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(fname,bx,by+fi*20+8);
    });
  });

  // Legend title
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('RMF Functions',startX,badgeY-4);

  // Title
  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('AI Lifecycle Integration — Hover a stage to see which RMF functions apply',16,10);

  lifecycleRaf=requestAnimationFrame(animateLifecycle);
}

// ===== INIT ALL =====
function doInit(){
  initRMFWheel();
  initRMFTimeline();
  initTrustWheel();
  initGovernOrg();
  initMapPipeline();
  initRiskRegister();
  drawMeasureDashboard();
  initMeasureLoop();
  initManagePlaybook();
  initRiskResponse();
  initLifecycleMap();
  updateNavOnScroll();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',doInit);
}else{
  doInit();
}
