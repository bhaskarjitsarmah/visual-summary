const fs = require('fs');
const html = fs.readFileSync('./index.html', 'utf8');
const lastScript = html.lastIndexOf('</script>');
const js = fs.readFileSync('./build2_inject.js', 'utf8');
const result = html.slice(0, lastScript) + '\n' + js + '\n' + html.slice(lastScript);
fs.writeFileSync('./index.html', result);
const final = fs.readFileSync('./index.html', 'utf8');
console.log('build2 done:', final.length, 'bytes', final.split('\n').length, 'lines');
