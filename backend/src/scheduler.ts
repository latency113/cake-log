import cron from 'node-cron';
import { performBackup } from './features/services/admin/backup.service';
import logger from './providers/logger/logger.provider';

export const startBackupScheduler = () => {
  cron.schedule('0 0 1 * *', async () => {
    logger.info('Starting monthly backup...');
    try {
      const result = await performBackup();
      logger.info(`Monthly backup completed: ${result}`);
    } catch (error: any) {
      logger.error(`Monthly backup failed: ${error.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Bangkok"
  });

  logger.info('Backup scheduler started. Next backup scheduled for the 1st day of next month at midnight.');
};
