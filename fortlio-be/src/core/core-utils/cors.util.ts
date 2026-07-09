import cors from 'cors';

export const corsOptionsDelegate = (req: any, callback: (err: Error | null, options?: cors.CorsOptions) => void) => {
  const origin = req.header('Origin') || '';
  const env = process.env.APP_ENV || 'DEV';

  let domainMatch: RegExp;
  if (env.toLowerCase() === 'local') {
    domainMatch = /^https:\/\/fortlio\.duckdns\.com$/;
  } else if (env.toLowerCase() === 'stage') {
    domainMatch = /^https:\/\/fortlio\.duckdns\.com$/;
  } else {
    domainMatch = new RegExp(`^https://fortlio\\.${env.toLowerCase()}\\.duckdns\\.com$`);
  }
  const localhostMatch = /^http:\/\/localhost:\d+$/;

  const isAllowed =
    localhostMatch.test(origin) ||
    domainMatch.test(origin);

  callback(null, {
    origin: isAllowed ? origin : undefined,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, apollo-require-preflight',
    maxAge: 86400,
    // sameSite: 'None',
    // secure: true,
  });
};

