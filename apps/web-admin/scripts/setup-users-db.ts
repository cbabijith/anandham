import * as dotenv from "dotenv";
import * as path from "path";
import { Client, Databases, ID, DatabasesIndexType as IndexType, Query, Users } from "node-appwrite";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

let usersDatabaseId = process.env.APPWRITE_USERS_DATABASE_ID || "anandham_users";
const profilesCollectionId = process.env.APPWRITE_COLLECTION_USERS_ID || "profiles";
const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || "info@abijithcb.com";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing Appwrite env vars: APPWRITE_ENDPOINT/NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const users = new Users(client);

function isConflict(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      Number((error as { code?: number }).code) === 409,
  );
}

async function ensureDatabase() {
  try {
    await databases.create(usersDatabaseId, "Anandham Users DB", true);
    console.log(`✅ Database created: ${usersDatabaseId}`);
  } catch (error) {
    if (isConflict(error)) {
      console.log(`ℹ️ Database already exists: ${usersDatabaseId}`);
      return;
    }

    const isQuotaError =
      Boolean(error && typeof error === "object" && "code" in error && Number((error as { code?: number }).code) === 403) &&
      Boolean(error && typeof error === "object" && "type" in error && String((error as { type?: string }).type) === "additional_resource_not_allowed");

    if (isQuotaError) {
      const list = await databases.list();
      const hasRequestedDb = list.databases.some((database) => database.$id === usersDatabaseId);

      if (hasRequestedDb) {
        console.log(`ℹ️ Reusing existing database due to plan limit: ${usersDatabaseId}`);
        return;
      }

      const fallbackDatabaseId = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
      if (fallbackDatabaseId) {
        const hasFallbackDb = list.databases.some((database) => database.$id === fallbackDatabaseId);
        if (hasFallbackDb) {
          usersDatabaseId = fallbackDatabaseId;
          console.log(`ℹ️ Plan limit reached. Reusing fallback database: ${usersDatabaseId}`);
          return;
        }
      }

      throw new Error(
        "Database limit reached and no reusable database found. Set APPWRITE_USERS_DATABASE_ID to an existing DB ID or provide APPWRITE_DATABASE_ID.",
      );
    }

    throw error;
  }
}

async function ensureProfilesCollection() {
  try {
    await databases.createCollection(
      usersDatabaseId,
      profilesCollectionId,
      "User Profiles",
      [],
      false,
      true,
    );
    console.log(`✅ Collection created: ${profilesCollectionId}`);
  } catch (error) {
    if (isConflict(error)) {
      console.log(`ℹ️ Collection already exists: ${profilesCollectionId}`);
      return;
    }
    throw error;
  }
}

async function createAttribute(
  action: () => Promise<unknown>,
  label: string,
) {
  try {
    await action();
    console.log(`✅ Attribute created: ${label}`);
  } catch (error) {
    if (isConflict(error)) {
      console.log(`ℹ️ Attribute already exists: ${label}`);
      return;
    }
    throw error;
  }
}

async function createIndex(action: () => Promise<unknown>, label: string) {
  try {
    await action();
    console.log(`✅ Index created: ${label}`);
  } catch (error) {
    if (isConflict(error)) {
      console.log(`ℹ️ Index already exists: ${label}`);
      return;
    }
    throw error;
  }
}

async function ensureSchema() {
  await createAttribute(
    () =>
      databases.createStringAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "user_id",
        128,
        true,
      ),
    "user_id",
  );

  await createAttribute(
    () =>
      databases.createEmailAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "email",
        true,
      ),
    "email",
  );

  await createAttribute(
    () =>
      databases.createStringAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "full_name",
        128,
        false,
      ),
    "full_name",
  );

  await createAttribute(
    () =>
      databases.createStringAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "role",
        32,
        true,
      ),
    "role",
  );

  await createAttribute(
    () =>
      databases.createBooleanAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "is_active",
        true,
      ),
    "is_active",
  );

  await createAttribute(
    () =>
      databases.createDatetimeAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "created_at",
        true,
      ),
    "created_at",
  );

  await createAttribute(
    () =>
      databases.createDatetimeAttribute(
        usersDatabaseId,
        profilesCollectionId,
        "updated_at",
        true,
      ),
    "updated_at",
  );

  await createIndex(
    () =>
      databases.createIndex(
        usersDatabaseId,
        profilesCollectionId,
        "idx_user_id_unique",
        IndexType.Key,
        ["user_id"],
      ),
    "idx_user_id_unique",
  );

  await createIndex(
    () =>
      databases.createIndex(
        usersDatabaseId,
        profilesCollectionId,
        "idx_email_unique",
        IndexType.Key,
        ["email"],
      ),
    "idx_email_unique",
  );

  await createIndex(
    () =>
      databases.createIndex(
        usersDatabaseId,
        profilesCollectionId,
        "idx_role",
        IndexType.Key,
        ["role"],
      ),
    "idx_role",
  );
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAttributesReady() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const attrs = await databases.listAttributes(usersDatabaseId, profilesCollectionId);
    const processing = attrs.attributes.filter((attr) => attr.status !== "available");
    if (processing.length === 0) return;
    await sleep(1500);
  }
}

async function ensureSuperAdminProfile() {
  const usersResult = await users.list([Query.equal("email", superAdminEmail)]);
  const superAdmin = usersResult.users.find((user) => user.email === superAdminEmail);

  if (!superAdmin) {
    console.log(`⚠️ Superadmin auth user not found for ${superAdminEmail}. Run seed:superadmin first.`);
    return;
  }

  const existing = await databases.listDocuments(usersDatabaseId, profilesCollectionId, [
    Query.equal("user_id", superAdmin.$id),
    Query.limit(1),
  ]);

  const payload = {
    user_id: superAdmin.$id,
    email: superAdminEmail,
    full_name: superAdmin.name || "Super Admin",
    role: "superadmin",
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (existing.documents.length > 0) {
    const docId = existing.documents[0].$id;
    await databases.updateDocument(usersDatabaseId, profilesCollectionId, docId, {
      ...payload,
      created_at: existing.documents[0].created_at || payload.created_at,
    });
    console.log("✅ Superadmin profile updated");
    return;
  }

  await databases.createDocument(usersDatabaseId, profilesCollectionId, ID.unique(), payload);
  console.log("✅ Superadmin profile created");
}

async function main() {
  console.log("\n🚀 Setting up Appwrite users database and profiles collection...\n");

  await ensureDatabase();
  await ensureProfilesCollection();
  await ensureSchema();
  await waitForAttributesReady();
  await ensureSuperAdminProfile();

  console.log("\n🎉 Users database setup completed.");
  console.log(`   Database ID: ${usersDatabaseId}`);
  console.log(`   Collection ID: ${profilesCollectionId}`);
  console.log("   Roles to use: superadmin, author, user");
}

main().catch((error) => {
  console.error("❌ Users DB setup failed:", error);
  process.exit(1);
});
