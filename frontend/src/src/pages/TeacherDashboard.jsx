import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BroadcastChannel } from 'broadcast-channel';
import logo from '../assets/logo dashboard.png'; 

// --- Helper Components & Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CheckSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
const UploadCloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const MessageSquareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const AlertTriangleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const QrCodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h.01"/></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;

// --- MOCK DATA ---
const teacherUser = { name: 'Anjali Desai', subject: 'Advanced Mathematics' };
const atRiskStudents = [
    { name: 'Rohan Sharma', reason: 'Attendance dropped by 20% this month.' },
    { name: 'Priya Singh', reason: 'Has not completed any suggested tasks in 2 weeks.' },
];
const attendanceData = [
    { id: 101, name: 'Aarav Patel', status: 'Present' }, { id: 102, name: 'Diya Mehta', status: 'Present' },
    { id: 103, name: 'Rohan Sharma', status: 'Absent' }, { id: 104, name: 'Vihaan Joshi', status: 'Present' },
];
const assignmentsData = [
    { id: 1, title: 'Calculus Problem Set 4', class: 'B.Sc Sem III', due: '2025-09-20', submissions: '35/41' },
    { id: 2, title: 'Lab Report: Statistical Models', class: 'B.Sc Sem III', due: '2025-09-25', submissions: '12/40' },
];
const contentData = [
    { id: 1, title: 'Lecture Notes: Derivatives', type: 'PDF', subject: 'Calculus', uploaded: '2025-09-10' },
    { id: 2, title: 'Intro to Bayes\' Theorem', type: 'Video Link', subject: 'Statistics', uploaded: '2025-09-12' },
];
const fullStudentsData = [
    { id: 101, name: 'Aarav Patel', attendance: '95%', avgGrade: 'A', taskCompletion: '85%' },
    { id: 102, name: 'Diya Mehta', attendance: '98%', avgGrade: 'A+', taskCompletion: '92%' },
    { id: 103, name: 'Rohan Sharma', attendance: '72%', avgGrade: 'C', taskCompletion: '30%' },
    { id: 104, name: 'Vihaan Joshi', attendance: '91%', avgGrade: 'B+', taskCompletion: '78%' },
];
const insightsData = {
    taskCompletionRate: 78,
    topStudents: ['Diya Mehta', 'Aarav Patel'],
    commonStruggles: ['Calculus Derivatives', 'Advanced Statistics'],
};

// --- Reusable Components ---
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>;

// --- View Components ---

const DashboardView = ({ setActiveTab }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <h2 className="font-bold text-lg mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button onClick={() => setActiveTab('attendance')} className="flex flex-col items-center justify-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        <CheckSquareIcon className="w-8 h-8 text-blue-600"/>
                        <span className="mt-2 text-sm font-semibold text-blue-800 text-center">Start Attendance</span>
                    </button>
                     <button onClick={() => setActiveTab('assignments')} className="flex flex-col items-center justify-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                        <FileTextIcon className="w-8 h-8 text-green-600"/>
                        <span className="mt-2 text-sm font-semibold text-green-800 text-center">New Assignment</span>
                    </button>
                     <button onClick={() => setActiveTab('communication')} className="flex flex-col items-center justify-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                        <MessageSquareIcon className="w-8 h-8 text-purple-600"/>
                        <span className="mt-2 text-sm font-semibold text-purple-800 text-center">Send Announcement</span>
                    </button>
                    <button onClick={() => setActiveTab('content')} className="flex flex-col items-center justify-center p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
                        <UploadCloudIcon className="w-8 h-8 text-yellow-600"/>
                        <span className="mt-2 text-sm font-semibold text-yellow-800 text-center">Upload Content</span>
                    </button>
                </div>
            </Card>
             <Card>
                <h2 className="font-bold text-lg mb-4">Today's Schedule</h2>
                <p className="text-gray-500">Your scheduled classes for today will appear here.</p>
            </Card>
        </div>
        <Card className="lg:col-span-1 bg-orange-50 border-l-4 border-orange-400">
            <h2 className="font-bold text-lg mb-4 text-orange-800 flex items-center"><AlertTriangleIcon className="mr-2"/>AI Productivity Insights</h2>
            <p className="text-sm text-gray-600 mb-4">Students flagged for low engagement with suggested free-period tasks.</p>
             <ul className="space-y-4">
                 {atRiskStudents.map((student, i) => (
                    <li key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <p className="font-bold text-gray-800">{student.name}</p>
                        <p className="text-sm text-orange-700">{student.reason}</p>
                    </li>
                 ))}
             </ul>
        </Card>
    </div>
);

