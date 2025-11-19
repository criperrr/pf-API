import sqlite3 from "sqlite3";
const databaseLocation = ":memory:";
const createUserTable = `
CREATE TABLE IF NOT EXISTS User (
    id_User INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
);
`;

const createNsacAccountTable = `
CREATE TABLE IF NOT EXISTS NsacAccount (
    id_NsacAccount INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);
`;

const createApiTokenTable = `
CREATE TABLE IF NOT EXISTS ApiToken (
    id_Token INTEGER PRIMARY KEY AUTOINCREMENT,
    id_User INTEGER NOT NULL,
    id_NsacAccount INTEGER NOT NULL,
    cookieString TEXT,
    token TEXT UNIQUE NOT NULL,
    FOREIGN KEY (id_User) REFERENCES User (id_User) ON DELETE CASCADE,
    FOREIGN KEY (id_NsacAccount) REFERENCES NsacAccount (id_NsacAccount) ON DELETE CASCADE
);
`;

const db = new sqlite3.Database(databaseLocation, (err) => {
    if (err) throw new Error("Failed to connect to db: " + err);
    console.log("Connected!");
});

export async function ensureDbCreated() {
    await runSql(createUserTable, [], db);
    await runSql(createNsacAccountTable, [], db);
    await runSql(createApiTokenTable, [], db);
}

export async function runSql(
    sql: string,
    params: Array<string>,
    connection: sqlite3.Database
): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        connection.run(sql, params, function (err: any) {
            if (err) return reject(err);
            resolve(this.lastID);
        });
    });
}

export async function getSql<T>(
    sql: string,
    params: Array<string>,
    connection: sqlite3.Database
): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        connection.get(sql, params, (err, row: T | undefined) => {
            if (err) return reject(err);
            resolve(row as T);
        });
    });
}

export default db;
