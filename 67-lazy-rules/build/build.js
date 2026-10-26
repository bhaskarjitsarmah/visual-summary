"use strict";
var fs = require('fs'), path = require('path');
var dir = __dirname;
function read(f){ return fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n'); }
var head = read('head.html'), body = read('body.html'), script = read('script.js');
var glob = read('glob.js').replace(/if\(typeof module !== 'undefined'\)[^\n]*\n?/, '');
var engine = read('engine.js').replace(/^\/\* ═+ LOADER ENGINE[^\n]*\n"use strict";\n/, '');
engine = engine.replace(/if\(typeof module !== 'undefined'\) module\.exports = \{[\s\S]*$/, '');
engine = engine.replace('//GLOB//', function(){ return glob.trim(); });
if(engine.indexOf('module.exports') >= 0 || engine.indexOf('//GLOB//') >= 0) throw new Error('engine not stripped');
script = script.replace('//ENGINE//', function(){ return engine.trim(); });
if(script.indexOf('//ENGINE//') >= 0) throw new Error('engine marker left');
var page = head + body + '\n<script>\n"use strict";\n' + script + '\n</script>\n</body>\n</html>\n';
var out = process.argv[2];
fs.writeFileSync(out, page);
var shot = page.replace('<div id="gate">', '<div id="gate" style="display:none">')
  .replace('\n</script>\n</body>', '\n/* screenshot helper only */ var _m = location.search.match(/scn=(\\w+)&n=(\\d+)/); if(_m){ loadScenario(_m[1]); for(var _i = 0; _i < +_m[2]; _i++) $("sim-next").click(); }\n</script>\n</body>');
fs.writeFileSync(path.join(dir, 'shot.html'), shot);
fs.writeFileSync(path.join(dir, 'phone.html'), '<!doctype html><body style="margin:0;background:#333"><iframe src="shot.html" style="width:390px;height:6000px;border:0"></iframe></body>');
console.log('wrote ' + out + ' (' + page.length + ' bytes) and shot.html');
