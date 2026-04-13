const fs = require('fs');
let src = fs.readFileSync('./build1.js', 'utf8');

// Fix \n in new GENAI_RISKS name strings
const pairs = [
  ["name:'Hallucination\\n& Fabrication'", "name:'Hallucination\\\\n& Fabrication'"],
  ["name:'Prompt\\nInjection'", "name:'Prompt\\\\nInjection'"],
  ["name:'Training Data\\nPrivacy'", "name:'Training Data\\\\nPrivacy'"],
  ["name:'IP &\\nCopyright'", "name:'IP &\\\\nCopyright'"],
  ["name:'CBRN\\nHazards'", "name:'CBRN\\\\nHazards'"],
  ["name:'Data\\nProvenance'", "name:'Data\\\\nProvenance'"],
  ["name:'Output\\nHomogenization'", "name:'Output\\\\nHomogenization'"],
  ["name:'Misinformation\\nat Scale'", "name:'Misinformation\\\\nat Scale'"],
  ["name:'Human\\nOver-reliance'", "name:'Human\\\\nOver-reliance'"],
  ["name:'Agentic\\nSystem Risks'", "name:'Agentic\\\\nSystem Risks'"],
  ["name:'AI Power\\nConcentration'", "name:'AI Power\\\\nConcentration'"],
  ["name:'Environmental\\nImpact'", "name:'Environmental\\\\nImpact'"],
];

let count = 0;
pairs.forEach(function(p) {
  if (src.includes(p[0])) {
    src = src.split(p[0]).join(p[1]);
    count++;
    console.log('Fixed:', p[0].slice(0, 35));
  } else {
    console.log('NOT FOUND:', p[0].slice(0, 35));
  }
});

fs.writeFileSync('./build1.js', src, 'utf8');
console.log('Done:', count, 'replacements');
