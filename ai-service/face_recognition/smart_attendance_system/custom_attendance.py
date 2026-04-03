
import cv2
import dlib
import numpy as np
import pandas as pd
import datetime
import os
from PIL import Image

class CustomFaceRecognition:
    def __init__(self):
        # Load the downloaded models directly
        models_dir = "models"

        # Initialize dlib components with our downloaded models
        self.detector = dlib.get_frontal_face_detector()

        # Load shape predictor and face recognition model
        predictor_path = os.path.join(models_dir, "shape_predictor_68_face_landmarks.dat")
        recognition_path = os.path.join(models_dir, "dlib_face_recognition_resnet_model_v1.dat")

        if not os.path.exists(predictor_path):
            raise FileNotFoundError(f"Model not found: {predictor_path}")
        if not os.path.exists(recognition_path):
            raise FileNotFoundError(f"Model not found: {recognition_path}")

        self.predictor = dlib.shape_predictor(predictor_path)
        self.face_rec = dlib.face_recognition_model_v1(recognition_path)

        # Storage for known faces
        self.known_face_encodings = []
        self.known_face_names = []
        self.attendance_log = []

        print("✅ Custom face recognition system initialized!")

    def get_face_encoding(self, image, face_location):
        """Get face encoding using dlib models"""
        # Convert face location to dlib rectangle
        top, right, bottom, left = face_location
        rect = dlib.rectangle(left, top, right, bottom)

        # Get face landmarks
        landmarks = self.predictor(image, rect)

        # Get face encoding
        encoding = self.face_rec.compute_face_descriptor(image, landmarks)
        return np.array(encoding)

    def load_known_faces(self, faces_directory="student_photos"):
        """Load student photos and create encodings"""
        if not os.path.exists(faces_directory):
            os.makedirs(faces_directory)
            print(f"Created directory: {faces_directory}")
            return False

        photo_files = [f for f in os.listdir(faces_directory) 
                      if f.lower().endswith(('.png', '.jpg', '.jpeg'))]

        if not photo_files:
            print(f"No photos found in {faces_directory}/")
            return False

        for filename in photo_files:
            try:
                image_path = os.path.join(faces_directory, filename)
                print(f"Processing {filename}...")

                # Load image using OpenCV
                img = cv2.imread(image_path)
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

                # Detect faces
                faces = self.detector(rgb_img)

                if faces:
                    # Use the first face found
                    face = faces[0]
                    top, right, bottom, left = face.top(), face.right(), face.bottom(), face.left()

                    # Get encoding
                    encoding = self.get_face_encoding(rgb_img, (top, right, bottom, left))

                    # Store encoding and name
                    name = os.path.splitext(filename)[0].replace('_', ' ').title()
                    self.known_face_encodings.append(encoding)
                    self.known_face_names.append(name)

                    print(f"✅ Loaded {name}")
                else:
                    print(f"⚠️ No face found in {filename}")

            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

        print(f"\n📋 Loaded {len(self.known_face_names)} students")
        return len(self.known_face_names) > 0

    def recognize_faces_in_frame(self, frame):
        """Recognize faces in video frame"""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Detect faces
        faces = self.detector(rgb_frame)

        face_locations = []
        face_names = []

        for face in faces:
            top, right, bottom, left = face.top(), face.right(), face.bottom(), face.left()
            face_locations.append((top, right, bottom, left))

            # Get encoding for this face
            try:
                encoding = self.get_face_encoding(rgb_frame, (top, right, bottom, left))

                # Compare with known faces
                name = "Unknown"
                if self.known_face_encodings:
                    distances = []
                    for known_encoding in self.known_face_encodings:
                        distance = np.linalg.norm(encoding - known_encoding)
                        distances.append(distance)

                    min_distance_idx = np.argmin(distances)
                    if distances[min_distance_idx] < 0.6:  # Threshold for recognition
                        name = self.known_face_names[min_distance_idx]

                face_names.append(name)

            except Exception as e:
                print(f"Error processing face: {e}")
                face_names.append("Unknown")

        return face_locations, face_names

    def mark_attendance(self, name):
        """Mark attendance"""
        if name == "Unknown":
            return False

        now = datetime.datetime.now()
        today = now.strftime("%Y-%m-%d")
        current_time = now.strftime("%H:%M:%S")

        # Check if already marked today
        today_attendance = [entry for entry in self.attendance_log 
                           if entry['Name'] == name and entry['Date'] == today]

        if not today_attendance:
            self.attendance_log.append({
                'Name': name,
                'Date': today,
                'Time': current_time,
                'Status': 'Present'
            })
            print(f"📝 {name} - Attendance marked at {current_time}")
            return True
        return False

    def save_attendance(self):
        """Save attendance to CSV"""
        if not self.attendance_log:
            return None

        if not os.path.exists("attendance_logs"):
            os.makedirs("attendance_logs")

        today = datetime.datetime.now().strftime("%Y%m%d")
        filename = f"attendance_logs/attendance_{today}.csv"

        df = pd.DataFrame(self.attendance_log)
        df.to_csv(filename, index=False)
        print(f"💾 Saved to {filename}")
        return filename

    def run_system(self):
        """Run the attendance system"""
        cap = cv2.VideoCapture(0)

        if not cap.isOpened():
            print("❌ Cannot open camera")
            return

        print("\n🎥 Custom Face Recognition Attendance System")
        print("Press 'q' to quit, 's' to save")
        print("="*50)

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Recognize faces
            face_locations, face_names = self.recognize_faces_in_frame(frame)

            # Draw results
            for (top, right, bottom, left), name in zip(face_locations, face_names):
                color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)

                # Draw rectangle
                cv2.rectangle(frame, (left, top), (right, bottom), color, 2)

                # Draw name
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
                cv2.putText(frame, name, (left + 6, bottom - 6), 
                           cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)

                # Mark attendance
                self.mark_attendance(name)

            # Show stats
            cv2.putText(frame, f"Students: {len(self.known_face_names)}", 
                       (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            cv2.putText(frame, f"Present Today: {len(self.attendance_log)}", 
                       (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

            cv2.imshow('Custom Face Recognition System', frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                self.save_attendance()

        cap.release()
        cv2.destroyAllWindows()
        self.save_attendance()

def main():
    try:
        # Initialize system
        system = CustomFaceRecognition()

        # Load student faces
        if system.load_known_faces():
            system.run_system()
        else:
            print("\nPlease add student photos to 'student_photos/' directory")
            print("Name files as: student_name.jpg")

    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nFalling back to simple OpenCV system...")
        print("Run: python simple_attendance.py")

if __name__ == "__main__":
    main()
