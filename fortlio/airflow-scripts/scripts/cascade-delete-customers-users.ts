const rawNumbers = `
917799891988
917999826051`;

import { config } from '../../config';
import { MongoDBClient } from '../../src/core/core-clients/mongodb.client';
const mongoClient = new MongoDBClient(config);
async function run() {

  try {
    const db = await mongoClient.connect();
    const usersCollection = db.collection('users');
    const customersCollection = db.collection('customers');

    const mobileNumbers = rawNumbers
      .split('\n')
      .map(num => num.trim())
      .filter(Boolean);

    const userIds = await usersCollection.distinct('_id', { mobileNumber: { $in: mobileNumbers } });
    console.info('Found Users:', userIds.length);

    if (!userIds.length) {
      console.info('No users found. Exiting.');
      return;
    }
    const session = await mongoClient.startSession();
    await session.withTransaction(async () => {
      const customerDeleteResult = await customersCollection.deleteMany({ userId: { $in: userIds } }, { session });
      console.info('Customers deleted:', customerDeleteResult.deletedCount);
      const userDeleteResult = await usersCollection.deleteMany({ _id: { $in: userIds } }, { session });
      console.info('Users deleted:', userDeleteResult.deletedCount);
    });

    console.info('Transaction completed');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoClient.close();
  }
}

run();