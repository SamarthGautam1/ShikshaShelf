# Smart Attendance System Configuration

# Camera Settings
CAMERA_INDEX = 0
FRAME_WIDTH = 640
FRAME_HEIGHT = 480

# Face Recognition Settings
FACE_TOLERANCE = 0.6
FACE_MODEL = "hog"  # "hog" for CPU, "cnn" for GPU

# File Paths
STUDENT_PHOTOS_DIR = "student_photos"
ATTENDANCE_LOGS_DIR = "attendance_logs"

# Attendance Settings
MARK_ATTENDANCE_COOLDOWN = 300  # seconds (5 minutes)
AUTO_SAVE_INTERVAL = 60  # seconds

# Display Settings
SHOW_CONFIDENCE = True
DRAW_BOUNDING_BOXES = True
WINDOW_TITLE = "Smart Classroom Attendance"
