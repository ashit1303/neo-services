export const ACCESSTOKEN_EXPIRY = {
  prod: 18000,
  dev: 172800,
};

export const FILTER_CONSTANTS = {
  page: '1',
  pageSize: '10',
  sortBy: 'createdAt',
  sortOrder: 'desc',
  fromDate: '',
  toDate: '',
};
export const KAKFA_TOPICS = {
  BASE_TOPIC: 'prod.resume.digitize',// topic name to follow `${env}.${team}.${service}` pattern
};

export const BYPASS_USERS = [
  '685e4804fc6d967bc247f83b',
  '685e4f5b2c84495bb30b87cb',
];

export const BULLMQQUEUES = {
  NOTIFICATION_FALL_DETECTION_QUEUE: 'notification-fall-detection-queue',
};

export const EMAIL_SEND_FROM = 'noreply@obenelectric.com';