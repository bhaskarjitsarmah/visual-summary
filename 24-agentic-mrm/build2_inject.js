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
// SECTION 1: GUARDRAIL COMPARE
// ============================================================
var guardrailT=0;
function drawGuardrailCompare(){
  var c=document.getElementById('canvas-guardrail-compare');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  guardrailT=(guardrailT+0.008)%1;
  var halfW=W/2-8;
  var steps=['Query DB','Compute Risk','Draft Memo','Submit'];
  var naiveColors=['#0ea5e9','#6c5ce7','#f7b731','#e11844'];
  var guardColors=['#0ea5e9','#6c5ce7','#f7b731','#51cf66'];

  // Left panel: Naive (prompt-only)
  ctx.fillStyle='#161b22';
  drawRoundedRect(ctx,4,4,halfW,H-8,8);ctx.fill();
  ctx.strokeStyle='#e1184444';ctx.lineWidth=1.5;
  drawRoundedRect(ctx,4,4,halfW,H-8,8);ctx.stroke();
  ctx.fillStyle='#e11844';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('NAIVE (Prompt Filters Only)',halfW/2+4,22);
  ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';
  ctx.fillText('No trajectory awareness',halfW/2+4,36);

  var stepW=(halfW-24)/4;
  var stepY=60;
  var animIdx=Math.floor(guardrailT*4);
  steps.forEach(function(s,i){
    var sx=12+i*(stepW+4);
    var active=i<=animIdx;
    ctx.fillStyle=active?naiveColors[i]+'33':'#21262d';
    drawRoundedRect(ctx,sx,stepY,stepW,44,6);ctx.fill();
    ctx.strokeStyle=active?naiveColors[i]:'#30363d';ctx.lineWidth=active?1.5:1;
    drawRoundedRect(ctx,sx,stepY,stepW,44,6);ctx.stroke();
    ctx.fillStyle=active?naiveColors[i]:'#8b949e';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(s,sx+stepW/2,stepY+15);
    if(i<steps.length-1){
      drawArrow(ctx,sx+stepW+2,stepY+22,sx+stepW+6,stepY+22,active?naiveColors[i]:'#30363d',1.5);
    }
  });
  // Failure: stale data passes through unchecked
  var frac=(guardrailT*4)%1;
  if(animIdx>=0){
    var fx=12+animIdx*(stepW+4)+stepW*frac;
    ctx.beginPath();ctx.arc(Math.min(fx,halfW-16),stepY+22,5,0,Math.PI*2);
    ctx.fillStyle='#ff6b6b';ctx.fill();
  }
  ctx.fillStyle='#ff6b6b';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('Stale data flows through undetected',halfW/2+4,H-12);

  // Right panel: Governed
  var rx=W/2+4;
  ctx.fillStyle='#161b22';
  drawRoundedRect(ctx,rx,4,halfW,H-8,8);ctx.fill();
  ctx.strokeStyle='#51cf6644';ctx.lineWidth=1.5;
  drawRoundedRect(ctx,rx,4,halfW,H-8,8);ctx.stroke();
  ctx.fillStyle='#51cf66';ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('GOVERNED (Runtime Monitor)',rx+halfW/2,22);
  ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';
  ctx.fillText('Trajectory-level constraints',rx+halfW/2,36);

  steps.forEach(function(s,i){
    var sx=rx+6+i*(stepW+4);
    var active=i<=animIdx;
    var blocked=i===1&&trajFailure===0;
    var col=blocked?'#ff6b6b':guardColors[i];
    ctx.fillStyle=active?col+'33':'#21262d';
    drawRoundedRect(ctx,sx,stepY,stepW,44,6);ctx.fill();
    ctx.strokeStyle=active?col:'#30363d';ctx.lineWidth=active?1.5:1;
    drawRoundedRect(ctx,sx,stepY,stepW,44,6);ctx.stroke();
    ctx.fillStyle=active?col:'#8b949e';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(s,sx+stepW/2,stepY+15);
    if(blocked){
      ctx.fillStyle='#ff6b6b';ctx.font='bold 10px Inter,sans-serif';
      ctx.fillText('HALT',sx+stepW/2,stepY+30);
    }
    if(i<steps.length-1&&!blocked){
      drawArrow(ctx,sx+stepW+2,stepY+22,sx+stepW+6,stepY+22,active?col:'#30363d',1.5);
    }
  });
  // Monitor bar
  ctx.fillStyle='#51cf6611';
  ctx.fillRect(rx+6,stepY+48,halfW-12,14);
  ctx.strokeStyle='#51cf6633';ctx.lineWidth=1;
  ctx.strokeRect(rx+6,stepY+48,halfW-12,14);
  ctx.fillStyle='#51cf66';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('RUNTIME MONITOR: observes every step',rx+halfW/2,stepY+55);
  ctx.fillStyle='#51cf66';ctx.font='9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('Blocked at point of failure; audit record created',rx+halfW/2,H-12);
}