const AttendanceView = () => {
    const [mode, setMode] = useState(null);
    const [qrValue, setQrValue] = useState('');
    const channel = new BroadcastChannel('shikshashelf_attendance');

    const startQR = () => {
        setMode('qr');
        const sessionData = { class: 'B.Sc Sem III', sessionId: `SESS_${Date.now()}` };
        setQrValue(JSON.stringify(sessionData));
        // Send the session ID to any listening student dashboards
        channel.postMessage({ type: 'SESSION_START', sessionId: sessionData.sessionId });
    };
    const startFace = () => setMode('face');
    return (
        <Card>
            <h2 className="font-bold text-xl mb-4">Attendance Hub</h2>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">Select Class</label>
                    <select id="class-select" className="mt-1 p-2 border rounded-md"><option>B.Sc Physics - Semester III</option><option>M.Sc Physics - Semester I</option></select>
                </div>
                {!mode ? (
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <button onClick={startQR} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700"><QrCodeIcon className="mr-2"/>Start QR Session</button>
                        <button onClick={startFace} className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-purple-700"><CameraIcon className="mr-2"/>Start Camera Scan</button>
                    </div>
                ) : (
                    <button onClick={() => setMode(null)} className="bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 mt-4 sm:mt-0">End Session</button>
                )}
            </div>
            {mode === 'qr' && (
                <div className="text-center p-6 bg-gray-100 rounded-lg"><h3 className="font-semibold mb-4">Project this QR Code for students to scan.</h3><div className="bg-white p-4 inline-block rounded-lg shadow-lg"><QRCode value={qrValue} size={200} /></div></div>
            )}
            {mode === 'face' && (
                <div className="text-center p-6 bg-gray-100 rounded-lg"><h3 className="font-semibold mb-4">Facial Recognition Scan Active</h3><div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center text-white">(Live camera feed placeholder for prototype)</div></div>
            )}
            {mode && (
                <div className="mt-6"><h3 className="font-bold text-lg mb-4">Live Roster - B.Sc Physics - Semester III</h3><div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {attendanceData.map(student => (
                        <div key={student.id} className={`p-3 rounded-lg text-center border-2 ${student.status === 'Present' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'}`}><p className="font-semibold text-sm">{student.name}</p><p className={`text-xs font-bold ${student.status === 'Present' ? 'text-green-800' : 'text-red-800'}`}>{student.status}</p></div>
                    ))}
                </div></div>
            )}
        </Card>
    );
};

