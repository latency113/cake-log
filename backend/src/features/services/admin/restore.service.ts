import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFile } from "child_process";
import { runPgTool } from "./backup.service";
import { getDbParams } from "@/shared/utils/db-utils";
import { getAcademicYear } from "@/providers/database/database.context";
import { CakeSettingsRepository } from "@/features/repository/CakeSettings/CakeSettings.repository";

export const isKeyValid = async (key?: string): Promise<boolean> => {
  if (!key || typeof key !== "string") return false;
  const trimmed = key.trim();
  if (!trimmed) return false;

  const settings = await CakeSettingsRepository.getCakeSettings();
  const configuredKey = settings?.securityKey?.trim();
  const envKey = process.env.RESTORE_KEY?.trim();

  if (!configuredKey && !envKey) {
    throw new Error("Security key is not configured in the system.");
  }

  // Timing-safe comparison: compare SHA-256 digests so key length is not leaked
  const candidate = crypto.createHash("sha256").update(trimmed).digest();
  const matches = (expected?: string) => {
    if (!expected) return false;
    const expectedBuf = crypto.createHash("sha256").update(expected).digest();
    return crypto.timingSafeEqual(candidate, expectedBuf);
  };

  return matches(configuredKey) || matches(envKey);
};

// Only allow plain backup file names — no separators, no traversal
const isValidBackupFileName = (fileName: string): boolean =>
  /^[A-Za-z0-9][A-Za-z0-9._-]*\.sql$/.test(fileName) && !fileName.includes("..");

// Resolve a file inside backupsDir and assert containment (anti path traversal)
const resolveBackupFile = (backupsDir: string, fileName: string): string => {
  const targetFile = path.resolve(backupsDir, fileName);
  const relative = path.relative(path.resolve(backupsDir), targetFile);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid backup file path.");
  }
  return targetFile;
};