// ============================================================
// SECTION 2: CAPABILITY
// ============================================================
function drawCapability(){
  var c=document.getElementById('canvas-capability');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var n=CAPABILITIES.length;
  var cardW=(W-32)/n-8;
  var cardH=H-20;
  CAPABILITIES.forEach(function(cap,i){
    var x=10+i*(cardW+8);
    var y=10;
    var sel=i===selectedCap;
    ctx.fillStyle=sel?cap.color+'22':'#161b22';
    drawRoundedRect(ctx,x,y,cardW,cardH,8);ctx.fill();
    ctx.strokeStyle=sel?cap.color:'#30363d';ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,x,y,cardW,cardH,8);ctx.stroke();
    // ID badge
    ctx.fillStyle=cap.color;ctx.font='bold 18px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(cap.id,x+cardW/2,y+30);
    // Progress bar
    var fill=sel?cardW-16:0;
    ctx.fillStyle=cap.color+'33';ctx.fillRect(x+8,y+46,fill,3);
    ctx.strokeStyle=cap.color+'55';ctx.lineWidth=1;ctx.strokeRect(x+8,y+46,cardW-16,3);
    // Label lines
    var label=cap.label;
    var words=label.split(' ');
    ctx.fillStyle=sel?cap.color:'#8b949e';ctx.font=(sel?'bold ':'')+'9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    var line='',ly=y+54;
    words.forEach(function(w){
      var t=line?line+' '+w:w;
      if(ctx.measureText(t).width>cardW-12&&line){
        ctx.fillText(line,x+cardW/2,ly);line=w;ly+=13;
      }else line=t;
    });
    ctx.fillText(line,x+cardW/2,ly);
    ly+=16;
    // Authority hint
    ctx.fillStyle='#8b949e';ctx.font='8px Inter,sans-serif';ctx.textAlign='center';
    var authShort=cap.authority.substring(0,30)+(cap.authority.length>30?'...':'');
    ctx.fillText(authShort,x+cardW/2,ly);
    // Click affordance
    if(sel){
      ctx.fillStyle=cap.color;ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
      ctx.fillText('SELECTED',x+cardW/2,y+cardH-8);
    }
  });
  // Click handler
  c.onclick=function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left;
    for(var i=0;i<n;i++){
      var x=10+i*(cardW+8);
      if(mx>=x&&mx<=x+cardW)selectCap(i);
    }
  };
  c.style.cursor='pointer';
}

// ============================================================
// SECTION 3: TRAJECTORY
// ============================================================
function drawTrajectory(){
  var c=document.getElementById('canvas-trajectory');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var states=TRAJ_STATES;
  var n=states.length;
  var nodeR=28;

  states.forEach(function(st,i){
    var nx=Math.round(st.x*W);
    var ny=Math.round(st.y*H);
    var active=trajStep>=i;
    var failed=trajFailure>=0&&i===FAILURE_MODES[trajFailure].step&&active;
    var col=failed?'#ff6b6b':st.color;

    // Connector to next
    if(i<n-1){
      var nx2=Math.round(states[i+1].x*W);
      var ny2=Math.round(states[i+1].y*H);
      var connActive=active&&trajStep>i&&!(trajFailure>=0&&i>=FAILURE_MODES[trajFailure].step);
      drawArrow(ctx,nx+nodeR,ny,nx2-nodeR,ny2,connActive?col:'#30363d',connActive?2:1.5);
    }

    // Node circle
    ctx.beginPath();ctx.arc(nx,ny,nodeR,0,Math.PI*2);
    ctx.fillStyle=active?col+(failed?'44':'22'):'#161b22';ctx.fill();
    ctx.strokeStyle=active?col:'#30363d';ctx.lineWidth=active?2.5:1;ctx.stroke();

    if(failed){
      // Red X
      ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(nx-8,ny-8);ctx.lineTo(nx+8,ny+8);ctx.stroke();
      ctx.beginPath();ctx.moveTo(nx+8,ny-8);ctx.lineTo(nx-8,ny+8);ctx.stroke();
    } else {
      // Label
      ctx.fillStyle=active?col:'#8b949e';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
      var words=st.label.split(' ');
      if(words.length>1){
        ctx.fillText(words[0],nx,ny-5);ctx.fillText(words.slice(1).join(' '),nx,ny+6);
      }else{ctx.fillText(st.label,nx,ny);}
    }

    // Sub-label below
    ctx.fillStyle=active?'#8b949e':'#30363d';ctx.font='8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    ctx.fillText(st.sub,nx,ny+nodeR+6);

    // HALT label
    if(failed){
      ctx.fillStyle='#ff6b6b';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
      ctx.fillText('HALT',nx,ny-nodeR-6);
    }
  });

  // Runtime monitor bar at bottom
  ctx.fillStyle='#0ea5e911';ctx.fillRect(10,H-22,W-20,14);
  ctx.strokeStyle='#0ea5e933';ctx.lineWidth=1;ctx.strokeRect(10,H-22,W-20,14);
  ctx.fillStyle='#0ea5e9';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('RUNTIME MONITOR: evaluates constraints at each step',W/2,H-15);
}

