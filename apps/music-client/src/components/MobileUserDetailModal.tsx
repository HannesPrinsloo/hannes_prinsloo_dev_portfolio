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
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 10001 // Higher than BottomNav (9999)
        }} onClick={onClose}>
            <div
                className="card"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    backgroundColor: 'white',
                    color: 'var(--text-dark)',
                    maxHeight: '85vh',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px',
                    borderRadius: '8px',
                    position: 'relative',
                    overflow: 'hidden' // Container itself hidden, inner content scrolls
                }}
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
                        zIndex: 10
                    }}
                >
                    &times;
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.25rem', paddingRight: '30px' }}>
                    {user.first_name} {user.last_name}
                </h2>

                {/* Styled Tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    <button
                        onClick={() => setActiveTab('info')}
                        style={{
                            padding: '6px 12px',
                            background: activeTab === 'info' ? '#FF5F5E' : '#f0f0f0',
                            color: activeTab === 'info' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Info
                    </button>

                    {mainTab === 'Students' && (
                        <button
                            onClick={() => setActiveTab('academic')}
                            style={{
                                padding: '6px 12px',
                                background: activeTab === 'academic' ? '#FF5F5E' : '#f0f0f0',
                                color: activeTab === 'academic' ? 'white' : '#333',
                                border: 'none',
                                borderRadius: '16px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Academic
                        </button>
                    )}

                    {mainTab === 'Teachers' && (
                        <>
                            <button
                                onClick={() => setActiveTab('roster')}
                                style={{
                                    padding: '6px 12px',
                                    background: activeTab === 'roster' ? '#FF5F5E' : '#f0f0f0',
                                    color: activeTab === 'roster' ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Roster
                            </button>
                            <button
                                onClick={() => setActiveTab('attendance')}
                                style={{
                                    padding: '6px 12px',
                                    background: activeTab === 'attendance' ? '#FF5F5E' : '#f0f0f0',
                                    color: activeTab === 'attendance' ? 'white' : '#333',
                                    border: 'none',
                                    borderRadius: '16px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem'
                                }}
                            >
                                Attendance
                            </button>
                        </>
                    )}

                    <button
                        onClick={() => setActiveTab('actions')}
                        style={{
                            padding: '6px 12px',
                            background: activeTab === 'actions' ? '#FF5F5E' : '#f0f0f0',
                            color: activeTab === 'actions' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                        }}
                    >
                        Actions
                    </button>
                </div>

                <div className="tab-content" style={{ overflowY: 'auto', flex: 1 }}>
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
                                <div className={`status-badge ${user.is_active ? 'present' : 'absent'}`} style={{ display: 'inline-block', marginTop: '5px' }}>
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <button
                                onClick={() => { onEdit(user); onClose(); }}
                                className="btn-primary"
                                style={{ width: '100%', padding: '12px', justifyContent: 'center', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '6px' }}
                            >
                                Edit Details
                            </button>

                            <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />

                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete/archive this user?')) {
                                        onDelete(user.user_id);
                                        onClose();
                                    }
                                }}
                                className="btn-secondary"
                                style={{ width: '100%', padding: '12px', color: '#dc3545', borderColor: '#dc3545', backgroundColor: 'white', border: '1px solid #dc3545', borderRadius: '6px' }}
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
