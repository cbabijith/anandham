import * as dotenv from "dotenv";
import * as path from "path";
import { Client, Databases, ID, DatabasesIndexType as IndexType } from "node-appwrite";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const endpoint = process.env.APPWRITE_ENDPOINT || process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId =
  process.env.APPWRITE_DATABASE_ID ||
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ||
  process.env.APPWRITE_USERS_DATABASE_ID ||
  "anandham_users";

const contentTypesCollectionId = process.env.APPWRITE_COLLECTION_CONTENT_TYPES_ID || "content_types";
const contentCategoriesCollectionId = process.env.APPWRITE_COLLECTION_CONTENT_CATEGORIES_ID || "content_categories";

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing Appwrite env vars: APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);

type AppwriteError = { code?: number };

function isConflict(error: unknown): boolean {
  return Boolean(error && typeof error === "object" && Number((error as AppwriteError).code) === 409);
}

async function createCollectionIfMissing(collectionId: string, name: string) {
  try {
    await databases.createCollection(databaseId, collectionId, name, [], false, true);
    console.log(`✅ Collection created: ${collectionId}`);
  } catch (error) {
    if (isConflict(error)) {
      console.log(`ℹ️ Collection already exists: ${collectionId}`);
      return;
    }
    throw error;
  }
}

