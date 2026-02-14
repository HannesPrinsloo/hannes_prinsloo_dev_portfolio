import { useState, useEffect } from 'react';
import { } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL;

interface FamilyRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}



interface StudentData {
    firstName: string;
    lastName: string;
    dob: string;
    assignedTeacherId?: number;
}

const FamilyRegistrationModal = ({ isOpen, onClose, onSuccess }: FamilyRegistrationModalProps) => {

    const [loading, setLoading] = useState(false);
    const [managers, setManagers] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [isAdultStudent, setIsAdultStudent] = useState(false);

    // Manager State
    const [managerMode, setManagerMode] = useState<'new' | 'existing'>('new');
    const [selectedManagerId, setSelectedManagerId] = useState<number | ''>('');
    const [managerDetails, setManagerDetails] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        password: '',
        date_of_birth: '1990-01-01'
    });

    // Student State
    const [students, setStudents] = useState<StudentData[]>([
        { firstName: '', lastName: '', dob: '2015-01-01', assignedTeacherId: undefined }
    ]);

    useEffect(() => {
        if (isOpen) {
            // Reset state

            setIsAdultStudent(false);
            setManagerMode('new');
            setSelectedManagerId('');
            setManagerDetails({
                first_name: '',
                last_name: '',
                email: '',
                phone_number: '',
                password: '',
                date_of_birth: '1990-01-01'
            });
            setStudents([{ firstName: '', lastName: '', dob: '2015-01-01' }]);

            // Fetch Managers & Teachers
            fetchManagers();
            fetchTeachers();
        }
    }, [isOpen]);

    const fetchManagers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`);
            const users = await res.json();
            setManagers(users.filter((u: any) => u.role_id === 3)); // Filter valid managers
        } catch (e) {
            console.error("Failed to fetch managers", e);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await fetch(`${API_URL}/api/users`);
            const users = await res.json();
            setTeachers(users.filter((u: any) => u.role_id === 2)); // Filter valid teachers
        } catch (e) {
            console.error("Failed to fetch teachers", e);
        }
    };

    const handleManagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setManagerDetails({ ...managerDetails, [e.target.name]: e.target.value });
    };

    // Auto-fill student if Adult Student is checked
    useEffect(() => {
        if (isAdultStudent && managerMode === 'new') {
            setStudents([{
                firstName: managerDetails.first_name,
                lastName: managerDetails.last_name,
                dob: managerDetails.date_of_birth,
                assignedTeacherId: students[0]?.assignedTeacherId
            }]);
        }
    }, [isAdultStudent, managerDetails, managerMode]);

    const handleStudentChange = (index: number, field: keyof StudentData, value: any) => {
        const newStudents = [...students];
        newStudents[index] = { ...newStudents[index], [field]: value };
        setStudents(newStudents);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                manager: {
                    isNew: managerMode === 'new',
                    userId: managerMode === 'existing' ? Number(selectedManagerId) : undefined,
                    details: managerMode === 'new' ? { ...managerDetails, role_id: 3 } : undefined
                },
                students: students,
                isAdultStudent
            };

            const res = await fetch(`${API_URL}/api/users/family`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to register family');
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="card" style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto', textAlign: 'left', backgroundColor: '#242424', padding: '20px' }}>
                <h2 style={{ marginTop: 0 }}>Family Registration</h2>

                {/* Step 1: Manager */}
                <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #444' }}>
                    <h3 style={{ color: '#646cff' }}>Step 1: The Manager (Adult)</h3>

                    <div style={{ display: 'flex', gap: '20px', marginBottom: '15px' }}>
                        <label>
                            <input type="radio" checked={managerMode === 'new'} onChange={() => setManagerMode('new')} />
                            New Manager
                        </label>
                        <label>
                            <input type="radio" checked={managerMode === 'existing'} onChange={() => setManagerMode('existing')} />
                            Existing Manager
                        </label>
                    </div>

                    {managerMode === 'existing' ? (
                        <select
                            value={selectedManagerId}
                            onChange={(e) => setSelectedManagerId(Number(e.target.value))}
                            style={{ width: '100%', padding: '10px' }}
                        >
                            <option value="">-- Select Manager --</option>
                            {managers.map(m => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.first_name} {m.last_name} ({m.email})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="grid-form">
                            <input name="first_name" placeholder="First Name" value={managerDetails.first_name} onChange={handleManagerChange} />
                            <input name="last_name" placeholder="Last Name" value={managerDetails.last_name} onChange={handleManagerChange} />
                            <input name="email" type="email" placeholder="Email" value={managerDetails.email} onChange={handleManagerChange} />
                            <input name="phone_number" placeholder="Phone" value={managerDetails.phone_number} onChange={handleManagerChange} />
                            <input name="date_of_birth" type="date" value={managerDetails.date_of_birth} onChange={handleManagerChange} />
                            <input name="password" type="password" placeholder="Password" value={managerDetails.password} onChange={handleManagerChange} />
                        </div>
                    )}

                    {managerMode === 'new' && (
                        <div style={{ marginTop: '10px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: '#333', padding: '10px', borderRadius: '4px' }}>
                                <input type="checkbox" checked={isAdultStudent} onChange={(e) => setIsAdultStudent(e.target.checked)} />
                                <strong>This is an Adult Student</strong> (Student is their own Manager)
                            </label>
                        </div>
                    )}
                </div>

                {/* Step 2: Students */}
                <div>
                    <h3 style={{ color: '#646cff' }}>Step 2: The Student(s)</h3>

                    {students.map((student, idx) => (
                        <div key={idx} style={{ background: '#333', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                            {!isAdultStudent && (
                                <>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                        <input
                                            placeholder="First Name"
                                            value={student.firstName}
                                            onChange={(e) => handleStudentChange(idx, 'firstName', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                        <input
                                            placeholder="Last Name"
                                            value={student.lastName}
                                            onChange={(e) => handleStudentChange(idx, 'lastName', e.target.value)}
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px' }}>Date of Birth</label>
                                        <input
                                            type="date"
                                            value={student.dob}
                                            onChange={(e) => handleStudentChange(idx, 'dob', e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </>
                            )}

                            {isAdultStudent && (
                                <p style={{ color: '#aaa', fontStyle: 'italic', marginBottom: '10px' }}>
                                    Student details will match Manager details above.
                                </p>
                            )}

                            <div>
                                <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '5px' }}>Assign Teacher (Optional)</label>
                                <select
                                    style={{ width: '100%', padding: '8px' }}
                                    value={student.assignedTeacherId || ''}
                                    onChange={(e) => handleStudentChange(idx, 'assignedTeacherId', e.target.value ? Number(e.target.value) : undefined)}
                                >
                                    <option value="">-- No Teacher Assigned --</option>
                                    {teachers.map(t => (
                                        <option key={t.user_id} value={t.user_id}>
                                            {t.first_name} {t.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}

                    {!isAdultStudent && (
                        <button
                            type="button"
                            onClick={() => setStudents([...students, { firstName: '', lastName: '', dob: '2015-01-01' }])}
                            style={{ fontSize: '0.9em', padding: '5px 10px' }}
                        >
                            + Add Another Student
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderTop: '1px solid #444', paddingTop: '20px' }}>
                    <button onClick={onClose} disabled={loading} style={{ background: '#555' }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FamilyRegistrationModal;
