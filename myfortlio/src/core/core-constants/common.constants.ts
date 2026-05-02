export const ACCESSTOKEN_EXPIRY = {
  prod: 18000,
  dev: 172800,
};

export const FILTER_CONSTANTS = {
  page: 1,
  limit: 50,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  skip: 0,
  fromDate: '',
  toDate: '',
};
export const KAKFA_TOPICS = {
  BASE_TOPIC: 'prod.resume.digitize',// topic name to follow `${env}.${team}.${service}` pattern
};
