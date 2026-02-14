import React, { useState } from 'react';
import { type RosterEntry, type Lesson } from '../services/api';

// Extended Lesson type to include attendance data if not already in Lesson
interface BillingLesson extends Lesson {
    attendance_status?: string;
    attendance_notes?: string;
    // Parent note might be relevant for Managers/Teachers
    parent_note?: string;
}

interface BillingAccordionProps {
    students: RosterEntry[];
    schedule: BillingLesson[];
    currentDate?: Date; // Optional, defaults to now
    readOnly?: boolean;
    onUpdateStatus?: (lessonId: number, status: string) => void;
    onUpdateNote?: (lessonId: number, note: string) => void;
}

const BillingAccordion: React.FC<BillingAccordionProps> = ({
    students,
    schedule,
    currentDate = new Date(),
    readOnly = true,
    onUpdateStatus,
    onUpdateNote
}) => {
    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Handlers for interactions
    const handleStatusChange = (lessonId: number, newStatus: string) => {
        if (readOnly || !onUpdateStatus) return;
        onUpdateStatus(lessonId, newStatus);
    };

    const handleNoteClick = (lessonId: number, currentNote: string) => {
        if (readOnly || !onUpdateNote) return;
        const note = prompt("Enter attendance note:", currentNote || "");
        if (note !== null) {
            onUpdateNote(lessonId, note);
        }
    };

    return (
        <div className="billing-view">
            <p style={{ marginBottom: '20px', fontSize: '0.9em', color: '#ccc' }}>
                Showing lessons for <strong>{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</strong>.
                Click on a student row to view their detailed attendance.
            </p>

            {students.length === 0 && <p>No students found.</p>}

            {students.map(s => {
                const isExpanded = expandedStudentId === s.student_id;

                // Filter Schedule for Current Month AND this Student
                const monthlyLessons = schedule.filter(l => {
                    const d = new Date(l.start_time);
                    // Ensure strict type match if IDs are numbers/strings
                    return d.getMonth() === currentMonth &&
                        d.getFullYear() === currentYear &&
                        Number(l.student_id) === Number(s.student_id);
                });

                // Sort lessons by date
                monthlyLessons.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

                // Count status
                const presentCount = monthlyLessons.filter(l => l.attendance_status === 'Present').length;
                const pendingCount = monthlyLessons.filter(l => !l.attendance_status || l.attendance_status === 'Pending').length;

                return (
                    <div key={s.student_id} style={{ marginBottom: '16px', border: '1px solid #444', borderRadius: '12px', backgroundColor: '#2f2f2f', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        {/* Header Row - Clickable */}
                        <div
                            onClick={() => setExpandedStudentId(isExpanded ? null : s.student_id)}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: '1.8fr 1.8fr 1.4fr 120px',
                                gap: '15px',
                                padding: '20px',
                                cursor: 'pointer',
                                backgroundColor: isExpanded ? '#383838' : 'transparent',
                                alignItems: 'center',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '1.2em', color: '#fff', marginBottom: '4px' }}>
                                    {s.student_first_name} {s.student_last_name}
                                </div>
                                <div style={{ fontSize: '0.8em', color: '#888' }}>ID: {s.student_id}</div>
                            </div>

                            <div style={{ color: '#ccc', fontSize: '0.95em', lineHeight: '1.4' }}>
                                <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Manager</div>
                                {s.manager_first_name ? (
                                    <>
                                        <div style={{ fontWeight: '500' }}>{s.manager_first_name} {s.manager_last_name}</div>
                                        <div style={{ opacity: 0.8 }}>{s.manager_phone}</div>
                                    </>
                                ) : (
                                    <div style={{ fontStyle: 'italic', opacity: 0.6 }}>Self / Unassigned</div>
                                )}
                            </div>

                            <div style={{ color: '#ddd' }}>
                                <div style={{ color: '#888', fontSize: '0.8em', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Instrument</div>
                                <div style={{ fontSize: '1em' }}>{s.instrument_list || <span style={{ color: '#666', fontStyle: 'italic' }}>None</span>}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                                <span style={{
                                    backgroundColor: presentCount > 0 ? '#2e7d32' : '#444',
                                    color: 'white',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75em',
                                    fontWeight: '600',
                                    minWidth: '70px',
                                    textAlign: 'center'
                                }}>
                                    {presentCount} DONE
                                </span>
                                <span style={{
                                    backgroundColor: pendingCount > 0 ? '#f57c00' : 'transparent',
                                    border: pendingCount > 0 ? 'none' : '1px solid #555',
                                    color: pendingCount > 0 ? 'white' : '#888',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.75em',
                                    fontWeight: '600',
                                    minWidth: '70px',
                                    textAlign: 'center'
                                }}>
                                    {pendingCount} BOOKED
                                </span>
                            </div>
                        </div>

                        {/* Expanded Content: Attendance Table */}
                        {isExpanded && (
                            <div style={{ padding: '0', backgroundColor: '#2a2a2a', borderTop: '1px solid #444' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95em' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#222', color: '#aaa', fontSize: '0.85em', textTransform: 'uppercase' }}>
                                            <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: '600' }}>Date/Time</th>
                                            <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: '600' }}>Instrument</th>
                                            <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: '600' }}>Status</th>
                                            <th style={{ textAlign: 'left', padding: '12px 20px', fontWeight: '600' }}>Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyLessons.length > 0 ? monthlyLessons.map((l, idx) => (
                                            <tr key={l.lesson_id} style={{ borderBottom: idx === monthlyLessons.length - 1 ? 'none' : '1px solid #3d3d3d' }}>
                                                <td style={{ padding: '12px 20px', color: '#fff' }}>
                                                    {new Date(l.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td style={{ padding: '12px 20px', color: '#ddd' }}>{l.instrument_name}</td>
                                                <td style={{ padding: '12px 20px' }}>
                                                    {/* Status Cell - Editable if not readOnly */}
                                                    {!readOnly ? (
                                                        <select
                                                            value={l.attendance_status || 'Pending'}
                                                            onChange={(e) => handleStatusChange(l.lesson_id, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()} // Prevent row collapse?? Actually row click is on header div, safe here.
                                                            style={{
                                                                backgroundColor: l.attendance_status === 'Present' ? 'rgba(76, 175, 80, 0.2)' :
                                                                    l.attendance_status === 'Absent' ? 'rgba(244, 67, 54, 0.2)' : '#444',
                                                                color: l.attendance_status === 'Present' ? '#81c784' :
                                                                    l.attendance_status === 'Absent' ? '#e57373' : '#fff',
                                                                border: '1px solid #555',
                                                                padding: '6px',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Present">Present</option>
                                                            <option value="Absent">Absent</option>
                                                            <option value="Late">Late</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{
                                                            color: l.attendance_status === 'Present' ? '#4caf50' :
                                                                l.attendance_status === 'Absent' ? '#f44336' : '#fda085',
                                                            backgroundColor: l.attendance_status === 'Present' ? 'rgba(76, 175, 80, 0.1)' :
                                                                l.attendance_status === 'Absent' ? 'rgba(244, 67, 54, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            fontWeight: '500'
                                                        }}>
                                                            {l.attendance_status || 'Pending'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px 20px', color: '#bbb', fontStyle: l.attendance_notes ? 'normal' : 'italic' }}>
                                                    <div
                                                        onClick={() => !readOnly && handleNoteClick(l.lesson_id, l.attendance_notes || '')}
                                                        style={{
                                                            cursor: readOnly ? 'default' : 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px'
                                                        }}
                                                        title={!readOnly ? "Click to edit note" : ""}
                                                    >
                                                        {l.attendance_notes || (readOnly ? 'No notes' : <span style={{ color: '#666' }}>Add note...</span>)}
                                                        {!readOnly && <span style={{ fontSize: '0.8em', opacity: 0.5 }}>✎</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} style={{ textAlign: 'center', color: '#aaa', padding: '20px' }}>No lessons scheduled for this month.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BillingAccordion;
