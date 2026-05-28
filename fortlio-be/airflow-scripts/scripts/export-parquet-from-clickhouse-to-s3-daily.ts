// logs to parquet
import { config } from '../../config';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { ClickHouseClient } from '../../src/core/core-clients/clickhouse.client';
import { AppError } from '../../src/core/core-utils/err-util';
const clickhouseClient = new ClickHouseClient(config);

const last4Day = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);
last4Day.setHours(0, 0, 0, 0);

const last5Days = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
last5Days.setHours(0, 0, 0, 0);
const configSecret = {
  ch_s3_role_arn: '',
  ch_logs_parquet_s3_bucket: '',
};
async function updateCFGValues(secretValue: any) {
  configSecret.ch_s3_role_arn = JSON.parse(secretValue.CLICKHOUSE_CONFIG).CH_S3_ROLE_ARN;
  configSecret.ch_logs_parquet_s3_bucket = JSON.parse(secretValue.CLICKHOUSE_CONFIG).CH_LOGS_PARQUET_BUCKET;
}
const clickhouseToS3ParquetQuery = (configSecrets: any) => `
  INSERT INTO FUNCTION s3(
      'https://${configSecrets.ch_logs_parquet_s3_bucket}.s3.amazonaws.com/parquet/logs-${last5Days.toISOString().split('T')[0]}.parquet',
      'Parquet',
      extra_credentials(role_arn = '${configSecrets.ch_s3_role_arn}')
  )
  SELECT *
  FROM logs
  WHERE packet_created_at BETWEEN
        toDateTime64('${last5Days.toISOString().split('T')[0]}', 3)
  AND toDateTime64('${last4Day.toISOString().split('T')[0]}', 3)
SETTINGS
    output_format_parquet_compression_method = 'zstd',
    output_format_compression_level = 6,
    output_format_parquet_row_group_size = 500000;

`;

const clickhouseToS3Parquet = async (): Promise<String> => {
  try {

    await clickhouseClient.execute(clickhouseToS3ParquetQuery(configSecret));

    return 'Successfully created s3 parquet from ' + last5Days + ' to ' + last4Day;;
  } catch (error: any) {
    console.error('Failed', error);
    return 'Failed';
  }
  finally {
    await clickhouseClient.close();
  }
};

const main = async () => {
  try {
    const secretsManager = new SecretsManagerClient({ region: process.env.AWS_REGION });
    const secretValue = await JSON.parse((await secretsManager.send(new GetSecretValueCommand({ SecretId: process.env.AWS_SECRET_NAME }))).SecretString || '{}');
    await updateCFGValues(secretValue);
    const output = await clickhouseToS3Parquet();
    console.info('Task Executed:', output);
    if (output === 'Failed') {
      throw new AppError('Failed');
    }
    process.exit(0);
  } catch (error: any) {
    console.error(' Failed', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.info('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

main();

