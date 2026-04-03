import os
import shutil
import zipfile
from datetime import datetime

def create_project_package():
    print("📦 Creating project package for sharing...")

    # Create package directory
    package_name = "Smart_Attendance_System_Package"
    if os.path.exists(package_name):
        shutil.rmtree(package_name)
    os.makedirs(package_name)

    # Items to copy
    items = ["smart_attendance_system/", "face_recognition_models/"]

    for item in items:
        if os.path.exists(item):
            dest = os.path.join(package_name, item)
            shutil.copytree(item, dest)
            print(f"✅ Copied: {item}")
        else:
            print(f"⚠️ Not found: {item}")

    # Create requirements.txt
    requirements = """opencv-python==4.12.0.88
dlib==20.0.0  
pandas==2.3.2
numpy==2.2.6
Pillow==11.3.0
cmake==4.1.0"""

    with open(f"{package_name}/requirements.txt", 'w') as f:
        f.write(requirements)
    print("✅ Created requirements.txt")

    # Create instructions
    instructions = f"""# Smart Attendance System Setup

## Quick Setup:
1. Extract this folder
2. Install Python 3.8-3.12
3. Run: python -m venv attendance_env
4. Run: attendance_env\Scripts\activate (Windows)
5. Run: pip install -r requirements.txt  
6. Add photos to smart_attendance_system/student_photos/
7. Run: cd smart_attendance_system
8. Run: python custom_attendance.py

Created: {datetime.now().strftime('%B %d, %Y')}
"""

    with open(f"{package_name}/README.txt", 'w') as f:
        f.write(instructions)
    print("✅ Created README.txt")

    # Create ZIP
    zip_name = f"Smart_Attendance_{datetime.now().strftime('%Y%m%d_%H%M')}.zip"

    print(f"📦 Creating {zip_name}...")
    with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(package_name):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, package_name)
                zipf.write(file_path, arc_path)

    size_mb = os.path.getsize(zip_name) / (1024*1024)

    print("\n🎉 SUCCESS!")
    print(f"📦 Created: {zip_name}")
    print(f"📊 Size: {size_mb:.1f} MB")
    print("\n🚀 Share this ZIP file with your friend!")

    return zip_name

if __name__ == "__main__":
    create_project_package()
