import { PrismaClient } from "./generated/client";

const clients = new Map<string, PrismaClient>();

/**
 * Validates and normalizes an academic year identifier.
 * Ensures the year is safe to use in database connection strings.
 */
const sanitizeYear = (year?: string): string | undefined => {
  if (!year || year === "current") {
    return undefined;
  }
  const trimmed = year.trim();
  // Only accept alphanumeric characters and underscore/hyphen to prevent URL injection
  if (!/^[a-zA-Z0-9_-]{1,20}$/.test(trimmed)) {
    return undefined;
  }
  return trimmed;
};

export const getClient = (requestedYear?: string): PrismaClient => {
  const year = sanitizeYear(requestedYear);

  // If no specific year requested, return the default database client
  if (!year) {
    if (!clients.has("default")) {
      const client = new PrismaClient();
      clients.set("default", client);
    }
    return clients.get("default")!;
  }

  // Return cached client if available
  if (clients.has(year)) {
    return clients.get(year)!;
  }

  // Build year-specific database connection URL
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  let newUrl: string;
  try {
    const urlObj = new URL(originalUrl);
    const dbName = urlObj.pathname.split("/")[1];
    const newDbName = `${dbName}_${year}`;
    urlObj.pathname = `/${newDbName}`;
    newUrl = urlObj.toString();
  } catch (e) {
    console.error(`[ConnectionManager] Failed to construct URL for year ${year}, falling back to default`, e);
    return getClient();
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: newUrl,
      },
    },
  });

  clients.set(year, client);
  return client;
};

export const disconnectAllClients = async (): Promise<void> => {
  for (const [key, client] of clients.entries()) {
    try {
      await client.$disconnect();
    } catch (e) {
      console.error(`[ConnectionManager] Error disconnecting client ${key}`, e);
    }
  }
  clients.clear();
};

export const getAllDatabaseClients = async (): Promise<PrismaClient[]> => {
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) return [getClient()];

  try {
    const urlObj = new URL(originalUrl);
    const dbName = urlObj.pathname.split("/")[1];
    const defaultClient = getClient();
    const rows = await defaultClient.$queryRawUnsafe<{ datname: string }[]>(
      `SELECT datname FROM pg_database WHERE datname LIKE '${dbName}_%' OR datname = '${dbName}'`
    );

    const clientList: PrismaClient[] = [];
    for (const row of rows) {
      const parts = row.datname.split("_");
      const yearKey = row.datname === dbName ? undefined : parts[parts.length - 1];
      clientList.push(getClient(yearKey));
    }
    return clientList;
  } catch (error) {
    console.error("[ConnectionManager] Failed to get all database clients, fallback to default", error);
    return [getClient()];
  }
};

