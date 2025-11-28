const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test Server Running');
});

const PORT = 5000;

server.listen(PORT, () => {
    console.log(`Test server running at http://localhost:${PORT}/`);
});

server.on('error', (e) => {
    console.error('Server error:', e);
});
