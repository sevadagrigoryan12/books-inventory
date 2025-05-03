import cron from 'node-cron';
import { checkAndSendReturnReminders } from './automatedTasks';

export function startScheduler() {
  cron.schedule('0 0 * * *', async () => {
    await checkAndSendReturnReminders();
  });
} 