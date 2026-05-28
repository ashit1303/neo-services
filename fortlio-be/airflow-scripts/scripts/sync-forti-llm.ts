import { config } from '../../config';
import { SecretManager } from '../../src/core/core-clients/secret-manager.client';
import { getProductsPipeline, getDbClient, getS3Client, syncKnowledgeBase, syncFolderToS3, updateFileWithPayload } from './helper/sync-obi-llm-helper';
const secretManager = new SecretManager(config);

// Main backup flow
const main = async () => {
  try {
    const secrets = await secretManager.fetchAll();
    const dbClient = await getDbClient(secrets);
    const s3Client = await getS3Client(secrets);

    const product = await dbClient.collection('products').aggregate(getProductsPipeline).toArray();
    // @TODO UPDATE knowledge base files
    updateFileWithPayload(product);

    await syncFolderToS3(s3Client, secrets.AWS_BACKUP_BUCKET, '../obi-markdown-knowledge-base/', 'obi-markdown-knowledge-base/');
    await syncKnowledgeBase(secrets);
    console.info('Successfully sync knowledge base');
  } catch (error: any) {
    console.error('Backup process failed:', error);
    process.exit(1);
  }
};

// Run the main function
main();

// Handle process termination
process.on('SIGINT', () => {
  console.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

