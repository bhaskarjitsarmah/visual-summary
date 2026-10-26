global.globMatch = require('./glob.js').globMatch;
var E = require('./engine.js'), ok = 0, bad = 0;
function check(name, cond, info){ if(cond) ok++; else { bad++; console.log('[X] ' + name + (info !== undefined ? '  -> ' + JSON.stringify(info) : '')); } }
function keys(s){ return s.loaded.map(function(l){ return l.key; }); }

/* launch loads exactly the launch set + skill description */
var s = E.simulate([{ t:'launch' }]);
check('launch set', JSON.stringify(keys(s[0])) === JSON.stringify(['user','root','local','style','skill:desc']), keys(s[0]));

/* bug scenario */
var b = E.simulate(E.SCENARIOS.bug.events);
check('bug: prompt loads nothing', b[1].added.length === 0);
check('bug: orders.ts loads api + nested', JSON.stringify(b[2].added) === JSON.stringify(['api','nested']), b[2].added);
check('bug: test file loads tests only', JSON.stringify(b[3].added) === JSON.stringify(['tests']), b[3].added);
check('bug: router loads nothing', b[4].added.length === 0);
check('bug: react never', !E.isLoaded(b[4], 'react'));
check('bug: no violation', b.every(function(x){ return !x.violation; }));

/* catch scenario */
var c = E.simulate(E.SCENARIOS.catch.events);
check('catch: package.json loads nothing', c[2].added.length === 0);
check('catch: create flags api violation', c[3].violation && c[3].violation.rule === 'api', c[3].violation);
check('catch: create loads nothing', c[3].added.length === 0);
check('catch: api absent at write', !E.isLoaded(c[3], 'api'));
check('catch: later read loads api', c[4].added.indexOf('api') >= 0, c[4].added);
check('catch: refunds now exists', c[4].files['src/api/refunds.ts'] === true);

/* web scenario */
var w = E.simulate(E.SCENARIOS.web.events);
check('web: Cart loads react', JSON.stringify(w[2].added) === JSON.stringify(['react']), w[2].added);
check('web: css loads nothing', w[3].added.length === 0);
check('web: api/tests/migr/nested never', ['api','tests','migr','nested'].every(function(k){ return !E.isLoaded(w[4], k); }));

/* errors */
var e = E.simulate([{ t:'launch' }, { t:'read', f:'src/api/refunds.ts' }]);
check('read of missing file errors', !!e[1].err && e[1].added.length === 0);
var e2 = E.simulate([{ t:'launch' }, { t:'create', f:'src/api/orders.ts' }]);
check('create of existing errors', !!e2[1].err);
/* skill */
var k = E.simulate([{ t:'launch' }, { t:'skill' }]);
check('skill body loads', k[1].added[0] === 'skill');
/* migrations rule */
var m = E.simulate([{ t:'launch' }, { t:'read', f:'db/migrations/001_init.sql' }]);
check('migration read loads migr', JSON.stringify(m[1].added) === JSON.stringify(['migr']));

/* token accounting */
var launchTok = b[0].tokens, full = E.allTokens();
console.log('  launch tokens', launchTok, ' bug end', b[4].tokens, ' web end', w[4].tokens, ' all', full);
check('tokens grow monotonically', b.every(function(x, i){ return i === 0 || x.tokens >= b[i - 1].tokens; }));
check('web uses less than all', w[4].tokens < full);

/* strategies */
['bug','catch','web'].forEach(function(sc){
  var ev = E.SCENARIOS[sc].events;
  console.log('  ' + sc, 'all', JSON.stringify(E.strategyOutcome('all', ev)), 'read', JSON.stringify(E.strategyOutcome('read', ev)));
});
check('all: never violates', ['bug','catch','web'].every(function(sc){ return E.strategyOutcome('all', E.SCENARIOS[sc].events).violations === 0; }));
check('read: violates only in catch', E.strategyOutcome('read', E.SCENARIOS.catch.events).violations === 1 && E.strategyOutcome('read', E.SCENARIOS.bug.events).violations === 0);
check('all wastes tokens in web', E.strategyOutcome('all', E.SCENARIOS.web.events).wastedTokens > 0);

/* budget */
var bu = E.budget({ rules:30, tokPerRule:300, core:1500, share:0.1, turns:40 });
console.log('  budget', JSON.stringify(bu));
check('budget always', bu.always === 1500 + 9000);
check('budget scoped', bu.scoped === 1500 + 900);
check('budget session', bu.alwaysSession === 420000 && bu.scopedSession === 96000);

console.log(bad ? '[X]' : '[OK]', ok, 'passed,', bad, 'failed');
process.exitCode = bad ? 1 : 0;
