"use strict";
var fs = require('fs'), path = require('path');
var dir = __dirname;
var head = fs.readFileSync(path.join(dir, 'head.html'), 'utf8');
var body = fs.readFileSync(path.join(dir, 'body.html'), 'utf8');
var script = fs.readFileSync(path.join(dir, 'script.js'), 'utf8');
var engine = fs.readFileSync(path.join(dir, 'engine.js'), 'utf8');
engine = engine.replace(/\/\* ═+ CLIP-in-miniature engine[^\n]*\n"use strict";\n/, '');
engine = engine.replace(/if\(typeof module !== 'undefined'\) module\.exports = \{[\s\S]*$/, '');
if(engine.indexOf('module.exports') >= 0) throw new Error('module export not stripped');
script = script.replace('//ENGINE//', engine.trim());
var page = head + body + '\n<script>\n"use strict";\n' + script + '\n</script>\n</body>\n</html>\n';
var out = process.argv[2];
fs.writeFileSync(out, page);
var shot = page.replace('<div id="gate">', '<div id="gate" style="display:none">')
  .replace('\n</script>\n</body>', '\n/* screenshot helper only */ if(location.search.indexOf("train") >= 0){ labStep(450); lossLab.step = 8; drawLoss(); }\n</script>\n</body>');
fs.writeFileSync(path.join(dir, 'shot.html'), shot);
console.log('wrote ' + out + ' (' + page.length + ' bytes) and shot.html');
