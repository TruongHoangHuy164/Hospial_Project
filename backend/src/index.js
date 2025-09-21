require('dotenv').config();
const http = require('http');
const app = require('./app');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = parseInt(process.env.PORT || '5000', 10);

const server = http.createServer(app);

server.listen(PORT, HOST, () => {
  console.log(`Hospital API listening at http://${HOST}:${PORT}`);
});
