import { PrismaClient } from "../../../providers/database/generated/client"; // Import directly
import { $ } from "bun";
import { getAcademicYear } from "../../../providers/database/database.context";

export namespace InitYearService {
  // Helper to get a raw client connected to the default DB
  const getAdminClient = () => {
    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) throw new Error("DATABASE_URL is not set");

    return new PrismaClient({
      datasources: {
        db: {
          url: originalUrl,
        },
      },
    });
  };

  // Helper to get a raw client connected to the NEW DB
  const getTargetYearClient = (year: string) => {
    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) throw new Error("DATABASE_URL is not set");

    const urlObj = new URL(originalUrl);
    const dbName = urlObj.pathname.split("/")[1];
    const newDbName = `${dbName}_${year}`;
    urlObj.pathname = `/${newDbName}`;
    const newUrl = urlObj.toString();

    return new PrismaClient({
      datasources: {
        db: {
          url: newUrl,
        },
      },
    });
  };

  export const getAvailableYears = async () => {
    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) throw new Error("DATABASE_URL is not set");

    const urlObj = new URL(originalUrl);
    const dbName = urlObj.pathname.split("/")[1];

    const client = getAdminClient();

    try {
      const databases = await client.$queryRawUnsafe<{ datname: string }[]>(
        `SELECT datname FROM pg_database WHERE datname LIKE '${dbName}_%' OR datname = '${dbName}' ORDER BY datname DESC`,
      );

      const years = databases
        // @ts-ignore
        .map((db: any) => {
          const name = db.datname as string;
          if (name === dbName) return { year: "current", name };
          const parts = name.split("_");
          const year = parts[parts.length - 1];
          return { year, name };
        })
        .filter((y) => !isNaN(Number(y.year)))
        .map((y) => y.year)
        .sort((a, b) => Number(b) - Number(a));

      return years;
    } catch (error) {
      console.error("Failed to list databases:", error);
      return [];
    } finally {
      await client.$disconnect();
    }
  };

  export const initializeYear = async (year: string) => {
    console.log(`[InitYearService] Starting initialization for year ${year}`);

    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) throw new Error("DATABASE_URL is not set");

    const urlObj = new URL(originalUrl);
    const dbName = urlObj.pathname.split("/")[1];
    const newDbName = `${dbName}_${year}`;

    const adminClient = getAdminClient();

    try {
      console.log(
        `[InitYearService] Checking for existing database ${newDbName}...`,
      );
      const existsQuery = await adminClient.$queryRawUnsafe<
        { count: number }[]
      >(`SELECT 1 as count FROM pg_database WHERE datname='${newDbName}'`);

      // @ts-ignore
      if (existsQuery.length > 0) {
        console.log(
          `[InitYearService] Database ${newDbName} already exists. Dropping it...`,
        );
        // Terminate any active connections
        await adminClient.$queryRawUnsafe(
          `SELECT pg_terminate_backend(pg_stat_activity.pid)
                 FROM pg_stat_activity
                 WHERE pg_stat_activity.datname = '${newDbName}'
                 AND pid <> pg_backend_pid();`,
        );
        // Drop the database
        await adminClient.$queryRawUnsafe(`DROP DATABASE "${newDbName}"`);
        console.log(`[InitYearService] Database ${newDbName} dropped.`);
      }

      console.log(`[InitYearService] Creating database ${newDbName}...`);
      await adminClient.$queryRawUnsafe(`CREATE DATABASE "${newDbName}"`);
    } catch (e) {
      throw new Error(`Failed to create DB: ${e}`);
    } finally {
      await adminClient.$disconnect();
    }

    // 2. Run DB Migration (migrate deploy)
    console.log(`[InitYearService] Pushing schema to ${newDbName}...`);

    const migrationUrlObj = new URL(originalUrl);
    migrationUrlObj.pathname = `/${newDbName}`;
    const newUrl = migrationUrlObj.toString();

    try {
      // Use 'migrate deploy' to apply all pending migrations
      // This is safer and more consistent than 'db push' for existing migration history
      // Explicitly point to the schema file and use 'bun x' to ensure prisma is found
      await $`DATABASE_URL=${newUrl} bun x prisma migrate deploy --schema ./prisma/schema.prisma`;

      console.log("DB Migration successful.");
    } catch (error: any) {
      console.error(`[InitYearService] DB Migration failed:`, error);

      // Detailed logging to file
      const debugLog = `
Timestamp: ${new Date().toISOString()}
Error Message: ${error.message}
Exit Code: ${error.exitCode}
Stdout: 
${error.stdout?.toString() || "(empty)"}
Stderr: 
${error.stderr?.toString() || "(empty)"}
        `;

      await Bun.write("migration_error.log", debugLog);

      throw new Error(`Failed to migrate schema: ${error.message}`);
    }

    // 3. Copy reference data

    const currentContextYear = getAcademicYear();

    let sourceClient;

    let sourceDbLogName = "";

    // Force default DB as source if current context is 2569

    if (
      currentContextYear &&
      currentContextYear !== "current" &&
      currentContextYear !== year &&
      currentContextYear !== "2569"
    ) {
      console.log(
        `[InitYearService] Detected active year context: ${currentContextYear}. Using it as source.`,
      );

      sourceClient = getTargetYearClient(currentContextYear);

      sourceDbLogName = `${dbName}_${currentContextYear}`;
    } else {
      const reason =
        currentContextYear === "2569"
          ? "context is 2569 (invalid)"
          : "no valid active year context";

      console.log(
        `[InitYearService] Using default admin DB (${dbName}) as source because ${reason}.`,
      );

      sourceClient = getAdminClient();
      sourceDbLogName = dbName;
    }

    const destClient = getTargetYearClient(year);

    console.log(
      `[InitYearService] Copying reference data from ${sourceDbLogName} to ${newDbName}...`,
    );

    // Debug: Log connection info (masked)
    // For source, we need to inspect the internal URL or just rely on our logic log above.
    // Recalculate dest URL for logging
    const debugUrlObj = new URL(process.env.DATABASE_URL!);
    debugUrlObj.pathname = `/${debugUrlObj.pathname.split("/")[1]}_${year}`;
    console.log(
      `[InitYearService] Dest DB: ${debugUrlObj
        .toString()
        .replace(/:[^:@]*@/, ":***@")}`,
    );

    try {
      // Copy Departments
      const departments = await sourceClient.department.findMany();
      console.log(
        `[InitYearService] Found ${departments.length} departments in source.`,
      );
      if (departments.length > 0) {
        const result = await destClient.department.createMany({
          data: departments,
          skipDuplicates: true,
        });
        console.log(`[InitYearService] Created ${result.count} departments.`);
      }

      // Copy Teachers
      const teachers = await sourceClient.teacher.findMany();
      console.log(
        `[InitYearService] Found ${teachers.length} teachers in source.`,
      );
      if (teachers.length > 0) {
        const result = await destClient.teacher.createMany({
          data: teachers,
          skipDuplicates: true,
        });
        console.log(`[InitYearService] Created ${result.count} teachers.`);
      }

      // Copy Products
      const products = await sourceClient.product.findMany();
      console.log(
        `[InitYearService] Found ${products.length} products in source.`,
      );
      if (products.length > 0) {
        const result = await destClient.product.createMany({
          data: products,
          skipDuplicates: true,
        });
        console.log(`[InitYearService] Created ${result.count} products.`);
      }

      // Copy GradeLevels
      const gradeLevels = await sourceClient.gradeLevel.findMany();
      console.log(
        `[InitYearService] Found ${gradeLevels.length} gradeLevels in source.`,
      );
      if (gradeLevels.length > 0) {
        const result = await destClient.gradeLevel.createMany({
          data: gradeLevels,
          skipDuplicates: true,
        });
        console.log(`[InitYearService] Created ${result.count} gradeLevels.`);
      }

      // Copy Users
      const users = await sourceClient.user.findMany();
      console.log(`[InitYearService] Found ${users.length} users in source.`);
      if (users.length > 0) {
        const result = await destClient.user.createMany({
          data: users,
          skipDuplicates: true,
        });
        console.log(`[InitYearService] Created ${result.count} users.`);
      }

      // Copy CakeSettings
      const settings = await sourceClient.cakeSettings.findFirst();
      if (settings) {
        const { id, ...restSettings } = settings;
        await destClient.cakeSettings.create({
          data: {
            ...restSettings,
            academicYear: year,
            currentYear: year,
          },
        });
        console.log(`[InitYearService] Copied CakeSettings.`);
      }

      console.log(
        `[InitYearService] Initialization for year ${year} completed successfully`,
      );
      return { success: true, message: `Database ${newDbName} initialized.` };
    } catch (error) {
      console.error(`[InitYearService] Failed to copy data:`, error);
      throw new Error(`Failed to copy data: ${error}`);
    } finally {
      await sourceClient.$disconnect();
      await destClient.$disconnect();
    }
  };

  export const deleteYear = async (year: string) => {
    // (Existing Delete Logic)
    console.log(`[InitYearService] Deleting database for year ${year}`);

    const originalUrl = process.env.DATABASE_URL;
    if (!originalUrl) throw new Error("DATABASE_URL is not set");

    const urlObj = new URL(originalUrl);
    const dbName = urlObj.pathname.split("/")[1];
    const targetDbName = `${dbName}_${year}`;

    const client = getAdminClient();

    try {
      await client.$queryRawUnsafe(
        `SELECT pg_terminate_backend(pg_stat_activity.pid)
               FROM pg_stat_activity
               WHERE pg_stat_activity.datname = '${targetDbName}'
               AND pid <> pg_backend_pid();`,
      );

      await client.$queryRawUnsafe(
        `DROP DATABASE IF EXISTS "${targetDbName}";`,
      );

      console.log(
        `[InitYearService] Database ${targetDbName} deleted successfully.`,
      );
      return { success: true, message: `Database for year ${year} deleted.` };
    } catch (error: any) {
      console.error(`[InitYearService] Failed to delete database:`, error);
      throw new Error(
        `Failed to delete database for year ${year}: ${error.message}`,
      );
    } finally {
      await client.$disconnect();
    }
  };
}
