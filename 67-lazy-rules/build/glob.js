/* glob matcher used by the page: **, *, ?, {a,b} — patterns are relative to the project root */
function expandBraces(p){
  var m = p.match(/\{([^{}]*)\}/);
  if(!m) return [p];
  var out = [];
  m[1].split(',').forEach(function(alt){
    expandBraces(p.slice(0, m.index) + alt + p.slice(m.index + m[0].length)).forEach(function(x){ out.push(x); });
  });
  return out;
}
function globToRegex(p){
  var re = '', i = 0;
  while(i < p.length){
    var c = p[i];
    if(c === '*' && p[i + 1] === '*'){
      var atStart = i === 0 || p[i - 1] === '/';
      if(atStart && p[i + 2] === '/'){ re += '(?:[^/]+/)*'; i += 3; continue; }
      if(atStart && i + 2 === p.length){ re += '.*'; i += 2; continue; }
      re += '[^/]*'; i += 2; continue;
    }
    if(c === '*'){ re += '[^/]*'; i++; continue; }
    if(c === '?'){ re += '[^/]'; i++; continue; }
    re += c.replace(/[.+^$()|[\]\\]/g, '\\$&'); i++;
  }
  return new RegExp('^' + re + '$');
}
function globMatch(pattern, file){
  pattern = pattern.trim().replace(/^\.\//, '');
  if(!pattern) return false;
  return expandBraces(pattern).some(function(p){ return globToRegex(p).test(file); });
}
if(typeof module !== 'undefined') module.exports = { globMatch: globMatch, expandBraces: expandBraces };
