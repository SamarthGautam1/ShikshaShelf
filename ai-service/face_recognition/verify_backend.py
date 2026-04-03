import cv2
import dlib
import numpy
import pandas
import PIL
import os

print(f"OpenCV version: {cv2.__version__}")
print(f"dlib version: {dlib.__version__}")
print(f"Numpy version: {numpy.__version__}")
print(f"Pandas version: {pandas.__version__}")
print(f"Pillow version: {PIL.__version__}")

# Check models path again from script perspective
models_dir = "smart_attendance_system/models"
p1 = os.path.join(models_dir, "shape_predictor_68_face_landmarks.dat")
p2 = os.path.join(models_dir, "dlib_face_recognition_resnet_model_v1.dat")

if os.path.exists(p1) and os.path.exists(p2):
    print("Models found.")
else:
    print("Models NOT found from script.")
