const http = require('http');
const app = require('./app');
const debug = require('debug')('express:www');
const pino = require('pino');
const { HTTP_HOST, PORT } = process.env
const logger = pino();
require("dotenv").config()

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (Number.isNaN(port))
    return val;

  if (port >= 0)
    return port;

  return false;
}

const port = normalizePort(PORT || 3000);
app.set('port', port);

const server = http.createServer(app);

process.on('uncaughtException', uncaughtException =>
  logger.error(`Uncaught Exception at: ${uncaughtException.stack} - message: ${uncaughtException.message}`));

process.on('unhandledRejection', reason =>
  logger.error(`Unhandled Rejection at: %s - message: $`, reason.stack, reason.message));

const onError = (error) => {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

const onListening = () => {
  const address = server.address();
  const bind = typeof address === 'string' ? `pipe ${address}` : `port ${address.port}`;

  debug(`Listening on ${bind}`);
}
server.listen(port, HTTP_HOST);
server.on('error', onError);
server.on('listening', onListening);