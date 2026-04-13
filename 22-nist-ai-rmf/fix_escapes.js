const fs = require('fs');
let src = fs.readFileSync('./build1.js', 'utf8');

// The file has literal \n (backslash-n) in JS string values inside the template literal.
// When Node.js evaluates the template literal, \n becomes a real newline in the output.
// Fix: change \n to \\n so the output gets a literal \n escape.
// Search for literal \n = '\\n' in JS string terms.

const pairs = [
  ["name:'Accountable\\n& Transparent'", "name:'Accountable\\\\n& Transparent'"],
  ["name:'Explainable\\n& Interpretable'", "name:'Explainable\\\\n& Interpretable'"],
  ["name:'Privacy-\\nEnhanced'", "name:'Privacy-\\\\nEnhanced'"],
  ["name:'Secure\\n& Resilient'", "name:'Secure\\\\n& Resilient'"],
  ["name:'Fair /\\nBias Managed'", "name:'Fair /\\\\nBias Managed'"],
  ["label:'AI Risk\\nGovernance'", "label:'AI Risk\\\\nGovernance'"],
  ["label:'G1: Policies\\n& Culture'", "label:'G1: Policies\\\\n& Culture'"],
  ["label:'G4: Team\\nCommitment'", "label:'G4: Team\\\\nCommitment'"],
  ["label:'G5: Risk\\nPolicies'", "label:'G5: Risk\\\\nPolicies'"],
  ["label:'G6: Human\\nOversight'", "label:'G6: Human\\\\nOversight'"],
  ["label:'MAP 1\\nContext'", "label:'MAP 1\\\\nContext'"],
  ["label:'MAP 2\\nKnowledge'", "label:'MAP 2\\\\nKnowledge'"],
  ["label:'MAP 3\\nRisks &\\nBenefits'", "label:'MAP 3\\\\nRisks &\\\\nBenefits'"],
  ["label:'MAP 4\\nPrioritize'", "label:'MAP 4\\\\nPrioritize'"],
  ["label:'MAP 5\\nSocietal\\nImpact'", "label:'MAP 5\\\\nSocietal\\\\nImpact'"],
  ["name:'Plan &\\nDesign'", "name:'Plan &\\\\nDesign'"],
  ["name:'Data &\\nDevelopment'", "name:'Data &\\\\nDevelopment'"],
  ["name:'Operation &\\nMonitoring'", "name:'Operation &\\\\nMonitoring'"],
];

let count = 0;
pairs.forEach(function(p) {
  if (src.includes(p[0])) {
    src = src.split(p[0]).join(p[1]);
    count++;
    console.log('Fixed:', p[0].slice(0, 40));
  } else {
    console.log('NOT FOUND:', p[0].slice(0, 40));
  }
});

fs.writeFileSync('./build1.js', src, 'utf8');
console.log('Done:', count, 'replacements');
