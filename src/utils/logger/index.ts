import winston from 'winston';
import { Request } from 'express';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }));
}

export const logRequest = (req: Request) => {
  logger.info('Request', {
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    params: req.params,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  });
};

export const logError = (error: Error, req?: Request) => {
  logger.error('Error', {
    message: error.message,
    stack: error.stack,
    request: req ? {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
      params: req.params,
    } : undefined,
    timestamp: new Date().toISOString(),
  });
};

export const logInfo = (message: string, meta?: any) => {
  logger.info(message, {
    ...meta,
    timestamp: new Date().toISOString(),
  });
};

export default logger; 