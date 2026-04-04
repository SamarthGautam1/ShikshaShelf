CREATE TABLE IF NOT EXISTS qr_tokens (
    id          uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id    uuid         NOT NULL REFERENCES classes(id),
    token       varchar(255) NOT NULL UNIQUE,
    created_by  uuid         NOT NULL REFERENCES users(id),
    expires_at  timestamptz  NOT NULL,
    used        boolean      NOT NULL DEFAULT false
);