// ============================================================
// SECTION 4: TIER MATRIX
// ============================================================
function drawTierMatrix(){
  var c=document.getElementById('canvas-tier-matrix');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var n=RISK_TIERS.length;
  var cardW=(W-32)/n-8;
  var cardH=H-20;
  var dims=['autonomy','materiality','reversible','regulatory','oversight'];
  var dimLabels=['Autonomy','Materiality','Reversibility','Regulatory','Oversight'];

  RISK_TIERS.forEach(function(tier,i){
    var x=10+i*(cardW+8);
    var y=10;
    var sel=i===selectedTier;
    ctx.fillStyle=sel?tier.color+'22':'#161b22';
    drawRoundedRect(ctx,x,y,cardW,cardH,8);ctx.fill();
    ctx.strokeStyle=sel?tier.color:'#30363d';ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,x,y,cardW,cardH,8);ctx.stroke();

    // Tier ID
    ctx.fillStyle=tier.color;ctx.font='bold 20px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(tier.id,x+cardW/2,y+24);
    ctx.fillStyle=sel?tier.color:'#8b949e';ctx.font='bold 9px Inter,sans-serif';
    ctx.fillText(tier.label,x+cardW/2,y+42);

    // Dim pills
    dims.forEach(function(dim,di){
      var dy=y+56+di*22;
      ctx.fillStyle='#21262d';ctx.fillRect(x+6,dy,cardW-12,17);
      ctx.fillStyle='#8b949e';ctx.font='7px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
      ctx.fillText(dimLabels[di],x+8,dy+8);
      ctx.fillStyle=sel?tier.color:'#8b949e';ctx.font='bold 7px Inter,sans-serif';ctx.textAlign='right';
      var val=tier.dims[dim];
      ctx.fillText(val,x+cardW-8,dy+8);
    });

    // Control count
    ctx.fillStyle=sel?tier.color:'#8b949e';ctx.font='8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
    ctx.fillText(tier.controls.length+' controls',x+cardW/2,y+cardH-8);
  });

  // Click handler
  c.onclick=function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left;
    for(var i=0;i<n;i++){
      var x=10+i*(cardW+8);
      if(mx>=x&&mx<=x+cardW)selectTier(i);
    }
  };
  c.style.cursor='pointer';
}

