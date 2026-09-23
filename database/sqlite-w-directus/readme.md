# SQLite w. Directus

- practice project to understand how to use an existing SQLite database with Directus using Direcutus Database Introspection tool

## How to's...

- to tryout a fresh install and setup of Database Introspection with Directus
  - copy and rename the `hello-sqlite.db` file from `hello-sqlite-w-nodejs` project to the database folder - rename to `data.db`

## Tips & Tricks

**Directus database introspection** lets you use your existing SQL database schema (like PostgreSQL, MySQL, etc.) and have Directus automatically detect and generate collections (tables), fields (columns), and relationships (foreign keys) without needing to manually define them in the Directus UI.

Here’s a clear and actionable explanation of how to use database introspection in Directus:

### 🔍 What is Directus Introspection?

Introspection is Directus' way of scanning your existing database schema and creating matching Directus metadata so that your database becomes manageable through the Directus interface/API **without changing your schema**.

### ✅ When to Use It

- You already have an existing database schema (legacy or custom).
- You want to add Directus as a headless CMS or data management layer **without** redesigning your database.
- You don’t want Directus to "own" your schema - you just want it to reflect it.

### 🧩 How It Works

1. **Directus reads your tables and columns.**
2. It maps them into "collections" (tables) and "fields" (columns).
3. It detects:
   - Primary keys
   - Foreign keys
   - Nullable/non-nullable
   - Unique constraints
   - Enum values (on supported DBs)
4. It stores this mapping in its own metadata tables (inside your database).

### 🛠 How to Use It

#### 1. **Connect Directus to Your Existing DB**

When you set up a new project:

```bash
npx directus bootstrap
```

Or configure `.env` like:

```bash
DB_CLIENT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=my_existing_db
DB_USER=myuser
DB_PASSWORD=mypassword
```

Then start Directus:

```bash
npx directus start
```

Directus will auto-detect existing tables and offer to introspect them.

#### 2. **Manual Introspection (if not done automatically)**

From the Directus Admin App:

- Go to **Settings > Data Model**
- Click the **“+”** button in the sidebar to **Add Collection**
- Choose **"Existing Table or View"** instead of creating a new collection
- Select the table you want to introspect
- Directus will:
  - Create a collection entry
  - Create fields for each column
  - Attempt to detect foreign keys and relationships

✅ **No actual changes** are made to the underlying tables - this is metadata-only.

#### 3. **Customize Fields/Collections**

After introspection, you can:

- Rename fields (aliases)
- Add display interfaces
- Set permissions
- Create calculated fields
- Define relationships manually if introspection missed any

### 💡 Tips

- If you add new tables/columns to your DB after setting up Directus, you can **repeat introspection** for just the new tables.
- You can also automate this using the **Directus CLI** or API.

### 🧪 Example

Suppose you have a `products` table like:

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10, 2),
  category_id INTEGER REFERENCES categories(id)
);
```

After introspection:

- You'll get a `products` collection in Directus
- `id`, `name`, `price`, `category_id` will be fields
- The `category_id` will be detected as a relational field (if the foreign key exists)

### ⚠️ Common Pitfalls

- **Missing FK constraints** → relationships won’t be auto-detected
- **Unsupported column types** → Directus might ignore them or default to `string`
- **Views** → you can introspect views as read-only collections
- **Renaming columns** after introspection can break things unless you sync metadata
