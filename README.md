E-शिक्षा: The Smart Productivity & Attendance App

(Formerly known as ShikshaShelf)

A comprehensive web application developed for the Smart India Hackathon 2025 (Problem Statement #25011) to solve two of the biggest problems in modern education: teacher inefficiency and wasted student potential.

🎯 About The Project

Many educational institutions suffer from two core problems:

Teacher Inefficiency: Valuable class time is wasted on manual administrative tasks like taking attendance.

Wasted Student Potential: Unstructured free periods between classes lead to unproductive time for students.

E-शिक्षा is a dual-purpose smart education app that tackles both issues head-on. It provides an automated attendance system to free up teachers and an AI-powered productivity engine to help students utilize their free time effectively, aligning their daily activities with their long-term academic and career goals.

✨ Key Features

Our platform provides distinct, feature-rich dashboards for every user role in the ecosystem.

For Students 🧑‍🎓

My Day View: A unified timeline that merges the official class schedule with AI-suggested personalized tasks for free periods.

Smart Task Suggestions: An AI engine that recommends relevant learning activities based on academic performance, interests, and career goals.

QR Attendance Scanner: A mobile-first interface to scan a unique QR code and get marked present in seconds.

Performance Tracking: Visual charts and graphs to monitor attendance, quiz scores, and progress.

For Teachers 👩‍🏫

Two-Mode Attendance Hub: A flexible system to take attendance via a dynamically generated QR Code or an advanced Facial Recognition scan.

Productivity Insights: An AI-powered dashboard that provides analytics on student engagement with free-period tasks and flags at-risk students.

Content Management: A simple portal to upload resources that the AI can use for task recommendations.

For Administrators 🏛️

School-Wide Analytics: A high-level dashboard showing real-time overall attendance percentages, student engagement rates, and other key metrics.

User Management: A secure interface to manage student and teacher accounts.

Official Report Generation: One-click generation of auditable attendance and performance reports.

🛠️ Tech Stack

Our application is built with a modern, scalable, and microservices-oriented tech stack.

Frontend: React.js (with Vite)

Styling: Tailwind CSS

Main Backend: Node.js & Express.js

AI Microservice: Python & Flask

Database: PostgreSQL

Real-time Communication: Socket.io

Machine Learning: OpenCV, TensorFlow, PyTorch

Deployment: Docker, AWS

⚙️ Getting Started (Local Setup)

To get a local copy up and running, follow these simple steps.

Prerequisites

Node.js (v18 or later) installed on your machine.

npm (comes with Node.js)

Installation

Clone the repo:

git clone https://github.com/SamarthGautam1/ShikshaShelf.git

Navigate to the project directory:

cd ShikshaShelf


Install all required NPM packages with one command:

npm install recharts react-qr-code html5-qrcode broadcast-channel


Run the development server:

npm run dev
