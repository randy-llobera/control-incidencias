// scripts/ensure-local-admin.js
// Purpose: Ensure a local admin user exists and is promoted to the "admin" role.
// Usage: npm run db:ensure-admin
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Optional env: LOCAL_ADMIN_EMAIL, LOCAL_ADMIN_PASSWORD
// scripts/ensure-local-admin.js

require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ADMIN_EMAIL = process.env.LOCAL_ADMIN_EMAIL || "admin.local@example.com";
const ADMIN_PASSWORD = process.env.LOCAL_ADMIN_PASSWORD || "Passw0rd!-local";

if (!URL || !SERVICE_ROLE) {
  console.error(
    "ERROR: Missing env: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

// This is a standalone Node process (not your Next.js runtime), so we create a dedicated Supabase client here using the Service Role key. It points to whatever environment your env vars target (local in .env.local).
async function main() {
  const supabase = createClient(URL, SERVICE_ROLE, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let userId = null;

  // 1) Try to create the user (idempotent-like: if exists, we’ll handle it)
  const { data: created, error: createErr } =
    await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // autoconfirm for local
      user_metadata: {
        display_name: "Randy Llobera",
        school_role: "Technology Professor",
      },
    });

  if (createErr) {
    const msg = String(createErr.message || createErr.error_description || "");
    const already = /exists|already/i.test(msg);
    if (!already) {
      console.error("ERROR: Failed to create admin user:", createErr);
      process.exit(1);
    }
  }

  if (created && created.user) {
    userId = created.user.id;
  }

  // 2) If we didn't just create it, look it up from mirrored public.users
  if (!userId) {
    const { data: existing, error: selErr } = await supabase
      .from("users")
      .select("id")
      .eq("email", ADMIN_EMAIL)
      .maybeSingle();

    if (selErr) {
      console.error("ERROR: Failed to query public.users:", selErr);
      process.exit(1);
    }
    if (!existing) {
      console.error("ERROR: Admin user not found and creation failed.");
      process.exit(1);
    }
    userId = existing.id;
  }

  // 3) Promote to admin (idempotent)
  const { data: role, error: roleErr } = await supabase
    .from("roles")
    .select("id")
    .eq("name", "admin")
    .maybeSingle();

  if (roleErr || !role) {
    console.error("ERROR: Admin role missing. Ensure roles are seeded first.");
    process.exit(1);
  }

  const { error: updErr } = await supabase
    .from("users")
    .update({ role_id: role.id })
    .eq("id", userId);

  if (updErr) {
    console.error("ERROR: Failed to promote user to admin:", updErr);
    process.exit(1);
  }

  console.log(`OK: Local admin ensured: ${ADMIN_EMAIL}`);
}

main().catch((e) => {
  console.error("ERROR: Unexpected error in ensure-local-admin:", e);
  process.exit(1);
});
