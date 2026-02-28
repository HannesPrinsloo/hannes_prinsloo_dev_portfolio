import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createLesson, fetchTeacherRoster } from '../services/api';
import { useAuthStore } from '../../store/authStore';

interface LessonSchedulerProps {
    onLessonCreated: () => void;
    initialStartTime?: string;
}

const LessonScheduler: React.FC<LessonSchedulerProps> = ({ onLessonCreated, initialStartTime }) => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [lessonType, setLessonType] = useState<'solo' | 'group'>('solo');
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [startTime, setStartTime] = useState<string>(initialStartTime || '');
    // Duration is derived: solo=30, group=60
    const [recurrenceCount, setRecurrenceCount] = useState<number>(1);
    const [message, setMessage] = useState<string | null>(null);

    const { data: roster = [] } = useQuery({
        queryKey: ['teacherRoster', user?.user_id],
        queryFn: () => fetchTeacherRoster(user!.user_id),
        enabled: !!user?.user_id
    });

    useEffect(() => {
        if (initialStartTime) {
            setStartTime(initialStartTime);
        }
    }, [initialStartTime]);

    const handleStudentChange = (index: number, studentId: string) => {
        const id = parseInt(studentId);
        if (isNaN(id)) return;

        const newSelection = [...selectedStudents];
        // Ensure array is big enough
        if (newSelection.length <= index) {
            newSelection.push(id);
        } else {
            newSelection[index] = id;
        }
        // Filter out empty/NaN and update
        setSelectedStudents(newSelection.filter(n => !isNaN(n)));
    };

    const createLessonMutation = useMutation({
        mutationFn: (lessonData: any) => createLesson(lessonData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teacherSchedule'] });
            queryClient.invalidateQueries({ queryKey: ['adminTeacherSchedule'] });

            setMessage('Lesson scheduled successfully!');
            setStartTime('');
            setSelectedStudents([]);
            setRecurrenceCount(1);
            onLessonCreated();
        },
        onError: () => {
            setMessage('Failed to create lesson.');
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validation
        if (lessonType === 'solo' && selectedStudents.length !== 1) {
            setMessage('Solo lessons require exactly 1 student.');
            return;
        }
        if (lessonType === 'group' && selectedStudents.length < 2) {
            setMessage('Group lessons require at least 2 students.');
            return;
        }

        createLessonMutation.mutate({
            teacherId: user?.user_id || 0,
            studentIds: selectedStudents,
            instrumentId: 1, // Hardcoded for prototype (Guitar)
            startTime: new Date(startTime).toISOString(),
            durationMinutes: lessonType === 'solo' ? 30 : 60,
            recurrenceCount
        });
    };

    const loading = createLessonMutation.isPending;

    return (
        <div className="card">
            <h3>Schedule a Lesson</h3>
            <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '15px' }}>
                    <div className="toggle-group" style={{ display: 'flex', gap: '10px' }}>
                        <button
                            type="button"
                            className={`toggle-btn ${lessonType === 'solo' ? 'active' : ''}`}
                            onClick={() => { setLessonType('solo'); setSelectedStudents([]); }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: lessonType === 'solo' ? '#2196f3' : '#444',
                                color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >
                            Solo (30m)
                        </button>
                        <button
                            type="button"
                            className={`toggle-btn ${lessonType === 'group' ? 'active' : ''}`}
                            onClick={() => { setLessonType('group'); setSelectedStudents([]); }}
                            style={{
                                flex: 1,
                                padding: '8px',
                                background: lessonType === 'group' ? '#2196f3' : '#444',
                                color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                            }}
                        >
                            Group (60m)
                        </button>
                    </div>
                </div>

                {lessonType === 'solo' ? (
                    <div>
                        <label>Student:</label>
                        <select
                            required
                            value={selectedStudents[0] || ''}
                            onChange={e => setSelectedStudents([parseInt(e.target.value)])}
                        >
                            <option value="">Select Student</option>
                            {roster.map(s => (
                                <option key={s.student_id} value={s.student_id}>
                                    {s.student_first_name} {s.student_last_name}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label>Students (Max 3):</label>
                        {[0, 1, 2].map(i => (
                            <select
                                key={i}
                                required={i < 2} // First 2 required
                                value={selectedStudents[i] || ''}
                                onChange={e => handleStudentChange(i, e.target.value)}
                                style={{ marginBottom: '5px' }}
                            >
                                <option value="">{i < 2 ? `Student ${i + 1} (Required)` : `Student ${i + 1} (Optional)`}</option>
                                {roster.map(s => (
                                    <option
                                        key={s.student_id}
                                        value={s.student_id}
                                        disabled={selectedStudents.includes(s.student_id) && selectedStudents[i] !== s.student_id}
                                    >
                                        {s.student_first_name} {s.student_last_name}
                                    </option>
                                ))}
                            </select>
                        ))}
                    </div>
                )}

                <div>
                    <label>Date & Time:</label>
                    <input
                        type="datetime-local"
                        required
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />
                </div>

                <div>
                    <label>Repeat:</label>
                    <select value={recurrenceCount} onChange={e => setRecurrenceCount(parseInt(e.target.value))}>
                        <option value={1}>None (One-time)</option>
                        <option value={4}>4 Weeks</option>
                        <option value={10}>10 Weeks (Term)</option>
                    </select>
                </div>
                <button type="submit" disabled={loading} style={{ marginTop: '10px', width: '100%', padding: '10px' }}>
                    {loading ? 'Scheduling...' : `Schedule ${lessonType === 'solo' ? 'Solo' : 'Group'} Lesson`}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};
export default LessonScheduler;
