//BUN_ENV=prod bun run scripts/testnoti.ts

import { config } from '../../config';
import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
const configSecret = {
  apiBaseUrl: '',
  apiToken: '',
};
async function updateCFGValues(secretValue: any) {
  configSecret.apiBaseUrl = JSON.parse(secretValue.MICROSERVICE_URLS).NOTIFICATION_BASE_URL;
  configSecret.apiToken = secretValue.FLINK_ACCESSTOKEN;
}
const send = async () => {
  const inputs = {
    userId: '68e9f9879837af7022fc388b',
    message: 'Get your Oben serviced within next 239 kms for an unstoppable journey. Call us to fix an appointment, if already done, please ignore.',
    topic: '🏁Even power needs a pit stop! 🏁',
    type: 'SERVICING',
    notificationId: '691ad89e07ffa8b28e388c8f',
  };
  await triggerNotification(inputs, configSecret.apiToken, config).catch((error) => console.error('Failed to send notification', error));
};
const main = async () => {
  try {
    const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION });
    const secretValue = await JSON.parse((await secretsManager.send(new GetSecretValueCommand({ SecretId: process.env.AWS_SECRET_NAME }))).SecretString || '{}');
    await updateCFGValues(secretValue);
    await send();
  }
  catch (error: any) {
    console.error('Failed to send notification', error);
  }
};
main();