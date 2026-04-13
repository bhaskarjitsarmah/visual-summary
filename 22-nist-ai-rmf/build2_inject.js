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

// ===== RISK FLOW WALKTHROUGH (canvas-risk-flow) =====
function initRiskFlow(){
  setFlowStep(0);
}

function drawRiskFlow(){
  var canvas=document.getElementById('canvas-risk-flow');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=290;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var positions=[
    {fn:'MAP',color:'#f7b731',x:20,y:70},
    {fn:'MEASURE',color:'#ff6b6b',x:193,y:70},
    {fn:'MANAGE',color:'#51cf66',x:366,y:70},
    {fn:'GOVERN',color:'#0984e3',x:539,y:70}
  ];
  var bw=153,bh=180;

  // Risk banner at top
  ctx.fillStyle='rgba(108,92,231,0.15)';
  drawRoundedRect(ctx,20,10,W-40,34,6,'rgba(108,92,231,0.12)','rgba(108,92,231,0.4)');
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 11px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Risk: Algorithmic Bias in Hiring AI',W/2,27);

  // Connecting arrows between boxes
  for(var i=0;i<positions.length-1;i++){
    var p=positions[i];var p2=positions[i+1];
    var isActive=(riskFlowStep>i);
    drawArrow(ctx,p.x+bw+2,p.y+bh/2,p2.x-2,p2.y+bh/2,isActive?p.color:'rgba(48,54,61,0.6)',isActive?2:1);
    // Animated progress dot
    if(riskFlowStep===i+1){
      var pt=(Date.now()%1200)/1200;
      var px2=lerp(p.x+bw,p2.x,pt);
      ctx.beginPath();ctx.arc(px2,p.y+bh/2,4,0,Math.PI*2);
      ctx.fillStyle=positions[i+1].color;ctx.fill();
    }
  }

  // Draw each function box
  positions.forEach(function(pos,i){
    var step=RISK_FLOW_STEPS[i];
    var isActive=(i===riskFlowStep);
    var isPast=(i<riskFlowStep);
    var alpha=isActive?1:isPast?0.75:0.35;
    ctx.globalAlpha=alpha;

    drawRoundedRect(ctx,pos.x,pos.y,bw,bh,10,
      isActive?(pos.color+'1a'):'rgba(22,27,34,0.95)',
      isActive?pos.color:isPast?(pos.color+'66'):'rgba(48,54,61,0.5)');

    // Function label
    ctx.fillStyle=pos.color;ctx.font='bold 11px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(pos.fn,pos.x+bw/2,pos.y+10);

    // Checkmark past steps
    if(isPast){
      ctx.fillStyle='#51cf66';ctx.font='bold 13px Inter,sans-serif';
      ctx.textAlign='right';
      ctx.fillText('\u2713',pos.x+bw-8,pos.y+8);
    }

    // Step number
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText('Step '+(i+1)+' of 4',pos.x+bw/2,pos.y+26);

    // Description text
    ctx.fillStyle=isActive?'rgba(255,255,255,0.75)':'rgba(255,255,255,0.35)';
    ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
    wrapText(ctx,step.desc.slice(0,100),pos.x+8,pos.y+44,bw-16,13);

    // Output badge
    if(isActive||isPast){
      drawRoundedRect(ctx,pos.x+6,pos.y+bh-34,bw-12,28,5,pos.color+'22','');
      ctx.fillStyle=pos.color;ctx.font='8px Inter,sans-serif';
      ctx.textAlign='left';ctx.textBaseline='top';
      wrapText(ctx,step.action.slice(0,60),pos.x+10,pos.y+bh-30,bw-20,12);
    }
    ctx.globalAlpha=1;
  });

  // Title
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('Click buttons above to step through the risk lifecycle',16,H-4);

  // Trigger repaint for animation
  if(riskFlowStep<positions.length-1){requestAnimationFrame(drawRiskFlow);}
}

// ===== GENAI RISKS GRID (canvas-genai-grid) =====
function initGenAIGrid(){
  var canvas=document.getElementById('canvas-genai-grid');
  if(!canvas)return;
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left;var my=e.clientY-r.top;
    var rects=getGenAIRects();
    var found=null;
    rects.forEach(function(rc,i){if(mx>=rc.x&&mx<=rc.x+rc.w&&my>=rc.y&&my<=rc.y+rc.h)found=i;});
    if(found!==null){
      selectedGenAIRisk=(selectedGenAIRisk===found)?null:found;
      drawGenAIGrid();
      showGenAIDetail();
    }
  });
  drawGenAIGrid();
}

function getGenAIRects(){
  var cols=4,pw=162,ph=108,gx=10,gy=10,sx=10,sy=20;
  var rects=[];
  for(var i=0;i<12;i++){
    var col=i%cols,row=Math.floor(i/cols);
    rects.push({x:sx+col*(pw+gx),y:sy+row*(ph+gy),w:pw,h:ph});
  }
  return rects;
}

function showGenAIDetail(){
  var det=document.getElementById('genai-detail');
  if(!det)return;
  if(selectedGenAIRisk===null){
    det.innerHTML='<strong>Click a risk card</strong> to see description, severity, and mitigation strategies.';return;
  }
  var r=GENAI_RISKS[selectedGenAIRisk];
  var sev='';for(var s=0;s<5;s++)sev+=(s<r.sev?'\u25c6':'\u25c7');
  det.innerHTML='<strong style="color:'+r.color+'">'+r.name.replace(/\n/g,' ')+'</strong> <span style="color:'+r.color+';font-size:11px;letter-spacing:2px">'+sev+'</span> <span style="color:#8b949e;font-size:11px">| '+r.fn+'</span><br>'+r.desc+'<div style="margin-top:8px;padding:8px 12px;background:rgba(0,0,0,.3);border-radius:6px;font-size:12px"><strong style="color:#c9d1d9">Mitigations:</strong> '+r.mit+'</div>';
}

function drawGenAIGrid(){
  var canvas=document.getElementById('canvas-genai-grid');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=360;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var rects=getGenAIRects();
  GENAI_RISKS.forEach(function(r,i){
    var rc=rects[i];
    var isSel=(selectedGenAIRisk===i);
    drawRoundedRect(ctx,rc.x,rc.y,rc.w,rc.h,8,
      isSel?(r.color+'22'):'rgba(22,27,34,0.9)',isSel?r.color:(r.color+'55'));
    // Severity pips
    for(var s=0;s<5;s++){
      ctx.beginPath();ctx.arc(rc.x+8+s*10,rc.y+10,3,0,Math.PI*2);
      ctx.fillStyle=s<r.sev?r.color:'rgba(255,255,255,0.12)';ctx.fill();
    }
    // Name
    ctx.fillStyle=isSel?r.color:'rgba(255,255,255,0.8)';
    ctx.font=(isSel?'bold ':'')+'10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    var parts=r.name.split('\n');
    var midY=rc.y+rc.h*0.44;
    parts.forEach(function(p,pi){ctx.fillText(p,rc.x+rc.w/2,midY+(pi-(parts.length-1)/2)*13);});
    // Function tag
    ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='8px Inter,sans-serif';
    ctx.fillText(r.fn,rc.x+rc.w/2,rc.y+rc.h-10);
    // Selected indicator
    if(isSel){
      ctx.fillStyle=r.color;ctx.font='bold 11px Inter,sans-serif';
      ctx.fillText('\u25bc',rc.x+rc.w-10,rc.y+8);
    }
  });

  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('GenAI Profile (NIST-AI-600-1) \u2014 12 Unique Risks \u2014 Click to explore',16,4);
}

