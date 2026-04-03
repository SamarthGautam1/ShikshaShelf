import React, { useState } from 'react';

// --- Helper Components & Icons (Inlined for single-file compatibility) ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const BoxIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
// --- MOCK DATA ---
const teacherUser = { name: 'Mrs. Anjali Desai', subject: 'Physics Teacher' };

const dashboardData = {
    todayClasses: 4,
    pendingSubmissions: 12,
    upcomingPTMs: 2,
    atRiskStudents: [
        { name: 'Rohan Sharma', reason: 'Attendance dropped by 20% this month.' },
        { name: 'Priya Singh', reason: 'Failed last two Physics quizzes.' },
    ],
    schedule: [
        { time: '09:00 AM', class: '10th-B', subject: 'Physics' },
        { time: '10:00 AM', class: '10th-A', subject: 'Physics' },
        { time: '12:00 PM', class: '9th-C', subject: 'General Science' },
    ]
};

const assignmentsData = [
    { id: 1, title: 'Chapter 5: Light Problem Set', class: '10th-B', due: '2025-09-18', submissions: '38/40' },
    { id: 2, title: 'Newton\'s Laws Worksheet', class: '10th-A', due: '2025-09-20', submissions: '35/41' },
    { id: 3, title: 'Lab Report: Ohm\'s Law', class: '10th-B', due: '2025-09-25', submissions: '12/40' },
];

const studentsData = [
    { id: 101, name: 'Aarav Patel', class: '10th-B', attendance: '95%', avgGrade: 'A' },
    { id: 102, name: 'Diya Mehta', class: '10th-B', attendance: '98%', avgGrade: 'A+' },
    { id: 103, name: 'Rohan Sharma', class: '10th-B', attendance: '72%', avgGrade: 'C' },
    // ... more students
];

// Reusable Card Component
const Card = ({ children, className }) => (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
        {children}
    </div>
);

// --- MAIN COMPONENTS ---
const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'dashboard', icon: <HomeIcon />, label: 'Dashboard' },
        { id: 'attendance', icon: <CheckSquareIcon />, label: 'Attendance' },
        { id: 'resources', icon: <BoxIcon />, label: 'Resources' },
        { id: 'assignments', icon: <FileTextIcon />, label: 'Assignments' },
        { id: 'students', icon: <UsersIcon />, label: 'Students' },
        { id: 'communication', icon: <MessageSquareIcon />, label: 'Communication' },
    ];

    return (
        <aside className="w-64 bg-gray-800 text-white flex flex-col">
            <div className="h-20 flex items-center justify-center text-2xl font-bold">ShikshaShelf</div>
            <nav className="flex-1 px-4 py-4">{navItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                        activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                >
                    <span className="mr-3">{item.icon}</span>
                    {item.label}
                </button>
            ))}</nav>
        </aside>
    );
};

const Header = ({ user, onLogout }) => (
    <header className="bg-white h-20 shadow-md flex items-center justify-between px-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {user.name.split(' ')[0]}</h1>
            <p className="text-gray-500">{user.subject}</p>
        </div>
        <div className="flex items-center space-x-4">
            <button className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-red-600 transition-colors">
                <AlertTriangleIcon className="mr-2" />
                SOS
            </button>
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">
                {user.name.charAt(4)}
            </div>
             <button onClick={onLogout} className="text-gray-500 hover:text-red-600" title="Log Out">
                <LogOutIcon />
            </button>
        </div>
    </header>
);

