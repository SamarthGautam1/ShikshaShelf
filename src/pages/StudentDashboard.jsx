import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import QRScannerModal from './QRScannerModal.jsx';
import { BroadcastChannel } from 'broadcast-channel';
import logo from '../assets/logo dashboard.png'; 

// --- Helper Components & Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10"/></svg>;
const BarChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>;
const BookOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const FileTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;
const HelpCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const TargetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12"cy="12" r="2"/></svg>;
const QrCodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h.01"/><path d="M21 12h.01"/><path d="M12 21h.01"/></svg>;

// --- MOCK DATA ---
const studentUser = { name: 'Aarav Mehta', goal: 'Career Goal: Data Scientist', attendance: { percentage: 92, total: 200, attended: 184 }};
const scheduleData = [ { time: '09:00 - 10:00', type: 'class', title: 'Advanced Calculus', location: 'Room 301' }, { time: '10:00 - 11:00', type: 'class', title: 'Data Structures', location: 'Lab 5' }, { time: '11:00 - 01:00', type: 'free', title: 'Free Period', location: 'Campus' }, { time: '01:00 - 02:00', type: 'break', title: 'Lunch Break', location: 'Cafeteria' }, { time: '02:00 - 04:00', type: 'free', title: 'Free Period', location: 'Campus' },];
const suggestedTasks = [ { id: 1, period: '11:00 - 01:00', title: 'Complete Python for Data Science Module 3', reason: 'Aligns with your Data Scientist goal.', duration: "45 min" }, { id: 2, period: '11:00 - 01:00', title: 'Review "Derivatives" on Khan Academy', reason: 'You scored 55% on the last Calculus quiz.', duration: "30 min" }, { id: 3, period: '02:00 - 04:00', title: 'Practice 5 problems on LeetCode (Easy)', reason: 'Builds foundational coding skills.', duration: "60 min" },];
const performanceData = { scores: [ { subject: 'Calculus', score: 55, grade: 'C' }, { subject: 'Data Structures', score: 88, grade: 'A' }, { subject: 'Statistics', score: 75, grade: 'B' }, { subject: 'English', score: 95, grade: 'A+' }, ]};
const resourcesData = [ { type: 'Notes', title: 'Lecture Notes: Big O Notation', subject: 'Data Structures', link: '#' }, { type: 'External', title: 'Khan Academy: Derivatives Introduction', subject: 'Calculus', link: '#' }, { type: 'Notes', title: 'Guide to Statistical Models', subject: 'Statistics', link: '#' },];
const assignmentsData = { gamification: { streak: 5, points: 1250 }, pending: [ { id: 1, title: 'Data Structures: Linked List Implementation', dueDate: '2025-09-18', points: 100 }, { id: 2, title: 'Calculus Problem Set 4', dueDate: '2025-09-20', points: 75 }, ], quizzes: [ { id: 1, title: 'Quiz: Probability Basics', subject: 'Statistics', attempts: '1/2' }, ]};
const doubtsData = [ { id: 1, question: 'Can you explain the difference between a list and a tuple in Python?', status: 'Answered', answer: 'Yes, the main difference is that lists are mutable (can be changed), while tuples are immutable (cannot be changed after creation).' }, { id: 2, question: 'What is the practical application of integrals?', status: 'Pending', answer: null },];

// --- Reusable Components ---
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>;