// ===== SUBCATEGORY BROWSER (HTML grid) =====
function renderSubcatGrid(){
  var container=document.getElementById('subcat-grid');
  if(!container)return;
  var filtered=subcatFilter==='ALL'?SUBCATS:SUBCATS.filter(function(s){return s.fn===subcatFilter;});
  container.innerHTML='';
  filtered.forEach(function(s){
    var card=document.createElement('div');
    card.style.cssText='background:#161b22;border:1px solid '+s.color+'44;border-radius:8px;padding:12px 14px;transition:border-color .15s;';
    card.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">'
      +'<span style="background:'+s.color+'22;color:'+s.color+';padding:2px 7px;border-radius:4px;font-size:9px;font-weight:700;">'+s.id+'</span>'
      +'<span style="font-size:9px;color:#8b949e;background:rgba(48,54,61,0.6);padding:1px 5px;border-radius:3px;">'+s.fn+'</span>'
      +'<span style="font-size:9px;color:#8b949e;">'+s.cat+'</span>'
      +'</div>'
      +'<div style="font-size:11px;color:#c9d1d9;line-height:1.55">'+s.text+'</div>';
    card.addEventListener('mouseenter',function(){card.style.borderColor=s.color;});
    card.addEventListener('mouseleave',function(){card.style.borderColor=s.color+'44';});
    container.appendChild(card);
  });
}

function initSubcatBrowser(){
  renderSubcatGrid();
}

// ===== MATURITY RADAR (canvas-maturity-radar) =====
function initMaturityAssessment(){
  var container=document.getElementById('maturity-questions-container');
  if(!container)return;
  var fnColors={GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'};
  var html='';
  var currentFn='';
  MATURITY_Qs.forEach(function(q,i){
    if(q.fn!==currentFn){
      if(currentFn!=='')html+='<\/div>';
      currentFn=q.fn;
      html+='<div style="margin-bottom:14px;">'
        +'<div style="font-size:10px;font-weight:700;color:'+fnColors[q.fn]+';text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;padding-bottom:4px;border-bottom:1px solid '+fnColors[q.fn]+'33;">'+q.fn+'</div>';
    }
    html+='<div style="margin-bottom:10px;">'
      +'<div style="font-size:11px;color:#c9d1d9;margin-bottom:5px;line-height:1.4">'+q.q+'</div>'
      +'<div style="display:flex;gap:8px;">';
    [{v:2,l:'Yes'},{v:1,l:'Partial'},{v:0,l:'No'}].forEach(function(opt){
      html+='<label style="display:flex;align-items:center;gap:4px;cursor:pointer;font-size:10px;color:#8b949e;padding:3px 8px;border:1px solid rgba(48,54,61,0.8);border-radius:4px;">'
        +'<input type="radio" name="mq'+i+'" value="'+opt.v+'" onchange="maturityAnswers['+i+']=parseInt(this.value);updateMaturityLive();" style="accent-color:'+fnColors[q.fn]+'">'
        +opt.l+'<\/label>';
    });
    html+='<\/div><\/div>';
  });
  html+='<\/div>';
  container.innerHTML=html;
  drawMaturityRadar({GOVERN:0,MAP:0,MEASURE:0,MANAGE:0},{GOVERN:3,MAP:3,MEASURE:3,MANAGE:3});
}

function drawMaturityRadar(scores,counts){
  var canvas=document.getElementById('canvas-maturity-radar');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=320,H=300,cx=160,cy=152,maxR=98;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var fns=['GOVERN','MAP','MEASURE','MANAGE'];
  var colors={GOVERN:'#0984e3',MAP:'#f7b731',MEASURE:'#ff6b6b',MANAGE:'#51cf66'};
  var n=fns.length;

  // Rings
  [0.25,0.5,0.75,1.0].forEach(function(r){
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var a=-Math.PI/2+(i/n)*Math.PI*2;
      var px=cx+maxR*r*Math.cos(a);var py=cy+maxR*r*Math.sin(a);
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();
    ctx.strokeStyle='rgba(48,54,61,'+(r===1.0?0.9:0.4)+')';ctx.lineWidth=r===1.0?1.5:1;ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.18)';ctx.font='8px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(Math.round(r*100)+'%',cx+2,cy-maxR*r+5);
  });

  // Axes
  for(var i=0;i<n;i++){
    var a=-Math.PI/2+(i/n)*Math.PI*2;
    ctx.strokeStyle='rgba(48,54,61,0.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+maxR*Math.cos(a),cy+maxR*Math.sin(a));ctx.stroke();
  }

  // Data polygon
  ctx.beginPath();
  fns.forEach(function(fn,i){
    var a=-Math.PI/2+(i/n)*Math.PI*2;
    var pct=(counts[fn]>0)?(scores[fn]/(counts[fn]*2)):0;
    var r=maxR*Math.max(0,Math.min(1,pct));
    var px=cx+r*Math.cos(a);var py=cy+r*Math.sin(a);
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  });
  ctx.closePath();
  ctx.fillStyle='rgba(108,92,231,0.18)';ctx.fill();
  ctx.strokeStyle='#6c5ce7';ctx.lineWidth=2;ctx.stroke();

  // Dots + labels
  fns.forEach(function(fn,i){
    var a=-Math.PI/2+(i/n)*Math.PI*2;
    var pct=(counts[fn]>0)?(scores[fn]/(counts[fn]*2)):0;
    var r=maxR*Math.max(0,Math.min(1,pct));
    var px=cx+r*Math.cos(a);var py=cy+r*Math.sin(a);
    ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);
    ctx.fillStyle=colors[fn];ctx.fill();
    var lblR=maxR+24;
    var lx=cx+lblR*Math.cos(a);var ly=cy+lblR*Math.sin(a);
    ctx.fillStyle=colors[fn];ctx.font='bold 10px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(fn,lx,ly);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px Inter,sans-serif';
    ctx.fillText(Math.round(pct*100)+'%',lx,ly+12);
  });

  // Center
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('Maturity',cx,cy-4);ctx.fillText('Radar',cx,cy+7);

  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px Inter,sans-serif';
  ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('Answers update live',cx,8);
}

// ===== EU AI ACT CROSSWALK (canvas-crosswalk) =====
function initCrosswalk(){
  var canvas=document.getElementById('canvas-crosswalk');
  if(!canvas)return;
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var my=e.clientY-r.top;
    var rowH=22,startY=34;
    var found=null;
    EU_CROSSWALK.forEach(function(_,i){
      var ry=startY+i*rowH;
      if(my>=ry-1&&my<=ry+rowH-1)found=i;
    });
    if(found!==hoveredCrosswalk){
      hoveredCrosswalk=found;drawCrosswalk();
      if(found!==null){
        var row=EU_CROSSWALK[found];
        var det=document.getElementById('crosswalk-detail');
        if(det){
          var alignPct=Math.round(row.align*100);
          var alignLbl=alignPct>=90?'Very Strong':alignPct>=80?'Strong':alignPct>=70?'Moderate':'Partial';
          det.innerHTML='<strong style="color:'+row.fnColor+'">'+row.rmfFn+' \u2014 '+row.rmfCat+'</strong> \u2194 <strong style="color:#74b9ff">EU AI Act '+row.euArt+'</strong><br>'+row.euDesc+'<div style="margin-top:6px;font-size:11px;color:#8b949e">Alignment: <strong style="color:'+row.fnColor+'">'+alignLbl+' ('+alignPct+'%)</strong></div>';
        }
      }
    }
  });
  canvas.addEventListener('mouseleave',function(){
    hoveredCrosswalk=null;drawCrosswalk();
    var det=document.getElementById('crosswalk-detail');
    if(det)det.innerHTML='Hover a row to see how the RMF subcategory aligns with the EU AI Act article and where gaps remain.';
  });
  drawCrosswalk();
}

