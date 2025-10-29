// scripts/run-seed.js
/* eslint-env node */

require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { Client } = require("pg");

async function getLocalDbUrl() {
  // 1) Prefer explicit override (handy for CI or custom setups)
  if (process.env.LOCAL_DB_URL) return process.env.LOCAL_DB_URL;

  // 2) Ask the Supabase CLI for the running local DB URL
  try {
    const out = execSync("supabase status --output env", {
      stdio: ["ignore", "pipe", "pipe"],
    }).toString();
    const line = out.split(/\r?\n/).find((l) => l.startsWith("DB_URL="));
    if (!line) throw new Error("DB_URL not found in supabase status output");
    return line.split("=")[1].trim();
  } catch (e) {
    throw new Error(`Unable to resolve local DB URL. ${e.message}`);
  }
}

async function main() {
  const dbUrl = await getLocalDbUrl();

  const seedPath = path.resolve(process.cwd(), "supabase/seed/seed.sql");
  if (!fs.existsSync(seedPath)) {
    console.error(`ERROR: Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(seedPath, "utf8").trim();
  if (!sql) {
    console.log("OK: Seed file is empty, nothing to do.");
    return;
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: false, // local CLI DB doesn't use SSL
  });

  try {
    await client.connect();
    // Run the whole file (it already has BEGIN/COMMIT)
    await client.query(sql);
    console.log("OK: Seed executed successfully.");
  } catch (err) {
    console.error("ERROR: Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
