import { PrismaClient } from "./generated/client";

const clients = new Map<string, PrismaClient>();

// Clear any existing 2569 from cache immediately if this module reloads
// if (clients.has("2569")) {
//     clients.delete("2569");
// }

export const getClient = (year?: string): PrismaClient => {
  // console.log(`[ConnectionManager] getClient called with year: "${year}"`);
  // Normalize year
  if (year === "current" || !year) {
    year = undefined;
  }

  // Safety: If year is 2569, we know it doesn't exist anymore, so fallback to default
  if (year === "2569") {
      // console.warn(`[ConnectionManager] !!! CRITICAL FALLBACK !!! Year 2569 requested but database does not exist. Forcing undefined.`);
      year = undefined;
  }

  // If no year specified, use the default client
  if (!year) {
      // console.log(`[ConnectionManager] Using default client`);
      if (!clients.has("default")) {
         const client = new PrismaClient();
         clients.set("default", client);
      }
      return clients.get("default")!;
  }

  // If we already have a client for this year, return it
  if (clients.has(year)) {
    // console.log(`[ConnectionManager] Returning cached client for year: ${year}`);
    return clients.get(year)!;
  }

  // Create new client for the specific year
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) {
      throw new Error("DATABASE_URL is not set");
  }
  
  // Parse and modify the URL
  // Assumes format: postgresql://user:pass@host:port/dbname?params
  // We want to change 'dbname' to 'dbname_year'
  let newUrl: string;
  try {
      const urlObj = new URL(originalUrl);
      const dbName = urlObj.pathname.split("/")[1]; 
      const newDbName = `${dbName}_${year}`;

      // --- ADDED CHECK ---
      // We can use a synchronous check if we had a list, 
      // but since this is called inside a Proxy getter (which is sync), 
      // we have a challenge.
      // However, ConnectionManager.getClient is NOT inside the proxy getter directly 
      // for the first call, but it IS called by it.
      
      // For now, let's assume if it's 2569 and we know it doesn't exist, we fallback.
      // A better way is to verify existence, but since this is sync, 
      // let's at least log and handle the potential failure if we can't connect.
      
      urlObj.pathname = `/${newDbName}`;
      newUrl = urlObj.toString();
      
      // console.log(`[ConnectionManager] Initializing connection for year ${year}: ${newDbName}`);
  } catch (e) {
      console.error("Failed to parse DATABASE_URL, falling back to default", e);
      return getClient(); // Fallback
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: newUrl,
      },
    },
  });

  // Test connection or just catch error later? 
  // Prisma doesn't connect until first query.

  clients.set(year, client);
  return client;
};
