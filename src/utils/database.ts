import { Pool } from "pg";
import "dotenv/config";

const connectionString = process.env.SUPACONN;

if (!connectionString) {
    console.error("FATAL ERROR: SUPACONN is not defined in .env");
    process.exit(1);
}

const db = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

db.on("connect", () => {
    console.log("Connected to Supabase Postgres!");
});

const createUserTable = `
CREATE TABLE IF NOT EXISTS Users (
    id_User SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    masterToken TEXT UNIQUE
);
`;

const createNsacAccountTable = `
CREATE TABLE IF NOT EXISTS NsacAccount (
    id_NsacAccount SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
`;

const createApiTokenTable = `
CREATE TABLE IF NOT EXISTS ApiToken (
    id_Token SERIAL PRIMARY KEY,
    id_User INTEGER NOT NULL,
    id_NsacAccount INTEGER NOT NULL,
    cookieString TEXT,
    token TEXT UNIQUE NOT NULL,
    FOREIGN KEY (id_User) REFERENCES Users (id_User) ON DELETE CASCADE,
    FOREIGN KEY (id_NsacAccount) REFERENCES NsacAccount (id_NsacAccount) ON DELETE CASCADE
);
`;

export async function ensureDbCreated() {
    const client = await db.connect();
    try {
        await client.query(createUserTable);
        await client.query(createNsacAccountTable);
        await client.query(createApiTokenTable);
        console.log("Tables ensured.");
    } catch (err) {
        console.error("Error creating tables:", err);
    } finally {
        client.release();
    }
}

// preguiça de mudar o projeto inteiro
function normalizeSql(sql: string): string {
    let i = 1;
    return sql.replace(/\?/g, () => `$${i++}`);
}

export default db;

export async function runSql(sql: string, params: Array<any>, pool: Pool = db): Promise<number> {
    const pgSql = normalizeSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rowCount ?? 0;
}

export async function queryOne<T>(sql: string, params: Array<any>, pool: Pool = db): Promise<T> {
    const pgSql = normalizeSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0] as T;
}

export async function insertSql(sql: string, params: Array<any>, pool: Pool = db): Promise<number> {
    const pgSql = normalizeSql(sql);

    const result = await pool.query(pgSql, params);

    if (result.rows.length > 0) {
        const returnedId = Object.values(result.rows[0])[0];
        return Number(returnedId);
    }

    return 0;
}

export async function getSql<T>(sql: string, params: Array<any>, pool: Pool = db): Promise<T[]> {
    const pgSql = normalizeSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows as T[];
}