// ============================================================
// SECTION 5: MRM PIPELINE
// ============================================================
function drawMRMPipeline(){
  var c=document.getElementById('canvas-mrm-pipeline');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var n=MRM_STEPS.length;
  var stepW=(W-24)/(n)-4;
  var stepH=H-40;
  var startY=24;

  MRM_STEPS.forEach(function(step,i){
    var x=12+i*(stepW+4);
    var y=startY;
    var sel=i===selectedStep;

    // Connector
    if(i<n-1){
      drawArrow(ctx,x+stepW,y+stepH/2,x+stepW+6,y+stepH/2,sel?step.color:'#30363d',sel?2:1.5);
    }

    // Card
    ctx.fillStyle=sel?step.color+'22':'#161b22';
    drawRoundedRect(ctx,x,y,stepW,stepH,6);ctx.fill();
    ctx.strokeStyle=sel?step.color:'#30363d';ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,x,y,stepW,stepH,6);ctx.stroke();

    // Step number
    ctx.fillStyle=step.color;ctx.font='bold 14px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(step.id,x+stepW/2,y+18);

    // LoD badges row
    ctx.fillStyle='#0ea5e933';ctx.fillRect(x+4,y+32,stepW/3-4,10);
    ctx.fillStyle='#6c5ce733';ctx.fillRect(x+4+stepW/3,y+32,stepW/3-4,10);
    ctx.fillStyle='#e1184433';ctx.fillRect(x+4+2*stepW/3,y+32,stepW/3-4,10);
    ctx.fillStyle='#38bdf8';ctx.font='6px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('1L',x+4+stepW/6-2,y+37);
    ctx.fillStyle='#a29bfe';ctx.fillText('2L',x+4+stepW/3+stepW/6-2,y+37);
    ctx.fillStyle='#e11844';ctx.fillText('SO',x+4+2*stepW/3+stepW/6-2,y+37);

    // Label
    ctx.fillStyle=sel?step.color:'#8b949e';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    var words=step.label.split(' ');
    var line='',ly=y+48;
    words.forEach(function(w){
      var t=line?line+' '+w:w;
      if(ctx.measureText(t).width>stepW-8&&line){ctx.fillText(line,x+stepW/2,ly);line=w;ly+=11;}
      else line=t;
    });
    ctx.fillText(line,x+stepW/2,ly);
  });

  // Click handler
  c.onclick=function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left;
    for(var i=0;i<n;i++){
      var x=12+i*(stepW+4);
      if(mx>=x&&mx<=x+stepW)selectStep(i);
    }
  };
  c.style.cursor='pointer';
}

// ============================================================
// SECTION 7: LIMITATIONS
// ============================================================
function drawLimitations(){
  var c=document.getElementById('canvas-limitations');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var filtered=activeLimCat==='all'?LIMITATIONS:LIMITATIONS.filter(function(l){return l.cat===activeLimCat;});
  var n=filtered.length;
  if(n===0)return;
  var cols=Math.min(n,7);
  var rows=Math.ceil(n/cols);
  var pad=10;
  var cardW=(W-pad*(cols+1))/cols;
  var cardH=(H-pad*(rows+1))/rows;

  filtered.forEach(function(lim,idx){
    var col=idx%cols;
    var row=Math.floor(idx/cols);
    var x=pad+col*(cardW+pad);
    var y=pad+row*(cardH+pad);
    var origIdx=LIMITATIONS.indexOf(lim);
    var sel=origIdx===selectedLimitation;

    // Card bg
    ctx.fillStyle=sel?lim.color+'33':'#161b22';
    drawRoundedRect(ctx,x,y,cardW,cardH,6);ctx.fill();
    ctx.strokeStyle=sel?lim.color:'#30363d';ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,x,y,cardW,cardH,6);ctx.stroke();

    // Severity bar at top
    ctx.fillStyle=lim.color+(sel?'':'66');
    ctx.fillRect(x+2,y+2,cardW-4,3);

    // ID
    ctx.fillStyle=lim.color;ctx.font='bold 11px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(lim.id,x+cardW/2,y+16);

    // Short label (word-wrap)
    ctx.fillStyle=sel?'#c9d1d9':'#8b949e';ctx.font=(sel?'bold ':'')+'8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
    var words=lim.label.split(' ');
    var line='',ly=y+26;
    words.forEach(function(w){
      var t=line?line+' '+w:w;
      if(ctx.measureText(t).width>cardW-8&&line){ctx.fillText(line,x+cardW/2,ly);line=w;ly+=10;}
      else line=t;
    });
    ctx.fillText(line,x+cardW/2,ly);

    // Cat dot at bottom
    var catColors={taxonomy:'#f7b731',logic:'#ff6b6b',sr117:'#e11844',scale:'#6c5ce7',missing:'#00b894'};
    ctx.beginPath();ctx.arc(x+cardW/2,y+cardH-8,3,0,Math.PI*2);
    ctx.fillStyle=catColors[lim.cat]||lim.color;ctx.fill();
  });

  // Category legend
  var cats=[{k:'taxonomy',c:'#f7b731',l:'Taxonomy'},{k:'logic',c:'#ff6b6b',l:'Logic'},{k:'sr117',c:'#e11844',l:'SR 11-7'},{k:'scale',c:'#6c5ce7',l:'Scale'},{k:'missing',c:'#00b894',l:'Missing'}];
  var lx=W-200,ly2=H-18;
  ctx.font='8px Inter,sans-serif';ctx.textBaseline='middle';
  cats.forEach(function(cat,i){
    var cx2=lx+i*40;
    ctx.beginPath();ctx.arc(cx2,ly2,4,0,Math.PI*2);ctx.fillStyle=cat.c;ctx.fill();
    ctx.fillStyle='#8b949e';ctx.textAlign='left';ctx.fillText(cat.l,cx2+6,ly2);
  });

  // Click handler
  c.onclick=function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left,my=e.clientY-r.top;
    filtered.forEach(function(lim,idx){
      var col=idx%cols,row=Math.floor(idx/cols);
      var x=pad+col*(cardW+pad),y=pad+row*(cardH+pad);
      if(mx>=x&&mx<=x+cardW&&my>=y&&my<=y+cardH){
        selectLimitation(LIMITATIONS.indexOf(lim));
      }
    });
  };
  c.style.cursor='pointer';
}

