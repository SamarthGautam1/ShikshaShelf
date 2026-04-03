CREATE TABLE IF NOT EXISTS users (
    id            uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name          varchar(255) NOT NULL,
    email         varchar(255) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    role          varchar(20)  NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    created_at    timestamptz  NOT NULL DEFAULT now(),
    updated_at    timestamptz  NOT NULL DEFAULT now()
);
