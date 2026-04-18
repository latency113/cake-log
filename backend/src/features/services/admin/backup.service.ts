import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { getDbParams } from '@/shared/utils/db-utils';
import { getAcademicYear } from '@/providers/database/database.context';

const findPgTool = (toolName: string): string => {
  // 1. Check environment variables for explicit path definition
  // Users can set PG_DUMP_PATH or PSQL_PATH in their .env file
  const envVarName = toolName === 'pg_dump' ? 'PG_DUMP_PATH' : 'PSQL_PATH';
  const envPath = process.env[envVarName];
  console.log(`findPgTool: Checking env var ${envVarName}:`, envPath);
  if (envPath) {
    return `"${envPath}"`;
  }

  // 2. Check common paths (convenience for development environments)
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

export const performBackup = async (tag?: string): Promise<string> => {
  const currentYear = getAcademicYear();
  const { user, password, name, host, port } = getDbParams(currentYear);

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  let backupFileName = `${name}_${timestamp}.sql`;
  
  if (tag) {
    backupFileName = `${name}_${timestamp}_${tag}.sql`;
  }

  const backupDir = path.join(process.cwd(), 'backups');
  const backupFilePath = path.join(backupDir, backupFileName);

  // console.log(`Backing up Database: ${host}:${port}/${name}`);
  // console.log(`Backup file: ${backupFilePath}`);

  // Ensure the backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const pgDumpPath = findPgTool('pg_dump');
  const pgDumpCommand = `PGPASSWORD=${password} ${pgDumpPath} -h ${host} -p ${port} -U ${user} -d ${name} > ${backupFilePath}`;

  return new Promise((resolve, reject) => {
    exec(pgDumpCommand, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        reject(new Error(`Backup failed: ${error.message}\n${stderr}`));
        return;
      }
      if (stderr) {
        console.warn(`pg_dump stderr: ${stderr}`);
      }
      resolve(`PostgreSQL backup successful! Saved to ${backupFilePath}`);
    });
  });
};