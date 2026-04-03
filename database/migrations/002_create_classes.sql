CREATE TABLE IF NOT EXISTS classes (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    name        varchar(255) NOT NULL,
    subject     varchar(255) NOT NULL,
    teacher_id  uuid         NOT NULL REFERENCES users(id),
    created_at  timestamptz  NOT NULL DEFAULT now(),
    updated_at  timestamptz  NOT NULL DEFAULT now()
);
