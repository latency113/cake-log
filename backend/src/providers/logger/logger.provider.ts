import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure the log directory exists
const logDirectory = path.join(process.cwd(), 'log');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ... (process.env.NODE_ENV === 'production'
    ? {
        transport: {
          target: 'pino/file',
          options: { destination: path.join(logDirectory, 'app.log'), mkdir: true },
        },
      }
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname',
          },
        },
      }),
});

export default logger;
