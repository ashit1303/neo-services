import { BUN_ENVIRONMENTS } from '../src/core/core-constants/enum.constants';
import { Config } from '../src/interface/common.interface';

const ALLOWED_ENVS = ['dev', 'prod', 'local'] as const;
const rawEnv = (process.env.BUN_ENV || 'local').toLowerCase();
const env = ALLOWED_ENVS.includes(rawEnv as any) ? rawEnv : 'local';
const AWS_SECRET_NAME = `${env}/testing`;
console.info('BUN_ENV', process.env.BUN_ENV);
export const config: Config = {
  port: Number(process.env.PORT || 4020),
  env,
  appEnv: env.toUpperCase() as BUN_ENVIRONMENTS,
  awsRegion: process.env.AWS_REGION || 'ap-south-1',
  awsSecretName: AWS_SECRET_NAME,
};
