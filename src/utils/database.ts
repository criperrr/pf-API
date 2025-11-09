import sqlite3 from 'sqlite3';
const databaseLocation = ':memory:'
const creationQueries = `
CREATE TABLE IF NOT EXISTS User (
    id_User INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTSNsacAccount (
    id_NsacAccount INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ApiToken (
    id_Token INTEGER PRIMARY KEY AUTOINCREMENT,
    id_User INTEGER NOT NULL,
    id_NsacAccount INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    FOREIGN KEY (id_User) REFERENCES User (id_User) ON DELETE CASCADE,
    FOREIGN KEY (id_NsacAccount) REFERENCES NsacAccount (id_NsacAccount) ON DELETE CASCADE
);
`

const db = new sqlite3.Database(databaseLocation, (err) => {
    if(err) throw new Error('Failed to connect to db: ' + err);
    
    console.log('Connected!');
    runSql(creationQueries, [], db);
});

export function runSql(sql: string, params: Array<string>, connection: sqlite3.Database) {
    return new Promise<number>((resolve, reject) => {
        connection.run(sql, params, 
            function (err: any)  {
                if(err) {
                    return reject(err);
                };
                resolve(this.lastID);
            })
    
        }
    )
}

export function getSql(sql: string, params: Array<string>, connection: sqlite3.Database) {
    return new Promise<any>((resolve, reject) => {
        connection.get(sql, params, 
            (err, row) => {
                if(err) return reject(err);
                resolve(row);
        })
    })
}


export default db;