// --- View Components ---
const DashboardView = ({ setScannerOpen }) => {
    const mergedSchedule = scheduleData.map(item => {
        const itemWithIcon = { ...item, icon: item.type === 'class' ? <BookOpenIcon/> : <ClockIcon/> };
        if (item.type === 'free') {
            const tasksForPeriod = suggestedTasks.filter(task => task.period === item.time);
            return { ...itemWithIcon, tasks: tasksForPeriod };
        }
        return itemWithIcon;
    });
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                 <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Day</h1>
                    <p className="text-gray-500">Your combined schedule with personalized tasks for free periods.</p>
                </div>
                <button onClick={() => setScannerOpen(true)} className="mt-4 sm:mt-0 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 transition-colors shadow-sm">
                    <QrCodeIcon className="mr-2 h-5 w-5"/>
                    <span>Scan to Attend</span>
                </button>
            </div>
             <div className="space-y-4">
                {mergedSchedule.map((item, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start space-x-4">
                        <div className="w-28 text-right text-sm text-gray-500 font-semibold pt-1">{item.time}</div>
                        <div className="flex-shrink-0 text-gray-400 pt-1">{item.icon}</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-800">{item.title}</h3>
                            <p className="text-sm text-gray-500">{item.location}</p>
                            {item.tasks && item.tasks.length > 0 && (
                                <div className="mt-3 space-y-3">
                                    <h4 className="font-semibold text-xs text-green-700 uppercase tracking-wider">Suggested Productive Tasks:</h4>
                                    {item.tasks.map(task => (
                                        <div key={task.id} className="bg-green-50 p-3 rounded-lg border border-green-200">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-start space-x-3">
                                                    <div className="text-green-600 pt-1"><TargetIcon/></div>
                                                    <div>
                                                        <p className="font-semibold text-gray-700">{task.title}</p>
                                                        <p className="text-xs text-gray-500 italic mt-1">{task.reason}</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium bg-green-200 text-green-800 px-2 py-1 rounded-full">{task.duration}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
const AttendanceView = () => {
    const { attended, total } = studentUser.attendance;
    const absent = total - attended;
    const pieData = [{ name: 'Attended', value: attended }, { name: 'Absent', value: absent }];
    const COLORS = ['#3b82f6', '#ef4444'];
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
                <h2 className="font-bold text-xl mb-4">Attendance Overview</h2>
                <div className="space-y-3 text-lg">
                    <div className="flex justify-between"><span className="text-gray-600">Overall Percentage:</span><span className="font-bold text-blue-600">{studentUser.attendance.percentage}%</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Classes Attended:</span><span className="font-bold text-green-600">{attended}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Classes Missed:</span><span className="font-bold text-red-600">{absent}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Total Classes:</span><span className="font-bold text-gray-800">{total}</span></div>
                </div>
            </Card>
            <Card className="lg:col-span-2 flex flex-col items-center justify-center">
                 <h2 className="font-bold text-xl mb-4 self-start">Attendance Visualization</h2>
                 <div className="w-full h-64">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};
const PerformanceView = () => (
    <Card>
        <h2 className="font-bold text-xl mb-4">Performance Overview</h2>
        <div className="w-full h-96 bg-gray-50 p-4 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData.scores} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="score" fill="#3b82f6" name="Score %" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </Card>
);
const ResourcesView = () => (
    <Card>
        <h2 className="font-bold text-xl mb-4">Resource Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resourcesData.map((res, index) => (
                 <div key={index} className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
                    <span className={`px-2 py-1 text-xs rounded-full ${res.type === 'Notes' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{res.type}</span>
                    <p className="font-bold mt-2">{res.title}</p>
                    <p className="text-sm text-gray-500">{res.subject}</p>
                    <a href={res.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                        {res.type === 'Notes' ? 'Download Notes' : 'Open Link'} &rarr;
                    </a>
                </div>
            ))}
        </div>
    </Card>
);
const AssignmentsView = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="flex items-center justify-between bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <div className="font-bold text-lg"><p>Daily Streak</p><p className="text-5xl">{assignmentsData.gamification.streak} 🔥</p></div>
                <div className="text-right font-bold text-lg"><p>Total Points</p><p className="text-5xl">{assignmentsData.gamification.points} ✨</p></div>
            </Card>
             <Card>
                <h3 className="font-bold text-lg mb-2">Interactive Quizzes</h3>
                {assignmentsData.quizzes.map(quiz => (
                    <div key={quiz.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                        <div><p className="font-semibold">{quiz.title}</p><p className="text-sm text-gray-500">{quiz.subject}</p></div>
                        <button className="bg-green-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-600">Start Quiz</button>
                    </div>
                ))}
            </Card>
        </div>
        <Card>
            <h2 className="font-bold text-xl mb-4">Pending Assignments</h2>
            <div className="space-y-3">
                 {assignmentsData.pending.map(task => (
                    <div key={task.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div><p className="font-semibold">{task.title}</p><p className="text-sm text-red-600">Due: {task.dueDate}</p></div>
                        <span className="text-sm font-medium bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full">{task.points} Points</span>
                    </div>
                 ))}
            </div>
        </Card>
    </div>
);
const DoubtsView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <Card>
                 <h2 className="font-bold text-xl mb-4">Ask a New Doubt</h2>
                 <div className="space-y-4">
                     <div><label className="text-sm font-medium text-gray-700">Subject</label><select className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"><option>Calculus</option><option>Data Structures</option><option>Statistics</option></select></div>
                      <div><label className="text-sm font-medium text-gray-700">Your Question</label><textarea rows="5" className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="Type your question here..."></textarea></div>
                     <button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Submit Question</button>
                 </div>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card>
                <h2 className="font-bold text-xl mb-4">Previous Doubts</h2>
                <div className="space-y-4">
                    {doubtsData.map(doubt => (
                        <details key={doubt.id} className="bg-gray-50 p-4 rounded-lg group">
                            <summary className="font-semibold cursor-pointer flex justify-between items-center">{doubt.question}<span className={`text-xs font-bold px-2 py-1 rounded-full ${doubt.status === 'Answered' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>{doubt.status}</span></summary>
                            {doubt.answer && (<div className="mt-3 pt-3 border-t text-gray-700"><p><strong className="font-semibold">Answer:</strong> {doubt.answer}</p></div>)}
                        </details>
                    ))}
                </div>
            </Card>
        </div>
    </div>
);

// --- Main App Structure ---
export default function StudentDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isScannerOpen, setScannerOpen] = useState(false);
    const [attendanceStatus, setAttendanceStatus] = useState('No active session.');

    useEffect(() => {
        const channel = new BroadcastChannel('shikshashelf_attendance');
        channel.onmessage = (msg) => {
            if (msg.type === 'SESSION_START') {
                setAttendanceStatus(`Scanning for Session ${msg.sessionId.slice(-5)}...`);
                setTimeout(() => {
                    setAttendanceStatus(`Attendance Marked for Session ${msg.sessionId.slice(-5)} ✅`);
                }, 2000);
            }
        };
        return () => { channel.close(); };
    }, []);

    const handleScanSuccess = (decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            setAttendanceStatus(`Marked Present for "${data.class}" ✅`);
        } catch (e) { setAttendanceStatus("Invalid QR Code Scanned!"); }
        setScannerOpen(false);
    };

    const navItems = [
        { id: 'dashboard', icon: <HomeIcon />, label: 'My Day' },
        { id: 'attendance', icon: <CalendarIcon />, label: 'Attendance' },
        { id: 'performance', icon: <BarChartIcon />, label: 'Performance' },
        { id: 'resources', icon: <BookOpenIcon />, label: 'Resources' },
        { id: 'assignments', icon: <FileTextIcon />, label: 'Assignments' },
        { id: 'doubts', icon: <HelpCircleIcon />, label: 'Ask a Doubt' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView setScannerOpen={setScannerOpen} />;
            case 'attendance': return <AttendanceView />;
            case 'performance': return <PerformanceView />;
            case 'resources': return <ResourcesView />;
            case 'assignments': return <AssignmentsView />;
            case 'doubts': return <DoubtsView />;
            default: return <DashboardView setScannerOpen={setScannerOpen} />;
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
                        <h1 className="text-xl font-bold text-gray-800">Student Dashboard</h1>
                        <p className="text-gray-500 text-sm">{studentUser.name} | {studentUser.goal}</p>
                    </div>
                     <div className="flex items-center space-x-4">
                        <div className={`text-sm font-semibold transition-opacity duration-300 ${attendanceStatus.includes("Marked") ? 'text-green-600' : 'text-gray-500'}`}>{attendanceStatus}</div>
                        <button onClick={onLogout} className="text-gray-500 hover:text-red-600" title="Log Out"><LogOutIcon /></button>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {renderContent()}
                </main>
            </div>
            {isScannerOpen && <QRScannerModal onClose={() => setScannerOpen(false)} onScanSuccess={handleScanSuccess} />}
        </div>
    );
}