function drawCrosswalk(){
  var canvas=document.getElementById('canvas-crosswalk');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=320;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var rowH=22,startY=34;
  var c1=8,w1=82;
  var c2=c1+w1+6,w2=112;
  var c3=c2+w2+6,w3=122;
  var c4=c3+w3+6,w4=W-c4-12;

  // Headers
  ctx.fillStyle='rgba(255,255,255,0.45)';ctx.font='bold 9px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText('RMF Fn',c1,18);ctx.fillText('RMF Category',c2,18);
  ctx.fillText('EU AI Act Article',c3,18);ctx.fillText('Alignment',c4,18);
  ctx.strokeStyle='rgba(48,54,61,0.9)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(8,27);ctx.lineTo(W-8,27);ctx.stroke();

  EU_CROSSWALK.forEach(function(row,i){
    var ry=startY+i*rowH;
    var isHov=(hoveredCrosswalk===i);
    if(isHov){ctx.fillStyle=row.fnColor+'16';ctx.fillRect(4,ry,W-8,rowH-1);}

    // Fn badge
    drawRoundedRect(ctx,c1,ry+3,w1,rowH-7,4,row.fnColor+'33','');
    ctx.fillStyle=row.fnColor;ctx.font='bold 9px Inter,sans-serif';
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(row.rmfFn,c1+w1/2,ry+rowH/2);

    // RMF cat
    ctx.fillStyle=isHov?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.5)';
    ctx.font='9px Inter,sans-serif';ctx.textAlign='left';
    ctx.fillText(row.rmfCat,c2,ry+rowH/2);

    // EU article
    ctx.fillStyle=isHov?'#74b9ff':'rgba(116,185,255,0.55)';
    ctx.fillText(row.euArt,c3,ry+rowH/2);

    // Alignment bar
    drawRoundedRect(ctx,c4,ry+5,w4,rowH-10,3,'rgba(48,54,61,0.6)','');
    var barColor=row.align>=0.9?'#51cf66':row.align>=0.75?'#f7b731':'#ff6b6b';
    drawRoundedRect(ctx,c4,ry+5,w4*row.align,rowH-10,3,barColor,'');
    ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='bold 8px Inter,sans-serif';
    ctx.textAlign='right';
    ctx.fillText(Math.round(row.align*100)+'%',c4+w4-4,ry+rowH/2);

    // Hover tooltip line
    if(isHov){
      ctx.strokeStyle=row.fnColor+'44';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(4,ry+rowH-1);ctx.lineTo(W-4,ry+rowH-1);ctx.stroke();
    }
  });

  // Legend
  [['\u25a0 Very Strong (90%+)','#51cf66'],['\u25a0 Strong (75%+)','#f7b731'],['\u25a0 Partial (<75%)','#ff6b6b']].forEach(function(l,i){
    ctx.fillStyle=l[1];ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';
    ctx.fillText(l[0],c4+i*95,H-4);
  });

  ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';
  ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('NIST AI RMF \u2194 EU AI Act Crosswalk \u2014 Hover a row to explore',16,4);
}

// ===== CASE STUDY (canvas-case-study) =====
function initCaseStudy(){
  var canvas=document.getElementById('canvas-case-study');
  if(!canvas)return;
  drawCaseStudy();
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var W=700,fns=['GOVERN','MAP','MEASURE','MANAGE'];
    var laneH=58,topY=60,colW=130,labW=90;
    var c=CASE_STUDIES[selectedCase];
    if(!c)return;
    fns.forEach(function(fn,fi){
      var y=topY+fi*laneH;
      var gaps=c.gaps[fn]||[];
      gaps.forEach(function(gap,gi){
        var x=labW+gi*(colW+10)+10;
        if(mx>=x&&mx<=x+colW&&my>=y+4&&my<=y+laneH-4){
          var det=document.getElementById('case-gap-detail');
          if(det)det.innerHTML='<strong style="color:'+c.color+'">'+fn+'</strong>: '+gap;
        }
      });
    });
  });
}

function drawCaseStudy(){
  var canvas=document.getElementById('canvas-case-study');
  if(!canvas||typeof CASE_STUDIES==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=320;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var c=CASE_STUDIES[selectedCase];
  if(!c)return;

  var fns=['GOVERN','MAP','MEASURE','MANAGE'];
  var fnColors=['#0984e3','#f7b731','#ff6b6b','#51cf66'];
  var laneH=58,topY=28,labW=88;

  // Title bar
  drawRoundedRect(ctx,0,0,W,24,0,c.color+'33',null);
  ctx.fillStyle=c.color;ctx.font='bold 12px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText(c.title+' ('+c.year+')',10,12);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Inter,sans-serif';
  ctx.fillText('RMF Gap Analysis — click a gap card to see details',300,12);

  fns.forEach(function(fn,fi){
    var y=topY+fi*laneH;
    var bg=(fi%2===0)?'#1a2233':'#161b22';
    ctx.fillStyle=bg;ctx.fillRect(0,y,W,laneH);

    // Function label
    drawRoundedRect(ctx,4,y+8,labW-8,laneH-16,6,fnColors[fi]+'33',fnColors[fi]+'66');
    ctx.fillStyle=fnColors[fi];ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(fn,labW/2,y+laneH/2);

    // Gap cards
    var gaps=c.gaps[fn]||[];
    var colW=Math.min(140,(W-labW-20)/(gaps.length||1)-8);
    gaps.forEach(function(gap,gi){
      var gx=labW+gi*(colW+8)+8;
      drawRoundedRect(ctx,gx,y+6,colW,laneH-12,6,'#ff6b6b22','#ff6b6b66');
      // X mark
      ctx.fillStyle='#ff6b6b';ctx.font='bold 13px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
      ctx.fillText('\u2717',gx+6,y+10);
      // Gap text
      ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
      wrapText(ctx,gap,gx+20,y+10,colW-24,11);
    });
    if(gaps.length===0){
      ctx.fillStyle='#51cf6688';ctx.font='11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.fillText('\u2713 No major gap identified',labW+10,y+laneH/2);
    }
  });

  // Bottom outcome bar
  var botY=topY+fns.length*laneH+4;
  drawRoundedRect(ctx,4,botY,W-8,H-botY-4,6,'#ffffff0a','#ffffff15');
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('OUTCOME:',10,botY+6);
  ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='9px Inter,sans-serif';
  wrapText(ctx,c.outcome,70,botY+6,W-80,12);
}

// ===== ROADMAP (canvas-roadmap) =====
var hoveredRoadmapIdx=null;
function initRoadmap(){
  var canvas=document.getElementById('canvas-roadmap');
  if(!canvas)return;
  drawRoadmap();
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var W=700,H=360,padL=90,padT=50,padR=20,padB=40;
    var plotW=W-padL-padR,plotH=H-padT-padB;
    var months=12,barH=28;
    var newHov=null;
    if(typeof ROADMAP_ITEMS!=='undefined'){
      ROADMAP_ITEMS.forEach(function(item,idx){
        var fns=['GOVERN','MAP','MEASURE','MANAGE'];
        var fi=fns.indexOf(item.fn);
        var laneH=plotH/4;
        var y=padT+fi*laneH+(laneH-barH)/2;
        var x=padL+(item.month-1)/months*plotW;
        var w=item.duration/months*plotW;
        if(mx>=x&&mx<=x+w&&my>=y&&my<=y+barH){newHov=idx;}
      });
    }
    if(newHov!==hoveredRoadmapIdx){hoveredRoadmapIdx=newHov;drawRoadmap();}
  });
  canvas.addEventListener('mouseleave',function(){hoveredRoadmapIdx=null;drawRoadmap();});
}

