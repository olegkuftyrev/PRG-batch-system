/**
 * Environment variables for config files. Uses process.env with defaults.
 */
const defaults: Record<string, string | number> = {
  APP_KEY: 'prg-batch-secret-change-in-production',
  APP_NAME: 'prg-batch-api',
  LOG_LEVEL: 'info',
  HOST: '0.0.0.0',
  PORT: 3333,
  DB_HOST: '127.0.0.1',
  DB_PORT: 5432,
  DB_USER: 'prg',
  DB_PASSWORD: 'prg_secret',
  DB_DATABASE: 'prg_batch',
}

function get(key: string, defaultValue?: string | number): string | number {
  const v = process.env[key]
  if (v !== undefined) return key === 'PORT' || key === 'DB_PORT' ? parseInt(v, 10) : v
  if (defaultValue !== undefined) return defaultValue
  if (defaults[key] !== undefined) return defaults[key]
  throw new Error(`Missing env: ${key}`)
}

export default { get }
