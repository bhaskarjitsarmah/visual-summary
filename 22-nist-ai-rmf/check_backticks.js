const fs=require('fs');
const src=fs.readFileSync('./inject_v4.js','utf8');
var bt=[];
for(var i=0;i<src.length;i++){if(src.charCodeAt(i)===96)bt.push({pos:i,line:src.slice(0,i).split('\n').length});}
console.log('Total backticks:',bt.length);
bt.forEach(function(b){
  var ctx=src.slice(Math.max(0,b.pos-30),b.pos+30).replace(/\n/g,'\\n').replace(/\r/g,'\\r');
  console.log('  line',b.line,'pos',b.pos,'ctx:',ctx);
});
