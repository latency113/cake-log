import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { getDbParams } from "@/shared/utils/db-utils";
import { CakeSettingsRepository } from "@/features/repository/CakeSettings/CakeSettings.repository";

const getSecurityKey = async (): Promise<string> => {
  const settings = await CakeSettingsRepository.getCakeSettings();
  return settings?.securityKey || process.env.RESTORE_KEY || "admin1234";
};

const findPgTool = (toolName: string): string => {
  // 1. Check environment variables for explicit path definition
  const envVarName = toolName === 'pg_dump' ? 'PG_DUMP_PATH' : 'PSQL_PATH';
  const envPath = process.env[envVarName];
  console.log(`findPgTool: Checking env var ${envVarName}:`, envPath);
  if (envPath) {
    return `"${envPath}"`;
  }

  // 2. Check common paths (Restore fallback for local dev)
  const commonPaths = [
    `/Applications/Postgres.app/Contents/Versions/latest/bin/${toolName}`,
    `/opt/homebrew/bin/${toolName}`,
    `/usr/local/bin/${toolName}`,
    `/usr/bin/${toolName}`,
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      console.log(`findPgTool: Found tool at ${p}`);
      return `"${p}"`;
    }
  }

  // 3. Fallback to system PATH
  console.log(`findPgTool: Falling back to system PATH for ${toolName}`);
  return toolName;
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

export const performRestore = async (fileName?: string, key?: string): Promise<string> => {
  const restoreKey = await getSecurityKey();
  if (key !== restoreKey) {
    throw new Error("Invalid security key for restoration.");
  }

  const { user, password, name, host, port } = getDbParams();

  const backupsDir = path.join(process.cwd(), "backups");
  let targetFile: string;

  if (fileName) {
    targetFile = path.join(backupsDir, fileName);
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Backup file not found: ${fileName}`);
    }
  } else {
    // Find the latest .sql backup file
    const backupFiles = fs
      .readdirSync(backupsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()
      .reverse();

    if (backupFiles.length === 0) {
      throw new Error("No PostgreSQL backup found in the 'backups' directory.");
    }
    targetFile = path.join(backupsDir, backupFiles[0]);
  }

  const psqlPath = findPgTool('psql');
  
  // 1. Clean the database
  const cleanCommand = `PGPASSWORD=${password} ${psqlPath} -h ${host} -p ${port} -U ${user} -d ${name} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
  
  await new Promise((resolve, reject) => {
    console.log(`Executing Clean Command on ${name}...`);
    exec(cleanCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Clean failed: ${error}`);
        reject(new Error(`Database clean failed: ${error.message}\n${stderr}`));
        return;
      }
      if (stderr) console.warn(`Clean stderr: ${stderr}`);
      resolve(stdout);
    });
  });

  // 2. Restore from backup
  const restoreCommand = `PGPASSWORD=${password} ${psqlPath} -h ${host} -p ${port} -U ${user} -d ${name} -f "${targetFile}"`;

  return new Promise((resolve, reject) => {
    console.log(`Executing Restore Command from ${targetFile}...`);
    exec(restoreCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Restore failed: ${error}`);
        reject(new Error(`Database restore failed: ${error.message}\n${stderr}`));
        return;
      }
      if (stderr) console.warn(`Restore stderr: ${stderr}`);
      
      try {
        console.log("Running Prisma Migrations...");
        await runMigrations();
        resolve(`PostgreSQL restore successful from ${path.basename(targetFile)} and migrations applied!`);
      } catch (migrationError: any) {
        console.error("Migration failed:", migrationError);
        reject(new Error(`Restore successful but migration failed: ${migrationError.message}`));
      }
    });
  });
};

export const performRestorePrePromotion = async (key?: string): Promise<string> => {
  const restoreKey = await getSecurityKey();
  if (key !== restoreKey) {
    throw new Error("Invalid security key for restoration.");
  }

  const { user, password, name, host, port } = getDbParams();

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

  const psqlPath = findPgTool('psql');
  
  // 1. Clean the database
  const cleanCommand = `PGPASSWORD=${password} ${psqlPath} -h ${host} -p ${port} -U ${user} -d ${name} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
  
  await new Promise((resolve, reject) => {
    console.log("Executing Clean Command...");
    exec(cleanCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`Clean failed: ${error}`);
        reject(new Error(`Database clean failed: ${error.message}\n${stderr}`));
        return;
      }
      if (stderr) console.warn(`Clean stderr: ${stderr}`);
      resolve(stdout);
    });
  });

  // 2. Restore from backup
  const restoreCommand = `PGPASSWORD=${password} ${psqlPath} -h ${host} -p ${port} -U ${user} -d ${name} -f "${latestBackupFile}"`;

  return new Promise((resolve, reject) => {
    console.log("Executing Restore Command...");
    exec(restoreCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Restore failed: ${error}`);
        reject(new Error(`Database restore failed: ${error.message}\n${stderr}`));
        return;
      }
      if (stderr) console.warn(`Restore stderr: ${stderr}`);
      
      try {
        console.log("Running Prisma Migrations...");
        await runMigrations();
        resolve(`PostgreSQL restore successful from ${latestBackupFile} and migrations applied!`);
      } catch (migrationError: any) {
        console.error("Migration failed:", migrationError);
        reject(new Error(`Restore successful but migration failed: ${migrationError.message}`));
      }
    });
  });
};

const runMigrations = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec("bun x prisma migrate deploy", (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${error}`);
        reject(error);
        return;
      }
      if (stderr) console.warn(`Migration stderr: ${stderr}`);
      console.log(`Migration stdout: ${stdout}`);
      resolve();
    });
  });
};

export const getBackupFilePath = async (fileName: string, key?: string): Promise<string> => {
  const restoreKey = await getSecurityKey();
  if (key !== restoreKey) {
    throw new Error("Invalid security key.");
  }

  const backupsDir = path.join(process.cwd(), "backups");
  const targetFile = path.join(backupsDir, fileName);

  if (!fs.existsSync(targetFile)) {
    throw new Error(`Backup file not found: ${fileName}`);
  }

  // Security check: ensure the file is within the backups directory
  const relative = path.relative(backupsDir, targetFile);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error("Invalid backup file path.");
  }

  return targetFile;
};

