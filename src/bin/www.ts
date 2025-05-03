import { Server } from 'http';
import { AddressInfo } from 'net';
import http from 'http';
import config from '../config/environment/service';
import app from '../app';
import { logger } from '../utils/logger';

const port = normalizePort(config.port);
app.set('port', port);

function normalizePort(val: string | number): number | string | false {
  const port = typeof val === 'string' ? parseInt(val, 10) : val;
  if (isNaN(port)) { return val; }
  if (port >= 0) { return port; }
  return false;
}

function onError(error: NodeJS.ErrnoException): void {
  logger.error('Server error:', { error });
  
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  switch (error.code) {
    case 'EACCES':
      logger.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      logger.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
}

const server: Server = http.createServer(app);

// Set server timeout to 5 minutes
server.setTimeout(5 * 60 * 1000);

function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `Pipe ${port}` : `Port ${(addr as AddressInfo).port}`;
  logger.info(`Server listening on ${bind}`);
}

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', { reason });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { error });
  process.exit(1);
}); 