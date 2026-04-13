import { SlateAuth } from 'slates';
import { z } from 'zod';

export let auth = SlateAuth.create()
  .output(z.object({
    host: z.string().describe('PostgreSQL server hostname or IP address'),
    port: z.number().describe('PostgreSQL server port'),
    database: z.string().describe('Target database name'),
    username: z.string().describe('Database username'),
    password: z.string().describe('Database password'),
    sslMode: z.enum(['disable', 'require', 'verify-ca', 'verify-full']).describe('SSL connection mode'),
    connectionString: z.string().describe('Full PostgreSQL connection URI'),
  }))
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Connection String',
    key: 'connection_string',

    inputSchema: z.object({
      connectionString: z.string().describe('PostgreSQL connection URI (e.g., postgresql://user:password@host:5432/dbname?sslmode=require)'),
    }),

    getOutput: async (ctx) => {
      let connStr = ctx.input.connectionString.trim();
      let parsed = parseConnectionString(connStr);

      return {
        output: {
          host: parsed.host,
          port: parsed.port,
          database: parsed.database,
          username: parsed.username,
          password: parsed.password,
          sslMode: parsed.sslMode,
          connectionString: connStr,
        },
      };
    },
  })
  .addCustomAuth({
    type: 'auth.custom',
    name: 'Connection Parameters',
    key: 'connection_params',

    inputSchema: z.object({
      host: z.string().describe('PostgreSQL server hostname or IP address'),
      port: z.number().default(5432).describe('PostgreSQL server port (default: 5432)'),
      database: z.string().describe('Target database name'),
      username: z.string().describe('Database username'),
      password: z.string().describe('Database password'),
      sslMode: z.enum(['disable', 'require', 'verify-ca', 'verify-full']).default('require').describe('SSL connection mode'),
    }),

    getOutput: async (ctx) => {
      let { host, port, database, username, password, sslMode } = ctx.input;
      let encodedPassword = encodeURIComponent(password);
      let encodedUsername = encodeURIComponent(username);
      let sslParam = sslMode !== 'disable' ? `?sslmode=${sslMode}` : '';
      let connectionString = `postgresql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}${sslParam}`;

      return {
        output: {
          host,
          port,
          database,
          username,
          password,
          sslMode,
          connectionString,
        },
      };
    },
  });

let parseConnectionString = (connStr: string): {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  sslMode: 'disable' | 'require' | 'verify-ca' | 'verify-full';
} => {
  // Parse postgresql://user:password@host:port/dbname?sslmode=require
  let url: URL;
  try {
    url = new URL(connStr);
  } catch {
    throw new Error('Invalid PostgreSQL connection string format. Expected: postgresql://user:password@host:port/dbname');
  }

  let sslModeParam = url.searchParams.get('sslmode') || 'disable';
  let validSslModes = ['disable', 'require', 'verify-ca', 'verify-full'] as const;
  let sslMode: typeof validSslModes[number] = validSslModes.includes(sslModeParam as any)
    ? (sslModeParam as typeof validSslModes[number])
    : 'disable';

  return {
    host: url.hostname || 'localhost',
    port: url.port ? parseInt(url.port, 10) : 5432,
    database: url.pathname.replace(/^\//, '') || 'postgres',
    username: decodeURIComponent(url.username || 'postgres'),
    password: decodeURIComponent(url.password || ''),
    sslMode,
  };
};
