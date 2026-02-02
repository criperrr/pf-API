-- Usei o Postgres gratuito da https://supabase.com.
CREATE TABLE IF NOT EXISTS Users (
    id_User SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    masterToken TEXT UNIQUE
);

CREATE TABLE IF NOT EXISTS NsacAccount (
    id_NsacAccount SERIAL PRIMARY KEY,
    FOREIGN KEY (id_User) REFERENCES Users (id_User) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ApiToken (
    id_Token SERIAL PRIMARY KEY,
    id_User INTEGER NOT NULL,
    id_NsacAccount INTEGER NOT NULL,
    cookieString TEXT,
    token TEXT UNIQUE NOT NULL,
    FOREIGN KEY (id_User) REFERENCES Users (id_User) ON DELETE CASCADE,
    FOREIGN KEY (id_NsacAccount) REFERENCES NsacAccount (id_NsacAccount) ON DELETE CASCADE
);