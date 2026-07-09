import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const databaseUrl = process.env.DATABASE_URL;

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const email = requireEnv(
    process.env.SEED_SUPER_ADMIN_EMAIL,
    "SEED_SUPER_ADMIN_EMAIL",
  );
  const password = requireEnv(
    process.env.SEED_SUPER_ADMIN_PASSWORD,
    "SEED_SUPER_ADMIN_PASSWORD",
  );
  const fullName = requireEnv(
    process.env.SEED_SUPER_ADMIN_FULL_NAME,
    "SEED_SUPER_ADMIN_FULL_NAME",
  );
  const role = requireEnv(
    process.env.SEED_SUPER_ADMIN_ROLE,
    "SEED_SUPER_ADMIN_ROLE",
  );

  requireEnv(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL");
  requireEnv(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY");
  requireEnv(databaseUrl, "DATABASE_URL");

  const supabase = createClient(supabaseUrl!, serviceRoleKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const adapter = new PrismaPg({ connectionString: databaseUrl! });
  const prisma = new PrismaClient({ adapter });

  // 1) Create or find Supabase auth user
  const { data: listData, error: listError } =
    await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  let authUser = listData.users.find(
    (user) => user.email?.toLowerCase() === email.toLowerCase(),
  );

  if (!authUser) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (error) {
      throw error;
    }

    authUser = data.user;
    console.log(`Created Supabase auth user: ${email}`);
  } else {
    console.log(`Supabase auth user already exists: ${email}`);
  }

  if (!authUser) {
    throw new Error("Failed to resolve auth user");
  }

  // 2) Upsert Prisma profile
  const profile = await prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      email,
      full_name: fullName,
      role,
    },
    update: {
      email,
      full_name: fullName,
      role,
    },
  });

  console.log("Seeded profile:", {
    id: profile.id,
    email: profile.email,
    role: profile.role,
  });

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});