function drawRoadmap(){
  var canvas=document.getElementById('canvas-roadmap');
  if(!canvas||typeof ROADMAP_ITEMS==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=360,padL=90,padT=50,padR=20,padB=40;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var plotW=W-padL-padR,plotH=H-padT-padB;
  var months=12;
  var fns=['GOVERN','MAP','MEASURE','MANAGE'];
  var fnColors=['#0984e3','#f7b731','#ff6b6b','#51cf66'];

  // Month grid lines
  for(var m=0;m<=months;m++){
    var gx=padL+m/months*plotW;
    ctx.strokeStyle=m%3===0?'#30363d':'#1e2530';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(gx,padT);ctx.lineTo(gx,H-padB);ctx.stroke();
    if(m<months){
      ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText('M'+(m+1),padL+(m+0.5)/months*plotW,padT-18);
    }
  }

  // Phase labels at top
  [[0,3,'Phase 1: Foundation','#0984e3'],[3,6,'Phase 2: Assessment','#f7b731'],[6,9,'Phase 3: Implement','#ff6b6b'],[9,12,'Phase 4: Sustain','#51cf66']].forEach(function(ph){
    var px=padL+ph[0]/months*plotW;
    var pw=ph[1]/months*plotW-ph[0]/months*plotW;
    ctx.fillStyle=ph[3]+'33';ctx.fillRect(px,padT-22,pw,18);
    ctx.fillStyle=ph[3];ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(ph[2],px+pw/2,padT-13);
  });

  // Function lanes
  fns.forEach(function(fn,fi){
    var laneH=plotH/4;
    var y=padT+fi*laneH;
    ctx.fillStyle=(fi%2===0)?'#1a2233':'#161b22';ctx.fillRect(padL,y,plotW,laneH);
    // Lane label
    ctx.fillStyle=fnColors[fi];ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(fn,padL-8,y+laneH/2);
    // Lane border
    ctx.strokeStyle='#2d333b';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(padL,y);ctx.lineTo(padL+plotW,y);ctx.stroke();
  });

  // Bars
  var barH=26;
  ROADMAP_ITEMS.forEach(function(item,idx){
    var fi=fns.indexOf(item.fn);
    var laneH=plotH/4;
    var y=padT+fi*laneH+(laneH-barH)/2;
    var x=padL+(item.month-1)/months*plotW;
    var w=item.duration/months*plotW;
    var isHov=(hoveredRoadmapIdx===idx);
    var alpha=isHov?1:0.75;
    drawRoundedRect(ctx,x+2,y,w-4,barH,5,item.color+(isHov?'ee':'99'),item.color);
    ctx.fillStyle='rgba(255,255,255,'+(isHov?0.95:0.8)+')';ctx.font=(isHov?'bold ':'')+'9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    if(w>40)ctx.fillText(item.label,x+8,y+barH/2);

    if(isHov){
      // Tooltip
      var tx=Math.min(x,W-180),ty=y-38;
      if(ty<0)ty=y+barH+4;
      drawRoundedRect(ctx,tx,ty,175,32,6,'#1e2b3c','#6c5ce7');
      ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
      ctx.fillText(item.fn+': '+item.label,tx+6,ty+5);
      ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='8px Inter,sans-serif';
      wrapText(ctx,item.detail,tx+6,ty+17,163,10);

      // Update detail panel
      var det=document.getElementById('roadmap-detail');
      if(det)det.innerHTML='<strong style="color:'+item.color+'">'+item.fn+' \u2014 Month '+item.month+':</strong> '+item.detail;
    }
  });

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('12-Month AI RMF Implementation Roadmap \u2014 Hover a bar for details',padL,H-2);
}

// ===== TRADEOFFS (canvas-tradeoffs) =====
var tradeoffAnimT=0;
var tradeoffRaf=null;
function initTradeoffs(){
  var canvas=document.getElementById('canvas-tradeoffs');
  if(!canvas)return;
  drawTradeoffs();
}

function drawTradeoffs(){
  var canvas=document.getElementById('canvas-tradeoffs');
  if(!canvas||typeof TRADEOFF_PAIRS==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=280;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var pair=TRADEOFF_PAIRS[selectedTradeoff];
  if(!pair)return;
  var t=tradeoffSlider/100;

  var cx=W/2,gaugR=70,gaugeY=130;

  // Left gauge (A) — decreases as slider goes right
  var valA=1-t*0.6;
  drawGauge(ctx,160,gaugeY,gaugR,valA,pair.colA,pair.a,'Higher');

  // Right gauge (B) — increases as slider goes right
  var valB=0.3+t*0.65;
  drawGauge(ctx,540,gaugeY,gaugR,valB,pair.colB,pair.b,'Higher');

  // Tension arrow in middle
  var midY=gaugeY;
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(cx-55,midY-12,110,24);
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('TENSION',cx,midY);

  // Bidirectional arrow
  drawArrow(ctx,cx-55,midY,cx-20,midY,'rgba(255,255,255,0.4)',1.5);
  drawArrow(ctx,cx+55,midY,cx+20,midY,'rgba(255,255,255,0.4)',1.5);

  // Slider track visualization
  var trkY=gaugeY+gaugR+28,trkX=80,trkW=W-160;
  ctx.strokeStyle='#30363d';ctx.lineWidth=4;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(trkX,trkY);ctx.lineTo(trkX+trkW,trkY);ctx.stroke();
  // Color gradient from A to B
  var grad=ctx.createLinearGradient(trkX,0,trkX+trkW,0);
  grad.addColorStop(0,pair.colA+'cc');grad.addColorStop(1,pair.colB+'cc');
  ctx.strokeStyle=grad;ctx.lineWidth=3;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(trkX,trkY);ctx.lineTo(trkX+trkW,trkY);ctx.stroke();
  // Thumb
  var thumbX=trkX+t*trkW;
  ctx.beginPath();ctx.arc(thumbX,trkY,8,0,Math.PI*2);
  ctx.fillStyle='#fff';ctx.fill();
  ctx.strokeStyle='#6c5ce7';ctx.lineWidth=2;ctx.stroke();

  // Labels
  ctx.fillStyle=pair.colA;ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText('\u2190 More '+pair.a,trkX,trkY+20);
  ctx.fillStyle=pair.colB;ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='right';
  ctx.fillText('More '+pair.b+' \u2192',trkX+trkW,trkY+20);

  // Sweet spot indicator
  var ssT=0.5,ssX=trkX+ssT*trkW;
  ctx.strokeStyle='#ffd32a55';ctx.lineWidth=1;ctx.setLineDash([3,3]);
  ctx.beginPath();ctx.moveTo(ssX,trkY-20);ctx.lineTo(ssX,trkY+10);ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle='rgba(255,211,42,0.7)';ctx.font='8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  ctx.fillText('sweet spot',ssX,trkY+12);

  // Update info panel
  var det=document.getElementById('tradeoff-detail');
  if(det){
    var emphasis=t<0.35?pair.a:(t>0.65?pair.b:'balanced');
    det.innerHTML='<strong>'+pair.a+' vs '+pair.b+'</strong><br>'+pair.tension+'<br><br><em>Current emphasis: <strong>'+emphasis+'</strong></em><br>'+pair.rmfLink;
  }
}

function drawGauge(ctx,cx,cy,r,val,color,label,prefix){
  // Background arc
  ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*0.8,Math.PI*0.8);
  ctx.strokeStyle='#2d333b';ctx.lineWidth=12;ctx.lineCap='round';ctx.stroke();
  // Value arc
  var endAngle=-Math.PI*0.8+val*Math.PI*1.6;
  ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*0.8,endAngle);
  ctx.strokeStyle=color;ctx.lineWidth=10;ctx.lineCap='round';ctx.stroke();
  // Value text
  ctx.fillStyle=color;ctx.font='bold 20px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(Math.round(val*100)+'%',cx,cy-6);
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='9px Inter,sans-serif';
  ctx.fillText(prefix,cx,cy+14);
  // Label below
  ctx.fillStyle='rgba(255,255,255,0.8)';ctx.font='bold 12px Inter,sans-serif';ctx.textBaseline='top';
  ctx.fillText(label,cx,cy+r+10);
}

