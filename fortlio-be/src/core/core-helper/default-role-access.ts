
const accessUserAnalytics = [
  {
    'code': 'getUser',
    'name': 'Get User',
    'description': 'Get User',
    'tag': ['user'],
  },
];

const accessShortener = [
  {
    'code': 'createShortUrl',
    'name': 'Create Short URL',
    'description': 'Allows creation of short URLs',
    'tag': ['shortener'],
  },
  {
    'code': 'isAvailable',
    'name': 'Is Alias Available',
    'description': 'Check if short code alias is available',
    'tag': ['shortener'],
  },
];

const accessCandidate = [
  {
    code: 'upsertCandidateProfile',
    name: 'Upsert Candidate Profile',
    description: 'Allows candidate to upsert profile',
    tag: ['candidate'],
  },
  {
    code: 'getCandidateProfile',
    name: 'Get Candidate Profile',
    description: 'Allows fetching of candidate profile',
    tag: ['candidate'],
  },
  {
    code: 'createCandidateBlog',
    name: 'Create Candidate Blog',
    description: 'Allows candidate to create blogs',
    tag: ['candidate'],
  },
];

const accessHr = [
  {
    code: 'upsertHrProfile',
    name: 'Upsert HR Profile',
    description: 'Allows HR to upsert profile',
    tag: ['hr'],
  },
  {
    code: 'getHrProfile',
    name: 'Get HR Profile',
    description: 'Allows fetching of HR profile',
    tag: ['hr'],
  },
  {
    code: 'searchCandidates',
    name: 'Search Candidates',
    description: 'Allows HR to search candidate profiles',
    tag: ['hr'],
  },
  {
    code: 'getViewedProfiles',
    name: 'Get Viewed Profiles History',
    description: 'Allows HR to view profile view history',
    tag: ['hr'],
  },
  {
    code: 'getSearches',
    name: 'Get Search History',
    description: 'Allows HR to view search history',
    tag: ['hr'],
  },
];

const accessConnection = [
  {
    code: 'createConnection',
    name: 'Create Connection',
    description: 'Allows initiating a connection request',
    tag: ['connection'],
  },
  {
    code: 'respondToConnection',
    name: 'Respond to Connection',
    description: 'Allows accepting/rejecting a connection request',
    tag: ['connection'],
  },
  {
    code: 'listConnections',
    name: 'List Connections',
    description: 'Allows listing user connections',
    tag: ['connection'],
  },
  {
    code: 'sendMessage',
    name: 'Send Chat Message',
    description: 'Allows sending chat messages',
    tag: ['chat'],
  },
  {
    code: 'getChatHistory',
    name: 'Get Chat History',
    description: 'Allows retrieving chat history',
    tag: ['chat'],
  },
  {
    code: 'listNotifications',
    name: 'List Notifications',
    description: 'Allows retrieving user notifications',
    tag: ['notification'],
  },
  {
    code: 'markNotificationAsRead',
    name: 'Mark Notification as Read',
    description: 'Allows marking a notification as read',
    tag: ['notification'],
  },
];

const privilegesAnalytics = [
  ...accessUserAnalytics,
  ...accessShortener,
  ...accessCandidate,
  ...accessHr,
  ...accessConnection,
];

export const privilegesAllDefault = [
  ...privilegesAnalytics,
];

export const candidateDefaultAccess = [
  'createShortUrl',
  'isAvailable',
  'upsertCandidateProfile',
  'getCandidateProfile',
  'getHrProfile',
  'createCandidateBlog',
  'createConnection',
  'respondToConnection',
  'listConnections',
  'sendMessage',
  'getChatHistory',
  'listNotifications',
  'markNotificationAsRead',
];

export const hrDefaultAccess = [
  'createShortUrl',
  'isAvailable',
  'upsertHrProfile',
  'getCandidateProfile',
  'getHrProfile',
  'searchCandidates',
  'getViewedProfiles',
  'getSearches',
  'createConnection',
  'respondToConnection',
  'listConnections',
  'sendMessage',
  'getChatHistory',
  'listNotifications',
  'markNotificationAsRead',
];

