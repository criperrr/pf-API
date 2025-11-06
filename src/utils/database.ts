import sqlite3 from 'sqlite3';
const databaseLocation = '../test.db'

const db = new sqlite3.Database(databaseLocation, (err) => {
    if(err) throw new Error('Failed to connect to db: ' + err);
    else {
        console.log('Connected!')
    }
});

export default db;