// ===== SECTOR PROFILE (canvas-sector-profile) =====
function initSectorProfile(){
  var canvas=document.getElementById('canvas-sector-profile');
  if(!canvas)return;
  drawSectorProfile();
}

function drawSectorProfile(){
  var canvas=document.getElementById('canvas-sector-profile');
  if(!canvas||typeof SECTORS==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=320;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var sec=SECTORS[selectedSector];
  if(!sec)return;

  var midX=W/2,padT=30,padB=20;
  // Divider
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(midX,padT);ctx.lineTo(midX,H-padB);ctx.stroke();

  // LEFT: Function importance bars
  var fns=['GOVERN','MAP','MEASURE','MANAGE'];
  var fnColors=['#0984e3','#f7b731','#ff6b6b','#51cf66'];
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('RMF Function Importance in '+sec.label,10,6);

  var barAreaW=midX-80,barH=28,barGap=12,startY=padT+10;
  fns.forEach(function(fn,fi){
    var y=startY+fi*(barH+barGap);
    var val=sec.importance[fn]||0;
    var maxW=barAreaW;
    // Label
    ctx.fillStyle=fnColors[fi];ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(fn,10,y+barH/2);
    // Background bar
    drawRoundedRect(ctx,70,y,maxW,barH,5,'#ffffff0a','#30363d');
    // Value bar
    var bw=val/100*maxW;
    drawRoundedRect(ctx,70,y,bw,barH,5,fnColors[fi]+'99',fnColors[fi]);
    // Percentage
    ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(val+'%',70+bw-6,y+barH/2);
  });

  // RIGHT: Top risks
  ctx.fillStyle='rgba(255,255,255,0.7)';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Top AI Risks in '+sec.label,midX+10,6);

  var risks=sec.topRisks||[];
  var riskColors=sec.riskColors||[];
  var rBarH=26,rBarGap=8,rStartY=padT+10;
  var rAreaW=midX-70;
  risks.forEach(function(risk,ri){
    var y=rStartY+ri*(rBarH+rBarGap);
    var col=riskColors[ri]||sec.color;
    var severity=(5-ri)/5;
    // Risk bar background
    drawRoundedRect(ctx,midX+10,y,rAreaW,rBarH,5,'#ffffff0a','#30363d');
    drawRoundedRect(ctx,midX+10,y,severity*rAreaW,rBarH,5,col+'99',col);
    ctx.fillStyle='rgba(255,255,255,0.85)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(risk,midX+16,y+rBarH/2);
    // Severity rank
    ctx.fillStyle=col;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(['Critical','High','High','Medium','Medium'][ri]||'',midX+rAreaW+6,y+rBarH/2);
  });

  // Bottom info
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('Key metrics: '+sec.keyMetrics,10,H-4);

  // Update detail panel
  var det=document.getElementById('sector-detail');
  if(det)det.innerHTML='<strong style="color:'+sec.color+'">'+sec.label+'</strong><br>Key regulation: '+sec.regulatory+'<br>Critical metrics: '+sec.keyMetrics;
}

// ===== ACTOR MAP (canvas-actor-map) =====
function initActorMap(){
  var canvas=document.getElementById('canvas-actor-map');
  if(!canvas)return;
  drawActorMap();
  canvas.addEventListener('click',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    if(typeof ACTORS==='undefined')return;
    var W=700,H=340,padL=100,padT=60,colW=(W-padL-20)/ACTORS.length;
    ACTORS.forEach(function(actor,ai){
      var ax=padL+ai*colW+colW/2;
      var ay=30;
      if(mx>=ax-colW/2+5&&mx<=ax+colW/2-5&&my>=ay-18&&my<=ay+18){
        selectedActor=(selectedActor===actor.id)?null:actor.id;
        drawActorMap();
      }
    });
  });
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    if(typeof ACTORS==='undefined')return;
    var W=700,padL=100,padT=60,colW=(W-padL-20)/ACTORS.length;
    var newHov=null;
    ACTORS.forEach(function(actor,ai){
      var ax=padL+ai*colW+colW/2;
      if(mx>=padL+ai*colW+5&&mx<=padL+(ai+1)*colW-5&&my>=padT&&my<=340-20){newHov=actor.id;}
    });
    if(newHov!==hoveredActor){hoveredActor=newHov;drawActorMap();}
  });
  canvas.addEventListener('mouseleave',function(){hoveredActor=null;drawActorMap();});
}

