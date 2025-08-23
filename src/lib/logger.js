// Simple logger with opt-in verbosity via env QUIET_LOGS
const QUIET = process.env.QUIET_LOGS === '1' || process.env.QUIET_LOGS === 'true';

function log(...args) {
  if (!QUIET) console.log(...args);
}

function warn(...args) {
  if (!QUIET) console.warn(...args);
}

function error(...args) {
  // Always show errors in dev; silence only if explicitly requested
  if (!QUIET || process.env.FORCE_SILENT_ERRORS !== '1') console.error(...args);
}

export const logger = { log, warn, error };

export default logger;




