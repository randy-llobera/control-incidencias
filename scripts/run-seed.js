/**
 * scripts/run-seed.js
 *
 * Purpose:
 *   Run the SQL in supabase/seed/seed.sql against the target database.
 *   - Local dev (Supabase CLI Postgres): connects without SSL.
 *   - Supabase cloud (staging/prod via pooler): connects with TLS.
 *     If a CA is provided (PGSSLROOTCERT or supabase/ca/root.crt), enforce strict verification.
 *     Otherwise, allow TLS with relaxed verification to avoid self-signed chain failures.
 *
 * Usage:
 *   - Reads .env.local automatically.
 *   - LOCAL_DB_URL overrides; otherwise falls back to `supabase status --output env` (local).
 */

/* eslint-env node */

require("dotenv").config({ path: ".env.local" });

const dns = require("dns");
dns.setDefaultResultOrder && dns.setDefaultResultOrder("ipv4first");

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { Client } = require("pg");

/** Resolve the Postgres URL to use for seeding.
 *  Priority:
 *   1) LOCAL_DB_URL from env (staging/prod or custom)
 *   2) DB_URL from `supabase status --output env` (local dev)
 */
function resolveDbUrl() {
  if (process.env.LOCAL_DB_URL) return process.env.LOCAL_DB_URL.trim();

  try {
    const out = execSync("supabase status --output env", {
      stdio: ["ignore", "pipe", "pipe"],
    }).toString();
    const line = out.split(/\r?\n/).find((l) => l.startsWith("DB_URL="));
    if (!line) throw new Error("DB_URL not found in supabase status output");
    return line.split("=")[1].trim();
  } catch (err) {
    throw new Error(
      `Unable to resolve DB URL. Set LOCAL_DB_URL or ensure Supabase local is running. ${err.message}`
    );
  }
}

/** Build a pg Client config from a connection string with predictable TLS behavior. */
function buildPgConfig(dbUrl) {
  const u = new URL(dbUrl);
  const host = u.hostname;

  // Local docker hostnames
  const isLocalHost =
    /^(localhost|127\.0\.0\.1|0\.0\.0\.0|host\.docker\.internal)$/i.test(host);
  // Supabase cloud hosts (incl. pooler)
  const isSupabase =
    /(?:^|\.)supabase\.(?:co|com)$/i.test(host) ||
    /pooler\.supabase\.com$/i.test(host);
  const sslRequired =
    /sslmode=require/i.test(dbUrl) || (!isLocalHost && isSupabase);

  let ssl = false;
  if (!isLocalHost && sslRequired) {
    // Prefer strict TLS if a CA is available
    const caFromEnv =
      process.env.PGSSLROOTCERT && fs.existsSync(process.env.PGSSLROOTCERT)
        ? fs.readFileSync(process.env.PGSSLROOTCERT)
        : null;
    const caDefaultPath = path.resolve(process.cwd(), "supabase/ca/root.crt");
    const caFromRepo = fs.existsSync(caDefaultPath)
      ? fs.readFileSync(caDefaultPath)
      : null;

    if (caFromEnv || caFromRepo) {
      ssl = { rejectUnauthorized: true, ca: caFromEnv || caFromRepo };
    } else {
      // Fallback: relax verification to tolerate pooler chain quirks
      ssl = { rejectUnauthorized: false };
    }
  }

  return {
    host,
    port: Number(u.port || 5432),
    database: (u.pathname && u.pathname.slice(1)) || "postgres",
    user: decodeURIComponent(u.username || "postgres"),
    password: decodeURIComponent(u.password || ""),
    ssl,
  };
}

/** Read seed SQL file (required). */
function readSeedSql() {
  const seedPath = path.resolve(process.cwd(), "supabase/seed/seed.sql");
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file not found at ${seedPath}`);
  }
  const sql = fs.readFileSync(seedPath, "utf8").trim();
  return sql;
}

async function main() {
  const dbUrl = resolveDbUrl();
  const pgConfig = buildPgConfig(dbUrl);
  const sql = readSeedSql();

  if (!sql) {
    console.log("OK: Seed file is empty, nothing to do.");
    return;
  }

  let finished = false;
  const client = new Client(pgConfig);

  client.on("error", (err) => {
    // Pooler sometimes emits a shutdown after query completes; ignore post-finish errors
    if (
      finished &&
      (err.code === "XX000" || /db_termination|shutdown/i.test(String(err)))
    ) {
      return;
    }
    console.error("ERROR: PG client error:", err.message || err);
    process.exitCode = 1;
  });

  try {
    await client.connect();
    await client.query(sql);
    finished = true;
    console.log("OK: Seed executed successfully.");
  } catch (err) {
    console.error("ERROR: Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
    // ensure the process exits cleanly even if the socket emits late events
    setImmediate(() => process.exit(process.exitCode || 0));
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
