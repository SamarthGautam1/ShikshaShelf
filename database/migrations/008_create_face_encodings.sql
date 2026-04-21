CREATE TABLE IF NOT EXISTS face_encodings (
    id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    uuid        NOT NULL UNIQUE REFERENCES users(id),
    encoding_json text        NOT NULL,
    photo_url     text,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);