function drawActorMap(){
  var canvas=document.getElementById('canvas-actor-map');
  if(!canvas||typeof ACTORS==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=340,padL=100,padT=60,padR=20,padB=20;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var fns=['GOVERN','MAP','MEASURE','MANAGE'];
  var fnColors=['#0984e3','#f7b731','#ff6b6b','#51cf66'];
  var colW=(W-padL-padR)/ACTORS.length;
  var rowH=(H-padT-padB)/fns.length;

  // Column headers (Actor names)
  ACTORS.forEach(function(actor,ai){
    var ax=padL+ai*colW+colW/2;
    var isActive=(selectedActor===actor.id||hoveredActor===actor.id);
    drawRoundedRect(ctx,padL+ai*colW+3,8,colW-6,padT-16,6,isActive?actor.color+'44':'#ffffff0a',isActive?actor.color:'#30363d');
    ctx.fillStyle=isActive?actor.color:'rgba(255,255,255,0.7)';ctx.font=(isActive?'bold ':'')+'10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(actor.label,ax,padT/2);
    if(isActive){ctx.fillStyle=actor.color;ctx.font='8px Inter,sans-serif';ctx.textBaseline='bottom';ctx.fillText('(click to deselect)',ax,padT-4);}
  });

  // Row headers (Functions)
  fns.forEach(function(fn,fi){
    var fy=padT+fi*rowH+rowH/2;
    ctx.fillStyle=fnColors[fi];ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(fn,padL-6,fy);
    // Row divider
    ctx.strokeStyle='#2d333b';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(padL,padT+fi*rowH);ctx.lineTo(W-padR,padT+fi*rowH);ctx.stroke();
  });

  // Cells
  ACTORS.forEach(function(actor,ai){
    var isActorActive=(selectedActor===actor.id||hoveredActor===actor.id);
    fns.forEach(function(fn,fi){
      var cx2=padL+ai*colW+colW/2;
      var cy2=padT+fi*rowH+rowH/2;
      var cellW=colW-8,cellH=rowH-8;
      var respList={GOVERN:actor.governs,MAP:actor.maps,MEASURE:actor.measures,MANAGE:actor.manages}[fn]||[];

      var bg=isActorActive?actor.color+'22':'#1a2233';
      var border=isActorActive?actor.color+'66':'#2d333b';
      drawRoundedRect(ctx,padL+ai*colW+4,padT+fi*rowH+4,cellW,cellH,5,bg,border);

      if(respList.length>0){
        // Dot indicator
        ctx.beginPath();ctx.arc(padL+ai*colW+14,padT+fi*rowH+14,4,0,Math.PI*2);
        ctx.fillStyle=isActorActive?actor.color:fnColors[fi]+'99';ctx.fill();
        // First responsibility text
        ctx.fillStyle=isActorActive?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.55)';
        ctx.font=(isActorActive?'bold ':'')+'8px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
        wrapText(ctx,respList[0],padL+ai*colW+7,padT+fi*rowH+22,cellW-10,10);
      } else {
        ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('\u2014',cx2,cy2);
      }
    });

    // Show detail panel for active actor
    if(selectedActor===actor.id){
      var det=document.getElementById('actor-detail');
      if(det){
        var html='<strong style="color:'+actor.color+'">'+actor.label+'</strong><br>'+actor.desc+'<br><br>';
        fns.forEach(function(fn,fi){
          var list={GOVERN:actor.governs,MAP:actor.maps,MEASURE:actor.measures,MANAGE:actor.manages}[fn]||[];
          if(list.length>0){
            html+='<strong style="color:'+fnColors[fi]+'">'+fn+':</strong> '+list.join('; ')+'<br>';
          }
        });
        det.innerHTML=html;
      }
    }
  });

  // Bottom legend
  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('Click a column header to highlight responsibilities \u2014 each cell shows key duties per function',padL,H-3);
}

// ===== QUIZ RADAR (canvas-quiz-radar) =====
function initQuizRadar(){
  var canvas=document.getElementById('canvas-quiz-radar');
  if(!canvas)return;
  drawQuizRadar();
}

