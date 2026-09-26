// Tiny static server for the renderer folder — used only for manual/e2e testing.
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'renderer');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

http.createServer((req, res) => {
  let file = req.url.split('?')[0];
  if (file === '/') file = '/index.html';
  const full = path.join(root, path.normalize(file));
  if (!full.startsWith(root)) { res.writeHead(403); res.end(); return; }
  fs.readFile(full, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(full)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(8123, '127.0.0.1', () => console.log('renderer on http://127.0.0.1:8123'));
