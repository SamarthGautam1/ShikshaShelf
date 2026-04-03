CREATE TABLE IF NOT EXISTS timetable_entries (
    id          uuid      PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id    uuid      NOT NULL REFERENCES classes(id),
    day_of_week smallint  NOT NULL CHECK (day_of_week BETWEEN 0 AND 4),
    start_time  time      NOT NULL,
    end_time    time      NOT NULL,
    room        varchar(100),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
