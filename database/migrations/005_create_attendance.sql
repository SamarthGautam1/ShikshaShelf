CREATE TABLE IF NOT EXISTS attendance_records (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  uuid        NOT NULL REFERENCES users(id),
    class_id    uuid        NOT NULL REFERENCES classes(id),
    date        date        NOT NULL DEFAULT CURRENT_DATE,
    method      varchar(10) NOT NULL CHECK (method IN ('qr', 'face')),
    marked_at   timestamptz NOT NULL DEFAULT now(),
    UNIQUE (student_id, class_id, date)
);