const AssignmentsView = () => (
     <Card>
        <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-xl">Assignments & Grading Hub</h2><button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Create New Assignment</button></div>
         <div className="overflow-x-auto"><table className="min-w-full bg-white"><thead className="bg-gray-100"><tr>
            <th className="text-left py-3 px-4 font-semibold text-sm">Title</th><th className="text-left py-3 px-4 font-semibold text-sm">Class</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Due Date</th><th className="text-left py-3 px-4 font-semibold text-sm">Submissions</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Actions</th></tr></thead>
            <tbody>{assignmentsData.map((res) => (<tr key={res.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{res.title}</td><td className="py-3 px-4">{res.class}</td>
                <td className="py-3 px-4">{res.due}</td><td className="py-3 px-4"><span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-800">{res.submissions}</span></td>
                <td className="py-3 px-4"><button className="text-blue-600 hover:underline text-sm">View & Grade</button></td></tr>))}
            </tbody></table></div>
    </Card>
);

const InsightsView = () => {
    const chartData = [
        { name: 'Completed Tasks', value: insightsData.taskCompletionRate, fill: '#22c55e' },
        { name: 'Incomplete Tasks', value: 100 - insightsData.taskCompletionRate, fill: '#ef4444' },
    ];
    return (
        <Card>
            <h2 className="font-bold text-xl mb-4">Student Productivity Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Free Period Task Completion Rate</h3>
                    <div className="w-full h-80 bg-gray-50 p-4 rounded-lg">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" domain={[0, 100]} unit="%" />
                                <YAxis type="category" dataKey="name" width={120} />
                                <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                                <Bar dataKey="value" barSize={40} name="Percentage" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Engagement Highlights</h3>
                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium text-gray-600 mb-2">Most Engaged Students</h4>
                            <ul className="space-y-2">{insightsData.topStudents.map(name => <li key={name} className="bg-green-50 p-3 rounded-md text-green-800 font-semibold">{name}</li>)}</ul>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-600 mb-2">Commonly Skipped Topics</h4>
                            <ul className="space-y-2">{insightsData.commonStruggles.map(topic => <li key={topic} className="bg-red-50 p-3 rounded-md text-red-800 font-semibold">{topic}</li>)}</ul>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const ContentView = () => (
    <Card>
        <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-xl">Content & Task Manager</h2><button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600">Upload New Content</button></div>
        <p className="text-gray-600 mb-4 text-sm">Upload your own resources (notes, links, etc.). The AI will use these to create personalized task suggestions for students.</p>
        <table className="min-w-full bg-white"><thead className="bg-gray-100"><tr>
            <th className="text-left py-3 px-4 font-semibold text-sm">Title</th><th className="text-left py-3 px-4 font-semibold text-sm">Type</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Subject</th><th className="text-left py-3 px-4 font-semibold text-sm">Date Uploaded</th></tr></thead>
            <tbody>{contentData.map(res => <tr key={res.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{res.title}</td><td className="py-3 px-4">{res.type}</td>
                <td className="py-3 px-4">{res.subject}</td><td className="py-3 px-4">{res.uploaded}</td></tr>)}
            </tbody></table>
    </Card>
);

const StudentsView = () => (
    <Card>
        <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-xl">Student Roster</h2><input type="text" placeholder="Search for a student..." className="p-2 border rounded-md w-64"/></div>
        <div className="overflow-x-auto"><table className="min-w-full bg-white"><thead className="bg-gray-100"><tr>
            <th className="text-left py-3 px-4 font-semibold text-sm">ID</th><th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Attendance</th><th className="text-left py-3 px-4 font-semibold text-sm">Avg. Grade</th>
            <th className="text-left py-3 px-4 font-semibold text-sm">Task Completion</th></tr></thead>
            <tbody>{fullStudentsData.map(student => <tr key={student.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{student.id}</td><td className="py-3 px-4 font-medium">{student.name}</td>
                <td className="py-3 px-4">{student.attendance}</td><td className="py-3 px-4 font-bold text-blue-600">{student.avgGrade}</td>
                <td className="py-3 px-4 font-bold text-green-600">{student.taskCompletion}</td></tr>)}
            </tbody></table></div>
    </Card>
);

const CommunicationView = () => (
    <Card>
        <h2 className="font-bold text-xl mb-4">Communication Suite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <h3 className="font-semibold text-lg mb-2">Post a New Announcement</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Select Class(es)</label>
                        <select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"><option>All Classes</option><option>B.Sc Physics - Semester III</option></select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Message</label>
                        <textarea rows="4" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., The test scheduled for Friday has been postponed..."></textarea>
                    </div>
                    <button className="w-full bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700">Post Announcement</button>
                </div>
            </div>
            <div>
                <h3 className="font-semibold text-lg mb-2">Recent Announcements</h3>
                <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="font-semibold">PTM for Semester III</p><p className="text-xs text-gray-500">Posted on: 2025-09-15</p></div>
                    <div className="bg-gray-50 p-3 rounded-lg"><p className="font-semibold">Lab reports submission deadline extended</p><p className="text-xs text-gray-500">Posted on: 2025-09-14</p></div>
                </div>
            </div>
        </div>
    </Card>
);

// --- Main App Structure ---
export default function TeacherDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');

    const navItems = [
        { id: 'dashboard', icon: <HomeIcon />, label: 'Dashboard' },
        { id: 'attendance', icon: <CheckSquareIcon />, label: 'Attendance' },
        { id: 'insights', icon: <BarChartIcon />, label: 'Productivity Insights' },
        { id: 'content', icon: <UploadCloudIcon />, label: 'Content Manager' },
        { id: 'assignments', icon: <FileTextIcon />, label: 'Assignments' },
        { id: 'students', icon: <UsersIcon />, label: 'Students' },
        { id: 'communication', icon: <MessageSquareIcon />, label: 'Communication' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView setActiveTab={setActiveTab} />;
            case 'attendance': return <AttendanceView />;
            case 'assignments': return <AssignmentsView />;
            case 'insights': return <InsightsView />;
            case 'content': return <ContentView />;
            case 'students': return <StudentsView />;
            case 'communication': return <CommunicationView />;
            default: return <DashboardView setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-20 lg:w-64 bg-gray-800 text-white flex flex-col transition-all duration-300">
                            <button onClick={() => setActiveTab('dashboard')} className="h-20 w-full flex items-center justify-center p-2 transition-opacity duration-200 hover:opacity-80">
                                                <img src={logo} alt="E-Shiksha Logo" className="h-60 w-auto" />
                                            </button>
                            <nav className="flex-1 px-2 lg:px-4 py-4">
                                {navItems.map(item => (
                                    <button key={item.id} onClick={() => setActiveTab(item.id)} title={item.label}
                                        className={`w-full flex items-center justify-center lg:justify-start px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                                            activeTab === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                        }`}>
                                        <span className="lg:mr-3">{item.icon}</span>
                                        <span className="hidden lg:inline">{item.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white h-20 shadow-md flex-shrink-0 flex items-center justify-between px-8">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">Teacher Dashboard</h1>
                        <p className="text-gray-500 text-sm">{teacherUser.name} | {teacherUser.subject}</p>
                    </div>
                     <button onClick={onLogout} className="text-gray-500 hover:text-red-600" title="Log Out"><LogOutIcon /></button>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

