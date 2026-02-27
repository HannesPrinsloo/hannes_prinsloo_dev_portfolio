import React, { useState, useEffect } from 'react';
import { getTeacherSchedule, deleteLesson, deleteLessonSeries, type Lesson } from '../services/api';
import LessonScheduler from './LessonScheduler';

interface WeeklyScheduleProps {
    teacherId: number;
    currentWeekStart?: Date;
    onLessonCreated?: () => void;
}

const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({ teacherId, currentWeekStart: initialWeekStart, onLessonCreated }) => {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState<Date>(initialWeekStart || getStartOfWeek(new Date()));
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showScheduler, setShowScheduler] = useState(false);
    const [schedulerDefaults, setSchedulerDefaults] = useState<{ startTime: string }>({ startTime: '' });

    const [showMorning, setShowMorning] = useState(false);
    const [showEvening, setShowEvening] = useState(false);

    // Helper to get Monday of the current week (or previous Monday if today is Sunday, etc.)
    function getStartOfWeek(date: Date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    const refreshSchedule = () => {
        if (teacherId) {
            getTeacherSchedule(teacherId).then(setLessons).catch(console.error);
        }
    };

    useEffect(() => {
        refreshSchedule();
    }, [teacherId]);

    // Check for auto-expansion
    useEffect(() => {
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekLessons = lessons.filter(l => {
            const start = new Date(l.start_time);
            return start >= currentWeekStart && start <= weekEnd;
        });

        const hasMorning = weekLessons.some(l => new Date(l.start_time).getHours() < 13);
        const hasEvening = weekLessons.some(l => new Date(l.start_time).getHours() >= 18);

        if (hasMorning) setShowMorning(true);
        if (hasEvening) setShowEvening(true);

    }, [lessons, currentWeekStart]);


    const handlePreviousWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() - 7);
        setCurrentWeekStart(d);
    };

    const handleNextWeek = () => {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + 7);
        setCurrentWeekStart(d);
    };

    const handleDelete = async (deleteSeries: boolean) => {
        if (!selectedLesson) return;

        if (window.confirm(deleteSeries ? 'Are you sure you want to delete all future lessons in this series?' : 'Are you sure you want to delete this lesson?')) {
            try {
                if (deleteSeries && selectedLesson.recurrence_group_id) {
                    await deleteLessonSeries(selectedLesson.recurrence_group_id, selectedLesson.start_time);
                } else {
                    await deleteLesson(selectedLesson.lesson_id);
                }
                setSelectedLesson(null);
                refreshSchedule();
            } catch (error) {
                console.error('Failed to delete', error);
                alert('Failed to delete lesson(s)');
            }
        }
    };

    const isSameDay = (d1: Date, d2: Date) => {
        return d1.getDate() === d2.getDate() &&
            d1.getMonth() === d2.getMonth() &&
            d1.getFullYear() === d2.getFullYear();
    };

    // Filter lessons for current week view
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLessons = lessons.filter(l => {
        const start = new Date(l.start_time);
        return start >= currentWeekStart && start <= weekEnd;
    });

    // Generate days for header
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        days.push(d);
    }

    // Count lessons for badges
    const morningCount = weekLessons.filter(l => new Date(l.start_time).getHours() < 13).length;
    const eveningCount = weekLessons.filter(l => new Date(l.start_time).getHours() >= 18).length;

    // --- TIME SLOT LOGIC ---
    // Generate 30-min slots. 13.5 = 13:30
    const morningSlots = Array.from({ length: 10 }, (_, i) => 8 + i * 0.5); // 8.0, 8.5 ... 12.5
    const coreSlots = Array.from({ length: 10 }, (_, i) => 13 + i * 0.5);   // 13.0, 13.5 ... 17.5
    const eveningSlots = Array.from({ length: 5 }, (_, i) => 18 + i * 0.5); // 18.0 .. 20.0

    const renderTimeRow = (slot: number) => {
        const hour = Math.floor(slot);
        const minute = slot % 1 === 0 ? 0 : 30;
        const timeLabel = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        return (
            <div key={slot} className="grid-row" style={{ minHeight: '60px' }}>
                <div className="time-label">{timeLabel}</div>
                {days.map(day => {
                    const slotStart = new Date(day);
                    slotStart.setHours(hour, minute, 0, 0);

                    // 1. Find lessons STARTING in this slot
                    const startingLessons = weekLessons.filter(l => {
                        const d = new Date(l.start_time);
                        return isSameDay(d, day) &&
                            d.getHours() === hour &&
                            (minute === 0 ? d.getMinutes() < 30 : d.getMinutes() >= 30);
                    });

                    // 2. Find lessons ONGOING in this slot
                    const ongoingLessons = weekLessons.filter(l => {
                        const s = new Date(l.start_time);
                        const e = new Date(l.end_time);
                        return s.getTime() < slotStart.getTime() && e.getTime() > slotStart.getTime();
                    });

                    const allLessonsInSlot = [...startingLessons, ...ongoingLessons];

                    return (
                        <div key={day.toISOString()} className="grid-cell"
                            onClick={() => {
                                // Only allow booking if slot is completely empty
                                if (allLessonsInSlot.length === 0) {
                                    const newDate = new Date(slotStart);
                                    // Adjust for local timezone ISO
                                    const isoLocal = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
                                    setSchedulerDefaults({ startTime: isoLocal });
                                    setShowScheduler(true);
                                }
                            }}
                            style={{
                                backgroundColor: ongoingLessons.length > 0 ? '#f9f9f9' : undefined,
                                cursor: allLessonsInSlot.length > 0 ? 'default' : 'pointer'
                            }}
                        >
                            {/* Render STARTING lessons */}
                            {startingLessons.map(l => (
                                <div key={`${l.lesson_id}-${l.student_id}`}
                                    className={`lesson-card ${l.lesson_status}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLesson(l);
                                    }}
                                >
                                    <small>{new Date(l.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({l.duration_minutes || '?'}m)</small>
                                    <div>{l.student_first_name} {l.student_last_name}</div>
                                    {l.parent_note && <div style={{ fontSize: '0.8em', marginTop: '2px' }}>📝 Note from Parent</div>}
                                </div>
                            ))}

                            {/* Render ONGOING lessons (visual placeholders) */}
                            {ongoingLessons.map(l => (
                                <div key={`cont-${l.lesson_id}-${l.student_id}`}
                                    className={`lesson-card ${l.lesson_status}`}
                                    style={{ opacity: 0.6, borderLeftStyle: 'dashed' }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedLesson(l);
                                    }}
                                >
                                    <div style={{ fontStyle: 'italic', fontSize: '0.8em' }}>↳ Continued</div>
                                    <div style={{ fontSize: '0.8em' }}>{l.student_first_name} {l.student_last_name}</div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="weekly-schedule">
            <div className="schedule-header">
                <button className="bg-transparent text-text-dark border-2 border-text-dark px-4 py-2 rounded-md hover:bg-text-dark hover:text-white transition-colors font-medium" onClick={handlePreviousWeek}>&lt; Prev Week</button>
                <h3>Week of {currentWeekStart.toLocaleDateString()}</h3>
                <button className="bg-transparent text-text-dark border-2 border-text-dark px-4 py-2 rounded-md hover:bg-text-dark hover:text-white transition-colors font-medium" onClick={handleNextWeek}>Next Week &gt;</button>
                <button className="bg-primary-red text-white border-none px-4 py-2 rounded cursor-pointer hover:bg-black transition-colors" onClick={() => { setShowScheduler(true); setSchedulerDefaults({ startTime: '' }); }}>
                    + Book Lesson
                </button>
            </div>

            <div className="schedule-grid">
                <div className="grid-header-row">
                    <div className="time-col-header"></div>
                    {days.map(d => (
                        <div key={d.toISOString()} className="day-header">
                            {d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
                        </div>
                    ))}
                </div>

                {/* Morning Toggle */}
                <div
                    className={`buffer-toggle ${morningCount > 0 ? 'has-lessons' : ''}`}
                    onClick={() => setShowMorning(!showMorning)}
                >
                    {showMorning
                        ? 'Hide Morning Hours (08:00 - 13:00) ⬆'
                        : `Show Morning Hours (08:00 - 13:00) ${morningCount > 0 ? `• ${morningCount} Lesson${morningCount > 1 ? 's' : ''}` : '⬇'}`
                    }
                </div>
                {showMorning && morningSlots.map(renderTimeRow)}

                {/* Core Hours */}
                <div className="core-hours-separator">Core Teaching Hours</div>
                {coreSlots.map(renderTimeRow)}

                {/* Evening Toggle */}
                <div
                    className={`buffer-toggle ${eveningCount > 0 ? 'has-lessons' : ''}`}
                    onClick={() => setShowEvening(!showEvening)}
                >
                    {showEvening
                        ? 'Hide Evening Hours (18:00 - 20:30) ⬇'
                        : `Show Evening Hours (18:00 - 20:30) ${eveningCount > 0 ? `• ${eveningCount} Lesson${eveningCount > 1 ? 's' : ''}` : '⬆'}`
                    }
                </div>
                {showEvening && eveningSlots.map(renderTimeRow)}
            </div>

            {/* Scheduler Modal */}
            {showScheduler && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-[2px]">
                    <div className="bg-white text-text-dark p-[25px] rounded-xl w-[450px] max-w-[90%] relative shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#eee]">
                        <button className="absolute top-[15px] right-[15px] bg-transparent border-none text-[#aaa] text-[1.2em] cursor-pointer hover:text-primary-red transition-colors" onClick={() => setShowScheduler(false)}>X</button>
                        <LessonScheduler
                            onLessonCreated={() => {
                                setShowScheduler(false);
                                refreshSchedule();
                                if (onLessonCreated) onLessonCreated();
                            }}
                            initialStartTime={schedulerDefaults.startTime}
                        />
                    </div>
                </div>
            )}

            {/* Lesson Details Modal */}
            {selectedLesson && (
                <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] backdrop-blur-[2px]">
                    <div className="bg-white text-text-dark p-[25px] rounded-xl w-[450px] max-w-[90%] relative shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#eee]">
                        <button className="absolute top-[15px] right-[15px] bg-transparent border-none text-[#aaa] text-[1.2em] cursor-pointer hover:text-primary-red transition-colors" onClick={() => setSelectedLesson(null)}>X</button>
                        <h3>Lesson Details</h3>
                        <p><strong>Student:</strong> {selectedLesson.student_first_name} {selectedLesson.student_last_name}</p>
                        <p><strong>Time:</strong> {new Date(selectedLesson.start_time).toLocaleString()}</p>
                        <p><strong>Status:</strong> {selectedLesson.lesson_status}</p>

                        {selectedLesson.parent_note && (
                            <div style={{ background: '#444', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
                                <strong>Note from Parent:</strong>
                                <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>"{selectedLesson.parent_note}"</p>
                            </div>
                        )}

                        <div className="mt-[25px] flex justify-end gap-2.5">
                            <button className="bg-[#ff4444] text-white border-none px-3 py-2 rounded cursor-pointer mr-2.5 hover:opacity-90" onClick={() => handleDelete(false)}>Delete Lesson</button>
                            {selectedLesson.recurrence_group_id && (
                                <button className="bg-[#cc0000] text-white border-none px-3 py-2 rounded cursor-pointer mr-2.5 hover:opacity-90" onClick={() => handleDelete(true)}>
                                    Delete Series (Future Lessons)
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .weekly-schedule * { box-sizing: border-box; }
                .weekly-schedule { padding: 20px; color: var(--text-dark); }
                .schedule-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: var(--text-dark); flex-wrap: wrap; gap: 10px; }
                .schedule-grid { display: flex; flex-direction: column; border: 1px solid #e0e0e0; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                .grid-header-row { display: flex; border-bottom: 1px solid #e0e0e0; background: #f9f9f9; color: var(--text-dark); }
                .time-col-header { width: 80px; flex-shrink: 0; border-right: 1px solid #e0e0e0; }
                .day-header { flex: 1; text-align: center; padding: 12px; border-left: 1px solid #e0e0e0; font-weight: 600; font-size: 0.9em; }
                .grid-row { display: flex; border-bottom: 1px solid #f0f0f0; }
                .time-label { width: 80px; flex-shrink: 0; text-align: right; padding: 10px; color: #888; font-size: 0.8em; border-right: 1px solid #e0e0e0; display: flex; align-items: center; justify-content: flex-end; }
                .grid-cell { flex: 1; border-left: 1px solid #f0f0f0; padding: 2px; position: relative; cursor: pointer; transition: background 0.2s; color: var(--text-dark); }
                .grid-cell:hover { background: #fafafa; }
                
                .lesson-card { 
                    background: #fff0f0; 
                    border-left: 3px solid var(--primary-red); 
                    padding: 4px 6px; 
                    border-radius: 3px; 
                    margin-bottom: 2px; 
                    font-size: 0.8em; 
                    cursor: pointer;
                    color: var(--text-dark);
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                }
                .lesson-card:hover { background: #ffe0e0; }
                .lesson-card.completed { border-left-color: #28a745; background: #e8f5e9; }
                
                .buffer-toggle {
                    background: #f8f8f8;
                    color: #666;
                    text-align: center;
                    padding: 8px;
                    cursor: pointer;
                    font-size: 0.85em;
                    font-weight: 600;
                    border-bottom: 1px solid #e0e0e0;
                    transition: all 0.2s;
                }
                .buffer-toggle:hover { background: #f0f0f0; color: var(--primary-red); }
                .buffer-toggle.has-lessons {
                    background: #fff8e1;
                    color: #f57c00;
                    border-bottom-color: #ffe0b2;
                }
                .buffer-toggle.has-lessons:hover {
                    background: #ffe0b2;
                }
                
                .core-hours-separator {
                    background: #e8f5e9;
                    color: #2e7d32;
                    text-align: center;
                    padding: 4px;
                    font-size: 0.75em;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                    border-bottom: 1px solid #c8e6c9;
                }
            `}</style>
        </div>
    );
};

export default WeeklySchedule;