async function createAttribute(label: string, action: () => Promise<unknown>) {
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

async function createIndex(label: string, action: () => Promise<unknown>) {
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

async function ensureContentTypesSchema() {
  await createAttribute("name", () =>
    databases.createStringAttribute(databaseId, contentTypesCollectionId, "name", 64, true),
  );
  await createAttribute("display_name", () =>
    databases.createStringAttribute(databaseId, contentTypesCollectionId, "display_name", 128, true),
  );
  await createAttribute("description", () =>
    databases.createStringAttribute(databaseId, contentTypesCollectionId, "description", 255, false),
  );
  await createAttribute("icon", () =>
    databases.createStringAttribute(databaseId, contentTypesCollectionId, "icon", 64, false),
  );
  await createAttribute("color", () =>
    databases.createStringAttribute(databaseId, contentTypesCollectionId, "color", 64, false),
  );
  await createAttribute("table_name", () =>
    databases.createStringAttribute(databaseId, contentTypesCollectionId, "table_name", 64, true),
  );
  await createAttribute("display_order", () =>
    databases.createIntegerAttribute(databaseId, contentTypesCollectionId, "display_order", true),
  );
  await createAttribute("is_active", () =>
    databases.createBooleanAttribute(databaseId, contentTypesCollectionId, "is_active", true),
  );
  await createAttribute("created_at", () =>
    databases.createDatetimeAttribute(databaseId, contentTypesCollectionId, "created_at", true),
  );
  await createAttribute("updated_at", () =>
    databases.createDatetimeAttribute(databaseId, contentTypesCollectionId, "updated_at", true),
  );

  await createIndex("idx_content_types_name", () =>
    databases.createIndex(databaseId, contentTypesCollectionId, "idx_content_types_name", IndexType.Key, ["name"]),
  );
  await createIndex("idx_content_types_active", () =>
    databases.createIndex(databaseId, contentTypesCollectionId, "idx_content_types_active", IndexType.Key, ["is_active"]),
  );
}

async function ensureContentCategoriesSchema() {
  await createAttribute("content_type_id", () =>
    databases.createStringAttribute(databaseId, contentCategoriesCollectionId, "content_type_id", 64, true),
  );
  await createAttribute("name", () =>
    databases.createStringAttribute(databaseId, contentCategoriesCollectionId, "name", 128, true),
  );
  await createAttribute("slug", () =>
    databases.createStringAttribute(databaseId, contentCategoriesCollectionId, "slug", 128, true),
  );
  await createAttribute("description", () =>
    databases.createStringAttribute(databaseId, contentCategoriesCollectionId, "description", 255, false),
  );
  await createAttribute("icon", () =>
    databases.createStringAttribute(databaseId, contentCategoriesCollectionId, "icon", 64, false),
  );
  await createAttribute("color", () =>
    databases.createStringAttribute(databaseId, contentCategoriesCollectionId, "color", 64, false),
  );
  await createAttribute("is_active", () =>
    databases.createBooleanAttribute(databaseId, contentCategoriesCollectionId, "is_active", true),
  );
  await createAttribute("is_deleted", () =>
    databases.createBooleanAttribute(databaseId, contentCategoriesCollectionId, "is_deleted", true),
  );
  await createAttribute("display_order", () =>
    databases.createIntegerAttribute(databaseId, contentCategoriesCollectionId, "display_order", true),
  );
  await createAttribute("created_at", () =>
    databases.createDatetimeAttribute(databaseId, contentCategoriesCollectionId, "created_at", true),
  );
  await createAttribute("updated_at", () =>
    databases.createDatetimeAttribute(databaseId, contentCategoriesCollectionId, "updated_at", true),
  );

  await createIndex("idx_categories_module", () =>
    databases.createIndex(databaseId, contentCategoriesCollectionId, "idx_categories_module", IndexType.Key, ["content_type_id"]),
  );
  await createIndex("idx_categories_active", () =>
    databases.createIndex(databaseId, contentCategoriesCollectionId, "idx_categories_active", IndexType.Key, ["is_active"]),
  );
  await createIndex("idx_categories_deleted", () =>
    databases.createIndex(databaseId, contentCategoriesCollectionId, "idx_categories_deleted", IndexType.Key, ["is_deleted"]),
  );
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForAttributesReady(collectionId: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const attrs = await databases.listAttributes(databaseId, collectionId);
    const pending = attrs.attributes.filter((attr) => attr.status !== "available");
    if (pending.length === 0) return;
    await sleep(1200);
  }
}

async function upsertStaticContentTypes() {
  const staticContentTypes = [
    { id: "krithis", name: "krithis", display_name: "Guru Krithis", table_name: "guru_krithis", display_order: 0 },
    { id: "keerthanams", name: "keerthanams", display_name: "Guru Keerthanams", table_name: "guru_keerthanams", display_order: 1 },
    { id: "dharmas", name: "dharmas", display_name: "Guru Dharmas", table_name: "guru_dharmas", display_order: 2 },
    { id: "photos", name: "photos", display_name: "Guru Photos", table_name: "guru_photos", display_order: 3 },
    { id: "stories", name: "stories", display_name: "Guru Stories", table_name: "guru_stories", display_order: 4 },
  ];

  for (const item of staticContentTypes) {
    const payload = {
      name: item.name,
      display_name: item.display_name,
      description: `${item.display_name} content`,
      icon: "",
      color: "",
      table_name: item.table_name,
      display_order: item.display_order,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await databases.createDocument(databaseId, contentTypesCollectionId, item.id, payload);
      console.log(`✅ Seeded content type: ${item.id}`);
    } catch (error) {
      if (isConflict(error)) {
        await databases.updateDocument(databaseId, contentTypesCollectionId, item.id, {
          ...payload,
          updated_at: new Date().toISOString(),
        });
        console.log(`ℹ️ Updated existing content type: ${item.id}`);
        continue;
      }
      throw error;
    }
  }
}

async function main() {
  console.log("\n🚀 Setting up content management collections...\n");

  await createCollectionIfMissing(contentTypesCollectionId, "Content Types");
  await createCollectionIfMissing(contentCategoriesCollectionId, "Content Categories");

  await ensureContentTypesSchema();
  await ensureContentCategoriesSchema();

  await waitForAttributesReady(contentTypesCollectionId);
  await waitForAttributesReady(contentCategoriesCollectionId);

  await upsertStaticContentTypes();

  console.log("\n🎉 Content DB setup completed.");
  console.log(`   Database ID: ${databaseId}`);
  console.log(`   Collection IDs: ${contentTypesCollectionId}, ${contentCategoriesCollectionId}`);
}

main().catch((error) => {
  console.error("❌ Content DB setup failed:", error);
  process.exit(1);
});
