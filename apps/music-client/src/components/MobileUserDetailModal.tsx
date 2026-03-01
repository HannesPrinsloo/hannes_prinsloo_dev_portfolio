import React, { useState } from 'react';
import type { UserData, RosterEntry, AdminLesson } from '../types';

interface MobileUserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserData | null;
    onEdit: (user: UserData) => void;
    onDelete: (userId: number) => void;
    // Optional props for Students specific actions
    teachers?: { id: number, name: string }[];
    onAssignTeacher?: (userId: number, teacherId: string) => void;
    mainTab: string; // 'Students' | 'Teachers' | 'Managers' | 'Admins'
    // Optional props for Teacher specific views
    teacherRoster?: RosterEntry[];
    teacherSchedule?: AdminLesson[];
}

const MobileUserDetailModal: React.FC<MobileUserDetailModalProps> = ({
    isOpen, onClose, user, onEdit, onDelete, teachers, onAssignTeacher, mainTab,
    teacherRoster = [], teacherSchedule = []
}) => {
    const [activeTab, setActiveTab] = useState<'info' | 'actions' | 'academic' | 'roster' | 'attendance'>('info');

    if (!isOpen || !user) return null;

    // Helper to calc stats for a student
    const getStudentStats = (studentId: number) => {
        const lessons = teacherSchedule.filter(l => Number(l.student_id) === Number(studentId));
        const present = lessons.filter(l => l.attendance_status === 'Present').length;
        const absent = lessons.filter(l => l.attendance_status === 'Absent').length;
        const pending = lessons.filter(l => !l.attendance_status || l.attendance_status === 'Pending').length;
        return { present, absent, pending };
    };

    return (
        /* CHANGELOG: Refactored MobileUserDetailModal layout and buttons to use Tailwind CSS utility classes instead of inline styles and global classes. */
        <div
            className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-[2px] p-5"
            onClick={onClose}
        >
            <div
                className="bg-white text-text-dark w-full max-w-[400px] rounded-xl p-5 max-h-[85vh] flex flex-col relative shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden outline-none"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#666',
                        zIndex: 10,
                        outline: 'none', // Remove focus ring from close button too just in case
                        WebkitTapHighlightColor: 'transparent'
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', paddingRight: '30px' }}>
                    {user.first_name} {user.last_name}
                </h2>

                {/* Styled Tabs */}
                <div className="flex flex-wrap gap-2 mb-5 border-b border-[#eee] pb-2.5">
                    {[
                        { id: 'info', label: 'Info', show: true },
                        { id: 'academic', label: 'Academic', show: mainTab === 'Students' },
                        { id: 'roster', label: 'Roster', show: mainTab === 'Teachers' },
                        { id: 'attendance', label: 'Attendance', show: mainTab === 'Teachers' },
                        { id: 'actions', label: 'Actions', show: true }
                    ].map(tab => {
                        if (!tab.show) return null;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)} // Cast safely
                                className={`px-3 py-1.5 rounded-2xl text-[0.85rem] cursor-pointer transition-colors outline-none select-none whitespace-nowrap shrink-0 ${isActive ? 'bg-primary-red text-white' : 'bg-[#f0f0f0] text-text-dark hover:bg-[#e4e4e4]'}`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div className="tab-content" style={{ overflowY: 'auto', flex: 1, minHeight: '300px' }}>
                    {activeTab === 'info' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Email</label>
                                <div style={{ fontSize: '1rem', wordBreak: 'break-all' }}>{user.email}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Phone</label>
                                <div style={{ fontSize: '1rem' }}>{user.phone_number || 'N/A'}</div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Role</label>
                                <div style={{ fontSize: '1rem' }}>{mainTab.slice(0, -1)}</div>
                            </div>

                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem' }}>Status</label>
                                <div className={`px-2 py-1 rounded-xl text-[0.85em] font-bold capitalize inline-block mt-[5px] ${user.is_active ? 'bg-[rgba(40,167,69,0.1)] text-[#28a745] border border-[#28a745]' : 'bg-[rgba(220,53,69,0.1)] text-[#dc3545] border border-[#dc3545]'}`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roster' && mainTab === 'Teachers' && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {teacherRoster.length === 0 ? (
                                <p style={{ color: '#888', fontStyle: 'italic' }}>No students assigned.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {teacherRoster.map(student => (
                                        <li key={student.student_id} style={{ padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
                                            {student.student_first_name} {student.student_last_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'attendance' && mainTab === 'Teachers' && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {teacherRoster.length === 0 ? (
                                <p style={{ color: '#888', fontStyle: 'italic' }}>No students assigned.</p>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {teacherRoster.map(student => {
                                        const stats = getStudentStats(student.student_id);
                                        return (
                                            <li key={student.student_id} style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 500 }}>{student.student_first_name} {student.student_last_name}</span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {/* Green: Present */}
                                                    <span style={{
                                                        backgroundColor: 'rgba(46, 125, 50, 0.15)', // Softer Green
                                                        color: '#2e7d32',
                                                        border: '1px solid #2e7d32',
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.85rem', fontWeight: 'bold'
                                                    }}>
                                                        {stats.present}
                                                    </span>
                                                    {/* Red: Absent */}
                                                    <span style={{
                                                        backgroundColor: 'rgba(211, 47, 47, 0.15)', // Softer Red
                                                        color: '#d32f2f',
                                                        border: '1px solid #d32f2f',
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.85rem', fontWeight: 'bold'
                                                    }}>
                                                        {stats.absent}
                                                    </span>
                                                    {/* Grey: Pending */}
                                                    <span style={{
                                                        backgroundColor: 'rgba(158, 158, 158, 0.15)', // Softer Grey
                                                        color: '#757575',
                                                        border: '1px solid #9e9e9e',
                                                        width: '28px', height: '28px', borderRadius: '50%',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.85rem', fontWeight: 'bold'
                                                    }}>
                                                        {stats.pending}
                                                    </span>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    )}

                    {activeTab === 'academic' && mainTab === 'Students' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', color: '#888', fontSize: '0.85rem', marginBottom: '8px' }}>Assigned Teacher</label>
                                <select
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', color: 'black' }}
                                    value={user.teachers?.[0]?.id || ''}
                                    onChange={(e) => onAssignTeacher && onAssignTeacher(user.user_id, e.target.value)}
                                >
                                    <option value="">-- Unassigned --</option>
                                    {teachers?.map(t => (
                                        <option key={t.id} value={t.id}>
                                            {t.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'actions' && (
                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={() => { onEdit(user); onClose(); }}
                                className="w-full flex justify-center bg-[#2196F3] text-white border-none py-3 rounded-md cursor-pointer hover:bg-[#1976D2] transition-colors"
                            >
                                Edit Details
                            </button>

                            <hr className="w-full border-none border-t border-[#eee] my-2.5" />

                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete/archive this user?')) {
                                        onDelete(user.user_id);
                                        onClose();
                                    }
                                }}
                                className="w-full flex justify-center bg-white text-[#dc3545] border border-[#dc3545] py-3 rounded-md cursor-pointer hover:bg-[#fff0f0] transition-colors"
                            >
                                Delete / Archive
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MobileUserDetailModal;
