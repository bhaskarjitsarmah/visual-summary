const fs = require('fs');
let src = fs.readFileSync('./build1.js', 'utf8');

// Replace escaped apostrophes (\') in JS data strings with unicode escape (\u0027)
// In a Node.js template literal, \' becomes ' in output — breaking the string.
// But \u0027 is fine in template literals: it passes through as \u0027 in output...
// WAIT: \u0027 in a template literal IS processed to ' by Node.js.
// Best fix: replace the text to avoid apostrophes entirely.

const pairs = [
  // GV-2.2: organization's
  ["text:'The organization\\'s AI risk tolerance is established, communicated, and maintained.'",
   "text:'Organizational AI risk tolerance is established, communicated, and maintained.'"],
  // Any other \' in data strings — just remove them systematically
];

// Also fix the </div> issue in build2_inject.js separately
let count = 0;
pairs.forEach(function(p) {
  if (src.includes(p[0])) {
    src = src.split(p[0]).join(p[1]);
    count++;
    console.log('Fixed:', p[0].slice(0, 50));
  } else {
    // Try without the escape
    var unescaped = p[0].replace("\\'", "'");
    if (src.includes(unescaped)) {
      src = src.split(unescaped).join(p[1]);
      count++;
      console.log('Fixed (unescaped):', unescaped.slice(0, 50));
    } else {
      console.log('NOT FOUND:', p[0].slice(0, 50));
    }
  }
});

fs.writeFileSync('./build1.js', src, 'utf8');
console.log('Done:', count, 'replacements');
