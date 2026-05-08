const { spawn } = require('child_process');
const fetch = global.fetch || require('node-fetch');
const path = require('path');

const cwd = path.resolve(__dirname);
const server = spawn('node', ['index.js'], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });

server.stdout.on('data', (data) => process.stdout.write(data));
server.stderr.on('data', (data) => process.stderr.write(data));

const base = 'http://127.0.0.1:3000';

(async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const tests = [
    { method: 'GET', path: '/', expect: 200 },
    { method: 'GET', path: '/1', expect: 200 },
    { method: 'POST', path: '/', body: { valor: 18 }, expect: 200 },
    { method: 'POST', path: '/19', expect: 200 },
    { method: 'PATCH', path: '/0', body: { valor: 21 }, expect: 200 },
    { method: 'DELETE', path: '/0', expect: 200 },
    { method: 'DELETE', path: '/', expect: 200 },
    { method: 'GET', path: '/100', expect: 400 },
  ];

  for (const test of tests) {
    const options = { method: test.method, headers: { 'Content-Type': 'application/json' } };
    if (test.body) options.body = JSON.stringify(test.body);
    const res = await fetch(base + test.path, options);
    const text = await res.text();
    console.log(`${test.method} ${test.path} -> ${res.status}`);
    if (res.status !== test.expect) {
      console.error('Falha no teste:', test, text);
      process.exitCode = 1;
      break;
    }
  }

  server.kill('SIGINT');
})();
