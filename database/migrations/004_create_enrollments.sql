CREATE TABLE IF NOT EXISTS enrollments (
    id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id    uuid        NOT NULL REFERENCES classes(id),
    student_id  uuid        NOT NULL REFERENCES users(id),
    enrolled_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (class_id, student_id)
);
