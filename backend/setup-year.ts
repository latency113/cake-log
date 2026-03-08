import { $ } from "bun";

const year = process.argv[2];
if (!year) {
  console.error("Please provide a year (e.g., 2568)");
  process.exit(1);
}

const originalUrl = process.env.DATABASE_URL;
if (!originalUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
}

const urlObj = new URL(originalUrl);
const dbName = urlObj.pathname.split("/")[1];
const newDbName = `${dbName}_${year}`;
urlObj.pathname = `/${newDbName}`;
const newUrl = urlObj.toString();

console.log(`Setting up database for year ${year}: ${newDbName}`);
console.log(`URL: ${newUrl}`);

try {
    // Run prisma migrate deploy to apply all migrations to the new database
    // The shell environment needs the new DATABASE_URL
    await $`DATABASE_URL=${newUrl} bun prisma migrate deploy`;
    console.log(`✅ Successfully set up database for ${year}`);
} catch (error) {
    console.error(`❌ Failed to set up database:`, error);
    process.exit(1);
}
