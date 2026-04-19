ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_method_check;
ALTER TABLE attendance_records ADD CONSTRAINT attendance_records_method_check CHECK (method IN ('qr', 'face', 'absent', 'manual'));
