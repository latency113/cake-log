import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { getDbParams } from '@/shared/utils/db-utils';
import { getAcademicYear } from '@/providers/database/database.context';

const findPgToolPath = (toolName: string): string => {
  // 1. Check environment variables for explicit path definition
  // Users can set PG_DUMP_PATH or PSQL_PATH in their .env file
  const envVarName = toolName === 'pg_dump' ? 'PG_DUMP_PATH' : 'PSQL_PATH';
  const envPath = process.env[envVarName];
  if (envPath) {
    return envPath;
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
      return p;
    }
  }

  // 3. Fallback to system PATH (execFile resolves bare names via PATH)
  return toolName;
};

// Run a pg tool WITHOUT a shell: argv array + password via env, so neither
// user input nor the DB password can be interpreted by a shell.
export const runPgTool = (
  toolName: string,
  args: string[],
  dbParams: { user: string; password: string; host: string; port: string | number },
): Promise<{ stdout: string; stderr: string }> => {
  const toolPath = findPgToolPath(toolName);
  return new Promise((resolve, reject) => {
    execFile(
      toolPath,
      args,
      {
        env: {
          ...process.env,
          PGPASSWORD: dbParams.password,
        },
        maxBuffer: 1024 * 1024 * 512,
      },
      (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`${toolName} failed: ${error.message}\n${stderr}`));
          return;
        }
        resolve({ stdout, stderr });
      },
    );
  });
};

export const performBackup = async (tag?: string): Promise<string> => {
  const currentYear = getAcademicYear();
  const { user, password, name, host, port } = getDbParams(currentYear);
  const dbParams = { user, password, host, port };

  // Only allow a safe tag charset; anything else is rejected instead of
  // being interpolated into a shell command
  if (tag !== undefined && !/^[A-Za-z0-9_-]{1,40}$/.test(tag)) {
    throw new Error("Invalid tag. Only letters, numbers, '_' and '-' (max 40 chars) are allowed.");
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = tag
    ? `${name}_${timestamp}_${tag}.sql`
    : `${name}_${timestamp}.sql`;

  const backupDir = path.join(process.cwd(), 'backups');
  const backupFilePath = path.join(backupDir, backupFileName);

  // Ensure the backup directory exists
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const { stdout, stderr } = await runPgTool('pg_dump', [
    '-h', String(host),
    '-p', String(port),
    '-U', user,
    '-d', name,
  ], dbParams);

  if (stderr) {
    console.warn(`pg_dump stderr: ${stderr}`);
  }

  // Backup contains password hashes — restrict permissions
  fs.writeFileSync(backupFilePath, stdout);
  fs.chmodSync(backupFilePath, 0o600);

  return `PostgreSQL backup successful! Saved to ${backupFilePath}`;
};
