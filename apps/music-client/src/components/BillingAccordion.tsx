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
    onUpdateStatus?: (lessonId: number, studentId: number, status: string) => void;
    onUpdateNote?: (lessonId: number, studentId: number, note: string) => void;
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
    const handleStatusChange = (lessonId: number, studentId: number, newStatus: string) => {
        if (readOnly || !onUpdateStatus) return;
        onUpdateStatus(lessonId, studentId, newStatus);
    };

    const handleNoteClick = (lessonId: number, studentId: number, currentNote: string) => {
        if (readOnly || !onUpdateNote) return;
        const note = prompt("Enter attendance note:", currentNote || "");
        if (note !== null) {
            onUpdateNote(lessonId, studentId, note);
        }
    };

    return (
        <div className="billing-view">
            <p className="mb-5 text-[0.9em] text-[#666]">
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
                    <div key={s.student_id} className={`mb-4 border border-[#eee] rounded-xl overflow-hidden transition-all duration-200 ${isExpanded ? 'bg-[#f9f9f9] shadow-md border-[#ddd]' : 'bg-white shadow-sm hover:border-[#ccc]'}`}>
                        {/* Header Row - Clickable */}
                        <div
                            onClick={() => setExpandedStudentId(isExpanded ? null : s.student_id)}
                            className="grid grid-cols-[1.8fr_1.8fr_1.4fr_120px] gap-4 p-5 cursor-pointer items-center transition-colors duration-200"
                        >
                            <div>
                                <div className="font-semibold text-[1.2em] text-text-dark mb-1">
                                    {s.student_first_name} {s.student_last_name}
                                </div>
                                <div className="text-[0.8em] text-[#888]">ID: {s.student_id}</div>
                            </div>

                            <div className="text-text-dark text-[0.95em] leading-[1.4]">
                                <div className="text-[#888] text-[0.8em] uppercase tracking-[0.5px]">Manager</div>
                                {s.manager_first_name ? (
                                    <>
                                        <div className="font-medium">{s.manager_first_name} {s.manager_last_name}</div>
                                        <div className="opacity-80">{s.manager_phone}</div>
                                    </>
                                ) : (
                                    <div className="italic opacity-60">Self / Unassigned</div>
                                )}
                            </div>

                            <div className="text-text-dark">
                                <div className="text-[#888] text-[0.8em] uppercase tracking-[0.5px] mb-[2px]">Instrument</div>
                                <div className="text-[1em]">{s.instrument_list || <span className="text-[#888] italic">None</span>}</div>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
                                <span className={`px-2.5 py-1 rounded-full text-[0.75em] font-semibold min-w-[70px] text-center ${presentCount > 0 ? 'bg-primary-red text-white' : 'bg-[#e0e0e0] text-[#666]'}`}>
                                    {presentCount} DONE
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-[0.75em] font-semibold min-w-[70px] text-center ${pendingCount > 0 ? 'bg-[#ffeaeb] text-primary-red' : 'bg-transparent border border-[#ccc] text-[#888]'}`}>
                                    {pendingCount} BOOKED
                                </span>
                            </div>
                        </div>

                        {/* Expanded Content: Attendance Table */}
                        {isExpanded && (
                            <div className="p-0 bg-white border-t border-[#eee]">
                                <table className="w-full border-collapse text-[0.95em]">
                                    <thead>
                                        <tr className="bg-[#f8f8f8] text-[#666] text-[0.85em] uppercase">
                                            <th className="text-left py-3 px-5 font-semibold">Date/Time</th>
                                            <th className="text-left py-3 px-5 font-semibold">Instrument</th>
                                            <th className="text-left py-3 px-5 font-semibold">Status</th>
                                            <th className="text-left py-3 px-5 font-semibold">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monthlyLessons.length > 0 ? monthlyLessons.map((l, idx) => (
                                            <tr key={l.lesson_id} className={idx === monthlyLessons.length - 1 ? '' : 'border-b border-[#eee]'}>
                                                <td className="py-3 px-5 text-text-dark">
                                                    {new Date(l.start_time).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                                                </td>
                                                <td className="py-3 px-5 text-text-dark">{l.instrument_name || <span className="text-[#888] italic">None</span>}</td>
                                                <td className="py-3 px-5">
                                                    {/* Status Cell - Editable if not readOnly */}
                                                    {!readOnly ? (
                                                        <select
                                                            value={l.attendance_status || 'Pending'}
                                                            onChange={(e) => handleStatusChange(l.lesson_id, s.student_id as number, e.target.value)}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className={`p-1.5 rounded cursor-pointer border ${l.attendance_status === 'Present' ? 'bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9]' :
                                                                l.attendance_status === 'Absent' ? 'bg-[#ffebee] text-[#c62828] border-[#ffcdd2]' : 'bg-white text-text-dark border-[#ccc]'
                                                                }`}
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Present">Present</option>
                                                            <option value="Absent">Absent</option>
                                                            <option value="Late">Late</option>
                                                        </select>
                                                    ) : (
                                                        <span className={`px-2 py-1 rounded font-medium ${l.attendance_status === 'Present' ? 'text-[#2e7d32] bg-[#e8f5e9]' :
                                                            l.attendance_status === 'Absent' ? 'text-[#c62828] bg-[#ffebee]' : 'text-primary-red bg-[#ffeaeb]'
                                                            }`}>
                                                            {l.attendance_status || 'Pending'}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`py-3 px-5 ${l.attendance_notes ? 'text-text-dark not-italic' : 'text-[#888] italic'}`}>
                                                    <div
                                                        onClick={() => !readOnly && handleNoteClick(l.lesson_id, s.student_id as number, l.attendance_notes || '')}
                                                        className={`flex items-center gap-2 ${readOnly ? 'cursor-default' : 'cursor-pointer hover:text-primary-red'}`}
                                                        title={!readOnly ? "Click to edit note" : ""}
                                                    >
                                                        {l.attendance_notes || (readOnly ? 'No notes' : <span className="text-[#888]">Add note...</span>)}
                                                        {!readOnly && <span className="text-[0.8em] opacity-50">✎</span>}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={4} className="text-center text-[#888] p-5">No lessons scheduled for this month.</td></tr>
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
