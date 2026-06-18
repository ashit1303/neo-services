import { bullMQService, sensiSearch } from '../../clients';
import DsaQuestions from '../../models/dsa-quests.model';
import { dsaQuestionsTypesenseSchema } from '../../models/typesense-collections/questions.collections';
import { candidateTypesenseSchema } from '../../models/typesense-collections/candidates.collections';
import CandidateProfile from '../../models/candidate.model';
import CandidateBlog from '../../models/candidate-blog.model';
import { BULLMQQUEUES, TYPSENSE_COLLECTION_NAME } from '../core-constants/common.constants';

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

export const initializeBullMQTypesenseSync = async () => {
  // await bullMQService.obliterateQueue(BULLMQQUEUES.TYPSENSE_LEETCODE_QUESTIONS_SYNC);
  await bullMQService.createWorker(
    BULLMQQUEUES.TYPSENSE_LEETCODE_QUESTIONS_SYNC,
    async (job) => {
      console.info('Starting Typesense Sync:', job.id);

      try {
        try {
          await sensiSearch.getCollection(TYPSENSE_COLLECTION_NAME.DSA_QUESTIONS);
        } catch (err: any) {
          if (err.httpStatus === 404) {
            console.info('Collection not found, creating schema...');
            await sensiSearch.createCollection(dsaQuestionsTypesenseSchema);
          } else { throw err; }
        }
        // 1. Fetch questions from your DB
        const questions = await DsaQuestions.find({ questionTitle: { $exists: true } }).lean();

        // 2. Format for Typesense (Ensure ID is a string)
        const documents = questions.map(q => ({
          id: q._id.toString(),
          titleSlug: q.titleSlug,
          questionTitle: q.questionTitle,
          difficulty: q.difficulty,
          categoryTitle: q.categoryTitle,
        }));

        // 3. Bulk Upsert into Typesense
        if (documents.length > 0) {
          await sensiSearch.importCollection(documents, TYPSENSE_COLLECTION_NAME.DSA_QUESTIONS).catch((err: any) => {
            if (err?.importResults) {
              const printList = err.importResults.filter((item: any) => item.success !== true);
              console.error('[BullMQ] importResults', printList);
              // console.error('[BullMQ] errorDocs', JSON.stringify(err));
            }
            return;
          });

          console.info(`Successfully synced ${documents.length} questions.`);
        }
      } catch (error) {
        console.error('Typesense Sync Failed:', error);
        throw error; // Let BullMQ handle the retry
      }
    },
  );
};

export async function scheduleTypesenseSync() {
  const cronEvery2Hours = '0 */2 * * *';
  const jobName = 'typesense-leetcode-questions-sync-job';

  await bullMQService.addRepeatedJob(
    BULLMQQUEUES.TYPSENSE_LEETCODE_QUESTIONS_SYNC,
    jobName,
    cronEvery2Hours,
  );

  console.info('Typesense sync job scheduled for every 2 hours.');
}

export const initializeBullMQCandidatesTypesenseSync = async () => {
  await bullMQService.createWorker(
    BULLMQQUEUES.TYPSENSE_CANDIDATES_SYNC,
    async (job) => {
      console.info('Starting Candidates Typesense Sync:', job.id);
      try {
        try {
          await sensiSearch.getCollection(TYPSENSE_COLLECTION_NAME.CANDIDATES);
        } catch (err: any) {
          if (err.httpStatus === 404) {
            console.info('Candidates Collection not found, creating schema...');
            await sensiSearch.createCollection(candidateTypesenseSchema);
          } else {
            throw err;
          }
        }

        const candidates = await CandidateProfile.find({ userId: { $exists: true } }).populate('userId').lean();

        const documents = await Promise.all(candidates.map(async (c: any) => {
          const userIdStr = (c.userId?._id || c.userId).toString();
          const blogs = await CandidateBlog.find({ candidateId: userIdStr, status: 'published' }).lean();
          const blogKeywords = blogs.map(b => `${b.title} ${b.blogKeywords.join(' ')} ${b.content}`).join(' ');

          return {
            id: c._id.toString(),
            userId: userIdStr,
            fullName: c.userId?.fullName || '',
            email: c.userId?.email || '',
            skills: c.skills || [],
            experience: Number(c.experience || 0),
            bio: c.bio || '',
            blogKeywords,
          };
        }));

        if (documents.length > 0) {
          await sensiSearch.importCollection(documents, TYPSENSE_COLLECTION_NAME.CANDIDATES).catch((err: any) => {
            if (err?.importResults) {
              const printList = err.importResults.filter((item: any) => item.success !== true);
              console.error('[BullMQ Candidates] importResults', printList);
            }
          });
          console.info(`Successfully synced ${documents.length} candidates to Typesense.`);
        }
      } catch (error) {
        console.error('Candidates Typesense Sync Failed:', error);
        throw error;
      }
    },
  );
};

export async function scheduleCandidatesTypesenseSync() {
  const cronEvery2Hours = '0 */2 * * *';
  const jobName = 'typesense-candidates-sync-job';

  await bullMQService.addRepeatedJob(
    BULLMQQUEUES.TYPSENSE_CANDIDATES_SYNC,
    jobName,
    cronEvery2Hours,
  );

  console.info('Typesense candidates sync job scheduled for every 2 hours.');
}

// other Usage
// await bullMQService.addDelayedJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, 'sms-emergency-contacts', { IMEI: imei, title: commsTemplate.appTitle, message: appContent }, 3 * 60 * 1000, jobId);
// const job = await bullMQService.getJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, args.jobId);
// bullMQService.removeJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, args.jobId);
// await bullMQService.addJob(bullMQQueues.NOTIFICATION_FALL_DETECTION_QUEUE, job.name, job.data, { removeOnComplete: true, removeOnFail: true, attempts: 2, jobId: job.id });