function drawQuizRadar(){
  var canvas=document.getElementById('canvas-quiz-radar');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=280,cx=350,cy=150,maxR=110;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var fns=['GOVERN','MAP','MEASURE','MANAGE'];
  var fnColors=['#0984e3','#f7b731','#ff6b6b','#51cf66'];
  var maxScores={GOVERN:6,MAP:6,MEASURE:6,MANAGE:6};
  var angles=fns.map(function(f,i){return -Math.PI/2+i*(Math.PI*2/4);});

  // Background rings
  [0.25,0.5,0.75,1].forEach(function(t){
    ctx.beginPath();
    angles.forEach(function(a,i){
      var x=cx+Math.cos(a)*maxR*t,y=cy+Math.sin(a)*maxR*t;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.strokeStyle=(t===1)?'#30363d':'#1e2530';ctx.lineWidth=1;ctx.stroke();
    if(t<1){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(Math.round(t*100)+'%',cx,cy-maxR*t-6);}
  });

  // Spoke lines
  angles.forEach(function(a){
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*maxR,cy+Math.sin(a)*maxR);
    ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.stroke();
  });

  var scoresFilled=typeof quizComplete!=='undefined'&&quizComplete;
  var scores=typeof quizScores!=='undefined'?quizScores:{GOVERN:0,MAP:0,MEASURE:0,MANAGE:0};

  // Score polygon
  if(scoresFilled){
    ctx.beginPath();
    fns.forEach(function(fn,i){
      var t=scores[fn]/(maxScores[fn]||6);
      var r=maxR*Math.min(t,1);
      var x=cx+Math.cos(angles[i])*r,y=cy+Math.sin(angles[i])*r;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.fillStyle='rgba(108,92,231,0.25)';ctx.fill();
    ctx.strokeStyle='#6c5ce7';ctx.lineWidth=2;ctx.stroke();
    // Score dots
    fns.forEach(function(fn,i){
      var t=scores[fn]/(maxScores[fn]||6);
      var r=maxR*Math.min(t,1);
      var x=cx+Math.cos(angles[i])*r,y=cy+Math.sin(angles[i])*r;
      ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);
      ctx.fillStyle=fnColors[i];ctx.fill();
      // Score label
      var lx=cx+Math.cos(angles[i])*(r+18),ly=cy+Math.sin(angles[i])*(r+18);
      ctx.fillStyle=fnColors[i];ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText(scores[fn]+'/'+maxScores[fn],lx,ly);
    });
  } else {
    // Empty state — dashed outline
    ctx.beginPath();
    angles.forEach(function(a,i){
      var x=cx+Math.cos(a)*maxR*0.15,y=cy+Math.sin(a)*maxR*0.15;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    });
    ctx.closePath();
    ctx.strokeStyle='#30363d';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.font='12px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('Complete the quiz to see your scores',cx,cy);
  }

  // Axis labels
  fns.forEach(function(fn,i){
    var labelR=maxR+30;
    var lx=cx+Math.cos(angles[i])*labelR,ly=cy+Math.sin(angles[i])*labelR;
    ctx.fillStyle=fnColors[i];ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(fn,lx,ly);
  });

  if(scoresFilled){
    // Overall score
    var total=fns.reduce(function(s,fn){return s+scores[fn];},0);
    var totalMax=fns.reduce(function(s,fn){return s+(maxScores[fn]||6);},0);
    var pct=Math.round(total/totalMax*100);
    var grade=pct>=80?'Strong':pct>=60?'Developing':pct>=40?'Foundational':'Early Stage';
    var gradeColor=pct>=80?'#51cf66':pct>=60?'#f7b731':'#ff6b6b';
    ctx.fillStyle=gradeColor;ctx.font='bold 18px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(pct+'%',cx,cy-10);
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Inter,sans-serif';ctx.textBaseline='top';
    ctx.fillText(grade,cx,cy+8);
  }

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('AI RMF Readiness Radar \u2014 based on 15-question self-assessment',10,4);
}

// ===== RISK SANDBOX (canvas-sandbox) =====
var sandboxCanvas=null;
var sandboxDragIdx=null;
var sandboxDragOffX=0,sandboxDragOffY=0;
var SANDBOX_COLORS=['#ff6b6b','#f7b731','#6c5ce7','#51cf66','#0984e3','#fd79a8','#a29bfe','#00b894','#e84118','#74b9ff'];

function initSandbox(){
  sandboxCanvas=document.getElementById('canvas-sandbox');
  if(!sandboxCanvas)return;
  drawSandbox();
  sandboxCanvas.addEventListener('mousedown',function(e){
    var r=sandboxCanvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var pad=50;
    // Check if clicking existing risk
    for(var i=sandboxRisks.length-1;i>=0;i--){
      var rk=sandboxRisks[i];
      var px=pad+rk.px*(700-pad*2),py=pad+rk.py*(340-pad*2);
      if(Math.abs(mx-px)<14&&Math.abs(my-py)<14){sandboxDragIdx=i;sandboxDragOffX=mx-px;sandboxDragOffY=my-py;sandboxSelectedIdx=i;drawSandbox();return;}
    }
    // Place new risk
    if(mx>=pad&&mx<=700-pad&&my>=pad&&my<=340-pad){
      var sel=document.getElementById('sandbox-label-select');
      var label=sel?sel.value:'Risk';
      var npx=(mx-pad)/(700-pad*2),npy=(my-pad)/(340-pad*2);
      sandboxRisks.push({label:label,px:npx,py:npy,color:SANDBOX_COLORS[sandboxRisks.length%SANDBOX_COLORS.length]});
      sandboxSelectedIdx=sandboxRisks.length-1;
      drawSandbox();
      showSandboxDetail(sandboxSelectedIdx);
    }
  });
  sandboxCanvas.addEventListener('mousemove',function(e){
    if(sandboxDragIdx===null)return;
    var r=sandboxCanvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var pad=50;
    var npx=Math.max(0,Math.min(1,(mx-sandboxDragOffX-pad)/(700-pad*2)));
    var npy=Math.max(0,Math.min(1,(my-sandboxDragOffY-pad)/(340-pad*2)));
    sandboxRisks[sandboxDragIdx].px=npx;sandboxRisks[sandboxDragIdx].py=npy;
    drawSandbox();
    showSandboxDetail(sandboxDragIdx);
  });
  sandboxCanvas.addEventListener('mouseup',function(){sandboxDragIdx=null;});
  sandboxCanvas.addEventListener('mouseleave',function(){sandboxDragIdx=null;});
}

function showSandboxDetail(idx){
  var rk=sandboxRisks[idx];if(!rk)return;
  var quad=rk.px>0.5&&rk.py<0.5?'ACT NOW':rk.px<=0.5&&rk.py<0.5?'PRIORITIZE':rk.px>0.5?'WATCH':'MONITOR';
  var quadColor={'ACT NOW':'#ff6b6b','PRIORITIZE':'#f7b731','WATCH':'#0984e3','MONITOR':'#51cf66'}[quad];
  var rec={'ACT NOW':'Immediate mitigation required. Assign owner this sprint. Consider pausing deployment. (MG-1, MG-2)','PRIORITIZE':'High impact but less likely. Build a mitigation plan with timeline. (MAP-4, MG-1)','WATCH':'Likely but lower impact. Monitor closely. Set automated alerts. (MG-3)','MONITOR':'Low priority for now. Log it. Revisit each quarter. (MG-4)'}[quad];
  var d=document.getElementById('sandbox-detail');
  if(d)d.innerHTML='<strong style="color:'+rk.color+'">'+rk.label+'</strong> &mdash; Quadrant: <strong style="color:'+quadColor+'">'+quad+'</strong><br>Likelihood: <strong>'+Math.round(rk.px*100)+'%</strong> &nbsp; Impact: <strong>'+Math.round((1-rk.py)*100)+'%</strong><br><em>'+rec+'</em>';
}

function drawSandbox(){
  var canvas=document.getElementById('canvas-sandbox');
  if(!canvas)return;
  var ctx=canvas.getContext('2d');
  var W=700,H=340,pad=50;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var plotW=W-pad*2,plotH=H-pad*2;

  // Quadrant backgrounds
  var quads=[
    {x:pad,y:pad,w:plotW/2,h:plotH/2,label:'PRIORITIZE',color:'rgba(247,183,49,0.07)'},
    {x:pad+plotW/2,y:pad,w:plotW/2,h:plotH/2,label:'ACT NOW',color:'rgba(255,107,107,0.07)'},
    {x:pad,y:pad+plotH/2,w:plotW/2,h:plotH/2,label:'MONITOR',color:'rgba(81,207,102,0.07)'},
    {x:pad+plotW/2,y:pad+plotH/2,w:plotW/2,h:plotH/2,label:'WATCH',color:'rgba(9,132,227,0.07)'}
  ];
  quads.forEach(function(q){
    ctx.fillStyle=q.color;ctx.fillRect(q.x,q.y,q.w,q.h);
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(q.label,q.x+q.w/2,q.y+q.h/2);
  });

  // Grid lines
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad+plotW/2,pad);ctx.lineTo(pad+plotW/2,pad+plotH);ctx.stroke();
  ctx.beginPath();ctx.moveTo(pad,pad+plotH/2);ctx.lineTo(pad+plotW,pad+plotH/2);ctx.stroke();

  // Axis labels
  ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';
  ctx.fillText('LIKELIHOOD',pad+plotW/2,H-8);
  ctx.save();ctx.translate(12,pad+plotH/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillText('IMPACT',0,0);ctx.restore();
  ctx.fillStyle='rgba(255,255,255,0.35)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.fillText('Low',pad,pad-10);
  ctx.textAlign='right';ctx.fillText('High',pad+plotW,pad-10);
  ctx.save();ctx.translate(pad-22,pad);ctx.rotate(-Math.PI/2);ctx.textAlign='right';ctx.font='9px Inter,sans-serif';ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillText('Low',0,0);ctx.restore();
  ctx.save();ctx.translate(pad-22,pad+plotH);ctx.rotate(-Math.PI/2);ctx.textAlign='left';ctx.font='9px Inter,sans-serif';ctx.fillStyle='rgba(255,255,255,0.35)';ctx.fillText('High',0,0);ctx.restore();

  // Risk dots
  if(typeof sandboxRisks!=='undefined'){
    sandboxRisks.forEach(function(rk,i){
      var rx=pad+rk.px*plotW,ry=pad+rk.py*plotH;
      var isSel=(typeof sandboxSelectedIdx!=='undefined'&&sandboxSelectedIdx===i);
      ctx.beginPath();ctx.arc(rx,ry,isSel?12:9,0,Math.PI*2);
      ctx.fillStyle=rk.color+(isSel?'ff':'cc');ctx.fill();
      if(isSel){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}
      ctx.fillStyle='rgba(255,255,255,0.9)';ctx.font=(isSel?'bold ':'')+'8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
      ctx.fillText(rk.label.slice(0,12),rx,ry+13);
    });
  }

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Click to place \u2014 Drag to reposition \u2014 MAP 4 Risk Prioritization Exercise',pad,4);
}

// ===== INCIDENT TREE (canvas-incident-tree) =====
function initIncidentTree(){
  var canvas=document.getElementById('canvas-incident-tree');
  if(!canvas)return;
  drawIncidentTree();
}

function drawIncidentTree(){
  var canvas=document.getElementById('canvas-incident-tree');
  if(!canvas||typeof INCIDENT_NODES==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=300;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  if(typeof incidentStarted==='undefined'||!incidentStarted){
    ctx.fillStyle='rgba(255,255,255,0.25)';ctx.font='13px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('Start the scenario below to walk through the AI incident response decision tree',W/2,H/2);
    ctx.fillStyle='rgba(255,107,107,0.4)';ctx.font='10px Inter,sans-serif';ctx.textBaseline='top';ctx.textAlign='center';
    ctx.fillText('MG-3.2: Organizations must have a documented AI incident response process before deployment',W/2,H/2+24);
    return;
  }

  var path=typeof incidentPath!=='undefined'?incidentPath:[0];
  var nodeW=120,nodeH=46,hGap=16,vGap=40;
  var maxPerRow=5;
  // Layout: left-to-right tree, up to 5 nodes wide
  var positions={};
  path.forEach(function(nid,idx){
    var x=40+idx*(nodeW+hGap*2);
    var y=H/2-nodeH/2;
    positions[nid]={x:x,y:y};
  });

  // Draw connectors
  path.forEach(function(nid,idx){
    if(idx===0)return;
    var prev=positions[path[idx-1]];var cur=positions[nid];
    if(!prev||!cur)return;
    drawArrow(ctx,prev.x+nodeW,prev.y+nodeH/2,cur.x,cur.y+nodeH/2,'rgba(255,255,255,0.3)',1.5);
  });

  // Draw nodes
  path.forEach(function(nid,idx){
    var node=INCIDENT_NODES[nid];if(!node)return;
    var pos=positions[nid];if(!pos)return;
    var isCurrent=(nid===incidentCurrentNode);
    var isLast=(idx===path.length-1);
    drawRoundedRect(ctx,pos.x,pos.y,nodeW,nodeH,8,
      isCurrent?node.color+'44':'#1a2233',
      isCurrent?node.color:'#30363d');
    if(isCurrent){ctx.strokeStyle=node.color;ctx.lineWidth=2;}
    ctx.fillStyle=isCurrent?'rgba(255,255,255,0.9)':'rgba(255,255,255,0.5)';
    ctx.font=(isCurrent?'bold ':'')+'8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    wrapText(ctx,node.text.slice(0,50),pos.x+nodeW/2,pos.y+6,nodeW-12,10);
    if(node.rmf&&node.rmf!==''){
      ctx.fillStyle=node.color;ctx.font='7px JetBrains Mono,monospace';ctx.textAlign='center';ctx.textBaseline='bottom';
      ctx.fillText(node.rmf.slice(0,16),pos.x+nodeW/2,pos.y+nodeH-3);
    }
    // Step number badge
    ctx.beginPath();ctx.arc(pos.x+nodeW-8,pos.y+8,8,0,Math.PI*2);
    ctx.fillStyle=node.color;ctx.fill();
    ctx.fillStyle='#fff';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(idx+1,pos.x+nodeW-8,pos.y+8);
  });

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='bottom';
  ctx.fillText('AI Incident Response Decision Tree \u2014 MANAGE (MG-2, MG-3, MG-4)',10,H-3);
}

// ===== FRAMEWORK MATRIX (canvas-framework-matrix) =====
function initFrameworkMatrix(){
  var canvas=document.getElementById('canvas-framework-matrix');
  if(!canvas)return;
  drawFrameworkMatrix();
  canvas.addEventListener('mousemove',function(e){
    var r=canvas.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    var newHov=null;
    if(typeof FRAMEWORK_ROWS!=='undefined'&&typeof FRAMEWORK_HEADERS!=='undefined'){
      var padL=90,padT=36,padR=10,padB=30;
      var W=700,H=260;
      var cellW=(W-padL-padR)/FRAMEWORK_HEADERS.length;
      var cellH=(H-padT-padB)/FRAMEWORK_ROWS.length;
      FRAMEWORK_ROWS.forEach(function(row,ri){
        FRAMEWORK_HEADERS.forEach(function(h,ci){
          var cx2=padL+ci*cellW,cy2=padT+ri*cellH;
          if(mx>=cx2&&mx<=cx2+cellW&&my>=cy2&&my<=cy2+cellH){
            newHov={ri:ri,ci:ci};
          }
        });
      });
    }
    if(JSON.stringify(newHov)!==JSON.stringify(hoveredFrameworkCell)){
      hoveredFrameworkCell=newHov;
      drawFrameworkMatrix();
      if(newHov){
        var row=FRAMEWORK_ROWS[newHov.ri];
        var hdr=FRAMEWORK_HEADERS[newHov.ci];
        var note=(row.notes&&row.notes[newHov.ci])||'';
        var score=row.scores[newHov.ci];
        var scoreLabel=COVERAGE_LABELS[score]||'';
        var det=document.getElementById('framework-detail');
        if(det)det.innerHTML='<strong style="color:'+row.color+'">'+row.name+'</strong> &mdash; <strong>'+hdr+'</strong>: <span style="color:'+(score===3?'#51cf66':score===2?'#f7b731':score===1?'#ff6b6b':'#8b949e')+'">'+scoreLabel+'</span><br>'+note;
      }
    }
  });
  canvas.addEventListener('mouseleave',function(){hoveredFrameworkCell=null;drawFrameworkMatrix();});
}

function drawFrameworkMatrix(){
  var canvas=document.getElementById('canvas-framework-matrix');
  if(!canvas||typeof FRAMEWORK_ROWS==='undefined')return;
  var ctx=canvas.getContext('2d');
  var W=700,H=260,padL=90,padT=36,padR=10,padB=30;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#161b22';ctx.fillRect(0,0,W,H);

  var cellW=(W-padL-padR)/FRAMEWORK_HEADERS.length;
  var cellH=(H-padT-padB)/FRAMEWORK_ROWS.length;
  var scoreColors=['#2d333b','#ff6b6b88','#f7b73188','#51cf6688'];

  // Column headers
  FRAMEWORK_HEADERS.forEach(function(h,ci){
    ctx.fillStyle='rgba(255,255,255,0.5)';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.save();
    var hx=padL+(ci+0.5)*cellW,hy=padT-4;
    ctx.translate(hx,hy);ctx.rotate(-0.35);
    ctx.fillText(h,0,0);
    ctx.restore();
  });

  // Rows
  FRAMEWORK_ROWS.forEach(function(row,ri){
    var ry=padT+ri*cellH;
    // Row label
    ctx.fillStyle=row.color;ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(row.name,padL-6,ry+cellH/2);

    row.scores.forEach(function(score,ci){
      var cx2=padL+ci*cellW;
      var isHov=(hoveredFrameworkCell&&hoveredFrameworkCell.ri===ri&&hoveredFrameworkCell.ci===ci);
      var bg=scoreColors[score]||(scoreColors[0]);
      drawRoundedRect(ctx,cx2+2,ry+2,cellW-4,cellH-4,4,isHov?row.color+'44':bg,isHov?row.color:'transparent');

      // Score indicator dots
      for(var s=0;s<3;s++){
        ctx.beginPath();ctx.arc(cx2+cellW/2-10+s*10,ry+cellH/2,3,0,Math.PI*2);
        ctx.fillStyle=s<score?(score===3?'#51cf66':score===2?'#f7b731':'#ff6b6b'):'#2d333b';
        ctx.fill();
      }
    });
  });

  // Legend
  var lgx=padL;var lgy=H-padB+8;
  COVERAGE_LABELS.forEach(function(lbl,i){
    var dotColor=['#2d333b','#ff6b6b','#f7b731','#51cf66'][i];
    ctx.beginPath();ctx.arc(lgx+i*90+6,lgy+6,4,0,Math.PI*2);ctx.fillStyle=dotColor;ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='8px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText(lbl,lgx+i*90+14,lgy+6);
  });

  ctx.fillStyle='rgba(255,255,255,0.3)';ctx.font='9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='bottom';
  ctx.fillText('Hover a cell for details',W-padR,H-2);
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
  initRiskFlow();
  initGenAIGrid();
  initSubcatBrowser();
  initMaturityAssessment();
  initCrosswalk();
  initCaseStudy();
  initRoadmap();
  initTradeoffs();
  initSectorProfile();
  initActorMap();
  initQuizRadar();
  initSandbox();
  initIncidentTree();
  initFrameworkMatrix();
  if(typeof initGlossary==='function')initGlossary();
  updateNavOnScroll();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',doInit);
}else{
  doInit();
}
