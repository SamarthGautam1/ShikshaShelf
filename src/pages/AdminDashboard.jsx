import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import logo from '../assets/logo dashboard.png'; 

// --- Helper Components & Icons ---
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>;
const FileDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="m15 15-3 3-3-3"/></svg>;
const LogOutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>;

// --- MOCK DATA ---
const adminUser = { name: 'Principal Sharma' };
const adminStats = {
    totalStudents: 1250,
    totalTeachers: 85,
    overallAttendance: 93,
    taskEngagement: 76,
};
const attendanceTrend = [
    { day: 'Mon', attendance: 94 }, { day: 'Tue', attendance: 95 },
    { day: 'Wed', attendance: 92 }, { day: 'Thu', attendance: 91 },
    { day: 'Fri', attendance: 89 },
];
const allUsers = {
    students: [
        { id: 'S101', name: 'Aarav Patel', class: 'B.Sc Sem III' },
        { id: 'S102', name: 'Diya Mehta', class: 'B.Sc Sem III' },
    ],
    teachers: [
        { id: 'T01', name: 'Anjali Desai', subject: 'Advanced Mathematics' },
        { id: 'T02', name: 'Vikram Singh', subject: 'Data Structures' },
    ]
};
const academicCalendar = [
    { id: 1, date: '2025-09-25', event: 'Mid-Term Exams Begin' },
    { id: 2, date: '2025-10-02', event: 'Gandhi Jayanti Holiday' },
];

// --- Reusable Components ---
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>;

// --- View Components ---
const DashboardView = () => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="flex flex-col items-center justify-center bg-blue-50"><div className="text-5xl font-bold text-blue-600">{adminStats.totalStudents}</div><div className="text-gray-600 mt-2">Total Students</div></Card>
            <Card className="flex flex-col items-center justify-center bg-green-50"><div className="text-5xl font-bold text-green-600">{adminStats.totalTeachers}</div><div className="text-gray-600 mt-2">Total Teachers</div></Card>
            <Card className="flex flex-col items-center justify-center bg-yellow-50"><div className="text-5xl font-bold text-yellow-600">{adminStats.overallAttendance}%</div><div className="text-gray-600 mt-2">Overall Attendance</div></Card>
            <Card className="flex flex-col items-center justify-center bg-purple-50"><div className="text-5xl font-bold text-purple-600">{adminStats.taskEngagement}%</div><div className="text-gray-600 mt-2">Task Engagement</div></Card>
        </div>
        <Card>
            <h2 className="font-bold text-xl mb-4">Weekly Attendance Trend</h2>
            <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceTrend} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis domain={[80, 100]} unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} name="Attendance %" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    </div>
);

const UserManagementView = () => {
    const [activeTab, setActiveTab] = useState('students');
    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">User Management</h2>
                <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700">Add New User</button>
            </div>
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6">
                    <button onClick={() => setActiveTab('students')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'students' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Students</button>
                    <button onClick={() => setActiveTab('teachers')} className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'teachers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Teachers</button>
                </nav>
            </div>
            <div className="mt-6 overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-gray-50"><tr>
                        <th className="text-left py-3 px-4 font-semibold text-sm">User ID</th><th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">{activeTab === 'students' ? 'Class' : 'Subject'}</th><th className="text-left py-3 px-4 font-semibold text-sm">Actions</th></tr></thead>
                    <tbody>
                        {(activeTab === 'students' ? allUsers.students : allUsers.teachers).map(user => (
                            <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{user.id}</td><td className="py-3 px-4 font-medium">{user.name}</td>
                                <td className="py-3 px-4">{user.class || user.subject}</td>
                                <td className="py-3 px-4 space-x-2"><button className="text-blue-600 hover:underline text-sm">Edit</button><button className="text-red-600 hover:underline text-sm">Delete</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

const SettingsView = () => (
    <div className="space-y-6">
        <Card>
            <h2 className="font-bold text-xl mb-4">Academic Calendar</h2>
            <div className="space-y-3">
                {academicCalendar.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg"><p><span className="font-semibold">{item.date}:</span> {item.event}</p><button className="text-red-600 hover:underline text-sm">Remove</button></div>
                ))}
            </div>
             <div className="mt-4 flex items-center space-x-2"><input type="date" className="p-2 border rounded-md"/><input type="text" placeholder="Event Name" className="flex-1 p-2 border rounded-md"/><button className="bg-blue-600 text-white py-2 px-4 rounded-lg">Add Event</button></div>
        </Card>
         <Card>
            <h2 className="font-bold text-xl mb-4">System Configuration</h2>
            <div className="space-y-4">
                <div className="flex justify-between items-center"><p className="font-medium">Enable Facial Recognition Attendance</p><label className="switch"><input type="checkbox"/><span className="slider round"></span></label></div>
                <div className="flex justify-between items-center"><p className="font-medium">Auto-suggest tasks based on performance</p><label className="switch"><input type="checkbox" defaultChecked/><span className="slider round"></span></label></div>
            </div>
        </Card>
    </div>
);

const ReportsView = () => (
     <Card>
        <h2 className="font-bold text-xl mb-4">Generate Official Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
            <div className="space-y-4">
                <div><label className="text-sm font-medium text-gray-700">Report Type</label><select className="mt-1 block w-full p-2 border rounded-md"><option>Monthly Attendance</option><option>Student Performance Summary</option><option>Task Engagement Report</option></select></div>
                <div><label className="text-sm font-medium text-gray-700">Date Range</label><input type="date" className="mt-1 block w-full p-2 border rounded-md"/></div>
                 <button className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"><FileDownIcon className="mr-2"/>Generate & Download Report</button>
            </div>
            <div>
                 <h3 className="font-semibold mb-2">Recently Generated</h3>
                 <p className="text-center text-gray-500 p-8 border-2 border-dashed rounded-lg">No reports generated yet.</p>
            </div>
        </div>
    </Card>
);


// --- Main App Structure ---
export default function AdminDashboard({ onLogout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const navItems = [
        { id: 'dashboard', icon: <HomeIcon />, label: 'Dashboard' },
        { id: 'users', icon: <UsersIcon />, label: 'User Management' },
        { id: 'settings', icon: <SettingsIcon />, label: 'System Settings' },
        { id: 'reports', icon: <FileDownIcon />, label: 'Reports' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardView />;
            case 'users': return <UserManagementView />;
            case 'settings': return <SettingsView />;
            case 'reports': return <ReportsView />;
            default: return <DashboardView />;
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
                        <h1 className="text-xl font-bold text-gray-800">Administrator Dashboard</h1>
                        <p className="text-gray-500 text-sm">{adminUser.name}</p>
                    </div>
                     <button onClick={onLogout} className="text-gray-500 hover:text-red-600" title="Log Out"><LogOutIcon /></button>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    {renderContent()}
                </main>
            </div>
             {/* Simple CSS for toggle switch */}
             <style>{`.switch{position:relative;display:inline-block;width:60px;height:34px;}.switch input{opacity:0;width:0;height:0;}.slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#ccc;transition:.4s;}.slider:before{position:absolute;content:"";height:26px;width:26px;left:4px;bottom:4px;background-color:white;transition:.4s;}input:checked+.slider{background-color:#2196F3;}input:checked+.slider:before{transform:translateX(26px);}.slider.round{border-radius:34px;}.slider.round:before{border-radius:50%;}`}</style>
        </div>
    );
}