const DashboardView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col items-center justify-center bg-blue-50">
                    <div className="text-5xl font-bold text-blue-600">{dashboardData.todayClasses}</div>
                    <div className="text-gray-600 mt-2">Classes Today</div>
                </Card>
                <Card className="flex flex-col items-center justify-center bg-yellow-50">
                    <div className="text-5xl font-bold text-yellow-600">{dashboardData.pendingSubmissions}</div>
                    <div className="text-gray-600 mt-2">Pending Submissions</div>
                </Card>
                 <Card className="flex flex-col items-center justify-center bg-green-50">
                    <div className="text-5xl font-bold text-green-600">{dashboardData.upcomingPTMs}</div>
                    <div className="text-gray-600 mt-2">Upcoming PTMs</div>
                </Card>
            </div>
            <Card>
                <h2 className="font-bold text-lg mb-4">Today's Schedule</h2>
                <ul className="space-y-3">
                    {dashboardData.schedule.map(item => (
                        <li key={item.time} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                            <span className="font-semibold text-gray-700">{item.time}</span>
                            <span className="text-gray-600">{item.class} - {item.subject}</span>
                            <button className="bg-blue-500 text-white text-sm px-3 py-1 rounded-md hover:bg-blue-600">Start Class</button>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
        <Card className="lg:col-span-1 bg-red-50 border-l-4 border-red-400">
            <h2 className="font-bold text-lg mb-4 text-red-800 flex items-center">
                <AlertTriangleIcon className="mr-2"/>
                AI Assistant: At-Risk Students
            </h2>
             <ul className="space-y-4">
                 {dashboardData.atRiskStudents.map((student, i) => (
                    <li key={i} className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-sm text-red-700">{student.reason}</p>
                    </li>
                 ))}
             </ul>
        </Card>
    </div>
);

const AttendanceView = () => (
    <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl">Smart Attendance</h2>
            <div className="flex items-center space-x-2">
                <span className="text-gray-600">Select Class:</span>
                <select className="p-2 border rounded-md">
                    <option>10th-A</option>
                    <option>10th-B</option>
                    <option>9th-C</option>
                </select>
            </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 text-center text-white mb-6">
            <p className="mb-4">Live camera feed would be displayed here for facial recognition.</p>
            <button className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600">Start Attendance Scan</button>
        </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-green-100 p-4 rounded-lg">
                <div className="text-3xl font-bold text-green-700">38</div>
                <div className="text-sm text-green-800">Present</div>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
                <div className="text-3xl font-bold text-red-700">2</div>
                <div className="text-sm text-red-800">Absent</div>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-700">0</div>
                <div className="text-sm text-yellow-800">On Leave</div>
            </div>
             <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-3xl font-bold text-blue-700">95%</div>
                <div className="text-sm text-blue-800">Attendance %</div>
            </div>
        </div>
    </Card>
);

const AssignmentsView = () => (
     <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl">Assignment Hub</h2>
             <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Create New Assignment</button>
        </div>
         <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Title</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Class</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Due Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Submissions</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {assignmentsData.map((res) => (
                        <tr key={res.id} className="border-b">
                            <td className="py-3 px-4 font-medium">{res.title}</td>
                            <td className="py-3 px-4">{res.class}</td>
                            <td className="py-3 px-4">{res.due}</td>
                            <td className="py-3 px-4">
                                <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">{res.submissions}</span>
                            </td>
                            <td className="py-3 px-4">
                                <button className="text-blue-600 hover:underline">View & Grade</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);

const StudentsView = () => (
     <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-xl">Student Roster</h2>
             <input type="text" placeholder="Search for a student..." className="p-2 border rounded-md w-64"/>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Class</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Attendance</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Avg. Grade</th>
                    </tr>
                </thead>
                <tbody>
                    {studentsData.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{student.id}</td>
                            <td className="py-3 px-4 font-medium">{student.name}</td>
                            <td className="py-3 px-4">{student.class}</td>
                            <td className="py-3 px-4">{student.attendance}</td>
                             <td className="py-3 px-4 font-bold text-blue-600">{student.avgGrade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </Card>
);


// --- App Component ---
export default function TeacherDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    // This function can stay exactly as it is
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            case 'attendance': return <AttendanceView />;
            case 'resources': return <Card><h1 className="text-2xl font-bold">Resource Management (Coming Soon)</h1></Card>;
            case 'assignments': return <AssignmentsView />;
            case 'students': return <StudentsView />;
            case 'communication': return <Card><h1 className="text-2xl font-bold">Communication Suite (Coming Soon)</h1></Card>;
            default: return <DashboardView />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Notice we are passing the onLogout function to the Header here */}
                <Header user={teacherUser} onLogout={onLogout} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}