export const listBackups = async (): Promise<string[]> => {
  const backupsDir = path.join(process.cwd(), "backups");
  if (!fs.existsSync(backupsDir)) {
    return [];
  }
  return fs
    .readdirSync(backupsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort()
    .reverse();
};

const cleanSchema = async (dbParams: {
  user: string;
  password: string;
  host: string;
  port: string | number;
  name: string;
}): Promise<void> => {
  await runPgTool(
    "psql",
    [
      "-h", String(dbParams.host),
      "-p", String(dbParams.port),
      "-U", dbParams.user,
      "-d", dbParams.name,
      "-c", "DROP SCHEMA public CASCADE; CREATE SCHEMA public;",
    ],
    dbParams,
  );
};

const restoreFromFile = async (
  dbParams: { user: string; password: string; host: string; port: string | number; name: string },
  targetFile: string,
): Promise<void> => {
  // --set ON_ERROR_STOP=1 to catch internal SQL errors
  await runPgTool(
    "psql",
    [
      "-h", String(dbParams.host),
      "-p", String(dbParams.port),
      "-U", dbParams.user,
      "-d", dbParams.name,
      "--set", "ON_ERROR_STOP=1",
      "-f", targetFile,
    ],
    dbParams,
  );
};

export const performRestore = async (fileName?: string, key?: string): Promise<string> => {
  if (!(await isKeyValid(key))) {
    throw new Error("Invalid security key for restoration.");
  }

  const currentYear = getAcademicYear();
  const { user, password, name, host, port } = getDbParams(currentYear);
  const dbParams = { user, password, host, port, name };

  const backupsDir = path.join(process.cwd(), "backups");
  let targetFile: string;

  if (fileName) {
    if (!isValidBackupFileName(fileName)) {
      throw new Error("Invalid backup file name.");
    }
    targetFile = resolveBackupFile(backupsDir, fileName);
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Backup file not found: ${fileName}`);
    }
  } else {
    // Find the latest .sql backup file for the current year, or latest overall
    const allFiles = fs
      .readdirSync(backupsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .reverse();

    if (allFiles.length === 0) {
      throw new Error("No PostgreSQL backup found in the 'backups' directory.");
    }
    const yearMatchingFiles = currentYear ? allFiles.filter(f => f.includes(currentYear)) : [];
    targetFile = path.join(backupsDir, yearMatchingFiles[0] || allFiles[0]);
  }

  console.log(`Executing Clean Command on ${name}...`);
  await cleanSchema(dbParams);

  console.log(`Executing Restore Command to ${name} from ${targetFile}...`);
  try {
    await restoreFromFile(dbParams, targetFile);
  } catch (error: any) {
    console.error(`Restore failed: ${error}`);
    throw new Error(`Database restore failed: ${error.message}`);
  }

  try {
    console.log(`Running Prisma Migrations on ${name}...`);
    // We try to run migrations, but if it fails with "already exists" errors,
    // it often means the schema is already correct from the restore.
    try {
      await runMigrations(name);
    } catch (migrationError: any) {
      console.warn("Migration warning (might be non-critical if schema is already up to date):", migrationError.message);
      // If the error is about already existing objects (like 'Role'), we consider the restore successful
      if (migrationError.message.includes("already exists") || migrationError.message.includes("P3018")) {
        console.log("Detected existing schema objects, skipping migration sync but continuing...");
      } else {
        throw migrationError;
      }
    }
    return `PostgreSQL restore successful to ${name} from ${path.basename(targetFile)}`;
  } catch (migrationError: any) {
    console.error("Migration failed:", migrationError);
    throw new Error(`Restore successful but migration failed: ${migrationError.message}`);
  }
};

export const performRestorePrePromotion = async (key?: string): Promise<string> => {
  if (!(await isKeyValid(key))) {
    throw new Error("Invalid security key for restoration.");
  }

  const currentYear = getAcademicYear();
  const { user, password, name, host, port } = getDbParams(currentYear);
  const dbParams = { user, password, host, port, name };

  const backupsDir = path.join(process.cwd(), "backups");

  // Find the latest .sql backup file with PRE_PROMOTION tag
  const backupFiles = fs
    .readdirSync(backupsDir)
    .filter((file) => file.endsWith("_PRE_PROMOTION.sql"))
    .sort()
    .reverse();

  if (backupFiles.length === 0) {
    throw new Error("No 'PRE_PROMOTION' backup found in the 'backups' directory.");
  }

  const latestBackupFile = path.join(backupsDir, backupFiles[0]);
  console.log(`Restoring from: ${latestBackupFile}`);

  console.log(`Executing Clean Command on ${name}...`);
  await cleanSchema(dbParams);

  console.log(`Executing Restore Command to ${name}...`);
  try {
    await restoreFromFile(dbParams, latestBackupFile);
  } catch (error: any) {
    console.error(`Restore failed: ${error}`);
    throw new Error(`Database restore failed: ${error.message}`);
  }

  try {
    console.log(`Running Prisma Migrations on ${name}...`);
    await runMigrations(name);
    return `PostgreSQL restore successful to ${name} from ${latestBackupFile} and migrations applied!`;
  } catch (migrationError: any) {
    console.error("Migration failed:", migrationError);
    throw new Error(`Restore successful but migration failed: ${migrationError.message}`);
  }
};

const runMigrations = (dbName: string): Promise<void> => {
  const originalUrl = process.env.DATABASE_URL;
  if (!originalUrl) throw new Error("DATABASE_URL is not set");

  const urlObj = new URL(originalUrl);
  urlObj.pathname = `/${dbName}`;
  const migrationUrl = urlObj.toString();

  return new Promise((resolve, reject) => {
    // No shell: DATABASE_URL passed via env, argv as array
    execFile(
      "bun",
      ["x", "prisma", "migrate", "deploy"],
      { env: { ...process.env, DATABASE_URL: migrationUrl } },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Migration error: ${error}`);
          reject(error);
          return;
        }
        if (stderr) console.warn(`Migration stderr: ${stderr}`);
        console.log(`Migration stdout: ${stdout}`);
        resolve();
      },
    );
  });
};

export const getBackupFilePath = async (fileName: string, key?: string): Promise<string> => {
  if (!(await isKeyValid(key))) {
    throw new Error("Invalid security key.");
  }

  const backupsDir = path.join(process.cwd(), "backups");
  const targetFile = resolveBackupFile(backupsDir, fileName);

  if (!fs.existsSync(targetFile)) {
    throw new Error(`Backup file not found: ${fileName}`);
  }

  return targetFile;
};
