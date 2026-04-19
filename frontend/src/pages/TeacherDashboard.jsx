import { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'react-qr-code';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import logo from '../assets/logo dashboard.png';
import { generateQRToken, recognizeFace } from '../api/attendance.js';
import { getTeacherClasses, getTeacherStudents } from '../api/classes.js';
import { getTeacherInsights } from '../api/insights.js';
import { getTeacherTodayTimetable } from '../api/timetable.js';
import useAttendanceSocket from '../hooks/useAttendanceSocket.js';

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
const assignmentsData = [
    { id: 1, title: 'Calculus Problem Set 4', class: 'B.Sc Sem III', due: '2025-09-20', submissions: '35/41' },
    { id: 2, title: 'Lab Report: Statistical Models', class: 'B.Sc Sem III', due: '2025-09-25', submissions: '12/40' },
];
const contentData = [
    { id: 1, title: 'Lecture Notes: Derivatives', type: 'PDF', subject: 'Calculus', uploaded: '2025-09-10' },
    { id: 2, title: 'Intro to Bayes\' Theorem', type: 'Video Link', subject: 'Statistics', uploaded: '2025-09-12' },
];
// --- Reusable Components ---
const Card = ({ children, className }) => <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>{children}</div>;
Card.propTypes = { children: PropTypes.node, className: PropTypes.string };

// --- View Components ---

const DashboardView = ({ setActiveTab, token }) => {
    const [timetable, setTimetable] = useState(null);
    const [insights, setInsights] = useState(null);
    const [timetableLoading, setTimetableLoading] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(true);
    const [timetableError, setTimetableError] = useState(null);
    const [insightsError, setInsightsError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setTimetableLoading(true);
        setInsightsLoading(true);
        setTimetableError(null);
        setInsightsError(null);

        const timetablePromise = getTeacherTodayTimetable(token)
            .then((data) => { if (!cancelled) setTimetable(data); })
            .catch((err) => { if (!cancelled) setTimetableError(err.message); })
            .finally(() => { if (!cancelled) setTimetableLoading(false); });

        const insightsPromise = getTeacherInsights(token)
            .then((data) => { if (!cancelled) setInsights(data); })
            .catch((err) => { if (!cancelled) setInsightsError(err.message); })
            .finally(() => { if (!cancelled) setInsightsLoading(false); });

        Promise.all([timetablePromise, insightsPromise]);
        return () => { cancelled = true; };
    }, [token]);

    const entries = timetable?.entries ?? [];
    const atRiskList = insights?.at_risk_students ?? [];

    return (
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
                    <h2 className="font-bold text-lg mb-4">Today&apos;s Schedule</h2>
                    {timetableLoading ? (
                        <div className="flex items-center py-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-500 text-sm">Loading schedule...</span>
                        </div>
                    ) : timetableError ? (
                        <p className="text-red-600 text-sm">Failed to load schedule: {timetableError}</p>
                    ) : entries.length === 0 ? (
                        <p className="text-gray-500">No classes scheduled for today.</p>
                    ) : (
                        <ul className="space-y-3">
                            {entries.map((entry, i) => (
                                <li key={i} className="flex items-start justify-between bg-gray-50 p-3 rounded-lg">
                                    <div>
                                        <p className="font-bold text-gray-800">{entry.class_name}</p>
                                        <p className="text-sm text-gray-500">{entry.room}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
                                        {(entry.start_time || '').slice(0, 5)} - {(entry.end_time || '').slice(0, 5)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>
            <Card className="lg:col-span-1 bg-orange-50 border-l-4 border-orange-400">
                <h2 className="font-bold text-lg mb-4 text-orange-800 flex items-center"><AlertTriangleIcon className="mr-2"/>AI Productivity Insights</h2>
                <p className="text-sm text-gray-600 mb-4">Students flagged for low engagement with suggested free-period tasks.</p>
                {insightsLoading ? (
                    <div className="flex items-center py-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
                        <span className="ml-3 text-gray-500 text-sm">Loading insights...</span>
                    </div>
                ) : insightsError ? (
                    <p className="text-red-600 text-sm">Failed to load insights: {insightsError}</p>
                ) : atRiskList.length === 0 ? (
                    <p className="text-green-600 text-sm font-medium">No at-risk students detected.</p>
                ) : (
                    <ul className="space-y-2">
                        {atRiskList.map(student => (
                            <li key={student.name} className="bg-red-50 p-3 rounded-md border border-red-100">
                                <p className="font-semibold text-red-800">{student.name}</p>
                                <p className="text-sm text-gray-600">Attendance: <span className="font-bold text-red-600">{student.attendance_rate}%</span></p>
                            </li>
                        ))}
                    </ul>
                )}
            </Card>
        </div>
    );
};
DashboardView.propTypes = { setActiveTab: PropTypes.func.isRequired, token: PropTypes.string.isRequired };

/** @constant {number} QR session duration in seconds */
const QR_SESSION_DURATION = 30;

const AttendanceView = ({ token }) => {
    const [selectedClassId, setSelectedClassId] = useState('');
    const [sessionActive, setSessionActive] = useState(false);
    const [qrToken, setQrToken] = useState('');
    const [qrError, setQrError] = useState('');
    const [qrLoading, setQrLoading] = useState(false);
    const [mode, setMode] = useState(null);
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [classesError, setClassesError] = useState('');
    const [countdown, setCountdown] = useState(QR_SESSION_DURATION);
    const [sessionExpired, setSessionExpired] = useState(false);
    const [unknownCount, setUnknownCount] = useState(0);
    const [faceError, setFaceError] = useState('');
    const timerRef = useRef(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const captureIntervalRef = useRef(null);

    useEffect(() => {
        let cancelled = false;
        setClassesLoading(true);
        setClassesError('');
        getTeacherClasses(token)
            .then((data) => {
                if (!cancelled) setClasses(data);
            })
            .catch((err) => {
                if (!cancelled) setClassesError(err.message || 'Failed to load classes.');
            })
            .finally(() => {
                if (!cancelled) setClassesLoading(false);
            });
        return () => { cancelled = true; };
    }, [token]);

    /**
     * Clear the countdown interval if one is running.
     */
    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    // Clean up the interval on component unmount
    useEffect(() => {
        return () => clearTimer();
    }, [clearTimer]);

    // Socket hook — only connects when sessionActive and classId are set
    const activeClassId = sessionActive ? selectedClassId : null;
    const { attendees, isConnected } = useAttendanceSocket(activeClassId, token);

    /**
     * Start a QR attendance session: generate a token via the API,
     * then display the QR code and activate the socket connection.
     */
    /**
     * Start a countdown timer that expires after QR_SESSION_DURATION seconds.
     * When the timer reaches 0 the QR session ends automatically.
     */
    const startCountdown = useCallback(() => {
        clearTimer();
        setCountdown(QR_SESSION_DURATION);
        setSessionExpired(false);

        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                    setMode(null);
                    setSessionActive(false);
                    setQrToken('');
                    setSessionExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [clearTimer]);

    /**
     * Tear down the camera capture loop and release the MediaStream.
     * Safe to call multiple times — no-op if nothing is active.
     */
    const stopFaceCapture = useCallback(() => {
        if (captureIntervalRef.current) {
            clearInterval(captureIntervalRef.current);
            captureIntervalRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    // Ensure the camera is always released when this view unmounts mid-scan.
    useEffect(() => {
        return () => stopFaceCapture();
    }, [stopFaceCapture]);

    const startQRSession = async () => {
        if (!selectedClassId) return;
        console.log('Starting QR session — classId:', selectedClassId);
        setQrError('');
        setQrLoading(true);
        setSessionExpired(false);
        try {
            const data = await generateQRToken(selectedClassId, token);
            if (data.success && data.data?.token) {
                setQrToken(data.data.token);
                setMode('qr');
                setSessionActive(true);
                startCountdown();
            } else {
                setQrError(data.error || 'Failed to generate QR token.');
            }
        } catch {
            setQrError('Could not connect to the server. Please try again.');
        } finally {
            setQrLoading(false);
        }
    };

    /**
     * Capture the current video frame, encode it as base64 JPEG, and POST
     * it to the backend face-recognition endpoint. Updates `unknownCount`
     * with the LATEST frame's count (not cumulative) so the teacher sees
     * how many unmatched faces the camera is currently seeing.
     * Recognized students flow back via the existing socket roster.
     */
    const captureAndRecognize = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState < 2 || !selectedClassId) return;

        const width = video.videoWidth;
        const height = video.videoHeight;
        if (!width || !height) return;

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.replace(/^data:image\/jpeg;base64,/, '');

        try {
            const res = await recognizeFace(base64, selectedClassId, token);
            if (res.success) {
                setUnknownCount(res.data?.unknown_count ?? 0);
                setFaceError('');
            } else {
                setFaceError(res.error || 'Face recognition failed.');
            }
        } catch {
            setFaceError('Could not reach the server for face recognition.');
        }
    }, [selectedClassId, token]);

    const startFace = async () => {
        if (!selectedClassId) return;
        setFaceError('');
        setUnknownCount(0);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            setMode('face');
            setSessionActive(true);

            // Wait a tick so React renders the <video> element before we attach.
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play().catch(() => {});
                }
                captureIntervalRef.current = setInterval(captureAndRecognize, 3000);
            }, 0);
        } catch (err) {
            const message = err?.name === 'NotAllowedError'
                ? 'Camera permission denied. Please allow camera access and try again.'
                : 'Unable to access camera. Please check your device and try again.';
            setFaceError(message);
        }
    };

    const stopSession = () => {
        clearTimer();
        stopFaceCapture();
        setMode(null);
        setSessionActive(false);
        setQrToken('');
        setQrError('');
        setFaceError('');
        setUnknownCount(0);
        setCountdown(QR_SESSION_DURATION);
        setSessionExpired(false);
    };

    /**
     * Format an ISO timestamp or date string into a readable time.
     * @param {string} dateStr
     * @returns {string}
     */
    const formatTime = (dateStr) => {
        try {
            return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
            return dateStr;
        }
    };

    const selectedLabel = classes.find((c) => c.id === selectedClassId)?.name || '';

    return (
        <Card>
            <h2 className="font-bold text-xl mb-4">Attendance Hub</h2>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                    <label htmlFor="class-select" className="block text-sm font-medium text-gray-700">Select Class</label>
                    <select
                        id="class-select"
                        className="mt-1 p-2 border rounded-md"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        disabled={sessionActive || classesLoading}
                    >
                        {classesLoading ? (
                            <option value="">Loading classes...</option>
                        ) : classesError ? (
                            <option value="">-- Failed to load classes --</option>
                        ) : (
                            <>
                                <option value="">-- Choose a class --</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                                ))}
                            </>
                        )}
                    </select>
                    {classesError && (
                        <p className="mt-1 text-sm text-red-600">{classesError}</p>
                    )}
                </div>
                {!sessionActive ? (
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <button
                            onClick={startQRSession}
                            disabled={!selectedClassId || qrLoading}
                            className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <QrCodeIcon className="mr-2" />
                            {qrLoading ? 'Generating...' : 'Start QR Session'}
                        </button>
                        <button
                            onClick={startFace}
                            disabled={!selectedClassId}
                            className="bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <CameraIcon className="mr-2" />Start Camera Scan
                        </button>
                    </div>
                ) : (
                    <button onClick={stopSession} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 mt-4 sm:mt-0">
                        Stop Attendance
                    </button>
                )}
            </div>

            {qrError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {qrError}
                </div>
            )}

            {faceError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {faceError}
                </div>
            )}

            {mode === 'qr' && qrToken && (
                <div className="text-center p-6 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold mb-4">Project this QR Code for students to scan.</h3>
                    <div className="bg-white p-4 inline-block rounded-lg shadow-lg">
                        <QRCode value={JSON.stringify({ token: qrToken, class_id: selectedClassId })} size={200} />
                    </div>
                    {/* Countdown timer display */}
                    <div className="mt-4 max-w-md mx-auto">
                        <div className="flex items-center justify-center mb-2">
                            <span className={`text-3xl font-bold tabular-nums ${countdown <= 10 ? 'text-red-600' : 'text-blue-700'}`}>
                                {countdown}
                            </span>
                            <span className="ml-2 text-sm text-gray-500">seconds remaining</span>
                        </div>
                        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-linear ${countdown <= 10 ? 'bg-red-500' : 'bg-blue-600'}`}
                                style={{ width: `${(countdown / QR_SESSION_DURATION) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Live -- listening for scans' : 'Connecting to server...'}
                        </span>
                    </div>
                </div>
            )}

            {sessionExpired && !sessionActive && (
                <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-semibold">
                        Session expired — click Start QR Session to begin a new one
                    </p>
                </div>
            )}

            {mode === 'face' && (
                <div className="text-center p-6 bg-gray-100 rounded-lg">
                    <h3 className="font-semibold mb-4">Facial Recognition Scan Active</h3>
                    <div className="w-full max-w-2xl mx-auto bg-gray-800 rounded-lg overflow-hidden">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-64 object-cover bg-black"
                        />
                    </div>
                    <canvas ref={canvasRef} className="hidden" />
                    <p className="mt-3 text-sm text-gray-700">
                        Unknown faces detected: <span className="font-semibold">{unknownCount}</span>
                    </p>
                    <div className="mt-3 flex items-center justify-center space-x-2">
                        <span className={`inline-block w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-600">
                            {isConnected ? 'Live -- listening for recognitions' : 'Connecting to server...'}
                        </span>
                    </div>
                </div>
            )}

            {sessionActive && (
                <div className="mt-6">
                    <h3 className="font-bold text-lg mb-4">
                        Live Roster - {selectedLabel}
                        <span className="ml-3 text-sm font-normal text-gray-500">
                            ({attendees.length} student{attendees.length !== 1 ? 's' : ''} marked)
                        </span>
                    </h3>
                    {attendees.length === 0 ? (
                        <p className="text-gray-400 text-sm">Waiting for students to scan...</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {attendees.map((entry, index) => (
                                <div
                                    key={`${entry.studentName}-${index}`}
                                    className="p-3 rounded-lg text-center border-2 bg-green-100 border-green-300"
                                >
                                    <p className="font-semibold text-sm">{entry.studentName}</p>
                                    <p className="text-xs font-bold text-green-800">{formatTime(entry.markedAt)}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
};

AttendanceView.propTypes = { token: PropTypes.string.isRequired };

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

const InsightsView = ({ token }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        async function fetchInsights() {
            try {
                setLoading(true);
                setError(null);
                const data = await getTeacherInsights(token);
                if (!cancelled) setInsights(data);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchInsights();
        return () => { cancelled = true; };
    }, [token]);

    if (loading) {
        return (
            <Card>
                <div className="flex items-center justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-500 font-medium">Loading insights...</span>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="text-center py-16">
                    <p className="text-red-600 font-semibold mb-2">Failed to load insights</p>
                    <p className="text-gray-500 text-sm">{error}</p>
                </div>
            </Card>
        );
    }

    const totalStudents = insights.total_students ?? 0;
    const classAttendance = insights.classes ?? [];
    const atRiskList = insights.at_risk_students ?? [];

    const attendanceChartData = classAttendance.map(c => ({
        name: c.class_name,
        value: c.attendance_rate,
        fill: c.attendance_rate >= 75 ? '#22c55e' : c.attendance_rate >= 50 ? '#f59e0b' : '#ef4444',
    }));

    return (
        <Card>
            <h2 className="font-bold text-xl mb-4">Student Productivity Insights</h2>
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-blue-700">{totalStudents}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Per-Class Attendance Rate</h3>
                    {attendanceChartData.length > 0 ? (
                        <div className="w-full h-80 bg-gray-50 p-4 rounded-lg">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={attendanceChartData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" domain={[0, 100]} unit="%" />
                                    <YAxis type="category" dataKey="name" width={140} />
                                    <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }} />
                                    <Bar dataKey="value" barSize={40} name="Attendance %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">No class attendance data available.</p>
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">At-Risk Students</h3>
                    {atRiskList.length > 0 ? (
                        <ul className="space-y-2">
                            {atRiskList.map(student => (
                                <li key={student.name} className="bg-red-50 p-3 rounded-md border border-red-100">
                                    <p className="font-semibold text-red-800">{student.name}</p>
                                    <p className="text-sm text-gray-600">Attendance: <span className="font-bold text-red-600">{student.attendance_rate}%</span></p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-green-600 text-sm font-medium">No at-risk students detected.</p>
                    )}
                </div>
            </div>
        </Card>
    );
};
InsightsView.propTypes = { token: PropTypes.string.isRequired };

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

const StudentsView = ({ token }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        getTeacherStudents(token)
            .then((data) => { if (!cancelled) setStudents(Array.isArray(data) ? data : []); })
            .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load students.'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [token]);

    return (
        <Card>
            <div className="flex justify-between items-center mb-6"><h2 className="font-bold text-xl">Student Roster</h2><input type="text" placeholder="Search for a student..." className="p-2 border rounded-md w-64"/></div>
            <div className="overflow-x-auto"><table className="min-w-full bg-white"><thead className="bg-gray-100"><tr>
                <th className="text-left py-3 px-4 font-semibold text-sm">ID</th><th className="text-left py-3 px-4 font-semibold text-sm">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Attendance</th><th className="text-left py-3 px-4 font-semibold text-sm">Avg. Grade</th>
                <th className="text-left py-3 px-4 font-semibold text-sm">Task Completion</th></tr></thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="py-8 text-center text-gray-500">
                            <span className="inline-flex items-center">
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></span>
                                Loading students...
                            </span>
                        </td></tr>
                    ) : error ? (
                        <tr><td colSpan="5" className="py-8 text-center text-red-600 text-sm">Failed to load students: {error}</td></tr>
                    ) : students.length === 0 ? (
                        <tr><td colSpan="5" className="py-8 text-center text-gray-500">No students found.</td></tr>
                    ) : (
                        students.map(student => (
                            <tr key={student.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{student.id}</td>
                                <td className="py-3 px-4 font-medium">{student.name} <span className="text-gray-500 font-normal text-sm">({student.class_name})</span></td>
                                <td className="py-3 px-4">{student.attendance_percentage}%</td>
                                <td className="py-3 px-4 font-bold text-blue-600">—</td>
                                <td className="py-3 px-4 font-bold text-green-600">—</td>
                            </tr>
                        ))
                    )}
                </tbody></table></div>
        </Card>
    );
};
StudentsView.propTypes = { token: PropTypes.string.isRequired };

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
export default function TeacherDashboard({ token, user, onLogout }) {
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
            case 'dashboard': return <DashboardView setActiveTab={setActiveTab} token={token} />;
            case 'attendance': return <AttendanceView token={token} />;
            case 'assignments': return <AssignmentsView />;
            case 'insights': return <InsightsView token={token} />;
            case 'content': return <ContentView />;
            case 'students': return <StudentsView token={token} />;
            case 'communication': return <CommunicationView />;
            default: return <DashboardView setActiveTab={setActiveTab} token={token} />;
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
                        <p className="text-gray-500 text-sm">{user?.name || teacherUser.name} | {teacherUser.subject}</p>
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

TeacherDashboard.propTypes = {
  token: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  onLogout: PropTypes.func.isRequired,
};
