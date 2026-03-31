const http = require('http');
const app = require('./app');
const config = require('./config');

const server = http.createServer(app);

// Bind to all interfaces so the server is reachable in container/cloud environments (e.g. Render).
const host = '0.0.0.0';

server.listen(config.port, host, () => {
    console.log(`Server running on http://${host}:${config.port}`);
});

