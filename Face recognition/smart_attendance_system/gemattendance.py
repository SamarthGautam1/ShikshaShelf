
import cv2
import dlib
import numpy as np
import pandas as pd
import datetime
import os
import threading
import time
from collections import deque


class CustomFaceRecognition:
    def __init__(self):
        # Load the downloaded models directly
        models_dir = "../face_recognition_models"

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

        # FIXED: Simplified approach - no complex threading for now
        self.frame_count = 0
        self.skip_frames = 3  # Process every 3rd frame
        self.detection_scale = 0.5  # Detect on half-size image
        self.last_results = ([], [])

        # Face tracking to maintain recognition across frames
        self.face_memory = {}  # Track faces across frames
        self.memory_timeout = 10  # frames

        print("✅ Face recognition system initialized (synchronization fixed)!")

    def get_face_encoding(self, image, face_location):
        """Get face encoding using dlib models"""
        try:
            top, right, bottom, left = face_location
            rect = dlib.rectangle(left, top, right, bottom)
            landmarks = self.predictor(image, rect)
            encoding = self.face_rec.compute_face_descriptor(image, landmarks)
            return np.array(encoding)
        except Exception as e:
            print(f"Encoding error: {e}")
            return None

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

        print("Loading student faces...")
        for filename in photo_files:
            try:
                image_path = os.path.join(faces_directory, filename)
                print(f"Processing {filename}...")

                img = cv2.imread(image_path)
                if img is None:
                    print(f"❌ Could not load {filename}")
                    continue

                # Resize very large images
                h, w = img.shape[:2]
                if w > 800:
                    scale = 800.0 / w
                    img = cv2.resize(img, (int(w * scale), int(h * scale)))

                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                faces = self.detector(rgb_img)

                if faces:
                    face = faces[0]
                    top, right, bottom, left = face.top(), face.right(), face.bottom(), face.left()
                    encoding = self.get_face_encoding(rgb_img, (top, right, bottom, left))

                    if encoding is not None:
                        name = os.path.splitext(filename)[0].replace('_', ' ').title()
                        self.known_face_encodings.append(encoding)
                        self.known_face_names.append(name)
                        print(f"✅ Loaded {name}")
                    else:
                        print(f"⚠️ Could not encode face in {filename}")
                else:
                    print(f"⚠️ No face found in {filename}")

            except Exception as e:
                print(f"❌ Error processing {filename}: {e}")

        print(f"\n📋 Loaded {len(self.known_face_names)} students")
        return len(self.known_face_names) > 0

    def get_face_center(self, face_location):
        """Get center point of a face for tracking"""
        top, right, bottom, left = face_location
        return ((left + right) // 2, (top + bottom) // 2)

    def find_closest_tracked_face(self, face_location):
        """Find the closest tracked face to avoid re-recognition"""
        face_center = self.get_face_center(face_location)

        closest_id = None
        min_distance = float('inf')

        for face_id, memory in self.face_memory.items():
            if memory['age'] < self.memory_timeout:
                tracked_center = memory['center']
                distance = np.sqrt((face_center[0] - tracked_center[0])**2 + 
                                 (face_center[1] - tracked_center[1])**2)

                if distance < 100 and distance < min_distance:  # 100 pixel threshold
                    min_distance = distance
                    closest_id = face_id

        return closest_id

    def recognize_faces_in_frame(self, frame):
        """FIXED: Synchronous face recognition to avoid timing issues"""
        self.frame_count += 1

        # Skip frames for performance, but return updated cached results
        if self.frame_count % self.skip_frames != 0:
            # Update face memory age for all tracked faces
            for face_id in list(self.face_memory.keys()):
                self.face_memory[face_id]['age'] += 1
                if self.face_memory[face_id]['age'] > self.memory_timeout:
                    del self.face_memory[face_id]
            return self.last_results

        # Detect faces on smaller frame for speed
        small_frame = cv2.resize(frame, (0, 0), fx=self.detection_scale, fy=self.detection_scale)
        rgb_small = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        faces = self.detector(rgb_small, 1)

        print(f"Debug: Found {len(faces)} faces in frame {self.frame_count}")

        # Scale coordinates back to original frame size
        face_locations = []
        face_names = []

        for face in faces:
            top = int(face.top() / self.detection_scale)
            right = int(face.right() / self.detection_scale)
            bottom = int(face.bottom() / self.detection_scale)
            left = int(face.left() / self.detection_scale)
            face_location = (top, right, bottom, left)
            face_locations.append(face_location)

            # Check if this face is already tracked
            closest_face_id = self.find_closest_tracked_face(face_location)

            if closest_face_id and closest_face_id in self.face_memory:
                # Use cached recognition result
                name = self.face_memory[closest_face_id]['name']
                # Update tracking info
                self.face_memory[closest_face_id]['center'] = self.get_face_center(face_location)
                self.face_memory[closest_face_id]['age'] = 0
                print(f"Debug: Using cached result for {name}")
            else:
                # New face - do recognition immediately (SYNCHRONOUS)
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                encoding = self.get_face_encoding(rgb_frame, face_location)
                name = "Unknown"

                if encoding is not None and self.known_face_encodings:
                    distances = [np.linalg.norm(encoding - known_encoding) 
                               for known_encoding in self.known_face_encodings]
                    min_idx = np.argmin(distances)

                    print(f"Debug: Min distance = {distances[min_idx]:.3f}")

                    if distances[min_idx] < 0.6:  # Recognition threshold
                        name = self.known_face_names[min_idx]
                        print(f"🎯 RECOGNIZED: {name} (distance: {distances[min_idx]:.3f})")
                    else:
                        print(f"⚠️ Not recognized - closest match: {self.known_face_names[min_idx]} (distance: {distances[min_idx]:.3f})")

                # Store in face memory for tracking
                face_id = f"face_{self.frame_count}_{len(face_locations)}"
                self.face_memory[face_id] = {
                    'name': name,
                    'center': self.get_face_center(face_location),
                    'age': 0
                }

            face_names.append(name)

        # Cache results
        self.last_results = (face_locations, face_names)
        return face_locations, face_names

    def mark_attendance(self, name):
        """Mark attendance"""
        if name == "Unknown":
            return False

        try:
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
                print(f"📝 *** ATTENDANCE MARKED *** {name} at {current_time}")
                return True
            else:
                print(f"ℹ️  {name} already marked present today")
                return False

        except Exception as e:
            print(f"Error marking attendance: {e}")
            return False

    def save_attendance(self):
        """Save attendance to CSV"""
        if not self.attendance_log:
            print("No attendance data to save")
            return None

        try:
            if not os.path.exists("attendance_logs"):
                os.makedirs("attendance_logs")

            today = datetime.datetime.now().strftime("%Y%m%d")
            filename = f"attendance_logs/attendance_{today}.csv"

            df = pd.DataFrame(self.attendance_log)
            df.to_csv(filename, index=False)
            print(f"💾 Saved to {filename}")
            return filename
        except Exception as e:
            print(f"Error saving: {e}")
            return None

    def run_system(self):
        """Run the attendance system - SYNCHRONIZATION FIXED"""
        cap = cv2.VideoCapture(0)

        # Camera settings
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)

        if not cap.isOpened():
            print("❌ Cannot open camera")
            return

        print("\n🎥 Face Recognition System (Synchronization Fixed)")
        print("✅ FIXES APPLIED:")
        print("   - Synchronous recognition (no threading delays)")
        print("   - Face tracking across frames")
        print("   - Immediate display of recognition results")
        print("   - Debug output for troubleshooting")
        print("\nPress 'q' to quit, 's' to save")
        print("="*50)

        fps_start = time.time()
        fps_count = 0

        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # FIXED: Synchronous face recognition
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
                cv2.putText(frame, f"Tracked: {len(self.face_memory)}", 
                           (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)

                # FPS monitoring
                fps_count += 1
                if fps_count % 30 == 0:
                    fps = 30 / (time.time() - fps_start)
                    print(f"FPS: {fps:.1f} | Faces: {len(face_locations)} | Tracked: {len(self.face_memory)}")
                    fps_start = time.time()

                cv2.imshow('Custom Face Recognition System', frame)

                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break
                elif key == ord('s'):
                    self.save_attendance()

        except Exception as e:
            print(f"Error in main loop: {e}")
            import traceback
            traceback.print_exc()
        finally:
            cap.release()
            cv2.destroyAllWindows()
            self.save_attendance()


def main():
    try:
        # Initialize system
        system = CustomFaceRecognition()

        # Load student faces
        if system.load_known_faces():
            print(f"\n🎯 Ready to recognize {len(system.known_face_names)} students:")
            for name in system.known_face_names:
                print(f"   - {name}")
            system.run_system()
        else:
            print("\nPlease add student photos to 'student_photos/' directory")
            print("Name files as: student_name.jpg")

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
