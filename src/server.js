const http = require('http');
const app = require('./app');
const port = 3000;

// Create HTTP server from the Express app
const server = http.createServer(app);

// Create HTTP server from the Express app
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

