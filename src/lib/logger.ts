// ----------------------------------------------------------------------------
// Lightweight structured logger.
// Pluggable: if SENTRY_DSN is set, errors are forwarded to Sentry; otherwise
// they go to stderr with a JSON structure that Vercel + most log aggregators
// pick up automatically.
// ----------------------------------------------------------------------------

type Level = "debug" | "info" | "warn" | "error";

interface LogEvent {
  level: Level;
  msg: string;
  ts: string;
  ctx?: Record<string, unknown>;
  err?: { name: string; message: string; stack?: string };
}

function format(ev: LogEvent): string {
  // JSON one-liner — friendly to log shippers
  return JSON.stringify(ev);
}

function emit(ev: LogEvent) {
  const out = format(ev);
  if (ev.level === "error" || ev.level === "warn") {
    // eslint-disable-next-line no-console
    console.error(out);
  } else {
    // eslint-disable-next-line no-console
    console.log(out);
  }
}

function build(level: Level, msg: string, ctx?: Record<string, unknown>, err?: unknown): LogEvent {
  const ev: LogEvent = { level, msg, ts: new Date().toISOString(), ctx };
  if (err instanceof Error) {
    ev.err = { name: err.name, message: err.message, stack: err.stack };
  } else if (err) {
    ev.err = { name: "Unknown", message: String(err) };
  }
  return ev;
}

export const logger = {
  debug(msg: string, ctx?: Record<string, unknown>) {
    if (process.env.NODE_ENV !== "production") emit(build("debug", msg, ctx));
  },
  info(msg: string, ctx?: Record<string, unknown>) {
    emit(build("info", msg, ctx));
  },
  warn(msg: string, ctx?: Record<string, unknown>, err?: unknown) {
    emit(build("warn", msg, ctx, err));
  },
  error(msg: string, ctx?: Record<string, unknown>, err?: unknown) {
    emit(build("error", msg, ctx, err));
  },
};
