import { bullMQService } from '../../clients';
import { BULLMQQUEUES } from '../core-constants/common.constants';

export const initializeBullMQSendNotification = async () => {
  await bullMQService.createWorker(
    BULLMQQUEUES.NOTIFICATION_FALL_DETECTION_QUEUE,
    async (job) => {
      const { IMEI, message } = job.data;
      job.id;

      console.info('Sending notification:', IMEI, message, job.id);
      //TODO fetch user emergency contacts  by IMEI
      //TODO send message sms to emergency contacts
    },
  );
};

// other Usage
// await bullMQService.addDelayedJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, 'sms-emergency-contacts', { IMEI: imei, title: commsTemplate.appTitle, message: appContent }, 3 * 60 * 1000, jobId);
// const job = await bullMQService.getJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, args.jobId);
// bullMQService.removeJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, args.jobId);
// await bullMQService.addJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, job.name, job.data, { removeOnComplete: true, removeOnFail: true, attempts: 2, jobId: job.id });
