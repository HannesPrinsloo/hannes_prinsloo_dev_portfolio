import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registerFamily, fetchUsers } from '../services/api';

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

    const queryClient = useQueryClient();

    // Fetch users from cache or network
    const { data: allUsers = [] } = useQuery<any[]>({
        queryKey: ['adminUsers'],
        queryFn: fetchUsers,
        staleTime: 5 * 60 * 1000,
    });

    const managers = allUsers.filter((u: any) => u.role_id === 3);
    const teachers = allUsers.filter((u: any) => u.role_id === 2);

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
            setStudents([{ firstName: '', lastName: '', dob: '2015-01-01' }]);
        }
    }, [isOpen]);

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

    const registerFamilyMutation = useMutation({
        mutationFn: registerFamily,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
            onSuccess();
            onClose();
        },
        onError: (err: any) => {
            alert(err.message || 'Failed to register family');
        }
    });

    const handleSubmit = async () => {
        const payload = {
            manager: {
                isNew: managerMode === 'new',
                userId: managerMode === 'existing' ? Number(selectedManagerId) : undefined,
                details: managerMode === 'new' ? { ...managerDetails, role_id: 3 } : undefined
            },
            students: students,
            isAdultStudent
        };

        registerFamilyMutation.mutate(payload);
    };

    const loading = registerFamilyMutation.isPending;

    if (!isOpen) return null;

    return (
        /* CHANGELOG: Refactored FamilyRegistrationModal layout and buttons to use Tailwind CSS utility classes instead of inline styling and global CSS. */
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[1000] p-5">
            <div className="bg-white text-text-dark p-[25px] rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto text-left shadow-[0_10px_25px_rgba(0,0,0,0.15)] border border-[#eee]">
                <h2 className="mt-0 font-bold mb-[20px] pb-2.5 border-b border-[#eee]">Family Registration</h2>

                {/* Step 1: Manager */}
                <div className="mb-[20px] pb-[20px] border-b border-[#eee]">
                    <h3 className="text-[#646cff] mb-4 mt-0">Step 1: The Manager (Adult)</h3>

                    <div className="flex gap-4 mb-4">
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#666]">
                            <input type="radio" className="accent-primary-red" checked={managerMode === 'new'} onChange={() => setManagerMode('new')} />
                            New Manager
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-[#666]">
                            <input type="radio" className="accent-primary-red" checked={managerMode === 'existing'} onChange={() => setManagerMode('existing')} />
                            Existing Manager
                        </label>
                    </div>

                    {managerMode === 'existing' ? (
                        <select
                            value={selectedManagerId}
                            onChange={(e) => setSelectedManagerId(Number(e.target.value))}
                            className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red"
                        >
                            <option value="">-- Select Manager --</option>
                            {managers.map((m: any) => (
                                <option key={m.user_id} value={m.user_id}>
                                    {m.first_name} {m.last_name} ({m.email})
                                </option>
                            ))}
                        </select>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[#666] font-medium text-xs uppercase tracking-wider">First Name</label>
                                <input name="first_name" className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red" placeholder="First Name" value={managerDetails.first_name} onChange={handleManagerChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Last Name</label>
                                <input name="last_name" className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red" placeholder="Last Name" value={managerDetails.last_name} onChange={handleManagerChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Email</label>
                                <input name="email" type="email" className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red" placeholder="Email" value={managerDetails.email} onChange={handleManagerChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Phone</label>
                                <input name="phone_number" className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red" placeholder="Phone" value={managerDetails.phone_number} onChange={handleManagerChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Date of Birth</label>
                                <input name="date_of_birth" type="date" className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red" value={managerDetails.date_of_birth} onChange={handleManagerChange} />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Password</label>
                                <input name="password" type="password" className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red" placeholder="Password" value={managerDetails.password} onChange={handleManagerChange} />
                            </div>
                        </div>
                    )}

                    {managerMode === 'new' && (
                        <div className="mt-4">
                            <label className="flex items-center gap-3 cursor-pointer bg-[#f9f9f9] p-3 rounded-md border border-[#eee] hover:bg-[#f0f0f0] transition-colors">
                                <input type="checkbox" className="w-4 h-4 accent-primary-red rounded" checked={isAdultStudent} onChange={(e) => setIsAdultStudent(e.target.checked)} />
                                <div className="flex flex-col sm:flex-row sm:gap-2 sm:items-center">
                                    <strong className="text-text-dark">This is an Adult Student</strong>
                                    <span className="text-[#888]">(Student is their own Manager)</span>
                                </div>
                            </label>
                        </div>
                    )}
                </div>

                {/* Step 2: Students */}
                <div>
                    <h3 className="text-[#646cff] mb-4 mt-0">Step 2: The Student(s)</h3>

                    <div className="flex flex-col gap-4">
                        {students.map((student, idx) => (
                            <div key={idx} className="bg-[#f9f9f9] p-4 rounded-md border border-[#eee] relative">
                                {students.length > 1 && !isAdultStudent && (
                                    <div className="absolute top-2 right-2 text-xs font-bold text-[#888] bg-[#e0e0e0] px-2 py-1 rounded">
                                        Student {idx + 1}
                                    </div>
                                )}

                                {!isAdultStudent && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="flex flex-col gap-2">
                                            <input
                                                placeholder="First Name"
                                                className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red"
                                                value={student.firstName}
                                                onChange={(e) => handleStudentChange(idx, 'firstName', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <input
                                                placeholder="Last Name"
                                                className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red"
                                                value={student.lastName}
                                                onChange={(e) => handleStudentChange(idx, 'lastName', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Date of Birth</label>
                                            <input
                                                type="date"
                                                className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red"
                                                value={student.dob}
                                                onChange={(e) => handleStudentChange(idx, 'dob', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                {isAdultStudent && (
                                    <p className="text-[#888] italic mb-4 text-sm bg-white p-3 rounded border border-[#eee]">
                                        Student details will match Manager details above.
                                    </p>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-[#666] font-medium text-xs uppercase tracking-wider">Assign Teacher (Optional)</label>
                                    <select
                                        className="w-full p-2.5 rounded-md border border-[#ccc] bg-white text-text-dark focus:outline-none focus:border-primary-red"
                                        value={student.assignedTeacherId || ''}
                                        onChange={(e) => handleStudentChange(idx, 'assignedTeacherId', e.target.value ? Number(e.target.value) : undefined)}
                                    >
                                        <option value="">-- No Teacher Assigned --</option>
                                        {teachers.map((t: any) => (
                                            <option key={t.user_id} value={t.user_id}>
                                                {t.first_name} {t.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isAdultStudent && (
                        <button
                            type="button"
                            onClick={() => setStudents([...students, { firstName: '', lastName: '', dob: '2015-01-01' }])}
                            className="mt-4 text-sm px-4 py-2 bg-[#f0f0f0] text-text-dark border border-[#ddd] rounded hover:bg-[#e4e4e4] transition-colors"
                        >
                            + Add Another Student
                        </button>
                    )}
                </div>

                <div className="flex justify-end gap-3 mt-[30px] border-t border-[#eee] pt-5">
                    <button className="bg-transparent text-[#666] border border-[#ccc] px-4 py-2 rounded cursor-pointer hover:bg-[#f9f9f9] transition-colors" onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className="bg-primary-red text-white border-none px-6 py-2 rounded cursor-pointer hover:bg-[#cc0000] transition-colors" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registering...' : 'Complete Registration'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FamilyRegistrationModal;
