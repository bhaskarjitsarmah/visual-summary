// inject_v4b.js — canvas functions for 8 new sections
const fs = require('fs');

const CANVAS_V4 = `
// ===== COST-BENEFIT CANVAS =====
function drawCostBenefit(data, numsys){
  var c=document.getElementById('canvas-costbenefit');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  if(!data){ctx.fillStyle='#8b949e';ctx.font='14px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('Configure options above to see the 5-year analysis.',W/2,H/2);return;}
  var years=[0,1,2,3,4,5];
  var pad={l:80,r:30,t:30,b:50};
  var chartW=W-pad.l-pad.r,chartH=H-pad.t-pad.b;
  // Compute cumulative values
  var cumLossNo=[],cumWith=[];
  for(var yr=0;yr<=5;yr++){
    cumLossNo.push(data.lossNo*yr);
    var impl=yr===0?0:data.impl+(data.impl*0.6*(yr-1)); // yr1 full impl cost, subsequent years 60% ongoing
    var lossRed=data.lossWith*yr;
    cumWith.push(impl+lossRed);
  }
  var maxVal=Math.max.apply(null,cumLossNo.concat(cumWith));
  var scaleY=chartH/Math.max(maxVal,1);
  // Axes
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(pad.l,pad.t);ctx.lineTo(pad.l,pad.t+chartH);ctx.lineTo(pad.l+chartW,pad.t+chartH);ctx.stroke();
  // Y-axis labels
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='right';ctx.textBaseline='middle';
  for(var i=0;i<=4;i++){
    var val=maxVal*i/4;
    var y=pad.t+chartH-val*scaleY;
    ctx.fillText(val>=1000?'$'+(val/1000).toFixed(0)+'M':'$'+Math.round(val)+'K',pad.l-6,y);
    ctx.beginPath();ctx.moveTo(pad.l,y);ctx.lineTo(pad.l+chartW,y);
    ctx.strokeStyle='#21262d';ctx.lineWidth=0.5;ctx.stroke();
  }
  // X-axis labels
  ctx.fillStyle='#8b949e';ctx.font='10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='top';
  years.forEach(function(yr){
    var x=pad.l+yr*(chartW/5);
    ctx.fillText('Yr '+yr,x,pad.t+chartH+6);
  });
  // Line: No RMF (red)
  ctx.beginPath();
  years.forEach(function(yr,i){var x=pad.l+yr*(chartW/5),y=pad.t+chartH-cumLossNo[i]*scaleY;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.strokeStyle='#ff6b6b';ctx.lineWidth=2.5;ctx.stroke();
  // Fill under No RMF
  ctx.beginPath();
  years.forEach(function(yr,i){var x=pad.l+yr*(chartW/5),y=pad.t+chartH-cumLossNo[i]*scaleY;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.lineTo(pad.l+5*(chartW/5),pad.t+chartH);ctx.lineTo(pad.l,pad.t+chartH);ctx.closePath();
  ctx.fillStyle='#ff6b6b18';ctx.fill();
  // Line: With RMF (green)
  ctx.beginPath();
  years.forEach(function(yr,i){var x=pad.l+yr*(chartW/5),y=pad.t+chartH-cumWith[i]*scaleY;i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);});
  ctx.strokeStyle='#51cf66';ctx.lineWidth=2.5;ctx.stroke();
  // Dots
  years.forEach(function(yr,i){
    var xN=pad.l+yr*(chartW/5),yN=pad.t+chartH-cumLossNo[i]*scaleY;
    ctx.beginPath();ctx.arc(xN,yN,4,0,Math.PI*2);ctx.fillStyle='#ff6b6b';ctx.fill();
    var xW=pad.l+yr*(chartW/5),yW=pad.t+chartH-cumWith[i]*scaleY;
    ctx.beginPath();ctx.arc(xW,yW,4,0,Math.PI*2);ctx.fillStyle='#51cf66';ctx.fill();
  });
  // Crossover / break-even annotation
  var crossYr=-1;
  for(var k=1;k<=5;k++){if(cumWith[k]<cumLossNo[k]&&crossYr<0)crossYr=k;}
  if(crossYr>0){
    var cx2=pad.l+crossYr*(chartW/5);
    ctx.beginPath();ctx.moveTo(cx2,pad.t);ctx.lineTo(cx2,pad.t+chartH);
    ctx.setLineDash([4,4]);ctx.strokeStyle='#f7b731';ctx.lineWidth=1;ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#f7b731';ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';
    ctx.fillText('Break-even',cx2,pad.t+8);
  }
  // Legend
  ctx.fillStyle='#ff6b6b';ctx.fillRect(W-160,pad.t,12,3);ctx.fillStyle='#ff6b6b';ctx.font='10px Inter,sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText('No RMF (loss)',W-144,pad.t+1);
  ctx.fillStyle='#51cf66';ctx.fillRect(W-160,pad.t+14,12,3);ctx.fillStyle='#51cf66';ctx.fillText('With RMF (cost+loss)',W-144,pad.t+15);
}

// ===== RADAR CHART CANVAS =====
function drawRadar(){
  var c=document.getElementById('canvas-radar');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  var cx=W/2,cy=H/2-10,r=130;
  var n=RADAR_CHARS.length;
  var step=Math.PI*2/n;
  var startAngle=-Math.PI/2;
  // Grid rings
  for(var ring=2;ring<=10;ring+=2){
    ctx.beginPath();
    for(var i=0;i<n;i++){
      var a=startAngle+i*step;
      var rx=cx+Math.cos(a)*(r*ring/10),ry=cy+Math.sin(a)*(r*ring/10);
      i===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
    }
    ctx.closePath();
    ctx.strokeStyle='#21262d';ctx.lineWidth=0.8;ctx.stroke();
  }
  // Spokes
  for(var i=0;i<n;i++){
    var a=startAngle+i*step;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
    ctx.strokeStyle='#21262d';ctx.lineWidth=1;ctx.stroke();
  }
  // Baseline polygon
  ctx.beginPath();
  RADAR_BASELINE.forEach(function(val,i){
    var a=startAngle+i*step,rx=cx+Math.cos(a)*(r*val/10),ry=cy+Math.sin(a)*(r*val/10);
    i===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
  });
  ctx.closePath();ctx.strokeStyle='#8b949e';ctx.lineWidth=1.5;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#8b949e22';ctx.fill();
  // User scores polygon
  ctx.beginPath();
  radarScores.forEach(function(val,i){
    var a=startAngle+i*step,rx=cx+Math.cos(a)*(r*val/10),ry=cy+Math.sin(a)*(r*val/10);
    i===0?ctx.moveTo(rx,ry):ctx.lineTo(rx,ry);
  });
  ctx.closePath();ctx.strokeStyle='#6c5ce7';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#6c5ce744';ctx.fill();
  // Score dots and labels
  radarScores.forEach(function(val,i){
    var a=startAngle+i*step;
    var rx=cx+Math.cos(a)*(r*val/10),ry=cy+Math.sin(a)*(r*val/10);
    ctx.beginPath();ctx.arc(rx,ry,5,0,Math.PI*2);
    ctx.fillStyle=val<RADAR_BASELINE[i]?'#ff6b6b':RADAR_COLORS[i];ctx.fill();
    // Label
    var tx=cx+Math.cos(a)*(r+22),ty=cy+Math.sin(a)*(r+22);
    ctx.fillStyle=RADAR_COLORS[i];ctx.font='bold 10px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(RADAR_CHARS[i],tx,ty);
    // Score value
    ctx.fillStyle='#c9d1d9';ctx.font='9px Inter,sans-serif';
    ctx.fillText(val+'/10',tx,ty+12);
  });
  // Legend
  ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';ctx.textAlign='left';
  ctx.fillText('--- Baseline',10,H-24);
  ctx.fillStyle='#6c5ce7';ctx.fillText('Your score',10,H-12);
}

// ===== SCORECARD CANVAS =====
function drawScorecard(grades){
  var c=document.getElementById('canvas-scorecard');
  if(!c)return;
  var ctx=c.getContext('2d');
  var W=c.width,H=c.height;
  ctx.clearRect(0,0,W,H);
  if(!grades){
    ctx.fillStyle='#8b949e';ctx.font='14px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText('Click Calculate to generate scorecard from your 72-subcategory checklist.',W/2,H/2);
    return;
  }
  var fns=['GV','MP','MS','MG'];
  var cardW=(W-40)/4,cardH=H-20,cardGap=10;
  var gradeColors={'A':'#51cf66','B':'#00b894','C':'#f7b731','D':'#ff9f43','F':'#ff6b6b'};
  fns.forEach(function(fn,i){
    var g=grades[fn];
    if(!g)return;
    var x=10+i*(cardW+cardGap),y=10;
    // Card background
    ctx.fillStyle='#161b22';ctx.beginPath();ctx.roundRect(x,y,cardW,cardH,8);ctx.fill();
    ctx.strokeStyle=g.color;ctx.lineWidth=1.5;ctx.beginPath();ctx.roundRect(x,y,cardW,cardH,8);ctx.stroke();
    // Score bar
    ctx.fillStyle=g.color+'33';ctx.beginPath();ctx.roundRect(x,y+cardH-8,cardW*g.score/100,8,{lowerLeft:8,lowerRight:g.score>=100?8:0,upperLeft:0,upperRight:0});ctx.fill();
    // Grade letter
    var gc=gradeColors[g.letter]||'#8b949e';
    ctx.fillStyle=gc;ctx.font='bold 52px Inter,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillText(g.letter,x+cardW/2,y+cardH/2-10);
    // Function label
    ctx.fillStyle=g.color;ctx.font='bold 12px Inter,sans-serif';ctx.textBaseline='alphabetic';
    ctx.fillText(g.label,x+cardW/2,y+22);
    // Score pct
    ctx.fillStyle='#8b949e';ctx.font='11px Inter,sans-serif';
    ctx.fillText(g.score+'%',x+cardW/2,y+cardH-18);
    // Pass/Partial/Fail counts
    ctx.fillStyle='#8b949e';ctx.font='9px Inter,sans-serif';
    ctx.fillText('P:'+g.pass+' Par:'+g.partial+' F:'+g.fail,x+cardW/2,y+cardH-32);
  });
}
`;

const OLD_DOINIT = `  if(typeof stakhGen==='function')stakhGen();
  updateNavOnScroll();`;
const NEW_DOINIT = `  if(typeof stakhGen==='function')stakhGen();
  costBenefitCalc();
  if(typeof implRoadmapGen==='function')implRoadmapGen();
  if(typeof vendorQGen==='function')vendorQGen();
  if(typeof charterGen==='function')charterGen();
  if(typeof narrativeGen==='function')narrativeGen();
  initRadar();
  initIso42001();
  initScorecard();
  updateNavOnScroll();`;

let b2 = fs.readFileSync('./build2_inject.js', 'utf8');
b2 = b2.replace(/\r\n/g, '\n'); // normalize CRLF → LF
// Use function replacements to avoid $' and $` special patterns in replacement strings
b2 = b2.replace('function doInit(){', function(){ return CANVAS_V4 + '\nfunction doInit(){'; });
b2 = b2.replace(OLD_DOINIT, function(){ return NEW_DOINIT; });
fs.writeFileSync('./build2_inject.js', b2, 'utf8');
console.log('build2_inject.js updated:', b2.length, 'bytes');
