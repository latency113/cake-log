export const getDbParams = () => {
  let dbUser = process.env.POSTGRES_USER;
  let dbPassword = process.env.POSTGRES_PASSWORD;
  let dbName = process.env.POSTGRES_DB;
  let dbHost = process.env.POSTGRES_HOST;
  let dbPort = process.env.POSTGRES_PORT;

  if (process.env.DATABASE_URL) {
    try {
      if (process.env.DATABASE_URL.startsWith('postgresql://') || process.env.DATABASE_URL.startsWith('postgres://')) {
        const url = new URL(process.env.DATABASE_URL);
        dbUser = dbUser || url.username;
        dbPassword = dbPassword || decodeURIComponent(url.password);
        dbHost = dbHost || url.hostname;
        dbPort = dbPort || url.port;
        const pathName = url.pathname.split('/')[1];
        dbName = dbName || (pathName ? pathName.split('?')[0] : undefined);
      }
    } catch (e) {
      console.error('Failed to parse DATABASE_URL:', e);
    }
  }

  return {
    user: dbUser || 'postgres',
    password: dbPassword || '',
    name: dbName || 'postgres',
    host: dbHost || 'localhost',
    port: dbPort || '5432',
  };
};