// ============================================================
// SECTION 6: USECASE REUSE
// ============================================================
function drawUsecaseReuse(){
  var c=document.getElementById('canvas-usecase-reuse');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var capColors=['#0ea5e9','#6c5ce7','#f7b731','#e11844'];
  var capLabels=['C1 Data','C2 Compute','C3 Generate','C4 Execute'];
  var n=USE_CASES.length;
  var rowH=(H-60)/(capLabels.length);
  var colW=(W-120)/(n);
  var leftW=115;
  var headerH=44;

  // Column headers (use cases)
  USE_CASES.forEach(function(uc,j){
    var x=leftW+j*colW;
    var sel=j===selectedUC;
    ctx.fillStyle=sel?uc.color+'22':'#161b22';
    drawRoundedRect(ctx,x+4,6,colW-8,headerH-6,6);ctx.fill();
    ctx.strokeStyle=sel?uc.color:'#30363d';ctx.lineWidth=sel?2:1;
    drawRoundedRect(ctx,x+4,6,colW-8,headerH-6,6);ctx.stroke();
    ctx.fillStyle=sel?uc.color:'#8b949e';ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(uc.id,x+colW/2,20);
    ctx.fillStyle=sel?uc.color+'cc':'#8b949e99';ctx.font='8px Inter,sans-serif';
    ctx.fillText(uc.label.split(' ').slice(0,2).join(' '),x+colW/2,32);
  });

  // Row headers (capabilities)
  capLabels.forEach(function(cl,i){
    var y=headerH+i*rowH;
    ctx.fillStyle=capColors[i];ctx.font='bold 9px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
    ctx.fillText(cl,leftW-8,y+rowH/2);
  });

  // Matrix cells
  capLabels.forEach(function(cl,i){
    var y=headerH+i*rowH;
    USE_CASES.forEach(function(uc,j){
      var x=leftW+j*colW;
      var used=uc.caps[i];
      var sel=j===selectedUC;
      ctx.fillStyle=used?(sel?capColors[i]+'44':capColors[i]+'22'):'#161b22';
      drawRoundedRect(ctx,x+6,y+4,colW-12,rowH-8,4);ctx.fill();
      ctx.strokeStyle=used?(sel?capColors[i]:capColors[i]+'55'):'#21262d';ctx.lineWidth=used?1.5:1;
      drawRoundedRect(ctx,x+6,y+4,colW-12,rowH-8,4);ctx.stroke();
      if(used){
        // Checkmark
        ctx.fillStyle=capColors[i];ctx.font='bold 14px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('\u2713',x+colW/2,y+rowH/2-2);
        // Auth label
        if(uc.capAuth[i]){
          ctx.fillStyle='#8b949e';ctx.font='7px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
          var auth=uc.capAuth[i];
          if(auth.length>16)auth=auth.substring(0,14)+'..';
          ctx.fillText(auth,x+colW/2,y+rowH/2+6);
        }
      }else{
        ctx.fillStyle='#30363d';ctx.font='12px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
        ctx.fillText('\u2014',x+colW/2,y+rowH/2);
      }
    });
  });

  // Reuse annotation
  ctx.fillStyle='#51cf66';ctx.font='bold 8px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='alphabetic';
  ctx.fillText('Validated capabilities reused across agents = incremental review only',W/2,H-4);

  // Click handler
  c.onclick=function(e){
    var r=c.getBoundingClientRect();
    var mx=e.clientX-r.left;
    for(var j=0;j<n;j++){
      var x=leftW+j*colW;
      if(mx>=x&&mx<=x+colW)selectUC(j);
    }
  };
  c.style.cursor='pointer';
}
